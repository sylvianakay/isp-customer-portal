import { useId, useRef, useState } from 'react';
import { useAuth } from '../auth.jsx';
import { useI18n } from '../i18n.jsx';
import { navigate } from '../router.jsx';
import { useData } from '../useData.js';
import { changePassword, getAccount, setPreference, updateContact } from '../data/mockApi.js';
import PasswordRules, { allRulesMet, checkRules } from '../components/PasswordRules.jsx';

const validators = {
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),
  mobile: (v) => /^69\d{8}$/.test(v.replace(/[\s-]/g, '')),
};

const formatMobile = (m) => `${m.slice(0, 3)} ${m.slice(3, 6)} ${m.slice(6)}`;

export default function Profile() {
  const { t, lang } = useI18n();
  const { signOut } = useAuth();
  const { data: account, setData: setAccount } = useData(getAccount);

  if (!account) return <p className="loading" role="status">{t('loading')}</p>;

  const name = lang === 'el'
    ? `${account.holder.firstName} ${account.holder.lastName}`
    : `${account.holder.firstNameEn} ${account.holder.lastNameEn}`;

  return (
    <div className="page page-narrow profile">
      <div>
        <h1 className="page-title">{t('profile.title')}</h1>
        <p className="lede">{t('profile.intro')}</p>
      </div>

      <section className="panel" aria-labelledby="contact-heading">
        <h2 id="contact-heading" className="panel-title">{t('profile.contact')}</h2>
        <dl className="details">
          <div className="detail">
            <dt>{t('profile.name')}</dt>
            <dd>
              <span className="detail-value">{name}</span>
              <span className="hint">{t('profile.nameNote')}</span>
            </dd>
          </div>
          <div className="detail">
            <dt>{t('login.contract')}</dt>
            <dd>
              <span className="detail-value">{account.contract}</span>
            </dd>
          </div>
          <EditableField
            field="email"
            value={account.contact.email}
            onSave={async (email) => {
              const contact = await updateContact({ email });
              setAccount({ ...account, contact });
              return t('profile.saved');
            }}
          />
          <EditableField
            field="mobile"
            value={account.contact.mobile}
            display={formatMobile}
            inputMode="tel"
            onSave={async (value) => {
              const contact = await updateContact({ mobile: value.replace(/[\s-]/g, '') });
              setAccount({ ...account, contact });
              return t('profile.mobileSaved');
            }}
          />
          <div className="detail">
            <dt>{t('profile.address')}</dt>
            <dd>
              <span className="detail-value">{account.address[lang]}</span>
              <span className="hint">{t('profile.addressNote')}</span>
            </dd>
          </div>
        </dl>
      </section>

      <PasswordSection contract={account.contract} />

      <section className="panel" aria-labelledby="prefs-heading">
        <h2 id="prefs-heading" className="panel-title">{t('profile.notifications')}</h2>
        {Object.keys(account.prefs).map((key) => (
          <PreferenceSwitch
            key={key}
            id={key}
            enabled={account.prefs[key]}
            onChange={async (value) => {
              setAccount({ ...account, prefs: { ...account.prefs, [key]: value } });
              await setPreference(key, value);
            }}
          />
        ))}
      </section>

      <button
        type="button"
        className="button button-secondary button-block"
        onClick={() => {
          signOut();
          navigate('/');
        }}
      >
        {t('profile.signOut')}
      </button>
    </div>
  );
}

