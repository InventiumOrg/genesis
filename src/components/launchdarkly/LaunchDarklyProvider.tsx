'use client';

import { asyncWithLDProvider } from 'launchdarkly-react-client-sdk';
import { useEffect, useState, type ReactNode } from 'react';

type Provider = Awaited<ReturnType<typeof asyncWithLDProvider>>;

/**
 * The flag client lives in the browser, so the tree can re-render the moment a
 * flag changes rather than waiting for a new server render. `asyncWithLDProvider`
 * resolves once the underlying client has its first flag payload, which is why
 * the provider is held in state: the children render unflagged for that first
 * tick and then again under the provider, instead of flickering a default
 * value into the page.
 *
 * With no client-side ID set, this renders its children untouched. The app must
 * run without a LaunchDarkly account — a missing credential is a flag that
 * stays off, never a blank page.
 */
export default function LaunchDarklyProvider({
  children,
}: {
  children: ReactNode;
}) {
  const clientSideID =
    process.env.NEXT_PUBLIC_LAUNCHDARKLY_CLIENT_SIDE_ID?.trim();
  const [LDProvider, setLDProvider] = useState<Provider | null>(null);

  useEffect(() => {
    if (!clientSideID) return;
    let cancelled = false;

    void (async () => {
      try {
        const provider = await asyncWithLDProvider({
          clientSideID,
          // An anonymous context is enough to evaluate a flag. Keying the
          // context to the signed-in Clerk user is what targeting rules would
          // need; nothing here targets yet.
          context: { kind: 'user', key: 'anonymous', anonymous: true },
          timeout: 2,
        });
        if (!cancelled) setLDProvider(() => provider);
      } catch (error) {
        // A flag service that cannot be reached must not take the page with
        // it. Every flag falls back to its default and the app renders.
        console.error('LaunchDarkly init failed:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clientSideID]);

  if (!LDProvider) return <>{children}</>;
  return <LDProvider>{children}</LDProvider>;
}
