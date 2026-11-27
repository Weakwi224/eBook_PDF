import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AlbumSettings } from '../types/album';
import { getThemePalette } from '../utils/themes';
import { getFontPreset } from '../utils/fonts';

interface CoverPageViewerProps {
  settings: AlbumSettings;
  photoCount: number;
  totalPages: number;
  direction: number;
  onUpdateSettings: (patch: Partial<AlbumSettings>) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const CoverPageViewer: React.FC<CoverPageViewerProps> = ({
  settings,
  photoCount,
  totalPages,
  direction,
  onUpdateSettings,
  onPrev,
  onNext,
}) => {
  const isLandscape = settings.orientation === 'landscape';
  const palette = getThemePalette(settings.theme);
  const fontPreset = getFontPreset(settings.font);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex justify-center">
        <motion.article
          key={`cover-${settings.orientation}`}
          initial={{ opacity: 0, x: direction >= 0 ? 14 : -14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction >= 0 ? -14 : 14 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className={`w-full album-sheet-shadow rounded-xs flex flex-col justify-between transition-colors duration-200 ${
            palette.sheetClass
          } ${
            isLandscape
              ? 'max-w-5xl p-7 sm:p-12 lg:p-14 min-h-[460px] lg:min-h-[580px]'
              : 'max-w-[600px] p-7 sm:p-12 min-h-[560px] sm:min-h-[680px]'
          }`}
        >
          {/* Inner architectural frame */}
          <div
            className={`flex-1 border p-6 sm:p-10 lg:p-12 flex flex-col justify-between transition-colors duration-200 ${palette.borderClass}`}
          >
            {/* Top header row */}
            <div className="flex items-center justify-between gap-4 text-xs">
              <span className={`font-medium tracking-wide ${palette.bodyTextClass}`}>
                앨범 표지
              </span>
              <span className={`font-mono tabular-nums ${palette.mutedTextClass}`}>
                총 {photoCount}장의 사진
              </span>
            </div>

            {/* Center large typographic cover fields */}
            <div className="my-auto py-8 sm:py-10">
              <div className="mb-5">
                <label
                  htmlFor="cover-title-input"
                  className={`block text-xs font-medium mb-2 ${palette.faintTextClass}`}
                >
                  제목
                </label>
                <textarea
                  id="cover-title-input"
                  value={settings.albumTitle}
                  onChange={(e) =>
                    onUpdateSettings({ albumTitle: e.target.value })
                  }
                  placeholder="앨범 제목을 입력하세요"
                  rows={2}
                  maxLength={60}
                  className={`w-full bg-transparent border-b focus:outline-none resize-none pb-2 transition-colors ${fontPreset.coverTitleClass} ${palette.primaryTextClass} ${palette.inputBorderClass}`}
                />
              </div>

              <div
                className={`w-16 h-[2px] mb-6 transition-colors duration-200 ${palette.accentBarClass}`}
                aria-hidden="true"
              />

              <div>
                <label
                  htmlFor="cover-subtitle-input"
                  className={`block text-xs font-medium mb-1.5 ${palette.faintTextClass}`}
                >
                  부제
                </label>
                <input
                  id="cover-subtitle-input"
                  type="text"
                  value={settings.albumSubtitle}
                  onChange={(e) =>
                    onUpdateSettings({ albumSubtitle: e.target.value })
                  }
                  placeholder="부제를 입력하세요 (예: 함께 걸었던 계절의 기록)"
                  maxLength={90}
                  className={`w-full bg-transparent border-b focus:outline-none pb-1.5 transition-colors ${fontPreset.coverSubtitleClass} ${palette.bodyTextClass} ${palette.inputBorderClass}`}
                />
              </div>
            </div>

            {/* Bottom prominent author name & date */}
            <div
              className={`pt-6 border-t grid grid-cols-1 sm:grid-cols-2 gap-6 transition-colors duration-200 ${palette.borderClass}`}
            >
              <div>
                <label
                  htmlFor="cover-author-input"
                  className={`block text-xs font-medium mb-1 ${palette.faintTextClass}`}
                >
                  이름
                </label>
                <input
                  id="cover-author-input"
                  type="text"
                  value={settings.authorName}
                  onChange={(e) =>
                    onUpdateSettings({ authorName: e.target.value })
                  }
                  placeholder="이름을 입력하세요"
                  maxLength={40}
                  className={`w-full bg-transparent border-b focus:outline-none pb-1 transition-colors ${fontPreset.coverAuthorClass} ${palette.primaryTextClass} ${palette.inputBorderClass}`}
                />
              </div>

              <div className="sm:text-right">
                <label
                  htmlFor="cover-date-input"
                  className={`block text-xs font-medium mb-1 ${palette.faintTextClass}`}
                >
                  날짜
                </label>
                <input
                  id="cover-date-input"
                  type="text"
                  value={settings.albumDate}
                  onChange={(e) =>
                    onUpdateSettings({ albumDate: e.target.value })
                  }
                  placeholder="2026. 11. 26."
                  maxLength={40}
                  className={`w-full sm:text-right font-mono text-lg sm:text-xl font-medium tabular-nums bg-transparent border-b focus:outline-none pb-1 transition-colors ${palette.bodyTextClass} ${palette.inputBorderClass}`}
                />
              </div>
            </div>
          </div>
        </motion.article>
      </div>

      {/* Previous / Next Navigation Bar */}
      <nav
        aria-label="페이지 넘기기"
        className={`mx-auto mt-6 flex items-center justify-between gap-4 ${
          isLandscape ? 'max-w-5xl' : 'max-w-[600px]'
        }`}
      >
        <button
          type="button"
          onClick={onPrev}
          disabled
          className="inline-flex items-center gap-2 min-h-[44px] px-5 text-sm font-medium bg-white text-zinc-900 border border-zinc-200 rounded-lg opacity-40 pointer-events-none whitespace-nowrap shrink-0"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span>이전</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="font-mono text-sm font-medium text-zinc-900 tabular-nums">
            표지 (01 / {String(totalPages).padStart(2, '0')})
          </span>
          <span className="hidden sm:inline" aria-hidden="true">
            ·
          </span>
          <span className="hidden sm:inline">다음 버튼으로 첫 사진을 보세요</span>
        </div>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 min-h-[44px] px-5 text-sm font-medium bg-white text-zinc-900 border border-zinc-200 rounded-lg hover:border-zinc-400 hover:bg-zinc-50 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <span>다음</span>
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
};
