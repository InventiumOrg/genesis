/**
 * ============================================================================
 * SAMPLE RATE SCHEDULE — every figure and feature line in this file is placeholder
 * ============================================================================
 *
 * No plan has been priced, no billing system exists, and nothing here has been
 * charged to anyone. The amounts, the included limits and the feature lines are
 * authored samples written so the surface could be built and read at its real
 * sizes. Replace them here; the page reads nothing else.
 *
 * The page states this on its own NB-01 sheet rather than hiding it, which is
 * the same rule the landing record follows: an absence is labelled, never
 * filled in with a plausible figure. If you replace these samples with real
 * commercial terms, update that sheet in the same commit.
 *
 * What is NOT a sample: the capacity-envelope idea. A plan is a par band — the
 * included allowance is the envelope, and crossing it is a breach you can see
 * coming. That is the product's own encoding applied to its commercial terms,
 * and it should survive any repricing.
 */

/** State words on this surface. The fills come from the same four signals. */
export type PlanState = 'included' | 'at-bound' | 'above-plan' | 'not-built';

export const PLAN_STATE_LABEL: Record<PlanState, string> = {
  included: 'Included',
  'at-bound': 'At bound',
  'above-plan': 'Above plan',
  'not-built': 'Not built yet',
};

export type Cell =
  /** Included, drawn as a filled mark. */
  | { kind: 'yes' }
  /** Not included on this plan, drawn as an em-dash. */
  | { kind: 'no' }
  /** A measured limit: a figure, a count, a retention window. */
  | { kind: 'measure'; v: string }
  /** Does not exist in the product yet, and says so. */
  | { kind: 'absent'; v: string };

const yes: Cell = { kind: 'yes' };
const no: Cell = { kind: 'no' };
const m = (v: string): Cell => ({ kind: 'measure', v });
const absent = (v: string): Cell => ({ kind: 'absent', v });

export type Plan = {
  key: 'free' | 'business' | 'enterprise';
  name: string;
  /** Monthly amount in đồng, or null where the plan carries no published price. */
  monthly: number | null;
  /** Amount per outlet per year when billed yearly, or null. */
  yearly: number | null;
  /** One line: who this plan is for. Not a slogan. */
  who: string;
  /** The four governing limits, read as a strip of measures. */
  limits: [string, string][];
  cta: { label: string; href: string };
  /** The second door under the primary action. */
  aside: string;
};

/** Sample amounts, in đồng, charged per outlet. */
export const PLANS: Plan[] = [
  {
    key: 'free',
    name: 'Free',
    monthly: 0,
    yearly: 0,
    who: 'One outlet, one counter, the whole ledger. No card, no trial clock.',
    limits: [
      ['Warehouses', '1'],
      ['Points of sale', '1'],
      ['Tracked items', '150'],
      ['History kept', '90 days'],
    ],
    cta: { label: 'Create account', href: '/sign-up?plan=free' },
    aside: 'Free for as long as you stay inside those four bounds.',
  },
  {
    key: 'business',
    name: 'Business',
    monthly: 390_000,
    yearly: 3_900_000,
    who: 'Several outlets that move stock between each other and need par levels that hold.',
    limits: [
      ['Warehouses', 'Up to 10'],
      ['Points of sale', 'Unlimited'],
      ['Tracked items', 'Unlimited'],
      ['History kept', 'Full'],
    ],
    cta: { label: 'Create account', href: '/sign-up?plan=business' },
    aside: 'Charged per outlet. Add or remove an outlet and the next period follows it.',
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    monthly: null,
    yearly: null,
    who: 'Groups running their own deployment, or anyone who needs a signed commitment.',
    limits: [
      ['Warehouses', 'Unlimited'],
      ['Points of sale', 'Unlimited'],
      ['Tracked items', 'Unlimited'],
      ['History kept', 'Full + archive'],
    ],
    cta: { label: 'Ask for an estimate', href: '/sign-up?plan=enterprise' },
    aside: 'Priced against your outlet count and your deployment, not off this sheet.',
  },
];

export const RATE_FIELDS: [string, string][] = [
  ['Currency', '₫ VND'],
  ['Charged per', 'Outlet'],
  ['Effective', 'Sample — not in force'],
  ['Trial', 'None — Free is the trial'],
  ['Card required', 'No'],
];

/** Groups of the inclusion schedule. Order is the reading order. */
export type InclusionGroup = {
  group: string;
  rows: { label: string; detail: string; free: Cell; business: Cell; enterprise: Cell }[];
};

