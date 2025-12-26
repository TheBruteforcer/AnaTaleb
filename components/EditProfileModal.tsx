
import React, { useState } from 'react';
import { User } from '../types';
import { STRINGS } from '../strings';

interface EditProfileModalProps {
  user: User;
  onClose: () => void;
  onSave: (name: string, avatar: string) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user.name);
  const [avatarSeed, setAvatarSeed] = useState(user.name + Date.now());

  const currentAvatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name, currentAvatarUrl);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
        <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-sm font-black text-slate-800">{STRINGS.profile.editTitle}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-black px-2">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex flex-col items-center">
            <div className="relative">
              <img 
                src={currentAvatarUrl} 
                className="w-20 h-20 rounded-full border-2 border-blue-100 shadow-sm bg-slate-50" 
                alt="preview" 
              />
              <button 
                type="button"
                onClick={() => setAvatarSeed(Math.random().toString(36))}
                className="absolute bottom-0 right-0 bg-blue-600 text-white w-7 h-7 rounded-full shadow-md flex items-center justify-center text-xs hover:bg-blue-700 transition-colors"
                title={STRINGS.profile.changeAvatar}
              >
                🔄
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 mb-1">{STRINGS.profile.nameLabel}</label>
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 outline-none font-bold text-xs text-slate-800"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={STRINGS.profile.namePlaceholder}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button 
              type="submit"
              className="flex-1 bg-blue-600 text-white font-black py-2 rounded-lg text-xs shadow-md"
            >
              {STRINGS.profile.save}
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-100 rounded-lg text-xs font-black text-slate-400"
            >
              {STRINGS.profile.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
