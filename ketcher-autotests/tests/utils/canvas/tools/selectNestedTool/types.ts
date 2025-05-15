import { MicroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';

/* eslint-disable no-magic-numbers */
export const TYPE_SELECT = 'select';
export const TYPE_TRANSFORM = 'transform';
export const TYPE_REACTION_ARROW = 'reactionarrow';
export const TYPE_REACTION = 'reaction';

export const DEFAULT_BONDS_MAIN_BUTTON_TEST_ID = 'bonds';

type bondToolField = [presses: number, domElementId: MicroBondType];

type bondToolType = {
  [key: string]: bondToolField;
};

export const BondTool: bondToolType = {
  SINGLE: [1, MicroBondType.Single],
  DOUBLE: [2, MicroBondType.Double],
  TRIPPLE: [3, MicroBondType.Triple],
  ANY: [4, MicroBondType.Any],
  AROMATIC: [5, MicroBondType.Aromatic],
  SINGLE_DOUBLE: [6, MicroBondType.SingleDouble],
  SINGLE_AROMATIC: [7, MicroBondType.SingleAromatic],
  DOUBLE_AROMATIC: [8, MicroBondType.DoubleAromatic],
  DATIVE: [9, MicroBondType.Dative],
  HYDROGEN: [10, MicroBondType.Hydrogen],
  UP: [11, MicroBondType.SingleUp],
  DOWN: [12, MicroBondType.SingleDown],
  UP_DOWN: [13, MicroBondType.SingleUpDown],
  CROSSED: [14, MicroBondType.DoubleCisTrans],
};
