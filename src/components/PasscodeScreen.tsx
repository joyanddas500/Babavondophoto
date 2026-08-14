import React, { useState } from 'react';
import { Lock, ArrowRight, Delete, Eye, Sparkles } from 'lucide-react';
import { GalleryConfig } from '../types/gallery';
import { getOptimizedDriveUrl } from '../lib/driveApi';

interface PasscodeScreenProps {
  gallery: GalleryConfig;
  onUnlockSuccess: () => void;
}

export const PasscodeScreen: React.FC<PasscodeScreenProps> = ({
  gallery,
  onUnlockSuccess,
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const targetPassword = gallery.password || '';

  const handleKeyPress = (num: string) => {
    if (pin.length < 12) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(false);
      
      // Auto unlock if exact match
      if (nextPin === targetPassword) {
        setTimeout(() => {
          onUnlockSuccess();
        }, 150);
      }
    }
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleManualSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin) return;
    
    if (pin === targetPassword) {
      onUnlockSuccess();
    } else {
      setError(true);
      setErrorMessage('Incorrect passcode. Please check and try again.');
    }
  };

  // Preview photos for floating thumbnails
  const previewPhotos = gallery.photos.slice(0, 4);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-tr from-[#3b82f6] via-[#ec4899] to-[#f97316] relative overflow-hidden selection:bg-rose-500 selection:text-white">
      {/* Background Soft Glow */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-2xs" />

      {/* Main Glass/Ivory Card Container matching Screenshot */}
      <div className="relative z-10 w-full max-w-4xl bg-[#FAF7F2] rounded-3xl sm:rounded-[36px] shadow-2xl border border-white/60 p-6 sm:p-10 lg:p-12 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Photoshoot Cover Showcase with Floating Bubbles */}
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl bg-[#F4EFE6] border-2 border-[#E9DFD0] p-4 flex items-center justify-center shadow-inner">
              
              {/* Center Artwork / Cover */}
              <div className="w-full h-full rounded-2xl overflow-hidden relative flex items-center justify-center bg-[#FAF7F2] border border-stone-200/80">
                {previewPhotos[0] ? (
                  <img
                    src={getOptimizedDriveUrl(previewPhotos[0], 800)}
                    alt={gallery.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-rose-100/80 text-rose-500 flex items-center justify-center">
                      <Lock className="w-6 h-6" />
                    </div>
                    <span className="font-cinzel text-xs font-bold uppercase tracking-wider text-stone-700">
                      {gallery.title}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono-code uppercase">Private Photo Portal</span>
                  </div>
                )}

                {/* Subtle Inner Frame Overlay */}
                <div className="absolute inset-2 border border-white/60 rounded-xl pointer-events-none" />
              </div>

              {/* Floating Orbiting Thumbnails */}
              {previewPhotos[1] && (
                <div className="absolute -top-3 -left-3 w-14 h-14 rounded-2xl border-2 border-white shadow-lg overflow-hidden -rotate-6 bg-stone-200">
                  <img
                    src={getOptimizedDriveUrl(previewPhotos[1], 300)}
                    alt="Preview 1"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {previewPhotos[2] && (
                <div className="absolute -top-2 -right-2 w-14 h-14 rounded-full border-2 border-white shadow-lg overflow-hidden bg-stone-200">
                  <img
                    src={getOptimizedDriveUrl(previewPhotos[2], 300)}
                    alt="Preview 2"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {previewPhotos[3] && (
                <div className="absolute -bottom-2 -left-2 w-13 h-13 rounded-full border-2 border-white shadow-lg overflow-hidden bg-stone-200">
                  <img
                    src={getOptimizedDriveUrl(previewPhotos[3], 300)}
                    alt="Preview 3"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {previewPhotos[0] && (
                <div className="absolute -bottom-3 -right-3 w-14 h-14 rounded-2xl border-2 border-white shadow-lg overflow-hidden rotate-6 bg-stone-200">
                  <img
                    src={getOptimizedDriveUrl(previewPhotos[0], 300)}
                    alt="Preview 4"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>

            {/* Quote / Subtitle Caption */}
            <div className="space-y-1">
              <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-stone-500 uppercase font-mono-code">
                BABAVONDOPICTURE PORTAL
              </p>
              <p className="font-serif-luxury text-stone-700 italic text-sm sm:text-base">
                "Preserving the moments that matter forever."
              </p>
            </div>
          </div>

          {/* Right Column: Pin Code Keypad & Unlock Form */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-1">
              <span className="text-[11px] font-cinzel font-bold tracking-[0.2em] text-stone-600 uppercase">
                WELCOME TO
              </span>
              <h1 className="font-cinzel text-2xl sm:text-3xl font-bold tracking-[0.15em] text-[#0d766e] leading-tight">
                BABAVONDOPICTURE
              </h1>
              <p className="text-xs font-mono-code font-semibold tracking-wider text-stone-500 uppercase pt-0.5">
                PROJECT ID: {gallery.title.toUpperCase()}
              </p>
            </div>

            {/* Passcode Display Box */}
            <div className="bg-[#F4EFE6] border border-[#E5DCD0] rounded-2xl p-4 text-center space-y-2 shadow-2xs">
              <div className="flex items-center justify-center gap-3 py-1">
                {[0, 1, 2, 3].map((idx) => {
                  const isFilled = pin.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                        isFilled
                          ? 'bg-stone-800 border-stone-800 scale-110'
                          : 'border-stone-400/80 bg-transparent'
                      }`}
                    />
                  );
                })}
              </div>
              <p className="text-[10px] tracking-[0.2em] font-mono-code font-bold uppercase text-stone-500">
                ENTER YOUR ENTRY PASSCODE
              </p>
            </div>

            {error && (
              <p className="text-xs text-rose-600 font-medium text-center bg-rose-50 border border-rose-200 py-1.5 px-3 rounded-xl animate-shake">
                {errorMessage}
              </p>
            )}

            {/* Interactive Keypad */}
            <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto w-full">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeyPress(num)}
                  className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-white hover:bg-stone-100 border border-stone-200/90 text-stone-800 font-cinzel text-lg sm:text-xl font-bold flex items-center justify-center shadow-xs hover:shadow-md active:scale-95 transition-all"
                >
                  {num}
                </button>
              ))}

              <button
                type="button"
                onClick={handleClear}
                className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-white/70 hover:bg-white text-stone-600 font-mono-code text-[11px] font-bold uppercase flex items-center justify-center border border-stone-200 active:scale-95 transition-all"
              >
                CLEAR
              </button>

              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-white hover:bg-stone-100 border border-stone-200/90 text-stone-800 font-cinzel text-lg sm:text-xl font-bold flex items-center justify-center shadow-xs hover:shadow-md active:scale-95 transition-all"
              >
                0
              </button>

              <button
                type="button"
                onClick={handleBackspace}
                className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-white/70 hover:bg-white text-stone-600 font-mono-code text-sm font-bold flex items-center justify-center border border-stone-200 active:scale-95 transition-all"
                title="Backspace"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleManualSubmit()}
                disabled={pin.length === 0}
                className="w-full py-3.5 px-6 rounded-2xl font-cinzel font-bold text-sm tracking-[0.15em] uppercase text-white bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 shadow-md hover:shadow-lg active:scale-99 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>ENTER ROOM</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Footer lock note */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono-code font-semibold tracking-wider text-stone-500 uppercase pt-1">
              <Lock className="w-3 h-3 text-stone-400" />
              <span>SECURED STORAGE ACCESS</span>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
