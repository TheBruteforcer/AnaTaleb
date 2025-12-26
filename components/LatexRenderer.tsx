
import React, { useEffect, useRef } from 'react';

interface LatexRendererProps {
  text: string;
  className?: string;
}

const LatexRenderer: React.FC<LatexRendererProps> = ({ text, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && (window as any).renderMathInElement) {
      (window as any).renderMathInElement(containerRef.current, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
        ],
        throwOnError: false,
      });
    }
  }, [text]);

  return (
    <div 
      ref={containerRef} 
      className={`latex-container ${className}`}
      style={{ 
        // حماية المعادلات من تأثير اتجاه الصفحة العام
        unicodeBidi: 'embed',
      }}
    >
      {text}
      <style>{`
        .latex-container .katex {
          direction: ltr !important;
          display: inline-block;
          unicode-bidi: isolate;
        }
        .latex-container .katex-display {
          direction: ltr !important;
          margin: 1em 0;
        }
      `}</style>
    </div>
  );
};

export default LatexRenderer;
