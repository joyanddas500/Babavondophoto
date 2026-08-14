import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Copy, 
  ExternalLink, 
  Github, 
  Globe, 
  Key, 
  Terminal, 
  HelpCircle,
  FolderGit2,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface VercelGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VercelGuideModal: React.FC<VercelGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const steps = [
    {
      id: 1,
      title: 'Google Cloud Console Setup',
      icon: Key,
      badge: 'OAuth 2.0',
    },
    {
      id: 2,
      title: 'Push Code to GitHub',
      icon: Github,
      badge: 'Git Repo',
    },
    {
      id: 3,
      title: 'Deploy to Vercel',
      icon: Globe,
      badge: '1-Click Host',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-slate-900 text-lg leading-tight">
                Vercel & GitHub Deployment Guide
              </h3>
              <p className="text-xs text-slate-500">
                Complete guide to publish this app with Google Drive integration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Selector Tabs */}
        <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50/50 p-2 gap-2 text-xs font-medium">
          {steps.map((s) => {
            const Icon = s.icon;
            const isCurrent = activeStep === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveStep(s.id)}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-left transition-all ${
                  isCurrent
                    ? 'bg-white shadow-sm text-indigo-600 font-semibold border border-slate-200/80'
                    : 'text-slate-600 hover:bg-white/60'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isCurrent ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <div className="text-[10px] text-slate-400 font-mono">Step 0{s.id}</div>
                  <div className="truncate">{s.title}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 flex gap-3 text-xs text-indigo-900">
                <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Yes, Google Cloud Console is needed</strong> for external deployments like Vercel so Google knows your custom domain has permission to use Google Sign-In and Google Drive API.
                </p>
              </div>

              <h4 className="font-semibold text-slate-900 text-base">
                1. Create Google Cloud Credentials (5 minutes)
              </h4>

              <ol className="space-y-3.5 list-decimal list-inside text-xs leading-relaxed text-slate-600">
                <li>
                  Go to the{' '}
                  <a
                    href="https://console.cloud.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline font-semibold inline-flex items-center gap-1"
                  >
                    Google Cloud Console <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  and create or select a project.
                </li>
                <li>
                  Navigate to <strong>APIs & Services &gt; Library</strong>, search for <strong>Google Drive API</strong>, and click <strong>Enable</strong>.
                </li>
                <li>
                  Go to <strong>APIs & Services &gt; OAuth consent screen</strong>:
                  <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-slate-500">
                    <li>Select <strong>External</strong> user type</li>
                    <li>Add your App Name (e.g. <em>BABAVONDOPHOTO</em>) & Support email</li>
                    <li>In Scopes, add: <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono text-slate-800">https://www.googleapis.com/auth/drive.readonly</code></li>
                  </ul>
                </li>
                <li>
                  Go to <strong>Credentials &gt; Create Credentials &gt; OAuth client ID</strong>:
                  <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-slate-500">
                    <li>Application type: <strong>Web application</strong></li>
                    <li>
                      <strong>Authorized JavaScript origins:</strong>
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center justify-between bg-slate-100 p-2 rounded-lg font-mono text-[11px]">
                          <span>http://localhost:3000</span>
                          <button
                            onClick={() => copyToClipboard('http://localhost:3000', 'origin-local')}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            {copiedKey === 'origin-local' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div className="flex items-center justify-between bg-slate-100 p-2 rounded-lg font-mono text-[11px]">
                          <span>https://your-app-name.vercel.app</span>
                          <button
                            onClick={() => copyToClipboard('https://your-app-name.vercel.app', 'origin-vercel')}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            {copiedKey === 'origin-vercel' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </li>
                  </ul>
                </li>
                <li>
                  Copy your generated <strong>Client ID</strong> and save it for Vercel in Step 3!
                </li>
              </ol>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900 text-base">
                2. Push Your Project to GitHub
              </h4>
              <p className="text-xs text-slate-600">
                You can export the project from AI Studio settings or push with these standard Git commands:
              </p>

              <div className="bg-slate-950 text-slate-200 rounded-xl p-4 font-mono text-xs space-y-2 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 border-b border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Terminal / Shell
                  </span>
                  <button
                    onClick={() => copyToClipboard('git init\ngit add .\ngit commit -m "feat: Google Drive Photo Gallery App"\ngit branch -M main\ngit remote add origin https://github.com/YOUR_USERNAME/drive-gallery.git\ngit push -u origin main', 'git-cmd')}
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    {copiedKey === 'git-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy All</span>
                  </button>
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <p className="text-slate-500"># 1. Initialize git</p>
                  <p>git init</p>
                  <p className="text-slate-500"># 2. Stage all files</p>
                  <p>git add .</p>
                  <p className="text-slate-500"># 3. Commit</p>
                  <p>git commit -m "feat: Google Drive Photo Gallery App"</p>
                  <p className="text-slate-500"># 4. Link to your GitHub repository and push</p>
                  <p>git branch -M main</p>
                  <p>git remote add origin https://github.com/YOUR_USERNAME/drive-gallery.git</p>
                  <p>git push -u origin main</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
                💡 <strong>Tip:</strong> All dependencies, build scripts (<code>npm run build</code>), and Tailwind styling are already configured out of the box for standard Vite + React deployments!
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900 text-base">
                3. Deploy to Vercel (Instant)
              </h4>

              <ol className="space-y-3.5 list-decimal list-inside text-xs leading-relaxed text-slate-600">
                <li>
                  Log in to{' '}
                  <a
                    href="https://vercel.com/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline font-semibold inline-flex items-center gap-1"
                  >
                    Vercel Dashboard <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  and click <strong>Add New &gt; Project</strong>.
                </li>
                <li>
                  Import your GitHub repository <strong>drive-gallery</strong>.
                </li>
                <li>
                  Framework Preset will automatically be detected as <strong>Vite</strong>.
                </li>
                <li>
                  Under <strong>Environment Variables</strong>, optionally add your Client ID from Google Cloud Console:
                  <div className="mt-2 bg-slate-950 text-slate-200 p-3 rounded-xl font-mono text-xs flex items-center justify-between border border-slate-800">
                    <div>
                      <span className="text-indigo-400">VITE_GOOGLE_CLIENT_ID</span>=
                      <span className="text-emerald-400">your-oauth-client-id.apps.googleusercontent.com</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard('VITE_GOOGLE_CLIENT_ID', 'env-var')}
                      className="text-slate-400 hover:text-white"
                    >
                      {copiedKey === 'env-var' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </li>
                <li>
                  Click <strong>Deploy</strong>! In ~30 seconds, your site will be live at <code>https://drive-gallery.vercel.app</code>.
                </li>
              </ol>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-3 text-xs text-emerald-900">
                <Zap className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  <strong>That's it!</strong> Anyone will be able to connect Google Drive, create galleries, generate share links, and view your photo albums worldwide.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex gap-2">
            {activeStep > 1 && (
              <button
                onClick={() => setActiveStep((prev) => prev - 1)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200/70 rounded-lg transition-colors"
              >
                Back
              </button>
            )}
            {activeStep < 3 && (
              <button
                onClick={() => setActiveStep((prev) => prev + 1)}
                className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Next: Step 0{activeStep + 1}
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
