import React, { useState } from 'react';
import { 
  Newspaper, 
  Smartphone, 
  Wifi, 
  FileText, 
  Bookmark, 
  Lock, 
  ShieldCheck, 
  Menu, 
  X, 
  Settings,
  LogOut,
  Archive,
  Layers,
  Edit3,
  ExternalLink
} from 'lucide-react';
import { UserRole, MenuItem, HeaderBranding, UserAccount } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  menuItems: MenuItem[];
  headerBranding: HeaderBranding;
  bookmarkedCount: number;
  currentUser: UserAccount | null;
  quickEditMode: boolean;
  onToggleQuickEdit: () => void;
  onOpenAdminLogin: () => void;
  onLogoutAdmin: () => void;
  onOpenAdminPanel: (tab?: string) => void;
  onOpenBookmarks: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  menuItems,
  headerBranding,
  bookmarkedCount,
  currentUser,
  quickEditMode,
  onToggleQuickEdit,
  onOpenAdminLogin,
  onLogoutAdmin,
  onOpenAdminPanel,
  onOpenBookmarks,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const getMenuIcon = (targetPath: string) => {
    switch (targetPath) {
      case 'novedades':
        return Newspaper;
      case 'equipos':
        return Smartphone;
      case 'planes':
        return Wifi;
      case 'documentos':
        return FileText;
      case 'historico':
        return Archive;
      case 'bloques':
        return Layers;
      default:
        return FileText;
    }
  };

  const activeAnnouncement = headerBranding?.showAnnouncements
    ? headerBranding.announcements?.find((a) => a.active)
    : null;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Announcement Strip (if enabled and scheduled) */}
      {activeAnnouncement && (
        <div 
          className={`px-4 py-1.5 text-xs font-semibold flex items-center justify-between border-b transition-colors ${
            activeAnnouncement.type === 'urgente'
              ? 'bg-amber-500 text-slate-950 border-amber-600'
              : 'bg-slate-900 text-slate-100 border-slate-950'
          }`}
        >
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate">
              <span className={`w-2 h-2 rounded-full shrink-0 ${activeAnnouncement.type === 'urgente' ? 'bg-slate-950 animate-pulse' : 'bg-amber-400'}`} />
              <span className="truncate">
                {activeAnnouncement.text}
              </span>
            </div>
            {activeAnnouncement.linkUrl && (
              <a
                href={activeAnnouncement.linkUrl}
                className="text-[11px] underline font-bold shrink-0 hover:opacity-80"
              >
                Ver detalle
              </a>
            )}
          </div>
        </div>
      )}

      {/* Role Notice & Session Bar */}
      <div className="px-4 py-1 text-xs border-b bg-slate-100 text-slate-600 border-slate-200">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            {currentUser ? (
              <div className="flex items-center gap-2 text-slate-900 font-semibold truncate">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">
                  Sesión activa: <strong>{currentUser.displayName}</strong> ({currentUser.role === 'administrador' ? 'Administrador Total' : 'Editor Autorizado'})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-600 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">
                  {headerBranding.subtitle} · Modo Asesor Comercial
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs">
            {currentUser ? (
              <>
                <button
                  onClick={onToggleQuickEdit}
                  className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[11px] transition-colors ${
                    quickEditMode ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                  }`}
                  title="Activa botones de edición rápida en la vista pública"
                >
                  <Edit3 className="w-3 h-3" />
                  <span className="hidden sm:inline">Edición Rápida: {quickEditMode ? 'ON' : 'OFF'}</span>
                </button>
                <button
                  onClick={() => onOpenAdminPanel()}
                  className="inline-flex items-center gap-1 font-bold text-slate-900 hover:text-amber-700 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">Panel Admin</span>
                </button>
                <button
                  onClick={onLogoutAdmin}
                  className="inline-flex items-center gap-1 font-bold text-slate-700 hover:text-red-700 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Salir</span>
                </button>
              </>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="inline-flex items-center gap-1 text-slate-800 hover:text-amber-700 font-bold transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Acceso Capacitador</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo - 100% Typographic identity */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleTabClick('novedades')}
              className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-xl"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-amber-400 font-black shadow-sm group-hover:bg-slate-800 transition-colors">
                <span className="text-base tracking-tighter">{headerBranding.brandInitials || 'NC'}</span>
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-slate-900 block leading-tight">
                  {headerBranding.portalName || 'Nelyess Capacita'}
                </span>
                <span className="text-[11px] font-bold text-amber-600 block leading-none">
                  Herramientas Comerciales Bitel
                </span>
              </div>
            </button>
          </div>

          {/* Dynamic Desktop Navigation Menu */}
          <nav 
            className="hidden md:flex items-center gap-1 text-sm font-bold"
            aria-label="Navegación principal"
          >
            {menuItems.filter((m) => m.isVisible).map((item) => {
              const Icon = getMenuIcon(item.targetPath);
              const isActive = activeTab === item.targetPath;

              if (item.targetType === 'external') {
                return (
                  <a
                    key={item.id}
                    href={item.targetPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    <span>{item.label}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.targetPath)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Header Right Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Guardados Button */}
            <button
              onClick={onOpenBookmarks}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'guardados'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
              title="Elementos guardados"
              aria-label={`Elementos guardados: ${bookmarkedCount}`}
            >
              <Bookmark className={`w-4 h-4 ${bookmarkedCount > 0 ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Guardados</span>
              {bookmarkedCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded-full text-[10px] font-black">
                  {bookmarkedCount}
                </span>
              )}
            </button>

            {/* Admin Quick Action Button */}
            {currentUser && (
              <button
                onClick={() => onOpenAdminPanel('novedades')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl transition-all shadow-sm"
              >
                <span>+ Gestionar</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              aria-expanded={mobileMenuOpen}
              aria-label="Abrir menú de navegación"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Accessible Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 shadow-lg animate-fade-in"
          role="region"
          aria-label="Menú móvil"
        >
          <div className="grid grid-cols-2 gap-2">
            {menuItems.filter((m) => m.isVisible).map((item) => {
              const Icon = getMenuIcon(item.targetPath);
              const isActive = activeTab === item.targetPath;

              if (item.targetType === 'external') {
                return (
                  <a
                    key={item.id}
                    href={item.targetPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100"
                  >
                    <span>{item.label}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.targetPath)}
                  className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBookmarks();
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-slate-700 bg-slate-100"
            >
              <Bookmark className="w-4 h-4 text-amber-500" />
              <span>Guardados ({bookmarkedCount})</span>
            </button>

            {currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminPanel();
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-amber-400 font-bold rounded-lg"
              >
                <Settings className="w-4 h-4" />
                <span>Panel Admin</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminLogin();
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-amber-700 font-bold hover:bg-amber-50 rounded-lg"
              >
                <Lock className="w-4 h-4" />
                <span>Acceso Capacitador</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
