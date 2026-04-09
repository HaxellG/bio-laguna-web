import { useState, useCallback } from 'react';
import { ChatMessage } from '../models';
import { sendMessage } from '../services/chatService';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '0',
    role: 'assistant',
    content: '¡Hola! He conectado mi interfaz al servidor Backend de Bio-Laguna. ¿En qué te puedo asesorar frente al monitoreo de agua de hoy?',
    timestamp: new Date(),
  },
];

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setLoading(true);

    // Optimistically add user message
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() },
    ]);

    try {
      const reply = await sendMessage(text);
      setMessages((prev) => [...prev, reply]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  return { messages, input, setInput, loading, submit };
}
