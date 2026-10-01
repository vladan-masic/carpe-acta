import type { Locale } from "./locales";

const en = {
  login: "Log in", account: "Account", logout: "Log out", close: "Close",
  loading: "Checking your account…", busy: "Please wait…",
  intro: "Choose how you’d like to sign in. You can also keep using Carpe Acta without an account.",
  localData: "Favorites and completed actions sync with your account. Browser history can be imported separately.",
  unavailable: "Login is not available yet. You can still use the tips and save favorites in this browser.",
  google: "Continue with Google", or: "or use your email",
  email: "Email address", password: "Password", confirmPassword: "Confirm password",
  passwordHint: "Use at least 8 characters. Your account may require a stronger password.",
  signup: "Create an account", link: "Email me a login link", forgot: "Forgot password?",
  reset: "Reset password", sendReset: "Send reset link", newPassword: "Set a new password",
  savePassword: "Save password", back: "Back to login", signedIn: "Signed in as",
  checkEmail: "Check your email for the link. Open it in this browser to continue.",
  signupSent: "Check your email to confirm your account, then log in. If you already have an account, log in or reset your password.",
  resetSent: "If an account exists for that address, you’ll receive a password-reset link. Open it in this browser.",
  passwordSaved: "Your password has been updated.",
  mismatch: "The passwords do not match.",
  invalidCredentials: "The email or password is incorrect. Try again or reset your password.",
  emailUnconfirmed: "Confirm your email using the link in your inbox before logging in.",
  weakPassword: "Choose a stronger password with at least 8 characters, including letters, numbers, and symbols.",
  rateLimit: "Too many attempts. Please wait a few minutes before trying again.",
  expiredLink: "This link has expired or cannot be used in this browser. Request a new link and open it here.",
  samePassword: "Choose a password different from your current password.",
  genericError: "We couldn’t complete that request. Please try again. You can continue using the app without logging in.",
  callbackError: "Login could not be completed. Please try again or request a new link.",
};

export type AuthMessages = { [Key in keyof typeof en]: string };

const sr: AuthMessages = {
  login: "Prijavi se", account: "Nalog", logout: "Odjavi se", close: "Zatvori",
  loading: "Proveravamo tvoj nalog…", busy: "Sačekaj…",
  intro: "Izaberi način prijave. Carpe Acta možeš da koristiš i bez naloga.",
  localData: "Omiljeni saveti i završene radnje se sinhronizuju sa tvojim nalogom. Istoriju iz pregledača možeš zasebno da uvezeš.",
  unavailable: "Prijava još nije dostupna. I dalje možeš da koristiš savete i čuvaš omiljene u ovom pregledaču.",
  google: "Nastavi preko Google-a", or: "ili koristi imejl",
  email: "Imejl adresa", password: "Lozinka", confirmPassword: "Potvrdi lozinku",
  passwordHint: "Koristi najmanje 8 znakova. Tvoj nalog može zahtevati jaču lozinku.",
  signup: "Napravi nalog", link: "Pošalji mi link za prijavu", forgot: "Zaboravljena lozinka?",
  reset: "Obnovi lozinku", sendReset: "Pošalji link za obnovu", newPassword: "Postavi novu lozinku",
  savePassword: "Sačuvaj lozinku", back: "Nazad na prijavu", signedIn: "Prijavljen/a kao",
  checkEmail: "Proveri imejl i otvori link u ovom pregledaču da nastaviš.",
  signupSent: "Proveri imejl da potvrdiš nalog, pa se prijavi. Ako već imaš nalog, prijavi se ili obnovi lozinku.",
  resetSent: "Ako postoji nalog sa tom adresom, dobićeš link za obnovu lozinke. Otvori ga u ovom pregledaču.",
  passwordSaved: "Tvoja lozinka je ažurirana.",
  mismatch: "Lozinke se ne podudaraju.",
  invalidCredentials: "Imejl ili lozinka nisu ispravni. Pokušaj ponovo ili obnovi lozinku.",
  emailUnconfirmed: "Pre prijave potvrdi imejl pomoću linka iz primljene poruke.",
  weakPassword: "Izaberi jaču lozinku sa najmanje 8 znakova, uključujući slova, brojeve i simbole.",
  rateLimit: "Previše pokušaja. Sačekaj nekoliko minuta pa pokušaj ponovo.",
  expiredLink: "Link je istekao ili ne može da se koristi u ovom pregledaču. Zatraži novi link i otvori ga ovde.",
  samePassword: "Izaberi lozinku koja se razlikuje od trenutne.",
  genericError: "Zahtev nije uspeo. Pokušaj ponovo. Aplikaciju možeš da koristiš i bez prijave.",
  callbackError: "Prijava nije uspela. Pokušaj ponovo ili zatraži novi link.",
};

export const authMessages: Record<Locale, AuthMessages> = { en, "sr-Latn": sr };
