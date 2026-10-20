import { brand } from '../config/brand.js';
import { useAuth } from '../auth.jsx';
import { useI18n } from '../i18n.jsx';
import { Link, navigate } from '../router.jsx';
import Icon from './Icon.jsx';
import Logo from './Logo.jsx';

const navItems = [
  { id: 'overview', icon: 'home' },
  { id: 'bills', icon: 'receipt' },
  { id: 'pay', icon: 'card' },
  { id: 'support', icon: 'support' },
];

// Wipes the in-memory demo (payments, referrals, requests) and starts again at sign-in.
function resetDemo() {
  try { sessionStorage.clear(); } catch { /* storage unavailable */ }
  window.location.hash = '#/';
  window.location.reload();
}

// `hero` draws the red sweep behind sign-in screens; other public pages stay plain.
export default function AppShell({ path, isPublic, hero = isPublic, children }) {
  const { t, lang, toggle } = useI18n();
  const { session, signOut } = useAuth();

  return (
    <div className={hero ? 'shell shell-public' : 'shell'}>
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
      <div className="demo-banner">
        <p>{t('demoBanner')}</p>
        <button type="button" className="demo-reset" onClick={resetDemo}>
          {t('demoReset')}
        </button>
      </div>

      <header className="topbar">
        <div className="topbar-inner">
          <Link to={isPublic ? '/' : '/overview'} className="logo-link" aria-label={brand.name}>
            <Logo />
          </Link>

          {!isPublic && (
            // On phones this same nav becomes a bottom tab bar, within thumb reach.
            <nav className="tabs" aria-label={lang === 'el' ? 'Κύριο μενού' : 'Main menu'}>
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={`/${item.id}`}
                  className="tab"
                  aria-current={path === `/${item.id}` ? 'page' : undefined}
                >
                  <Icon name={item.icon} size={22} className="tab-icon" />
                  <span>{t(`nav.${item.id}`)}</span>
                </Link>
              ))}
            </nav>
          )}

          <div className="topbar-actions">
            {!isPublic && (
              <Link
                to="/profile"
                className="account-chip"
                aria-current={path === '/profile' ? 'page' : undefined}
                aria-label={`${t('nav.profile')}, ${t('contractShort', { n: session.contract })}`}
              >
                <span className="account-avatar" aria-hidden="true"><Icon name="user" size={18} /></span>
              </Link>
            )}
            <button type="button" className="text-button" onClick={toggle} aria-label={t('switchLangLabel')} lang={lang === 'el' ? 'en' : 'el'}>
              {lang === 'el' ? 'EN' : 'ΕΛ'}
            </button>
            {!isPublic && (
              <button
                type="button"
                className="text-button text-button-outline"
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
      </header>

      <main id="main" className={hero ? 'main main-public' : 'main'} tabIndex={-1}>
        {/* Keyed by route so each page plays its short entrance once. */}
        <div className="route" key={path}>
          {children}
        </div>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <p className="footer-support">
            <Icon name="support" size={22} />
            <span>
              <span>{t('footer.support')}</span>{' '}
              {brand.supportPhone && <strong>{brand.supportPhone}</strong>}
              <span className="footer-hours">{brand.supportHours[lang]}</span>
            </span>
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
