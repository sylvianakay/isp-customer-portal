import { brand } from '../config/brand.js';

// Placeholder wordmark, drawn in currentColor so it works on red and on white.
// Swap for the client's own logo once they've agreed.
export default function Logo() {
  return (
    <span className="logo">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <circle cx="16" cy="16" r="14.5" fill="none" stroke="currentColor" strokeWidth="3" />
        <path d="M8.5 19c3-6.5 5.5-6.5 7.5 0s4.5 6.5 7.5 0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="logo-name">{brand.name.toLowerCase()}</span>
    </span>
  );
}
