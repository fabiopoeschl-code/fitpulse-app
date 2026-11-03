'use client';

import React, { useState, useMemo } from 'react';

export interface ChartDataPoint {
  id: string;
  date: string; // YYYY-MM-DD
  value: number;
  secondaryValue?: number;
  label: string;
  subLabel?: string;
}

interface InteractiveLineChartProps {
  title: string;
  subtitle: string;
  unit: string;
  color?: string;
  data: ChartDataPoint[];
  lowerIsBetter?: boolean; // e.g. Pace (min/km) or blood pressure
}

export const InteractiveLineChart: React.FC<InteractiveLineChartProps> = ({
  title,
  subtitle,
  unit,
  color = '#10b981',
  data,
  lowerIsBetter = false,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  const stats = useMemo(() => {
    if (sortedData.length === 0) {
      return { first: 0, latest: 0, delta: 0, deltaPct: 0, best: 0 };
    }
    const first = sortedData[0].value;
    const latest = sortedData[sortedData.length - 1].value;
    const delta = Number((latest - first).toFixed(2));
    const deltaPct = first !== 0 ? Number(((delta / first) * 100).toFixed(1)) : 0;
    let best = sortedData[0].value;
    for (const pt of sortedData) {
      if (lowerIsBetter ? pt.value < best : pt.value > best) {
        best = pt.value;
      }
    }
    return { first, latest, delta, deltaPct, best };
  }, [sortedData, lowerIsBetter]);

  if (sortedData.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 text-center">
        <p className="text-slate-300 font-medium">{title}</p>
        <p className="text-sm text-slate-500 mt-1">
          Keine Einträge im gewählten Zeitraum vorhanden. Wähle oben einen größeren Zeitraum auf der X-Achse oder trage eine neue Einheit im Tracker ein.
        </p>
      </div>
    );
  }

  const width = 680;
  const height = 240;
  const padLeft = 48;
  const padRight = 24;
  const padTop = 26;
  const padBottom = 38;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const values = sortedData.map((d) => d.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const spread = rawMax - rawMin || Math.max(1, rawMax * 0.1);
  const minVal = Math.max(0, Number((rawMin - spread * 0.15).toFixed(1)));
  const maxVal = Number((rawMax + spread * 0.15).toFixed(1));

  // Position on X axis by actual timestamp so time distances are true to scale!
  const timestamps = sortedData.map((d) => new Date(d.date).getTime());
  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);
  const timeSpan = maxTime - minTime;

  const points = sortedData.map((d, i) => {
    const t = new Date(d.date).getTime();
    const xRatio =
      sortedData.length === 1
        ? 0.5
        : timeSpan > 0
        ? (t - minTime) / timeSpan
        : i / (sortedData.length - 1);
    const yRatio = maxVal === minVal ? 0.5 : (d.value - minVal) / (maxVal - minVal);
    return {
      x: padLeft + xRatio * plotW,
      y: padTop + plotH - yRatio * plotH,
      raw: d,
    };
  });

  const linePath = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const areaPath =
    points.length > 1
      ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(padTop + plotH).toFixed(
          1
        )} L ${points[0].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`
      : '';

  const activePoint =
    hoveredIndex !== null && points[hoveredIndex]
      ? points[hoveredIndex]
      : points[points.length - 1];

  const isPositiveProgress = lowerIsBetter ? stats.delta <= 0 : stats.delta >= 0;

  const formatDateShort = (iso: string) => {
    const parts = iso.split('-');
    if (parts.length !== 3) return iso;
    return `${parts[2]}.${parts[1]}.`;
  };

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800/90 p-4 sm:p-6 shadow-xl">
      {/* Header & KPI Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: color }}
            />
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">{subtitle}</p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Aktuell</div>
            <div className="text-sm sm:text-base font-bold text-white">
              {stats.latest} <span className="text-xs font-normal text-slate-400">{unit}</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Trend</div>
            <div
              className={`text-sm sm:text-base font-bold ${
                isPositiveProgress ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {stats.delta > 0 ? `+${stats.delta}` : stats.delta} {unit}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400">Bestwert</div>
            <div className="text-sm sm:text-base font-bold text-sky-300">
              {stats.best} <span className="text-xs font-normal text-slate-400">{unit}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Point Inspector Banner */}
      {activePoint && (
        <div className="mb-3 px-3.5 py-2 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Messpunkt:</span>
            <span className="font-semibold text-slate-200">
              {formatDateShort(activePoint.raw.date)} ({activePoint.raw.date})
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm" style={{ color }}>
              {activePoint.raw.value} {unit}
            </span>
            {activePoint.raw.subLabel && (
              <span className="text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                {activePoint.raw.subLabel}
              </span>
            )}
          </div>
        </div>
      )}

      {/* SVG Line Chart */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[320px] select-none overflow-visible"
        >
          <defs>
            <linearGradient id={`area-grad-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Y-Axis Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((step, idx) => {
            const y = padTop + plotH - step * plotH;
            const val = (minVal + step * (maxVal - minVal)).toFixed(
              maxVal - minVal < 5 ? 1 : 0
            );
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray={idx === 0 ? undefined : '4 4'}
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="11"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area under line */}
          {areaPath && (
            <path
              d={areaPath}
              fill={`url(#area-grad-${title.replace(/\s+/g, '')})`}
            />
          )}

          {/* Main Line */}
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X-Axis Date Labels & Interactive Data Points */}
          {points.map((pt, idx) => {
            const isSelected =
              hoveredIndex === idx || (hoveredIndex === null && idx === points.length - 1);
            const showDateLabel =
              points.length <= 8 ||
              idx === 0 ||
              idx === points.length - 1 ||
              idx % Math.ceil(points.length / 6) === 0;

            return (
              <g
                key={pt.raw.id || idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onClick={() => setHoveredIndex(idx)}
              >
                {/* Vertical guide line on hover */}
                {isSelected && (
                  <line
                    x1={pt.x}
                    y1={padTop}
                    x2={pt.x}
                    y2={padTop + plotH}
                    stroke={color}
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                    strokeOpacity="0.6"
                  />
                )}

                {/* Invisible larger hit target for touch/mobile */}
                <circle cx={pt.x} cy={pt.y} r="16" fill="transparent" />

                {/* Outer glow on active point */}
                {isSelected && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="9"
                    fill={color}
                    fillOpacity="0.25"
                  />
                )}

                {/* Point circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 5.5 : 4}
                  fill={isSelected ? '#ffffff' : color}
                  stroke={color}
                  strokeWidth="2.5"
                />

                {/* Value label above selected point */}
                {isSelected && (
                  <text
                    x={pt.x}
                    y={pt.y - 12}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="11"
                    fontWeight="700"
                  >
                    {pt.raw.value} {unit}
                  </text>
                )}

                {/* Date on X-Axis */}
                {showDateLabel && (
                  <text
                    x={pt.x}
                    y={height - 10}
                    textAnchor="middle"
                    fill={isSelected ? '#e2e8f0' : '#64748b'}
                    fontSize="11"
                    fontWeight={isSelected ? '700' : '400'}
                  >
                    {formatDateShort(pt.raw.date)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
