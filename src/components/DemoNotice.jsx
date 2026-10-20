import { useI18n } from '../i18n.jsx';
import { demoCredentials } from '../data/mockApi.js';
import Icon from './Icon.jsx';

// Shown on every screen that asks for credentials, so a look-alike sign-in page
// never invites anyone to type their real details.
export default function DemoNotice() {
  const { t } = useI18n();
  return (
    <p className="demo-notice">
      <Icon name="alert" size={18} />
      <span>{t('demoWarning', { contract: demoCredentials.contract, password: demoCredentials.password })}</span>
    </p>
  );
}
