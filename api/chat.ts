import { VercelRequest, VercelResponse } from '@vercel/node';
import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

const secretKey = process.env.MOBILE_APP_SECRET;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed'
    });
  }

  const incomingKey =
    req.headers['secret-key'];

  if (
    incomingKey !== secretKey
  ) {
    return res.status(401).json({
      error: 'Unauthorized'
    });
  }

  // Set the response headers to stream text to the frontend (Vercel AI SDK format)
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');
  // Optional but recommended for some Vercel environments to prevent buffering:
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const { messages } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing or invalid messages array' });
  }

  // Map input messages to LangChain compatible class instances
  const lcMessages = messages.map((m: any) => {
    if (m.role === 'user') return new HumanMessage({ content: m.content || '' });
    return new AIMessage({ content: m.content || '' });
  });

  const systemPrompt = `You are a helpful assistant that can interpret sensors data about the water quality for fishing recommendations. Always use concise responses.`;
  
  try {
    // Initialize OpenAI LLM inside try/catch so missing API keys don't crash the server silently
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing OPENAI_API_KEY in environment variables.");
    }

    const llm = new ChatOpenAI({
      model: "gpt-4o-mini",
      temperature: 0,
    });
    // 1. Connect to logic MCP server via SSE
    const client = new MultiServerMCPClient({
      bio_laguna: {
        transport: "http",
        url: "https://hndrgczzvwuwarxgafra.supabase.co/functions/v1/mcp-server/mcp",
      }
    });

    const tools = await client.getTools();
    
    // 2. Create the LangGraph agent
    const agent = createReactAgent({
      llm,
      tools,
      prompt: systemPrompt,
    });

    // 3. Invoke the agent in streaming mode (streamEvents)
    const eventStream = await agent.streamEvents(
      { messages: lcMessages },
      { version: 'v2' }
    );

    // 4. Stream events back using Vercel AI protocol (0: text chunks)
    for await (const event of eventStream) {
      if (
        event.event === "on_chat_model_stream" &&
        event.data?.chunk?.content
      ) {
        // Vercel AI text chunk protocol: '0:"text chunk goes here"\n'
        const textChunk = event.data.chunk.content;
        res.write(`0:${JSON.stringify(textChunk)}\n`);
      }
    }
  } catch (err: any) {
    console.error("Agent error:", err);
    // Send an error chunk
    res.write(`3:${JSON.stringify(err.message || 'Internal error')}\n`);
  } finally {
    // 5. Close response stream
    res.end();
  }
  
  return;
}
