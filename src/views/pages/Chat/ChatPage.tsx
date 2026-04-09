import { useEffect, useRef } from 'react';
import { useChat } from '../../../controllers/chatController';
import { format } from 'date-fns';

export default function ChatPage() {
  const { messages, input, setInput, loading, submit } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-57px)] lg:h-screen max-h-screen">
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-4 sm:px-8 pt-4 sm:pt-8 pb-4 border-b border-gray-100 bg-white">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Asistente de Análisis de Agua</h1>
            <p className="text-sm text-gray-400 mt-0.5">Haz preguntas sobre calidad del agua y tendencias</p>
          </div>
          {/* MCP badge */}
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-700">MCP Conectado</span>
            <span className="material-icons-round text-emerald-500 text-base">info</span>
          </div>
        </div>

        {/* Capabilities notice */}
        <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-2">
          <span className="material-icons-round text-primary-500 text-sm mt-0.5">info</span>
          <p className="text-xs text-gray-500 leading-relaxed">
            <strong className="text-gray-700">Capacidades del sistema:</strong> El asistente ofrece análisis teórico de cuerpos de agua y variables de sensores. Nota: El asistente no puede generar gráficas directamente — usa el <strong className="text-primary-600">Dashboard</strong> para visualizar datos.
          </p>
        </div>
      </div>

      {/* ── Messages ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 sm:py-6 space-y-5 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
              msg.role === 'assistant' ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-600'
            }`}>
              <span className="material-icons-round text-lg">
                {msg.role === 'assistant' ? 'smart_toy' : 'person'}
              </span>
            </div>

            {/* Bubble */}
            <div className={`max-w-[85%] sm:max-w-[70%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'assistant'
                  ? 'bg-white border border-gray-100 shadow-sm text-gray-800'
                  : 'bg-primary-500 text-white'
              }`}>
                {msg.content}
              </div>
              <p className="text-xs text-gray-400 mt-1 px-1">
                {msg.role === 'assistant' ? 'Asistente' : 'Tú'} · {format(msg.timestamp, 'HH:mm')}
              </p>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
              <span className="material-icons-round text-lg">smart_toy</span>
            </div>
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl px-4 py-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 px-4 sm:px-8 py-3 sm:py-4 bg-white border-t border-gray-100">
        <div className="flex items-end gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary-300 focus-within:border-primary-300 transition-all">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pregunta sobre calidad del agua, tendencias de sensores o análisis ambiental…"
            className="flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none leading-relaxed max-h-32 overflow-y-auto"
          />
          <button
            onClick={submit}
            disabled={!input.trim() || loading}
            className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
          >
            <span className="material-icons-round text-lg">send</span>
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          El asistente de Bio-Analytics puede cometer errores. Verifica los datos críticos en el Dashboard oficial.
        </p>
      </div>
    </div>
  );
}
