import { MonomerType } from '@utils/types';
import { createMonomerGroup } from './common';

export const Phosphate = createMonomerGroup(MonomerType.Phosphate, {
  Test_6_Ph: {
    alias: 'Test-6-Ph',
    testId: 'Test-6-Ph___Test-6-AP-Phosphate',
  },
  P: { alias: 'P', testId: 'P___Phosphate' },
  Phosphate: {
    alias: 'Phosphate',
    testId: 'Phosphate___Phosphate Test monomer',
  },
  NoPhosphate: {
    alias: 'No Phosphate On The Canvas',
    testId: 'No Such Phosphate In The Library',
  },
  _3SS6: {
    alias: '3SS6',
    testId: "3SS6___Thiol Modifier 6 S-S (3' end)",
  },
  AmC6: { alias: 'AmC6', testId: 'AmC6___6-aminohexyl dihydrogen phosphate' },
  AmC12: {
    alias: 'AmC12',
    testId: 'AmC12___12-aminododecyl dihydrogen phosphate',
  },
  sP: { alias: 'sP', testId: 'sP___Phosporothioate' },
  sP_: { alias: 'sP-', testId: 'sP-___Dihydrogen phosphorothioate' },
  bP: { alias: 'bP', testId: 'bP___Boranophosphate' },
  moen: { alias: 'moen', testId: 'moen___2-Methoxyethylamino' },
  mn: { alias: 'mn', testId: 'mn___Methylamino' },
  msp: { alias: 'msp', testId: 'msp___Methylphosphonothioic acid' },
  ibun: { alias: 'ibun', testId: 'ibun___Isobutylamino' },

  // for library update test, doesn't exist initially
  Phosphate1: {
    alias: 'Phosphate1',
    testId: 'Phosphate1___Phosphate1',
  },
  _Phosphate1: {
    alias: '_Phosphate1',
    testId: '_Phosphate1____Phosphate1',
  },
});

export type PhosphatesType = typeof Phosphate;
