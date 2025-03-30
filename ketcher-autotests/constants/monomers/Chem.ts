import { MonomerType } from '@utils/types';
import { createMonomerGroup } from './common';

export const Chem = createMonomerGroup(MonomerType.Sugar, {
  _4aPEGMal: {
    alias: '4aPEGMal',
    testId: '4aPEGMal___4-Arm PEG-Maleimide',
  },
  _4FB: { alias: '4FB', testId: '4FB___4-Formylbenzamide' },
  A6OH: { alias: 'A6OH', testId: 'A6OH___6-amino-hexanol' },
  Az: { alias: 'Az', testId: 'Az___4-azidobutyric acid' },
  B7: { alias: 'B7', testId: 'B7___Biotin' },
  DOTA: { alias: 'DOTA', testId: 'DOTA___Tetraxetan' },
  EG: { alias: 'EG', testId: 'EG___Ethylene Glycol' },
  F1: { alias: 'F1', testId: '' },
  fisL: { alias: 'fisL', testId: 'flsL___Lactone fluorescein' },
  fisQ: { alias: 'fisQ', testId: 'flsQ___P-quinoid fluorescein' },
  iMe_dC: { alias: 'iMe-dC', testId: '' },
  hxy: { alias: 'hxy', testId: 'hxy___5-hexyn-1-ol' },
  Mal: { alias: 'Mal', testId: 'Mal___Maleimide' },
  MCC: {
    alias: 'MCC',
    testId: 'MCC___4-(N-maleimidomethyl)cyclohexane-1-carboxylate',
  },
  PEG_2: { alias: 'PEG-2', testId: 'PEG-2___Diethylene Glycol' },
  PEG_4: { alias: 'PEG-4', testId: 'PEG-4___Tetraethylene glycol' },
  PEG_6: { alias: 'PEG-6', testId: 'PEG-6___Hexaethylene glycol' },
  sDBL: { alias: 'sDBL', testId: 'sDBL___Symmetric Doubler' },
  SMCC: { alias: 'SMCC', testId: 'SMCC___SMCC' },
  SMPEG2: { alias: 'SMPEG2', testId: 'SMPEG2___SM(PEG)2' },
  SS3: { alias: 'SS3', testId: 'SS3___Dipropanol-disulfide' },
  Test_6_Ch: {
    alias: 'Test-6-Ch',
    testId: 'Test-6-Ch___Test-6-AP-Chem',
  },
});
