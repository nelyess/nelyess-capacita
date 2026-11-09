import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import { dbStore } from './src/server/dbStore';
import { UserAccount } from './src/types';

const app = express();
const PORT = Number(process.env.PORT || 3000);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '20mb' }));
app.use('/api', (_req,res,next) => {res.setHeader('Cache-Control','no-store');next();});

// In-memory active session store
interface SessionInfo {
  token: string;
  user: UserAccount;
  expiresAt: number;
}
const activeSessions = new Map<string, SessionInfo>();

// Create initial session for convenience
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Authentication Middleware
function authenticateRequest(req: Request): UserAccount | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7).trim();
  const session = activeSessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return null;
  }
  return session.user;
}

function requireAuth(allowedRoles: ('visitante' | 'editor' | 'administrador')[] = ['editor', 'administrador']) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = authenticateRequest(req);
    if (!user) {
      res.status(401).json({ error: 'No autorizado. Inicie sesión para continuar.' });
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({ error: 'Acceso denegado. Permisos insuficientes.' });
      return;
    }
    (req as any).user = user;
    next();
  };
}

// --- PUBLIC API ROUTES ---

// 1. Shared Public Content (Accessed by any advisor or device without login)
app.get('/api/public-content', (req: Request, res: Response) => {
  try {
    const data = dbStore.getPublicData();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Error cargando datos del portal', details: err?.message });
  }
});

// 2. Submit Data Correction Report (Public from advisors)
app.post('/api/reports', (req: Request, res: Response) => {
  try {
    const { itemId, itemType, itemTitle, reportedBy, advisorContact, description } = req.body;
    if (!description || !itemTitle) {
      res.status(400).json({ error: 'Falta la descripción o título del elemento a reportar' });
      return;
    }
    const report = dbStore.addReport({
      itemId: itemId || 'gen',
      itemType: itemType || 'noticia',
      itemTitle,
      reportedBy: reportedBy || 'Asesor Comercial Bitel',
      advisorContact,
      description,
    });
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al enviar reporte', details: err?.message });
  }
});

// 3. Auth Endpoints
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Ingrese usuario y contraseña' });
    return;
  }

  const cleanUser = String(username).trim().toLowerCase();
  const cleanPass = String(password).trim();

  let matchedUser: UserAccount | null = null;

  const adminPass = process.env.ADMIN_PASSWORD;
  if (!adminPass) { res.status(503).json({error:'Configure ADMIN_PASSWORD en el servidor antes de iniciar sesión.'}); return; }
  const expectedUser = process.env.ADMIN_USERNAME || 'admin';
  const equal = (a: string, b: string) => { const x=Buffer.from(a), y=Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x,y); };
  if (cleanUser === expectedUser.toLowerCase() && equal(String(password), adminPass)) {
    matchedUser = {id:'user_admin',username:expectedUser,displayName:'Administrador Nelyess',role:'administrador',status:'activo',createdAt:new Date().toISOString()};
  }

  if (!matchedUser) {
    res.status(401).json({ error: 'Usuario o contraseña incorrectos. Verifique sus credenciales de acceso.' });
    return;
  }

  const token = generateToken();
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  activeSessions.set(token, { token, user: matchedUser, expiresAt });

  res.json({
    success: true,
    token,
    user: matchedUser,
  });
});

app.get('/api/auth/session', (req: Request, res: Response) => {
  const user = authenticateRequest(req);
  if (!user) {
    res.json({ authenticated: false, user: null });
  } else {
    res.json({ authenticated: true, user });
  }
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    activeSessions.delete(token);
  }
  res.json({ success: true });
});

