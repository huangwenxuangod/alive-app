import { clsx, type ClassValue } from 'clsx';
import { formatDistanceToNow, format as dateFnsFormat } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { nanoid } from 'nanoid';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency amount (stored as cents in DB) to yuan string
 * @param amount - Amount in cents
 * @returns Formatted currency string (e.g. "¥10.00")
 */
export function formatCurrency(amount: number): string {
  const yuan = amount / 100;
  return `¥${yuan.toFixed(2)}`;
}

/**
 * Format date string to readable format
 * @param dateStr - ISO date string or Date object
 * @returns Formatted date string (e.g. "2024年1月15日")
 */
export function formatDate(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return dateFnsFormat(date, 'yyyy年M月d日', { locale: zhCN });
}

/**
 * Format relative time from now
 * @param date - Date string or Date object
 * @returns Relative time string (e.g. "3天前", "刚刚")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: zhCN });
}

/**
 * Generate a unique ID using nanoid
 * @returns Unique ID string
 */
export function generateId(): string {
  return nanoid();
}
