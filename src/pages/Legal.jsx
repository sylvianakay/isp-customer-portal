import { useI18n } from '../i18n.jsx';
import { Link } from '../router.jsx';

// Privacy notice and terms for the concept demo. Plain, honest and short:
// what it is, what it stores (almost nothing), and who owns the work.
const sections = {
  privacy: ['what', 'data', 'storage', 'thirdParties', 'hosting', 'questions'],
  terms: ['demo', 'brand', 'noReal', 'ownership', 'questions'],
};

export default function Legal({ kind }) {
  const { t } = useI18n();
  const other = kind === 'privacy' ? 'terms' : 'privacy';

  return (
    <div className="page page-narrow legal">
      <div>
        <h1 className="page-title">{t(`legal.${kind}.title`)}</h1>
        <p className="lede">{t(`legal.${kind}.intro`)}</p>
      </div>

      <section className="panel legal-body">
        {sections[kind].map((key) => (
          <div key={key} className="legal-section">
            <h2 className="legal-heading">{t(`legal.${kind}.${key}.title`)}</h2>
            <p>{t(`legal.${kind}.${key}.body`)}</p>
          </div>
        ))}
        <p className="hint">{t('legal.updated')}</p>
      </section>

      <Link to={`/${other}`} className="quiet-link">{t(`legal.${other}.title`)}</Link>
    </div>
  );
}
