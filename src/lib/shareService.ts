import LZString from 'lz-string';
import { GalleryConfig } from '../types/gallery';
import { SAMPLE_GALLERIES } from './sampleData';

const LOCAL_STORAGE_KEY = 'drive_gallery_my_albums_v1';

/**
 * Compresses a GalleryConfig into an ultra-compact URI-safe string
 */
export function encodeGalleryToUrl(gallery: GalleryConfig): string {
  // Minimize payload by trimming unnecessary empty fields
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
  const compressed = LZString.compressToEncodedURIComponent(jsonString);
  return compressed;
}

/**
 * Decompresses and validates a GalleryConfig from an encoded string or URL hash
 */
export function decodeGalleryFromUrl(encodedString: string): GalleryConfig | null {
  if (!encodedString || !encodedString.trim()) return null;

  try {
    // 1. Try LZString decompression
    const decompressed = LZString.decompressFromEncodedURIComponent(encodedString);
    if (decompressed) {
      const parsed = JSON.parse(decompressed);
      if (parsed && parsed.title && Array.isArray(parsed.photos)) {
        return parsed as GalleryConfig;
      }
    }
  } catch {
    // continue to fallbacks
  }

  // 2. Fallback: Base64 decode
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

  // 3. Fallback: Raw JSON string
  try {
    const parsed = JSON.parse(decodeURIComponent(encodedString));
    if (parsed && parsed.title && Array.isArray(parsed.photos)) {
      return parsed as GalleryConfig;
    }
  } catch {
    // failure
  }

  return null;
}

/**
 * Generate full shareable URL for this gallery
 */
export function generateShareUrl(gallery: GalleryConfig): string {
  const encoded = encodeGalleryToUrl(gallery);
  const origin = window.location.origin + window.location.pathname;
  return `${origin}#gallery=${encoded}`;
}

/**
 * Local Storage helpers for "My Created Galleries"
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
    console.error('Failed to read saved galleries:', err);
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
    console.error('Failed to save gallery:', err);
  }
}

export function deleteGallery(id: string): void {
  try {
    const current = getSavedGalleries();
    const updated = current.filter((g) => g.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete gallery:', err);
  }
}

/**
 * Finds a gallery by ID either from local storage or sample galleries
 */
export function findGalleryById(id: string): GalleryConfig | null {
  const saved = getSavedGalleries();
  const found = saved.find((g) => g.id === id);
  if (found) return found;

  const sample = SAMPLE_GALLERIES.find((g) => g.id === id);
  if (sample) return sample;

  return null;
}
