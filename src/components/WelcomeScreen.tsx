import React from 'react';
import { Sparkles, ArrowRight, Zap, Image, Video, ShieldCheck } from 'lucide-react';
import { Language, AgeGroup } from '../types';
import { translations } from '../translations';

interface WelcomeScreenProps {
  userName: string;
  ageGroup: AgeGroup;
  language: Language;
  onSelectSuggestion: (text: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  userName,
  ageGroup,
  language,
  onSelectSuggestion,
}) => {
  const t = translations[language];

  const getAgeSpecificTag = () => {
    switch (ageGroup) {
      case 'kids':
        return 'Yorqin & Qiziqarli bolalar dunyosi 🚀';
      case 'teens':
        return 'Yoshlar uchun eng kuchli texnologiyalar ⚡';
      case 'adults':
      default:
        return 'Tezkor, aniq va professional AI yordamchi ✦';
    }
  };

  const suggestions = [
    {
      icon: <Image className="w-4 h-4 text-pink-400" />,
      text: t.sugg1,
    },
    {
      icon: <Video className="w-4 h-4 text-purple-400" />,
      text: t.sugg2,
    },
    {
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      text: t.sugg3,
    },
    {
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
      text: t.sugg4,
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 p-[2px] shadow-2xl shadow-purple-900/40 mb-5">
        <div className="w-full h-full bg-[#0a0a0f] rounded-[22px] flex items-center justify-center">
          <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400 animate-pulse" />
        </div>
      </div>

      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
        {t.greeting(userName)}
      </h2>

      <p className="text-xs sm:text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
        {t.chatWelcomeSubtitle}
      </p>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[11px] text-zinc-300 font-medium mb-8">
        <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
        <span>{getAgeSpecificTag()}</span>
      </div>

      <div className="w-full text-left">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 px-1">
          {t.suggestionsTitle}
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {suggestions.map((sugg, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectSuggestion(sugg.text)}
              className="group p-3 rounded-2xl bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800/80 hover:border-purple-500/40 text-left transition-all duration-200 flex items-start gap-3 shadow-sm hover:shadow-md"
            >
              <div className="p-2 rounded-xl bg-black/40 border border-white/5 shrink-0 group-hover:scale-105 transition-transform">
                {sugg.icon}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs text-zinc-300 group-hover:text-white font-medium line-clamp-2 leading-relaxed">
                  {sugg.text}
                </p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-purple-400 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
