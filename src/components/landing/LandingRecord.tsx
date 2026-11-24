import Link from 'next/link';

import { EnvelopeTrace, RowTrace } from '@/components/trace/EnvelopeTrace';

import { PublicFooter, PublicHeader, type NavItem } from './PublicChrome';
import { CELL, FIG, Sheet, StateMark, SUB, Th, type Tone } from './sheet';
import {
  FIELDS,
  FOURTEEN_DAYS,
  FOURTEEN_DAY_PAR,
  NOT_CLAIMED,
  OUTLETS,
  RECIPE_LINES,
  SHIFT_PAR,
  SHIFT_ROWS,
  STATE_LABEL,
  TOTALS,
  type StateWord,
} from './record-data';

/**
 * The landing record — the only Persuade surface in this app.
 *
 * The page is a completed process-control record rather than a claim over a
 * row of feature cards: five sheets of one record set, each bounded by a
 * single hairline on the technical-white ground and headed by its own form
 * designation. Every figure is traceable to the numbered row that produced it,
 * and the last sheet states what the record does not claim. Everything shown
 * is authored sample data (see ./record-data.ts), labelled as such on the page.
 */

/** The record's own state words, mapped onto the shared signal tones. */
const TONE: Record<StateWord, Tone> = {
  'in-band': 'in-band',
  'at-bound': 'at-bound',
  'below-par': 'breach',
  'no-par': 'none',
  'out-of-play': 'off',
};

function State({ state }: { state: StateWord }) {
  return <StateMark label={STATE_LABEL[state]} tone={TONE[state]} />;
}

const NAV: NavItem[] = [
  ['/#sm-04', 'Shift record'],
  ['/#rc-02', 'Recipe'],
  ['/#mo-01', 'Outlets'],
  ['/#nb-00', 'Not claimed'],
  ['/pricing', 'Rate schedule'],
];

/**
 * The signature mark at its primary scale. The trace is the shipped component;
 * its lettering is HTML laid over the plot, so a label never stretches with
 * the viewBox and the band can own the full width of its region.
 */
