import type { AtomAttributes, Bond, RGroupAttributes } from 'ketcher-core';

export type EditorMessage = {
  info?: string | false;
  error?: unknown;
};

export type EditorTooltip = {
  message: string;
};

export type EditorCursor =
  | {
      status: 'enable';
      cursorPosition: { clientX: number; clientY: number };
    }
  | { status: 'move' | 'mouseover' | 'leave' | 'disable' };

export type ElementEditResult = Partial<AtomAttributes> & {
  content?: string;
};

export type BondEditResult = Bond;

export type RGroupEditResult = RGroupAttributes & {
  label?: number;
};

export type EnhancedStereoEditParams = {
  stereoLabel: string | null | undefined;
};

export interface SGroupDialogResult {
  type?: string;
  attrs: { context?: string; expanded?: boolean; [key: string]: unknown };
}

export type RemoveFGParams = {
  fgIds: number[];
};
