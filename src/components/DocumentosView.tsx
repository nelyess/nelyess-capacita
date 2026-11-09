import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  ExternalLink, 
  Folder, 
  FileSpreadsheet, 
  Presentation, 
  File, 
  AlertTriangle, 
  ShieldCheck, 
  Info, 
  Flag, 
  Check, 
  Clock, 
  Plus, 
  Edit3,
  HelpCircle,
  Eye,
  Tag
} from 'lucide-react';
import { DocumentItem, CategoryItem, DocumentFileType } from '../types';

interface DocumentosViewProps {
  documents: DocumentItem[];
  categories: CategoryItem[];
  onOpenReport: (item: { id: string; title: string; type: 'documento' }) => void;
  quickEditMode?: boolean;
  onQuickEditDocument?: (doc: DocumentItem) => void;
  onOpenCreateDocument?: () => void;
}

export const DocumentosView: React.FC<DocumentosViewProps> = ({
  documents,
  categories,
  onOpenReport,
  quickEditMode,
  onQuickEditDocument,
  onOpenCreateDocument,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showPermissionsHelp, setShowPermissionsHelp] = useState(true);

  const getFileIcon = (type: DocumentFileType) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-600" />;
      case 'sheet':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case 'presentation':
        return <Presentation className="w-5 h-5 text-amber-600" />;
      case 'drive_folder':
        return <Folder className="w-5 h-5 text-sky-600" />;
      case 'document':
        return <FileText className="w-5 h-5 text-blue-600" />;
      default:
        return <File className="w-5 h-5 text-slate-500" />;
    }
  };

  const getFileLabel = (type: DocumentFileType) => {
    switch (type) {
      case 'pdf':
        return 'PDF';
      case 'sheet':
        return 'Hoja de Cálculo (Excel/Sheets)';
      case 'presentation':
        return 'Presentación';
      case 'drive_folder':
        return 'Carpeta de Drive';
      case 'document':
        return 'Documento (Word/Docs)';
      default:
        return 'Archivo';
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    // Only active documents
    if (doc.status !== 'vigente') return false;

    if (selectedCategory !== 'all' && doc.categoryId !== selectedCategory) return false;
    if (selectedType !== 'all' && doc.fileType !== selectedType) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchDesc = doc.description.toLowerCase().includes(q);
      const matchTags = doc.tags?.some((t) => t.toLowerCase().includes(q));
      const matchSource = doc.authorOrSource.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchTags && !matchSource) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
              <FileText className="w-4 h-4" />
              <span>Repositorio Oficial de Enlaces & Cartillas</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Documentos y Enlaces de Google Drive
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Acceso a cartillas oficiales, directivas de seguridad, matrices tarifarias y carpetas de capacitación alojadas en Google Drive y servidores institucionales.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {quickEditMode && onOpenCreateDocument && (
              <button
                onClick={onOpenCreateDocument}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>+ Agregar Documento</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters Controls */}
        <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">Todos los formatos</option>
              <option value="pdf">PDF</option>
              <option value="sheet">Hojas de Cálculo</option>
              <option value="document">Documentos</option>
              <option value="presentation">Presentaciones</option>
              <option value="drive_folder">Carpetas Drive</option>
            </select>
          </div>

          {/* Search box */}
          <div className="w-full sm:w-64 relative shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar documento o circular..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Mandatory Drive Permissions Guidance Box */}
      {showPermissionsHelp && (
        <div className="bg-amber-50/80 border border-amber-300/80 rounded-2xl p-4 sm:p-5 text-xs text-amber-950 space-y-3 shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-900 text-sm">
                  Configuración y comprobación de permisos en Google Drive
                </h4>
                <p className="mt-1 text-slate-800 leading-relaxed font-medium">
                  “Agregar un enlace al portal no cambia los permisos de Google Drive. Para que cualquier visitante pueda abrir el archivo, configura en Drive: <strong>Compartir → Acceso general → Cualquier persona con el enlace → Lector</strong>, si tu cuenta permite esa opción. Para documentos privados, mantén el acceso restringido a las personas autorizadas.”
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPermissionsHelp(false)}
              className="text-amber-800 hover:text-amber-950 text-xs font-bold p-1"
              title="Ocultar ayuda"
            >
              Entendido
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 border-t border-amber-200/80 text-[11px] text-slate-700">
            <div className="flex items-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1" />
              <span><strong>Independencia de permisos:</strong> Ver el portal no otorga acceso si el archivo de Drive es privado o restringido.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1" />
              <span><strong>Cuentas corporativas:</strong> Políticas institucionales de Bitel o Workspace pueden requerir inicio de sesión con correo de la empresa.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1" />
              <span><strong>Comprobación recomendada:</strong> Para validar acceso público, abre el enlace en una ventana de incógnito sin sesión de Google activa.</span>
            </div>
          </div>
        </div>
      )}

      {/* Documents List - 100% No-image rows */}
      <div className="space-y-3">
        {filteredDocuments.map((doc) => {
          const category = categories.find((c) => c.id === doc.categoryId);

          return (
            <div
              key={doc.id}
              className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Document Info */}
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="p-2.5 bg-slate-100 rounded-xl shrink-0 mt-0.5">
                  {getFileIcon(doc.fileType)}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 text-[10px]">
                      {getFileLabel(doc.fileType)}
                    </span>
                    <span className="font-bold text-amber-700 text-[11px]">
                      {doc.versionNumber}
                    </span>
                    {category && (
                      <span className="text-slate-500 text-[11px]">
                        · {category.name}
                      </span>
                    )}
                    <span className="text-slate-400 text-[10px] inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {doc.documentDate}
                    </span>
                    {/* Status pill: Acceso no verificado */}
                    <span 
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200"
                      title="Los permisos finales dependen de la configuración en Google Drive"
                    >
                      Acceso no verificado
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                    {doc.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {doc.description}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                    <span>Fuente: <strong>{doc.authorOrSource}</strong></span>
                    {doc.tags && doc.tags.length > 0 && (
                      <div className="hidden sm:flex items-center gap-1 ml-2">
                        <Tag className="w-3 h-3 text-slate-400" />
                        <span>{doc.tags.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {quickEditMode && onQuickEditDocument && (
                  <button
                    onClick={() => onQuickEditDocument(doc)}
                    className="p-2 text-slate-600 bg-amber-100 hover:bg-amber-200 rounded-lg text-xs font-bold"
                    title="Editar metadatos del documento"
                  >
                    <Edit3 className="w-4 h-4 text-amber-900" />
                  </button>
                )}

                <button
                  onClick={() => onOpenReport({ id: doc.id, title: doc.title, type: 'documento' })}
                  className="p-2 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs"
                  title="Reportar enlace caído o dato incorrecto"
                >
                  <Flag className="w-4 h-4" />
                </button>

                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm shrink-0"
                  title="Abre el recurso en Google Drive en una nueva pestaña"
                >
                  <span>{doc.provider === 'google_drive' ? 'Abrir en Drive' : 'Abrir documento'}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
          No se encontraron documentos con los filtros seleccionados.
        </div>
      )}
    </div>
  );
};
