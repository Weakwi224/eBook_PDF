import { jsPDF } from 'jspdf';
import { AlbumPhoto, AlbumSettings } from '../types/album';
import { getThemePalette } from './themes';
import { FontPreset, getFontPreset } from './fonts';

interface ExportProgressCallback {
  (current: number, total: number): void;
}

async function ensureAlbumFontsLoaded(fontPreset: FontPreset): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;
  try {
    await Promise.allSettled([
      document.fonts.load(`${fontPreset.titleWeight} 48px ${fontPreset.canvasFamily}`),
      document.fonts.load(`${fontPreset.bodyWeight} 28px ${fontPreset.canvasFamily}`),
      document.fonts.load('500 26px "JetBrains Mono", monospace'),
    ]);
    await document.fonts.ready;
  } catch {
    // Proceed even if a specific font load check rejects
  }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines?: number
): string[] {
  if (!text.trim()) return [];
  const paragraphs = text.split(/\r?\n/);
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (paragraph === '') {
      lines.push('');
      continue;
    }

    let currentLine = '';
    const chars = Array.from(paragraph);

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine.length > 0) {
        // Prefer breaking at last whitespace for Latin/mixed words if available near the end
        const lastSpace = currentLine.lastIndexOf(' ');
        if (lastSpace > currentLine.length * 0.55 && char !== ' ') {
          const head = currentLine.slice(0, lastSpace);
          const tail = currentLine.slice(lastSpace + 1);
          lines.push(head);
          currentLine = tail + char;
        } else {
          lines.push(currentLine);
          currentLine = char === ' ' ? '' : char;
        }
      } else {
        currentLine = testLine;
      }

      if (maxLines && lines.length >= maxLines) {
        break;
      }
    }

    if (currentLine.length > 0 && (!maxLines || lines.length < maxLines)) {
      lines.push(currentLine);
    }

    if (maxLines && lines.length >= maxLines) {
      break;
    }
  }

  if (maxLines && lines.length > maxLines) {
    lines.length = maxLines;
  }

  return lines;
}

function drawLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  startY: number,
  lineHeight: number,
  maxY?: number
): number {
  let y = startY;
  for (let i = 0; i < lines.length; i++) {
    if (maxY !== undefined && y + lineHeight * 0.4 > maxY) {
      break;
    }
    const line = lines[i];
    if (line !== '') {
      ctx.fillText(line, x, y);
    }
    y += lineHeight;
  }
  return y;
}

function loadDrawableImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = async () => {
      try {
        if (typeof img.decode === 'function') {
          await img.decode();
        }
      } catch {
        // Proceed with loaded image
      }
      resolve(img);
    };
    img.onerror = () => reject(new Error('Failed to load image for PDF'));
    img.src = url;
  });
}

