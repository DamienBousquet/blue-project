export interface Shortcut {
  id: string;
  title: string;
  type: string;
  x: number;
  y: number;
  oldX: number;
  oldY: number;
  isSelected?: boolean;
}