export const INCLUSIONS: InclusionGroup[] = [
  {
    group: 'Stock and movement',
    rows: [
      {
        label: 'Append-only movement ledger',
        detail: 'on hand is never stored; it is the sum of the rows',
        free: yes,
        business: yes,
        enterprise: yes,
      },
      {
        label: 'Par levels and the envelope trace',
        detail: 'the band every reading is drawn against',
        free: m('1 item'),
        business: yes,
        enterprise: yes,
      },
      {
        label: 'Transfers between outlets',
        detail: 'signed for at the receiving end',
        free: no,
        business: yes,
        enterprise: yes,
      },
      {
        label: 'Waste and adjustment reasons',
        detail: 'every row carries why it moved',
        free: yes,
        business: yes,
        enterprise: yes,
      },
      {
        label: 'Import and export of stock',
        detail: 'bulk movement in and out',
        free: m('Export only'),
        business: yes,
        enterprise: yes,
      },
    ],
  },
  {
    group: 'Recipes and sales',
    rows: [
      {
        label: 'Recipes with costed ingredients',
        detail: 'the hinge between a sale and what it consumed',
        free: m('10 recipes'),
        business: yes,
        enterprise: yes,
      },
      {
        label: 'Automatic drawdown on a sale',
        detail: 'nobody types the grams',
        free: yes,
        business: yes,
        enterprise: yes,
      },
      {
        label: 'Revenue posted from the same event',
        detail: 'one row, both figures',
        free: yes,
        business: yes,
        enterprise: yes,
      },
      {
        label: 'Orders and restocking',
        detail: 'an order moves stock when it lands, not when it is placed',
        free: no,
        business: yes,
        enterprise: yes,
      },
    ],
  },
  {
    group: 'Outlets and people',
    rows: [
      {
        label: 'Storage rooms inside a warehouse',
        detail: 'a warehouse broken down to the shelf',
        free: no,
        business: yes,
        enterprise: yes,
      },
      {
        label: 'Seats',
        detail: 'people who can sign in',
        free: m('2'),
        business: m('Up to 25'),
        enterprise: m('Unlimited'),
      },
      {
        label: 'Roles and permissions',
        detail: 'every signed-in user sees every surface today',
        free: absent('Not modelled yet'),
        business: absent('Not modelled yet'),
        enterprise: absent('Not modelled yet'),
      },
      {
        label: 'Single sign-on',
        detail: 'your own identity provider',
        free: no,
        business: no,
        enterprise: yes,
      },
    ],
  },
  {
    group: 'Service',
    rows: [
      {
        label: 'Support answered within',
        detail: 'working hours, Asia/Ho_Chi_Minh',
        free: m('Best effort'),
        business: m('1 business day'),
        enterprise: m('4 hours'),
      },
      {
        label: 'Uptime commitment',
        detail: 'written into the agreement',
        free: no,
        business: no,
        enterprise: m('By agreement'),
      },
      {
        label: 'Run it on your own infrastructure',
        detail: 'the app and its database, your servers',
        free: no,
        business: no,
        enterprise: yes,
      },
      {
        label: 'Your data out, whole, any time',
        detail: 'the ledger exports as it is stored',
        free: yes,
        business: yes,
        enterprise: yes,
      },
    ],
  },
];

/**
 * The capacity envelope: twelve months of recorded events at one sample outlet
 * group against the allowance included on Business. The reading crosses in
 * month eleven — which is the point of drawing it rather than listing it.
 */
export const CAPACITY_MONTHS = [
  2_400, 2_720, 3_050, 3_380, 3_620, 4_010, 4_290, 4_680, 5_120, 5_540, 6_220, 6_900,
].map((v, i) => ({ t: `m${i + 1}`, v }));

export const CAPACITY_BAND = { min: 0, max: 6_000 };

export const CAPACITY_READOUT = {
  now: '6,900',
  unit: 'events',
  bound: '6,000 events / month',
  crossing: 'Month 11 · 220 events over',
  ceiling: 'Included · 6,000 / month',
};

/** The summary bar under the capacity plot, read off the same series. */
export const CAPACITY_TOTALS: [string, string][] = [
  ['Included on Business', '6,000 / mo'],
  ['Recorded in month 12', '6,900'],
  ['First crossing', 'Month 11'],
  ['Charged for crossing', '₫0'],
];

export const NOT_CLAIMED_PRICING = [
  {
    n: '1',
    subject: 'Amounts, limits, inclusions, terms',
    answer: 'All sample',
    note: 'every figure and every line on this schedule is a placeholder, not only the prices',
  },
  {
    n: '2',
    subject: 'Billing, invoices, cards',
    answer: 'Not built',
    note: 'no payment is taken anywhere in this product today',
  },
  {
    n: '3',
    subject: 'Estimate requests',
    answer: 'No inbox yet',
    note: 'the Enterprise button opens sign-up; nothing reads the plan it carries yet',
  },
  {
    n: '4',
    subject: 'Roles and permissions',
    answer: 'Not modelled yet',
    note: 'so no plan sells them; the schedule says so on its own row',
  },
  {
    n: '5',
    subject: 'Customers, logos, case studies',
    answer: 'None',
    note: 'this product has none, so this page shows none',
  },
];

export const QUESTIONS: [string, string][] = [
  [
    'What happens when I cross a bound?',
    'You see it on the trace before it matters, and the surface says which bound you crossed. Nothing is cut off and nothing is charged without you choosing the next plan.',
  ],
  [
    'Is Free a trial?',
    'No. It has no clock on it. It is bounded instead: one outlet, one counter, 150 tracked items, ninety days of history.',
  ],
  [
    'Why is Enterprise not priced here?',
    'Because a figure nobody earned does not go on a sheet in this product. An estimate is written against your outlet count and your deployment.',
  ],
  [
    'Do I pay per person or per outlet?',
    'Per outlet. Seats are bounded per plan, but the amount follows the number of places you trade in.',
  ],
  [
    'Can I take my data out?',
    'Yes, on every plan including Free. The ledger exports as it is stored, one row per movement, because that is the only honest shape it has.',
  ],
  [
    'Can I run it myself?',
    'On Enterprise. The app and its Postgres database are a single deployment, so your own infrastructure is a real option rather than a promise.',
  ],
];
