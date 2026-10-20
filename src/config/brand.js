// Everything brand-specific lives here, so the portal can be re-skinned for a
// client in one place (only with that client's permission to use their brand).
export const brand = {
  name: 'Aktí Net',
  // Real contact details only with the client's permission. While null, the portal shows
  // neutral wording instead. Never invent a number: it could belong to a real person.
  supportPhone: null,
  supportHours: { el: 'Δευτέρα–Παρασκευή, 9:00–21:00', en: 'Monday–Friday, 9:00–21:00' },
  // Card payments are handed to a licensed processor's hosted page. Kept generic so the
  // demo implies no partnership. For a private pitch you may name the client's actual
  // processor, e.g. { el: 'EveryPay', en: 'EveryPay' }.
  paymentProvider: { el: 'πιστοποιημένου παρόχου πληρωμών', en: 'a certified payment provider' },
  supportEmail: null,
  // Coverage checker on the provider's public site, for people who aren't customers yet.
  availabilityUrl: '#',
  termsUrl: '#/terms',
  privacyUrl: '#/privacy',
};
