import { useId, useRef, useState } from 'react';
import { useI18n } from '../i18n.jsx';
import { Link } from '../router.jsx';
import { useData } from '../useData.js';
import { getAccount, startPayment } from '../data/mockApi.js';
import { date, money } from '../format.js';
import Icon from '../components/Icon.jsx';
import CopyButton from '../components/CopyButton.jsx';
import { brand } from '../config/brand.js';

const methods = [
  { id: 'card', icon: 'card' },
  { id: 'iris', icon: 'phone' },
  { id: 'rf', icon: 'bank' },
];

export default function Pay() {
  const { t, lang } = useI18n();
  const { data: account } = useData(getAccount);
  const [amountMode, setAmountMode] = useState('full');
  const [otherAmount, setOtherAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const [method, setMethod] = useState('card');
  const [phase, setPhase] = useState('form'); // form | processing | done
  const [receipt, setReceipt] = useState(null);
  const [receiptState, setReceiptState] = useState('idle'); // idle | working | failed
  const otherRef = useRef(null);
  const id = useId();

  if (!account) return <p className="loading" role="status">{t('loading')}</p>;

  const balance = account.current.balance;

  if (phase === 'done' && receipt) {
    return (
      <div className="page page-narrow">
        <section className="done" aria-labelledby="done-heading">
          <div className="done-mark">
            <Icon name="check" size={32} />
          </div>
          <h1 id="done-heading" className="page-title" tabIndex={-1} ref={(el) => el?.focus()}>
            {t('pay.doneTitle')}
          </h1>
          <p className="lede">{t('pay.doneBody', { amount: money(receipt.amount, lang) })}</p>
          {receipt.balance > 0 && <p className="lede">{t('pay.remaining', { amount: money(receipt.balance, lang) })}</p>}
          <dl className="receipt">
            <div>
              <dt>{t('pay.receipt')}</dt>
              <dd>{receipt.id}</dd>
            </div>
            <div>
              <dt>{t('pay.paidWith')}</dt>
              <dd>{t(`methods.${receipt.method}`)}</dd>
            </div>
            <div>
              <dt>{t('pay.paidAt')}</dt>
              <dd>{date(receipt.paidOn, lang, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</dd>
            </div>
          </dl>
          <button
            type="button"
            className="button button-secondary button-block"
            aria-busy={receiptState === 'working'}
            disabled={receiptState === 'working'}
            onClick={async () => {
              setReceiptState('working');
              try {
                const { downloadReceiptPdf } = await import('../pdf/billPdf.js');
                const bill = { ...account.current, period: account.current.issued };
                await downloadReceiptPdf({ receipt, bill, account, lang, t });
                setReceiptState('idle');
              } catch {
                setReceiptState('failed');
              }
            }}
          >
            <Icon name="download" size={18} className={receiptState === 'working' ? 'is-working' : undefined} />
            {receiptState === 'working' ? t('bills.downloading') : t('pay.downloadReceipt')}
          </button>
          {receiptState === 'failed' && <p className="field-error" role="alert">{t('bills.downloadFailed')}</p>}
          <Link to="/overview" className="button button-primary button-block">{t('pay.done')}</Link>
        </section>
      </div>
    );
  }

  if (balance === 0) {
    return (
      <div className="page page-narrow">
        <h1 className="page-title">{t('pay.title')}</h1>
        <p className="lede">{t('pay.nothing')}</p>
        <Link to="/overview" className="button button-secondary">{t('pay.backToOverview')}</Link>
      </div>
    );
  }

  const maxText = money(balance, lang);

  function readAmount() {
    if (amountMode === 'full') return balance;
    const value = Number(otherAmount.replace(',', '.'));
    if (!Number.isFinite(value) || value < 1 || value > balance) return null;
    return Math.round(value * 100) / 100;
  }

  async function onSubmit(e) {
    e.preventDefault();
    const amount = readAmount();
    if (amount === null) {
      setAmountError(t('pay.amountError', { max: maxText }));
      otherRef.current?.focus();
      return;
    }
    setAmountError('');
    setPhase('processing');
    const result = await startPayment({ amount, method });
    setReceipt(result);
    setPhase('done');
  }

  const processing = phase === 'processing';

  return (
    <div className="page page-narrow">
      <Link to="/overview" className="back-link">
        <Icon name="back" size={18} />
        {t('pay.backToOverview')}
      </Link>
      <h1 className="page-title">{t('pay.title')}</h1>

      <form className="pay-form" onSubmit={onSubmit} noValidate aria-busy={processing}>
        <fieldset className="pay-group" disabled={processing}>
          <legend className="pay-legend">{t('pay.amount')}</legend>
          <label className={`choice${amountMode === 'full' ? ' is-selected' : ''}`}>
            <input type="radio" name="amount" value="full" checked={amountMode === 'full'} onChange={() => setAmountMode('full')} />
            <span className="choice-body">
              <span className="choice-title">{t('pay.full')}</span>
            </span>
            <span className="choice-amount">{maxText}</span>
          </label>
          <label className={`choice${amountMode === 'other' ? ' is-selected' : ''}`}>
            <input
              type="radio"
              name="amount"
              value="other"
              checked={amountMode === 'other'}
              onChange={() => {
                setAmountMode('other');
                setTimeout(() => otherRef.current?.focus(), 0);
              }}
            />
            <span className="choice-body">
              <span className="choice-title">{t('pay.other')}</span>
            </span>
          </label>
          {amountMode === 'other' && (
            <div className="field field-inset">
              <label htmlFor={`${id}-other`}>{t('pay.otherLabel')}</label>
              <div className="input-with-unit">
                <input
                  ref={otherRef}
                  id={`${id}-other`}
                  inputMode="decimal"
                  value={otherAmount}
                  onChange={(e) => setOtherAmount(e.target.value)}
                  aria-invalid={amountError ? 'true' : undefined}
                  aria-describedby={amountError ? `${id}-other-error` : undefined}
                />
                <span className="input-unit" aria-hidden="true">€</span>
              </div>
              {amountError && <p className="field-error" id={`${id}-other-error`}>{amountError}</p>}
            </div>
          )}
        </fieldset>

        <fieldset className="pay-group" disabled={processing}>
          <legend className="pay-legend">{t('pay.method')}</legend>
          {methods.map((m) => (
            <label key={m.id} className={`choice${method === m.id ? ' is-selected' : ''}`}>
              <input type="radio" name="method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} />
              <Icon name={m.icon} size={22} className="choice-icon" />
              <span className="choice-body">
                <span className="choice-title">{t(`pay.${m.id}`)}</span>
                <span className="choice-desc">{t(`pay.${m.id}Desc`, { provider: brand.paymentProvider[lang] })}</span>
              </span>
            </label>
          ))}
        </fieldset>

        {method === 'rf' ? (
          <div className="rf rf-standalone">
            <div>
              <p className="rf-label">{t('overview.rf')}</p>
              <p className="rf-code">{account.current.rfCode}</p>
              <p className="rf-help">{t('pay.rfInstructions')}</p>
            </div>
            <CopyButton value={account.current.rfCode.replace(/\s/g, '')} />
          </div>
        ) : (
          <button type="submit" className="button button-primary button-block button-large" disabled={processing}>
            {processing
              ? method === 'card'
                ? t('pay.redirecting')
                : t('pay.waitingIris')
              : method === 'card'
                ? t('pay.submitCard')
                : t('pay.submitIris')}
          </button>
        )}
        <p className="visually-hidden" role="status">
          {processing ? (method === 'card' ? t('pay.redirecting') : t('pay.waitingIris')) : ''}
        </p>
      </form>
    </div>
  );
}
