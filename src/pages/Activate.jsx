import { useEffect, useId, useRef, useState } from 'react';
import { useAuth } from '../auth.jsx';
import { useI18n } from '../i18n.jsx';
import { Link, navigate } from '../router.jsx';
import { DEMO_SMS_CODE, activateAccount, startActivation, verifyActivationCode } from '../data/mockApi.js';
import Icon from '../components/Icon.jsx';
import DemoNotice from '../components/DemoNotice.jsx';
import PasswordRules, { allRulesMet, checkRules } from '../components/PasswordRules.jsx';

const steps = ['contract', 'code', 'password'];

export default function Activate() {
  const { t } = useI18n();
  const { signIn } = useAuth();
  const [step, setStep] = useState(0);
  const [contract, setContract] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const inputRef = useRef(null);
  const id = useId();

  const cleanContract = contract.replace(/\s/g, '');
  const rules = checkRules(password, cleanContract);
  const allRules = allRulesMet(rules);

  // Resend countdown.
  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const timer = setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  // Each new step moves focus to its first field, so keyboard and screen-reader
  // users land where they need to be.
  useEffect(() => {
    if (step > 0) inputRef.current?.focus();
  }, [step]);

  async function run(task) {
    setError('');
    setBusy(true);
    try {
      await task();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function sendCode(e) {
    e?.preventDefault();
    if (!/^\d{10}$/.test(cleanContract)) {
      setError('contract-format');
      inputRef.current?.focus();
      return;
    }
    run(async () => {
      const result = await startActivation(cleanContract);
      setPhone(result.sentTo);
      setResendIn(result.resendAfter);
      if (step === 1) setNotice(t('activate.resent'));
      setStep(1);
    });
  }

  function verify(e) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError('code-format');
      inputRef.current?.focus();
      return;
    }
    run(async () => {
      await verifyActivationCode(cleanContract, code);
      setNotice('');
      setStep(2);
    });
  }

  function save(e) {
    e.preventDefault();
    if (!allRules) {
      setError('rules');
      inputRef.current?.focus();
      return;
    }
    if (password !== confirm) {
      setError('mismatch');
      return;
    }
    run(async () => {
      await activateAccount(cleanContract, password);
      await signIn(cleanContract, password);
      navigate('/overview');
    });
  }

  const errorText = error ? t(`activate.errors.${error}`) : '';
  const errorId = `${id}-error`;

  return (
    <section className="auth">
      <div className="auth-intro">
        <h1 className="auth-title">{t('activate.title')}</h1>
        <p className="lede">{t('activate.intro')}</p>
      </div>

      <div className="auth-form" key={step}>
        <ol className="stepper" aria-label={t('activate.stepOf', { n: step + 1 })}>
          {steps.map((s, i) => (
            <li
              key={s}
              className={i < step ? 'stepper-item is-done' : i === step ? 'stepper-item is-current' : 'stepper-item'}
              aria-current={i === step ? 'step' : undefined}
            >
              <span className="stepper-dot" aria-hidden="true">
                {i < step ? <Icon name="check" size={16} /> : i + 1}
              </span>
              <span>{t(`activate.steps.${s}`)}</span>
            </li>
          ))}
        </ol>

        {step === 0 && <DemoNotice />}

        {errorText && (
          <p className="form-error" role="alert" id={errorId}>
            <Icon name="alert" size={20} />
            {errorText}
          </p>
        )}

        {step === 0 && (
          <form className="step-form" onSubmit={sendCode} noValidate>
            <div className="field">
              <label htmlFor={`${id}-contract`}>{t('login.contract')}</label>
              <input
                ref={inputRef}
                id={`${id}-contract`}
                inputMode="numeric"
                autoComplete="username"
                maxLength={13}
                value={contract}
                onChange={(e) => setContract(e.target.value)}
                aria-invalid={error ? 'true' : undefined}
                placeholder={t('login.contractHint')}
                aria-describedby={error ? errorId : undefined}
              />
            </div>
            <button type="submit" className="button button-primary button-block" disabled={busy}>
              {busy ? t('activate.sending') : t('activate.sendCode')}
            </button>
          </form>
        )}

        {step === 1 && (
          <form className="step-form" onSubmit={verify} noValidate>
            <p className="notice" role="status">{notice || t('activate.codeSent', { phone })}</p>
            <div className="field">
              <label htmlFor={`${id}-code`}>{t('activate.code')}</label>
              <input
                ref={inputRef}
                id={`${id}-code`}
                className="code-input"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={`${id}-code-hint${error ? ` ${errorId}` : ''}`}
              />
              <p className="hint" id={`${id}-code-hint`}>{t('activate.codeHint', { demo: DEMO_SMS_CODE })}</p>
            </div>
            <button type="submit" className="button button-primary button-block" disabled={busy}>
              {busy ? t('activate.verifying') : t('activate.verify')}
            </button>
            <div className="step-links">
              <button type="button" className="link-button" onClick={() => sendCode()} disabled={busy || resendIn > 0}>
                {resendIn > 0 ? t('activate.resendIn', { n: resendIn }) : t('activate.resend')}
              </button>
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  setStep(0);
                  setCode('');
                  setError('');
                  setNotice('');
                }}
              >
                {t('activate.changeContract')}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form className="step-form" onSubmit={save} noValidate>
            <div className="field">
              <label htmlFor={`${id}-password`}>{t('activate.newPassword')}</label>
              <div className="input-with-action">
                <input
                  ref={inputRef}
                  id={`${id}-password`}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={error === 'rules' ? 'true' : undefined}
                  aria-describedby={`${id}-rules${error === 'rules' ? ` ${errorId}` : ''}`}
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
              <PasswordRules id={`${id}-rules`} rules={rules} />
            </div>
            <div className="field">
              <label htmlFor={`${id}-confirm`}>{t('activate.confirm')}</label>
              <input
                id={`${id}-confirm`}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                aria-invalid={error === 'mismatch' ? 'true' : undefined}
                aria-describedby={error === 'mismatch' ? errorId : undefined}
              />
            </div>
            <button type="submit" className="button button-primary button-block" disabled={busy}>
              {busy ? t('activate.saving') : t('activate.save')}
            </button>
          </form>
        )}

        <Link to="/" className="button button-ghost button-block">{t('activate.back')}</Link>
      </div>
    </section>
  );
}
