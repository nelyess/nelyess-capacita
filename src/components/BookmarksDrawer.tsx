import React from 'react';
import { Bookmark, X, ArrowRight, Trash2, ExternalLink } from 'lucide-react';
import { NewsItem, BitelPlan, CategoryItem } from '../types';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarkedNews: NewsItem[];
  bookmarkedPlans: BitelPlan[];
  categories: CategoryItem[];
  onRemoveBookmark: (id: string) => void;
  onOpenNewsDetail: (news: NewsItem) => void;
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  onClose,
  bookmarkedNews,
  bookmarkedPlans,
  categories,
  onRemoveBookmark,
  onOpenNewsDetail,
}) => {
  if (!isOpen) return null;

  const totalCount = bookmarkedNews.length + bookmarkedPlans.length;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl border-l border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h3 className="font-black text-slate-900 text-base">
              Elementos Guardados ({totalCount})
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {bookmarkedNews.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                Novedades Guardadas ({bookmarkedNews.length}):
              </h4>
              {bookmarkedNews.map((item) => (
                <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <strong className="text-slate-900 line-clamp-2">{item.title}</strong>
                    <button
                      onClick={() => onRemoveBookmark(item.id)}
                      className="text-slate-400 hover:text-red-600 p-1 shrink-0"
                      title="Quitar de guardados"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{item.summary}</p>
                  <button
                    onClick={() => {
                      onOpenNewsDetail(item);
                      onClose();
                    }}
                    className="text-amber-700 font-bold hover:underline inline-flex items-center gap-1 text-[11px]"
                  >
                    <span>Ver detalle</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {totalCount === 0 && (
            <div className="py-12 text-center text-slate-500">
              <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold">No tienes elementos guardados.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Haz clic en el icono de marcador en cualquier novedad para guardarla aquí.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
