import React, { useState } from 'react';
import {
  Copy,
  Check,
  RotateCcw,
  Download,
  Maximize2,
  FileText,
  Sparkles,
  Loader2,
  AlertCircle,
  Play,
  Film,
} from 'lucide-react';
import { Message, Language, AgeGroup } from '../types';
import { translations } from '../translations';
import { MarkdownRenderer } from './MarkdownRenderer';
import { formatBytes } from '../utils/fileHelpers';

interface ChatMessageProps {
  message: Message;
  language: Language;
  ageGroup: AgeGroup;
  userName: string;
  onRegenerate?: () => void;
  onImageClick?: (url: string, alt?: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  language,
  ageGroup,
  userName,
  onRegenerate,
  onImageClick,
}) => {
  const t = translations[language];
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getBubbleStyle = () => {
    if (isUser) {
      switch (ageGroup) {
        case 'kids':
          return 'bg-gradient-to-r from-amber-500 to-pink-500 text-white rounded-3xl rounded-tr-md shadow-lg shadow-pink-500/20';
        case 'teens':
          return 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl rounded-tr-sm shadow-md shadow-cyan-600/20';
        case 'adults':
        default:
          return 'bg-zinc-800 text-zinc-100 rounded-2xl rounded-tr-sm border border-zinc-700/60 shadow-md';
      }
    } else {
      switch (ageGroup) {
        case 'kids':
          return 'bg-zinc-900/90 text-zinc-100 rounded-3xl rounded-tl-md border border-purple-500/30 shadow-md';
        case 'teens':
          return 'bg-zinc-900/80 text-zinc-100 rounded-2xl rounded-tl-sm border border-cyan-500/30 shadow-md';
        case 'adults':
        default:
          return 'bg-zinc-900/50 text-zinc-100 rounded-2xl rounded-tl-sm border border-zinc-800/80 shadow-md';
      }
    }
  };

  return (
    <div className={`flex gap-3 sm:gap-4 my-4 sm:my-5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className="shrink-0 mt-0.5">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">
            {userName ? userName.charAt(0).toUpperCase() : 'U'}
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 p-[1.5px] shadow-md shadow-purple-900/40">
            <div className="w-full h-full bg-[#0a0a0f] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
          </div>
        )}
      </div>

      {/* Message Container */}
      <div className={`relative max-w-[85%] sm:max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Name & time */}
        <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-zinc-500">
          <span>{isUser ? userName : 'UzbechiGPT'}</span>
          <span>•</span>
          <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {/* Bubble */}
        <div className={`px-4 sm:px-5 py-3 sm:py-3.5 transition-all ${getBubbleStyle()}`}>
          {/* User Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2.5 pb-2.5 border-b border-white/10">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-black/30 border border-white/10 text-xs"
                >
                  {att.type === 'image' && att.previewUrl ? (
                    <img
                      src={att.previewUrl}
                      alt={att.name}
                      onClick={() => onImageClick?.(att.previewUrl!, att.name)}
                      className="w-12 h-12 rounded-lg object-cover cursor-pointer hover:opacity-90"
                    />
                  ) : att.type === 'video' && att.previewUrl ? (
                    <video src={att.previewUrl} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <FileText className="w-6 h-6 text-purple-300 ml-1" />
                  )}
                  <div className="max-w-[120px] truncate text-[11px]">
                    <p className="truncate font-medium">{att.name}</p>
                    <p className="text-[10px] opacity-75">{formatBytes(att.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error Message */}
          {message.isError ? (
            <div className="space-y-2">
              <div className="flex items-start gap-2.5 text-rose-300 text-xs sm:text-[13.5px] leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{message.text || t.apiError}</span>
              </div>
              {onRegenerate && (
                <button
                  type="button"
                  onClick={onRegenerate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition-all mt-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t.retry}</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Text content */}
              {message.text && (
                <div className="selection:bg-purple-500/30 selection:text-white">
                  <MarkdownRenderer content={message.text} />
                </div>
              )}

              {/* Generating spinner */}
              {message.isGenerating && (
                <div className="flex items-center gap-2 py-1 text-xs text-purple-300 font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                  <span>{message.id?.startsWith('msg_img_') ? t.generatingImage : ''}</span>
                </div>
              )}
            </>
          )}

          {/* Generated Image Card */}
          {message.generatedImage && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-purple-500/30 bg-black/40 shadow-xl">
              <div
                className="relative group cursor-pointer"
                onClick={() => onImageClick?.(message.generatedImage!.imageUrl, message.generatedImage!.prompt)}
              >
                <img
                  src={message.generatedImage.imageUrl}
                  alt={message.generatedImage.prompt}
                  className="w-full max-h-[380px] object-cover transition-transform group-hover:scale-[1.01]"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <span className="p-2 rounded-xl bg-black/60 text-white backdrop-blur-md">
                    <Maximize2 className="w-4 h-4" />
                  </span>
                </div>
              </div>
              <div className="p-3 bg-zinc-950/80 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <p className="text-zinc-400 truncate max-w-[50%] sm:max-w-[60%] text-[11px]">
                  {message.generatedImage.prompt}
                </p>
                <div className="flex items-center gap-1.5">
                  {onRegenerate && (
                    <button
                      type="button"
                      onClick={onRegenerate}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-[11px] shadow-sm transition-all"
                      title={t.regenerate}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t.regenerate}</span>
                    </button>
                  )}
                  <a
                    href={message.generatedImage.imageUrl}
                    download={`uzbechigpt-image-${Date.now()}.png`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-[11px] shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t.download}</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Internet Searched Images Grid */}
          {message.searchedImages && message.searchedImages.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                {message.searchedImages.map((img, idx) => (
                  <div
                    key={img.id || idx}
                    className="group relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/60 shadow-md flex flex-col justify-between"
                  >
                    <div
                      className="relative aspect-4/3 w-full overflow-hidden cursor-pointer bg-zinc-950"
                      onClick={() => onImageClick?.(img.url, img.title || message.searchQuery || '')}
                    >
                      <img
                        src={img.thumbUrl || img.url}
                        alt={img.title || 'Search result'}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        <span className="p-1.5 rounded-lg bg-black/70 text-white backdrop-blur-md">
                          <Maximize2 className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                    {/* Attribution / credit */}
                    <div className="p-1.5 px-2 bg-zinc-950/90 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
                      <span className="truncate max-w-[70%]" title={img.author || img.source}>
                        {img.author ? `📷 ${img.author}` : `🌐 ${img.source || 'Web'}`}
                      </span>
                      <a
                        href={img.url}
                        download={`photo-${idx + 1}.jpg`}
                        target="_blank"
                        rel="noreferrer noopener"
                        onClick={(e) => e.stopPropagation()}
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                        title={t.download}
                      >
                        <Download className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generated Video Card */}
          {message.generatedVideo && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-blue-500/30 bg-black/50 shadow-xl p-3">
              {message.generatedVideo.status === 'generating' ? (
                <div className="py-6 px-4 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="relative w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Film className="w-6 h-6 animate-pulse" />
                    <Loader2 className="w-6 h-6 animate-spin absolute text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-xs sm:text-sm">{t.generatingVideo}</h4>
                    <p className="text-[11px] text-zinc-400 mt-1 max-w-xs animate-pulse">
                      {message.generatedVideo.progressStage || t.videoProgress1}
                    </p>
                  </div>
                </div>
              ) : message.generatedVideo.status === 'completed' && message.generatedVideo.videoUrl ? (
                <div className="space-y-2">
                  <video
                    src={message.generatedVideo.videoUrl}
                    controls
                    className="w-full rounded-xl max-h-[360px] bg-black"
                  />
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-zinc-400 truncate max-w-[60%] text-[11px]">
                      {message.generatedVideo.prompt}
                    </span>
                    <a
                      href={message.generatedVideo.videoUrl}
                      download={`uzbechigpt-video-${Date.now()}.mp4`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t.download}</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="py-3 px-2 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{message.generatedVideo.error || t.apiError}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message Action Toolbar */}
        {!message.isGenerating && (
          <div className="flex items-center gap-1 mt-1 px-1 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity">
            {message.text && (
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                title={t.copyMessage}
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            )}
            {!isUser && onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                title={t.regenerate}
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
