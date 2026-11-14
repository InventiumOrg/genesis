'use client';

import Link from 'next/link';
import { useState } from 'react';

import { PLANS, type Plan } from './pricing-data';

/**
 * The schedule of charges: three plans as three columns of one sheet.
 *
 * Not three cards. A rate schedule is one document — the columns are divided
 * by the same hairline that divides every other field strip in this record
 * set, and the chosen plan is the heavy mass, inverted to the slate-teal shell
 * exactly as the totals bars are. Nothing is scaled up, badged, or lifted on a
 * shadow to mark it.
 *
 * Enterprise carries no amount, so its figure slot holds an em-dash and says
 * why in the same tracked caps every other absence on this surface uses. The
 * sheet does not derive a price to fill the column.
 */

type Period = 'monthly' | 'yearly';

const fmt = (v: number) => v.toLocaleString('en-US');

function PeriodToggle({
  period,
  onChange,
}: {
  period: Period;
  onChange: (p: Period) => void;
}) {
  const options: [Period, string][] = [
    ['monthly', 'Monthly'],
    ['yearly', 'Yearly · 2 months off'],
  ];
  return (
    <div
      role="group"
      aria-label="Billing period"
      className="inline-flex border border-gray-200 dark:border-gray-700"
    >
      {options.map(([value, label], i) => {
        const on = period === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(value)}
            className={`label-cap-sm h-8 px-3 transition-colors ${
              i === 1 ? 'border-l border-gray-200 dark:border-gray-700' : ''
            } ${
              on
                ? 'bg-brand-900 text-white dark:bg-brand-500'
                : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-transparent dark:text-gray-400 dark:hover:bg-white/8'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function Amount({ plan, period, lead }: { plan: Plan; period: Period; lead: boolean }) {
  const figure = lead ? 'text-white' : 'text-gray-900 dark:text-white';
  const unit = lead ? 'text-brand-100 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400';

  if (plan.monthly === null) {
    return (
      <>
        <b
          aria-hidden="true"
          className={`block text-[44px] leading-none font-extrabold tracking-[-0.035em] ${
            lead ? 'text-brand-300' : 'text-gray-300 dark:text-gray-700'
          }`}
        >
          —
        </b>
        <span className={`label-cap-sm mt-3 block ${lead ? 'text-brand-100 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}>
          Priced per estimate
        </span>
      </>
    );
  }

  const amount = period === 'yearly' ? plan.yearly! : plan.monthly;
  const per = period === 'yearly' ? '/ outlet / year' : '/ outlet / month';

  return (
    <>
      <b
        className={`block text-[44px] leading-none font-extrabold tracking-[-0.035em] tabular sm:text-[54px] ${figure}`}
      >
        ₫{fmt(amount)}
      </b>
      <span className={`mt-3 block font-mono text-[11px] tabular ${unit}`}>
        {plan.monthly === 0
          ? 'no charge, no card'
          : period === 'yearly'
            ? `${per} · ₫${fmt(Math.round(plan.yearly! / 12))} / month equivalent`
            : per}
      </span>
    </>
  );
}

export default function PlanRates() {
  const [period, setPeriod] = useState<Period>('monthly');

  return (
    <>
      <div className="flex flex-col gap-8 px-4 py-7 sm:px-5 lg:flex-row lg:items-start lg:gap-12">
        <div className="lg:flex-1">
          <h1 className="max-w-[22ch] text-[34px] leading-[1.02] font-extrabold tracking-[-0.03em] text-gray-900 sm:text-[44px] dark:text-white">
            A plan is a band, not a surprise.
          </h1>
          <p className="mt-4 max-w-[62ch] text-[14px] leading-5 text-gray-600 dark:text-gray-400">
            The product draws every quantity against the bound it has to stay inside. Its own
            charges are written the same way: each plan states the four limits that govern it, and
            you can see on the trace below when you are about to leave one. Nothing is metered
            quietly and nothing is charged for crossing a line you could not see.
          </p>
        </div>
        <div className="lg:shrink-0 lg:pt-1">
          <PeriodToggle period={period} onChange={setPeriod} />
          <p className="mt-3 max-w-[34ch] text-[12px] leading-[17px] text-gray-600 dark:text-gray-400">
            Yearly is ten months paid for twelve, charged once per outlet.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 border-t border-gray-200 lg:grid-cols-3 dark:border-gray-800">
        {PLANS.map((plan, i) => {
          const lead = plan.key === 'business';
          return (
            <section
              key={plan.key}
              aria-label={`${plan.name} plan`}
              className={`flex flex-col border-gray-200 dark:border-gray-800 ${
                i < PLANS.length - 1 ? 'border-b lg:border-r lg:border-b-0' : ''
              } ${lead ? 'bg-brand-900 dark:bg-white/[0.10]' : ''}`}
            >
              <div className="flex flex-1 flex-col px-4 pt-6 pb-7 sm:px-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h2
                    className={`text-[26px] leading-none font-bold tracking-[-0.02em] ${
                      lead ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {plan.name}
                  </h2>
                  {lead ? (
                    <span className="label-cap-sm text-brand-300 dark:text-gray-400">Default plan</span>
                  ) : null}
                </div>

                {/* A fixed slot so three different kinds of amount — a zero,
                    a figure, and an absence — start their next line together. */}
                <div className="mt-5 min-h-[84px]">
                  <Amount plan={plan} period={period} lead={lead} />
                </div>

                <p
                  className={`mt-5 max-w-[34ch] grow text-[14px] leading-5 ${
                    lead ? 'text-brand-100 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {plan.who}
                </p>

                <Link
                  href={plan.cta.href}
                  className={`mt-6 flex h-11 items-center justify-center rounded-sm px-5 text-[14px] font-semibold transition-colors ${
                    lead
                      ? 'bg-gray-50 text-brand-900 hover:bg-white'
                      : 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:bg-transparent dark:text-gray-100 dark:hover:bg-white/8'
                  }`}
                >
                  {plan.cta.label}
                </Link>
                <p
                  className={`mt-3 text-[12px] leading-[17px] ${
                    lead ? 'text-brand-200 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {plan.aside}
                </p>
              </div>

              {/* The four bounds that govern the plan, read as a field strip. */}
              <dl
                className={`mt-auto border-t ${
                  lead ? 'border-white/15' : 'border-gray-200 dark:border-gray-800'
                }`}
              >
                {plan.limits.map(([k, v], j) => (
                  <div
                    key={k}
                    className={`flex items-baseline justify-between gap-4 px-4 py-2.5 sm:px-5 ${
                      j > 0
                        ? lead
                          ? 'border-t border-white/10'
                          : 'border-t border-gray-100 dark:border-gray-800'
                        : ''
                    }`}
                  >
                    <dt className={`label-cap ${lead ? '!text-brand-300 dark:!text-gray-400' : ''}`}>{k}</dt>
                    <dd
                      className={`font-mono text-[13px] tabular ${
                        lead ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          );
        })}
      </div>
    </>
  );
}