// --- PROTECTED ADMIN API ROUTES ---
app.post('/api/admin/entries/:collection', requireAuth(), (req: Request, res: Response) => {
 const collection = req.params.collection as 'learning' | 'fixedPosts' | 'historicalArchive';
 if (!['learning','fixedPosts','historicalArchive'].includes(collection)) {res.status(400).json({error:'Colección no válida'});return;}
 const item=req.body;
 if (!item || typeof item.title !== 'string' || !item.title.trim()) {res.status(400).json({error:'El título es obligatorio'});return;}
 for (const field of ['driveUrl','documentUrl','driveFolderUrl']) if(item[field]) {
   try {if(new URL(item[field]).protocol !== 'https:') throw new Error();} catch {res.status(400).json({error:'Use enlaces HTTPS válidos'});return;}
 }
 if (collection === 'historicalArchive' && !/^\d{4}-\d{2}-\d{2}$/.test(item.eventDate || '')) {res.status(400).json({error:'Indique una fecha válida'});return;}
 if (collection !== 'historicalArchive' && !['borrador','publicado','archivado','papelera'].includes(item.editorialStatus)) {res.status(400).json({error:'Estado editorial inválido'});return;}
 try {res.json({success:true,item:dbStore.saveEntry(collection,item,(req as any).user)});} catch {res.status(500).json({error:'No fue posible guardar'});}
});


// Get all shared data (includes drafts, trash, internal documents, reports, users, logs)
app.get('/api/admin/all-data', requireAuth(['editor', 'administrador']), (req: Request, res: Response) => {
  const user = (req as any).user as UserAccount;
  const data = dbStore.getAllData(user);
  res.json(data);
});

// News
app.post('/api/admin/news', requireAuth(['editor', 'administrador']), (req: Request, res: Response) => {
  const user = (req as any).user as UserAccount;
  if(req.body.driveUrl) { try {if(new URL(req.body.driveUrl).protocol !== 'https:')throw new Error();} catch {res.status(400).json({error:'Enlace HTTPS inválido'});return;} }
  const saved = dbStore.saveNews(req.body, user);
  res.json({ success: true, item: saved });
});

app.delete('/api/admin/news/:id', requireAuth(['editor', 'administrador']), (req: Request, res: Response) => {
  const user = (req as any).user as UserAccount;
  const permanent = req.query.permanent === 'true';
  const ok = dbStore.deleteNews(req.params.id, user, permanent);
  res.json({ success: ok });
});

// Documents
app.post('/api/admin/documents', requireAuth(['editor', 'administrador']), (req: Request, res: Response) => {
  const user = (req as any).user as UserAccount;
  const saved = dbStore.saveDocument(req.body, user);
  res.json({ success: true, item: saved });
});

app.delete('/api/admin/documents/:id', requireAuth(['editor', 'administrador']), (req: Request, res: Response) => {
  const user = (req as any).user as UserAccount;
  const permanent = req.query.permanent === 'true';
  const ok = dbStore.deleteDocument(req.params.id, user, permanent);
  res.json({ success: ok });
});

// Devices
app.post('/api/admin/devices', requireAuth(['editor', 'administrador']), (req: Request, res: Response) => {
  const user = (req as any).user as UserAccount;
  const saved = dbStore.saveDevice(req.body, user);
  res.json({ success: true, item: saved });
});

app.delete('/api/admin/devices/:id', requireAuth(['editor', 'administrador']), (req: Request, res: Response) => {
  const user = (req as any).user as UserAccount;
  const permanent = req.query.permanent === 'true';
  const ok = dbStore.deleteDevice(req.params.id, user, permanent);
  res.json({ success: ok });
});

// Plans
app.post('/api/admin/plans', requireAuth(['editor', 'administrador']), (req: Request, res: Response) => {
  const user = (req as any).user as UserAccount;
  const saved = dbStore.savePlan(req.body, user);
  res.json({ success: true, item: saved });
});

app.delete('/api/admin/plans/:id', requireAuth(['editor', 'administrador']), (req: Request, res: Response) => {
  const user = (req as any).user as UserAccount;
  const permanent = req.query.permanent === 'true';
  const ok = dbStore.deletePlan(req.params.id, user, permanent);
  res.json({ success: ok });
});

// Categories
app.post('/api/admin/categories', requireAuth(['administrador']), (req: Request, res: Response) => {
  const user = (req as any).user as UserAccount;
  const saved = dbStore.saveCategory(req.body, user);
  res.json({ success: true, item: saved });
});

