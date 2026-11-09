import test from 'node:test';
import assert from 'node:assert/strict';
import { filterNewsItems, computeNewsStats, normalizeText, FilterState } from './newsFilters';
import { generateWhatsAppMessage, generateDevicePricesWhatsApp } from './whatsappFormatter';
import { calculateValidityStatus, formatPeruDate } from './validityCalculator';
import { NewsItem, CategoryItem, DocumentItem, DeviceProduct } from '../types';

const mockCategories: CategoryItem[] = [
  {
    id: 'cat_pospago',
    name: 'Pospago B-Smart',
    slug: 'pospago-b-smart',
    description: 'Planes B-Smart',
    iconName: 'Smartphone',
    color: '#0284c7',
    order: 1,
    isPublic: true,
    isArchived: false,
    subcategories: [],
  },
  {
    id: 'cat_equipos',
    name: 'Equipos & Terminales',
    slug: 'equipos-terminales',
    description: 'Smartphones y precios',
    iconName: 'Tag',
    color: '#7c3aed',
    order: 2,
    isPublic: true,
    isArchived: false,
    subcategories: [],
  },
];

const mockDocuments: DocumentItem[] = [
  {
    id: 'doc-1',
    title: 'Cartilla_Comercial_Pospago_Noviembre.pdf',
    description: 'Cartilla de planes',
    url: 'https://drive.google.com/file/d/1A-Cartilla/view?usp=sharing',
    provider: 'google_drive',
    fileType: 'pdf',
    categoryId: 'cat_pospago',
    tags: ['Pospago'],
    documentDate: '2026-11-01',
    addedDate: '2026-11-01T10:00:00Z',
    versionNumber: 'v1.0',
    authorOrSource: 'Bitel',
    visibility: 'publico',
    status: 'vigente',
    accessCheckStatus: 'no_verificado',
    isEvidence: false,
  },
];

const mockNews: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Actualización Portafolio Pospago B-Smart con Red 5G Bitel',
    summary: 'Se incrementa la bolsa de datos en planes B-Smart desde S/ 49.90 sin costo adicional.',
    categoryId: 'cat_pospago',
    urgency: 'urgente',
    editorialStatus: 'publicado',
    publishDate: '2026-11-01T10:00:00Z',
    effectiveDate: 'Desde el 5 de Noviembre 2026',
    startDate: '2026-11-01',
    endDate: '2026-12-31',
    validityStatus: 'vigente',
    author: 'Nelyess - Capacitador Bitel',
    source: 'Boletín Comercial Bitel',
    targetAudience: ['Tiendas Propias Bitel', 'Call Center Inbound'],
    content: 'Detalle de los nuevos beneficios y códigos en SISACT.',
    whatChanges: ['Aumento de 25GB en plan B-Smart 49.90', 'Bolsa de Roaming en 10 países'],
    whatStays: ['Tarifa mensual se mantiene intacta'],
    beforeAfter: {
      before: 'Plan incluía 45GB en 4G',
      after: 'Plan incluye 70GB en alta velocidad 5G (+25GB libres comprobados)',
    },
    salesArguments: ['Mayor cantidad de gigas en alta velocidad 5G'],
    systemCodes: [{ system: 'SISACT', code: 'BIT-BSMART-49', description: 'Plan B-Smart 5G Plus' }],
    relatedDocumentIds: ['doc-1'],
    viewsCount: 142,
    version: 1,
  },
  {
    id: 'news-2',
    title: 'Matriz de Precios Equipos Samsung y Apple para Portabilidad Bitel',
    summary: 'Nuevos descuentos por portabilidad en cuotas sin intereses con tarjeta.',
    categoryId: 'cat_equipos',
    urgency: 'novedad',
    editorialStatus: 'publicado',
    publishDate: '2026-11-02T12:00:00Z',
    effectiveDate: 'Vigente todo Noviembre 2026',
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    validityStatus: 'vigente',
    author: 'Capacitación Comercial',
    source: 'Gerencia Comercial Bitel',
    targetAudience: ['Distribuidores', 'Tiendas Propias Bitel'],
    content: 'Matriz detallada en Excel con precios de prepago y pospago.',
    whatChanges: ['Descuento de hasta S/ 400 en Galaxy S24'],
    whatStays: ['Políticas de evaluación crediticia'],
    salesArguments: ['Financiamiento hasta en 12 cuotas sin intereses'],
    systemCodes: [{ system: 'Salesforce', code: 'PROMO-PORTA-EQ', description: 'Descuento Portabilidad' }],
    relatedDocumentIds: [],
    viewsCount: 88,
    version: 1,
  },
];

