
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { STRINGS } from '../strings';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      const user = await authService.login(formData.email, formData.password);
      if (user) onAuthSuccess();
      else setError(STRINGS.auth.loginError);
    } else {
      if (!formData.name || !formData.email || !formData.password) {
        setError(STRINGS.auth.emptyFieldsError);
        return;
      }
      await authService.register(formData.name, formData.email, formData.password);
      onAuthSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <div className="bg-blue-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg rotate-3">{STRINGS.brand.name.charAt(0)}</div>
        <h1 className="text-4xl font-black text-blue-900 mb-2">{STRINGS.brand.name}</h1>
        <p className="text-slate-500 font-medium italic">{STRINGS.brand.tagline}</p>
      </div>

      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
          {isLogin ? STRINGS.auth.loginTitle : STRINGS.auth.registerTitle}
        </h2>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 text-center font-bold">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">{STRINGS.auth.nameLabel}</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-bold"
                placeholder={STRINGS.auth.namePlaceholder}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{STRINGS.auth.emailLabel}</label>
            <input 
              type="email" 
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-bold"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{STRINGS.auth.passwordLabel}</label>
            <input 
              type="password" 
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-bold"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 transition-all active:scale-95 mt-4"
          >
            {isLogin ? STRINGS.auth.loginButton : STRINGS.auth.registerButton}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-50 pt-6">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 font-bold hover:underline"
          >
            {isLogin ? STRINGS.auth.noAccount : STRINGS.auth.haveAccount}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
