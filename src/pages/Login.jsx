import { useId, useRef, useState } from 'react';
import { useAuth } from '../auth.jsx';
import { useI18n } from '../i18n.jsx';
import { Link, navigate } from '../router.jsx';
import { demoCredentials } from '../data/mockApi.js';

export default function Login() {
  const { t } = useI18n();
  const { signIn } = useAuth();
  const [contract, setContract] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const contractRef = useRef(null);
  const passwordRef = useRef(null);
  const id = useId();

  async function onSubmit(e) {
    e.preventDefault();
    const cleanContract = contract.replace(/\s/g, '');
    const next = {};
    if (!/^\d{7}$/.test(cleanContract)) next.contract = 'contract-format';
    if (!password) next.password = 'password-empty';
    setErrors(next);
    setFormError('');
    if (next.contract) return contractRef.current?.focus();
    if (next.password) return passwordRef.current?.focus();

    setBusy(true);
    try {
      await signIn(cleanContract, password);
      navigate('/overview');
    } catch (err) {
      setFormError(err.message === 'contract-format' ? 'contract-format' : 'credentials');
      setBusy(false);
    }
  }

  function fillDemo() {
    setContract(demoCredentials.contract);
    setPassword(demoCredentials.password);
    setErrors({});
    setFormError('');
  }

  return (
    <section className="auth">
      <div className="auth-intro">
        <h1 className="auth-title">{t('login.title')}</h1>
        <p className="lede">{t('login.intro')}</p>
      </div>

      <form className="auth-form" onSubmit={onSubmit} noValidate>
        {formError && (
          <p className="form-error" role="alert">
            {t(`login.errors.${formError}`)}
          </p>
        )}

        <div className="field">
          <label htmlFor={`${id}-contract`}>{t('login.contract')}</label>
          <input
            ref={contractRef}
            id={`${id}-contract`}
            inputMode="numeric"
            autoComplete="username"
            maxLength={9}
            value={contract}
            onChange={(e) => setContract(e.target.value)}
            aria-invalid={errors.contract ? 'true' : undefined}
            aria-describedby={`${id}-contract-hint${errors.contract ? ` ${id}-contract-error` : ''}`}
          />
          <p className="hint" id={`${id}-contract-hint`}>{t('login.contractHint')}</p>
          {errors.contract && (
            <p className="field-error" id={`${id}-contract-error`}>{t(`login.errors.${errors.contract}`)}</p>
          )}
        </div>

        <div className="field">
          <div className="field-label-row">
            <label htmlFor={`${id}-password`}>{t('login.password')}</label>
            <Link to="/forgot" className="quiet-link">{t('login.forgot')}</Link>
          </div>
          <div className="input-with-action">
            <input
              ref={passwordRef}
              id={`${id}-password`}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={errors.password ? 'true' : undefined}
              aria-describedby={errors.password ? `${id}-password-error` : undefined}
            />
            <button
              type="button"
              className="input-action"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? t('login.hideLabel') : t('login.showLabel')}
              aria-pressed={showPassword}
            >
              {showPassword ? t('login.hide') : t('login.show')}
            </button>
          </div>
          {errors.password && (
            <p className="field-error" id={`${id}-password-error`}>{t(`login.errors.${errors.password}`)}</p>
          )}
        </div>

        <button type="submit" className="button button-primary button-block" disabled={busy}>
          {busy ? t('login.submitting') : t('login.submit')}
        </button>

        <button type="button" className="button button-ghost button-block" onClick={fillDemo}>
          {t('login.demo')}
        </button>
      </form>
    </section>
  );
}
