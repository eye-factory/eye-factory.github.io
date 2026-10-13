/* Copyright (c) 2026 eye-factory — https://eye-factory.net/ */
/* Current operation notes; existing artwork, routes, translations and original notices retained. */
window.MultinaManualApplyV110=(bundle,copy)=>{
 const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const paragraphs=rows=>rows.map((text,index)=>'<p'+(index===0?' class="main-summary"':'')+'>'+esc(text)+'</p>').join('');
 const figure=(name,title,t,lang)=>'<figure class="figure-slot"><div class="screenshot-stage"><img data-embedded-asset="assets/operation-v110/'+(lang==='ja'?'ja':'en')+'/'+name+'.png" alt="'+esc(title)+'" width="1600" height="1000" loading="lazy" decoding="async"></div><figcaption><strong>'+esc(title)+'</strong><p>'+esc(t.demo)+'</p></figcaption></figure>';
 for(const [lang,locale]of Object.entries(bundle.locales)){
  const t=copy[lang];if(!t||t.heads.length!==6||t.blocks.length!==8)throw Error('Missing 1.1.0 manual language '+lang);
  const docs=new Map(),docFor=id=>{if(!docs.has(id))docs.set(id,new DOMParser().parseFromString(locale.pages[id].body,'text/html'));return docs.get(id);};
  const defFor=id=>locale.data.pages.find(page=>page.id===id);
  const replace=(id,rows,image,title)=>{const content=docFor('recording').getElementById(id)?.querySelector(':scope > .guide-content');if(!content)throw Error('Missing recording guide '+id);content.innerHTML=paragraphs(rows)+figure(image,title,t,lang)+'<a class="section-link" href="#/recording/'+id+'">'+esc(locale.data.chrome.sectionLink)+'</a>';};
  function add(page,id,title,rows,image,area,group){
   const def=defFor(page),doc=docFor(page);if(doc.getElementById(id))throw Error('Duplicate 1.1.0 guide '+id);
   def.sections.unshift({id,title,area,group,promoted:false});
   const item=doc.createElement('details');item.className='guide-item left';item.id=id;item.dataset.area=area;item.dataset.group=group;
   item.innerHTML='<summary class="guide-heading"><img class="guide-face" data-embedded-asset="assets/art/face-smile-left.png" alt="" loading="lazy"><span class="heading-bubble"><span class="heading-meta"><span>'+esc(def.areas[area])+'</span><span>v1.1.0</span></span><span class="heading-title">'+esc(title)+'</span><span class="fold-prompt"><b class="fold-symbol" aria-hidden="true"></b><span class="open-word">'+esc(locale.data.chrome.open)+'</span><span class="close-word">'+esc(locale.data.chrome.close)+'</span></span></span></summary><div class="guide-content">'+paragraphs(rows)+(image?figure(image,title,t,lang):'')+'<a class="section-link" href="#/'+page+'/'+id+'">'+esc(locale.data.chrome.sectionLink)+'</a></div>';
   doc.getElementById('explanations').prepend(item);
  }
  replace('first-recording',[...t.blocks[0],...t.blocks[6]],'overview',t.heads[0]);
  replace('audio',t.blocks[7],'audio',t.heads[4]);
  replace('keys',t.blocks[6],'shortcuts','F9 / '+t.heads[0]);
  const entries=[['wipe-placement',1,'placement','right','editing'],['wipe-appearance',2,'artwork','right','effects'],['voice-levels',3,'mouth','right','effects'],['external-voice',4,'voice','right','effects'],['expression-keys',5,'expression','right','support']];
  for(const [id,index,image,area,group]of entries.reverse())add('recording',id,t.heads[index],t.blocks[index],image,area,group);
  add('index','v110-recording',t.heads[0],[...t.blocks[0],t.blocks[6][0]],null,'common','output');
  for(const [id,doc]of docs){defFor(id).sections.forEach((section,index)=>{const item=doc.getElementById(section.id);if(item?.matches('.guide-item'))item.dataset.order=String(index);});locale.pages[id].body=doc.body.innerHTML;}
  locale.data.meta.version='1.1.0';locale.data.meta.build=119;
  for(const [id,page]of Object.entries(locale.pages))if(!['legal','notices'].includes(id))page.body=page.body.replaceAll('Multina v1.0.3','Multina v1.1.0').replaceAll('>v1.0.3<','>v1.1.0<').replace(/\bbuild\s+118\b/g,'build 119');
  for(const name of ['overview','audio','placement','artwork','mouth','voice','expression','shortcuts'])bundle.assets['assets/operation-v110/'+(lang==='ja'?'ja':'en')+'/'+name+'.png']={type:'image/png',url:'assets/operation-v110/'+(lang==='ja'?'ja':'en')+'/'+name+'.png?v=1.1.0'};
 }
};
