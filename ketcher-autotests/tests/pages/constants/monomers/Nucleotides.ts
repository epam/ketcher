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
  _3Puro: { alias: '3Puro', testId: "3Puro___3' Puromycin" },
  AmMC6T: {
    alias: 'AmMC6T',
    testId: 'AmMC6T___Amino Modifier C6 dT',
  },
  Nucleotide: {
    alias: 'Nucleotide',
    testId: 'Nucleotide___Nucleotide Test monomer',
  },
  NoNucleotide: {
    alias: 'No Nucleotide On The Canvas',
    testId: 'No Such Nucleotide In The Library',
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
  biodT: { alias: 'biodT', testId: 'biodT___Biotin dT' },
  FldT: { alias: 'FldT', testId: 'FldT___Fluorescein dT' },
  d2AmPr: {
    alias: 'd2AmPr',
    testId: "d2AmPr___2-Aminopurine-2'-deoxyriboside",
  },
  _5MidC: {
    alias: '5MidC',
    testId: "5MidC___5-methylisocytosine-2'-deoxyriboside",
  },
  _5Ade: { alias: '5Ade', testId: "5Ade___5' Adenylation" },
  InvddT: { alias: 'InvddT', testId: 'InvddT___Inverted Dideoxy-T' },
  _5OctdU: { alias: '5OctdU', testId: '5OctdU___5-Octadiynyl dU' },
  _5TAMdT: {
    alias: '5TAMdT',
    testId: '5TAMdT___5-Carboxytetramethylrhodamine dT',
  },
  _8odG: { alias: '8odG', testId: "8odG___8-Oxo-2'-deoxyguanosine" },
  BHQ_1dT: { alias: 'BHQ-1dT', testId: 'BHQ-1dT___dT Black Hole Quencher 1' },
  BHQ_2dT: { alias: 'BHQ-2dT', testId: 'BHQ-2dT___dT Black Hole Quencher 2' },
  AzddT: { alias: 'AzddT', testId: 'AzddT___dT Azide' },
  BiAzdT: { alias: 'BiAzdT', testId: 'BiAzdT___dT Biotin Azide' },
  AzTAMdT: { alias: 'AzTAMdT', testId: 'AzTAMdT___dT 5-TAMRA Azide' },
  FAMKdT: { alias: 'FAMKdT', testId: 'FAMKdT___dT 6-FAM Azide' },
  Dab: { alias: 'Dab', testId: 'Dab___d5meC Dabcyl' },
  ddC: { alias: 'ddC', testId: 'ddC___Dideoxycytidine' },
  _3InvdT: { alias: '3InvdT', testId: "3InvdT___3' Inverted dT" },
});

export type NucleotidesType = typeof Nucleotide;
