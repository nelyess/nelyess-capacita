import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { EntriesView } from './components/EntriesView';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { NewsCard } from './components/NewsCard';
import { NewsDetailModal } from './components/NewsDetailModal';
import { DeviceCatalogView } from './components/DeviceCatalogView';
import { PlanesView } from './components/PlanesView';
import { DocumentosView } from './components/DocumentosView';
import { HistoricoView } from './components/HistoricoView';
import { BlocksSectionView } from './components/BlocksSectionView';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';
import { BackupModal } from './components/BackupModal';
import { ReportModal } from './components/ReportModal';
import { BookmarksDrawer } from './components/BookmarksDrawer';
import { 
  NewsItem, 
  DocumentItem, 
  DeviceProduct, 
  BitelPlan, 
  HistoricalArchiveItem, 
  CategoryItem, 
  MenuItem, 
  HeaderBranding, 
  BlockItem, 
  ThemeSettings, 
  UserAccount, 
  CompleteDatabaseSchema, 
  FilterState,
  PublicContentResponse 
} from './types';
import { apiClient } from './utils/apiClient';
import { calculateValidityStatus } from './utils/validityCalculator';
import { 
  Newspaper, 
  Smartphone, 
  Wifi, 
  FileText, 
  Archive, 
  Layers, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  Bookmark, 
  ShieldCheck, 
  Lock, 
  ExternalLink,
  ChevronRight,
  Info,
  Flag
} from 'lucide-react';

const BOOKMARKS_NEWS_KEY = 'nc_bitel_bookmarked_news';
const BOOKMARKS_PLANS_KEY = 'nc_bitel_bookmarked_plans';

