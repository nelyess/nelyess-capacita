import React, { useState } from 'react';
import { 
  Archive, 
  Search, 
  AlertTriangle, 
  Calendar, 
  Folder, 
  FileText, 
  FileSpreadsheet, 
  ExternalLink, 
  Clock, 
  Info,
  Tag
} from 'lucide-react';
import { HistoricalArchiveItem, DocumentFileType } from '../types';

interface HistoricoViewProps {
  items: HistoricalArchiveItem[];
  onOpenReport?: (item: { id: string; title: string; type: 'historico' }) => void;
}

export const HistoricoView: React.FC<HistoricoViewProps> = ({ items }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const [month,setMonth]=useState('all');
  const years = ['all',...new Set(items.map(i=>String(i.year)))].sort().reverse();
  const categories = ['all', ...new Set(items.map(i=>i.category))].sort();
  const types = [
    { id: 'all', label: 'Todos los tipos' },
    { id: 'promocion_vencida', label: 'Promociones Vencidas' },
    { id: 'sheet', label: 'Matrices de Precios' },
    { id: 'drive_folder', label: 'Carpetas de Evidencias Drive' },
    { id: 'pdf', label: 'Cartillas Anteriores' },
  ];

  const filteredItems = items.filter((item) => {
    if(month !== 'all' && String(item.month)!==month)return false;
    if (selectedYear !== 'all' && String(item.year) !== selectedYear) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedType !== 'all' && item.documentType !== selectedType) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchSource = item.source.toLowerCase().includes(q);
      const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchSource && !matchTags) return false;
    }

    return true;
  }).sort((a,b)=>b.eventDate.localeCompare(a.eventDate) || a.title.localeCompare(b.title));

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            <Archive className="w-4 h-4 text-amber-600" />
            <span>Memoria Comercial & Trazabilidad</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Archivo Histórico y Evidencias
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Repositorio histórico de comunicaciones vencidas, matrices de precios pasadas, actas de capacitación y carpetas de Google Drive archivadas para fines de consulta y auditoría.
          </p>
        </div>

        {/* Warning Badge: Histórico */}
        <div className="mt-4 bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="block text-amber-950 font-bold uppercase tracking-wider text-[11px]">
              Aviso Normativo Obligatorio:
            </strong>
            «Histórico: no utilizar como condición comercial vigente». Las promociones, tarifas y reglas listadas en esta sección corresponden a períodos concluidos y no deben ofrecerse a clientes actuales.
          </div>
        </div>

        {/* Filters Controls */}
        <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">Todos los años</option>
              {years.filter(y => y !== 'all').map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <select aria-label="Mes del histórico" value={month} onChange={e=>setMonth(e.target.value)} className="nc-input text-xs"><option value="all">Todos los meses</option>{Array.from({length:12},(_,i)=><option key={i} value={i+1}>{new Date(2026,i,1).toLocaleString('es-PE',{month:'long'})}</option>)}</select>
            {/* Category Selector */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">Todas las líneas</option>
              {categories.filter(c => c !== 'all').map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Type Selector */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {types.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Search box */}
          <div className="w-full sm:w-64 relative shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en el histórico..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Drive Storage Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p>
          <strong>Importante sobre evidencias externas:</strong> El portal registra y cataloga los metadatos y enlaces de las evidencias. Los archivos y carpetas originales deben mantenerse en su respectivo Google Drive para garantizar que continúen accesibles a lo largo del tiempo.
        </p>
      </div>

      {/* Historical Items List - 100% No-image typography rows */}
      <div className="space-y-3">
        {filteredItems.map((item,index) => (<React.Fragment key={item.id}>
          {(index===0 || filteredItems[index-1].eventDate.slice(0,7)!==item.eventDate.slice(0,7)) && <h3 className="font-bold text-lg pt-4">{new Date(item.eventDate.slice(0,7)+'-01T12:00:00').toLocaleDateString('es-PE',{year:'numeric',month:'long'})}</h3>}
          <div 
            key={item.id}
            className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="font-bold px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-200 rounded text-[10px]">
                  {item.statusText}
                </span>
                <span className="font-semibold text-slate-600 text-[11px]">
                  {item.category}
                </span>
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Fecha del hecho: {item.eventDate}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {item.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {item.description}
              </p>

              <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                <span>Fuente: <strong>{item.source}</strong></span>
                {item.tags && item.tags.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span>{item.tags.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Link to Document or Drive Folder */}
            <div className="shrink-0 self-end sm:self-center">
              {item.driveFolderUrl ? (
                <a
                  href={item.driveFolderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                >
                  <Folder className="w-4 h-4 text-sky-400" />
                  <span>Carpeta Drive</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              ) : item.documentUrl ? (
                <a
                  href={item.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Abrir Documento</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              ) : null}
            </div>
          </div>
        </React.Fragment>))}
      </div>

      {filteredItems.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
          No se encontraron registros en el archivo histórico con los filtros seleccionados.
        </div>
      )}
    </div>
  );
};