function drawCoverPage(
  canvas: HTMLCanvasElement,
  settings: AlbumSettings,
  totalPhotos: number
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  const isLandscape = settings.orientation === 'landscape';
  const palette = getThemePalette(settings.theme);
  const fontPreset = getFontPreset(settings.font);
  const s = fontPreset.scaleFactor;

  // Sheet background
  ctx.fillStyle = palette.sheetBg;
  ctx.fillRect(0, 0, W, H);

  // Architectural inner border
  const margin = 120;
  const pad = 96;
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 2;
  ctx.strokeRect(margin, margin, W - margin * 2, H - margin * 2);

  // Top label & total photo count
  ctx.fillStyle = palette.bodyText;
  ctx.font = '500 28px "Noto Sans KR", sans-serif';
  ctx.textBaseline = 'top';
  ctx.fillText('앨범 표지', margin + pad, margin + 72);

  const countText = `총 ${totalPhotos}장의 사진`;
  ctx.fillStyle = palette.mutedText;
  ctx.font = '500 26px "JetBrains Mono", monospace';
  const countW = ctx.measureText(countText).width;
  ctx.fillText(countText, W - margin - pad - countW, margin + 74);

  // Center large editorial title & subtitle block
  const titleText = settings.albumTitle.trim() || '나의 사진 앨범';
  const maxContentW = W - (margin + pad) * 2;

  ctx.fillStyle = palette.primaryText;
  const titleFontSize = Math.round((isLandscape ? 116 : 98) * s);
  const titleLineHeight = Math.round((isLandscape ? 148 : 128) * (s > 1 ? 1.16 : 1));
  ctx.font = `${fontPreset.titleWeight} ${titleFontSize}px ${fontPreset.canvasFamily}`;
  ctx.textBaseline = 'alphabetic';

  const titleLines = wrapText(ctx, titleText, maxContentW, 3);
  const blockCenterY = H * 0.44;
  const titleStartY = blockCenterY - ((titleLines.length - 1) * titleLineHeight) / 2;

  drawLines(ctx, titleLines, margin + pad, titleStartY, titleLineHeight);

  // Bold divider rule
  const dividerY = titleStartY + (titleLines.length - 1) * titleLineHeight + 60;
  ctx.fillStyle = palette.accentBar;
  ctx.fillRect(margin + pad, dividerY, 130, 4);

  // Large subtitle if provided
  if (settings.albumSubtitle.trim()) {
    ctx.fillStyle = palette.bodyText;
    const subSize = Math.round(44 * s);
    const subLineH = Math.round(66 * (s > 1 ? 1.15 : 1));
    ctx.font = `${fontPreset.bodyWeight} ${subSize}px ${fontPreset.canvasFamily}`;
    ctx.textBaseline = 'top';
    const subLines = wrapText(ctx, settings.albumSubtitle.trim(), maxContentW, 2);
    drawLines(ctx, subLines, margin + pad, dividerY + 48, subLineH);
  }

  // Bottom prominent author name & date
  const footerDividerY = H - margin - 180;
  ctx.fillStyle = palette.border;
  ctx.fillRect(margin + pad, footerDividerY, maxContentW, 2);

  const authorText = settings.authorName.trim();
  const dateText = settings.albumDate.trim();

  if (authorText) {
    ctx.fillStyle = palette.mutedText;
    ctx.font = '500 22px "Noto Sans KR", sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillText('이름', margin + pad, footerDividerY + 34);

    ctx.fillStyle = palette.primaryText;
    const authorSize = Math.round(40 * s);
    ctx.font = `${fontPreset.titleWeight} ${authorSize}px ${fontPreset.canvasFamily}`;
    ctx.fillText(authorText, margin + pad, footerDividerY + 70);
  }

  if (dateText) {
    ctx.fillStyle = palette.mutedText;
    ctx.font = '500 22px "Noto Sans KR", sans-serif';
    ctx.textBaseline = 'top';
    const dateLabelW = ctx.measureText('날짜').width;
    ctx.fillText('날짜', W - margin - pad - dateLabelW, footerDividerY + 34);

    ctx.fillStyle = palette.bodyText;
    ctx.font = '500 36px "JetBrains Mono", monospace';
    const dateW = ctx.measureText(dateText).width;
    ctx.fillText(dateText, W - margin - pad - dateW, footerDividerY + 74);
  }
}

