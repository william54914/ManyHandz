// ============================================================================
// ManyHandz — Household Mode Configuration System
// This is THE config-driven architecture. Every feature, permission, and UI
// behavior is derived from the active mode.
// ============================================================================

export interface ModeFeatures {
  gamification: boolean;
  rewards: boolean;
  goals: boolean;
  approvalWorkflow: boolean;
  fairnessScoring: boolean;
  leaderboard: boolean;
  photoProofDefault: boolean;
  paymentHandles: boolean;
  bonusChallenges: boolean;
  pointGifting: boolean;
  weeklyReportCard: boolean;
  birthdaySystem: boolean;
  accentColors: boolean;
  headToHead: boolean;
  aiVerification: boolean;
  speedBonus: boolean;
}

export interface ModeUI {
  difficultyDisplay: 'stars' | 'text';
  completionAnimation: 'confetti' | 'checkmark';
  tonePlayful: boolean;
  showPointsProminent: boolean;
}

export interface ModePermissions {
  canCreateChores: boolean;
  canEditChores: boolean;
  canDeleteChores: boolean;
  canCreateRotations: boolean;
  canAssignChores: boolean;
  canViewAllAssignments: boolean;
  canMarkOwnComplete: boolean;
  canSubmitPhotoProof: boolean;
  canApproveCompletions: boolean;
  canCreateRewards: boolean;
  canRedeemRewards: boolean;
  canCreateGoalsForAnyone: boolean;
  canContributeToOwnGoals: boolean;
  canInviteMembers: boolean;
  canChangeMemberRoles: boolean;
  canEditHouseholdSettings: boolean;
  canAccessBilling: boolean;
  canCreateChallenges: boolean;
  canGiftPoints: boolean;
  canCreateCompetitions: boolean;
  canConfigureAI: boolean;
}

export interface NavTab {
  key: string;
  label: string;
  icon: string;
  href: string;
}

export interface ModeConfig {
  enabled: boolean;
  label: string;
  description: string;
  icon: string;
  roles: string[];
  creatorRole: string;
  defaultJoinerRole: string;
  features: ModeFeatures;
  ui: ModeUI;
  navTabs: Record<string, NavTab[]>;
  permissions: Record<string, ModePermissions>;
}

// ---------------------------------------------------------------------------
// Mode Definitions
// ---------------------------------------------------------------------------

const familyMode: ModeConfig = {
  enabled: true,
  label: 'Family',
  description: 'Perfect for families with parents and kids. Includes gamification, rewards, goals, and approval workflows.',
  icon: 'house',
  roles: ['parent', 'kid'],
  creatorRole: 'parent',
  defaultJoinerRole: 'kid',
  features: {
    gamification: true,
    rewards: true,
    goals: true,
    approvalWorkflow: true,
    fairnessScoring: true,
    leaderboard: true,
    photoProofDefault: true,
    paymentHandles: true,
    bonusChallenges: true,
    pointGifting: true,
    weeklyReportCard: true,
    birthdaySystem: true,
    accentColors: true,
    headToHead: true,
    aiVerification: true,
    speedBonus: true,
  },
  ui: {
    difficultyDisplay: 'stars',
    completionAnimation: 'confetti',
    tonePlayful: true,
    showPointsProminent: true,
  },
  navTabs: {
    parent: [
      { key: 'home', label: 'Home', icon: 'home', href: '/dashboard' },
      { key: 'schedule', label: 'Schedule', icon: 'calendar', href: '/schedule' },
      { key: 'fairness', label: 'Fairness', icon: 'scale', href: '/fairness' },
      { key: 'rewards', label: 'Rewards', icon: 'gift', href: '/rewards' },
      { key: 'settings', label: 'Settings', icon: 'settings', href: '/settings' },
    ],
    kid: [
      { key: 'home', label: 'Home', icon: 'home', href: '/dashboard' },
      { key: 'goals', label: 'Goals', icon: 'target', href: '/goals' },
      { key: 'rewards', label: 'Rewards', icon: 'gift', href: '/rewards' },
      { key: 'stats', label: 'My Stats', icon: 'bar-chart-3', href: '/fairness' },
    ],
  },
  permissions: {
    parent: {
      canCreateChores: true,
      canEditChores: true,
      canDeleteChores: true,
      canCreateRotations: true,
      canAssignChores: true,
      canViewAllAssignments: true,
      canMarkOwnComplete: true,
      canSubmitPhotoProof: true,
      canApproveCompletions: true,
      canCreateRewards: true,
      canRedeemRewards: true,
      canCreateGoalsForAnyone: true,
      canContributeToOwnGoals: true,
      canInviteMembers: true,
      canChangeMemberRoles: true,
      canEditHouseholdSettings: true,
      canAccessBilling: true,
      canCreateChallenges: true,
      canGiftPoints: true,
      canCreateCompetitions: true,
      canConfigureAI: true,
    },
    kid: {
      canCreateChores: false,
      canEditChores: false,
      canDeleteChores: false,
      canCreateRotations: false,
      canAssignChores: false,
      canViewAllAssignments: true,
      canMarkOwnComplete: true,
      canSubmitPhotoProof: true,
      canApproveCompletions: false,
      canCreateRewards: false,
      canRedeemRewards: true,
      canCreateGoalsForAnyone: false,
      canContributeToOwnGoals: true,
      canInviteMembers: false,
      canChangeMemberRoles: false,
      canEditHouseholdSettings: false,
      canAccessBilling: false,
      canCreateChallenges: false,
      canGiftPoints: true,
      canCreateCompetitions: true,
      canConfigureAI: false,
    },
  },
};

