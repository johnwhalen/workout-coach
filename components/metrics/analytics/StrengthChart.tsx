"use client";

/**
 * StrengthChart Component
 *
 * Line chart showing strength progression over time.
 * Swiss minimalist design with mobile-optimized layout.
 */

import { memo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeeklyStrength } from "@/hooks/useAnalytics";

interface StrengthChartProps {
  data: WeeklyStrength[];
}

// Swiss-aligned colors - gold primary, white secondary, slate tertiary
const COLORS = ["#DAA520", "#ffffff", "#94a3b8", "#64748b", "#475569"];

export const StrengthChart = memo(function StrengthChart({ data }: StrengthChartProps) {
  if (!data || data.length === 0) {
    return (
      <div>
        <h3 className="text-white font-semibold mb-3">Strength Progression</h3>
        <div className="bg-navy-700/60 p-6 rounded-xl border border-slate-700/30">
          <div className="text-center py-6">
            <p className="text-slate-400">No strength data available yet</p>
            <p className="text-slate-400 text-sm mt-1">
              Start logging workouts with weights to see your progression
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get all possible exercise names from the data
  const exerciseNames = Array.from(
    new Set(data.flatMap((week) => Object.keys(week).filter((key) => key !== "week")))
  );

  return (
    <div>
      <h3 className="text-white font-semibold mb-3">Strength Progression</h3>
      <div className="bg-navy-700/60 p-3 md:p-6 rounded-xl border border-slate-700/30">
        {/* Responsive chart height */}
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
            <XAxis
              dataKey="week"
              stroke="#64748b"
              fontSize={11}
              tick={{ fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#334155" }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tick={{ fill: "#64748b" }}
              tickLine={false}
              axisLine={false}
              width={35}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e3a5f",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#ffffff",
                fontSize: "13px",
              }}
              labelStyle={{ color: "#94a3b8", fontWeight: 500, marginBottom: 4 }}
              formatter={(value: number | string, name: string) => [
                value ? `${Math.round(Number(value) * 10) / 10} kg` : "—",
                name,
              ]}
            />
            {exerciseNames.map((exercise, index) => (
              <Line
                key={exercise}
                type="monotone"
                dataKey={exercise}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3, fill: COLORS[index % COLORS.length], strokeWidth: 0 }}
                activeDot={{
                  r: 5,
                  fill: COLORS[index % COLORS.length],
                  strokeWidth: 0,
                }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        {/* Legend - responsive grid */}
        {exerciseNames.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 pt-3 border-t border-slate-700/30">
            {exerciseNames.map((exercise, index) => (
              <div key={exercise} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-xs md:text-sm text-slate-400 capitalize truncate max-w-[120px]">
                  {exercise}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
