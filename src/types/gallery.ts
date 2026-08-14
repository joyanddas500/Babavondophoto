export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webContentLink?: string;
  webViewLink?: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  imageMediaMetadata?: {
    width?: number;
    height?: number;
    rotation?: number;
    location?: {
      latitude?: number;
      longitude?: number;
      altitude?: number;
    };
    time?: string;
    cameraMake?: string;
    cameraModel?: string;
    exposureTime?: number;
    aperture?: number;
    flashUsed?: boolean;
    focalLength?: number;
    isoSpeed?: number;
  };
  customCaption?: string;
  customTitle?: string;
  directUrl?: string;
}

export interface DriveFolder {
  id: string;
  name: string;
  modifiedTime?: string;
  photoCount?: number;
}

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
  accessToken?: string;
}

export type GalleryLayout = 'masonry' | 'grid' | 'justified' | 'slideshow';
export type GalleryTheme = 'default' | 'dark' | 'warm' | 'minimal' | 'cinematic';

export interface GalleryConfig {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  creatorName?: string;
  creatorAvatar?: string;
  creatorEmail?: string;
  createdAt: string;
  updatedAt: string;
  coverPhotoId?: string;
  layout: GalleryLayout;
  theme: GalleryTheme;
  columns: 2 | 3 | 4 | 5;
  enableDownload: boolean;
  showMetadata: boolean;
  photos: DriveFile[];
  password?: string;
}

export type ActiveTab = 'explore' | 'create' | 'my-galleries' | 'view-gallery';
