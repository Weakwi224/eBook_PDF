import React from 'react';
import { Plus, BookOpen, PenLine } from 'lucide-react';
import { AlbumPhoto, AlbumSettings } from '../types/album';

interface FilmstripNavProps {
  photos: AlbumPhoto[];
  settings: AlbumSettings;
  currentPage: number; // 0 = Cover, 1..photos.length = Photo, photos.length + 1 = Closing
  onSelectPage: (page: number) => void;
  onTriggerUpload: () => void;
}

export const FilmstripNav: React.FC<FilmstripNavProps> = ({
  photos,
  settings,
  currentPage,
  onSelectPage,
  onTriggerUpload,
}) => {
  const closingPageIndex = photos.length + 1;
  const isCoverActive = currentPage === 0;
  const isClosingActive = currentPage === closingPageIndex;

  return (
    <section
      aria-label="페이지 썸네일 목록"
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-10"
    >
      <div className="pt-5 border-t border-zinc-200">
        <div className="flex items-center gap-3 overflow-x-auto filmstrip-scroll pb-2 pt-1 px-0.5">
          {/* Cover Page Thumbnail */}
          <button
            type="button"
            onClick={() => onSelectPage(0)}
            aria-label="표지 페이지"
            aria-current={isCoverActive ? 'page' : undefined}
            className={`shrink-0 w-24 text-left rounded-md p-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
              isCoverActive
                ? 'bg-white ring-2 ring-zinc-900 shadow-xs'
                : 'bg-white/60 hover:bg-white ring-1 ring-zinc-200'
            }`}
          >
            <div className="aspect-[4/3] w-full bg-zinc-50 border border-zinc-200 rounded-xs mb-1.5 flex flex-col items-center justify-center px-1 text-center">
              <BookOpen className="w-3.5 h-3.5 text-zinc-500 mb-0.5" aria-hidden="true" />
              <span className="font-serif text-[10px] font-semibold text-zinc-800 line-clamp-1">
                {settings.albumTitle.trim() || '표지'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-1 px-0.5">
              <span
                className={`text-[11px] ${
                  isCoverActive ? 'font-semibold text-zinc-900' : 'text-zinc-600'
                }`}
              >
                표지
              </span>
              <span className="font-mono text-[10px] text-zinc-400 tabular-nums">
                첫 쪽
              </span>
            </div>
          </button>

          {/* Photo Thumbnails */}
          {photos.map((photo, index) => {
            const pageNumber = index + 1;
            const isActive = currentPage === pageNumber;
            return (
              <button
                key={photo.id}
                type="button"
                onClick={() => onSelectPage(pageNumber)}
                aria-label={`${pageNumber}번 사진${photo.title ? `: ${photo.title}` : ''}`}
                aria-current={isActive ? 'page' : undefined}
                className={`group shrink-0 w-24 text-left rounded-md p-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isActive
                    ? 'bg-white ring-2 ring-zinc-900 shadow-xs'
                    : 'bg-white/60 hover:bg-white ring-1 ring-zinc-200'
                }`}
              >
                <div className="aspect-[4/3] w-full bg-zinc-100 rounded-xs overflow-hidden mb-1.5 flex items-center justify-center">
                  <img
                    src={photo.previewUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between gap-1 px-0.5">
                  <span
                    className={`font-mono text-[11px] tabular-nums ${
                      isActive ? 'font-semibold text-zinc-900' : 'text-zinc-500'
                    }`}
                  >
                    {String(pageNumber).padStart(2, '0')}
                  </span>
                  <span className="text-[11px] text-zinc-500 truncate">
                    {photo.title.trim() || '제목 없음'}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Closing Page Thumbnail */}
          <button
            type="button"
            onClick={() => onSelectPage(closingPageIndex)}
            aria-label="마무리 페이지"
            aria-current={isClosingActive ? 'page' : undefined}
            className={`shrink-0 w-24 text-left rounded-md p-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
              isClosingActive
                ? 'bg-white ring-2 ring-zinc-900 shadow-xs'
                : 'bg-white/60 hover:bg-white ring-1 ring-zinc-200'
            }`}
          >
            <div className="aspect-[4/3] w-full bg-zinc-50 border border-zinc-200 rounded-xs mb-1.5 flex flex-col items-center justify-center px-1 text-center">
              <PenLine className="w-3.5 h-3.5 text-zinc-500 mb-0.5" aria-hidden="true" />
              <span className="font-serif text-[10px] text-zinc-600 line-clamp-1">
                {settings.closingNote.trim() ? '작성됨' : '마무리 글'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-1 px-0.5">
              <span
                className={`text-[11px] ${
                  isClosingActive ? 'font-semibold text-zinc-900' : 'text-zinc-600'
                }`}
              >
                마무리
              </span>
              <span className="font-mono text-[10px] text-zinc-400 tabular-nums">
                끝 쪽
              </span>
            </div>
          </button>

          {/* Add Photo Button */}
          <button
            type="button"
            onClick={onTriggerUpload}
            className="shrink-0 w-24 h-[92px] rounded-md border border-dashed border-zinc-300 bg-zinc-50/70 hover:bg-white hover:border-zinc-400 flex flex-col items-center justify-center gap-1 text-zinc-500 hover:text-zinc-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span className="text-xs font-medium">사진 추가</span>
          </button>
        </div>
      </div>
    </section>
  );
};
