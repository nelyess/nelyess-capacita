import React, { useState } from 'react';
import { 
  Smartphone, 
  Search, 
  Check, 
  Share2, 
  Flag, 
  ExternalLink, 
  GitCompare, 
  X, 
  Edit3, 
  Layers, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { DeviceProduct, DocumentItem } from '../types';
import { generateDevicePricesWhatsApp } from '../utils/whatsappFormatter';

interface DeviceCatalogViewProps {
  devices: DeviceProduct[];
  documents?: DocumentItem[];
  onOpenReport: (item: { id: string; title: string; type: 'equipo' }) => void;
  quickEditMode?: boolean;
  onQuickEditDevice?: (device: DeviceProduct) => void;
  onOpenCreateDevice?: () => void;
}

export const DeviceCatalogView: React.FC<DeviceCatalogViewProps> = ({
  devices,
  documents = [],
  onOpenReport,
  quickEditMode,
  onQuickEditDevice,
  onOpenCreateDevice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [comparedDeviceIds, setComparedDeviceIds] = useState<string[]>([]);
  const [showComparatorModal, setShowComparatorModal] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const brands = ['all', 'Samsung', 'Apple', 'Xiaomi', 'Honor', 'Motorola', 'ZTE', 'Otros'];
  const tiers = [
    { id: 'all', label: 'Todas las gamas' },
    { id: 'gama_alta', label: 'Gama Alta' },
    { id: 'gama_media', label: 'Gama Media' },
    { id: 'gama_entrada', label: 'Gama Entrada' },
  ];

  const filteredDevices = devices.filter((dev) => {
    if (dev.editorialStatus && dev.editorialStatus !== 'publicado') return false;

    if (selectedBrand !== 'all' && dev.brand !== selectedBrand) return false;
    if (selectedTier !== 'all' && dev.categoryTier !== selectedTier) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = dev.name.toLowerCase().includes(q);
      const matchBrand = dev.brand.toLowerCase().includes(q);
      const matchPlan = dev.suggestedPlan.toLowerCase().includes(q);
      const matchSpecs = dev.keySpecs?.some((s) => s.toLowerCase().includes(q));
      if (!matchName && !matchBrand && !matchPlan && !matchSpecs) return false;
    }

    return true;
  });

  const toggleCompare = (id: string) => {
    if (comparedDeviceIds.includes(id)) {
      setComparedDeviceIds(comparedDeviceIds.filter((item) => item !== id));
    } else {
      if (comparedDeviceIds.length >= 3) {
        alert('Puedes comparar un máximo de 3 smartphones a la vez');
        return;
      }
      setComparedDeviceIds([...comparedDeviceIds, id]);
    }
  };

  const comparedDevices = devices.filter((d) => comparedDeviceIds.includes(d.id));

  const handleCopyAllPrices = () => {
    const text = generateDevicePricesWhatsApp(filteredDevices);
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
              <Smartphone className="w-4 h-4" />
              <span>Portafolio Comercial Bitel Perú</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Precios y Modalidades de Equipos
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Consulta precios oficiales al contado, cuota inicial, financiamiento en 12 y 18 meses, total financiado y condiciones comerciales sin imágenes de relleno.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {comparedDeviceIds.length > 0 && (
              <button
                onClick={() => setShowComparatorModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm"
              >
                <GitCompare className="w-4 h-4" />
                <span>Comparar ({comparedDeviceIds.length}/3)</span>
              </button>
            )}

            <button
              onClick={handleCopyAllPrices}
              className={`flex items-center gap-1.5 px-3.5 py-2 font-bold text-xs rounded-xl transition-all border ${
                copiedAll
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
              }`}
            >
              {copiedAll ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4 text-emerald-600" />}
              <span>{copiedAll ? 'Copiado' : 'Copiar Lista Precios'}</span>
            </button>

            {quickEditMode && onOpenCreateDevice && (
              <button
                onClick={onOpenCreateDevice}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all"
              >
                <span>+ Agregar Equipo</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {/* Brand Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-semibold mr-1">Marca:</span>
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedBrand === brand
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {brand === 'all' ? 'Todas' : brand}
                </button>
              ))}
            </div>

            {/* Tier Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs sm:ml-3 sm:pl-3 sm:border-l sm:border-slate-200">
              <span className="text-slate-400 font-semibold mr-1">Gama:</span>
              {tiers.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTier(t.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedTier === t.id
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search box */}
          <div className="w-full sm:w-64 relative shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar smartphone o plan..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Devices Grid - 100% No-image typography cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDevices.map((dev) => {
          const isComparing = comparedDeviceIds.includes(dev.id);
          const relatedDoc = documents.find((d) => d.id === dev.relatedDocumentId);

          return (
            <div 
              key={dev.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5 flex-1 flex flex-col space-y-4">
                {/* Header: Brand & Tier & Stock */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-black px-2 py-0.5 bg-slate-900 text-white rounded-md text-[11px]">
                      {dev.brand}
                    </span>
                    <span className="font-bold px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-[11px] capitalize">
                      {dev.categoryTier.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {quickEditMode && onQuickEditDevice && (
                      <button
                        onClick={() => onQuickEditDevice(dev)}
                        className="p-1 text-slate-600 bg-amber-100 hover:bg-amber-200 rounded text-xs font-bold transition-colors"
                        title="Editar equipo"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-900" />
                      </button>
                    )}

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      dev.stockStatus === 'disponible' ? 'bg-emerald-100 text-emerald-800' :
                      dev.stockStatus === 'pocas_unidades' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {dev.stockStatus === 'disponible' ? 'Disponible' :
                       dev.stockStatus === 'pocas_unidades' ? 'Pocas unidades' : 'Agotado'}
                    </span>
                  </div>
                </div>

                {/* Device Name */}
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug">
                    {dev.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {dev.highlights}
                  </p>
                </div>

                {/* Pricing & Financing Table */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold border-b border-slate-200 pb-1.5">
                    <span className="text-slate-600">Precio al Contado:</span>
                    <span className="text-slate-900 text-sm">
                      {dev.priceCash > 0 ? `S/ ${dev.priceCash.toFixed(2)}` : 'No disponible'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Cuota Inicial:</span>
                    <span className="font-bold text-amber-700">
                      {dev.priceInitialFee === 0 ? 'S/ 0.00' : `S/ ${dev.priceInitialFee.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">12 Cuotas Mensuales:</span>
                    <span className="font-semibold text-slate-800">
                      {dev.installments12 > 0 ? `S/ ${dev.installments12.toFixed(2)} /mes` : 'No disponible'}
                    </span>
                  </div>

                  {dev.installments12 > 0 && (
                    <div className="flex items-center justify-between text-[11px] text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                      <span>Total financiado (12m):</span>
                      <strong className="text-slate-900">S/ {dev.totalFinanced12.toFixed(2)}</strong>
                    </div>
                  )}

                  {dev.installments18 > 0 && (
                    <div className="flex items-center justify-between text-[11px] text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                      <span>Total financiado (18m):</span>
                      <strong className="text-slate-900">S/ {dev.totalFinanced18.toFixed(2)}</strong>
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-slate-200 pt-1.5">
                    <span className="text-slate-600">Portabilidad:</span>
                    <span className="font-bold text-emerald-700">
                      {dev.pricePortabilidad > 0 ? `S/ ${dev.pricePortabilidad.toFixed(2)}` : 'No disponible'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    Plan sugerido: <strong>{dev.suggestedPlan}</strong>
                  </div>
                </div>

                {/* Technical Specs List */}
                {dev.keySpecs && dev.keySpecs.length > 0 && (
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                      Especificaciones Clave:
                    </div>
                    <ul className="space-y-1 text-slate-600">
                      {dev.keySpecs.slice(0, 4).map((spec, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                          <span className="line-clamp-1">{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Commercial Condition Notice */}
                {dev.subjectToStock && (
                  <div className="text-[11px] text-slate-500 italic flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Sujeto a stock disponible en tiendas Bitel</span>
                  </div>
                )}

                {/* Custom Fields if any */}
                {dev.customFields && dev.customFields.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 text-xs space-y-1">
                    {dev.customFields.map((cf) => (
                      <div key={cf.id} className="flex justify-between text-slate-600">
                        <span className="font-medium">{cf.label}:</span>
                        <span className="font-bold text-slate-900">{cf.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Related Document Link */}
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
                <button
                  onClick={() => toggleCompare(dev.id)}
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
                  onClick={() => onOpenReport({ id: dev.id, title: dev.name, type: 'equipo' })}
                  className="text-slate-500 hover:text-red-700 font-semibold inline-flex items-center gap-1 text-[11px]"
                  title="Reportar precio o dato desactualizado"
                >
                  <Flag className="w-3 h-3 text-slate-400" />
                  <span>Reportar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDevices.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          No se encontraron terminales con los filtros seleccionados.
        </div>
      )}

      {/* Side-by-Side Comparator Modal for up to 3 Devices */}
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
                  Comparador de Smartphones Bitel ({comparedDevices.length} seleccionados)
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
                      {comparedDevices.map((d) => (
                        <th key={d.id} className="p-3 font-black text-slate-900 text-sm w-1/4">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">{d.brand}</span>
                          {d.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-3 font-bold text-slate-700 bg-slate-50">Precio al Contado</td>
                      {comparedDevices.map((d) => (
                        <td key={d.id} className="p-3 font-black text-slate-900 text-sm">
                          {d.priceCash > 0 ? `S/ ${d.priceCash.toFixed(2)}` : 'No disponible'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-700 bg-slate-50">Cuota Inicial</td>
                      {comparedDevices.map((d) => (
                        <td key={d.id} className="p-3 font-bold text-amber-700">
                          {d.priceInitialFee === 0 ? 'S/ 0.00' : `S/ ${d.priceInitialFee.toFixed(2)}`}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-700 bg-slate-50">12 Cuotas Mensuales</td>
                      {comparedDevices.map((d) => (
                        <td key={d.id} className="p-3 font-semibold text-slate-800">
                          {d.installments12 > 0 ? `S/ ${d.installments12.toFixed(2)} /mes` : 'No disponible'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-700 bg-slate-50">Total Financiado (12m)</td>
                      {comparedDevices.map((d) => (
                        <td key={d.id} className="p-3 font-black text-slate-900">
                          S/ {d.totalFinanced12.toFixed(2)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-700 bg-slate-50">Portabilidad con Plan</td>
                      {comparedDevices.map((d) => (
                        <td key={d.id} className="p-3 text-slate-800">
                          <strong>S/ {d.pricePortabilidad.toFixed(2)}</strong> (con {d.suggestedPlan})
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-700 bg-slate-50">Renovación</td>
                      {comparedDevices.map((d) => (
                        <td key={d.id} className="p-3 text-slate-800">
                          S/ {d.priceRenovacion.toFixed(2)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-700 bg-slate-50">Especificaciones</td>
                      {comparedDevices.map((d) => (
                        <td key={d.id} className="p-3 text-slate-700">
                          <ul className="space-y-1">
                            {d.keySpecs.map((s, i) => (
                              <li key={i}>• {s}</li>
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
                onClick={() => setComparedDeviceIds([])}
                className="text-slate-600 hover:text-red-700 font-bold"
              >
                Limpiar selección
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
