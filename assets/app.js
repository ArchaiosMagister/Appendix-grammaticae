(()=>{'use strict';
const params=new URLSearchParams(location.search),page=location.pathname.split('/').pop()||'index.html';
const safeStorage={get(){try{return JSON.parse(localStorage.getItem('appendix-selection')||'null')}catch{return null}},set(value){try{localStorage.setItem('appendix-selection',JSON.stringify(value))}catch{}}};
const saved=safeStorage.get()||{};
let selection={language:['latin','griego'].includes(params.get('lengua'))?params.get('lengua'):(page.startsWith('griego')?'griego':saved.language||'latin'),year:params.get('curso')==='2'?'2':params.get('curso')==='1'?'1':saved.year||'1',unit:1};
const maxUnits=language=>language==='griego'?14:10;
selection.unit=Math.max(1,Math.min(maxUnits(selection.language),parseInt(params.get('unidad')||saved.unit||'1',10)||1));
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/æ/g,'ae').toLowerCase().replace(/ς/g,'σ').replace(/\s+/g,' ');
const courseURL=(language,year,unit=1)=>`curso.html?lengua=${language}&curso=${year}${year==='1'?`&unidad=${unit}`:''}`;
let curriculum,visibleSearch=[],requestId=0;
async function loadJSON(url){const r=await fetch(url);if(!r.ok)throw Error('No se pudo cargar');return r.json();}
function updateSelectors(){for(const form of document.querySelectorAll('.course-selector')){form.elements.lengua.value=selection.language;form.elements.curso.value=selection.year;}
 const nav=document.querySelector('header nav');if(nav&&page==='curso.html'){
  nav.replaceChildren();const links=selection.year==='1'?[['Inicio','index.html'],['Latín I',courseURL('latin','1',selection.language==='latin'?selection.unit:1)],['Griego I',courseURL('griego','1',selection.language==='griego'?selection.unit:1)]]:[['Inicio','index.html'],['Latín II',courseURL('latin','2')],['Griego II',courseURL('griego','2')]];
  for(const [label,url] of links){const a=document.createElement('a');a.href=url;a.textContent=label;nav.append(a);}
 }
}
function updateURL(){history.replaceState(null,'',courseURL(selection.language,selection.year,selection.unit));safeStorage.set(selection);}
function stripHTML(html){const d=document.createElement('div');d.innerHTML=html;return d.textContent||'';}
function addLink(parent,title,url,description){const a=document.createElement('a');a.href=url;a.className='path';const h=document.createElement('h3');h.textContent=title;const p=document.createElement('p');p.textContent=description;a.append(h,p);parent.append(a);}
async function renderCourse(){
 document.documentElement.dataset.language=selection.language;
 const ticket=++requestId,content=document.querySelector('#course-content');if(!content)return;
 const languageName=selection.language==='latin'?'Latín':'Griego';document.title=`${languageName} ${selection.year==='1'?'I':'II'} · Appendix grammaticæ`;
 document.querySelector('#course-title').textContent=`${languageName} ${selection.year==='1'?'I':'II'}`;updateSelectors();
 const unitsPanel=document.querySelector('#units-panel'),description=document.querySelector('#course-description');content.replaceChildren();visibleSearch=[];
 if(selection.year==='2'){
  unitsPanel.hidden=true;description.textContent='Gramática completa: morfología, sintaxis y temas compartidos.';
  const links=document.createElement('div');links.className='two';
  addLink(links,'Morfología',selection.language==='latin'?'morfologia.html':'griego-morfologia.html','Consultar todas las formas y los paradigmas.');
  addLink(links,'Sintaxis',selection.language==='latin'?'sintaxis.html':'griego-sintaxis.html','Consultar todos los usos y construcciones.');content.append(links);
  if(selection.language==='latin'){const p=document.createElement('p');for(const [label,url] of [['Paradigmas verbales regulares','paradigmas-verbales.html'],['Verbos irregulares más frecuentes','verbos-irregulares.html']]){const a=document.createElement('a');a.href=url;a.textContent=label+' →';a.style.display='block';p.append(a);}content.append(p);}
  if(selection.language==='griego'){const p=document.createElement('p'),a=document.createElement('a');a.href='griego-anexos.html';a.textContent='Consultar los anexos griegos →';p.append(a);content.append(p);}return;
 }
 unitsPanel.hidden=false;description.textContent=`Contenidos acumulados hasta la unidad ${selection.unit}.`;
 const buttons=document.querySelector('#unit-buttons');buttons.replaceChildren();
 for(let u=1;u<=maxUnits(selection.language);u++){
  const button=document.createElement('button');button.type='button';button.textContent=`Unidad ${u}`;button.setAttribute('aria-pressed',String(u===selection.unit));button.dataset.unit=u;
  button.addEventListener('click',()=>{selection.unit=u;updateURL();renderCourse();});buttons.append(button);
 }
 try{curriculum??=await loadJSON('assets/curriculum.json');if(ticket!==requestId)return;
  for(const unit of curriculum[selection.language].units.filter(u=>u.number<=selection.unit)){
   const section=document.createElement('section');section.className='unit-section';const h2=document.createElement('h2');h2.textContent=`Unidad ${unit.number}`;h2.id=`unidad-${unit.number}`;section.append(h2);
   for(let j=0;j<unit.topics.length;j++){
    const topic=unit.topics[j],details=document.createElement('details');details.className='lesson';details.id=`u${unit.number}-tema${j+1}`;
    // Current unit is open; previous material remains available in concise accordions.
    details.open=unit.number===selection.unit;
    const summary=document.createElement('summary'),label=document.createElement('span');label.className='eyebrow';label.textContent=topic.group;const title=document.createElement('span');title.className='lesson-title';title.textContent=topic.title;summary.append(label,title);
    const body=document.createElement('div');body.className=`lesson-body ${selection.language==='griego'?'greek-content':''}`;body.innerHTML=topic.html;details.append(summary,body);section.append(details);
    visibleSearch.push({title:topic.title,language:selection.language,text:stripHTML(topic.html),url:`#${details.id}`,unit:unit.number});
   }content.append(section);
  }
  const note=document.createElement('p');note.className='course-note';note.textContent=`Mostrando las unidades 1–${selection.unit} de ${maxUnits(selection.language)}. Las unidades posteriores todavía no aparecen.`;content.append(note);
  if(location.hash){const target=document.getElementById(location.hash.slice(1));if(target){if(target.tagName==='DETAILS')target.open=true;target.scrollIntoView();}}
 }catch{content.innerHTML='<p>No se han podido cargar las unidades. Comprueba la conexión y vuelve a intentarlo.</p>';}
}
for(const form of document.querySelectorAll('.course-selector'))form.addEventListener('submit',e=>{
 e.preventDefault();const language=form.elements.lengua.value,year=form.elements.curso.value;
 selection={language,year,unit:language===selection.language?selection.unit:1};safeStorage.set(selection);
 if(page==='curso.html'){updateURL();renderCourse();}else location.href=courseURL(language,year,selection.unit);
});
updateSelectors();
if(page==='curso.html')renderCourse();
else if(page!=='index.html'){
 // Complete chapters are explicitly second-year views, regardless of a previously saved first-year selection.
 selection.year='2';selection.language=page.startsWith('griego')?'griego':'latin';updateSelectors();
 const notice=document.createElement('p');notice.className='complete-notice';notice.textContent='2.º · Gramática completa';const control=document.querySelector('.course-switch');if(control)control.append(notice);
}
const input=document.querySelector('#search'),results=document.querySelector('#results');let searchIndex;
async function search(){
 const q=norm(input.value.trim()),ticket=++searchTicket;results.replaceChildren();results.hidden=!q;if(!q)return;
 try{
  const limited=page==='curso.html'&&selection.year==='1';const data=limited?visibleSearch:(searchIndex??=await loadJSON('assets/search-data.json'));
  if(ticket!==searchTicket)return;const words=q.split(/\s+/),scope=page==='curso.html'?data.filter(p=>p.language===selection.language):data;
  const hits=scope.filter(p=>norm(p.title+' '+p.text).includes(q)).sort((a,b)=>Number(norm(b.title).includes(q))-Number(norm(a.title).includes(q)));
  const message=document.createElement('p');message.textContent=hits.length?`${hits.length} temas encontrados${limited?' en las unidades seleccionadas':''}`:'No hay resultados en este recorrido.';results.append(message);
  for(const hit of hits){const a=document.createElement('a');a.href=hit.url;a.textContent=hit.title;const small=document.createElement('small');small.textContent=`${hit.language==='griego'?'Griego':'Latín'}${hit.unit?` · Unidad ${hit.unit}`:''}`;a.append(small);
   if(hit.url.startsWith('#'))a.addEventListener('click',()=>{const d=document.getElementById(hit.url.slice(1));if(d)d.open=true;results.hidden=true;});results.append(a);}
 }catch{results.textContent='No se ha podido cargar el buscador. Puedes consultar los índices.';}
}
let searchTicket=0;
if(input&&results){input.addEventListener('input',search);input.addEventListener('keydown',e=>{if(e.key==='Escape'){results.hidden=true;input.value='';searchTicket++;}else if(e.key==='ArrowDown'){const a=results.querySelector('a');if(a){e.preventDefault();a.focus();}}});input.addEventListener('focus',()=>{if(input.value.trim())search();});document.addEventListener('click',e=>{if(!e.target.closest('.searchbar'))results.hidden=true;});}
document.addEventListener('change',event=>{if(event.target.matches('#participle-gender,[data-participle-gender]')){const gender=event.target.value;for(const form of document.querySelectorAll('.gender-form')){const value=form.getAttribute('data-'+gender);if(value)form.textContent=value;}}});
// Changing course/unit invalidates stale results from the previous selection.
document.addEventListener('click',e=>{if(e.target.closest('#unit-buttons')){if(results)results.hidden=true;if(input)input.value='';searchTicket++;}});
})();
