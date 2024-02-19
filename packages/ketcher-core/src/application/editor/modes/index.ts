import { FlexMode } from './FlexMode';
import { SequenceMode } from './SequenceMode';
import { SnakeMode } from './SnakeMode';

export * from './FlexMode';
export * from './SequenceMode';
export * from './SnakeMode';
export * from './types';

export const modesMap = {
  'flex-layout-mode': FlexMode,
  'snake-layout-mode': SnakeMode,
  'sequence-layout-mode': SequenceMode,
};
