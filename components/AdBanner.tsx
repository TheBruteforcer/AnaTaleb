
import React from 'react';

interface AdBannerProps {
  type: 'sidebar' | 'horizontal';
}

const AdBanner: React.FC<AdBannerProps> = ({ type }) => {
  // ملاحظة: المقاسات هي 300x250 للجانبي و 728x90 للأفقي
  const config = {
    sidebar: {
      container: "w-full aspect-[300/250] bg-slate-50 border border-slate-100 rounded-[2.5rem] overflow-hidden relative group",
      img: "https://images.unsplash.com/photo-1523240715629-67c8551c0681?q=80&w=300&h=250&auto=format&fit=crop",
      title: "أفضل الكورسات التعليمية",
      tag: "إعلان ممول"
    },
    horizontal: {
      container: "w-full h-24 sm:h-32 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50 rounded-[2.5rem] overflow-hidden relative flex items-center mb-8 group",
      img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=728&h=90&auto=format&fit=crop",
      title: "خصم 50% على أدوات المذاكرة",
      tag: "عرض خاص"
    }
  };

  const current = config[type];

  if (type === 'sidebar') {
    return (
      <div className={current.container}>
        <img src={current.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Ad" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-5 text-right">
          <span className="text-[9px] font-black text-white/70 uppercase tracking-widest mb-1">{current.tag}</span>
          <p className="text-white font-black text-sm">{current.title}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={current.container}>
      <div className="flex-1 p-6 text-right">
        <span className="text-[9px] font-black text-blue-600/50 uppercase tracking-widest block mb-1">{current.tag}</span>
        <h4 className="text-slate-800 font-black text-sm sm:text-base">{current.title}</h4>
        <button className="mt-2 text-[10px] font-black text-blue-600 bg-white px-4 py-1.5 rounded-full shadow-sm">اعرف أكثر ➔</button>
      </div>
      <div className="w-1/3 h-full hidden sm:block">
        <img src={current.img} className="w-full h-full object-cover" alt="Ad" />
      </div>
    </div>
  );
};

export default AdBanner;
