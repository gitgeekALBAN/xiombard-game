import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve,sep,extname} from 'node:path';
const root=dirname(fileURLToPath(import.meta.url));
const types={'.html':'text/html; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.json':'application/json'};
createServer(async(req,res)=>{
  try{
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
    const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
    const path=resolve(root,'.'+(pathname==='/'?'/comparison.html':pathname));
    if(!path.startsWith(root+sep)||!types[extname(path)]){res.writeHead(404).end();return;}
    const data=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)],'Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:data);
  }catch{res.writeHead(404).end();}
}).listen(5175,'127.0.0.1',()=>console.log('Lighting comparison: http://127.0.0.1:5175/'));
