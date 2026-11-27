import React, { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  RefreshCw,
  ArrowLeftRight,
  Image as ImageIcon,
} from 'lucide-react';
import { AlbumPhoto, AlbumSettings } from '../types/album';
import { getThemePalette } from '../utils/themes';
import { getFontPreset } from '../utils/fonts';

interface AlbumPageViewerProps {
  photo: AlbumPhoto;
  currentIndex: number;
  totalCount: number;
  direction: number;
  settings: AlbumSettings;
  onPrev: () => void;
  onNext: () => void;
  onUpdatePhoto: (id: string, patch: Partial<Pick<AlbumPhoto, 'title' | 'description'>>) => void;
  onReplacePhoto: (id: string, file: File) => void;
  onDeletePhoto: (id: string) => void;
  onMovePhoto: (index: number, delta: -1 | 1) => void;
}

export const AlbumPageViewer: React.FC<AlbumPageViewerProps> = ({
  photo,
  currentIndex,
  totalCount,
  direction,
  settings,
  onPrev,
  onNext,
  onUpdatePhoto,
  onReplacePhoto,
  onDeletePhoto,
  onMovePhoto,
}) => {
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [imgError, setImgError] = useState(false);

  const pageNumberLabel = `${String(currentIndex + 1).padStart(2, '0')} / ${String(
    totalCount
  ).padStart(2, '0')}`;

  const isLandscape = settings.orientation === 'landscape';
  const palette = getThemePalette(settings.theme);
  const fontPreset = getFontPreset(settings.font);

  const handleReplaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImgError(false);
      onReplacePhoto(photo.id, file);
    }
    e.target.value = '';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleReplaceFile}
      />

      {/* Single-photo-per-page editorial monograph sheet */}
      <div className="flex justify-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={`${photo.id}-${settings.orientation}`}
            initial={{ opacity: 0, x: direction >= 0 ? 14 : -14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction >= 0 ? -14 : 14 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={`w-full album-sheet-shadow rounded-xs transition-colors duration-200 ${
              palette.sheetClass
            } ${
              isLandscape
                ? 'max-w-5xl p-5 sm:p-8 lg:p-10'
                : 'max-w-[600px] p-5 sm:p-8'
            }`}
          >
            {isLandscape ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-9 items-stretch lg:min-h-[520px]">
                {/* Photo Stage (Left 64%) */}
                <div
                  className={`lg:col-span-8 relative group rounded-xs p-3 sm:p-5 flex items-center justify-center min-h-[280px] sm:min-h-[400px] lg:min-h-[500px] transition-colors duration-200 ${palette.matClass}`}
                >
                  {!imgError ? (
                    <img
                      src={photo.previewUrl}
                      alt={photo.title || `앨범 ${currentIndex + 1}페이지 사진`}
                      referrerPolicy="no-referrer"
                      onError={() => setImgError(true)}
                      className={`max-w-full max-h-[460px] w-auto h-auto object-contain ${palette.imgRingClass}`}
                    />
                  ) : (
                    <div className={`flex flex-col items-center justify-center gap-2 p-8 ${palette.mutedTextClass}`}>
                      <ImageIcon className="w-8 h-8" aria-hidden="true" />
                      <span className="text-xs">{photo.fileName}</span>
                    </div>
                  )}

                  {/* Quick photo actions on hover/focus */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-95 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => replaceInputRef.current?.click()}
                      title="이 사진 교체"
                      className="inline-flex items-center gap-1.5 h-8 px-2.5 text-xs font-medium bg-white/95 text-zinc-700 hover:text-zinc-900 border border-zinc-200 rounded-md shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>교체</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePhoto(photo.id)}
                      title="이 페이지 삭제"
                      className="inline-flex items-center gap-1 h-8 px-2.5 text-xs font-medium bg-white/95 text-zinc-600 hover:text-red-600 border border-zinc-200 rounded-md shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>삭제</span>
                    </button>
                  </div>
                </div>

                {/* Typography & Caption Column (Right 36%) */}
                <div className="lg:col-span-4 flex flex-col justify-between py-1">
                  <div className="flex flex-col flex-1">
                    {/* Page counter + page order arrows */}
                    <div
                      className={`flex items-center justify-between gap-2 pb-3 border-b transition-colors duration-200 ${palette.borderClass}`}
                    >
                      <span className={`font-mono text-xs font-medium tabular-nums ${palette.mutedTextClass}`}>
                        {pageNumberLabel}
                      </span>
                      {totalCount > 1 && (
                        <div className={`flex items-center gap-1 text-xs ${palette.faintTextClass}`}>
                          <ArrowLeftRight className="w-3 h-3 mr-0.5" aria-hidden="true" />
                          <button
                            type="button"
                            onClick={() => onMovePhoto(currentIndex, -1)}
                            disabled={currentIndex === 0}
                            aria-label="현재 페이지를 앞으로 이동"
                            className={`px-1.5 py-0.5 rounded disabled:opacity-30 disabled:pointer-events-none transition-colors ${palette.orderBtnClass}`}
                          >
                            앞으로
                          </button>
                          <span aria-hidden="true">·</span>
                          <button
                            type="button"
                            onClick={() => onMovePhoto(currentIndex, 1)}
                            disabled={currentIndex === totalCount - 1}
                            aria-label="현재 페이지를 뒤로 이동"
                            className={`px-1.5 py-0.5 rounded disabled:opacity-30 disabled:pointer-events-none transition-colors ${palette.orderBtnClass}`}
                          >
                            뒤로
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Editable Title */}
                    <div className="mt-5">
                      <label htmlFor={`photo-title-${photo.id}`} className="sr-only">
                        사진 제목
                      </label>
                      <input
                        id={`photo-title-${photo.id}`}
                        type="text"
                        value={photo.title}
                        onChange={(e) =>
                          onUpdatePhoto(photo.id, { title: e.target.value })
                        }
                        placeholder="사진 제목을 입력하세요"
                        maxLength={80}
                        className={`w-full bg-transparent border-b focus:outline-none pb-1.5 transition-colors ${fontPreset.photoTitleLandscapeClass} ${palette.primaryTextClass} ${palette.inputBorderClass}`}
                      />
                    </div>

                    {/* Editable Description */}
                    <div className="mt-4 flex-1 flex flex-col">
                      <label htmlFor={`photo-desc-${photo.id}`} className="sr-only">
                        사진 설명
                      </label>
                      <textarea
                        id={`photo-desc-${photo.id}`}
                        value={photo.description}
                        onChange={(e) =>
                          onUpdatePhoto(photo.id, { description: e.target.value })
                        }
                        placeholder="이 사진에 담긴 이야기나 기록을 적어보세요..."
                        rows={7}
                        maxLength={800}
                        className={`w-full flex-1 bg-transparent border rounded-sm p-1.5 -mx-1.5 resize-none focus:outline-none transition-colors ${fontPreset.photoDescLandscapeClass} ${palette.bodyTextClass} ${palette.textareaBorderClass}`}
                      />
                    </div>
                  </div>

                  {/* Subtle album title footer */}
                  <div
                    className={`pt-4 mt-4 border-t flex items-center justify-between gap-3 text-xs transition-colors duration-200 ${palette.subtleBorderClass} ${palette.faintTextClass}`}
                  >
                    <span className={`truncate ${fontPreset.fontClass}`}>
                      {settings.albumTitle.trim() || '나의 사진 앨범'}
                    </span>
                    <span className="font-mono text-[11px] tabular-nums shrink-0">
                      {photo.width} × {photo.height}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Portrait A4 layout: Top photo stage + Bottom caption block */
              <div className="flex flex-col">
                <div
                  className={`relative group rounded-xs p-3 sm:p-5 flex items-center justify-center h-[320px] sm:h-[400px] transition-colors duration-200 ${palette.matClass}`}
                >
                  {!imgError ? (
                    <img
                      src={photo.previewUrl}
                      alt={photo.title || `앨범 ${currentIndex + 1}페이지 사진`}
                      referrerPolicy="no-referrer"
                      onError={() => setImgError(true)}
                      className={`max-w-full max-h-full w-auto h-auto object-contain ${palette.imgRingClass}`}
                    />
                  ) : (
                    <div className={`flex flex-col items-center justify-center gap-2 p-8 ${palette.mutedTextClass}`}>
                      <ImageIcon className="w-8 h-8" aria-hidden="true" />
                      <span className="text-xs">{photo.fileName}</span>
                    </div>
                  )}

                  <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-95 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => replaceInputRef.current?.click()}
                      title="이 사진 교체"
                      className="inline-flex items-center gap-1.5 h-8 px-2.5 text-xs font-medium bg-white/95 text-zinc-700 hover:text-zinc-900 border border-zinc-200 rounded-md shadow-xs transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>교체</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePhoto(photo.id)}
                      title="이 페이지 삭제"
                      className="inline-flex items-center gap-1 h-8 px-2.5 text-xs font-medium bg-white/95 text-zinc-600 hover:text-red-600 border border-zinc-200 rounded-md shadow-xs transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>삭제</span>
                    </button>
                  </div>
                </div>

                <div
                  className={`pt-5 mt-5 border-t transition-colors duration-200 ${palette.borderClass}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <label htmlFor={`photo-title-${photo.id}`} className="sr-only">
                        사진 제목
                      </label>
                      <input
                        id={`photo-title-${photo.id}`}
                        type="text"
                        value={photo.title}
                        onChange={(e) =>
                          onUpdatePhoto(photo.id, { title: e.target.value })
                        }
                        placeholder="사진 제목을 입력하세요"
                        maxLength={80}
                        className={`w-full bg-transparent border-b focus:outline-none pb-1 transition-colors ${fontPreset.photoTitlePortraitClass} ${palette.primaryTextClass} ${palette.inputBorderClass}`}
                      />
                    </div>
                    <span className={`font-mono text-xs font-medium tabular-nums pt-1.5 shrink-0 ${palette.mutedTextClass}`}>
                      {pageNumberLabel}
                    </span>
                  </div>

                  <div>
                    <label htmlFor={`photo-desc-${photo.id}`} className="sr-only">
                      사진 설명
                    </label>
                    <textarea
                      id={`photo-desc-${photo.id}`}
                      value={photo.description}
                      onChange={(e) =>
                        onUpdatePhoto(photo.id, { description: e.target.value })
                      }
                      placeholder="이 사진에 담긴 이야기나 기록을 적어보세요..."
                      rows={4}
                      maxLength={800}
                      className={`w-full bg-transparent border rounded-sm p-1.5 -mx-1.5 resize-none focus:outline-none transition-colors ${fontPreset.photoDescPortraitClass} ${palette.bodyTextClass} ${palette.textareaBorderClass}`}
                    />
                  </div>

                  <div
                    className={`pt-3 mt-3 border-t flex items-center justify-between gap-3 text-xs transition-colors duration-200 ${palette.subtleBorderClass} ${palette.faintTextClass}`}
                  >
                    <span className={`truncate ${fontPreset.fontClass}`}>
                      {settings.albumTitle.trim() || '나의 사진 앨범'}
                    </span>
                    {totalCount > 1 && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onMovePhoto(currentIndex, -1)}
                          disabled={currentIndex === 0}
                          className={`px-1.5 py-0.5 rounded disabled:opacity-30 disabled:pointer-events-none ${palette.orderBtnClass}`}
                        >
                          앞으로
                        </button>
                        <span aria-hidden="true">·</span>
                        <button
                          type="button"
                          onClick={() => onMovePhoto(currentIndex, 1)}
                          disabled={currentIndex === totalCount - 1}
                          className={`px-1.5 py-0.5 rounded disabled:opacity-30 disabled:pointer-events-none ${palette.orderBtnClass}`}
                        >
                          뒤로
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.article>
        </AnimatePresence>
      </div>

      {/* Prominent Previous / Next Navigation Bar */}
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
            {pageNumberLabel}
          </span>
          <span className="hidden sm:inline" aria-hidden="true">
            ·
          </span>
          <span className="hidden sm:inline">좌우 방향키로 넘기기</span>
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
