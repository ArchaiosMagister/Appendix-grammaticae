import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const read=path=>readFileSync(join(root,path),'utf8');
for(const [prefix,voc] of [['','Vocativo'],['val/','Vocatiu']]){
 const adj=read(prefix+'adjetivos.html');
 const forms=adj.match(new RegExp('<tr><th scope="row">'+voc+'</th><td><i lang="la">acer</i></td><td><i lang="la">acris</i></td>','g'))||[];
 assert.equal(forms.length,1,prefix+'acer vocativo masculino no corregido o duplicado');
 const elpis=(read(prefix+'griego-sustantivos.html'));
 assert(elpis.includes('<strong>'+voc+'</strong></th><td>ἐλπί</td><td>ἐλπίδ<strong>ες</strong></td>'),prefix+'vocativo griego incorrecto');
 assert(elpis.includes('<strong>'+(prefix?'Nominatiu':'Nominativo')+'</strong></th><td>ἐλπί<strong>ς</strong> (–δς)</td>'),prefix+'se alteró nominativo de ἐλπίς');
 const data=JSON.parse(read(prefix+(prefix?'curriculum.json':'assets/curriculum.json')));
 const topic=data.griego.units.find(u=>u.number===8).topics.find(t=>t.html.includes(prefix?'Temes en oclusiva · taula 113':'Temas en oclusiva · tabla 113'));
 assert(topic,'Tabla 113 ausente en '+prefix);
 assert(topic.html.includes('<strong>'+voc+'</strong></th><td>ἐλπί</td><td>ἐλπίδ<strong>ες</strong></td>'),prefix+'currículo: vocativo singular incoherente');
 assert(topic.html.includes('<strong>'+(prefix?'Nominatiu':'Nominativo')+'</strong></th><td>ἐλπί<strong>ς</strong> (–δς)</td>'),prefix+'currículo: nominativo alterado');
}
console.log('Vocativos acer y ἐλπί: fuentes HTML y curriculares ES/VA coherentes, sin afectar nominativos ni plurales.');
