
import React, { useState, useRef, useEffect } from 'react';
import { getStudyBuddyAdvice } from '../services/geminiService';

const GeminiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const aiResponse = await getStudyBuddyAdvice(userMsg);
    setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-[100]">
      {isOpen ? (
        <div className="bg-white w-[340px] h-[500px] rounded-[2.5rem] shadow-2xl border border-blue-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-500">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-xl">🤖</div>
              <div>
                <h3 className="font-black leading-none">زميلك الدحيح</h3>
                <span className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">مساعد ذكي (Gemini)</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center transition-colors">✕</button>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 no-scrollbar">
            {messages.length === 0 && (
              <div className="text-center py-10">
                <div className="text-4xl mb-4">✨</div>
                <p className="text-slate-400 font-bold text-sm px-6">
                  يا هلا بيك يا دحيح! إسألني عن أي حاجة شاغلة بالك في المذاكرة أو الامتحانات..
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2 px-4">
                  <button onClick={() => setInput('إزاي أذاكر صح؟')} className="text-[10px] bg-white px-3 py-1.5 rounded-full shadow-sm text-blue-600 font-black border border-blue-50">إزاي أذاكر صح؟</button>
                  <button onClick={() => setInput('جدول امتحانات الثانوية')} className="text-[10px] bg-white px-3 py-1.5 rounded-full shadow-sm text-blue-600 font-black border border-blue-50">جدول امتحانات الثانوية</button>
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-bold shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-end">
                <div className="bg-white border border-slate-100 p-3 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-black">الدحيح بيفكر..</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="اكتب سؤالك هنا..."
              className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button 
              onClick={handleSend}
              className="bg-blue-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg hover:bg-blue-700 transition-all active:scale-90"
            >
              ➔
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white w-16 h-16 rounded-[1.5rem] shadow-2xl hover:bg-blue-700 transition-all flex items-center justify-center text-3xl hover:scale-110 active:scale-90 relative group"
        >
          🤖
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </span>
          <div className="absolute left-full ml-4 bg-slate-800 text-white text-[10px] font-black px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            اسأل زميلك الدحيح! ✨
          </div>
        </button>
      )}
    </div>
  );
};

export default GeminiAssistant;
