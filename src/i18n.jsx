import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const dict = {
  el: {
    demoBanner: 'Επίδειξη με δείγμα δεδομένων. Δεν συνδέεται με πραγματικό λογαριασμό.',
    switchLang: 'English',
    switchLangLabel: 'Switch to English',
    signOut: 'Αποσύνδεση',
    contractShort: 'Σύμβαση {n}',
    loading: 'Φόρτωση…',
    nav: { overview: 'Επισκόπηση', bills: 'Λογαριασμοί', pay: 'Πληρωμή' },
    login: {
      title: 'Συνδεθείτε στον λογαριασμό σας',
      intro: 'Δείτε τι οφείλετε, πληρώστε σε λίγα δευτερόλεπτα και κατεβάστε τους λογαριασμούς σας.',
      contract: 'Αριθμός σύμβασης',
      contractHint: '7 ψηφία, τυπωμένα πάνω δεξιά σε κάθε λογαριασμό.',
      password: 'Κωδικός πρόσβασης',
      show: 'Εμφάνιση',
      hide: 'Απόκρυψη',
      showLabel: 'Εμφάνιση κωδικού',
      hideLabel: 'Απόκρυψη κωδικού',
      submit: 'Σύνδεση',
      submitting: 'Σύνδεση…',
      forgot: 'Ξεχάσατε τον κωδικό;',
      demo: 'Συμπλήρωση με δείγμα λογαριασμού',
      errors: {
        'contract-format': 'Ο αριθμός σύμβασης έχει 7 ψηφία, χωρίς κενά.',
        'password-empty': 'Εισάγετε τον κωδικό πρόσβασης.',
        credentials: 'Ο αριθμός σύμβασης και ο κωδικός δεν ταιριάζουν. Ελέγξτε τα ή επαναφέρετε τον κωδικό.',
      },
    },
    forgot: {
      title: 'Επαναφορά κωδικού',
      intro: 'Θα στείλουμε SMS με νέο κωδικό στο κινητό που έχετε δηλώσει στη σύμβαση.',
      submit: 'Αποστολή SMS',
      submitting: 'Αποστολή…',
      sent: 'Στείλαμε SMS στο {phone}. Χρησιμοποιήστε τον νέο κωδικό για να συνδεθείτε.',
      back: 'Πίσω στη σύνδεση',
    },
    overview: {
      hello: 'Γεια σας, {name}',
      due: 'Προς πληρωμή',
      dueOn: 'Λήξη {date}',
      daysLeft: { one: 'σε 1 ημέρα', other: 'σε {n} ημέρες', zero: 'σήμερα', late: 'έληξε πριν από {n} ημέρες' },
      pay: 'Πληρωμή {amount}',
      paidTitle: 'Δεν οφείλετε τίποτα',
      paidBody: 'Ο λογαριασμός με λήξη {due} εξοφλήθηκε στις {date}. Ο επόμενος εκδίδεται στις {next}.',
      rf: 'Κωδικός πληρωμής RF',
      rfHelp: 'Για e-banking, ΑΤΜ ή ταμείο.',
      copy: 'Αντιγραφή',
      copied: 'Αντιγράφηκε',
      cycleIssued: 'Έκδοση',
      cycleToday: 'Σήμερα',
      cycleDue: 'Λήξη',
      cycleLabel: 'Πορεία κύκλου χρέωσης: έκδοση {issued}, λήξη {due}',
      plan: 'Το πρόγραμμά σας',
      speed: '{down} Mbps λήψη, {up} Mbps αποστολή',
      phoneLine: 'Σταθερή τηλεφωνία με απεριόριστες αστικές κλήσεις',
      monthly: '{amount} τον μήνα',
      contractEnds: 'Η σύμβαση λήγει στις {date}',
      address: 'Διεύθυνση σύνδεσης',
      settings: 'Ρυθμίσεις πληρωμής',
      autopay: 'Αυτόματη πληρωμή',
      autopayOn: 'Χρεώνουμε την κάρτα σας αυτόματα στη λήξη κάθε λογαριασμού.',
      autopayOff: 'Ενεργοποιήστε την για να μην ξεχάσετε ποτέ πληρωμή.',
      eBill: 'Ηλεκτρονικός λογαριασμός',
      eBillOn: 'Λαμβάνετε τον λογαριασμό με email.',
      recent: 'Πρόσφατοι λογαριασμοί',
      allBills: 'Όλοι οι λογαριασμοί',
    },
    bills: {
      title: 'Λογαριασμοί',
      intro: 'Όλοι οι λογαριασμοί σας, ξεκινώντας από τον πιο πρόσφατο.',
      month: 'Μήνας',
      amount: 'Ποσό',
      status: 'Κατάσταση',
      paid: 'Εξοφλήθηκε {date}',
      open: 'Λήγει {date}',
      download: 'PDF',
      downloadLabel: 'Λήψη λογαριασμού {month} σε PDF',
      downloadNote: 'Στην επίδειξη δεν υπάρχουν πραγματικά αρχεία PDF.',
    },
    pay: {
      title: 'Πληρωμή λογαριασμού',
      nothing: 'Δεν υπάρχει ανοιχτό ποσό για πληρωμή.',
      backToOverview: 'Επιστροφή στην επισκόπηση',
      amount: 'Ποσό',
      full: 'Ολόκληρο το ποσό',
      other: 'Άλλο ποσό',
      otherLabel: 'Ποσό σε ευρώ',
      amountError: 'Εισάγετε ποσό από 1 € έως {max}.',
      method: 'Τρόπος πληρωμής',
      card: 'Χρεωστική ή πιστωτική κάρτα',
      cardDesc: 'Ολοκληρώνετε την πληρωμή στην ασφαλή σελίδα της τράπεζας.',
      iris: 'IRIS',
      irisDesc: 'Πληρώνετε από την εφαρμογή της τράπεζάς σας, χωρίς στοιχεία κάρτας.',
      rf: 'Κωδικός RF',
      rfDesc: 'Πληρώνετε σε e-banking, ΑΤΜ ή ταμείο τράπεζας.',
      submitCard: 'Συνέχεια στην τράπεζα',
      submitIris: 'Πληρωμή με IRIS',
      redirecting: 'Μεταφορά στην τράπεζα…',
      waitingIris: 'Εγκρίνετε την πληρωμή στην εφαρμογή της τράπεζάς σας…',
      rfInstructions: 'Χρησιμοποιήστε αυτόν τον κωδικό ως αιτιολογία πληρωμής. Η πληρωμή εμφανίζεται εδώ σε 1–2 εργάσιμες.',
      doneTitle: 'Η πληρωμή ολοκληρώθηκε',
      doneBody: 'Πληρώσατε {amount}. Στείλαμε την απόδειξη στο email σας.',
      remaining: 'Υπόλοιπο λογαριασμού: {amount}',
      receipt: 'Αριθμός απόδειξης',
      paidWith: 'Τρόπος',
      paidAt: 'Ημερομηνία',
      done: 'Επιστροφή στην επισκόπηση',
    },
    methods: { card: 'Κάρτα', iris: 'IRIS', rf: 'Κωδικός RF' },
    footer: {
      support: 'Εξυπηρέτηση πελατών',
      terms: 'Όροι χρήσης',
      privacy: 'Απόρρητο',
    },
  },
  en: {
    demoBanner: 'Demo with sample data. Not connected to a real account.',
    switchLang: 'Ελληνικά',
    switchLangLabel: 'Αλλαγή σε Ελληνικά',
    signOut: 'Sign out',
    contractShort: 'Contract {n}',
    loading: 'Loading…',
    nav: { overview: 'Overview', bills: 'Bills', pay: 'Pay' },
    login: {
      title: 'Sign in to your account',
      intro: 'See what you owe, pay in seconds and download your bills.',
      contract: 'Contract number',
      contractHint: '7 digits, printed at the top right of every bill.',
      password: 'Password',
      show: 'Show',
      hide: 'Hide',
      showLabel: 'Show password',
      hideLabel: 'Hide password',
      submit: 'Sign in',
      submitting: 'Signing in…',
      forgot: 'Forgot your password?',
      demo: 'Fill in a sample account',
      errors: {
        'contract-format': 'Your contract number is 7 digits, with no spaces.',
        'password-empty': 'Enter your password.',
        credentials: 'That contract number and password don’t match. Check them or reset your password.',
      },
    },
    forgot: {
      title: 'Reset your password',
      intro: 'We’ll text a new password to the mobile number on your contract.',
      submit: 'Send text',
      submitting: 'Sending…',
      sent: 'We texted {phone}. Use the new password to sign in.',
      back: 'Back to sign in',
    },
    overview: {
      hello: 'Hello, {name}',
      due: 'Amount due',
      dueOn: 'Due {date}',
      daysLeft: { one: 'in 1 day', other: 'in {n} days', zero: 'today', late: '{n} days overdue' },
      pay: 'Pay {amount}',
      paidTitle: 'You’re all paid up',
      paidBody: 'Your bill due {due} was paid on {date}. The next one is issued on {next}.',
      rf: 'RF payment code',
      rfHelp: 'For e-banking, ATMs or bank counters.',
      copy: 'Copy',
      copied: 'Copied',
      cycleIssued: 'Issued',
      cycleToday: 'Today',
      cycleDue: 'Due',
      cycleLabel: 'Billing cycle progress: issued {issued}, due {due}',
      plan: 'Your plan',
      speed: '{down} Mbps down, {up} Mbps up',
      phoneLine: 'Home phone with unlimited local calls',
      monthly: '{amount} a month',
      contractEnds: 'Contract ends {date}',
      address: 'Service address',
      settings: 'Payment settings',
      autopay: 'Automatic payment',
      autopayOn: 'We charge your card automatically when each bill is due.',
      autopayOff: 'Turn it on so you never miss a payment.',
      eBill: 'Paperless billing',
      eBillOn: 'Your bills arrive by email.',
      recent: 'Recent bills',
      allBills: 'All bills',
    },
    bills: {
      title: 'Bills',
      intro: 'All your bills, most recent first.',
      month: 'Month',
      amount: 'Amount',
      status: 'Status',
      paid: 'Paid {date}',
      open: 'Due {date}',
      download: 'PDF',
      downloadLabel: 'Download {month} bill as PDF',
      downloadNote: 'The demo has no real PDF files.',
    },
    pay: {
      title: 'Pay your bill',
      nothing: 'There’s nothing to pay right now.',
      backToOverview: 'Back to overview',
      amount: 'Amount',
      full: 'Full amount',
      other: 'Another amount',
      otherLabel: 'Amount in euros',
      amountError: 'Enter an amount from €1 to {max}.',
      method: 'Payment method',
      card: 'Debit or credit card',
      cardDesc: 'You finish paying on your bank’s secure page.',
      iris: 'IRIS',
      irisDesc: 'Pay from your banking app, no card details needed.',
      rf: 'RF code',
      rfDesc: 'Pay through e-banking, an ATM or a bank counter.',
      submitCard: 'Continue to your bank',
      submitIris: 'Pay with IRIS',
      redirecting: 'Taking you to your bank…',
      waitingIris: 'Approve the payment in your banking app…',
      rfInstructions: 'Use this code as the payment reference. The payment shows up here within 1–2 business days.',
      doneTitle: 'Payment complete',
      doneBody: 'You paid {amount}. We’ve emailed your receipt.',
      remaining: 'Remaining balance: {amount}',
      receipt: 'Receipt number',
      paidWith: 'Method',
      paidAt: 'Date',
      done: 'Back to overview',
    },
    methods: { card: 'Card', iris: 'IRIS', rf: 'RF code' },
    footer: {
      support: 'Customer support',
      terms: 'Terms of use',
      privacy: 'Privacy',
    },
  },
};

const I18nContext = createContext(null);

function readStoredLang() {
  try {
    const stored = localStorage.getItem('lang');
    return stored === 'en' || stored === 'el' ? stored : 'el';
  } catch {
    return 'el';
  }
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(readStoredLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem('lang', lang); } catch { /* storage unavailable */ }
  }, [lang]);

  const t = useCallback(
    (key, vars = {}) => {
      const value = key.split('.').reduce((node, part) => node?.[part], dict[lang]);
      if (typeof value !== 'string') return key;
      return value.replace(/\{(\w+)\}/g, (_, name) => (name in vars ? vars[name] : `{${name}}`));
    },
    [lang],
  );

  const value = useMemo(
    () => ({ lang, t, toggle: () => setLang((l) => (l === 'el' ? 'en' : 'el')) }),
    [lang, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