test('normalizeText handles accents and uppercase correctly', () => {
  assert.equal(normalizeText('Móvil Pospago'), 'movil pospago');
  assert.equal(normalizeText('LÍNEA FÍSICA'), 'linea fisica');
});

test('filterNewsItems filters by categoryId', () => {
  const filters: FilterState = {
    searchQuery: '',
    categoryId: 'cat_pospago',
    urgency: 'all',
    validity: 'all',
    onlyWithDocuments: false,
    onlyBookmarked: false,
  };
  const result = filterNewsItems(mockNews, filters);
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'news-1');
});

test('filterNewsItems filters by documents present', () => {
  const filters: FilterState = {
    searchQuery: '',
    categoryId: 'all',
    urgency: 'all',
    validity: 'all',
    onlyWithDocuments: true,
    onlyBookmarked: false,
  };
  const result = filterNewsItems(mockNews, filters);
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'news-1');
});

test('filterNewsItems searches across text, system codes and changes', () => {
  const filters: FilterState = {
    searchQuery: 'SISACT',
    categoryId: 'all',
    urgency: 'all',
    validity: 'all',
    onlyWithDocuments: false,
    onlyBookmarked: false,
  };
  const result = filterNewsItems(mockNews, filters);
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'news-1');
});

test('computeNewsStats counts total news, urgencies and documents accurately', () => {
  const stats = computeNewsStats(mockNews);
  assert.equal(stats.totalNews, 2);
  assert.equal(stats.urgentCount, 1);
  assert.equal(stats.withDocsCount, 1);
});

test('calculateValidityStatus computes correct status based on dates', () => {
  // Past dates -> vencido
  const expiredStatus = calculateValidityStatus('2024-01-01', '2024-01-31');
  assert.equal(expiredStatus, 'vencido');

  // Far future start date -> proximo
  const futureStatus = calculateValidityStatus('2099-01-01', '2099-01-31');
  assert.equal(futureStatus, 'proximo');
});

test('generateWhatsAppMessage includes Bitel headers, bullet points, and Google Drive document', () => {
  const msg = generateWhatsAppMessage(mockNews[0], mockCategories, mockDocuments);
  assert.match(msg, /\[COMUNICADO URGENTE BITEL\]/);
  assert.match(msg, /Pospago B-Smart/);
  assert.match(msg, /Aumento de 25GB/);
  assert.match(msg, /SISACT/);
  assert.match(msg, /Cartilla_Comercial_Pospago_Noviembre\.pdf/);
  assert.match(msg, /drive\.google\.com/);
});

test('generateDevicePricesWhatsApp formats device prices and total financed', () => {
  const mockDevices: DeviceProduct[] = [
    {
      id: 'dev-1',
      name: 'Samsung Galaxy A55 5G',
      brand: 'Samsung',
      categoryTier: 'gama_media',
      priceCash: 1249,
      priceInitialFee: 0,
      installments12: 104.08,
      installments18: 69.39,
      totalFinanced12: 1249,
      totalFinanced18: 1249,
      pricePortabilidad: 1149,
      priceRenovacion: 1199,
      pricePrepago: 1399,
      suggestedPlan: 'Plan B-Smart 69.90',
      stockStatus: 'disponible',
      subjectToStock: true,
      keySpecs: ['Super AMOLED 120Hz', '50 MP OIS'],
      highlights: 'Excelente gama media 5G',
      commercialConditions: ['Cuota inicial S/ 0'],
      lastUpdated: '2026-11-06',
      source: 'Bitel',
      editorialStatus: 'publicado',
      version: 1,
    },
  ];

  const msg = generateDevicePricesWhatsApp(mockDevices);
  assert.match(msg, /Samsung Galaxy A55 5G/);
  assert.match(msg, /Total financiado: S\/ 1249\.00/);
  assert.match(msg, /Sujeto a stock disponible/);
});
