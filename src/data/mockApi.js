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

const DEMO_CONTRACT = '1048219370';
const MONTHLY = 32.9;

// Bonus credit is a wallet of discounts and credits (switching offer, friend
// referrals). The rule: it can cover at most half the monthly fee, so the
// customer always pays at least the other half themselves.
const round2 = (n) => Math.round(n * 100) / 100;
const BONUS_CAP = round2(MONTHLY / 2);

let account = {
  contract: DEMO_CONTRACT,
  holder: { firstName: 'Μαρία', lastName: 'Παπαδοπούλου', firstNameEn: 'Maria', lastNameEn: 'Papadopoulou' },
  address: { el: 'Εγνατίας 112, Θεσσαλονίκη', en: '112 Egnatia St, Thessaloniki' },
  plan: {
    name: 'Fiber 200',
    download: 200,
    upload: 20,
    phoneLine: true,
    monthly: MONTHLY,
    contractEnds: addMonths(today, 9),
  },
  autopay: false,
  eBill: true,
  // example.com is reserved for examples, so this can never be someone's real address.
  contact: { email: 'maria.p@example.com', mobile: '6900000000' }, // placeholder number
  prefs: { eBill: true, smsReminder: true, offers: false }, // marketing is opt-in (GDPR)
  bonus: {
    balance: 49.35,
    capPerBill: BONUS_CAP,
    // Newest first. Positive amounts are credits earned, negative are credit used on a bill.
    entries: [
      { date: cycleStart, key: 'applied', amount: -BONUS_CAP, bill: `INV-${cycleStart.slice(0, 7)}` },
      { date: addDays(today, -26), key: 'referral', amount: MONTHLY },
      { date: addMonths(cycleStart, -1), key: 'applied', amount: -BONUS_CAP, bill: `INV-${addMonths(cycleStart, -1).slice(0, 7)}` },
      { date: addMonths(cycleStart, -3), key: 'switching', amount: 49.35 },
    ],
  },
  current: {
    id: `INV-${cycleStart.slice(0, 7)}`,
    amount: round2(MONTHLY - BONUS_CAP),
    balance: round2(MONTHLY - BONUS_CAP),
    charges: MONTHLY,
    bonusApplied: BONUS_CAP,
    issued: cycleStart,
    due: dueDate,
    status: 'due',
    rfCode: 'RF18 1048 2193 7010',
    lines: [
      { key: 'plan', amount: MONTHLY },
      { key: 'bonusCredit', amount: -BONUS_CAP },
    ],
  },
};

const bills = Array.from({ length: 6 }, (_, i) => {
  const issued = addMonths(cycleStart, -(i + 1));
  const extra = i === 2 ? 4.5 : 0;
  const bonus = i === 0 ? BONUS_CAP : 0; // last month also used bonus credit
  const lines = [{ key: 'plan', amount: MONTHLY }];
  if (extra) lines.push({ key: 'mobileCalls', amount: extra });
  if (bonus) lines.push({ key: 'bonusCredit', amount: -bonus });
  const amount = round2(MONTHLY + extra - bonus);
  const paidOn = addDays(issued, 12 + (i % 3) * 4);
  const method = i % 2 === 0 ? 'card' : 'iris';
  return {
    id: `INV-${issued.slice(0, 7)}`,
    period: issued,
    amount,
    charges: round2(MONTHLY + extra),
    bonusApplied: bonus,
    issued,
    due: addDays(issued, 30),
    paidOn,
    method,
    status: 'paid',
    rfCode: `RF${String(40 + i * 7).padStart(2, '0')} 1048 2193 70${issued.slice(5, 7)}`,
    // Line items printed on the PDF. Amounts include VAT.
    lines,
    receipt: { id: `PAY-${issued.slice(2, 4)}${issued.slice(5, 7)}${String(4170 + i * 13)}`, amount, method, paidOn },
  };
});

// The demo only ever accepts its own sample account, so nobody is tempted to type
// real credentials into a look-alike sign-in page. Nothing typed leaves the browser.
const DEMO_PASSWORD = 'demo1234';
let activatedPassword = null;

function demoOnly(contract) {
  if (!/^\d{10}$/.test(contract)) throw new Error('contract-format');
  if (contract !== DEMO_CONTRACT) throw new Error('demo-only');
}

export async function signIn(contract, password) {
  await wait(600);
  demoOnly(contract);
  if (password !== DEMO_PASSWORD && password !== activatedPassword) {
    throw new Error('credentials');
  }
  return { contract, token: 'demo-token' };
}

export async function requestPasswordReset(contract) {
  await wait(500);
  demoOnly(contract);
  return { sentTo: '69•• ••• 000' };
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
      receipt: balance === 0 ? { ...receipt } : undefined,
    },
  };
  save();
  return { ...receipt, balance };
}

export async function setAutopay(enabled) {
  await wait(400);
  account = { ...account, autopay: enabled };
  save();
  return enabled;
}

// First-time activation: contract number, SMS code to the mobile on the contract,
// then the customer's own password. Replaces "password = last 4 digits".
export const DEMO_SMS_CODE = '123456';

