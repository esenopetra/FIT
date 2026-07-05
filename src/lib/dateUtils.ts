import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
  eachDayOfInterval,
  parseISO,
} from 'date-fns';

export const DATE_FORMAT = 'yyyy-MM-dd';

export function todayStr(): string {
  return format(new Date(), DATE_FORMAT);
}

export function toDateStr(date: Date): string {
  return format(date, DATE_FORMAT);
}

export function parseDate(dateStr: string): Date {
  return parseISO(dateStr);
}

export type ReportRangeType = 'today' | 'week' | 'month' | 'year' | 'custom';

export function getReportRange(
  type: ReportRangeType,
  reference: Date = new Date(),
  custom?: { start: string; end: string },
): { start: string; end: string; days: string[] } {
  let start: Date;
  let end: Date;

  switch (type) {
    case 'today':
      start = reference;
      end = reference;
      break;
    case 'week':
      start = startOfWeek(reference, { weekStartsOn: 1 });
      end = endOfWeek(reference, { weekStartsOn: 1 });
      break;
    case 'month':
      start = startOfMonth(reference);
      end = endOfMonth(reference);
      break;
    case 'year':
      start = startOfYear(reference);
      end = endOfYear(reference);
      break;
    case 'custom':
      if (!custom) throw new Error('Custom range requires start/end dates');
      return {
        start: custom.start,
        end: custom.end,
        days: eachDayOfInterval({ start: parseDate(custom.start), end: parseDate(custom.end) }).map(toDateStr),
      };
  }

  return {
    start: toDateStr(start),
    end: toDateStr(end),
    days: eachDayOfInterval({ start, end }).map(toDateStr),
  };
}

export function formatMonthYear(dateStr: string): string {
  return format(parseDate(dateStr), 'MMMM yyyy');
}

export function formatYear(dateStr: string): string {
  return format(parseDate(dateStr), 'yyyy');
}

export function formatDisplayDate(dateStr: string): string {
  return format(parseDate(dateStr), 'dd MMM yyyy');
}
