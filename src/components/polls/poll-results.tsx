"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, Users } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { HouseholdPoll, PollVotes, PollOption, Member } from "@/lib/supabase/types";

interface PollResultsProps {
  poll: HouseholdPoll;
  members?: Member[];
  className?: string;
}

const BAR_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
];

export function PollResults({ poll, members = [], className }: PollResultsProps) {
  const votes = (poll.votes ?? {}) as PollVotes;
  const options = (poll.options ?? []) as PollOption[];

  const memberMap = useMemo(() => {
    const map: Record<string, Member> = {};
    for (const m of members) map[m.id] = m;
    return map;
  }, [members]);

  const chartData = useMemo(() => {
    return options.map((option) => ({
      name: option.text.length > 20 ? option.text.slice(0, 20) + "..." : option.text,
      fullName: option.text,
      votes: votes[option.id]?.length ?? 0,
      optionId: option.id,
      voters: votes[option.id] ?? [],
    }));
  }, [options, votes]);

  const totalVotes = chartData.reduce((sum, d) => sum + d.votes, 0);
  const maxVotes = Math.max(...chartData.map((d) => d.votes), 0);

  const winners = chartData.filter(
    (d) => d.votes === maxVotes && maxVotes > 0
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{poll.question}</CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            Results
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Winner highlight */}
        {winners.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3"
          >
            <Trophy className="size-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-400">
                {winners.length === 1 ? "Winner" : "Tie"}
              </p>
              <p className="text-sm">
                {winners.map((w) => w.fullName).join(" & ")} ({maxVotes} vote
                {maxVotes !== 1 ? "s" : ""})
              </p>
            </div>
          </motion.div>
        )}

        {/* Bar chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value) => [`${value} votes`, "Votes"]}
                labelFormatter={(label) => {
                  const labelStr = String(label);
                  const item = chartData.find((d) => d.name === labelStr);
                  return item?.fullName ?? labelStr;
                }}
              />
              <Bar dataKey="votes" radius={[0, 4, 4, 0]} maxBarSize={32}>
                {chartData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={BAR_COLORS[index % BAR_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Voter avatars per option (if not anonymous) */}
        {!poll.is_anonymous && (
          <div className="space-y-3">
            {chartData.map((option, idx) => (
              <div key={option.optionId} className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{
                    backgroundColor: BAR_COLORS[idx % BAR_COLORS.length],
                  }}
                />
                <span className="text-xs text-muted-foreground min-w-[80px] truncate">
                  {option.fullName}
                </span>
                <div className="flex items-center gap-1 flex-wrap flex-1">
                  {option.voters.map((voterId) => {
                    const member = memberMap[voterId];
                    return (
                      <Avatar
                        key={voterId}
                        className="size-6 border-2 border-background"
                      >
                        <AvatarFallback
                          className="text-[10px]"
                          style={{
                            backgroundColor:
                              member?.favorite_color ?? "#6366f1",
                            color: "#fff",
                          }}
                        >
                          {member?.display_name?.charAt(0)?.toUpperCase() ??
                            "?"}
                        </AvatarFallback>
                      </Avatar>
                    );
                  })}
                  {option.voters.length === 0 && (
                    <span className="text-[11px] text-muted-foreground">
                      No votes
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total votes */}
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground pt-2 border-t">
          <Users className="size-3" />
          <span>
            {totalVotes} total vote{totalVotes !== 1 ? "s" : ""}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
