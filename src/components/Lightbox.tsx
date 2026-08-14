import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  ExternalLink, 
  Info, 
  ZoomIn, 
  ZoomOut, 
  Play, 
  Pause,
  Camera,
  Calendar,
  HardDrive
} from 'lucide-react';
import { DriveFile } from '../types/gallery';
import { getOptimizedDriveUrl, getDriveDownloadUrl, getDriveViewUrl, formatBytes, formatDate } from '../lib/driveApi';

interface LightboxProps {
  photos: DriveFile[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
  enableDownload?: boolean;
  showMetadata?: boolean;
}

export const Lightbox: React.FC<LightboxProps> = ({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onSelectIndex,
  enableDownload = true,
  showMetadata = true,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const currentPhoto = photos[currentIndex];

  const handleNext = useCallback(() => {
    if (photos.length <= 1) return;
    setIsZoomed(false);
    setImageLoaded(false);
    onSelectIndex((currentIndex + 1) % photos.length);
  }, [currentIndex, photos.length, onSelectIndex]);

  const handlePrev = useCallback(() => {
    if (photos.length <= 1) return;
    setIsZoomed(false);
    setImageLoaded(false);
    onSelectIndex((currentIndex - 1 + photos.length) % photos.length);
  }, [currentIndex, photos.length, onSelectIndex]);

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isZoomed) {
          setIsZoomed(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === 'i' || e.key === 'I') {
        setShowInfo((prev) => !prev);
      } else if (e.key === 'z' || e.key === 'Z') {
        setIsZoomed((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isZoomed, handleNext, handlePrev, onClose]);

  // Slideshow timer
  useEffect(() => {
    if (!isPlaying || !isOpen) return;

    const interval = setInterval(() => {
      handleNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying, isOpen, handleNext]);

  // Reset states when current photo changes
  useEffect(() => {
    setIsZoomed(false);
    setImageLoaded(false);
  }, [currentIndex]);

  if (!isOpen || !currentPhoto) return null;

  const highResUrl = getOptimizedDriveUrl(currentPhoto, 2200);
  const downloadUrl = currentPhoto.directUrl || getDriveDownloadUrl(currentPhoto.id);
  const driveViewUrl = getDriveViewUrl(currentPhoto.id);

  const exif = currentPhoto.imageMediaMetadata;
  const hasExif = !!(exif?.cameraMake || exif?.cameraModel || exif?.aperture || exif?.focalLength || exif?.isoSpeed);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col select-none animate-in fade-in duration-150">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        {/* Photo Title & Counter */}
        <div className="text-white max-w-md">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono bg-white/10 px-2.5 py-1 rounded-full text-slate-300 font-medium">
              {currentIndex + 1} / {photos.length}
            </span>
            <h4 className="text-sm font-medium text-white truncate">
              {currentPhoto.customTitle || currentPhoto.name}
            </h4>
          </div>
          {currentPhoto.customCaption && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-1">
              {currentPhoto.customCaption}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 text-slate-300">
          {/* Slideshow button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2.5 rounded-full transition-colors ${
              isPlaying
                ? 'bg-indigo-600 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isPlaying ? 'Pause Slideshow (Space)' : 'Play Slideshow (Space)'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Zoom toggle */}
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className={`p-2.5 rounded-full transition-colors ${
              isZoomed
                ? 'bg-indigo-600 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isZoomed ? 'Zoom Out (Z)' : 'Zoom In (Z)'}
          >
            {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
          </button>

          {/* Info toggle */}
          {showMetadata && (
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`p-2.5 rounded-full transition-colors ${
                showInfo
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="Photo Details (I)"
            >
              <Info className="w-4 h-4" />
            </button>
          )}

          {/* Download button */}
          {enableDownload && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={currentPhoto.name}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              title="Download Photo"
            >
              <Download className="w-4 h-4" />
            </a>
          )}

          {/* Open in Google Drive */}
          {currentPhoto.id && !currentPhoto.id.startsWith('sample-') && (
            <a
              href={driveViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              title="Open original file in Google Drive"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2.5 bg-white/10 hover:bg-red-500/80 text-white rounded-full transition-colors ml-2"
            title="Close Lightbox (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden p-4">
        {/* Navigation Arrow Left */}
        {photos.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3.5 rounded-full bg-black/40 hover:bg-black/80 text-white/90 hover:text-white backdrop-blur-md border border-white/10 transition-all hover:scale-105"
            title="Previous (Left Arrow)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Navigation Arrow Right */}
        {photos.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3.5 rounded-full bg-black/40 hover:bg-black/80 text-white/90 hover:text-white backdrop-blur-md border border-white/10 transition-all hover:scale-105"
            title="Next (Right Arrow)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Center image */}
        <div 
          className={`relative max-w-full max-h-full flex items-center justify-center transition-transform duration-300 ${
            isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-white/20 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={highResUrl}
            alt={currentPhoto.customTitle || currentPhoto.name}
            onLoad={() => setImageLoaded(true)}
            className={`max-w-full max-h-[82vh] object-contain rounded-lg shadow-2xl transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Metadata info side panel */}
        {showInfo && (
          <div className="absolute right-6 top-6 bottom-6 w-80 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-white z-40 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h5 className="font-semibold text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-400" />
                Photo Information
              </h5>
              <button
                onClick={() => setShowInfo(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">File Name</span>
                <span className="font-mono text-slate-200 break-all">{currentPhoto.name}</span>
              </div>

              {currentPhoto.customCaption && (
                <div>
                  <span className="text-slate-400 block mb-1">Caption</span>
                  <p className="text-slate-200 italic">{currentPhoto.customCaption}</p>
                </div>
              )}

              {currentPhoto.createdTime && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Captured / Added: {formatDate(currentPhoto.createdTime)}</span>
                </div>
              )}

              {currentPhoto.size && (
                <div className="flex items-center gap-2 text-slate-300">
                  <HardDrive className="w-4 h-4 text-slate-400" />
                  <span>File Size: {formatBytes(currentPhoto.size)}</span>
                </div>
              )}

              {exif?.width && exif?.height && (
                <div>
                  <span className="text-slate-400 block mb-1">Resolution</span>
                  <span className="text-slate-200 font-mono">
                    {exif.width} × {exif.height} px
                  </span>
                </div>
              )}

              {hasExif && (
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-semibold mb-2">
                    <Camera className="w-4 h-4" />
                    <span>Camera EXIF Data</span>
                  </div>

                  {(exif.cameraMake || exif.cameraModel) && (
                    <div>
                      <span className="text-slate-400 block">Camera</span>
                      <span className="text-slate-200 font-medium">
                        {[exif.cameraMake, exif.cameraModel].filter(Boolean).join(' ')}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-slate-300">
                    {exif.focalLength && (
                      <div className="bg-white/5 p-2 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Focal Length</span>
                        <span>{exif.focalLength}mm</span>
                      </div>
                    )}
                    {exif.aperture && (
                      <div className="bg-white/5 p-2 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Aperture</span>
                        <span>ƒ/{exif.aperture}</span>
                      </div>
                    )}
                    {exif.isoSpeed && (
                      <div className="bg-white/5 p-2 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">ISO</span>
                        <span>{exif.isoSpeed}</span>
                      </div>
                    )}
                    {exif.exposureTime && (
                      <div className="bg-white/5 p-2 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">Shutter</span>
                        <span>
                          {exif.exposureTime < 1
                            ? `1/${Math.round(1 / exif.exposureTime)}s`
                            : `${exif.exposureTime}s`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail Strip at bottom */}
      {photos.length > 1 && (
        <div className="px-6 py-3 bg-black/80 backdrop-blur-md border-t border-white/10 flex items-center justify-center gap-2 overflow-x-auto z-20">
          {photos.map((photo, idx) => (
            <button
              key={photo.id || idx}
              onClick={() => {
                setIsZoomed(false);
                setImageLoaded(false);
                onSelectIndex(idx);
              }}
              className={`relative shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                idx === currentIndex
                  ? 'border-indigo-500 scale-110 shadow-lg'
                  : 'border-transparent opacity-50 hover:opacity-100'
              }`}
            >
              <img
                src={getOptimizedDriveUrl(photo, 160)}
                alt={photo.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
