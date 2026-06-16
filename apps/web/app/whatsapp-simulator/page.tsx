"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Phone, Video, MoreVertical, Store, ChevronLeft, ArrowLeft } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  time: string;
  isQuickReply?: boolean;
}

export default function WhatsAppSimulatorPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "¡Hola! Bienvenido a Papelería El Estudiante 👋\nSoy tu asistente virtual. ¿En qué te puedo ayudar hoy?", sender: 'bot', time: '10:00 AM' },
    { id: 2, text: "Ver catálogo de productos", sender: 'user', time: '10:01 AM', isQuickReply: true },
    { id: 3, text: "Aquí tienes nuestro catálogo digital con precios mayoristas actualizados. Haz clic en el enlace para hacer tu pedido:\n\n🛒 https://fiado.app/marketplace/mock-biz-00000000-0000-0000-0000-000000000001", sender: 'bot', time: '10:01 AM' },
    { id: 4, text: "Necesito revisar mis pedidos pendientes", sender: 'user', time: '10:05 AM', isQuickReply: true },
    { id: 5, text: "Tienes 1 pedido pendiente de pago:\n\n*Pedido #ORD-4589*\nTotal: $125.50\nEstado: Esperando pago\n\nPuedes ver los detalles o pagar aquí: https://fiado.app/orders/4589", sender: 'bot', time: '10:05 AM' }
  ]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 font-sans">
      <div className="w-[380px] h-[780px] bg-white rounded-[3rem] shadow-2xl overflow-hidden border-[8px] border-gray-900 relative flex flex-col">
        {/* Phone Notch */}
        <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 rounded-b-2xl w-40 mx-auto z-50"></div>

        {/* WhatsApp Header */}
        <div className="bg-[#075E54] text-white pt-10 pb-3 px-4 flex items-center justify-between shadow-md z-10">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden">
                <Store className="w-6 h-6 text-[#075E54]" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-base leading-tight">Papelería Estudiante</span>
                <span className="text-xs text-green-100">Cuenta de empresa</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Video className="w-5 h-5 opacity-80" />
            <Phone className="w-5 h-5 opacity-80" />
            <MoreVertical className="w-5 h-5 opacity-80" />
          </div>
        </div>

        {/* Chat Background */}
        <div className="flex-1 bg-[#E5DDD5] p-4 overflow-y-auto flex flex-col gap-3" style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')" }}>
          
          {/* Date Badge */}
          <div className="flex justify-center my-2">
            <span className="bg-[#E1F3FB] text-gray-600 text-xs px-3 py-1 rounded-lg shadow-sm">
              Hoy
            </span>
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg p-2 shadow-sm relative ${msg.sender === 'user' ? 'bg-[#DCF8C6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                {msg.isQuickReply && (
                  <div className="flex items-center gap-1 text-[#027EB5] mb-1 font-medium">
                    <span className="text-[10px] uppercase">Respuesta rápida</span>
                  </div>
                )}
                <p className="text-sm text-gray-800 whitespace-pre-line">{msg.text}</p>
                <div className="flex justify-end mt-1">
                  <span className="text-[10px] text-gray-500">{msg.time}</span>
                  {msg.sender === 'user' && (
                    <svg className="w-3 h-3 ml-1 text-[#4FC3F7]" fill="currentColor" viewBox="0 0 16 15">
                      <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.32.32 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="bg-[#F0F0F0] p-2 flex items-center gap-2">
          <div className="flex-1 bg-white rounded-full flex items-center px-4 py-2 shadow-sm">
            <span className="text-gray-400 text-sm flex-1">Escribe un mensaje...</span>
            <div className="flex items-center gap-3 text-gray-400">
              <span className="w-5 h-5 border-2 border-gray-400 rounded-full flex items-center justify-center font-bold text-xs">₹</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
          </div>
          <div className="w-10 h-10 bg-[#00A884] rounded-full flex items-center justify-center text-white shadow-sm">
            <Send className="w-5 h-5 ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
