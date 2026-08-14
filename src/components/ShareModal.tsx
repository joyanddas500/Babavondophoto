import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Copy, 
  Check, 
  QrCode as QrIcon, 
  Share2, 
  ExternalLink, 
  Download,
  Code,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GalleryConfig } from '../types/gallery';
import { generateShareUrl } from '../lib/shareService';

interface ShareModalProps {
  gallery: GalleryConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ gallery, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'qr' | 'embed'>('link');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isOpen && gallery) {
      const url = generateShareUrl(gallery);
      setShareUrl(url);

      // Generate QR Code
      QRCode.toDataURL(url, {
        width: 360,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((dataUri) => {
          setQrDataUrl(dataUri);
        })
        .catch((err) => console.error('QR generation error:', err));
    }
  }, [isOpen, gallery]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      
      // Fire subtle celebratory confetti
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#3b82f6', '#10b981', '#f59e0b'],
      });

      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${gallery.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const embedCode = `<iframe src="${shareUrl}" width="100%" height="700" style="border:0; border-radius:12px; overflow:hidden;" allowfullscreen></iframe>`;

  const handleCopyEmbed = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const encodedTitle = encodeURIComponent(`Check out this photo album: ${gallery.title}`);
  const encodedUrl = encodeURIComponent(shareUrl);

  const socialLinks = [
    {
      name: 'WhatsApp',
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    {
      name: 'Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'bg-sky-500 hover:bg-sky-600 text-white',
    },
    {
      name: 'X (Twitter)',
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: 'bg-slate-900 hover:bg-slate-800 text-white',
    },
    {
      name: 'Email',
      href: `mailto:?subject=${encodedTitle}&body=${encodedTitle}%0A%0A${encodedUrl}`,
      color: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="share-modal-container"
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-slate-900 text-lg leading-tight">
                Share Gallery
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1">
                {gallery.title} • {gallery.photos.length} photos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100 px-6 pt-3 gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('link')}
            className={`pb-2.5 transition-colors border-b-2 ${
              activeTab === 'link'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Shareable Link
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'qr'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <QrIcon className="w-4 h-4" />
            QR Code
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'embed'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code className="w-4 h-4" />
            Embed
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'link' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Direct Gallery Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 text-xs px-3.5 py-2.5 rounded-xl font-mono focus:outline-none select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Link
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  Anyone with this link can instantly browse the photos in high resolution.
                </p>
              </div>

              {/* Social sharing */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
                  Share Directly
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {socialLinks.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-center py-2 px-3 rounded-xl text-xs font-semibold transition-all ${item.color}`}
                    >
                      {item.name}
                    </a>
                  ))}
                </div>
              </div>

              {/* Important Drive note */}
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900 leading-relaxed">
                <span className="font-semibold">💡 Google Drive Sharing Tip:</span> If photos in your Google Drive are set to private, please ensure the photos or folder have sharing set to <em>"Anyone with the link can view"</em> in Google Drive so viewers can load them seamlessly.
              </div>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-2">
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm inline-block">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Gallery QR Code"
                    className="w-56 h-56 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center bg-slate-100 rounded-lg text-xs text-slate-400">
                    Generating QR code...
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Scan to View Gallery on Mobile
                </p>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Point any phone camera at this QR code to open the photo album immediately.
                </p>
              </div>
              <button
                onClick={handleDownloadQr}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download QR Code Image
              </button>
            </div>
          )}

          {activeTab === 'embed' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Embed this photo album into your personal website, blog, or portfolio with this HTML iframe snippet:
              </p>
              <textarea
                readOnly
                value={embedCode}
                rows={3}
                className="w-full bg-slate-900 text-slate-200 font-mono text-xs p-3.5 rounded-xl border border-slate-800 focus:outline-none select-all"
              />
              <button
                onClick={handleCopyEmbed}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied Embed Code!' : 'Copy Embed Code'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Google Drive Photo Gallery</span>
          <button
            onClick={onClose}
            className="font-medium text-slate-700 hover:text-slate-900"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
