"use client";

/**
 * StrengthChart Component
 *
 * Line chart showing strength progression over time.
 */

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

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export function StrengthChart({ data }: StrengthChartProps) {
  if (!data || data.length === 0) {
    return (
      <div>
        <h3 className="text-white font-semibold mb-3 font-bricolage-grotesque">
          Strength Progression
        </h3>
        <div className="bg-slate-800/80 p-6 rounded-xl border border-blue-900/20 backdrop-blur-sm">
          <div className="text-center py-8">
            <p className="text-gray-400 mb-2">No strength data available yet</p>
            <p className="text-gray-500 text-sm">
              Start logging workouts with weights to see your strength progression!
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
      <h3 className="text-white font-semibold mb-3 font-bricolage-grotesque">
        Strength Progression
      </h3>
      <div className="bg-slate-800/80 p-6 rounded-xl border border-blue-900/20 backdrop-blur-sm">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis dataKey="week" stroke="#9CA3AF" fontSize={12} tick={{ fill: "#9CA3AF" }} />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              tick={{ fill: "#9CA3AF" }}
              label={{
                value: "Weight (kg)",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle", fill: "#9CA3AF" },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(31, 41, 55, 0.95)",
                border: "1px solid #374151",
                borderRadius: "12px",
                color: "#F9FAFB",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
                backdropFilter: "blur(10px)",
              }}
              labelStyle={{ color: "#D1D5DB", fontWeight: "bold" }}
              formatter={(value: number | string, name: string) => [
                value ? `${Math.round(Number(value) * 10) / 10} kg` : "No data",
                name,
              ]}
            />
            {exerciseNames.map((exercise, index) => (
              <Line
                key={exercise}
                type="monotone"
                dataKey={exercise}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={3}
                dot={{ r: 4, fill: COLORS[index % COLORS.length] }}
                activeDot={{
                  r: 6,
                  fill: COLORS[index % COLORS.length],
                  stroke: COLORS[index % COLORS.length],
                  strokeWidth: 2,
                }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        {exerciseNames.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
            {exerciseNames.map((exercise, index) => (
              <div key={exercise} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-sm text-gray-300 capitalize">{exercise}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
