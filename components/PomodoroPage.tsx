
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
      
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(e => console.log('Audio error'));
      
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

  const progress = mode === 'study' ? (1 - seconds / (25 * 60)) * 100 : (1 - seconds / (5 * 60)) * 100;

  return (
    <div className="max-w-4xl mx-auto pt-8 pb-20 animate-in fade-in duration-700">
      <div className={`rounded-[3.5rem] p-8 md:p-16 text-center transition-all duration-1000 border-2 ${mode === 'study' ? 'bg-white border-blue-100 shadow-2xl shadow-blue-100/50' : 'bg-emerald-50 border-emerald-100 shadow-2xl shadow-emerald-100/50'}`}>
        
        <div className="flex justify-center gap-4 mb-12">
          <button 
            onClick={() => { setMode('study'); setSeconds(25 * 60); setIsActive(false); }}
            className={`px-8 py-3 rounded-2xl text-xs font-black transition-all ${mode === 'study' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
          >
            مذاكرة 📚
          </button>
          <button 
            onClick={() => { setMode('break'); setSeconds(5 * 60); setIsActive(false); }}
            className={`px-8 py-3 rounded-2xl text-xs font-black transition-all ${mode === 'break' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
          >
            راحة ☕
          </button>
        </div>

        <div className="relative inline-block mb-12">
          <svg className="w-64 h-64 md:w-80 md:h-80 -rotate-90">
            <circle cx="50%" cy="50%" r="48%" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100" />
            <circle 
              cx="50%" cy="50%" r="48%" fill="none" stroke="currentColor" strokeWidth="8" 
              className={mode === 'study' ? 'text-blue-600' : 'text-emerald-600'}
              strokeDasharray="100"
              strokeDashoffset={100 - progress}
              style={{ transition: 'stroke-dashoffset 1s linear', strokeDasharray: '301.59' }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl md:text-8xl font-black text-slate-800 font-mono tracking-tighter">{formatTime(seconds)}</span>
            <span className={`text-[11px] font-black uppercase tracking-[0.2em] mt-2 ${mode === 'study' ? 'text-blue-400' : 'text-emerald-400'}`}>
              {mode === 'study' ? 'Focus Time' : 'Relax Time'}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 max-w-sm mx-auto">
          <button 
            onClick={toggle}
            className={`w-full py-6 rounded-[2rem] text-xl font-black transition-all transform active:scale-95 shadow-xl ${isActive ? 'bg-slate-800 text-white hover:bg-slate-900' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}
          >
            {isActive ? 'إيقاف مؤقت ⏸️' : 'ابدأ العداد 🚀'}
          </button>
          
          <div className="flex gap-4 w-full">
            <button onClick={reset} className="flex-1 py-4 bg-slate-50 rounded-[1.5rem] font-black text-slate-400 hover:bg-slate-100 transition-colors">إعادة ضبط 🔄</button>
            <div className="flex-1 py-4 bg-slate-50 rounded-[1.5rem] font-black text-slate-700 flex flex-col items-center justify-center">
               <span className="text-[10px] text-slate-400 leading-none">الجلسات</span>
               <span className="text-lg leading-none mt-1">{sessionsCompleted}</span>
            </div>
          </div>
        </div>

        <div className="mt-16 p-8 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
           <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-xl">💡</span>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">نصيحة الدحيح للتركيز</span>
           </div>
           <p className="text-sm font-bold text-slate-600 italic">"{currentTip}"</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 px-4">
         <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
            <div className="text-3xl mb-3">🎖️</div>
            <h5 className="font-black text-slate-800 text-xs mb-1">نقاط إضافية</h5>
            <p className="text-[10px] text-slate-400 font-bold">بتاخد 10 نقاط هدية عن كل ساعة مذاكرة!</p>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
            <div className="text-3xl mb-3">🎵</div>
            <h5 className="font-black text-slate-800 text-xs mb-1">موسيقى هادية</h5>
            <p className="text-[10px] text-slate-400 font-bold">قريباً.. استمع لموسيقى Lo-fi أثناء المذاكرة.</p>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-center">
            <div className="text-3xl mb-3">📊</div>
            <h5 className="font-black text-slate-800 text-xs mb-1">تقارير</h5>
            <p className="text-[10px] text-slate-400 font-bold">شوف مستواك في المذاكرة بيتطور إزاي كل أسبوع.</p>
         </div>
      </div>
    </div>
  );
};

export default PomodoroPage;
