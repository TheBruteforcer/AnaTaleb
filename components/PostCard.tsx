
import React, { useState } from 'react';
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
  
  const isLiked = post.likes?.includes(currentUser.id) || false;
  const isReported = post.reports?.includes(currentUser.id) || false;

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBusy) return;
    setIsBusy(true);
    try {
      await postService.toggleLike(post.id, currentUser.id);
      onUpdate();
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

  const handlePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBusy) return;
    setIsBusy(true);
    try {
      await postService.togglePin(post.id, !!post.isPinned);
      onUpdate();
    } finally {
      setIsBusy(false);
    }
  };

  const handleReport = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBusy) return;
    const msg = isReported ? 'إلغاء البلاغ؟' : 'تبليغ عن الملخص؟ (5 بلاغات ويحذف تلقائياً)';
    if (confirm(msg)) {
      setIsBusy(true);
      try {
        const deleted = await postService.reportPost(post.id, currentUser.id);
        if (deleted) alert('تم الحذف لتكرار البلاغات.');
        onUpdate();
      } finally {
        setIsBusy(false);
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isBusy) return;
    if (confirm('تأكيد حذف المنشور نهائياً؟')) {
      setIsBusy(true);
      try {
        await postService.deletePost(post.id);
        onUpdate();
      } catch (e) {
        alert('فشل الحذف');
      } finally {
        setIsBusy(false);
      }
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) onSelect(post.id);
  };

  return (
    <div 
      onClick={() => onSelect?.(post.id)}
      className={`rounded-2xl border overflow-hidden mb-4 hover:shadow-xl transition-all duration-300 text-right group cursor-pointer ${post.isPinned ? 'bg-blue-50/50 border-blue-200 ring-1 ring-blue-100' : 'bg-white border-slate-100 shadow-sm'}`}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-1">
            {currentUser.role === 'admin' && (
              <>
                <button onClick={handlePin} disabled={isBusy} className={`text-[8px] font-black px-2 py-1 rounded-lg transition-colors ${post.isPinned ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600'}`}>
                  {post.isPinned ? '📌 مثبت' : 'تثبيت'}
                </button>
                <button onClick={handleDelete} disabled={isBusy} className="text-[8px] font-black px-2 py-1 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100">
                   حذف
                </button>
              </>
            )}
            <button onClick={handleReport} disabled={isBusy} title="إبلاغ" className={`p-1.5 rounded-lg text-[10px] transition-colors ${isReported ? 'text-orange-500 bg-orange-50' : 'text-slate-200 hover:text-orange-400'}`}>
               🚩
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <div>
              <div className="flex items-center justify-end gap-1">
                <h4 className="font-black text-slate-800 text-xs leading-none">{post.author}</h4>
                {post.isPinned && <span className="text-[8px] font-black text-blue-600 bg-blue-100 px-1 rounded-sm">📌</span>}
              </div>
              <span className="text-[8px] text-slate-400 font-bold uppercase">{post.subject}</span>
            </div>
            <img src={post.authorId === currentUser.id ? currentUser.avatar : `https://api.dicebear.com/7.x/bottts/svg?seed=${post.author}&backgroundColor=b6e3f4`} className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 shadow-sm" alt="avatar" />
          </div>
        </div>

        <h3 className="text-sm font-black text-slate-800 mb-2 leading-tight">{post.title}</h3>
        <p className="text-slate-500 text-xs mb-3 leading-relaxed font-medium line-clamp-3">
          {post.content}
        </p>

        {aiExplanation && (
          <div className="mb-3 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs">🤖</span>
              <span className="text-[10px] font-black text-indigo-600">شرح الدحيح الذكي:</span>
            </div>
            <p className="text-[11px] font-bold text-slate-700 italic leading-relaxed">{aiExplanation}</p>
          </div>
        )}

        {post.imageUrls && post.imageUrls.length > 0 && (
          <div className={`grid gap-2 mb-4 ${post.imageUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {post.imageUrls.slice(0, 4).map((url, idx) => (
              <div key={idx} className="relative rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner group-hover:shadow-md transition-shadow aspect-video">
                <img src={url} className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform" alt="attachment" onClick={handleImageClick} />
                {idx === 3 && post.imageUrls!.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-black text-sm pointer-events-none">
                    +{post.imageUrls!.length - 4} صور أخرى
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
          <span className="text-[8px] text-slate-300 font-bold">{new Date(post.timestamp).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleAIExplain} 
              disabled={isExplaining}
              className={`flex items-center gap-1.5 text-[10px] font-black transition-all ${aiExplanation ? 'text-indigo-600' : 'text-slate-300 hover:text-indigo-400'}`}
              title="اشرح لي بالذكاء الاصطناعي"
            >
              {isExplaining ? <span className="animate-spin text-xs">🌀</span> : <span>🤖</span>}
              <span className="hidden sm:inline">{aiExplanation ? 'إخفاء الشرح' : 'اشرح لي'}</span>
            </button>
            <button onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }} className={`flex items-center gap-1.5 text-[10px] font-black transition-colors ${showComments ? 'text-blue-600' : 'text-slate-300 hover:text-blue-400'}`}>
              <span>{post.comments?.length || 0}</span>
              <span className="text-sm">💬</span>
            </button>
            <button onClick={handleLike} disabled={isBusy} className={`flex items-center gap-1.5 text-[10px] font-black transition-all transform active:scale-150 ${isLiked ? 'text-rose-500' : 'text-slate-300 hover:text-rose-400'}`}>
              <span>{post.likes?.length || 0}</span>
              <span className="text-sm">{isLiked ? '❤️' : '🤍'}</span>
            </button>
          </div>
        </div>

        {showComments && (
          <div className="mt-4 pt-4 border-t border-slate-50 animate-in slide-in-from-top-4 duration-300" onClick={(e) => e.stopPropagation()}>
            <CommentSection comments={post.comments || []} onAddComment={async (txt) => { await postService.addComment(post.id, txt, {name: currentUser.name, id: currentUser.id}); onUpdate(); }} currentUser={currentUser} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
