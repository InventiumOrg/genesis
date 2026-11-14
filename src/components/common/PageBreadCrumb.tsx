import Link from "next/link";
import React from "react";

interface BreadcrumbProps {
  pageTitle: string;
  /** Section this page sits under, e.g. "Stock". Rendered as real wayfinding. */
  section?: string;
  sectionHref?: string;
  /** One line of what this screen is for, when the title does not carry it. */
  description?: string;
  /** Primary and secondary actions for this screen. */
  actions?: React.ReactNode;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({
  pageTitle,
  section,
  sectionHref,
  description,
  actions,
}) => {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-gray-200 pb-5 dark:border-gray-800">
      <div className="min-w-0">
        <nav aria-label="Breadcrumb">
          <ol className="label-cap flex flex-wrap items-center gap-1.5">
            <li>
              <Link className="hover:text-gray-900 dark:hover:text-white" href="/">
                Inventium
              </Link>
            </li>
            {section && (
              <>
                <li aria-hidden="true">/</li>
                <li>
                  {sectionHref ? (
                    <Link
                      className="hover:text-gray-900 dark:hover:text-white"
                      href={sectionHref}
                    >
                      {section}
                    </Link>
                  ) : (
                    section
                  )}
                </li>
              </>
            )}
          </ol>
        </nav>
        <h1 className="mt-2 text-title-sm font-bold text-gray-900 dark:text-white">
          {pageTitle}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-prose text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
};

export default PageBreadcrumb;
