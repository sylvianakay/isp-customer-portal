import { useId, useRef, useState } from 'react';
import { brand } from '../config/brand.js';
import { useI18n } from '../i18n.jsx';
import { useData } from '../useData.js';
import { createTicket, getSupport, runLineTest } from '../data/mockApi.js';
import { shortDate } from '../format.js';
import Icon from '../components/Icon.jsx';

const testSteps = ['line', 'network', 'speed'];
const categories = ['technical', 'billing', 'plan', 'other'];
const faqs = ['q1', 'q2', 'q3', 'q4'];

export default function Support() {
  const { t, lang } = useI18n();
  const { data, setData } = useData(getSupport);

  if (!data) return <p className="loading" role="status">{t('loading')}</p>;

  return (
    <div className="page support">
      <div>
        <h1 className="page-title">{t('support.title')}</h1>
        <p className="lede">{t('support.intro')}</p>
      </div>

      {data.networkOk && (
        <p className="network-ok">
          <span className="network-dot" aria-hidden="true" />
          {t('support.statusOk', { area: data.area[lang] })}
        </p>
      )}

      <div className="support-grid">
        <LineTest />

        <section className="panel" aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="panel-title">{t('support.contact')}</h2>
          <ul className="contact-list">
            <li>
              <Icon name="phone" />
              <span>
                <span className="contact-label">{t('support.phone')}</span>
                <strong>{brand.supportPhone ?? t('support.phoneNeutral')}</strong>
              </span>
            </li>
            <li>
              <Icon name="support" />
              <span>
                <span className="contact-label">{t('support.email')}</span>
                <strong>{brand.supportEmail ?? t('support.emailNeutral')}</strong>
              </span>
            </li>
            <li>
              <Icon name="calendar" />
              <span className="contact-hours">{brand.supportHours[lang]}</span>
            </li>
          </ul>
        </section>
      </div>

      <section className="panel" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="panel-title">{t('support.faq')}</h2>
        <div className="faq">
          {faqs.map((q) => (
            <details key={q} className="faq-item">
              <summary>
                <span>{t(`support.${q}.q`)}</span>
                <Icon name="back" size={18} className="faq-chevron" />
              </summary>
              <p>{t(`support.${q}.a`)}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="support-grid">
        <TicketForm onCreated={(ticket) => setData({ ...data, tickets: [ticket, ...data.tickets] })} />

        <section className="panel" aria-labelledby="tickets-heading">
          <h2 id="tickets-heading" className="panel-title">{t('support.tickets')}</h2>
          <ul className="tickets">
            {data.tickets.map((ticket) => (
              <li key={ticket.id} className="ticket">
                <span className="ticket-text">
                  <span className="ticket-subject">{ticket.subject[lang]}</span>
                  <span className="ticket-meta">
                    {ticket.id} · {t(`support.categories.${ticket.category}`)} · {shortDate(ticket.date, lang)}
                  </span>
                </span>
                <span className={`status ticket-${ticket.status}`}>{t(`support.ticketStatus.${ticket.status}`)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

// Walks through three checks with live progress, then shows the result.
function LineTest() {
  const { t } = useI18n();
  const [phase, setPhase] = useState('idle'); // idle | running | done
  const [doneSteps, setDoneSteps] = useState(0);
  const [result, setResult] = useState(null);

  async function run() {
    setPhase('running');
    setResult(null);
    setDoneSteps(0);
    const timers = testSteps.map((_, i) => setTimeout(() => setDoneSteps(i + 1), 650 * (i + 1)));
    const res = await runLineTest();
    timers.forEach(clearTimeout);
    setDoneSteps(testSteps.length);
    setResult(res);
    setPhase('done');
  }

  return (
    <section className="panel line-test" aria-labelledby="test-heading">
      <h2 id="test-heading" className="panel-title">{t('support.test')}</h2>
      <p className="hint">{t('support.testIntro')}</p>
      <ol className="test-steps">
        {testSteps.map((s, i) => {
          const state = i < doneSteps ? 'is-done' : phase === 'running' && i === doneSteps ? 'is-running' : '';
          return (
            <li key={s} className={`test-step ${state}`}>
              <span className="test-mark" aria-hidden="true">
                {i < doneSteps ? <Icon name="check" size={14} /> : null}
              </span>
              {t(`support.testSteps.${s}`)}
            </li>
          );
        })}
      </ol>
      <div role="status" aria-live="polite">
        {result && (
          <div className="test-result">
            <p className="test-ok">{t('support.testOk')}</p>
            <p className="test-detail">{t('support.testDetail', { down: result.down, up: result.up, ping: result.ping })}</p>
            <p className="hint">{t('support.testTip')}</p>
            <p className="hint test-sample">{t('support.sampleResult')}</p>
          </div>
        )}
      </div>
      <button type="button" className="button button-secondary" onClick={run} disabled={phase === 'running'} aria-busy={phase === 'running'}>
        {phase === 'running' ? t('support.running') : phase === 'done' ? t('support.runAgain') : t('support.runTest')}
      </button>
    </section>
  );
}

function TicketForm({ onCreated }) {
  const { t } = useI18n();
  const [category, setCategory] = useState('technical');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [contactBy, setContactBy] = useState('phone');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState('');
  const subjectRef = useRef(null);
  const messageRef = useRef(null);
  const id = useId();

  async function submit(e) {
    e.preventDefault();
    const next = { subject: !subject.trim(), message: message.trim().length < 5 };
    setErrors(next);
    setSent('');
    if (next.subject) return subjectRef.current?.focus();
    if (next.message) return messageRef.current?.focus();
    setBusy(true);
    const ticket = await createTicket({ category, subject: subject.trim(), message: message.trim(), contactBy });
    setBusy(false);
    onCreated(ticket);
    setSent(t('support.sent', { id: ticket.id }));
    setSubject('');
    setMessage('');
  }

  return (
    <section className="panel" aria-labelledby="form-heading">
      <h2 id="form-heading" className="refer-form-title">{t('support.form')}</h2>
      <form className="refer-form ticket-form" onSubmit={submit} noValidate aria-busy={busy}>
        <div className="field">
          <label htmlFor={`${id}-category`}>{t('support.category')}</label>
          <select id={`${id}-category`} value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c} value={c}>{t(`support.categories.${c}`)}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${id}-subject`}>{t('support.subject')}</label>
          <input
            ref={subjectRef}
            id={`${id}-subject`}
            value={subject}
            maxLength={80}
            onChange={(e) => setSubject(e.target.value)}
            aria-invalid={errors.subject ? 'true' : undefined}
            aria-describedby={errors.subject ? `${id}-subject-error` : undefined}
          />
          {errors.subject && <p className="field-error" id={`${id}-subject-error`}>{t('support.errors.subject')}</p>}
        </div>
        <div className="field">
          <label htmlFor={`${id}-message`}>{t('support.message')}</label>
          <textarea
            ref={messageRef}
            id={`${id}-message`}
            rows={4}
            value={message}
            placeholder={t('support.messageHint')}
            onChange={(e) => setMessage(e.target.value)}
            aria-invalid={errors.message ? 'true' : undefined}
            aria-describedby={errors.message ? `${id}-message-error` : undefined}
          />
          {errors.message && <p className="field-error" id={`${id}-message-error`}>{t('support.errors.message')}</p>}
        </div>
        <fieldset className="segmented">
          <legend>{t('support.contactBy')}</legend>
          {['phone', 'email'].map((c) => (
            <label key={c} className={contactBy === c ? 'segment is-selected' : 'segment'}>
              <input type="radio" name={`${id}-contact`} value={c} checked={contactBy === c} onChange={() => setContactBy(c)} />
              {t(c === 'phone' ? 'support.byPhone' : 'support.byEmail')}
            </label>
          ))}
        </fieldset>
        <button type="submit" className="button button-primary button-block" disabled={busy}>
          {busy ? t('support.submitting') : t('support.submit')}
        </button>
        <p className={sent ? 'notice' : 'visually-hidden'} role="status">{sent}</p>
      </form>
    </section>
  );
}
