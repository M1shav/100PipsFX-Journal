import { useState, useEffect } from 'react';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Trades from './pages/Trades'; 
import Journal from './pages/Journal';
import Profile from './pages/Profile';
import type { Trade } from './types/trade';
import type { UserSettings } from './types/user';
import React from 'react';
import { ErrorBoundary } from './components/ErrorBoundary'; 

const INITIAL_USER_SETTINGS: UserSettings = {
  profile: { displayName: '', username: '', bio: '', joinedYear: new Date().getFullYear().toString() },
  rules: { maxRiskPerTrade: '', maxTradesPerDay: '', maxDailyLoss: '', losingStreak: '', riskReward: '' },
  preferences: { sessions: [], favoritePairs: [] },
  display: { currency: 'USD ($)', timezone: 'Mumbai/Kolkata (IST)' },
  privacy: { profileVisibility: true, showOnLeaderboard: false, showTrades: false, showPnlPerTrade: false, showTotalPnl: false, showWinRate: false, showTradeCount: false },
  appearance: { darkMode: true, streamerMode: false },
  notifications: { pushNotifications: false, tradeAlerts: true, weeklyReport: false },
  checklistTemplates: []
};

export default function App() {
  
  // 1. BULLETPROOF HYDRATION: Safely read from localStorage on initial load.
  const [trades, setTrades] = useState<Trade[]>(() => {
    try {
      const saved = localStorage.getItem('tradefxbook_trades');
      // If empty or explicitly invalid, return empty array safely
      if (!saved || saved === 'undefined' || saved === 'null') return [];
      
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Diagnostic: JSON Parse failed on trades", e);
      return []; // Do not crash the app if storage is malformed
    }
  });

  const [activePage, setActivePage] = useState('Dashboard');

  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('tradefxbook_settings');
      return saved && saved !== 'undefined' ? JSON.parse(saved) : INITIAL_USER_SETTINGS;
    } catch (e) {
      console.error("Diagnostic: JSON Parse failed on settings", e);
      return INITIAL_USER_SETTINGS;
    }
  });

  // Settings can keep useEffect because they aren't vulnerable to the same array-reset bug
  useEffect(() => {
    localStorage.setItem('tradefxbook_settings', JSON.stringify(userSettings));
  }, [userSettings]);

  useEffect(() => {
    if (userSettings.appearance.darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [userSettings.appearance.darkMode]);

  const handleToggleTheme = () => {
    setUserSettings(prev => ({
      ...prev,
      appearance: { ...prev.appearance, darkMode: !prev.appearance.darkMode }
    }));
  };

  // 2. EXPLICIT PERSISTENCE: Save to localStorage exactly when user adds a trade
  const handleAddTrade = (newTrade: Trade) => {
    setTrades(prevTrades => {
      const updated = Array.isArray(prevTrades) ? [...prevTrades, newTrade] : [newTrade];
      localStorage.setItem('tradefxbook_trades', JSON.stringify(updated)); // AGGRESSIVE SAVE
      return updated;
    });
  };

  // 3. EXPLICIT PERSISTENCE: Save to localStorage exactly when user edits a trade
  const handleUpdateTrade = (updatedTrade: Trade) => {
    setTrades(prevTrades => {
      const updated = Array.isArray(prevTrades) 
        ? prevTrades.map(t => t.id === updatedTrade.id ? updatedTrade : t) 
        : [];
      localStorage.setItem('tradefxbook_trades', JSON.stringify(updated)); // AGGRESSIVE SAVE
      return updated;
    });
  };

  // 4. EXPLICIT PERSISTENCE: Save to localStorage exactly when user deletes a trade
  const handleDeleteTrade = (id: string) => {
    setTrades(prevTrades => {
      const updated = Array.isArray(prevTrades) ? prevTrades.filter(t => t.id !== id) : [];
      localStorage.setItem('tradefxbook_trades', JSON.stringify(updated)); // AGGRESSIVE SAVE
      return updated;
    });
  };

  const handleClearAllTradingData = () => {
    setTrades([]);
    localStorage.removeItem('tradefxbook_trades');
  };

  return (
    <ErrorBoundary>
      <AppLayout 
        onAddTrade={handleAddTrade} 
        activePage={activePage} 
        onNavigate={setActivePage}
        userSettings={userSettings}
        onToggleTheme={handleToggleTheme}
      >
        {activePage === 'Dashboard' && <Dashboard trades={trades} />}
        
        {activePage === 'Trades' && (
          <Trades 
            trades={trades} 
            onUpdateTrade={handleUpdateTrade} 
            onDeleteTrade={handleDeleteTrade}
            onClearAllTrades={handleClearAllTradingData}
          />
        )}

        {activePage === 'Journal' && <Journal trades={trades} onUpdateTrade={handleUpdateTrade} />}
        
        {activePage === 'Profile' && (
          <Profile 
            settings={userSettings} 
            onUpdateSettings={setUserSettings}
            onClearAllTradingData={handleClearAllTradingData}
          />
        )}
      </AppLayout>
    </ErrorBoundary>
  );
}