// A read-only value with a "Change" button that turns into a small inline form.
function EditableField({ field, value, display = (v) => v, inputMode, onSave }) {
  const { t } = useI18n();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const inputRef = useRef(null);
  const editRef = useRef(null);
  const id = useId();
  const label = t(`profile.${field}`);

  async function submit(e) {
    e.preventDefault();
    if (!validators[field](draft.trim())) {
      setError(true);
      inputRef.current?.focus();
      return;
    }
    setBusy(true);
    const message = await onSave(draft.trim());
    setBusy(false);
    setEditing(false);
    setNote(message);
    // Return focus to the button that opened the form.
    requestAnimationFrame(() => editRef.current?.focus());
  }

  return (
    <div className="detail">
      <dt>{editing ? <label htmlFor={`${id}-input`}>{label}</label> : label}</dt>
      <dd>
        {editing ? (
          <form className="inline-edit" onSubmit={submit} noValidate>
            <input
              ref={inputRef}
              id={`${id}-input`}
              type={field === 'email' ? 'email' : 'tel'}
              inputMode={inputMode}
              autoComplete={field === 'email' ? 'email' : 'tel'}
              value={draft}
              autoFocus
              onChange={(e) => setDraft(e.target.value)}
              aria-invalid={error ? 'true' : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
            />
            {error && <p className="field-error" id={`${id}-error`}>{t(`profile.errors.${field}`)}</p>}
            <div className="inline-edit-actions">
              <button type="submit" className="button button-primary" disabled={busy}>
                {busy ? t('profile.saving') : t('profile.save')}
              </button>
              <button
                type="button"
                className="button button-ghost"
                onClick={() => {
                  setEditing(false);
                  setDraft(value);
                  setError(false);
                }}
              >
                {t('profile.cancel')}
              </button>
            </div>
          </form>
        ) : (
          <div className="detail-row">
            <span className="detail-value">{display(value)}</span>
            <button
              ref={editRef}
              type="button"
              className="icon-button"
              aria-label={t('profile.editLabel', { field: label })}
              onClick={() => {
                setDraft(field === 'mobile' ? display(value) : value);
                setError(false);
                setNote('');
                setEditing(true);
              }}
            >
              {t('profile.edit')}
            </button>
          </div>
        )}
        <p className={note ? 'detail-note' : 'visually-hidden'} role="status">{note}</p>
      </dd>
    </div>
  );
}

function PasswordSection({ contract }) {
  const { t } = useI18n();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const id = useId();
  const rules = checkRules(next, contract);

  async function submit(e) {
    e.preventDefault();
    setDone(false);
    if (!allRulesMet(rules)) return setError('rules');
    if (next !== confirm) return setError('mismatch');
    setError('');
    setBusy(true);
    try {
      await changePassword(current, next);
      setDone(true);
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel" aria-labelledby="security-heading">
      <h2 id="security-heading" className="panel-title">{t('profile.security')}</h2>
      <form className="profile-form" onSubmit={submit} noValidate>
        {error && (
          <p className="form-error" role="alert" id={`${id}-error`}>
            {t(`profile.errors.${error}`)}
          </p>
        )}
        <div className="field">
          <label htmlFor={`${id}-current`}>{t('profile.currentPassword')}</label>
          <input
            id={`${id}-current`}
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            aria-invalid={error === 'current' ? 'true' : undefined}
          />
        </div>
        <div className="field">
          <label htmlFor={`${id}-new`}>{t('profile.newPassword')}</label>
          <input
            id={`${id}-new`}
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            aria-invalid={error === 'rules' ? 'true' : undefined}
            aria-describedby={`${id}-rules`}
          />
          <PasswordRules id={`${id}-rules`} rules={rules} />
        </div>
        <div className="field">
          <label htmlFor={`${id}-confirm`}>{t('profile.confirm')}</label>
          <input
            id={`${id}-confirm`}
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            aria-invalid={error === 'mismatch' ? 'true' : undefined}
          />
        </div>
        <button type="submit" className="button button-primary" disabled={busy}>
          {busy ? t('profile.updating') : t('profile.updatePassword')}
        </button>
        <p className={done ? 'notice' : 'visually-hidden'} role="status">{done ? t('profile.passwordChanged') : ''}</p>
      </form>
    </section>
  );
}

function PreferenceSwitch({ id, enabled, onChange }) {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const labelId = `pref-${id}`;
  return (
    <div className="setting">
      <div>
        <p className="setting-name" id={labelId}>{t(`profile.prefs.${id}.name`)}</p>
        <p className="setting-desc">{t(`profile.prefs.${id}.desc`)}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-labelledby={labelId}
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
