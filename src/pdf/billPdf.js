// Builds branded sample bills and payment receipts as real PDFs, entirely in the browser.
// Loaded on demand (dynamic import) so pdf-lib never weighs down the first page load.
// Fira Sans is embedded because the standard PDF fonts have no Greek glyphs.
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { brand } from '../config/brand.js';
import { date, money, monthYear } from '../format.js';

const W = 595.28; // A4 in points
const H = 841.89;
const M = 48;

const hex = (h) => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);
const C = {
  brand: hex('#c20c19'),
  brandWash: hex('#fdf0f0'),
  brandLine: hex('#f3c5c8'),
  ink: hex('#1f1f1f'),
  muted: hex('#5e5c59'),
  line: hex('#e6e3df'),
  paper: hex('#f6f5f3'),
  green: hex('#135235'),
  greenMid: hex('#1d7a4c'),
  greenWash: hex('#e5f3ea'),
  white: rgb(1, 1, 1),
};

let fontBytes;
async function loadFonts() {
  if (!fontBytes) {
    const base = import.meta.env.BASE_URL;
    fontBytes = Promise.all(
      ['FiraSans-Regular.ttf', 'FiraSans-Bold.ttf'].map((f) =>
        fetch(`${base}fonts/${f}`).then((r) => {
          if (!r.ok) throw new Error(`font ${f}: ${r.status}`);
          return r.arrayBuffer();
        }),
      ),
    ).catch((err) => {
      fontBytes = undefined; // let the next click retry
      throw err;
    });
  }
  return fontBytes;
}

const capitalise = (s) => s.charAt(0).toLocaleUpperCase() + s.slice(1);
const locale = (lang) => (lang === 'el' ? 'el-GR' : 'en-GB');

