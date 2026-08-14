import React, { useState } from 'react';
import { 
  FolderHeart, 
  Plus, 
  Share2, 
  Eye, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  Calendar, 
  Images, 
  Sparkles,
  ExternalLink,
  QrCode,
  HardDrive
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GalleryConfig } from '../types/gallery';
import { getOptimizedDriveUrl, formatDate } from '../lib/driveApi';
import { generateShareUrl, deleteGallery } from '../lib/shareService';
import { ShareModal } from './ShareModal';

interface MyGalleriesProps {
  galleries: GalleryConfig[];
  onSelectGallery: (gallery: GalleryConfig) => void;
  onEditGallery: (gallery: GalleryConfig) => void;
  onCreateNew: () => void;
  onRefreshList: () => void;
}

export const MyGalleries: React.FC<MyGalleriesProps> = ({
  galleries,
  onSelectGallery,
  onEditGallery,
  onCreateNew,
  onRefreshList,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareModalGallery, setShareModalGallery] = useState<GalleryConfig | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCopyLink = async (gallery: GalleryConfig) => {
    try {
      const url = generateShareUrl(gallery);
      await navigator.clipboard.writeText(url);
      setCopiedId(gallery.id);
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.8 },
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the album "${title}" from your saved galleries?`)) {
      deleteGallery(id);
      onRefreshList();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
              My Created Albums
            </h2>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {galleries.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your Google Drive photo galleries and grab share links anytime.
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Album</span>
        </button>
      </div>

      {/* Empty State */}
      {galleries.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white rounded-3xl border border-dashed border-slate-200 max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
            <FolderHeart className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-lg text-slate-900">
              No albums created yet
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Select any images or folders from your Google Drive to build your first high-res shareable photo gallery.
            </p>
          </div>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Album</span>
          </button>
        </div>
      ) : (
        /* Albums Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map((gallery) => {
            const coverPhoto =
              gallery.photos.find((p) => p.id === gallery.coverPhotoId) ||
              gallery.photos[0];
            const coverUrl = coverPhoto
              ? getOptimizedDriveUrl(coverPhoto, 800)
              : '';

            return (
              <div
                key={gallery.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group"
              >
                {/* Cover Image */}
                <div
                  onClick={() => onSelectGallery(gallery)}
                  className="relative aspect-16/10 bg-slate-100 overflow-hidden cursor-pointer"
                >
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={gallery.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Images className="w-10 h-10" />
                    </div>
                  )}

                  {/* Photo Count Badge */}
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <Images className="w-3 h-3" />
                    <span>{gallery.photos.length} photos</span>
                  </div>

                  {/* Layout/Theme tag */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-2xs">
                    {gallery.layout}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3
                      onClick={() => onSelectGallery(gallery)}
                      className="font-display font-semibold text-slate-900 text-base line-clamp-1 cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      {gallery.title}
                    </h3>
                    {gallery.subtitle && (
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {gallery.subtitle}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                      <Calendar className="w-3 h-3" />
                      <span>Created {formatDate(gallery.createdAt)}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {/* Copy link button */}
                      <button
                        onClick={() => handleCopyLink(gallery)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                          copiedId === gallery.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                        }`}
                        title="Copy direct share link"
                      >
                        {copiedId === gallery.id ? (
                          <>
                            <Check className="w-3 h-3" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy Link
                          </>
                        )}
                      </button>

                      {/* Share modal button */}
                      <button
                        onClick={() => setShareModalGallery(gallery)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs transition-colors"
                        title="Share & QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* View button */}
                      <button
                        onClick={() => onSelectGallery(gallery)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                        title="Open Gallery"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Edit button */}
                      <button
                        onClick={() => onEditGallery(gallery)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                        title="Edit Album Settings"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDelete(gallery.id, gallery.title)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Delete Album"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Share Modal */}
      {shareModalGallery && (
        <ShareModal
          gallery={shareModalGallery}
          isOpen={true}
          onClose={() => setShareModalGallery(null)}
        />
      )}
    </div>
  );
};
