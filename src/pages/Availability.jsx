import { useId, useRef, useState } from 'react';
import { useI18n } from '../i18n.jsx';
import { Link } from '../router.jsx';
import { checkAvailability, requestCallback } from '../data/mockApi.js';
import Icon from '../components/Icon.jsx';

const resultIcons = { available: 'check', planned: 'calendar', none: 'signal' };

// For people who aren't customers yet: check an address, then (only if they want)
// leave a number for a call back. In the demo the result is a sample and nothing is sent.
export default function Availability() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [queryError, setQueryError] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const queryRef = useRef(null);
  const id = useId();

  async function check(e) {
    e.preventDefault();
    const value = query.trim();
    const postcodeLike = /^\d[\d\s]*$/.test(value);
    if (value.length < 3) return fail('empty');
    if (postcodeLike && !/^\d{3}\s?\d{2}$/.test(value)) return fail('postcode');
    setQueryError('');
    setChecking(true);
    setResult(await checkAvailability(value));
    setChecking(false);
  }

  function fail(key) {
    setQueryError(key);
    queryRef.current?.focus();
  }

  function change() {
    setResult(null);
    requestAnimationFrame(() => queryRef.current?.select());
  }

  return (
    <section className="auth">
      <div className="auth-intro">
        <h1 className="auth-title">{t('availability.title')}</h1>
        <p className="lede">{t('availability.intro')}</p>
      </div>

      <div className="auth-form">
        {!result ? (
          <form className="step-form" onSubmit={check} noValidate>
            <div className="field">
              <label htmlFor={`${id}-query`}>{t('availability.address')}</label>
              <input
                ref={queryRef}
                id={`${id}-query`}
                autoComplete="off"
                placeholder={t('availability.placeholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-invalid={queryError ? 'true' : undefined}
                aria-describedby={`${id}-query-hint${queryError ? ` ${id}-query-error` : ''}`}
              />
              {queryError && (
                <p className="field-error" id={`${id}-query-error`}>{t(`availability.errors.${queryError}`)}</p>
              )}
              <p className="hint" id={`${id}-query-hint`}>{t('availability.demoNote')}</p>
            </div>
            <button type="submit" className="button button-primary button-block" disabled={checking}>
              {checking ? t('availability.checking') : t('availability.check')}
            </button>
          </form>
        ) : (
          <>
            <div className={`availability-result is-${result.status}`} role="status">
              <span className="availability-icon" aria-hidden="true">
                <Icon name={resultIcons[result.status]} size={22} />
              </span>
              <div className="availability-text">
                <p className="availability-title">{t(`availability.results.${result.status}.title`)}</p>
                <p className="availability-detail">{t(`availability.results.${result.status}.detail`)}</p>
                <p className="availability-place">
                  <span>{result.query}</span>
                  <button type="button" className="link-button" onClick={change} aria-label={t('availability.changeLabel')}>
                    {t('availability.change')}
                  </button>
                </p>
              </div>
            </div>
            <Callback key={result.query} status={result.status} address={result.query} />
          </>
        )}

        <Link to="/" className="button button-ghost button-block">{t('availability.back')}</Link>
      </div>
    </section>
  );
}

// One clear button first; the short form only opens if the person asks for it.
function Callback({ status, address }) {
  const { t } = useI18n();
  const kind = status === 'available' ? 'call' : 'notify';
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const refs = { name: useRef(null), phone: useRef(null), consent: useRef(null) };
  const id = useId();

  async function submit(e) {
    e.preventDefault();
    const cleanPhone = phone.replace(/[\s-]/g, '');
    const next = {
      name: !name.trim(),
      // Greek mobile (69…) or landline (2…), 10 digits.
      phone: !/^(69\d{8}|2\d{9})$/.test(cleanPhone),
      consent: !consent,
    };
    setErrors(next);
    const first = ['name', 'phone', 'consent'].find((k) => next[k]);
    if (first) return refs[first].current?.focus();
    setBusy(true);
    setDone(await requestCallback({ name: name.trim(), phone: cleanPhone, address, kind }));
    setBusy(false);
  }

  if (done) {
    return (
      <p className="notice callback-done" role="status">
        {t(`availability.${kind}.done`, { name: done.name, id: done.id })}
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        className={kind === 'call' ? 'button button-primary button-block' : 'button button-secondary button-block'}
        onClick={() => {
          setOpen(true);
          requestAnimationFrame(() => refs.name.current?.focus());
        }}
      >
        {t(`availability.${kind}.open`)}
      </button>
    );
  }

  const describe = (key) => (errors[key] ? `${id}-${key}-error` : undefined);

  return (
    <form className="callback-form" onSubmit={submit} noValidate aria-busy={busy}>
      <p className="callback-note">
        <Icon name="alert" size={16} />
        {t('availability.formNote')}
      </p>
      <div className="field">
        <label htmlFor={`${id}-name`}>{t('availability.name')}</label>
        <input
          ref={refs.name}
          id={`${id}-name`}
          autoComplete="off"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={errors.name ? 'true' : undefined}
          aria-describedby={describe('name')}
        />
        {errors.name && <p className="field-error" id={`${id}-name-error`}>{t('availability.errors.name')}</p>}
      </div>
      <div className="field">
        <label htmlFor={`${id}-phone`}>{t('availability.phone')}</label>
        <input
          ref={refs.phone}
          id={`${id}-phone`}
          type="tel"
          inputMode="tel"
          autoComplete="off"
          maxLength={14}
          placeholder={t('availability.phonePlaceholder')}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          aria-invalid={errors.phone ? 'true' : undefined}
          aria-describedby={describe('phone')}
        />
        {errors.phone && <p className="field-error" id={`${id}-phone-error`}>{t('availability.errors.phone')}</p>}
      </div>
      <div className="field">
        <label className="check">
          <input
            ref={refs.consent}
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            aria-invalid={errors.consent ? 'true' : undefined}
            aria-describedby={describe('consent')}
          />
          <span>{t(`availability.${kind}.consent`)}</span>
        </label>
        {errors.consent && <p className="field-error" id={`${id}-consent-error`}>{t('availability.errors.consent')}</p>}
      </div>
      <button type="submit" className="button button-primary button-block" disabled={busy}>
        {busy ? t('availability.sending') : t('availability.send')}
      </button>
    </form>
  );
}
