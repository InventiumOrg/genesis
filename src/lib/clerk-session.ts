/**
 * "You're already signed in" is not a failure.
 *
 * Clerk refuses a fresh sign-in or sign-up attempt while a session is already
 * active, and answers with the error code `session_exists`. Shown to the person
 * who just pressed Sign in, that reads as a dead end: they asked to be signed
 * in, they are signed in, and the screen tells them something went wrong.
 *
 * So it is treated as success and the browser goes where the attempt was headed.
 *
 * The existing guard — a `useEffect` on `isSignedIn` — cannot cover this on its
 * own. `useAuth` resolves after Clerk loads, and the sign-in screen is
 * interactive before that: a person who types fast, or arrives with a session
 * restored from another tab, submits before the effect has anything to act on.
 * The check belongs in the submit path, where the race actually happens.
 */

/** Clerk's code for "a session is already active". */
export const SESSION_EXISTS = 'session_exists';

/** Shape enough of a Clerk error to read its code, without importing a class. */
type MaybeClerkError = { code?: unknown; message?: unknown } | null | undefined;

export function isSessionExists(error: MaybeClerkError): boolean {
  if (!error || typeof error !== 'object') return false;
  if ((error as { code?: unknown }).code === SESSION_EXISTS) return true;

  // Older payloads nest the code in an `errors` array rather than carrying it
  // on the error itself. Checked second so the flat code wins when both exist.
  const nested = (error as { errors?: Array<{ code?: unknown }> }).errors;
  return Array.isArray(nested) && nested.some((e) => e?.code === SESSION_EXISTS);
}

/**
 * Build the `navigate` callback `finalize` expects.
 *
 * Clerk 7 hands this callback a `decorateUrl`, and using it is not optional.
 * Where Safari's ITP would drop the session cookie, `decorateUrl` returns an
 * absolute URL through Clerk's own `/v1/client/touch` endpoint, which refreshes
 * the cookie and then forwards to the destination. Ignoring it — as a bare
 * `() => router.push('/dashboard')` does — navigates with a cookie the server
 * cannot read: middleware sees no session, sends the browser back to sign-in,
 * and the next attempt is refused with `session_exists` because the client
 * does have one. The screen then says "You're already signed in" to someone
 * who cannot get in.
 *
 * In Clerk 6 this was handled inside `setActive`. The callback is where that
 * responsibility moved.
 *
 * A decorated URL is external, so it needs a full page load; an undecorated one
 * is a plain path and stays a client navigation.
 */
export function navigateAfterAuth(
  destination: string,
  push: (url: string) => void,
) {
  return ({ decorateUrl }: { decorateUrl: (url: string) => string }) => {
    const url = decorateUrl(destination);
    if (url.startsWith('http')) {
      window.location.href = url;
      return;
    }
    push(url);
  };
}
