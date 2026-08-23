(() => {
  'use strict';

  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const t = (key, variables) => window.MetaZeroI18n?.t(key, variables) ?? key;
  const IMAGE_LIMIT = 10;
  const VIDEO_LIMIT = 3;
  const AUDIO_LIMIT = 10;
  const ZERO_CHUNK = new Uint8Array(64 * 1024);
  const IS_IOS = /iP(?:hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const DOWNLOAD_GAP_MS = IS_IOS ? 1600 : 900;
  const MP4_METADATA_BOXES = new Set([
    '\u00a9nam', '\u00a9ART', '\u00a9alb', '\u00a9day', '\u00a9cmt', '\u00a9too', '\u00a9wrt', '\u00a9cpy', '\u00a9xyz',
    'loci', 'keys', 'ilst', 'ID32', 'Exif', 'xml ', 'bxml', 'auth', 'titl', 'dscp', 'cprt', 'perf', 'gnre', 'albm'
  ]);
  const MP4_METADATA_TRACK_HANDLERS = new Set(['meta', 'mdta', 'tmcd']);
  const MP4_C2PA_UUID = 'd8fec3d61b0e483c92975828877ec481';
  const MP4_MAX_TABLE_ENTRIES = 5_000_000;
  const state = {
    items: [], busy: false, preparing: 0, token: null, downloadUrls: new Set(), prepareChain: Promise.resolve()
  };
  let itemId = 0;
  let toastTimer = 0;

  const els = {
    fileInput: $('#fileInput'), dropZone: $('#dropZone'), fileQueue: $('#fileQueue'), queueHead: $('#queueHead'),
    fileCount: $('#fileCount'), clearQueue: $('#clearQueue'), processFiles: $('#processFiles'), cancelProcessing: $('#cancelProcessing'),
    progressPanel: $('#progressPanel'), progressTitle: $('#progressTitle'), progressPercent: $('#progressPercent'),
    progressBar: $('#progressBar'), progressDetail: $('#progressDetail'), toast: $('#toast')
  };

  initialize();

  function initialize() {
    setupFileSelection();
    els.clearQueue.addEventListener('click', clearQueue);
    els.processFiles.addEventListener('click', processFiles);
    els.cancelProcessing.addEventListener('click', () => { if (state.token) state.token.cancelled = true; });
    window.addEventListener('metazero:languagechange', renderQueue);
    window.addEventListener('beforeunload', releaseAllResources);
  }

  function setupFileSelection() {
    els.dropZone.addEventListener('click', event => { if (state.busy) event.preventDefault(); });
    els.dropZone.addEventListener('keydown', event => {
      if (!state.busy && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); els.fileInput.click(); }
    });
    for (const type of ['dragenter', 'dragover']) {
      els.dropZone.addEventListener(type, event => { event.preventDefault(); if (!state.busy) els.dropZone.classList.add('dragover'); });
    }
    for (const type of ['dragleave', 'drop']) {
      els.dropZone.addEventListener(type, event => { event.preventDefault(); els.dropZone.classList.remove('dragover'); });
    }
    els.dropZone.addEventListener('drop', event => { if (!state.busy) addFiles([...event.dataTransfer.files]); });
    els.fileInput.addEventListener('change', () => {
      const files = [...els.fileInput.files];
      setTimeout(() => { els.fileInput.value = ''; }, 100);
      addFiles(files);
    });
  }

  function addFiles(files) {
    if (!files.length || state.busy) return;
    if (state.items.length && state.items.every(item => !item.file)) clearQueue();
    const existing = new Set(state.items.map(item => item.fingerprint));
    let imageCount = state.items.filter(item => item.kind === 'image').length;
    let videoCount = state.items.filter(item => item.kind === 'video').length;
    let audioCount = state.items.filter(item => item.kind === 'audio').length;
    let duplicate = false;
    let invalid = false;
    let imageOverflow = false;
    let videoOverflow = false;
    let audioOverflow = false;

    for (const file of files) {
      const info = identifyFile(file);
      if (!info) { invalid = true; continue; }
      const fingerprint = `${file.name}\u0000${file.size}\u0000${file.lastModified}`;
      if (existing.has(fingerprint)) { duplicate = true; continue; }
      if (info.kind === 'image' && imageCount >= IMAGE_LIMIT) { imageOverflow = true; continue; }
      if (info.kind === 'video' && videoCount >= VIDEO_LIMIT) { videoOverflow = true; continue; }
      if (info.kind === 'audio' && audioCount >= AUDIO_LIMIT) { audioOverflow = true; continue; }
      if (info.kind === 'image') imageCount += 1;
      else if (info.kind === 'video') videoCount += 1;
      else audioCount += 1;
      existing.add(fingerprint);
      const item = {
        id: ++itemId, file, sourceName: file.name, size: file.size, fingerprint, kind: info.kind,
        format: info.format, extension: info.extension, mime: info.mime, status: 'scanning', canProcess: false,
        metadataKeys: [], thumbnailUrl: '', duration: 0, analysis: null, disposed: false
      };
      state.items.push(item);
      state.preparing += 1;
      state.prepareChain = state.prepareChain.then(() => prepareItem(item)).catch(() => {}).finally(() => {
        state.preparing = Math.max(0, state.preparing - 1);
        updateControls();
      });
    }
    renderQueue();
    if (invalid) showToast(t('invalidType'), true);
    else if (imageOverflow) showToast(t('imageLimit'), true);
    else if (videoOverflow) showToast(t('videoLimit'), true);
    else if (audioOverflow) showToast(t('audioLimit'), true);
    else if (duplicate) showToast(t('duplicateSkipped'));
  }

  function identifyFile(file) {
    const extension = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';
    if (file.type === 'image/jpeg' || extension === 'jpg' || extension === 'jpeg') return { kind: 'image', format: 'jpeg', extension: extension === 'jpeg' ? 'jpeg' : 'jpg', mime: 'image/jpeg' };
    if (file.type === 'image/png' || extension === 'png') return { kind: 'image', format: 'png', extension: 'png', mime: 'image/png' };
    if (file.type === 'image/webp' || extension === 'webp') return { kind: 'image', format: 'webp', extension: 'webp', mime: 'image/webp' };
    if (file.type === 'video/mp4' || extension === 'mp4') return { kind: 'video', format: 'mp4', extension: 'mp4', mime: 'video/mp4' };
    if (file.type === 'video/quicktime' || extension === 'mov') return { kind: 'video', format: 'mov', extension: 'mov', mime: 'video/quicktime' };
    if (file.type === 'audio/mpeg' || extension === 'mp3') return { kind: 'audio', format: 'mp3', extension: 'mp3', mime: 'audio/mpeg' };
    return null;
  }

  async function prepareItem(item) {
    try {
      const thumbnail = item.kind === 'image'
        ? await createImageThumbnail(item.file)
        : item.kind === 'video'
          ? await createVideoThumbnail(item.file, item.format)
          : await createAudioThumbnail(item.file);
      if (item.disposed) { if (thumbnail.url) URL.revokeObjectURL(thumbnail.url); return; }
      item.thumbnailUrl = thumbnail.url;
      item.duration = thumbnail.duration || 0;
      if (item.kind === 'image') {
        item.metadataKeys = await scanImageMetadata(item.file, item.format);
      } else if (item.kind === 'video') {
        item.analysis = await buildMp4Analysis(item.file);
        item.metadataKeys = [...item.analysis.labels];
      } else {
        item.analysis = await buildMp3Analysis(item.file);
        item.metadataKeys = [...item.analysis.labels];
      }
      if (item.disposed) return;
      item.status = 'ready';
      item.canProcess = true;
    } catch (error) {
      if (!item.disposed) {
        item.status = 'error';
        item.canProcess = false;
        item.error = error?.message || String(error);
        if (!item.thumbnailUrl) item.thumbnailUrl = await createPlaceholderThumbnail(item.kind, item.format);
      }
    } finally {
      if (!item.disposed) renderQueue();
    }
  }

  async function createImageThumbnail(file) {
    let bitmap;
    let image;
    let sourceUrl;
    try {
      if ('createImageBitmap' in window) {
        try {
          bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
          return { url: await drawThumbnail(bitmap, bitmap.width, bitmap.height), duration: 0 };
        } catch {}
      }
      sourceUrl = URL.createObjectURL(file);
      image = new Image();
      image.decoding = 'async';
      image.src = sourceUrl;
      await waitForEvent(image, 'load', 'error', 15000);
      return { url: await drawThumbnail(image, image.naturalWidth, image.naturalHeight), duration: 0 };
    } finally {
      bitmap?.close?.();
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
      if (image) image.src = '';
    }
  }

  async function createVideoThumbnail(file, format) {
    const video = document.createElement('video');
    const sourceUrl = URL.createObjectURL(file);
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.src = sourceUrl;
    try {
      await waitForEvent(video, 'loadedmetadata', 'error', 20000);
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      if (video.videoWidth && video.videoHeight) {
        const target = duration > .2 ? Math.min(1, duration * .12) : 0;
        if (target > 0) {
          video.currentTime = target;
          await waitForEvent(video, 'seeked', 'error', 15000);
        } else if (video.readyState < 2) {
          video.preload = 'auto';
          await waitForEvent(video, 'loadeddata', 'error', 15000);
        }
        return { url: await drawThumbnail(video, video.videoWidth, video.videoHeight), duration };
      }
      return { url: await createPlaceholderThumbnail('video', format), duration };
    } catch (error) {
      return { url: await createPlaceholderThumbnail('video', format), duration: Number.isFinite(video.duration) ? video.duration : 0 };
    } finally {
      video.pause();
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(sourceUrl);
      video.remove();
    }
  }

  async function createAudioThumbnail(file) {
    const audio = document.createElement('audio');
    const sourceUrl = URL.createObjectURL(file);
    audio.preload = 'metadata';
    audio.src = sourceUrl;
    try {
      await waitForEvent(audio, 'loadedmetadata', 'error', 20000);
      return {
        url: await createPlaceholderThumbnail('audio'),
        duration: Number.isFinite(audio.duration) ? audio.duration : 0
      };
    } catch {
      return { url: await createPlaceholderThumbnail('audio'), duration: 0 };
    } finally {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      URL.revokeObjectURL(sourceUrl);
      audio.remove();
    }
  }

  function waitForEvent(target, success, failure, timeout) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => finish(new Error('Timed out while reading the file.')), timeout);
      const onSuccess = () => finish();
      const onFailure = () => finish(new Error('The file could not be decoded.'));
      function finish(error) {
        clearTimeout(timer);
        target.removeEventListener(success, onSuccess);
        target.removeEventListener(failure, onFailure);
        error ? reject(error) : resolve();
      }
      target.addEventListener(success, onSuccess, { once: true });
      target.addEventListener(failure, onFailure, { once: true });
    });
  }

  async function drawThumbnail(source, width, height) {
    const maxWidth = 180;
    const maxHeight = 112;
    const scale = Math.min(maxWidth / width, maxHeight / height, 1);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext('2d', { alpha: false });
    context.fillStyle = '#dce9f7';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    const blob = await canvasToBlob(canvas, 'image/jpeg', .78);
    canvas.width = 1;
    canvas.height = 1;
    return URL.createObjectURL(blob);
  }

  async function createPlaceholderThumbnail(kind, format = '') {
    const canvas = document.createElement('canvas');
    canvas.width = 140;
    canvas.height = 88;
    const context = canvas.getContext('2d');
    const gradient = context.createLinearGradient(0, 0, 140, 88);
    gradient.addColorStop(0, '#dcecff');
    gradient.addColorStop(1, '#bcd9fa');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 140, 88);
    context.fillStyle = '#3279c8';
    context.font = '700 17px system-ui';
    context.textAlign = 'center';
    const label = kind === 'video' ? format.toUpperCase() || 'VIDEO' : kind === 'audio' ? 'MP3' : 'IMAGE';
    context.fillText(label, 70, 51);
    const blob = await canvasToBlob(canvas, 'image/jpeg', .75);
    canvas.width = 1;
    canvas.height = 1;
    return URL.createObjectURL(blob);
  }

  function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Thumbnail creation failed.')), type, quality));
  }

  function renderQueue() {
    els.fileQueue.replaceChildren();
    for (const item of state.items) {
      const row = document.createElement('article');
      row.className = 'file-row';
      const thumb = document.createElement('div');
      thumb.className = `thumb ${item.kind}`;
      if (item.thumbnailUrl) {
        const image = document.createElement('img');
        image.src = item.thumbnailUrl;
        image.alt = '';
        thumb.append(image);
      }
      const info = document.createElement('div');
      info.className = 'file-info';
      const name = document.createElement('strong');
      name.textContent = item.sourceName;
      const detail = document.createElement('small');
      const details = [formatBytes(item.size)];
      if (item.duration) details.push(formatDuration(item.duration));
      if (item.status === 'ready') {
        const targets = item.metadataKeys.map(key => t(key)).join('/');
        details.push(item.metadataKeys.length ? t('metadataFound', { count: item.metadataKeys.length, targets }) : t('metadataNone'));
      }
      detail.textContent = details.join(' · ');
      info.append(name, detail);
      const status = document.createElement('span');
      status.className = `status-pill ${item.status === 'done' ? 'done' : item.status === 'error' ? 'error' : ''}`;
      status.textContent = t(`status${item.status[0].toUpperCase()}${item.status.slice(1)}`);
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'remove-file';
      remove.textContent = '×';
      remove.setAttribute('aria-label', t('removeFileLabel', { name: item.sourceName }));
      remove.disabled = state.busy;
      remove.addEventListener('click', () => removeItem(item.id));
      row.append(thumb, info, item.status === 'processing' || item.status === 'done' || item.status === 'error' ? status : remove);
      els.fileQueue.append(row);
    }
    els.queueHead.hidden = state.items.length === 0;
    els.fileCount.textContent = String(state.items.length);
    updateControls();
  }

  function updateControls() {
    const processable = state.items.some(item => item.file && item.canProcess && item.status !== 'done');
    els.processFiles.disabled = state.busy || state.preparing > 0 || !processable;
    els.clearQueue.disabled = state.busy;
    els.dropZone.setAttribute('aria-disabled', String(state.busy));
  }

  function removeItem(id) {
    if (state.busy) return;
    const index = state.items.findIndex(item => item.id === id);
    if (index < 0) return;
    disposeItem(state.items[index]);
    state.items.splice(index, 1);
    renderQueue();
  }

  function clearQueue() {
    if (state.busy) return;
    state.items.forEach(disposeItem);
    state.items = [];
    els.fileInput.value = '';
    els.progressPanel.hidden = true;
    renderQueue();
  }

  function disposeItem(item) {
    item.disposed = true;
    if (item.thumbnailUrl) URL.revokeObjectURL(item.thumbnailUrl);
    item.thumbnailUrl = '';
    item.file = null;
    item.analysis = null;
    item.metadataKeys = [];
  }

  function releaseAllResources() {
    state.items.forEach(disposeItem);
    for (const url of state.downloadUrls) URL.revokeObjectURL(url);
    state.downloadUrls.clear();
  }

  async function processFiles() {
    if (state.busy) return;
    const items = state.items.filter(item => item.file && item.canProcess && item.status !== 'done');
    if (!items.length) return showToast(t('noFiles'), true);

    state.busy = true;
    state.token = { cancelled: false };
    els.progressPanel.hidden = false;
    els.cancelProcessing.hidden = false;
    updateControls();
    let done = 0;
    let failed = 0;
    const usedNames = new Set();
    if (items.length > 1) showToast(t('multipleDownloadHint'));

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      if (state.token.cancelled) break;
      item.status = 'processing';
      renderQueue();
      updateProgress(index, items.length, item.sourceName);
      try {
        const desiredName = makeOutputName(item.sourceName, item.extension, usedNames);
        let cleanBlob;
        if (item.kind === 'image') {
          cleanBlob = await sanitizeImage(item.file, item.format);
        } else if (item.kind === 'video') {
          const analysis = item.analysis || await buildMp4Analysis(item.file);
          cleanBlob = createPatchedBlob(item.file, analysis.patches, item.mime);
        } else {
          const analysis = item.analysis || await buildMp3Analysis(item.file);
          cleanBlob = new Blob([item.file.slice(analysis.start, analysis.end)], { type: 'audio/mpeg' });
        }
        if (state.token.cancelled) throw new DOMException('Cancelled', 'AbortError');
        triggerDownload(cleanBlob, desiredName);
        item.status = 'done';
        item.canProcess = false;
        item.file = null;
        item.analysis = null;
        item.metadataKeys = [];
        done += 1;
        if (index < items.length - 1) await delay(DOWNLOAD_GAP_MS, state.token);
      } catch (error) {
        if (error?.name === 'AbortError') break;
        item.status = 'error';
        item.canProcess = true;
        item.error = error?.message || String(error);
        failed += 1;
      }
      updateProgress(index + 1, items.length, item.sourceName);
      renderQueue();
    }

    const cancelled = state.token.cancelled;
    state.busy = false;
    state.token = null;
    els.cancelProcessing.hidden = true;
    els.progressPercent.textContent = cancelled ? `${Math.round(done / items.length * 100)}%` : '100%';
    els.progressBar.style.width = cancelled ? `${done / items.length * 100}%` : '100%';
    renderQueue();
    if (cancelled) showToast(t('cancelled'), true);
    else if (failed) showToast(t('someFailed', { done, failed }), true);
    else showToast(t('savedFiles', { count: done }));
  }

  function updateProgress(current, total, name) {
    const percent = Math.round(current / total * 100);
    els.progressTitle.textContent = t('processing');
    els.progressPercent.textContent = `${percent}%`;
    els.progressBar.style.width = `${percent}%`;
    els.progressDetail.textContent = t('processingItem', { current: Math.min(current + 1, total), total, name });
  }

  function makeOutputName(sourceName, extension, usedNames) {
    const dot = sourceName.lastIndexOf('.');
    const sourceBase = dot > 0 ? sourceName.slice(0, dot) : sourceName;
    const base = (sourceBase || 'file').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').replace(/[. ]+$/g, '') || 'file';
    let name = `${base}.mz.${extension}`;
    let copy = 2;
    while (usedNames.has(name.toLocaleLowerCase())) {
      name = `${base}_${String(copy).padStart(2, '0')}.mz.${extension}`;
      copy += 1;
    }
    usedNames.add(name.toLocaleLowerCase());
    return name;
  }

  function delay(milliseconds, token) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, milliseconds);
      if (!token.cancelled) return;
      clearTimeout(timer);
      reject(new DOMException('Cancelled', 'AbortError'));
    });
  }

  function triggerDownload(blob, name) {
    const downloadBlob = IS_IOS && blob.type !== 'application/octet-stream'
      ? new Blob([blob], { type: 'application/octet-stream' })
      : blob;
    const url = URL.createObjectURL(downloadBlob);
    state.downloadUrls.add(url);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.rel = 'noopener';
    link.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;';
    document.body.append(link);
    link.click();
    setTimeout(() => link.remove(), IS_IOS ? 1800 : 0);
    setTimeout(() => {
      URL.revokeObjectURL(url);
      state.downloadUrls.delete(url);
    }, 60000);
  }

  function showToast(message, error = false) {
    clearTimeout(toastTimer);
    els.toast.textContent = message;
    els.toast.classList.toggle('error', error);
    els.toast.classList.add('show');
    toastTimer = setTimeout(() => els.toast.classList.remove('show'), 3400);
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10240 ? 1 : 0)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  }

  function formatDuration(seconds) {
    const total = Math.max(0, Math.round(seconds));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor(total % 3600 / 60);
    const secs = total % 60;
    return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}` : `${minutes}:${String(secs).padStart(2, '0')}`;
  }

  async function sanitizeImage(file, format) {
    if (format === 'jpeg') return sanitizeJpeg(file);
    if (format === 'png') return sanitizePng(file);
    if (format === 'webp') return sanitizeWebp(file);
    throw new Error(t('invalidType'));
  }

  async function scanImageMetadata(file, format) {
    if (format === 'jpeg') {
      const segments = await parseJpegSegments(file);
      const labels = new Set();
      for (const segment of segments) {
        const prefix = await readBytes(file, segment.payloadStart, Math.min(segment.payloadLength, 64));
        if (segment.marker === 0xe1 && startsWithAscii(prefix, 'Exif\0\0')) labels.add('metaExif');
        else if (segment.marker === 0xe1) labels.add('metaXmp');
        else if (segment.marker === 0xfe) labels.add('metaComment');
        else if (shouldRemoveJpegSegment(segment.marker, prefix)) labels.add('metaText');
      }
      return [...labels];
    }
    if (format === 'png') {
      const chunks = await parsePngChunks(file);
      const labels = new Set();
      for (const chunk of chunks) {
        if (chunk.type === 'eXIf') labels.add('metaExif');
        else if (['tEXt', 'zTXt', 'iTXt'].includes(chunk.type)) labels.add('metaText');
        else if (['tIME', 'pHYs'].includes(chunk.type) || isRemovablePngChunk(chunk.type)) labels.add('metaTime');
      }
      return [...labels];
    }
    if (format === 'webp') {
      const chunks = await parseWebpChunks(file);
      const labels = new Set();
      if (chunks.some(chunk => chunk.type === 'EXIF')) labels.add('metaExif');
      if (chunks.some(chunk => chunk.type === 'XMP ')) labels.add('metaXmp');
      if (chunks.some(chunk => isRemovableWebpChunk(chunk.type))) labels.add('metaText');
      return [...labels];
    }
    return [];
  }

  async function parseJpegSegments(file) {
    const signature = await readBytes(file, 0, 2);
    if (signature[0] !== 0xff || signature[1] !== 0xd8) throw new Error('Invalid JPEG file.');
    const segments = [];
    let offset = 2;
    while (offset + 2 <= file.size) {
      const markerHead = await readBytes(file, offset, Math.min(12, file.size - offset));
      if (markerHead[0] !== 0xff) throw new Error('Invalid JPEG marker.');
      let codeIndex = 1;
      while (codeIndex < markerHead.length && markerHead[codeIndex] === 0xff) codeIndex += 1;
      if (codeIndex >= markerHead.length) throw new Error('Invalid JPEG marker.');
      const marker = markerHead[codeIndex];
      if (marker === 0xda || marker === 0xd9) break;
      const markerStart = offset;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) {
        offset += codeIndex + 1;
        continue;
      }
      const lengthOffset = offset + codeIndex + 1;
      const lengthBytes = await readBytes(file, lengthOffset, 2);
      const length = readU16BE(lengthBytes, 0);
      if (length < 2) throw new Error('Invalid JPEG segment length.');
      const end = lengthOffset + length;
      if (end > file.size) throw new Error('JPEG segment exceeds file size.');
      segments.push({ marker, start: markerStart, end, payloadStart: lengthOffset + 2, payloadLength: length - 2 });
      offset = end;
    }
    return segments;
  }

  function shouldRemoveJpegSegment(marker, prefix) {
    if (marker === 0xfe || marker === 0xe1) return true;
    if (marker === 0xe0) return !startsWithAscii(prefix, 'JFIF\0');
    return marker >= 0xe3 && marker <= 0xef && marker !== 0xee;
  }

  async function sanitizeJpeg(file) {
    const segments = await parseJpegSegments(file);
    const parts = [];
    let cursor = 0;
    for (const segment of segments) {
      const prefix = await readBytes(file, segment.payloadStart, Math.min(segment.payloadLength, 64));
      let replacement = null;
      let remove = shouldRemoveJpegSegment(segment.marker, prefix);
      if (segment.marker === 0xe0 && startsWithAscii(prefix, 'JFIF\0')) {
        replacement = makeCleanJfif(prefix);
        remove = true;
      } else if (segment.marker === 0xe1 && startsWithAscii(prefix, 'Exif\0\0')) {
        const orientation = await readExifOrientation(file, segment);
        if (orientation > 1 && orientation <= 8) replacement = makeOrientationExif(orientation);
        remove = true;
      }
      if (!remove) continue;
      if (cursor < segment.start) parts.push(file.slice(cursor, segment.start));
      if (replacement) parts.push(replacement);
      cursor = segment.end;
    }
    if (cursor < file.size) parts.push(file.slice(cursor));
    return new Blob(parts, { type: 'image/jpeg' });
  }

  function makeCleanJfif() {
    const payload = new Uint8Array([0x4a,0x46,0x49,0x46,0,1,1,0,0,1,0,1,0,0]);
    return makeJpegSegment(0xe0, payload);
  }

  async function readExifOrientation(file, segment) {
    const bytes = await readBytes(file, segment.payloadStart, Math.min(segment.payloadLength, 1024 * 1024));
    if (!startsWithAscii(bytes, 'Exif\0\0') || bytes.length < 14) return 1;
    const little = bytes[6] === 0x49 && bytes[7] === 0x49;
    const big = bytes[6] === 0x4d && bytes[7] === 0x4d;
    if (!little && !big) return 1;
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const ifdOffset = view.getUint32(10, little) + 6;
    if (ifdOffset + 2 > bytes.length) return 1;
    const count = view.getUint16(ifdOffset, little);
    for (let index = 0; index < count; index += 1) {
      const entry = ifdOffset + 2 + index * 12;
      if (entry + 12 > bytes.length) break;
      if (view.getUint16(entry, little) === 0x0112 && view.getUint16(entry + 2, little) === 3) return view.getUint16(entry + 8, little);
    }
    return 1;
  }

  function makeOrientationExif(orientation) {
    const payload = new Uint8Array(32);
    payload.set([0x45,0x78,0x69,0x66,0,0,0x49,0x49,0x2a,0,8,0,0,0,1,0,0x12,1,3,0,1,0,0,0,orientation,0,0,0,0,0,0,0]);
    return makeJpegSegment(0xe1, payload);
  }

  function makeJpegSegment(marker, payload) {
    const output = new Uint8Array(payload.length + 4);
    output[0] = 0xff;
    output[1] = marker;
    const length = payload.length + 2;
    output[2] = length >>> 8;
    output[3] = length & 0xff;
    output.set(payload, 4);
    return output;
  }

  async function parsePngChunks(file) {
    const signature = await readBytes(file, 0, 8);
    const expected = [137,80,78,71,13,10,26,10];
    if (!expected.every((value, index) => signature[index] === value)) throw new Error('Invalid PNG file.');
    const chunks = [];
    let offset = 8;
    while (offset + 12 <= file.size) {
      const header = await readBytes(file, offset, 8);
      const length = readU32BE(header, 0);
      const type = ascii(header, 4, 4);
      const end = offset + 12 + length;
      if (end > file.size) throw new Error('PNG chunk exceeds file size.');
      chunks.push({ type, start: offset, end, length });
      offset = end;
      if (type === 'IEND') break;
    }
    return chunks;
  }

  function isRemovablePngChunk(type) {
    const safeAncillary = new Set(['tRNS','acTL','fcTL','fdAT','sRGB','gAMA','cHRM','cICP','mDCv','cLLi','sBIT','bKGD','iCCP']);
    const critical = type.charCodeAt(0) >= 65 && type.charCodeAt(0) <= 90;
    return !critical && !safeAncillary.has(type);
  }

  async function sanitizePng(file) {
    const chunks = await parsePngChunks(file);
    const parts = [file.slice(0, 8)];
    for (const chunk of chunks) if (!isRemovablePngChunk(chunk.type)) parts.push(file.slice(chunk.start, chunk.end));
    return new Blob(parts, { type: 'image/png' });
  }

  async function parseWebpChunks(file) {
    const header = await readBytes(file, 0, 12);
    if (ascii(header, 0, 4) !== 'RIFF' || ascii(header, 8, 4) !== 'WEBP') throw new Error('Invalid WebP file.');
    const declaredEnd = Math.min(file.size, readU32LE(header, 4) + 8);
    const chunks = [];
    let offset = 12;
    while (offset + 8 <= declaredEnd) {
      const chunkHeader = await readBytes(file, offset, 8);
      const type = ascii(chunkHeader, 0, 4);
      const length = readU32LE(chunkHeader, 4);
      const end = offset + 8 + length + (length & 1);
      if (end > declaredEnd) throw new Error('WebP chunk exceeds file size.');
      chunks.push({ type, start: offset, payloadStart: offset + 8, length, end });
      offset = end;
    }
    return chunks;
  }

  function isRemovableWebpChunk(type) {
    return !new Set(['VP8 ','VP8L','VP8X','ALPH','ANIM','ANMF','ICCP']).has(type);
  }

  async function sanitizeWebp(file) {
    const originalHeader = await readBytes(file, 0, 12);
    const chunks = await parseWebpChunks(file);
    const parts = [];
    let bodySize = 4;
    for (const chunk of chunks) {
      if (isRemovableWebpChunk(chunk.type)) continue;
      const chunkSize = chunk.end - chunk.start;
      bodySize += chunkSize;
      if (chunk.type === 'VP8X' && chunk.length > 0) {
        const flag = await readBytes(file, chunk.payloadStart, 1);
        parts.push(file.slice(chunk.start, chunk.payloadStart), Uint8Array.of(flag[0] & ~0x0c), file.slice(chunk.payloadStart + 1, chunk.end));
      } else {
        parts.push(file.slice(chunk.start, chunk.end));
      }
    }
    const header = new Uint8Array(originalHeader);
    new DataView(header.buffer).setUint32(4, bodySize, true);
    return new Blob([header, ...parts], { type: 'image/webp' });
  }

  async function buildMp4Analysis(file) {
    const top = await listMp4Boxes(file, 0, file.size);
    if (!top.length || !top.some(box => box.type === 'ftyp')) throw new Error('Invalid MP4/MOV file.');
    const patches = [];
    const labels = new Set();
    await inspectMp4Boxes(file, top, patches, labels, 0);
    return { patches: normalizePatches(patches), labels };
  }

  async function buildMp3Analysis(file) {
    const labels = new Set();
    let start = 0;
    let end = file.size;

    while (start + 10 <= end) {
      const header = await readBytes(file, start, 10);
      if (!startsWithAscii(header, 'ID3')) break;
      const version = header[3];
      if (version < 2 || version > 4 || [header[6], header[7], header[8], header[9]].some(value => value > 0x7f)) {
        throw new Error('Invalid ID3 tag.');
      }
      const payloadSize = (header[6] << 21) | (header[7] << 14) | (header[8] << 7) | header[9];
      const footerSize = version === 4 && (header[5] & 0x10) ? 10 : 0;
      const tagEnd = start + 10 + payloadSize + footerSize;
      if (tagEnd > end) throw new Error('ID3 tag exceeds file size.');
      start = tagEnd;
      labels.add('metaId3');
    }

    let removed = true;
    while (removed) {
      removed = false;
      if (end - start >= 128) {
        const id3v1 = await readBytes(file, end - 128, 4);
        if (startsWithAscii(id3v1, 'TAG')) {
          end -= 128;
          if (end - start >= 227) {
            const extended = await readBytes(file, end - 227, 4);
            if (startsWithAscii(extended, 'TAG+')) end -= 227;
          }
          labels.add('metaId3');
          removed = true;
          continue;
        }
      }
      if (end - start >= 32) {
        const footer = await readBytes(file, end - 32, 32);
        if (startsWithAscii(footer, 'APETAGEX')) {
          const tagSize = readU32LE(footer, 12);
          if (tagSize < 32 || tagSize > end - start) throw new Error('Invalid APE tag.');
          let tagStart = end - tagSize;
          if (tagStart - start >= 32) {
            const header = await readBytes(file, tagStart - 32, 8);
            if (startsWithAscii(header, 'APETAGEX')) tagStart -= 32;
          }
          end = tagStart;
          labels.add('metaApe');
          removed = true;
        }
      }
    }

    if (start + 4 > end) throw new Error('MP3 audio data was not found.');
    const frame = await readBytes(file, start, 4);
    if (!isMp3FrameHeader(frame)) throw new Error('Invalid MP3 audio data.');
    return { start, end, labels };
  }

  function isMp3FrameHeader(bytes) {
    if (bytes.length < 4 || bytes[0] !== 0xff || (bytes[1] & 0xe0) !== 0xe0) return false;
    const version = (bytes[1] >> 3) & 0x03;
    const layer = (bytes[1] >> 1) & 0x03;
    const bitrate = (bytes[2] >> 4) & 0x0f;
    const sampleRate = (bytes[2] >> 2) & 0x03;
    return version !== 1 && layer !== 0 && bitrate !== 0 && bitrate !== 0x0f && sampleRate !== 0x03;
  }

  async function inspectMp4Boxes(file, boxes, patches, labels, depth) {
    if (depth > 8) return;
    for (const box of boxes) {
      if (box.type === 'udta' || box.type === 'meta') {
        replaceMp4Box(box, patches);
        labels.add('metaMp4');
        continue;
      }
      if (MP4_METADATA_BOXES.has(box.type)) {
        replaceMp4Box(box, patches);
        labels.add('metaMp4');
        continue;
      }
      if (box.type === 'uuid' && await isMetadataUuid(file, box)) {
        replaceMp4Box(box, patches);
        labels.add('metaXmp');
        continue;
      }
      if (['free', 'skip', 'wide'].includes(box.type)) {
        if (box.end > box.start + box.headerSize) patches.push({ start: box.start + box.headerSize, end: box.end, fill: 0 });
        continue;
      }
      if (['mvhd', 'tkhd', 'mdhd'].includes(box.type)) {
        if (await addMp4TimePatch(file, box, patches)) labels.add('metaTime');
        continue;
      }
      if (box.type === 'hdlr') {
        if (await addMp4HandlerNamePatch(file, box, patches)) labels.add('metaMp4');
        continue;
      }
      if (box.type === 'trak') {
        const handler = await findTrackHandler(file, box);
        if (MP4_METADATA_TRACK_HANDLERS.has(handler)) {
          const payloadPatches = await buildMp4TrackPayloadPatches(file, box);
          patches.push(...payloadPatches);
          replaceMp4Box(box, patches);
          labels.add('metaMp4');
          continue;
        }
      }
      if (['moov', 'trak', 'mdia'].includes(box.type)) {
        const children = await listMp4Boxes(file, box.start + box.headerSize, box.end);
        await inspectMp4Boxes(file, children, patches, labels, depth + 1);
      }
    }
  }

  async function listMp4Boxes(file, start, end) {
    const boxes = [];
    let offset = start;
    let guard = 0;
    while (offset + 8 <= end && guard < 100000) {
      const header = await readBytes(file, offset, Math.min(16, end - offset));
      let size = readU32BE(header, 0);
      const type = ascii(header, 4, 4);
      let headerSize = 8;
      if (size === 1) {
        if (header.length < 16) throw new Error('Invalid extended MP4 box.');
        size = readU64BE(header, 8);
        headerSize = 16;
      } else if (size === 0) {
        size = end - offset;
      }
      if (!Number.isSafeInteger(size) || size < headerSize || offset + size > end) throw new Error('Invalid MP4 box size.');
      boxes.push({ type, start: offset, end: offset + size, size, headerSize });
      offset += size;
      guard += 1;
    }
    return boxes;
  }

  async function findTrackHandler(file, track) {
    const trackChildren = await listMp4Boxes(file, track.start + track.headerSize, track.end);
    const media = trackChildren.find(box => box.type === 'mdia');
    if (!media) return '';
    const mediaChildren = await listMp4Boxes(file, media.start + media.headerSize, media.end);
    const handler = mediaChildren.find(box => box.type === 'hdlr');
    if (!handler || handler.start + handler.headerSize + 12 > handler.end) return '';
    const bytes = await readBytes(file, handler.start + handler.headerSize + 8, 4);
    return ascii(bytes, 0, 4);
  }

  async function buildMp4TrackPayloadPatches(file, track) {
    const trackChildren = await listMp4Boxes(file, track.start + track.headerSize, track.end);
    const media = trackChildren.find(box => box.type === 'mdia');
    if (!media) throw new Error('MP4 metadata track has no media box.');
    const mediaChildren = await listMp4Boxes(file, media.start + media.headerSize, media.end);
    const mediaInfo = mediaChildren.find(box => box.type === 'minf');
    if (!mediaInfo) throw new Error('MP4 metadata track has no media information.');
    const mediaInfoChildren = await listMp4Boxes(file, mediaInfo.start + mediaInfo.headerSize, mediaInfo.end);
    const sampleTable = mediaInfoChildren.find(box => box.type === 'stbl');
    if (!sampleTable) throw new Error('MP4 metadata track has no sample table.');
    const sampleBoxes = await listMp4Boxes(file, sampleTable.start + sampleTable.headerSize, sampleTable.end);
    const sampleSizeBox = sampleBoxes.find(box => box.type === 'stsz' || box.type === 'stz2');
    const chunkOffsetBox = sampleBoxes.find(box => box.type === 'stco' || box.type === 'co64');
    const sampleToChunkBox = sampleBoxes.find(box => box.type === 'stsc');
    if (!sampleSizeBox || !chunkOffsetBox || !sampleToChunkBox) {
      throw new Error('Unsupported MP4 metadata sample table.');
    }
    const sampleSizes = sampleSizeBox.type === 'stsz'
      ? await readMp4SampleSizes(file, sampleSizeBox)
      : await readMp4CompactSampleSizes(file, sampleSizeBox);
    const chunkOffsets = await readMp4ChunkOffsets(file, chunkOffsetBox);
    const sampleToChunk = await readMp4SampleToChunk(file, sampleToChunkBox);
    return buildMp4SampleRanges(file.size, sampleSizes, chunkOffsets, sampleToChunk)
      .map(range => ({ ...range, fill: 0 }));
  }

  async function readMp4SampleSizes(file, box) {
    const payloadStart = box.start + box.headerSize;
    const header = await readBytes(file, payloadStart, 12);
    if (header.length < 12) throw new Error('Invalid MP4 sample-size box.');
    const fixedSize = readU32BE(header, 4);
    const count = readMp4TableCount(header, 8, 'sample-size');
    if (fixedSize) return new Array(count).fill(fixedSize);
    const bytes = await readBytes(file, payloadStart + 12, count * 4);
    if (bytes.length !== count * 4) throw new Error('Incomplete MP4 sample-size table.');
    const sizes = new Array(count);
    for (let index = 0; index < count; index += 1) sizes[index] = readU32BE(bytes, index * 4);
    return sizes;
  }

  async function readMp4CompactSampleSizes(file, box) {
    const payloadStart = box.start + box.headerSize;
    const header = await readBytes(file, payloadStart, 12);
    if (header.length < 12) throw new Error('Invalid compact MP4 sample-size box.');
    const fieldSize = header[7];
    if (![4, 8, 16].includes(fieldSize)) throw new Error('Unsupported compact MP4 sample size.');
    const count = readMp4TableCount(header, 8, 'compact sample-size');
    const byteLength = fieldSize === 4 ? Math.ceil(count / 2) : count * (fieldSize / 8);
    const bytes = await readBytes(file, payloadStart + 12, byteLength);
    if (bytes.length !== byteLength) throw new Error('Incomplete compact MP4 sample-size table.');
    const sizes = new Array(count);
    for (let index = 0; index < count; index += 1) {
      if (fieldSize === 4) sizes[index] = index % 2 ? bytes[index >> 1] & 0x0f : bytes[index >> 1] >> 4;
      else if (fieldSize === 8) sizes[index] = bytes[index];
      else sizes[index] = readU16BE(bytes, index * 2);
    }
    return sizes;
  }

  async function readMp4ChunkOffsets(file, box) {
    const payloadStart = box.start + box.headerSize;
    const header = await readBytes(file, payloadStart, 8);
    if (header.length < 8) throw new Error('Invalid MP4 chunk-offset box.');
    const count = readMp4TableCount(header, 4, 'chunk-offset');
    const entrySize = box.type === 'co64' ? 8 : 4;
    const bytes = await readBytes(file, payloadStart + 8, count * entrySize);
    if (bytes.length !== count * entrySize) throw new Error('Incomplete MP4 chunk-offset table.');
    const offsets = new Array(count);
    for (let index = 0; index < count; index += 1) {
      offsets[index] = entrySize === 8 ? readU64BE(bytes, index * 8) : readU32BE(bytes, index * 4);
    }
    return offsets;
  }

  async function readMp4SampleToChunk(file, box) {
    const payloadStart = box.start + box.headerSize;
    const header = await readBytes(file, payloadStart, 8);
    if (header.length < 8) throw new Error('Invalid MP4 sample-to-chunk box.');
    const count = readMp4TableCount(header, 4, 'sample-to-chunk');
    if (!count) throw new Error('Empty MP4 sample-to-chunk table.');
    const bytes = await readBytes(file, payloadStart + 8, count * 12);
    if (bytes.length !== count * 12) throw new Error('Incomplete MP4 sample-to-chunk table.');
    const entries = new Array(count);
    for (let index = 0; index < count; index += 1) {
      entries[index] = {
        firstChunk: readU32BE(bytes, index * 12),
        samplesPerChunk: readU32BE(bytes, index * 12 + 4)
      };
    }
    if (entries[0].firstChunk !== 1) throw new Error('Invalid MP4 sample-to-chunk order.');
    for (let index = 0; index < entries.length; index += 1) {
      if (!entries[index].samplesPerChunk || (index && entries[index].firstChunk <= entries[index - 1].firstChunk)) {
        throw new Error('Invalid MP4 sample-to-chunk entry.');
      }
    }
    return entries;
  }

  function readMp4TableCount(bytes, offset, label) {
    const count = readU32BE(bytes, offset);
    if (count > MP4_MAX_TABLE_ENTRIES) throw new Error(`MP4 ${label} table is too large.`);
    return count;
  }

  function buildMp4SampleRanges(fileSize, sampleSizes, chunkOffsets, sampleToChunk) {
    if (!sampleSizes.length) return [];
    const ranges = [];
    let sampleIndex = 0;
    let layoutIndex = 0;
    for (let chunkIndex = 0; chunkIndex < chunkOffsets.length; chunkIndex += 1) {
      const chunkNumber = chunkIndex + 1;
      while (layoutIndex + 1 < sampleToChunk.length && sampleToChunk[layoutIndex + 1].firstChunk <= chunkNumber) layoutIndex += 1;
      const samplesPerChunk = sampleToChunk[layoutIndex].samplesPerChunk;
      if (sampleIndex + samplesPerChunk > sampleSizes.length) throw new Error('MP4 metadata sample count is inconsistent.');
      let chunkSize = 0;
      for (let count = 0; count < samplesPerChunk; count += 1) chunkSize += sampleSizes[sampleIndex + count];
      const start = chunkOffsets[chunkIndex];
      const end = start + chunkSize;
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || end > fileSize) {
        throw new Error('MP4 metadata sample range is invalid.');
      }
      if (chunkSize) ranges.push({ start, end });
      sampleIndex += samplesPerChunk;
    }
    if (sampleIndex !== sampleSizes.length) throw new Error('MP4 metadata samples were not fully mapped.');
    return ranges;
  }

  async function addMp4TimePatch(file, box, patches) {
    const versionBytes = await readBytes(file, box.start + box.headerSize, 1);
    const length = versionBytes[0] === 1 ? 16 : 8;
    const start = box.start + box.headerSize + 4;
    if (start + length > box.end) return false;
    const values = await readBytes(file, start, length);
    if (!values.some(value => value !== 0)) return false;
    patches.push({ start, end: start + length, fill: 0 });
    return true;
  }

  async function addMp4HandlerNamePatch(file, box, patches) {
    const start = box.start + box.headerSize + 24;
    if (start >= box.end) return false;
    const values = await readBytes(file, start, box.end - start);
    if (!values.some(value => value !== 0)) return false;
    patches.push({ start, end: box.end, fill: 0 });
    return true;
  }

  async function isMetadataUuid(file, box) {
    if (box.start + box.headerSize + 16 > box.end) return false;
    const bytes = await readBytes(file, box.start + box.headerSize, 16);
    const uuid = [...bytes].map(value => value.toString(16).padStart(2, '0')).join('');
    if (uuid === MP4_C2PA_UUID || uuid === 'be7acfcb97a942e89c71999491e3afac') return true;
    const payloadStart = box.start + box.headerSize + 16;
    const sample = await readBytes(file, payloadStart, Math.min(box.end - payloadStart, 1024 * 1024));
    const text = new TextDecoder('latin1').decode(sample).toLowerCase();
    return text.includes('<?xpacket') || text.includes('<x:xmpmeta') || text.includes('ns.adobe.com/xap/1.0')
      || text.includes('c2pa') || text.includes('jumb') || text.includes('digitalsourcetype');
  }

  function replaceMp4Box(box, patches) {
    patches.push({ start: box.start + 4, end: box.start + 8, bytes: new Uint8Array([0x66,0x72,0x65,0x65]) });
    if (box.end > box.start + box.headerSize) patches.push({ start: box.start + box.headerSize, end: box.end, fill: 0 });
  }

  function normalizePatches(patches) {
    const sorted = patches.filter(patch => patch.end > patch.start).sort((a, b) => a.start - b.start || a.end - b.end);
    const output = [];
    for (const patch of sorted) {
      const previous = output.at(-1);
      if (previous && patch.start < previous.end) throw new Error('Overlapping MP4 metadata ranges.');
      if (previous && previous.fill === 0 && patch.fill === 0 && patch.start === previous.end) previous.end = patch.end;
      else output.push(patch);
    }
    return output;
  }

  function createPatchedBlob(file, patches, mime) {
    const parts = [];
    let cursor = 0;
    for (const patch of patches) {
      if (cursor < patch.start) parts.push(file.slice(cursor, patch.start));
      if (patch.bytes) parts.push(patch.bytes);
      else appendZeros(parts, patch.end - patch.start);
      cursor = patch.end;
    }
    if (cursor < file.size) parts.push(file.slice(cursor));
    return new Blob(parts, { type: mime });
  }

  function appendZeros(parts, length) {
    let remaining = length;
    while (remaining > 0) {
      const size = Math.min(remaining, ZERO_CHUNK.length);
      parts.push(size === ZERO_CHUNK.length ? ZERO_CHUNK : ZERO_CHUNK.subarray(0, size));
      remaining -= size;
    }
  }

  async function readBytes(file, start, length) {
    if (length <= 0) return new Uint8Array();
    const buffer = await file.slice(start, start + length).arrayBuffer();
    return new Uint8Array(buffer);
  }

  function ascii(bytes, start, length) {
    let output = '';
    for (let index = 0; index < length && start + index < bytes.length; index += 1) output += String.fromCharCode(bytes[start + index]);
    return output;
  }

  function startsWithAscii(bytes, text) {
    if (bytes.length < text.length) return false;
    for (let index = 0; index < text.length; index += 1) if (bytes[index] !== text.charCodeAt(index)) return false;
    return true;
  }

  function readU16BE(bytes, offset) { return (bytes[offset] << 8) | bytes[offset + 1]; }
  function readU32BE(bytes, offset) { return (bytes[offset] * 0x1000000) + (bytes[offset + 1] << 16) + (bytes[offset + 2] << 8) + bytes[offset + 3]; }
  function readU32LE(bytes, offset) { return bytes[offset] + (bytes[offset + 1] << 8) + (bytes[offset + 2] << 16) + (bytes[offset + 3] * 0x1000000); }
  function readU64BE(bytes, offset) { return readU32BE(bytes, offset) * 0x100000000 + readU32BE(bytes, offset + 4); }
})();
