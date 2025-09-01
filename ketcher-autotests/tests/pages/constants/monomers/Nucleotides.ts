import { MonomerType } from '@utils/types';
import { createMonomerGroup } from './common';

export const Nucleotide = createMonomerGroup(MonomerType.Nucleotide, {
  _2_damdA: {
    alias: '2-damdA',
    testId: '2-damdA___2,6-Diaminopurine',
  },
  _5hMedC: { alias: '5hMedC', testId: '5hMedC___Hydroxymethyl dC' },
  Super_G: {
    alias: 'Super-G',
    testId: 'Super-G___8-aza-7-deazaguanosine',
  },
  AmMC6T: {
    alias: 'AmMC6T',
    testId: 'AmMC6T___Amino Modifier C6 dT',
  },
  Nucleotide: {
    alias: 'Nucleotide',
    testId: 'Nucleotide___Nucleotide Test monomer',
  },
  Super_T: {
    alias: 'Super-T',
    testId: 'Super-T___5-hydroxybutynl-2’-deoxyuridine',
  },
  _5Br_dU: {
    alias: '5Br-dU',
    testId: '5Br-dU___5-Bromo-deoxyuridine',
  },
  _5NitInd: { alias: '5NitInd', testId: '5NitInd___5-Nitroindole' },
});

export type NucleotidesType = typeof Nucleotide;
