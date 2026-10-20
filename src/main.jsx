import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nProvider } from './i18n.jsx';
import { AuthProvider } from './auth.jsx';
import App from './App.jsx';
// Self-hosted font: no visitor IPs go to a third party (GDPR).
import '@fontsource-variable/commissioner/wght.css';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <I18nProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </I18nProvider>
  </StrictMode>,
);
