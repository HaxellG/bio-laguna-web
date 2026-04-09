import { ChatMessage } from '../models';

const API_BASE = '/api';

export async function sendMessage(content: string): Promise<ChatMessage> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
  
  if (!res.ok) {
    throw new Error('Error connecting to chat API');
  }

  const data = await res.json();
  return {
    id: Date.now().toString(),
    role: data.role,
    content: data.content,
    timestamp: new Date(data.timestamp)
  };
}
