import React, { useState } from 'react';
import { 
  Camera, 
  LogOut, 
  ChevronDown,
  Globe,
  Facebook, 
  Instagram, 
  Github, 
  MessageCircle,
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
  onOpenDeployGuide?: () => void;
  onOpenGoogleConsoleModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onSignIn,
  onSignOut,
  isLoadingAuth,
  savedGalleriesCount,
  onOpenGoogleConsoleModal,
}) => {
  const [websitesDropdownOpen, setWebsitesDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200/90 transition-all">
      <div className="w-full px-3 sm:px-8 py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Brand Identity with Camera Icon */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 min-w-0">
            <button
              onClick={() => setActiveTab('explore')}
              className="flex items-center gap-2.5 sm:gap-3 text-left group min-w-0"
            >
              <div className="w-9 h-9 rounded-xl border border-rose-300/80 bg-rose-50/80 flex items-center justify-center text-rose-600 shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                <Camera className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-cinzel font-bold text-stone-900 text-xs sm:text-base tracking-[0.15em] sm:tracking-[0.18em] leading-tight truncate">
                  BABAVONDOPHOTO
                </span>
                <span className="text-[7.5px] sm:text-[9px] font-bold text-rose-700 tracking-[0.2em] sm:tracking-[0.25em] uppercase mt-0.5 truncate">
                  EXHIBITION CACHE & SELECTION ENGINE
                </span>
              </div>
            </button>

            {/* Subtle Divider */}
            <div className="hidden sm:block h-6 w-px bg-stone-300 shrink-0" />

            {/* Social Links (Visible on Mobile, Tablet & Desktop) */}
            <div className="flex items-center gap-1 sm:gap-1.5 text-stone-600 shrink-0">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-stone-200/70 hover:bg-stone-300/90 flex items-center justify-center text-stone-700 transition-colors"
                title="Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-stone-200/70 hover:bg-stone-300/90 flex items-center justify-center text-stone-700 transition-colors"
                title="Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden xs:flex w-7 h-7 rounded-full bg-stone-200/70 hover:bg-stone-300/90 items-center justify-center text-stone-700 transition-colors"
                title="GitHub"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://wa.me"
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-stone-200/70 hover:bg-stone-300/90 flex items-center justify-center text-stone-700 transition-colors"
                title="Direct Message"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>

              {/* Websites Dropdown */}
              <div className="relative ml-1">
                <button
                  onClick={() => setWebsitesDropdownOpen(!websitesDropdownOpen)}
                  className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-stone-200/70 hover:bg-stone-300/90 text-[10px] font-bold tracking-wider uppercase text-stone-700 transition-colors"
                >
                  <Globe className="w-3 h-3 text-stone-600" />
                  <span className="hidden md:inline">Websites</span>
                  <ChevronDown className="w-3 h-3 text-stone-500" />
                </button>

                {websitesDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-30" 
                      onClick={() => setWebsitesDropdownOpen(false)} 
                    />
                    <div className="absolute left-0 mt-1.5 w-48 bg-white border border-stone-200 rounded-xl shadow-lg py-1.5 z-40 text-xs font-medium text-stone-700">
                      <button
                        onClick={() => {
                          setActiveTab('explore');
                          setWebsitesDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-stone-100 flex items-center justify-between"
                      >
                        <span>Client Portals</span>
                        <span className="text-[10px] text-stone-400">Portals</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('create');
                          setWebsitesDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-stone-100 flex items-center justify-between"
                      >
                        <span>Provision Gallery</span>
                        <span className="text-[10px] text-rose-600 font-bold">+ New</span>
                      </button>
                      {onOpenGoogleConsoleModal && (
                        <button
                          onClick={() => {
                            onOpenGoogleConsoleModal();
                            setWebsitesDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-stone-100 flex items-center gap-1.5 text-indigo-600 border-t border-stone-100"
                        >
                          <Key className="w-3 h-3" />
                          <span>Google Client ID</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Action: User Account & Sign In / Out */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Account Name & Email */}
                <div className="text-right hidden md:block">
                  <div className="text-[11px] font-mono-code font-bold tracking-wider text-stone-900 uppercase truncate max-w-[220px]">
                    {user.name.toUpperCase()} (GOOGLE ACCOUNT)
                  </div>
                  <div className="text-[10px] font-mono-code text-stone-500 truncate max-w-[220px]">
                    {user.email}
                  </div>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={onSignOut}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-[11px] font-mono-code font-bold tracking-wider uppercase text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg shadow-2xs transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-stone-600" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onSignIn}
                disabled={isLoadingAuth}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all shrink-0"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isLoadingAuth ? 'Connecting...' : 'Link Google Drive'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
