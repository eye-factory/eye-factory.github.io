(async () => {
  const response = await fetch("manual-bundle.json?v=a3a480b2f90b");
  if (!response.ok) throw new Error('Manual HTTP ' + response.status);
  window.MULTINA_WEB_BUNDLE = await response.json();
  window.MultinaManualApplyV102(window.MULTINA_WEB_BUNDLE);
  delete window.MultinaManualApplyV102;
/* Requested UI locale is separate from available body translations. */
(() => {
  const normalize = value => {
    const tag = String(value || '').replaceAll('_', '-').toLowerCase();
    if (/^zh-(tw|hk|mo|hant)(-|$)/.test(tag)) return 'zh-Hant';
    if (/^zh(-|$)/.test(tag)) return 'zh-Hans';
    if (/^pt(-|$)/.test(tag)) return 'pt-BR';
    const base = tag.split('-')[0];
    return ['ja', 'en', 'de', 'fr', 'es', 'id', 'ko', 'th'].includes(base) ? base : null;
  };
  const resolve = (explicit, saved, preferred) => normalize(explicit) || normalize(saved) || preferred.map(normalize).find(Boolean) || 'en';
  let saved;
  try { saved = localStorage.getItem('multina.manual.language') || localStorage.getItem('ef-lang'); } catch {}
  const requested = resolve(new URL(location.href).searchParams.get('lang'), saved, [...(navigator.languages || [navigator.language])]);
  window.MultinaManualLanguage = {normalize, resolve, requested,
    selectAvailable(available) { return available.some(locale => locale.code === requested) ? requested : available.some(locale=>locale.code==='en') ? 'en' : available[0]?.code; },
    remember(value) { if (normalize(value)) try { localStorage.setItem('multina.manual.language', normalize(value)); } catch {} }
  };
})();

(() => {
  'use strict';
  function mountManual() {
  const data = window.MULTINA_MANUAL;
  if (!data) return;
  const t = (key,args={}) => (data.chrome[key] || '').replace(/\{(\w+)\}/g,(m,k)=>args[k] ?? m);
  const lifecycle = new AbortController();
  const listen = (target, type, handler, options) => target.addEventListener(type, handler, { ...(typeof options === 'boolean' ? { capture: options } : options), signal: lifecycle.signal });
  const byId = id => document.getElementById(id);
  const page = data.pages.find(p => p.id === document.body.dataset.page);
  const dialog = byId('contents-dialog');
  const items = [...document.querySelectorAll('.guide-item')];
  const nav = [...document.querySelectorAll('[data-menu]')];
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const storage = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k,v) { try { localStorage.setItem(k,v); } catch {} } };
  let mode = storage.get('multina.manual.findMode') === 'area' ? 'area' : 'category', filter = 'all';
  let previousFocus, scrollFrame, travelFrame, targetFrame, sweepFrame, sweepTimer, flashTimer, arrivalTimer, imageObserver, flashedTarget;
  let routeFrame, expectedScroll = null;
  const guides = page.sections.filter(s => !s.promoted);
  const headerBottom = () => document.querySelector('.masthead').getBoundingClientRect().bottom + 16;
  function applyFilter() {
    let count = 0;
    for (const item of items) {
      const show = filter === 'all' || item.dataset[mode === 'area' ? 'area' : 'group'] === filter;
      item.hidden = !show; if (show) count++;
    }
    byId('visible-count').textContent = t('itemCount',{count});
    byId('article-empty').hidden = count !== 0;
    document.querySelectorAll('[data-view-mode]').forEach(n => {
      const selected = n.dataset.viewMode === mode; n.classList.toggle('selected', selected); n.setAttribute('aria-pressed', String(selected));
    });
    document.querySelectorAll('[data-area-filter]').forEach(n => {
      const selected = n.dataset.areaFilter === filter; n.classList.toggle('selected', selected); n.setAttribute('aria-pressed', String(selected));
    });
    byId('area-view').hidden = mode !== 'area';
    const labels = mode === 'area' ? page.areas : Object.fromEntries(Object.entries(data.groups).filter(([id]) => guides.some(s => s.group === id)));
    byId('article-filters').innerHTML = Object.entries({ all: t('all'), ...labels }).map(([id, label]) => '<button class="game-control' + (id === filter ? ' selected' : '') + '" type="button" data-filter="' + id + '" aria-pressed="' + (id === filter) + '">' + esc(label) + '</button>').join('');
    updateTravel();
  }
  function fastScroll(y, animate = true) {
    cancelAnimationFrame(scrollFrame);
    expectedScroll = null;
    const end = Math.max(0, Math.min(y, Math.max(0, document.documentElement.scrollHeight - innerHeight)));
    const start = scrollY, distance = end - start;
    if (!animate || reduced() || Math.abs(distance) < 2) { scrollTo(0, end); updateTravel(); return; }
    const began = performance.now();
    const step = now => {
      const t = Math.min(1, (now - began) / 190);
      scrollTo(0, start + distance * (1 - Math.pow(1 - t, 3)));
      expectedScroll = scrollY;
      if (t < 1) scrollFrame = requestAnimationFrame(step); else { expectedScroll = null; updateTravel(); }
    };
    scrollFrame = requestAnimationFrame(step);
  }
  // Observe only the five highlight illustrations; no continuous scroll polling.
  const highlightArt = [...document.querySelectorAll('.spotlight-art')];
  const revealArt = art => {
    const image = art.querySelector('img');
    art.classList.toggle('is-revealed', art.classList.contains('is-in-view') && image.complete && image.naturalWidth > 0);
  };
  function observeHighlightArt() {
    if (!highlightArt.length) return;
    imageObserver?.disconnect();
    if (reduced() || typeof IntersectionObserver !== 'function') {
      highlightArt.forEach(art => art.classList.remove('reveal-ready'));
      return;
    }
    const top = Math.ceil(document.querySelector('.masthead').getBoundingClientRect().height) + 8;
    const bottom = Math.ceil(document.querySelector('.follow-nav').getBoundingClientRect().height) + 18;
    imageObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        entry.target.classList.toggle('is-in-view', entry.isIntersecting && entry.intersectionRatio >= .1);
        revealArt(entry.target);
      }
    }, { rootMargin: '-' + top + 'px 0px -' + bottom + 'px 0px', threshold: [0, .1] });
    highlightArt.forEach(art => { art.classList.add('reveal-ready'); imageObserver.observe(art); });
  }
  highlightArt.forEach(art => listen(art.querySelector('img'), 'load', () => revealArt(art)));
  function updateTravel() {
    const targets = [...document.querySelectorAll('.spotlight-card,.guide-item')].filter(n => !n.hidden);
    const line = headerBottom();
    document.querySelector('[data-scroll="top"]').disabled = scrollY < 20;
    document.querySelector('[data-scroll="previous"]').disabled = !targets.some(n => n.getBoundingClientRect().top < line - 25);
    document.querySelector('[data-scroll="next"]').disabled = !targets.some(n => n.getBoundingClientRect().top > line + 25);
  }
  function sweep() {
    if (reduced()) return;
    clearTimeout(sweepTimer); document.body.classList.remove('sweeping');
    cancelAnimationFrame(sweepFrame);
    sweepFrame = requestAnimationFrame(() => { document.body.classList.add('sweeping'); sweepTimer = setTimeout(() => document.body.classList.remove('sweeping'), 400); });
  }
  function openTarget(hash, animate = true) {
    cancelAnimationFrame(targetFrame);
    if (!hash) { fastScroll(0); return; }
    let id; try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
    const target = byId(id); if (!target) return;
    const item = target.closest('.guide-item');
    if (item?.hidden) { filter = 'all'; applyFilter(); }
    let parent = target;
    while (parent) { if (parent.tagName === 'DETAILS') parent.open = true; parent = parent.parentElement; }
    // Highlights replace duplicate home accordions but retain their original deep-link IDs.
    const detail = target.matches('.spotlight-card') ? target.querySelector('[data-highlight-details]') : null;
    if (detail) detail.open = true;
    targetFrame = requestAnimationFrame(() => {
      const y = id === 'content' ? 0 : target.getBoundingClientRect().top + scrollY - headerBottom();
      fastScroll(y, animate);
      if (animate) {
        sweep(); clearTimeout(flashTimer); flashedTarget?.classList.remove('target-flash');
        flashedTarget = item || target; flashedTarget.classList.add('target-flash');
        flashTimer = setTimeout(() => { flashedTarget?.classList.remove('target-flash'); flashedTarget = null; }, 700);
      }
    });
  }
  function showMenu(id) {
    const targetPage = data.pages.find(p => p.id === id); if (!targetPage) return;
    interruptScroll();
    previousFocus = document.activeElement;
    byId('dialog-title').textContent = targetPage.title;
    const cards = [...(targetPage.highlights || []), ...targetPage.sections.filter(s => !s.promoted)];
    byId('menu-results').innerHTML = cards.map((s,i) => '<a class="menu-link" href="' + (window.MultinaManualHref ? window.MultinaManualHref(targetPage.id, s.id) : targetPage.id + '.html#' + s.id) + '" style="--deal-delay:' + Math.min(i,12) * 18 + 'ms"><strong>' + esc(s.title) + '</strong></a>').join('');
    nav.forEach(n => n.classList.toggle('menu-chosen', n.dataset.menu === id));
    if (!dialog.open) dialog.showModal();
    document.querySelector('.dialog-card-scroll').scrollTop = 0;
    byId('dialog-close').focus({ preventScroll: true });
  }
  document.querySelectorAll('[data-menu],[data-open-menu]').forEach(n => listen(n, 'click', () => showMenu(n.dataset.menu || n.dataset.openMenu)));
  listen(byId('dialog-close'), 'click', () => dialog.close());
  listen(dialog, 'close', () => { nav.forEach(n => n.classList.remove('menu-chosen')); if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true }); previousFocus = null; });
  listen(dialog, 'click', e => {
    if (e.target !== dialog) return; const b = dialog.getBoundingClientRect();
    if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) dialog.close();
  });
  document.querySelectorAll('[data-view-mode]').forEach(n => listen(n, 'click', () => { mode = n.dataset.viewMode; filter = 'all'; storage.set('multina.manual.findMode',mode); applyFilter(); }));
  document.querySelectorAll('[data-area-filter]').forEach(n => listen(n, 'click', () => { mode = 'area'; filter = n.dataset.areaFilter; applyFilter(); }));
  listen(byId('article-filters'), 'click', e => { const n = e.target.closest('[data-filter]'); if (n) { filter = n.dataset.filter; applyFilter(); } });
  listen(byId('expand-visible'), 'click', () => items.filter(n => !n.hidden).forEach(n => n.open = true));
  listen(byId('collapse-visible'), 'click', () => items.filter(n => !n.hidden).forEach(n => n.open = false));
  const printState = new Map();
  listen(window, 'beforeprint', () => document.querySelectorAll('details').forEach(n => { printState.set(n,n.open); n.open = true; }));
  listen(window, 'afterprint', () => { printState.forEach((open,n) => n.open = open); printState.clear(); });
  listen(byId('print-page'), 'click', () => print());
  document.querySelectorAll('[data-scroll]').forEach(n => listen(n, 'click', () => {
    if (n.dataset.scroll === 'top') { openTarget('#content'); return; }
    const targets = [...document.querySelectorAll('.spotlight-card,.guide-item')].filter(t => !t.hidden);
    const line = headerBottom();
    const target = n.dataset.scroll === 'next' ? targets.find(t => t.getBoundingClientRect().top > line + 25) : targets.filter(t => t.getBoundingClientRect().top < line - 25).at(-1);
    if (target) openTarget('#' + target.id);
  }));
  listen(window, 'scroll', () => {
    // Scrollbar drags, native focus/anchor movement and assistive navigation
    // must not fight the animation's next frame.
    if (expectedScroll !== null && Math.abs(scrollY - expectedScroll) > 2) interruptScroll();
    if (travelFrame) return; travelFrame = requestAnimationFrame(() => { travelFrame = 0; updateTravel(); });
  }, { passive:true });
  function interruptScroll() { cancelAnimationFrame(scrollFrame); cancelAnimationFrame(targetFrame); expectedScroll = null; }
  listen(window, 'wheel', interruptScroll, { passive:true });
  listen(window, 'touchstart', interruptScroll, { passive:true });
  // A second click/key wins over the preceding automatic scroll. In particular,
  // an opening menu must not be moved by the previous card's pending jump.
  listen(document, 'pointerdown', interruptScroll, { capture:true, passive:true });
  // Hover alone is not a request to stop a card jump. Wheel, pointerdown and
  // keyboard input still interrupt it immediately.
  listen(document, 'keydown', interruptScroll, { capture:true });
  listen(document, 'click', e => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || a.target === '_blank' || a.download) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !['file:','http:','https:'].includes(url.protocol)) return;
    if (url.pathname === location.pathname && url.search === location.search) {
      e.preventDefault(); previousFocus = null; if (dialog.open) dialog.close();
      // Includes the logo/home link without a fragment: do not reload the page.
      // Do not write browser history for an in-document jump: the embedded
      // viewer can hang on that URL update. Links still retain deep-link hrefs.
      const hash = url.hash || '#content'; openTarget(hash); return;
    }
    if (!/\/(index|video|image|recording|comic|ai|legal)\.html$/.test(url.pathname)) return;
    previousFocus = null; if (dialog.open) dialog.close();
    try { sessionStorage.setItem('multina.manual.arriving','1'); } catch {}
    // Keep native anchor navigation. Animation is applied on arrival and must
    // never delay or lock a page change (including file:// and cancelled loads).
  });
  function followHistory() {
    cancelAnimationFrame(routeFrame);
    // Browsers may fire both events for one Back/Forward action.
    routeFrame = requestAnimationFrame(() => openTarget(location.hash));
  }
  listen(window, 'hashchange', followHistory);
  listen(window, 'popstate', followHistory);
  listen(window, 'resize', () => { updateTravel(); observeHighlightArt(); });
  listen(window, 'pageshow', event => { updateTravel(); if (event.persisted) { observeHighlightArt(); followHistory(); } });
  function cleanupTransient() {
    for (const frame of [scrollFrame, travelFrame, targetFrame, routeFrame, sweepFrame]) cancelAnimationFrame(frame);
    travelFrame = 0;
    clearTimeout(sweepTimer); clearTimeout(flashTimer); clearTimeout(arrivalTimer); imageObserver?.disconnect();
    flashedTarget?.classList.remove('target-flash'); flashedTarget = null;
    document.body.classList.remove('sweeping', 'arriving');
  }
  function dispose() { lifecycle.abort(); cleanupTransient(); }
  // Keep normal multi-file pages usable when restored from the browser cache.
  listen(window, 'pagehide', cleanupTransient);
  listen(document.querySelector('#explanations'), 'toggle', () => { cancelAnimationFrame(travelFrame); travelFrame = requestAnimationFrame(() => { travelFrame = 0; updateTravel(); }); }, true);
  byId('language').innerHTML = data.meta.availableLanguages.map(l => '<option value="' + esc(l.code) + '">' + esc(l.name) + '</option>').join('');
  byId('language').value = data.meta.language; document.documentElement.lang = data.meta.language;
  if (!window.MULTINA_STANDALONE) listen(byId('language'), 'change', () => window.MultinaManualLanguage?.remember(byId('language').value));
  applyFilter();
  observeHighlightArt();
  try { if (sessionStorage.getItem('multina.manual.arriving')) { sessionStorage.removeItem('multina.manual.arriving'); document.body.classList.add('arriving'); arrivalTimer = setTimeout(() => document.body.classList.remove('arriving'),300); } } catch {}
  // The standalone router supplies its own initial target. Do not schedule a
  // second, competing scroll to the top while that target is being opened.
  if (!window.MULTINA_STANDALONE) targetFrame = requestAnimationFrame(() => openTarget(location.hash,false));
  document.querySelectorAll('[data-menu],[data-open-menu]').forEach(n => { n.disabled = false; });
  document.body.dataset.manualReady = 'v5.0';
  return { dispose, openTarget };
  }
  window.MultinaManualMount = mountManual;
  if (!window.MULTINA_STANDALONE) mountManual();
})();

