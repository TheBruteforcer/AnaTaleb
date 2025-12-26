
import React, { useState, useEffect } from 'react';

const PomodoroPage: React.FC = () => {
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'study' | 'break'>('study');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const tips = [
    "ابعد الموبايل عنك خالص، التركيز هو السر! 📵",
    "اشرب ماية كتير، مخك محتاج ترطيب عشان يشتغل. 💧",
    "خد نفس عميق.. أنت قدها يا دحيح! 🧘‍♂️",
    "لو حسيت بملل، جرب تغير مكانك أو طريقة قعدتك. 🪑",
    "اكتب المهام اللي وراك في ورقة، وصدقني الشعور بالانجاز رهيب. 📝"
  ];

  const [currentTip, setCurrentTip] = useState(tips[0]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      const nextMode = mode === 'study' ? 'break' : 'study';
      if (mode === 'study') setSessionsCompleted(prev => prev + 1);
      
      setMode(nextMode);
      setSeconds(nextMode === 'study' ? 25 * 60 : 5 * 60);
      setCurrentTip(tips[Math.floor(Math.random() * tips.length)]);
      
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log('Audio error'));
      } catch (e) {}
      
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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalTime = mode === 'study' ? 25 * 60 : 5 * 60;
  const progress = ((totalTime - seconds) / totalTime) * 100;

  return (
    <div className="max-w-4xl mx-auto pt-4 pb-20 animate-in fade-in duration-700 px-4">
      <div className={`rounded-[3.5rem] p-10 md:p-16 text-center transition-all duration-1000 border-2 relative overflow-hidden ${mode === 'study' ? 'bg-white border-blue-100 shadow-[0_40px_80px_-20px_rgba(37,99,235,0.1)]' : 'bg-emerald-50/50 border-emerald-100 shadow-[0_40px_80px_-20px_rgba(16,185,129,0.1)]'}`}>
        
        <div className="flex justify-center gap-3 mb-12 relative z-10">
          <button 
            onClick={() => { setMode('study'); setSeconds(25 * 60); setIsActive(false); }}
            className={`px-8 py-3.5 rounded-2xl text-[11px] font-black transition-all ${mode === 'study' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}
          >
            جلسة مذاكرة 📚
          </button>
          <button 
            onClick={() => { setMode('break'); setSeconds(5 * 60); setIsActive(false); }}
            className={`px-8 py-3.5 rounded-2xl text-[11px] font-black transition-all ${mode === 'break' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}
          >
            استراحة قهوة ☕
          </button>
        </div>

        <div className="relative inline-block mb-12">
          <svg className="w-72 h-72 md:w-96 md:h-96 -rotate-90">
            <circle cx="50%" cy="50%" r="46%" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-100" />
            <circle 
              cx="50%" cy="50%" r="46%" fill="none" stroke="currentColor" strokeWidth="12" 
              className={mode === 'study' ? 'text-blue-600' : 'text-emerald-600'}
              strokeDasharray="289.02"
              strokeDashoffset={289.02 * (1 - progress/100)}
              style={{ transition: 'stroke-dashoffset 1s linear', strokeDasharray: '289.02%', transformOrigin: 'center' }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-7xl md:text-9xl font-black text-slate-800 font-mono tracking-tighter leading-none">{formatTime(seconds)}</span>
            <div className={`flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${mode === 'study' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <span className={`w-2 h-2 rounded-full ${isActive ? 'animate-ping' : ''} ${mode === 'study' ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
              {mode === 'study' ? 'وقت التركيز' : 'وقت الراحة'}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 max-w-sm mx-auto relative z-10">
          <button 
            onClick={toggle}
            className={`w-full py-6 rounded-3xl text-xl font-black transition-all transform active:scale-95 shadow-2xl ${isActive ? 'bg-slate-800 text-white' : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'}`}
          >
            {isActive ? 'إيقاف مؤقت ⏸️' : 'ابدأ العداد 🚀'}
          </button>
          
          <div className="flex gap-4 w-full">
            <button onClick={reset} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black text-slate-500 hover:bg-slate-200 transition-colors">إعادة ضبط 🔄</button>
            <div className="flex-1 py-4 bg-white border border-slate-100 rounded-2xl font-black text-slate-700 flex flex-col items-center justify-center shadow-sm">
               <span className="text-[9px] text-slate-400 uppercase tracking-tighter">الجلسات المكتملة</span>
               <span className="text-xl leading-none mt-1">{sessionsCompleted}</span>
            </div>
          </div>
        </div>

        <div className="mt-16 p-8 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200 relative z-10">
           <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-xl">💡</span>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">نصيحة الدحيح</span>
           </div>
           <p className="text-sm font-bold text-slate-600 italic">"{currentTip}"</p>
        </div>
      </div>
    </div>
  );
};

export default PomodoroPage;
