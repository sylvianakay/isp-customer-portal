# ISP customer portal

A self-service account portal for a home internet provider. Customers sign in, see what they owe and when it's due, and pay it. They can also download past bills and manage their payment settings.

This is a **concept demo**. It runs entirely in the browser on sample data and is not connected to any real provider. The brand ("Aktí Net") is a placeholder.

## Run it

```bash
npm install
npm run dev
```

Open the address Vite prints, then choose **"Συμπλήρωση με δείγμα λογαριασμού"** (fill in a sample account) to sign in.

## What's in it

- **Sign in** by contract number and password. It has inline validation, a show/hide password toggle, and a password reset flow.
- **Overview.** The amount due is the first thing you see, along with the due date, days left, and a billing-cycle track. Below that are a one-tap pay button and the RF payment code with a copy button. The page also shows plan details, an automatic-payment switch, and recent bills.
- **Bills.** Full history with status, plus a PDF download for each bill (stubbed in the demo).
- **Pay.** Pay the full amount or a partial amount, by card, IRIS, or RF code. Card payments hand off to the bank's own payment page, so the portal never touches card numbers.
- **Greek first, with an English switch.** Every string lives in `src/i18n.jsx`.
- **Mobile-first and accessible.** Real form labels, keyboard focus, 44px touch targets, and screen-reader announcements for status changes.

## Where things live

| Path | What it is |
| --- | --- |
| `src/config/brand.js` | Name, support phone and links. Re-skinning starts here. |
| `src/data/mockApi.js` | Fake API with sample data. Replace this file to connect a real backend. |
| `src/i18n.jsx` | All Greek and English copy. |
| `src/pages/` | Login, ForgotPassword, Overview, Bills, Pay |
| `src/styles.css` | Design tokens at the top, then components. |

## Connecting a real backend

Every function in `src/data/mockApi.js` is async and returns the shape the screens expect: `signIn`, `getAccount`, `getBills`, `startPayment`, `setAutopay`, and `requestPasswordReset`. Point those at the provider's API and the UI doesn't change. For card payments, `startPayment` should return the payment gateway's redirect URL rather than processing anything itself.