function drawClosingPage(
  canvas: HTMLCanvasElement,
  settings: AlbumSettings
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  const margin = 120;
  const pad = 96;
  const palette = getThemePalette(settings.theme);
  const fontPreset = getFontPreset(settings.font);
  const s = fontPreset.scaleFactor;

  ctx.fillStyle = palette.sheetBg;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 2;
  ctx.strokeRect(margin, margin, W - margin * 2, H - margin * 2);

  // Top label
  ctx.fillStyle = palette.bodyText;
  ctx.font = '500 28px "Noto Sans KR", sans-serif';
  ctx.textBaseline = 'top';
  ctx.fillText('마무리', margin + pad, margin + 72);

  // Centered closing note
  const noteText = settings.closingNote.trim();
  const maxTextW = Math.min(1360, W - (margin + pad) * 2);

  ctx.fillStyle = palette.primaryText;
  const noteSize = Math.round(44 * s);
  const lineHeight = Math.round(76 * (s > 1 ? 1.15 : 1));
  ctx.font = `${fontPreset.bodyWeight} ${noteSize}px ${fontPreset.canvasFamily}`;
  ctx.textBaseline = 'top';

  const lines = wrapText(ctx, noteText, maxTextW, 12);
  const totalTextH = lines.length * lineHeight;
  let y = Math.max(margin + 220, (H - totalTextH) / 2 - 20);

  for (const line of lines) {
    if (line !== '') {
      const lineW = ctx.measureText(line).width;
      ctx.fillText(line, (W - lineW) / 2, y);
    }
    y += lineHeight;
  }

  // Bottom colophon
  const colophonParts = [
    settings.albumTitle.trim(),
    settings.authorName.trim(),
    settings.albumDate.trim(),
  ].filter(Boolean);

  if (colophonParts.length > 0) {
    const colophon = colophonParts.join(' · ');
    ctx.fillStyle = palette.border;
    ctx.fillRect(margin + pad, H - margin - 140, W - (margin + pad) * 2, 2);

    ctx.fillStyle = palette.mutedText;
    const colophonSize = Math.round(26 * (s > 1 ? 1.15 : 1));
    ctx.font = `${fontPreset.bodyWeight} ${colophonSize}px ${fontPreset.canvasFamily}`;
    ctx.textBaseline = 'top';
    const colophonW = ctx.measureText(colophon).width;
    ctx.fillText(colophon, (W - colophonW) / 2, H - margin - 94);
  }
}

