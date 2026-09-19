import { LayoutDashboard, ListTodo, BookOpen, BarChart3, Settings, LifeBuoy, CreditCard, ChevronDown, ChevronRight, Beaker, BrainCircuit, Users, Activity } from 'lucide-react';
import type { UserProfile } from '../../types/user';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  profile: UserProfile;
  isDark?: boolean;
}

export default function Sidebar({ activePage, onNavigate, profile, isDark = true }: SidebarProps) {
  const isProfileActive = activePage === 'Profile';

  const navGroups = [
    {
      title: 'MENU',
      items: [
        { name: 'Dashboard', icon: LayoutDashboard },
        { name: 'Trades', icon: ListTodo },
        { name: 'Journal', icon: BookOpen },
        { name: 'Analysis', icon: BarChart3, hasChevron: true },
        { name: 'Market', icon: Beaker },
        { name: 'AI Report', icon: BrainCircuit, badge: 'PRO' },
        { name: 'Backtesting', icon: Activity, badge: 'ELITE' },
        { name: 'Traders Lounge', icon: Users, hasChevron: true },
        { name: 'Tools', icon: Settings, hasChevron: true },
      ]
    },
    {
      title: '', 
      items: [
        { name: 'Settings', icon: Settings },
        { name: 'Help & Support', icon: LifeBuoy },
        { name: 'Subscription', icon: CreditCard },
      ]
    }
  ];

  return (
    <div className={`w-64 border-r h-screen flex flex-col fixed left-0 top-0 hidden md:flex z-20 transition-colors ${
      isDark ? 'bg-app border-border' : 'bg-white border-[#E5E5EA]'
    }`}>
      {/* Brand */}
      <div className={`h-[70px] flex items-center px-5 border-b ${isDark ? 'border-border' : 'border-[#E5E5EA]'}`}>
        <div className={`flex items-center font-bold text-[18px] tracking-tight gap-2 ${isDark ? 'text-textMain' : 'text-[#111111]'}`}>
          <div className="flex -skew-x-6 font-black italic tracking-[-0.18em] text-[21px] leading-none pr-1" aria-hidden="true">
            <span className={isDark ? 'text-white' : 'text-[#111111]'}>T</span>
            <span className="text-brand">F</span>
            <span className={isDark ? 'text-white' : 'text-[#111111]'}>B</span>
          </div>
          <span><span className={isDark ? 'text-white' : 'text-[#111111]'}>Trade</span><span className="text-brand">FX</span><span className="text-muted">Book</span></span>
        </div>
        <span className="ml-2 text-[9px] font-bold bg-[#FF9500]/20 text-[#FF9500] px-1.5 py-0.5 rounded uppercase tracking-wider">Beta</span>
      </div>

      {/* User Profile Card */}
      <div className="p-4">
        <button 
          onClick={() => onNavigate('Profile')}
          className={`w-full flex items-center justify-between p-2 rounded-[16px] border transition-all group ${
            isProfileActive 
              ? 'bg-brand/10 border-brand/50 shadow-[0_0_15px_rgba(10,132,255,0.15)]' 
              : (isDark ? 'border-[#1C1C1C] bg-surface2 hover:bg-[#121212]' : 'border-[#E5E5EA] bg-[#F8F9FA] hover:bg-[#EAEAEA]')
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-bold text-white transition-all overflow-hidden ${
              isProfileActive ? 'bg-brand shadow-[0_0_15px_rgba(10,132,255,0.4)]' : 'bg-brand shadow-[0_0_10px_rgba(10,132,255,0.2)]'
            }`}>
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profile.displayName ? profile.displayName.charAt(0).toUpperCase() : '?'
              )}
            </div>
            <div className="text-left truncate">
              <div className="flex items-center gap-2">
                <span className={`text-[14px] font-semibold truncate max-w-[85px] ${isDark ? 'text-textMain' : 'text-[#111111]'}`}>
                  {profile.displayName || 'Setup Profile'}
                </span>
                <span className="text-[9px] border border-muted/30 text-muted px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">Free</span>
              </div>
              <span className="text-[11px] text-muted">Profile</span>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 transition-colors ${isProfileActive ? 'text-brand' : 'text-muted'}`} />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2 px-3 space-y-6 scrollbar-hide">
        {navGroups.map((group, i) => (
          <div key={i}>
            {group.title && <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2 px-3">{group.title}</div>}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      // FIX: Added 'Trades' to the allowed routing options
                      if (item.name === 'Dashboard' || item.name === 'Trades' || item.name === 'Journal' || item.name === 'Profile') {
                        onNavigate(item.name);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-brand/10 text-brand' 
                        : (isDark ? 'text-muted hover:text-textMain hover:bg-surface2' : 'text-[#666666] hover:text-[#111111] hover:bg-[#F0F1F3]')
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-brand' : 'text-muted'}`} />
                      <span className={`text-[13px] ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-bold bg-brand/20 text-brand px-1.5 py-0.5 rounded uppercase tracking-wider">{item.badge}</span>
                    )}
                    {item.hasChevron && <ChevronDown className="w-4 h-4 text-muted/50" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
