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
