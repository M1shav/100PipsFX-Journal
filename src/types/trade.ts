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

export interface UserSettings {
  profile: UserProfile;
  rules: TradingRules;
  preferences: TradingPreferences;
  display: DisplaySettings;
  checklistTemplates: string[];
}
