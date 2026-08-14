import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FolderOpen, 
  Search, 
  CheckCircle2, 
  Circle, 
  HardDrive, 
  RefreshCw, 
  ChevronRight, 
  Home, 
  AlertCircle,
  Image as ImageIcon,
  CheckCheck,
  XSquare,
  Sparkles
} from 'lucide-react';
import { DriveFile, DriveFolder } from '../types/gallery';
import { fetchDriveImages, fetchDriveFolders, getOptimizedDriveUrl, formatBytes, formatDate } from '../lib/driveApi';

interface DriveBrowserProps {
  accessToken: string;
  selectedPhotos: DriveFile[];
  onTogglePhoto: (photo: DriveFile) => void;
  onSelectAllPhotos: (photos: DriveFile[]) => void;
  onClearSelection: () => void;
  onReAuthenticate: () => void;
}

export const DriveBrowser: React.FC<DriveBrowserProps> = ({
  accessToken,
  selectedPhotos,
  onTogglePhoto,
  onSelectAllPhotos,
  onClearSelection,
  onReAuthenticate,
}) => {
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [photos, setPhotos] = useState<DriveFile[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [breadcrumb, setBreadcrumb] = useState<{ id: string; name: string }[]>([
    { id: 'root', name: 'My Drive' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load photos and folders for current location
  const loadContent = async (folderId: string = currentFolderId, search: string = searchTerm) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // 1. Fetch folders (only if not searching)
      if (!search.trim()) {
        const folderList = await fetchDriveFolders(accessToken, folderId);
        setFolders(folderList);
      } else {
        setFolders([]);
      }

      // 2. Fetch images
      const imageResult = await fetchDriveImages(accessToken, {
        folderId: search.trim() ? undefined : folderId,
        searchTerm: search,
        pageSize: 40,
      });

      setPhotos(imageResult.files);
      setNextPageToken(imageResult.nextPageToken);
    } catch (err: any) {
      console.error('Drive load error:', err);
      if (err.message?.includes('expired') || err.message?.includes('401')) {
        setErrorMessage('Google Drive authorization has expired. Please re-authenticate.');
      } else {
        setErrorMessage(err.message || 'Failed to load Google Drive content');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadContent(currentFolderId, searchTerm);
    }
  }, [accessToken, currentFolderId]);

  const handleNavigateToFolder = (folder: DriveFolder) => {
    setCurrentFolderId(folder.id);
    setBreadcrumb((prev) => [...prev, { id: folder.id, name: folder.name }]);
    setSearchTerm('');
  };

  const handleBreadcrumbClick = (index: number) => {
    const target = breadcrumb[index];
    setBreadcrumb((prev) => prev.slice(0, index + 1));
    setCurrentFolderId(target.id);
    setSearchTerm('');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadContent(currentFolderId, searchTerm);
  };

  const handleLoadMore = async () => {
    if (!nextPageToken || isLoading) return;
    setIsLoading(true);
    try {
      const result = await fetchDriveImages(accessToken, {
        folderId: searchTerm.trim() ? undefined : currentFolderId,
        searchTerm,
        pageSize: 40,
        pageToken: nextPageToken,
      });
      setPhotos((prev) => [...prev, ...result.files]);
      setNextPageToken(result.nextPageToken);
    } catch (err: any) {
      console.error('Load more error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedIds = new Set(selectedPhotos.map((p) => p.id));

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Header Search & Breadcrumb Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1 text-xs overflow-x-auto py-1">
            {breadcrumb.map((item, idx) => (
              <React.Fragment key={item.id}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                <button
                  onClick={() => handleBreadcrumbClick(idx)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
                    idx === breadcrumb.length - 1
                      ? 'bg-white text-indigo-600 font-semibold shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {idx === 0 ? <Home className="w-3 h-3 text-indigo-500" /> : <Folder className="w-3 h-3 text-amber-500" />}
                  <span>{item.name}</span>
                </button>
              </React.Fragment>
            ))}
          </nav>

          {/* Refresh button */}
          <button
            onClick={() => loadContent(currentFolderId, searchTerm)}
            disabled={isLoading}
            className="self-end sm:self-auto p-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs transition-colors shrink-0 flex items-center gap-1.5"
            title="Refresh Drive photos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Search & Bulk Selection Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search images in Google Drive..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
          </form>

          {/* Bulk Selection Controls */}
          {photos.length > 0 && (
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
              <button
                type="button"
                onClick={() => onSelectAllPhotos(photos)}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl transition-colors flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Select All ({photos.length})
              </button>

              {selectedPhotos.length > 0 && (
                <button
                  type="button"
                  onClick={onClearSelection}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center gap-1"
                >
                  <XSquare className="w-3.5 h-3.5" />
                  Clear Selection
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Error state */}
      {errorMessage && (
        <div className="m-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={onReAuthenticate}
            className="px-3 py-1.5 bg-amber-600 text-white font-semibold rounded-xl text-xs shrink-0 hover:bg-amber-700 transition-colors"
          >
            Reconnect Drive
          </button>
        </div>
      )}

      {/* Main Drive View Container */}
      <div className="p-5 overflow-y-auto max-h-[580px] space-y-6">
        {/* Folders List (if any) */}
        {!searchTerm && folders.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-amber-500" />
              Folders ({folders.length})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => handleNavigateToFolder(folder)}
                  className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-200/80 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-200 text-left transition-all group"
                >
                  <div className="p-2 bg-amber-100/70 text-amber-600 rounded-xl group-hover:scale-105 transition-transform">
                    <Folder className="w-4 h-4 fill-amber-400" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-600">
                      {folder.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">Open folder</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Photos Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
              Photos in this location ({photos.length})
            </h4>
            {selectedPhotos.length > 0 && (
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/60">
                {selectedPhotos.length} selected for album
              </span>
            )}
          </div>

          {/* Loading indicator */}
          {isLoading && photos.length === 0 && (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-500">Scanning Google Drive photos...</p>
            </div>
          )}

          {/* No photos found */}
          {!isLoading && photos.length === 0 && (
            <div className="py-12 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 p-6 space-y-2">
              <HardDrive className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-medium text-slate-700">No image files found in this folder</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Navigate into subfolders above or search by file name to locate your photos in Google Drive.
              </p>
            </div>
          )}

          {/* Photo grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {photos.map((photo) => {
              const isSelected = selectedIds.has(photo.id);
              const thumbUrl = getOptimizedDriveUrl(photo, 400);

              return (
                <div
                  key={photo.id}
                  onClick={() => onTogglePhoto(photo)}
                  className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <img
                    src={thumbUrl}
                    alt={photo.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />

                  {/* Selection badge */}
                  <div className="absolute top-2 right-2 z-10">
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md">
                        <CheckCircle2 className="w-5 h-5 fill-white text-indigo-600" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-black/40 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
                        <Circle className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Photo details overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end">
                    <div className="text-[11px] font-semibold truncate">{photo.name}</div>
                    <div className="text-[9px] text-slate-300 flex justify-between">
                      <span>{formatBytes(photo.size)}</span>
                      <span>{formatDate(photo.createdTime)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {nextPageToken && (
            <div className="text-center pt-6">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
              >
                {isLoading ? 'Loading more...' : 'Load More Drive Photos'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
