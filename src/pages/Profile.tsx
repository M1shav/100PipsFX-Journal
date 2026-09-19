import { useState, useRef, useEffect } from 'react';
import { 
  Edit2, Cpu, Scale, Globe, Monitor, CheckSquare, X, ChevronDown, RotateCcw, 
  Link as LinkIcon, Settings as SettingsIcon, CreditCard, Shield, Plus, Eye, Sparkles, 
  Zap, BellOff, AlertTriangle, Crown, Check, Trash2 
} from 'lucide-react';
import type { UserSettings } from '../types/user';

interface ProfileProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onClearAllTradingData?: () => void;
}

const TIMEZONE_REGIONS = [
  {
    name: 'Americas',
    zones: [
      'New York (EST/EDT)', 'Chicago (CST/CDT)', 'Denver (MST/MDT)', 'Los Angeles (PST/PDT)',
      'Anchorage (AKST/AKDT)', 'Phoenix (MST)', 'Honolulu (HST)', 'Toronto (EST/EDT)',
      'Vancouver (PST/PDT)', 'Mexico City (CST/CDT)', 'Sao Paulo (BRT)', 'Buenos Aires (ART)',
      'Lima (PET)', 'Bogota (COT)', 'Santiago (CLT/CLST)'
    ]
  },
  {
    name: 'Europe',
    zones: [
      'UTC', 'London (GMT/BST)', 'Dublin (GMT/IST)', 'Lisbon (WET/WEST)', 'Paris (CET/CEST)',
      'Berlin (CET/CEST)', 'Zurich (CET/CEST)', 'Amsterdam (CET/CEST)', 'Brussels (CET/CEST)',
      'Madrid (CET/CEST)', 'Rome (CET/CEST)', 'Vienna (CET/CEST)', 'Warsaw (CET/CEST)',
      'Prague (CET/CEST)', 'Budapest (CET/CEST)', 'Stockholm (CET/CEST)', 'Oslo (CET/CEST)',
      'Copenhagen (CET/CEST)', 'Helsinki (EET/EEST)', 'Athens (EET/EEST)', 'Bucharest (EET/EEST)',
      'Kyiv (EET/EEST)', 'Moscow (MSK)', 'Istanbul (TRT)'
    ]
  },
  {
    name: 'Middle East',
    zones: ['Dubai (GST)', 'Riyadh (AST)', 'Kuwait (AST)', 'Doha (AST)', 'Tehran (IRST/IRDT)']
  },
  {
    name: 'Asia',
    zones: [
      'Mumbai/Kolkata (IST)', 'Karachi (PKT)', 'Dhaka (BST)', 'Bangkok (ICT)', 'Ho Chi Minh (ICT)',
      'Jakarta (WIB)', 'Singapore (SGT)', 'Kuala Lumpur (MYT)', 'Manila (PHT)', 'Hong Kong (HKT)',
      'Shanghai (CST)', 'Taipei (CST)', 'Tokyo (JST)', 'Seoul (KST)'
    ]
  },
  {
    name: 'Oceania',
    zones: [
      'Perth (AWST)', 'Adelaide (ACST/ACDT)', 'Brisbane (AEST)', 'Sydney (AEST/AEDT)',
      'Melbourne (AEST/AEDT)', 'Auckland (NZST/NZDT)', 'Fiji (FJT)'
    ]
  },
  {
    name: 'Africa',
    zones: ['Casablanca (WET/WEST)', 'Lagos (WAT)', 'Cairo (EET)', 'Johannesburg (SAST)', 'Nairobi (EAT)']
  }
];

const CURRENCIES = [
  { code: 'USD ($)', symbol: '$' },
  { code: 'EUR (€)', symbol: '€' },
  { code: 'GBP (£)', symbol: '£' },
  { code: 'JPY (¥)', symbol: '¥' },
  { code: 'AUD (A$)', symbol: 'A$' }
];

