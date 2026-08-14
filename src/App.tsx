import React, { useState, useEffect, useCallback } from 'react';
import { 
  GalleryConfig, 
  ActiveTab,
  GoogleUser
} from './types/gallery';
import { 
  initAuth, 
  signInWithGoogle, 
  signOutGoogle, 
  getAccessToken,
  getGoogleClientId
} from './lib/googleAuth';
import { 
  decodeGalleryFromUrl, 
  getSavedGalleries, 
  findGalleryById 
} from './lib/shareService';
import { SAMPLE_GALLERIES } from './lib/sampleData';
import { Navbar } from './components/Navbar';
import { ExploreFeatured } from './components/ExploreFeatured';
import { GalleryView } from './components/GalleryView';
import { GalleryCreator } from './components/GalleryCreator';
import { MyGalleries } from './components/MyGalleries';
import { VercelGuideModal } from './components/VercelGuideModal';
import { GoogleConsoleModal } from './components/GoogleConsoleModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('explore');
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [activeGallery, setActiveGallery] = useState<GalleryConfig | null>(null);
  const [editingGallery, setEditingGallery] = useState<GalleryConfig | null>(null);
  const [savedGalleries, setSavedGalleries] = useState<GalleryConfig[]>([]);
  const [isDeployGuideOpen, setIsDeployGuideOpen] = useState(false);
  const [isGoogleConsoleModalOpen, setIsGoogleConsoleModalOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Refresh saved galleries list from local storage
  const refreshSavedGalleries = useCallback(() => {
    const list = getSavedGalleries();
    setSavedGalleries(list);
  }, []);

  // 1. Check for shared gallery in URL hash or query param on initial mount
  useEffect(() => {
    refreshSavedGalleries();

    const parseUrlForGallery = () => {
      // Check hash e.g. #gallery=...
      const hash = window.location.hash;
      if (hash.startsWith('#gallery=')) {
        const encoded = hash.replace('#gallery=', '');
        const decoded = decodeGalleryFromUrl(encoded);
        if (decoded) {
          setActiveGallery(decoded);
          setActiveTab('view-gallery');
          return true;
        }
      }

      // Check query parameter e.g. ?gallery=... or ?id=...
      const params = new URLSearchParams(window.location.search);
      const galleryParam = params.get('gallery');
      if (galleryParam) {
        const decoded = decodeGalleryFromUrl(galleryParam);
        if (decoded) {
          setActiveGallery(decoded);
          setActiveTab('view-gallery');
          return true;
        }
      }

      const idParam = params.get('id');
      if (idParam) {
        const found = findGalleryById(idParam);
        if (found) {
          setActiveGallery(found);
          setActiveTab('view-gallery');
          return true;
        }
      }

      return false;
    };

    parseUrlForGallery();

    const handleHashChange = () => {
      parseUrlForGallery();
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [refreshSavedGalleries]);

  // 2. Initialize Google Auth State
  useEffect(() => {
    const unsubscribe = initAuth((currentUser, token) => {
      setUser(currentUser);
      setAccessToken(token);
    });

    return () => unsubscribe();
  }, []);

  // Handle Google Sign-In with Drive Scope directly via Google Cloud Console
  const handleSignIn = async (customClientId?: string) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const clientId = customClientId || getGoogleClientId();
      if (!clientId) {
        // Prompt user to enter their Google Cloud Console Client ID
        setIsGoogleConsoleModalOpen(true);
        setIsLoadingAuth(false);
        return;
      }

      const result = await signInWithGoogle(clientId);
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
      }
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      const msg = err.message || '';
      if (msg.includes('MISSING_CLIENT_ID')) {
        setIsGoogleConsoleModalOpen(true);
      } else {
        setAuthError(msg || 'Google Drive authorization failed. Please check your Google Cloud Console Client ID and origins.');
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  // Handle Sign-Out
  const handleSignOut = async () => {
    await signOutGoogle();
    setUser(null);
    setAccessToken(null);
  };

  // When a user selects a gallery to view
  const handleSelectGallery = (gallery: GalleryConfig) => {
    setActiveGallery(gallery);
    setActiveTab('view-gallery');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When a user edits a gallery
  const handleEditGallery = (gallery: GalleryConfig) => {
    setEditingGallery(gallery);
    setActiveTab('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // When a new gallery is created/saved
  const handleGalleryCreated = (gallery: GalleryConfig) => {
    refreshSavedGalleries();
    setActiveGallery(gallery);
    setEditingGallery(null);
    setActiveTab('view-gallery');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Start new gallery creation
  const handleStartCreate = () => {
    setEditingGallery(null);
    setActiveTab('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'view-gallery') {
            // clear hash if user navigates back to explore/create
            if (window.location.hash) {
              history.pushState(null, '', window.location.pathname);
            }
          }
        }}
        user={user}
        onSignIn={() => handleSignIn()}
        onSignOut={handleSignOut}
        isLoadingAuth={isLoadingAuth}
        savedGalleriesCount={savedGalleries.length}
        onOpenDeployGuide={() => setIsDeployGuideOpen(true)}
        onOpenGoogleConsoleModal={() => setIsGoogleConsoleModalOpen(true)}
      />

      {/* Auth Error Banner if any */}
      {authError && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-3 text-xs flex items-center justify-between">
          <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
            <span>{authError}</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsGoogleConsoleModalOpen(true)}
                className="font-bold underline text-indigo-700 ml-4 hover:text-indigo-900"
              >
                Configure Google Client ID
              </button>
              <button
                onClick={() => setAuthError(null)}
                className="font-bold text-slate-600 hover:text-slate-900 ml-2"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Areas */}
      <main className="flex-1">
        {activeTab === 'explore' && (
          <ExploreFeatured
            onSelectGallery={handleSelectGallery}
            onCreateNew={handleStartCreate}
            onOpenDeployGuide={() => setIsDeployGuideOpen(true)}
          />
        )}

        {activeTab === 'create' && (
          <GalleryCreator
            user={user}
            accessToken={accessToken}
            onSignIn={() => handleSignIn()}
            onGalleryCreated={handleGalleryCreated}
            initialGallery={editingGallery}
            onOpenGoogleConsoleModal={() => setIsGoogleConsoleModalOpen(true)}
          />
        )}

        {activeTab === 'my-galleries' && (
          <MyGalleries
            galleries={savedGalleries}
            onSelectGallery={handleSelectGallery}
            onEditGallery={handleEditGallery}
            onCreateNew={handleStartCreate}
            onRefreshList={refreshSavedGalleries}
          />
        )}

        {activeTab === 'view-gallery' && activeGallery && (
          <GalleryView
            gallery={activeGallery}
            onBack={() => setActiveTab('explore')}
            onEdit={handleEditGallery}
            isOwner={true}
            onCreateYourOwn={handleStartCreate}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-slate-800">BABAVONDOPHOTO</span>
            <span>•</span>
            <span>Google Drive Photo Gallery Studio</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsGoogleConsoleModalOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Google Console Setup
            </button>
            <span>•</span>
            <button
              onClick={() => setIsDeployGuideOpen(true)}
              className="text-slate-600 hover:text-slate-900"
            >
              Deploy to Vercel
            </button>
            <span>•</span>
            <button
              onClick={() => {
                setActiveGallery(SAMPLE_GALLERIES[0]);
                setActiveTab('view-gallery');
              }}
              className="text-slate-600 hover:text-slate-900"
            >
              Demo Album
            </button>
          </div>
        </div>
      </footer>

      {/* Google Cloud Console Setup Modal */}
      <GoogleConsoleModal
        isOpen={isGoogleConsoleModalOpen}
        onClose={() => setIsGoogleConsoleModalOpen(false)}
        onConnectWithClientId={(clientId) => handleSignIn(clientId)}
        initialError={authError}
      />

      {/* Vercel & GitHub Deployment Guide Modal */}
      <VercelGuideModal
        isOpen={isDeployGuideOpen}
        onClose={() => setIsDeployGuideOpen(false)}
      />
    </div>
  );
}

