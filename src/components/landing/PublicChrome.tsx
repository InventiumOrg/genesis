import Link from 'next/link';

/**
 * The chrome both public surfaces share.
 *
 * The app's nav rail arrives on a public page as one flat slate-teal field at
 * the top edge — same colour, same flatness, same mono label voice — so the
 * landing record and the rate schedule read as two sheets of one set rather
 * than two websites. The nav items differ per surface, which is why they are
 * passed in: each page lists its own sheets, then the sibling surface.
 */

export type NavItem = [href: string, label: string];

export function PublicHeader({
  nav,
  navLabel,
  authed = false,
}: {
  nav: NavItem[];
  navLabel: string;
  /** A signed-in visitor is offered the app, not a second account. */
  authed?: boolean;
}) {
  return (
    <header className="sticky top-0 z-20 bg-brand-900">
      <div className="mx-auto flex h-14 max-w-[1536px] items-center gap-4 px-4 sm:gap-8 sm:px-6">
        <Link
          href="/"
          className="text-[19px] leading-none font-extrabold tracking-tight text-white"
        >
          INVENT<span className="text-orange-400">IUM</span>
        </Link>
        <nav aria-label={navLabel} className="hidden gap-6 lg:flex">
          {nav.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="label-cap-sm text-brand-100 transition-colors hover:text-white"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {authed ? (
            <Link
              href="/dashboard"
              className="flex h-9 items-center rounded-sm bg-gray-50 px-3 text-[13px] font-semibold text-brand-900 transition-colors hover:bg-white sm:px-4"
            >
              Open the app
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="flex h-9 items-center rounded-sm border border-white/25 px-3 text-[13px] font-semibold text-white transition-colors hover:bg-white/10 sm:px-4"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="flex h-9 items-center rounded-sm bg-gray-50 px-3 text-[13px] font-semibold text-brand-900 transition-colors hover:bg-white sm:px-4"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function PublicFooter({
  formIndex,
  note,
  authed = false,
}: {
  /** The form designations of the surface above, in reading order. */
  formIndex: string;
  note: string;
  authed?: boolean;
}) {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto flex max-w-[1536px] flex-wrap items-center gap-x-8 gap-y-2 px-4 py-5 sm:px-6">
        <span className="label-cap">Inventium</span>
        <span className="label-cap">{formIndex}</span>
        <span className="label-cap">{note}</span>
        <span className="ml-auto flex gap-5">
          <Link
            href="/pricing"
            className="label-cap-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            Pricing
          </Link>
          {authed ? (
            <Link
              href="/dashboard"
              className="label-cap-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Open the app
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="label-cap-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="label-cap-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Create account
              </Link>
            </>
          )}
        </span>
      </div>
    </footer>
  );
}
