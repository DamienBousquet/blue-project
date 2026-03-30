import { BrowserHistoryEntry } from './browser-history-entry.interface';

export interface BrowserTab {
  id: string;
  title: string;
  logoPath: string;
  url: string;
  isSelected: boolean;
  history: BrowserHistoryEntry[];
  historyIndex: number;
  app: string;
}
