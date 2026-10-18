/**
 * AnalyticsCharts.tsx
 *
 * Recharts-based visuals for the Analytics tab.  Each chart is wrapped in
 * a `ChartCard` (title + accessible description + responsive body) and
 * takes already-aggregated slices from analyticsLib — no data crunching
 * here, just rendering.
 *
 * Design follows the data-viz method: categorical colour by entity in a
 * fixed order, reserved status hues, thin marks, a legend for ≥2 series,
 * and a recessive grid.  The filtered table beside these charts is the
 * always-present accessible fallback, so identity is never colour-alone.
 */

import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, LabelList,
  PieChart, Pie, AreaChart, Area, Tooltip,
} from 'recharts';
import { CAT_COLORS, BRAND_PURPLE, fmtMoney, type Slice, type TrendPoint } from './analyticsLib';

const AXIS = '#898781';
const GRID = '#e1e0d9';
const INK  = '#52514e';

/** Track whether we're on a phone-width viewport so charts can shrink
 *  their heights/marks rather than dominating the screen. */
export function useIsMobile(bp = 640): boolean {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.innerWidth < bp);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp - 1}px)`);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [bp]);
  return m;
}

/** Trim a long category label so mobile y-axis ticks don't overflow. */
function short(label: string, n: number): string {
  return label.length > n ? label.slice(0, n - 1) + '…' : label;
}

// ─── Card frame ──────────────────────────────────────────────────────

export function ChartCard({
  title, subtitle, children, empty,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  empty?: boolean;
}) {
  return (
    <section
      className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-5 shadow-sm"
      aria-label={title}
    >
      <header className="mb-2 sm:mb-3">
        <h3 className="text-[13px] sm:text-sm font-extrabold text-gray-900">{title}</h3>
        {subtitle && <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>}
      </header>
      {empty
        ? <div className="h-[140px] flex items-center justify-center text-xs text-gray-400">No data for this selection</div>
        : children}
    </section>
  );
}

// ─── Shared tooltip ──────────────────────────────────────────────────

function TipBox({ rows }: { rows: { label: string; value: string; color?: string }[] }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg text-xs">
      {rows.map((r, i) => (
        <div key={i} className="flex items-center gap-2 whitespace-nowrap">
          {r.color && <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: r.color }} />}
          <span className="text-gray-500">{r.label}</span>
          <span className="font-bold text-gray-900 ml-auto tabular-nums">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Horizontal bar (sessions by groomer / top customers) ────────────

export function HBarChart({
  data, valueKey = 'count', color = BRAND_PURPLE, money = false, compact = false,
}: {
  data: Slice[];
  valueKey?: 'count' | 'revenue';
  color?: string;
  money?: boolean;
  compact?: boolean;
}) {
  const mobile = useIsMobile();
  const rowH = compact ? 22 : (mobile ? 30 : 38);
  const yWidth = compact ? 64 : (mobile ? 78 : 96);
  const maxChars = compact ? 8 : (mobile ? 11 : 16);
  const barSize = compact ? 11 : 22;
  const height = Math.max(compact ? 72 : (mobile ? 130 : 160), data.length * rowH + (compact ? 6 : 16));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: compact ? 30 : (mobile ? 40 : 44), bottom: 0, left: 0 }}>
        {!compact && <CartesianGrid horizontal={false} stroke={GRID} />}
        <XAxis type="number" hide={compact} tick={{ fill: AXIS, fontSize: 10 }} stroke={GRID} tickLine={false}
          tickFormatter={(v) => (money ? fmtMoney(Number(v)) : String(v))} />
        <YAxis type="category" dataKey="label" width={yWidth} tick={{ fill: INK, fontSize: compact ? 9 : (mobile ? 10 : 11) }}
          stroke={GRID} tickLine={false} tickFormatter={(v: string) => short(String(v), maxChars)} />
        {!compact && (
          <Tooltip
            cursor={{ fill: 'rgba(69,26,139,0.06)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const s = payload[0].payload as Slice;
              return <TipBox rows={[
                { label: 'Sessions', value: String(s.count), color },
                { label: 'Revenue', value: fmtMoney(s.revenue) },
              ]} />;
            }}
          />
        )}
        <Bar dataKey={valueKey} fill={color} radius={[0, 4, 4, 0]} maxBarSize={barSize} isAnimationActive={false}>
          <LabelList dataKey={valueKey} position="right"
            formatter={(v: unknown) => (money ? fmtMoney(Number(v)) : String(v))}
            style={{ fill: INK, fontSize: compact ? 10 : 11, fontWeight: 700 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Donut (status / pet type / payment channel) ─────────────────────

export function DonutChart({ data, centerLabel }: { data: Slice[]; centerLabel?: string }) {
  const mobile = useIsMobile();
  const total = data.reduce((n, s) => n + s.count, 0);
  const dia = mobile ? 128 : 168;
  const outer = mobile ? 60 : 80;
  const inner = mobile ? 40 : 54;
  return (
    <div className="flex flex-row items-center gap-3 sm:gap-4">
      <div className="relative shrink-0" style={{ width: dia, height: dia }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="label" cx="50%" cy="50%"
              innerRadius={inner} outerRadius={outer} paddingAngle={2} stroke="#fff" strokeWidth={2}
              isAnimationActive={false}>
              {data.map((s, i) => <Cell key={s.key} fill={s.color ?? CAT_COLORS[i % CAT_COLORS.length]} />)}
            </Pie>
            <Tooltip content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const s = payload[0].payload as Slice;
              const pct = total ? ((s.count / total) * 100).toFixed(0) : '0';
              return <TipBox rows={[{ label: s.label, value: `${s.count} · ${pct}%`, color: s.color }]} />;
            }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl sm:text-2xl font-extrabold text-gray-900 tabular-nums leading-none">{total}</span>
          <span className="text-[9px] sm:text-[10px] font-semibold text-gray-400 uppercase tracking-wide mt-0.5">{centerLabel ?? 'total'}</span>
        </div>
      </div>
      {/* Legend — identity is never colour-alone */}
      <ul className="flex-1 min-w-0 space-y-1 sm:space-y-1.5">
        {data.map((s, i) => {
          const pct = total ? Math.round((s.count / total) * 100) : 0;
          return (
            <li key={s.key} className="flex items-center gap-1.5 text-[11px] sm:text-xs">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color ?? CAT_COLORS[i % CAT_COLORS.length] }} />
              <span className="text-gray-600 truncate">{s.label}</span>
              <span className="ml-auto font-bold text-gray-900 tabular-nums">{s.count}</span>
              <span className="text-gray-400 tabular-nums w-8 text-right">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── Trend area (sessions over time) ─────────────────────────────────

export function TrendChart({ data }: { data: TrendPoint[] }) {
  const mobile = useIsMobile();
  return (
    <ResponsiveContainer width="100%" height={mobile ? 168 : 240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -6 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND_PURPLE} stopOpacity={0.28} />
            <stop offset="100%" stopColor={BRAND_PURPLE} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="label" tick={{ fill: AXIS, fontSize: 11 }} stroke={GRID} tickLine={false} minTickGap={12} />
        <YAxis allowDecimals={false} tick={{ fill: AXIS, fontSize: 11 }} stroke={GRID} tickLine={false} width={36} />
        <Tooltip content={({ active, payload }) => {
          if (!active || !payload?.length) return null;
          const p = payload[0].payload as TrendPoint;
          return <TipBox rows={[
            { label: p.label, value: `${p.count} sessions`, color: BRAND_PURPLE },
            { label: 'Revenue', value: fmtMoney(p.revenue) },
          ]} />;
        }} />
        <Area type="monotone" dataKey="count" stroke={BRAND_PURPLE} strokeWidth={2}
          fill="url(#trendFill)" dot={{ r: 3, fill: BRAND_PURPLE }} activeDot={{ r: 5 }} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
