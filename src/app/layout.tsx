import localFont from 'next/font/local';
import './globals.css';

import LaunchDarklyProvider from '@/components/launchdarkly/LaunchDarklyProvider';
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ClerkProvider } from '@clerk/nextjs';

/**
 * The faces are files in this repository, not a build-time download.
 *
 * `next/font/google` fetches Google's stylesheet during every build and reads
 * the font URL out of it. When Google answers with a URL that does not end in
 * a file extension, its loader does `/\.(woff|woff2|eot|ttf|otf)$/.exec(url)[1]`
 * on `null` and the build dies with "Cannot read properties of null (reading
 * '1')". That is a network response deciding whether a deploy succeeds, and it
 * failed this repository twice.
 *
 * `src/fonts/*.woff2` are the upstream variable fonts from google/fonts,
 * converted to woff2 (276 KB of TTF down to 112 KB). Variable means one file
 * carries every weight, so there is no file-per-weight list to keep in step
 * with the design, and full coverage means ₫ (U+20AB) renders in both faces —
 * the mono face previously could not show it, because the vietnamese subset
 * was the exact request Google's CSS broke on.
 *
 * `src/fonts/OFL.txt` is the licence these fonts ship under.
 */
const chivo = localFont({
  src: './../fonts/chivo-variable.woff2',
  weight: '100 900',
  style: 'normal',
  variable: '--font-chivo',
  display: 'swap',
  // Kept so a face swapping in does not shift the line it sits on.
  adjustFontFallback: 'Arial',
});

const chivoMono = localFont({
  src: './../fonts/chivo-mono-variable.woff2',
  weight: '100 900',
  style: 'normal',
  variable: '--font-chivo-mono',
  display: 'swap',
});

/**
 * Clerk ships its own components (sign-in, user button, modals). Left alone
 * they arrive in Clerk's default purple, which belongs to no part of this
 * world. They are themed from the same tokens as everything else.
 */
const clerkAppearance = {
  variables: {
    colorPrimary: '#0e2a33',
    colorText: '#101a1e',
    colorTextSecondary: '#5e7480',
    colorBackground: '#ffffff',
    colorInputBackground: '#ffffff',
    colorInputText: '#101a1e',
    colorDanger: '#c8321f',
    colorSuccess: '#0f7f8c',
    colorWarning: '#a8750c',
    borderRadius: '2px',
    fontFamily: 'var(--font-chivo), ui-sans-serif, system-ui, sans-serif',
  },
  elements: {
    card: 'border border-gray-200 shadow-theme-sm',
    headerTitle: 'font-bold tracking-tight',
    formButtonPrimary:
      'bg-brand-900 hover:bg-brand-800 text-white font-semibold normal-case',
    footerActionLink: 'text-success-700 hover:text-success-600',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      {/* The face variables live on <html>, not <body>: globals.css composes
          --font-sans / --font-mono from them at :root, and a custom property
          referenced where it is not yet defined resolves to nothing. */}
      <html lang="en" className={`${chivo.variable} ${chivoMono.variable}`}>
        <body className="dark:bg-gray-950">
          <ThemeProvider>
            <SidebarProvider>
              <LaunchDarklyProvider>{children}</LaunchDarklyProvider>
            </SidebarProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
