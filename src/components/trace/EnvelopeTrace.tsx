/**
 * The par envelope trace — the one signature mark of this interface.
 *
 * Every quantity that moves over time is drawn the same way: the actual
 * reading as a probe-amber polyline, the target range as an envelope-teal
 * band with hairline bounds, and the moment the reading left the band as a
 * breach dot. Length is time, height is quantity, fill is state. Nothing in
 * the mark is decorative, and a series with no par set still draws its trace.
 */

export type TracePoint = { t: string; v: number };

export type EnvelopeTraceProps = {
  points: TracePoint[];
  /** Lower and upper par bounds in the same unit as `points`. Omit when no par is set. */
  par?: { min: number; max: number };
  width?: number;
  height?: number;
  /** Render the breach marker and its timestamp label. Row-scale traces omit the label. */
  showBreach?: boolean;
  breachLabel?: string;
  className?: string;
  /** Screen-reader description. Required: the mark is data, not decoration. */
  title: string;
  /** A two-bound range derived from the series itself, drawn as the band. */
  reference?: { lo: number; hi: number; label: string };
};

const AMBER = '#c86a12';
const TEAL = '#0f7f8c';
const BREACH = '#c8321f';
const HAIRLINE = '#cbd6da';

export function EnvelopeTrace({
  points,
  par,
  width = 760,
  height = 150,
  showBreach = true,
  breachLabel,
  className = '',
  title,
  reference,
}: EnvelopeTraceProps) {
  if (!points || points.length === 0) {
    return (
      <div
        className={`flex items-center justify-center border border-dashed border-gray-200 dark:border-gray-800 ${className}`}
        style={{ height }}
      >
        <span className="label-cap">No readings yet</span>
      </div>
    );
  }

  const values = points.map((p) => p.v);
  const bounds = par ? [par.min, par.max] : reference ? [reference.lo, reference.hi] : [];
  const lo = Math.min(...values, ...bounds);
  const hi = Math.max(...values, ...bounds);
  // Pad the range so a flat series does not collapse onto the axis.
  const span = hi - lo || Math.max(Math.abs(hi), 1);
  const top = hi + span * 0.18;
  const bottom = Math.max(0, lo - span * 0.18);
  const range = top - bottom || 1;

  const x = (i: number) => (points.length === 1 ? 0 : (i / (points.length - 1)) * width);
  const y = (v: number) => height - ((v - bottom) / range) * height;

  // First reading that left the band, scanning forward.
  const breachIndex = par
    ? points.findIndex((p) => p.v < par.min || p.v > par.max)
    : -1;
  const breached = breachIndex >= 0;

  /**
   * The trace turns red *past* the bound, not along its whole length: the
   * crossing is interpolated so the colour changes exactly where the reading
   * left the band, and the amber before it stays a record of stock in control.
   */
  const crossing =
    breached && par && breachIndex > 0
      ? (() => {
          const prev = points[breachIndex - 1].v;
          const cur = points[breachIndex].v;
          const bound = cur < par.min ? par.min : par.max;
          const t = prev === cur ? 0 : (prev - bound) / (prev - cur);
          return { x: x(breachIndex - 1) + t * (x(breachIndex) - x(breachIndex - 1)), y: y(bound) };
        })()
      : null;

  const inBandPath = (
    crossing
      ? [...points.slice(0, breachIndex).map((p, i) => `${x(i)},${y(p.v)}`), `${crossing.x},${crossing.y}`]
      : breached
        ? []
        : points.map((p, i) => `${x(i)},${y(p.v)}`)
  ).join(' ');

  const breachedPath = (
    crossing
      ? [
          `${crossing.x},${crossing.y}`,
          ...points.slice(breachIndex).map((p, i) => `${x(breachIndex + i)},${y(p.v)}`),
        ]
      : breached
        ? points.map((p, i) => `${x(i)},${y(p.v)}`)
        : []
  ).join(' ');

  const bandTop = par ? y(par.max) : 0;
  const bandHeight = par ? Math.max(y(par.min) - y(par.max), 1) : 0;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={`block w-full ${className}`}
      style={{ height }}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      {!par && reference ? (
        <>
          <rect
            x="0"
            y={y(reference.hi)}
            width={width}
            height={Math.max(y(reference.lo) - y(reference.hi), 1)}
            fill={TEAL}
            opacity="0.12"
          />
          <line
            x1="0"
            y1={y(reference.hi)}
            x2={width}
            y2={y(reference.hi)}
            stroke={TEAL}
            strokeWidth="1"
            strokeDasharray="4 3"
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1="0"
            y1={y(reference.lo)}
            x2={width}
            y2={y(reference.lo)}
            stroke={TEAL}
            strokeWidth="1"
            strokeDasharray="4 3"
            vectorEffect="non-scaling-stroke"
          />
        </>
      ) : null}
      {par ? (
        <>
          <rect x="0" y={bandTop} width={width} height={bandHeight} fill={TEAL} opacity="0.13" />
          <line x1="0" y1={bandTop} x2={width} y2={bandTop} stroke={TEAL} strokeWidth="1" vectorEffect="non-scaling-stroke" />
          {/* A floor of zero is not a bound a reading can breach, so it is
              not drawn as one: an allowance band gets a ceiling only. */}
          {par.min > 0 ? (
            <line
              x1="0"
              y1={bandTop + bandHeight}
              x2={width}
              y2={bandTop + bandHeight}
              stroke={TEAL}
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
        </>
      ) : reference ? null : (
        <line
          x1="0"
          y1={height - 1}
          x2={width}
          y2={height - 1}
          stroke={HAIRLINE}
          strokeWidth="1"
          strokeDasharray="3 3"
          vectorEffect="non-scaling-stroke"
        />
      )}
      {inBandPath.includes(' ') ? (
        <polyline
          points={inBandPath}
          fill="none"
          stroke={AMBER}
          strokeWidth="2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ) : null}
      {breachedPath.includes(' ') ? (
        <polyline
          points={breachedPath}
          fill="none"
          stroke={BREACH}
          strokeWidth="2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      ) : null}
      {breached && showBreach ? (
        <>
          <line
            x1={x(breachIndex)}
            y1="0"
            x2={x(breachIndex)}
            y2={height}
            stroke={BREACH}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          <circle cx={x(breachIndex)} cy={y(points[breachIndex].v)} r="4" fill={BREACH} />
        </>
      ) : null}
      {breached && showBreach && breachLabel ? (
        <text
          x={Math.min(x(breachIndex) + 8, width - 4)}
          y={14}
          fill={BREACH}
          fontSize="11"
          fontFamily="var(--font-mono)"
          textAnchor={x(breachIndex) > width * 0.72 ? 'end' : 'start'}
        >
          {breachLabel}
        </text>
      ) : null}
    </svg>
  );
}

/** Row-scale variant: the same encoding, compressed to a table cell. */
export function RowTrace({
  points,
  par,
  title,
}: Pick<EnvelopeTraceProps, 'points' | 'par' | 'title'>) {
  return (
    <EnvelopeTrace
      points={points}
      par={par}
      width={128}
      height={28}
      showBreach={false}
      title={title}
      className="max-w-32"
    />
  );
}

export default EnvelopeTrace;

/**
 * Point-in-time variant of the same encoding, for rows that carry a level but
 * no history. The band is the real limit the stock service derives state from
 * (STOCK_OK_AT / STOCK_LOW_AT), drawn in envelope teal with a hairline bound,
 * so the same quantity reads identically on every page and every surface. The
 * actual reading fills in probe amber, or breach red once it drops below the
 * lower bound. No threshold is invented and no scale is page-relative.
 */
export function LevelBar({
  value,
  okAt,
  lowAt,
  title,
  className = "",
}: {
  value: number;
  okAt: number;
  lowAt: number;
  title: string;
  className?: string;
}) {
  // One axis for every row: the bound always lands at the same x, so two rows
  // can be compared directly. A reading past the axis clamps and is marked.
  const scaleMax = okAt * 2;
  const over = value > scaleMax;
  const pct = (n: number) => Math.max(0, Math.min(100, (n / scaleMax) * 100));
  const fillPct = pct(value);
  const okPct = pct(okAt);
  const lowPct = pct(lowAt);
  const breached = value <= lowAt;
  const below = value <= okAt;

  return (
    <span
      className={`relative block h-3.5 bg-gray-100 dark:bg-white/[0.06] ${className}`}
      role="img"
      aria-label={title}
      title={title}
    >
      {/* target band: at or above the in-stock threshold */}
      <span
        className="absolute inset-y-0 block"
        style={{
          left: `${okPct}%`,
          right: 0,
          backgroundColor: TEAL,
          opacity: 0.13,
        }}
      />
      {/* actual reading */}
      {over ? (
        <span
          className="absolute inset-y-0 right-0 block w-[3px]"
          style={{ backgroundColor: AMBER }}
          aria-hidden="true"
        />
      ) : null}
      {fillPct > 0 ? (
        <span
          className="absolute inset-y-0 left-0 block"
          style={{
            width: `${fillPct}%`,
            backgroundColor: breached ? BREACH : below ? AMBER : AMBER,
          }}
        />
      ) : (
        <span
          className="absolute inset-y-0 left-0 block w-[2px]"
          style={{ backgroundColor: BREACH }}
        />
      )}
      {/* lower bound: below this the line is out */}
      <span
        className="absolute inset-y-[-2px] block w-px"
        style={{ left: `${lowPct}%`, backgroundColor: BREACH, opacity: 0.55 }}
      />
      {/* in-stock bound */}
      <span
        className="absolute inset-y-[-2px] block w-px"
        style={{ left: `${okPct}%`, backgroundColor: TEAL }}
      />
    </span>
  );
}
