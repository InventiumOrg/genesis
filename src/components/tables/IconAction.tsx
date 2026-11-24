'use client';

import React from 'react';

/**
 * A row action as an icon, not a word.
 *
 * Tables carried "View Edit Delete" on every row, so a page of twenty rows
 * spent sixty words telling the reader the same three things. The icons say it
 * once, in a shape people already read everywhere else.
 *
 * The word does not disappear, it moves: `label` becomes both the accessible
 * name and the native tooltip, so a screen reader hears "Edit recipe" and a
 * mouse gets the same text on hover. An icon button without that is a button
 * nobody can name.
 */

const BASE =
  'inline-flex size-7 items-center justify-center rounded-sm border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:text-gray-300 dark:border-gray-700 dark:bg-transparent dark:text-gray-400 dark:hover:bg-white/[0.06] dark:hover:text-white';

const DANGER =
  'inline-flex size-7 items-center justify-center rounded-sm border border-gray-300 bg-white text-error-600 transition-colors hover:border-error-300 hover:bg-error-50 hover:text-error-700 disabled:cursor-not-allowed disabled:text-gray-300 dark:border-gray-700 dark:bg-transparent dark:text-error-300 dark:hover:bg-error-500/10';

export function IconAction({
  label,
  onClick,
  icon,
  tone = 'default',
  disabled = false,
  busy = false,
}: {
  /** What this does, in words. Becomes the accessible name and the tooltip. */
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
  tone?: 'default' | 'danger';
  disabled?: boolean;
  /** Shown as a spinner in place of the icon while the action runs. */
  busy?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      aria-label={label}
      title={label}
      className={tone === 'danger' ? DANGER : BASE}
    >
      {busy ? (
        <span
          aria-hidden
          className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        <span aria-hidden className="[&>svg]:size-4">
          {icon}
        </span>
      )}
    </button>
  );
}

export default IconAction;
