export type UserRole = 'visitante' | 'editor' | 'administrador';

export type EditorialStatus = 'borrador' | 'publicado' | 'archivado' | 'papelera';

export type ValidityStatus = 'vigente' | 'proximo' | 'vencido' | 'por_confirmar';

export type UrgencyLevel = 'urgente' | 'novedad' | 'vigente' | 'actualizado';

export type DocumentProvider = 'google_drive' | 'onedrive' | 'institucional' | 'web_oficial' | 'otro';

export type DocumentFileType = 'pdf' | 'document' | 'sheet' | 'presentation' | 'drive_folder' | 'other';

export type DocumentVisibility = 'publico' | 'asesores' | 'interno';

export type DocumentStatus = 'vigente' | 'historico' | 'pendiente_revision' | 'enlace_reportado';

export interface UserAccount {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  status: 'activo' | 'inactivo';
  createdAt: string;
  lastLogin?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string; // Lucide icon key: 'smartphone', 'wifi', 'tag', 'settings', 'file-text', etc.
  color: string; // Tailwind color token or hex
  order: number;
  isPublic: boolean;
  isArchived: boolean;
  subcategories: string[];
}

export interface MenuItem {
  id: string;
  label: string;
  targetType: 'internal' | 'external';
  targetPath: 'novedades' | 'equipos' | 'planes' | 'documentos' | 'historico' | 'bloques' | string;
  order: number;
  isVisible: boolean;
  isSystemDefault?: boolean;
}

export interface AnnouncementBarItem {
  id: string;
  text: string;
  type: 'urgente' | 'informativo' | 'destacado';
  active: boolean;
  startDate?: string;
  endDate?: string;
  order: number;
  linkUrl?: string;
}

export interface HeaderBranding {
  brandInitials: string;
  portalName: string;
  subtitle: string;
  mainTitle: string;
  description: string;
  searchPlaceholder: string;
  headerTheme: 'default' | 'dark' | 'slate' | 'contrast';
  showAnnouncements: boolean;
  announcements: AnnouncementBarItem[];
}

export interface BlockItem {
  id: string;
  type: 
    | 'title_text'
    | 'notice'
    | 'button_group'
    | 'drive_list'
    | 'link_list'
    | 'category_news'
    | 'faq'
    | 'info_table'
    | 'check_list'
    | 'before_after'
    | 'training_link';
  title: string;
  subtitle?: string;
  content?: string;
  data: any;
  order: number;
  isVisible: boolean;
}

export interface SystemCode {
  system: string; // e.g. "B-POS", "SISACT", "Salesforce", "B-Sales"
  code: string;
  description: string;
}

export interface BeforeAfterChange {
  before: string;
  after: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  description: string;
  url: string; // Preserves complete URL with query params
  provider: DocumentProvider;
  fileType: DocumentFileType;
  categoryId: string;
  tags: string[];
  documentDate: string; // YYYY-MM-DD
  addedDate: string; // ISO
  versionNumber: string; // e.g. "v1.0", "Circular Nº 44-2026"
  authorOrSource: string;
  relatedEntity?: {
    type: 'noticia' | 'plan' | 'equipo' | 'capacitacion';
    id: string;
    name: string;
  };
  visibility: DocumentVisibility;
  status: DocumentStatus;
  accessCheckStatus: 'no_verificado' | 'verificado' | 'revisar';
  isEvidence: boolean;
  historicalNote?: string;
  previousVersionUrls?: {
    version: string;
    url: string;
    date: string;
  }[];
}

export interface NewsItem {
  driveUrl?: string;
  id: string;
  title: string;
  summary: string;
  categoryId: string;
  urgency: UrgencyLevel;
  editorialStatus: EditorialStatus;
  validityStatus?: ValidityStatus;
  publishDate: string; // ISO
  lastUpdated?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  effectiveDate: string; // Human readable string
  author: string;
  source: string;
  targetAudience: string[];
  content: string;
  whatChanges: string[];
  whatStays: string[];
  beforeAfter?: BeforeAfterChange;
  salesArguments: string[];
  systemCodes: SystemCode[];
  relatedDocumentIds: string[];
  customWhatsAppText?: string;
  viewsCount: number;
  subjectToStock?: boolean;
  needsReview?: boolean;
  version: number;
}

export interface DeviceCustomField {
  id: string;
  label: string;
  value: string;
  order: number;
}

export interface DeviceProduct {
  id: string;
  name: string;
  brand: 'Samsung' | 'Apple' | 'Xiaomi' | 'Honor' | 'Motorola' | 'ZTE' | 'Otros';
  categoryTier: 'gama_alta' | 'gama_media' | 'gama_entrada';
  priceCash: number; // Precio al contado
  priceInitialFee: number; // Cuota inicial (S/ 0 o monto)
  installments12: number; // Valor cuota mensual 12 meses
  installments18: number; // Valor cuota mensual 18 meses
  totalFinanced12: number; // Total calculado cuota inicial + 12 cuotas
  totalFinanced18: number; // Total calculado cuota inicial + 18 cuotas
  pricePortabilidad: number;
  priceRenovacion: number;
  pricePrepago: number;
  suggestedPlan: string;
  stockStatus: 'disponible' | 'pocas_unidades' | 'agotado';
  subjectToStock: boolean;
  keySpecs: string[];
  highlights: string;
  commercialConditions: string[];
  relatedDocumentId?: string;
  customFields?: DeviceCustomField[];
  lastUpdated: string;
  source: string;
  editorialStatus: EditorialStatus;
  version: number;
}

