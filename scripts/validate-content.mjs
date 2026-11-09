import fs from 'node:fs';
const required={
 novedades:{strings:['id','title','summary','content','categoryId','publishDate','effectiveDate','author','source','editorialStatus','urgency'],arrays:['targetAudience','whatChanges','whatStays','salesArguments','systemCodes','relatedDocumentIds'],numbers:['viewsCount','version']},
 equipos:{strings:['id','name','brand','categoryTier','stockStatus','highlights','suggestedPlan','lastUpdated','source','editorialStatus'],arrays:['keySpecs','commercialConditions'],numbers:['priceCash','priceInitialFee','installments12','installments18','totalFinanced12','totalFinanced18','pricePortabilidad','priceRenovacion','pricePrepago']},
 planes:{strings:['id','name','category','dataHighSpeed','dataThen','callsAndSms','roamingLatam','effectivePeriod','editorialStatus'],arrays:['unlimitedApps','restrictions'],numbers:['monthlyFee']},
 documentos:{strings:['id','title','description','url','provider','fileType','categoryId','documentDate','addedDate','versionNumber','authorOrSource','visibility','status','accessCheckStatus'],arrays:['tags']},
 historico:{strings:['id','title','description','category','eventDate','addedDate','source','statusText','visibility'],arrays:['tags'],numbers:['year','month']},
 categorias:{strings:['id','name','slug','description','iconName','color'],arrays:['subcategories'],numbers:['order']},
 bloques:{strings:['id','title','type'],numbers:['order']},
};
const entry={strings:['id','title','summary','content','category','subcategory','editorialStatus','kind','driveUrl','source','audience','author','createdAt','updatedAt','eventDate','requirements','commonErrors'],numbers:['order','version']};
required.capacitaciones=entry;required['publicaciones-fijas']=entry;
for(const [name,schema] of Object.entries(required)){
 const rows=JSON.parse(fs.readFileSync(`contenido/${name}.json`,'utf8'));if(!Array.isArray(rows))throw Error(`${name}: debe contener una lista []`);
 const ids=new Set();for(const row of rows){
 for(const [kind,keys] of Object.entries(schema))for(const key of keys){const v=row[key];if(kind==='arrays'?!Array.isArray(v):typeof v!==(kind==='numbers'?'number':'string'))throw Error(`${name} / ${row.id}: revisa ${key}`);}
 if(!row.id||ids.has(row.id))throw Error(`${name}: ID vacío o duplicado ${row.id}`);ids.add(row.id);
 for(const key of ['url','driveUrl','documentUrl','driveFolderUrl'])if(row[key]&&!/^https:\/\//.test(row[key]))throw Error(`${name}: ${key} debe empezar por https://`);
 if(row.visibility && row.visibility!=='publico')throw Error(`${name}: este repositorio solo admite contenido público`);
 }
}
const config=JSON.parse(fs.readFileSync('contenido/configuracion.json','utf8'));
if(!config.headerBranding||!Array.isArray(config.headerBranding.announcements)||!Array.isArray(config.menuItems)||!config.themeSettings||!/^https:\/\/github.com\/[\w.-]+\/[\w.-]+$/.test(config.repositoryUrl))throw Error('Revisa configuracion.json');
console.log('Contenido JSON validado.');
