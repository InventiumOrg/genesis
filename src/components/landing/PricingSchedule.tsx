import Link from 'next/link';

import PlanRates from './PlanRates';
import { CELL, Sheet, StateMark, SUB, Th } from './sheet';
import { PublicFooter, PublicHeader, type NavItem } from './PublicChrome';
import { EnvelopeTrace } from '@/components/trace/EnvelopeTrace';

import {
  CAPACITY_BAND,
  CAPACITY_MONTHS,
  CAPACITY_READOUT,
  CAPACITY_TOTALS,
  INCLUSIONS,
  NOT_CLAIMED_PRICING,
  QUESTIONS,
  RATE_FIELDS,
  type Cell,
} from './pricing-data';

/**
 * The rate schedule — the second Persuade surface, and a sheet of the same set
 * as the landing record.
 *
 * The thesis: a plan is a par band. This product draws every quantity against
 * the bound it has to stay inside, so its own commercial terms are drawn that
 * way too — four stated limits per plan, and the capacity envelope on RS-03
 * showing what outgrowing one actually looks like before an invoice says it.
 * Every amount here is an authored sample (see ./pricing-data.ts), and NB-01
 * says so on the page rather than leaving a visitor to assume otherwise.
 */

const NAV: NavItem[] = [
  ['#rs-01', 'Charges'],
  ['#rs-02', 'Inclusions'],
  ['#rs-03', 'Capacity'],
  ['#nb-01', 'Not claimed'],
  ['/', 'The record'],
];

/** A schedule cell: a mark, an em-dash, a measure, or a labelled absence. */
function Inclusion({ cell }: { cell: Cell }) {
  switch (cell.kind) {
    case 'yes':
      return (
        <>
          <span aria-hidden="true" className="inline-block h-2 w-2 bg-gray-900 dark:bg-gray-100" />
          <span className="sr-only">Included</span>
        </>
      );
    case 'no':
      return (
        <>
          <span aria-hidden="true" className="font-mono text-[13px] text-gray-400">
            —
          </span>
          <span className="sr-only">Not included</span>
        </>
      );
    case 'measure':
      return (
        <span className="font-mono text-[12px] tabular text-gray-900 dark:text-gray-100">
          {cell.v}
        </span>
      );
    case 'absent':
      return <span className="label-cap-sm text-gray-600 dark:text-gray-400">{cell.v}</span>;
  }
}

/**
 * The signature mark earning its place on a commercial page: twelve months of
 * recorded events against the allowance Business includes. The band is the
 * plan; the crossing is the month you outgrew it. Lettering is HTML laid over
 * the plot so a label never stretches with the viewBox.
 */