export default function App() {
  // Public data from shared server backend
  const [publicData, setPublicData] = useState<PublicContentResponse | null>(null);
  const [fullDatabase, setFullDatabase] = useState<CompleteDatabaseSchema | null>(null);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Active navigation tab ('novedades', 'equipos', 'planes', 'documentos', 'historico', 'bloques', 'guardados')
  const [activeTab, setActiveTab] = useState<string>('novedades');

  // Quick edit mode (only active if currentUser is editor or admin)
  const [quickEditMode, setQuickEditMode] = useState<boolean>(false);

  // Bookmarks stored locally in browser per advisor
  const [bookmarkedNewsIds, setBookmarkedNewsIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKMARKS_NEWS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [bookmarkedPlanIds, setBookmarkedPlanIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKMARKS_PLANS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Filters for Novedades
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    categoryId: 'all',
    urgency: 'all',
    validity: 'vigente',
  });

  // Modals state
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  useEffect(() => { const sync=()=>{if(location.hash==='#admin'){setIsAdminLoginOpen(true);}}; sync(); window.addEventListener('hashchange',sync);return()=>window.removeEventListener('hashchange',sync);},[]);
  useEffect(()=>{if(currentUser && location.hash==='#admin'){setIsAdminLoginOpen(false);setIsAdminPanelOpen(true);}},[currentUser]);
  const [adminPanelTab, setAdminPanelTab] = useState<string>('inicio');
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);

  // Report Modal state
  const [reportModal, setReportModal] = useState<{
    isOpen: boolean;
    itemType: 'noticia' | 'equipo' | 'plan' | 'documento' | 'historico';
    itemId: string;
    itemTitle: string;
  }>({
    isOpen: false,
    itemType: 'noticia',
    itemId: '',
    itemTitle: '',
  });

  // Save bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BOOKMARKS_NEWS_KEY, JSON.stringify(bookmarkedNewsIds));
    } catch (e) {
      console.warn('Could not save news bookmarks', e);
    }
  }, [bookmarkedNewsIds]);

  useEffect(() => {
    try {
      localStorage.setItem(BOOKMARKS_PLANS_KEY, JSON.stringify(bookmarkedPlanIds));
    } catch (e) {
      console.warn('Could not save plan bookmarks', e);
    }
  }, [bookmarkedPlanIds]);

  // Load public data from server
  const loadPublicData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await apiClient.getPublicContent();
      setPublicData(data);
    } catch (err: any) {
      console.error('Error cargando contenido público:', err);
      setLoadError(err.message || 'No se pudo conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check user session
  const checkSession = useCallback(async () => {
    try {
      const user = await apiClient.checkSession();
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setQuickEditMode(false);
      }
    } catch {
      setCurrentUser(null);
    }
  }, []);

  // Fetch full database when user is authenticated
  const loadFullDatabase = useCallback(async () => {
    if (!currentUser) return;
    try {
      const db = await apiClient.getFullDatabase();
      setFullDatabase(db);
    } catch (err) {
      console.error('Error fetching full database:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    loadPublicData();
    checkSession();
  }, [loadPublicData, checkSession]);

  useEffect(() => {
    if (currentUser) {
      loadFullDatabase();
    }
  }, [currentUser, loadFullDatabase]);

  // Refresh everything after edit in admin panel
  const handleRefreshAll = async () => {
    await loadPublicData();
    if (currentUser) {
      await loadFullDatabase();
    }
  };

  // Auth Handlers
  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    loadFullDatabase();
  };

  const handleLogout = async () => {
    await apiClient.logout();
    setCurrentUser(null);
    setQuickEditMode(false);
    setIsAdminPanelOpen(false);
    setFullDatabase(null);
  };

  // Toggle bookmark helpers
  const handleToggleNewsBookmark = (newsId: string) => {
    setBookmarkedNewsIds((prev) => 
      prev.includes(newsId) ? prev.filter((id) => id !== newsId) : [...prev, newsId]
    );
  };

  const handleTogglePlanBookmark = (planId: string) => {
    setBookmarkedPlanIds((prev) => 
      prev.includes(planId) ? prev.filter((id) => id !== planId) : [...prev, planId]
    );
  };

  // Open Report Modal
  const handleOpenReportModal = (item: {
    id: string;
    title: string;
    type: 'noticia' | 'equipo' | 'plan' | 'documento' | 'historico';
  }) => {
    setReportModal({
      isOpen: true,
      itemType: item.type,
      itemId: item.id,
      itemTitle: item.title,
    });
  };

  // Quick Edit Shortcuts
  const handleOpenAdminPanel = (tab: string = 'inicio') => {
    setAdminPanelTab(tab);
    setIsAdminPanelOpen(true);
    history.replaceState(null,'','#admin');
  };

  // Live news stats
  const newsList: NewsItem[] = publicData?.news || [];
  const categoriesList: CategoryItem[] = publicData?.categories || [];
  const documentsList: DocumentItem[] = publicData?.documents || [];
  const devicesList: DeviceProduct[] = publicData?.devices || [];
  const plansList: BitelPlan[] = publicData?.plans || [];
  const archiveList: HistoricalArchiveItem[] = publicData?.historicalArchive || [];
  const blocksList: BlockItem[] = publicData?.blocks || [];
  const menuItems: MenuItem[] = publicData?.menuItems || [];
  const defaultHeaderBranding: HeaderBranding = {
    brandInitials: 'NC',
    portalName: 'Nelyess Capacita',
    subtitle: 'Portal de capacitación y novedades comerciales de Bitel',
    mainTitle: 'Portal de Capacitación y Novedades Comerciales Bitel',
    description: 'Actualizaciones de productos, cartillas operativas y guías de venta para la fuerza comercial Bitel.',
    searchPlaceholder: 'Buscar novedades, planes, equipos, cartillas...',
    headerTheme: 'default',
    showAnnouncements: true,
    announcements: [
      {
        id: 'ann-1',
        text: '¡Bienvenido! Consulta aquí todas las novedades comerciales, precios de equipos y planes Bitel.',
        type: 'informativo',
        active: true,
        order: 1,
      },
    ],
  };

  const headerBranding: HeaderBranding = publicData?.headerBranding || defaultHeaderBranding;

  const stats = useMemo(() => {
    let urgent = 0;
    let valid = 0;
    let upcoming = 0;
    let expired = 0;
    let urgentValid = 0;
    let withDocs = 0;

    newsList.forEach((n) => {
      const status = calculateValidityStatus(n.startDate, n.endDate, n.validityStatus);
      if (status === 'vigente') valid++;
      if (status === 'proximo') upcoming++;
      if (status === 'vencido') expired++;

      if (n.urgency === 'urgente') {
        urgent++;
        if (status === 'vigente') urgentValid++;
      }

      if (n.relatedDocumentIds && n.relatedDocumentIds.length > 0) {
        withDocs++;
      }
    });

    return {
      totalNews: newsList.length,
      urgentCount: urgent,
      validCount: valid,
      upcomingCount: upcoming,
      expiredCount: expired,
      urgentValidCount: urgentValid,
      withDocsCount: withDocs,
    };
  }, [newsList]);

  // Urgent valid news highlight
  const urgentValidNews = useMemo(() => {
    return newsList.find((n) => {
      const status = calculateValidityStatus(n.startDate, n.endDate, n.validityStatus);
      return n.urgency === 'urgente' && status === 'vigente';
    });
  }, [newsList]);

  // Filtered news
  const filteredNews = useMemo(() => {
    return newsList.filter((item) => {
      // Category filter
      if (filters.categoryId !== 'all' && item.categoryId !== filters.categoryId) {
        return false;
      }

      // Urgency filter
      if (filters.urgency !== 'all' && item.urgency !== filters.urgency) {
        return false;
      }

      // Validity filter
      if (filters.validity !== 'all') {
        const status = calculateValidityStatus(item.startDate, item.endDate, item.validityStatus);
        if (status !== filters.validity) {
          return false;
        }
      }

      // Search query filter
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSummary = item.summary.toLowerCase().includes(q);
        const matchChanges = item.whatChanges?.some((c) => c.toLowerCase().includes(q));
        const matchAudience = item.targetAudience?.some((a) => a.toLowerCase().includes(q));
        const matchCodes = item.systemCodes?.some(
          (c) => c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
        );

        if (!matchTitle && !matchSummary && !matchChanges && !matchAudience && !matchCodes) {
          return false;
        }
      }

      return true;
    });
  }, [newsList, filters]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchQuery.trim().length > 0 ||
      filters.categoryId !== 'all' ||
      filters.urgency !== 'all' ||
      filters.validity !== 'vigente'
    );
  }, [filters]);

  const handleClearFilters = () => {
    setFilters({
      searchQuery: '',
      categoryId: 'all',
      urgency: 'all',
      validity: 'all',
    });
  };

  // Bookmarked items resolution
  const bookmarkedNewsItems = useMemo(() => {
    return newsList.filter((n) => bookmarkedNewsIds.includes(n.id));
  }, [newsList, bookmarkedNewsIds]);

  const bookmarkedPlanItems = useMemo(() => {
    return plansList.filter((p) => bookmarkedPlanIds.includes(p.id));
  }, [plansList, bookmarkedPlanIds]);

  const totalBookmarks = bookmarkedNewsIds.length + bookmarkedPlanIds.length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden font-sans">
      {/* Dynamic Header */}
      <div hidden={isAdminPanelOpen}><Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        menuItems={menuItems}
        headerBranding={headerBranding}
        bookmarkedCount={totalBookmarks}
        currentUser={currentUser}
        quickEditMode={quickEditMode}
        onToggleQuickEdit={() => setQuickEditMode((prev) => !prev)}
        onOpenAdminLogin={() => {location.hash='admin';setIsAdminLoginOpen(true);}}
        onLogoutAdmin={handleLogout}
        onOpenAdminPanel={handleOpenAdminPanel}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading && !publicData ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-4" />
            <h3 className="text-base font-bold text-slate-800">Cargando base comercial Bitel...</h3>
            <p className="text-xs text-slate-500 mt-1">Sincronizando novedades, planes y documentos compartidos</p>
          </div>
        ) : loadError && !publicData ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-xl mx-auto text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
            <h3 className="text-base font-bold text-red-900">Error conectando con la base comercial</h3>
            <p className="text-xs text-red-700">{loadError}</p>
            <button
              onClick={loadPublicData}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Reintentar conexión
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'capacitaciones' && <EntriesView items={publicData?.learning || []} training />}
            {/* VIEW 1: NOVEDADES & PUBLICACIONES */}
            {activeTab === 'novedades' && (
              <div className="space-y-6">
                {/* Hero Banner with Filters */}
                <HeroBanner
                  filters={filters}
                  setFilters={setFilters}
                  categories={categoriesList}
                  headerBranding={headerBranding}
                  stats={stats}
                  hasActiveFilters={hasActiveFilters}
                  onClearFilters={handleClearFilters}
                  urgentNewsTitle={urgentValidNews?.title}
                  onOpenUrgentNews={() => urgentValidNews && setSelectedNews(urgentValidNews)}
                />

                <EntriesView items={publicData?.fixedPosts || []} />
                {/* Subheader and Results Counter */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Newspaper className="w-5 h-5 text-amber-600" />
                      <span>
                        {filters.categoryId !== 'all'
                          ? categoriesList.find((c) => c.id === filters.categoryId)?.name || 'Novedades'
                          : filters.validity === 'vigente'
                          ? 'Novedades y Comunicados Comerciales Vigentes'
                          : filters.validity === 'proximo'
                          ? 'Próximas Novedades y Campañas'
                          : filters.validity === 'vencido'
                          ? 'Histórico de Novedades Vencidas'
                          : 'Todas las Novedades y Publicaciones'}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      Mostrando {filteredNews.length} de {newsList.length} publicaciones registradas
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {quickEditMode && currentUser && (
                      <button
                        onClick={() => handleOpenAdminPanel('novedades')}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        + Nueva Publicación
                      </button>
                    )}
                  </div>
                </div>

                {/* Grid of News Cards */}
                {filteredNews.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-xl mx-auto shadow-xs space-y-3">
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                      <Search className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      No se encontraron novedades con los filtros aplicados
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Intenta buscar con otros términos o cambiar el estado de vigencia seleccionado en el banner superior.
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={handleClearFilters}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
                      >
                        Restablecer filtros
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredNews.map((news) => {
                      const category = categoriesList.find((c) => c.id === news.categoryId);
                      const relatedDocs = documentsList.filter((d) => 
                        news.relatedDocumentIds?.includes(d.id)
                      );
                      const isBookmarked = bookmarkedNewsIds.includes(news.id);

                      return (
                        <NewsCard
                          key={news.id}
                          news={news}
                          category={category}
                          relatedDocuments={relatedDocs}
                          isBookmarked={isBookmarked}
                          onToggleBookmark={() => handleToggleNewsBookmark(news.id)}
                          onOpenDetail={() => setSelectedNews(news)}
                          onOpenReport={() => handleOpenReportModal({
                            id: news.id,
                            title: news.title,
                            type: 'noticia',
                          })}
                          quickEditMode={quickEditMode}
                          onQuickEdit={() => handleOpenAdminPanel('novedades')}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* VIEW 2: EQUIPOS Y PRECIOS */}
            {activeTab === 'equipos' && (
              <DeviceCatalogView
                devices={devicesList}
                documents={documentsList}
                onOpenReport={handleOpenReportModal}
                quickEditMode={quickEditMode}
                onQuickEditDevice={() => handleOpenAdminPanel('equipos')}
                onOpenCreateDevice={() => handleOpenAdminPanel('equipos')}
              />
            )}

            {/* VIEW 3: PLANES COMERCIALES BITEL */}
            {activeTab === 'planes' && (
              <PlanesView
                plans={plansList}
                documents={documentsList}
                onOpenReport={handleOpenReportModal}
                quickEditMode={quickEditMode}
                onQuickEditPlan={() => handleOpenAdminPanel('planes')}
                onOpenCreatePlan={() => handleOpenAdminPanel('planes')}
              />
            )}

            {/* VIEW 4: DOCUMENTOS, CARTILLAS Y DRIVE */}
            {activeTab === 'documentos' && (
              <DocumentosView
                documents={documentsList}
                categories={categoriesList}
                onOpenReport={handleOpenReportModal}
                quickEditMode={quickEditMode}
                onQuickEditDocument={() => handleOpenAdminPanel('documentos')}
                onOpenCreateDocument={() => handleOpenAdminPanel('documentos')}
              />
            )}

            {/* VIEW 5: ARCHIVO HISTÓRICO Y EVIDENCIAS */}
            {activeTab === 'historico' && (
              <HistoricoView
                items={archiveList}
                onOpenReport={handleOpenReportModal}
              />
            )}

            {/* VIEW 6: SECCIONES Y BLOQUES COMERCIALES */}
            {activeTab === 'bloques' && (
              <div className="space-y-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-amber-500" />
                      <span>Guías Rápidas y Bloques de Consulta</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Módulos informativos configurables: guías antes vs ahora, avisos y enlaces de formación
                    </p>
                  </div>
                  {quickEditMode && (
                    <button
                      onClick={() => handleOpenAdminPanel('inicio')}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-colors"
                    >
                      Editar Bloques
                    </button>
                  )}
                </div>

                <BlocksSectionView
                  blocks={blocksList}
                  news={newsList}
                  documents={documentsList}
                  onOpenNewsDetail={(item) => setSelectedNews(item)}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Clean, Professional Footer (Strictly image-free, no IndexedDB jargon) */}
      <footer className="mt-16 bg-white border-t border-slate-200 text-slate-500 text-xs py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-xs">
                {headerBranding.brandInitials || 'NC'}
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm">{headerBranding.portalName || 'Nelyess Capacita'}</span>
                <span className="text-slate-400 mx-2">·</span>
                <span className="text-slate-600 font-medium">Portal de capacitación y novedades comerciales de Bitel</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              {currentUser ? (
                <button
                  onClick={() => handleOpenAdminPanel('inicio')}
                  className="inline-flex items-center gap-1.5 text-amber-700 hover:text-amber-800 font-bold"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Panel de Control ({currentUser.role})</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsAdminLoginOpen(true)}
                  className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Acceso Capacitador</span>
                </button>
              )}

              <button
                onClick={() => handleOpenReportModal({
                  id: 'portal-general',
                  title: 'Observación General del Portal Bitel',
                  type: 'noticia',
                })}
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-amber-700 transition-colors"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Reportar inconsistencia</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
            <p>
              Información de uso exclusivo para capacitación y venta asistida de la red comercial Bitel Perú.
            </p>
            <p className="flex items-center gap-1.5">
              <span>Almacenamiento compartido en servidor</span>
              <span>·</span>
              <span>Nelyess Capacita 2026</span>
            </p>
          </div>
        </div>
      </footer>

      </div>
      {/* MODALS */}
      {/* 1. News Detail Modal */}
      <NewsDetailModal
        news={selectedNews}
        category={categoriesList.find((c) => c.id === selectedNews?.categoryId)}
        relatedDocuments={documentsList.filter((d) => selectedNews?.relatedDocumentIds?.includes(d.id))}
        isBookmarked={selectedNews ? bookmarkedNewsIds.includes(selectedNews.id) : false}
        onToggleBookmark={() => selectedNews && handleToggleNewsBookmark(selectedNews.id)}
        onClose={() => setSelectedNews(null)}
        onOpenReport={() => selectedNews && handleOpenReportModal({
          id: selectedNews.id,
          title: selectedNews.title,
          type: 'noticia',
        })}
      />

      {/* 2. Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* 3. Comprehensive 12-Module Admin Panel */}
      {isAdminPanelOpen && currentUser && fullDatabase && (
        <AdminPanel
          initialTab={adminPanelTab}
          database={fullDatabase}
          currentUser={currentUser}
          onRefreshData={handleRefreshAll}
          onClose={() => {setIsAdminPanelOpen(false);history.replaceState(null,'',location.pathname);}}
          onOpenBackupModal={() => setIsBackupModalOpen(true)}
        />
      )}

      {/* 4. Backup & Restore Modal */}
      {isBackupModalOpen && (
        <BackupModal
          onClose={() => setIsBackupModalOpen(false)}
          onRefreshData={handleRefreshAll}
        />
      )}

      {/* 5. Advisor Report Submission Modal */}
      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={() => setReportModal((prev) => ({ ...prev, isOpen: false }))}
        itemType={reportModal.itemType}
        itemId={reportModal.itemId}
        itemTitle={reportModal.itemTitle}
      />

      {/* 6. Bookmarks Slide-over Drawer */}
      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarkedNews={bookmarkedNewsItems}
        bookmarkedPlans={bookmarkedPlanItems}
        categories={categoriesList}
        onRemoveBookmark={(id) => {
          setBookmarkedNewsIds((prev) => prev.filter((i) => i !== id));
          setBookmarkedPlanIds((prev) => prev.filter((i) => i !== id));
        }}
        onOpenNewsDetail={(news) => {
          setIsBookmarksOpen(false);
          setSelectedNews(news);
        }}
      />
    </div>
  );
}
