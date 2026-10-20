import { useId, useRef, useState } from 'react';
import { brand } from '../config/brand.js';
import { useI18n } from '../i18n.jsx';
import { Link } from '../router.jsx';
import { useData } from '../useData.js';
import { getReferrals, submitReferral } from '../data/mockApi.js';
import { money, shortDate } from '../format.js';
import Icon from '../components/Icon.jsx';
import CopyButton from '../components/CopyButton.jsx';

// Mirrors how the referral scheme already works (the friend names you when they
// apply, you both get a month's fee once they're connected), and makes it doable
// from here: share a code, or hand the friend's details straight to sales.
export default function Refer() {
  const { t, lang } = useI18n();
  const { data, setData } = useData(getReferrals);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState('');
  const [shareNote, setShareNote] = useState('');
  const refs = { name: useRef(null), phone: useRef(null), consent: useRef(null) };
  const id = useId();

  if (!data) return <p className="loading" role="status">{t('loading')}</p>;

  const reward = money(data.reward, lang);
  const shareText = t('refer.shareText', { brand: brand.name, code: data.code });

  async function share() {
    setShareNote('');
    if (navigator.share) {
      try {
        await navigator.share({ title: t('refer.shareTitle', { brand: brand.name }), text: shareText });
        return;
      } catch (err) {
        if (err?.name === 'AbortError') return; // the person closed the share sheet
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setShareNote(t('refer.shared'));
    } catch {
      /* clipboard blocked; the code is still visible to copy by hand */
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    const cleanPhone = phone.replace(/[\s-]/g, '');
    const next = {};
    if (!name.trim()) next.name = true;
    if (!/^69\d{8}$/.test(cleanPhone)) next.phone = true;
    if (!consent) next.consent = true;
    setErrors(next);
    setSent('');
    const first = ['name', 'phone', 'consent'].find((k) => next[k]);
    if (first) {
      refs[first].current?.focus();
      return;
    }
    setBusy(true);
    const entry = await submitReferral({ name: name.trim(), phone: cleanPhone, area: area.trim() });
    setData({ ...data, list: [entry, ...data.list] });
    setSent(t('refer.sent', { name: entry.name }));
    setName('');
    setPhone('');
    setArea('');
    setConsent(false);
    setBusy(false);
  }

  const describe = (key, hint) => [hint, errors[key] && `${id}-${key}-error`].filter(Boolean).join(' ') || undefined;

  return (
    <div className="page refer">
      <Link to="/overview" className="back-link">
        <Icon name="back" size={18} />
        {t('refer.back')}
      </Link>

      <section className="refer-hero" aria-labelledby="refer-title">
        <div className="refer-hero-text">
          <h1 id="refer-title" className="refer-title">{t('refer.title')}</h1>
          <p className="refer-intro">{t('refer.intro', { amount: reward })}</p>
        </div>
        <div className="refer-code">
          <p className="refer-code-label">{t('refer.code')}</p>
          <p className="refer-code-value">{data.code}</p>
          <div className="refer-code-actions">
            <button type="button" className="button button-on-brand" onClick={share}>
              <Icon name="share" size={18} />
              {t('refer.share')}
            </button>
            <CopyButton value={data.code} />
          </div>
          <p className="refer-share-note" role="status">{shareNote}</p>
        </div>
      </section>

      <section className="panel" aria-labelledby="refer-how">
        <h2 id="refer-how" className="panel-title">{t('refer.how')}</h2>
        <ol className="refer-steps">
          {['step1', 'step2', 'step3'].map((s, i) => (
            <li key={s} className="refer-step">
              <span className="refer-step-num" aria-hidden="true">{i + 1}</span>
              <div>
                <p className="refer-step-title">{t(`refer.${s}.title`)}</p>
                <p className="refer-step-body">{t(`refer.${s}.body`)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="refer-grid">
        <section className="panel" aria-labelledby="refer-form-title">
          <h2 id="refer-form-title" className="refer-form-title">{t('refer.formTitle')}</h2>
          <p className="hint refer-form-intro">{t('refer.formIntro')}</p>
          <form className="refer-form" onSubmit={onSubmit} noValidate aria-busy={busy}>
            <div className="field">
              <label htmlFor={`${id}-name`}>{t('refer.name')}</label>
              <input
                ref={refs.name}
                id={`${id}-name`}
                autoComplete="off"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={errors.name ? 'true' : undefined}
                aria-describedby={describe('name')}
              />
              {errors.name && <p className="field-error" id={`${id}-name-error`}>{t('refer.errors.name')}</p>}
            </div>
            <div className="field">
              <label htmlFor={`${id}-phone`}>{t('refer.phone')}</label>
              <input
                ref={refs.phone}
                id={`${id}-phone`}
                type="tel"
                inputMode="tel"
                autoComplete="off"
                maxLength={14}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-invalid={errors.phone ? 'true' : undefined}
                aria-describedby={describe('phone', `${id}-phone-hint`)}
              />
              <p className="hint" id={`${id}-phone-hint`}>{t('refer.phoneHint')}</p>
              {errors.phone && <p className="field-error" id={`${id}-phone-error`}>{t('refer.errors.phone')}</p>}
            </div>
            <div className="field">
              <label htmlFor={`${id}-area`}>
                {t('refer.area')} <span className="label-optional">({t('refer.optional')})</span>
              </label>
              <input id={`${id}-area`} autoComplete="off" value={area} onChange={(e) => setArea(e.target.value)} />
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
                <span>{t('refer.consent')}</span>
              </label>
              {errors.consent && <p className="field-error" id={`${id}-consent-error`}>{t('refer.errors.consent')}</p>}
            </div>
            <button type="submit" className="button button-primary button-block" disabled={busy}>
              {busy ? t('refer.submitting') : t('refer.submit')}
            </button>
            <p className={sent ? 'notice' : 'visually-hidden'} role="status">{sent}</p>
          </form>
        </section>

        <section className="panel" aria-labelledby="refer-yours">
          <h2 id="refer-yours" className="panel-title">{t('refer.yours')}</h2>
          <ul className="referrals">
            {data.list.map((r) => (
              <li key={r.id} className="referral">
                <span className="referral-avatar" aria-hidden="true">{(lang === 'el' ? r.name : r.nameEn).charAt(0)}</span>
                <span className="referral-text">
                  <span className="referral-name">{lang === 'el' ? r.name : r.nameEn}</span>
                  <span className="referral-date">{shortDate(r.date, lang)}</span>
                </span>
                <span className="referral-status">
                  <span className={`status status-${r.status}`}>{t(`refer.status.${r.status}`)}</span>
                  {r.earned && <span className="referral-earned">{t('refer.earned', { amount: money(r.earned, lang) })}</span>}
                </span>
              </li>
            ))}
          </ul>
          <p className="hint refer-terms">{t('refer.terms')}</p>
        </section>
      </div>
    </div>
  );
}
