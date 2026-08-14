import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  HardDrive, 
  Palette, 
  Share2, 
  Images, 
  CheckCircle, 
  ExternalLink,
  ShieldCheck,
  FolderGit2
} from 'lucide-react';
import { SAMPLE_GALLERIES } from '../lib/sampleData';
import { GalleryConfig } from '../types/gallery';
import { getOptimizedDriveUrl } from '../lib/driveApi';

interface ExploreFeaturedProps {
  onSelectGallery: (gallery: GalleryConfig) => void;
  onCreateNew: () => void;
  onOpenDeployGuide: () => void;
}

export const ExploreFeatured: React.FC<ExploreFeaturedProps> = ({
  onSelectGallery,
  onCreateNew,
  onOpenDeployGuide,
}) => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 text-white p-8 sm:p-14 overflow-hidden shadow-2xl border border-slate-800">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold border border-indigo-400/20 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Google Drive Gallery Studio</span>
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] text-white">
              Turn Google Drive Photos into <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-sky-300 to-indigo-100">Shareable Galleries</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed max-w-2xl font-light">
              Connect your Google Drive, pick photos or whole folders, customize the layout and theme, and generate direct links that anyone can view with high-res lightbox and slideshows.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <button
                onClick={onCreateNew}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
              >
                <span>Create Gallery from Drive</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenDeployGuide}
                className="inline-flex items-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs sm:text-sm font-semibold backdrop-blur-md border border-white/10 transition-colors"
              >
                <FolderGit2 className="w-4 h-4 text-indigo-300" />
                <span>Vercel & GitHub Guide</span>
              </button>
            </div>

            {/* Feature Badges */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>No viewer login required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>High-resolution CDN rendering</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>QR code + Direct Link sharing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works (3 Steps) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
            How Drive Sharing Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Three simple steps from your cloud storage to a responsive photo showcase.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-display font-bold text-lg">
              1
            </div>
            <h3 className="font-display font-semibold text-slate-900 text-base">
              Connect & Pick Drive Files
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sign in with Google to explore your folders or search images. Pick individual photos or import whole folders in one click.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-display font-bold text-lg">
              2
            </div>
            <h3 className="font-display font-semibold text-slate-900 text-base">
              Customize Layout & Story
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Choose from Masonry, Clean Grid, or Feed layouts. Add custom captions, select your favorite cover photo, and choose atmospheric themes.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-display font-bold text-lg">
              3
            </div>
            <h3 className="font-display font-semibold text-slate-900 text-base">
              Share with Link or QR Code
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Anyone with your share link can view photos in high resolution with full slideshows, zoom, and metadata without needing an account.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Demo Galleries */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
              Sample Galleries
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900">
              Explore Live Showcase Examples
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Click any album below to test the viewer, slideshow, and share mechanisms right now.
            </p>
          </div>

          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 self-start sm:self-auto"
          >
            <span>Create your own album</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SAMPLE_GALLERIES.map((gallery) => {
            const coverPhoto = gallery.photos[0];
            const coverUrl = coverPhoto ? getOptimizedDriveUrl(coverPhoto, 1200) : '';

            return (
              <div
                key={gallery.id}
                onClick={() => onSelectGallery(gallery)}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col"
              >
                {/* Image Showcase */}
                <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                  <img
                    src={coverUrl}
                    alt={gallery.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-6 text-white">
                    <div className="flex justify-between items-center">
                      <span className="bg-black/50 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/20">
                        {gallery.layout} layout
                      </span>
                      <span className="bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                        {gallery.photos.length} Photos
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display font-bold text-xl sm:text-2xl text-white leading-tight">
                        {gallery.title}
                      </h3>
                      {gallery.subtitle && (
                        <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                          {gallery.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sub Photos Mini Preview */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {gallery.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {gallery.creatorAvatar && (
                        <img
                          src={gallery.creatorAvatar}
                          alt={gallery.creatorName}
                          className="w-6 h-6 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <span className="text-xs font-semibold text-slate-700">
                        {gallery.creatorName}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Open Album</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
