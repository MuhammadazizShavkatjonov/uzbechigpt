import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  const renderContent = () => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    let codeBlockCount = 0;

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeIndex = codeBlockCount++;
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const language = match ? match[1] : '';
        const code = match ? match[2] : part.slice(3, -3);

        return (
          <div key={index} className="my-3 rounded-2xl overflow-hidden border border-zinc-800 bg-[#0d0d12] shadow-lg">
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/90 border-b border-zinc-800 text-xs font-mono text-zinc-400">
              <span className="uppercase font-semibold tracking-wider text-[11px] text-purple-400">
                {language || 'code'}
              </span>
              <button
                type="button"
                onClick={() => handleCopyCode(code.trim(), codeIndex)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all text-[11px] font-medium"
              >
                {copiedCodeIndex === codeIndex ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Nusxalandi!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Nusxalash</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-xs sm:text-[13px] font-mono leading-relaxed text-zinc-200">
              <code>{code.trim()}</code>
            </pre>
          </div>
        );
      }

      // Inline formatting
      const lines = part.split('\n');
      return (
        <div key={index} className="space-y-1.5 leading-relaxed text-sm sm:text-[14.5px]">
          {lines.map((line, lIdx) => {
            if (!line.trim()) return <div key={lIdx} className="h-1.5" />;

            // Headings
            if (line.startsWith('### ')) {
              return (
                <h3 key={lIdx} className="font-bold text-white text-base sm:text-lg mt-3 mb-1">
                  {line.replace('### ', '')}
                </h3>
              );
            }
            if (line.startsWith('## ')) {
              return (
                <h2 key={lIdx} className="font-bold text-white text-lg sm:text-xl mt-4 mb-1.5">
                  {line.replace('## ', '')}
                </h2>
              );
            }
            if (line.startsWith('# ')) {
              return (
                <h1 key={lIdx} className="font-bold text-white text-xl sm:text-2xl mt-4 mb-2">
                  {line.replace('# ', '')}
                </h1>
              );
            }

            // Bullet points
            if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
              const text = line.trim().substring(2);
              return (
                <div key={lIdx} className="flex items-start gap-2 ml-2 my-0.5">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>{formatInline(text)}</span>
                </div>
              );
            }

            return <p key={lIdx}>{formatInline(line)}</p>;
          })}
        </div>
      );
    });
  };

  const formatInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((chunk, i) => {
      if (chunk.startsWith('**') && chunk.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-white">
            {chunk.slice(2, -2)}
          </strong>
        );
      }
      if (chunk.startsWith('*') && chunk.endsWith('*')) {
        return (
          <em key={i} className="italic text-zinc-200">
            {chunk.slice(1, -1)}
          </em>
        );
      }
      if (chunk.startsWith('`') && chunk.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-300 font-mono text-[12px] border border-purple-500/20"
          >
            {chunk.slice(1, -1)}
          </code>
        );
      }
      return chunk;
    });
  };

  return <div className="markdown-body space-y-1">{renderContent()}</div>;
};