async function drawPhotoPage(
  canvas: HTMLCanvasElement,
  photo: AlbumPhoto,
  index: number,
  total: number,
  settings: AlbumSettings
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  const palette = getThemePalette(settings.theme);
  const fontPreset = getFontPreset(settings.font);
  const s = fontPreset.scaleFactor;

  ctx.fillStyle = palette.sheetBg;
  ctx.fillRect(0, 0, W, H);

  const img = await loadDrawableImage(photo.previewUrl);
  const pageLabel = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  const margin = 120;

  if (settings.orientation === 'landscape') {
    // Landscape A4: Left photo stage (64%), Right typography column (31%)
    const innerW = W - margin * 2;
    const innerH = H - margin * 2;
    const photoAreaW = Math.round(innerW * 0.64);
    const photoAreaH = innerH;
    const photoAreaX = margin;
    const photoAreaY = margin;

    // Subtle mat backdrop
    ctx.fillStyle = palette.matBg;
    ctx.fillRect(photoAreaX, photoAreaY, photoAreaW, photoAreaH);

    // Fit image inside mat with padding
    const matPad = 36;
    const boxW = photoAreaW - matPad * 2;
    const boxH = photoAreaH - matPad * 2;
    const scale = Math.min(boxW / img.naturalWidth, boxH / img.naturalHeight);
    const drawW = Math.round(img.naturalWidth * scale);
    const drawH = Math.round(img.naturalHeight * scale);
    const drawX = Math.round(photoAreaX + (photoAreaW - drawW) / 2);
    const drawY = Math.round(photoAreaY + (photoAreaH - drawH) / 2);

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.strokeStyle = palette.imageRing;
    ctx.lineWidth = 2;
    ctx.strokeRect(drawX, drawY, drawW, drawH);

    // Right column
    const colX = margin + photoAreaW + 96;
    const colW = W - margin - colX;

    // Page index
    ctx.fillStyle = palette.mutedText;
    ctx.font = '500 26px "JetBrains Mono", monospace';
    ctx.textBaseline = 'top';
    ctx.fillText(pageLabel, colX, margin + 8);

    // Hairline
    ctx.fillStyle = palette.border;
    ctx.fillRect(colX, margin + 58, colW, 2);

    let cursorY = margin + 104;

    // Title
    if (photo.title.trim()) {
      ctx.fillStyle = palette.primaryText;
      const titleSize = Math.round(48 * s);
      const titleLineH = Math.round(68 * (s > 1 ? 1.16 : 1));
      ctx.font = `${fontPreset.titleWeight} ${titleSize}px ${fontPreset.canvasFamily}`;
      ctx.textBaseline = 'top';
      const titleLines = wrapText(ctx, photo.title.trim(), colW, 4);
      cursorY = drawLines(ctx, titleLines, colX, cursorY, titleLineH);
      cursorY += 32;
    }

    // Description
    if (photo.description.trim()) {
      ctx.fillStyle = palette.bodyText;
      const descSize = Math.round(28 * s);
      const descLineH = Math.round(48 * (s > 1 ? 1.14 : 1));
      ctx.font = `${fontPreset.bodyWeight} ${descSize}px ${fontPreset.canvasFamily}`;
      ctx.textBaseline = 'top';
      const descLines = wrapText(ctx, photo.description.trim(), colW, 18);
      drawLines(ctx, descLines, colX, cursorY, descLineH, H - margin - 72);
    }

    // Footer album name
    if (settings.albumTitle.trim()) {
      ctx.fillStyle = palette.faintText;
      const footerSize = Math.round(22 * (s > 1 ? 1.15 : 1));
      ctx.font = `${fontPreset.bodyWeight} ${footerSize}px ${fontPreset.canvasFamily}`;
      ctx.textBaseline = 'bottom';
      ctx.fillText(settings.albumTitle.trim(), colX, H - margin - 4);
    }
  } else {
    // Portrait A4: Top photo stage (67%), Bottom typography block (28%)
    const innerW = W - margin * 2;
    const photoAreaW = innerW;
    const photoAreaH = 1480;
    const photoAreaX = margin;
    const photoAreaY = margin;

    ctx.fillStyle = palette.matBg;
    ctx.fillRect(photoAreaX, photoAreaY, photoAreaW, photoAreaH);

    const matPad = 36;
    const boxW = photoAreaW - matPad * 2;
    const boxH = photoAreaH - matPad * 2;
    const scale = Math.min(boxW / img.naturalWidth, boxH / img.naturalHeight);
    const drawW = Math.round(img.naturalWidth * scale);
    const drawH = Math.round(img.naturalHeight * scale);
    const drawX = Math.round(photoAreaX + (photoAreaW - drawW) / 2);
    const drawY = Math.round(photoAreaY + (photoAreaH - drawH) / 2);

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.strokeStyle = palette.imageRing;
    ctx.lineWidth = 2;
    ctx.strokeRect(drawX, drawY, drawW, drawH);

    // Divider below photo
    const dividerY = photoAreaY + photoAreaH + 56;
    ctx.fillStyle = palette.border;
    ctx.fillRect(margin, dividerY, innerW, 2);

    // Page counter aligned right
    ctx.fillStyle = palette.mutedText;
    ctx.font = '500 26px "JetBrains Mono", monospace';
    ctx.textBaseline = 'top';
    const labelWidth = ctx.measureText(pageLabel).width;
    ctx.fillText(pageLabel, W - margin - labelWidth, dividerY + 42);

    let cursorY = dividerY + 38;
    const titleMaxW = innerW - labelWidth - 48;

    if (photo.title.trim()) {
      ctx.fillStyle = palette.primaryText;
      const titleSize = Math.round(46 * s);
      const titleLineH = Math.round(64 * (s > 1 ? 1.16 : 1));
      ctx.font = `${fontPreset.titleWeight} ${titleSize}px ${fontPreset.canvasFamily}`;
      ctx.textBaseline = 'top';
      const titleLines = wrapText(ctx, photo.title.trim(), titleMaxW, 2);
      cursorY = drawLines(ctx, titleLines, margin, cursorY, titleLineH);
      cursorY += 24;
    } else {
      cursorY += 12;
    }

    if (photo.description.trim()) {
      ctx.fillStyle = palette.bodyText;
      const descSize = Math.round(28 * s);
      const descLineH = Math.round(48 * (s > 1 ? 1.14 : 1));
      ctx.font = `${fontPreset.bodyWeight} ${descSize}px ${fontPreset.canvasFamily}`;
      ctx.textBaseline = 'top';
      const descLines = wrapText(ctx, photo.description.trim(), innerW, 8);
      drawLines(ctx, descLines, margin, cursorY, descLineH, H - margin - 64);
    }

    if (settings.albumTitle.trim()) {
      ctx.fillStyle = palette.faintText;
      const footerSize = Math.round(22 * (s > 1 ? 1.15 : 1));
      ctx.font = `${fontPreset.bodyWeight} ${footerSize}px ${fontPreset.canvasFamily}`;
      ctx.textBaseline = 'bottom';
      ctx.fillText(settings.albumTitle.trim(), margin, H - margin);
    }
  }
}

