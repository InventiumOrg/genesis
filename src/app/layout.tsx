import { Chivo, Chivo_Mono } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ClerkProvider } from '@clerk/nextjs';

// The vietnamese subset carries ₫ (U+20AB). Without it the currency mark
// falls back to another face and reads lighter than the digits beside it.
const chivo = Chivo({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-chivo',
  display: 'swap',
});

// Chivo Mono stays on `latin`: next/font 15.2.3 cannot parse Google's CSS
// for this family's vietnamese subset and fails the build. The consequence
// is that ₫ inside a mono cell still falls back to another face, as it
// always has; the display figures, which are Chivo sans, now render it.
const chivoMono = Chivo_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
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
            <SidebarProvider>{children}</SidebarProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
