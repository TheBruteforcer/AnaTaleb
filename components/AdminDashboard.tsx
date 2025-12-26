
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Post, User } from '../types';
import PostCard from './PostCard';
import { postService } from '../services/postService';

const AdminDashboard: React.FC<{ currentUser: User, onUpdate: () => void }> = ({ currentUser, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'users' | 'reports'>('reports');
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    // جلب كل البوستات من الخدمة
    const allPosts = await postService.getAll();
    setPosts(allPosts);

    // جلب كل اليوزرز من Supabase مباشرة
    const { data: allUsers } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (allUsers) setUsers(allUsers);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const reportedPosts = posts.filter(p => p.reports.length > 0).sort((a, b) => b.reports.length - a.reports.length);

  const deleteUser = async (userId: string) => {
    if (confirm('متأكد إنك عايز تحذف المستخدم ده نهائي؟')) {
      await supabase.from('profiles').delete().eq('id', userId);
      fetchData();
      onUpdate();
    }
  };

  const makeAdmin = async (userId: string) => {
    await supabase.from('profiles').update({ role: 'admin' }).eq('id', userId);
    fetchData();
    onUpdate();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center py-20 text-slate-400">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-black">يا أدمن.. بنجمعلك الداتا الحقيقية!</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            لوحة التحكم <span className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-full">أدمن</span>
          </h2>
          <button onClick={fetchData} className="text-xs bg-slate-50 hover:bg-slate-100 p-2 rounded-lg font-bold transition-colors">تحديث الداتا 🔄</button>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-2xl text-center">
            <div className="text-2xl font-black text-blue-600">{users.length}</div>
            <div className="text-xs font-bold text-slate-500 uppercase">مستخدم</div>
          </div>
          <div className="bg-emerald-50 p-4 rounded-2xl text-center">
            <div className="text-2xl font-black text-emerald-600">{posts.length}</div>
            <div className="text-xs font-bold text-slate-500 uppercase">منشور</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-2xl text-center">
            <div className="text-2xl font-black text-orange-600">{reportedPosts.length}</div>
            <div className="text-xs font-bold text-slate-500 uppercase">بلاغات نشطة</div>
          </div>
        </div>

        <div className="flex gap-2 border-b border-slate-100 mb-6">
          {(['reports', 'posts', 'users'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-4 font-black text-sm transition-all border-b-2 ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-300 hover:text-slate-400'}`}
            >
              {tab === 'reports' ? 'البلاغات 🚩' : tab === 'posts' ? 'كل المنشورات 📝' : 'المستخدمين 👤'}
            </button>
          ))}
        </div>

        {activeTab === 'reports' && (
          <div className="space-y-4">
            {reportedPosts.length === 0 ? (
              <p className="text-center text-slate-400 py-10 italic">مفيش بلاغات دلوقت.. الدنيا تمام!</p>
            ) : (
              reportedPosts.map(p => (
                <div key={p.id} className="relative">
                  <div className="absolute top-4 right-4 z-10 bg-orange-600 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg">
                    {p.reports.length} بلاغات
                  </div>
                  <PostCard post={p} currentUser={currentUser} onUpdate={() => { fetchData(); onUpdate(); }} />
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="space-y-4">
            {posts.map(p => (
              <PostCard key={p.id} post={p} currentUser={currentUser} onUpdate={() => { fetchData(); onUpdate(); }} />
            ))}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-black">
                  <th className="py-4 px-2">المستخدم</th>
                  <th className="py-4 px-2">الرتبة</th>
                  <th className="py-4 px-2">النقاط</th>
                  <th className="py-4 px-2">تحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-2 flex items-center gap-2">
                      <img src={u.avatar} className="w-8 h-8 rounded-full bg-slate-100" />
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">{u.name}</span>
                        <span className="text-[10px] text-slate-400">{u.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>
                        {u.role === 'admin' ? 'أدمن' : 'طالب'}
                      </span>
                    </td>
                    <td className="py-4 px-2 font-black text-blue-600">{u.points}</td>
                    <td className="py-4 px-2">
                      <div className="flex gap-2">
                        {u.role !== 'admin' && (
                          <button onClick={() => makeAdmin(u.id)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs" title="ترقية لأدمن">⭐</button>
                        )}
                        {u.id !== currentUser.id && (
                          <button onClick={() => deleteUser(u.id)} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors text-xs" title="حذف مستخدم">🗑️</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
