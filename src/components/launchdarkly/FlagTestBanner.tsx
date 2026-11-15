'use client';

import { useFlags } from 'launchdarkly-react-client-sdk';

/**
 * The flag key as LaunchDarkly stores it. `useFlags` hands back camelCase keys
 * by default, so a kebab-case flag arrives under its camelCase name.
 */
export const TEST_BANNER_FLAG_KEY = 'test-banner';

const FLAG_URL = 'https://app.launchdarkly.com/';

/**
 * A strip that reads its own state off a flag, so the page can be watched
 * changing while the server keeps running. It is a check that the wiring works,
 * not a product surface: delete it once a real flag takes its place.
 */
export default function FlagTestBanner() {
  const flags = useFlags();
  const isOn = Boolean(flags.testBanner);

  return (
    <div
      role="status"
      className={
        isOn
          ? 'flex items-center justify-center gap-3 border-b border-success-200 bg-success-50 px-4 py-2.5 text-sm font-medium text-success-800'
          : 'flex items-center justify-center gap-3 border-b border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700'
      }
    >
      <span
        aria-hidden
        className={
          isOn
            ? 'size-1.5 rounded-full bg-success-500'
            : 'size-1.5 rounded-full bg-gray-400'
        }
      />
      <span>
        LaunchDarkly test banner (flag is {isOn ? 'on' : 'off'})
      </span>
      <a
        href={FLAG_URL}
        target="_blank"
        rel="noreferrer"
        className="underline underline-offset-2 hover:no-underline"
      >
        View flag
      </a>
    </div>
  );
}
