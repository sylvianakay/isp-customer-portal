import { useEffect } from 'react';
import { useAuth } from './auth.jsx';
import { navigate, useRoute } from './router.jsx';
import AppShell from './components/AppShell.jsx';
import Login from './pages/Login.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Overview from './pages/Overview.jsx';
import Bills from './pages/Bills.jsx';
import Pay from './pages/Pay.jsx';
import Activate from './pages/Activate.jsx';
import Refer from './pages/Refer.jsx';
import Profile from './pages/Profile.jsx';
import Support from './pages/Support.jsx';
import Legal from './pages/Legal.jsx';
import Availability from './pages/Availability.jsx';

const signedInPages = { '/overview': Overview, '/bills': Bills, '/pay': Pay, '/refer': Refer, '/support': Support, '/profile': Profile };
const publicPages = { '/': Login, '/forgot': ForgotPassword, '/activate': Activate, '/availability': Availability };
// Open whether or not someone is signed in.
const legalPages = { '/privacy': 'privacy', '/terms': 'terms' };

export default function App() {
  const { session } = useAuth();
  const path = useRoute();

  const SignedInPage = signedInPages[path];
  const PublicPage = publicPages[path];

  const legal = legalPages[path];

  useEffect(() => {
    if (legal) return;
    if (session && !SignedInPage) navigate('/overview');
    if (!session && !PublicPage) navigate('/');
  }, [session, SignedInPage, PublicPage, legal]);

  if (legal) {
    return (
      <AppShell path={path} isPublic={!session} hero={false}>
        <Legal kind={legal} />
      </AppShell>
    );
  }

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
