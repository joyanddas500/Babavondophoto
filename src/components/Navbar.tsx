import React, { useState } from 'react';
import { 
  Images, 
  PlusCircle, 
  FolderHeart, 
  HelpCircle, 
  LogIn, 
  LogOut, 
  User as UserIcon, 
  HardDrive,
  Menu,
  X,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Key
} from 'lucide-react';
import { GoogleUser, ActiveTab } from '../types/gallery';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: GoogleUser | null;
  onSignIn: () => void;
  onSignOut: () => void;
  isLoadingAuth: boolean;
  savedGalleriesCount: number;
  onOpenDeployGuide: () => void;
  onOpenGoogleConsoleModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onSignIn,
  onSignOut,
  isLoadingAuth,
  savedGalleriesCount,
  onOpenDeployGuide,
  onOpenGoogleConsoleModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('explore')}
              className="flex items-center gap-2.5 group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Images className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-bold text-slate-900 text-lg tracking-tight">
                    BABAVONDOPHOTO
                  </span>
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-indigo-200/50">
                    GCP Direct
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Share Google Drive Photo Albums
                </p>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('explore')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'explore'
                    ? 'bg-slate-100 text-indigo-600 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Featured Demos
              </button>

              <button
                onClick={() => setActiveTab('create')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'create'
                    ? 'bg-indigo-50 text-indigo-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
                Create Gallery
              </button>

              <button
                onClick={() => setActiveTab('my-galleries')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'my-galleries'
                    ? 'bg-slate-100 text-indigo-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FolderHeart className="w-3.5 h-3.5" />
                My Albums
                {savedGalleriesCount > 0 && (
                  <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {savedGalleriesCount}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-2.5">
            {/* Google Console Credentials & Vercel Deploy Guide Button */}
            <button
              onClick={onOpenGoogleConsoleModal}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-indigo-700 hover:text-indigo-900 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200/70 transition-colors"
              title="Configure Google Cloud Console Client ID"
            >
              <Key className="w-3.5 h-3.5 text-indigo-600" />
              <span>Google Console Settings</span>
            </button>

            <button
              onClick={onOpenDeployGuide}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition-colors"
              title="View GitHub & Vercel deployment guide"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Deploy Guide</span>
            </button>

            {/* Auth Button or User Profile */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
                >
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name || 'Google Account'}
                      className="w-7 h-7 rounded-lg object-cover ring-2 ring-indigo-500/20"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                      {user.name ? user.name[0].toUpperCase() : 'G'}
                    </div>
                  )}
                  <div className="text-left hidden sm:block max-w-[120px]">
                    <div className="text-xs font-semibold text-slate-800 truncate">
                      {user.name || 'Connected'}
                    </div>
                    <div className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Drive Linked
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserDropdownOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {user.name || 'Google User'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {user.email || 'Google Drive connected'}
                        </p>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setActiveTab('create');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-indigo-600" />
                          New Gallery from Drive
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('my-galleries');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <FolderHeart className="w-3.5 h-3.5 text-indigo-600" />
                          My Albums ({savedGalleriesCount})
                        </button>
                        <button
                          onClick={() => {
                            onOpenGoogleConsoleModal();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-indigo-700 hover:bg-indigo-50 flex items-center gap-2 font-medium"
                        >
                          <Key className="w-3.5 h-3.5 text-indigo-600" />
                          Google Console Client ID
                        </button>
                        <button
                          onClick={() => {
                            onOpenDeployGuide();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                          Vercel & GitHub Guide
                        </button>
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={() => {
                            onSignOut();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Disconnect Google Drive
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={onSignIn}
                disabled={isLoadingAuth}
                className="gsi-material-button text-xs font-semibold py-1.5 px-3 h-9"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isLoadingAuth ? 'Connecting...' : 'Sign In with Drive'}</span>
                </div>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 md:hidden rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200/80 space-y-1 animate-in slide-in-from-top-2 duration-150">
            <button
              onClick={() => {
                setActiveTab('explore');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                activeTab === 'explore' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700'
              }`}
            >
              Featured Demos
            </button>
            <button
              onClick={() => {
                setActiveTab('create');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                activeTab === 'create' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              Create Gallery
            </button>
            <button
              onClick={() => {
                setActiveTab('my-galleries');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${
                activeTab === 'my-galleries' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <FolderHeart className="w-4 h-4" />
                My Albums
              </span>
              {savedGalleriesCount > 0 && (
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {savedGalleriesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                onOpenGoogleConsoleModal();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-indigo-600 flex items-center gap-2"
            >
              <Key className="w-4 h-4 text-indigo-500" />
              Google Console Client ID Setup
            </button>
            <button
              onClick={() => {
                onOpenDeployGuide();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-600 flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-slate-500" />
              Vercel & GitHub Deploy Guide
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

