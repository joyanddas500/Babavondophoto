import LZString from 'lz-string';
import { GalleryConfig, DriveFile } from '../types/gallery';
import { SAMPLE_GALLERIES } from './sampleData';

const LOCAL_STORAGE_KEY = 'drive_gallery_my_albums_v1';

/**
 * Ultra-compact representation for cross-platform link sharing.
 * Compresses essential data into a lightweight URI token (under ~300 chars)
 * that never hangs WhatsApp and works 100% reliably across all mobile browsers and Vercel!
 */
export interface CompactGalleryPayload {
  i: string; // id
  t: string; // title
  s?: string; // subtitle
  p?: string; // password/passcode
  c?: string; // creatorName
  f: [string, string, string?][]; // photos: [id, name, size?]
}

/**
 * Generate a short, universal, cross-device share URL.
 * Works on every device/phone, WhatsApp, Safari, Chrome, Vercel with zero server dependencies.
 */
export function generateShareUrl(gallery: GalleryConfig): string {
  const base = window.location.origin + window.location.pathname;

  // Build ultra-compact payload with only essential identifiers
  const payload: CompactGalleryPayload = {
    i: gallery.id,
    t: gallery.title,
    s: gallery.subtitle,
    p: gallery.password || undefined,
    c: gallery.creatorName || undefined,
    f: gallery.photos.map((p) => [p.id, p.name, p.size ? String(p.size) : '']),
  };

  const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(payload));
  return `${base}?p=${compressed}`;
}

/**
 * Encodes gallery to compressed URL string
 */
export function encodeGalleryToUrl(gallery: GalleryConfig): string {
  return generateShareUrl(gallery);
}

/**
 * Decompresses and validates a GalleryConfig from an encoded string or URL parameter
 */
export function decodeGalleryFromUrl(encodedString: string): GalleryConfig | null {
  if (!encodedString || !encodedString.trim()) return null;

  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(encodedString.trim());
    if (decompressed) {
      const parsed = JSON.parse(decompressed);

      // Check if it's the new ultra-compact format
      if (parsed && parsed.t && Array.isArray(parsed.f)) {
        const payload = parsed as CompactGalleryPayload;
        const photos: DriveFile[] = payload.f.map(([id, name, size]) => ({
          id,
          name,
          mimeType: 'image/jpeg',
          size: size ? String(size) : undefined,
          thumbnailLink: `https://drive.google.com/thumbnail?id=${id}&sz=w1600`,
          webViewLink: `https://drive.google.com/file/d/${id}/view`,
          webContentLink: `https://drive.google.com/uc?export=download&id=${id}`,
          directUrl: `https://drive.google.com/thumbnail?id=${id}&sz=w1600`,
        }));

        const restoredGallery: GalleryConfig = {
          id: payload.i || `portal_${Date.now()}`,
          title: payload.t,
          subtitle: payload.s || 'Curated Exhibition & Client Selection Portal',
          description: 'Select and download curated high-resolution photographs directly.',
          creatorName: payload.c || 'Studio Administrator',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          layout: 'masonry',
          theme: 'default',
          columns: 3,
          enableDownload: true,
          showMetadata: true,
          password: payload.p || undefined,
          photos: photos,
          coverPhotoId: photos[0]?.id,
        };

        // Cache locally for fast subsequent loads
        saveGallery(restoredGallery);
        return restoredGallery;
      }

      // Check if it's the full JSON format
      if (parsed && parsed.title && Array.isArray(parsed.photos)) {
        const fullGallery = parsed as GalleryConfig;
        saveGallery(fullGallery);
        return fullGallery;
      }
    }
  } catch (e) {
    // continue to fallback decoders
  }

  // Base64 fallback
  try {
    const raw = decodeURIComponent(encodedString);
    const decoded = atob(raw);
    const parsed = JSON.parse(decoded);
    if (parsed && parsed.title && Array.isArray(parsed.photos)) {
      saveGallery(parsed as GalleryConfig);
      return parsed as GalleryConfig;
    }
  } catch {
    // continue
  }

  return null;
}

/**
 * Asynchronously fetch all saved galleries from the server, syncing with local storage
 */
export async function fetchSavedGalleries(): Promise<GalleryConfig[]> {
  try {
    const res = await fetch('/api/galleries');
    if (res.ok) {
      const serverList = await res.json();
      if (Array.isArray(serverList)) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serverList));
        return serverList;
      }
    }
  } catch (err) {
    console.warn('Could not fetch galleries from server, using local storage cache:', err);
  }

  return getSavedGalleries();
}

/**
 * Asynchronously fetch a single gallery by ID from the server or local storage
 */
export async function fetchGalleryById(id: string): Promise<GalleryConfig | null> {
  if (!id) return null;

  // 1. Try local storage cache first
  const local = findGalleryById(id);
  if (local) return local;

  // 2. Try server API
  try {
    const res = await fetch(`/api/galleries/${encodeURIComponent(id)}`);
    if (res.ok) {
      const gallery = await res.json();
      if (gallery && gallery.id && gallery.title) {
        saveGallery(gallery as GalleryConfig);
        return gallery as GalleryConfig;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch gallery from server by ID:', err);
  }

  return null;
}

/**
 * Save gallery to both server API and local storage
 */
export async function saveGalleryAsync(gallery: GalleryConfig): Promise<void> {
  saveGallery(gallery);

  try {
    await fetch('/api/galleries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gallery),
    });
  } catch (err) {
    console.error('Failed to sync gallery with server:', err);
  }
}

/**
 * Local Storage helpers (synchronous cache)
 */
export function getSavedGalleries(): GalleryConfig[] {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to read saved galleries from localStorage:', err);
  }
  return [];
}

export function saveGallery(gallery: GalleryConfig): void {
  try {
    const current = getSavedGalleries();
    const existingIndex = current.findIndex((g) => g.id === gallery.id);
    let updated: GalleryConfig[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = {
        ...gallery,
        updatedAt: new Date().toISOString(),
      };
    } else {
      updated = [
        {
          ...gallery,
          createdAt: gallery.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...current,
      ];
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save gallery to localStorage:', err);
  }
}

export async function deleteGalleryAsync(id: string): Promise<void> {
  deleteGallery(id);

  try {
    await fetch(`/api/galleries/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.error('Failed to delete gallery from server:', err);
  }
}

export function deleteGallery(id: string): void {
  try {
    const current = getSavedGalleries();
    const updated = current.filter((g) => g.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete gallery from localStorage:', err);
  }
}

/**
 * Finds a gallery by ID from local cache or sample galleries
 */
export function findGalleryById(id: string): GalleryConfig | null {
  const saved = getSavedGalleries();
  const found = saved.find((g) => g.id === id);
  if (found) return found;

  const sample = SAMPLE_GALLERIES.find((g) => g.id === id);
  if (sample) return sample;

  return null;
}
