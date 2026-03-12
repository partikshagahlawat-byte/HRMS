import React, { useState } from 'react';
import { BrainCircuit, Send } from 'lucide-react';
import { hrAssistantChat } from '../services/geminiService';

export function HRAssistant() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: 'Hello! I am your Nexus HR Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] }));
      const response = await hrAssistantChat(history as any, userMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-12rem)] flex flex-col bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-black/5 bg-black/[0.01] flex items-center gap-3">
        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center"><BrainCircuit className="text-white w-6 h-6" /></div>
        <div><h3 className="font-semibold">Nexus AI Assistant</h3><p className="text-xs text-black/40">Always active</p></div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${m.role === 'user' ? 'bg-black text-white rounded-tr-none' : 'bg-black/5 text-black rounded-tl-none'}`}>{m.content}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="p-6 border-t border-black/5 bg-black/[0.01]">
        <div className="relative">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask anything about HR policies..." className="w-full pl-6 pr-14 py-4 bg-white border border-black/10 rounded-2xl text-sm focus:outline-none" />
          <button type="submit" disabled={!input.trim() || loading} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black text-white rounded-xl disabled:opacity-30"><Send size={20} /></button>
        </div>
      </form>
    </div>
  );
}
