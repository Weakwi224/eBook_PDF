export type PageOrientation = 'landscape' | 'portrait';

export type AlbumTheme = 'white' | 'beige' | 'navy';

export type AlbumFont = 'gothic' | 'serif' | 'handwriting';

export type ViewMode = 'album' | 'overview';

export interface AlbumPhoto {
  id: string;
  blob: Blob;
  previewUrl: string;
  fileName: string;
  width: number;
  height: number;
  title: string;
  description: string;
  createdAt: number;
}

export interface AlbumSettings {
  albumTitle: string;
  albumSubtitle: string;
  authorName: string;
  albumDate: string;
  closingNote: string;
  orientation: PageOrientation;
  theme: AlbumTheme;
  font: AlbumFont;
  includeCover: boolean;
}
