
import React, { useState, useRef, useEffect } from 'react';
import { getStudyBuddyAdvice } from '../services/geminiService';
import { STRINGS } from '../strings';

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

  const handleSend = async (customInput?: string) => {
    const textToSend = customInput || input;
    if (!textToSend.trim()) return;
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setIsLoading(true);

    const aiResponse = await getStudyBuddyAdvice(textToSend);
    setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-[100] font-tajawal">
      {isOpen ? (
        <div className="bg-white w-[350px] h-[550px] rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] border border-blue-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-6 text-white flex justify-between items-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner">🤖</div>
              <div>
                <h3 className="font-black leading-none text-base">{STRINGS.gemini.botName}</h3>
                <span className="text-[9px] font-bold text-blue-100 uppercase tracking-widest flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> {STRINGS.gemini.statusOnline}
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="bg-black/10 hover:bg-black/20 w-8 h-8 rounded-full flex items-center justify-center transition-colors relative z-10 text-sm">✕</button>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/40 no-scrollbar">
            {messages.length === 0 && (
              <div className="text-center py-10 px-4">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-inner">✨</div>
                <h4 className="text-slate-800 font-black text-sm mb-2">{STRINGS.gemini.welcomeTitle}</h4>
                <p className="text-slate-400 font-medium text-xs leading-relaxed">
                  {STRINGS.gemini.welcomeDesc}
                </p>
                <div className="mt-8 space-y-2">
                  <button onClick={() => handleSend(STRINGS.gemini.tip1)} className="w-full text-[10px] bg-white hover:bg-blue-50 transition-colors p-3 rounded-2xl shadow-sm text-blue-600 font-black border border-blue-50 text-right flex items-center justify-between">
                    <span>{STRINGS.gemini.tip1}</span>
                    <span>⏱️</span>
                  </button>
                  <button onClick={() => handleSend(STRINGS.gemini.tip2)} className="w-full text-[10px] bg-white hover:bg-blue-50 transition-colors p-3 rounded-2xl shadow-sm text-blue-600 font-black border border-blue-50 text-right flex items-center justify-between">
                    <span>{STRINGS.gemini.tip2}</span>
                    <span>🧪</span>
                  </button>
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`max-w-[88%] p-4 rounded-[1.8rem] text-xs font-bold shadow-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-end animate-in fade-in">
                <div className="bg-white border border-slate-100 p-4 rounded-[1.8rem] rounded-tl-none shadow-sm flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-black">{STRINGS.post.aiThinking}</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-slate-100 flex gap-2 items-center">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={STRINGS.gemini.placeholder}
              className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-3.5 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <button 
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-90"
            >
              <span className="rotate-180">➔</span>
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white w-16 h-16 rounded-[1.8rem] shadow-[0_15px_35px_rgba(37,99,235,0.4)] hover:bg-blue-700 transition-all flex items-center justify-center text-3xl hover:scale-110 active:scale-90 relative group"
        >
          <span className="animate-bounce-slow">🤖</span>
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 border-2 border-white"></span>
          </span>
          <div className="absolute left-full ml-4 bg-slate-800 text-white text-[10px] font-black px-4 py-2 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 pointer-events-none shadow-xl">
            {STRINGS.gemini.fabLabel}
          </div>
        </button>
      )}
    </div>
  );
};

export default GeminiAssistant;
