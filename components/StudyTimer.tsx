
import React, { useState, useEffect } from 'react';

const StudyTimer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'study' | 'break'>('study');

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      const nextMode = mode === 'study' ? 'break' : 'study';
      setMode(nextMode);
      setSeconds(nextMode === 'study' ? 25 * 60 : 5 * 60);
      alert(nextMode === 'study' ? 'يلا نرجع نذاكر! 💪' : 'وقت الراحة يا بطل! ☕');
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, mode]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setIsActive(false);
    setSeconds(mode === 'study' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-6 left-24 z-[100]">
      {isOpen ? (
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl p-4 shadow-2xl w-48 animate-in zoom-in-95 duration-200 text-center">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {mode === 'study' ? 'مذاكرة 📚' : 'راحة ☕'}
            </span>
            <button onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-rose-500">✕</button>
          </div>
          <div className="text-3xl font-black text-slate-800 mb-4 font-mono">{formatTime(seconds)}</div>
          <div className="flex gap-2">
            <button 
              onClick={toggle}
              className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${isActive ? 'bg-amber-100 text-amber-600' : 'bg-blue-600 text-white shadow-lg shadow-blue-200'}`}
            >
              {isActive ? 'إيقاف' : 'ابدأ'}
            </button>
            <button onClick={reset} className="p-2 bg-slate-100 rounded-xl text-xs">🔄</button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-emerald-500 text-white w-12 h-12 rounded-2xl shadow-xl flex flex-col items-center justify-center hover:scale-110 active:scale-95 transition-all"
        >
          <span className="text-lg">⏱️</span>
          <span className="text-[8px] font-black">{formatTime(seconds)}</span>
        </button>
      )}
    </div>
  );
};

export default StudyTimer;
