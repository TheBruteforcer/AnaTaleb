
import React from 'react';
import { User } from '../types';

interface NavbarProps {
  onNavigate: (view: 'home' | 'trending' | 'subjects' | 'profile' | 'admin') => void;
  currentView: string;
  currentUser: User | null;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView, currentUser }) => {
  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-lg shadow-sm shadow-blue-200">أ</div>
            <span className="text-xl font-black text-slate-800 tracking-tight hidden sm:block">أنا طالب</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button 
              onClick={() => onNavigate('home')}
              className={`text-xs font-black transition-colors ${currentView === 'home' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              الرئيسية
            </button>
            <button 
              onClick={() => onNavigate('trending')}
              className={`text-xs font-black transition-colors ${currentView === 'trending' ? 'text-orange-500' : 'text-slate-400 hover:text-slate-600'}`}
            >
              التريند
            </button>
            {currentUser?.role === 'admin' && (
              <button 
                onClick={() => onNavigate('admin')}
                className={`text-[10px] font-black px-3 py-1.5 rounded-lg border transition-all ${currentView === 'admin' ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'text-purple-600 border-purple-100 hover:bg-purple-50'}`}
              >
                الإدارة
              </button>
            )}
          </div>

          <button 
            onClick={() => onNavigate('profile')}
            className={`flex items-center gap-2 p-1 rounded-full transition-all border ${currentView === 'profile' ? 'bg-blue-50 border-blue-200' : 'border-transparent hover:bg-slate-50'}`}
          >
            <div className="flex flex-col items-end mr-1 hidden sm:flex">
              <span className="text-[9px] font-black text-blue-600">{currentUser?.points} نقطة</span>
              <span className="text-[10px] font-bold text-slate-500">بروفايلي</span>
            </div>
            <img src={currentUser?.avatar} className="w-8 h-8 rounded-full border border-white shadow-sm bg-slate-50" alt="me" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
