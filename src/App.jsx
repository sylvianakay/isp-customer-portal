import { useEffect } from 'react';
import { useAuth } from './auth.jsx';
import { navigate, useRoute } from './router.jsx';
import AppShell from './components/AppShell.jsx';
import Login from './pages/Login.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Overview from './pages/Overview.jsx';
import Bills from './pages/Bills.jsx';
import Pay from './pages/Pay.jsx';

const signedInPages = { '/overview': Overview, '/bills': Bills, '/pay': Pay };
const publicPages = { '/': Login, '/forgot': ForgotPassword };

export default function App() {
  const { session } = useAuth();
  const path = useRoute();

  const SignedInPage = signedInPages[path];
  const PublicPage = publicPages[path];

  useEffect(() => {
    if (session && !SignedInPage) navigate('/overview');
    if (!session && !PublicPage) navigate('/');
  }, [session, SignedInPage, PublicPage]);

  if (session && SignedInPage) {
    return (
      <AppShell path={path}>
        <SignedInPage />
      </AppShell>
    );
  }
  if (!session && PublicPage) {
    return (
      <AppShell path={path} isPublic>
        <PublicPage />
      </AppShell>
    );
  }
  return null;
}
