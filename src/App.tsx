/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlbumPhoto, AlbumSettings, ViewMode } from './types/album';
import {
  DEFAULT_SETTINGS,
  clearAlbumFromDB,
  loadAlbumFromDB,
  processImageFiles,
  saveAlbumToDB,
} from './utils/storage';
import { exportAlbumToPDF, exportCurrentPageToPNG } from './utils/pdfExporter';
import { TopBar } from './components/TopBar';
import { EmptyDropzone } from './components/EmptyDropzone';
import { AlbumControlsBar } from './components/AlbumControlsBar';
import { CoverPageViewer } from './components/CoverPageViewer';
import { AlbumPageViewer } from './components/AlbumPageViewer';
import { ClosingPageViewer } from './components/ClosingPageViewer';
import { FilmstripNav } from './components/FilmstripNav';
import { ContactSheetView } from './components/ContactSheetView';

interface ToastMessage {
  id: number;
  text: string;
  tone: 'info' | 'error';
}

export default function App() {
  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  const [settings, setSettings] = useState<AlbumSettings>(DEFAULT_SETTINGS);
  // 0 = Cover, 1..photos.length = Photo, photos.length + 1 = Closing
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('album');
  const [isHydrated, setIsHydrated] = useState(false);

  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPNG, setIsExportingPNG] = useState(false);
  const [exportProgress, setExportProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isWindowDragging, setIsWindowDragging] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photosRef = useRef<AlbumPhoto[]>([]);
  const toastTimerRef = useRef<number | null>(null);
  const dragDepthRef = useRef(0);

  photosRef.current = photos;

  const totalPages = photos.length > 0 ? photos.length + 2 : 0;
  const closingPageIndex = photos.length + 1;

  const showToast = useCallback((text: string, tone: 'info' | 'error' = 'info') => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast({ id: Date.now(), text, tone });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 3600);
  }, []);

  // Hydrate album from IndexedDB
  useEffect(() => {
    let active = true;
    loadAlbumFromDB().then(({ photos: loadedPhotos, settings: loadedSettings }) => {
      if (!active) {
        loadedPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
        return;
      }
      setPhotos(loadedPhotos);
      setSettings(loadedSettings);
      setIsHydrated(true);
    });

    return () => {
      active = false;
      photosRef.current.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Persist album to IndexedDB with short debounce
  useEffect(() => {
    if (!isHydrated) return;
    const timer = window.setTimeout(() => {
      saveAlbumToDB(photos, settings);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [photos, settings, isHydrated]);

  const handleFilesSelected = useCallback(
    async (fileList: FileList | File[]) => {
      const { photos: added, skippedCount } = await processImageFiles(fileList);
      if (added.length > 0) {
        setPhotos((prev) => {
          const next = [...prev, ...added];
          if (prev.length === 0) {
            setDirection(1);
            setCurrentPage(0);
          } else {
            setDirection(1);
            setCurrentPage(prev.length + 1);
          }
          return next;
        });
        setViewMode('album');
        if (skippedCount > 0) {
          showToast(
            `${added.length}장의 사진이 추가되었습니다. (지원하지 않는 파일 ${skippedCount}개 제외)`
          );
        } else {
          showToast(`${added.length}장의 사진이 앨범에 추가되었습니다.`);
        }
      } else if (skippedCount > 0) {
        showToast('이미지 파일(JPG, PNG, WebP 등)만 올릴 수 있습니다.', 'error');
      }
    },
    [showToast]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelected(e.target.files);
    }
    e.target.value = '';
  };

  const triggerUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentPage((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentPage((prev) => Math.min(closingPageIndex, prev + 1));
  }, [closingPageIndex]);

  const handleSelectPage = useCallback(
    (page: number) => {
      if (page === currentPage) return;
      setDirection(page > currentPage ? 1 : -1);
      setCurrentPage(page);
    },
    [currentPage]
  );

  const handleUpdateSettings = useCallback((patch: Partial<AlbumSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleUpdatePhoto = useCallback(
    (id: string, patch: Partial<Pick<AlbumPhoto, 'title' | 'description'>>) => {
      setPhotos((prev) =>
        prev.map((photo) => (photo.id === id ? { ...photo, ...patch } : photo))
      );
    },
    []
  );

  const handleReplacePhoto = useCallback(
    async (id: string, file: File) => {
      const { photos: processed } = await processImageFiles([file]);
      if (processed.length === 0) {
        showToast('선택한 이미지 파일을 불러올 수 없습니다.', 'error');
        return;
      }
      const replacement = processed[0];
      setPhotos((prev) =>
        prev.map((photo) => {
          if (photo.id !== id) return photo;
          URL.revokeObjectURL(photo.previewUrl);
          return {
            ...replacement,
            id: photo.id,
            title: photo.title,
            description: photo.description,
          };
        })
      );
      showToast('사진을 교체했습니다.');
    },
    [showToast]
  );

  const handleDeletePhoto = useCallback((id: string) => {
    setPhotos((prev) => {
      const targetIndex = prev.findIndex((p) => p.id === id);
      if (targetIndex === -1) return prev;
      URL.revokeObjectURL(prev[targetIndex].previewUrl);
      const next = prev.filter((p) => p.id !== id);
      const targetPage = targetIndex + 1;

      setCurrentPage((currPage) => {
        if (next.length === 0) return 0;
        if (currPage > next.length + 1) return next.length + 1;
        if (currPage === targetPage && targetPage > next.length) {
          return next.length;
        }
        if (targetPage < currPage) {
          return currPage - 1;
        }
        return currPage;
      });
      return next;
    });
  }, []);

  const handleMovePhoto = useCallback((photoIndex: number, delta: -1 | 1) => {
    const targetIndex = photoIndex + delta;
    setPhotos((prev) => {
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(photoIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });

    const sourcePage = photoIndex + 1;
    const targetPage = targetIndex + 1;
    setDirection(delta);
    setCurrentPage((currPage) => {
      if (currPage === sourcePage) return targetPage;
      if (currPage === targetPage) return sourcePage;
      return currPage;
    });
  }, []);

  const handleConfirmClear = useCallback(async () => {
    photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    setPhotos([]);
    setCurrentPage(0);
    setViewMode('album');
    setShowClearConfirm(false);
    await clearAlbumFromDB();
    showToast('앨범의 모든 사진을 비웠습니다.');
  }, [photos, showToast]);

  const handleExportPDF = useCallback(async () => {
    if (photos.length === 0 || isExporting) return;
    const totalExportSteps =
      photos.length + 1 + (settings.closingNote.trim().length > 0 ? 1 : 0);
    setIsExporting(true);
    setExportProgress({ current: 0, total: totalExportSteps });
    try {
      await exportAlbumToPDF(photos, settings, (current, total) => {
        setExportProgress({ current, total });
      });
      showToast('PDF 파일이 저장되었습니다.');
    } catch {
      showToast('PDF 생성 중 오류가 발생했습니다. 다시 시도해 주세요.', 'error');
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  }, [photos, settings, isExporting, showToast]);

  const handleExportPNG = useCallback(async () => {
    if (photos.length === 0 || isExporting || isExportingPNG) return;
    setIsExportingPNG(true);
    try {
      await exportCurrentPageToPNG(photos, settings, currentPage);
      showToast('현재 페이지가 PNG 이미지로 저장되었습니다.');
    } catch {
      showToast('PNG 저장 중 오류가 발생했습니다. 다시 시도해 주세요.', 'error');
    } finally {
      setIsExportingPNG(false);
    }
  }, [photos, settings, currentPage, isExporting, isExportingPNG, showToast]);

  // Keyboard navigation (ArrowLeft / ArrowRight when not typing in input/textarea)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (showClearConfirm && e.key === 'Escape') {
        setShowClearConfirm(false);
        return;
      }

      if (viewMode !== 'album' || totalPages <= 1) return;

      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [viewMode, totalPages, handlePrev, handleNext, showClearConfirm]);

  // Global drag-and-drop support when photos are already loaded
  useEffect(() => {
    if (photos.length === 0) return;

    const onDragEnter = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes('Files')) return;
      e.preventDefault();
      dragDepthRef.current += 1;
      setIsWindowDragging(true);
    };

    const onDragOver = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes('Files')) return;
      e.preventDefault();
    };

    const onDragLeave = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes('Files')) return;
      e.preventDefault();
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      if (dragDepthRef.current === 0) {
        setIsWindowDragging(false);
      }
    };

    const onDrop = (e: DragEvent) => {
      if (!e.dataTransfer?.files || e.dataTransfer.files.length === 0) return;
      e.preventDefault();
      dragDepthRef.current = 0;
      setIsWindowDragging(false);
      handleFilesSelected(e.dataTransfer.files);
    };

    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('drop', onDrop);
    };
  }, [photos.length, handleFilesSelected]);

  const activePhotoIndex = currentPage - 1;
  const activePhoto =
    activePhotoIndex >= 0 && activePhotoIndex < photos.length
      ? photos[activePhotoIndex]
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-100 text-zinc-900">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
      />

      <TopBar
        hasPhotos={photos.length > 0}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onTriggerUpload={triggerUpload}
        onRequestClear={() => setShowClearConfirm(true)}
        onExportPNG={handleExportPNG}
        onExportPDF={handleExportPDF}
        isExporting={isExporting}
        isExportingPNG={isExportingPNG}
        exportProgress={exportProgress}
      />

      {photos.length > 0 && (
        <AlbumControlsBar
          settings={settings}
          photoCount={photos.length}
          viewMode={viewMode}
          onUpdateSettings={handleUpdateSettings}
          onChangeViewMode={setViewMode}
          onTriggerUpload={triggerUpload}
          onExportPNG={handleExportPNG}
          onJumpToCover={() => {
            setViewMode('album');
            handleSelectPage(0);
          }}
          onJumpToClosing={() => {
            setViewMode('album');
            handleSelectPage(closingPageIndex);
          }}
        />
      )}

      <main className="flex-1">
        {!isHydrated ? (
          <div className="max-w-5xl mx-auto px-4 py-20 text-center text-sm text-zinc-500">
            앨범을 불러오는 중입니다...
          </div>
        ) : photos.length === 0 ? (
          <EmptyDropzone
            onFilesSelected={handleFilesSelected}
            onTriggerUpload={triggerUpload}
          />
        ) : viewMode === 'album' ? (
          <>
            {currentPage === 0 ? (
              <CoverPageViewer
                settings={settings}
                photoCount={photos.length}
                totalPages={totalPages}
                direction={direction}
                onUpdateSettings={handleUpdateSettings}
                onPrev={handlePrev}
                onNext={handleNext}
              />
            ) : currentPage === closingPageIndex ? (
              <ClosingPageViewer
                settings={settings}
                totalPages={totalPages}
                direction={direction}
                onUpdateSettings={handleUpdateSettings}
                onPrev={handlePrev}
                onNext={handleNext}
              />
            ) : activePhoto ? (
              <AlbumPageViewer
                photo={activePhoto}
                currentIndex={activePhotoIndex}
                totalCount={photos.length}
                direction={direction}
                settings={settings}
                onPrev={handlePrev}
                onNext={handleNext}
                onUpdatePhoto={handleUpdatePhoto}
                onReplacePhoto={handleReplacePhoto}
                onDeletePhoto={handleDeletePhoto}
                onMovePhoto={handleMovePhoto}
              />
            ) : null}

            <FilmstripNav
              photos={photos}
              settings={settings}
              currentPage={currentPage}
              onSelectPage={handleSelectPage}
              onTriggerUpload={triggerUpload}
            />
          </>
        ) : (
          <ContactSheetView
            photos={photos}
            settings={settings}
            currentPage={currentPage}
            onSelectPage={(page) => {
              setCurrentPage(page);
              setViewMode('album');
            }}
            onUpdatePhoto={handleUpdatePhoto}
            onMovePhoto={handleMovePhoto}
            onDeletePhoto={handleDeletePhoto}
            onTriggerUpload={triggerUpload}
          />
        )}
      </main>

      {/* Window drag-and-drop overlay */}
      {isWindowDragging && (
        <div className="fixed inset-0 z-50 bg-zinc-900/20 backdrop-blur-[2px] flex items-center justify-center p-6 pointer-events-none">
          <div className="bg-white border-2 border-dashed border-blue-600 rounded-xl px-10 py-8 shadow-lg text-center">
            <p className="font-serif text-xl font-semibold text-zinc-900 mb-1">
              여기에 사진을 놓아 추가하세요
            </p>
            <p className="text-sm text-zinc-500">
              올린 사진은 현재 앨범의 사진 목록 끝에 순서대로 추가됩니다
            </p>
          </div>
        </div>
      )}

      {/* Clear album confirmation dialog */}
      {showClearConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="clear-dialog-title"
          className="fixed inset-0 z-50 bg-zinc-900/40 backdrop-blur-[2px] flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-zinc-200">
            <h3
              id="clear-dialog-title"
              className="font-serif text-lg font-semibold text-zinc-900 mb-2"
            >
              앨범을 모두 비울까요?
            </h3>
            <p className="text-sm text-zinc-600 leading-relaxed mb-6">
              올려둔 사진 {photos.length}장과 작성한 제목·설명이 모두 삭제되며
              되돌릴 수 없습니다.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="h-10 px-4 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                className="h-10 px-4 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                모두 비우기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-5 right-5 z-40 px-4 py-3 rounded-lg shadow-lg text-sm font-medium border ${
            toast.tone === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-zinc-900 text-white border-zinc-800'
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}
