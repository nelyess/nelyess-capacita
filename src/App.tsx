import React,{useState,useEffect} from 'react';
import {Menu,X,BookOpen,Bookmark} from 'lucide-react';
import {content as data,repositoryUrl} from './content';
import {HeroBanner} from './components/HeroBanner';
import {NewsCard} from './components/NewsCard';
import {NewsDetailModal} from './components/NewsDetailModal';
import {DeviceCatalogView} from './components/DeviceCatalogView';
import {PlanesView} from './components/PlanesView';
import {DocumentosView} from './components/DocumentosView';
import {HistoricoView} from './components/HistoricoView';
import {EntriesView} from './components/EntriesView';
import {BlocksSectionView} from './components/BlocksSectionView';
import {BookmarksDrawer} from './components/BookmarksDrawer';
import {calculateValidityStatus,getPeruCurrentDateString} from './utils/validityCalculator';
import {safeLink} from './utils/drivePreview';
import type {NewsItem,FilterState} from './types';
const tabs=['novedades','equipos','planes','documentos','historico','capacitaciones','bloques'];
const readTab=()=>tabs.includes(location.hash.slice(1))?location.hash.slice(1):'novedades';
export default function App(){
 const [tab,setTab]=useState(readTab),[mobile,setMobile]=useState(false),[selected,setSelected]=useState<NewsItem|null>(null),[showSaved,setShowSaved]=useState(false),[showManage,setShowManage]=useState(location.hash==='#admin'),[report,setReport]=useState('');
 const [saved,setSaved]=useState<string[]>(()=>{try{const value=JSON.parse(localStorage.getItem('nc_bitel_bookmarked_news')||'[]');return Array.isArray(value)?value.filter(x=>typeof x==='string'):[];}catch{return [];}});
 const [filters,setFilters]=useState<FilterState>({searchQuery:'',categoryId:'all',urgency:'all',validity:'vigente'});
 const [day,setDay]=useState(getPeruCurrentDateString());
 useEffect(()=>{const hash=()=>{setTab(readTab());if(location.hash==='#admin')setShowManage(true);};window.addEventListener('hashchange',hash);const clock=setInterval(()=>setDay(getPeruCurrentDateString()),60000);return()=>{window.removeEventListener('hashchange',hash);clearInterval(clock);};},[]);
 useEffect(()=>{try{localStorage.setItem('nc_bitel_bookmarked_news',JSON.stringify(saved));}catch{}},[saved]);
 const go=(value:string)=>{location.hash=value;setTab(value);setMobile(false);};
 const toggle=(id:string)=>setSaved(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
 const news=data.news.filter(x=>x.editorialStatus==='publicado');
 const docs=data.documents.filter(x=>x.visibility==='publico' && x.status==='vigente');
 const categories=data.categories.filter(x=>x.isPublic && !x.isArchived).sort((a,b)=>a.order-b.order);
 const status=(n:NewsItem)=>calculateValidityStatus(n.startDate,n.endDate,n.validityStatus);
 const filtered=news.filter(n=>(filters.categoryId==='all'||n.categoryId===filters.categoryId)&&(filters.validity==='all'||status(n)===filters.validity)&&(filters.urgency==='all'||n.urgency===filters.urgency)&&[n.title,n.summary,n.content,...(n.whatChanges||[])].join(' ').toLowerCase().includes(filters.searchQuery.toLowerCase()));
 const urgent=news.find(n=>n.urgency==='urgente'&&status(n)==='vigente');
 const stats={totalNews:news.length,urgentCount:news.filter(n=>n.urgency==='urgente').length,validCount:news.filter(n=>status(n)==='vigente').length,upcomingCount:news.filter(n=>status(n)==='proximo').length,expiredCount:news.filter(n=>status(n)==='vencido').length,urgentValidCount:news.filter(n=>n.urgency==='urgente'&&status(n)==='vigente').length,withDocsCount:news.filter(n=>n.driveUrl||n.relatedDocumentIds.length).length};
 const announcements=data.headerBranding.showAnnouncements?data.headerBranding.announcements.filter(a=>a.active&&(!a.startDate||a.startDate.slice(0,10)<=day)&&(!a.endDate||a.endDate.slice(0,10)>=day)).sort((a,b)=>a.order-b.order):[];
 const reportItem=(item:{title:string})=>setReport(item.title);
 const menu=data.menuItems.filter(m=>m.isVisible).sort((a,b)=>a.order-b.order);
 return <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
 {announcements.map(a=><div key={a.id} className="bg-amber-400 text-slate-950 text-xs py-2 px-5 font-semibold">{a.text}{a.linkUrl && (safeLink(a.linkUrl)?<a href={safeLink(a.linkUrl)!} target="_blank" rel="noopener noreferrer" className="underline ml-3">Ver detalle</a>:a.linkUrl.startsWith('#')?<a href={a.linkUrl} className="underline ml-3">Ver detalle</a>:null)}</div>)}
 <header className="bg-white border-b border-slate-200"><div className="max-w-7xl mx-auto px-4 py-5 flex gap-5 items-center justify-between flex-wrap"><button onClick={()=>go('novedades')} className="flex items-center gap-3 text-left"><span className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-black">{data.headerBranding.brandInitials}</span><span><strong className="block">{data.headerBranding.portalName}</strong><span className="text-xs text-amber-700">{data.headerBranding.subtitle}</span></span></button><button aria-label="Abrir navegación" aria-expanded={mobile} className="md:hidden p-2" onClick={()=>setMobile(!mobile)}>{mobile?<X/>:<Menu/>}</button><nav aria-label="Navegación principal" className={`${mobile?'flex':'hidden'} md:flex w-full md:w-auto flex-wrap gap-1`}>{menu.map(m=>m.targetType==='external'?safeLink(m.targetPath)&&<a key={m.id} href={safeLink(m.targetPath)!} target="_blank" rel="noopener noreferrer" className="px-3 py-2 text-sm">{m.label} ↗</a>:<button key={m.id} className={`px-3 py-2 rounded-xl text-sm font-semibold ${tab===m.targetPath?'bg-amber-400 text-slate-950':'hover:bg-slate-100'}`} onClick={()=>go(tabs.includes(m.targetPath)?m.targetPath:'bloques')}>{m.label}</button>)}</nav><button className="text-sm inline-flex gap-1 items-center" onClick={()=>setShowSaved(true)}><Bookmark size={16}/>Guardados ({saved.length})</button></div></header>
 <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1 space-y-6">
 {tab==='novedades' && <><HeroBanner filters={filters} setFilters={setFilters} categories={categories} headerBranding={data.headerBranding} stats={stats} hasActiveFilters={filters.searchQuery!==''||filters.categoryId!=='all'||filters.validity!=='vigente'} onClearFilters={()=>setFilters({searchQuery:'',categoryId:'all',urgency:'all',validity:'all'})} urgentNewsTitle={urgent?.title} onOpenUrgentNews={()=>urgent&&setSelected(urgent)}/><EntriesView items={data.fixedPosts||[]}/><div><h2 className="font-bold text-xl">Novedades y comunicados</h2><p className="text-sm text-slate-500">{filtered.length} resultados</p></div><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{filtered.map(n=><NewsCard key={n.id} news={n} category={categories.find(c=>c.id===n.categoryId)} relatedDocuments={docs.filter(d=>n.relatedDocumentIds.includes(d.id))} isBookmarked={saved.includes(n.id)} onToggleBookmark={()=>toggle(n.id)} onOpenDetail={()=>setSelected(n)} onOpenReport={()=>reportItem(n)}/>)}</div>{!filtered.length&&<p className="nc-surface">No hay novedades con estos filtros. Selecciona «Todos los estados» para consultar las anteriores.</p>}</>}
 {tab==='equipos' && <DeviceCatalogView devices={data.devices} documents={docs} onOpenReport={reportItem}/>}
 {tab==='planes' && <PlanesView plans={data.plans} documents={docs} onOpenReport={reportItem}/>}
 {tab==='documentos' && <DocumentosView documents={docs} categories={categories} onOpenReport={reportItem}/>}
 {tab==='historico' && <HistoricoView items={data.historicalArchive.filter(x=>x.visibility==='publico')}/>}
 {tab==='capacitaciones' && <EntriesView items={data.learning||[]} training/>}
 {tab==='bloques' && <BlocksSectionView blocks={data.blocks} news={news} documents={docs} onOpenNewsDetail={setSelected}/>}
 </main><footer className="bg-white border-t p-6"><div className="max-w-7xl mx-auto flex flex-wrap justify-between gap-4 text-xs text-slate-500"><span>{data.themeSettings.footerNotice || 'Nelyess Capacita · Herramientas comerciales Bitel'}</span><button className="underline" onClick={()=>setShowManage(true)}>Administrar en GitHub</button></div></footer>
 <NewsDetailModal news={selected} category={categories.find(c=>c.id===selected?.categoryId)} relatedDocuments={docs.filter(d=>selected?.relatedDocumentIds.includes(d.id))} isBookmarked={!!selected&&saved.includes(selected.id)} onToggleBookmark={()=>selected&&toggle(selected.id)} onClose={()=>setSelected(null)} onOpenReport={()=>selected&&reportItem(selected)}/>
 <BookmarksDrawer isOpen={showSaved} onClose={()=>setShowSaved(false)} bookmarkedNews={news.filter(n=>saved.includes(n.id))} bookmarkedPlans={[]} categories={categories} onRemoveBookmark={toggle} onOpenNewsDetail={n=>{setShowSaved(false);setSelected(n);}}/>
 {showManage && <div className="fixed inset-0 z-[80] bg-slate-950/60 p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Administrar en GitHub"><section className="nc-surface max-w-2xl mx-auto my-10 space-y-4"><button autoFocus className="nc-button float-right" onClick={()=>{setShowManage(false);if(location.hash==='#admin')location.hash=tab;}}>Cerrar ×</button><BookOpen className="text-amber-600"/><h2 className="font-bold text-2xl">Administrar en GitHub</h2><p>La cuenta de GitHub controla quién puede modificar el portal. Edita los archivos de la carpeta <strong>contenido</strong> y guarda con <strong>Commit changes</strong>. La publicación se actualiza cuando termina el proceso de Actions.</p><p className="text-sm text-slate-500">El repositorio y sus archivos son públicos. No guardes contraseñas, documentos confidenciales ni datos personales. El historial de cambios está en GitHub.</p><a className="nc-button" href={repositoryUrl} target="_blank" rel="noopener noreferrer">Abrir repositorio ↗</a><p className="text-sm">Consulta LEEME_GITHUB.md para los pasos de edición y plantillas.</p></section></div>}
 {!!report && <div className="fixed inset-0 z-[90] bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-label="Informar una corrección"><section className="nc-surface max-w-lg mx-auto mt-20 space-y-4"><h2 className="text-xl font-bold">Informar una corrección</h2><p>Para informar sobre «{report}», abre una incidencia en GitHub. Necesitas una cuenta y el apartado Issues habilitado. No incluyas información privada: las incidencias son públicas.</p><a className="nc-button" target="_blank" rel="noopener noreferrer" href={`${repositoryUrl}/issues/new?title=${encodeURIComponent('Corrección: '+report)}`}>Continuar en GitHub ↗</a><button autoFocus className="nc-button ml-2" onClick={()=>setReport('')}>Cerrar</button><p className="text-xs text-slate-500">No se ha enviado ningún reporte desde esta ventana.</p></section></div>}
 </div>;
}
