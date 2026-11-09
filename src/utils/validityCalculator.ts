import { ValidityStatus } from '../types';

/**
 * Returns current date string in Peru timezone (America/Lima) as YYYY-MM-DD
 */
export function getPeruCurrentDateString(): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date());
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Calculates current validity status for a news item or campaign based on dates
 * in Peru timezone.
 */
export function calculateValidityStatus(
  startDate?: string,
  endDate?: string,
  manualStatus?: ValidityStatus
): ValidityStatus {
  if (manualStatus === 'por_confirmar') {
    return 'por_confirmar';
  }

  const today = getPeruCurrentDateString();

  if (!startDate && !endDate) {
    return manualStatus || 'por_confirmar';
  }

  // If there is a start date in the future
  if (startDate && startDate > today) {
    return 'proximo';
  }

  // If there is an end date in the past
  if (endDate && endDate < today) {
    return 'vencido';
  }

  // If start date is today or past, and no end date or end date is today/future
  if (startDate && startDate <= today) {
    if (!endDate || endDate >= today) {
      return 'vigente';
    }
  }

  // If only end date is given and it's today or future
  if (!startDate && endDate && endDate >= today) {
    return 'vigente';
  }

  return manualStatus || 'por_confirmar';
}

/**
 * Human-readable display label and colors for each validity status
 */
export function getValidityMeta(status: ValidityStatus): {
  label: string;
  badgeClass: string;
  dotColor: string;
  description: string;
} {
  switch (status) {
    case 'vigente':
      return {
        label: 'Vigente',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dotColor: 'bg-emerald-500',
        description: 'Beneficio y tarifa disponible para venta activa hoy',
      };
    case 'proximo':
      return {
        label: 'Próximo a Iniciar',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
        dotColor: 'bg-blue-500',
        description: 'Vigente a partir de la fecha de inicio indicada',
      };
    case 'vencido':
      return {
        label: 'Vencido (Histórico)',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
        dotColor: 'bg-slate-400',
        description: 'Campaña finalizada. Conservado como referencia histórica',
      };
    case 'por_confirmar':
    default:
      return {
        label: 'Vigencia por Confirmar',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
        dotColor: 'bg-amber-500',
        description: 'Fecha límite pendiente de boletín oficial Bitel',
      };
  }
}

/**
 * Formats YYYY-MM-DD into legible DD/MM/YYYY in Peru locale
 */
export function formatPeruDate(dateStr?: string): string {
  if (!dateStr) return 'No disponible';
  // Check YYYY-MM-DD
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-PE', {
      timeZone: 'America/Lima',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
