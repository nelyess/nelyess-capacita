import { EntryAdmin } from './EntryAdmin';
import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Newspaper, 
  Smartphone, 
  Wifi, 
  FileText, 
  Archive, 
  Palette, 
  Flag, 
  Trash2, 
  Users, 
  Sliders, 
  Menu as MenuIcon, 
  Save, 
  Plus, 
  Edit3, 
  Trash, 
  RotateCcw, 
  Check, 
  AlertTriangle, 
  ExternalLink,
  ShieldCheck,
  Download,
  Upload,
  Info
} from 'lucide-react';
import { 
  CompleteDatabaseSchema, 
  UserAccount, 
  NewsItem, 
  DocumentItem, 
  DeviceProduct, 
  BitelPlan, 
  CategoryItem, 
  MenuItem, 
  HeaderBranding, 
  BlockItem, 
  ThemeSettings, 
  DataReport 
} from '../types';
import { apiClient } from '../utils/apiClient';

interface AdminPanelProps {
  initialTab?: string;
  database: CompleteDatabaseSchema;
  currentUser: UserAccount;
  onRefreshData: () => Promise<void>;
  onClose: () => void;
  onOpenBackupModal: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  initialTab = 'inicio',
  database,
  currentUser,
  onRefreshData,
  onClose,
  onOpenBackupModal,
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [blockForm,setBlockForm] = useState<BlockItem[]>(database.blocks);
  const [auditQuery,setAuditQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Editable forms local state
  const [brandingForm, setBrandingForm] = useState<HeaderBranding>({ ...database.headerBranding });
  const [themeForm, setThemeForm] = useState<ThemeSettings>({ ...database.themeSettings });
  const [menuItems, setMenuItems] = useState<MenuItem[]>([...database.menuItems]);
  const [categories, setCategories] = useState<CategoryItem[]>([...database.categories]);

  // Selected item editors
  const [editingNews, setEditingNews] = useState<Partial<NewsItem> | null>(null);
  const [editingDoc, setEditingDoc] = useState<Partial<DocumentItem> | null>(null);
  const [editingDevice, setEditingDevice] = useState<Partial<DeviceProduct> | null>(null);
  const [editingPlan, setEditingPlan] = useState<Partial<BitelPlan> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<CategoryItem> | null>(null);
  const [deleteCatModal, setDeleteCatModal] = useState<{ cat: CategoryItem; affectedNews: number; affectedDocs: number } | null>(null);
  const [reassignTargetCatId, setReassignTargetCatId] = useState<string>('cat_pospago');

  const flashMessage = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const tabs = [
    { id: 'inicio', label: 'Inicio y Encabezado', icon: Sliders },
    { id: 'menu', label: 'Menús y Navegación', icon: MenuIcon },
    { id: 'novedades', label: 'Novedades y Publicaciones', icon: Newspaper },
    { id: 'categorias', label: 'Categorías y Etiquetas', icon: Layers },
    { id: 'equipos', label: 'Equipos & Precios', icon: Smartphone },
    { id: 'planes', label: 'Planes Comerciales', icon: Wifi },
    { id: 'documentos', label: 'Documentos y Enlaces Drive', icon: FileText },
    { id: 'learning', label: 'Capacitaciones', icon: Layers },
    { id: 'fixedPosts', label: 'Publicaciones fijas', icon: Newspaper },
    { id: 'historico', label: 'Archivo Histórico', icon: Archive },
    { id: 'bloques', label: 'Bloques Modulares', icon: Layers },
    { id: 'apariencia', label: 'Apariencia y Estilos', icon: Palette },
    { id: 'reportes', label: `Reportes de Asesores (${database.dataReports.filter(r => r.status === 'pendiente').length})`, icon: Flag },
    { id: 'papelera', label: 'Papelera e Historial', icon: Trash2 },
    ...(currentUser.role === 'administrador' ? [{ id: 'usuarios', label: 'Usuarios y Permisos', icon: Users }] : []),
  ];

  // Save branding
  const handleSaveBranding = async () => {
    setSaving(true);
    try {
      await apiClient.saveHeaderBranding(brandingForm);
      await onRefreshData();
      flashMessage('Encabezado y avisos actualizados en la base de datos compartida');
    } catch (err: any) {
      alert(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  // Save menu
  const handleSaveMenu = async () => {
    setSaving(true);
    try {
      await apiClient.saveMenuItems(menuItems);
      await onRefreshData();
      flashMessage('Navegación actualizada para todos los visitantes');
    } catch (err: any) {
      alert(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  // Save theme
  const handleSaveTheme = async () => {
    setSaving(true);
    try {
      await apiClient.saveTheme(themeForm);
      await onRefreshData();
      flashMessage('Apariencia actualizada');
    } catch (err: any) {
      alert(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  // Save News
  const handleSaveNewsItem = async () => {
    if (!editingNews || !editingNews.title) return;
    setSaving(true);
    try {
      await apiClient.saveNews({
        ...editingNews,
        author: editingNews.author || currentUser.displayName,
      });
      await onRefreshData();
      setEditingNews(null);
      flashMessage('Publicación guardada en base de datos');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete News
  const handleDeleteNewsItem = async (id: string, permanent = false) => {
    if (!confirm(permanent ? '¿Eliminar permanentemente esta publicación?' : '¿Enviar a la papelera?')) return;
    try {
      await apiClient.deleteNews(id, permanent);
      await onRefreshData();
      flashMessage(permanent ? 'Publicación eliminada definitivamente' : 'Publicación movida a la papelera');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Save Document
  const handleSaveDocItem = async () => {
    if (!editingDoc || !editingDoc.title || !editingDoc.url) {
      alert('Ingresa título y enlace válido');
      return;
    }
    setSaving(true);
    try {
      await apiClient.saveDocument({
        ...editingDoc,
        authorOrSource: editingDoc.authorOrSource || currentUser.displayName,
      });
      await onRefreshData();
      setEditingDoc(null);
      flashMessage('Documento registrado en la base de datos');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Save Device
  const handleSaveDeviceItem = async () => {
    if (!editingDevice || !editingDevice.name) return;
    setSaving(true);
    try {
      await apiClient.saveDevice(editingDevice);
      await onRefreshData();
      setEditingDevice(null);
      flashMessage('Equipo y precios actualizados');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Save Plan
  const handleSavePlanItem = async () => {
    if (!editingPlan || !editingPlan.name) return;
    setSaving(true);
    try {
      await apiClient.savePlan(editingPlan);
      await onRefreshData();
      setEditingPlan(null);
      flashMessage('Plan comercial actualizado');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Save Category
  const handleSaveCategoryItem = async () => {
    if (!editingCategory || !editingCategory.name) return;
    setSaving(true);
    try {
      await apiClient.saveCategory({
        ...editingCategory,
        slug: editingCategory.name.toLowerCase().replace(/\s+/g, '-'),
      });
      await onRefreshData();
      setEditingCategory(null);
      flashMessage('Categoría guardada');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Confirm delete category
  const handleInitiateDeleteCat = (cat: CategoryItem) => {
    const affectedNews = database.news.filter((n) => n.categoryId === cat.id).length;
    const affectedDocs = database.documents.filter((d) => d.categoryId === cat.id).length;
    setDeleteCatModal({ cat, affectedNews, affectedDocs });
  };

  const handleConfirmDeleteCat = async () => {
    if (!deleteCatModal) return;
    try {
      const res = await apiClient.deleteOrReassignCategory(deleteCatModal.cat.id, reassignTargetCatId);
      await onRefreshData();
      setDeleteCatModal(null);
      flashMessage(`Categoría eliminada. Registros reasignados: ${res.affectedNews} noticias, ${res.affectedDocs} documentos.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Restore trash
  const handleRestoreFromTrash = async (type: 'noticia' | 'equipo' | 'plan', id: string) => {
    try {
      await apiClient.restoreFromTrash(type, id);
      await onRefreshData();
      flashMessage('Elemento restaurado');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Empty trash
  const handleEmptyTrash = async () => {
    if (!confirm('¿Vaciar permanentemente todos los elementos de la papelera? Esta acción no se puede deshacer.')) return;
    try {
      await apiClient.emptyTrash();
      await onRefreshData();
      flashMessage('Papelera vaciada');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Restore version snapshot
  const handleRestoreSnapshot = async (logId: string) => {
    if (!confirm('¿Restaurar esta versión histórica? Se creará una nueva versión conservando el registro de auditoría.')) return;
    try {
      await apiClient.restoreVersionSnapshot(logId);
      await onRefreshData();
      flashMessage('Versión restaurada con éxito');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Resolve Report
  const handleUpdateReportStatus = async (id: string, status: DataReport['status']) => {
    const note = prompt('Nota de resolución (opcional):') || '';
    try {
      await apiClient.updateReportStatus(id, status, note);
      await onRefreshData();
      flashMessage('Estado del reporte actualizado');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden bg-slate-100 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-none h-[100dvh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Panel Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xs">
              ADM
            </div>
            <div>
              <h2 className="font-black text-base text-white tracking-tight leading-tight">
                Centro de Administración Integral · Nelyess Capacita
              </h2>
              <p className="text-[11px] text-slate-300">
                Almacenamiento persistente en servidor · Usuario activo: <strong>{currentUser.displayName}</strong> ({currentUser.role})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenBackupModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs transition-colors border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Respaldos JSON</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Cerrar panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Message Bar */}
        {saveMessage && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              {saveMessage}
            </span>
            <button onClick={() => setSaveMessage(null)}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Panel Main Body: Sidebar Tabs + Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Navigation Sidebar */}
          <div className="w-full max-h-40 md:max-h-none md:w-60 bg-slate-50 border-r border-slate-200 p-2 overflow-y-auto space-y-1 shrink-0 text-xs font-medium">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all font-semibold ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-white space-y-6">
            {['learning','fixedPosts','historico'].includes(activeTab) && <EntryAdmin key={activeTab} collection={activeTab === 'historico' ? 'historicalArchive' : activeTab as 'learning'|'fixedPosts'} items={activeTab === 'historico' ? database.historicalArchive : database[activeTab as 'learning'|'fixedPosts'] || []} onRefresh={onRefreshData} />}
            {activeTab === 'usuarios' && <div className="nc-surface"><h3 className="font-bold">Acceso administrativo</h3><p className="mt-3">La cuenta administradora se configura en las variables ADMIN_USERNAME y ADMIN_PASSWORD del servidor. No hay contraseñas predeterminadas. Cambiar estas variables y reiniciar el servidor cierra las sesiones anteriores.</p><p className="mt-3 text-sm text-slate-500">Los perfiles heredados del respaldo no otorgan acceso por sí mismos. Esta versión utiliza una cuenta administradora configurada por el propietario.</p></div>}
            {activeTab === 'bloques' && <div className="space-y-4"><h3 className="font-bold text-xl">Bloques de consulta</h3><button className="nc-button" onClick={()=>setBlockForm([...blockForm,{id:crypto.randomUUID(),type:'title_text',title:'Nuevo bloque',content:'',data:{},order:blockForm.length+1,isVisible:true}])}>Agregar bloque</button>{blockForm.map((b,i)=><div key={b.id} className="nc-surface space-y-3"><label className="grid">Título<input className="nc-input" value={b.title} onChange={e=>setBlockForm(blockForm.map((x,j)=>j===i?{...x,title:e.target.value}:x))}/></label><label className="grid">Contenido<textarea className="nc-input" value={b.content || ''} onChange={e=>setBlockForm(blockForm.map((x,j)=>j===i?{...x,content:e.target.value}:x))}/></label><label>Orden <input type="number" className="nc-input" value={b.order} onChange={e=>setBlockForm(blockForm.map((x,j)=>j===i?{...x,order:Number(e.target.value)}:x))}/></label><label className="block"><input type="checkbox" checked={b.isVisible} onChange={e=>setBlockForm(blockForm.map((x,j)=>j===i?{...x,isVisible:e.target.checked}:x))}/> Visible</label><button className="nc-button" onClick={()=>{if(confirm('¿Quitar este bloque?'))setBlockForm(blockForm.filter((_,j)=>i!==j));}}>Quitar bloque</button></div>)}<button className="nc-button" disabled={saving} onClick={async()=>{setSaving(true);try{await apiClient.saveBlocks(blockForm);await onRefreshData();flashMessage('Bloques guardados');}catch(e:any){alert(e.message);}finally{setSaving(false);}}}>Guardar bloques</button></div>}
            {/* TAB: INICIO Y ENCABEZADO */}
            {activeTab === 'inicio' && (
              <div className="space-y-5 max-w-3xl">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Encabezado y Barra de Avisos</h3>
                  <p className="text-xs text-slate-500">Configura la identidad tipográfica y los anuncios de texto superiores.</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Iniciales de Marca:</label>
                      <input
                        type="text"
                        value={brandingForm.brandInitials}
                        onChange={(e) => setBrandingForm({ ...brandingForm, brandInitials: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded-lg font-mono font-bold"
                        maxLength={4}
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nombre del Portal:</label>
                      <input
                        type="text"
                        value={brandingForm.portalName}
                        onChange={(e) => setBrandingForm({ ...brandingForm, portalName: e.target.value })}
                        className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Subtítulo Institucional:</label>
                    <input
                      type="text"
                      value={brandingForm.subtitle}
                      onChange={(e) => setBrandingForm({ ...brandingForm, subtitle: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Título Principal (H1):</label>
                    <input
                      type="text"
                      value={brandingForm.mainTitle}
                      onChange={(e) => setBrandingForm({ ...brandingForm, mainTitle: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Descripción:</label>
                    <textarea
                      rows={2}
                      value={brandingForm.description}
                      onChange={(e) => setBrandingForm({ ...brandingForm, description: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Texto Orientativo del Buscador:</label>
                    <input
                      type="text"
                      value={brandingForm.searchPlaceholder}
                      onChange={(e) => setBrandingForm({ ...brandingForm, searchPlaceholder: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  {/* Announcement bars */}
                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-bold text-slate-900 text-sm">Barra Superior de Avisos:</label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={brandingForm.showAnnouncements}
                          onChange={(e) => setBrandingForm({ ...brandingForm, showAnnouncements: e.target.checked })}
                          className="rounded text-amber-600"
                        />
                        <span className="font-semibold text-slate-700">Mostrar barra de aviso</span>
                      </label>
                    </div>

                    <div className="space-y-3">
                      {brandingForm.announcements.map((ann, idx) => (
                        <div key={ann.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-700 text-[11px]">Aviso #{idx + 1}</span>
                            <label className="flex items-center gap-1.5">
                              <input
                                type="checkbox"
                                checked={ann.active}
                                onChange={(e) => {
                                  const updated = [...brandingForm.announcements];
                                  updated[idx].active = e.target.checked;
                                  setBrandingForm({ ...brandingForm, announcements: updated });
                                }}
                              />
                              <span className="text-[11px] font-bold text-slate-600">Activo</span>
                            </label>
                          </div>
                          <input
                            type="text"
                            value={ann.text}
                            onChange={(e) => {
                              const updated = [...brandingForm.announcements];
                              updated[idx].text = e.target.value;
                              setBrandingForm({ ...brandingForm, announcements: updated });
                            }}
                            className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleSaveBranding}
                    disabled={saving}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl flex items-center gap-2 shadow-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Guardando...' : 'Guardar Cambios de Encabezado'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB: MENU Y NAVEGACION */}
            {activeTab === 'menu' && (
              <div className="space-y-5 max-w-3xl">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Menús y Secciones</h3>
                  <p className="text-xs text-slate-500">Agrega, renombra, reordena u oculta opciones del menú principal superior.</p>
                </div>

                <div className="space-y-3">
                  {menuItems.map((item, idx) => (
                    <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="font-mono text-slate-400 font-bold">#{idx + 1}</span>
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => {
                            const updated = [...menuItems];
                            updated[idx].label = e.target.value;
                            setMenuItems(updated);
                          }}
                          className="p-1.5 bg-white border border-slate-300 rounded font-bold text-slate-900 flex-1 max-w-[200px]"
                        />
                        <span className="text-slate-500 text-[11px]">Ruta: <code>{item.targetPath}</code></span>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.isVisible}
                            onChange={(e) => {
                              const updated = [...menuItems];
                              updated[idx].isVisible = e.target.checked;
                              setMenuItems(updated);
                            }}
                          />
                          <span className="font-semibold text-slate-700 text-xs">Visible</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSaveMenu}
                  disabled={saving}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl flex items-center gap-2 text-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Opciones de Menú</span>
                </button>
              </div>
            )}

            {/* TAB: NOVEDADES Y PUBLICACIONES */}
            {activeTab === 'novedades' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Novedades y Publicaciones</h3>
                    <p className="text-xs text-slate-500">Publica avisos, gestiona borradores y actualiza circulares oficiales.</p>
                  </div>
                  <button
                    onClick={() => setEditingNews({
                      title: '',
                      summary: '',
                      categoryId: categories[0]?.id || 'cat_pospago',
                      urgency: 'novedad',
                      editorialStatus: 'publicado',
                      targetAudience: ['Tiendas Propias Bitel', 'Fuerza de Ventas'],
                      content: '',
                      whatChanges: [''],
                      whatStays: [''],
                      salesArguments: [''],
                      systemCodes: [],
                      relatedDocumentIds: [],
                      version: 1,
                    })}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Nueva Publicación</span>
                  </button>
                </div>

                {/* News Table List */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Título</th>
                        <th className="p-3">Categoría</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3">Vigencia</th>
                        <th className="p-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {database.news.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80">
                          <td className="p-3 font-bold text-slate-900">
                            {item.title}
                            {item.needsReview && (
                              <span className="ml-2 px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] rounded font-semibold">
                                Revisión Matemática
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-slate-600">
                            {categories.find(c => c.id === item.categoryId)?.name || item.categoryId}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.editorialStatus === 'publicado' ? 'bg-emerald-100 text-emerald-800' :
                              item.editorialStatus === 'borrador' ? 'bg-amber-100 text-amber-800' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {item.editorialStatus}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500">
                            {item.startDate ? `${item.startDate} a ${item.endDate}` : item.effectiveDate}
                          </td>
                          <td className="p-3 text-right space-x-2">
                            <button
                              onClick={() => setEditingNews(item)}
                              className="text-slate-600 hover:text-slate-900 font-bold"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteNewsItem(item.id, false)}
                              className="text-red-600 hover:text-red-800 font-bold"
                            >
                              Papelera
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Edit News Modal Drawer */}
                {editingNews && (
                  <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl p-6 overflow-hidden">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                        <h4 className="font-black text-slate-900 text-base">
                          {editingNews.id ? 'Editar Publicación' : 'Crear Nueva Publicación'}
                        </h4>
                        <button onClick={() => setEditingNews(null)}>
                          <X className="w-5 h-5 text-slate-400" />
                        </button>
                      </div>

                      <div className="py-4 overflow-y-auto space-y-4 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Título de la Novedad:</label>
                          <input
                            type="text"
                            value={editingNews.title || ''}
                            onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                            className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Categoría:</label>
                            <select
                              value={editingNews.categoryId}
                              onChange={(e) => setEditingNews({ ...editingNews, categoryId: e.target.value })}
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            >
                              {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Nivel de Urgencia:</label>
                            <select
                              value={editingNews.urgency}
                              onChange={(e) => setEditingNews({ ...editingNews, urgency: e.target.value as any })}
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            >
                              <option value="novedad">Novedad Regular</option>
                              <option value="urgente">Urgente (Destacado)</option>
                              <option value="vigente">Vigente</option>
                              <option value="actualizado">Actualizado</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Fecha de Inicio (Perú):</label>
                            <input
                              type="date"
                              value={editingNews.startDate || ''}
                              onChange={(e) => setEditingNews({ ...editingNews, startDate: e.target.value })}
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Fecha de Fin (Perú):</label>
                            <input
                              type="date"
                              value={editingNews.endDate || ''}
                              onChange={(e) => setEditingNews({ ...editingNews, endDate: e.target.value })}
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Resumen Ejecutivo:</label>
                          <textarea
                            rows={2}
                            value={editingNews.summary || ''}
                            onChange={(e) => setEditingNews({ ...editingNews, summary: e.target.value })}
                            className="w-full p-2 border border-slate-300 rounded-lg"
                          />
                        </div>

                        {/* Antes / Ahora */}
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <label className="font-bold text-slate-900 text-xs">Comparativa Antes / Ahora (Opcional):</label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[10px] text-red-700 font-bold block">Antes:</span>
                              <input
                                type="text"
                                value={editingNews.beforeAfter?.before || ''}
                                onChange={(e) => setEditingNews({
                                  ...editingNews,
                                  beforeAfter: { before: e.target.value, after: editingNews.beforeAfter?.after || '' }
                                })}
                                className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-emerald-700 font-bold block">Ahora:</span>
                              <input
                                type="text"
                                value={editingNews.beforeAfter?.after || ''}
                                onChange={(e) => setEditingNews({
                                  ...editingNews,
                                  beforeAfter: { before: editingNews.beforeAfter?.before || '', after: e.target.value }
                                })}
                                className="w-full p-1.5 border border-slate-300 rounded bg-white text-xs"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Detalle del Comunicado:</label>
                          <textarea
                            rows={4}
                            value={editingNews.content || ''}
                            onChange={(e) => setEditingNews({ ...editingNews, content: e.target.value })}
                            className="w-full p-2 border border-slate-300 rounded-lg"
                          />
                        </div>

                        <label className="block text-xs font-bold">Enlace de Drive para previsualizar en este comunicado
<input type="url" placeholder="https://drive.google.com/file/d/…/view" className="w-full p-2 border rounded-lg mt-1" value={editingNews.driveUrl || ''} onChange={e=>setEditingNews({...editingNews,driveUrl:e.target.value})}/></label>
<div>
                          <label className="block font-bold text-slate-700 mb-1">Estado Editorial:</label>
                          <select
                            value={editingNews.editorialStatus}
                            onChange={(e) => setEditingNews({ ...editingNews, editorialStatus: e.target.value as any })}
                            className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                          >
                            <option value="publicado">Publicado (Visible a todos)</option>
                            <option value="borrador">Borrador (Solo visible en admin)</option>
                            <option value="archivado">Archivado</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200 flex justify-end gap-2 text-xs">
                        <button
                          onClick={() => setEditingNews(null)}
                          className="px-4 py-2 border border-slate-300 rounded-xl font-bold"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSaveNewsItem}
                          disabled={saving}
                          className="px-5 py-2 bg-slate-900 text-amber-400 rounded-xl font-bold"
                        >
                          {saving ? 'Guardando...' : 'Guardar Publicación'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: CATEGORIAS */}
            {activeTab === 'categorias' && (
              <div className="space-y-5 max-w-3xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Categorías Administrables</h3>
                    <p className="text-xs text-slate-500">Crea o edita categorías sin perder publicaciones asociadas.</p>
                  </div>
                  <button
                    onClick={() => setEditingCategory({
                      name: '',
                      description: '',
                      iconName: 'Tag',
                      color: '#0284c7',
                      isPublic: true,
                      isArchived: false,
                      subcategories: [],
                      order: categories.length + 1,
                    })}
                    className="px-3.5 py-2 bg-slate-900 text-amber-400 font-bold text-xs rounded-xl flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Nueva Categoría</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div key={cat.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        <div>
                          <strong className="text-slate-900">{cat.name}</strong>
                          <p className="text-[11px] text-slate-500">{cat.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingCategory(cat)}
                          className="px-2.5 py-1 text-slate-700 hover:text-slate-900 font-bold bg-white border border-slate-200 rounded"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleInitiateDeleteCat(cat)}
                          className="px-2.5 py-1 text-red-700 hover:text-red-900 font-bold bg-red-50 border border-red-200 rounded"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Edit Category Modal */}
                {editingCategory && (
                  <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-5 space-y-4 text-xs">
                      <h4 className="font-black text-slate-900 text-base">Editar Categoría</h4>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Nombre:</label>
                        <input
                          type="text"
                          value={editingCategory.name || ''}
                          onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                          className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Descripción:</label>
                        <input
                          type="text"
                          value={editingCategory.description || ''}
                          onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                          className="w-full p-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Color Identificador:</label>
                        <input
                          type="color"
                          value={editingCategory.color || '#0284c7'}
                          onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                          className="w-full h-9 p-1 border border-slate-300 rounded-lg cursor-pointer"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => setEditingCategory(null)}
                          className="px-4 py-2 border border-slate-300 rounded-lg font-bold"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSaveCategoryItem}
                          className="px-4 py-2 bg-slate-900 text-amber-400 rounded-lg font-bold"
                        >
                          Guardar Categoría
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Safe Delete Category Reassignment Modal */}
                {deleteCatModal && (
                  <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-5 space-y-4 text-xs">
                      <div className="flex items-center gap-2 text-red-600 font-bold">
                        <AlertTriangle className="w-5 h-5" />
                        <h4 className="text-base text-slate-900 font-black">Eliminar Categoría con Seguridad</h4>
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        La categoría <strong>{deleteCatModal.cat.name}</strong> tiene actualmente <strong>{deleteCatModal.affectedNews} noticias</strong> y <strong>{deleteCatModal.affectedDocs} documentos</strong> asignados.
                      </p>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          Reasignar todos los registros afectados a:
                        </label>
                        <select
                          value={reassignTargetCatId}
                          onChange={(e) => setReassignTargetCatId(e.target.value)}
                          className="w-full p-2 border border-slate-300 rounded-lg font-bold text-slate-900"
                        >
                          {categories
                            .filter((c) => c.id !== deleteCatModal.cat.id)
                            .map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                        <button
                          onClick={() => setDeleteCatModal(null)}
                          className="px-4 py-2 border border-slate-300 rounded-lg font-bold"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleConfirmDeleteCat}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold"
                        >
                          Reasignar y Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: DOCUMENTOS Y ENLACES DRIVE */}
            {activeTab === 'documentos' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Documentos y Enlaces de Google Drive</h3>
                    <p className="text-xs text-slate-500">Registra y administra enlaces directos de Drive con metadatos y control de versiones.</p>
                  </div>
                  <button
                    onClick={() => setEditingDoc({
                      title: '',
                      description: '',
                      url: '',
                      provider: 'google_drive',
                      fileType: 'pdf',
                      categoryId: categories[0]?.id || 'cat_pospago',
                      tags: [],
                      documentDate: new Date().toISOString().split('T')[0],
                      versionNumber: 'v1.0',
                      authorOrSource: 'Dirección Comercial Bitel',
                      visibility: 'publico',
                      status: 'vigente',
                      accessCheckStatus: 'no_verificado',
                      isEvidence: false,
                    })}
                    className="px-3.5 py-2 bg-slate-900 text-amber-400 font-bold text-xs rounded-xl flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Registrar Enlace Drive</span>
                  </button>
                </div>

                {/* Documents Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Título / Versión</th>
                        <th className="p-3">Formato</th>
                        <th className="p-3">Enlace Directo</th>
                        <th className="p-3">Fecha</th>
                        <th className="p-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {database.documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-50/80">
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{doc.title}</span>
                            <span className="text-[10px] text-amber-700 font-semibold">{doc.versionNumber}</span>
                          </td>
                          <td className="p-3 font-semibold text-slate-600 uppercase text-[10px]">
                            {doc.fileType}
                          </td>
                          <td className="p-3 max-w-[200px] truncate text-slate-500">
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline flex items-center gap-1">
                              <span className="truncate">{doc.url}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          </td>
                          <td className="p-3 text-slate-500">
                            {doc.documentDate}
                          </td>
                          <td className="p-3 text-right space-x-2">
                            <button
                              onClick={() => setEditingDoc(doc)}
                              className="text-slate-600 hover:text-slate-900 font-bold"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('¿Pasar documento a histórico?')) {
                                  apiClient.deleteDocument(doc.id, false).then(() => onRefreshData());
                                }
                              }}
                              className="text-red-600 hover:text-red-800 font-bold"
                            >
                              Archivar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Edit Document Modal */}
                {editingDoc && (
                  <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl p-6 overflow-hidden space-y-4 text-xs">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                        <h4 className="font-black text-slate-900 text-base">Registrar / Editar Documento</h4>
                        <button onClick={() => setEditingDoc(null)}><X className="w-5 h-5" /></button>
                      </div>

                      <div className="overflow-y-auto space-y-3 flex-1">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Título del Documento:</label>
                          <input
                            type="text"
                            value={editingDoc.title || ''}
                            onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
                            className="w-full p-2 border border-slate-300 rounded-lg font-bold"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Descripción Breve:</label>
                          <textarea
                            rows={2}
                            value={editingDoc.description || ''}
                            onChange={(e) => setEditingDoc({ ...editingDoc, description: e.target.value })}
                            className="w-full p-2 border border-slate-300 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Enlace Completo de Google Drive / HTTPS:</label>
                          <input
                            type="url"
                            value={editingDoc.url || ''}
                            onChange={(e) => setEditingDoc({ ...editingDoc, url: e.target.value })}
                            placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                            className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs"
                          />
                          <div className="mt-1.5 p-2 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-950">
                            <strong>Ayuda de Permisos Drive:</strong> Agregar un enlace al portal no cambia los permisos de Google Drive. Configura en Drive: Compartir → Acceso general → Cualquier persona con el enlace → Lector.
                          </div>
                          {editingDoc.url && (
                            <div className="mt-1 flex items-center gap-2">
                              <a
                                href={editingDoc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-bold text-slate-800 underline text-[11px]"
                              >
                                <span>Abrir enlace para comprobar</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Tipo de Archivo:</label>
                            <select
                              value={editingDoc.fileType}
                              onChange={(e) => setEditingDoc({ ...editingDoc, fileType: e.target.value as any })}
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            >
                              <option value="pdf">PDF</option>
                              <option value="sheet">Hoja de Cálculo</option>
                              <option value="document">Documento</option>
                              <option value="presentation">Presentación</option>
                              <option value="drive_folder">Carpeta Drive</option>
                              <option value="other">Otro</option>
                            </select>
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Versión:</label>
                            <input
                              type="text"
                              value={editingDoc.versionNumber || ''}
                              onChange={(e) => setEditingDoc({ ...editingDoc, versionNumber: e.target.value })}
                              placeholder="v1.0"
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Fecha Documento:</label>
                            <input
                              type="date"
                              value={editingDoc.documentDate || ''}
                              onChange={(e) => setEditingDoc({ ...editingDoc, documentDate: e.target.value })}
                              className="w-full p-2 border border-slate-300 rounded-lg"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                        <button onClick={() => setEditingDoc(null)} className="px-4 py-2 border border-slate-300 rounded-xl font-bold">
                          Cancelar
                        </button>
                        <button onClick={handleSaveDocItem} className="px-5 py-2 bg-slate-900 text-amber-400 rounded-xl font-bold">
                          Guardar Documento
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: REPORTES DE ASESORES */}
            {activeTab === 'reportes' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Reportes de Datos Incorrectos</h3>
                  <p className="text-xs text-slate-500">Observaciones y alertas enviadas por los asesores sobre precios, planes o vigencias.</p>
                </div>

                <div className="space-y-3 text-xs">
                  {database.dataReports.map((rep) => (
                    <div key={rep.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rep.status === 'pendiente' ? 'bg-amber-100 text-amber-800' :
                            rep.status === 'revisado' ? 'bg-blue-100 text-blue-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {rep.status.toUpperCase()}
                          </span>
                          <strong className="text-slate-900">{rep.itemTitle}</strong> ({rep.itemType})
                        </div>
                        <span className="text-slate-400 text-[11px]">{new Date(rep.submittedAt).toLocaleDateString()}</span>
                      </div>

                      <p className="text-slate-700 font-medium italic bg-white p-2.5 rounded border border-slate-200">
                        "{rep.description}"
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span>Reportado por: <strong>{rep.reportedBy}</strong> {rep.advisorContact ? `(${rep.advisorContact})` : ''}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateReportStatus(rep.id, 'revisado')}
                            className="text-blue-600 font-bold hover:underline"
                          >
                            Marcar Revisado
                          </button>
                          <button
                            onClick={() => handleUpdateReportStatus(rep.id, 'corregido')}
                            className="text-emerald-700 font-bold hover:underline"
                          >
                            Marcar Corregido
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {database.dataReports.length === 0 && (
                    <div className="text-slate-500 text-center py-8">No hay reportes de asesores pendientes.</div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: PAPELERA E HISTORIAL */}
            {activeTab === 'papelera' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Papelera de Reciclaje e Historial de Auditoría</h3>
                    <p className="text-xs text-slate-500">Recupera elementos eliminados y consulta versiones anteriores con fecha y responsable.</p>
                  </div>
                  {currentUser.role === 'administrador' && (
                    <button
                      onClick={handleEmptyTrash}
                      className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl"
                    >
                      Vaciar Papelera Definitivamente
                    </button>
                  )}
                </div>

                {/* Trash Section */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Elementos en Papelera:</h4>
                  {database.news.filter(n => n.editorialStatus === 'papelera').map((n) => (
                    <div key={n.id} className="p-3 bg-red-50/50 border border-red-200 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-slate-900">{n.title}</strong>
                        <span className="text-[10px] text-slate-500 block">Noticia · v{n.version}</span>
                      </div>
                      <button
                        onClick={() => handleRestoreFromTrash('noticia', n.id)}
                        className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded border border-slate-300"
                      >
                        Restaurar
                      </button>
                    </div>
                  ))}
                </div>

                {/* Audit Logs */}
                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Registro de Cambios y Versiones:</h4>
                  <input className="nc-input" placeholder="Buscar cambios por título o responsable…" aria-label="Buscar historial" value={auditQuery} onChange={e=>setAuditQuery(e.target.value)}/><div className="space-y-2 max-h-96 overflow-y-auto text-xs">
                    {[...database.auditLogs].filter(log=>`${log.entityTitle} ${log.summary} ${log.performedBy}`.toLowerCase().includes(auditQuery.toLowerCase())).sort((a,b)=>b.timestamp.localeCompare(a.timestamp)).map((log) => (
                      <div key={log.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800">{log.entityTitle}</span>
                          <span className="text-slate-500 text-[11px] block">{log.summary} · {log.performedBy} ({new Date(log.timestamp).toLocaleString()})</span>
                        </div>
                        {currentUser.role === 'administrador' && log.snapshot && (['noticia','documento','equipo','plan'].includes(log.entityType) || log.snapshot.collection) && log.action === 'editar' && (
                          <button
                            onClick={() => handleRestoreSnapshot(log.id)}
                            className="text-amber-700 font-bold hover:underline text-[11px]"
                          >
                            Restaurar versión
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: APARIENCIA */}
            {activeTab === 'apariencia' && (
              <div className="space-y-5 max-w-xl text-xs">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Apariencia y Estilos</h3>
                  <p className="text-xs text-slate-500">Diseño limpio y profesional 100% libre de fotografías y fondos pesados.</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Color Principal:</label>
                    <input
                      type="color"
                      value={themeForm.primaryColor}
                      onChange={(e) => setThemeForm({ ...themeForm, primaryColor: e.target.value })}
                      className="w-full h-9 p-1 border border-slate-300 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Color de Énfasis:</label>
                    <input
                      type="color"
                      value={themeForm.accentColor}
                      onChange={(e) => setThemeForm({ ...themeForm, accentColor: e.target.value })}
                      className="w-full h-9 p-1 border border-slate-300 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tipografía:</label>
                    <select
                      value={themeForm.fontFamily}
                      onChange={(e) => setThemeForm({ ...themeForm, fontFamily: e.target.value as any })}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    >
                      <option value="Inter">Inter (Estándar Profesional)</option>
                      <option value="System">Sistema Operativo Nativo</option>
                      <option value="Roboto">Roboto</option>
                      <option value="JetBrains">JetBrains Monospace</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Densidad de Tarjetas:</label>
                    <select
                      value={themeForm.cardDensity}
                      onChange={(e) => setThemeForm({ ...themeForm, cardDensity: e.target.value as any })}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    >
                      <option value="compact">Compacto (Mayor información visible)</option>
                      <option value="standard">Estándar</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Texto del Pie de Página:</label>
                    <input
                      type="text"
                      value={themeForm.footerNotice}
                      onChange={(e) => setThemeForm({ ...themeForm, footerNotice: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <button
                    onClick={handleSaveTheme}
                    disabled={saving}
                    className="px-5 py-2.5 bg-slate-900 text-amber-400 font-bold rounded-xl flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar Apariencia</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
