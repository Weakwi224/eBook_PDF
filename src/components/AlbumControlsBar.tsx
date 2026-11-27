import React from 'react';
import { AlbumFont, AlbumSettings, AlbumTheme, PageOrientation, ViewMode } from '../types/album';
import { THEME_OPTIONS } from '../utils/themes';
import { FONT_OPTIONS } from '../utils/fonts';

interface AlbumControlsBarProps {
  settings: AlbumSettings;
  photoCount: number;
  viewMode: ViewMode;
  onUpdateSettings: (patch: Partial<AlbumSettings>) => void;
  onChangeViewMode: (mode: ViewMode) => void;
  onTriggerUpload: () => void;
  onExportPNG: () => void;
  onJumpToCover: () => void;
  onJumpToClosing: () => void;
}

export const AlbumControlsBar: React.FC<AlbumControlsBarProps> = ({
  settings,
  photoCount,
  viewMode,
  onUpdateSettings,
  onChangeViewMode,
  onTriggerUpload,
  onExportPNG,
  onJumpToCover,
  onJumpToClosing,
}) => {
  const handleOrientationChange = (orientation: PageOrientation) => {
    onUpdateSettings({ orientation });
  };

  const handleThemeChange = (theme: AlbumTheme) => {
    onUpdateSettings({ theme });
  };

  const handleFontChange = (font: AlbumFont) => {
    onUpdateSettings({ font });
  };

  return (
    <div className="border-b border-zinc-200 bg-zinc-50/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Album title & quick cover/closing jumps */}
        <div className="flex flex-wrap items-center gap-4 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <label
              htmlFor="album-title-input"
              className="text-xs font-medium text-zinc-500 whitespace-nowrap shrink-0"
            >
              앨범 제목
            </label>
            <input
              id="album-title-input"
              type="text"
              value={settings.albumTitle}
              onChange={(e) => onUpdateSettings({ albumTitle: e.target.value })}
              placeholder="나의 사진 앨범"
              maxLength={60}
              className="h-9 px-2.5 text-sm font-medium text-zinc-900 bg-white border border-zinc-200 rounded-md w-40 sm:w-48 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
            />
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs text-zinc-500">
            <button
              type="button"
              onClick={onJumpToCover}
              className="hover:text-zinc-900 underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
            >
              표지 편집
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={onJumpToClosing}
              className="hover:text-zinc-900 underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
            >
              마무리 편집
            </button>
          </div>
        </div>

        {/* Font selector, Color mood selector, orientation selector & count */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mobile view switcher */}
          <div className="flex md:hidden items-center gap-1 p-1 bg-zinc-200/70 rounded-lg">
            <button
              type="button"
              onClick={() => onChangeViewMode('album')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                viewMode === 'album'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600'
              }`}
            >
              한 장씩
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode('overview')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                viewMode === 'overview'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600'
              }`}
            >
              전체
            </button>
            <button
              type="button"
              onClick={onTriggerUpload}
              className="px-2.5 py-1 text-xs font-medium rounded-md text-zinc-700 whitespace-nowrap shrink-0"
            >
              + 추가
            </button>
            <button
              type="button"
              onClick={onExportPNG}
              className="px-2.5 py-1 text-xs font-medium rounded-md text-zinc-700 whitespace-nowrap shrink-0"
            >
              PNG
            </button>
          </div>

          {/* 3 Font Choice Buttons */}
          <div
            role="group"
            aria-label="글꼴 선택"
            className="flex items-center gap-1 p-1 bg-zinc-200/70 rounded-lg"
          >
            {FONT_OPTIONS.map((option) => {
              const isSelected = (settings.font || 'serif') === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleFontChange(option.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    option.fontClass
                  } ${
                    isSelected
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {/* 3 Album Color Mood Buttons */}
          <div
            role="group"
            aria-label="앨범 색 분위기 선택"
            className="flex items-center gap-1 p-1 bg-zinc-200/70 rounded-lg"
          >
            {THEME_OPTIONS.map((option) => {
              const isSelected = (settings.theme || 'white') === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleThemeChange(option.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    isSelected
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`w-3 h-3 rounded-full border shrink-0 ${option.swatchClass}`}
                  />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>

          {/* Paper orientation segmented control */}
          <div
            role="group"
            aria-label="페이지 방향 선택"
            className="flex items-center gap-1 p-1 bg-zinc-200/70 rounded-lg"
          >
            <button
              type="button"
              onClick={() => handleOrientationChange('landscape')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                settings.orientation === 'landscape'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              가로 A4
            </button>
            <button
              type="button"
              onClick={() => handleOrientationChange('portrait')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                settings.orientation === 'portrait'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              세로 A4
            </button>
          </div>

          <span className="text-xs text-zinc-500 tabular-nums whitespace-nowrap shrink-0">
            표지 · 사진 {photoCount}장 · 마무리
          </span>
        </div>
      </div>
    </div>
  );
};
