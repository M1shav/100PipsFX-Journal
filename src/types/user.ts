export interface UserProfile {
  displayName: string;
  username: string;
  bio: string;
  joinedYear: string;
  avatarUrl?: string;
}

export interface TradingRules {
  maxRiskPerTrade: string;
  maxTradesPerDay: string;
  maxDailyLoss: string;
  losingStreak: string;
  riskReward: string;
}

export interface TradingPreferences {
  sessions: string[];
  favoritePairs: string[];
}

export interface DisplaySettings {
  currency: string;
  timezone: string;
}

export interface PrivacySettings {
  profileVisibility: boolean;
  showOnLeaderboard: boolean;
  showTrades: boolean;
  showPnlPerTrade: boolean;
  showTotalPnl: boolean;
  showWinRate: boolean;
  showTradeCount: boolean;
}

export interface AppearanceSettings {
  darkMode: boolean;
  streamerMode: boolean;
}

export interface NotificationSettings {
  pushNotifications: boolean;
  tradeAlerts: boolean;
  weeklyReport: boolean;
}

export interface UserSettings {
  profile: UserProfile;
  rules: TradingRules;
  preferences: TradingPreferences;
  display: DisplaySettings;
  privacy: PrivacySettings;
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  checklistTemplates: string[];
}