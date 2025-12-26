
import React, { useState, useEffect } from 'react';
import { Post, User } from '../types';
import CommentSection from './CommentSection';
import { postService } from '../services/postService';
import { explainPostContent } from '../services/geminiService';

interface PostCardProps {
  post: Post;
  currentUser: User;
  onUpdate: () => void;
  onSelect?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onUpdate, onSelect }) => {
  const [showComments, setShowComments] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  
  const [localLikes, setLocalLikes] = useState<string[]>(post.likes || []);
  const isLiked = localLikes.includes(currentUser.id);
  const isReported = post.reports?.includes(currentUser.id) || false;

  useEffect(() => {
    setLocalLikes(post.likes || []);
  }, [post.likes]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBusy) return;

    const newLikes = isLiked 
      ? localLikes.filter(id => id !== currentUser.id) 
      : [...localLikes, currentUser.id];
    
    setLocalLikes(newLikes);
    setIsBusy(true);

    try {
      await postService.toggleLike(post.id, currentUser.id);
    } catch (err) {
      setLocalLikes(post.likes);
    } finally {
      setIsBusy(false);
    }
  };

  const handleAIExplain = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (aiExplanation) {
      setAiExplanation(null);
      return;
    }
    setIsExplaining(true);
    try {
      const explanation = await explainPostContent(post.title, post.content);
      setAiExplanation(explanation);
    } finally {
      setIsExplaining(false);
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      'رياضيات': 'bg-blue-100 text-blue-700',
      'علوم': 'bg-emerald-100 text-emerald-700',
      'فيزياء': 'bg-purple-100 text-purple-700',
      'كيمياء': 'bg-amber-100 text-amber-700',
      'أحياء': 'bg-rose-100 text-rose-700',
      'لغة عربية': 'bg-orange-100 text-orange-700',
    };
    return colors[subject] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div 
      onClick={() => onSelect?.(post.id)}
      className={`group relative bg-white rounded-3xl border border-slate-200/60 overflow-hidden mb-5 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:-translate-y-1 cursor-pointer ${post.isPinned ? 'ring-2 ring-blue-500/20 bg-blue-50/30' : ''}`}
    >
      {post.isPinned && (
        <div className="absolute top-4 left-4 z-10 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-blue-200">
          📌 مثبت
        </div>
      )}

      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
             <img 
              src={post.authorId === currentUser.id ? currentUser.avatar : `https://api.dicebear.com/7.x/bottts/svg?seed=${post.author}`} 
              className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm" 
              alt="avatar" 
            />
            <div className="text-right">
              <h4 className="font-bold text-slate-800 text-sm leading-none mb-1">{post.author}</h4>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${getSubjectColor(post.subject)}`}>
                {post.subject}
              </span>
            </div>
          </div>
          
          <button 
            onClick={(e) => { e.stopPropagation(); if(confirm('تبليغ عن محتوى غير لائق؟')) postService.reportPost(post.id, currentUser.id).then(onUpdate); }}
            className={`p-2 rounded-xl transition-colors ${isReported ? 'text-orange-500 bg-orange-50' : 'text-slate-300 hover:bg-slate-50'}`}
          >
            🚩
          </button>
        </div>

        <h3 className="text-base font-black text-slate-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors">{post.title}</h3>
        <p className="text-slate-500 text-sm mb-4 leading-relaxed line-clamp-2 font-medium">
          {post.content}
        </p>

        {aiExplanation && (
          <div className="mb-4 p-4 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm">🤖</span>
              <span className="text-[10px] font-black text-indigo-600 uppercase">شرح الدحيح الذكي</span>
            </div>
            <p className="text-xs font-bold text-slate-700 leading-relaxed italic">"{aiExplanation}"</p>
          </div>
        )}

        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className={`grid gap-2 mb-4 ${post.imageUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {post.imageUrls.slice(0, 2).map((url, idx) => (
              <div key={idx} className="relative rounded-2xl overflow-hidden aspect-video bg-slate-100 border border-slate-200">
                <img src={url} className="w-full h-full object-cover" alt="attachment" loading="lazy" />
                {idx === 1 && post.imageUrls!.length > 2 && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center text-white font-black text-sm">
                    +{post.imageUrls!.length - 2}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLike} 
              className={`flex items-center gap-1.5 transition-all transform active:scale-125 ${isLiked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-400'}`}
            >
              <span className="text-lg">{isLiked ? '❤️' : '🤍'}</span>
              <span className="text-xs font-black">{localLikes.length}</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }} 
              className={`flex items-center gap-1.5 transition-colors ${showComments ? 'text-blue-600' : 'text-slate-400 hover:text-blue-500'}`}
            >
              <span className="text-lg">💬</span>
              <span className="text-xs font-black">{post.comments?.length || 0}</span>
            </button>
          </div>

          <button 
            onClick={handleAIExplain} 
            disabled={isExplaining}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black transition-all ${aiExplanation ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}
          >
            {isExplaining ? <span className="animate-spin text-xs">🌀</span> : <span>🤖</span>}
            {aiExplanation ? 'إخفاء الشرح' : 'اشرح لي'}
          </button>
        </div>

        {showComments && (
          <div className="mt-4 animate-in slide-in-from-top-2 duration-300" onClick={(e) => e.stopPropagation()}>
            <CommentSection 
              comments={post.comments || []} 
              onAddComment={async (txt) => { await postService.addComment(post.id, txt, {name: currentUser.name, id: currentUser.id}); onUpdate(); }} 
              currentUser={currentUser} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
