import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Copy, 
  ExternalLink, 
  Key, 
  ShieldCheck, 
  HardDrive, 
  Terminal,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { getGoogleClientId, setGoogleClientId } from '../lib/googleAuth';

interface GoogleConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectWithClientId: (clientId: string) => void;
  initialError?: string | null;
}

export const GoogleConsoleModal: React.FC<GoogleConsoleModalProps> = ({
  isOpen,
  onClose,
  onConnectWithClientId,
  initialError,
}) => {
  const [clientIdInput, setClientIdInput] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  useEffect(() => {
    if (isOpen) {
      setClientIdInput(getGoogleClientId());
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveAndConnect = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = clientIdInput.trim();
    if (!cleanId) return;

    setGoogleClientId(cleanId);
    setSaveSuccess(true);
    setTimeout(() => {
      onConnectWithClientId(cleanId);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-sky-500 text-white rounded-2xl shadow-sm">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-slate-900 text-lg">
                  Google Cloud Console Setup
                </h3>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200/50">
                  Direct GCP OAuth 2.0
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Connect directly using your Google Cloud Console OAuth 2.0 Client ID (No Firebase required)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Notice Banner */}
          {initialError && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-amber-900">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Google Cloud OAuth Configuration Notice</p>
                <p className="mt-0.5 text-[11px] text-amber-800">
                  {initialError.includes('MISSING_CLIENT_ID')
                    ? 'Enter your Google Cloud Console Client ID below to connect directly with Google Drive.'
                    : initialError}
                </p>
              </div>
            </div>
          )}

          {/* Form to enter Client ID */}
          <form onSubmit={handleSaveAndConnect} className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-900">
                Your Google Cloud Console Client ID
              </label>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                Open Google Cloud Console <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                placeholder="e.g. 1234567890-abcdefg123456.apps.googleusercontent.com"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                required
              />
              <p className="text-[11px] text-slate-500">
                You can also configure this permanently in your environment as <code className="bg-slate-200/70 px-1 py-0.5 rounded text-indigo-700 font-semibold font-mono">VITE_GOOGLE_CLIENT_ID</code> when deploying to Vercel.
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              {saveSuccess ? (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Client ID Saved! Connecting...
                </span>
              ) : (
                <span className="text-[11px] text-slate-500">
                  Stored securely in your browser session for Google Drive access
                </span>
              )}

              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/20 transition-colors flex items-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Save & Connect Drive</span>
              </button>
            </div>
          </form>

          {/* Step-by-step Setup instructions */}
          <div className="space-y-4">
            <h4 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-600" />
              How to get your Google Cloud Console Client ID (3 minutes)
            </h4>

            <div className="space-y-3.5 border-l-2 border-indigo-200 pl-4">
              <div className="space-y-1">
                <p className="font-semibold text-slate-900">
                  1. Enable the Google Drive API in Google Cloud Console
                </p>
                <p className="text-slate-600">
                  In{' '}
                  <a
                    href="https://console.cloud.google.com/apis/library/drive.googleapis.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 underline font-medium inline-flex items-center gap-0.5"
                  >
                    APIs & Services &gt; Library <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  , search for <strong>Google Drive API</strong> and click <strong>Enable</strong>.
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-slate-900">
                  2. Configure the OAuth Consent Screen
                </p>
                <p className="text-slate-600">
                  In <strong>APIs & Services &gt; OAuth consent screen</strong>, select <strong>External</strong>, set your App Name (e.g. BABAVONDOPHOTO), and add the read-only Drive scope:
                </p>
                <div className="bg-slate-100 p-2 rounded-xl flex items-center justify-between font-mono text-[11px] text-slate-800">
                  <span>https://www.googleapis.com/auth/drive.readonly</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('https://www.googleapis.com/auth/drive.readonly', 'scope')}
                    className="text-indigo-600 hover:text-indigo-800 p-1"
                    title="Copy Scope"
                  >
                    {copiedKey === 'scope' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-slate-900">
                  3. Create OAuth 2.0 Web Client ID
                </p>
                <p className="text-slate-600">
                  Go to <strong>APIs & Services &gt; Credentials &gt; Create Credentials &gt; OAuth client ID</strong>. Select <strong>Web application</strong> and add these <strong>Authorized JavaScript origins</strong>:
                </p>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between bg-slate-100 p-2 rounded-xl font-mono text-[11px]">
                    <span className="text-slate-800 truncate mr-2">{currentOrigin}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(currentOrigin, 'origin-current')}
                      className="text-indigo-600 hover:text-indigo-800 p-1 shrink-0 flex items-center gap-1"
                    >
                      {copiedKey === 'origin-current' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[10px]">Copy Current Origin</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-slate-100 p-2 rounded-xl font-mono text-[11px]">
                    <span className="text-slate-800">http://localhost:3000</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('http://localhost:3000', 'origin-local')}
                      className="text-indigo-600 hover:text-indigo-800 p-1"
                    >
                      {copiedKey === 'origin-local' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-slate-100 p-2 rounded-xl font-mono text-[11px]">
                    <span className="text-slate-800">https://your-app-name.vercel.app</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('https://your-app-name.vercel.app', 'origin-vercel')}
                      className="text-indigo-600 hover:text-indigo-800 p-1"
                    >
                      {copiedKey === 'origin-vercel' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-slate-900">
                  4. Paste your Client ID above and click "Save & Connect Drive"
                </p>
                <p className="text-slate-600">
                  Google will pop up the standard Google Account consent screen to link your Drive photos securely!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Pure Google Cloud Console OAuth 2.0 (Zero Firebase dependencies)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
