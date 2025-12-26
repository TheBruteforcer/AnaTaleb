
import React from 'react';
import { User } from '../types';

interface NavbarProps {
  onNavigate: (view: 'home' | 'trending' | 'subjects' | 'profile' | 'admin' | 'pomodoro') => void;
  currentView: string;
  currentUser: User | null;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView, currentUser }) => {
  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="bg-blue-600 text-white w-9 h-9 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-200 transition-transform active:scale-90">أ</div>
            <span className="text-xl font-black text-slate-800 tracking-tight hidden sm:block">أنا طالب</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-8">
            <button 
              onClick={() => onNavigate('home')}
              className={`text-xs font-black transition-all ${currentView === 'home' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : 'text-slate-400 hover:text-slate-600'}`}
            >
              الرئيسية
            </button>
            <button 
              onClick={() => onNavigate('pomodoro')}
              className={`text-xs font-black transition-all flex items-center gap-1.5 ${currentView === 'pomodoro' ? 'text-emerald-600 border-b-2 border-emerald-600 pb-1' : 'text-slate-400 hover:text-emerald-500'}`}
            >
              <span className="text-base">⏱️</span>
              <span className="hidden xs:inline">بومودورو</span>
            </button>
            <button 
              onClick={() => onNavigate('trending')}
              className={`text-xs font-black transition-all ${currentView === 'trending' ? 'text-orange-500 border-b-2 border-orange-500 pb-1' : 'text-slate-400 hover:text-slate-600'}`}
            >
              التريند
            </button>
          </div>

          <button 
            onClick={() => onNavigate('profile')}
            className={`flex items-center gap-2 p-1.5 rounded-2xl transition-all border ${currentView === 'profile' ? 'bg-blue-50 border-blue-200' : 'border-transparent hover:bg-slate-50'}`}
          >
            <div className="flex flex-col items-end mr-1 hidden sm:flex">
              <span className="text-[10px] font-black text-blue-600 leading-none">{currentUser?.points} نقطة</span>
              <span className="text-[11px] font-bold text-slate-500">بروفايلي</span>
            </div>
            <img src={currentUser?.avatar} className="w-9 h-9 rounded-full border border-white shadow-sm bg-slate-50" alt="me" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
