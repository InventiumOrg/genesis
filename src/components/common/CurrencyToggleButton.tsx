'use client';

import React from 'react';

import { useCurrency } from '@/context/CurrencyContext';
import { CURRENCIES, type Currency } from '@/lib/currency';

const SYMBOL: Record<Currency, string> = { USD: '$', VND: '₫' };

/**
 * Which currency the reader is looking at.
 *
 * Both options are shown rather than one flipping label, because the choice is
 * between two readings of the same figure and a single-state button cannot say
 * which one is on screen. The rate note is in the `title` so the pair stays the
 * size of the buttons beside it, and hovering still answers "converted how?".
 */
export function CurrencyToggleButton() {
  const { currency, setCurrency, note } = useCurrency();

  return (
    <div
      role="group"
      aria-label="Currency shown"
      title={note ?? 'Amounts as recorded, in US dollars'}
      className="flex h-10 items-center rounded-sm border border-gray-200 bg-white p-0.5 dark:border-gray-800 dark:bg-transparent"
    >
      {CURRENCIES.map((option) => {
        const active = option === currency;
        return (
          <button
            key={option}
            type="button"
            onClick={() => setCurrency(option)}
            aria-pressed={active}
            className={`flex h-full min-w-[2.5rem] items-center justify-center gap-1 px-2 font-mono text-[11px] font-semibold tracking-wider transition-colors ${
              active
                ? 'bg-brand-900 text-white dark:bg-brand-500'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <span aria-hidden className="text-sm">
              {SYMBOL[option]}
            </span>
            {option}
          </button>
        );
      })}
    </div>
  );
}

export default CurrencyToggleButton;
