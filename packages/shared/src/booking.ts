/** Параметры записи на сервис. */
export const BOOKING_SLOT_MINUTES = 30;
export const WORKING_HOURS_START = 9;
export const WORKING_HOURS_END = 20;

/** Количество слотов в день: 09:00–20:00 с шагом 30 минут. */
export const SLOTS_PER_DAY = ((WORKING_HOURS_END - WORKING_HOURS_START) * 60) / BOOKING_SLOT_MINUTES;

export function isValidSlotTime(time: string): boolean {
  const match = /^(\d{2}):(\d{2})(?::00)?$/.exec(time);
  if (!match) return false;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  return (
    hours >= WORKING_HOURS_START &&
    hours < WORKING_HOURS_END &&
    (minutes === 0 || minutes === 30)
  );
}
