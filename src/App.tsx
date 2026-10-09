import React, { useState, useEffect, useRef } from 'react';
import {
  Message,
  ChatSession,
  UserProfile,
  Language,
  AgeGroup,
  Attachment,
} from './types';
import { translations } from './translations';
import { Header } from './components/Header';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ChatHistoryDrawer } from './components/ChatHistoryDrawer';
import { UserProfileModal } from './components/UserProfileModal';
import { ImageLightbox } from './components/ImageLightbox';
import { Sparkles, ArrowRight } from 'lucide-react';

const STORAGE_KEY_SESSIONS = 'uzbechigpt_sessions_v2';
const STORAGE_KEY_ACTIVE = 'uzbechigpt_active_session_v2';
const STORAGE_KEY_PROFILE = 'uzbechigpt_user_profile_v2';

export const App: React.FC = () => {
  // 1. User Profile & Preferences
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      name: '',
      age: 18,
      ageGroup: 'adults',
      language: 'uz',
      onboarded: false,
    };
  });

  const language = userProfile.language;
  const t = translations[language];

  // 2. Chat Sessions
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE);
      if (saved) return saved;
    } catch {}
    return '';
  });

  // 4. UI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [lightboxData, setLightboxData] = useState<{ url: string; alt?: string } | null>(null);

  // References
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVE, activeSessionId);
  }, [activeSessionId]);

  // Ensure active session exists
  useEffect(() => {
    if (userProfile.onboarded && sessions.length === 0) {
      createNewChat();
    }
  }, [userProfile.onboarded]);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession ? activeSession.messages : [];

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isGenerating]);

  // Session Management
  const createNewChat = () => {
    const newId = `session_${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: t.newChat,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      ageGroup: userProfile.ageGroup,
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      const remaining = sessions.filter((s) => s.id !== id);
      if (remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
      } else {
        createNewChat();
      }
    }
  };

  const renameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle, updatedAt: Date.now() } : s))
    );
  };

  const clearAllSessions = () => {
    setSessions([]);
    createNewChat();
  };

  const updateActiveMessages = (updater: (prev: Message[]) => Message[]) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === (activeSession ? activeSession.id : activeSessionId)) {
          const updated = updater(s.messages);
          let title = s.title;
          if (s.title === t.newChat && updated.length > 0) {
            const firstUser = updated.find((m) => m.role === 'user');
            if (firstUser && firstUser.text) {
              title = firstUser.text.slice(0, 30).trim() + (firstUser.text.length > 30 ? '...' : '');
            }
          }
          return {
            ...s,
            messages: updated,
            title,
            updatedAt: Date.now(),
          };
        }
        return s;
      })
    );
  };

  // Download project ZIP
  const handleDownloadZip = () => {
    const link = document.createElement('a');
    link.href = '/UzbechiGPT-Full-Project.zip';
    link.download = 'UzbechiGPT-Full-Project.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Onboarding Submit
  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile.name.trim()) return;

    const ageNum = Number(userProfile.age) || 18;
    let group: AgeGroup = 'adults';
    if (ageNum >= 7 && ageNum <= 10) group = 'kids';
    else if (ageNum >= 11 && ageNum <= 14) group = 'teens';

    setUserProfile((prev) => ({
      ...prev,
      age: ageNum,
      ageGroup: group,
      onboarded: true,
    }));
  };

  // Detection functions for Image vs Video vs Chat requests
  const isImageRequest = (rawText: string): boolean => {
    const t = rawText.toLowerCase().trim();
    if (!t) return false;

    // Direct command prefixes
    if (
      t.startsWith('/image') ||
      t.startsWith('/img') ||
      t.startsWith('/draw') ||
      t.startsWith('image:') ||
      t.startsWith('img:') ||
      t.startsWith('rasm:')
    ) {
      return true;
    }

    // Multilingual keywords (Uzbek, Russian, English)
    const keywords = [
      // Uzbek
      'rasm',
      'tasvir',
      'surat',
      'chiz',
      'illyustratsi',
      // Russian
      'нарисуй',
      'нарисовать',
      'рисуй',
      'рисунок',
      'картинк',
      'изображен',
      'фотографи',
      'иллюстрац',
      'фото',
      // English
      'image',
      'picture',
      'photo',
      'draw',
      'paint',
      'artwork',
      'illustration',
    ];

    return keywords.some((k) => t.includes(k));
  };

  const isVideoRequest = (rawText: string): boolean => {
    const t = rawText.toLowerCase().trim();
    if (!t) return false;

    if (t.startsWith('/video') || t.startsWith('video:')) return true;

    const videoKeywords = ['video', 'klip', 'rolik', 'видео', 'клип', 'ролик'];
    return videoKeywords.some((k) => t.includes(k)) && !isImageRequest(rawText);
  };

  // Main message sender with strict execution order
  const handleSendMessage = async (text: string, attachments: Attachment[]) => {
    if (!text && attachments.length === 0) return;

    const userMessage: Message = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      text,
      timestamp: Date.now(),
      attachments,
    };

    updateActiveMessages((prev) => [...prev, userMessage]);

    // 1. Check Image / Photo Search Intent FIRST - DO NOT call text AI
    if (isImageRequest(text)) {
      await handleImageSearch(text);
      return;
    }

    // 2. Check Video Generation Intent SECOND - DO NOT call text AI
    if (isVideoRequest(text)) {
      return;
    }

    // 3. ONLY regular text questions reach conversational chat streaming
    await handleChatStreaming(text, attachments);
  };

  // 1. Real Internet Photo Search Pipeline (Unsplash / Wikimedia)
  const handleImageSearch = async (queryText: string) => {
    setIsGenerating(true);

    const modelMessageId = `msg_img_${Date.now()}`;
    const initialModelMessage: Message = {
      id: modelMessageId,
      role: 'model',
      text: '',
      timestamp: Date.now(),
      isGenerating: true,
    };

    updateActiveMessages((prev) => [...prev, initialModelMessage]);
    setTimeout(() => scrollToBottom(), 50);

    try {
      const res = await fetch('/api/search-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: queryText,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t.imageError);
      }

      updateActiveMessages((prev) =>
        prev.map((m) =>
          m.id === modelMessageId
            ? {
                ...m,
                text: data.text || '',
                searchedImages: data.images || [],
                searchQuery: data.query || queryText,
                isGenerating: false,
              }
            : m
        )
      );
    } catch (err: any) {
      console.error('Image search error:', err);
      const fallbackError =
        language === 'ru'
          ? '⚠️ Не удалось найти фотографии по вашему запросу. Пожалуйста, попробуйте еще раз.'
          : language === 'en'
          ? '⚠️ Failed to find photos for your request. Please try again.'
          : '⚠️ So‘rovingiz bo‘yicha fotosuratlar topilmadi. Iltimos, qayta urinib ko‘ring.';

      updateActiveMessages((prev) =>
        prev.map((m) =>
          m.id === modelMessageId
            ? {
                ...m,
                text: err.message || fallbackError,
                isGenerating: false,
                isError: true,
              }
            : m
        )
      );
    } finally {
      setIsGenerating(false);
      setTimeout(() => scrollToBottom(), 100);
    }
  };

  // 2. Video Generation Pipeline
  const handleChatStreaming = async (text: string, attachments: Attachment[]) => {
    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    const modelMessageId = `msg_model_${Date.now()}`;
    const initialModelMessage: Message = {
      id: modelMessageId,
      role: 'model',
      text: '',
      timestamp: Date.now(),
      isGenerating: true,
    };

    updateActiveMessages((prev) => [...prev, initialModelMessage]);
    setTimeout(() => scrollToBottom(), 50);

    try {
      const activeMsgs = activeSession ? activeSession.messages : [];
      const history = [...activeMsgs, { role: 'user', text, attachments }];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          messages: history.map((m) => ({
            role: m.role,
            text: m.text,
            attachments: m.attachments?.map((a) => ({
              type: a.type,
              mimeType: a.mimeType,
              data: a.data,
              textSnippet: a.textSnippet,
            })),
          })),
          ageGroup: userProfile.ageGroup,
          language,
          userName: userProfile.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || t.apiError);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6).trim();
              if (jsonStr === '[DONE]') continue;
              try {
                const parsed = JSON.parse(jsonStr);
                if (parsed.text) {
                  accumulatedText += parsed.text;
                  updateActiveMessages((prev) =>
                    prev.map((m) =>
                      m.id === modelMessageId ? { ...m, text: accumulatedText } : m
                    )
                  );
                }
              } catch {
                // partial JSON, ignore
              }
            }
          }
        }
      }

      updateActiveMessages((prev) =>
        prev.map((m) => (m.id === modelMessageId ? { ...m, isGenerating: false } : m))
      );
    } catch (err: any) {
      if (err.name === 'AbortError') {
        updateActiveMessages((prev) =>
          prev.map((m) => (m.id === modelMessageId ? { ...m, isGenerating: false } : m))
        );
      } else {
        console.error('Chat error:', err);
        updateActiveMessages((prev) =>
          prev.map((m) =>
            m.id === modelMessageId
              ? {
                  ...m,
                  text: err.message || t.apiError,
                  isGenerating: false,
                  isError: true,
                }
              : m
          )
        );
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
      setTimeout(() => scrollToBottom(), 100);
    }
  };

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
  };

  const handleRegenerateLast = () => {
    const activeMsgs = activeSession ? activeSession.messages : [];
    const lastUserIdx = [...activeMsgs].reverse().findIndex((m) => m.role === 'user');
    if (lastUserIdx !== -1) {
      const actualIdx = activeMsgs.length - 1 - lastUserIdx;
      const lastUser = activeMsgs[actualIdx];
      updateActiveMessages((prev) => prev.slice(0, actualIdx + 1));
      handleSendMessage(lastUser.text, lastUser.attachments || []);
    }
  };

  // 5. Onboarding Screen
  if (!userProfile.onboarded) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-950 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 p-[2px] shadow-xl shadow-purple-900/30 mb-4">
              <div className="w-full h-full bg-[#0a0a0f] rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{t.welcomeTitle}</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xs">{t.welcomeDesc}</p>
          </div>

          <form onSubmit={handleOnboardSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">{t.askName}</label>
              <input
                type="text"
                required
                value={userProfile.name}
                onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                placeholder={t.namePlaceholder}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">{t.askAge}</label>
              <input
                type="number"
                min="7"
                max="120"
                required
                value={userProfile.age}
                onChange={(e) => setUserProfile({ ...userProfile, age: Number(e.target.value) })}
                placeholder={t.agePlaceholder}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-lg shadow-purple-900/40 flex items-center justify-center gap-2 transition-all"
              >
                <span>{t.startBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#09090b] text-zinc-100 overflow-hidden font-sans">
      {/* Header */}
      <Header
        onToggleDrawer={() => setIsDrawerOpen(true)}
        onNewChat={createNewChat}
        onOpenProfile={() => setIsProfileOpen(true)}
        onDownloadZip={handleDownloadZip}
        userProfile={userProfile}
        language={language}
        onLanguageChange={(lang) => setUserProfile({ ...userProfile, language: lang })}
        ageGroup={userProfile.ageGroup}
      />

      {/* Main chat viewport */}
      <main className="flex-1 overflow-y-auto px-3 sm:px-6 relative flex flex-col">
        {messages.length === 0 ? (
          <WelcomeScreen
            userName={userProfile.name}
            ageGroup={userProfile.ageGroup}
            language={language}
            onSelectSuggestion={(sugg) => handleSendMessage(sugg, [])}
          />
        ) : (
          <div className="max-w-4xl mx-auto w-full py-4 space-y-2 flex-1">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                language={language}
                ageGroup={userProfile.ageGroup}
                userName={userProfile.name}
                onRegenerate={handleRegenerateLast}
                onImageClick={(url, alt) => setLightboxData({ url, alt })}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input bar */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isGenerating={isGenerating}
        onStopGenerating={handleStopGenerating}
        language={language}
      />

      {/* Drawers and Modals */}
      <ChatHistoryDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sessions={sessions}
        activeSessionId={activeSession ? activeSession.id : activeSessionId}
        onSelectSession={(id) => setActiveSessionId(id)}
        onNewChat={createNewChat}
        onDeleteSession={deleteSession}
        onRenameSession={renameSession}
        onClearAll={clearAllSessions}
        language={language}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userProfile={userProfile}
        onSaveProfile={(p) => setUserProfile(p)}
        language={language}
      />

      <ImageLightbox
        isOpen={!!lightboxData}
        onClose={() => setLightboxData(null)}
        imageUrl={lightboxData?.url || ''}
        altText={lightboxData?.alt}
      />
    </div>
  );
};

export default App;