function CapacityRegion() {
  return (
    <div className="mx-4 mb-7 border border-gray-200 sm:mx-5 dark:border-gray-800">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-gray-200 px-4 py-2.5 dark:border-gray-800">
        <span className="label-cap">Sample outlet group · events recorded · 12 months</span>
        <span className="label-cap hidden sm:inline">
          Recorded in amber · plan allowance in teal · crossing in red
        </span>
      </div>
      <div className="flex flex-col gap-5 px-4 py-5 lg:flex-row lg:items-start lg:gap-8">
        <div className="lg:w-[250px] lg:shrink-0">
          <span className="label-cap">Month 12</span>
          <b className="mt-1.5 block text-[44px] leading-none font-extrabold tracking-[-0.035em] tabular text-gray-900 sm:text-[54px] dark:text-white">
            {CAPACITY_READOUT.now}
            <i className="ml-2 font-mono text-[18px] not-italic tracking-normal text-gray-600 dark:text-gray-400">
              {CAPACITY_READOUT.unit}
            </i>
          </b>
          <span className="mt-2.5 block">
            <StateMark label="Above plan" tone="breach" />
          </span>
          <span className="mt-2.5 block font-mono text-[11px] tabular text-gray-600 dark:text-gray-400">
            Business includes {CAPACITY_READOUT.bound}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          {/* The plot is inset below the labels: the breach rule is drawn
              full height, so a label sitting over it would be struck through. */}
          <div className="trace-print relative h-[188px] pt-7">
            <EnvelopeTrace
              points={CAPACITY_MONTHS}
              par={CAPACITY_BAND}
              width={760}
              height={160}
              showBreach
              title="A sample outlet group's recorded events per month over twelve months against the 6,000 events a month included on Business. The reading crossed the allowance in month eleven at 6,220 events and stands at 6,900 in month twelve, 900 over."
            />
            <span className="label-cap-sm absolute top-0 right-0 text-error-600 dark:text-error-300">
              {CAPACITY_READOUT.crossing}
            </span>
            {/* The bound that matters on this plot is the ceiling, so the
                label sits just above it rather than on the baseline. */}
            <span className="label-cap-sm absolute top-[52px] left-0 text-success-700 dark:text-success-300">
              {CAPACITY_READOUT.ceiling}
            </span>
          </div>
          <div className="mt-2 flex justify-between">
            <span className="label-cap">Month 1</span>
            <span className="label-cap">Month 6</span>
            <span className="label-cap">Month 12</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PricingSchedule({ authed = false }: { authed?: boolean }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <PublicHeader nav={NAV} navLabel="Sections of this schedule" authed={authed} />

      <main className="mx-auto max-w-[1536px] space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <Sheet
          id="rs-01"
          form="Form RS-01 · what it costs"
          note="Sample amounts · nothing is billed yet"
        >
          <PlanRates />
          <dl className="grid grid-cols-2 border-t border-gray-200 lg:grid-cols-5 dark:border-gray-800">
            {RATE_FIELDS.map(([k, v], i) => (
              <div
                key={k}
                className={`border-r border-gray-100 px-4 py-3 even:border-r-0 last:border-r-0 sm:px-5 lg:even:border-r lg:last:border-r-0 dark:border-gray-800 ${
                  i < RATE_FIELDS.length - 1 ? 'border-b lg:border-b-0' : ''
                } ${
                  i === RATE_FIELDS.length - 1
                    ? 'col-span-2 flex items-baseline justify-between gap-4 lg:col-span-1 lg:block'
                    : ''
                }`}
              >
                <dt className="label-cap">{k}</dt>
                <dd
                  className={`font-mono text-[13px] tabular text-gray-900 dark:text-gray-100 ${
                    i === RATE_FIELDS.length - 1 ? 'lg:mt-1.5' : 'mt-1.5'
                  }`}
                >
                  {v}
                </dd>
              </div>
            ))}
          </dl>
        </Sheet>

        <Sheet
          id="rs-02"
          form="Form RS-02 · what is included"
          note="Sample lines · nothing is contracted"
        >
          <div className="px-4 py-7 sm:px-5">
            <h2 className="max-w-[32ch] text-[26px] leading-[1.06] font-extrabold tracking-[-0.025em] text-gray-900 sm:text-[34px] dark:text-white">
              Line by line, in one table.
            </h2>
            <p className="mt-3 max-w-[62ch] text-[14px] leading-5 text-gray-600 dark:text-gray-400">
              A filled square means the line is included, an em-dash means it is not, and a figure
              means the plan bounds it. Where something does not exist in the product yet, the row
              says so on every plan instead of selling it on one.
            </p>
          </div>
          {/* Fixed layout: a comparison table must stay whole at 390px, so the
              columns are declared and the copy wraps inside them rather than
              the sheet growing past the screen. */}
          <table className="w-full table-fixed border-collapse">
            <caption className="sr-only">
              What each plan includes. Sample lines; no plan has been priced or billed.
            </caption>
            <thead>
              <tr>
                <Th className="w-[40%] pl-4 sm:w-[34%] sm:pl-5">Line</Th>
                {/* The plan heads wrap rather than force the table wider than
                    the viewport: at 390px the schedule stays whole. */}
                {(
                  [
                    ['Free', ''],
                    ['Business', 'bg-brand-25 dark:bg-white/4'],
                    ['Enterprise', ''],
                  ] as [string, string][]
                ).map(([name, tint], i) => (
                  <th
                    key={name}
                    scope="col"
                    className={`label-cap w-[20%] border-b border-gray-900 px-1.5 py-2.5 text-center font-normal tracking-[0.04em] sm:w-[22%] sm:px-2 sm:tracking-[0.17em] dark:border-gray-100 ${tint} ${
                      i === 2 ? 'pr-4 sm:pr-5' : ''
                    }`}
                  >
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            {INCLUSIONS.map((section) => (
              <tbody key={section.group}>
                <tr>
                  <th
                    scope="colgroup"
                    colSpan={4}
                    className="label-cap border-b border-gray-200 bg-gray-50 px-4 py-2 text-left font-normal sm:px-5 dark:border-gray-800 dark:bg-white/4"
                  >
                    {section.group}
                  </th>
                </tr>
                {section.rows.map((row) => (
                  <tr
                    key={row.label}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-white/3"
                  >
                    <th scope="row" className={`${CELL} pl-4 text-left font-normal sm:pl-5`}>
                      <span className="block text-[14px] text-gray-900 dark:text-gray-100">
                        {row.label}
                      </span>
                      {/* Priority step-aside: the detail leaves the phone layout but
                          never leaves the document. */}
                      <span className={`${SUB} sr-only sm:not-sr-only sm:block`}>{row.detail}</span>
                    </th>
                    <td className={`${CELL} px-1.5 text-center sm:px-2`}>
                      <Inclusion cell={row.free} />
                    </td>
                    <td className={`${CELL} bg-brand-25 px-1.5 text-center sm:px-2 dark:bg-white/4`}>
                      <Inclusion cell={row.business} />
                    </td>
                    <td className={`${CELL} px-1.5 pr-4 text-center sm:px-2 sm:pr-5`}>
                      <Inclusion cell={row.enterprise} />
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </Sheet>

        <Sheet
          id="rs-03"
          form="Form RS-03 · capacity envelope"
          note="12 months · sample outlet group"
        >
          <div className="px-4 py-7 sm:px-5">
            <h2 className="max-w-[32ch] text-[26px] leading-[1.06] font-extrabold tracking-[-0.025em] text-gray-900 sm:text-[34px] dark:text-white">
              You can see the bound before you cross it.
            </h2>
            <p className="mt-3 max-w-[62ch] text-[14px] leading-5 text-gray-600 dark:text-gray-400">
              The same mark the product draws stock with, drawn against a plan: teal is what the
              plan includes, amber is what you actually recorded, red is the month you went past.
              Growing out of a plan is a reading you watch arrive, not a line on a bill you did not
              expect.
            </p>
          </div>
          <CapacityRegion />
          <div className="flex flex-wrap items-end gap-x-10 gap-y-5 bg-brand-900 px-4 py-5 sm:px-5">
            {CAPACITY_TOTALS.map(([k, v]) => (
              <div key={k}>
                <span className="label-cap !text-brand-300">{k}</span>
                <span className="mt-1 block text-[26px] font-extrabold tabular tracking-[-0.02em] text-white">
                  {v}
                </span>
              </div>
            ))}
            <p className="ml-auto max-w-[36ch] text-[12px] leading-[17px] text-brand-100">
              Crossing a bound starts a conversation, not an overage.
            </p>
          </div>
        </Sheet>

        <Sheet id="rs-04" form="Form RS-04 · questions on pricing" note="Answered in plain terms">
          <dl className="grid grid-cols-1 border-t border-gray-200 lg:grid-cols-2 dark:border-gray-800">
            {QUESTIONS.map(([q, a], i) => (
              <div
                key={q}
                className={`border-gray-100 px-4 py-5 sm:px-5 dark:border-gray-800 ${
                  i < QUESTIONS.length - 1 ? 'border-b' : ''
                } ${i % 2 === 0 ? 'lg:border-r' : ''} ${
                  i >= QUESTIONS.length - 2 ? 'lg:border-b-0' : 'lg:border-b'
                }`}
              >
                <dt className="text-[14px] font-semibold text-gray-900 dark:text-gray-100">{q}</dt>
                <dd className="mt-2 max-w-[58ch] text-[14px] leading-5 text-gray-600 dark:text-gray-400">
                  {a}
                </dd>
              </div>
            ))}
          </dl>
        </Sheet>

        <Sheet id="nb-01" form="Form NB-01 · not claimed" note="Read this one before you compare">
          <div className="px-4 py-7 sm:px-5">
            <h2 className="max-w-[32ch] text-[26px] leading-[1.06] font-extrabold tracking-[-0.025em] text-gray-900 sm:text-[34px] dark:text-white">
              What this schedule does not claim.
            </h2>
            <p className="mt-3 max-w-[62ch] text-[14px] leading-5 text-gray-600 dark:text-gray-400">
              These amounts are placeholders. Nothing in this product takes a payment yet, and the
              surface says so in the same tracked caps it uses for a missing par level — because a
              sheet that invents one figure is not trustworthy about the rest.
            </p>
          </div>
          <table className="w-full border-collapse">
            <caption className="sr-only">Facts this schedule does not assert.</caption>
            <thead>
              <tr>
                <Th className="hidden pl-4 sm:table-cell sm:pl-5">№</Th>
                <Th className="pl-4 sm:pl-3">Subject</Th>
                <Th>Answer on file</Th>
                <Th className="hidden pr-4 md:table-cell sm:pr-5">What the surface does instead</Th>
              </tr>
            </thead>
            <tbody>
              {NOT_CLAIMED_PRICING.map((c) => (
                <tr key={c.n} className="transition-colors hover:bg-gray-50 dark:hover:bg-white/3">
                  <td
                    className={`${CELL} hidden pl-4 font-mono text-[12px] tabular text-gray-600 sm:table-cell sm:pl-5 dark:text-gray-400`}
                  >
                    {c.n}
                  </td>
                  <td className={`${CELL} pl-4 text-[14px] sm:pl-3`}>
                    {c.subject}
                    <span className={`${SUB} md:hidden`}>{c.note}</span>
                  </td>
                  <td className={`${CELL} label-cap-sm whitespace-nowrap text-gray-600 dark:text-gray-400`}>
                    {c.answer}
                  </td>
                  <td
                    className={`${CELL} hidden pr-4 font-mono text-[12px] text-gray-600 md:table-cell sm:pr-5 dark:text-gray-400`}
                  >
                    {c.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Sheet>

        <section className="border border-gray-200 bg-brand-900 dark:border-gray-800">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-white/15 px-4 py-2.5 sm:px-5">
            <span className="label-cap !text-brand-300">Form SO-02 · sign-off</span>
            <span className="label-cap !text-brand-300">Free needs no card</span>
          </div>
          <div className="flex flex-col gap-8 px-4 py-8 sm:px-5 lg:flex-row lg:items-end lg:gap-12">
            <div className="lg:flex-1">
              <h2 className="max-w-[22ch] text-[26px] leading-[1.04] font-extrabold tracking-[-0.03em] text-white sm:text-[34px]">
                Start inside the band.
              </h2>
              <p className="mt-3 max-w-[58ch] text-[14px] leading-5 text-brand-100">
                One outlet, one counter, and the full ledger underneath it. When a second outlet
                arrives you will see it on the trace first, and you can decide then.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
              <Link
                href="/sign-up?plan=free"
                className="flex h-12 items-center justify-center rounded-sm bg-gray-50 px-7 text-[14px] font-semibold text-brand-900 transition-colors hover:bg-white"
              >
                Start on Free
              </Link>
              <Link
                href="/sign-up?plan=enterprise"
                className="flex h-12 items-center justify-center rounded-sm border border-white/30 px-6 text-[14px] font-semibold text-white transition-colors hover:bg-white/10"
              >
                Ask for an estimate
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter
        formIndex="Form index · RS-01 · RS-02 · RS-03 · RS-04 · NB-01 · SO-02"
        note="Sample amounts; no plan has been priced or billed"
        authed={authed}
      />
    </div>
  );
}
