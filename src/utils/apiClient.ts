import {
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
  CompleteDatabaseSchema,
  PublicContentResponse,
} from '../types';

const TOKEN_KEY = 'nelyess_capacita_auth_token';
const CACHE_KEY = 'nelyess_capacita_public_cache';

export function getStoredToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore storage issues
  }
}

function getAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export { type PublicContentResponse };

export const apiClient = {
  // Public shared content from server
  async getPublicContent(): Promise<PublicContentResponse> {
    try {
      const res = await fetch('/api/public-content');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // Cache locally for offline read
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      } catch {}
      return data;
    } catch (err) {
      throw err;
    }
  },

  // Submit data report from advisor
  async submitReport(report: {
    itemId: string;
    itemType: string;
    itemTitle: string;
    reportedBy: string;
    advisorContact?: string;
    description: string;
  }) {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al enviar reporte');
    }
    return res.json();
  },

  // Auth
  async login(username: string, password: string): Promise<{ user: UserAccount; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error de autenticación');
    }
    const data = await res.json();
    setStoredToken(data.token);
    return data;
  },

  async checkSession(): Promise<UserAccount | null> {
    const token = getStoredToken();
    if (!token) return null;
    try {
      const res = await fetch('/api/auth/session', {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data.authenticated) {
        setStoredToken(null);
        return null;
      }
      return data.user;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } finally {
      setStoredToken(null);
    }
  },

  // Admin All Data
  async getAllAdminData(): Promise<CompleteDatabaseSchema & { currentUserRole: string }> {
    const res = await fetch('/api/admin/all-data', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'No autorizado');
    }
    return res.json();
  },

  async getFullDatabase(): Promise<CompleteDatabaseSchema> {
    return this.getAllAdminData();
  },

  // News
  async saveNews(item: Partial<NewsItem>): Promise<{ success: boolean; item: NewsItem }> {
    const res = await fetch('/api/admin/news', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Error guardando novedad');
    return res.json();
  },

  async deleteNews(id: string, permanent = false): Promise<boolean> {
    const res = await fetch(`/api/admin/news/${id}?permanent=${permanent}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Error eliminando novedad');
    return (await res.json()).success;
  },

  // Documents
  async saveDocument(item: Partial<DocumentItem>): Promise<{ success: boolean; item: DocumentItem }> {
    const res = await fetch('/api/admin/documents', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Error guardando documento');
    return res.json();
  },

  async deleteDocument(id: string, permanent = false): Promise<boolean> {
    const res = await fetch(`/api/admin/documents/${id}?permanent=${permanent}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Error eliminando documento');
    return (await res.json()).success;
  },

  // Devices
  async saveDevice(item: Partial<DeviceProduct>): Promise<{ success: boolean; item: DeviceProduct }> {
    const res = await fetch('/api/admin/devices', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Error guardando equipo');
    return res.json();
  },

  async deleteDevice(id: string, permanent = false): Promise<boolean> {
    const res = await fetch(`/api/admin/devices/${id}?permanent=${permanent}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Error eliminando equipo');
    return (await res.json()).success;
  },

  // Plans
  async savePlan(item: Partial<BitelPlan>): Promise<{ success: boolean; item: BitelPlan }> {
    const res = await fetch('/api/admin/plans', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Error guardando plan');
    return res.json();
  },

  async deletePlan(id: string, permanent = false): Promise<boolean> {
    const res = await fetch(`/api/admin/plans/${id}?permanent=${permanent}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Error eliminando plan');
    return (await res.json()).success;
  },

  // Categories
  async saveCategory(item: Partial<CategoryItem>): Promise<{ success: boolean; item: CategoryItem }> {
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Error guardando categoría');
    return res.json();
  },

  async deleteOrReassignCategory(categoryId: string, reassignToId: string | null): Promise<{ affectedNews: number; affectedDocs: number }> {
    const res = await fetch('/api/admin/categories/delete-or-reassign', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ categoryId, reassignToId }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Error al eliminar categoría');
    return res.json();
  },

  // Navigation Menu
  async saveMenuItems(items: MenuItem[]): Promise<{ success: boolean; items: MenuItem[] }> {
    const res = await fetch('/api/admin/navigation', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(items),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Error guardando menú');
    return res.json();
  },

  // Header Branding
  async saveHeaderBranding(branding: HeaderBranding): Promise<{ success: boolean; branding: HeaderBranding }> {
    const res = await fetch('/api/admin/header-branding', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(branding),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Error guardando encabezado');
    return res.json();
  },

  // Blocks
  async saveBlocks(blocks: BlockItem[]): Promise<{ success: boolean; blocks: BlockItem[] }> {
    const res = await fetch('/api/admin/blocks', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(blocks),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Error guardando bloques');
    return res.json();
  },

  // Theme
  async saveTheme(theme: ThemeSettings): Promise<{ success: boolean; theme: ThemeSettings }> {
    const res = await fetch('/api/admin/theme', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(theme),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Error guardando apariencia');
    return res.json();
  },

  // Trash & Versions
  async restoreFromTrash(type: 'noticia' | 'equipo' | 'plan', id: string): Promise<boolean> {
    const res = await fetch('/api/admin/trash/restore', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ type, id }),
    });
    return (await res.json()).success;
  },

  async emptyTrash(): Promise<boolean> {
    const res = await fetch('/api/admin/trash/empty', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return (await res.json()).success;
  },

  async restoreVersionSnapshot(logId: string): Promise<boolean> {
    const res = await fetch('/api/admin/audit/restore-version', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ logId }),
    });
    return (await res.json()).success;
  },

  // Reports
  async updateReportStatus(id: string, status: DataReport['status'], resolutionNote?: string): Promise<boolean> {
    const res = await fetch(`/api/admin/reports/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, resolutionNote }),
    });
    return (await res.json()).success;
  },

  // Users
  async saveUser(user: Partial<UserAccount>): Promise<{ success: boolean; user: UserAccount }> {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(user),
    });
    return res.json();
  },

  // Export / Import
  async exportBackup(): Promise<CompleteDatabaseSchema> {
    const res = await fetch('/api/admin/backup/export', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al exportar respaldo');
    return res.json();
  },

  async importBackup(data: CompleteDatabaseSchema): Promise<{ success: boolean; message: string; counts: any }> {
    const res = await fetch('/api/admin/backup/import', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
