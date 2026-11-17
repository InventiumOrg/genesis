"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useSignIn, useAuth } from "@clerk/nextjs";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { finalizeAndGo, goAfterAuth, isSessionExists } from "@/lib/clerk-session";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { signIn } = useSignIn();
  const { isSignedIn } = useAuth();

  // Already signed in on arrival. A full load, not a client navigation: the
  // server has to read the session cookie to let the dashboard through, and
  // this screen is exactly where the document's own view of it is stale.
  React.useEffect(() => {
    if (isSignedIn) {
      goAfterAuth('/dashboard');
    }
  }, [isSignedIn]);

  /**
   * Handle email/password sign in.
   *
   * Clerk 7 returns `{ error }` rather than throwing, and the attempt's state
   * is read off `signIn` afterwards instead of off a return value. A session is
   * activated by `finalize`, which replaces the `setActive` the hook no longer
   * hands out.
   */
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signIn) return;

    // Already signed in: the request is already satisfied, so go rather than
    // ask Clerk to open a second session and refuse.
    if (isSignedIn) {
      goAfterAuth("/dashboard");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { error: attemptError } = await signIn.password({
        identifier: email,
        password,
      });

      if (attemptError) {
        // `session_exists` means a session appeared between the check above
        // and this call — another tab, or Clerk finishing its load. That is
        // the outcome the person wanted, not an error to show them.
        if (isSessionExists(attemptError)) {
          goAfterAuth("/dashboard");
          return;
        }
        setError(attemptError.longMessage || attemptError.message);
        return;
      }

      if (signIn.status === "complete") {
        // Activates the session, then leaves with a full page load so the
        // server reads the cookie that was just set. It navigates whether or
        // not Clerk runs the callback, because a missed callback left this
        // screen spinning with the URL unchanged and no error to show.
        await finalizeAndGo((opts) => signIn.finalize(opts), "/dashboard");
        return;
      }

      // A status other than `complete` is a step this form does not implement
      // — a second factor, a password reset. Saying which one is more use than
      // blaming the credentials.
      setError(`This account needs another step to sign in (${signIn.status}), which this form cannot complete yet.`);
    } catch (err: unknown) {
      console.error("Sign in error:", err);
      setError(err instanceof Error ? err.message : "Sign in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OAuth sign in (Google, X/Twitter)
  const handleOAuthSignIn = async (provider: "oauth_google" | "oauth_twitter") => {
    if (!signIn) return;

    if (isSignedIn) {
      goAfterAuth("/dashboard");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { error: ssoError } = await signIn.sso({
        strategy: provider,
        redirectUrl: "/sso-callback",
        redirectCallbackUrl: "/dashboard",
      });
      if (ssoError) {
        if (isSessionExists(ssoError)) {
          goAfterAuth("/dashboard");
          return;
        }
        setError(ssoError.longMessage || ssoError.message);
        setIsLoading(false);
      }
      // On success the browser is already leaving for the provider; the
      // spinner is left running rather than flashing off mid-redirect.
    } catch (err: unknown) {
      console.error("OAuth sign in error:", err);
      setError(err instanceof Error ? err.message : "OAuth sign in failed. Please try again.");
      setIsLoading(false);
    }
  };
  return (
    <div className="flex w-full min-w-0 flex-1 flex-col lg:w-1/2">
      <div className="mx-auto mb-5 w-full max-w-md min-w-0 sm:pt-10">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to Inventium
        </Link>
      </div>
      <div className="mx-auto flex w-full max-w-md min-w-0 flex-1 flex-col justify-center">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign in
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Stock, sales and revenue for your outlets.
            </p>
          </div>
          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
              <button 
                type="button"
                onClick={() => handleOAuthSignIn("oauth_google")}
                disabled={isLoading}
                className="inline-flex min-w-0 items-center justify-center gap-2.5 rounded-sm border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 dark:border-gray-700 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z"
                      fill="#EB4335"
                    />
                  </svg>
                )}
                Sign in with Google
              </button>
              <button 
                type="button"
                onClick={() => handleOAuthSignIn("oauth_twitter")}
                disabled={isLoading}
                className="inline-flex min-w-0 items-center justify-center gap-2.5 rounded-sm border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 dark:border-gray-700 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg
                    width="21"
                    className="fill-current"
                    height="20"
                    viewBox="0 0 21 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M15.6705 1.875H18.4272L12.4047 8.75833L19.4897 18.125H13.9422L9.59717 12.4442L4.62554 18.125H1.86721L8.30887 10.7625L1.51221 1.875H7.20054L11.128 7.0675L15.6705 1.875ZM14.703 16.475H16.2305L6.37054 3.43833H4.73137L14.703 16.475Z" />
                  </svg>
                )}
                Sign in with X
              </button>
            </div>
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white p-2 text-gray-500 dark:bg-gray-950 dark:text-gray-400 sm:px-5 sm:py-2">
                  Or
                </span>
              </div>
            </div>
            {error && (
              <div className="p-4 mb-4 text-sm text-error-700 bg-error-100 rounded-lg dark:bg-error-900/20 dark:text-error-400">
                {error}
              </div>
            )}
            
            <form onSubmit={handleEmailSignIn}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input 
                    placeholder="info@gmail.com" 
                    type="email" 
                    defaultValue={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      defaultValue={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <Link
                    href="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div>
                  <button 
                    type="submit" 
                    className="w-full rounded-sm bg-brand-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 dark:bg-brand-500 dark:hover:bg-brand-400 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
                    disabled={isLoading || !email || !password}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Signing in...
                      </div>
                    ) : (
                      "Sign in"
                    )}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account? {""}
                <Link
                  href="/sign-up"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
      </div>
      </div>
      
    </div>
  );
}
