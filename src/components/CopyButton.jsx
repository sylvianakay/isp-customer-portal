import { useEffect, useState } from 'react';
import { useI18n } from '../i18n.jsx';
import Icon from './Icon.jsx';

export default function CopyButton({ value }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      className={copied ? 'button button-secondary copy-button is-copied' : 'button button-secondary copy-button'}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
        } catch {
          setCopied(false);
        }
      }}
    >
      {/* Keyed so the icon and label swap with a short blur crossfade instead of a hard cut. */}
      <span className="copy-content" key={copied ? 'copied' : 'copy'}>
        <Icon name={copied ? 'check' : 'copy'} size={18} />
      </span>
      <span aria-live="polite">{copied ? t('overview.copied') : t('overview.copy')}</span>
    </button>
  );
}
