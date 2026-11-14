import { redirect } from "next/navigation";

/** Sidebar "List" points here; main sales UI lives at `/sales`. */
export default function SaleListRedirectPage() {
  redirect("/sales");
}
