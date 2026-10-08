import React from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText?: string;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ isOpen, onClose, imageUrl, altText }) => {
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    if (isOpen) {
      setScale(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setScale(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={handleZoomIn}
          className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-white backdrop-blur-md transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-white backdrop-blur-md transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleResetZoom}
          className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-white backdrop-blur-md transition-colors"
          title="Reset Zoom"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <a
          href={imageUrl}
          download={`uzbechigpt-image-${Date.now()}.png`}
          className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white backdrop-blur-md shadow-md shadow-purple-900/30 transition-colors flex items-center gap-1.5 text-xs font-semibold px-3"
          title="Download"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Yuklab olish</span>
        </a>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-white backdrop-blur-md transition-colors ml-2"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div
        className="w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
        onClick={onClose}
      >
        <img
          src={imageUrl}
          alt={altText || 'Generated preview'}
          onClick={(e) => e.stopPropagation()}
          style={{ transform: `scale(${scale})` }}
          className="max-w-[95%] max-h-[90%] object-contain rounded-xl shadow-2xl transition-transform duration-200 select-none"
        />
      </div>

      {altText && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-[90%] sm:max-w-[70%] bg-zinc-900/90 border border-zinc-800 backdrop-blur-md px-4 py-2 rounded-2xl text-xs text-zinc-300 text-center shadow-xl truncate">
          {altText}
        </div>
      )}
    </div>
  );
};
