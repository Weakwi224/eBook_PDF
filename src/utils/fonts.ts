import { AlbumFont } from '../types/album';

export interface FontPreset {
  id: AlbumFont;
  label: string;
  canvasFamily: string;
  scaleFactor: number;
  titleWeight: string;
  bodyWeight: string;
  fontClass: string;
  coverTitleClass: string;
  coverSubtitleClass: string;
  coverAuthorClass: string;
  photoTitleLandscapeClass: string;
  photoTitlePortraitClass: string;
  photoDescLandscapeClass: string;
  photoDescPortraitClass: string;
  closingNoteClass: string;
}

export const ALBUM_FONTS: Record<AlbumFont, FontPreset> = {
  gothic: {
    id: 'gothic',
    label: '고딕',
    canvasFamily: '"Noto Sans KR", sans-serif',
    scaleFactor: 1,
    titleWeight: '700',
    bodyWeight: '400',
    fontClass: 'font-sans',
    coverTitleClass: 'font-sans text-3xl sm:text-5xl font-bold tracking-tight leading-snug',
    coverSubtitleClass: 'font-sans text-lg sm:text-2xl font-normal',
    coverAuthorClass: 'font-sans text-lg sm:text-2xl font-semibold',
    photoTitleLandscapeClass: 'font-sans text-xl sm:text-[22px] font-bold',
    photoTitlePortraitClass: 'font-sans text-xl font-bold',
    photoDescLandscapeClass: 'font-sans text-sm sm:text-[15px] leading-relaxed',
    photoDescPortraitClass: 'font-sans text-sm leading-relaxed',
    closingNoteClass: 'font-sans text-xl sm:text-2xl leading-relaxed font-medium',
  },
  serif: {
    id: 'serif',
    label: '명조',
    canvasFamily: '"Noto Serif KR", Georgia, serif',
    scaleFactor: 1,
    titleWeight: '600',
    bodyWeight: '400',
    fontClass: 'font-serif',
    coverTitleClass: 'font-serif text-3xl sm:text-5xl font-semibold tracking-tight leading-snug',
    coverSubtitleClass: 'font-serif text-lg sm:text-2xl font-normal',
    coverAuthorClass: 'font-serif text-lg sm:text-2xl font-medium',
    photoTitleLandscapeClass: 'font-serif text-xl sm:text-[22px] font-semibold',
    photoTitlePortraitClass: 'font-serif text-xl font-semibold',
    photoDescLandscapeClass: 'font-serif text-sm sm:text-[15px] leading-relaxed',
    photoDescPortraitClass: 'font-serif text-sm leading-relaxed',
    closingNoteClass: 'font-serif text-xl sm:text-2xl leading-relaxed font-medium',
  },
  handwriting: {
    id: 'handwriting',
    label: '손글씨',
    canvasFamily: '"Nanum Pen Script", cursive',
    scaleFactor: 1.28,
    titleWeight: '400',
    bodyWeight: '400',
    fontClass: 'font-hand',
    coverTitleClass: 'font-hand text-4xl sm:text-6xl font-normal tracking-normal leading-snug',
    coverSubtitleClass: 'font-hand text-2xl sm:text-3xl font-normal',
    coverAuthorClass: 'font-hand text-2xl sm:text-3xl font-normal',
    photoTitleLandscapeClass: 'font-hand text-2xl sm:text-[30px] font-normal leading-tight',
    photoTitlePortraitClass: 'font-hand text-2xl sm:text-[28px] font-normal leading-tight',
    photoDescLandscapeClass: 'font-hand text-lg sm:text-[22px] leading-snug',
    photoDescPortraitClass: 'font-hand text-lg sm:text-[21px] leading-snug',
    closingNoteClass: 'font-hand text-2xl sm:text-4xl leading-snug font-normal',
  },
};

export const FONT_OPTIONS: FontPreset[] = [
  ALBUM_FONTS.gothic,
  ALBUM_FONTS.serif,
  ALBUM_FONTS.handwriting,
];

export function getFontPreset(font?: AlbumFont): FontPreset {
  return ALBUM_FONTS[font || 'serif'] ?? ALBUM_FONTS.serif;
}
