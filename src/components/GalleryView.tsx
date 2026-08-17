import React, { useState, useMemo } from 'react';
import { 
  GalleryConfig, 
  DriveFile 
} from '../types/gallery';
import { 
  Heart, 
  Download, 
  Share2, 
  ArrowLeft, 
  Search, 
  Camera, 
  Eye, 
  Facebook, 
  Instagram, 
  Github, 
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { Lightbox } from './Lightbox';
import { ShareModal } from './ShareModal';
import { ClientSelectionsModal } from './ClientSelectionsModal';
import { PasscodeScreen } from './PasscodeScreen';
import { getOptimizedDriveUrl, getDriveDownloadUrl } from '../lib/driveApi';

interface GalleryViewProps {
  gallery: GalleryConfig;
  onBack?: () => void;
  isOwner?: boolean;
  isDirectClientLink?: boolean;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  gallery,
  onBack,
  isOwner = false,
  isDirectClientLink = false,
}) => {
  // State for selections, search, passcode unlock, modals
  const [selectedPhotos, setSelectedPhotos] = useState<DriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSelectionsModalOpen, setIsSelectionsModalOpen] = useState(false);

  // If gallery has a password, start locked unless user already authenticated
  const [isUnlocked, setIsUnlocked] = useState<boolean>(!gallery.password);

  // Fast set lookup for selected photo IDs
  const selectedIds = useMemo(() => {
    return new Set(selectedPhotos.map((p) => p.id));
  }, [selectedPhotos]);

  // Toggle selection
  const handleToggleSelection = (photo: DriveFile, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.has(photo.id)) {
      setSelectedPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    } else {
      setSelectedPhotos((prev) => [...prev, photo]);
    }
  };

  // Filtered photos based on search
  const filteredPhotos = useMemo(() => {
    if (!searchQuery.trim()) return gallery.photos;
    const q = searchQuery.toLowerCase();
    return gallery.photos.filter((p) => p.name.toLowerCase().includes(q));
  }, [gallery.photos, searchQuery]);

  // If password protected and locked, show Passcode Keypad Screen
  if (gallery.password && !isUnlocked) {
    return (
      <PasscodeScreen
        gallery={gallery}
        onUnlockSuccess={() => setIsUnlocked(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans pb-24 selection:bg-rose-500 selection:text-white">
      {/* 1. Header Bar matching BABAVONDOPICTURE Design */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200/90 py-3 px-3 sm:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Project Title & Portal Subtitle */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {/* Show Back button ONLY if studio admin owner mode, never for direct client link */}
            {!isDirectClientLink && onBack && (
              <button
                onClick={onBack}
                className="p-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-600 transition-colors shrink-0"
                title="Back to Studio Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl border border-rose-300/80 bg-rose-50/80 flex items-center justify-center text-rose-600 shadow-2xs shrink-0">
                <Camera className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="font-cinzel font-bold text-stone-900 text-xs sm:text-base tracking-[0.15em] sm:tracking-[0.18em] uppercase truncate block">
                  {gallery.title}
                </span>
                <p className="text-[7.5px] sm:text-[9px] font-bold text-rose-700 tracking-[0.2em] sm:tracking-[0.25em] uppercase truncate">
                  BABAVONDOPICTURE SELECTION PORTAL
                </p>
              </div>
            </div>
          </div>

          {/* Center/Social Links (Visible on both Mobile and Desktop) */}
          <div className="flex items-center gap-1 sm:gap-1.5 text-stone-600 shrink-0">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-full bg-stone-200/70 hover:bg-stone-300/90 flex items-center justify-center text-stone-700 transition-colors"
              title="Facebook"
            >
              <Facebook className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-full bg-stone-200/70 hover:bg-stone-300/90 flex items-center justify-center text-stone-700 transition-colors"
              title="Instagram"
            >
              <Instagram className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-full bg-stone-200/70 hover:bg-stone-300/90 flex items-center justify-center text-stone-700 transition-colors"
              title="GitHub"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://wa.me"
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 rounded-full bg-stone-200/70 hover:bg-stone-300/90 flex items-center justify-center text-stone-700 transition-colors"
              title="WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Right: Selected Counter Button & Share */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white border border-stone-300 rounded-xl text-[10px] sm:text-xs font-mono-code font-bold uppercase text-stone-700 hover:bg-stone-100 transition-colors"
              title="Share portal"
            >
              <Share2 className="w-3.5 h-3.5 text-stone-600" />
              <span className="hidden sm:inline">Share</span>
            </button>

            {/* Lock session back button if passcode enabled */}
            {gallery.password && (
              <button
                onClick={() => setIsUnlocked(false)}
                className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 bg-white border border-stone-200 hover:bg-stone-100 rounded-xl text-[9px] sm:text-[10px] font-mono-code uppercase text-stone-600 transition-colors"
                title="Lock portal"
              >
                <span>Lock</span>
              </button>
            )}

            <button
              onClick={() => setIsSelectionsModalOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white border border-stone-300 hover:border-rose-400 rounded-xl text-[11px] sm:text-xs font-mono-code font-bold uppercase text-stone-800 shadow-2xs hover:shadow-xs transition-all"
            >
              <Heart className={`w-3.5 h-3.5 ${selectedPhotos.length > 0 ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
              <span>
                <span className="hidden xs:inline">SELECTED </span>({selectedPhotos.length})
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section matching Design */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-6 sm:pb-8 text-center space-y-3">
        <span className="text-[10px] sm:text-xs font-mono-code font-bold uppercase tracking-[0.25em] text-[#0d766e]">
          CURATE COLLECTION
        </span>

        <h1 className="font-cinzel text-2xl sm:text-4xl md:text-5xl font-bold tracking-[0.1em] text-stone-900 leading-tight">
          SELECT YOUR{' '}
          <span className="font-serif-luxury italic text-[#0d766e] font-normal">
            EXHIBITION COLLECTION
          </span>
        </h1>

        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans max-w-xl mx-auto">
          Select photos to download them directly to your device, and annotate custom instructions for retouching or printing.
        </p>

        <div className="flex items-center justify-center gap-2 text-[10px] font-mono-code font-bold uppercase tracking-wider text-emerald-700 pt-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SECURE PORTAL ACTIVE</span>
        </div>
      </div>

      {/* 3. Photo Grid Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4">
        {/* Grid Stats & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200/80">
          <span className="text-[11px] font-mono-code font-bold uppercase tracking-wider text-stone-500">
            DISPLAYING {filteredPhotos.length} PHOTOS / CURATED GRID
          </span>

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search photo titles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-rose-500 font-sans"
            />
          </div>
        </div>

        {/* Photos Grid or Empty State */}
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-stone-200 space-y-3">
            <Camera className="w-10 h-10 mx-auto text-stone-300" />
            <h3 className="font-cinzel text-base font-bold text-stone-800">No Photos In This Folder Yet</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Photos uploaded to this Google Drive folder will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 pt-2">
            {filteredPhotos.map((photo, idx) => {
              const isSelected = selectedIds.has(photo.id);
              const thumbUrl = getOptimizedDriveUrl(photo, 1000);
              const downloadUrl = photo.directUrl || getDriveDownloadUrl(photo.id);

              return (
                <div
                  key={photo.id || idx}
                  className="group relative rounded-2xl overflow-hidden border border-stone-200/90 bg-white shadow-2xs hover:shadow-md transition-all flex flex-col cursor-pointer"
                  onClick={() => setSelectedPhotoIndex(idx)}
                >
                  {/* Photo Image Canvas */}
                  <div className="aspect-square relative overflow-hidden bg-stone-100">
                    <img
                      src={thumbUrl}
                      alt={photo.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />

                    {/* Selection Button Badge (Top Right) */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleSelection(photo, e)}
                      className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all ${
                        isSelected
                          ? 'bg-rose-600 text-white shadow-md scale-105'
                          : 'bg-black/40 text-white/80 hover:bg-black/70 hover:text-white'
                      }`}
                      title={isSelected ? 'Remove from selections' : 'Add to selections'}
                    >
                      <Heart className={`w-4 h-4 ${isSelected ? 'fill-white' : ''}`} />
                    </button>

                    {/* Quick Download Button (Top Left) */}
                    <a
                      href={downloadUrl}
                      download={photo.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-2.5 left-2.5 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Download photo"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Dark Bottom Label Bar matching Screenshot */}
                  <div className="bg-[#1C1917] p-3 text-white flex items-center justify-between">
                    <span className="text-[11px] font-mono-code font-bold tracking-wide uppercase truncate">
                      {photo.name}
                    </span>
                    <Eye className="w-3.5 h-3.5 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mobile Footer with Social Links and Studio Brand */}
      <footer className="mt-16 pt-8 pb-4 border-t border-stone-200/80 text-center space-y-4">
        <div className="flex items-center justify-center gap-3 text-stone-600">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-stone-200/70 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition-colors"
            title="Facebook"
          >
            <Facebook className="w-4 h-4" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-stone-200/70 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition-colors"
            title="Instagram"
          >
            <Instagram className="w-4 h-4" />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-stone-200/70 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition-colors"
            title="GitHub"
          >
            <Github className="w-4 h-4" />
          </a>
          <a
            href="https://wa.me"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-stone-200/70 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition-colors"
            title="WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        </div>
        <p className="text-[10px] font-mono-code text-stone-400 uppercase tracking-wider">
          © {new Date().getFullYear()} BABAVONDOPICTURE • HIGH FIDELITY CLIENT EXHIBITION
        </p>
      </footer>

      {/* Lightbox Modal */}
      <Lightbox
        photos={filteredPhotos}
        currentIndex={selectedPhotoIndex ?? 0}
        isOpen={selectedPhotoIndex !== null}
        onClose={() => setSelectedPhotoIndex(null)}
        onSelectIndex={(newIdx) => setSelectedPhotoIndex(newIdx)}
        enableDownload={true}
        showMetadata={true}
      />

      {/* Share Modal */}
      <ShareModal
        gallery={gallery}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Client Selections Review Drawer / Modal */}
      <ClientSelectionsModal
        isOpen={isSelectionsModalOpen}
        onClose={() => setIsSelectionsModalOpen(false)}
        selectedPhotos={selectedPhotos}
        onRemoveSelection={(photoId) => {
          setSelectedPhotos((prev) => prev.filter((p) => p.id !== photoId));
        }}
        gallery={gallery}
      />
    </div>
  );
};