(() => {
  'use strict';
  const bundle = window.MULTINA_WEB_BUNDLE;
  delete window.MULTINA_WEB_BUNDLE;
  const shell = document.getElementById('manual-shell');
  const resources = new Map();
  let mounted, current = '', currentPage = '', currentSection = '', localeGeneration = 0, navigationGeneration = 0;
  // All routes are mounted inside this document. Native restoration can move
  // a freshly opened deep link back to the previous page's scroll position.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.MULTINA_STANDALONE = true;
  const available = Object.keys(bundle.locales), fontsAdded = new Set();
  let active = bundle.locales[available.includes(window.MultinaManualLanguage.requested) ? window.MultinaManualLanguage.requested : available.includes('en') ? 'en' : 'ja'];
  window.MULTINA_MANUAL = active.data;
  const t = (key,args={}) => (active.data.chrome[key] || '').replace(/\{(\w+)\}/g,(m,k)=>args[k] ?? m);
  const escape = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  window.MultinaManualHref = (page, section = '') => '#/' + encodeURIComponent(page) + (section ? '/' + encodeURIComponent(section) : '');

  function bytes(base64) {
    const binary = atob(base64), result = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) result[i] = binary.charCodeAt(i);
    return result;
  }
  function resource(name) {
    if (!resources.has(name)) {
      const asset = bundle.assets[name];
      if (!asset) throw new Error('Missing embedded asset: ' + name);
      resources.set(name, new URL(asset.url, location.href).href);
    }
    return resources.get(name);
  }
  function hydrate() {
    shell.querySelectorAll('[data-embedded-asset]').forEach(image => {
      image.loading = 'lazy';
      image.decoding = 'async';
      image.src = resource(image.dataset.embeddedAsset);
    });
  }
  async function activateLocale(locale) {
    const generation = ++localeGeneration;
    const font = bundle.fontFamilies?.[locale];
    if (font && !fontsAdded.has(font.family)) {
      const face = document.createElement('style');
      face.textContent = '@font-face{font-family:' + font.family + ';src:url("' + resource(font.asset) + '") format("truetype");font-weight:100 900;font-style:normal;font-display:swap}';
      document.head.append(face);fontsAdded.add(font.family);
    }
    if (font) {
      // Load only the selected language's original font from this website.
      // Bound the font wait so browser font failure cannot lock navigation.
      await Promise.race([document.fonts.load('400 14px ' + font.family).catch(()=>{}),new Promise(resolve=>setTimeout(resolve,2000))]);
    }
    if (generation !== localeGeneration) return false;
    active = bundle.locales[locale];window.MULTINA_MANUAL = active.data;
    document.documentElement.lang = locale;
    document.querySelector('meta[name="description"]').content=t('description');return true;
  }
  function fillLanguage() {
    const select = document.getElementById('language');
    if (!select) return;
    select.innerHTML = active.data.meta.availableLanguages.map(l=>'<option value="'+l.code+'">'+escape(l.name)+'</option>').join('');
    select.value = active.data.meta.language;
  }
  function decodeRoute(hash) {
    if (!hash.startsWith('#/')) return null;
    try {
      const [page, section = ''] = hash.slice(2).split('/').map(decodeURIComponent);
      if (page === 'notice') return Object.hasOwn(bundle.notices, section) ? { page, section } : null;
    return Object.hasOwn(active.pages, page) ? { page, section } : null;
    } catch { return null; }
  }
  function closeMenu() {
    const dialog = document.getElementById('contents-dialog');
    if (dialog?.open) dialog.close();
  }
  async function noticeView(name) {
    const generation = navigationGeneration;
    const notice = bundle.notices[name];
    let text;
    try {
      const response = await fetch(new URL(notice.url, location.href));
      if (!response.ok) throw new Error('Notice HTTP ' + response.status);
      text = await response.text();
    } catch (error) {
      if (generation !== navigationGeneration) return;
      console.error(error);
      shell.innerHTML = active.pages.notices.body;
      hydrate(); fillLanguage();
      document.body.dataset.manualReady = 'notice-load-error';
      return;
    }
    if (generation !== navigationGeneration) return;
    const header = active.pages.notices.body.match(/<header\b[\s\S]*?<\/header>/)[0];
    // Never execute third-party notice HTML. Its original bytes are retained
    // separately and can be downloaded without modifying the licence text.
    shell.innerHTML = header + '<main class="standalone-notice"><div class="breadcrumb"><a href="#/notices">'+escape(t('originalLicenses'))+'</a><span>›</span></div><h1>' + escape(name) + '</h1><div class="link-actions"><button class="game-button primary" data-save-notice="' + escape(name) + '">'+escape(t('saveOriginal'))+'</button><a class="game-button secondary" href="#/notices">'+escape(t('backList'))+'</a></div><pre class="notice-text"></pre><iframe class="notice-html" title="'+escape(t('licenseFrame'))+'" sandbox hidden></iframe></main>';
    if (name.endsWith('.html')) {
      const frame = shell.querySelector('iframe');
      const doc = new DOMParser().parseFromString(text, 'text/html');
      doc.querySelectorAll('script,base,iframe,object,embed,link,meta[http-equiv],img,audio,video,source').forEach(node => node.remove());
      doc.querySelectorAll('*').forEach(node => {
        for (const attr of [...node.attributes]) if (/^on/i.test(attr.name)) node.removeAttribute(attr.name);
        if (node.matches('a[href]')) { node.removeAttribute('href'); node.removeAttribute('target'); }
      });
      const policy = doc.createElement('meta');
      policy.httpEquiv = 'Content-Security-Policy';
      policy.content = "default-src 'none'; style-src 'unsafe-inline'; font-src 'none'; form-action 'none'; base-uri 'none'";
      doc.head.prepend(policy);
      const style = doc.createElement('style');
      style.textContent = 'body{margin:18px;font:14px/1.65 sans-serif;color:#253052;background:#fff}pre{white-space:pre-wrap;overflow-wrap:anywhere}a{color:inherit}';
      doc.head.append(style);
      frame.srcdoc = '<!doctype html>' + doc.documentElement.outerHTML;
      frame.hidden = false;
      shell.querySelector('pre').hidden = true;
    } else shell.querySelector('pre').textContent = text;
    hydrate();
    document.title = name + ' | Multina ' + t('manual');
    document.body.dataset.page = 'notice';
    document.body.dataset.manualReady = 'standalone-v8';
    fillLanguage();
  }
  function navigate(page, section = '', animate = true) {
    navigationGeneration++;
    const key = page === 'notice' ? page + '/' + section : page;
    if (key === current && mounted) {
      currentPage = page;currentSection = section;
      closeMenu();
      mounted.openTarget(section ? '#' + section : '#content', animate);
      return;
    }
    if (page !== 'notice' && !Object.hasOwn(active.pages, page)) return;
    if (page === 'notice' && !Object.hasOwn(bundle.notices, section)) return;
    closeMenu();
    mounted?.dispose(); mounted = null;
    current = key;
    currentPage = page;currentSection = section;
    document.body.classList.remove('notice-page', 'sweeping', 'arriving');
    if (page === 'notice') noticeView(section);
    else {
      const view = active.pages[page];
      shell.innerHTML = view.body;
      document.body.dataset.page = page;
      document.body.dataset.manualReady = 'mounting';
      document.title = view.title;
      hydrate();
      if (page === 'notices') {
        document.body.classList.add('notice-page');
        document.body.dataset.manualReady = 'standalone-v8';
      } else {
        mounted = window.MultinaManualMount();
        document.body.dataset.manualReady = 'standalone-v8';
        mounted.openTarget(section ? '#' + section : '#content', animate);
      }
    }
    scrollTo(0, 0);
    fillLanguage();
    // Route changes stay in this document: no file navigation, fetch or URL
    // rewriting. This also avoids the embedded browser's navigation spinner.
  }
  document.addEventListener('click', event => {
    const save = event.target.closest('[data-save-notice]');
    if (save) {
      const name = save.dataset.saveNotice;
      const url = new URL(bundle.notices[name].url, location.href).href;
      const link = document.createElement('a'); link.href = url; link.download = name;
      document.body.append(link); link.click(); link.remove();
      return;
    }
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || link.target === '_blank' || link.download) return;
    const route = decodeRoute(link.getAttribute('href'));
    if (!route) return;
    event.preventDefault();
    navigate(route.page, route.section);
  });
  document.addEventListener('change', async event => {
    if (event.target.id !== 'language') return;
    const locale = event.target.value;if (!Object.hasOwn(bundle.locales,locale)) return;
    const opened = [...shell.querySelectorAll('.guide-item[open],.highlight-detail[open]')].map(n=>n.id||n.closest('.spotlight-card')?.id).filter(Boolean);
    const line = document.querySelector('.masthead')?.getBoundingClientRect().bottom || 0;
    const anchor = [...shell.querySelectorAll('.guide-item,.spotlight-card')].find(n=>{const r=n.getBoundingClientRect();return !n.hidden&&r.top<line+80&&r.bottom>line+16;});
    const page = currentPage, section = page === 'notice' ? currentSection : (anchor?.id || (scrollY<30?'':currentSection)), navigationAtChange=navigationGeneration;
    if (!await activateLocale(locale)) return;
    window.MultinaManualLanguage.remember(locale);
    window.MultinaManualLanguage.requested = locale;
    // Navigation remains usable while a newly selected language's font loads.
    // Never send a reader back to a page they left during that bounded wait.
    const sameNavigation=navigationAtChange===navigationGeneration;
    const targetPage=sameNavigation?page:currentPage,targetSection=sameNavigation?section:currentSection;
    const restoreOpened=sameNavigation?opened:[...shell.querySelectorAll('.guide-item[open],.highlight-detail[open]')].map(n=>n.id||n.closest('.spotlight-card')?.id).filter(Boolean);
    current = '';navigate(targetPage,targetSection,false);
    for (const id of restoreOpened) { const n=document.getElementById(id);if(n?.matches('details'))n.open=true;else n?.querySelector('[data-highlight-details]')?.setAttribute('open',''); }
  });
  addEventListener('hashchange', () => {
    const route = decodeRoute(location.hash);
    if (route) navigate(route.page, route.section, false);
  });
  // Reloading a direct link still works; normal clicks need not touch history.
  const initial = decodeRoute(location.hash) || { page: 'index', section: '' };
  document.getElementById('manual-icon').href = resource('assets/art/icon-legal.png');
  document.getElementById('manual-loading').textContent = t('loading');
  activateLocale(active.data.meta.language).then(()=>{
    document.getElementById('manual-loading').remove();navigate(initial.page, initial.section, false);
  });
  window.MultinaManualBundleInfo = Object.freeze({ format: 'web-assets', languages: available, pages: Object.keys(active.pages).length, notices: Object.keys(bundle.notices).length });
})();

// Optional sample hosted on this website. No video is loaded before an explicit click.
document.addEventListener('click',event=>{const button=event.target.closest?.('[data-load-example]');if(!button)return;const video=document.createElement('video');video.controls=true;video.preload='none';video.playsInline=true;const name=button.dataset.exampleSrc==='Multina_Dopamine_Rush_Japanese.mp4'?'Multina_Dopamine_Rush_Japanese.mp4':'Multina_Dopamine_Rush.mp4';video.src=new URL('5_Examples/'+name,location.href).href;video.setAttribute('aria-label',button.textContent);video.style.cssText='display:block;width:100%;max-height:70vh;background:#080c16;border-radius:16px;margin-block:16px';button.replaceWith(video);video.play().catch(()=>{});});

})().catch(error => {
  console.error(error);
  const loading = document.getElementById('manual-loading');
  if (loading) loading.textContent = (navigator.language || '').startsWith('ja')
    ? '説明書を読み込めませんでした ページを再読み込みしてください'
    : 'The manual could not be loaded. Please reload the page.';
});
