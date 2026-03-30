export interface AppInstance {
  id: string;
  appType: 'browser' | 'notepad' | 'ticTacToe';
  state: 'closed' | 'minimized' | 'open';
  position: { x: number; y: number };
  logo: string;
  isFullScreen?: boolean;
  title?: string;
  content?: string;
}
