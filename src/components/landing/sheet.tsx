/**
 * The parts every sheet in the public record set is made of.
 *
 * A sheet is a hairline-bounded rectangle with its form designation on its own
 * top strip, divided by a hairline — never an eyebrow stacked over a heading.
 * The table primitives and the state word live here too, so the landing record
 * and the rate schedule are literally the same stationery rather than two
 * pages that look similar.
 */

/** The four signals, as the state word uses them. */
export type Tone = 'in-band' | 'at-bound' | 'breach' | 'none' | 'off';

const FILL: Record<Exclude<Tone, 'off'>, string> = {
  'in-band': 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-300',
  'at-bound': 'bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-300',
  breach: 'bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-300',
  none: 'bg-gray-100 text-gray-600 dark:bg-white/6 dark:text-gray-400',
};

/** A tracked mono word on a flat field, never a pill. */
export function StateMark({ label, tone }: { label: string; tone: Tone }) {
  if (tone === 'off') {
    // Out of play desaturates on a transparent field; it never takes a fill.
    return (
      <span className="label-cap-sm inline-block px-2 py-0.5 whitespace-nowrap text-gray-400">
        {label}
      </span>
    );
  }
  return (
    <span
      className={`label-cap-sm inline-block rounded-sm px-2 py-0.5 whitespace-nowrap ${FILL[tone]}`}
    >
      {label}
    </span>
  );
}

export function Sheet({
  id,
  form,
  note,
  children,
}: {
  id?: string;
  form: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-16 border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-gray-200 px-4 py-2.5 sm:px-5 dark:border-gray-800">
        <span className="label-cap">{form}</span>
        <span className="label-cap">{note}</span>
      </div>
      {children}
    </section>
  );
}

export function Th({
  children,
  className = '',
  scope = 'col',
}: {
  children: React.ReactNode;
  className?: string;
  scope?: 'col' | 'row';
}) {
  return (
    <th
      scope={scope}
      className={`label-cap border-b border-gray-900 px-3 py-2.5 text-left font-normal whitespace-nowrap dark:border-gray-100 ${className}`}
    >
      {children}
    </th>
  );
}

export const CELL = 'border-b border-gray-100 px-3 py-3.5 align-middle dark:border-gray-800';
export const FIG = 'text-right font-mono text-[13px] tabular whitespace-nowrap';
export const SUB =
  'mt-0.5 block font-mono text-[12px] leading-[17px] text-gray-600 lg:text-[11px] dark:text-gray-400';
