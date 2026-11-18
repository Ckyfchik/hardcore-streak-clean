export type TimePeriod = 'morning' | 'day' | 'evening' | 'night';

export interface TimeTheme {
  period: TimePeriod;
  label: string;
  bgGradient: [string, string, string];
  orbPrimary: string;
  orbSecondary: string;
  accent: string;
  glassBg: string;
  glassBorder: string;
}

export function getTimeTheme(date: Date = new Date()): TimeTheme {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) {
    return {
      period: 'morning', label: 'Утро',
      bgGradient: ['#061A2B', '#0B3954', '#08263A'],
      orbPrimary: 'rgba(56, 189, 248, 0.45)', orbSecondary: 'rgba(14, 165, 233, 0.30)',
      accent: '#38BDF8', glassBg: 'rgba(255, 255, 255, 0.10)', glassBorder: 'rgba(186, 230, 253, 0.30)',
    };
  }
  if (hour >= 12 && hour < 17) {
    return {
      period: 'day', label: 'День',
      bgGradient: ['#051F18', '#0B4635', '#06281E'],
      orbPrimary: 'rgba(52, 211, 153, 0.45)', orbSecondary: 'rgba(16, 185, 129, 0.30)',
      accent: '#34D399', glassBg: 'rgba(255, 255, 255, 0.10)', glassBorder: 'rgba(167, 243, 208, 0.30)',
    };
  }
  if (hour >= 17 && hour < 22) {
    return {
      period: 'evening', label: 'Вечер',
      bgGradient: ['#231005', '#522208', '#2B1306'],
      orbPrimary: 'rgba(251, 146, 60, 0.50)', orbSecondary: 'rgba(234, 88, 12, 0.32)',
      accent: '#FB923C', glassBg: 'rgba(255, 255, 255, 0.10)', glassBorder: 'rgba(254, 215, 170, 0.30)',
    };
  }
  return {
    period: 'night', label: 'Ночь',
    bgGradient: ['#050814', '#0D1733', '#070C1D'],
    orbPrimary: 'rgba(59, 130, 246, 0.35)', orbSecondary: 'rgba(29, 78, 216, 0.25)',
    accent: '#60A5FA', glassBg: 'rgba(255, 255, 255, 0.07)', glassBorder: 'rgba(147, 197, 253, 0.22)',
  };
}
