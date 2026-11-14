import React from "react";

interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
  desc?: string; // Description text
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
}) => {
  const hasHeader = Boolean(title || desc);

  return (
    <div
      className={`border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      {hasHeader && (
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          {title && (
            <h3 className="label-cap-sm font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {desc && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{desc}</p>
          )}
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
};

export default ComponentCard;
