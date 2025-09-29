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
  AmC6: { alias: 'AmC6', testId: 'AmC6___6-aminohexyl dihydrogen phosphate' },
  AmC12: {
    alias: 'AmC12',
    testId: 'AmC12___12-aminododecyl dihydrogen phosphate',
  },
  sP_: { alias: 'sP-', testId: 'sP-___Dihydrogen phosphorothioate' },
  bP: { alias: 'bP', testId: 'bP___Boranophosphate' },
  moen: { alias: 'moen', testId: 'moen___2-Methoxyethylamino' },
  mn: { alias: 'mn', testId: 'mn___Methylamino' },
  msp: { alias: 'msp', testId: 'msp___Methylphosphonothioic acid' },
  ibun: { alias: 'ibun', testId: 'ibun___Isobutylamino' },
});

export type PhosphatesType = typeof Phosphate;
