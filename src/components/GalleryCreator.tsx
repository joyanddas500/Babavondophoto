import React, { useState } from 'react';
import { 
  Plus, 
  Sparkles, 
  Trash2, 
  Star, 
  Share2, 
  Eye, 
  Sliders, 
  LayoutGrid, 
  Palette, 
  Lock, 
  Download, 
  Image as ImageIcon,
  Check,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  HardDrive,
  LogIn
} from 'lucide-react';
import { GoogleUser, GalleryConfig, DriveFile, GalleryLayout, GalleryTheme } from '../types/gallery';
import { DriveBrowser } from './DriveBrowser';
import { getOptimizedDriveUrl } from '../lib/driveApi';
import { saveGallery } from '../lib/shareService';
import { SAMPLE_GALLERIES } from '../lib/sampleData';

interface GalleryCreatorProps {
  user: GoogleUser | null;
  accessToken: string | null;
  onSignIn: () => void;
  onGalleryCreated: (gallery: GalleryConfig) => void;
  initialGallery?: GalleryConfig | null;
  onOpenGoogleConsoleModal?: () => void;
}

export const GalleryCreator: React.FC<GalleryCreatorProps> = ({
  user,
  accessToken,
  onSignIn,
  onGalleryCreated,
  initialGallery,
}) => {
  // Wizard steps: 'select-photos' -> 'customize' -> 'preview-share'
  const [currentStep, setCurrentStep] = useState<'select' | 'customize'>(
    initialGallery ? 'customize' : 'select'
  );

  // Gallery form state
  const [title, setTitle] = useState(initialGallery?.title || 'My Summer Adventures');
  const [subtitle, setSubtitle] = useState(
    initialGallery?.subtitle || 'Moments captured and stored in Google Drive'
  );
  const [description, setDescription] = useState(
    initialGallery?.description || ''
  );
  const [layout, setLayout] = useState<GalleryLayout>(initialGallery?.layout || 'masonry');
  const [theme, setTheme] = useState<GalleryTheme>(initialGallery?.theme || 'default');
  const [columns, setColumns] = useState<2 | 3 | 4 | 5>(initialGallery?.columns || 3);
  const [enableDownload, setEnableDownload] = useState(initialGallery?.enableDownload ?? true);
  const [showMetadata, setShowMetadata] = useState(initialGallery?.showMetadata ?? true);
  const [password, setPassword] = useState(initialGallery?.password || '');
  const [coverPhotoId, setCoverPhotoId] = useState<string | undefined>(
    initialGallery?.coverPhotoId
  );
  const [selectedPhotos, setSelectedPhotos] = useState<DriveFile[]>(
    initialGallery?.photos || []
  );

  // Active photo being edited for caption/title in customize tab
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);

  // Toggle single photo selection
  const handleTogglePhoto = (photo: DriveFile) => {
    setSelectedPhotos((prev) => {
      const exists = prev.some((p) => p.id === photo.id);
      if (exists) {
        const next = prev.filter((p) => p.id !== photo.id);
        if (coverPhotoId === photo.id && next.length > 0) {
          setCoverPhotoId(next[0].id);
        }
        return next;
      } else {
        const next = [...prev, photo];
        if (!coverPhotoId) {
          setCoverPhotoId(photo.id);
        }
        return next;
      }
    });
  };

  // Select all photos from current view
  const handleSelectAll = (photos: DriveFile[]) => {
    setSelectedPhotos((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const newItems = photos.filter((p) => !existingIds.has(p.id));
      const combined = [...prev, ...newItems];
      if (!coverPhotoId && combined.length > 0) {
        setCoverPhotoId(combined[0].id);
      }
      return combined;
    });
  };

  // Clear all selections
  const handleClearSelection = () => {
    setSelectedPhotos([]);
    setCoverPhotoId(undefined);
  };

  // Remove photo from selected list
  const handleRemoveSelectedPhoto = (photoId: string) => {
    setSelectedPhotos((prev) => prev.filter((p) => p.id !== photoId));
    if (coverPhotoId === photoId) {
      const remaining = selectedPhotos.filter((p) => p.id !== photoId);
      setCoverPhotoId(remaining.length > 0 ? remaining[0].id : undefined);
    }
  };

  // Reorder photo up/down
  const handleMovePhoto = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === selectedPhotos.length - 1)
    ) {
      return;
    }
    const newPhotos = [...selectedPhotos];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newPhotos[index];
    newPhotos[index] = newPhotos[targetIndex];
    newPhotos[targetIndex] = temp;
    setSelectedPhotos(newPhotos);
  };

  // Update photo caption or title
  const handleUpdatePhotoMeta = (
    photoId: string,
    fields: { customTitle?: string; customCaption?: string }
  ) => {
    setSelectedPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, ...fields } : p))
    );
  };

  // Quick load sample photos if user wants to test before connecting Drive
  const handleLoadSamplePhotos = () => {
    const sample = SAMPLE_GALLERIES[0];
    setSelectedPhotos(sample.photos);
    setCoverPhotoId(sample.photos[0].id);
    setTitle(sample.title);
    setSubtitle(sample.subtitle || '');
    setDescription(sample.description || '');
  };

  // Finalize and Save Gallery
  const handleSaveAndPublish = () => {
    if (selectedPhotos.length === 0) return;

    const galleryId = initialGallery?.id || `gallery-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    const newGallery: GalleryConfig = {
      id: galleryId,
      title: title.trim() || 'Untitled Album',
      subtitle: subtitle.trim(),
      description: description.trim(),
      creatorName: user?.name || 'Google Drive Creator',
      creatorAvatar: user?.picture || undefined,
      creatorEmail: user?.email || undefined,
      createdAt: initialGallery?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      coverPhotoId: coverPhotoId || selectedPhotos[0]?.id,
      layout,
      theme,
      columns,
      enableDownload,
      showMetadata,
      password: password.trim() || undefined,
      photos: selectedPhotos,
    };

    saveGallery(newGallery);
    onGalleryCreated(newGallery);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Studio Header & Stepper */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
            {initialGallery ? 'Edit Google Drive Album' : 'Create New Photo Gallery'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pick photos from your Google Drive, style your gallery, and create a shareable link.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setCurrentStep('select')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              currentStep === 'select'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
              1
            </span>
            <span>Select Photos ({selectedPhotos.length})</span>
          </button>

          <button
            onClick={() => {
              if (selectedPhotos.length > 0) setCurrentStep('customize');
            }}
            disabled={selectedPhotos.length === 0}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              currentStep === 'customize'
                ? 'bg-white text-indigo-600 shadow-xs'
                : selectedPhotos.length === 0
                ? 'opacity-40 cursor-not-allowed text-slate-400'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
              2
            </span>
            <span>Customize & Share</span>
          </button>
        </div>
      </div>

      {/* STEP 1: Select Photos from Drive */}
      {currentStep === 'select' && (
        <div className="space-y-6">
          {!user || !accessToken ? (
            /* Sign in CTA box if not connected */
            <div className="bg-gradient-to-tr from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-indigo-200 rounded-full text-xs font-semibold backdrop-blur-md">
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Google Drive Access</span>
                </div>
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-white">
                  Connect Google Drive to Choose Your Photos
                </h3>
                <p className="text-xs sm:text-sm text-indigo-100/80 leading-relaxed">
                  Sign in with Google to explore your folders and pick any images to generate high-resolution shareable galleries. We only request read-only access to your Drive files.
                </p>
                <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
                  <button
                    onClick={onSignIn}
                    className="gsi-material-button text-xs font-bold py-2.5 px-4 h-11 shadow-lg"
                  >
                    <div className="flex items-center gap-2.5">
                      <svg className="w-4 h-4" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                      </svg>
                      <span>Sign In with Google Drive</span>
                    </div>
                  </button>

                  <button
                    onClick={handleLoadSamplePhotos}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-semibold backdrop-blur-md transition-colors"
                  >
                    Load Sample Photo Set
                  </button>
                </div>
              </div>

              {/* Graphic card */}
              <div className="w-full max-w-xs bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 text-center space-y-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6 text-yellow-300" />
                </div>
                <h4 className="font-semibold text-sm text-white">Instant Sharing</h4>
                <p className="text-[11px] text-indigo-200">
                  Direct share links, automated QR codes, customizable masonry layouts, and fullscreen slideshow viewer.
                </p>
              </div>
            </div>
          ) : (
            /* Drive Browser Component */
            <DriveBrowser
              accessToken={accessToken}
              selectedPhotos={selectedPhotos}
              onTogglePhoto={handleTogglePhoto}
              onSelectAllPhotos={handleSelectAll}
              onClearSelection={handleClearSelection}
              onReAuthenticate={onSignIn}
            />
          )}

          {/* Bottom Floating Bar when photos are selected */}
          {selectedPhotos.length > 0 && (
            <div className="sticky bottom-6 z-30 bg-slate-900 text-white p-4 rounded-3xl shadow-2xl border border-slate-800 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-4 duration-200">
              <div className="flex items-center gap-3 pl-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-xs font-bold">
                  {selectedPhotos.length}
                </div>
                <div>
                  <div className="text-xs font-semibold">Photos Selected</div>
                  <div className="text-[11px] text-slate-400">
                    Ready to style and generate share link
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCurrentStep('customize')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md transition-all"
              >
                <span>Continue to Album Customizer</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Customize Album & Share */}
      {currentStep === 'customize' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Album Content & Photo Ordering */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Info Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-display font-semibold text-slate-900 text-base flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                Album Details
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Album Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Kyoto Trip 2026, Summer Wedding, Portfolio"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subtitle or Tagline
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Highlights from our autumn adventure"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description & Story
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write a brief story or note for visitors..."
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Photos Manager Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-semibold text-slate-900 text-base">
                    Organize Photos ({selectedPhotos.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Reorder items, set cover photo, or add custom captions.
                  </p>
                </div>

                <button
                  onClick={() => setCurrentStep('select')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add More Photos
                </button>
              </div>

              {/* Photo list */}
              <div className="space-y-3 pt-2">
                {selectedPhotos.map((photo, index) => {
                  const isCover = (coverPhotoId || selectedPhotos[0]?.id) === photo.id;
                  const isEditing = editingPhotoId === photo.id;
                  const thumbUrl = getOptimizedDriveUrl(photo, 200);

                  return (
                    <div
                      key={photo.id}
                      className={`p-3 rounded-2xl border transition-all ${
                        isCover
                          ? 'border-indigo-500 bg-indigo-50/30'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Thumbnail */}
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                          <img
                            src={thumbUrl}
                            alt={photo.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {isCover && (
                            <div className="absolute top-1 left-1 bg-indigo-600 text-white p-0.5 rounded-md shadow-xs">
                              <Star className="w-3 h-3 fill-white" />
                            </div>
                          )}
                        </div>

                        {/* Title & Caption preview */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-semibold text-slate-800 truncate">
                              {photo.customTitle || photo.name}
                            </h4>
                            {isCover && (
                              <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                                Cover Photo
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {photo.customCaption || 'No caption added'}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          {/* Set as cover */}
                          <button
                            onClick={() => setCoverPhotoId(photo.id)}
                            className={`p-1.5 rounded-lg text-xs transition-colors ${
                              isCover
                                ? 'text-indigo-600'
                                : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
                            }`}
                            title="Set as Cover Photo"
                          >
                            <Star className={`w-4 h-4 ${isCover ? 'fill-indigo-600' : ''}`} />
                          </button>

                          {/* Move up */}
                          <button
                            onClick={() => handleMovePhoto(index, 'up')}
                            disabled={index === 0}
                            className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-slate-100"
                            title="Move photo up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>

                          {/* Move down */}
                          <button
                            onClick={() => handleMovePhoto(index, 'down')}
                            disabled={index === selectedPhotos.length - 1}
                            className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg hover:bg-slate-100"
                            title="Move photo down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>

                          {/* Edit caption toggle */}
                          <button
                            onClick={() =>
                              setEditingPhotoId(isEditing ? null : photo.id)
                            }
                            className={`px-2 py-1 text-xs font-semibold rounded-lg transition-colors ${
                              isEditing
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isEditing ? 'Done' : 'Caption'}
                          </button>

                          {/* Remove photo */}
                          <button
                            onClick={() => handleRemoveSelectedPhoto(photo.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove photo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Edit caption drawer */}
                      {isEditing && (
                        <div className="mt-3 pt-3 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in duration-150">
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                              Custom Photo Title
                            </label>
                            <input
                              type="text"
                              value={photo.customTitle || ''}
                              onChange={(e) =>
                                handleUpdatePhotoMeta(photo.id, {
                                  customTitle: e.target.value,
                                })
                              }
                              placeholder={photo.name}
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                              Custom Caption / Story
                            </label>
                            <input
                              type="text"
                              value={photo.customCaption || ''}
                              onChange={(e) =>
                                handleUpdatePhotoMeta(photo.id, {
                                  customCaption: e.target.value,
                                })
                              }
                              placeholder="e.g. Sunset over the bay"
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Col: Style, Theme & Publish Controls */}
          <div className="space-y-6">
            {/* Visual Styling Settings */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
              <h3 className="font-display font-semibold text-slate-900 text-base flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-600" />
                Layout & Theme
              </h3>

              {/* Layout style selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Display Layout
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'masonry', label: 'Masonry Flow' },
                    { id: 'grid', label: 'Clean Grid' },
                    { id: 'justified', label: 'Story Feed' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setLayout(item.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                        layout === item.id
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Visual Atmosphere
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'default', label: 'Clean Light', color: 'bg-white border-slate-300' },
                    { id: 'cinematic', label: 'Cinematic Dark', color: 'bg-zinc-950 text-white' },
                    { id: 'warm', label: 'Warm Sunset', color: 'bg-amber-50 border-amber-300' },
                    { id: 'minimal', label: 'Minimalist', color: 'bg-slate-100 border-slate-200' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${
                        theme === t.id
                          ? 'border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-600 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{t.label}</span>
                      <span className={`w-3.5 h-3.5 rounded-full border ${t.color}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Column count */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Grid Columns (Desktop)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 3, 4, 5].map((col) => (
                    <button
                      key={col}
                      onClick={() => setColumns(col as any)}
                      className={`py-2 rounded-xl border text-xs font-mono font-semibold transition-all ${
                        columns === col
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {col} col
                    </button>
                  ))}
                </div>
              </div>

              {/* Feature Toggles */}
              <div className="pt-2 space-y-3 border-t border-slate-100">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      Allow Visitors to Download Photos
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Shows high-res download button
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableDownload}
                    onChange={(e) => setEnableDownload(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      Show Camera EXIF & Details
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Camera make, lens, aperture in lightbox
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showMetadata}
                    onChange={(e) => setShowMetadata(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded"
                  />
                </label>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Optional Passcode Protection
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Leave blank for public link"
                      className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Publish & Generate Link Card */}
            <div className="bg-gradient-to-tr from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
              <div className="space-y-1">
                <h4 className="font-display font-bold text-lg text-white">
                  Publish Gallery
                </h4>
                <p className="text-xs text-indigo-200">
                  Saves your album and generates the instant shareable link and QR code.
                </p>
              </div>

              <button
                onClick={handleSaveAndPublish}
                disabled={selectedPhotos.length === 0}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
              >
                <Share2 className="w-4 h-4" />
                <span>Save Album & Generate Share Link</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
