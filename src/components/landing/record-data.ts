/**
 * Authored sample data for the landing record.
 *
 * One fictional outlet, written for this page. It is not customer data and it
 * is not read from the database: the landing is a public page and says so on
 * its own NB-00 sheet. No price, customer, testimonial or benchmark is
 * asserted anywhere, because none exist.
 */

export type StateWord = 'in-band' | 'at-bound' | 'below-par' | 'no-par' | 'out-of-play';

export const STATE_LABEL: Record<StateWord, string> = {
  'in-band': 'In band',
  'at-bound': 'At bound',
  'below-par': 'Below par',
  'no-par': 'No par set',
  'out-of-play': 'Not trading',
};

export const SHIFT_PAR = { min: 6.0, max: 7.0 };

const ON_HAND = [6.8, 6.746, 6.714, 6.214, 6.178, 6.134, 6.062, 5.99];
const TIMES = ['07:00', '09:12', '10:48', '11:30', '12:41', '14:05', '15:20', '15:52'];

export type ShiftRow = {
  n: string;
  time: string;
  event: string;
  detail: string;
  drawn: string;
  after: string;
  posted: string;
  state: StateWord;
  series: { t: string; v: number }[] | null;
};

const running = (i: number) =>
  i === 0 ? null : ON_HAND.slice(0, i + 1).map((v, k) => ({ t: TIMES[k], v }));

export const SHIFT_ROWS: ShiftRow[] = [
  { n: '01', time: '07:00', event: 'Shift open', detail: 'opening count, counted by hand', drawn: '—', after: '6.800 kg', posted: '—', state: 'in-band', series: running(0) },
  { n: '02', time: '09:12', event: 'Sale · Cà phê sữa đá ×3', detail: '18 g robusta per cup', drawn: '54 g', after: '6.746 kg', posted: '₫105,000', state: 'in-band', series: running(1) },
  { n: '03', time: '10:48', event: 'Sale · Bạc xỉu ×2', detail: '16 g robusta per cup', drawn: '32 g', after: '6.714 kg', posted: '₫76,000', state: 'in-band', series: running(2) },
  { n: '04', time: '11:30', event: 'Transfer out → Bình Thạnh', detail: 'signed for at the receiving outlet', drawn: '500 g', after: '6.214 kg', posted: '—', state: 'in-band', series: running(3) },
  { n: '05', time: '12:41', event: 'Sale · Cà phê sữa đá ×2', detail: '36 g robusta, 2 tins condensed milk', drawn: '36 g', after: '6.178 kg', posted: '₫70,000', state: 'in-band', series: running(4) },
  { n: '06', time: '14:05', event: 'Waste logged · dropped dose', detail: 'logged at the counter, not a sale', drawn: '44 g', after: '6.134 kg', posted: '—', state: 'in-band', series: running(5) },
  { n: '07', time: '15:20', event: 'Sale · Cà phê đen ×4', detail: '18 g robusta per cup', drawn: '72 g', after: '6.062 kg', posted: '₫120,000', state: 'at-bound', series: running(6) },
  { n: '08', time: '15:52', event: 'Sale · Cà phê sữa đá ×4', detail: 'par crossed on this row', drawn: '72 g', after: '5.990 kg', posted: '₫140,000', state: 'below-par', series: running(7) },
];

export const RECIPE_LINES = [
  { n: '1', ingredient: 'Robusta, honey-processed', per: '18 g', drawn: '72 g', after: '5.990 kg', state: 'below-par' as StateWord },
  { n: '2', ingredient: 'Condensed milk, 380 g tin', per: '30 ml', drawn: '120 ml', after: '38 tin', state: 'in-band' as StateWord },
  { n: '3', ingredient: 'Ice', per: '120 g', drawn: '480 g', after: '—', state: 'no-par' as StateWord },
  { n: '4', ingredient: 'Water, filtered', per: '40 ml', drawn: '160 ml', after: '212 L', state: 'in-band' as StateWord },
  { n: '5', ingredient: 'Cup 16 oz + lid', per: '1 ea', drawn: '4 ea', after: '1,480 ea', state: 'in-band' as StateWord },
];

const days = (vals: number[]) => vals.map((v, i) => ({ t: `d${i + 1}`, v }));

export const FOURTEEN_DAYS = days([7.9, 7.6, 7.4, 7.8, 7.2, 6.9, 7.1, 6.8, 6.6, 6.4, 6.5, 6.2, 6.1, 5.99]);
export const FOURTEEN_DAY_PAR = { min: 6.0, max: 8.0 };

export const OUTLETS = [
  { name: 'Quán 3', district: 'Thảo Điền', pos: '2 active', onHand: '5.990 kg', drawn: '0.810 kg', posted: '₫3,186,000', state: 'below-par' as StateWord, par: FOURTEEN_DAY_PAR, series: FOURTEEN_DAYS },
  { name: 'Quán 1', district: 'Bình Thạnh', pos: '1 active', onHand: '7.420 kg', drawn: '0.465 kg', posted: '₫1,742,000', state: 'in-band' as StateWord, par: { min: 6.0, max: 8.5 }, series: days([8.2, 8.0, 7.9, 8.3, 7.7, 7.5, 7.8, 7.6, 7.4, 7.5, 7.2, 7.3, 7.4, 7.42]) },
  { name: 'Quán 4', district: 'Thủ Đức', pos: '0 active', onHand: '—', drawn: '—', posted: '—', state: 'out-of-play' as StateWord, par: undefined, series: null },
];

export const FIELDS: [string, string][] = [
  ['Outlet', 'Quán 3 · Thảo Điền'],
  ['Date', '2026-11-13'],
  ['Open', '07:00 — 22:00'],
  ['Tracked ingredient', 'Robusta · SKU 0142'],
  ['Par / out', '6.000 / 1.000 kg'],
];

export const TOTALS: [string, string][] = [
  ['Sales recorded', '142'],
  ['Revenue posted', '₫3,186,000'],
  ['Ingredients drawn', '9'],
  ['Rows below par at close', '1'],
];
