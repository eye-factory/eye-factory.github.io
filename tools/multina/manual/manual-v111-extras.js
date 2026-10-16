/* Copyright (c) 2026 eye-factory — https://eye-factory.net/ */
window.MultinaManualApplyV111Extras=(bundle,payload)=>{
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const links='<p><a href="https://otologic.jp/" target="_blank" rel="noopener noreferrer">OtoLogic — https://otologic.jp/</a> · <a href="https://otologic.jp/free/license.html" target="_blank" rel="noopener noreferrer">OtoLogic / Terms</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a></p><p><code>Sound: OtoLogic — https://otologic.jp/ (CC BY 4.0)</code></p>';
 for(const [lang,locale]of Object.entries(bundle.locales)){
  const t=payload.locales[lang];if(!t)throw Error('Missing credits translation '+lang);
  function add(page,id,title,body,area,group){
   const def=locale.data.pages.find(p=>p.id===page);if(def.sections.some(s=>s.id===id))throw Error('Duplicate guide '+id);
   const item='<details class="guide-item left" id="'+id+'" data-area="'+area+'" data-group="'+group+'" data-order="-1"><summary class="guide-heading"><img class="guide-face" data-embedded-asset="assets/art/face-smile-left.png" alt="" loading="lazy"><span class="heading-bubble"><span class="heading-meta"><span>'+esc(def.areas[area])+'</span><span>v1.1.1</span></span><span class="heading-title">'+esc(title)+'</span><span class="fold-prompt"><b class="fold-symbol" aria-hidden="true"></b><span class="open-word">'+esc(locale.data.chrome.open)+'</span><span class="close-word">'+esc(locale.data.chrome.close)+'</span></span></span></summary><div class="guide-content">'+body+'<a class="section-link" href="#/'+page+'/'+id+'">'+esc(locale.data.chrome.sectionLink)+'</a></div></details>';
   let found=false;locale.pages[page].body=locale.pages[page].body.replace(/<article\b[^>]*\bid=["']explanations["'][^>]*>/,tag=>{found=true;return tag+item;});if(!found)throw Error('Missing article '+page);
   def.sections.unshift({id,title,area,group,promoted:false});
  }
  const body='<p class="main-summary">'+esc(t.creditBody)+'</p>'+links;
  add('legal','otologic-credits',t.creditTitle,body,'assets','support');
  add('video','otologic-audio',t.creditTitle,body,'left','editing');
  add('video','portable-project-v111',t.transferTitle,'<p class="main-summary">'+esc(t.transferBody)+'</p>','top','output');
  locale.pages.notices.body=locale.pages.notices.body.replace(/(<tr><td>Kenney Interface Sounds<\/td>[\s\S]*?<\/tr>)/,'$1<tr><td>OtoLogic / 12 audio presets</td><td>CC BY 4.0<br><a href="#/notice/OtoLogic-CC-BY-4.0-NOTICE.txt">OtoLogic-CC-BY-4.0-NOTICE.txt</a><br><a href="https://otologic.jp/" target="_blank" rel="noopener noreferrer">https://otologic.jp/</a></td></tr>');
  locale.data.meta.build=124;
  for(const p of Object.values(locale.pages))p.body=p.body.replace(/(<small\b[^>]*class=["']version["'][^>]*>)[\s\S]*?(<\/small>)/g,'$1v1.1.1<span>build 124</span>$2');
 }
 bundle.notices['OtoLogic-CC-BY-4.0-NOTICE.txt']={type:'text/plain;charset=utf-8',sha256:payload.noticeSha256,url:'legal/original/OtoLogic-CC-BY-4.0-NOTICE.txt?v=1.1.1-124'};
};
