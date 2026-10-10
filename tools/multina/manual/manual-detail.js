/* Copyright (c) 2026 eye-factory — https://eye-factory.net/ */
/* Operation-level Q&As, checked against Multina v1.0.3 (build 118).
   Keep the existing artwork, legal notices, translations and deep-link IDs. */
window.MultinaManualApplyDetail = (bundle, copy) => {
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const paragraphs = rows => rows.map(row => '<p>' + esc(row) + '</p>').join('');
  const steps = rows => '<ol class="quick-steps">' + rows.map(row => '<li>' + esc(row) + '</li>').join('') + '</ol>';
  for (const [lang, locale] of Object.entries(bundle.locales)) {
    const t = copy[lang];
    if (!t || t.heads.length !== 12) throw Error('Missing detailed manual translation: ' + lang);
    const docs = new Map();
    const documentFor = id => {
      if (!docs.has(id)) docs.set(id, new DOMParser().parseFromString(locale.pages[id].body, 'text/html'));
      return docs.get(id);
    };
    const definitionFor = id => locale.data.pages.find(page => page.id === id);
    const contentFor = (page, id) => {
      const node = documentFor(page).getElementById(id)?.querySelector(':scope > .guide-content');
      if (!node) throw Error('Missing manual answer: ' + page + '/' + id);
      return node;
    };
    const oldUpdate = page => [...contentFor(page, 'v102-update').querySelectorAll(':scope > p')].map(node => node.textContent);
    const shared = oldUpdate('index');
    const videoUpdate = oldUpdate('video');
    const comicUpdate = oldUpdate('comic');
    const firstVideoImport = {
      ja:'空きタブで新規作成し、メディアを取り込んで、目的のトラックへドラッグします。',
      en:'Create a project in an empty tab, import media, then drag it onto the appropriate track.',
      'zh-Hans':'在空标签中新建项目，导入媒体，再拖到所需轨道。',
      'zh-Hant':'在空分頁新增專案，匯入媒體，再拖到所需軌道。',
      ko:'빈 탭에서 새 프로젝트를 만들고 소재를 가져와 원하는 트랙으로 드래그합니다.',
      es:'Crea un proyecto en una pestaña vacía, importa medios y arrástralos a la pista correspondiente.',
      'pt-BR':'Crie um projeto em uma aba vazia, importe mídia e arraste para a faixa apropriada.',
      fr:'Créez un projet dans un onglet vide, importez des médias et glissez-les sur la piste voulue.',
      de:'Erstelle ein Projekt im leeren Tab, importiere Medien und ziehe sie auf die passende Spur.',
      th:'สร้างโปรเจกต์ในแท็บว่าง นำเข้าสื่อ แล้วลากไปยังแทร็กที่ต้องการ',
      id:'Buat proyek di tab kosong, impor media, lalu seret ke trek yang sesuai.'
    };
    const trackDelete = {
      ja:'トラック削除は、クリップがない空のトラックでだけ実行できます。クリップが残っている場合は先に別のトラックへ移動するなど、作品を残す方法を確認します。ロックは非表示ではなく編集を防ぐ設定です。',
      en:'Only an empty track can be deleted. If clips remain, preserve the work by moving them elsewhere first. Lock prevents editing; it does not hide the track.',
      'zh-Hans':'只能删除没有片段的空轨道。还有片段时，先移到其他轨道等，以保留作品。锁定是防止编辑，不是隐藏。',
      'zh-Hant':'只能刪除沒有片段的空軌道。還有片段時，先移到其他軌道等，以保留作品。鎖定是防止編輯，不是隱藏。',
      ko:'클립 없는 빈 트랙만 삭제할 수 있습니다. 남은 클립은 먼저 다른 트랙으로 옮겨 작품을 보존하세요. 잠금은 편집 방지이며 숨김이 아닙니다.',
      es:'Solo se puede borrar una pista vacía. Si quedan clips, consérvalos moviéndolos a otra pista primero. Bloquear evita editar; no oculta la pista.',
      'pt-BR':'Só é possível excluir faixa vazia. Se restarem clipes, preserve-os movendo para outra faixa antes. Bloquear impede edição; não oculta a faixa.',
      fr:'Seule une piste vide peut être supprimée. S’il reste des clips, préservez-les en les déplaçant d’abord. Verrouiller empêche l’édition, pas l’affichage.',
      de:'Nur leere Spuren können gelöscht werden. Verschiebe verbleibende Clips vorher, um die Arbeit zu erhalten. Sperren verhindert Bearbeitung, nicht die Anzeige.',
      th:'ลบได้เฉพาะแทร็กว่างที่ไม่มีคลิป หากยังมีคลิปให้ย้ายไปแทร็กอื่นก่อนเพื่อรักษางาน ล็อกป้องกันแก้ไข ไม่ได้ซ่อนแทร็ก',
      id:'Hanya trek kosong dapat dihapus. Jika masih ada klip, pindahkan dahulu agar karya tetap tersimpan. Kunci mencegah edit, bukan menyembunyikan trek.'
    };
    const tabCommands = {
      ja:'名前変更、作品コピー／ペースト、タブから外す（作品は一覧に残ります）。',
      en:'Rename, project Copy/Paste, Detach (the project remains in the list).',
      'zh-Hans':'重命名、项目复制／粘贴、从标签移除（项目留在列表中）。',
      'zh-Hant':'重新命名、專案複製／貼上、從分頁移除（專案留在清單中）。',
      ko:'이름 변경, 프로젝트 복사/붙여넣기, 탭에서 분리(목록에는 유지).',
      es:'Renombrar, Copiar/Pegar proyecto, Separar (queda en la lista).',
      'pt-BR':'Renomear, Copiar/Colar projeto, Remover da aba (fica na lista).',
      fr:'Renommer, Copier/Coller le projet, Retirer (reste dans la liste).',
      de:'Umbenennen, Projekt kopieren/einfügen, Lösen (bleibt in der Liste).',
      th:'เปลี่ยนชื่อ คัดลอก/วางโปรเจกต์ เอาออกจากแท็บ (งานยังอยู่ในรายการ)',
      id:'Ubah nama, Salin/Tempel proyek, Lepas (tetap dalam daftar).'
    };
    const link = (page, id, title) => '<p><a href="#/' + page + '/' + id + '">' + esc(title) + '</a></p>';
    const sectionLink = (page, id) => '<a class="section-link" href="#/' + page + '/' + id + '">' + esc(locale.data.chrome.sectionLink) + '</a>';
    const rename = (page, id, title) => {
      const def = definitionFor(page).sections.find(section => section.id === id);
      if (!def) throw Error('Missing manual definition: ' + page + '/' + id);
      def.title = title;
      documentFor(page).getElementById(id).querySelector('.heading-title').textContent = title;
    };
    const replace = (page, id, html, keepNotes = false) => {
      const content = contentFor(page, id);
      const notes = keepNotes ? [...content.children].filter(node => node.matches('.sign-panel,.supplement,.figure-slot')).map(node => node.outerHTML).join('') : '';
      content.innerHTML = html + notes + sectionLink(page, id);
    };
    const add = (page, id, titleIndex, group, area, html, after) => {
      const def = definitionFor(page), doc = documentFor(page);
      if (def.sections.some(section => section.id === id) || doc.getElementById(id)) throw Error('Duplicate answer: ' + id);
      const title = t.heads[titleIndex];
      const section = {id, title, group, area, promoted:false};
      const position = def.sections.findIndex(section => section.id === after);
      if (position < 0) throw Error('Missing insert position: ' + page + '/' + after);
      def.sections.splice(position + 1, 0, section);
      const item = doc.createElement('details');
      item.className = 'guide-item left'; item.id = id;
      item.dataset.group = group; item.dataset.area = area;
      item.innerHTML = '<summary class="guide-heading"><img class="guide-face" data-embedded-asset="assets/art/face-smile-left.png" alt="" loading="lazy"><span class="heading-bubble"><span class="heading-meta"><span>' + esc(def.areas[area]) + '</span><span>Q&A</span></span><span class="heading-title">' + esc(title) + '</span><span class="fold-prompt"><b class="fold-symbol" aria-hidden="true"></b><span class="open-word">' + esc(locale.data.chrome.open) + '</span><span class="close-word">' + esc(locale.data.chrome.close) + '</span></span></span></summary><div class="guide-content">' + html + sectionLink(page,id) + '</div>';
      doc.getElementById(after).after(item);
    };

    // Preserve the v102-update anchor but make it a concise current-version entry.
    for (const page of ['index','video','image','comic']) {
      rename(page, 'v102-update', t.heads[0]);
      const item = documentFor(page).getElementById('v102-update');
      item.querySelector('.heading-meta span:last-child').textContent = 'v1.0.3';
      item.removeAttribute('open');
      replace(page, 'v102-update', '<p class="main-summary">' + esc(t.intro) + '</p>');
    }
    add('index','project-slots',1,'basics','common',steps(t.slots),'project-name');
    add('index','custom-sharing',2,'output','data',steps(shared.slice(0,4)), 'save-export');
    contentFor('index','manual-help').insertAdjacentHTML('afterbegin',paragraphs([shared[4]]));
    add('video','context-locations',11,'editing','bottom',steps(t.paths), 'tracks-context');
    const trackNote = contentFor('video','tracks-context').querySelector('.supplement-content > p');
    if (!trackNote) throw Error('Missing track safety note');
    trackNote.textContent = trackDelete[lang];
    contentFor('video','text').insertAdjacentHTML('afterbegin',paragraphs([videoUpdate[0]]));
    add('video','start-snap',3,'editing','bottom',paragraphs(t.start),'timeline');
    add('video','gap-close',6,'editing','bottom',paragraphs([videoUpdate[1],t.gap,videoUpdate[2]]),'start-snap');
    rename('video','mosaic-blur',t.heads[4]);
    replace('video','mosaic-blur',steps(t.mosaic) + link('video','mask-keyframes',t.heads[5]),true);
    add('video','mask-keyframes',5,'effects','right',steps(t.mask),'mosaic-blur');
    replace('video','canvas-settings',steps(t.sizing));
    // The original first step conflated media import with timeline-based sizing.
    const firstVideo = contentFor('video','first-video');
    const firstStep = firstVideo.querySelector('.quick-steps > li');
    if (!firstStep) throw Error('Missing first video step');
    firstStep.textContent = firstVideoImport[lang] + ' ' + t.sizing[1];
    add('video','export-feedback',7,'output','top',paragraphs([videoUpdate[3],...t.progress]),'render');
    contentFor('video','project-export').insertAdjacentHTML('afterbegin',link('index','custom-sharing',t.heads[2]));
    const keys = contentFor('video','keys');
    const deleteRow = [...keys.querySelectorAll('tr')].find(row => /^R\s*\//.test(row.cells[0]?.textContent.trim() || ''));
    if (!deleteRow || deleteRow.cells.length < 2) throw Error('Missing default delete shortcut row: '+lang);
    deleteRow.cells[1].textContent = t.deleteKey;
    rename('image','region-effects',t.heads[4]);
    replace('image','region-effects',steps(t.image),true);
    add('image','custom-sharing',2,'output','top',steps(shared.slice(0,4)),'custom');
    add('comic','mosaic-blur',8,'effects','top',steps([comicUpdate[0],t.comic[0],comicUpdate[1],comicUpdate[2],t.comic[1]]) + link('comic','custom-sharing',t.heads[2]),'shapes-text');
    add('comic','toolbar-layout',9,'basics','top',paragraphs(t.layout),'workspace-layout');
    add('comic','custom-sharing',2,'output','top',steps(shared.slice(0,4)),'custom-pens');
    // Explain all project-tab commands without discarding the existing menu map/art.
    const menuMap = contentFor('comic','context-menu-map');
    const tabRow = menuMap.querySelector('table tbody tr:last-child');
    if (!tabRow || tabRow.cells.length !== 2) throw Error('Missing comic project-tab table row');
    tabRow.cells[1].textContent = tabCommands[lang];
    add('recording','stop-finalization',10,'output','top',steps(t.finish),'save-finish');

    // Relevant entry links keep readers out of the generic update/history paragraph.
    replace('index','v102-update',paragraphs([t.intro]) + link('index','project-slots',t.heads[1]) + link('index','custom-sharing',t.heads[2]));
    replace('video','v102-update',paragraphs([t.intro]) + link('video','context-locations',t.heads[11]) + link('video','mosaic-blur',t.heads[4]) + link('video','gap-close',t.heads[6]));
    replace('image','v102-update',paragraphs([t.intro]) + link('image','region-effects',t.heads[4]) + link('image','custom-sharing',t.heads[2]));
    replace('comic','v102-update',paragraphs([t.intro]) + link('comic','toolbar-layout',t.heads[9]) + link('comic','mosaic-blur',t.heads[8]) + link('comic','custom-sharing',t.heads[2]));

    for (const [id, doc] of docs) {
      definitionFor(id).sections.forEach((section, index) => {
        const item = doc.getElementById(section.id);
        if (item?.matches('.guide-item')) item.dataset.order = String(index);
      });
      locale.pages[id].body = doc.body.innerHTML;
    }
    locale.data.meta.version = '1.0.3';
    locale.data.meta.build = 118;
    // Version badges are presentation metadata, not changes to legal terms.
    for (const page of Object.values(locale.pages)) {
      page.body = page.body.replaceAll('v1.0.2','v1.0.3').replace(/\b1\.0\.2\b/g,'1.0.3').replace(/\bbuild\s+117\b/gi,'build 118');
    }
  }
};
