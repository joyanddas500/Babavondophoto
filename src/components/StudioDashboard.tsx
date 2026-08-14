import React, { useState, useEffect } from 'react';
import { 
  FolderPlus, 
  Settings, 
  RefreshCw, 
  Lock, 
  Copy, 
  ExternalLink, 
  Heart, 
  Trash2, 
  Check, 
  Folder,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { GoogleUser, GalleryConfig, DriveFile, DriveFolder } from '../types/gallery';
import { generateShareUrl, saveGallery, deleteGallery } from '../lib/shareService';
import { fetchDriveFolders, fetchDriveImages } from '../lib/driveApi';

interface StudioDashboardProps {
  user: GoogleUser | null;
  accessToken: string | null;
  onSignIn: () => void;
  savedGalleries: GalleryConfig[];
  onSelectGallery: (gallery: GalleryConfig) => void;
  onRefreshList: () => void;
}

export const StudioDashboard: React.FC<StudioDashboardProps> = ({
  user,
  accessToken,
  onSignIn,
  savedGalleries,
  onSelectGallery,
  onRefreshList,
}) => {
  const [projectName, setProjectName] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const [manualFolderId, setManualFolderId] = useState('');
  const [isManualInput, setIsManualInput] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [taskNotice, setTaskNotice] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  
  // Real Drive folders fetched from Google Drive
  const [driveFolders, setDriveFolders] = useState<DriveFolder[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);

  // Fetch Drive folders when access token is present
  useEffect(() => {
    if (accessToken) {
      setIsLoadingFolders(true);
      fetchDriveFolders(accessToken)
        .then((folders) => {
          setDriveFolders(folders);
          if (folders.length > 0 && !selectedFolderId) {
            setSelectedFolderId(folders[0].id);
          }
        })
        .catch((err) => {
          console.error('Failed to load drive folders for provisioning:', err);
        })
        .finally(() => {
          setIsLoadingFolders(false);
        });
    } else {
      setDriveFolders([]);
    }
  }, [accessToken]);

  // Handle Provision & Sync Gallery
  const handleProvisionGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    setIsProvisioning(true);

    try {
      let photos: DriveFile[] = [];
      const folderToFetch = isManualInput ? manualFolderId.trim() : selectedFolderId;

      // If user is connected to Google Drive and has a folder ID
      if (accessToken && folderToFetch) {
        const result = await fetchDriveImages(accessToken, {
          folderId: folderToFetch === 'root' ? undefined : folderToFetch,
          pageSize: 100,
        });
        photos = result.files;
      }

      const newGallery: GalleryConfig = {
        id: `portal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: projectName.trim(),
        subtitle: 'Curated Exhibition & Client Selection Portal',
        description: 'Select and download curated high-resolution photographs directly.',
        creatorName: user?.name || 'Studio Administrator',
        creatorEmail: user?.email,
        creatorAvatar: user?.picture,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        layout: 'masonry',
        theme: 'default',
        columns: 3,
        enableDownload: true,
        showMetadata: true,
        password: passcode.trim() || undefined,
        photos: photos,
        coverPhotoId: photos[0]?.id,
      };

      // Save to localStorage
      saveGallery(newGallery);
      onRefreshList();

      setTaskNotice(`Gallery for "${newGallery.title}" was successfully created (${photos.length} photos synced).`);
      setProjectName('');
      setPasscode('');
      setManualFolderId('');
    } catch (err: any) {
      console.error('Provision failed:', err);
      alert('Failed to provision gallery: ' + (err.message || 'Unknown error'));
    } finally {
      setIsProvisioning(false);
    }
  };

  // Copy share URL
  const handleCopyUrl = (gallery: GalleryConfig) => {
    const url = generateShareUrl(gallery);
    navigator.clipboard.writeText(url);
    setCopiedId(gallery.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Force Sync single gallery
  const handleForceSync = async (gallery: GalleryConfig) => {
    setSyncingId(gallery.id);
    try {
      if (accessToken) {
        const result = await fetchDriveImages(accessToken, { pageSize: 100 });
        if (result.files.length > 0) {
          gallery.photos = result.files;
          saveGallery(gallery);
          onRefreshList();
        }
      }
      setTimeout(() => {
        setSyncingId(null);
        setTaskNotice(`Gallery "${gallery.title}" has been freshly synchronized with Google Drive.`);
      }, 700);
    } catch (err) {
      setSyncingId(null);
    }
  };

  // Delete gallery
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove the portal "${name}"?`)) {
      deleteGallery(id);
      onRefreshList();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Notice Banner: Task Completed (Dismissible) */}
      {taskNotice && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-4 flex items-center justify-between gap-4 shadow-2xs animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-emerald-950">
                TASK COMPLETED
              </h4>
              <p className="text-xs text-emerald-900/90 font-sans">{taskNotice}</p>
            </div>
          </div>

          <button
            onClick={() => setTaskNotice(null)}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (5 Cols): PROVISION CLIENT GALLERY */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 text-rose-600">
            <FolderPlus className="w-5 h-5" />
            <h3 className="font-cinzel font-bold text-sm sm:text-base tracking-[0.15em] text-stone-900 uppercase">
              PROVISION CLIENT GALLERY
            </h3>
          </div>

          <form onSubmit={handleProvisionGallery} className="space-y-4">
            {/* Field 1: Client/Project Name */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono-code font-bold uppercase tracking-wider text-stone-600">
                CLIENT/PROJECT NAME
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., Williams Wedding Portrait"
                required
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 focus:bg-white transition-all font-sans text-stone-900 placeholder:text-stone-400"
              />
            </div>

            {/* Field 2: Google Drive Source Folder */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-mono-code font-bold uppercase tracking-wider text-stone-600">
                  GOOGLE DRIVE SOURCE FOLDER
                </label>
                <button
                  type="button"
                  onClick={() => setIsManualInput(!isManualInput)}
                  className="text-[9px] font-mono-code text-rose-700 hover:text-rose-900 uppercase font-bold"
                >
                  {isManualInput ? 'Select from list' : 'Enter Folder ID'}
                </button>
              </div>

              {isManualInput ? (
                <input
                  type="text"
                  value={manualFolderId}
                  onChange={(e) => setManualFolderId(e.target.value)}
                  placeholder="Paste Google Drive Folder ID or URL"
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 focus:bg-white transition-all font-sans text-stone-900 placeholder:text-stone-400"
                />
              ) : (
                <div className="relative">
                  <select
                    value={selectedFolderId}
                    onChange={(e) => setSelectedFolderId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 focus:bg-white transition-all font-sans text-stone-900 appearance-none cursor-pointer"
                  >
                    {driveFolders.length > 0 ? (
                      driveFolders.map((folder) => (
                        <option key={folder.id} value={folder.id}>
                          📁 {folder.name}
                        </option>
                      ))
                    ) : user ? (
                      <option value="root">📁 Entire Google Drive (Root)</option>
                    ) : (
                      <option value="">No Google Drive connected (Click Link Google Drive)</option>
                    )}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-stone-400">
                    <Folder className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}
              <p className="text-[10px] text-stone-400 italic font-sans">
                {isLoadingFolders ? 'Loading folders from Google Drive...' : "The backend sync engine indexes this folder's images."}
              </p>
            </div>

            {/* Field 3: Security Passcode */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-mono-code font-bold uppercase tracking-wider text-stone-600">
                <Lock className="w-3 h-3 text-stone-400" />
                <span>SECURITY PASSCODE (OPTIONAL)</span>
              </div>
              <input
                type="text"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="e.g., smith2026 or 1234"
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 focus:bg-white transition-all font-sans text-stone-900 placeholder:text-stone-400"
              />
              <p className="text-[10px] text-stone-400 italic font-sans">
                Leave blank to allow public access via the secure token link only.
              </p>
            </div>

            {/* Provision Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProvisioning || !projectName.trim()}
                className="w-full py-3.5 px-4 rounded-xl font-cinzel font-bold text-xs uppercase tracking-[0.18em] text-white bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProvisioning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>PROVISIONING & SYNCING...</span>
                  </>
                ) : (
                  <span>PROVISION & SYNC GALLERY</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column (7 Cols): ACTIVE CLIENT PORTALS */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-rose-600">
              <Settings className="w-5 h-5" />
              <h3 className="font-cinzel font-bold text-sm sm:text-base tracking-[0.15em] text-stone-900 uppercase">
                ACTIVE CLIENT PORTALS
              </h3>
            </div>

            <button
              onClick={onRefreshList}
              className="p-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600 transition-colors"
              title="Refresh active portals"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Portals List */}
          {savedGalleries.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-stone-300 bg-[#FAF8F5] space-y-3">
              <ImageIcon className="w-10 h-10 mx-auto text-stone-300 stroke-1" />
              <p className="font-cinzel text-sm font-bold text-stone-700">No active client portals</p>
              <p className="text-xs text-stone-500 max-w-sm mx-auto font-sans">
                Fill in the form on the left to provision and synchronize your first client photo gallery from Google Drive.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedGalleries.map((gallery) => {
                const isSyncing = syncingId === gallery.id;
                const isCopied = copiedId === gallery.id;

                return (
                  <div
                    key={gallery.id}
                    className="rounded-2xl border border-stone-200/80 bg-[#FAF8F5] p-4 sm:p-5 space-y-4 hover:border-stone-300 transition-all shadow-2xs"
                  >
                    {/* Top Row: Title, Lock, Buttons */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-cinzel font-bold text-sm sm:text-base tracking-wider text-stone-900 uppercase">
                            {gallery.title}
                          </span>
                          {gallery.password && (
                            <span className="p-1 bg-stone-200/70 rounded-md text-stone-600" title="Passcode protected">
                              <Lock className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-mono-code text-stone-400 truncate max-w-xs">
                          Portal ID: {gallery.id}
                        </p>
                      </div>

                      {/* Action Badges/Buttons */}
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono-code font-bold uppercase text-rose-600 bg-rose-50 border border-rose-200">
                          <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                          <span>SELECTIONS (0)</span>
                        </span>

                        <button
                          onClick={() => handleCopyUrl(gallery)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono-code font-bold uppercase text-stone-700 bg-white border border-stone-200 hover:bg-stone-100 transition-colors shadow-2xs"
                          title="Copy shareable link"
                        >
                          {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopied ? 'COPIED' : 'COPY URL'}</span>
                        </button>

                        <button
                          onClick={() => onSelectGallery(gallery)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-mono-code font-bold uppercase text-stone-800 bg-white border border-stone-200 hover:bg-stone-100 transition-colors shadow-2xs"
                        >
                          <ExternalLink className="w-3 h-3 text-stone-600" />
                          <span>VISIT</span>
                        </button>
                      </div>
                    </div>

                    {/* Bottom Row: Stats, Force Sync, Delete */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/60 text-[11px] font-mono-code text-stone-500">
                      <div className="flex items-center gap-3">
                        <span>Photos Cached: {gallery.photos.length}</span>
                        {gallery.photos.length > 0 && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 text-[10px]">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            <span>Indexed: {gallery.photos.length}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleForceSync(gallery)}
                          disabled={isSyncing}
                          className="flex items-center gap-1 text-stone-600 hover:text-stone-900 transition-colors font-bold uppercase text-[10px]"
                        >
                          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-rose-600' : ''}`} />
                          <span>{isSyncing ? 'SYNCING...' : 'FORCE SYNC'}</span>
                        </button>

                        <button
                          onClick={() => handleDelete(gallery.id, gallery.title)}
                          className="text-stone-400 hover:text-rose-600 transition-colors"
                          title="Delete portal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
