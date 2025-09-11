// /services/api/payments.ts

// Initiate a student payment
export const initiateStudentPayment = async (data: {
  userId: string;
  courseId: string;
  amount: number;
  paymentMethod: string;
}) => {
  const res = await fetch('/api/payments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Payment initiation failed');
  return res.json(); // { status, paymentLink, transactionId }
};

// Process lecturer payout
export const requestLecturerPayout = async (data: {
  lecturerId: string;
  amount: number;
  paymentMethod: string;
}) => {
  const res = await fetch('/api/payout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Payout request failed');
  return res.json(); // { status, payoutId, processedAt }
};

// Fetch transaction history (student or lecturer)
export const getTransactions = async (query?: { userId?: string; lecturerId?: string }) => {
  const params = new URLSearchParams(query as any).toString();
  const res = await fetch(`/api/payments?${params}`);
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json(); // [{ id, userId, courseId?, amount, status, date }]
};
