import { useEffect, useState } from 'react';

// Tiny hash router: #/overview, #/bills, #/pay, #/forgot. Hash routing means the
// demo works from any static host with no server config.
function currentPath() {
  return window.location.hash.replace(/^#/, '') || '/';
}

export function useRoute() {
  const [path, setPath] = useState(currentPath);
  useEffect(() => {
    const onChange = () => {
      setPath(currentPath());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return path;
}

export function navigate(path) {
  window.location.hash = path;
}

export function Link({ to, children, ...rest }) {
  return (
    <a href={`#${to}`} {...rest}>
      {children}
    </a>
  );
}
