import { VercelRequest, VercelResponse } from '@vercel/node';
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Configurar headers para streaming
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const { messages } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing or invalid messages array' });
  }

  // Mapear mensajes
  const lcMessages = messages.map((m: any) => {
    if (m.role === 'user') return new HumanMessage({ content: m.content || '' });
    return new AIMessage({ content: m.content || '' });
  });

  // Prompt mejorado para que entienda cómo usar las dos herramientas juntas
  const systemPrompt = `You are the Virtual Biologist of Bio-Laguna, an expert in water quality and hypoxia prediction.
  
You have access to two distinct systems:
1. A Database (bio_laguna): Use this to fetch the absolute latest sensor readings (temperature, pH, turbidity).
2. An AI Prediction Engine (bio_laguna_ai): Use this to calculate the hypoxia risk.

WORKFLOW INSTRUCTIONS:
When asked about the current water status or risk:
Step 1: ALWAYS call the database tool first to get the latest live measurements.
Step 2: Extract 'temperature', 'ph', and 'turbidity' from the database response.
Step 3: Call the AI Prediction tool ('bio_laguna_prediction_analizar_calidad_agua') using those EXACT extracted values. For 'hora_decimal', leave it empty or pass null unless specifically asked for a time.
Step 4: Use the AI's response (Oxygen, Risk, and Traffic Light color) to formulate your final answer.

Always respond in a concise, warm, and regional tone (e.g., 'Epa compae', 'Oiga patrón').`;
  
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing OPENAI_API_KEY in environment variables.");
    }
    if (!process.env.HF_TOKEN) {
      throw new Error("Missing HF_TOKEN in environment variables.");
    }

    const llm = new ChatOpenAI({
      model: "gpt-4o-mini",
      temperature: 0,
    });

    // 1. Conectar a AMBOS servidores MCP
    const client = new MultiServerMCPClient({
      // Servidor 1: Supabase (Lectura de datos)
      bio_laguna: {
        transport: "http", // SSE
        url: "https://hndrgczzvwuwarxgafra.supabase.co/functions/v1/mcp-server/mcp",
      },
      // Servidor 2: Hugging Face (Inferencia AI)
      bio_laguna_ai: {
        transport: "stdio",
        command: "npx",
        args: [
          "-y",
          "@smithery/cli@latest",
          "run",
          "mcp-remote",
          "https://aidatatestrole-bio-laguna-prediction.hf.space/gradio_api/mcp/",
          "--transport",
          "streamable-http",
          "--header",
          `Authorization=Bearer ${process.env.HF_TOKEN}` // Inyectamos el token de forma segura
        ]
      }
    });

    // Obtener las herramientas de ambos servidores unificadas
    const tools = await client.getTools();
    
    // 2. Crear el Agente LangGraph
    const agent = createReactAgent({
      llm,
      tools,
      prompt: systemPrompt,
    });

    // 3. Invocar el agente en modo streaming
    const eventStream = await agent.streamEvents(
      { messages: lcMessages },
      { version: 'v2' }
    );

    // 4. Procesar el stream para Vercel AI SDK
    for await (const event of eventStream) {
      if (
        event.event === "on_chat_model_stream" &&
        event.data?.chunk?.content
      ) {
        const textChunk = event.data.chunk.content;
        res.write(`0:${JSON.stringify(textChunk)}\n`);
      }
    }
  } catch (err: any) {
    console.error("Agent error:", err);
    res.write(`3:${JSON.stringify(err.message || 'Internal error')}\n`);
  } finally {
    // 5. Cerrar la conexión
    res.end();
  }
  
  return;
}