export async function startActivation(contract) {
  await wait(600);
  demoOnly(contract);
  return { sentTo: '69•• ••• 000', resendAfter: 30 };
}

export async function verifyActivationCode(contract, code) {
  await wait(500);
  if (code !== DEMO_SMS_CODE) throw new Error('code');
  return { ok: true };
}

export async function activateAccount(contract, password) {
  await wait(700);
  activatedPassword = password;
  return { contract, token: 'demo-token' };
}

// Referrals. Today the friend names the customer on their application; the code
// makes that unambiguous, and the form lets sales call the friend directly.
let referrals = [
  { id: 'r1', name: 'Νίκος Κ.', nameEn: 'Nikos K.', status: 'connected', date: addDays(today, -26), earned: MONTHLY },
  { id: 'r2', name: 'Ελένη Μ.', nameEn: 'Eleni M.', status: 'applied', date: addDays(today, -6) },
];

export async function getReferrals() {
  await wait(300);
  return { code: `MARIA-${DEMO_CONTRACT.slice(-4)}`, reward: MONTHLY, list: structuredClone(referrals) };
}

export async function submitReferral({ name, phone, area }) {
  await wait(700);
  const entry = { id: `r${Date.now()}`, name, nameEn: name, phone, area, status: 'contacted', date: new Date().toISOString() };
  referrals = [entry, ...referrals];
  save();
  return structuredClone(entry);
}

// Profile.
export async function updateContact(changes) {
  await wait(600);
  account = { ...account, contact: { ...account.contact, ...changes } };
  save();
  return structuredClone(account.contact);
}

export async function setPreference(key, value) {
  await wait(350);
  account = { ...account, prefs: { ...account.prefs, [key]: value } };
  save();
  return value;
}

export async function changePassword(current, next) {
  await wait(700);
  if (current !== DEMO_PASSWORD && current !== activatedPassword) throw new Error('current');
  activatedPassword = next;
  return { ok: true };
}

// Support.
let tickets = [
  {
    id: 'ΑΙΤ-20418',
    category: 'billing',
    subject: { el: 'Ερώτηση για τη χρέωση Ιουνίου', en: 'Question about the June charge' },
    status: 'resolved',
    date: addMonths(today, -3),
  },
];

export async function getSupport() {
  await wait(300);
  return { area: { el: 'Θεσσαλονίκη', en: 'Thessaloniki' }, networkOk: true, tickets: structuredClone(tickets) };
}

// A real version would ask the network for this line's status; here it is simulated.
export async function runLineTest() {
  await wait(2200);
  return { online: true, down: 194, up: 19.6, ping: 6 };
}

export async function createTicket({ category, subject, message, contactBy }) {
  await wait(700);
  const ticket = {
    id: `ΑΙΤ-${20500 + tickets.length * 7}`,
    category,
    subject: { el: subject, en: subject },
    message,
    contactBy,
    status: 'open',
    date: new Date().toISOString(),
  };
  tickets = [ticket, ...tickets];
  save();
  return structuredClone(ticket);
}

// Availability (for people who aren't customers yet). The result is a sample: postcodes
// in big-city ranges come back available, a few as planned, the rest not yet; a street
// name gets a stable pseudo-random answer so the same address always gives the same result.
export async function checkAvailability(query) {
  await wait(1100);
  const digits = query.replace(/\s/g, '');
  let status;
  if (/^\d{5}$/.test(digits)) {
    const area = digits.slice(0, 2);
    if (['10', '11', '12', '13', '14', '15', '16', '17', '54', '55', '56'].includes(area)) status = 'available';
    else if (['18', '19', '26', '57'].includes(area)) status = 'planned';
    else status = 'none';
  } else {
    const sum = [...query.toLowerCase()].reduce((n, ch) => n + ch.codePointAt(0), 0);
    status = ['available', 'available', 'available', 'planned', 'none'][sum % 5];
  }
  return { query: query.trim(), status };
}

let callbacks = 0;
export async function requestCallback({ name, phone, time, address, kind }) {
  await wait(800);
  callbacks += 1;
  save();
  return { id: `ΔΙΑ-${3100 + callbacks * 7}`, name, phone, time, address, kind };
}

export const demoCredentials = { contract: DEMO_CONTRACT, password: DEMO_PASSWORD };

// Demo changes (payments, contact details, settings, referrals, requests) survive a page
// refresh: they're kept in this browser tab's sessionStorage, which empties when the tab
// closes or on "Reset demo". Passwords are never stored. A real backend replaces all of this.
const STORE_KEY = 'demo-state';

function save() {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify({ account, referrals, tickets, callbacks }));
  } catch { /* storage unavailable: the demo still works, it just forgets on refresh */ }
}

try {
  const saved = JSON.parse(sessionStorage.getItem(STORE_KEY) || 'null');
  if (saved) {
    account = saved.account ?? account;
    referrals = saved.referrals ?? referrals;
    tickets = saved.tickets ?? tickets;
    callbacks = saved.callbacks ?? callbacks;
  }
} catch { /* corrupt or unavailable: start from the sample data */ }
