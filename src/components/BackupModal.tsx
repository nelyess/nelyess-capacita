import React, { useState } from 'react';
import { Download, Upload, X, Check, AlertTriangle, FileText, Info } from 'lucide-react';
import { CompleteDatabaseSchema } from '../types';
import { apiClient } from '../utils/apiClient';

interface BackupModalProps {
  onClose: () => void;
  onRefreshData: () => Promise<void>;
}

export const BackupModal: React.FC<BackupModalProps> = ({ onClose, onRefreshData }) => {
  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState<CompleteDatabaseSchema | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleDownloadBackup = async () => {
    try {
      const data = await apiClient.exportBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nelyess_capacita_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Error descargando respaldo: ' + err.message);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    setPreviewData(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed || !Array.isArray(parsed.news) || !Array.isArray(parsed.categories)) {
          throw new Error('El archivo no contiene un esquema de base de datos válido de Nelyess Capacita.');
        }
        setPreviewData(parsed);
      } catch (err: any) {
        setErrorMsg('Error leyendo archivo JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (!previewData) return;
    if (!confirm('¿Restaurar esta base de datos? La información se actualizará en el servidor compartido.')) return;

    setImporting(true);
    try {
      const res = await apiClient.importBackup(previewData);
      if (res.success) {
        setSuccessMsg('Base de datos restaurada con éxito.');
        await onRefreshData();
        setTimeout(() => onClose(), 2000);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al importar');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-2xl border border-slate-200 space-y-5 text-xs overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-black text-slate-900">
              Copias de Seguridad y Restauración JSON
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning & Transparency Note */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-slate-700 leading-relaxed">
          <div className="font-bold flex items-center gap-1.5 text-slate-900 text-xs">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Alcance del Respaldo:</span>
          </div>
          <p>
            Esta exportación contiene todas las publicaciones, configuraciones, menús, terminales con precios y enlaces a documentos del portal. <strong>No incluye automáticamente los archivos de Google Drive</strong>; los documentos originales permanecen alojados en su respectivo Drive.
          </p>
        </div>

        {/* Export Action */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
          <div>
            <strong className="text-slate-900 block text-sm">Descargar Respaldo Completo</strong>
            <p className="text-slate-500 text-[11px] mt-0.5">Archivo .json con todos los datos compartidos del servidor.</p>
          </div>
          <button
            onClick={handleDownloadBackup}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl flex items-center gap-1.5 shadow-xs shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Descargar JSON</span>
          </button>
        </div>

        {/* Import Action */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div>
            <strong className="text-slate-900 block text-sm">Restaurar Respaldo con Vista Previa</strong>
            <p className="text-slate-500 text-[11px] mt-0.5">Carga un archivo JSON previamente exportado. Verás el conteo de registros antes de aplicar.</p>
          </div>

          <label className="flex items-center justify-center p-3 border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl cursor-pointer bg-white transition-colors">
            <Upload className="w-4 h-4 text-slate-500 mr-2" />
            <span className="font-bold text-slate-700">
              {fileName || 'Seleccionar archivo .json'}
            </span>
            <input type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
          </label>

          {/* Preview of incoming backup */}
          {previewData && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-emerald-950">
              <div className="font-bold flex items-center gap-1.5 text-xs text-emerald-900">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Registros detectados en el archivo:</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <div>• Novedades: <strong>{previewData.news?.length || 0}</strong></div>
                <div>• Categorías: <strong>{previewData.categories?.length || 0}</strong></div>
                <div>• Smartphones: <strong>{previewData.devices?.length || 0}</strong></div>
                <div>• Planes: <strong>{previewData.plans?.length || 0}</strong></div>
                <div>• Documentos: <strong>{previewData.documents?.length || 0}</strong></div>
                <div>• Histórico: <strong>{previewData.historicalArchive?.length || 0}</strong></div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleExecuteImport}
                  disabled={importing}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-xs"
                >
                  {importing ? 'Restaurando...' : 'Confirmar e Importar'}
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 font-bold">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl font-bold hover:bg-slate-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
