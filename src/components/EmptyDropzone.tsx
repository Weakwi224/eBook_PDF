import React, { useState } from 'react';
import { Upload, ImagePlus } from 'lucide-react';

interface EmptyDropzoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  onTriggerUpload: () => void;
}

export const EmptyDropzone: React.FC<EmptyDropzoneProps> = ({
  onFilesSelected,
  onTriggerUpload,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
        {/* Left typographic column */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <p className="text-xs font-medium text-zinc-500 mb-4">
            한 쪽에 한 장씩 담는 포토북
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-zinc-900 tracking-tight leading-snug text-balance mb-5">
            사진을 올리면 한 장씩 넘겨보는 앨범이 됩니다
          </h1>
          <p className="text-[15px] leading-relaxed text-zinc-600 mb-8 max-w-md">
            여러 장의 사진을 한 번에 불러와 각 페이지마다 제목과 설명을 적고,
            깨끗한 인쇄용 PDF 파일로 바로 저장해 보세요.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onTriggerUpload}
              className="inline-flex items-center gap-2.5 h-11 px-6 text-sm font-medium rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <ImagePlus className="w-4 h-4" aria-hidden="true" />
              <span>사진 여러 장 올리기</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-200 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span>JPG · PNG · WebP 지원</span>
            <span aria-hidden="true">·</span>
            <span>페이지별 제목 및 설명 편집</span>
            <span aria-hidden="true">·</span>
            <span>A4 PDF 내보내기</span>
          </div>
        </div>

        {/* Right interactive monograph sheet dropzone */}
        <div className="lg:col-span-7 flex">
          <div
            role="button"
            tabIndex={0}
            aria-label="사진 파일 여러 장을 끌어다 놓거나 클릭하여 업로드"
            onClick={onTriggerUpload}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onTriggerUpload();
              }
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full bg-white album-sheet-shadow rounded-sm p-6 sm:p-10 flex flex-col justify-between transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
              isDragging
                ? 'ring-2 ring-blue-600 bg-blue-50/30 scale-[1.005]'
                : 'hover:ring-1 hover:ring-zinc-300'
            }`}
          >
            {/* Preview frame mimicking a single-photo album page */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 sm:gap-8 items-stretch min-h-[280px] sm:min-h-[340px]">
              <div
                className={`sm:col-span-8 rounded-xs border border-dashed flex flex-col items-center justify-center p-6 text-center transition-colors ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/40'
                    : 'border-zinc-300 bg-zinc-50/80'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-white border border-zinc-200 flex items-center justify-center mb-4 text-zinc-700">
                  <Upload className="w-5 h-5" aria-hidden="true" />
                </div>
                <p className="text-sm font-medium text-zinc-900 mb-1.5">
                  {isDragging
                    ? '여기에 사진을 놓아주세요'
                    : '사진을 끌어다 놓거나 클릭하세요'}
                </p>
                <p className="text-xs text-zinc-500 max-w-[240px] leading-relaxed">
                  여러 장을 한 번에 선택하면 올린 순서대로 한 쪽에 한 장씩 배치됩니다
                </p>
              </div>

              <div className="sm:col-span-4 flex flex-col justify-between py-1">
                <div>
                  <div className="font-mono text-xs text-zinc-400 tabular-nums mb-3">
                    01 / 01
                  </div>
                  <div className="h-px bg-zinc-200 mb-5" />
                  <p className="font-serif text-base font-semibold text-zinc-800 mb-2">
                    사진 제목 영역
                  </p>
                  <p className="text-xs leading-relaxed text-zinc-500">
                    각 사진의 장소, 날짜, 기억하고 싶은 장면을 한 줄 제목과
                    이야기로 남길 수 있습니다.
                  </p>
                </div>

                <div className="pt-6 text-[11px] text-zinc-400">
                  나의 사진 앨범
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
