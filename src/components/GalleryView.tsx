import React, { useState, useMemo } from 'react';
import { 
  Share2, 
  Play, 
  Grid, 
  Columns, 
  SlidersHorizontal, 
  Download, 
  ExternalLink, 
  Eye, 
  Calendar, 
  User as UserIcon, 
  HardDrive, 
  Search,
  Sparkles,
  Camera,
  Layers,
  Lock,
  ArrowRight
} from 'lucide-react';
import { GalleryConfig, DriveFile, GalleryLayout } from '../types/gallery';
import { getOptimizedDriveUrl, getDriveDownloadUrl, getDriveViewUrl, formatBytes, formatDate } from '../lib/driveApi';
import { Lightbox } from './Lightbox';
import { ShareModal } from './ShareModal';

interface GalleryViewProps {
  gallery: GalleryConfig;
  onBack?: () => void;
  onEdit?: (gallery: GalleryConfig) => void;
  isOwner?: boolean;
  onCreateYourOwn?: () => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  gallery,
  onBack,
  onEdit,
  isOwner = false,
  onCreateYourOwn,
}) => {
  const [activeLayout, setActiveLayout] = useState<GalleryLayout>(gallery.layout || 'masonry');
  const [columns, setColumns] = useState<number>(gallery.columns || 3);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(!gallery.password);
  const [passwordError, setPasswordError] = useState(false);

  // Filter photos by search query
  const filteredPhotos = useMemo(() => {
    if (!searchQuery.trim()) return gallery.photos;
    const q = searchQuery.toLowerCase();
    return gallery.photos.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.customTitle?.toLowerCase().includes(q) ||
        p.customCaption?.toLowerCase().includes(q)
    );
  }, [gallery.photos, searchQuery]);

  // Handle password unlock
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (gallery.password && enteredPassword === gallery.password) {
      setIsUnlocked(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  // Find cover photo
  const coverPhoto = gallery.photos.find((p) => p.id === gallery.coverPhotoId) || gallery.photos[0];
  const coverUrl = coverPhoto ? getOptimizedDriveUrl(coverPhoto, 2000) : '';

  // Theme styling classes
  const themeClasses = {
    default: 'bg-slate-50 text-slate-900',
    dark: 'bg-slate-950 text-slate-100',
    cinematic: 'bg-zinc-950 text-zinc-100',
    warm: 'bg-stone-50 text-stone-900',
    minimal: 'bg-white text-slate-900',
  }[gallery.theme || 'default'];

  const cardBgClasses = {
    default: 'bg-white border-slate-200 shadow-sm hover:shadow-md text-slate-900',
    dark: 'bg-slate-900/80 border-slate-800 shadow-lg text-slate-100',
    cinematic: 'bg-zinc-900/90 border-zinc-800 shadow-xl text-zinc-100',
    warm: 'bg-amber-50/50 border-amber-200/60 shadow-sm text-stone-900',
    minimal: 'bg-slate-50/50 border-slate-100 shadow-none hover:shadow-sm text-slate-900',
  }[gallery.theme || 'default'];

  // Check if locked
  if (gallery.password && !isUnlocked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-display font-bold text-2xl text-slate-900">
              Protected Gallery
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              "{gallery.title}" requires a passcode to view.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <input
                type="password"
                value={enteredPassword}
                onChange={(e) => {
                  setEnteredPassword(e.target.value);
                  setPasswordError(false);
                }}
                placeholder="Enter passcode"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                autoFocus
              />
              {passwordError && (
                <p className="text-xs text-red-500 mt-1.5 font-medium">
                  Incorrect passcode. Please check with the gallery creator.
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md hover:shadow-lg"
            >
              Unlock Gallery
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses} transition-colors pb-24`}>
      {/* Hero Header Section */}
      <div className="relative overflow-hidden border-b border-black/10">
        {/* Cover backdrop image with blur */}
        {coverUrl && (
          <div className="absolute inset-0 z-0">
            <img
              src={coverUrl}
              alt={gallery.title}
              className="w-full h-full object-cover scale-110 blur-2xl opacity-25 brightness-75"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-inherit via-inherit/80 to-transparent" />
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            {/* Title & Metadata */}
            <div className="max-w-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-500">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Google Drive Photo Album</span>
                <span>•</span>
                <span>{gallery.photos.length} Photos</span>
              </div>

              <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight">
                {gallery.title}
              </h1>

              {gallery.subtitle && (
                <p className="text-base sm:text-lg opacity-85 leading-relaxed font-light">
                  {gallery.subtitle}
                </p>
              )}

              {gallery.description && (
                <p className="text-xs sm:text-sm opacity-70 leading-relaxed max-w-xl">
                  {gallery.description}
                </p>
              )}

              {/* Creator Pill */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs opacity-75">
                <div className="flex items-center gap-2">
                  {gallery.creatorAvatar ? (
                    <img
                      src={gallery.creatorAvatar}
                      alt={gallery.creatorName || 'Creator'}
                      className="w-6 h-6 rounded-full object-cover border border-white/20"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                      {gallery.creatorName ? gallery.creatorName[0].toUpperCase() : 'U'}
                    </div>
                  )}
                  <span className="font-medium">
                    Curated by {gallery.creatorName || 'Google Drive User'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(gallery.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Action Bar (Share, Slideshow, Edit) */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setSelectedPhotoIndex(0)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-semibold shadow-md shadow-indigo-600/20 hover:shadow-lg transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Slideshow
              </button>

              <button
                onClick={() => setIsShareModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/90 dark:bg-zinc-800/90 text-slate-800 dark:text-zinc-100 hover:bg-white dark:hover:bg-zinc-700 border border-slate-200/80 dark:border-zinc-700 rounded-2xl text-xs font-semibold shadow-xs transition-all"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-500" />
                Share Link & QR
              </button>

              {isOwner && onEdit && (
                <button
                  onClick={() => onEdit(gallery)}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 rounded-2xl text-xs font-medium transition-colors"
                >
                  Edit Album
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Controls (Layout, Columns, Search) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-200/50 dark:border-zinc-800/80">
          {/* Layout switches */}
          <div className="flex items-center gap-1.5 bg-slate-200/50 dark:bg-zinc-900 p-1 rounded-2xl border border-slate-200/60 dark:border-zinc-800 text-xs font-medium">
            <button
              onClick={() => setActiveLayout('masonry')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeLayout === 'masonry'
                  ? 'bg-white dark:bg-zinc-800 shadow-xs text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              Masonry
            </button>
            <button
              onClick={() => setActiveLayout('grid')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeLayout === 'grid'
                  ? 'bg-white dark:bg-zinc-800 shadow-xs text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setActiveLayout('justified')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeLayout === 'justified'
                  ? 'bg-white dark:bg-zinc-800 shadow-xs text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              Feed
            </button>
          </div>

          {/* Right: Search & Column selector */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Search within album */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
              <input
                type="text"
                placeholder="Search photos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Column count (desktop only) */}
            <div className="hidden lg:flex items-center gap-1 text-xs opacity-80 bg-slate-200/50 dark:bg-zinc-900 p-1 rounded-xl">
              {[2, 3, 4, 5].map((col) => (
                <button
                  key={col}
                  onClick={() => setColumns(col as any)}
                  className={`w-6 h-6 rounded-lg text-center font-mono text-[11px] transition-colors ${
                    columns === col
                      ? 'bg-white dark:bg-zinc-800 text-indigo-600 font-bold shadow-xs'
                      : 'hover:bg-slate-300/50 dark:hover:bg-zinc-800'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Empty state */}
        {filteredPhotos.length === 0 && (
          <div className="text-center py-20 space-y-3">
            <Layers className="w-12 h-12 mx-auto text-slate-400 opacity-50" />
            <h3 className="text-base font-semibold">No photos match your search</h3>
            <p className="text-xs opacity-60">Try clearing your search query above.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Show all {gallery.photos.length} photos
            </button>
          </div>
        )}

        {/* Photo Display Grid/Masonry */}
        {activeLayout === 'masonry' && (
          <div 
            className="gap-6 pt-6"
            style={{
              columnCount: columns,
              columnGap: '1.5rem',
            }}
          >
            {filteredPhotos.map((photo, idx) => {
              const originalIndex = gallery.photos.findIndex((p) => p.id === photo.id);
              const photoIndex = originalIndex >= 0 ? originalIndex : idx;
              const thumbUrl = getOptimizedDriveUrl(photo, 1000);
              const downloadUrl = photo.directUrl || getDriveDownloadUrl(photo.id);

              return (
                <div
                  key={photo.id || idx}
                  className={`break-inside-avoid mb-6 rounded-2xl overflow-hidden border transition-all duration-300 group hover:-translate-y-1 ${cardBgClasses}`}
                >
                  <div
                    className="relative cursor-pointer overflow-hidden bg-slate-200 dark:bg-zinc-800"
                    onClick={() => setSelectedPhotoIndex(photoIndex)}
                  >
                    <img
                      src={thumbUrl}
                      alt={photo.customTitle || photo.name}
                      loading="lazy"
                      className="w-full h-auto object-cover group-hover:scale-103 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-4 text-white">
                      <div className="flex justify-end gap-1.5">
                        {gallery.enableDownload && (
                          <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={photo.name}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 bg-black/40 hover:bg-black/80 text-white rounded-xl backdrop-blur-md transition-colors"
                            title="Download original"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <span className="p-2 bg-indigo-600/90 text-white rounded-xl backdrop-blur-md">
                          <Eye className="w-3.5 h-3.5" />
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold line-clamp-1">
                          {photo.customTitle || photo.name}
                        </h4>
                        {photo.customCaption && (
                          <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5 font-light">
                            {photo.customCaption}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Optional card footer info if title/caption exists */}
                  {(photo.customTitle || photo.customCaption) && (
                    <div className="p-3.5 space-y-1">
                      {photo.customTitle && (
                        <h4 className="text-xs font-semibold truncate">
                          {photo.customTitle}
                        </h4>
                      )}
                      {photo.customCaption && (
                        <p className="text-[11px] opacity-70 line-clamp-2 leading-relaxed">
                          {photo.customCaption}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Regular Grid Layout */}
        {activeLayout === 'grid' && (
          <div 
            className="grid gap-4 pt-6"
            style={{
              gridTemplateColumns: `repeat(auto-fill, minmax(280px, 1fr))`,
            }}
          >
            {filteredPhotos.map((photo, idx) => {
              const originalIndex = gallery.photos.findIndex((p) => p.id === photo.id);
              const photoIndex = originalIndex >= 0 ? originalIndex : idx;
              const thumbUrl = getOptimizedDriveUrl(photo, 800);

              return (
                <div
                  key={photo.id || idx}
                  onClick={() => setSelectedPhotoIndex(photoIndex)}
                  className={`group relative aspect-4/3 rounded-2xl overflow-hidden cursor-pointer border transition-all duration-300 hover:shadow-lg ${cardBgClasses}`}
                >
                  <img
                    src={thumbUrl}
                    alt={photo.customTitle || photo.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
                    <h4 className="text-xs font-semibold truncate">
                      {photo.customTitle || photo.name}
                    </h4>
                    {photo.customCaption && (
                      <p className="text-[11px] text-slate-300 truncate mt-0.5">
                        {photo.customCaption}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Feed / Justified Layout */}
        {activeLayout === 'justified' && (
          <div className="max-w-3xl mx-auto space-y-12 pt-6">
            {filteredPhotos.map((photo, idx) => {
              const originalIndex = gallery.photos.findIndex((p) => p.id === photo.id);
              const photoIndex = originalIndex >= 0 ? originalIndex : idx;
              const thumbUrl = getOptimizedDriveUrl(photo, 1600);

              return (
                <div
                  key={photo.id || idx}
                  className={`rounded-3xl overflow-hidden border p-4 sm:p-6 space-y-4 ${cardBgClasses}`}
                >
                  <div
                    onClick={() => setSelectedPhotoIndex(photoIndex)}
                    className="cursor-pointer overflow-hidden rounded-2xl"
                  >
                    <img
                      src={thumbUrl}
                      alt={photo.customTitle || photo.name}
                      loading="lazy"
                      className="w-full h-auto max-h-[70vh] object-contain mx-auto rounded-2xl hover:scale-101 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex items-start justify-between gap-4 pt-1">
                    <div className="space-y-1">
                      <h4 className="font-display font-semibold text-base sm:text-lg">
                        {photo.customTitle || photo.name}
                      </h4>
                      {photo.customCaption && (
                        <p className="text-xs sm:text-sm opacity-75 leading-relaxed">
                          {photo.customCaption}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedPhotoIndex(photoIndex)}
                      className="p-2.5 bg-indigo-50 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0 hover:bg-indigo-100 transition-colors"
                      title="View High Res"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Visitor Bottom Callout */}
        <div className="mt-16 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Free Google Drive Gallery Creator
            </span>
            <h3 className="font-display font-bold text-2xl sm:text-3xl text-white leading-tight">
              Share Your Own Photos Straight From Google Drive
            </h3>
            <p className="text-xs sm:text-sm text-indigo-100/80 leading-relaxed">
              Select any photo album or folder in your Google Drive, customize the layout and theme, and get a direct link or QR code to share with friends and clients.
            </p>
            <div className="pt-2">
              <button
                onClick={onCreateYourOwn}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs rounded-2xl shadow-lg transition-all"
              >
                <span>Create Your Own Free Album</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <Lightbox
        photos={gallery.photos}
        currentIndex={selectedPhotoIndex ?? 0}
        isOpen={selectedPhotoIndex !== null}
        onClose={() => setSelectedPhotoIndex(null)}
        onSelectIndex={(newIdx) => setSelectedPhotoIndex(newIdx)}
        enableDownload={gallery.enableDownload}
        showMetadata={gallery.showMetadata}
      />

      {/* Share & QR Modal */}
      <ShareModal
        gallery={gallery}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};
