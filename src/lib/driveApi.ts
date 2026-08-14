import { DriveFile, DriveFolder } from '../types/gallery';

/**
 * Transforms Google Drive thumbnail URLs to requested resolution (up to high-res s1600 or s2000)
 */
export function getOptimizedDriveUrl(file: Partial<DriveFile>, width: number = 1600): string {
  if (file.directUrl) return file.directUrl;
  
  if (file.thumbnailLink) {
    // Replace =s220 or similar suffix with high-resolution flag
    if (file.thumbnailLink.includes('=s')) {
      return file.thumbnailLink.replace(/=s\d+.*$/, `=s${width}`);
    }
    return `${file.thumbnailLink}=s${width}`;
  }

  if (file.id) {
    return `https://drive.google.com/thumbnail?id=${file.id}&sz=w${width}`;
  }

  return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop';
}

/**
 * Get direct download or full-view link
 */
export function getDriveDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

export function getDriveViewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

/**
 * Fetch image files from Google Drive
 */
export async function fetchDriveImages(
  token: string,
  options: {
    folderId?: string;
    searchTerm?: string;
    pageSize?: number;
    pageToken?: string;
  } = {}
): Promise<{ files: DriveFile[]; nextPageToken?: string }> {
  const { folderId, searchTerm, pageSize = 40, pageToken } = options;

  let query = "mimeType contains 'image/' and trashed = false";

  if (folderId && folderId !== 'root') {
    query += ` and '${folderId}' in parents`;
  }

  if (searchTerm && searchTerm.trim()) {
    const cleanSearch = searchTerm.replace(/'/g, "\\'");
    query += ` and name contains '${cleanSearch}'`;
  }

  const fields = 'nextPageToken,files(id,name,mimeType,thumbnailLink,webContentLink,webViewLink,size,createdTime,modifiedTime,imageMediaMetadata,parents)';
  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.set('q', query);
  url.searchParams.set('fields', fields);
  url.searchParams.set('pageSize', pageSize.toString());
  url.searchParams.set('orderBy', 'modifiedTime desc');
  if (pageToken) {
    url.searchParams.set('pageToken', pageToken);
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Your Google session has expired. Please sign in again to access Drive.');
    }
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to fetch Drive photos (${res.status})`);
  }

  const data = await res.json();
  const rawFiles: any[] = data.files || [];

  const files: DriveFile[] = rawFiles.map((f) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    thumbnailLink: f.thumbnailLink,
    webContentLink: f.webContentLink,
    webViewLink: f.webViewLink,
    size: f.size,
    createdTime: f.createdTime,
    modifiedTime: f.modifiedTime,
    imageMediaMetadata: f.imageMediaMetadata,
  }));

  return {
    files,
    nextPageToken: data.nextPageToken,
  };
}

/**
 * Fetch folders in Google Drive for browsing
 */
export async function fetchDriveFolders(
  token: string,
  parentFolderId?: string
): Promise<DriveFolder[]> {
  let query = "mimeType = 'application/vnd.google-apps.folder' and trashed = false";
  if (parentFolderId && parentFolderId !== 'root') {
    query += ` and '${parentFolderId}' in parents`;
  }

  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.set('q', query);
  url.searchParams.set('fields', 'files(id,name,modifiedTime)');
  url.searchParams.set('pageSize', '60');
  url.searchParams.set('orderBy', 'name');

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Session expired. Please sign in again.');
    }
    throw new Error('Failed to load Google Drive folders.');
  }

  const data = await res.json();
  return (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    modifiedTime: f.modifiedTime,
  }));
}

/**
 * Helper to human-format file sizes (bytes to KB/MB)
 */
export function formatBytes(bytes?: string | number, decimals: number = 1): string {
  if (!bytes) return '';
  const num = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (isNaN(num) || num === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(num) / Math.log(k));
  return `${parseFloat((num / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format timestamp nicely
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}
