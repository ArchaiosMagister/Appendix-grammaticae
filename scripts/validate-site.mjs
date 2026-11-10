import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const errors = [];
function fail(message) { errors.push(message); }
function read(file) { return fs.readFileSync(path.join(root, file), 'utf8'); }
function exists(file) { return fs.existsSync(path.join(root, file)); }

const required = [
  'index.html', 'curso.html', 'val/index.html', 'val/curso.html',
  'assets/style.css', 'assets/language-colors.css', 'assets/app.js',
  'assets/curriculum.json', 'val/app.js', 'val/curriculum.json',
  'assets/search-data.json', 'val/search-data.json'
];
for (const file of required) if (!exists(file)) fail('Falta archivo esencial: ' + file);

for (const file of ['assets/app.js', 'val/app.js', 'assets/theme.js']) {
  if (!exists(file)) continue;
  try { execFileSync(process.execPath, ['--check', path.join(root, file)], { stdio: 'pipe' }); }
  catch (e) { fail('Error de sintaxis JavaScript en ' + file + ': ' + (e.stderr?.toString() || e.message)); }
}

const curricula = {};
for (const [lang, file] of [['es', 'assets/curriculum.json'], ['val', 'val/curriculum.json']]) {
  if (!exists(file)) continue;
  try {
    const data = JSON.parse(read(file));
    curricula[lang] = data;
    for (const subject of ['latin', 'griego']) {
      if (!Array.isArray(data[subject]?.units) || !data[subject].units.length) {
        fail(file + ': faltan unidades para ' + subject);
        continue;
      }
      for (const [i, unit] of data[subject].units.entries()) {
        if (unit.number !== i + 1) fail(file + ': numeración no consecutiva en ' + subject);
        if (!Array.isArray(unit.topics) || !unit.topics.length) fail(file + ': unidad sin temas ' + subject + ' ' + unit.number);
        for (const topic of unit.topics || []) {
          if (typeof topic.title !== 'string' || !topic.title.trim()) fail(file + ': tema sin título');
          if (!(typeof topic.html === 'string' && topic.html.trim()) && !topic.source) {
            fail(file + ': tema sin contenido: ' + topic.title);
          }
        }
      }
    }
  } catch (e) { fail('JSON inválido en ' + file + ': ' + e.message); }
}

if (curricula.es && curricula.val) {
  for (const subject of ['latin', 'griego']) {
    const a = curricula.es[subject]?.units || [];
    const b = curricula.val[subject]?.units || [];
    if (a.length !== b.length) fail('Diferente número de unidades en ' + subject + ': ' + a.length + '/' + b.length);
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (a[i].topics.length !== b[i].topics.length) {
        fail('Apartados desincronizados en ' + subject + ', unidad ' + (i + 1));
      }
    }
  }
}

function checkHTMLLinks(file) {
  const html = read(file);
  const re = /\b(?:href|src)\s*=\s*["']([^"']+)["']/gi;
  for (const match of html.matchAll(re)) {
    const url = match[1].replaceAll('&amp;', '&').trim();
    if (!url || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\?|\$\{)/i.test(url)) continue;
    const relative = url.split(/[?#]/)[0];
    if (!relative || relative.startsWith('/')) continue;
    const target = path.resolve(root, path.dirname(file), decodeURIComponent(relative));
    if (!target.startsWith(root + path.sep) && target !== root) {
      fail(file + ': referencia fuera del repositorio: ' + url);
    } else if (!fs.existsSync(target)) {
      fail(file + ': enlace o recurso inexistente: ' + url);
    }
  }
}
for (const file of ['index.html', 'curso.html', 'val/index.html', 'val/curso.html']) {
  if (exists(file)) checkHTMLLinks(file);
}

if (errors.length) {
  console.error('Validación fallida (' + errors.length + ' error/es):');
  for (const error of errors) console.error(' - ' + error);
  process.exit(1);
}
console.log('OK: JavaScript, JSON, estructura ES/VAL, enlaces de acceso y recursos principales.');
