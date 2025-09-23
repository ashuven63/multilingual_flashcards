import React from 'react';
import type { ImageStyle } from '../types';
import { playClickSound } from '../services/audioService';

interface ImageStyleModalProps {
  categoryName: string;
  onSelect: (style: ImageStyle) => void;
  onClose: () => void;
}

const ImageStyleModal: React.FC<ImageStyleModalProps> = ({ categoryName, onSelect, onClose }) => {
  const handleSelect = (style: ImageStyle) => {
    playClickSound();
    onSelect(style);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in z-50"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md animate-pop-in">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">Choose Image Style</h2>
        <p className="text-slate-500 text-center mb-6">How do you want the <span className="font-semibold text-slate-600">{categoryName}</span> flashcards to look?</p>
        
        <div className="space-y-4">
          <button
            onClick={() => handleSelect('illustration')}
            className="w-full text-left p-4 rounded-lg border-2 border-transparent hover:border-sky-400 hover:bg-sky-50 transition-all duration-200 group flex items-center gap-4"
          >
            <div className="text-3xl">🎨</div>
            <div>
              <h3 className="font-semibold text-lg text-slate-700">Children's Illustration</h3>
              <p className="text-slate-500 text-sm">Cute and colorful cartoons for kids.</p>
            </div>
          </button>
          
          <button
            onClick={() => handleSelect('realistic')}
            className="w-full text-left p-4 rounded-lg border-2 border-transparent hover:border-sky-400 hover:bg-sky-50 transition-all duration-200 group flex items-center gap-4"
          >
            <div className="text-3xl">📷</div>
            <div>
              <h3 className="font-semibold text-lg text-slate-700">Realistic</h3>
              <p className="text-slate-500 text-sm">High-quality, real-life photos.</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageStyleModal;