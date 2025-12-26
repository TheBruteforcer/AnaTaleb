
import React, { useMemo } from 'react';

interface LatexRendererProps {
  text: string;
  className?: string;
}

const LatexRenderer: React.FC<LatexRendererProps> = ({ text, className }) => {
  // دالة لمعالجة النص وتحويل ما بين علامات $ إلى HTML الخاص بـ KaTeX بشكل آمن
  const renderedContent = useMemo(() => {
    if (!text) return "";
    
    // نستخدم مكتبة KaTeX المتوفرة عالمياً عبر CDN
    const katex = (window as any).katex;
    if (!katex) return text;

    // تقسيم النص للبحث عن علامات $
    // سنقوم بمعالجة بسيطة للأسطر والمحتوى الرياضي
    const parts = text.split(/(\$.*?\$)/g);
    
    return parts.map(part => {
      if (part.startsWith('$') && part.endsWith('$')) {
        const formula = part.slice(1, -1);
        try {
          return katex.renderToString(formula, {
            throwOnError: false,
            displayMode: false
          });
        } catch (e) {
          return part;
        }
      }
      return part;
    }).join('');
  }, [text]);

  return (
    <div 
      className={`latex-container ${className}`}
      style={{ 
        unicodeBidi: 'embed',
        textAlign: 'inherit'
      }}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
};

export default LatexRenderer;
