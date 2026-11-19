(()=>{'use strict';const key='appendix-color-mode',root=document.documentElement,media=window.matchMedia('(prefers-color-scheme: dark)');let mode='system';if(location.pathname.endsWith('/curso.html')){let language=new URLSearchParams(location.search).get('lengua');if(!['latin','griego'].includes(language)){try{language=JSON.parse(localStorage.getItem('appendix-selection')||'null')?.language;}catch{}}if(['latin','griego'].includes(language))root.dataset.language=language;}try{const stored=localStorage.getItem(key);if(['system','light','dark'].includes(stored))mode=stored;}catch{}
function apply(){root.dataset.theme=mode==='system'?(media.matches?'dark':'light'):mode;const picker=document.getElementById('theme-mode');if(picker)picker.value=mode;}
apply();document.addEventListener('DOMContentLoaded',()=>{apply();const picker=document.getElementById('theme-mode');if(picker)picker.addEventListener('change',()=>{mode=picker.value;try{localStorage.setItem(key,mode);}catch{}apply();});});
if(media.addEventListener)media.addEventListener('change',()=>{if(mode==='system')apply();});
window.addEventListener('storage',event=>{if(event.key===key){mode=['system','light','dark'].includes(event.newValue)?event.newValue:'system';apply();}});
})();

/* SCHOLA_LEGACY_NOTICE_V1: aviso informativo; no redirecciones ni almacenamiento. */
(()=>{'use strict';
 const prefix='/Appendix-grammaticae/';
 if(!location.pathname.startsWith(prefix))return;
 document.addEventListener('DOMContentLoaded',()=>{
  const header=document.querySelector('header');
  if(!header||document.getElementById('schola-legacy-notice'))return;
  const isVal=(document.documentElement.lang||'').toLowerCase().startsWith('ca');
  const path=location.pathname.slice(prefix.length)||'index.html';
  const notice=document.createElement('aside');
  notice.id='schola-legacy-notice';
  notice.setAttribute('role','note');
  notice.style.cssText='box-sizing:border-box;max-width:74rem;margin:.65rem auto;padding:.65rem .9rem;border:1px solid rgba(128,128,128,.4);border-radius:.65rem;background:rgba(128,128,128,.09);font:inherit;font-size:.88rem;line-height:1.45;';
  const message=document.createElement('span');
  message.textContent=isVal
   ?'Esta gramàtica també està disponible en ScholaClassica. Esta pàgina continua funcionant. '
   :'Esta gramática también está disponible en ScholaClassica. Esta página sigue funcionando. ';
  const link=document.createElement('a');
  link.href='/ScholaClassica/apps/gramatica/'+path+location.search+location.hash;
  link.textContent=isVal?'Obrir este apartat en ScholaClassica':'Abrir este apartado en ScholaClassica';
  link.style.fontWeight='600';
  notice.append(message,link);
  header.insertAdjacentElement('afterend',notice);
 });
})();