app.post('/api/admin/categories/delete-or-reassign', requireAuth(['administrador']), (req: Request, res: Response) => {
  const user = (req as any).user as UserAccount;
  const { categoryId, reassignToId } = req.body;
  if (!categoryId) {
    res.status(400).json({ error: 'Falta categoryId' });
    return;
  }
  const result = dbStore.deleteOrReassignCategory(categoryId, reassignToId, user);
  res.json({ success: true, ...result });
});

// Navigation Menu
app.post('/api/admin/navigation', requireAuth(['administrador']), (req: Request, res: Response) => {
  const user = (req as any).user as UserAccount;
  const items = dbStore.updateMenuItems(req.body, user);
  res.json({ success: true, items });
});

// Header Branding & Announcements
app.post('/api/admin/header-branding', requireAuth(['administrador']), (req: Request, res: Response) => {
  const user = (req as any).user as UserAccount;
  const branding = dbStore.updateHeaderBranding(req.body, user);
  res.json({ success: true, branding });
});

// Blocks
app.post('/api/admin/blocks', requireAuth(['administrador']), (req: Request, res: Response) => {
  const user = (req as any).user as UserAccount;
  const blocks = dbStore.updateBlocks(req.body, user);
  res.json({ success: true, blocks });
});

// Theme
app.post('/api/admin/theme', requireAuth(['administrador']), (req: Request, res: Response) => {
  const user = (req as any).user as UserAccount;
  const theme = dbStore.updateTheme(req.body, user);
  res.json({ success: true, theme });
});

// Trash
app.post('/api/admin/trash/restore', requireAuth(['editor', 'administrador']), (req: Request, res: Response) => {
  const user = (req as any).user as UserAccount;
  const { type, id } = req.body;
  const ok = dbStore.restoreFromTrash(type, id, user);
  res.json({ success: ok });
});

app.post('/api/admin/trash/empty', requireAuth(['administrador']), (req: Request, res: Response) => {
  const user = (req as any).user as UserAccount;
  const ok = dbStore.emptyTrash(user);
  res.json({ success: ok });
});

// Audit restore snapshot
app.post('/api/admin/audit/restore-version', requireAuth(['administrador']), (req: Request, res: Response) => {
  const user = (req as any).user as UserAccount;
  const { logId } = req.body;
  const ok = dbStore.restoreVersionSnapshot(logId, user);
  res.json({ success: ok });
});

// Reports status
app.patch('/api/admin/reports/:id', requireAuth(['editor', 'administrador']), (req: Request, res: Response) => {
  const user = (req as any).user as UserAccount;
  const { status, resolutionNote } = req.body;
  const ok = dbStore.updateReportStatus(req.params.id, status, resolutionNote, user);
  res.json({ success: ok });
});

// Users
app.post('/api/admin/users', requireAuth(['administrador']), (req: Request, res: Response) => {
  const user = (req as any).user as UserAccount;
  const saved = dbStore.saveUser(req.body, user);
  res.json({ success: !!saved, user: saved });
});

// Backups
app.get('/api/admin/backup/export', requireAuth(['editor', 'administrador']), (_req: Request, res: Response) => {
  const data = dbStore.exportBackup();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="nelyess_capacita_backup.json"');
  res.send(JSON.stringify(data, null, 2));
});

app.post('/api/admin/backup/import', requireAuth(['administrador']), (req: Request, res: Response) => {
  const user = (req as any).user as UserAccount;
  const result = dbStore.importBackup(req.body, user);
  res.json(result);
});

app.use('/api', (err: any, _req: Request, res: Response, _next: NextFunction) => {res.status(500).json({error:err.message || 'Error del servidor'});});

// --- VITE MIDDLEWARE INTEGRATION ---
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Nelyess Capacita] Servidor full-stack ejecutándose en http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error al iniciar el servidor:', err);
  process.exit(1);
});
