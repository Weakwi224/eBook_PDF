import { AlbumTheme } from '../types/album';

export interface ThemePalette {
  id: AlbumTheme;
  label: string;
  // Hex colors for Canvas 2D PDF export
  sheetBg: string;
  matBg: string;
  border: string;
  subtleBorder: string;
  primaryText: string;
  bodyText: string;
  mutedText: string;
  faintText: string;
  accentBar: string;
  imageRing: string;
  // Tailwind classes for live preview sheets
  sheetClass: string;
  matClass: string;
  borderClass: string;
  dividerBgClass: string;
  subtleBorderClass: string;
  accentBarClass: string;
  primaryTextClass: string;
  bodyTextClass: string;
  mutedTextClass: string;
  faintTextClass: string;
  inputBorderClass: string;
  textareaBorderClass: string;
  imgRingClass: string;
  orderBtnClass: string;
  swatchClass: string;
}

export const ALBUM_THEMES: Record<AlbumTheme, ThemePalette> = {
  white: {
    id: 'white',
    label: '흰색(깔끔)',
    sheetBg: '#FFFFFF',
    matBg: '#FAFAFA',
    border: '#E4E4E7',
    subtleBorder: '#F4F4F5',
    primaryText: '#18181B',
    bodyText: '#3F3F46',
    mutedText: '#71717A',
    faintText: '#A1A1AA',
    accentBar: '#18181B',
    imageRing: 'rgba(24, 24, 27, 0.08)',
    sheetClass: 'bg-white text-zinc-900',
    matClass: 'bg-zinc-50',
    borderClass: 'border-zinc-200',
    dividerBgClass: 'bg-zinc-200',
    subtleBorderClass: 'border-zinc-100',
    accentBarClass: 'bg-zinc-900',
    primaryTextClass: 'text-zinc-900 placeholder:text-zinc-300',
    bodyTextClass: 'text-zinc-700 placeholder:text-zinc-300',
    mutedTextClass: 'text-zinc-500',
    faintTextClass: 'text-zinc-400',
    inputBorderClass: 'border-transparent hover:border-zinc-200 focus:border-zinc-400',
    textareaBorderClass: 'border-transparent hover:border-zinc-200 focus:border-zinc-300',
    imgRingClass: 'shadow-[0_0_0_1px_rgba(24,24,27,0.08)]',
    orderBtnClass: 'hover:bg-zinc-100 hover:text-zinc-800',
    swatchClass: 'bg-white border-zinc-300',
  },
  beige: {
    id: 'beige',
    label: '베이지(따뜻한 종이)',
    sheetBg: '#F7F1E5',
    matBg: '#EFE7D6',
    border: '#DFD3BD',
    subtleBorder: '#E8DEC9',
    primaryText: '#2C241B',
    bodyText: '#4B3F31',
    mutedText: '#786957',
    faintText: '#8C7C68',
    accentBar: '#2C241B',
    imageRing: 'rgba(44, 36, 27, 0.12)',
    sheetClass: 'bg-[#F7F1E5] text-[#2C241B]',
    matClass: 'bg-[#EFE7D6]',
    borderClass: 'border-[#DFD3BD]',
    dividerBgClass: 'bg-[#DFD3BD]',
    subtleBorderClass: 'border-[#E8DEC9]',
    accentBarClass: 'bg-[#2C241B]',
    primaryTextClass: 'text-[#2C241B] placeholder:text-[#BCAE9B]',
    bodyTextClass: 'text-[#4B3F31] placeholder:text-[#BCAE9B]',
    mutedTextClass: 'text-[#786957]',
    faintTextClass: 'text-[#8C7C68]',
    inputBorderClass: 'border-transparent hover:border-[#CBBCA2] focus:border-[#786957]',
    textareaBorderClass: 'border-transparent hover:border-[#CBBCA2] focus:border-[#786957]',
    imgRingClass: 'shadow-[0_0_0_1px_rgba(44,36,27,0.12)]',
    orderBtnClass: 'hover:bg-[#E7DCC7] hover:text-[#2C241B]',
    swatchClass: 'bg-[#F7F1E5] border-[#CBBCA2]',
  },
  navy: {
    id: 'navy',
    label: '네이비(차분함)',
    sheetBg: '#101B2E',
    matBg: '#16243D',
    border: '#263959',
    subtleBorder: '#1E2F4C',
    primaryText: '#F4F6FA',
    bodyText: '#D3DCEB',
    mutedText: '#95A5C0',
    faintText: '#7E91B0',
    accentBar: '#E2E8F0',
    imageRing: 'rgba(244, 246, 250, 0.14)',
    sheetClass: 'bg-[#101B2E] text-[#F4F6FA]',
    matClass: 'bg-[#16243D]',
    borderClass: 'border-[#263959]',
    dividerBgClass: 'bg-[#263959]',
    subtleBorderClass: 'border-[#1E2F4C]',
    accentBarClass: 'bg-[#E2E8F0]',
    primaryTextClass: 'text-[#F4F6FA] placeholder:text-[#536788] tracking-[0.01em]',
    bodyTextClass: 'text-[#D3DCEB] placeholder:text-[#536788] tracking-[0.01em]',
    mutedTextClass: 'text-[#95A5C0]',
    faintTextClass: 'text-[#7E91B0]',
    inputBorderClass: 'border-transparent hover:border-[#354D75] focus:border-[#95A5C0]',
    textareaBorderClass: 'border-transparent hover:border-[#354D75] focus:border-[#95A5C0]',
    imgRingClass: 'shadow-[0_0_0_1px_rgba(244,246,250,0.14)]',
    orderBtnClass: 'hover:bg-[#1E2F4C] hover:text-[#F4F6FA]',
    swatchClass: 'bg-[#101B2E] border-[#354D75]',
  },
};

export const THEME_OPTIONS: ThemePalette[] = [
  ALBUM_THEMES.white,
  ALBUM_THEMES.beige,
  ALBUM_THEMES.navy,
];

export function getThemePalette(theme?: AlbumTheme): ThemePalette {
  return ALBUM_THEMES[theme || 'white'] ?? ALBUM_THEMES.white;
}
