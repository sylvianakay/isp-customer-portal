import { useState } from 'react';
import { useI18n } from '../i18n.jsx';
import { Link } from '../router.jsx';
import { useData } from '../useData.js';
import { getAccount, getBills, setAutopay } from '../data/mockApi.js';
import { daysBetween, date, money, monthYear, shortDate } from '../format.js';
import Icon from '../components/Icon.jsx';
import CopyButton from '../components/CopyButton.jsx';

export default function Overview() {
  const { t, lang } = useI18n();
  const { data: account, setData: setAccount } = useData(getAccount);
  const { data: bills } = useData(getBills);

  if (!account) return <p className="loading" role="status">{t('loading')}</p>;

  const name = lang === 'el' ? account.holder.firstName : account.holder.firstNameEn;

  return (
    <div className="page">
      <h1 className="page-title">{t('overview.hello', { name })}</h1>

      <BillStatus current={account.current} />

      {account.bonus && <BonusPanel bonus={account.bonus} />}

      <div className="overview-grid">
        <section className="panel" aria-labelledby="plan-heading">
          <h2 id="plan-heading" className="panel-title">{t('overview.plan')}</h2>
          <p className="plan-name">{account.plan.name}</p>
          <ul className="facts">
            <li>
              <Icon name="signal" />
              <span>{t('overview.speed', { down: account.plan.download, up: account.plan.upload })}</span>
            </li>
            {account.plan.phoneLine && (
              <li>
                <Icon name="phone" />
                <span>{t('overview.phoneLine')}</span>
              </li>
            )}
            <li>
              <Icon name="home" />
              <span>{account.address[lang]}</span>
            </li>
            <li>
              <Icon name="calendar" />
              <span>{t('overview.contractEnds', { date: date(account.plan.contractEnds, lang) })}</span>
            </li>
          </ul>
          <p className="plan-price">{t('overview.monthly', { amount: money(account.plan.monthly, lang) })}</p>
        </section>

        <section className="panel" aria-labelledby="settings-heading">
          <h2 id="settings-heading" className="panel-title">{t('overview.settings')}</h2>
          <AutopaySwitch
            enabled={account.autopay}
            onChange={async (enabled) => {
              setAccount({ ...account, autopay: enabled });
              await setAutopay(enabled);
            }}
          />
          <div className="setting">
            <div>
              <p className="setting-name">{t('overview.eBill')}</p>
              <p className="setting-desc">{t('overview.eBillOn')}</p>
            </div>
            <Icon name="check" className="setting-check" />
          </div>
        </section>
      </div>

      <section className="panel" aria-labelledby="recent-heading">
        <div className="panel-head">
          <h2 id="recent-heading" className="panel-title">{t('overview.recent')}</h2>
          <Link to="/bills" className="quiet-link">{t('overview.allBills')}</Link>
        </div>
        {bills && (
          <ul className="bill-rows">
            {bills
              .filter((b) => b.status === 'paid')
              .slice(0, 3)
              .map((bill) => (
                <li key={bill.id} className="bill-row">
                  <span className="bill-month">{monthYear(bill.period, lang)}</span>
                  <span className="bill-meta">{t('bills.paid', { date: shortDate(bill.paidOn, lang) })}</span>
                  <span className="bill-amount">{money(bill.amount, lang)}</span>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function BillStatus({ current }) {
  const { t, lang } = useI18n();

  if (current.status === 'paid') {
    const next = new Date(current.issued);
    next.setMonth(next.getMonth() + 1);
    return (
      <section className="bill bill-paid" aria-labelledby="bill-heading">
        <div className="bill-paid-mark">
          <Icon name="check" size={28} />
        </div>
        <div>
          <h2 id="bill-heading" className="bill-paid-title">{t('overview.paidTitle')}</h2>
          <p className="bill-paid-body">
            {t('overview.paidBody', {
              due: date(current.due, lang),
              date: date(current.paidOn, lang),
              next: date(next, lang),
            })}
          </p>
        </div>
      </section>
    );
  }

  const today = new Date();
  const left = daysBetween(today, current.due);
  const daysText =
    left < 0
      ? t('overview.daysLeft.late', { n: -left })
      : left === 0
        ? t('overview.daysLeft.zero')
        : left === 1
          ? t('overview.daysLeft.one')
          : t('overview.daysLeft.other', { n: left });

  return (
    <section className={`bill${left <= 3 ? ' bill-urgent' : ''}`} aria-labelledby="bill-heading">
      <div className="bill-hero">
        <div className="bill-main">
          <h2 id="bill-heading" className="bill-label">{t('overview.due')}</h2>
          <p className="bill-amount-big">{money(current.balance, lang)}</p>
          {current.bonusApplied > 0 && (
            <p className="bill-breakdown">
              {t('overview.breakdown', { charges: money(current.charges, lang), bonus: money(current.bonusApplied, lang) })}
            </p>
          )}
          <p className="bill-due">
            <strong>{t('overview.dueOn', { date: date(current.due, lang) })}</strong>
            <span className="bill-days">{daysText}</span>
          </p>
          <Link to="/pay" className="button button-on-brand button-large">
            {t('overview.pay', { amount: money(current.balance, lang) })}
          </Link>
        </div>

        <CycleTrack issued={current.issued} due={current.due} />
      </div>

      <div className="rf">
        <div>
          <p className="rf-label">{t('overview.rf')}</p>
          <p className="rf-code">{current.rfCode}</p>
          <p className="rf-help">{t('overview.rfHelp')}</p>
        </div>
        <CopyButton value={current.rfCode.replace(/\s/g, '')} />
      </div>
    </section>
  );
}

// The billing cycle drawn as a line: issue date on the left, due date on the
// right, and a marker for today. Tells you at a glance how much time is left.
// The bonus wallet: balance, how far it goes, the half-the-fee rule and recent activity.
function BonusPanel({ bonus }) {
  const { t, lang } = useI18n();
  const bills = Math.floor(bonus.balance / bonus.capPerBill);
  const enough =
    bills === 0 ? t('overview.bonus.enough.zero') : bills === 1 ? t('overview.bonus.enough.one') : t('overview.bonus.enough.other', { n: bills });
  // Visual gauge of the next six bills the balance can cover.
  const slots = 6;

  return (
    <section className="panel bonus" aria-labelledby="bonus-heading">
      <div className="bonus-summary">
        <h2 id="bonus-heading" className="panel-title">{t('overview.bonus.title')}</h2>
        <p className="bonus-amount">{money(bonus.balance, lang)}</p>
        <p className="bonus-explain">{t('overview.bonus.explain', { cap: money(bonus.capPerBill, lang) })}</p>
        <div className="bonus-gauge" role="img" aria-label={enough}>
          {Array.from({ length: slots }, (_, i) => (
            <span key={i} className={i < bills ? 'bonus-slot is-full' : 'bonus-slot'} style={{ '--i': i }} />
          ))}
        </div>
        <p className="bonus-enough">{enough}</p>
        <p className="hint">{t('overview.bonus.rule')}</p>
      </div>

      <div className="bonus-activity">
        <h3 className="bonus-activity-title">{t('overview.bonus.history')}</h3>
        <ul className="bonus-entries">
          {bonus.entries.slice(0, 4).map((entry) => {
            const credit = entry.amount > 0;
            return (
              <li key={`${entry.key}-${entry.date}`} className="bonus-entry">
                <span className={credit ? 'bonus-dot is-credit' : 'bonus-dot'} aria-hidden="true">
                  <Icon name={credit ? 'gift' : 'receipt'} size={16} />
                </span>
                <span className="bonus-entry-text">
                  <span className="bonus-entry-name">
                    {t(`overview.bonus.entries.${entry.key}`, { month: monthYear(entry.date, lang) })}
                  </span>
                  <span className="bonus-entry-date">{shortDate(entry.date, lang)}</span>
                </span>
                <span className={credit ? 'bonus-entry-amount is-credit' : 'bonus-entry-amount'}>
                  {credit ? '+' : '−'}
                  {money(Math.abs(entry.amount), lang)}
                </span>
              </li>
            );
          })}
        </ul>
        <Link to="/refer" className="bonus-refer">
          <Icon name="gift" size={20} />
          <span className="bonus-refer-text">{t('overview.bonus.refer')}</span>
          <span className="bonus-refer-cta">
            {t('overview.bonus.referCta')}
            <Icon name="back" size={16} className="flip" />
          </span>
        </Link>
      </div>
    </section>
  );
}

function CycleTrack({ issued, due }) {
  const { t, lang } = useI18n();
  const total = Math.max(1, daysBetween(issued, due));
  const elapsed = Math.min(total, Math.max(0, daysBetween(issued, new Date())));
  const pct = (elapsed / total) * 100;

  return (
    <div
      className="cycle"
      role="img"
      aria-label={t('overview.cycleLabel', { issued: date(issued, lang), due: date(due, lang) })}
    >
      <div className="cycle-line">
        <div className="cycle-fill" style={{ width: `${pct}%` }} />
        <div className="cycle-today" style={{ left: `${pct}%` }}>
          <span className="cycle-today-label">{t('overview.cycleToday')}</span>
        </div>
      </div>
      <div className="cycle-ends">
        <span>
          {t('overview.cycleIssued')} <strong>{shortDate(issued, lang)}</strong>
        </span>
        <span>
          {t('overview.cycleDue')} <strong>{shortDate(due, lang)}</strong>
        </span>
      </div>
    </div>
  );
}

function AutopaySwitch({ enabled, onChange }) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  return (
    <div className="setting">
      <div>
        <p className="setting-name" id="autopay-label">{t('overview.autopay')}</p>
        <p className="setting-desc">{enabled ? t('overview.autopayOn') : t('overview.autopayOff')}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-labelledby="autopay-label"
        className="switch"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await onChange(!enabled);
          setBusy(false);
        }}
      >
        <span className="switch-thumb" />
      </button>
    </div>
  );
}
