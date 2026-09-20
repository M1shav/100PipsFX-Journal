import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import type { Trade } from '../../types/trade';
import type { UserSettings } from '../../types/user';

interface AppLayoutProps {
  children: ReactNode;
  onAddTrade: (trade: Trade) => void;
  activePage: string;
  onNavigate: (page: string) => void;
  userSettings: UserSettings;
  onToggleTheme: () => void;
}

export default function AppLayout({ children, onAddTrade, activePage, onNavigate, userSettings, onToggleTheme }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-app text-textMain font-sans">
      <Sidebar 
        activePage={activePage} 
        onNavigate={onNavigate} 
        profile={userSettings.profile}
        isDark={userSettings.appearance.darkMode}
      />
      <div className="flex-1 flex flex-col min-w-0 md:ml-64 transition-all">
        <Topbar 
          onAddTrade={onAddTrade} 
          onNavigate={onNavigate}
          isDark={userSettings.appearance.darkMode}
          onToggleTheme={onToggleTheme}
          profile={userSettings.profile} // Pass profile data down to Topbar
        />
        <main className="flex-1 overflow-y-auto scrollbar-hide relative z-0">
          {children}
        </main>
      </div>
    </div>
  );
}