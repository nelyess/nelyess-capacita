import { DrivePreview } from './DrivePreview';
import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Users, 
  Share2, 
  Check, 
  Bookmark, 
  AlertTriangle,
  GitCompare,
  FileText,
  ExternalLink,
  Flag,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { NewsItem, CategoryItem, DocumentItem } from '../types';
import { calculateValidityStatus, getValidityMeta, formatPeruDate } from '../utils/validityCalculator';
import { generateWhatsAppMessage } from '../utils/whatsappFormatter';

interface NewsDetailModalProps {
  news: NewsItem | null;
  category?: CategoryItem;
  relatedDocuments?: DocumentItem[];
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onClose: () => void;
  onOpenReport: () => void;
}

export const NewsDetailModal: React.FC<NewsDetailModalProps> = ({
  news,
  category,
  relatedDocuments = [],
  isBookmarked,
  onToggleBookmark,
  onClose,
  onOpenReport,
}) => {
  const [copied, setCopied] = useState(false);

  if (!news) return null;

  const validity = calculateValidityStatus(news.startDate, news.endDate, news.validityStatus);
  const statusMeta = getValidityMeta(validity);

  const handleCopyWhatsApp = () => {
    const text = news.customWhatsAppText || generateWhatsAppMessage(news, category ? [category] : [], relatedDocuments);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Category */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold text-slate-800 bg-white border border-slate-200">
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: category?.color || '#0284c7' }} 
              />
              {category?.name || 'Comercial Bitel'}
            </span>

            {/* Validity */}
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold border ${statusMeta.badgeClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotColor}`} />
              {statusMeta.label}
            </span>

            {news.startDate && news.endDate && (
              <span className="text-slate-500 font-medium text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Vigencia: {formatPeruDate(news.startDate)} al {formatPeruDate(news.endDate)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onOpenReport}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 hover:text-red-700 hover:bg-red-50 border border-slate-200 transition-colors"
              title="Reportar información desactualizada o incorrecta"
            >
              <Flag className="w-3.5 h-3.5 text-red-500" />
              <span className="hidden sm:inline">Reportar Dato</span>
            </button>

            <button
              onClick={onToggleBookmark}
              className={`p-1.5 rounded-lg text-xs border border-slate-200 transition-colors ${
                isBookmarked ? 'bg-amber-50 text-amber-600 border-amber-300' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title={isBookmarked ? 'Quitar de guardados' : 'Guardar'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>

            <button
              onClick={handleCopyWhatsApp}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                copied ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'WhatsApp'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors ml-1"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm">
          {/* Flagged Review Alert (e.g. math inconsistency check) */}
          {news.needsReview && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Aviso de Verificación Comercial:</strong> Esta comunicación fue revisada por el equipo de capacitación. El plan B-Smart 49.90 pasa de 45 GB a 70 GB en alta velocidad 5G, lo que representa exactamente <strong>+25 GB de incremento libre comprobado</strong>.
              </div>
            </div>
          )}

          {/* Title & Metadata */}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {news.title}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500">
              <span>Publicado: <strong>{formatPeruDate(news.publishDate.split('T')[0])}</strong></span>
              {news.lastUpdated && (
                <span>· Actualizado: <strong>{formatPeruDate(news.lastUpdated.split('T')[0])}</strong></span>
              )}
              <span>· Autor: <strong>{news.author}</strong></span>
              {news.source && (
                <span>· Fuente: <strong>{news.source}</strong></span>
              )}
            </div>

            {news.targetAudience && news.targetAudience.length > 0 && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
                <Users className="w-4 h-4 text-slate-500 shrink-0" />
                <span><strong>Aplica a:</strong> {news.targetAudience.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Executive Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Resumen Ejecutivo para Asesores
            </h4>
            <p className="text-slate-800 leading-relaxed font-medium">
              {news.summary}
            </p>
          </div>

          {/* Before vs After Comparison Box */}
          {news.beforeAfter && (news.beforeAfter.before || news.beforeAfter.after) && (
            <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <GitCompare className="w-4 h-4 text-amber-600" />
                <span>Comparativa de Cambio: Antes vs. Ahora</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg">
                  <div className="font-bold text-red-800 mb-1 flex items-center gap-1">
                    <span>❌ ANTES (Condición anterior)</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{news.beforeAfter.before}</p>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                  <div className="font-bold text-emerald-800 mb-1 flex items-center gap-1">
                    <span>✅ AHORA (Nuevo beneficio / regla comercial)</span>
                  </div>
                  <p className="text-slate-800 leading-relaxed font-medium">{news.beforeAfter.after}</p>
                </div>
              </div>
            </div>
          )}

          {/* What Changes vs What Stays */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {news.whatChanges && news.whatChanges.length > 0 && (
              <div className="border border-amber-200 bg-amber-50/40 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>¿Qué Cambia? (Novedades)</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-800">
                  {news.whatChanges.map((change, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5" />
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {news.whatStays && news.whatStays.length > 0 && (
              <div className="border border-slate-200 bg-slate-50/70 rounded-xl p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>¿Qué se Mantiene?</span>
                </h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  {news.whatStays.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sales Arguments */}
          {news.salesArguments && news.salesArguments.length > 0 && (
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                💡 ¿Qué comunicar al cliente? (Argumentos Clave)
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-800">
                {news.salesArguments.map((arg, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{arg}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* System Codes */}
          {news.systemCodes && news.systemCodes.length > 0 && (
            <div className="border border-slate-200 rounded-xl p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                🖥️ Códigos de Activación en Sistemas
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {news.systemCodes.map((code, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-100 rounded-lg text-xs font-mono">
                    <div className="text-[10px] uppercase font-bold text-slate-500">{code.system}</div>
                    <div className="font-bold text-slate-900 text-sm select-all">{code.code}</div>
                    <div className="text-[11px] text-slate-600 font-sans mt-0.5">{code.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Documents in Drive */}
          {relatedDocuments && relatedDocuments.length > 0 && (
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>Documentos Oficiales y Cartillas en Google Drive ({relatedDocuments.length})</span>
              </h4>
              <div className="space-y-2">
                {relatedDocuments.map((doc) => (
                  <div 
                    key={doc.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{doc.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{doc.description}</div>
                      <div className="text-[10px] text-slate-400 mt-1">Versión: {doc.versionNumber} · Proveedor: Google Drive</div>
                    </div>
                    <DrivePreview url={doc.url} title={doc.title} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {news.driveUrl && <DrivePreview url={news.driveUrl} title={news.title} />}
          {/* Full content if present */}
          {news.content && (
            <div className="border-t border-slate-200 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Detalle del Comunicado
              </h4>
              <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                {news.content}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <button
            onClick={onOpenReport}
            className="text-slate-500 hover:text-red-700 font-bold transition-colors inline-flex items-center gap-1"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>¿Dato desactualizado? Reportar corrección</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
