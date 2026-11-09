import React, { useState } from 'react';
import { 
  Wifi, 
  Smartphone, 
  Check, 
  Share2, 
  Flag, 
  GitCompare, 
  X, 
  Edit3, 
  FileText, 
  ExternalLink,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { BitelPlan, DocumentItem } from '../types';

interface PlanesViewProps {
  plans: BitelPlan[];
  documents?: DocumentItem[];
  onOpenReport: (item: { id: string; title: string; type: 'plan' }) => void;
  quickEditMode?: boolean;
  onQuickEditPlan?: (plan: BitelPlan) => void;
  onOpenCreatePlan?: () => void;
}

export const PlanesView: React.FC<PlanesViewProps> = ({
  plans,
  documents = [],
  onOpenReport,
  quickEditMode,
  onQuickEditPlan,
  onOpenCreatePlan,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [comparedPlanIds, setComparedPlanIds] = useState<string[]>([]);
  const [showComparatorModal, setShowComparatorModal] = useState(false);
  const [copiedPlanId, setCopiedPlanId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'Todos los planes' },
    { id: 'pospago_movil', label: 'Pospago B-Smart' },
    { id: 'fibra_hogar', label: 'Fibra Óptica Hogar' },
    { id: 'prepago_timi', label: 'Prepago TiMi' },
  ];

  const filteredPlans = plans.filter((plan) => {
    if (plan.editorialStatus && plan.editorialStatus !== 'publicado') return false;
    if (selectedCategory !== 'all' && plan.category !== selectedCategory) return false;
    return true;
  });

  const toggleCompare = (id: string) => {
    if (comparedPlanIds.includes(id)) {
      setComparedPlanIds(comparedPlanIds.filter((p) => p !== id));
    } else {
      if (comparedPlanIds.length >= 3) {
        alert('Puedes comparar un máximo de 3 planes simultáneamente');
        return;
      }
      setComparedPlanIds([...comparedPlanIds, id]);
    }
  };

  const comparedPlans = plans.filter((p) => comparedPlanIds.includes(p.id));

  const handleCopyPitch = (plan: BitelPlan) => {
    const text = `🇵🇪 *${plan.name.toUpperCase()} - BITEL PERÚ* 🇵🇪\n` +
      `💰 *Tarifa Mensual:* S/ ${plan.monthlyFee.toFixed(2)}/mes\n\n` +
      `🚀 *Internet:* ${plan.dataHighSpeed}\n` +
      `🌐 *Consumo posterior:* ${plan.dataThen}\n` +
      `📱 *Apps Ilimitadas:* ${plan.unlimitedApps.join(', ')}\n` +
      `📞 *Llamadas:* ${plan.callsAndSms}\n` +
      `✈️ *Roaming:* ${plan.roamingLatam}\n\n` +
      `👉 _Solicita tu portabilidad con chip bonificado en tiendas Bitel._`;

    navigator.clipboard.writeText(text);
    setCopiedPlanId(plan.id);
    setTimeout(() => setCopiedPlanId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
              <Wifi className="w-4 h-4" />
              <span>Matriz Tarifaria Oficial Bitel Perú</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Planes Móviles B-Smart y Fibra Hogar
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Consulta beneficios de alta velocidad 5G, redes sociales libres, roaming y condiciones comerciales sin imágenes ni adornos innecesarios.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {comparedPlanIds.length > 0 && (
              <button
                onClick={() => setShowComparatorModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm"
              >
                <GitCompare className="w-4 h-4" />
                <span>Comparar ({comparedPlanIds.length}/3)</span>
              </button>
            )}

            {quickEditMode && onOpenCreatePlan && (
              <button
                onClick={onOpenCreatePlan}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all"
              >
                <span>+ Agregar Plan</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-5 pt-4 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold mr-1">Línea de Servicio:</span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Plans Grid - 100% No-image typography cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPlans.map((plan) => {
          const isComparing = comparedPlanIds.includes(plan.id);
          const isCopied = copiedPlanId === plan.id;
          const relatedDoc = documents.find((d) => d.id === plan.relatedDocumentId);

          return (
            <div 
              key={plan.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5 flex-1 flex flex-col space-y-4">
                {/* Header: Category & Fee */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 block">
                      {plan.category === 'pospago_movil' ? 'Pospago Móvil' :
                       plan.category === 'fibra_hogar' ? 'Bitel Fibra Hogar' : 'Prepago'}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
                      {plan.name}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-900 leading-none">
                      S/ {plan.monthlyFee.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold block">mensual</span>
                  </div>
                </div>

                {/* High Speed Data Pill */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                  <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{plan.dataHighSpeed}</span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Posterior: <strong>{plan.dataThen}</strong>
                  </div>
                </div>

                {/* Unlimited Apps */}
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                    Apps Ilimitadas:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {plan.unlimitedApps.map((app, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-semibold border border-slate-200">
                        {app}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Calls & SMS */}
                <div className="text-xs text-slate-700">
                  <span className="font-bold">Llamadas: </span>
                  <span>{plan.callsAndSms}</span>
                </div>

                {/* Roaming Benefit */}
                <div className="text-xs text-slate-700 bg-amber-50/60 border border-amber-200/80 rounded-lg p-2.5">
                  <span className="font-bold text-amber-900">Roaming Internacional: </span>
                  <span className="text-slate-800">{plan.roamingLatam}</span>
                </div>

                {/* Restrictions */}
                {plan.restrictions && plan.restrictions.length > 0 && (
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-slate-600 text-[11px] uppercase tracking-wider">
                      Condiciones & Restricciones:
                    </div>
                    <ul className="space-y-1 text-slate-600 text-[11px]">
                      {plan.restrictions.map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Related Document */}
                {relatedDoc && (
                  <div className="pt-2 border-t border-slate-100 text-xs">
                    <a
                      href={relatedDoc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-slate-700 hover:text-amber-700 font-bold"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-600" />
                      <span className="truncate">{relatedDoc.title}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleCompare(plan.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                      isComparing
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                    }`}
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    <span>{isComparing ? 'Seleccionado' : 'Comparar'}</span>
                  </button>

                  <button
                    onClick={() => handleCopyPitch(plan)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold transition-all border ${
                      isCopied
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300'
                    }`}
                    title="Copiar resumen del plan para enviar a cliente"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5 text-emerald-600" />}
                    <span>{isCopied ? 'Copiado' : 'Speech WhatsApp'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {quickEditMode && onQuickEditPlan && (
                    <button
                      onClick={() => onQuickEditPlan(plan)}
                      className="p-1.5 text-slate-700 bg-amber-100 hover:bg-amber-200 rounded-lg text-xs font-bold"
                      title="Editar plan"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-900" />
                    </button>
                  )}

                  <button
                    onClick={() => onOpenReport({ id: plan.id, title: plan.name, type: 'plan' })}
                    className="text-slate-500 hover:text-red-700 font-semibold inline-flex items-center gap-1 text-[11px]"
                  >
                    <Flag className="w-3 h-3 text-slate-400" />
                    <span className="hidden sm:inline">Reportar</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Side-by-Side Comparator Modal for up to 3 Plans */}
      {showComparatorModal && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-slate-900 text-base sm:text-lg">
                  Comparador de Planes Comerciales Bitel ({comparedPlans.length} seleccionados)
                </h3>
              </div>
              <button
                onClick={() => setShowComparatorModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b-2 border-slate-300">
                      <th className="p-3 text-slate-500 font-bold uppercase w-1/4">Característica</th>
                      {comparedPlans.map((p) => (
                        <th key={p.id} className="p-3 font-black text-slate-900 text-sm w-1/4">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">{p.category}</span>
                          {p.name}
                          <span className="block text-amber-600 font-bold text-base mt-0.5">S/ {p.monthlyFee.toFixed(2)}/mes</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-3 font-bold text-slate-700 bg-slate-50">Internet Alta Velocidad (5G)</td>
                      {comparedPlans.map((p) => (
                        <td key={p.id} className="p-3 font-bold text-slate-900">
                          {p.dataHighSpeed}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-700 bg-slate-50">Consumo Posterior (Ilimitado)</td>
                      {comparedPlans.map((p) => (
                        <td key={p.id} className="p-3 text-slate-700">
                          {p.dataThen}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-700 bg-slate-50">Apps Ilimitadas</td>
                      {comparedPlans.map((p) => (
                        <td key={p.id} className="p-3 text-slate-800">
                          <div className="flex flex-wrap gap-1">
                            {p.unlimitedApps.map((app, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] border border-slate-200">
                                {app}
                              </span>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-700 bg-slate-50">Llamadas y SMS</td>
                      {comparedPlans.map((p) => (
                        <td key={p.id} className="p-3 text-slate-800">
                          {p.callsAndSms}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-700 bg-slate-50">Beneficio Roaming</td>
                      {comparedPlans.map((p) => (
                        <td key={p.id} className="p-3 text-slate-800 font-semibold">
                          {p.roamingLatam}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-700 bg-slate-50">Vigencia Comercial</td>
                      {comparedPlans.map((p) => (
                        <td key={p.id} className="p-3 text-slate-600">
                          {p.effectivePeriod}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-700 bg-slate-50">Restricciones Clave</td>
                      {comparedPlans.map((p) => (
                        <td key={p.id} className="p-3 text-slate-600 text-[11px]">
                          <ul className="space-y-1">
                            {p.restrictions.map((r, i) => (
                              <li key={i}>• {r}</li>
                            ))}
                          </ul>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs">
              <button
                onClick={() => setComparedPlanIds([])}
                className="text-slate-600 hover:text-red-700 font-bold"
              >
                Limpiar comparación
              </button>
              <button
                onClick={() => setShowComparatorModal(false)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl"
              >
                Cerrar comparador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
