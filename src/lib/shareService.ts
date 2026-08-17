import LZString from 'lz-string';
import { GalleryConfig } from '../types/gallery';
import { SAMPLE_GALLERIES } from './sampleData';

const LOCAL_STORAGE_KEY = 'drive_gallery_my_albums_v1';

/**
 * Generate a short, clean, WhatsApp-friendly shareable URL for a gallery.
 * Example output: https://yourdomain.com/?id=portal_17300_abc
 * Length is ~45-60 characters (instead of 4300+ characters), so WhatsApp never hangs!
 */
export function generateShareUrl(gallery: GalleryConfig): string {
  const base = window.location.origin + window.location.pathname;
  // Use clean query param ?id=...
  return `${base}?id=${encodeURIComponent(gallery.id)}`;
}

/**
 * Compresses a GalleryConfig into an ultra-compact URI-safe string (for standalone offline fallback)
 */
export function encodeGalleryToUrl(gallery: GalleryConfig): string {
  const slimGallery = {
    ...gallery,
    photos: gallery.photos.map((p) => ({
      id: p.id,
      name: p.name,
      mimeType: p.mimeType,
      thumbnailLink: p.thumbnailLink,
      webContentLink: p.webContentLink,
      webViewLink: p.webViewLink,
      size: p.size,
      createdTime: p.createdTime,
      imageMediaMetadata: p.imageMediaMetadata,
      customCaption: p.customCaption,
      customTitle: p.customTitle,
      directUrl: p.directUrl,
    })),
  };

  const jsonString = JSON.stringify(slimGallery);
  return LZString.compressToEncodedURIComponent(jsonString);
}

/**
 * Decompresses and validates a GalleryConfig from an encoded string or URL hash
 */
export function decodeGalleryFromUrl(encodedString: string): GalleryConfig | null {
  if (!encodedString || !encodedString.trim()) return null;

  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(encodedString);
    if (decompressed) {
      const parsed = JSON.parse(decompressed);
      if (parsed && parsed.title && Array.isArray(parsed.photos)) {
        return parsed as GalleryConfig;
      }
    }
  } catch {
    // continue
  }

  try {
    const raw = decodeURIComponent(encodedString);
    const decoded = atob(raw);
    const parsed = JSON.parse(decoded);
    if (parsed && parsed.title && Array.isArray(parsed.photos)) {
      return parsed as GalleryConfig;
    }
  } catch {
    // continue
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(encodedString));
    if (parsed && parsed.title && Array.isArray(parsed.photos)) {
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
        // Sync local cache
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
 * Asynchronously fetch a single gallery by ID from the server
 */
export async function fetchGalleryById(id: string): Promise<GalleryConfig | null> {
  if (!id) return null;

  // 1. Try server first
  try {
    const res = await fetch(`/api/galleries/${encodeURIComponent(id)}`);
    if (res.ok) {
      const gallery = await res.json();
      if (gallery && gallery.id && gallery.title) {
        return gallery as GalleryConfig;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch gallery from server by ID:', err);
  }

  // 2. Fallback to localStorage
  const local = findGalleryById(id);
  if (local) return local;

  return null;
}

/**
 * Save gallery to both server API and local storage
 */
export async function saveGalleryAsync(gallery: GalleryConfig): Promise<void> {
  // 1. Save locally immediately
  saveGallery(gallery);

  // 2. Persist to server API
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
  // Delete from local cache
  deleteGallery(id);

  // Delete from server
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
