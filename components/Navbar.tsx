
import React from 'react';
import { User } from '../types';
import { STRINGS } from '../strings';

interface NavbarProps {
  onNavigate: (view: 'home' | 'trending' | 'subjects' | 'profile' | 'admin' | 'pomodoro' | 'quizzes') => void;
  currentView: string;
  currentUser: User | null;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView, currentUser }) => {
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('home')}>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-200 transition-transform group-active:scale-90">
              {STRINGS.brand.name.charAt(0)}
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xl font-black text-slate-800 tracking-tight hidden sm:block leading-none">{STRINGS.brand.name}</span>
              <span className="text-[9px] font-bold text-blue-500 hidden sm:block uppercase tracking-widest mt-1">{STRINGS.brand.platformSuffix}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            <button 
              onClick={() => onNavigate('home')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${currentView === 'home' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            >
              {STRINGS.navbar.home}
            </button>
            <button 
              onClick={() => onNavigate('quizzes')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${currentView === 'quizzes' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
            >
              {STRINGS.navbar.quizzes}
            </button>
            <button 
              onClick={() => onNavigate('pomodoro')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${currentView === 'pomodoro' ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-emerald-500 hover:bg-slate-50'}`}
            >
              <span className="hidden xs:inline">{STRINGS.navbar.pomodoro}</span>
              <span>⏱️</span>
            </button>
          </div>

          <button 
            onClick={() => onNavigate('profile')}
            className={`flex items-center gap-3 p-1.5 pr-4 rounded-2xl transition-all border ${currentView === 'profile' ? 'bg-blue-50 border-blue-100' : 'border-slate-100 hover:bg-slate-50'}`}
          >
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-[10px] font-black text-blue-600 leading-none">{currentUser?.points} {STRINGS.navbar.pointsSuffix}</span>
              <span className="text-[11px] font-bold text-slate-500">{STRINGS.navbar.myAccount}</span>
            </div>
            <img src={currentUser?.avatar} className="w-10 h-10 rounded-xl border border-white shadow-sm bg-white" alt="profile" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
