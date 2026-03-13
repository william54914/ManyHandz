import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TimerEntry {
  assignmentId: string;
  choreId: string;
  choreName: string;
  startedAt: number; // timestamp ms
  pausedAt: number | null;
  totalPausedMs: number;
  estimatedMinutes: number;
}

interface TimerState {
  timers: Record<string, TimerEntry>;
  startTimer: (entry: Omit<TimerEntry, 'pausedAt' | 'totalPausedMs'>) => void;
  pauseTimer: (assignmentId: string) => void;
  resumeTimer: (assignmentId: string) => void;
  stopTimer: (assignmentId: string) => TimerEntry | null;
  getElapsedMs: (assignmentId: string) => number;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      timers: {},
      startTimer: (entry) =>
        set((state) => ({
          timers: {
            ...state.timers,
            [entry.assignmentId]: { ...entry, pausedAt: null, totalPausedMs: 0 },
          },
        })),
      pauseTimer: (assignmentId) =>
        set((state) => {
          const timer = state.timers[assignmentId];
          if (!timer || timer.pausedAt) return state;
          return {
            timers: {
              ...state.timers,
              [assignmentId]: { ...timer, pausedAt: Date.now() },
            },
          };
        }),
      resumeTimer: (assignmentId) =>
        set((state) => {
          const timer = state.timers[assignmentId];
          if (!timer || !timer.pausedAt) return state;
          const pauseDuration = Date.now() - timer.pausedAt;
          return {
            timers: {
              ...state.timers,
              [assignmentId]: {
                ...timer,
                pausedAt: null,
                totalPausedMs: timer.totalPausedMs + pauseDuration,
              },
            },
          };
        }),
      stopTimer: (assignmentId) => {
        const timer = get().timers[assignmentId];
        if (!timer) return null;
        set((state) => {
          const { [assignmentId]: _, ...rest } = state.timers;
          return { timers: rest };
        });
        return timer;
      },
      getElapsedMs: (assignmentId) => {
        const timer = get().timers[assignmentId];
        if (!timer) return 0;
        const now = timer.pausedAt || Date.now();
        return Math.max(0, now - timer.startedAt - timer.totalPausedMs);
      },
    }),
    {
      name: 'manyhandz-timers',
    }
  )
);
