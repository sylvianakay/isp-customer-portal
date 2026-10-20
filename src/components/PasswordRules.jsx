import { useI18n } from '../i18n.jsx';
import Icon from './Icon.jsx';

// The password rules, checked live. "contract" blocks the old default
// (the last 4 digits of the contract number).
export function checkRules(password, contract) {
  return {
    length: password.length >= 8,
    letter: /\p{L}/u.test(password),
    number: /\d/.test(password),
    contract: password.length > 0 && !password.includes(contract.slice(-4)),
  };
}

export const allRulesMet = (rules) => Object.values(rules).every(Boolean);

export default function PasswordRules({ id, rules }) {
  const { t } = useI18n();
  return (
    <ul className="rules" id={id}>
      {Object.entries(rules).map(([key, ok]) => (
        <li key={key} className={ok ? 'rule is-met' : 'rule'}>
          <span className="rule-mark" aria-hidden="true">{ok && <Icon name="check" size={14} />}</span>
          {t(`activate.rules.${key}`)}
          <span className="visually-hidden">: {ok ? t('activate.met') : t('activate.notMet')}</span>
        </li>
      ))}
    </ul>
  );
}
