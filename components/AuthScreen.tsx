
import React, { useState } from 'react';
import { authService } from '../services/authService';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  // Fixed: Made handleSubmit async to properly await login/register responses which are now async
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      const user = await authService.login(formData.email, formData.password);
      if (user) onAuthSuccess();
      else setError('البيانات غلط يا زميلي.. اتأكد كدة!');
    } else {
      if (!formData.name || !formData.email || !formData.password) {
        setError('املأ الخانات كلها يا بطل!');
        return;
      }
      await authService.register(formData.name, formData.email, formData.password);
      onAuthSuccess();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <div className="bg-blue-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg rotate-3">أ</div>
        <h1 className="text-4xl font-black text-blue-900 mb-2">أنا طالب</h1>
        <p className="text-slate-500 font-medium italic">أقوى منصة للطلاب المصريين 🇪🇬</p>
      </div>

      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
          {isLogin ? 'نورتنا من جديد يا دحيح!' : 'أعمل حساب وانضم للشلة'}
        </h2>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 text-center font-bold">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">اسمك إيه؟</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-bold"
                placeholder="مثلاً: أحمد محمود"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">الإيميل</label>
            <input 
              type="email" 
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-bold"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">كلمة السر</label>
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
            {isLogin ? 'يلا بينا ندخل! ➔' : 'سجل حسابك دلوقت ✅'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-50 pt-6">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 font-bold hover:underline"
          >
            {isLogin ? 'معندكش حساب؟ سجل هنا' : 'عندك حساب فعلاً؟ ادخل هنا'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
