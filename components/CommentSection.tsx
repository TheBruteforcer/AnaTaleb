
import React, { useState } from 'react';
import { Comment } from '../types';

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (text: string) => void;
  currentUser: any;
}

const CommentSection: React.FC<CommentSectionProps> = ({ comments, onAddComment, currentUser }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAddComment(text);
    setText('');
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <h4 className="text-sm font-bold text-gray-700 mb-3">التعليقات ({comments.length})</h4>
      
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto px-1">
        {comments.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-2">محدش علق لسه.. كون أول واحد!</p>
        ) : (
          comments.map(c => (
            <div key={c.id} className="bg-gray-50 p-3 rounded-xl text-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-blue-700 text-xs">{c.author}</span>
                <span className="text-[10px] text-gray-400">{new Date(c.timestamp).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <p className="text-gray-700 leading-snug">{c.text}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input 
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="أكتب تعليقك يا بطل..."
          className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-bold"
        />
        <button 
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
        >
          نشر
        </button>
      </form>
    </div>
  );
};

export default CommentSection;
