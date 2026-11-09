import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToString} from 'react-dom/server';
import App from '../src/App';
import {drivePreview,safeLink} from '../src/utils/drivePreview';
test('Drive: enlace de archivo, resourcekey, carpetas y dominios externos',()=>{
 assert.equal(drivePreview('https://drive.google.com/file/d/abc_123/view?resourcekey=key'),'https://drive.google.com/file/d/abc_123/preview?resourcekey=key');
 assert.equal(drivePreview('https://drive.google.com/drive/folders/abc'),null);
 assert.equal(drivePreview('https://evil.example/file/d/abc'),null);
 assert.equal(safeLink('javascript:alert(1)'),null);
});
for(const tab of ['novedades','equipos','planes','documentos','historico','capacitaciones','bloques','admin'])test(`Vista ${tab}: render sin servidor API`,()=>{
 Object.defineProperty(globalThis,'location',{value:{hash:'#'+tab},configurable:true});
 Object.defineProperty(globalThis,'localStorage',{value:{getItem:()=>null,setItem:()=>{}},configurable:true});
 const html=renderToString(React.createElement(App));assert.match(html,/Nelyess/);assert.ok(html.length>1000);
});
