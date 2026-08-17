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
  fetchSavedGalleries,
  fetchGalleryById,
  findGalleryById,
  saveGallery 
} from './lib/shareService';
import { Navbar } from './components/Navbar';
import { StudioDashboard } from './components/StudioDashboard';
import { GalleryView } from './components/GalleryView';
import { GoogleConsoleModal } from './components/GoogleConsoleModal';
import { RefreshCw, AlertCircle } from 'lucide-react';

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
  const [isLoadingClientLink, setIsLoadingClientLink] = useState(false);
  const [clientLinkError, setClientLinkError] = useState<string | null>(null);

  // Refresh saved galleries list from server and local storage
  const refreshSavedGalleries = useCallback(async () => {
    try {
      const list = await fetchSavedGalleries();
      setSavedGalleries(list);
    } catch (err) {
      console.error('Failed to load saved galleries:', err);
    }
  }, []);

  // 1. Check for shared gallery in URL on initial mount
  useEffect(() => {
    refreshSavedGalleries();

    const parseUrlForGallery = async () => {
      const params = new URLSearchParams(window.location.search);
      
      // Case A: Ultra-compact self-contained portal token (?p=...)
      const pParam = params.get('p');
      if (pParam) {
        setIsDirectClientLink(true);
        const decoded = decodeGalleryFromUrl(pParam);
        if (decoded) {
          setActiveGallery(decoded);
          setActiveTab('view-gallery');
          setClientLinkError(null);
        } else {
          setClientLinkError('Invalid or corrupted photo portal link.');
        }
        return;
      }

      // Case B: Legacy/Direct compressed parameter (?gallery=...)
      const galleryParam = params.get('gallery');
      if (galleryParam) {
        setIsDirectClientLink(true);
        const decoded = decodeGalleryFromUrl(galleryParam);
        if (decoded) {
          setActiveGallery(decoded);
          setActiveTab('view-gallery');
          setClientLinkError(null);
        } else {
          setClientLinkError('Invalid or corrupted photo portal link.');
        }
        return;
      }

      // Case C: Legacy hash format (#gallery=...)
      const hash = window.location.hash;
      if (hash.startsWith('#gallery=')) {
        setIsDirectClientLink(true);
        const encoded = hash.replace('#gallery=', '');
        const decoded = decodeGalleryFromUrl(encoded);
        if (decoded) {
          setActiveGallery(decoded);
          setActiveTab('view-gallery');
          setClientLinkError(null);
        } else {
          setClientLinkError('Invalid or corrupted photo portal link.');
        }
        return;
      }

      // Case D: Server ID lookup (?id=...)
      const idParam = params.get('id');
      if (idParam) {
        setIsDirectClientLink(true);
        setIsLoadingClientLink(true);
        setClientLinkError(null);

        try {
          // Check local cache first
          const cached = findGalleryById(idParam);
          if (cached) {
            setActiveGallery(cached);
            setActiveTab('view-gallery');
            setIsLoadingClientLink(false);
            return;
          }

          // Then server
          const gallery = await fetchGalleryById(idParam);
          if (gallery) {
            setActiveGallery(gallery);
            setActiveTab('view-gallery');
          } else {
            setClientLinkError('This photo portal could not be found or has expired.');
          }
        } catch (err) {
          setClientLinkError('Unable to load photo portal. Please check your connection.');
        } finally {
          setIsLoadingClientLink(false);
        }
        return;
      }
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

  // ================= CLIENT DIRECT VIEW ISOLATION =================
  // If a guest arrives via a shared link (?p=... or ?id=...), show ONLY client view or loading/error
  if (isDirectClientLink) {
    if (isLoadingClientLink) {
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#FAF8F5] text-stone-900">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shadow-xs">
              <RefreshCw className="w-6 h-6 animate-spin text-rose-600" />
            </div>
            <div className="space-y-1">
              <h2 className="font-cinzel text-lg font-bold tracking-[0.15em] text-stone-900 uppercase">
                BABAVONDOPICTURE
              </h2>
              <p className="text-xs text-stone-500 font-mono-code uppercase tracking-wider">
                Connecting to private photo portal...
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (clientLinkError || !activeGallery) {
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#FAF8F5] text-stone-900">
          <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 p-8 text-center space-y-5 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 text-rose-600 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="font-cinzel text-lg font-bold text-stone-900 uppercase tracking-wider">
                Portal Not Found
              </h3>
              <p className="text-xs text-stone-600 font-sans leading-relaxed">
                {clientLinkError || 'This photo portal could not be found or has expired. Please contact the studio for an updated link.'}
              </p>
            </div>
            <button
              onClick={() => {
                window.location.href = window.location.origin + window.location.pathname;
              }}
              className="px-6 py-2.5 rounded-xl font-cinzel font-bold text-xs uppercase tracking-wider text-white bg-stone-900 hover:bg-stone-800 transition-colors"
            >
              Return to Studio Home
            </button>
          </div>
        </div>
      );
    }

    return (
      <GalleryView
        gallery={activeGallery}
        isOwner={false}
        isDirectClientLink={true}
      />
    );
  }

  // ================= ADMIN STUDIO DASHBOARD =================
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'view-gallery') {
            if (window.location.search || window.location.hash) {
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
              if (window.location.search || window.location.hash) {
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
