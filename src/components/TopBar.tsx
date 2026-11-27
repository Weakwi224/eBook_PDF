import React from 'react';
import { Loader2, Download } from 'lucide-react';
import { ViewMode } from '../types/album';

interface TopBarProps {
  hasPhotos: boolean;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  onTriggerUpload: () => void;
  onRequestClear: () => void;
  onExportPNG: () => void;
  onExportPDF: () => void;
  isExporting: boolean;
  isExportingPNG: boolean;
  exportProgress: { current: number; total: number } | null;
}

export const TopBar: React.FC<TopBarProps> = ({
  hasPhotos,
  viewMode,
  onChangeViewMode,
  onTriggerUpload,
  onRequestClear,
  onExportPNG,
  onExportPDF,
  isExporting,
  isExportingPNG,
  exportProgress,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element brand wordmark */}
        <button
          type="button"
          onClick={() => onChangeViewMode('album')}
          className="font-serif text-lg font-semibold tracking-tight text-zinc-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm"
        >
          모노그래프
        </button>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav
          aria-label="앨범 작업 메뉴"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600"
        >
          {hasPhotos && (
            <>
              <button
                type="button"
                onClick={() => onChangeViewMode('album')}
                className={`py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  viewMode === 'album'
                    ? 'text-zinc-900 border-zinc-900'
                    : 'border-transparent hover:text-zinc-900 hover:border-zinc-300'
                }`}
              >
                편집 및 감상
              </button>
              <button
                type="button"
                onClick={() => onChangeViewMode('overview')}
                className={`py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  viewMode === 'overview'
                    ? 'text-zinc-900 border-zinc-900'
                    : 'border-transparent hover:text-zinc-900 hover:border-zinc-300'
                }`}
              >
                전체 페이지
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onTriggerUpload}
            className="py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 border-transparent hover:text-zinc-900 hover:border-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            사진 추가
          </button>
          {hasPhotos && (
            <>
              <button
                type="button"
                onClick={onExportPNG}
                disabled={isExportingPNG || isExporting}
                className="py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 border-transparent hover:text-zinc-900 hover:border-zinc-300 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                {isExportingPNG ? 'PNG 저장 중' : 'PNG 저장'}
              </button>
              <button
                type="button"
                onClick={onRequestClear}
                className="py-1 whitespace-nowrap shrink-0 transition-colors border-b-2 border-transparent text-zinc-500 hover:text-red-600 hover:border-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                전체 비우기
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onExportPDF}
            disabled={!hasPhotos || isExporting || isExportingPNG}
            className="inline-flex items-center gap-2 h-10 px-4 text-sm font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span className="tabular-nums">
                  {exportProgress
                    ? `PDF 생성 중 (${exportProgress.current}/${exportProgress.total})`
                    : 'PDF 생성 중'}
                </span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" aria-hidden="true" />
                <span>PDF로 저장</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
