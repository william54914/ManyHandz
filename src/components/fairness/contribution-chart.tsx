"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils/cn";

interface ContributionMember {
  memberId: string;
  memberName: string;
  points: number;
  color: string;
}

interface ContributionChartProps {
  members: ContributionMember[];
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: ContributionMember & { percentage: number };
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload[0]) return null;

  const data = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{data.memberName}</p>
      <p className="text-muted-foreground">
        {data.points} pts ({Math.round(data.percentage)}%)
      </p>
    </div>
  );
}

export function ContributionChart({ members, className }: ContributionChartProps) {
  const total = members.reduce((sum, m) => sum + m.points, 0);
  const data = members.map((m) => ({
    ...m,
    percentage: total > 0 ? (m.points / total) * 100 : 0,
  }));

  if (total === 0) {
    return (
      <div className={cn("flex items-center justify-center h-[250px] text-muted-foreground text-sm", className)}>
        No contribution data yet.
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
            dataKey="points"
            nameKey="memberName"
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell key={entry.memberId} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-2">
        {data.map((entry) => (
          <div key={entry.memberId} className="flex items-center gap-1.5 text-xs">
            <div
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-foreground font-medium">{entry.memberName}</span>
            <span className="text-muted-foreground">
              {Math.round(entry.percentage)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
