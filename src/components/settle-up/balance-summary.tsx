"use client";

import { useMemo } from "react";
import { ArrowRight, DollarSign, Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/format";
import { useMembers } from "@/lib/hooks/use-members";
import type { MemberPairBalance } from "@/lib/hooks/use-settlements";
import type { Member } from "@/lib/supabase/types";

interface BalanceSummaryProps {
  balances: MemberPairBalance[];
  compact?: boolean;
}

function getMemberInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function PairRow({
  balance,
  memberMap,
}: {
  balance: MemberPairBalance;
  memberMap: Record<string, Member>;
}) {
  const memberA = memberMap[balance.memberA];
  const memberB = memberMap[balance.memberB];
  if (!memberA || !memberB) return null;

  const hasMoneyBalance = balance.netCents !== 0;
  const owesMember = balance.netCents > 0 ? memberA : memberB;
  const owedMember = balance.netCents > 0 ? memberB : memberA;
  const absAmount = Math.abs(balance.netCents);

  return (
    <div className="flex items-center gap-3 py-2">
      {/* Money balance */}
      {hasMoneyBalance && (
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Avatar size="sm">
            <AvatarImage src={owesMember.avatar_url || undefined} />
            <AvatarFallback>
              {getMemberInitials(owesMember.display_name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium truncate">
            {owesMember.display_name}
          </span>
          <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
          <Avatar size="sm">
            <AvatarImage src={owedMember.avatar_url || undefined} />
            <AvatarFallback>
              {getMemberInitials(owedMember.display_name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium truncate">
            {owedMember.display_name}
          </span>
          <Badge variant="secondary" className="ml-auto shrink-0">
            <DollarSign className="h-3 w-3 mr-0.5" />
            {formatCurrency(absAmount)}
          </Badge>
        </div>
      )}

      {/* Non-money obligations A->B */}
      {balance.nonMoneyCountAtoB > 0 && (
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Avatar size="sm">
            <AvatarImage src={memberA.avatar_url || undefined} />
            <AvatarFallback>
              {getMemberInitials(memberA.display_name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm truncate">{memberA.display_name}</span>
          <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
          <Avatar size="sm">
            <AvatarImage src={memberB.avatar_url || undefined} />
            <AvatarFallback>
              {getMemberInitials(memberB.display_name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm truncate">{memberB.display_name}</span>
          <Badge variant="outline" className="ml-auto shrink-0">
            <Gift className="h-3 w-3 mr-0.5" />
            {balance.nonMoneyCountAtoB}
          </Badge>
        </div>
      )}

      {/* Non-money obligations B->A */}
      {balance.nonMoneyCountBtoA > 0 && (
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Avatar size="sm">
            <AvatarImage src={memberB.avatar_url || undefined} />
            <AvatarFallback>
              {getMemberInitials(memberB.display_name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm truncate">{memberB.display_name}</span>
          <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
          <Avatar size="sm">
            <AvatarImage src={memberA.avatar_url || undefined} />
            <AvatarFallback>
              {getMemberInitials(memberA.display_name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm truncate">{memberA.display_name}</span>
          <Badge variant="outline" className="ml-auto shrink-0">
            <Gift className="h-3 w-3 mr-0.5" />
            {balance.nonMoneyCountBtoA}
          </Badge>
        </div>
      )}
    </div>
  );
}

export function BalanceSummary({ balances, compact = false }: BalanceSummaryProps) {
  const { members } = useMembers();

  const memberMap = useMemo(() => {
    const map: Record<string, Member> = {};
    for (const m of members) map[m.id] = m;
    return map;
  }, [members]);

  if (balances.length === 0) {
    return compact ? null : (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          All settled up! No outstanding balances.
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className="space-y-1">
        {balances.map((b) => (
          <PairRow
            key={`${b.memberA}::${b.memberB}`}
            balance={b}
            memberMap={memberMap}
          />
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <DollarSign className="h-4 w-4" />
          Balance Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border">
          {balances.map((b) => (
            <PairRow
              key={`${b.memberA}::${b.memberB}`}
              balance={b}
              memberMap={memberMap}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