export default function Profile({ settings, onUpdateSettings, onClearAllTradingData }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<'Profile' | 'MT5/MT4' | 'Settings' | 'Billing' | 'Security'>('Profile');

  // Modals
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditRulesOpen, setIsEditRulesOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isDangerConfirmOpen, setIsDangerConfirmOpen] = useState(false);

  // Dropdown States
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isTimezoneOpen, setIsTimezoneOpen] = useState(false);

  // Inline Checklist state
  const [showNewItemInput, setShowNewItemInput] = useState(false);
  const [newItemText, setNewItemText] = useState('');

  const currencyRef = useRef<HTMLDivElement>(null);
  const timezoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setIsCurrencyOpen(false);
      }
      if (timezoneRef.current && !timezoneRef.current.contains(e.target as Node)) {
        setIsTimezoneOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpdatePrivacy = (key: keyof typeof settings.privacy) => {
    onUpdateSettings({
      ...settings,
      privacy: { ...settings.privacy, [key]: !settings.privacy[key] }
    });
  };

  const handleUpdateNotifications = (key: keyof typeof settings.notifications) => {
    onUpdateSettings({
      ...settings,
      notifications: { ...settings.notifications, [key]: !settings.notifications[key] }
    });
  };

  const handleToggleDarkMode = () => {
    onUpdateSettings({
      ...settings,
      appearance: { ...settings.appearance, darkMode: !settings.appearance.darkMode }
    });
  };

  const handleUpdateChecklistItem = (index: number, newText: string) => {
    const updated = [...settings.checklistTemplates];
    updated[index] = newText;
    onUpdateSettings({ ...settings, checklistTemplates: updated });
  };

  const handleRemoveChecklistItem = (index: number) => {
    const updated = [...settings.checklistTemplates];
    updated.splice(index, 1);
    onUpdateSettings({ ...settings, checklistTemplates: updated });
  };

  const handleResetChecklist = () => {
    onUpdateSettings({ ...settings, checklistTemplates: [] });
  };

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold tracking-tight mb-1">Profile</h1>
        <p className="text-[13px] text-muted">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
      </div>

      <div className="space-y-6 pb-20">
        
        {/* --- HEADER CARD --- */}
        <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-[24px] p-6 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-[72px] h-[72px] bg-brand rounded-full flex items-center justify-center text-white text-[28px] font-bold shadow-[0_0_20px_rgba(10,132,255,0.3)] overflow-hidden">
                {settings.profile.avatarUrl ? (
                  <img src={settings.profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  settings.profile.displayName ? settings.profile.displayName.charAt(0).toUpperCase() : '?'
                )}
              </div>
              <button 
                onClick={() => setIsEditProfileOpen(true)}
                className="absolute bottom-0 right-0 w-7 h-7 bg-brand border-2 border-[#0A0A0A] rounded-full flex items-center justify-center hover:bg-brand/90 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-[20px] font-bold text-textMain">{settings.profile.displayName || 'Setup Profile'}</h2>
                <span className="text-[10px] font-bold bg-[#1C1C1E] border border-[#333] text-muted px-2 py-0.5 rounded uppercase tracking-wider">FREE</span>
              </div>
              <p className="text-[13px] text-muted">
                {settings.profile.username ? `@${settings.profile.username}` : 'No username'} • Joined {settings.profile.joinedYear}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsEditProfileOpen(true)}
            className="px-4 py-2.5 rounded-[12px] bg-surface2 border border-[#1C1C1C] text-[13px] font-semibold text-textMain hover:bg-[#1C1C1E] transition-colors flex items-center gap-2"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit Profile
          </button>
        </div>

        {/* --- TABS --- */}
        <div className="flex items-center gap-2">
          {[
            { name: 'Profile', icon: null },
            { name: 'MT5/MT4', icon: <LinkIcon className="w-3.5 h-3.5" /> },
            { name: 'Settings', icon: <SettingsIcon className="w-3.5 h-3.5" /> },
            { name: 'Billing', icon: <CreditCard className="w-3.5 h-3.5" /> },
            { name: 'Security', icon: <Shield className="w-3.5 h-3.5" /> }
          ].map(tab => (
            <button 
              key={tab.name}
              onClick={() => setActiveTab(tab.name as any)}
              className={`px-4 py-2.5 rounded-[12px] text-[13px] font-semibold transition-all flex items-center gap-2 ${
                activeTab === tab.name 
                  ? 'bg-brand text-white shadow-[0_0_15px_rgba(10,132,255,0.3)]' 
                  : 'bg-transparent text-muted hover:bg-surface2 hover:text-textMain'
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* PROFILE TAB CONTENT                                                       */}
        {/* ========================================================================= */}
        {activeTab === 'Profile' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* AI Reports */}
            <div className="bg-[#050505] border border-brand/30 rounded-[20px] p-5 flex justify-between items-center shadow-[0_0_30px_rgba(10,132,255,0.05)]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-white mb-0.5">AI-Powered Trading Reports</h3>
                  <p className="text-[13px] text-muted">Personalised insights and analysis drawn from your trading patterns.</p>
                </div>
              </div>
              <button className="px-5 py-2.5 rounded-[12px] bg-brand/10 border border-brand/30 text-brand text-[13px] font-bold hover:bg-brand/20 transition-colors flex items-center gap-2">
                <Cpu className="w-4 h-4" /> Upgrade to Pro
              </button>
            </div>

            {/* Trading Rules */}
            <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-[24px] p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-surface2 border border-[#1C1C1C] flex items-center justify-center mt-1">
                    <Scale className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-textMain mb-1">Trading Rules</h3>
                    <p className="text-[13px] text-muted">Your personal risk ceiling - locked after onboarding</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditRulesOpen(true)}
                  className="px-4 py-2.5 rounded-[12px] bg-brand/10 text-brand border border-brand/20 text-[13px] font-semibold hover:bg-brand/20 transition-colors flex items-center gap-2"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Rules
                </button>
              </div>
              
              <div className="grid grid-cols-5 gap-3 mb-5">
                <RuleCard title="MAX RISK / TRADE" value={settings.rules.maxRiskPerTrade} />
                <RuleCard title="MAX TRADES / DAY" value={settings.rules.maxTradesPerDay} />
                <RuleCard title="MAX DAILY LOSS" value={settings.rules.maxDailyLoss} />
                <RuleCard title="LOSING STREAK" value={settings.rules.losingStreak} />
                <RuleCard title="RISK / REWARD" value={settings.rules.riskReward} />
              </div>
              
              <div className="flex justify-between items-center text-[11px] text-muted px-1">
                <span>Last updated - {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span>Unlocks in 30 days</span>
              </div>
            </div>

            {/* Preferences & Display Grid */}
            <div className="grid grid-cols-2 gap-6">
              
              {/* Trading Preferences */}
              <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-[24px] p-6 flex flex-col">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-surface2 border border-[#1C1C1C] flex items-center justify-center mt-1">
                    <Globe className="w-5 h-5 text-brand" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-[16px] font-bold text-textMain mb-1">Trading Preferences</h3>
                      <button onClick={() => setIsPreferencesOpen(true)} className="text-muted hover:text-white transition-colors"><Edit2 className="w-4 h-4"/></button>
                    </div>
                    <p className="text-[13px] text-muted">Sessions and pairs you focus on</p>
                  </div>
                </div>
                
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <ClockIcon className="w-3.5 h-3.5 text-brand" />
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Sessions</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {settings.preferences.sessions.length > 0 ? settings.preferences.sessions.map(s => (
                      <span key={s} className="px-3 py-1.5 rounded-lg border border-brand/30 bg-brand/5 text-[12px] font-semibold text-brand">{s}</span>
                    )) : <span className="text-[12px] text-[#4A4A4A]">No sessions selected</span>}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <DollarIcon className="w-3.5 h-3.5 text-brand" />
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Favorite Pairs</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {settings.preferences.favoritePairs.length > 0 ? settings.preferences.favoritePairs.map(p => (
                      <span key={p} className="px-3 py-1.5 rounded-lg border border-brand/30 bg-brand/5 text-[12px] font-semibold text-brand">{p}</span>
                    )) : <span className="text-[12px] text-[#4A4A4A]">No favorite pairs</span>}
                  </div>
                </div>
              </div>

              {/* Display Card (Links to Settings tab) */}
              <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-[24px] p-6 flex flex-col relative">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-surface2 border border-[#1C1C1C] flex items-center justify-center mt-1">
                    <Monitor className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-textMain mb-1">Display</h3>
                    <p className="text-[13px] text-muted">How values render across the app</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#121212] border border-[#1C1C1C] rounded-2xl p-4">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-2">Currency</span>
                    <div className="flex items-center gap-2 text-[15px] font-bold text-textMain">
                      <span className="text-brand">$</span> {settings.display.currency.split(' ')[0]}
                    </div>
                  </div>
                  <div className="bg-[#121212] border border-[#1C1C1C] rounded-2xl p-4 overflow-hidden">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-2">Timezone</span>
                    <div className="flex items-center gap-2 text-[14px] font-bold text-textMain truncate">
                      <Globe className="w-4 h-4 text-brand shrink-0" /> <span className="truncate">{settings.display.timezone}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex justify-between items-center">
                  <span className="text-[11px] text-[#4A4A4A]">Edit in the Settings tab</span>
                  <button 
                    onClick={() => setActiveTab('Settings')} 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-brand/30 bg-brand/10 text-[12px] font-semibold text-brand hover:bg-brand/20 transition-all shadow-[0_0_10px_rgba(10,132,255,0.15)]"
                  >
                    <SettingsIcon className="w-3.5 h-3.5" /> Settings
                  </button>
                </div>
              </div>

            </div>

            {/* Pre-Trade Checklist */}
            <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-[24px] p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center mt-1">
                  <CheckSquare className="w-5 h-5 text-brand" />
                </div>
                <div className="flex-1 flex justify-between items-start">
                  <div>
                    <h3 className="text-[16px] font-bold text-textMain mb-1">Pre-Trade Checklist</h3>
                    <p className="text-[13px] text-muted">Applied to every new trade and daily session check-in</p>
                  </div>
                  <button onClick={handleResetChecklist} className="flex items-center gap-2 text-[12px] font-semibold text-muted hover:text-white transition-colors">
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                </div>
              </div>

              <div className="mb-4 ml-1">
                <span className="text-[12px] font-medium text-textMain">{settings.checklistTemplates.length} items</span>
              </div>

              <div className="space-y-1">
                {settings.checklistTemplates.map((item, idx) => (
                  <ChecklistItemRow 
                    key={idx} 
                    item={item} 
                    index={idx} 
                    onUpdate={handleUpdateChecklistItem} 
                    onRemove={handleRemoveChecklistItem} 
                  />
                ))}
                
                {/* Dynamic Add Item Row */}
                {showNewItemInput && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-brand bg-[#121212] shadow-[0_0_10px_rgba(10,132,255,0.2)] transition-all mt-2">
                    <div className="flex items-center w-full gap-3">
                      <Plus className="w-4 h-4 text-brand" />
                      <input 
                        autoFocus
                        type="text" 
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        onBlur={() => {
                          const val = newItemText.trim();
                          if (val) {
                            onUpdateSettings({
                              ...settings,
                              checklistTemplates: [...settings.checklistTemplates, val]
                            });
                          }
                          setNewItemText('');
                          setShowNewItemInput(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = newItemText.trim();
                            if (val) {
                              onUpdateSettings({
                                ...settings,
                                checklistTemplates: [...settings.checklistTemplates, val]
                              });
                              setNewItemText('');
                            } else {
                              setShowNewItemInput(false);
                            }
                          }
                        }}
                        placeholder="Type checklist item..." 
                        className="bg-transparent border-none outline-none text-[14px] font-medium text-textMain placeholder:text-[#4A4A4A] flex-1"
                      />
                    </div>
                  </div>
                )}

                <button 
                  onMouseDown={(e) => {
                    if (showNewItemInput && newItemText.trim()) {
                      e.preventDefault();
                      onUpdateSettings({
                        ...settings,
                        checklistTemplates: [...settings.checklistTemplates, newItemText.trim()]
                      });
                      setNewItemText('');
                    } else if (!showNewItemInput) {
                      e.preventDefault();
                      setShowNewItemInput(true);
                    }
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 mt-3 text-[13px] font-medium text-brand hover:bg-brand/5 rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>
            </div>
            
          </div>
        )}

        {/* ========================================================================= */}
        {/* SETTINGS TAB CONTENT                                                      */}
        {/* ========================================================================= */}
        {activeTab === 'Settings' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* 1. PRIVACY CARD */}
            <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-[24px] p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center mt-1">
                  <Eye className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-textMain mb-1">Privacy</h3>
                  <p className="text-[13px] text-muted">Control what other traders can see on your public profile</p>
                </div>
              </div>

              <div className="divide-y divide-[#1C1C1C]">
                <ToggleRow 
                  title="Profile Visibility" 
                  desc="Your profile is visible to others." 
                  enabled={settings.privacy.profileVisibility} 
                  onToggle={() => handleUpdatePrivacy('profileVisibility')} 
                />
                <ToggleRow 
                  title="Show on Leaderboard" 
                  desc="Appear in the public trading leaderboard." 
                  enabled={settings.privacy.showOnLeaderboard} 
                  onToggle={() => handleUpdatePrivacy('showOnLeaderboard')} 
                />
                <ToggleRow 
                  title="Show Trades" 
                  desc="Let others see your individual trades." 
                  enabled={settings.privacy.showTrades} 
                  onToggle={() => handleUpdatePrivacy('showTrades')} 
                />
                <ToggleRow 
                  title="Show P&L Per Trade" 
                  desc="Display profit / loss on each trade." 
                  enabled={settings.privacy.showPnlPerTrade} 
                  onToggle={() => handleUpdatePrivacy('showPnlPerTrade')} 
                />
                <ToggleRow 
                  title="Show Total P&L" 
                  desc="Display your cumulative profit / loss." 
                  enabled={settings.privacy.showTotalPnl} 
                  onToggle={() => handleUpdatePrivacy('showTotalPnl')} 
                />
                <ToggleRow 
                  title="Show Win Rate" 
                  desc="Display your winning percentage." 
                  enabled={settings.privacy.showWinRate} 
                  onToggle={() => handleUpdatePrivacy('showWinRate')} 
                />
                <ToggleRow 
                  title="Show Trade Count" 
                  desc="Display total number of trades." 
                  enabled={settings.privacy.showTradeCount} 
                  onToggle={() => handleUpdatePrivacy('showTradeCount')} 
                />
              </div>
            </div>

            {/* 2. APPEARANCE & NOTIFICATIONS GRID */}
            <div className="grid grid-cols-2 gap-6">
              
              {/* Appearance */}
              <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-[24px] p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center mt-1">
                      <Sparkles className="w-5 h-5 text-brand" />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-bold text-textMain mb-1">Appearance</h3>
                      <p className="text-[13px] text-muted">Theme and sensitive-info visibility</p>
                    </div>
                  </div>

                  <div className="divide-y divide-[#1C1C1C]">
                    <ToggleRow 
                      title="Dark Mode" 
                      desc="Use the dark theme (default)." 
                      enabled={settings.appearance.darkMode} 
                      onToggle={handleToggleDarkMode} 
                    />
                    
                    <div className="py-4 flex justify-between items-center">
                      <div>
                        <div className="text-[14px] font-semibold text-textMain mb-0.5">Streamer Mode</div>
                        <div className="text-[12px] text-muted">Requires Pro or above.</div>
                      </div>
                      <span className="flex items-center gap-1 px-3 py-1 rounded-xl bg-brand text-white text-[11px] font-bold shadow-[0_0_10px_rgba(10,132,255,0.3)]">
                        <Crown className="w-3.5 h-3.5 fill-white" /> Pro
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-[24px] p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center mt-1">
                      <Zap className="w-5 h-5 text-brand" />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-bold text-textMain mb-1">Notifications</h3>
                      <p className="text-[13px] text-muted">Decide which alerts reach your device</p>
                    </div>
                  </div>

                  <div className="divide-y divide-[#1C1C1C]">
                    <ToggleRow 
                      title="Push Notifications" 
                      desc="Receive browser notifications." 
                      enabled={settings.notifications.pushNotifications} 
                      onToggle={() => handleUpdateNotifications('pushNotifications')} 
                    />
                    <ToggleRow 
                      title="Trade Alerts" 
                      desc="Get notified when trades close." 
                      enabled={settings.notifications.tradeAlerts} 
                      onToggle={() => handleUpdateNotifications('tradeAlerts')} 
                    />
                    <div className="py-4 flex justify-between items-center">
                      <div>
                        <div className="text-[14px] font-semibold text-textMain mb-0.5">Weekly Report</div>
                        <div className="text-[12px] text-muted">Receive weekly performance summary.</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Toggle 
                          enabled={settings.notifications.weeklyReport} 
                          onToggle={() => handleUpdateNotifications('weeklyReport')} 
                        />
                        <span className="text-[9px] font-bold bg-[#FF9500]/20 text-[#FF9500] border border-[#FF9500]/30 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          SOON
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* 3. CURRENCY & TIMEZONE */}
            <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-[24px] p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center mt-1">
                  <Globe className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-textMain mb-1">Currency & Timezone</h3>
                  <p className="text-[13px] text-muted">Values render using your account currency · symbol is display only</p>
                </div>
              </div>

              <div className="divide-y divide-[#1C1C1C]">
                {/* Currency Dropdown */}
                <div className="py-4 flex justify-between items-center relative" ref={currencyRef}>
                  <div>
                    <div className="text-[14px] font-semibold text-textMain mb-0.5">Currency</div>
                    <div className="text-[12px] text-muted">Display symbol only — P&L values remain in your account currency.</div>
                  </div>

                  <div className="relative">
                    <button 
                      onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                      className={`min-w-[130px] flex items-center justify-between px-4 py-2 rounded-xl bg-[#121212] border text-[13px] font-semibold text-textMain transition-all ${
                        isCurrencyOpen ? 'border-brand shadow-[0_0_10px_rgba(10,132,255,0.25)]' : 'border-[#1C1C1C] hover:border-[#333]'
                      }`}
                    >
                      <span>{settings.display.currency}</span>
                      <ChevronDown className="w-4 h-4 text-brand ml-2" />
                    </button>

                    {isCurrencyOpen && (
                      <div className="absolute right-0 top-12 w-[140px] bg-[#0A0A0A] border border-[#1C1C1C] rounded-2xl shadow-2xl py-1.5 z-50 overflow-hidden">
                        {CURRENCIES.map(curr => (
                          <button
                            key={curr.code}
                            onClick={() => {
                              onUpdateSettings({
                                ...settings,
                                display: { ...settings.display, currency: curr.code }
                              });
                              setIsCurrencyOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-[13px] font-medium transition-colors ${
                              settings.display.currency === curr.code ? 'bg-brand/20 text-brand font-bold' : 'text-textMain hover:bg-[#121212]'
                            }`}
                          >
                            {curr.code}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Region-Categorized Timezone Dropdown */}
                <div className="py-4 flex justify-between items-center relative" ref={timezoneRef}>
                  <div>
                    <div className="text-[14px] font-semibold text-textMain mb-0.5">Timezone</div>
                    <div className="text-[12px] text-muted">Used to display trade timestamps across the app.</div>
                  </div>

                  <div className="relative">
                    <button 
                      onClick={() => setIsTimezoneOpen(!isTimezoneOpen)}
                      className={`min-w-[240px] max-w-[280px] flex items-center justify-between px-4 py-2 rounded-xl bg-[#121212] border text-[13px] font-semibold text-textMain transition-all truncate ${
                        isTimezoneOpen ? 'border-brand shadow-[0_0_10px_rgba(10,132,255,0.25)]' : 'border-[#1C1C1C] hover:border-[#333]'
                      }`}
                    >
                      <span className="truncate">{settings.display.timezone}</span>
                      <ChevronDown className="w-4 h-4 text-brand ml-2 shrink-0" />
                    </button>

                    {isTimezoneOpen && (
                      <div className="absolute right-0 bottom-12 w-[280px] max-h-[380px] bg-[#0A0A0A] border border-[#1C1C1C] rounded-2xl shadow-2xl py-2 z-50 overflow-y-auto scrollbar-hide">
                        {TIMEZONE_REGIONS.map(reg => (
                          <div key={reg.name} className="mb-2">
                            <div className="px-4 py-1.5 text-[11px] font-bold text-white tracking-wider sticky top-0 bg-[#0A0A0A]/95 backdrop-blur z-10">{reg.name}</div>
                            {reg.zones.map(z => (
                              <button
                                key={z}
                                onClick={() => {
                                  onUpdateSettings({
                                    ...settings,
                                    display: { ...settings.display, timezone: z }
                                  });
                                  setIsTimezoneOpen(false);
                                }}
                                className={`w-full text-left px-5 py-2 text-[13px] font-medium transition-colors truncate ${
                                  settings.display.timezone === z 
                                    ? 'bg-[#0A84FF]/30 text-white font-semibold' 
                                    : 'text-textMain hover:bg-[#121212]'
                                }`}
                              >
                                {z}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. DISMISSED NOTIFICATIONS & DANGER ZONE GRID */}
            <div className="grid grid-cols-2 gap-6">
              
              {/* Dismissed Notifications */}
              <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-[24px] p-6 flex flex-col justify-between h-[220px]">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center mt-1">
                    <BellOff className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-textMain mb-1">Dismissed Notifications</h3>
                    <p className="text-[13px] text-muted">Restore notifications you've hidden</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="text-[15px] font-bold text-textMain mb-0.5">All clear</div>
                  <p className="text-[12px] text-muted">No dismissed notifications</p>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-[24px] p-6 flex flex-col justify-between h-[220px]">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-loss/10 border border-loss/20 flex items-center justify-center mt-1">
                    <AlertTriangle className="w-5 h-5 text-loss" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-textMain mb-1">Danger Zone</h3>
                    <p className="text-[13px] text-muted">Permanent actions. These cannot be undone</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-auto pt-4 border-t border-[#1C1C1C]">
                  <div>
                    <div className="text-[14px] font-semibold text-textMain mb-0.5">Clear All Trading Data</div>
                    <div className="text-[11px] text-muted max-w-[280px]">Permanently delete all trades, journal entries, and performance snapshots.</div>
                  </div>
                  <button 
                    onClick={() => setIsDangerConfirmOpen(true)}
                    className="px-4 py-2 rounded-xl border border-loss/40 bg-loss/10 text-loss hover:bg-loss/20 text-[13px] font-bold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(255,69,58,0.2)] shrink-0"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" /> Clear
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* --- MODALS --- */}
      {isEditProfileOpen && (
        <ModalWrapper title="Edit Profile" onClose={() => setIsEditProfileOpen(false)}>
          <ProfileForm 
            initialData={settings.profile} 
            onSave={(profile: any) => {
              onUpdateSettings({ ...settings, profile });
              setIsEditProfileOpen(false);
            }} 
            onCancel={() => setIsEditProfileOpen(false)} 
          />
        </ModalWrapper>
      )}

      {isEditRulesOpen && (
        <ModalWrapper title="Edit Trading Rules" onClose={() => setIsEditRulesOpen(false)}>
          <RulesForm 
            initialData={settings.rules} 
            onSave={(rules: any) => {
              onUpdateSettings({ ...settings, rules });
              setIsEditRulesOpen(false);
            }} 
            onCancel={() => setIsEditRulesOpen(false)} 
          />
        </ModalWrapper>
      )}

      {isPreferencesOpen && (
        <ModalWrapper title="Trading Preferences" onClose={() => setIsPreferencesOpen(false)}>
          <PreferencesForm 
            initialData={settings.preferences} 
            onSave={(preferences: any) => {
              onUpdateSettings({ ...settings, preferences });
              setIsPreferencesOpen(false);
            }} 
            onCancel={() => setIsPreferencesOpen(false)} 
          />
        </ModalWrapper>
      )}

      {/* Danger Zone Confirmation Modal */}
      {isDangerConfirmOpen && (
        <ModalWrapper title="Clear All Trading Data?" onClose={() => setIsDangerConfirmOpen(false)}>
          <div className="space-y-4">
            <p className="text-[13px] text-muted leading-relaxed">
              This action will <strong className="text-white">permanently erase all recorded trades, statistics, and journal entries</strong>. This action cannot be reversed.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-[#1C1C1C]">
              <button 
                onClick={() => setIsDangerConfirmOpen(false)}
                className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-textMain hover:bg-surface2 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onClearAllTradingData?.();
                  setIsDangerConfirmOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl text-[13px] font-bold bg-loss text-white shadow-[0_0_15px_rgba(255,69,58,0.3)] hover:bg-loss/90 transition-all"
              >
                Yes, Delete Everything
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}

    </div>
  );
}

// --- SUB-COMPONENTS & ROWS ---

function ToggleRow({ title, desc, enabled, onToggle }: { title: string; desc: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div className="py-4 flex justify-between items-center">
      <div>
        <div className="text-[14px] font-semibold text-textMain mb-0.5">{title}</div>
        <div className="text-[12px] text-muted">{desc}</div>
      </div>
      <Toggle enabled={enabled} onToggle={onToggle} />
    </div>
  );
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button 
      type="button" 
      onClick={onToggle} 
      className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-1 focus:ring-brand ${
        enabled ? 'bg-brand shadow-[0_0_10px_rgba(10,132,255,0.3)]' : 'bg-[#1C1C1E] border border-[#2C2C2E]'
      }`}
    >
      <div className={`w-5 h-5 bg-white rounded-full transition-transform absolute top-0.5 left-0.5 shadow-md ${
        enabled ? 'translate-x-5' : 'translate-x-0'
      }`} />
    </button>
  );
}

function ChecklistItemRow({ item, index, onUpdate, onRemove }: { item: string, index: number, onUpdate: (i: number, val: string) => void, onRemove: (i: number) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item);

  useEffect(() => {
    setEditValue(item);
  }, [item]);

  const handleSave = () => {
    setIsEditing(false);
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== item) {
      onUpdate(index, trimmed);
    } else {
      setEditValue(item);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#121212] border border-[#1C1C1C] group hover:border-[#333] transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <ChevronDown className="w-4 h-4 text-[#4A4A4A] shrink-0" />
        {isEditing ? (
          <input
            autoFocus
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') { setIsEditing(false); setEditValue(item); }
            }}
            className="flex-1 bg-[#0A0A0A] border border-brand shadow-[0_0_10px_rgba(10,132,255,0.2)] rounded-lg px-3 py-1.5 text-[14px] font-medium text-textMain focus:outline-none transition-all w-full"
          />
        ) : (
          <div onClick={() => setIsEditing(true)} className="flex-1 text-[14px] font-medium text-textMain cursor-text py-1.5 truncate border border-transparent">
            {item}
          </div>
        )}
      </div>
      <button 
        onMouseDown={(e) => e.preventDefault()} 
        onClick={() => onRemove(index)} 
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#333] rounded transition-all shrink-0 ml-2"
      >
        <X className="w-4 h-4 text-[#4A4A4A] hover:text-loss" />
      </button>
    </div>
  );
}

function RuleCard({ title, value }: { title: string; value: string }) {
  const displayVal = value.trim() === '' ? '—' : value;
  return (
    <div className="bg-[#121212] border border-[#1C1C1C] rounded-[16px] p-4 flex flex-col justify-between h-[100px]">
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-brand"></div>
        <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{title}</span>
      </div>
      <div className="text-[24px] font-bold text-textMain">{displayVal}</div>
    </div>
  );
}

function ModalWrapper({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-[#050505] w-full max-w-[460px] rounded-[24px] border border-[#1C1C1C] shadow-2xl relative z-10 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-[20px] font-bold text-textMain tracking-tight">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface2 border border-[#1C1C1C] text-muted hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 pb-6 scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  );
}

function ProfileForm({ initialData, onSave, onCancel }: any) {
  const [data, setData] = useState(initialData);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData({ ...data, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <span className="block text-[12px] font-bold text-textMain mb-3">Profile Picture</span>
        <div className="flex items-center gap-4">
          <div className="w-[72px] h-[72px] bg-brand rounded-full flex items-center justify-center text-white text-[28px] font-bold overflow-hidden shrink-0">
            {data.avatarUrl ? (
              <img src={data.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              data.displayName ? data.displayName.charAt(0).toUpperCase() : '?'
            )}
          </div>
          <div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/png, image/jpeg, image/jpg, image/webp" 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="px-4 py-2 rounded-[10px] bg-surface2 border border-[#1C1C1C] text-[12px] font-semibold text-textMain hover:bg-[#1C1C1E] transition-colors mb-1.5"
            >
              Change Photo
            </button>
            <p className="text-[10px] text-muted">Images only. Max size 5MB</p>
          </div>
        </div>
      </div>
      <div>
        <label className="block text-[12px] font-bold text-textMain mb-2">Display Name</label>
        <input 
          type="text" 
          value={data.displayName} 
          onChange={e => setData({...data, displayName: e.target.value})} 
          className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-[14px] px-4 py-3 text-[14px] font-medium text-textMain focus:outline-none focus:border-brand focus:shadow-[0_0_10px_rgba(10,132,255,0.2)] transition-all" 
        />
      </div>
      <div>
        <label className="block text-[12px] font-bold text-textMain mb-2">Username</label>
        <div className="relative">
          <input 
            type="text" 
            value={data.username} 
            onChange={e => setData({...data, username: e.target.value.replace(/\s+/g, '')})} 
            className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-[14px] pl-8 pr-4 py-3 text-[14px] font-medium text-textMain focus:outline-none focus:border-brand focus:shadow-[0_0_10px_rgba(10,132,255,0.2)] transition-all" 
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-medium">@</span>
        </div>
      </div>
      <div>
        <label className="block text-[12px] font-bold text-textMain mb-2">Bio</label>
        <div className="relative">
          <textarea 
            value={data.bio} 
            onChange={e => {if(e.target.value.length <= 160) setData({...data, bio: e.target.value})}} 
            rows={3} 
            placeholder="Tell us about yourself..." 
            className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-[14px] px-4 py-3 text-[14px] text-textMain focus:outline-none focus:border-brand focus:shadow-[0_0_10px_rgba(10,132,255,0.2)] transition-all resize-none"
          ></textarea>
          <span className="absolute bottom-3 right-4 text-[10px] text-muted">{data.bio.length}/160</span>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button onClick={onCancel} className="px-5 py-3 rounded-xl text-[13px] font-semibold text-textMain hover:bg-surface2 transition-all">Cancel</button>
        <button onClick={() => onSave(data)} className="px-6 py-3 rounded-xl text-[13px] font-bold bg-brand hover:bg-brand/90 text-white shadow-[0_0_15px_rgba(10,132,255,0.25)] transition-all">Save Changes</button>
      </div>
    </div>
  );
}

function RulesForm({ initialData, onSave, onCancel }: any) {
  const [data, setData] = useState(initialData);

  return (
    <div className="space-y-4">
      <InputField label="Max Risk / Trade (e.g. 0.5%)" val={data.maxRiskPerTrade} onChange={(v: string) => setData({...data, maxRiskPerTrade: v})} />
      <InputField label="Max Trades / Day (e.g. 2)" val={data.maxTradesPerDay} onChange={(v: string) => setData({...data, maxTradesPerDay: v})} />
      <InputField label="Max Daily Loss (e.g. 1%)" val={data.maxDailyLoss} onChange={(v: string) => setData({...data, maxDailyLoss: v})} />
      <InputField label="Losing Streak (e.g. 3 in a row)" val={data.losingStreak} onChange={(v: string) => setData({...data, losingStreak: v})} />
      <InputField label="Risk / Reward (e.g. 1:4)" val={data.riskReward} onChange={(v: string) => setData({...data, riskReward: v})} />
      
      <div className="flex justify-end gap-3 pt-4">
        <button onClick={onCancel} className="px-5 py-3 rounded-xl text-[13px] font-semibold text-textMain hover:bg-surface2 transition-all">Cancel</button>
        <button onClick={() => onSave(data)} className="px-6 py-3 rounded-xl text-[13px] font-bold bg-brand text-white shadow-[0_0_15px_rgba(10,132,255,0.25)] transition-all">Save Rules</button>
      </div>
    </div>
  );
}

function PreferencesForm({ initialData, onSave, onCancel }: any) {
  const [sessStr, setSessStr] = useState(initialData.sessions.join(', '));
  const [pairStr, setPairStr] = useState(initialData.favoritePairs.join(', '));

  const handleSave = () => {
    onSave({
      sessions: sessStr.split(',').map((s:string) => s.trim()).filter(Boolean),
      favoritePairs: pairStr.split(',').map((s:string) => s.trim().toUpperCase()).filter(Boolean)
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-[12px] font-bold text-textMain mb-2">Sessions (Comma separated)</label>
        <input 
          type="text" 
          placeholder="e.g. GB London, US New York" 
          value={sessStr} 
          onChange={e => setSessStr(e.target.value)} 
          className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-[14px] px-4 py-3 text-[13px] font-medium text-textMain focus:outline-none focus:border-brand focus:shadow-[0_0_10px_rgba(10,132,255,0.2)] transition-colors" 
        />
      </div>
      <div>
        <label className="block text-[12px] font-bold text-textMain mb-2">Favorite Pairs (Comma separated)</label>
        <input 
          type="text" 
          placeholder="e.g. EUR/USD, XAU/USD" 
          value={pairStr} 
          onChange={e => setPairStr(e.target.value)} 
          className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-[14px] px-4 py-3 text-[13px] font-medium text-textMain focus:outline-none focus:border-brand focus:shadow-[0_0_10px_rgba(10,132,255,0.2)] transition-colors uppercase" 
        />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button onClick={onCancel} className="px-5 py-3 rounded-xl text-[13px] font-semibold text-textMain hover:bg-surface2 transition-all">Cancel</button>
        <button onClick={handleSave} className="px-6 py-3 rounded-xl text-[13px] font-bold bg-brand text-white shadow-[0_0_15px_rgba(10,132,255,0.25)] transition-all">Save Preferences</button>
      </div>
    </div>
  );
}

function InputField({ label, val, onChange }: { label: string, val: string, onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[12px] font-bold text-textMain mb-2">{label}</label>
      <input 
        type="text" 
        value={val} 
        onChange={e => onChange(e.target.value)} 
        className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-[14px] px-4 py-2.5 text-[14px] font-medium text-textMain focus:outline-none focus:border-brand focus:shadow-[0_0_10px_rgba(10,132,255,0.2)] transition-all" 
      />
    </div>
  );
}

const ClockIcon = ({className}: {className?: string}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const DollarIcon = ({className}: {className?: string}) => <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;