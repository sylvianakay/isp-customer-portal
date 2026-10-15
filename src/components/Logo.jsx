import { brand } from '../config/brand.js';

// Placeholder mark and wordmark. Swap for the client's own logo once they've agreed.
export default function Logo() {
  return (
    <span className="logo">
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <rect width="32" height="32" rx="8" fill="var(--blue)" />
        <path d="M6 20c4-8 8-8 10 0s6 8 10 0" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="logo-name">{brand.name}</span>
    </span>
  );
}
