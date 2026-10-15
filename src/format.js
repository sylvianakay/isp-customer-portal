const locales = { el: 'el-GR', en: 'en-GB' };

export function money(amount, lang) {
  return new Intl.NumberFormat(locales[lang], { style: 'currency', currency: 'EUR' }).format(amount);
}

export function date(value, lang, opts = { day: 'numeric', month: 'long', year: 'numeric' }) {
  return new Intl.DateTimeFormat(locales[lang], opts).format(new Date(value));
}

export function shortDate(value, lang) {
  return date(value, lang, { day: 'numeric', month: 'short' });
}

export function monthYear(value, lang) {
  return date(value, lang, { month: 'long', year: 'numeric' });
}

export function daysBetween(a, b) {
  const day = 24 * 60 * 60 * 1000;
  const start = new Date(a); start.setHours(0, 0, 0, 0);
  const end = new Date(b); end.setHours(0, 0, 0, 0);
  return Math.round((end - start) / day);
}
