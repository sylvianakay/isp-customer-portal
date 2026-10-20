import { useId, useRef, useState } from 'react';
import { useAuth } from '../auth.jsx';
import { useI18n } from '../i18n.jsx';
import { Link, navigate } from '../router.jsx';
import { demoCredentials } from '../data/mockApi.js';
import { brand } from '../config/brand.js';
import Icon from '../components/Icon.jsx';
import DemoNotice from '../components/DemoNotice.jsx';

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
    if (!/^\d{10}$/.test(cleanContract)) next.contract = 'contract-format';
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
      setFormError(['contract-format', 'demo-only'].includes(err.message) ? err.message : 'credentials');
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
        <DemoNotice />
        {formError && (
          <p className="form-error" role="alert">
            <Icon name="alert" size={20} />
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
            maxLength={13}
            value={contract}
            onChange={(e) => setContract(e.target.value)}
            aria-invalid={errors.contract ? 'true' : undefined}
            placeholder={t('login.contractHint')}
            aria-describedby={errors.contract ? `${id}-contract-error` : undefined}
          />
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
              placeholder="******"
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

        {/* Where people who were looking for "sign up" end up. */}
        <div className="auth-extra">
          <Link to="/activate" className="auth-extra-row">
            <span>
              <span className="auth-extra-label">{t('login.firstTime')}</span>
              <span className="auth-extra-action">{t('login.activate')}</span>
            </span>
            <Icon name="back" size={18} className="auth-extra-arrow" />
          </Link>
          <p className="auth-extra-small">
            {t('login.notCustomer')} <a href={brand.availabilityUrl}>{t('login.availability')}</a>
          </p>
        </div>
      </form>
    </section>
  );
}
