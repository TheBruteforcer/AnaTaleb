
import React, { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import PostCard from './components/PostCard';
import AuthScreen from './components/AuthScreen';
import EditProfileModal from './components/EditProfileModal';
import AdminDashboard from './components/AdminDashboard';
import GeminiAssistant from './components/GeminiAssistant';
import StudyTimer from './components/StudyTimer';
import { Post, Subject, User } from './types';
import { SUBJECTS_WITH_ICONS } from './constants';
import { db } from './lib/db';
import { postService } from './services/postService';
import { authService } from './services/authService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(db.getCurrentUser());
  const [view, setView] = useState<'home' | 'trending' | 'subjects' | 'profile' | 'admin'>('home');
  const [posts, setPosts] = useState<Post[]>([]);
  const [topStudents, setTopStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | 'الكل'>('الكل');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newPost, setNewPost] = useState({ title: '', content: '', subject: 'أخرى' as Subject });

  const refreshPosts = async () => {
    try {
      const [data, students] = await Promise.all([
        postService.getAll(),
        postService.getTopStudents()
      ]);
      setPosts(data || []);
      setTopStudents(students || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshPosts();
  }, [view]);

  const handleAuthSuccess = () => {
    setCurrentUser(db.getCurrentUser());
    refreshPosts();
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setView('home');
  };

  const filteredPosts = useMemo(() => {
    let result = [...posts];
    
    result = result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      if (view === 'trending') {
        return (b.likes.length + b.comments.length) - (a.likes.length + a.comments.length);
      }
      return b.timestamp - a.timestamp;
    });

    if (selectedSubject !== 'الكل') result = result.filter(p => p.subject === selectedSubject);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
    }
    return result;
  }, [posts, view, searchQuery, selectedSubject]);

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content || !currentUser) return;
    setIsPublishing(true);
    try {
      let url = '';
      if (selectedFile) url = await postService.uploadFile(selectedFile) || '';
      const ok = await postService.create(newPost.title, newPost.content, newPost.subject, { name: currentUser.name, id: currentUser.id }, url);
      if (ok) {
        setNewPost({ title: '', content: '', subject: 'أخرى' });
        setSelectedFile(null);
        setImagePreview(null);
        setIsModalOpen(false);
        refreshPosts();
      }
    } finally {
      setIsPublishing(false);
    }
  };

  if (!currentUser) return <AuthScreen onAuthSuccess={handleAuthSuccess} />;

  return (
    <div className="min-h-screen bg-[#fafbfc] pb-20 selection:bg-blue-100 selection:text-blue-900">
      <Navbar onNavigate={setView} currentView={view} currentUser={currentUser} />
      
      <div className="bg-white border-b border-slate-100 overflow-x-auto no-scrollbar py-2 sticky top-14 z-40">
        <div className="max-w-4xl mx-auto px-4 flex gap-2">
          <button 
            onClick={() => { setSelectedSubject('الكل'); setView('home'); }} 
            className={`whitespace-nowrap px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${selectedSubject === 'الكل' ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
          >
            الكل 🏠
          </button>
          {SUBJECTS_WITH_ICONS.map(s => (
            <button 
              key={s.name} 
              onClick={() => { setSelectedSubject(s.name); setView('home'); }} 
              className={`whitespace-nowrap px-4 py-1.5 rounded-xl text-[10px] font-black transition-all ${selectedSubject === s.name ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
            >
              {s.icon} {s.name}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 pt-6 flex flex-col md:flex-row gap-8">
        <div className="flex-1 max-w-xl mx-auto md:mx-0 w-full">
          {view === 'admin' ? (
            <AdminDashboard currentUser={currentUser} onUpdate={refreshPosts} />
          ) : view === 'profile' ? (
            <div className="space-y-4 animate-in fade-in duration-500">
               <div className="bg-white rounded-3xl p-6 text-center border border-slate-100 shadow-xl">
                  <div className="relative inline-block mb-4">
                    <img src={currentUser.avatar} className="w-20 h-20 rounded-full mx-auto border-4 border-white shadow-lg" alt="profile" />
                    <span className="absolute -bottom-1 -right-1 text-xl">🏆</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-800">{currentUser.name}</h2>
                  <p className="text-sm text-blue-600 font-black mb-6">{currentUser.points} نقطة دحيح</p>
                  <div className="flex gap-3">
                    <button onClick={() => setIsEditProfileOpen(true)} className="flex-1 text-[10px] font-black bg-slate-50 py-3 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">تعديل الملف</button>
                    {currentUser.role === 'admin' && <button onClick={() => setView('admin')} className="flex-1 text-[10px] font-black bg-purple-50 text-purple-600 py-3 rounded-2xl border border-purple-100">إدارة المنصة</button>}
                    <button onClick={handleLogout} className="flex-1 text-[10px] font-black text-rose-500 bg-rose-50 py-3 rounded-2xl">تسجيل خروج</button>
                  </div>
               </div>
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest text-right px-2 mt-8">ملخصاتك اللي نشرتها</h3>
               <div className="space-y-4">
                 {posts.filter(p => p.authorId === currentUser.id).map(p => <PostCard key={p.id} post={p} currentUser={currentUser} onUpdate={refreshPosts} />)}
               </div>
            </div>
          ) : (
            <>
              <div className="flex gap-3 mb-8">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    placeholder="بتدور على درس إيه؟" 
                    className="w-full bg-white border border-slate-100 rounded-2xl py-3 pr-10 pl-4 outline-none text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm text-right" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">🔍</span>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)} 
                  className="bg-blue-600 text-white text-xs font-black px-6 py-3 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
                >
                  + انشر ملخصك
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2 px-1">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{view === 'trending' ? '🔥 الأكثر تفاعلاً' : '✨ آخر الملخصات'}</span>
                   <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
                      <button onClick={() => setView('home')} className={`text-[9px] font-black px-3 py-1.5 rounded-lg transition-all ${view === 'home' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>الأحدث</button>
                      <button onClick={() => setView('trending')} className={`text-[9px] font-black px-3 py-1.5 rounded-lg transition-all ${view === 'trending' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-orange-600'}`}>التريند</button>
                   </div>
                </div>

                {isLoading ? (
                  <div className="py-24 text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xs font-black text-slate-300">لحظة يا بطل.. بنرتبلك الملخصات!</p>
                  </div>
                ) : filteredPosts.length > 0 ? (
                  filteredPosts.map(post => <PostCard key={post.id} post={post} currentUser={currentUser} onUpdate={refreshPosts} />)
                ) : (
                  <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                    <div className="text-4xl mb-4">🌵</div>
                    <p className="text-xs font-black text-slate-400">لسه مفيش ملخصات هنا.. كون أول واحد يفيد زمايله!</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <aside className="hidden lg:block w-64 shrink-0 space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm text-right">
              <h3 className="text-[10px] font-black text-slate-400 mb-4 uppercase tracking-widest flex items-center justify-end gap-2">
                لوحة المتفوقين 🏆
              </h3>
              <div className="space-y-4">
                {topStudents.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between group">
                     <span className="font-black text-blue-600 text-xs bg-blue-50 px-2 py-0.5 rounded-lg group-hover:bg-blue-100 transition-colors">{s.points}</span>
                     <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-700 text-xs line-clamp-1">{s.name}</span>
                      <img src={s.avatar} className="w-7 h-7 rounded-full border border-slate-100 shadow-sm" alt="top user" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-5 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
               <div className="relative z-10">
                 <h4 className="font-black text-sm mb-2">استخدم الـ Pomodoro! ⏱️</h4>
                 <p className="text-[10px] font-medium text-blue-100 leading-relaxed mb-4">ذاكر 25 دقيقة بتركيز وخد 5 دقايق راحة. الطريقة دي بتخليك عبقري!</p>
               </div>
               <div className="absolute -right-4 -bottom-4 text-6xl opacity-20 rotate-12">🧠</div>
            </div>
          </div>
        </aside>
      </main>

      {/* Floating Tools */}
      <GeminiAssistant />
      <StudyTimer />

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-800">إضافة ملخص جديد 📖</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 font-black px-2 transition-colors">✕</button>
            </div>
            <div className="p-6 space-y-4 text-right">
                <input 
                  type="text" 
                  placeholder="عنوان الدرس.. (مثلاً: قوانين الحركة)" 
                  className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none border border-slate-100 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all" 
                  value={newPost.title} 
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})} 
                />
                <div className="grid grid-cols-2 gap-3">
                    <select 
                      className="bg-slate-50 rounded-2xl px-3 py-3 text-xs font-bold outline-none border border-slate-100 text-slate-800 cursor-pointer focus:bg-white" 
                      value={newPost.subject} 
                      onChange={(e) => setNewPost({...newPost, subject: e.target.value as Subject})}
                    >
                      {SUBJECTS_WITH_ICONS.map(s => <option key={s.name} value={s.name}>{s.icon} {s.name}</option>)}
                    </select>
                    <label className="bg-blue-50 border border-dashed border-blue-200 rounded-2xl flex items-center justify-center text-[10px] font-black text-blue-600 cursor-pointer hover:bg-blue-100 transition-colors">
                      <span>{selectedFile ? '✅ تم الرفع' : '📷 أضف صورة'}</span>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) { setSelectedFile(f); const r = new FileReader(); r.onloadend = () => setImagePreview(r.result as string); r.readAsDataURL(f); }
                      }} />
                    </label>
                </div>
                <textarea 
                  placeholder="اكتب أهم النقاط في الدرس هنا.. زمايلك هيشكروك! ❤️" 
                  rows={4} 
                  className="w-full bg-slate-50 rounded-2xl px-4 py-3 text-xs font-bold outline-none border border-slate-100 resize-none text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all" 
                  value={newPost.content} 
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})} 
                />
                {imagePreview && (
                  <div className="relative group">
                    <img src={imagePreview} className="w-full h-32 object-cover rounded-2xl shadow-sm border border-slate-100" alt="preview" />
                    <button onClick={() => {setSelectedFile(null); setImagePreview(null);}} className="absolute top-2 right-2 bg-rose-500 text-white w-6 h-6 rounded-full text-xs shadow-lg">✕</button>
                  </div>
                )}
              <button 
                onClick={handleCreatePost} 
                disabled={isPublishing || !newPost.title || !newPost.content} 
                className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl text-sm shadow-xl shadow-blue-200 disabled:opacity-50 disabled:shadow-none hover:bg-blue-700 transition-all active:scale-95"
              >
                {isPublishing ? 'جاري النشر...' : 'انشر دلوقتي 🚀'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditProfileOpen && currentUser && (
        <EditProfileModal 
          user={currentUser} 
          onClose={() => setIsEditProfileOpen(false)} 
          onSave={async (n, a) => { 
            await authService.updateProfile(currentUser.id, {name: n, avatar: a}); 
            setCurrentUser(db.getCurrentUser()); 
            setIsEditProfileOpen(false); 
            refreshPosts(); 
          }} 
        />
      )}
    </div>
  );
};

export default App;
