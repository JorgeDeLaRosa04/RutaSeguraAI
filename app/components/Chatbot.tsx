'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Send, X } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  text: string;
};

const initialMessages: Message[] = [
  {
    role: 'assistant',
    text: 'Hola, soy el asistente de Ruta Segura AI. Pregúntame sobre seguridad nocturna, el score de seguridad, rutas recomendadas o cómo funciona nuestra plataforma para conductores en Lima.',
  },
];

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastMessage = messages[messages.length - 1];

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user' as const, text: input.trim() };
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Error al obtener respuesta del chatbot.');
      }

      setMessages((current) => [...current, { role: 'assistant', text: data.answer }]);
    } catch (err) {
      setError('No se pudo obtener respuesta. Intenta de nuevo en un momento.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const headerText = useMemo(() => (open ? 'Chat de Ruta Segura AI' : 'Chatbot'), [open]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {open && (
        <div className="w-[360px] rounded-3xl border border-slate-700/80 bg-slate-950/95 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between rounded-t-3xl bg-slate-900 px-4 py-4 text-white">
            <div>
              <p className="text-sm font-semibold">{headerText}</p>
              <p className="text-xs text-slate-400">Responde con información del negocio y la seguridad nocturna.</p>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-full p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[420px] space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={message.role === 'assistant' ? 'rounded-3xl bg-slate-900 px-4 py-3 text-slate-200' : 'ml-auto rounded-3xl bg-safe/10 px-4 py-3 text-slate-100'}>
                <p className="text-sm leading-6">{message.text}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-700 px-4 py-4">
            <label htmlFor="chat-message" className="sr-only">Mensaje</label>
            <textarea
              id="chat-message"
              rows={2}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full resize-none rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-safe focus:ring-safe/30"
              placeholder="Escribe tu pregunta..."
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-safe px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-600"
              >
                {isLoading ? 'Enviando...' : 'Enviar'}
                <Send className="h-4 w-4" />
              </button>
              {error && <p className="text-xs text-rose-400">{error}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-white p-3 shadow-2xl transition hover:shadow-[0_0_0_16px_rgba(15,23,42,0.08)]"
          aria-label="Abrir chat"
        >
          <Image src="/images/chatbot.png" alt="Chatbot" width={80} height={80} className="rounded-full" />
        </button>
      </div>
    </div>
  );
}
