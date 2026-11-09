export function safeLink(value: string): string | null {
 try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null; } catch {return null;}
}
export function drivePreview(value: string): string | null {
 const safe=safeLink(value); if(!safe) return null;
 const u=new URL(safe); let id:string|undefined; let target:string|undefined;
 if(u.hostname === 'drive.google.com') {
  if(u.pathname.includes('/folders/')) return null;
  id=u.pathname.match(/^\/file\/d\/([\w-]+)/)?.[1] || u.searchParams.get('id') || undefined;
  if(id && /^[\w-]+$/.test(id)) target=`https://drive.google.com/file/d/${id}/preview`;
 } else if(u.hostname === 'docs.google.com') {
  const m=u.pathname.match(/^\/(document|spreadsheets|presentation)\/d\/([\w-]+)/);
  if(m) target=`https://docs.google.com/${m[1]}/d/${m[2]}/preview`;
 }
 if(!target) return null;
 const out=new URL(target); const key=u.searchParams.get('resourcekey'); if(key) out.searchParams.set('resourcekey',key);
 return out.href;
}
