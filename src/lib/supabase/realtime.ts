"use client";

import { useEffect, useRef } from "react";
import { createClient } from "./client";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChangeHandler<T extends Record<string, any> = Record<string, any>> = (
  payload: RealtimePostgresChangesPayload<T>
) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useRealtime<T extends Record<string, any>>(
  table: string,
  filter: string | undefined,
  onInsert?: ChangeHandler<T>,
  onUpdate?: ChangeHandler<T>,
  onDelete?: ChangeHandler<T>
) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channelName = `${table}-${filter ?? "all"}-${Date.now()}`;

    let channel = supabase.channel(channelName);

    if (onInsert) {
      channel = channel.on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table, filter },
        onInsert as ChangeHandler
      );
    }
    if (onUpdate) {
      channel = channel.on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table, filter },
        onUpdate as ChangeHandler
      );
    }
    if (onDelete) {
      channel = channel.on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table, filter },
        onDelete as ChangeHandler
      );
    }

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, onInsert, onUpdate, onDelete]);

  return channelRef;
}
