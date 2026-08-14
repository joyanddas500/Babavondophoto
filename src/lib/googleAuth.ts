import { GoogleUser } from '../types/gallery';

// Default Client ID fallback or env variable
const ENV_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const STORAGE_CLIENT_ID_KEY = 'drive_gallery_gcp_client_id';
const STORAGE_TOKEN_KEY = 'drive_gallery_oauth_token';
const STORAGE_USER_KEY = 'drive_gallery_oauth_user';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: any) => void;
            error_callback?: (error: any) => void;
            prompt?: string;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
          revoke: (token: string, done?: () => void) => void;
        };
      };
    };
  }
}

// In-memory token and user caches
let memoryToken: string | null = null;
let memoryUser: GoogleUser | null = null;
type AuthCallback = (user: GoogleUser | null, token: string | null) => void;
const authListeners: Set<AuthCallback> = new Set();

/**
 * Get the current Google Cloud Console OAuth Client ID
 */
export const getGoogleClientId = (): string => {
  try {
    const saved = localStorage.getItem(STORAGE_CLIENT_ID_KEY);
    if (saved && saved.trim()) return saved.trim();
  } catch {
    // ignore
  }
  return ENV_CLIENT_ID.trim();
};

/**
 * Save custom Google Cloud Console OAuth Client ID
 */
export const setGoogleClientId = (clientId: string) => {
  try {
    if (clientId && clientId.trim()) {
      localStorage.setItem(STORAGE_CLIENT_ID_KEY, clientId.trim());
    } else {
      localStorage.removeItem(STORAGE_CLIENT_ID_KEY);
    }
  } catch {
    // ignore
  }
};

/**
 * Check if a client ID is configured
 */
export const hasConfiguredClientId = (): boolean => {
  return Boolean(getGoogleClientId());
};

/**
 * Ensure the Google Identity Services script is ready
 */
export const loadGsiScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }

    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services')));
      // In case it already loaded
      if (window.google?.accounts?.oauth2) resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services SDK'));
    document.head.appendChild(script);
  });
};

/**
 * Fetch Google User Profile using OAuth 2.0 access token from Google OAuth UserInfo endpoint
 */
export const fetchGoogleUserProfile = async (accessToken: string): Promise<GoogleUser> => {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user profile: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    id: data.sub || data.id || 'google-user',
    name: data.name || data.given_name || 'Google User',
    email: data.email || '',
    picture: data.picture || '',
    accessToken,
  };
};

/**
 * Initialize Auth State Listener
 */
export const initAuth = (callback: AuthCallback) => {
  authListeners.add(callback);

  // Restore stored session if exists
  try {
    const savedToken = sessionStorage.getItem(STORAGE_TOKEN_KEY);
    const savedUserJson = sessionStorage.getItem(STORAGE_USER_KEY);
    if (savedToken && savedUserJson) {
      const user = JSON.parse(savedUserJson) as GoogleUser;
      memoryToken = savedToken;
      memoryUser = user;
      callback(user, savedToken);
    } else {
      callback(null, null);
    }
  } catch (err) {
    callback(null, null);
  }

  return () => {
    authListeners.delete(callback);
  };
};

const notifyListeners = (user: GoogleUser | null, token: string | null) => {
  memoryUser = user;
  memoryToken = token;
  authListeners.forEach((listener) => listener(user, token));
};

/**
 * Authenticate with Google Cloud Console OAuth 2.0 Client ID
 */
export const signInWithGoogle = async (
  explicitClientId?: string
): Promise<{ user: GoogleUser; accessToken: string }> => {
  await loadGsiScript();

  const clientId = explicitClientId || getGoogleClientId();
  if (!clientId) {
    throw new Error(
      'MISSING_CLIENT_ID: Please provide your Google Cloud Console OAuth Client ID to connect Google Drive.'
    );
  }

  return new Promise((resolve, reject) => {
    try {
      const tokenClient = window.google!.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: [
          'https://www.googleapis.com/auth/drive.readonly',
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email',
          'openid',
        ].join(' '),
        prompt: 'consent',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            console.error('Google OAuth error:', tokenResponse);
            reject(new Error(tokenResponse.error_description || tokenResponse.error));
            return;
          }

          const accessToken = tokenResponse.access_token;
          if (!accessToken) {
            reject(new Error('No access token received from Google Cloud Console OAuth'));
            return;
          }

          try {
            // Fetch user profile from Google UserInfo
            const userProfile = await fetchGoogleUserProfile(accessToken);

            // Persist in session
            sessionStorage.setItem(STORAGE_TOKEN_KEY, accessToken);
            sessionStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userProfile));

            notifyListeners(userProfile, accessToken);
            resolve({ user: userProfile, accessToken });
          } catch (profileError) {
            console.warn('Could not fetch full user profile, using fallback profile:', profileError);
            const fallbackUser: GoogleUser = {
              id: 'google-user-' + Date.now(),
              name: 'Google Drive User',
              email: 'drive-connected@google.com',
              accessToken,
            };
            sessionStorage.setItem(STORAGE_TOKEN_KEY, accessToken);
            sessionStorage.setItem(STORAGE_USER_KEY, JSON.stringify(fallbackUser));

            notifyListeners(fallbackUser, accessToken);
            resolve({ user: fallbackUser, accessToken });
          }
        },
        error_callback: (err: any) => {
          console.error('Google Token Client init error:', err);
          reject(new Error(err.message || 'Google OAuth pop-up was closed or blocked.'));
        },
      });

      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (err: any) {
      console.error('Google auth initialization error:', err);
      reject(err);
    }
  });
};

/**
 * Sign out and clear stored tokens
 */
export const signOutGoogle = async (): Promise<void> => {
  const currentToken = memoryToken || sessionStorage.getItem(STORAGE_TOKEN_KEY);
  if (currentToken && window.google?.accounts?.oauth2?.revoke) {
    try {
      window.google.accounts.oauth2.revoke(currentToken, () => {});
    } catch {
      // ignore
    }
  }

  try {
    sessionStorage.removeItem(STORAGE_TOKEN_KEY);
    sessionStorage.removeItem(STORAGE_USER_KEY);
  } catch {
    // ignore
  }

  notifyListeners(null, null);
};

/**
 * Get active access token
 */
export const getAccessToken = async (): Promise<string | null> => {
  if (memoryToken) return memoryToken;
  try {
    const saved = sessionStorage.getItem(STORAGE_TOKEN_KEY);
    if (saved) {
      memoryToken = saved;
      return saved;
    }
  } catch {
    // ignore
  }
  return null;
};
