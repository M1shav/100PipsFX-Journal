import React from 'react';

// Maps standard currency codes to FlagCDN country codes
const FLAG_MAP: Record<string, string> = {
  'USD': 'us', 'EUR': 'eu', 'GBP': 'gb', 'JPY': 'jp',
  'AUD': 'au', 'NZD': 'nz', 'CAD': 'ca', 'CHF': 'ch',
  'SGD': 'sg', 'HKD': 'hk', 'NOK': 'no', 'SEK': 'se',
  'DKK': 'dk', 'ZAR': 'za', 'TRY': 'tr', 'MXN': 'mx',
  'CNH': 'cn', 'PLN': 'pl', 'CZK': 'cz', 'HUF': 'hu',
  'ILS': 'il', 'THB': 'th'
};

const CRYPTO_COINS = new Set([
  'BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'ADA', 'XRP', 'AVAX', 'MATIC', 'DOGE'
]);

const getFlagUrl = (currency: string) => {
  const countryCode = FLAG_MAP[currency];
  return countryCode ? `https://flagcdn.com/w40/${countryCode}.png` : '';
};

// Uses a reliable open-source crypto icon CDN
const getCryptoUrl = (coin: string) => 
  `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/svg/color/${coin.toLowerCase()}.svg`;

// Bright yellow/gold XAUUSD icon resized to match the visual footprint of Forex flags
const XauIcon = () => (
  <div className="w-8 h-8 flex items-center justify-center shrink-0">
    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br from-[#FFD700] to-[#FFAB00] border border-[#FFA000] shadow-sm overflow-hidden relative">
      {/* Subtle sparkle effects */}
      <div className="absolute top-1 left-1.5 w-1 h-1 bg-white rounded-full opacity-80"></div>
      <div className="absolute top-2 left-1 w-[1.5px] h-[1.5px] bg-white rounded-full opacity-90"></div>
      
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-0.5 relative z-10">
        {/* Bottom Right Gold Bar */}
        <path d="M16.5 9L21.5 12L16.5 15L11.5 12L16.5 9Z" fill="#FFFFFF" />
        <path d="M11.5 12V16L16.5 19V15L11.5 12Z" fill="#FFC107" />
        <path d="M21.5 12V16L16.5 19V15L21.5 12Z" fill="#FF8F00" />
        
        {/* Bottom Left Gold Bar */}
        <path d="M7.5 9L12.5 12L7.5 15L2.5 12L7.5 9Z" fill="#FFFFFF" />
        <path d="M2.5 12V16L7.5 19V15L2.5 12Z" fill="#FFC107" />
        <path d="M12.5 12V16L7.5 19V15L12.5 12Z" fill="#FF8F00" />

        {/* Top Gold Bar */}
        <path d="M12 4L17 7L12 10L7 7L12 4Z" fill="#FFFFFF" />
        <path d="M7 7V11L12 14V10L7 7Z" fill="#FFE082" />
        <path d="M17 7V11L12 14V10L17 7Z" fill="#FFB300" />
      </svg>
    </div>
  </div>
);

// Silver XAGUSD icon matching the XAU style and footprint
const XagIcon = () => (
  <div className="w-8 h-8 flex items-center justify-center shrink-0">
    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-gradient-to-br from-[#E0E0E0] to-[#9E9E9E] border border-[#BDBDBD] shadow-sm overflow-hidden relative">
      {/* Subtle sparkle effects */}
      <div className="absolute top-1 left-1.5 w-1 h-1 bg-white rounded-full opacity-90"></div>
      <div className="absolute top-2 left-1 w-[1.5px] h-[1.5px] bg-white rounded-full opacity-100"></div>
      
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mt-0.5 relative z-10">
        {/* Bottom Right Silver Bar */}
        <path d="M16.5 9L21.5 12L16.5 15L11.5 12L16.5 9Z" fill="#FFFFFF" />
        <path d="M11.5 12V16L16.5 19V15L11.5 12Z" fill="#E0E0E0" />
        <path d="M21.5 12V16L16.5 19V15L21.5 12Z" fill="#9E9E9E" />
        
        {/* Bottom Left Silver Bar */}
        <path d="M7.5 9L12.5 12L7.5 15L2.5 12L7.5 9Z" fill="#FFFFFF" />
        <path d="M2.5 12V16L7.5 19V15L2.5 12Z" fill="#E0E0E0" />
        <path d="M12.5 12V16L7.5 19V15L12.5 12Z" fill="#9E9E9E" />

        {/* Top Silver Bar */}
        <path d="M12 4L17 7L12 10L7 7L12 4Z" fill="#FFFFFF" />
        <path d="M7 7V11L12 14V10L7 7Z" fill="#F5F5F5" />
        <path d="M17 7V11L12 14V10L17 7Z" fill="#BDBDBD" />
      </svg>
    </div>
  </div>
);

export const PairIcon = ({ symbol }: { symbol: string }) => {
  if (!symbol) return <FallbackIcon symbol="?" />;

  const cleanSymbol = symbol.trim().toUpperCase();

  // 1. Metals / Commodities 
  if (cleanSymbol === 'XAUUSD') return <XauIcon />;
  if (cleanSymbol === 'XAGUSD') return <XagIcon />;

  const base = cleanSymbol.length >= 6 ? cleanSymbol.substring(0, 3) : '';
  const quote = cleanSymbol.length >= 6 ? cleanSymbol.substring(3, 6) : '';

  // 2. Crypto Pairs
  if (CRYPTO_COINS.has(base)) {
    return (
      <div className="w-8 h-8 flex items-center justify-center shrink-0">
        <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-surface2 border border-[#333]">
          <img src={getCryptoUrl(base)} alt={base} className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
        </div>
      </div>
    );
  }

  // 3. Forex Pairs (Overlapping Flags)
  if (FLAG_MAP[base] && FLAG_MAP[quote]) {
    return (
      <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
        {/* Base Currency (Left/Behind) */}
        <img 
          src={getFlagUrl(base)} 
          alt={base} 
          className="absolute left-0 w-5 h-5 rounded-full border-[1.5px] border-[#0A0A0A] object-cover z-0 bg-[#1a1a1a]" 
        />
        {/* Quote Currency (Right/Front) */}
        <img 
          src={getFlagUrl(quote)} 
          alt={quote} 
          className="absolute right-0 w-5 h-5 rounded-full border-[1.5px] border-[#0A0A0A] object-cover z-10 bg-[#1a1a1a]" 
        />
      </div>
    );
  }

  // 4. Fallback for unknown symbols
  return <FallbackIcon symbol={cleanSymbol} />;
};

const FallbackIcon = ({ symbol }: { symbol: string }) => (
  <div className="w-8 h-8 flex items-center justify-center shrink-0">
    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold shadow-sm bg-surface2 text-white border border-[#333]">
      {symbol.substring(0, 2)}
    </div>
  </div>
);

export default PairIcon;