import React from 'react';
import { ChevronLeft, ChevronRight, Trash2, Plus } from 'lucide-react';
import { AlbumPhoto, AlbumSettings } from '../types/album';

interface ContactSheetViewProps {
  photos: AlbumPhoto[];
  settings: AlbumSettings;
  currentPage: number;
  onSelectPage: (page: number) => void;
  onUpdatePhoto: (id: string, patch: Partial<Pick<AlbumPhoto, 'title' | 'description'>>) => void;
  onMovePhoto: (index: number, delta: -1 | 1) => void;
  onDeletePhoto: (id: string) => void;
  onTriggerUpload: () => void;
}

export const ContactSheetView: React.FC<ContactSheetViewProps> = ({
  photos,
  settings,
  currentPage,
  onSelectPage,
  onUpdatePhoto,
  onMovePhoto,
  onDeletePhoto,
  onTriggerUpload,
}) => {
  const closingPage = photos.length + 1;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-zinc-900 tracking-tight">
            전체 페이지 구성
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            표지와 마무리 페이지, 각 사진 페이지를 클릭하면 한 장씩 보기 화면으로 이동합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={onTriggerUpload}
          className="inline-flex items-center gap-2 h-10 px-4 text-sm font-medium bg-white text-zinc-900 border border-zinc-200 rounded-lg hover:border-zinc-400 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>사진 추가</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Cover Page Card */}
        <article
          className={`bg-white rounded-sm p-4 album-sheet-shadow flex flex-col justify-between transition-shadow ${
            currentPage === 0 ? 'ring-2 ring-zinc-900' : ''
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="font-mono text-xs font-medium text-zinc-500">
                첫 쪽 · 표지
              </span>
            </div>

            <button
              type="button"
              onClick={() => onSelectPage(0)}
              className="w-full aspect-[4/3] bg-zinc-50 border border-zinc-200 rounded-xs p-5 flex flex-col justify-between text-left mb-4 hover:bg-zinc-100/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <span className="text-[11px] text-zinc-400">앨범 표지</span>
              <div>
                <p className="font-serif text-lg font-semibold text-zinc-900 line-clamp-2">
                  {settings.albumTitle.trim() || '나의 사진 앨범'}
                </p>
                {settings.albumSubtitle.trim() && (
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                    {settings.albumSubtitle}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-200">
                <span>{settings.authorName.trim() || '이름 미입력'}</span>
                <span className="font-mono tabular-nums">{settings.albumDate}</span>
              </div>
            </button>
          </div>

          <div className="pt-3 mt-1 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => onSelectPage(0)}
              className="text-xs font-medium text-zinc-900 hover:text-blue-600 transition-colors"
            >
              표지 편집하기 →
            </button>
          </div>
        </article>

        {/* Photo Page Cards */}
        {photos.map((photo, index) => {
          const pageNumber = index + 1;
          const isCurrent = pageNumber === currentPage;
          return (
            <article
              key={photo.id}
              className={`bg-white rounded-sm p-4 album-sheet-shadow flex flex-col justify-between transition-shadow ${
                isCurrent ? 'ring-2 ring-zinc-900' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-medium text-zinc-500 tabular-nums">
                    사진 {String(pageNumber).padStart(2, '0')} /{' '}
                    {String(photos.length).padStart(2, '0')}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onMovePhoto(index, -1)}
                      disabled={index === 0}
                      aria-label={`${pageNumber}번 사진 앞으로 이동`}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMovePhoto(index, 1)}
                      disabled={index === photos.length - 1}
                      aria-label={`${pageNumber}번 사진 뒤로 이동`}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePhoto(photo.id)}
                      aria-label={`${pageNumber}번 사진 삭제`}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectPage(pageNumber)}
                  className="w-full aspect-[4/3] bg-zinc-50 rounded-xs p-2.5 flex items-center justify-center mb-4 hover:bg-zinc-100/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <img
                    src={photo.previewUrl}
                    alt={photo.title || `${pageNumber}번 사진`}
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-full object-contain shadow-[0_0_0_1px_rgba(24,24,27,0.06)]"
                  />
                </button>

                <input
                  type="text"
                  value={photo.title}
                  onChange={(e) => onUpdatePhoto(photo.id, { title: e.target.value })}
                  placeholder="사진 제목을 입력하세요"
                  maxLength={80}
                  aria-label={`${pageNumber}번 사진 제목`}
                  className="w-full font-serif text-base font-semibold text-zinc-900 placeholder:text-zinc-300 border-b border-transparent hover:border-zinc-200 focus:border-zinc-400 focus:outline-none pb-1 mb-2 transition-colors"
                />

                <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed min-h-[2.25rem]">
                  {photo.description.trim() || '설명이 아직 작성되지 않았습니다.'}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-zinc-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onSelectPage(pageNumber)}
                  className="text-xs font-medium text-zinc-900 hover:text-blue-600 transition-colors"
                >
                  이 페이지 자세히 편집 →
                </button>
              </div>
            </article>
          );
        })}

        {/* Closing Page Card */}
        <article
          className={`bg-white rounded-sm p-4 album-sheet-shadow flex flex-col justify-between transition-shadow ${
            currentPage === closingPage ? 'ring-2 ring-zinc-900' : ''
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="font-mono text-xs font-medium text-zinc-500">
                마지막 쪽 · 마무리
              </span>
            </div>

            <button
              type="button"
              onClick={() => onSelectPage(closingPage)}
              className="w-full aspect-[4/3] bg-zinc-50 border border-zinc-200 rounded-xs p-5 flex flex-col items-center justify-center text-center mb-4 hover:bg-zinc-100/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <p className="font-serif text-sm text-zinc-700 line-clamp-4 leading-relaxed">
                {settings.closingNote.trim() || '마무리 문구를 아직 작성하지 않았습니다.'}
              </p>
            </button>
          </div>

          <div className="pt-3 mt-1 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => onSelectPage(closingPage)}
              className="text-xs font-medium text-zinc-900 hover:text-blue-600 transition-colors"
            >
              마무리 문구 쓰기 →
            </button>
          </div>
        </article>
      </div>
    </section>
  );
};
