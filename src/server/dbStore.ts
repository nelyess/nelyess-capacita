import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
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
  DataReport,
  AuditLogEntry,
} from '../types';
import { initialDatabase } from '../data/seedData';

const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(process.cwd(), 'data'));
const DB_FILE = path.join(DATA_DIR, 'portal_database.json');

class DatabaseStore {
  private db: CompleteDatabaseSchema;
  private isLoaded = false;

  constructor() {
    this.db = initialDatabase;
    this.ensureInitialized();
  }

  private ensureInitialized(): void {
    if (this.isLoaded) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure essential fields exist
        this.db = {
          ...initialDatabase,
          ...parsed,
          headerBranding: { ...initialDatabase.headerBranding, ...(parsed.headerBranding || {}) },
          themeSettings: { ...initialDatabase.themeSettings, ...(parsed.themeSettings || {}) },
        };
      } else {
        this.db = JSON.parse(JSON.stringify(initialDatabase));
        this.persist();
      }
      this.db.learning ||= [];
      this.db.fixedPosts ||= [];
      if (!this.db.menuItems.some(m => m.targetPath === 'capacitaciones')) this.db.menuItems.push({id:'menu_capacitaciones',label:'Capacitaciones',targetType:'internal',targetPath:'capacitaciones',order:99,isVisible:true});
      this.isLoaded = true;
    } catch (err) {
      console.error('Error initializing database file, falling back to seed:', err);
      throw new Error('Base de datos ilegible: restaure un respaldo antes de continuar.');
    }
  }

  private persist(): void {
    try {
      this.db.lastUpdated = new Date().toISOString();
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.db, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Error persisting database to disk:', err);
      throw new Error('No se pudo guardar. Compruebe el almacenamiento del servidor.');
    }
  }

  private logAudit(
    entityType: AuditLogEntry['entityType'],
    entityId: string,
    entityTitle: string,
    action: AuditLogEntry['action'],
    performedBy: string,
    summary: string,
    snapshot: any
  ): void {
    const entry: AuditLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      entityType,
      entityId,
      entityTitle,
      action,
      performedBy,
      timestamp: new Date().toISOString(),
      summary,
      snapshot: JSON.parse(JSON.stringify(snapshot)),
    };
    this.db.auditLogs.unshift(entry);
    // Preserve historical versions; included in administrator backups.
  }

  // Public content for visitors from any device without authentication
  public getPublicData() {
    this.ensureInitialized();
    const publicCategories = this.db.categories.filter((c) => c.isPublic && !c.isArchived);
    const publicMenuItems = this.db.menuItems.filter((m) => m.isVisible);
    const publicBlocks = this.db.blocks.filter((b) => b.isVisible);
    const publicNews = this.db.news.filter((n) => n.editorialStatus === 'publicado');
    const publicDocuments = this.db.documents.filter((d) => d.status === 'vigente' && d.visibility === 'publico');
    const publicDevices = this.db.devices.filter((d) => d.editorialStatus === 'publicado');
    const publicPlans = this.db.plans.filter((p) => p.editorialStatus === 'publicado');
    const publicHistorical = this.db.historicalArchive.filter((h) => h.visibility === 'publico');

    return {
      learning: (this.db.learning || []).filter(x => x.editorialStatus === 'publicado'),
      fixedPosts: (this.db.fixedPosts || []).filter(x => x.editorialStatus === 'publicado'),
      headerBranding: this.db.headerBranding,
      categories: publicCategories,
      menuItems: publicMenuItems,
      blocks: publicBlocks,
      news: publicNews,
      documents: publicDocuments,
      devices: publicDevices,
      plans: publicPlans,
      historicalArchive: publicHistorical,
      themeSettings: this.db.themeSettings,
      lastUpdated: this.db.lastUpdated,
    };
  }

  // Admin and Editor full view
  public getAllData(user: UserAccount) {
    this.ensureInitialized();
    return {
      ...this.db,
      currentUserRole: user.role,
    };
  }

  public saveEntry(collection: 'learning' | 'fixedPosts' | 'historicalArchive', item: any, user: UserAccount) {
    const list: any[] = this.db[collection] ||= [];
    const index = list.findIndex(x => x.id === item.id);
    const previous = index >= 0 ? list[index] : null;
    if (previous) this.logAudit('bloques', previous.id, previous.title, 'editar', user.displayName, `Versión anterior · ${collection}`, { collection, item: previous });
    const now = new Date().toISOString();
    const saved = {...previous, ...item, id: previous?.id || crypto.randomUUID(), createdAt:previous?.createdAt || now, updatedAt:now, version:(previous?.version || 0)+1};
    if (collection === 'historicalArchive') {
      saved.year = Number(saved.eventDate.slice(0,4)); saved.month = Number(saved.eventDate.slice(5,7));
      saved.addedDate ||= now; saved.tags ||= []; saved.statusText ||= 'Histórico: no utilizar como condición comercial vigente';
    }
    if (index >= 0) list[index] = saved; else list.push(saved);
    this.logAudit('bloques', saved.id, saved.title, previous ? 'editar' : 'crear', user.displayName, `Guardado · ${collection}`, {collection,item:saved});
    this.persist(); return saved;
  }

  // News CRUD
  public saveNews(item: NewsItem, user: UserAccount): NewsItem {
    this.ensureInitialized();
    const existingIndex = this.db.news.findIndex((n) => n.id === item.id);
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      const prev = this.db.news[existingIndex];
      this.logAudit('noticia', prev.id, prev.title, 'editar', user.displayName, 'Versión anterior', prev);
      const updated: NewsItem = {
        ...prev,
        ...item,
        lastUpdated: now,
        version: (prev.version || 1) + 1,
      };
      this.db.news[existingIndex] = updated;
      this.logAudit('noticia', updated.id, updated.title, 'editar', user.displayName, `Actualización de publicación v${updated.version}`, updated);
      this.persist();
      return updated;
    } else {
      const created: NewsItem = {
        ...item,
        id: item.id || `news_${Date.now()}`,
        publishDate: item.publishDate || now,
        lastUpdated: now,
        version: 1,
        viewsCount: 0,
      };
      this.db.news.unshift(created);
      this.logAudit('noticia', created.id, created.title, 'crear', user.displayName, 'Creación de nueva publicación', created);
      this.persist();
      return created;
    }
  }

  public deleteNews(id: string, user: UserAccount, permanent = false): boolean {
    this.ensureInitialized();
    const index = this.db.news.findIndex((n) => n.id === id);
    if (index < 0) return false;

    const item = this.db.news[index];
    if (permanent) {
      if (user.role !== 'administrador') return false;
      this.db.news.splice(index, 1);
      this.logAudit('noticia', id, item.title, 'eliminar_permanente', user.displayName, 'Eliminación permanente de publicación', item);
    } else {
      item.editorialStatus = 'papelera';
      this.logAudit('noticia', id, item.title, 'papelera', user.displayName, 'Envío de publicación a la papelera', item);
    }
    this.persist();
    return true;
  }

  // Documents CRUD
  public saveDocument(item: DocumentItem, user: UserAccount): DocumentItem {
    this.ensureInitialized();
    const index = this.db.documents.findIndex((d) => d.id === item.id);
    const now = new Date().toISOString();

    if (index >= 0) {
      const prev = this.db.documents[index];
      // If URL changed and version bumped, keep previous in history
      const previousVersionUrls = prev.previousVersionUrls ? [...prev.previousVersionUrls] : [];
      if (prev.url !== item.url && prev.versionNumber !== item.versionNumber) {
        previousVersionUrls.push({
          version: prev.versionNumber,
          url: prev.url,
          date: prev.addedDate,
        });
      }

      const updated: DocumentItem = {
        ...prev,
        ...item,
        previousVersionUrls,
      };
      this.db.documents[index] = updated;
      this.logAudit('documento', updated.id, updated.title, 'editar', user.displayName, `Actualización de documento Drive ${updated.versionNumber}`, updated);
      this.persist();
      return updated;
    } else {
      const created: DocumentItem = {
        ...item,
        id: item.id || `doc_${Date.now()}`,
        addedDate: item.addedDate || now,
      };
      this.db.documents.unshift(created);
      this.logAudit('documento', created.id, created.title, 'crear', user.displayName, 'Registro de nuevo enlace de documento', created);
      this.persist();
      return created;
    }
  }

  public deleteDocument(id: string, user: UserAccount, permanent = false): boolean {
    this.ensureInitialized();
    const index = this.db.documents.findIndex((d) => d.id === id);
    if (index < 0) return false;
    const item = this.db.documents[index];

    if (permanent) {
      if (user.role !== 'administrador') return false;
      this.db.documents.splice(index, 1);
      this.logAudit('documento', id, item.title, 'eliminar_permanente', user.displayName, 'Eliminación permanente de registro documental', item);
    } else {
      // Mark as historic or remove from active
      item.status = 'historico';
      this.logAudit('documento', id, item.title, 'archivar', user.displayName, 'Pase de documento al estado histórico', item);
    }
    this.persist();
    return true;
  }

  // Devices CRUD
  public saveDevice(item: DeviceProduct, user: UserAccount): DeviceProduct {
    this.ensureInitialized();
    const index = this.db.devices.findIndex((d) => d.id === item.id);
    const now = new Date().toISOString().split('T')[0];

    // Compute exact total financed
    const total12 = Number((item.priceInitialFee + item.installments12 * 12).toFixed(2));
    const total18 = Number((item.priceInitialFee + item.installments18 * 18).toFixed(2));

    const preparedItem: DeviceProduct = {
      ...item,
      totalFinanced12: total12,
      totalFinanced18: total18,
      lastUpdated: now,
    };

    if (index >= 0) {
      const prev = this.db.devices[index];
      const updated: DeviceProduct = {
        ...prev,
        ...preparedItem,
        version: (prev.version || 1) + 1,
      };
      this.db.devices[index] = updated;
      this.logAudit('equipo', updated.id, updated.name, 'editar', user.displayName, `Actualización de terminal y precios v${updated.version}`, updated);
      this.persist();
      return updated;
    } else {
      const created: DeviceProduct = {
        ...preparedItem,
        id: item.id || `dev_${Date.now()}`,
        version: 1,
      };
      this.db.devices.unshift(created);
      this.logAudit('equipo', created.id, created.name, 'crear', user.displayName, 'Registro de nuevo equipo en portafolio', created);
      this.persist();
      return created;
    }
  }

  public deleteDevice(id: string, user: UserAccount, permanent = false): boolean {
    this.ensureInitialized();
    const index = this.db.devices.findIndex((d) => d.id === id);
    if (index < 0) return false;
    const item = this.db.devices[index];

    if (permanent) {
      if (user.role !== 'administrador') return false;
      this.db.devices.splice(index, 1);
      this.logAudit('equipo', id, item.name, 'eliminar_permanente', user.displayName, 'Eliminación permanente de equipo', item);
    } else {
      item.editorialStatus = 'papelera';
      this.logAudit('equipo', id, item.name, 'papelera', user.displayName, 'Envío de equipo a la papelera', item);
    }
    this.persist();
    return true;
  }

  // Plans CRUD
  public savePlan(item: BitelPlan, user: UserAccount): BitelPlan {
    this.ensureInitialized();
    const index = this.db.plans.findIndex((p) => p.id === item.id);

    if (index >= 0) {
      const prev = this.db.plans[index];
      const updated: BitelPlan = {
        ...prev,
        ...item,
        version: (prev.version || 1) + 1,
      };
      this.db.plans[index] = updated;
      this.logAudit('plan', updated.id, updated.name, 'editar', user.displayName, `Actualización de plan comercial v${updated.version}`, updated);
      this.persist();
      return updated;
    } else {
      const created: BitelPlan = {
        ...item,
        id: item.id || `plan_${Date.now()}`,
        version: 1,
      };
      this.db.plans.unshift(created);
      this.logAudit('plan', created.id, created.name, 'crear', user.displayName, 'Registro de nuevo plan comercial', created);
      this.persist();
      return created;
    }
  }

  public deletePlan(id: string, user: UserAccount, permanent = false): boolean {
    this.ensureInitialized();
    const index = this.db.plans.findIndex((p) => p.id === id);
    if (index < 0) return false;
    const item = this.db.plans[index];

    if (permanent) {
      if (user.role !== 'administrador') return false;
      this.db.plans.splice(index, 1);
      this.logAudit('plan', id, item.name, 'eliminar_permanente', user.displayName, 'Eliminación permanente de plan', item);
    } else {
      item.editorialStatus = 'papelera';
      this.logAudit('plan', id, item.name, 'papelera', user.displayName, 'Envío de plan a la papelera', item);
    }
    this.persist();
    return true;
  }

  // Categories CRUD with safe reassignment
  public saveCategory(category: CategoryItem, user: UserAccount): CategoryItem {
    this.ensureInitialized();
    const index = this.db.categories.findIndex((c) => c.id === category.id);
    if (index >= 0) {
      const prev = this.db.categories[index];
      const updated: CategoryItem = {
        ...prev,
        ...category,
      };
      this.db.categories[index] = updated;
      this.logAudit('categoria', updated.id, updated.name, 'editar', user.displayName, 'Modificación de categoría', updated);
      this.persist();
      return updated;
    } else {
      const created: CategoryItem = {
        ...category,
        id: category.id || `cat_${Date.now()}`,
      };
      this.db.categories.push(created);
      this.logAudit('categoria', created.id, created.name, 'crear', user.displayName, 'Creación de categoría', created);
      this.persist();
      return created;
    }
  }

  public deleteOrReassignCategory(
    categoryId: string,
    reassignToId: string | null,
    user: UserAccount
  ): { affectedNews: number; affectedDocs: number } {
    this.ensureInitialized();
    const catIndex = this.db.categories.findIndex((c) => c.id === categoryId);
    if (catIndex < 0) return { affectedNews: 0, affectedDocs: 0 };
    const categoryName = this.db.categories[catIndex].name;

    let affectedNews = 0;
    this.db.news.forEach((n) => {
      if (n.categoryId === categoryId) {
        n.categoryId = reassignToId || 'cat_pospago';
        affectedNews++;
      }
    });

    let affectedDocs = 0;
    this.db.documents.forEach((d) => {
      if (d.categoryId === categoryId) {
        d.categoryId = reassignToId || 'cat_pospago';
        affectedDocs++;
      }
    });

    this.db.categories.splice(catIndex, 1);
    this.logAudit(
      'categoria',
      categoryId,
      categoryName,
      'eliminar_permanente',
      user.displayName,
      `Eliminación de categoría. Registros reasignados: ${affectedNews} noticias, ${affectedDocs} documentos.`,
      { categoryId, reassignToId }
    );
    this.persist();
    return { affectedNews, affectedDocs };
  }

  // Navigation, Header, Blocks, Appearance
  public updateMenuItems(items: MenuItem[], user: UserAccount): MenuItem[] {
    this.ensureInitialized();
    this.db.menuItems = items;
    this.logAudit('menu', 'main_navigation', 'Menú Principal', 'editar', user.displayName, 'Actualización de navegación', items);
    this.persist();
    return this.db.menuItems;
  }

  public updateHeaderBranding(branding: HeaderBranding, user: UserAccount): HeaderBranding {
    this.ensureInitialized();
    this.db.headerBranding = branding;
    this.logAudit('branding', 'header_config', 'Encabezado y Marca', 'editar', user.displayName, 'Actualización de encabezado y avisos', branding);
    this.persist();
    return this.db.headerBranding;
  }

  public updateBlocks(blocks: BlockItem[], user: UserAccount): BlockItem[] {
    this.ensureInitialized();
    this.db.blocks = blocks;
    this.logAudit('bloques', 'custom_blocks', 'Bloques Modulares', 'editar', user.displayName, 'Actualización de bloques de inicio', blocks);
    this.persist();
    return this.db.blocks;
  }

  public updateTheme(theme: ThemeSettings, user: UserAccount): ThemeSettings {
    this.ensureInitialized();
    this.db.themeSettings = theme;
    this.logAudit('apariencia', 'theme_config', 'Apariencia y Estilos', 'editar', user.displayName, 'Actualización de apariencia', theme);
    this.persist();
    return this.db.themeSettings;
  }

  // Trash & Version History Restoration
  public restoreFromTrash(type: 'noticia' | 'equipo' | 'plan', id: string, user: UserAccount): boolean {
    this.ensureInitialized();
    if (type === 'noticia') {
      const item = this.db.news.find((n) => n.id === id);
      if (item) {
        item.editorialStatus = 'publicado';
        this.logAudit('noticia', id, item.title, 'restaurar', user.displayName, 'Restauración desde papelera', item);
        this.persist();
        return true;
      }
    } else if (type === 'equipo') {
      const item = this.db.devices.find((d) => d.id === id);
      if (item) {
        item.editorialStatus = 'publicado';
        this.logAudit('equipo', id, item.name, 'restaurar', user.displayName, 'Restauración desde papelera', item);
        this.persist();
        return true;
      }
    } else if (type === 'plan') {
      const item = this.db.plans.find((p) => p.id === id);
      if (item) {
        item.editorialStatus = 'publicado';
        this.logAudit('plan', id, item.name, 'restaurar', user.displayName, 'Restauración desde papelera', item);
        this.persist();
        return true;
      }
    }
    return false;
  }

  public emptyTrash(user: UserAccount): boolean {
    this.ensureInitialized();
    if (user.role !== 'administrador') return false;
    this.db.news = this.db.news.filter((n) => n.editorialStatus !== 'papelera');
    this.db.devices = this.db.devices.filter((d) => d.editorialStatus !== 'papelera');
    this.db.plans = this.db.plans.filter((p) => p.editorialStatus !== 'papelera');
    this.logAudit('branding', 'trash_purge', 'Papelera', 'eliminar_permanente', user.displayName, 'Vaciado definitivo de la papelera', {});
    this.persist();
    return true;
  }

  public restoreVersionSnapshot(logId: string, user: UserAccount): boolean {
    this.ensureInitialized();
    const log = this.db.auditLogs.find((l) => l.id === logId);
    if (!log || !log.snapshot) return false;

    if (log.snapshot.collection && ['learning','fixedPosts','historicalArchive'].includes(log.snapshot.collection)) {
      this.saveEntry(log.snapshot.collection, log.snapshot.item, user); return true;
    }
    if (log.entityType === 'noticia') {
      const snapshot = log.snapshot as NewsItem;
      const index = this.db.news.findIndex((n) => n.id === log.entityId);
      const restoredItem: NewsItem = {
        ...snapshot,
        version: (snapshot.version || 1) + 1,
        lastUpdated: new Date().toISOString(),
      };
      if (index >= 0) {
        this.db.news[index] = restoredItem;
      } else {
        this.db.news.unshift(restoredItem);
      }
      this.logAudit('noticia', restoredItem.id, restoredItem.title, 'restaurar', user.displayName, `Versión restaurada desde auditoría (${log.timestamp})`, restoredItem);
      this.persist();
      return true;
    }
    const key = ({documento:'documents',equipo:'devices',plan:'plans'} as const)[log.entityType as 'documento'|'equipo'|'plan'];
    if(key){const list:any[]=this.db[key];const i=list.findIndex(x=>x.id===log.entityId);if(i>=0)list[i]={...log.snapshot};else list.push({...log.snapshot});this.logAudit(log.entityType,log.entityId,log.entityTitle,'restaurar',user.displayName,'Versión restaurada',log.snapshot);this.persist();return true;}
    return false;
  }

  // Reports
  public addReport(report: Omit<DataReport, 'id' | 'submittedAt' | 'status'>): DataReport {
    this.ensureInitialized();
    const created: DataReport = {
      ...report,
      id: `rep_${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'pendiente',
    };
    this.db.dataReports.unshift(created);
    this.persist();
    return created;
  }

  public updateReportStatus(id: string, status: DataReport['status'], resolutionNote: string | undefined, user: UserAccount): boolean {
    this.ensureInitialized();
    const report = this.db.dataReports.find((r) => r.id === id);
    if (!report) return false;
    report.status = status;
    if (resolutionNote) report.resolutionNote = resolutionNote;
    this.logAudit('noticia', id, report.itemTitle, 'editar', user.displayName, `Reporte comercial marcado como ${status}`, report);
    this.persist();
    return true;
  }

  // User management (Admin only)
  public saveUser(userToSave: UserAccount, admin: UserAccount): UserAccount | null {
    this.ensureInitialized();
    if (admin.role !== 'administrador') return null;
    const index = this.db.users.findIndex((u) => u.id === userToSave.id);
    if (index >= 0) {
      this.db.users[index] = { ...userToSave };
    } else {
      this.db.users.push({ ...userToSave, id: userToSave.id || `user_${Date.now()}` });
    }
    this.persist();
    return userToSave;
  }

  // Backup & Import
  public exportBackup(): CompleteDatabaseSchema {
    this.ensureInitialized();
    return JSON.parse(JSON.stringify(this.db));
  }

  public importBackup(incoming: CompleteDatabaseSchema, user: UserAccount): { success: boolean; message: string; counts: any } {
    this.ensureInitialized();
    if (user.role !== 'administrador') {
      return { success: false, message: 'Se requieren permisos de administrador', counts: null };
    }
    if (!incoming || !Array.isArray(incoming.news) || !Array.isArray(incoming.categories)) {
      return { success: false, message: 'Estructura JSON de respaldo no válida', counts: null };
    }

    const counts = {
      news: incoming.news.length,
      categories: incoming.categories.length,
      documents: (incoming.documents || []).length,
      devices: (incoming.devices || []).length,
      plans: (incoming.plans || []).length,
    };

    this.db = {
      ...initialDatabase,
      ...incoming,
      lastUpdated: new Date().toISOString(),
    };
    this.logAudit('branding', 'backup_import', 'Restauración de Respaldo', 'restaurar', user.displayName, `Importación completa de base de datos (${counts.news} novedades)`, counts);
    this.persist();
    return { success: true, message: 'Base de datos restaurada correctamente', counts };
  }
}

export const dbStore = new DatabaseStore();
