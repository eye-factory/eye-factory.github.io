/* Copyright (c) 2026 eye-factory — https://eye-factory.net/ */
window.MultinaManualApplyV112=bundle=>{
 const copy={
  ja:['1.1.2：作品と文字デザインの持ち運び','文字デザインのインポート・エクスポートで、3色グラデーション、円形グラデーションの中心、透過色、細かな縁幅を保持します。動画作品のエクスポートには音源・追加フォント・LUTなども含まれ、別の場所へインポートして編集を続けられます。アプリの更新では既存の設定と作品を引き継ぎます。'],
  en:['1.1.2: Transfer projects and text designs','Text design import and export preserve three-color gradients, radial gradient centers, transparent colors and precise outline widths. Video project exports include audio, added fonts and LUTs so you can import elsewhere and continue editing. App updates retain existing settings and projects.'],
  de:['1.1.2: Projekte und Textdesigns übertragen','Beim Import und Export von Textdesigns bleiben dreifarbige Verläufe, Mittelpunkte radialer Verläufe, transparente Farben und genaue Konturbreiten erhalten. Exportierte Videoprojekte enthalten auch Audio, zusätzliche Schriftarten und LUTs, damit Sie an einem anderen Ort weiterarbeiten können. App-Updates behalten vorhandene Einstellungen und Projekte bei.'],
  fr:['1.1.2 : transférer les projets et les styles de texte','L’importation et l’exportation des styles de texte conservent les dégradés à trois couleurs, le centre des dégradés radiaux, les couleurs transparentes et la largeur précise des contours. Les projets vidéo exportés incluent les sons, les polices ajoutées et les LUT pour poursuivre le montage ailleurs. Les mises à jour conservent les réglages et les projets existants.'],
  es:['1.1.2: trasladar proyectos y diseños de texto','La importación y exportación de diseños de texto conserva los degradados de tres colores, el centro de los degradados radiales, los colores transparentes y los anchos de contorno precisos. Los proyectos de vídeo exportados incluyen audio, fuentes añadidas y LUT para continuar la edición en otra ubicación. Las actualizaciones conservan los ajustes y proyectos existentes.'],
  'pt-BR':['1.1.2: transferir projetos e estilos de texto','A importação e exportação de estilos de texto preserva os gradientes de três cores, o centro dos gradientes radiais, as cores transparentes e as larguras precisas dos contornos. Os projetos de vídeo exportados incluem áudio, fontes adicionadas e LUTs para continuar a edição em outro local. As atualizações mantêm as configurações e os projetos existentes.'],
  id:['1.1.2: Memindahkan proyek dan desain teks','Impor dan ekspor desain teks mempertahankan gradasi tiga warna, pusat gradasi radial, warna transparan, dan lebar garis tepi yang presisi. Ekspor proyek video menyertakan audio, font tambahan, dan LUT agar Anda dapat melanjutkan penyuntingan di lokasi lain. Pembaruan aplikasi mempertahankan pengaturan dan proyek yang sudah ada.'],
  'zh-Hans':['1.1.2：转移作品和文字设计','导入和导出文字设计时，会保留三色渐变、径向渐变中心、透明颜色和精细的描边宽度。导出的视频作品也包含音频、附加字体和LUT，可在其他位置导入后继续编辑。更新应用时会保留现有设置和作品。'],
  'zh-Hant':['1.1.2：轉移作品和文字設計','匯入和匯出文字設計時，會保留三色漸層、放射漸層中心、透明色彩和精細的描邊寬度。匯出的影片作品也包含音訊、附加字型和LUT，可在其他位置匯入後繼續編輯。更新應用程式時會保留既有設定和作品。'],
  ko:['1.1.2: 작품과 텍스트 디자인 옮기기','텍스트 디자인을 가져오거나 내보낼 때 3색 그라데이션, 방사형 그라데이션의 중심, 투명 색상, 세밀한 테두리 두께를 유지합니다. 동영상 작품을 내보내면 오디오, 추가 글꼴, LUT도 포함되어 다른 위치에서 가져온 후 편집을 계속할 수 있습니다. 앱을 업데이트해도 기존 설정과 작품은 유지됩니다.'],
  th:['1.1.2: ย้ายโปรเจกต์และรูปแบบข้อความ','การนำเข้าและส่งออกรูปแบบข้อความจะคงการไล่สีสามสี จุดศูนย์กลางการไล่สีแบบรัศมี สีโปร่งใส และความหนาของเส้นขอบอย่างแม่นยำ โปรเจกต์วิดีโอที่ส่งออกจะรวมเสียง ฟอนต์ที่เพิ่ม และ LUT เพื่อให้นำเข้าที่อื่นแล้วแก้ไขต่อได้ การอัปเดตแอปจะเก็บการตั้งค่าและโปรเจกต์เดิมไว้']
 };
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 for(const [lang,locale]of Object.entries(bundle.locales)){
  const t=copy[lang];if(!t)throw Error('Missing 1.1.2 translation: '+lang);
  for(const [page,area]of [['index','common'],['video','top']]){
   const id='release-v112',def=locale.data.pages.find(p=>p.id===page);if(def.sections.some(s=>s.id===id))throw Error('Duplicate 1.1.2 guide');
   const item='<details class="guide-item left" id="'+id+'" data-area="'+area+'" data-group="output" data-order="-2"><summary class="guide-heading"><img class="guide-face" data-embedded-asset="assets/art/face-smile-left.png" alt="" loading="lazy"><span class="heading-bubble"><span class="heading-meta"><span>'+esc(def.areas[area])+'</span><span>v1.1.2</span></span><span class="heading-title">'+esc(t[0])+'</span><span class="fold-prompt"><b class="fold-symbol" aria-hidden="true"></b><span class="open-word">'+esc(locale.data.chrome.open)+'</span><span class="close-word">'+esc(locale.data.chrome.close)+'</span></span></span></summary><div class="guide-content"><p class="main-summary">'+esc(t[1])+'</p><a class="section-link" href="#/'+page+'/'+id+'">'+esc(locale.data.chrome.sectionLink)+'</a></div></details>';
   let inserted=false;locale.pages[page].body=locale.pages[page].body.replace(/<article\b[^>]*\bid=["']explanations["'][^>]*>/,tag=>{inserted=true;return tag+item;});if(!inserted)throw Error('Missing 1.1.2 article '+page);
   def.sections.unshift({id,title:t[0],area,group:'output',promoted:false});
  }
  locale.data.meta.version='1.1.2';locale.data.meta.build=125;
  for(const page of Object.values(locale.pages))page.body=page.body.replaceAll('Multina v1.1.1','Multina v1.1.2').replace(/(<small\b[^>]*class=["']version["'][^>]*>)[\s\S]*?(<\/small>)/g,'$1v1.1.2<span>build 125</span>$2');
 }
};