export async function exportAlbumToPDF(
  photos: AlbumPhoto[],
  settings: AlbumSettings,
  onProgress?: ExportProgressCallback
): Promise<void> {
  if (photos.length === 0) return;

  const fontPreset = getFontPreset(settings.font);
  await ensureAlbumFontsLoaded(fontPreset);

  const isLandscape = settings.orientation === 'landscape';
  const canvasW = isLandscape ? 2480 : 1754;
  const canvasH = isLandscape ? 1754 : 2480;

  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  const includeCover = true;
  const includeClosing = settings.closingNote.trim().length > 0;
  const totalSteps = photos.length + (includeCover ? 1 : 0) + (includeClosing ? 1 : 0);
  let completed = 0;

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;

  try {
    if (includeCover) {
      drawCoverPage(canvas, settings, photos.length);
      const coverData = canvas.toDataURL('image/jpeg', 0.92);
      pdf.addImage(coverData, 'JPEG', 0, 0, pageW, pageH, undefined, 'FAST');
      completed += 1;
      onProgress?.(completed, totalSteps);
      await new Promise((r) => setTimeout(r, 0));
    }

    for (let i = 0; i < photos.length; i++) {
      if (i > 0 || includeCover) {
        pdf.addPage('a4', isLandscape ? 'landscape' : 'portrait');
      }

      await drawPhotoPage(canvas, photos[i], i, photos.length, settings);
      const pageData = canvas.toDataURL('image/jpeg', 0.92);
      pdf.addImage(pageData, 'JPEG', 0, 0, pageW, pageH, undefined, 'FAST');

      completed += 1;
      onProgress?.(completed, totalSteps);
      await new Promise((r) => setTimeout(r, 0));
    }

    if (includeClosing) {
      pdf.addPage('a4', isLandscape ? 'landscape' : 'portrait');
      drawClosingPage(canvas, settings);
      const closingData = canvas.toDataURL('image/jpeg', 0.92);
      pdf.addImage(closingData, 'JPEG', 0, 0, pageW, pageH, undefined, 'FAST');

      completed += 1;
      onProgress?.(completed, totalSteps);
      await new Promise((r) => setTimeout(r, 0));
    }

    const safeName = (settings.albumTitle.trim() || '사진_앨범')
      .replace(/[\\/:*?"<>|]/g, '_')
      .slice(0, 60);
    pdf.save(`${safeName}.pdf`);
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}

export async function exportCurrentPageToPNG(
  photos: AlbumPhoto[],
  settings: AlbumSettings,
  currentPage: number
): Promise<void> {
  if (photos.length === 0) return;

  const fontPreset = getFontPreset(settings.font);
  await ensureAlbumFontsLoaded(fontPreset);

  const isLandscape = settings.orientation === 'landscape';
  const canvas = document.createElement('canvas');
  canvas.width = isLandscape ? 2480 : 1754;
  canvas.height = isLandscape ? 1754 : 2480;

  try {
    let pageSuffix = '표지';
    if (currentPage === 0) {
      drawCoverPage(canvas, settings, photos.length);
      pageSuffix = '표지';
    } else if (currentPage >= photos.length + 1) {
      drawClosingPage(canvas, settings);
      pageSuffix = '마무리';
    } else {
      const photoIdx = currentPage - 1;
      await drawPhotoPage(canvas, photos[photoIdx], photoIdx, photos.length, settings);
      pageSuffix = `${String(photoIdx + 1).padStart(2, '0')}`;
    }

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/png')
    );
    if (!blob) throw new Error('PNG creation failed');

    const safeTitle = (settings.albumTitle.trim() || '사진_앨범')
      .replace(/[\\/:*?"<>|]/g, '_')
      .slice(0, 50);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeTitle}_${pageSuffix}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}

