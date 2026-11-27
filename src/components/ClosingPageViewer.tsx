import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AlbumSettings } from '../types/album';
import { getThemePalette } from '../utils/themes';
import { getFontPreset } from '../utils/fonts';

interface ClosingPageViewerProps {
  settings: AlbumSettings;
  totalPages: number;
  direction: number;
  onUpdateSettings: (patch: Partial<AlbumSettings>) => void;
  onPrev: () => void;
  onNext: () => void;
}

export const ClosingPageViewer: React.FC<ClosingPageViewerProps> = ({
  settings,
  totalPages,
  direction,
  onUpdateSettings,
  onPrev,
  onNext,
}) => {
  const isLandscape = settings.orientation === 'landscape';
  const palette = getThemePalette(settings.theme);
  const fontPreset = getFontPreset(settings.font);

  const colophonParts = [
    settings.albumTitle.trim(),
    settings.authorName.trim(),
    settings.albumDate.trim(),
  ].filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex justify-center">
        <motion.article
          key={`closing-${settings.orientation}`}
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
          <div
            className={`flex-1 border p-6 sm:p-10 lg:p-12 flex flex-col justify-between transition-colors duration-200 ${palette.borderClass}`}
          >
            {/* Top label */}
            <div className="flex items-center justify-between gap-4 text-xs">
              <span className={`font-medium tracking-wide ${palette.bodyTextClass}`}>
                마무리
              </span>
              <span className={`font-mono tabular-nums ${palette.mutedTextClass}`}>
                {String(totalPages).padStart(2, '0')} /{' '}
                {String(totalPages).padStart(2, '0')}
              </span>
            </div>

            {/* Center closing note editor */}
            <div className="my-auto py-8 max-w-2xl mx-auto w-full text-center">
              <label
                htmlFor="closing-note-input"
                className={`block text-xs font-medium mb-4 ${palette.faintTextClass}`}
              >
                마무리 문구
              </label>
              <textarea
                id="closing-note-input"
                value={settings.closingNote}
                onChange={(e) =>
                  onUpdateSettings({ closingNote: e.target.value })
                }
                placeholder="앨범을 마무리하며 남기고 싶은 문구나 인사를 적어보세요..."
                rows={6}
                maxLength={600}
                className={`w-full text-center bg-transparent border rounded-sm p-3 resize-none focus:outline-none transition-colors ${fontPreset.closingNoteClass} ${palette.primaryTextClass} ${palette.textareaBorderClass}`}
              />
              <p className={`mt-4 text-xs ${palette.faintTextClass}`}>
                작성한 문구는 PDF의 마지막 쪽에 함께 저장됩니다
              </p>
            </div>

            {/* Bottom colophon */}
            <div
              className={`pt-6 border-t text-center text-xs transition-colors duration-200 ${fontPreset.fontClass} ${palette.borderClass} ${palette.faintTextClass}`}
            >
              {colophonParts.length > 0 ? (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {colophonParts.map((part, idx) => (
                    <React.Fragment key={`${part}-${idx}`}>
                      {idx > 0 && <span aria-hidden="true">·</span>}
                      <span>{part}</span>
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <span>나의 사진 앨범</span>
              )}
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
          className="inline-flex items-center gap-2 min-h-[44px] px-5 text-sm font-medium bg-white text-zinc-900 border border-zinc-200 rounded-lg hover:border-zinc-400 hover:bg-zinc-50 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          <span>이전</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="font-mono text-sm font-medium text-zinc-900 tabular-nums">
            마무리 ({String(totalPages).padStart(2, '0')} /{' '}
            {String(totalPages).padStart(2, '0')})
          </span>
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled
          className="inline-flex items-center gap-2 min-h-[44px] px-5 text-sm font-medium bg-white text-zinc-900 border border-zinc-200 rounded-lg opacity-40 pointer-events-none whitespace-nowrap shrink-0"
        >
          <span>다음</span>
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </nav>
    </div>
  );
};
