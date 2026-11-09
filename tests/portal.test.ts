import {test} from 'node:test';
import assert from 'node:assert/strict';
import {drivePreview,safeLink} from '../src/utils/drivePreview';
import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomBytes} from 'node:crypto';
test('Drive: previews preserve resource keys and reject unsafe links',()=>{
 assert.equal(drivePreview('https://drive.google.com/file/d/abc_123/view?resourcekey=key'), 'https://drive.google.com/file/d/abc_123/preview?resourcekey=key');
 assert.equal(drivePreview('https://docs.google.com/spreadsheets/d/abc/edit'),'https://docs.google.com/spreadsheets/d/abc/preview');
 assert.equal(drivePreview('https://drive.google.com/drive/folders/abc'),null);
 assert.equal(drivePreview('https://evil.test/file/d/abc'),null);
 assert.equal(safeLink('javascript:alert(1)'),null);
});
test('API: authorization, published entries, history, recovery and disk persistence',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'nelyess-test-')), password=randomBytes(24).toString('hex');
 const port=3198,base=`http://127.0.0.1:${port}`;
 let child:any;
 async function start(){child=spawn(process.execPath,['--import','tsx','server.ts'],{env:{...process.env,NODE_ENV:'production',PORT:String(port),DATA_DIR:dir,ADMIN_PASSWORD:password},stdio:'ignore'});for(let i=0;i<80;i++){try{if((await fetch(base+'/api/public-content')).ok)return;}catch{}await new Promise(r=>setTimeout(r,100));}throw Error('Server unavailable');}
 async function stop(){if(child && child.exitCode===null){child.kill();await new Promise(r=>child.once('exit',r));}}
 let token=''; async function request(path:string,method='GET',body?:any){return fetch(base+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:body?JSON.stringify(body):undefined});}
 try{
 await start();assert.equal((await request('/api/admin/all-data')).status,401);
 assert.equal((await request('/api/auth/login','POST',{username:'admin',password:'admin123'})).status,401);
 token=(await (await request('/api/auth/login','POST',{username:'admin',password})).json()).token;assert.ok(token);
 const entry={title:'Prueba',category:'Comunicados',summary:'Resumen',content:'Texto',order:1,editorialStatus:'borrador',driveUrl:'https://drive.google.com/file/d/test/view',eventDate:'2020-01-01'};
 let result=await (await request('/api/admin/entries/fixedPosts','POST',entry)).json();assert.ok(result.success);
 let saved=result.item;assert.equal((await (await request('/api/public-content')).json()).fixedPosts.length,0);
 saved=(await (await request('/api/admin/entries/fixedPosts','POST',{...saved,editorialStatus:'publicado'})).json()).item;
 let pub=await (await request('/api/public-content')).json();assert.equal(pub.fixedPosts.length,1);assert.equal(pub.fixedPosts[0].eventDate,'2020-01-01');assert.equal(pub.users,undefined);
 assert.equal((await request('/api/admin/entries/fixedPosts','POST',{...saved,driveUrl:'javascript:bad'})).status,400);
 await request('/api/admin/entries/learning','POST',{...entry,id:undefined,category:'Activaciones',editorialStatus:'publicado'});
 await request('/api/admin/entries/historicalArchive','POST',{title:'Evidencia privada',eventDate:'2024-03-10',visibility:'interno',category:'Prueba',documentType:'pdf'});
 pub=await (await request('/api/public-content')).json();assert.equal(pub.learning.length,1);assert.ok(!pub.historicalArchive.some((x:any)=>x.title==='Evidencia privada'));
 await request('/api/admin/entries/fixedPosts','POST',{...saved,title:'Título cambiado'});
 let db=await (await request('/api/admin/all-data')).json();const log=db.auditLogs.find((x:any)=>x.snapshot?.collection==='fixedPosts' && x.snapshot.item.title==='Prueba' && x.snapshot.item.editorialStatus==='publicado');assert.ok(log);
 assert.ok((await (await request('/api/admin/audit/restore-version','POST',{logId:log.id})).json()).success);
 await stop();await start();pub=await (await request('/api/public-content')).json();assert.equal(pub.fixedPosts[0].title,'Prueba');assert.equal(pub.learning.length,1);
 }finally{await stop();rmSync(dir,{recursive:true,force:true});}
});
