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
  const isDark = userSettings.appearance.darkMode;

  return (
    <div className={`flex h-screen font-sans overflow-hidden selection:bg-brand/30 ${isDark ? 'bg-app text-white' : 'bg-[#F4F5F7] text-[#111111]'}`}>
      <Sidebar activePage={activePage} onNavigate={onNavigate} profile={userSettings.profile} isDark={isDark} />
      <div className="flex-1 flex flex-col md:ml-64 h-screen">
        <Topbar onAddTrade={onAddTrade} onNavigate={onNavigate} isDark={isDark} onToggleTheme={onToggleTheme} />
        <main className={`flex-1 overflow-y-auto scrollbar-hide ${isDark ? 'bg-app' : 'bg-[#F4F5F7]'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
