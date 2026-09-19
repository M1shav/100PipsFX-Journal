export interface ChecklistItem {
  text: string;
  checked: boolean;
}

export interface JournalData {
  preTrade: string;
  postTrade: string;
  emotions: string;
  lessons: string;
  risk: number;
  reward: number;
  rating: number;
  tags: string;
  checklist: ChecklistItem[];
}

export interface Trade {
  id: string;
  date: string;
  pair: string;
  direction: 'LONG' | 'SHORT';
  entry: number;
  exit: number;
  lotSize: number;
  pnl: number;
  status: 'OPEN' | 'CLOSED';
  stopLoss?: number;
  takeProfit?: number;
  commission?: number;
  swap?: number;
  journal?: JournalData;
}