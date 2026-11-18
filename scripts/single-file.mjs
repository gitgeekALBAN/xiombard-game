// Packs the built game into ONE html file that runs by itself: no server, no other files, no account anywhere.
// Send it to anyone; they open it in a browser. Usage: npm run build:single  ->  dist-single/xiombard-night-shift.html
import fs from 'node:fs';
import path from 'node:path';

const dist = 'dist', out = 'dist-single';
let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
// inline every script the page loads from its own folder; a closing script tag inside the code would end the block early
html = html.replace(/<script([^>]*)\ssrc="\.\/([^"]+)"([^>]*)><\/script>/g, (_, a, src, b) => {
  const code = fs.readFileSync(path.join(dist, src), 'utf8').replace(/<\/script/gi, '<\\/script');
  return `<script${a.replace(/\scrossorigin/g, '')}${b.replace(/\scrossorigin/g, '')}>\n${code}\n</script>`;
});
html = html.replace(/<link[^>]*rel="modulepreload"[^>]*>\s*/g, '');
const left = html.match(/(?:src|href)="\.\/assets\/[^"]+"/g);
if (left) throw new Error('still refers to separate files: ' + left.join(', '));
fs.mkdirSync(out, { recursive: true });
const file = path.join(out, 'xiombard-night-shift.html');
fs.writeFileSync(file, html);
console.log(`${file}  ${(html.length / 1024).toFixed(0)} KB`);
