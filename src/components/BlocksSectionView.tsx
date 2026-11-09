import React from 'react';
import { 
  AlertTriangle, 
  HelpCircle, 
  GitCompare, 
  ExternalLink, 
  CheckCircle2, 
  FileText, 
  Video, 
  Sparkles,
  Info,
  ChevronDown
} from 'lucide-react';
import { BlockItem, NewsItem, DocumentItem } from '../types';

interface BlocksSectionViewProps {
  blocks: BlockItem[];
  news: NewsItem[];
  documents: DocumentItem[];
  onOpenNewsDetail: (news: NewsItem) => void;
}

export const BlocksSectionView: React.FC<BlocksSectionViewProps> = ({
  blocks,
  news,
  documents,
  onOpenNewsDetail,
}) => {
  const visibleBlocks = blocks
    .filter((b) => b.isVisible)
    .sort((a, b) => a.order - b.order);

  if (visibleBlocks.length === 0) return null;

  return (
    <div className="space-y-6">
      {visibleBlocks.map((block) => {
        switch (block.type) {
          case 'notice':
            return (
              <div 
                key={block.id}
                className="bg-amber-50 border border-amber-300 rounded-2xl p-5 text-amber-950 shadow-xs space-y-2"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
                  <h3 className="font-black text-slate-900 text-base">{block.title}</h3>
                </div>
                {block.subtitle && (
                  <div className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                    {block.subtitle}
                  </div>
                )}
                {block.content && (
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                    {block.content}
                  </p>
                )}
              </div>
            );

          case 'before_after':
            return (
              <div 
                key={block.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
                    <GitCompare className="w-4 h-4" />
                    <span>Comparativa Oficial</span>
                  </div>
                  <h3 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight">
                    {block.title}
                  </h3>
                  {block.subtitle && (
                    <p className="text-xs text-slate-500 mt-0.5">{block.subtitle}</p>
                  )}
                </div>

                {block.data && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-red-50/70 border border-red-200 rounded-xl space-y-1">
                      <div className="font-bold text-red-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                        <span>❌ ANTES (Condición anterior)</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{block.data.before}</p>
                    </div>

                    <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                      <div className="font-bold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                        <span>✅ AHORA (Nuevo beneficio)</span>
                      </div>
                      <p className="text-slate-800 leading-relaxed font-medium">{block.data.after}</p>
                    </div>
                  </div>
                )}
              </div>
            );

          case 'faq':
            return (
              <div 
                key={block.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    <span>Preguntas Frecuentes</span>
                  </div>
                  <h3 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight">
                    {block.title}
                  </h3>
                  {block.subtitle && (
                    <p className="text-xs text-slate-500 mt-0.5">{block.subtitle}</p>
                  )}
                </div>

                {block.data?.faqs && (
                  <div className="space-y-3">
                    {block.data.faqs.map((faq: any, i: number) => (
                      <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                        <div className="font-bold text-slate-900 text-sm">
                          {faq.question}
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );

          case 'training_link':
            return (
              <div 
                key={block.id}
                className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800 space-y-3"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <Video className="w-4 h-4" />
                  <span>Videocapacitación Comercial (Google Drive)</span>
                </div>

                <div>
                  <h3 className="font-black text-white text-lg tracking-tight">
                    {block.title}
                  </h3>
                  {block.subtitle && (
                    <p className="text-xs text-slate-300 mt-1">{block.subtitle}</p>
                  )}
                </div>

                {block.content && (
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {block.content}
                  </p>
                )}

                {block.data && (
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-slate-800">
                    <div className="text-slate-400 text-[11px] space-y-0.5">
                      <div>Duración: <strong>{block.data.duration}</strong></div>
                      <div>Capacitador: <strong>{block.data.instructor}</strong></div>
                    </div>

                    <a
                      href={block.data.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shrink-0"
                    >
                      <span>Abrir video en Google Drive</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            );

          case 'title_text':
          default:
            return (
              <div 
                key={block.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-2"
              >
                <h3 className="font-black text-slate-900 text-lg sm:text-xl tracking-tight">
                  {block.title}
                </h3>
                {block.subtitle && (
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {block.subtitle}
                  </div>
                )}
                {block.content && (
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {block.content}
                  </p>
                )}
              </div>
            );
        }
      })}
    </div>
  );
};
