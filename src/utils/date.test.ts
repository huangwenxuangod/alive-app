import { describe, it, expect } from 'vitest';
import { getLocalDateStr, diffInCalendarDays, addDaysToDateStr } from '@/utils/date';

/**
 * 日期工具函数单元测试
 */
describe('date utils - 日期工具', () => {
  describe('getLocalDateStr', () => {
    it('返回 YYYY-MM-DD 格式', () => {
      const result = getLocalDateStr(new Date('2024-06-15T12:00:00'));
      expect(result).toBe('2024-06-15');
    });

    it('月初补零', () => {
      const result = getLocalDateStr(new Date('2024-01-05T00:00:00'));
      expect(result).toBe('2024-01-05');
    });

    it('年末', () => {
      const result = getLocalDateStr(new Date('2024-12-31T23:59:59'));
      expect(result).toBe('2024-12-31');
    });
  });

  describe('diffInCalendarDays', () => {
    it('同一天 → 0', () => {
      expect(diffInCalendarDays('2024-01-15', '2024-01-15')).toBe(0);
    });

    it('差1天', () => {
      expect(diffInCalendarDays('2024-01-14', '2024-01-15')).toBe(1);
    });

    it('差2天', () => {
      expect(diffInCalendarDays('2024-01-13', '2024-01-15')).toBe(2);
    });

    it('跨月', () => {
      expect(diffInCalendarDays('2024-01-31', '2024-02-01')).toBe(1);
    });

    it('跨年', () => {
      expect(diffInCalendarDays('2023-12-31', '2024-01-01')).toBe(1);
    });

    it('跨月差多天', () => {
      expect(diffInCalendarDays('2024-01-28', '2024-02-03')).toBe(6);
    });

    it('date2 < date1 → 负数', () => {
      expect(diffInCalendarDays('2024-01-15', '2024-01-10')).toBe(-5);
    });
  });

  describe('addDaysToDateStr', () => {
    it('加1天', () => {
      expect(addDaysToDateStr('2024-01-15', 1)).toBe('2024-01-16');
    });

    it('加0天 → 同一天', () => {
      expect(addDaysToDateStr('2024-01-15', 0)).toBe('2024-01-15');
    });

    it('跨月', () => {
      expect(addDaysToDateStr('2024-01-31', 1)).toBe('2024-02-01');
    });

    it('跨年', () => {
      expect(addDaysToDateStr('2024-12-31', 1)).toBe('2025-01-01');
    });

    it('加30天', () => {
      expect(addDaysToDateStr('2024-01-01', 30)).toBe('2024-01-31');
    });

    it('闰年2月', () => {
      expect(addDaysToDateStr('2024-02-28', 1)).toBe('2024-02-29');
      expect(addDaysToDateStr('2024-02-29', 1)).toBe('2024-03-01');
    });
  });
});