// One A4 page with the brand header, sample watermark and footer already drawn,
// plus drawing helpers that measure positions from the top of the page.
async function startPage({ lang, t, kicker, heading, docTitle }) {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const [regularBytes, boldBytes] = await loadFonts();
  const regular = await doc.embedFont(regularBytes, { subset: true });
  const bold = await doc.embedFont(boldBytes, { subset: true });
  doc.setTitle(`${docTitle} · ${brand.name}`);
  doc.setAuthor(brand.name);
  doc.setLanguage(locale(lang));

  const page = doc.addPage([W, H]);

  const text = (str, x, top, { size = 10.5, font = regular, color = C.ink, align = 'left', opacity } = {}) => {
    const width = font.widthOfTextAtSize(str, size);
    const dx = align === 'right' ? x - width : align === 'center' ? x - width / 2 : x;
    page.drawText(str, { x: dx, y: H - top, size, font, color, opacity });
    return width;
  };
  const label = (str, x, top, align) =>
    text(str.toLocaleUpperCase(locale(lang)), x, top, { size: 8, font: bold, color: C.muted, align });
  const rule = (top, x1 = M, x2 = W - M, color = C.line) =>
    page.drawLine({ start: { x: x1, y: H - top }, end: { x: x2, y: H - top }, thickness: 0.75, color });
  const roundRect = (x, top, w, h, r, opts) =>
    page.drawSvgPath(
      `M${r},0 H${w - r} Q${w},0 ${w},${r} V${h - r} Q${w},${h} ${w - r},${h} H${r} Q0,${h} 0,${h - r} V${r} Q0,0 ${r},0 Z`,
      { x, y: H - top, ...opts },
    );
  const wrap = (str, size, maxWidth, font = regular) => {
    const lines = [];
    let line = '';
    for (const word of str.split(' ')) {
      const next = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
    return lines;
  };
  const pill = (str, right, top, { paid }) => {
    const w = bold.widthOfTextAtSize(str, 10) + 28;
    roundRect(right - w, top, w, 26, 13, { color: paid ? C.greenWash : C.brandWash });
    text(str, right - w / 2, top + 17, { size: 10, font: bold, color: paid ? C.green : C.brand, align: 'center' });
  };

  // Header: red band with a curved bottom edge, echoing the portal's sweep.
  page.drawSvgPath(`M0,0 H${W} V128 C${W * 0.7},172 ${W * 0.3},170 0,150 Z`, { x: 0, y: H, color: C.brand });
  page.drawCircle({ x: W - 10, y: H + 40, size: 160, color: C.white, opacity: 0.07 });
  page.drawCircle({ x: W - 10, y: H + 40, size: 110, color: C.white, opacity: 0.06 });

  // Wordmark (same mark as the portal's Logo component).
  page.drawCircle({ x: M + 12, y: H - 58, size: 10.9, borderColor: C.white, borderWidth: 2.25 });
  page.drawSvgPath('M8.5 19c3-6.5 5.5-6.5 7.5 0s4.5 6.5 7.5 0', {
    x: M,
    y: H - 46,
    scale: 0.75,
    borderColor: C.white,
    borderWidth: 3,
    borderLineCap: 1,
  });
  text(brand.name.toLowerCase(), M + 32, 66, { size: 22, font: bold, color: C.white });
  text(kicker.toLocaleUpperCase(locale(lang)), W - M, 50, { size: 9, font: bold, color: C.white, align: 'right', opacity: 0.8 });
  text(heading, W - M, 72, { size: 18, font: bold, color: C.white, align: 'right' });

  // Watermark, so a sample can never pass as a real document.
  page.drawText(t('pdf.sample'), { x: 120, y: 250, size: 120, font: bold, color: C.brand, opacity: 0.045, rotate: degrees(32) });

  // Footer.
  rule(H - 64);
  text(`${t('pdf.support')}${brand.supportPhone ? `: ${brand.supportPhone}` : ''} · ${brand.supportHours[lang]}`, M, H - 44, { size: 9, color: C.muted });
  text(t('pdf.sampleNote'), M, H - 30, { size: 9, font: bold, color: C.brand });
  text('1 / 1', W - M, H - 44, { size: 9, color: C.muted, align: 'right' });

  return { doc, page, regular, bold, text, label, rule, roundRect, wrap, pill };
}

function holderName(account, lang) {
  return lang === 'el'
    ? `${account.holder.firstName} ${account.holder.lastName}`
    : `${account.holder.firstNameEn} ${account.holder.lastNameEn}`;
}

// Customer block on the left, key/value details on the right.
function drawParties(p, { account, lang, t, detailsLabel, details }) {
  const top = 200;
  p.label(t('pdf.customer'), M, top);
  p.text(holderName(account, lang), M, top + 20, { size: 13, font: p.bold });
  p.text(account.address[lang], M, top + 37);
  p.text(`${t('pdf.contract')}: ${account.contract}`, M, top + 53, { color: C.muted });

  const colX = 330;
  p.label(detailsLabel, colX, top);
  details.forEach(([k, v], i) => {
    const labelWidth = p.text(k, colX, top + 20 + i * 16, { color: C.muted, size: 10 });
    // Long values shrink to fit beside their label instead of overlapping it.
    const room = W - M - colX - labelWidth - 10;
    let size = 10;
    while (size > 7 && p.bold.widthOfTextAtSize(v, size) > room) size -= 0.5;
    p.text(v, W - M, top + 20 + i * 16, { font: p.bold, size, align: 'right' });
  });
}

export async function createBillPdf({ bill, account, lang, t }) {
  const month = capitalise(monthYear(bill.period, lang));
  const p = await startPage({ lang, t, kicker: t('pdf.title'), heading: month, docTitle: `${t('pdf.title')} ${month}` });

  drawParties(p, {
    account,
    lang,
    t,
    detailsLabel: t('pdf.details'),
    details: [
      [t('pdf.number'), bill.id],
      [t('pdf.issued'), date(bill.issued, lang)],
      [t('pdf.period'), month],
      [t('pdf.due'), date(bill.due, lang)],
    ],
  });

  // Total box.
  let top = 300;
  p.roundRect(M, top, W - 2 * M, 84, 14, { color: C.paper });
  p.label(t('pdf.total'), M + 22, top + 26);
  p.text(money(bill.amount, lang), M + 22, top + 64, { size: 32, font: p.bold });
  const paid = bill.status === 'paid';
  p.pill(paid ? t('pdf.paidOn', { date: date(bill.paidOn, lang) }) : t('pdf.payBy', { date: date(bill.due, lang) }), W - M - 22, top + 30, { paid });

  // Charges. Credits (negative lines) print in green.
  top = 424;
  p.label(t('pdf.charges'), M, top);
  top += 22;
  p.text(t('pdf.description'), M, top, { size: 9, color: C.muted });
  p.text(t('pdf.amount'), W - M, top, { size: 9, color: C.muted, align: 'right' });
  top += 9;
  p.rule(top, M, W - M, C.ink);

  for (const line of bill.lines ?? [{ key: 'plan', amount: bill.amount }]) {
    const credit = line.amount < 0;
    top += 24;
    p.text(t(`pdf.lines.${line.key}`, { plan: account.plan.name }), M, top, { color: credit ? C.greenMid : C.ink });
    p.text(money(line.amount, lang), W - M, top, { align: 'right', color: credit ? C.greenMid : C.ink });
    top += 10;
    p.rule(top);
  }

  const net = Math.round((bill.amount / 1.24) * 100) / 100;
  const vat = Math.round((bill.amount - net) * 100) / 100;
  const sumX = 330;
  top += 22;
  p.text(t('pdf.net'), sumX, top, { color: C.muted });
  p.text(money(net, lang), W - M, top, { align: 'right' });
  top += 18;
  p.text(t('pdf.vat'), sumX, top, { color: C.muted });
  p.text(money(vat, lang), W - M, top, { align: 'right' });
  top += 12;
  p.rule(top, sumX);
  top += 20;
  p.text(t('pdf.total'), sumX, top, { font: p.bold, size: 12 });
  p.text(money(bill.amount, lang), W - M, top, { font: p.bold, size: 12, align: 'right' });

  // How to pay, with the RF code.
  top += 34;
  const howLines = p.wrap(t('pdf.howToPayBody'), 9.5, 250);
  const boxH = Math.max(78, 44 + howLines.length * 13);
  p.roundRect(M, top, W - 2 * M, boxH, 14, { color: C.brandWash, borderColor: C.brandLine, borderWidth: 0.75 });
  p.label(t('overview.rf'), M + 22, top + 26);
  p.text(bill.rfCode ?? '—', M + 22, top + 50, { size: 16, font: p.bold });
  p.label(t('pdf.howToPay'), 300, top + 26);
  howLines.forEach((l, i) => p.text(l, 300, top + 44 + i * 13, { size: 9.5, color: C.muted }));

  return p.doc.save();
}

// `receipt` is { id, amount, method, paidOn }; `bill` is the bill it paid.
export async function createReceiptPdf({ receipt, bill, account, lang, t }) {
  const month = capitalise(monthYear(bill.period, lang));
  const title = t('pdf.receipt.title');
  const p = await startPage({ lang, t, kicker: title, heading: receipt.id, docTitle: `${title} ${receipt.id}` });

  drawParties(p, {
    account,
    lang,
    t,
    detailsLabel: title,
    details: [
      [t('pdf.receipt.number'), receipt.id],
      [t('pdf.receipt.paidAt'), date(receipt.paidOn, lang, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })],
      [t('pdf.receipt.method'), t(`methods.${receipt.method}`)],
      [t('pdf.receipt.forBill'), `${bill.id} · ${month}`],
    ],
  });

  // Amount paid, with a green check mark.
  let top = 300;
  p.roundRect(M, top, W - 2 * M, 84, 14, { color: C.greenWash });
  p.label(t('pdf.receipt.amountPaid'), M + 22, top + 26);
  p.text(money(receipt.amount, lang), M + 22, top + 64, { size: 32, font: p.bold, color: C.green });
  const cx = W - M - 48;
  const cy = H - (top + 42);
  p.page.drawCircle({ x: cx, y: cy, size: 22, color: C.greenMid });
  p.page.drawSvgPath('M-8,0 L-2.5,5.5 L8.5,-6', { x: cx, y: cy, borderColor: C.white, borderWidth: 3, borderLineCap: 1 });
  p.text(t('pdf.receipt.received'), cx - 34, top + 46, { size: 11, font: p.bold, color: C.green, align: 'right' });

  top = 424;
  p.wrap(t('pdf.receipt.thanks'), 11, W - 2 * M).forEach((l, i) => p.text(l, M, top + i * 16, { size: 11 }));
  top += 28;
  if (receipt.method === 'card') {
    p.wrap(t('pdf.receipt.processor', { provider: brand.paymentProvider[lang] }), 9.5, W - 2 * M).forEach((l, i) =>
      p.text(l, M, top + i * 13, { size: 9.5, color: C.muted }),
    );
  }

  return p.doc.save();
}

function save(bytes, filename) {
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

const slug = () => brand.name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');

export async function downloadBillPdf(args) {
  save(await createBillPdf(args), `${slug()}-${args.bill.period.slice(0, 7)}.pdf`);
}

export async function downloadReceiptPdf(args) {
  save(await createReceiptPdf(args), `${slug()}-receipt-${args.receipt.id}.pdf`);
}
