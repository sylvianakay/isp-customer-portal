import { brand } from '../config/brand.js';
import { useAuth } from '../auth.jsx';
import { useI18n } from '../i18n.jsx';
import { Link, navigate } from '../router.jsx';
import Logo from './Logo.jsx';

const navItems = ['overview', 'bills', 'pay'];

export default function AppShell({ path, isPublic, children }) {
  const { t, lang, toggle } = useI18n();
  const { session, signOut } = useAuth();

  return (
    <div className="shell">
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          // Hash routing owns the URL hash, so move focus instead of changing it.
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        {lang === 'el' ? 'Μετάβαση στο περιεχόμενο' : 'Skip to content'}
      </a>
      <p className="demo-banner">{t('demoBanner')}</p>

      <header className="topbar">
        <div className="topbar-inner">
          <Link to={isPublic ? '/' : '/overview'} className="logo-link" aria-label={brand.name}>
            <Logo />
          </Link>

          <div className="topbar-actions">
            {!isPublic && <span className="contract-chip">{t('contractShort', { n: session.contract })}</span>}
            <button type="button" className="text-button" onClick={toggle} aria-label={t('switchLangLabel')} lang={lang === 'el' ? 'en' : 'el'}>
              {t('switchLang')}
            </button>
            {!isPublic && (
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  signOut();
                  navigate('/');
                }}
              >
                {t('signOut')}
              </button>
            )}
          </div>
        </div>

        {!isPublic && (
          <nav className="tabs" aria-label={lang === 'el' ? 'Κύριο μενού' : 'Main menu'}>
            <div className="tabs-inner">
              {navItems.map((item) => (
                <Link
                  key={item}
                  to={`/${item}`}
                  className="tab"
                  aria-current={path === `/${item}` ? 'page' : undefined}
                >
                  {t(`nav.${item}`)}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main id="main" className={isPublic ? 'main main-public' : 'main'} tabIndex={-1}>
        {children}
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <p className="footer-support">
            <span>{t('footer.support')}</span>{' '}
            <strong>{brand.supportPhone}</strong>
            <span className="footer-hours">{brand.supportHours[lang]}</span>
          </p>
          <p className="footer-links">
            <a href={brand.termsUrl}>{t('footer.terms')}</a>
            <a href={brand.privacyUrl}>{t('footer.privacy')}</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
