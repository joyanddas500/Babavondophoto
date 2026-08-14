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
  getGoogleClientId
} from './lib/googleAuth';
import { 
  decodeGalleryFromUrl, 
  getSavedGalleries, 
  findGalleryById 
} from './lib/shareService';
import { Navbar } from './components/Navbar';
import { StudioDashboard } from './components/StudioDashboard';
import { GalleryView } from './components/GalleryView';
import { GoogleConsoleModal } from './components/GoogleConsoleModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('explore');
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [activeGallery, setActiveGallery] = useState<GalleryConfig | null>(null);
  const [savedGalleries, setSavedGalleries] = useState<GalleryConfig[]>([]);
  const [isGoogleConsoleModalOpen, setIsGoogleConsoleModalOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Track if current visitor arrived via a shared client link (should only see the photo portal, not admin)
  const [isDirectClientLink, setIsDirectClientLink] = useState(false);

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
          setIsDirectClientLink(true);
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
          setIsDirectClientLink(true);
          return true;
        }
      }

      const idParam = params.get('id');
      if (idParam) {
        const found = findGalleryById(idParam);
        if (found) {
          setActiveGallery(found);
          setActiveTab('view-gallery');
          setIsDirectClientLink(true);
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

  // When a studio admin clicks "VISIT" from their dashboard
  const handleSelectGalleryFromAdmin = (gallery: GalleryConfig) => {
    setActiveGallery(gallery);
    setIsDirectClientLink(false); // Admin mode has back button
    setActiveTab('view-gallery');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If a guest arrives via a shared folder link (#gallery=... or ?id=...), render ONLY their secure photo portal
  if (isDirectClientLink && activeGallery) {
    return (
      <GalleryView
        gallery={activeGallery}
        isOwner={false}
        isDirectClientLink={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'view-gallery') {
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
        {activeTab === 'view-gallery' && activeGallery ? (
          <GalleryView
            gallery={activeGallery}
            onBack={() => {
              setActiveTab('explore');
              if (window.location.hash) {
                history.pushState(null, '', window.location.pathname);
              }
            }}
            isOwner={true}
            isDirectClientLink={false}
          />
        ) : (
          <StudioDashboard
            user={user}
            accessToken={accessToken}
            onSignIn={() => handleSignIn()}
            savedGalleries={savedGalleries}
            onSelectGallery={handleSelectGalleryFromAdmin}
            onRefreshList={refreshSavedGalleries}
          />
        )}
      </main>

      {/* Google Cloud Console Setup Modal */}
      <GoogleConsoleModal
        isOpen={isGoogleConsoleModalOpen}
        onClose={() => setIsGoogleConsoleModalOpen(false)}
        onConnectWithClientId={(clientId) => handleSignIn(clientId)}
        initialError={authError}
      />
    </div>
  );
}
