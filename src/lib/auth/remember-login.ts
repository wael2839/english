const SAVED_EMAIL_KEY = 'eg_saved_email';

export function getSavedLoginEmail(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(SAVED_EMAIL_KEY);
  } catch {
    return null;
  }
}

export function persistSavedLoginEmail(email: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (email) {
      window.localStorage.setItem(SAVED_EMAIL_KEY, email);
      return;
    }
    window.localStorage.removeItem(SAVED_EMAIL_KEY);
  } catch {
    // ignore storage failures
  }
}
