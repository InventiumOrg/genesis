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
 * Send the browser to `destination` after a session is established.
 *
 * Always a **full page load**, never a client navigation. The session lives in
 * a cookie that the server reads, and a `router.push` keeps the current
 * document: the admin layout's own `auth()` call can run against the cookie
 * state the page started with, and the sign-in screen is the one place where
 * that state is guaranteed to be out of date. A full load makes the server read
 * the cookie that was just set, which is the whole point of arriving there.
 *
 * `decorateUrl` is used when Clerk offers it. Where Safari's ITP would drop the
 * cookie, it returns an absolute URL through Clerk's `/v1/client/touch`
 * endpoint, which refreshes the cookie and then forwards on. Clerk 6 did this
 * inside `setActive`; in Clerk 7 it is the caller's job.
 */
export function goAfterAuth(
  destination: string,
  decorateUrl?: (url: string) => string,
): void {
  let url = destination;
  try {
    if (decorateUrl) url = decorateUrl(destination) || destination;
  } catch (error) {
    // A decorator that throws must not strand the person on the sign-in
    // screen. The undecorated path still works everywhere ITP is not in play.
    console.error('Clerk decorateUrl failed; navigating undecorated.', error);
  }
  window.location.assign(url);
}

/**
 * Finish an attempt and leave, whether or not Clerk calls the callback.
 *
 * `finalize` is given a `navigate`, and the documented contract is that it runs
 * it. Relying on that alone left the screen spinning with the URL unchanged:
 * if the callback is not reached, or `finalize` settles without running it,
 * nothing navigates and there is no error to show either. So the navigation is
 * attempted once from the callback and once after `finalize` returns, guarded
 * by a flag — whichever happens first wins, and a missed callback is no longer
 * a dead end.
 */
export async function finalizeAndGo(
  finalize: (opts: {
    navigate: (params: { decorateUrl: (url: string) => string }) => void;
  }) => Promise<unknown>,
  destination: string,
): Promise<void> {
  let left = false;
  const go = (decorateUrl?: (url: string) => string) => {
    if (left) return;
    left = true;
    goAfterAuth(destination, decorateUrl);
  };

  try {
    await finalize({ navigate: ({ decorateUrl }) => go(decorateUrl) });
  } finally {
    // Undecorated, because a `decorateUrl` was never handed over on this path.
    go();
  }
}
