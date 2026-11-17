import SignInForm from "@/components/auth/SignInForm";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in | Inventium",
  description: "Sign in to your inventory management account",
};

/**
 * A signed-in visitor never reaches the form.
 *
 * The session resolves on the server and redirects before any HTML is sent, so
 * there is no moment where someone who is already signed in can press Sign in
 * and be told so. The same guard the landing page uses, for the same reason.
 */
export default async function SignIn() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="relative z-1 bg-white p-6 dark:bg-gray-950 sm:p-0">
      <ThemeProvider>
        <div className="relative flex h-screen w-full flex-col justify-center lg:flex-row dark:bg-gray-950 sm:p-0">
          <SignInForm />
          <div className="hidden h-full w-full items-center bg-brand-900 lg:grid lg:w-1/2">
            <div className="relative z-1 mx-auto max-w-sm px-10">
              <Link href="/" className="block">
                <div className="text-[28px] leading-none font-extrabold tracking-tight text-white">
                  INVENT<span className="text-orange-400">IUM</span>
                </div>
                <div className="label-cap mt-2 !text-brand-300">
                  Stock · Service · Revenue
                </div>
              </Link>
              <p className="mt-8 text-[15px] leading-relaxed text-brand-100">
                A sale rings up, its recipe draws the ingredients down from
                stock, and the revenue lands on your board. One system, from the
                warehouse shelf to the counter.
              </p>
            </div>
          </div>
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
