
import React, { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import PostCard from './components/PostCard';
import PostDetails from './components/PostDetails';
import PomodoroPage from './components/PomodoroPage';
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
  const [view, setView] = useState<'home' | 'trending' | 'subjects' | 'profile' | 'admin' | 'post-details' | 'pomodoro'>('home');
  const [posts, setPosts] = useState<Post[]>([]);
  const [topStudents, setTopStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | 'الكل'>('الكل');
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
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
  }, []);

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

  const handleSelectPost = (postId: string) => {
    setSelectedPostId(postId);
    setView('post-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content || !currentUser) return;
    setIsPublishing(true);
    try {
      let urls: string[] = [];
      if (selectedFiles.length > 0) {
        urls = await postService.uploadFiles(selectedFiles);
      }
      const ok = await postService.create(newPost.title, newPost.content, newPost.subject, { name: currentUser.name, id: currentUser.id }, urls);
      if (ok) {
        setNewPost({ title: '', content: '', subject: 'أخرى' });
        setSelectedFiles([]);
        setImagePreviews([]);
        setIsModalOpen(false);
        refreshPosts();
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedFiles(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const selectedPost = useMemo(() => 
    posts.find(p => p.id === selectedPostId), 
  [posts, selectedPostId]);

  if (!currentUser) return <AuthScreen onAuthSuccess={handleAuthSuccess} />;

  return (
    <div className="min-h-screen bg-[#fafbfc] pb-20 selection:bg-blue-100 selection:text-blue-900">
      <Navbar onNavigate={setView} currentView={view} currentUser={currentUser} />
      
      {/* Category Bar - Only visible on main feeds */}
      {(view === 'home' || view === 'trending') && (
        <div className="bg-white border-b border-slate-100 overflow-x-auto no-scrollbar py-3 sticky top-16 z-40">
          <div className="max-w-6xl mx-auto px-4 flex gap-3">
            <button 
              onClick={() => setSelectedSubject('الكل')} 
              className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all ${selectedSubject === 'الكل' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
            >
              الكل 🏠
            </button>
            {SUBJECTS_WITH_ICONS.map(s => (
              <button 
                key={s.name} 
                onClick={() => setSelectedSubject(s.name)} 
                className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all ${selectedSubject === s.name ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              >
                {s.icon} {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 pt-8">
        {view === 'admin' ? (
          <AdminDashboard currentUser={currentUser} onUpdate={refreshPosts} />
        ) : view === 'pomodoro' ? (
          <PomodoroPage />
        ) : view === 'post-details' && selectedPost ? (
          <PostDetails 
            post={selectedPost} 
            currentUser={currentUser} 
            onUpdate={refreshPosts} 
            onBack={() => setView('home')} 
          />
        ) : view === 'profile' ? (
          <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto">
             <div className="bg-white rounded-[2.5rem] p-8 text-center border border-slate-100 shadow-xl">
                <div className="relative inline-block mb-6">
                  <img src={currentUser.avatar} className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-xl" alt="profile" />
                  <span className="absolute -bottom-1 -right-1 text-2xl">🏆</span>
                </div>
                <h2 className="text-2xl font-black text-slate-800">{currentUser.name}</h2>
                <p className="text-base text-blue-600 font-black mb-8">{currentUser.points} نقطة دحيح</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button onClick={() => setIsEditProfileOpen(true)} className="px-8 py-3.5 text-[11px] font-black bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors">تعديل الملف</button>
                  {currentUser.role === 'admin' && <button onClick={() => setView('admin')} className="px-8 py-3.5 text-[11px] font-black bg-purple-50 text-purple-600 rounded-2xl border border-purple-100">إدارة المنصة</button>}
                  <button onClick={handleLogout} className="px-8 py-3.5 text-[11px] font-black text-rose-500 bg-rose-50 rounded-2xl">تسجيل خروج</button>
                </div>
             </div>
             <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest text-right px-2 mt-10">ملخصاتك اللي نشرتها ✨</h3>
             <div className="space-y-5">
               {posts.filter(p => p.authorId === currentUser.id).map(p => (
                 <PostCard key={p.id} post={p} currentUser={currentUser} onUpdate={refreshPosts} onSelect={handleSelectPost} />
               ))}
             </div>
          </div>
        ) : (
          <div className="flex flex-col md:grid md:grid-cols-12 gap-8">
            <div className="md:col-span-8 lg:col-span-9 w-full">
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    placeholder="بتدور على درس إيه؟" 
                    className="w-full bg-white border border-slate-100 rounded-[1.5rem] py-4 pr-12 pl-4 outline-none text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-50/50 transition-all shadow-sm text-right" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 text-xl">🔍</span>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)} 
                  className="bg-blue-600 text-white text-sm font-black px-8 py-4 rounded-[1.5rem] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
                >
                  + انشر ملخصك
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4 px-2">
                   <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{view === 'trending' ? '🔥 الأكثر تفاعلاً' : '✨ آخر الملخصات'}</span>
                   <div className="flex gap-1 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
                      <button onClick={() => setView('home')} className={`text-[10px] font-black px-5 py-2.5 rounded-xl transition-all ${view === 'home' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>الأحدث</button>
                      <button onClick={() => setView('trending')} className={`text-[10px] font-black px-5 py-2.5 rounded-xl transition-all ${view === 'trending' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400 hover:text-orange-600'}`}>التريند</button>
                   </div>
                </div>

                {isLoading ? (
                  <div className="py-32 text-center">
                    <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-sm font-black text-slate-300">لحظة يا بطل.. بنرتبلك الملخصات!</p>
                  </div>
                ) : filteredPosts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {filteredPosts.map(post => (
                      <PostCard key={post.id} post={post} currentUser={currentUser} onUpdate={refreshPosts} onSelect={handleSelectPost} />
                    ))}
                  </div>
                ) : (
                  <div className="py-24 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                    <div className="text-5xl mb-6">🌵</div>
                    <p className="text-sm font-black text-slate-400">لسه مفيش ملخصات هنا.. كون أول واحد يفيد زمايله!</p>
                  </div>
                )}
              </div>
            </div>

            <aside className="hidden md:block md:col-span-4 lg:col-span-3 space-y-8">
              <div className="sticky top-32 space-y-8">
                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-7 shadow-sm text-right">
                  <h3 className="text-[11px] font-black text-slate-400 mb-6 uppercase tracking-widest flex items-center justify-end gap-2">
                    لوحة المتفوقين 🏆
                  </h3>
                  <div className="space-y-5">
                    {topStudents.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between group">
                         <span className="font-black text-blue-600 text-[10px] bg-blue-50 px-3 py-1 rounded-xl group-hover:bg-blue-100 transition-colors">{s.points}</span>
                         <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-700 text-xs line-clamp-1">{s.name}</span>
                          <img src={s.avatar} className="w-9 h-9 rounded-full border border-slate-100 shadow-sm" alt="top user" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div onClick={() => setView('pomodoro')} className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-7 text-white shadow-2xl shadow-blue-100 relative overflow-hidden cursor-pointer group hover:scale-[1.02] transition-transform">
                   <div className="relative z-10">
                     <h4 className="font-black text-base mb-3 group-hover:translate-x-1 transition-transform">افتح البومودورو! ⏱️</h4>
                     <p className="text-xs font-medium text-blue-100 leading-relaxed mb-6">ذاكر بتركيز وخد راحة صح. ادخل الصفحة وشغل العداد دلوقتي.</p>
                   </div>
                   <div className="absolute -right-4 -bottom-4 text-7xl opacity-20 rotate-12 transition-transform group-hover:rotate-45">🧠</div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* Floating Tools */}
      <GeminiAssistant />
      {view !== 'pomodoro' && <StudyTimer />}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-base font-black text-slate-800">إضافة ملخص جديد 📖</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 font-black px-2 transition-colors text-xl">✕</button>
            </div>
            <div className="p-8 space-y-5 text-right">
                <input 
                  type="text" 
                  placeholder="عنوان الدرس.. (مثلاً: قوانين الحركة)" 
                  className="w-full bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none border border-slate-100 text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all" 
                  value={newPost.title} 
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})} 
                />
                <div className="grid grid-cols-2 gap-4">
                    <select 
                      className="bg-slate-50 rounded-2xl px-4 py-4 text-sm font-bold outline-none border border-slate-100 text-slate-800 cursor-pointer focus:bg-white" 
                      value={newPost.subject} 
                      onChange={(e) => setNewPost({...newPost, subject: e.target.value as Subject})}
                    >
                      {SUBJECTS_WITH_ICONS.map(s => <option key={s.name} value={s.name}>{s.icon} {s.name}</option>)}
                    </select>
                    <label className="bg-blue-50 border border-dashed border-blue-200 rounded-2xl flex items-center justify-center text-[11px] font-black text-blue-600 cursor-pointer hover:bg-blue-100 transition-colors h-[58px]">
                      <span>{selectedFiles.length > 0 ? `✅ (${selectedFiles.length}) صور` : '📷 أضف صور'}</span>
                      <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                    </label>
                </div>
                <textarea 
                  placeholder="اكتب أهم النقاط في الدرس هنا.. زمايلك هيشكروك! ❤️" 
                  rows={5} 
                  className="w-full bg-slate-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none border border-slate-100 resize-none text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all" 
                  value={newPost.content} 
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})} 
                />
                
                {imagePreviews.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto py-3 no-scrollbar">
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} className="relative shrink-0">
                        <img src={src} className="w-24 h-24 object-cover rounded-[1.5rem] border border-slate-100 shadow-sm" alt="preview" />
                        <button 
                          onClick={() => removeFile(idx)} 
                          className="absolute -top-1 -right-1 bg-rose-500 text-white w-6 h-6 rounded-full text-[10px] shadow-lg flex items-center justify-center border-2 border-white font-black"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

              <button 
                onClick={handleCreatePost} 
                disabled={isPublishing || !newPost.title || !newPost.content} 
                className="w-full bg-blue-600 text-white font-black py-5 rounded-[1.5rem] text-base shadow-2xl shadow-blue-100 disabled:opacity-50 disabled:shadow-none hover:bg-blue-700 transition-all active:scale-95 mt-4"
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
