# Authentication setup

Carpe Acta supports email/password accounts, email login links, and Google through
Supabase Auth. Guests can continue using every existing tip feature. Signed-in
favorites sync through Supabase; see [favorites setup](favorites-sync.md).
Guest favorites and completion history remain browser-local and are not deleted
on logout. Each can be imported explicitly after login. New signed-in completions
use account storage; see [completion sync](completions-sync.md).

## Connect the project

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` using the project's
   Connect dialog / API settings. A legacy **anon** key also works in the latter
   variable. Never put a secret or `service_role` key in a `VITE_` variable:
   Vite embeds these values in the public build.
3. Restart the development server. Without valid configuration, the app remains
   usable and the login panel explains that login is unavailable.
4. Set the same two variables in the hosting site's build environment and rebuild
   for production. Local environment files are ignored by Git.

No database tables, migrations, or database policies are needed for this auth-only
increment. Future account data must use per-user row-level security policies.

## Supabase dashboard

- Enable email/password authentication and allow new signups. Keep email
  confirmation enabled. Set the password minimum to at least 8 characters;
  the service enforces any additional strength requirements.
- Under Authentication → URL Configuration, set Site URL to the production
  origin `https://carpe-acta.vercel.app/`. Allow the exact callback
  URLs `https://carpe-acta.vercel.app/` and `http://localhost:5173/`.
  If using `127.0.0.1` or a different port, add that exact URL too.
- The app sends the current origin and pathname as the redirect URL, without
  query parameters or fragments. Serve it at `/` and use this exact allowed URL.
- Keep confirmation, magic-link, and recovery email templates using Supabase's
  `{{ .ConfirmationURL }}` link. This integration uses PKCE; users must open
  email links in the same browser where they requested them. The UI explains this.
- Configure a production SMTP sender before enabling public email signups.
  Supabase's default mail service only sends to project-team addresses and has
  tight limits. Verify delivery to a non-team mailbox.

## Google

1. In Google Cloud, configure an OAuth consent screen and a Web application
   OAuth client. If the consent screen is in Testing, add intended test users.
2. Copy the callback URL shown by Supabase's Google provider settings into the
   Google client's authorized redirect URIs. This is the **Supabase** callback
   (typically `https://<project-ref>.supabase.co/auth/v1/callback`), not the app URL.
3. Enable Google in Supabase and enter the Google client ID and client secret
   there. The Google secret must never be put in this app's environment or code.
4. Test Google login from both the allowed localhost origin and production.

## Behavior and implementation

- `src/auth/client.ts`: one optional Supabase client; PKCE redirects, refresh,
  persistent sessions. The Supabase SDK owns token storage and validation.
- `src/auth/config.ts`: public configuration validation, safe redirect creation,
  localized error classification. Raw server messages aren't rendered.
- `src/auth/actions.ts`: login, signup, email link, Google, reset, update password,
  and local-device logout. No custom password or token storage.
- `src/hooks/useAuth.ts`: session subscription, restoration, callback errors,
  and password-recovery events; subscriptions are cleaned up on unmount.
- `src/components/AuthPanel.tsx`: accessible native modal, form validation,
  duplicate-submission guard, loading/error/success messages and account controls.
- `src/i18n/auth.ts`: complete English and Serbian Latin interface messages.

A recovery callback opens the new-password form. Signed-in users can also open
Account → Set a new password (including after refreshing a recovery page).
Logout affects this browser's session, leaving other devices signed in. Cancelled
or failed redirects preserve an existing session. Passwords are never logged or
saved by application code. Auth sessions use the SDK's default browser storage;
use HTTPS in production and avoid untrusted scripts on the page.

## Verification

Run `npm test`, `npm run build`, and `git diff --check`. Automated tests mock the
Supabase boundary; they do not send email, create accounts, or prove dashboard
configuration. Before release, use a dedicated test account to check:

- Password signup, email confirmation, password login and incorrect credentials.
- Email login link, expired/reused link, and opening a link in a different browser.
- Google approval and cancellation.
- Forgot password → email link → new password → logout → login with new password.
- Session restored after refresh, logout and cross-tab session changes.
- English and Serbian, keyboard/Escape/focus return, and narrow screens.
- Guest favorites and action completion remain intact before and after login.

## Official references

- https://supabase.com/docs/guides/auth/passwords
- https://supabase.com/docs/guides/auth/auth-email-passwordless
- https://supabase.com/docs/guides/auth/social-login/auth-google
- https://supabase.com/docs/guides/auth/redirect-urls
- https://supabase.com/docs/guides/auth/auth-smtp
