import React from 'react';
import { X, Sliders, Check, Clapperboard, Key } from 'lucide-react';
import { VideoSettings, Language } from '../types';
import { translations } from '../translations';

interface VideoSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VideoSettings;
  onSaveSettings: (settings: VideoSettings) => void;
  language: Language;
}

export const VideoSettingsModal: React.FC<VideoSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  language,
}) => {
  const t = translations[language];
  const [current, setCurrent] = React.useState<VideoSettings>(settings);

  React.useEffect(() => {
    setCurrent(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const durationOptions = [5, 8, 10, 15, 20, 30];
  const qualityOptions: VideoSettings['quality'][] = ['Standard', 'High', 'Ultra'];
  const resolutionOptions: VideoSettings['resolution'][] = ['480p', '720p', '1080p', '2K', '4K'];
  const aspectRatioOptions: VideoSettings['aspectRatio'][] = ['16:9', '9:16', '1:1'];
  const styleOptions: VideoSettings['style'][] = ['Realistic', 'Cinematic', '3D', 'Animation'];
  const cameraOptions: VideoSettings['camera'][] = ['Static', 'Zoom In', 'Zoom Out', 'Tracking Shot', 'Drone Shot'];

  const handleSave = () => {
    onSaveSettings(current);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Clapperboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">{t.videoSettings}</h3>
              <p className="text-[11px] text-zinc-400">AI Media Engine & Pollinations Flux</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {/* Duration */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-2">{t.duration} (sec)</label>
            <div className="grid grid-cols-6 gap-1.5">
              {durationOptions.map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setCurrent({ ...current, duration: dur })}
                  className={`py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    current.duration === dur
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  {dur}s
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-2">{t.aspectRatio}</label>
            <div className="grid grid-cols-3 gap-2">
              {aspectRatioOptions.map((ar) => (
                <button
                  key={ar}
                  type="button"
                  onClick={() => setCurrent({ ...current, aspectRatio: ar })}
                  className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                    current.aspectRatio === ar
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  {ar}
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-2">{t.style}</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {styleOptions.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setCurrent({ ...current, style: st })}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold truncate transition-all ${
                    current.style === st
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Camera Motion */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-2">{t.camera}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {cameraOptions.map((cam) => (
                <button
                  key={cam}
                  type="button"
                  onClick={() => setCurrent({ ...current, camera: cam })}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold truncate transition-all ${
                    current.camera === cam
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  {cam}
                </button>
              ))}
            </div>
          </div>

          {/* Pollinations API Key */}
          <div className="pt-2 border-t border-zinc-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-purple-400" />
                <span>{t.pollinationsKeyTitle}</span>
              </label>
              <a
                href="https://enter.pollinations.ai/keys"
                target="_blank"
                rel="noreferrer noopener"
                className="text-[11px] text-purple-400 hover:text-purple-300 underline font-medium"
              >
                enter.pollinations.ai/keys ↗
              </a>
            </div>
            <input
              type="password"
              value={current.pollinationsApiKey || ''}
              onChange={(e) => setCurrent({ ...current, pollinationsApiKey: e.target.value })}
              placeholder={t.pollinationsKeyPlaceholder}
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            <p className="text-[10px] text-zinc-500 mt-1">
              {t.pollinationsKeyHelp}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-900/30 transition-all"
          >
            {t.saveSettings}
          </button>
        </div>
      </div>
    </div>
  );
};
