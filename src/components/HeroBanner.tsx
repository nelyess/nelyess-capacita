import React from 'react';
import { Search, X, Sparkles, AlertTriangle, RotateCcw, Clock } from 'lucide-react';
import { FilterState, ValidityStatus, CategoryItem, HeaderBranding } from '../types';

interface HeroBannerProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  categories: CategoryItem[];
  headerBranding: HeaderBranding;
  stats: {
    totalNews: number;
    urgentCount: number;
    validCount: number;
    upcomingCount: number;
    expiredCount: number;
    urgentValidCount: number;
    withDocsCount: number;
  };
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  urgentNewsTitle?: string;
  onOpenUrgentNews?: () => void;
}

const VALIDITY_OPTIONS: { id: ValidityStatus | 'all'; label: string }[] = [
  { id: 'vigente', label: 'Vigentes' },
  { id: 'proximo', label: 'Próximos' },
  { id: 'vencido', label: 'Vencidos (Histórico)' },
  { id: 'all', label: 'Todos los estados' },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  filters,
  setFilters,
  categories,
  headerBranding,
  stats,
  hasActiveFilters,
  onClearFilters,
  urgentNewsTitle,
  onOpenUrgentNews,
}) => {
  return (
    <div className="relative bg-slate-900 border-b border-slate-800 text-white overflow-hidden">
      {/* Subtle styled gradient without images */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-600/15 via-slate-900 to-slate-950 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-7 space-y-4">
        {/* Urgent Announcement Pill if any urgent news is currently valid */}
        {urgentNewsTitle && stats.urgentValidCount > 0 && (
          <div 
            onClick={onOpenUrgentNews}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-xl text-red-200 text-xs font-semibold cursor-pointer transition-all animate-pulse max-w-full"
            role="alert"
          >
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="font-bold text-red-300 uppercase tracking-wider text-[10px]">Atención Asesores:</span>
            <span className="truncate">{urgentNewsTitle}</span>
          </div>
        )}

        {/* Compact Title and Search Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{headerBranding?.portalName || 'Nelyess Capacita'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
              {headerBranding?.mainTitle || 'Novedades y herramientas comerciales Bitel'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              {headerBranding?.description || 'Consulta en tiempo real qué cambió, a quién aplica y la vigencia oficial de productos y precios.'}
            </p>
          </div>

          {/* Search Input Box */}
          <div className="w-full md:w-96 relative shrink-0">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev: FilterState) => ({ ...prev, searchQuery: e.target.value }))}
              placeholder={headerBranding?.searchPlaceholder || 'Buscar planes, equipos, novedades o documentos...'}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-800/90 border border-slate-700 text-white placeholder:text-slate-400 text-xs sm:text-sm rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all shadow-inner"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters((prev: FilterState) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                aria-label="Borrar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filters Controls Row: Validity Tabs + Categories */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Validity Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-800/90 rounded-xl">
            <span className="text-[11px] font-bold text-slate-400 px-2 shrink-0 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Vigencia:</span>
            </span>
            {VALIDITY_OPTIONS.map((opt) => {
              const isSelected = filters.validity === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setFilters((prev: FilterState) => ({ ...prev, validity: opt.id }))}
                  className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                  }`}
                >
                  {opt.label}
                  {opt.id === 'vigente' && stats.validCount > 0 && ` (${stats.validCount})`}
                  {opt.id === 'proximo' && stats.upcomingCount > 0 && ` (${stats.upcomingCount})`}
                  {opt.id === 'vencido' && stats.expiredCount > 0 && ` (${stats.expiredCount})`}
                </button>
              );
            })}
          </div>

          {/* Clear Filters Button if any filter active */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-400 hover:text-amber-300 hover:bg-slate-800 transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>

        {/* Dynamic Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold text-[11px] mr-1 shrink-0">Categoría:</span>
          <button
            onClick={() => setFilters((prev: FilterState) => ({ ...prev, categoryId: 'all' }))}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              filters.categoryId === 'all'
                ? 'bg-white text-slate-950 font-bold shadow-xs'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
            }`}
          >
            Todas las líneas
          </button>
          {categories.filter((c) => c.isPublic && !c.isArchived).map((cat) => {
            const isCatActive = filters.categoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFilters((prev: FilterState) => ({ ...prev, categoryId: cat.id }))}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isCatActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