export interface PlanCustomField {
  id: string;
  label: string;
  value: string;
  order: number;
}

export interface BitelPlan {
  id: string;
  name: string;
  monthlyFee: number; // S/ mensual
  category: 'pospago_movil' | 'fibra_hogar' | 'prepago_timi';
  dataHighSpeed: string; // ej. "70 GB en 5G"
  dataThen: string; // ej. "Internet ilimitado a 256 kbps"
  unlimitedApps: string[]; // ej. ["WhatsApp", "Facebook", "Instagram", "TikTok", "Waze"]
  callsAndSms: string; // ej. "Llamadas ilimitadas a todo el Perú"
  roamingLatam: string; // ej. "WhatsApp y 8GB libres en 10 países" o "No disponible"
  restrictions: string[];
  effectivePeriod: string;
  featuredTag?: string;
  relatedDocumentId?: string;
  customFields?: PlanCustomField[];
  editorialStatus: EditorialStatus;
  version: number;
}

export interface HistoricalArchiveItem {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  eventDate: string; // Fecha del hecho (YYYY-MM-DD o YYYY-MM)
  year: number;
  month: number;
  addedDate: string; // Fecha incorporación
  source: string;
  documentType: DocumentFileType | 'comunicado_historico' | 'promocion_vencida';
  documentUrl?: string; // Enlace Google Drive o HTTPS
  driveFolderUrl?: string; // Carpeta de Drive de evidencias (se muestra como enlace, nunca fotos)
  visibility: DocumentVisibility;
  statusText: string; // "Histórico: no utilizar como condición comercial vigente"
}

export interface AuditLogEntry {
  id: string;
  entityType: 'noticia' | 'documento' | 'equipo' | 'plan' | 'categoria' | 'menu' | 'branding' | 'bloques' | 'apariencia';
  entityId: string;
  entityTitle: string;
  action: 'crear' | 'editar' | 'restaurar' | 'archivar' | 'papelera' | 'eliminar_permanente';
  performedBy: string;
  timestamp: string;
  summary: string;
  snapshot: any;
}

export interface ThemeSettings {
  primaryColor: string; // e.g. '#0f766e', '#1e3a8a', '#0369a1', '#1e293b'
  accentColor: string; // e.g. '#f59e0b', '#06b6d4', '#10b981'
  surfaceTheme: 'light' | 'slate' | 'zinc';
  fontFamily: 'Inter' | 'System' | 'Roboto' | 'JetBrains';
  titleScale: 'compact' | 'standard' | 'large';
  cardDensity: 'compact' | 'standard';
  borderRadius: 'subtle' | 'standard' | 'rounded';
  footerNotice: string;
}

export interface DataReport {
  id: string;
  itemId: string;
  itemType: 'noticia' | 'equipo' | 'plan' | 'documento' | 'historico';
  itemTitle: string;
  reportedBy: string;
  advisorContact?: string;
  description: string;
  submittedAt: string;
  status: 'pendiente' | 'revisado' | 'corregido';
  resolutionNote?: string;
}

export interface CompleteDatabaseSchema {
  learning?: PortalEntry[];
  fixedPosts?: PortalEntry[];
  version: number;
  lastUpdated: string;
  headerBranding: HeaderBranding;
  categories: CategoryItem[];
  menuItems: MenuItem[];
  blocks: BlockItem[];
  news: NewsItem[];
  documents: DocumentItem[];
  devices: DeviceProduct[];
  plans: BitelPlan[];
  historicalArchive: HistoricalArchiveItem[];
  auditLogs: AuditLogEntry[];
  themeSettings: ThemeSettings;
  dataReports: DataReport[];
  users: UserAccount[];
}

export interface PublicContentResponse {
  learning?: PortalEntry[];
  fixedPosts?: PortalEntry[];
  headerBranding: HeaderBranding;
  categories: CategoryItem[];
  menuItems: MenuItem[];
  blocks: BlockItem[];
  news: NewsItem[];
  documents: DocumentItem[];
  devices: DeviceProduct[];
  plans: BitelPlan[];
  historicalArchive: HistoricalArchiveItem[];
  themeSettings: ThemeSettings;
  lastUpdated?: string;
}

export interface FilterState {
  searchQuery: string;
  categoryId: string;
  urgency: string;
  validity: ValidityStatus | 'all';
}

export interface PortalEntry {
 id: string; title: string; summary: string; content: string;
 category: string; subcategory: string; order: number;
 editorialStatus: EditorialStatus; kind: 'noticia' | 'comunicado' | 'capacitacion';
 driveUrl: string; source: string; audience: string; author: string;
 createdAt: string; updatedAt: string; eventDate: string;
 requirements: string; commonErrors: string; version: number;
}