const roommateMode: ModeConfig = {
  enabled: true,
  label: 'Roommate',
  description: 'Designed for shared living spaces. Focused on fairness, rotation schedules, and payment handles.',
  icon: 'users',
  roles: ['roommate'],
  creatorRole: 'roommate',
  defaultJoinerRole: 'roommate',
  features: {
    gamification: false,
    rewards: false,
    goals: false,
    approvalWorkflow: false,
    fairnessScoring: true,
    leaderboard: false,
    photoProofDefault: false,
    paymentHandles: true,
    bonusChallenges: true,
    pointGifting: true,
    weeklyReportCard: true,
    birthdaySystem: true,
    accentColors: true,
    headToHead: true,
    aiVerification: true,
    speedBonus: true,
  },
  ui: {
    difficultyDisplay: 'text',
    completionAnimation: 'checkmark',
    tonePlayful: false,
    showPointsProminent: false,
  },
  navTabs: {
    roommate: [
      { key: 'home', label: 'Home', icon: 'home', href: '/dashboard' },
      { key: 'schedule', label: 'Schedule', icon: 'calendar', href: '/schedule' },
      { key: 'fairness', label: 'Fairness', icon: 'scale', href: '/fairness' },
      { key: 'settings', label: 'Settings', icon: 'settings', href: '/settings' },
    ],
  },
  permissions: {
    roommate: {
      canCreateChores: true,
      canEditChores: true,
      canDeleteChores: true,
      canCreateRotations: true,
      canAssignChores: true,
      canViewAllAssignments: true,
      canMarkOwnComplete: true,
      canSubmitPhotoProof: true,
      canApproveCompletions: false,
      canCreateRewards: false,
      canRedeemRewards: false,
      canCreateGoalsForAnyone: false,
      canContributeToOwnGoals: false,
      canInviteMembers: true,
      canChangeMemberRoles: true,
      canEditHouseholdSettings: true,
      canAccessBilling: true,
      canCreateChallenges: true,
      canGiftPoints: true,
      canCreateCompetitions: true,
      canConfigureAI: true,
    },
  },
};

