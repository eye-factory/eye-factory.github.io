/* Copyright (c) 2026 eye-factory — https://eye-factory.net/ */
/* Original 1.1.1 operation notes; prior routes, licence and artwork are retained. */
window.MultinaManualApplyV111=(bundle,copy)=>{
 const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 for(const [lang,locale]of Object.entries(bundle.locales)){
  const t=copy[lang];if(!t||t.length<8)throw Error('Missing 1.1.1 manual language '+lang);
  const imageLang=lang==='ja'?'ja':'en';
  function figure(name,title){return '<figure class="figure-slot"><div class="screenshot-stage"><img data-embedded-asset="assets/operation-v111/'+imageLang+'/'+name+'.png" alt="'+esc(title)+'" width="1160" height="760" loading="lazy" decoding="async"></div><figcaption><strong>'+esc(title)+'</strong><p>'+esc(t[7])+'</p></figcaption></figure>';}
  function add(page,id,title,rows,names,area,group){
   const def=locale.data.pages.find(p=>p.id===page),body=locale.pages[page].body;if(def.sections.some(s=>s.id===id))throw Error('Duplicate 1.1.1 guide '+id);
   const content=rows.map((text,i)=>'<p'+(i===0?' class="main-summary"':'')+'>'+esc(text)+'</p>').join('')+names.map(name=>figure(name,title)).join('');
   const item='<details class="guide-item left" id="'+id+'" data-area="'+area+'" data-group="'+group+'" data-order="-1"><summary class="guide-heading"><img class="guide-face" data-embedded-asset="assets/art/face-smile-left.png" alt="" loading="lazy"><span class="heading-bubble"><span class="heading-meta"><span>'+esc(def.areas[area])+'</span><span>v1.1.1</span></span><span class="heading-title">'+esc(title)+'</span><span class="fold-prompt"><b class="fold-symbol" aria-hidden="true"></b><span class="open-word">'+esc(locale.data.chrome.open)+'</span><span class="close-word">'+esc(locale.data.chrome.close)+'</span></span></span></summary><div class="guide-content">'+content+'<a class="section-link" href="#/'+page+'/'+id+'">'+esc(locale.data.chrome.sectionLink)+'</a></div></details>';
   let found=false;locale.pages[page].body=body.replace(/<article\b[^>]*\bid=["']explanations["'][^>]*>/,tag=>{found=true;return tag+item;});if(!found)throw Error('Missing explanations '+page);def.sections.unshift({id,title,area,group,promoted:false});
  }
  add('video','gpu-export-v111',t[1],t.slice(5,7),[],'bottom','output');
  add('video','text-light-decoration',t[0],t.slice(2,5),['light-decoration','presets'],'right','effects');
  add('image','text-light-decoration',t[0],t.slice(2,5),['presets'],'right','effects');
  add('index','v111-update',t[0],[t[2],t[5]],[],'common','output');
  for(const name of ['light-decoration','presets'])bundle.assets['assets/operation-v111/'+imageLang+'/'+name+'.png']={type:'image/png',url:'assets/operation-v111/'+imageLang+'/'+name+'.png?v=1.1.1'};
  locale.data.meta.version='1.1.1';locale.data.meta.build=120;
  for(const [id,page]of Object.entries(locale.pages))if(!['legal','notices'].includes(id))page.body=page.body.replaceAll('Multina v1.1.0','Multina v1.1.1').replaceAll('>v1.1.0<','>v1.1.1<').replace(/\bbuild\s+119\b/g,'build 120');
 }
};
