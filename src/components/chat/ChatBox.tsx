import { FormEvent, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { X, Send } from 'lucide-react';

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface ChatBoxProps {
  quoteId: string;
  currentUserId: string;
  otherUserName: string;
  onClose: () => void;
}

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function ChatBox({ quoteId, currentUserId, otherUserName, onClose }: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return setError('Sesión expirada.');

    const socket = io(`${SOCKET_URL}/chat`, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('joinQuote', { quoteId }, (res: any) => {
        if (res.event === 'joinedQuote') {
          socket.emit('getMessages', { quoteId }, (result: any) => {
            if (result.event === 'quoteMessages') setMessages(result.data);
          });
        }
      });
    });

    socket.on('newMessage', (msg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setError('Error de conexión.'));

    return () => {
      socket.disconnect();
    };
  }, [quoteId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || !socketRef.current?.connected) return;

    socketRef.current.emit('sendMessage', {
      quoteId,
      content: draft.trim(),
      clientMessageId: crypto.randomUUID(),
    }, () => {
      setDraft('');
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#21132f]/60 p-4 backdrop-blur-sm">
      <section className="flex h-[600px] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-[#eeeaf5] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 font-bold text-[#7a2fbf]">
              {otherUserName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-[#252136]">{otherUserName}</h2>
              <p className="flex items-center gap-1 text-xs text-gray-500">
                <span className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                {connected ? 'En línea' : 'Desconectado'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={20}/></button>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#faf9fc] p-5 space-y-4">
          {messages.map((msg) => {
            const isMine = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${isMine ? 'bg-[#7a2fbf] text-white rounded-br-sm' : 'bg-white border border-[#eeeaf5] text-[#252136] rounded-bl-sm'}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <span className={`text-[10px] mt-1 block text-right ${isMine ? 'text-purple-200' : 'text-gray-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {error && <p className="bg-red-50 text-red-600 text-xs px-5 py-2">{error}</p>}

        <form onSubmit={handleSubmit} className="border-t border-[#eeeaf5] bg-white p-4">
          <div className="flex items-center gap-2 rounded-xl border border-[#eeeaf5] bg-[#faf9fc] p-2 focus-within:border-[#7a2fbf]">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="w-full bg-transparent px-2 text-sm outline-none"
            />
            <button type="submit" disabled={!draft.trim()} className="rounded-lg bg-[#7a2fbf] p-2 text-white hover:bg-[#64239f] disabled:opacity-50">
              <Send size={18} />
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}