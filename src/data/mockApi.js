// Sample data and a fake API. Every function here is async and shaped like a
// real endpoint, so swapping in the provider's backend means replacing this
// file only. Dates are generated relative to today so the demo never goes stale.

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function addDays(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function addMonths(base, months) {
  const d = new Date(base);
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
}

const today = new Date();
const cycleStart = addDays(today, -17);
const dueDate = addDays(today, 13);

const DEMO_CONTRACT = '4821937';

let account = {
  contract: DEMO_CONTRACT,
  holder: { firstName: 'Μαρία', lastName: 'Παπαδοπούλου', firstNameEn: 'Maria', lastNameEn: 'Papadopoulou' },
  address: { el: 'Εγνατίας 112, Θεσσαλονίκη', en: '112 Egnatia St, Thessaloniki' },
  plan: {
    name: 'Fiber 200',
    download: 200,
    upload: 20,
    phoneLine: true,
    monthly: 32.9,
    contractEnds: addMonths(today, 9),
  },
  autopay: false,
  eBill: true,
  current: {
    id: 'INV-2026-10',
    amount: 32.9,
    balance: 32.9,
    issued: cycleStart,
    due: dueDate,
    status: 'due',
    rfCode: 'RF18 4821 9370 2610',
  },
};

const bills = Array.from({ length: 6 }, (_, i) => {
  const issued = addMonths(cycleStart, -(i + 1));
  const extra = i === 2 ? 4.5 : 0;
  return {
    id: `INV-${issued.slice(0, 7)}`,
    period: issued,
    amount: 32.9 + extra,
    issued,
    due: addDays(issued, 30),
    paidOn: addDays(issued, 12 + (i % 3) * 4),
    method: i % 2 === 0 ? 'card' : 'iris',
    status: 'paid',
  };
});

export async function signIn(contract, password) {
  await wait(600);
  if (!/^\d{7}$/.test(contract)) {
    const error = new Error('contract-format');
    throw error;
  }
  if (password.length < 4) {
    throw new Error('credentials');
  }
  return { contract, token: 'demo-token' };
}

export async function requestPasswordReset(contract) {
  await wait(500);
  if (!/^\d{7}$/.test(contract)) throw new Error('contract-format');
  return { sentTo: '69•• ••• 412' };
}

export async function getAccount() {
  await wait(300);
  return structuredClone(account);
}

export async function getBills() {
  await wait(300);
  const current = { ...account.current, period: account.current.issued };
  return structuredClone([current, ...bills]);
}

// Card payments go to the bank's own payment page (as with Viva, Nexi, etc.),
// so this portal never handles card numbers. Here we just simulate the round trip.
export async function startPayment({ amount, method }) {
  await wait(method === 'card' ? 1400 : 700);
  const receipt = {
    id: `PAY-${Date.now().toString().slice(-8)}`,
    amount,
    method,
    paidOn: new Date().toISOString(),
  };
  const balance = Math.max(0, Math.round((account.current.balance - amount) * 100) / 100);
  account = {
    ...account,
    current: {
      ...account.current,
      balance,
      status: balance === 0 ? 'paid' : 'due',
      paidOn: balance === 0 ? receipt.paidOn : undefined,
      method: balance === 0 ? method : undefined,
    },
  };
  return { ...receipt, balance };
}

export async function setAutopay(enabled) {
  await wait(400);
  account = { ...account, autopay: enabled };
  return enabled;
}

export const demoCredentials = { contract: DEMO_CONTRACT, password: 'demo1234' };
