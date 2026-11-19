import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {join} from 'node:path';
const js=readFileSync(join(import.meta.dirname,'../assets/theme.js'),'utf8');
const marker='/* SCHOLA_LEGACY_NOTICE_V1:';
const pos=js.indexOf(marker);
assert.ok(pos>=0,'Falta aviso aislado del tema');
const script=js.slice(pos);
function simulate(path,lang='es',search='',hash=''){
 let onReady;
 let appended=null;
 const header={insertAdjacentElement:(where,node)=>{assert.equal(where,'afterend');appended=node;}};
 const doc={
  documentElement:{lang},
  querySelector:sel=>sel==='header'?header:null,
  getElementById:()=>null,
  addEventListener:(event,handler)=>{assert.equal(event,'DOMContentLoaded');onReady=handler;},
  createElement:tag=>({
   tag,style:{cssText:'',fontWeight:''},
   setAttribute:function(name,value){this[name]=value;},
   append:function(...nodes){this.children=nodes;}
  })
 };
 runInNewContext(script,{location:{pathname:path,search,hash},document:doc});
 if(onReady)onReady();
 return appended;
}
for(const [url,lang,query,hash,expected] of [
 ['/Appendix-grammaticae/','es','','','/ScholaClassica/apps/gramatica/index.html'],
 ['/Appendix-grammaticae/griego-sustantivos.html','es','','#temas-en-oclusiva',
  '/ScholaClassica/apps/gramatica/griego-sustantivos.html#temas-en-oclusiva'],
 ['/Appendix-grammaticae/val/curso.html','ca-valencia','?lengua=latin&curso=1','#unidad3',
  '/ScholaClassica/apps/gramatica/val/curso.html?lengua=latin&curso=1#unidad3'],
 ['/ScholaClassica/apps/gramatica/index.html','es','','',null]
]){
 const notice=simulate(url,lang,query,hash);
 assert.equal(notice?.id||null,expected===null?null:'schola-legacy-notice');
 if(expected){
  assert.equal(notice.children[1].href,expected);
  assert.match(notice.children[0].textContent,/continua|sigue/);
  assert.match(notice.children[1].textContent,/ScholaClassica/);
 }
}
assert.ok(!script.includes('location.replace')&&!script.includes('location.assign')&&!script.includes('localStorage.setItem'),
 'El aviso no puede redirigir ni escribir progreso');
console.log('Aviso Appendix: 4 rutas, bilingüismo, anclas y ausencia de redirección comprobados.');
