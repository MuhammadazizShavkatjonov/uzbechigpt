import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  X,
  FileText,
  Image,
  Video,
  Mic,
  MicOff,
  Square,
} from 'lucide-react';
import { Attachment, Language } from '../types';
import { translations } from '../translations';
import { processUploadedFile } from '../utils/fileHelpers';

interface ChatInputProps {
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  isGenerating: boolean;
  onStopGenerating?: () => void;
  language: Language;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isGenerating,
  onStopGenerating,
  language,
}) => {
  const t = translations[language];
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || isGenerating) return;
    onSendMessage(text.trim(), attachments);
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    for (const file of files) {
      if (file.size > 20 * 1024 * 1024) {
        alert(t.fileSizeError);
        continue;
      }
      try {
        const att = await processUploadedFile(file);
        setAttachments((prev) => [...prev, att]);
      } catch (err) {
        console.error('File read error:', err);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Speech to Text Web Speech API
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Brauzeringiz ovozli kiritishni qo\'llab-quvvatlamaydi.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'ru' ? 'ru-RU' : language === 'en' ? 'en-US' : 'uz-UZ';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (e) {
      console.error('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  return (
    <div className="p-3 sm:p-4 max-w-4xl mx-auto w-full">
      <div className="relative bg-zinc-900/90 border border-zinc-800 rounded-3xl p-2.5 sm:p-3 shadow-2xl backdrop-blur-xl focus-within:border-purple-500/50 transition-all">
        {/* Attachment previews */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 p-1.5 bg-black/40 rounded-2xl border border-white/5">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="relative group flex items-center gap-2 p-1.5 pr-6 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-xs"
              >
                {att.type === 'image' && att.previewUrl ? (
                  <img src={att.previewUrl} alt={att.name} className="w-8 h-8 rounded-lg object-cover" />
                ) : att.type === 'video' ? (
                  <Video className="w-4 h-4 text-purple-400 ml-1" />
                ) : (
                  <FileText className="w-4 h-4 text-blue-400 ml-1" />
                )}
                <span className="truncate max-w-[120px] font-medium text-[11px] text-zinc-300">
                  {att.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-700/50"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input box */}
        <div className="flex items-end gap-2">
          {/* Attach file button */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,video/*,.txt,.pdf,.md,.json,.js,.ts,.py,.html,.css"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 sm:p-2.5 rounded-2xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
            title={t.attachFile}
          >
            <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Voice input */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            className={`p-2 sm:p-2.5 rounded-2xl transition-colors shrink-0 ${
              isListening
                ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            title="Ovozli kiritish"
          >
            {isListening ? (
              <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>

          {/* Main textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.inputPlaceholder}
            rows={1}
            className="flex-1 max-h-[180px] bg-transparent text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 py-2 sm:py-2.5 focus:outline-none resize-none leading-relaxed"
          />

          {/* Send / Stop button */}
          {isGenerating ? (
            <button
              type="button"
              onClick={onStopGenerating}
              className="p-2.5 sm:p-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-rose-400 transition-all shrink-0 shadow-md"
              title={t.stopGenerating}
            >
              <Square className="w-4 h-4 fill-rose-400" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSend}
              disabled={!text.trim() && attachments.length === 0}
              className={`p-2.5 sm:p-3 rounded-2xl transition-all shrink-0 shadow-md ${
                text.trim() || attachments.length > 0
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/30'
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
