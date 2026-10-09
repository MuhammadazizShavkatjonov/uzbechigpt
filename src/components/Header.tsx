import React from 'react';
import {
  Menu,
  Plus,
  Sparkles,
  User,
  Download,
  Languages,
  Trash2,
} from 'lucide-react';
import { Language, UserProfile, AgeGroup } from '../types';
import { translations } from '../translations';

interface HeaderProps {
  onToggleDrawer: () => void;
  onNewChat: () => void;
  onOpenProfile: () => void;
  onDownloadZip: () => void;
  userProfile: UserProfile;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  ageGroup: AgeGroup;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleDrawer,
  onNewChat,
  onOpenProfile,
  onDownloadZip,
  userProfile,
  language,
  onLanguageChange,
  ageGroup,
}) => {
  const t = translations[language];

  const getThemeBadge = () => {
    switch (ageGroup) {
      case 'kids':
        return (
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gradient-to-r from-amber-500/20 to-pink-500/20 text-pink-300 border border-pink-500/30">
            🧸 {t.kidsTheme}
          </span>
        );
      case 'teens':
        return (
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            ⚡ {t.teensTheme}
          </span>
        );
      case 'adults':
      default:
        return (
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30">
            ✦ {t.adultsTheme}
          </span>
        );
    }
  };

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl px-3 sm:px-5 flex items-center justify-between z-20 shrink-0">
      {/* Left section: Drawer toggle & Branding */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onToggleDrawer}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          title={t.chatHistory}
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={onNewChat}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors sm:hidden"
          title={t.newChat}
        >
          <Plus className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={onNewChat}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 p-[1.5px] shadow-lg shadow-purple-900/30">
            <div className="w-full h-full bg-[#0a0a0f] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                UzbechiGPT
              </h1>
              {getThemeBadge()}
            </div>
            <p className="text-[10px] text-zinc-400 hidden xs:block">{t.createdBy}</p>
          </div>
        </div>
      </div>

      {/* Right section: Action Buttons */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Language selector */}
        <div className="flex items-center bg-zinc-900/90 border border-zinc-800 rounded-xl p-0.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onLanguageChange('uz')}
            className={`px-2 py-1 rounded-lg transition-all ${
              language === 'uz' ? 'bg-purple-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            UZ
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('ru')}
            className={`px-2 py-1 rounded-lg transition-all ${
              language === 'ru' ? 'bg-purple-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            RU
          </button>
          <button
            type="button"
            onClick={() => onLanguageChange('en')}
            className={`px-2 py-1 rounded-lg transition-all ${
              language === 'en' ? 'bg-purple-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            EN
          </button>
        </div>

        {/* Download Zip button */}
        <button
          type="button"
          onClick={onDownloadZip}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold transition-all"
          title={t.downloadZip}
        >
          <Download className="w-3.5 h-3.5 text-purple-400" />
          <span>ZIP</span>
        </button>

        {/* User Profile button */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs font-semibold transition-all"
          title={t.profile}
        >
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-[11px] font-bold text-white shadow-sm">
            {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="hidden sm:inline max-w-[80px] truncate">{userProfile.name || 'Profil'}</span>
        </button>
      </div>
    </header>
  );
};
