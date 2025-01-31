import { Monomer } from '@utils/types';

export const Sugars = {
  R: { alias: 'R', testId: 'R___Ribose' } as Monomer,
  _3A6: { alias: '3A6', testId: "3A6___6-amino-hexanol (3' end)" } as Monomer,
  _3SS6: {
    alias: '3SS6',
    testId: "3SS6___Thiol Modifier 6 S-S (3' end)",
  } as Monomer,
  _5cGT: {
    alias: '5cGT',
    testId: "5cGT___2-(methylamino)acetamidate (5' end)",
  } as Monomer,
  _5formD: {
    alias: '5formD',
    testId: '5formD___5-Formyl-2-deoxyribose',
  } as Monomer,
  _12ddR: { alias: '12ddR', testId: "12ddR___1',2'-dideoxyribose" } as Monomer,
  _25d3r: {
    alias: '25d3r',
    testId: '25d3r___3-Deoxyribose (2,5 connectivity)',
  } as Monomer,
  _25R: { alias: '25R', testId: '25R___Ribose (2,5 connectivity)' } as Monomer,
  _25mo3r: {
    alias: '25mo3r',
    testId: '25mo3r___3-O-Methylribose (2,5 connectivity)',
  } as Monomer,
};
