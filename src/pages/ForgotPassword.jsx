import { useId, useState } from 'react';
import { useI18n } from '../i18n.jsx';
import { Link } from '../router.jsx';
import { requestPasswordReset } from '../data/mockApi.js';

export default function ForgotPassword() {
  const { t } = useI18n();
  const [contract, setContract] = useState('');
  const [error, setError] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [busy, setBusy] = useState(false);
  const id = useId();

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result = await requestPasswordReset(contract.replace(/\s/g, ''));
      setSentTo(result.sentTo);
    } catch {
      setError(t('login.errors.contract-format'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth">
      <div className="auth-intro">
        <h1 className="auth-title">{t('forgot.title')}</h1>
        <p className="lede">{t('forgot.intro')}</p>
      </div>

      {sentTo ? (
        <div className="auth-form">
          <p className="notice" role="status">{t('forgot.sent', { phone: sentTo })}</p>
          <Link to="/" className="button button-primary button-block">{t('forgot.back')}</Link>
        </div>
      ) : (
        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor={`${id}-contract`}>{t('login.contract')}</label>
            <input
              id={`${id}-contract`}
              inputMode="numeric"
              autoComplete="username"
              maxLength={9}
              value={contract}
              onChange={(e) => setContract(e.target.value)}
              aria-invalid={error ? 'true' : undefined}
              aria-describedby={`${id}-hint${error ? ` ${id}-error` : ''}`}
            />
            <p className="hint" id={`${id}-hint`}>{t('login.contractHint')}</p>
            {error && <p className="field-error" id={`${id}-error`}>{error}</p>}
          </div>
          <button type="submit" className="button button-primary button-block" disabled={busy}>
            {busy ? t('forgot.submitting') : t('forgot.submit')}
          </button>
          <Link to="/" className="button button-ghost button-block">{t('forgot.back')}</Link>
        </form>
      )}
    </section>
  );
}
