import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sale overview | Dashboard",
  description: "Sale module overview",
};

const links = [
  { href: "/pos", label: "POS", description: "Point of sale terminals" },
  { href: "/orders", label: "Orders", description: "Order records" },
  { href: "/sales", label: "Sales", description: "Sales list and management" },
];

export default function SaleOverviewPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Sale overview" />
      <div className="space-y-6">
        <p className="text-gray-600 dark:text-gray-400">
          Quick links to sale-related areas.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map(({ href, label, description }) => (
            <Link key={href} href={href}>
              <ComponentCard title={label} className="h-full transition hover:border-brand-500/40">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              </ComponentCard>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
