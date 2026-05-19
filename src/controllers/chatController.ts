import { useState } from 'react';
import { ChatMessage } from '../models';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '0',
    role: 'assistant',
    content: '¡Hola! ¿En qué te puedo asesorar frente al monitoreo de agua de hoy?',
    timestamp: new Date(),
  },
];

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setLoading(true);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    
    // Add user message optimistically
    setMessages((prev) => [...prev, userMessage]);

    // We will create the placeholder assistant message when the first chunk arrives
    const assistantMessageId = (Date.now() + 1).toString();

    try {
      // Send only plain array of simple objects to avoid nested React framework bugs
      const payloadMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payloadMessages })
      });

      if (!response.ok || !response.body) {
        throw new Error('Network error or unreadable stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let isFirstChunk = true;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          const chunkStr = decoder.decode(value, { stream: true });
          
          // The API sends Vercel protocol chunks (e.g. 0:"text") or 3:"error"
          const lines = chunkStr.split('\n');
          let textToAdd = '';

          for (const line of lines) {
            if (line.startsWith('0:')) {
              try {
                const parsedText = JSON.parse(line.slice(2));
                textToAdd += parsedText;
              } catch (e) {}
            } else if (line.startsWith('3:')) {
              textToAdd += "\n[Error del sistema: " + line.slice(2) + "]";
            }
          }

          if (textToAdd) {
             if (isFirstChunk) {
               // Hide the loading dots now that we have actual text
               setLoading(false);
               isFirstChunk = false;
               
               // Inject the new bubble
               setMessages((prev) => [
                 ...prev,
                 { id: assistantMessageId, role: 'assistant', content: textToAdd, timestamp: new Date() }
               ]);
             } else {
               // Append to existing bubble
               setMessages((prev) => 
                 prev.map(msg => 
                   msg.id === assistantMessageId 
                     ? { ...msg, content: msg.content + textToAdd } 
                     : msg
                 )
               );
             }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching chat:', error);
      setMessages((prev) => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: msg.content + '\n[Error de red al conectar con el servidor]' } 
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return { messages, input, setInput, loading, submit };
}
