/**
 * Статусы заказа. Значения совпадают со строковыми значениями,
 * которые уже используются в БД (legacy), в нижнем регистре.
 *
 * Используется const-объект, а не enum: значения остаются строковыми
 * литералами и совместимы с Prisma-типами без приведения типов.
 */
export const OrderStatus = {
  Created: 'created',
  Accepted: 'accepted',
  InProgress: 'in_progress',
  Completed: 'completed',
  Finished: 'finished',
  Canceled: 'canceled',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.Created]: 'Создан',
  [OrderStatus.Accepted]: 'Принят',
  [OrderStatus.InProgress]: 'В процессе',
  [OrderStatus.Completed]: 'Готов к выдаче',
  [OrderStatus.Finished]: 'Завершён',
  [OrderStatus.Canceled]: 'Отменён',
};

/** Статусы, при которых заказ считается завершённым (история). */
export const CLOSED_ORDER_STATUSES: readonly OrderStatus[] = [
  OrderStatus.Finished,
  OrderStatus.Canceled,
];

/** Допустимые переходы статусов. Проверяются на сервере. */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  [OrderStatus.Created]: [OrderStatus.Accepted, OrderStatus.Canceled],
  [OrderStatus.Accepted]: [OrderStatus.InProgress, OrderStatus.Canceled],
  [OrderStatus.InProgress]: [OrderStatus.Completed, OrderStatus.Canceled],
  [OrderStatus.Completed]: [OrderStatus.Finished],
  [OrderStatus.Finished]: [],
  [OrderStatus.Canceled]: [],
};
