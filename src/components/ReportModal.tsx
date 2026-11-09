import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Send, X, ShieldAlert } from 'lucide-react';
import { apiClient } from '../utils/apiClient';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemType: 'noticia' | 'equipo' | 'plan' | 'documento' | 'historico';
  itemId: string;
  itemTitle: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  itemType,
  itemId,
  itemTitle,
}) => {
  const [reportedBy, setReportedBy] = useState('');
  const [advisorContact, setAdvisorContact] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await apiClient.submitReport({
        itemId,
        itemType,
        itemTitle,
        reportedBy: reportedBy.trim() || 'Asesor Comercial Bitel',
        advisorContact: advisorContact.trim() || undefined,
        description: description.trim(),
      });
      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al enviar reporte');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setDescription('');
    setReportedBy('');
    setAdvisorContact('');
    setErrorMsg(null);
    onClose();
  };

  const itemTypeLabels = {
    noticia: 'Novedad / Comunicado',
    equipo: 'Equipo / Precio',
    plan: 'Plan Comercial',
    documento: 'Documento / Archivo',
    historico: 'Archivo Histórico',
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-500 rounded-lg shadow-sm">
              <ShieldAlert className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Reportar dato incorrecto
              </h3>
              <p className="text-xs text-slate-300">
                Notifica al equipo de capacitación de Bitel para corregir la información
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-900">¡Reporte Enviado con Éxito!</h4>
              <p className="text-sm text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
                Gracias por ayudarnos a mantener la información comercial de Bitel precisa y actualizada. El capacitador revisará la observación en el centro de administración.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={handleResetAndClose}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl transition-colors shadow-md"
              >
                Entendido, volver
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                {itemTypeLabels[itemType]}
              </span>
              <p className="text-sm font-bold text-slate-900 line-clamp-2">
                {itemTitle}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                ¿Qué dato no coincide o requiere corrección? <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ejemplo: El precio en Plan B-Smart 49.90 cambió hoy a S/ 499 según el correo comercial de la mañana..."
                className="w-full p-3 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-600">
                  Tu nombre o código de asesor (opcional)
                </label>
                <input
                  type="text"
                  value={reportedBy}
                  onChange={(e) => setReportedBy(e.target.value)}
                  placeholder="Ej. Juan Pérez (Punto Centro)"
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-600">
                  Teléfono / WhatsApp (opcional)
                </label>
                <input
                  type="text"
                  value={advisorContact}
                  onChange={(e) => setAdvisorContact(e.target.value)}
                  placeholder="Ej. 920 123 456"
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                Este reporte se almacenará en el centro de administración compartido para su verificación.
              </span>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !description.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-amber-400 font-bold text-xs rounded-xl transition-all shadow-md"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
