
import React, { useState } from 'react';
import { Post, User } from '../types';
import CommentSection from './CommentSection';
import { postService } from '../services/postService';
import { explainPostContent } from '../services/geminiService';
import { STRINGS } from '../strings';

interface PostDetailsProps {
  post: Post;
  currentUser: User;
  onUpdate: () => void;
  onBack: () => void;
}

const PostDetails: React.FC<PostDetailsProps> = ({ post, currentUser, onUpdate, onBack }) => {
  const [isBusy, setIsBusy] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const isLiked = post.likes?.includes(currentUser.id) || false;
  const isReported = post.reports?.includes(currentUser.id) || false;

  const handleLike = async () => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      await postService.toggleLike(post.id, currentUser.id);
      onUpdate();
    } finally {
      setIsBusy(false);
    }
  };

  const handleAIExplain = async () => {
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

  const handlePin = async () => {
    if (isBusy) return;
    setIsBusy(true);
    try {
      await postService.togglePin(post.id, !!post.isPinned);
      onUpdate();
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = async () => {
    if (isBusy) return;
    if (confirm(STRINGS.post.adminDeleteConfirm)) {
      setIsBusy(true);
      try {
        await postService.deletePost(post.id);
        onBack();
      } catch (e) {
        alert('فشل الحذف');
      } finally {
        setIsBusy(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in slide-in-from-bottom-8 duration-500">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-sm transition-colors group"
      >
        <span className="text-xl group-hover:-translate-x-1 transition-transform">➔</span>
        {STRINGS.post.backToFeed}
      </button>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden text-right">
        {/* Header Section */}
        <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
             <div className="text-right">
               <h2 className="text-xl font-black text-slate-800 leading-none">{post.title}</h2>
               <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full mt-2 inline-block">
                 {post.subject}
               </span>
             </div>
             <img 
               src={post.authorId === currentUser.id ? currentUser.avatar : `https://api.dicebear.com/7.x/bottts/svg?seed=${post.authorId || post.author}`} 
               className="w-14 h-14 rounded-full border-4 border-slate-50 shadow-md" 
               alt="author" 
               loading="lazy"
             />
          </div>

          <div className="flex items-center gap-2">
            {currentUser.role === 'admin' && (
              <>
                <button onClick={handlePin} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${post.isPinned ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-blue-100'}`}>
                  {post.isPinned ? STRINGS.post.pinnedLabel : STRINGS.post.pinLabel}
                </button>
                <button onClick={handleDelete} className="px-4 py-2 rounded-xl text-xs font-black bg-rose-50 text-rose-500 hover:bg-rose-100">{STRINGS.post.deleteLabel}</button>
              </>
            )}
            <button onClick={handleLike} className={`p-3 rounded-2xl transition-all border ${isLiked ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-slate-50 border-slate-100 text-slate-300 hover:text-rose-400'}`}>
              <span className="text-xl">{isLiked ? '❤️' : '🤍'}</span>
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8">
          <p className="text-slate-600 text-base leading-relaxed mb-8 font-medium whitespace-pre-wrap">
            {post.content}
          </p>

          <button 
            onClick={handleAIExplain}
            disabled={isExplaining}
            className="w-full mb-8 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-[2rem] text-right flex flex-col gap-2 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{isExplaining ? '🌀' : '🤖'}</span>
              <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">{STRINGS.post.aiExplainLabel}</span>
            </div>
            {aiExplanation ? (
              <p className="text-slate-700 font-bold leading-relaxed animate-in fade-in">{aiExplanation}</p>
            ) : (
              <p className="text-slate-400 text-sm font-bold">{isExplaining ? STRINGS.post.explainingWait : STRINGS.post.explainPrompt}</p>
            )}
          </button>

          {post.imageUrls && post.imageUrls.length > 0 && (
            <div className="space-y-4 mb-8">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{STRINGS.post.imagesCount} ({post.imageUrls.length})</h4>
              <div className="grid grid-cols-1 gap-4">
                {post.imageUrls.map((url, idx) => (
                  <div key={idx} className="rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50 shadow-inner group min-h-[200px]">
                    <img 
                      src={url} 
                      className="w-full h-auto object-contain cursor-zoom-in hover:scale-[1.02] transition-transform duration-500" 
                      alt="attachment" 
                      loading="lazy"
                      onClick={() => window.open(url, '_blank')} 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-8 border-t border-slate-50">
            <CommentSection 
              comments={post.comments || []} 
              onAddComment={async (txt) => { 
                await postService.addComment(post.id, txt, {name: currentUser.name, id: currentUser.id}); 
                onUpdate(); 
              }} 
              currentUser={currentUser} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetails;
