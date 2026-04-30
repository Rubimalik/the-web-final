export type PaymentRecord = {
  id: string;
  sessionId: string;
  amountTotal: number;
  currency: string;
  customerEmail: string | null;
  orderId: string | null;
  userId: string | null;
  createdAt: string;
};

const payments: PaymentRecord[] = [];

export function storeSuccessfulPayment(record: PaymentRecord) {
  payments.push(record);
  return record;
}

export function listSuccessfulPayments() {
  return [...payments];
}
