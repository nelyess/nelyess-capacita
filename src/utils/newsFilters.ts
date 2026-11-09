import { NewsItem, ValidityStatus, UrgencyLevel } from '../types';
import { calculateValidityStatus } from './validityCalculator';

export interface FilterState {
  searchQuery: string;
  categoryId: string | 'all';
  urgency: UrgencyLevel | 'all';
  validity: ValidityStatus | 'all';
  onlyWithDocuments: boolean;
  onlyBookmarked: boolean;
}

/**
 * Normalizes text for accent-insensitive and case-insensitive search.
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Filter news items by search query, categoryId, urgency, validity, documents, and bookmarks.
 */
export function filterNewsItems(
  items: NewsItem[],
  filters: FilterState,
  bookmarkedIds: string[] = []
): NewsItem[] {
  const query = normalizeText(filters.searchQuery);

  return items.filter((item) => {
    // Only published items in public view
    if (item.editorialStatus && item.editorialStatus !== 'publicado') {
      return false;
    }

    const itemValidity = calculateValidityStatus(item.startDate, item.endDate, item.validityStatus);

    // Validity filter
    if (filters.validity !== 'all') {
      if (itemValidity !== filters.validity) {
        return false;
      }
    }

    // Category check
    if (filters.categoryId !== 'all' && item.categoryId !== filters.categoryId) {
      return false;
    }

    // Urgency check
    if (filters.urgency !== 'all' && item.urgency !== filters.urgency) {
      return false;
    }

    // Bookmarked check
    if (filters.onlyBookmarked && !bookmarkedIds.includes(item.id)) {
      return false;
    }

    // Only with documents check
    if (filters.onlyWithDocuments && (!item.relatedDocumentIds || item.relatedDocumentIds.length === 0)) {
      return false;
    }

    // Text search query
    if (query) {
      const titleMatch = normalizeText(item.title).includes(query);
      const summaryMatch = normalizeText(item.summary).includes(query);
      const contentMatch = normalizeText(item.content).includes(query);
      const authorMatch = normalizeText(item.author).includes(query);
      const sourceMatch = item.source ? normalizeText(item.source).includes(query) : false;
      const effectiveMatch = normalizeText(item.effectiveDate).includes(query);
      const targetMatch = item.targetAudience?.some((t) => normalizeText(t).includes(query));
      const codeMatch = item.systemCodes?.some(
        (c) => normalizeText(c.code).includes(query) || normalizeText(c.description).includes(query)
      );
      const changesMatch = item.whatChanges?.some((wc) => normalizeText(wc).includes(query));

      if (
        !titleMatch &&
        !summaryMatch &&
        !contentMatch &&
        !authorMatch &&
        !sourceMatch &&
        !effectiveMatch &&
        !targetMatch &&
        !codeMatch &&
        !changesMatch
      ) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Computes summary statistics for the news collection including validity counts.
 */
export function computeNewsStats(items: NewsItem[]) {
  let urgentCount = 0;
  let urgentValidCount = 0;
  let validCount = 0;
  let upcomingCount = 0;
  let expiredCount = 0;
  let withDocsCount = 0;

  items.forEach((item) => {
    const status = calculateValidityStatus(item.startDate, item.endDate, item.validityStatus);
    if (status === 'vigente') {
      validCount++;
      if (item.urgency === 'urgente') urgentValidCount++;
    } else if (status === 'proximo') {
      upcomingCount++;
    } else if (status === 'vencido') {
      expiredCount++;
    }

    if (item.urgency === 'urgente') urgentCount++;
    if (item.relatedDocumentIds && item.relatedDocumentIds.length > 0) withDocsCount++;
  });

  return {
    totalNews: items.length,
    validCount,
    upcomingCount,
    expiredCount,
    urgentCount,
    urgentValidCount,
    withDocsCount,
  };
}
