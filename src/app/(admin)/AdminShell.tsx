"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import DevTools from "@/components/DevTools";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import React, { useEffect } from "react";

/**
 * The signed-in chrome: sidebar, header, content well.
 *
 * A Client Component because the sidebar and the Clerk session gate are both
 * client state. It is wrapped by `layout.tsx`, which is a Server Component
 * and resolves the currency and the rate before this renders.
 */
export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useAuth();
  // const { user } = useUser();
  const router = useRouter();
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  /**
   * How long to wait for Clerk before saying so.
   *
   * `isLoaded` stays false until Clerk's browser script loads and answers. When
   * it never does — the script blocked, no publishable key reaching the client,
   * or a live key on a domain its instance does not allow — this screen used to
   * show "Loading dashboard…" for as long as anyone was willing to look at it.
   * An unbounded spinner is not a loading state; it is a failure with no
   * message, and it is what made this bug so hard to place.
   */
  const CLERK_WAIT_MS = 10_000;
  const [waitedTooLong, setWaitedTooLong] = React.useState(false);

  useEffect(() => {
    if (isLoaded) return;
    const timer = setTimeout(() => setWaitedTooLong(true), CLERK_WAIT_MS);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded && waitedTooLong) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 dark:bg-gray-950">
        <div className="max-w-md text-center">
          <h2 className="mb-3 text-title-sm font-bold text-gray-900 dark:text-white">
            Sign-in service did not answer
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            Clerk has not responded in {CLERK_WAIT_MS / 1000} seconds, so whether
            you are signed in cannot be established. Nothing is wrong with your
            stock or your sales; this screen simply cannot tell who you are.
          </p>
          <p className="mb-6 text-left font-mono text-[11px] leading-relaxed text-gray-500 dark:text-gray-500">
            Usually one of three things: the browser blocked
            clerk.browser.js, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set in
            this environment, or a live key is being used on a domain its Clerk
            instance does not allow.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-sm bg-brand-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 dark:bg-brand-500 dark:hover:bg-brand-400"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <LoadingSpinner message="Loading dashboard…" />
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 dark:bg-gray-950">
        <div className="max-w-sm text-center">
          <h2 className="mb-3 text-title-sm font-bold text-gray-900 dark:text-white">
            Sign in to continue
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            Stock and revenue are only visible to signed-in accounts.
          </p>
          <button
            onClick={() => router.push('/sign-in')}
            className="rounded-sm bg-brand-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 dark:bg-brand-500 dark:hover:bg-brand-400"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[272px]"
    : "lg:ml-[84px]";

  return (
    <div className="min-h-screen xl:flex">
      {/* Development Tools */}
      <DevTools />
      
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`min-w-0 flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="mx-auto max-w-(--breakpoint-2xl) p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
