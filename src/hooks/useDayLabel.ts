import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { daysFromToday, weekdayShort } from '@/utils/date';

/** "Today", "Tomorrow", or a short weekday — in the active language. */
export function useDayLabel() {
  const { t, i18n } = useTranslation();

  return useCallback(
    (date: Date) => {
      const days = daysFromToday(date);
      if (days === 0) return t('class.today');
      if (days === 1) return t('class.tomorrow');
      return weekdayShort(date, i18n.language);
    },
    [t, i18n.language],
  );
}
