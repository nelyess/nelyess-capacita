import { NewsItem, DeviceProduct, DocumentItem, CategoryItem } from '../types';
import { calculateValidityStatus, getValidityMeta, formatPeruDate } from './validityCalculator';

/**
 * Generates an executive WhatsApp communication formatted specifically for Bitel commercial advisors.
 */
export function generateWhatsAppMessage(
  news: NewsItem,
  categories: CategoryItem[] = [],
  documents: DocumentItem[] = []
): string {
  const validity = calculateValidityStatus(news.startDate, news.endDate, news.validityStatus);
  const validityMeta = getValidityMeta(validity);

  const urgencyEmoji = 
    news.urgency === 'urgente' ? '🚨 *[COMUNICADO URGENTE BITEL]*' :
    news.urgency === 'novedad' ? '📢 *[NOVEDAD COMERCIAL BITEL]*' :
    news.urgency === 'actualizado' ? '🔄 *[ACTUALIZACIÓN DE PRODUCTO BITEL]*' :
    'ℹ️ *[INFORMATIVO BITEL]*';

  const category = categories.find((c) => c.id === news.categoryId);
  const categoryName = category ? category.name : 'Comercial Bitel';

  const lines: string[] = [];

  lines.push(`${urgencyEmoji}`);
  lines.push(`*Estado:* ${validityMeta.label.toUpperCase()}`);
  lines.push(`*Línea:* ${categoryName}`);
  lines.push(`*Tema:* ${news.title.toUpperCase()}`);
  
  if (news.startDate || news.endDate) {
    const startStr = news.startDate ? formatPeruDate(news.startDate) : 'No especificada';
    const endStr = news.endDate ? formatPeruDate(news.endDate) : 'Hasta nuevo aviso / sujeto a stock';
    lines.push(`*Vigencia:* Desde ${startStr} hasta ${endStr}`);
  } else {
    lines.push(`*Vigencia:* ${news.effectiveDate}`);
  }

  if (news.targetAudience && news.targetAudience.length > 0) {
    lines.push(`*A quién aplica:* ${news.targetAudience.join(', ')}`);
  }
  
  if (news.source) {
    lines.push(`*Fuente:* ${news.source}`);
  }
  
  lines.push('');
  lines.push('📝 *RESUMEN:*');
  lines.push(news.summary);
  lines.push('');

  // Before / After comparison if present
  if (news.beforeAfter && (news.beforeAfter.before || news.beforeAfter.after)) {
    lines.push('🔄 *COMPARATIVA (ANTES VS AHORA):*');
    lines.push(`❌ *Antes:* ${news.beforeAfter.before}`);
    lines.push(`✅ *Ahora:* ${news.beforeAfter.after}`);
    lines.push('');
  }

  if (news.whatChanges && news.whatChanges.length > 0) {
    lines.push('⚡ *¿QUÉ CAMBIÓ?:*');
    news.whatChanges.forEach((change) => {
      lines.push(`• ${change}`);
    });
    lines.push('');
  }

  if (news.salesArguments && news.salesArguments.length > 0) {
    lines.push('💡 *¿QUÉ COMUNICAR AL CLIENTE?:*');
    news.salesArguments.forEach((arg) => {
      lines.push(`✔ ${arg}`);
    });
    lines.push('');
  }

  if (news.systemCodes && news.systemCodes.length > 0) {
    lines.push('🖥️ *CÓDIGOS EN SISTEMAS (B-POS / SISACT / B-SALES):*');
    news.systemCodes.forEach((code) => {
      lines.push(`• ${code.system} [${code.code}]: ${code.description}`);
    });
    lines.push('');
  }

  // Related documents
  if (news.relatedDocumentIds && news.relatedDocumentIds.length > 0) {
    const matchedDocs = documents.filter((d) => news.relatedDocumentIds.includes(d.id));
    if (matchedDocs.length > 0) {
      lines.push('📎 *DOCUMENTOS DE CONSULTA EN DRIVE:*');
      matchedDocs.forEach((doc) => {
        lines.push(`• ${doc.title} (${doc.versionNumber})`);
        lines.push(`  Enlace: ${doc.url}`);
      });
      lines.push('');
    }
  }

  lines.push('👉 *Consulta la información completa en el Portal Nelyess Capacita (Bitel Perú).*');
  lines.push(`_Publicado por: ${news.author}_`);

  return lines.join('\n');
}

/**
 * Generates a WhatsApp broadcast for updated Bitel Device Prices.
 */
export function generateDevicePricesWhatsApp(devices: DeviceProduct[]): string {
  const lines: string[] = [];
  lines.push('📱 *[LISTA DE PRECIOS DE EQUIPOS BITEL]*');
  lines.push(`_Portal Nelyess Capacita · ${new Date().toLocaleDateString('es-PE')}_`);
  lines.push('');
  lines.push('🔥 *PRECIOS CON PORTABILIDAD Y RENOVACIÓN:*');
  lines.push('');

  devices.slice(0, 8).forEach((dev) => {
    lines.push(`🔹 *${dev.name}*`);
    lines.push(`   • Portabilidad: *S/ ${dev.pricePortabilidad.toFixed(2)}* (con ${dev.suggestedPlan})`);
    lines.push(`   • Renovación: *S/ ${dev.priceRenovacion.toFixed(2)}*`);
    lines.push(`   • Al contado / Prepago: S/ ${dev.priceCash > 0 ? dev.priceCash.toFixed(2) : dev.pricePrepago.toFixed(2)}`);
    if (dev.installments12 > 0) {
      lines.push(`   • En 12 cuotas de: S/ ${dev.installments12.toFixed(2)} (Total financiado: S/ ${dev.totalFinanced12.toFixed(2)})`);
    }
    if (dev.subjectToStock) {
      lines.push(`   • _(Sujeto a stock disponible en tiendas Bitel)_`);
    }
    lines.push('');
  });

  lines.push('👉 *Consulta fichas técnicas, comparador y condiciones en el Portal Nelyess Capacita.*');
  return lines.join('\n');
}

export const generateNewsWhatsAppText = generateWhatsAppMessage;