function FullRegion() {
  return (
    <div className="mx-4 mb-7 border border-gray-200 sm:mx-5 dark:border-gray-800">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-gray-200 px-4 py-2.5 dark:border-gray-800">
        <span className="label-cap">Quán 3 · Thảo Điền · robusta on hand · 14 days</span>
        <span className="label-cap hidden sm:inline">
          Actual in amber · par envelope in teal · crossing in red
        </span>
      </div>
      <div className="flex flex-col gap-5 px-4 py-5 lg:flex-row lg:items-start lg:gap-8">
        <div className="lg:w-[210px] lg:shrink-0">
          <span className="label-cap">On hand now</span>
          <b className="mt-1.5 block text-[54px] leading-none font-extrabold tracking-[-0.035em] tabular text-gray-900 sm:text-[64px] dark:text-white">
            5.990
            <i className="ml-2 font-mono text-[18px] not-italic tracking-normal text-gray-600 dark:text-gray-400">
              kg
            </i>
          </b>
          <span className="mt-2.5 block">
            <State state="below-par" />
          </span>
          <span className="mt-2.5 block font-mono text-[11px] tabular text-gray-600 dark:text-gray-400">
            par 6.000 — 8.000 kg
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative h-40">
            <EnvelopeTrace
              points={FOURTEEN_DAYS}
              par={FOURTEEN_DAY_PAR}
              width={760}
              height={160}
              showBreach
              title="Quán 3, Thảo Điền: robusta on hand over fourteen days against a par envelope of 6.000 to 8.000 kg. The reading crossed below par on day 14 at 15:52 and stands at 5.990 kg, 10 g under."
            />
            <span className="label-cap-sm absolute top-0 right-0 !text-error-500 dark:!text-error-300">
              Day 14 · 15:52 · 10 g under par
            </span>
            <span className="label-cap-sm absolute bottom-0 left-0 !text-success-600 dark:!text-success-300">
              Par 6.000 kg
            </span>
          </div>
          <div className="mt-2 flex justify-between">
            <span className="label-cap">Day 1</span>
            <span className="label-cap">Day 7</span>
            <span className="label-cap">Day 14</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingRecord() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <PublicHeader nav={NAV} navLabel="Sections of this record" />

      <main className="mx-auto max-w-[1536px] space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <Sheet id="sm-04" form="Form SM-04 · stock movement record" note="Sample outlet · not live data">
          <div className="flex flex-col gap-8 px-4 py-7 sm:px-5 lg:flex-row lg:items-start lg:gap-12">
            <div className="lg:flex-1">
              <h1 className="max-w-[18ch] text-[34px] leading-[1.02] font-extrabold tracking-[-0.03em] text-gray-900 sm:text-[44px] dark:text-white">
                Sell a coffee. Your stock goes down by itself.
              </h1>
              <p className="mt-4 max-w-[52ch] text-[14px] leading-5 text-gray-600 dark:text-gray-400">
                Every row below is one real sale. Nobody typed the grams.
              </p>
            </div>
            <div className="lg:w-[260px] lg:shrink-0">
              <Link
                href="/sign-up"
                className="flex h-11 w-full items-center justify-center rounded-sm bg-brand-900 px-5 text-[14px] font-semibold text-white transition-colors hover:bg-brand-800 dark:bg-brand-500 dark:hover:bg-brand-400"
              >
                Create account
              </Link>
              <p className="mt-3 text-[13px] text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link href="/sign-in" className="font-semibold text-success-700 underline dark:text-success-300">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-2 border-t border-gray-200 lg:grid-cols-5 dark:border-gray-800">
            {FIELDS.map(([k, v], i) => (
              <div
                key={k}
                className={`border-r border-b border-gray-100 px-4 py-3 even:border-r-0 last:border-r-0 sm:px-5 lg:even:border-r lg:last:border-r-0 dark:border-gray-800 ${
                  i === FIELDS.length - 1
                    ? 'col-span-2 flex items-baseline justify-between gap-4 lg:col-span-1 lg:block'
                    : ''
                }`}
              >
                <dt className="label-cap">{k}</dt>
                <dd
                  className={`font-mono text-[13px] tabular text-gray-900 dark:text-gray-100 ${
                    i === FIELDS.length - 1 ? 'lg:mt-1.5' : 'mt-1.5'
                  }`}
                >
                  {v}
                </dd>
              </div>
            ))}
          </dl>

          <table className="w-full border-collapse">
            <caption className="sr-only">
              Stock movement record for Quán 3, Thảo Điền, 13 November 2026. Sample data.
            </caption>
            <thead>
              <tr>
                <Th className="hidden pl-4 sm:table-cell sm:pl-5">№</Th>
                <Th className="hidden sm:table-cell sm:pl-3">Time</Th>
                <Th className="pl-4 sm:pl-3">Event</Th>
                <Th className="hidden text-right lg:table-cell">Drawn</Th>
                <Th className="text-right">On hand after</Th>
                <Th className="hidden text-right lg:table-cell">Posted</Th>
                <Th className="hidden md:table-cell">Running</Th>
                <Th className="hidden pr-4 sm:table-cell sm:pr-5">State</Th>
              </tr>
            </thead>
            <tbody>
              {SHIFT_ROWS.map((r) => (
                <tr key={r.n} className="transition-colors hover:bg-gray-50 dark:hover:bg-white/3">
                  <td className={`${CELL} hidden pl-4 font-mono text-[12px] tabular text-gray-600 sm:table-cell sm:pl-5 dark:text-gray-400`}>
                    {r.n}
                  </td>
                  <td className={`${CELL} hidden font-mono text-[13px] tabular whitespace-nowrap sm:table-cell sm:pl-3`}>
                    {r.time}
                  </td>
                  <td className={`${CELL} pl-4 sm:pl-3`}>
                    <span className="mb-0.5 block font-mono text-[12px] tabular text-gray-600 sm:hidden dark:text-gray-400">
                      {r.n} · {r.time}
                    </span>
                    <span className="block text-[14px] text-gray-900 dark:text-gray-100">{r.event}</span>
                    <span className={SUB}>{r.detail}</span>
                    <span className={`${SUB} tabular lg:hidden`}>
                      drawn <span className="whitespace-nowrap">{r.drawn}</span>
                      {r.posted === '—' ? null : (
                        <>
                          {' · posted '}
                          <span className="whitespace-nowrap">{r.posted}</span>
                        </>
                      )}
                    </span>
                    <span className="mt-2 block sm:hidden">
                      <State state={r.state} />
                    </span>
                  </td>
                  <td className={`${CELL} ${FIG} hidden lg:table-cell`}>{r.drawn}</td>
                  <td
                    className={`${CELL} ${FIG} ${
                      r.state === 'below-par' ? 'text-error-500 dark:text-error-300' : ''
                    }`}
                  >
                    {r.after}
                  </td>
                  <td className={`${CELL} ${FIG} hidden lg:table-cell`}>{r.posted}</td>
                  <td className={`${CELL} hidden md:table-cell`}>
                    {r.series ? (
                      <span className="block w-32">
                        <RowTrace
                          points={r.series}
                          par={SHIFT_PAR}
                          title={`Robusta on hand through ${r.time}: ${r.after}, against a par envelope of 6.000 to 7.000 kg`}
                        />
                      </span>
                    ) : (
                      <span className="font-mono text-[13px] text-gray-400">—</span>
                    )}
                  </td>
                  <td className={`${CELL} hidden pr-4 sm:table-cell sm:pr-5`}>
                    <State state={r.state} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-wrap items-end gap-x-10 gap-y-5 bg-brand-900 px-4 py-5 sm:px-5">
            {TOTALS.map(([k, v]) => (
              <div key={k}>
                <span className="label-cap !text-brand-300">{k}</span>
                <span className="mt-1 block text-[26px] font-extrabold tabular tracking-[-0.02em] text-white">
                  {v}
                </span>
              </div>
            ))}
            <p className="ml-auto max-w-[36ch] text-[12px] leading-[17px] text-brand-100">
              No one adjusted stock by hand on this shift.
            </p>
          </div>
        </Sheet>

        <Sheet id="rc-02" form="Form RC-02 · recipe consumption" note="Row 08 expanded · sample data">
          <div className="flex flex-col gap-8 px-4 py-7 sm:px-5 lg:flex-row lg:items-start lg:gap-12">
            <div className="lg:flex-1">
              <h2 className="max-w-[32ch] text-[26px] leading-[1.06] font-extrabold tracking-[-0.025em] text-gray-900 sm:text-[34px] dark:text-white">
                Nobody typed 72 g. The recipe did.
              </h2>
              <p className="mt-3 max-w-[52ch] text-[14px] leading-5 text-gray-600 dark:text-gray-400">
                Four cups sold. Five ingredients drawn. One event, both numbers.
              </p>
            </div>
            <div className="flex gap-10 lg:w-[260px] lg:shrink-0 lg:flex-col lg:gap-5">
              <div>
                <span className="label-cap">Posted to revenue</span>
                <span className="mt-1 block text-[26px] font-extrabold tabular tracking-[-0.02em] text-gray-900 dark:text-white">
                  ₫140,000
                </span>
              </div>
              <div>
                <span className="label-cap">Recipe cost on file</span>
                <span className="mt-1 block text-[26px] font-extrabold tabular tracking-[-0.02em] text-gray-900 dark:text-white">
                  ₫46,400
                </span>
              </div>
            </div>
          </div>
          <table className="w-full border-collapse">
            <caption className="sr-only">
              Ingredients drawn by four cups of cà phê sữa đá at 15:52. Sample data.
            </caption>
            <thead>
              <tr>
                <Th className="hidden pl-4 sm:table-cell sm:pl-5">Piece</Th>
                <Th className="pl-4 sm:pl-3">Ingredient</Th>
                <Th className="hidden text-right sm:table-cell">Per cup</Th>
                <Th className="text-right">Drawn ×4</Th>
                <Th className="hidden text-right sm:table-cell">On hand after</Th>
                <Th className="pr-4 sm:pr-5">State</Th>
              </tr>
            </thead>
            <tbody>
              {RECIPE_LINES.map((l) => (
                <tr key={l.n} className="transition-colors hover:bg-gray-50 dark:hover:bg-white/3">
                  <td className={`${CELL} hidden pl-4 font-mono text-[12px] tabular text-gray-600 sm:table-cell sm:pl-5 dark:text-gray-400`}>
                    {l.n}
                  </td>
                  <td className={`${CELL} pl-4 text-[14px] sm:pl-3`}>
                    {l.ingredient}
                    <span className={`${SUB} tabular sm:hidden`}>
                      <span className="whitespace-nowrap">{l.per}</span> per cup · on hand after{' '}
                      <span className="whitespace-nowrap">{l.after}</span>
                    </span>
                  </td>
                  <td className={`${CELL} ${FIG} hidden text-gray-600 sm:table-cell dark:text-gray-400`}>
                    {l.per}
                  </td>
                  <td className={`${CELL} ${FIG} text-orange-600 dark:text-orange-400`}>{l.drawn}</td>
                  <td
                    className={`${CELL} ${FIG} hidden sm:table-cell ${
                      l.state === 'below-par' ? 'text-error-500 dark:text-error-300' : ''
                    }`}
                  >
                    {l.after}
                  </td>
                  <td className={`${CELL} pr-4 sm:pr-5`}>
                    <State state={l.state} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Sheet>

        <Sheet id="mo-01" form="Form MO-01 · outlet roll-up" note="14 days · robusta · sample data">
          <div className="px-4 py-7 sm:px-5">
            <h2 className="max-w-[32ch] text-[26px] leading-[1.06] font-extrabold tracking-[-0.025em] text-gray-900 sm:text-[34px] dark:text-white">
              Every outlet repeats the same mark.
            </h2>
            <p className="mt-3 max-w-[52ch] text-[14px] leading-5 text-gray-600 dark:text-gray-400">
              Amber is the level. Teal is the safe band. Red means crossed.
            </p>
          </div>
          <FullRegion />
          <table className="w-full border-collapse">
            <caption className="sr-only">Robusta on hand by outlet over fourteen days. Sample data.</caption>
            <thead>
              <tr>
                <Th className="pl-4 sm:pl-5">Outlet</Th>
                <Th className="hidden lg:table-cell">Points of sale</Th>
                <Th className="text-right">On hand</Th>
                <Th className="hidden text-right sm:table-cell">Drawn today</Th>
                <Th className="hidden text-right lg:table-cell">Revenue posted</Th>
                <Th className="hidden md:table-cell">14 days</Th>
                <Th className="pr-4 sm:pr-5">State</Th>
              </tr>
            </thead>
            <tbody>
              {OUTLETS.map((o) => (
                <tr key={o.name} className="transition-colors hover:bg-gray-50 dark:hover:bg-white/3">
                  <td className={`${CELL} pl-4 sm:pl-5`}>
                    <span
                      className={`block text-[14px] font-semibold ${
                        o.state === 'out-of-play' ? 'text-gray-400' : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {o.name}
                    </span>
                    <span className={SUB}>
                      {o.district}
                      <span className="lg:hidden"> · {o.pos}</span>
                    </span>
                  </td>
                  <td className={`${CELL} hidden font-mono text-[13px] tabular lg:table-cell`}>{o.pos}</td>
                  <td
                    className={`${CELL} ${FIG} ${
                      o.state === 'below-par'
                        ? 'text-error-500 dark:text-error-300'
                        : o.state === 'out-of-play'
                          ? 'text-gray-400'
                          : ''
                    }`}
                  >
                    {o.onHand}
                  </td>
                  <td className={`${CELL} ${FIG} hidden sm:table-cell`}>{o.drawn}</td>
                  <td className={`${CELL} ${FIG} hidden lg:table-cell`}>{o.posted}</td>
                  <td className={`${CELL} hidden md:table-cell`}>
                    {o.series ? (
                      <span className="block w-32">
                        <RowTrace
                          points={o.series}
                          par={o.par}
                          title={`${o.name}, ${o.district}: robusta on hand over fourteen days, ending at ${o.onHand}`}
                        />
                      </span>
                    ) : (
                      <span className="label-cap-sm flex h-7 w-32 items-center justify-center border border-dashed border-gray-200 text-gray-400 dark:border-gray-800">
                        No readings yet
                      </span>
                    )}
                  </td>
                  <td className={`${CELL} pr-4 sm:pr-5`}>
                    <State state={o.state} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Sheet>

        <Sheet id="nb-00" form="Form NB-00 · not claimed" note="Read this one before you sign up">
          <div className="px-4 py-7 sm:px-5">
            <h2 className="max-w-[32ch] text-[26px] leading-[1.06] font-extrabold tracking-[-0.025em] text-gray-900 sm:text-[34px] dark:text-white">
              What this record does not claim.
            </h2>
            <p className="mt-3 max-w-[52ch] text-[14px] leading-5 text-gray-600 dark:text-gray-400">
              When a number cannot be read, it says so. It never guesses one.
            </p>
          </div>
          <table className="w-full border-collapse">
            <caption className="sr-only">Facts this page does not assert.</caption>
            <thead>
              <tr>
                <Th className="hidden pl-4 sm:table-cell sm:pl-5">№</Th>
                <Th className="pl-4 sm:pl-3">Subject</Th>
                <Th>Answer on file</Th>
                <Th className="hidden pr-4 md:table-cell sm:pr-5">What the surface does instead</Th>
              </tr>
            </thead>
            <tbody>
              {NOT_CLAIMED.map((c) => (
                <tr key={c.n} className="transition-colors hover:bg-gray-50 dark:hover:bg-white/3">
                  <td className={`${CELL} hidden pl-4 font-mono text-[12px] tabular text-gray-600 sm:table-cell sm:pl-5 dark:text-gray-400`}>
                    {c.n}
                  </td>
                  <td className={`${CELL} pl-4 text-[14px] sm:pl-3`}>
                    {c.subject}
                    <span className={`${SUB} md:hidden`}>{c.note}</span>
                  </td>
                  <td className={`${CELL} label-cap-sm whitespace-nowrap text-gray-600 dark:text-gray-400`}>{c.answer}</td>
                  <td className={`${CELL} hidden pr-4 font-mono text-[12px] text-gray-600 md:table-cell sm:pr-5 dark:text-gray-400`}>
                    {c.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Sheet>

        <section className="border border-gray-200 bg-brand-900 dark:border-gray-800">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-white/15 px-4 py-2.5 sm:px-5">
            <span className="label-cap !text-brand-300">Form SO-01 · sign-off</span>
            <span className="label-cap !text-brand-300">Sign-in handled by Clerk</span>
          </div>
          <div className="flex flex-col gap-8 px-4 py-8 sm:px-5 lg:flex-row lg:items-end lg:gap-12">
            <div className="lg:flex-1">
              <h2 className="max-w-[20ch] text-[26px] leading-[1.04] font-extrabold tracking-[-0.03em] text-white sm:text-[34px]">
                Start your own record.
              </h2>
              <p className="mt-3 max-w-[48ch] text-[14px] leading-5 text-brand-100">
                Add your outlets and recipes. Stop counting stock by hand.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
              <Link
                href="/sign-up"
                className="flex h-12 items-center justify-center rounded-sm bg-gray-50 px-7 text-[14px] font-semibold text-brand-900 transition-colors hover:bg-white"
              >
                Create account
              </Link>
              <Link
                href="/sign-in"
                className="flex h-12 items-center justify-center rounded-sm border border-white/30 px-6 text-[14px] font-semibold text-white transition-colors hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter
        formIndex="Form index · SM-04 · RC-02 · MO-01 · NB-00 · SO-01"
        note="Sample data on this page is not a customer record"
      />
    </div>
  );
}
