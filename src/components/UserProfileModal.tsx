import React, { useState } from 'react';
import { X, User, Sparkles, Check } from 'lucide-react';
import { UserProfile, Language, AgeGroup } from '../types';
import { translations } from '../translations';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  language: Language;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  language,
}) => {
  const t = translations[language];
  const [name, setName] = useState(userProfile.name);
  const [age, setAge] = useState<number | string>(userProfile.age);
  const [error, setError] = useState('');

  React.useEffect(() => {
    setName(userProfile.name);
    setAge(userProfile.age);
    setError('');
  }, [userProfile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t.nameRequired);
      return;
    }
    const ageNum = parseInt(String(age), 10);
    if (isNaN(ageNum) || ageNum < 7 || ageNum > 120) {
      setError(t.ageRequired);
      return;
    }

    let ageGroup: AgeGroup = 'adults';
    if (ageNum >= 7 && ageNum <= 10) {
      ageGroup = 'kids';
    } else if (ageNum >= 11 && ageNum <= 14) {
      ageGroup = 'teens';
    }

    onSaveProfile({
      ...userProfile,
      name: name.trim(),
      age: ageNum,
      ageGroup,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <User className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-white text-sm">{t.editProfile}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">{t.askName}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">{t.askAge}</label>
            <input
              type="number"
              min="7"
              max="120"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder={t.agePlaceholder}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-900/30 transition-all"
            >
              {t.saveProfile}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