const officeMode: ModeConfig = {
  enabled: false,
  label: 'Office',
  description: 'For shared office and workspace task management. Track cleaning duties, supply runs, and shared responsibilities.',
  icon: 'building-2',
  roles: ['manager', 'colleague'],
  creatorRole: 'manager',
  defaultJoinerRole: 'colleague',
  features: {
    gamification: false,
    rewards: false,
    goals: false,
    approvalWorkflow: false,
    fairnessScoring: true,
    leaderboard: false,
    photoProofDefault: false,
    paymentHandles: false,
    bonusChallenges: false,
    pointGifting: false,
    weeklyReportCard: true,
    birthdaySystem: false,
    accentColors: true,
    headToHead: false,
    aiVerification: false,
    speedBonus: false,
  },
  ui: {
    difficultyDisplay: 'text',
    completionAnimation: 'checkmark',
    tonePlayful: false,
    showPointsProminent: false,
  },
  navTabs: {
    manager: [
      { key: 'home', label: 'Home', icon: 'home', href: '/dashboard' },
      { key: 'schedule', label: 'Schedule', icon: 'calendar', href: '/schedule' },
      { key: 'fairness', label: 'Fairness', icon: 'scale', href: '/fairness' },
      { key: 'settings', label: 'Settings', icon: 'settings', href: '/settings' },
    ],
    colleague: [
      { key: 'home', label: 'Home', icon: 'home', href: '/dashboard' },
      { key: 'schedule', label: 'Schedule', icon: 'calendar', href: '/schedule' },
      { key: 'fairness', label: 'Fairness', icon: 'scale', href: '/fairness' },
    ],
  },
  permissions: {
    manager: {
      canCreateChores: true,
      canEditChores: true,
      canDeleteChores: true,
      canCreateRotations: true,
      canAssignChores: true,
      canViewAllAssignments: true,
      canMarkOwnComplete: true,
      canSubmitPhotoProof: true,
      canApproveCompletions: false,
      canCreateRewards: false,
      canRedeemRewards: false,
      canCreateGoalsForAnyone: false,
      canContributeToOwnGoals: false,
      canInviteMembers: true,
      canChangeMemberRoles: true,
      canEditHouseholdSettings: true,
      canAccessBilling: true,
      canCreateChallenges: false,
      canGiftPoints: false,
      canCreateCompetitions: false,
      canConfigureAI: false,
    },
    colleague: {
      canCreateChores: true,
      canEditChores: true,
      canDeleteChores: false,
      canCreateRotations: false,
      canAssignChores: false,
      canViewAllAssignments: true,
      canMarkOwnComplete: true,
      canSubmitPhotoProof: true,
      canApproveCompletions: false,
      canCreateRewards: false,
      canRedeemRewards: false,
      canCreateGoalsForAnyone: false,
      canContributeToOwnGoals: false,
      canInviteMembers: false,
      canChangeMemberRoles: false,
      canEditHouseholdSettings: false,
      canAccessBilling: false,
      canCreateChallenges: false,
      canGiftPoints: false,
      canCreateCompetitions: false,
      canConfigureAI: false,
    },
  },
};

// ---------------------------------------------------------------------------
// Exported Config Map
// ---------------------------------------------------------------------------

export const modeConfigs: Record<string, ModeConfig> = {
  family: familyMode,
  roommate: roommateMode,
  office: officeMode,
};

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/**
 * Returns the mode config for a given mode key. Throws if the mode is unknown.
 */
export function getModeConfig(mode: string): ModeConfig {
  const config = modeConfigs[mode];
  if (!config) {
    throw new Error(`Unknown household mode: "${mode}"`);
  }
  return config;
}

/**
 * Returns the permissions object for a given mode + role combination.
 */
export function getPermissions(mode: string, role: string): ModePermissions {
  const config = getModeConfig(mode);
  const perms = config.permissions[role];
  if (!perms) {
    throw new Error(`Unknown role "${role}" for mode "${mode}"`);
  }
  return perms;
}

/**
 * Returns the navigation tabs for a given mode + role combination.
 */
export function getNavTabs(mode: string, role: string): NavTab[] {
  const config = getModeConfig(mode);
  const tabs = config.navTabs[role];
  if (!tabs) {
    throw new Error(`No nav tabs defined for role "${role}" in mode "${mode}"`);
  }
  return tabs;
}

/**
 * Returns only the enabled modes.
 */
export function getEnabledModes(): Record<string, ModeConfig> {
  return Object.fromEntries(
    Object.entries(modeConfigs).filter(([, config]) => config.enabled)
  );
}

/**
 * Checks whether a specific feature is enabled for a given mode.
 */
export function isFeatureEnabled(mode: string, feature: keyof ModeFeatures): boolean {
  const config = getModeConfig(mode);
  return config.features[feature];
}

/**
 * Checks whether a user with the given role in the given mode has a specific
 * permission.
 */
export function hasPermission(mode: string, role: string, permission: keyof ModePermissions): boolean {
  const perms = getPermissions(mode, role);
  return perms[permission];
}
