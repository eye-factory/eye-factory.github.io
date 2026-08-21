(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const tr = value => window.MetaZeroI18n?.translate(value) || value;
  const state = { images: [], videos: [], busy: false, token: null };
  let idSeed = 0;
  let toastTimer = 0;

  const els = {
    imageInput: $('#imageInput'), videoInput: $('#videoInput'),
    imageQueue: $('#imageQueue'), videoQueue: $('#videoQueue'),
    processImages: $('#processImages'), processVideos: $('#processVideos'),
    clearImages: $('#clearImages'), clearVideos: $('#clearVideos'),
    globalProgress: $('#globalProgress'), progressTitle: $('#progressTitle'),
    progressPercent: $('#progressPercent'), progressBar: $('#progressBar'),
    progressDetail: $('#progressDetail'), cancelProcessing: $('#cancelProcessing'),
    toast: $('#toast'), videoCapability: $('#videoCapability')
  };

  setupNavigation();
  setupTabs();
  setupDropZones();
  setupActions();
  updateVideoCapability();
  window.addEventListener('metazero:languagechange', () => {
    renderQueue('image');
    renderQueue('video');
    updateVideoCapability();
  });

  function setupNavigation() {
    const links = $$('.follow-link');
    const sections = $$('.section-watch');
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach(link => link.classList.toggle('active', link.dataset.target === visible.target.id));
    }, { rootMargin: '-22% 0px -58%', threshold: [0, .2, .45, .7] });
    sections.forEach(section => observer.observe(section));
  }

  function setupTabs() {
    $$('.tool-tab').forEach(tab => tab.addEventListener('click', () => {
      if (state.busy) return showToast('処理中は種類を切り替えられません。', 'error');
      $$('.tool-tab').forEach(t => {
        const active = t === tab;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', String(active));
      });
      $$('.tool-panel').forEach(panel => {
        const active = panel.id === tab.dataset.panel;
        panel.classList.toggle('active', active);
        panel.hidden = !active;
      });
    }));
  }

  function setupDropZones() {
    $$('.drop-zone').forEach(zone => {
      const kind = zone.dataset.kind;
      const input = kind === 'image' ? els.imageInput : els.videoInput;
      zone.addEventListener('click', () => !state.busy && input.click());
      zone.addEventListener('keydown', event => {
        if (!state.busy && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault(); input.click();
        }
      });
      ['dragenter', 'dragover'].forEach(type => zone.addEventListener(type, event => {
        event.preventDefault(); if (!state.busy) zone.classList.add('dragover');
      }));
      ['dragleave', 'drop'].forEach(type => zone.addEventListener(type, event => {
        event.preventDefault(); zone.classList.remove('dragover');
      }));
      zone.addEventListener('drop', event => {
        if (!state.busy) addFiles(kind, [...event.dataTransfer.files]);
      });
      input.addEventListener('change', () => {
        addFiles(kind, [...input.files]);
        input.value = '';
      });
    });
  }

  function setupActions() {
    els.clearImages.addEventListener('click', () => clearQueue('image'));
    els.clearVideos.addEventListener('click', () => clearQueue('video'));
    els.processImages.addEventListener('click', () => {
      if (els.processImages.dataset.mode === 'download') downloadAll('image');
      else processImageQueue();
    });
    els.processVideos.addEventListener('click', () => {
      if (els.processVideos.dataset.mode === 'download') downloadAll('video');
      else processVideoQueue();
    });
    els.cancelProcessing.addEventListener('click', () => {
      if (state.token) {
        state.token.cancelled = true;
        els.progressDetail.textContent = tr('安全に中止しています…');
      }
    });
    window.addEventListener('beforeunload', releaseAllUrls);
  }

  function addFiles(kind, incoming) {
    const isImage = kind === 'image';
    const queue = isImage ? state.images : state.videos;
    const max = isImage ? 10 : 3;
    const recognized = incoming.filter(file => isImage ? /^image\/(jpeg|png|webp)$/i.test(file.type) : /^video\//i.test(file.type));
    const oversized = isImage ? [] : recognized.filter(file => file.size > 1024 * 1024 * 1024);
    const allowed = isImage ? recognized : recognized.filter(file => file.size <= 1024 * 1024 * 1024);
    const invalidCount = incoming.length - recognized.length;
    let added = 0;
    for (const file of allowed) {
      if (queue.length >= max) break;
      const duplicate = queue.some(item => item.file.name === file.name && item.file.size === file.size && item.file.lastModified === file.lastModified);
      if (duplicate) continue;
      queue.push({ id: ++idSeed, file, status: '待機中', state: 'waiting', output: null, savedDirectly: false });
      added++;
    }
    const overflow = Math.max(0, allowed.length - added);
    if (invalidCount) showToast(isImage ? 'JPEG・PNG・WebP以外の画像は追加できません。' : '動画として認識できないファイルを除外しました。', 'error');
    else if (oversized.length) showToast('1GBを超える動画は追加できません。', 'error');
    else if (overflow) showToast(`${max}件を超えたファイルは追加していません。`, 'error');
    else if (added) showToast(`${added}件追加しました。`);
    resetProcessMode(kind);
    renderQueue(kind);
  }

  function renderQueue(kind) {
    const queue = kind === 'image' ? state.images : state.videos;
    const container = kind === 'image' ? els.imageQueue : els.videoQueue;
    container.replaceChildren(...queue.map((item, index) => createFileRow(kind, item, index)));
    updateButtons(kind);
  }

  function createFileRow(kind, item, index) {
    const row = document.createElement('div');
    row.className = 'file-row';
    row.dataset.id = item.id;
    const extension = fileExtension(item.file.name) || (kind === 'image' ? 'IMG' : 'VIDEO');
    row.innerHTML = `
      <div class="file-type ${kind === 'video' ? 'video' : ''}">${escapeHtml(extension.slice(0, 5).toUpperCase())}</div>
      <div class="file-info">
        <span class="file-name" title="${escapeHtml(item.file.name)}">${escapeHtml(item.file.name)}</span>
        <span class="file-meta">${formatBytes(item.file.size)} ・ ${index + 1}/${kind === 'image' ? state.images.length : state.videos.length}</span>
        <span class="file-status ${item.state}">${escapeHtml(tr(item.status))}</span>
      </div>
      <div class="file-actions"></div>`;
    const actions = $('.file-actions', row);
    if (item.output?.url) {
      const link = document.createElement('a');
      link.className = 'download-link';
      link.href = item.output.url;
      link.download = item.output.name;
      link.title = tr('保存');
      link.innerHTML = downloadIcon();
      actions.append(link);
    }
    if (!state.busy) {
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.title = tr('外す');
      remove.innerHTML = closeIcon();
      remove.addEventListener('click', () => removeItem(kind, item.id));
      actions.append(remove);
    }
    return row;
  }

  function updateButtons(kind) {
    const queue = kind === 'image' ? state.images : state.videos;
    const clear = kind === 'image' ? els.clearImages : els.clearVideos;
    const process = kind === 'image' ? els.processImages : els.processVideos;
    clear.disabled = state.busy || !queue.length;
    process.disabled = state.busy || !queue.length || (kind === 'video' && !videoSupported());
    if (process.dataset.mode !== 'download') process.textContent = tr(kind === 'image' ? '画像を変換' : '動画を変換');
  }

  function resetProcessMode(kind) {
    const process = kind === 'image' ? els.processImages : els.processVideos;
    process.dataset.mode = '';
    process.textContent = tr(kind === 'image' ? '画像を変換' : '動画を変換');
  }

  function removeItem(kind, id) {
    const queue = kind === 'image' ? state.images : state.videos;
    const index = queue.findIndex(item => item.id === id);
    if (index < 0) return;
    releaseItem(queue[index]);
    queue.splice(index, 1);
    resetProcessMode(kind);
    renderQueue(kind);
  }

  function clearQueue(kind) {
    if (state.busy) return;
    const queue = kind === 'image' ? state.images : state.videos;
    queue.forEach(releaseItem);
    queue.length = 0;
    resetProcessMode(kind);
    renderQueue(kind);
  }

  async function processImageQueue() {
    if (state.busy || !state.images.length) return;
    startBusy('画像を変換しています');
    const quality = Number($('#imageQuality').value) || .93;
    const harden = $('#imageHarden').checked;
    try {
      for (let index = 0; index < state.images.length; index++) {
        if (state.token.cancelled) throw cancelledError();
        const item = state.images[index];
        releaseItemOutput(item);
        setItemState(item, 'processing', '読み込んでいます…', 'image');
        setProgress(index / state.images.length, `画像 ${index + 1}/${state.images.length}`, item.file.name);
        try {
          const result = await convertImage(item.file, { quality, harden, token: state.token, itemIndex: index, itemCount: state.images.length });
          item.output = { blob: result.blob, url: URL.createObjectURL(result.blob), name: outputName(index, state.images.length, result.extension) };
          item.status = result.clean ? '変換完了・埋め込み情報は検出されませんでした' : '変換完了・保存前に再確認してください';
          item.state = result.clean ? 'success' : 'error';
        } catch (error) {
          if (error.name === 'AbortError') throw error;
          item.status = friendlyError(error);
          item.state = 'error';
        }
        renderQueue('image');
      }
      const completed = state.images.filter(item => item.output).length;
      setProgress(1, '画像の変換が完了しました', `${completed}/${state.images.length}件を保存できます。`);
      setDownloadMode('image', completed);
      showToast(`${completed}件の画像を変換しました。`, completed ? 'success' : 'error');
    } catch (error) {
      if (error.name === 'AbortError') showToast('画像処理を中止しました。', 'error');
      else showToast(friendlyError(error), 'error');
    } finally {
      stopBusy(); renderQueue('image');
    }
  }

  async function convertImage(file, options) {
    if (await isAnimatedImage(file)) throw new Error('アニメーションWebP／APNGは現在未対応です。');
    const bitmap = await decodeImage(file);
    const width = bitmap.width;
    const height = bitmap.height;
    if (!width || !height) { bitmap.close?.(); throw new Error('画像サイズを取得できません。'); }
    if (width * height > 64_000_000) { bitmap.close?.(); throw new Error('64メガピクセルを超える画像には対応していません。'); }
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: true, willReadFrequently: options.harden });
    if (!ctx) { bitmap.close?.(); throw new Error('この端末では画像を処理できません。'); }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    if (options.harden) await applyMicroDither(ctx, width, height, options);
    if (options.token.cancelled) throw cancelledError();
    const mime = normalizedImageMime(file.type);
    const encodedBlob = await canvasToBlob(canvas, mime, mime === 'image/png' ? undefined : options.quality);
    canvas.width = 1; canvas.height = 1;
    const blob = await sanitizeEncodedImageBlob(encodedBlob, mime);
    const clean = await verifyImageMetadata(blob, mime);
    return { blob, clean, extension: extensionForMime(mime) };
  }

  async function decodeImage(file) {
    if ('createImageBitmap' in window) {
      try { return await createImageBitmap(file, { imageOrientation: 'from-image', premultiplyAlpha: 'default', colorSpaceConversion: 'default' }); }
      catch (_) { /* fallback below */ }
    }
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.decoding = 'async';
      img.src = url;
      await img.decode();
      return img;
    } finally { URL.revokeObjectURL(url); }
  }

  async function applyMicroDither(ctx, width, height, options) {
    const seed = new Uint32Array(1);
    crypto.getRandomValues(seed);
    let randomState = seed[0] || 0x6d2b79f5;
    const random3 = () => {
      randomState ^= randomState << 13; randomState ^= randomState >>> 17; randomState ^= randomState << 5;
      return (randomState >>> 0) % 3 - 1;
    };
    const tileHeight = 256;
    for (let y = 0; y < height; y += tileHeight) {
      if (options.token.cancelled) throw cancelledError();
      const h = Math.min(tileHeight, height - y);
      const imageData = ctx.getImageData(0, y, width, h);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        if (!data[i + 3]) continue;
        const delta = random3();
        data[i] = clampByte(data[i] + delta);
        data[i + 1] = clampByte(data[i + 1] + delta);
        data[i + 2] = clampByte(data[i + 2] + delta);
      }
      ctx.putImageData(imageData, 0, y);
      const within = (y + h) / height;
      const overall = (options.itemIndex + within * .82) / options.itemCount;
      setProgress(overall, `画像 ${options.itemIndex + 1}/${options.itemCount}`, `端末由来の特徴を弱めています… ${Math.round(within * 100)}%`);
      await nextFrame();
    }
  }

  async function verifyImageMetadata(blob, mime) {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    if (mime === 'image/jpeg') return !jpegHasPrivateSegments(bytes);
    if (mime === 'image/png') return !pngHasPrivateChunks(bytes);
    if (mime === 'image/webp') return !webpHasPrivateChunks(bytes);
    return false;
  }

  async function sanitizeEncodedImageBlob(blob, mime) {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let cleanBytes = bytes;
    if (mime === 'image/jpeg') cleanBytes = stripJpegPrivateSegments(bytes);
    else if (mime === 'image/png') cleanBytes = stripPngPrivateChunks(bytes);
    else if (mime === 'image/webp') cleanBytes = stripWebpPrivateChunks(bytes);
    return new Blob([cleanBytes], { type: mime });
  }

  function stripJpegPrivateSegments(bytes) {
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return bytes;
    const parts = [bytes.slice(0, 2)];
    let offset = 2;
    while (offset + 4 <= bytes.length) {
      if (bytes[offset] !== 0xff) { parts.push(bytes.slice(offset)); break; }
      const marker = bytes[offset + 1];
      if (marker === 0xda || marker === 0xd9) { parts.push(bytes.slice(offset)); break; }
      if (marker >= 0xd0 && marker <= 0xd7) { parts.push(bytes.slice(offset, offset + 2)); offset += 2; continue; }
      const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
      if (length < 2 || offset + 2 + length > bytes.length) return bytes;
      const isPrivate = (marker >= 0xe1 && marker <= 0xef) || marker === 0xfe;
      if (!isPrivate) parts.push(bytes.slice(offset, offset + 2 + length));
      offset += 2 + length;
    }
    return concatBytes(parts);
  }

  function stripPngPrivateChunks(bytes) {
    if (bytes.length < 20 || ascii(bytes, 1, 3) !== 'PNG') return bytes;
    const safeTypes = new Set(['IHDR', 'PLTE', 'IDAT', 'IEND', 'tRNS', 'sRGB', 'gAMA', 'cHRM', 'pHYs']);
    const parts = [bytes.slice(0, 8)];
    let offset = 8;
    while (offset + 12 <= bytes.length) {
      const length = readUint32(bytes, offset);
      const type = ascii(bytes, offset + 4, 4);
      const end = offset + 12 + length;
      if (end > bytes.length) return bytes;
      if (safeTypes.has(type)) parts.push(bytes.slice(offset, end));
      offset = end;
      if (type === 'IEND') break;
    }
    return concatBytes(parts);
  }

  function stripWebpPrivateChunks(bytes) {
    if (ascii(bytes, 0, 4) !== 'RIFF' || ascii(bytes, 8, 4) !== 'WEBP') return bytes;
    const safeTypes = new Set(['VP8 ', 'VP8L', 'VP8X', 'ALPH']);
    const parts = [bytes.slice(0, 12)];
    let offset = 12;
    while (offset + 8 <= bytes.length) {
      const type = ascii(bytes, offset, 4);
      const size = readUint32LE(bytes, offset + 4);
      const end = offset + 8 + size + (size % 2);
      if (end > bytes.length) return bytes;
      if (safeTypes.has(type)) {
        const chunk = bytes.slice(offset, end);
        if (type === 'VP8X' && size >= 1) chunk[8] &= ~0x2c;
        parts.push(chunk);
      }
      offset = end;
    }
    const output = concatBytes(parts);
    const riffSize = output.length - 8;
    output[4] = riffSize & 0xff;
    output[5] = (riffSize >>> 8) & 0xff;
    output[6] = (riffSize >>> 16) & 0xff;
    output[7] = (riffSize >>> 24) & 0xff;
    return output;
  }

  function concatBytes(parts) {
    const length = parts.reduce((sum, part) => sum + part.length, 0);
    const output = new Uint8Array(length);
    let offset = 0;
    for (const part of parts) { output.set(part, offset); offset += part.length; }
    return output;
  }

  function jpegHasPrivateSegments(bytes) {
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return true;
    let offset = 2;
    while (offset + 4 < bytes.length) {
      if (bytes[offset] !== 0xff) { offset++; continue; }
      const marker = bytes[offset + 1];
      if (marker === 0xda || marker === 0xd9) break;
      if (marker >= 0xd0 && marker <= 0xd7) { offset += 2; continue; }
      const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
      if (length < 2) return true;
      if ((marker >= 0xe1 && marker <= 0xef) || marker === 0xfe) return true;
      offset += 2 + length;
    }
    return false;
  }

  function pngHasPrivateChunks(bytes) {
    if (bytes.length < 20 || ascii(bytes, 1, 3) !== 'PNG') return true;
    const safeTypes = new Set(['IHDR', 'PLTE', 'IDAT', 'IEND', 'tRNS', 'sRGB', 'gAMA', 'cHRM', 'pHYs']);
    let offset = 8;
    while (offset + 12 <= bytes.length) {
      const length = readUint32(bytes, offset);
      const type = ascii(bytes, offset + 4, 4);
      if (!safeTypes.has(type) || offset + 12 + length > bytes.length) return true;
      offset += 12 + length;
      if (type === 'IEND') break;
    }
    return false;
  }

  function webpHasPrivateChunks(bytes) {
    if (ascii(bytes, 0, 4) !== 'RIFF' || ascii(bytes, 8, 4) !== 'WEBP') return true;
    const safeTypes = new Set(['VP8 ', 'VP8L', 'VP8X', 'ALPH']);
    let offset = 12;
    while (offset + 8 <= bytes.length) {
      const type = ascii(bytes, offset, 4);
      const size = readUint32LE(bytes, offset + 4);
      if (!safeTypes.has(type) || offset + 8 + size > bytes.length) return true;
      offset += 8 + size + (size % 2);
    }
    return false;
  }

  async function isAnimatedImage(file) {
    if (!['image/png', 'image/webp'].includes(file.type)) return false;
    const bytes = new Uint8Array(await file.slice(0, Math.min(file.size, 4 * 1024 * 1024)).arrayBuffer());
    if (file.type === 'image/png') {
      let offset = 8;
      while (offset + 12 <= bytes.length) {
        const length = readUint32(bytes, offset);
        const type = ascii(bytes, offset + 4, 4);
        if (type === 'acTL') return true;
        if (type === 'IDAT' || type === 'IEND') break;
        offset += 12 + length;
      }
      return false;
    }
    let offset = 12;
    while (offset + 8 <= bytes.length) {
      const type = ascii(bytes, offset, 4);
      const size = readUint32LE(bytes, offset + 4);
      if (type === 'ANIM' || type === 'ANMF') return true;
      offset += 8 + size + (size % 2);
    }
    return false;
  }

  async function processVideoQueue() {
    if (state.busy || !state.videos.length) return;
    if (!videoSupported()) return showToast('このブラウザでは動画の端末内再生成を利用できません。', 'error');
    startBusy('動画を変換しています');
    try {
      await prepareLargeVideoHandles(state.videos);
      for (let index = 0; index < state.videos.length; index++) {
        if (state.token.cancelled) throw cancelledError();
        const item = state.videos[index];
        releaseItemOutput(item);
        setItemState(item, 'processing', '動画を準備しています…', 'video');
        setProgress(index / state.videos.length, `動画 ${index + 1}/${state.videos.length}`, item.file.name);
        try {
          const result = await convertVideo(item, index, state.videos.length, state.token);
          if (result.savedDirectly) {
            item.savedDirectly = true;
            item.status = '変換完了・指定した保存先へ保存しました';
            item.state = 'success';
          } else {
            item.output = { blob: result.blob, url: URL.createObjectURL(result.blob), name: result.name };
            item.status = '変換完了・元の埋め込み情報を引き継がず再生成しました';
            item.state = 'success';
          }
        } catch (error) {
          if (error.name === 'AbortError') throw error;
          item.status = friendlyError(error);
          item.state = 'error';
        }
        renderQueue('video');
      }
      const completed = state.videos.filter(item => item.output || item.savedDirectly).length;
      setProgress(1, '動画の変換が完了しました', `${completed}/${state.videos.length}件が完了しました。`);
      setDownloadMode('video', state.videos.filter(item => item.output).length);
      showToast(`${completed}件の動画を変換しました。`, completed ? 'success' : 'error');
    } catch (error) {
      if (error.name === 'AbortError') showToast('動画処理を中止しました。', 'error');
      else showToast(friendlyError(error), 'error');
    } finally {
      stopBusy(); renderQueue('video');
    }
  }

  async function prepareLargeVideoHandles(queue) {
    const largeItems = queue.filter(item => item.file.size > 300 * 1024 * 1024);
    if (!largeItems.length) return;
    if (!('showSaveFilePicker' in window)) throw new Error('300MBを超える動画は、PC版ChromeまたはEdgeの大容量モードが必要です。');
    for (let i = 0; i < largeItems.length; i++) {
      if (state.token.cancelled) throw cancelledError();
      const item = largeItems[i];
      const extension = preferredVideoExtension();
      item.largeHandle = await window.showSaveFilePicker({
        suggestedName: outputName(queue.indexOf(item), queue.length, extension),
        types: [{ description: 'META ZERO video', accept: { [preferredVideoMime().split(';')[0]]: [`.${extension}`] } }],
        excludeAcceptAllOption: false
      });
    }
  }

  async function convertVideo(item, itemIndex, itemCount, token) {
    const fileUrl = URL.createObjectURL(item.file);
    const video = document.createElement('video');
    video.playsInline = true;
    video.preload = 'metadata';
    video.src = fileUrl;
    video.style.cssText = 'position:fixed;width:2px;height:2px;left:-10px;bottom:-10px;opacity:.001;pointer-events:none';
    document.body.append(video);
    let audioContext = null;
    let sourceNode = null;
    let recorder = null;
    let drawHandle = 0;
    let progressTimer = 0;
    let writable = null;
    let writeChain = Promise.resolve();
    try {
      await eventOnce(video, 'loadedmetadata', '動画情報を読み込めませんでした。');
      if (!Number.isFinite(video.duration) || !video.duration) throw new Error('動画の再生時間を取得できません。');
      if (!video.videoWidth || !video.videoHeight) throw new Error('映像トラックが見つかりません。');
      if (video.videoWidth * video.videoHeight > 3840 * 2160 * 1.2) throw new Error('現在は4K相当を超える動画には対応していません。');

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
      if (!ctx || !canvas.captureStream) throw new Error('このブラウザでは映像を再生成できません。');
      const canvasStream = canvas.captureStream(30);

      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      await audioContext.resume();
      sourceNode = audioContext.createMediaElementSource(video);
      const audioDestination = audioContext.createMediaStreamDestination();
      const silentGain = audioContext.createGain();
      silentGain.gain.value = 0;
      sourceNode.connect(audioDestination);
      sourceNode.connect(silentGain).connect(audioContext.destination);
      audioDestination.stream.getAudioTracks().forEach(track => canvasStream.addTrack(track));

      const mimeType = preferredVideoMime();
      const bitrate = chooseVideoBitrate(video.videoWidth, video.videoHeight);
      recorder = new MediaRecorder(canvasStream, { mimeType, videoBitsPerSecond: bitrate, audioBitsPerSecond: 160000 });
      const chunks = [];
      if (item.largeHandle) writable = await item.largeHandle.createWritable();
      recorder.addEventListener('dataavailable', event => {
        if (!event.data?.size) return;
        if (writable) writeChain = writeChain.then(() => writable.write(event.data));
        else chunks.push(event.data);
      });

      const noise = createNoisePattern();
      let drawing = true;
      const drawFrame = () => {
        if (!drawing || token.cancelled || video.ended) return;
        ctx.globalAlpha = 1;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = .007;
        const pattern = ctx.createPattern(noise, 'repeat');
        if (pattern) { ctx.fillStyle = pattern; ctx.fillRect(0, 0, canvas.width, canvas.height); }
        ctx.globalAlpha = 1;
        if ('requestVideoFrameCallback' in video) video.requestVideoFrameCallback(drawFrame);
        else drawHandle = requestAnimationFrame(drawFrame);
      };

      const stopped = eventPromise(recorder, 'stop');
      recorder.start(1000);
      await video.play();
      drawFrame();
      progressTimer = window.setInterval(() => {
        if (token.cancelled) {
          video.pause();
          if (recorder.state !== 'inactive') recorder.stop();
          return;
        }
        const within = Math.min(1, video.currentTime / video.duration);
        const overall = (itemIndex + within) / itemCount;
        setProgress(overall, `動画 ${itemIndex + 1}/${itemCount}`, `${formatTime(video.currentTime)} / ${formatTime(video.duration)} — 再生しながら端末内で再生成中`);
      }, 200);
      await Promise.race([eventPromise(video, 'ended'), stopped]);
      drawing = false;
      if (recorder.state !== 'inactive') recorder.stop();
      await stopped;
      await writeChain;
      if (token.cancelled) {
        if (writable) await writable.abort().catch(() => {});
        throw cancelledError();
      }
      if (writable) {
        await writable.close(); writable = null;
        return { savedDirectly: true };
      }
      const blob = new Blob(chunks, { type: mimeType });
      if (!blob.size) throw new Error('動画の出力に失敗しました。');
      return { blob, name: outputName(itemIndex, itemCount, extensionForVideoMime(mimeType)), savedDirectly: false };
    } finally {
      clearInterval(progressTimer);
      cancelAnimationFrame(drawHandle);
      if (recorder?.state && recorder.state !== 'inactive') recorder.stop();
      if (writable) await writable.abort().catch(() => {});
      sourceNode?.disconnect();
      if (audioContext && audioContext.state !== 'closed') await audioContext.close().catch(() => {});
      video.pause(); video.removeAttribute('src'); video.load(); video.remove();
      URL.revokeObjectURL(fileUrl);
    }
  }

  function createNoisePattern() {
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const data = ctx.createImageData(64, 64);
    const random = new Uint8Array(64 * 64);
    crypto.getRandomValues(random);
    for (let i = 0, p = 0; i < random.length; i++, p += 4) {
      const v = 118 + (random[i] % 20);
      data.data[p] = v; data.data[p + 1] = v; data.data[p + 2] = v; data.data[p + 3] = 255;
    }
    ctx.putImageData(data, 0, 0);
    return canvas;
  }

  function videoSupported() {
    return Boolean(window.MediaRecorder && window.HTMLCanvasElement?.prototype?.captureStream && (window.AudioContext || window.webkitAudioContext) && preferredVideoMime());
  }

  function updateVideoCapability() {
    if (!videoSupported()) {
      els.videoCapability.textContent = tr('このブラウザは動画の端末内再生成に未対応です。最新版のChromeまたはEdgeをお試しください。');
      els.videoCapability.style.color = '#c64662';
    } else if ('showSaveFilePicker' in window) {
      els.videoCapability.textContent = tr('動画変換に対応しています。300MB超は保存先へ直接書き込む大容量モードを使用できます。');
    } else {
      els.videoCapability.textContent = tr('動画変換に対応しています。この端末では300MB以下の動画を推奨します。');
    }
    updateButtons('video');
  }

  function startBusy(title) {
    state.busy = true;
    state.token = { cancelled: false };
    els.globalProgress.hidden = false;
    els.progressTitle.textContent = tr(title);
    els.cancelProcessing.disabled = false;
    renderQueue('image'); renderQueue('video');
  }

  function stopBusy() {
    state.busy = false;
    state.token = null;
    els.cancelProcessing.disabled = true;
    renderQueue('image'); renderQueue('video');
  }

  function setProgress(value, title, detail) {
    const percent = Math.round(Math.max(0, Math.min(1, value)) * 100);
    els.progressTitle.textContent = tr(title);
    els.progressPercent.textContent = `${percent}%`;
    els.progressBar.style.width = `${percent}%`;
    els.progressDetail.textContent = tr(detail);
  }

  function setItemState(item, itemState, status, kind) {
    item.state = itemState; item.status = status; renderQueue(kind);
  }

  function setDownloadMode(kind, count) {
    if (!count) return;
    const button = kind === 'image' ? els.processImages : els.processVideos;
    button.dataset.mode = 'download';
    button.textContent = tr(`変換済みを保存（${count}件）`);
  }

  function downloadAll(kind) {
    const queue = kind === 'image' ? state.images : state.videos;
    const downloadable = queue.filter(item => item.output?.url);
    if (!downloadable.length) return;
    downloadable.forEach((item, index) => setTimeout(() => {
      const anchor = document.createElement('a');
      anchor.href = item.output.url; anchor.download = item.output.name;
      document.body.append(anchor); anchor.click(); anchor.remove();
    }, index * 220));
    showToast(`${downloadable.length}件の保存を開始しました。`, 'success');
  }

  function releaseItemOutput(item) {
    if (item.output?.url) URL.revokeObjectURL(item.output.url);
    item.output = null; item.savedDirectly = false;
  }
  function releaseItem(item) { releaseItemOutput(item); item.largeHandle = null; }
  function releaseAllUrls() { [...state.images, ...state.videos].forEach(releaseItem); }

  function outputName(index, total, extension) {
    return total === 1 ? `meta_zero.${extension}` : `meta_zero_${String(index + 1).padStart(2, '0')}.${extension}`;
  }
  function normalizedImageMime(mime) { return ['image/jpeg', 'image/png', 'image/webp'].includes(mime) ? mime : 'image/png'; }
  function extensionForMime(mime) { return ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' })[mime] || 'png'; }
  function extensionForVideoMime(mime) { return mime.startsWith('video/mp4') ? 'mp4' : 'webm'; }
  function preferredVideoExtension() { return extensionForVideoMime(preferredVideoMime()); }
  function preferredVideoMime() {
    if (!window.MediaRecorder?.isTypeSupported) return '';
    return ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4'].find(type => MediaRecorder.isTypeSupported(type)) || '';
  }
  function chooseVideoBitrate(width, height) {
    const pixels = width * height;
    if (pixels >= 3840 * 2160) return 18_000_000;
    if (pixels >= 2560 * 1440) return 12_000_000;
    if (pixels >= 1920 * 1080) return 8_000_000;
    return 4_000_000;
  }

  function canvasToBlob(canvas, mime, quality) {
    return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('画像の再生成に失敗しました。')), mime, quality));
  }
  function eventPromise(target, type) { return new Promise(resolve => target.addEventListener(type, resolve, { once: true })); }
  function eventOnce(target, type, message) {
    return new Promise((resolve, reject) => {
      const ok = () => { cleanup(); resolve(); };
      const fail = () => { cleanup(); reject(new Error(message)); };
      const cleanup = () => { target.removeEventListener(type, ok); target.removeEventListener('error', fail); };
      target.addEventListener(type, ok, { once: true }); target.addEventListener('error', fail, { once: true });
    });
  }
  function nextFrame() { return new Promise(resolve => requestAnimationFrame(resolve)); }
  function cancelledError() { return new DOMException('Cancelled', 'AbortError'); }
  function clampByte(value) { return value < 0 ? 0 : value > 255 ? 255 : value; }
  function readUint32(bytes, offset) { return ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0; }
  function readUint32LE(bytes, offset) { return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0; }
  function ascii(bytes, offset, length) { return String.fromCharCode(...bytes.subarray(offset, offset + length)); }
  function fileExtension(name) { return name.includes('.') ? name.split('.').pop() : ''; }
  function formatBytes(bytes) { const units = ['B', 'KB', 'MB', 'GB']; let i = 0, value = bytes; while (value >= 1024 && i < units.length - 1) { value /= 1024; i++; } return `${value.toFixed(i ? 1 : 0)} ${units[i]}`; }
  function formatTime(seconds) { const s = Math.max(0, Math.floor(seconds || 0)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }
  function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]); }
  function friendlyError(error) {
    if (error?.name === 'NotAllowedError') return '保存先の選択がキャンセルされました。';
    if (error?.name === 'QuotaExceededError') return '端末の空き容量が不足しています。';
    return tr(error?.message || '処理中にエラーが発生しました。');
  }
  function showToast(message, type = '') {
    clearTimeout(toastTimer);
    els.toast.textContent = tr(message);
    els.toast.className = `toast show ${type}`;
    toastTimer = setTimeout(() => els.toast.className = 'toast', 3300);
  }
  function closeIcon() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"/></svg>'; }
  function downloadIcon() { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M5 20h14"/></svg>'; }
})();
