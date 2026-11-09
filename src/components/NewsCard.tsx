import { DrivePreview } from './DrivePreview';
import React, { useState } from 'react';
import { 
  Calendar, 
  Users, 
  ExternalLink, 
  Bookmark, 
  Share2, 
  Check, 
  AlertTriangle,
  ArrowRight,
  GitCompare,
  Edit3,
  FileText
} from 'lucide-react';
import { NewsItem, CategoryItem, DocumentItem } from '../types';
import { calculateValidityStatus, getValidityMeta, formatPeruDate } from '../utils/validityCalculator';
import { generateWhatsAppMessage } from '../utils/whatsappFormatter';

interface NewsCardProps {
  news: NewsItem;
  category?: CategoryItem;
  relatedDocuments?: DocumentItem[];
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onOpenDetail: () => void;
  onOpenReport: () => void;
  quickEditMode?: boolean;
  onQuickEdit?: () => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  news,
  category,
  relatedDocuments = [],
  isBookmarked,
  onToggleBookmark,
  onOpenDetail,
  onOpenReport,
  quickEditMode,
  onQuickEdit,
}) => {
  const [copied, setCopied] = useState(false);

  const validity = calculateValidityStatus(news.startDate, news.endDate, news.validityStatus);
  const statusMeta = getValidityMeta(validity);

  const handleCopyWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = news.customWhatsAppText || generateWhatsAppMessage(news, category ? [category] : [], relatedDocuments);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const firstDocument = relatedDocuments.length > 0 ? relatedDocuments[0] : null;

  return (
    <article className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
      {/* Top Meta Bar */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Badges Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Category Tag */}
            <span 
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold text-slate-800 bg-slate-100 border border-slate-200"
            >
              <span 
                className="w-1.5 h-1.5 rounded-full" 
                style={{ backgroundColor: category?.color || '#0284c7' }} 
              />
              {category?.name || 'Comercial Bitel'}
            </span>

            {/* Validity Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${statusMeta.badgeClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotColor}`} />
              {statusMeta.label}
            </span>

            {/* Before/After Diff Badge */}
            {news.beforeAfter && (news.beforeAfter.before || news.beforeAfter.after) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <GitCompare className="w-3 h-3 text-amber-600" />
                <span>Antes/Ahora</span>
              </span>
            )}

            {/* Urgent Notice Badge */}
            {news.urgency === 'urgente' && validity === 'vigente' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-black bg-red-100 text-red-800 border border-red-300 uppercase tracking-wider animate-pulse">
                <AlertTriangle className="w-3 h-3 text-red-600" />
                <span>Urgente</span>
              </span>
            )}
          </div>

          {/* Quick Edit & Bookmark Actions */}
          <div className="flex items-center gap-1">
            {quickEditMode && onQuickEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickEdit();
                }}
                className="p-1.5 text-slate-700 bg-amber-100 hover:bg-amber-200 rounded-lg text-xs font-bold transition-colors"
                title="Editar publicación"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-900" />
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark();
              }}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                isBookmarked 
                  ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' 
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
              title={isBookmarked ? 'Quitar de guardados' : 'Guardar publicación'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 
          onClick={onOpenDetail}
          className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug group-hover:text-amber-600 transition-colors cursor-pointer mb-2"
        >
          {news.title}
        </h3>

        {/* What Changed Highlight Box */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 my-2 text-xs">
          <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1">
            <span>¿Qué cambió?</span>
          </div>
          <p className="text-slate-700 line-clamp-2 leading-relaxed">
            {news.whatChanges && news.whatChanges.length > 0 ? news.whatChanges[0] : news.summary}
          </p>

          {news.targetAudience && news.targetAudience.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-start gap-1.5 text-[11px] text-slate-600">
              <Users className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
              <span className="line-clamp-1">
                <strong>Aplica a:</strong> {news.targetAudience.join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Validity Dates */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-auto pt-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">
            {news.startDate && news.endDate ? (
              <>Del <strong>{formatPeruDate(news.startDate)}</strong> al <strong>{formatPeruDate(news.endDate)}</strong></>
            ) : (
              news.effectiveDate
            )}
          </span>
        </div>
      </div>

      {/* Card Actions Bottom Row */}
      <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDetail}
            className="inline-flex items-center gap-1 font-bold text-slate-900 hover:text-amber-700 transition-colors"
          >
            <span>Ver detalle</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {news.driveUrl && <DrivePreview url={news.driveUrl} title={news.title} />}
          {firstDocument && (
            <DrivePreview url={firstDocument.url} title={firstDocument.title} />
          )}
        </div>

        <button
          onClick={handleCopyWhatsApp}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-xs transition-colors shrink-0 ${
            copied
              ? 'bg-emerald-600 text-white'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
          }`}
          title="Copiar formato WhatsApp para asesores"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Copiado</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
};
