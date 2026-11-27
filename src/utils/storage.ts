import { AlbumPhoto, AlbumSettings } from '../types/album';

const DB_NAME = 'monograph_album_db';
const DB_VERSION = 1;
const STORE_PHOTOS = 'photos';
const STORE_META = 'meta';

interface StoredPhotoRecord {
  id: string;
  order: number;
  blob: Blob;
  fileName: string;
  width: number;
  height: number;
  title: string;
  description: string;
  createdAt: number;
}

function getDefaultDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}. ${m}. ${d}.`;
}

export const DEFAULT_SETTINGS: AlbumSettings = {
  albumTitle: '나의 사진 앨범',
  albumSubtitle: '',
  authorName: '',
  albumDate: getDefaultDateString(),
  closingNote: '',
  orientation: 'landscape',
  theme: 'white',
  font: 'serif',
  includeCover: true,
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is unavailable'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_PHOTOS)) {
        db.createObjectStore(STORE_PHOTOS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveAlbumToDB(
  photos: AlbumPhoto[],
  settings: AlbumSettings
): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_PHOTOS, STORE_META], 'readwrite');
      const photoStore = tx.objectStore(STORE_PHOTOS);
      const metaStore = tx.objectStore(STORE_META);

      photoStore.clear();
      photos.forEach((photo, index) => {
        const record: StoredPhotoRecord = {
          id: photo.id,
          order: index,
          blob: photo.blob,
          fileName: photo.fileName,
          width: photo.width,
          height: photo.height,
          title: photo.title,
          description: photo.description,
          createdAt: photo.createdAt,
        };
        photoStore.put(record);
      });

      metaStore.put({ key: 'settings', value: settings });

      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {
    // Graceful no-op if storage quota or private browsing blocks IndexedDB
  }
}

export async function loadAlbumFromDB(): Promise<{
  photos: AlbumPhoto[];
  settings: AlbumSettings;
}> {
  try {
    const db = await openDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_PHOTOS, STORE_META], 'readonly');
      const photoReq = tx.objectStore(STORE_PHOTOS).getAll();
      const metaReq = tx.objectStore(STORE_META).get('settings');

      tx.oncomplete = () => {
        db.close();
        const records = (photoReq.result as StoredPhotoRecord[]) || [];
        records.sort((a, b) => a.order - b.order);

        const photos: AlbumPhoto[] = records.map((rec) => ({
          id: rec.id,
          blob: rec.blob,
          previewUrl: URL.createObjectURL(rec.blob),
          fileName: rec.fileName,
          width: rec.width,
          height: rec.height,
          title: rec.title,
          description: rec.description,
          createdAt: rec.createdAt,
        }));

        const savedSettings = metaReq.result?.value as AlbumSettings | undefined;
        resolve({
          photos,
          settings: savedSettings ? { ...DEFAULT_SETTINGS, ...savedSettings } : DEFAULT_SETTINGS,
        });
      };

      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {
    return { photos: [], settings: DEFAULT_SETTINGS };
  }
}

export async function clearAlbumFromDB(): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_PHOTOS], 'readwrite');
      tx.objectStore(STORE_PHOTOS).clear();
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {
    // Ignore storage errors
  }
}

function loadImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth || 1600, height: img.naturalHeight || 1200 });
    };
    img.onerror = () => reject(new Error('Image decode failed'));
    img.src = url;
  });
}

export async function processImageFiles(
  fileList: FileList | File[]
): Promise<{ photos: AlbumPhoto[]; skippedCount: number }> {
  const files = Array.from(fileList);
  const photos: AlbumPhoto[] = [];
  let skippedCount = 0;

  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      skippedCount += 1;
      continue;
    }

    const previewUrl = URL.createObjectURL(file);
    try {
      const { width, height } = await loadImageDimensions(previewUrl);
      const id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      photos.push({
        id,
        blob: file,
        previewUrl,
        fileName: file.name,
        width,
        height,
        title: '',
        description: '',
        createdAt: Date.now(),
      });
    } catch {
      URL.revokeObjectURL(previewUrl);
      skippedCount += 1;
    }
  }

  return { photos, skippedCount };
}
