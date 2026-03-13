import { create } from 'zustand';

interface AnimationQueueItem {
  id: string;
  type: 'level_up' | 'achievement' | 'milestone' | 'points' | 'confetti' | 'celebration';
  data: Record<string, unknown>;
}

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  activeModal: string | null;
  modalData: Record<string, unknown> | null;
  openModal: (modal: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;

  animationQueue: AnimationQueueItem[];
  enqueueAnimation: (item: AnimationQueueItem) => void;
  dequeueAnimation: () => AnimationQueueItem | null;
  clearAnimations: () => void;

  onboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;

  trialBannerDismissed: boolean;
  dismissTrialBanner: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  activeModal: null,
  modalData: null,
  openModal: (modal, data) => set({ activeModal: modal, modalData: data ?? null }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  animationQueue: [],
  enqueueAnimation: (item) => set((s) => ({ animationQueue: [...s.animationQueue, item] })),
  dequeueAnimation: () => {
    const queue = get().animationQueue;
    if (queue.length === 0) return null;
    const [first, ...rest] = queue;
    set({ animationQueue: rest });
    return first;
  },
  clearAnimations: () => set({ animationQueue: [] }),

  onboardingComplete: false,
  setOnboardingComplete: (complete) => set({ onboardingComplete: complete }),

  trialBannerDismissed: false,
  dismissTrialBanner: () => set({ trialBannerDismissed: true }),
}));
