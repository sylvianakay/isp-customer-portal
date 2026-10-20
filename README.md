# ISP customer portal

A self-service account portal for a home internet provider. Customers sign in, see what they owe and when it's due, and pay it. They can also download past bills and manage their payment settings.

This is a **concept demo**. It runs entirely in the browser on sample data and is not connected to any real provider. The brand ("Aktí Net") is a placeholder.

## Run it

```bash
npm install
npm run dev
```

Open the address Vite prints, then choose **"Συμπλήρωση με δείγμα λογαριασμού"** (fill in a sample account) to sign in.

The demo only accepts its own sample account (contract `1048219370`, password `demo1234`) and shows a warning on every sign-in screen, so nobody is invited to type real credentials. Nothing typed leaves the browser. **Επαναφορά επίδειξης** (reset demo) in the top banner clears everything and starts again.

## What's in it

- **First-time activation** instead of a default password: contract number, then an SMS code to the mobile on the contract (`123456` in the demo), then the customer's own password with live rules.
- **Refer a friend.** A personal referral code to share, a form that hands a friend's details to sales, and the status of each referral.
- **Sign in** by 10-digit contract number and password. It has inline validation, a show/hide password toggle, and a password reset flow.
- **Overview.** The amount due is the first thing you see, along with the due date, days left, and a billing-cycle track. Below that are a one-tap pay button and the RF payment code with a copy button. The page also shows plan details, an automatic-payment switch, and recent bills.
- **Bonus account.** A credit wallet (switching offer, friend referrals) that pays up to half the monthly fee on each bill, with its balance, how many bills it covers, and recent activity.
- **Profile.** Contact details with inline editing, change password with the same live rules, and notification settings (marketing is opt-in, off by default).
- **Support.** Network status for the area, a step-by-step connection check (simulated), contact details, FAQ, and a request form with request history.
- **Bills.** Full history with status, plus a branded PDF for each bill and a payment receipt PDF for each paid one, generated in the browser (`src/pdf/billPdf.js`, marked as a sample). It uses the Fira Sans font in `public/fonts/` (SIL Open Font License) because the built-in PDF fonts have no Greek.
- **Pay.** Pay the full amount or a partial amount, by card, IRIS, or RF code. Card payments hand off to the payment processor's hosted page (set in `src/config/brand.js`), so the portal never touches card numbers. A receipt PDF can be downloaded straight after paying.
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

## Privacy and safety in the demo

- Fonts are self-hosted, and the app makes no requests to third parties.
- Pages carry `noindex` and `robots.txt` disallows crawling.
- The brand, logo and all sample data are placeholders. Sample emails use the reserved `example.com` domain.
- The payment processor is named generically by default (`src/config/brand.js`).
- Support phone and email are empty by default, so the portal shows neutral wording ("Γραμμή εξυπηρέτησης πελατών"). Fill them in `src/config/brand.js` only with the client's permission, and never invent a number. The sample mobile number is the placeholder 690 000 0000.
- **Απόρρητο** (`#/privacy`) and **Όροι χρήσης** (`#/terms`) explain in plain words that the demo collects no data, uses no cookies, uses made-up names and data, and that the design and code belong to their creator.
- Licences for the libraries and fonts used are listed in `THIRD_PARTY_NOTICES.md`.

