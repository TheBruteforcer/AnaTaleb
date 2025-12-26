
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { STRINGS } from '../strings';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (isLogin) {
        const user = await authService.login(formData.email, formData.password);
        if (user) {
          onAuthSuccess();
        } else {
          setError(STRINGS.auth.loginError);
        }
      } else {
        if (!formData.name || !formData.email || !formData.password) {
          setError(STRINGS.auth.emptyFieldsError);
          setIsLoading(false);
          return;
        }
        await authService.register(formData.name, formData.email, formData.password);
        onAuthSuccess();
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(err.message || "حدث خطأ غير متوقع، حاول مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-blue-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg rotate-3">
          {STRINGS.brand.name.charAt(0)}
        </div>
        <h1 className="text-4xl font-black text-blue-900 mb-2">{STRINGS.brand.name}</h1>
        <p className="text-slate-500 font-medium italic">{STRINGS.brand.tagline}</p>
      </div>

      <div className="bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-500">
        <h2 className="text-2xl font-black text-slate-800 mb-6 text-center">
          {isLogin ? STRINGS.auth.loginTitle : STRINGS.auth.registerTitle}
        </h2>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl text-sm mb-6 text-center font-bold animate-in shake duration-300">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">{STRINGS.auth.nameLabel}</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-bold transition-all"
                placeholder={STRINGS.auth.namePlaceholder}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required={!isLogin}
              />
            </div>
          )}
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">{STRINGS.auth.emailLabel}</label>
            <input 
              type="email" 
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-bold transition-all"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">{STRINGS.auth.passwordLabel}</label>
            <input 
              type="password" 
              className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-bold transition-all"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 mt-4 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>جاري التحميل...</span>
              </>
            ) : (
              <span>{isLogin ? STRINGS.auth.loginButton : STRINGS.auth.registerButton}</span>
            )}
          </button>
        </form>

        <div className="mt-10 text-center border-t border-slate-50 pt-8">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-blue-600 font-black hover:underline text-sm transition-all"
          >
            {isLogin ? STRINGS.auth.noAccount : STRINGS.auth.haveAccount}
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
        جميع الحقوق محفوظة &copy; {new Date().getFullYear()} أنا طالب
      </p>
    </div>
  );
};

export default AuthScreen;
