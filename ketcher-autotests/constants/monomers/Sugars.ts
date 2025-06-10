import { MonomerType } from '@utils/types';
import { createMonomerGroup } from './common';

export const Sugars = createMonomerGroup(MonomerType.Sugar, {
  R: { alias: 'R', testId: 'R___Ribose' },
  dR: { alias: 'dR', testId: 'dR___Deoxy-Ribose' },
  fR: { alias: 'fR', testId: "fR___2'-Fluoro-Ribose" },
  FMOE: {
    alias: 'FMOE',
    testId: "FMOE___2'-O-Tris-trifluoromethoxyethyl ribose",
  },
  _3A6: { alias: '3A6', testId: "3A6___6-amino-hexanol (3' end)" },
  _3SS6: {
    alias: '3SS6',
    testId: "3SS6___Thiol Modifier 6 S-S (3' end)",
  },
  _5A6: {
    alias: '5A6',
    testId: "5A6___6-amino-hexanol (5' end)",
  },
  _5cGT: {
    alias: '5cGT',
    testId: "5cGT___2-(methylamino)acetamidate (5' end)",
  },
  _5formD: {
    alias: '5formD',
    testId: '5formD___5-Formyl-2-deoxyribose',
  },
  _5R6Sm5: {
    alias: '5R6Sm5',
    testId: '5R6Sm5___5-(R)-Methyl-(S)-cEt BNA',
  },
  ALmecl: {
    alias: 'ALmecl',
    testId: 'ALmecl___alpha-L-Methylene cLNA',
  },
  _12ddR: { alias: '12ddR', testId: "12ddR___1',2'-dideoxyribose" },
  _25d3r: {
    alias: '25d3r',
    testId: '25d3r___3-Deoxyribose (2,5 connectivity)',
  },
  _25R: { alias: '25R', testId: '25R___Ribose (2,5 connectivity)' },
  _25mo3r: {
    alias: '25mo3r',
    testId: '25mo3r___3-O-Methylribose (2,5 connectivity)',
  },
  nC62r: {
    alias: 'nC62r',
    testId: 'nC62r___2-O-(6-aminohexyl)ribose',
  },
  UNA: {
    alias: 'UNA',
    testId: "UNA___2'-3'-Unlocked-ribose",
  },
});

export type SugarsType = typeof Sugars;
