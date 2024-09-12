import { BaseMode } from 'application/editor/modes/BaseMode';
import { SequenceMode } from 'application/editor';

export type LayoutMode =
  | 'flex-layout-mode'
  | 'snake-layout-mode'
  | 'sequence-layout-mode';

export const DEFAULT_LAYOUT_MODE: LayoutMode = 'flex-layout-mode';

export function isSequenceMode(mode: BaseMode): mode is SequenceMode {
  return mode instanceof SequenceMode;
}
