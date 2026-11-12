import { Prisma } from '@prisma/client';

/** Prisma отдаёт DECIMAL как объект — в JSON он должен быть числом. */
export function toNumber(value: Prisma.Decimal | number | null | undefined): number {
  return value === null || value === undefined ? 0 : Number(value);
}

export function toDateString(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function toTimeString(value: Date): string {
  return value.toISOString().slice(11, 16);
}
