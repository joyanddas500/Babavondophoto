import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Trash2, 
  Heart, 
  Sparkles, 
  Send,
  MessageSquare,
  FileText
} from 'lucide-react';
import { DriveFile, GalleryConfig } from '../types/gallery';
import { getOptimizedDriveUrl, getDriveDownloadUrl } from '../lib/driveApi';

interface ClientSelectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPhotos: DriveFile[];
  onRemoveSelection: (photoId: string) => void;
  gallery: GalleryConfig;
}

export const ClientSelectionsModal: React.FC<ClientSelectionsModalProps> = ({
  isOpen,
  onClose,
  selectedPhotos,
  onRemoveSelection,
  gallery,
}) => {
  const [copied, setCopied] = useState(false);
  const [notes, setNotes] = useState('');
  const [submittedNote, setSubmittedNote] = useState(false);

  if (!isOpen) return null;

  const handleCopyList = () => {
    const names = selectedPhotos.map((p, i) => `${i + 1}. ${p.name}`).join('\n');
    const fullText = `Exhibition Photo Selections for ${gallery.title}:\n\n${names}\n\nClient Notes: ${notes || 'None'}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadAll = () => {
    selectedPhotos.forEach((photo, idx) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = photo.directUrl || getDriveDownloadUrl(photo.id);
        link.download = photo.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, idx * 400);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#FAF8F5] rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <h3 className="font-cinzel font-bold text-stone-900 text-base sm:text-lg">
                Selected Exhibition Photos
              </h3>
              <p className="text-[10px] sm:text-xs font-mono-code text-stone-500 uppercase">
                {selectedPhotos.length} {selectedPhotos.length === 1 ? 'Photo' : 'Photos'} Chosen from {gallery.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {selectedPhotos.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Heart className="w-10 h-10 mx-auto text-stone-300 stroke-1" />
              <p className="font-cinzel text-sm font-bold text-stone-700">No photos selected yet</p>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Click the heart or checkmark icon on any photo in the exhibition grid to add it to your curated selection.
              </p>
            </div>
          ) : (
            <>
              {/* Photos List Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {selectedPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-2xs"
                  >
                    <div className="aspect-square relative bg-stone-100">
                      <img
                        src={getOptimizedDriveUrl(photo, 400)}
                        alt={photo.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        onClick={() => onRemoveSelection(photo.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-rose-600 text-white transition-colors"
                        title="Remove from selections"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-2 bg-stone-900 text-white">
                      <p className="text-[10px] font-mono-code truncate">{photo.name}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Retouching / Printing Note Field */}
              <div className="space-y-2 pt-2">
                <label className="block text-[10px] font-mono-code font-bold uppercase tracking-wider text-stone-600">
                  Retouching / Selection Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Please retouch photo 3 for portrait printing, crop photo 5 to 4:5..."
                  rows={3}
                  className="w-full p-3 text-xs bg-white rounded-2xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-rose-500 font-sans"
                />
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Actions */}
        {selectedPhotos.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-stone-200 bg-white flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleCopyList}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold font-mono-code text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Photo List'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadAll}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-cinzel font-bold text-white bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Selected ({selectedPhotos.length})</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
