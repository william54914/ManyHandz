"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils/cn";

interface TrendDataPoint {
  week: string;
  [memberId: string]: number | string;
}

interface TrendMember {
  memberId: string;
  memberName: string;
  color: string;
}

interface TrendLineProps {
  data: TrendDataPoint[];
  members: TrendMember[];
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  label?: string;
  payload?: Array<{
    dataKey: string;
    value: number;
    color: string;
    name: string;
  }>;
}

function CustomTooltip({ active, label, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-foreground mb-1">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
          <div
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">{Math.round(entry.value)}%</span>
        </div>
      ))}
    </div>
  );
}

export function TrendLine({ data, members, className }: TrendLineProps) {
  if (data.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-[250px] text-muted-foreground text-sm", className)}>
        Not enough data to show trends yet.
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
          <XAxis
            dataKey="week"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: number) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          {members.map((member) => (
            <Line
              key={member.memberId}
              type="monotone"
              dataKey={member.memberId}
              name={member.memberName}
              stroke={member.color}
              strokeWidth={2}
              dot={{ r: 3, fill: member.color }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-2">
        {members.map((member) => (
          <div key={member.memberId} className="flex items-center gap-1.5 text-xs">
            <div
              className="h-2 w-6 rounded-full shrink-0"
              style={{ backgroundColor: member.color }}
            />
            <span className="text-foreground">{member.memberName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
