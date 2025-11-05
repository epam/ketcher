import { MonomerType } from '@utils/types';
import { createMonomerGroup } from './common';

export const Peptide = createMonomerGroup(MonomerType.Peptide, {
  A: { alias: 'A', testId: 'A___Alanine' },
  Aad: { alias: 'Aad', testId: 'Aad___L-2-aminoadipic acid' },
  Ala_al: {
    alias: 'Ala-al',
    testId: 'Ala-al___(2S)-2-aminopropanal',
  },
  AminoAcid: {
    alias: 'AminoAcid',
    testId: 'AminoAcid___Amino Acid Test monomer',
  },
  _1Nal: { alias: '1Nal', testId: '1Nal___3-(1-naphthyl)-alanine' },
  _2Nal: { alias: '2Nal', testId: '2Nal___3-(2-naphthyl)-alanine' },
  _NHBn: {
    alias: '-NHBn',
    testId: '-NHBn___C-Terminal benzylamino',
  },
  Bal: { alias: 'Bal', testId: '' },
  bAla: { alias: 'bAla', testId: 'bAla___beta-Alanine' },
  Boc_: {
    alias: 'Boc-',
    testId: 'Boc-___N-Terminal tert-butyloxycarbonyl',
  },
  C: { alias: 'C', testId: 'C___Cysteine' },
  Cys_Bn: { alias: 'Cys_Bn', testId: 'Cys_Bn___S-benzylcysteine' },
  Chg: { alias: 'Chg', testId: 'Chg___Alpha-cyclohexylglycine' },
  D: { alias: 'D', testId: 'D___Aspartic acid' },
  DACys: { alias: 'DACys', testId: 'DACys___Deamino-Cysteine' },
  dA: { alias: 'dA', testId: 'dA___D-Alanine' },
  dC: { alias: 'dC', testId: 'dC___D-Cysteine' },
  D_aIle: { alias: 'D-aIle', testId: 'D-aIle___D-allo-Isoleucine' },
  DHis1B: {
    alias: 'DHis1B',
    testId: 'DHis1B___(2R)-2-amino-3-(1-benzyl-1H-imidazol-4-yl)propanoic acid',
  },
  DTrp2M: {
    alias: 'DTrp2M',
    testId: 'DTrp2M___2-methyl-D-tryptophan',
  },
  dU: { alias: 'dU', testId: 'dU___D-selenocysteine' },
  D_2Nal: {
    alias: 'D-2Nal',
    testId: 'D-2Nal___D-3-(2-naphthyl)-alanine',
  },
  D_Hyp: {
    alias: 'D-Hyp',
    testId: 'D-Hyp___trans-4-hydroxy-D-proline',
  },
  D_OAla: { alias: 'D-OAla', testId: 'D-OAla___D-Lactic acid' },
  E: { alias: 'E', testId: 'E___Glutamic acid' },
  Edc: { alias: 'Edc', testId: 'Edc___S-ethylthiocysteine' },
  F: { alias: 'F', testId: 'F___Phenylalanine-ethylthiocysteine' },
  K: { alias: 'K', testId: 'K___Lysine' },
  meC: { alias: 'meC', testId: 'meC___N-Methyl-Cysteine' },
  meD: { alias: 'meD', testId: 'meD___N-Methyl-Aspartic acid' },
  meE: { alias: 'meE', testId: 'meE___N-Methyl-Glutamic acid' },
  meM: { alias: 'meM', testId: 'meM___N-Methyl-Methionine' },
  meR: { alias: 'meR', testId: 'meR___N-Methyl-Arginine' },
  meS: { alias: 'meS', testId: 'meS___N-Methyl-Serine' },
  Me_: { alias: 'Me-', testId: 'Me-___N-Terminal methyl' },
  Nal: { alias: 'Nal', testId: '' },
  LysiPr: {
    alias: 'LysiPr',
    testId: 'LysiPr___(2S)-2-amino-6-[(propan-2-yl)amino]hexanoic acid',
  },
  O: { alias: 'O', testId: 'O___Pyrrolysine' },
  Peptide: {
    alias: 'Peptide',
    testId: 'Peptide___Peptide Test monomer',
  },
  Phe_ol: { alias: 'Phe-ol', testId: 'Phe-ol___L-phenylalaninol' },
  SertBu: {
    alias: 'SertBu',
    testId: 'SertBu___O-tert-Butyl-L-serine',
  },
  Test_6_P: {
    alias: 'Test-6-P',
    testId: 'Test-6-P___Test-6-AP-Peptide',
  },
  Tml: { alias: 'Tml', testId: '' },
  TyrabD: {
    alias: 'TyrabD',
    testId: 'TyrabD___(2E)-2-amino-3-(4-methoxyphenyl)prop-2-enoic acid',
  },
  Tza: { alias: 'Tza', testId: 'Tza___3-(4-Thiazolyl)-alanine' },
  U: { alias: 'U', testId: 'U___Selenocysteine' },
  Phe4Me: {
    alias: 'Phe4Me',
    testId: 'Phe4Me___p-Methylphenylalanine',
  },
  Hcy: { alias: 'Hcy', testId: 'Hcy___homocysteine' },
  Hhs: { alias: 'Hhs', testId: 'Hhs___homohistidine' },
  His1Me: {
    alias: 'His1Me',
    testId: 'His1Me___1-methyl-L-histidine',
  },
  X: {
    alias: 'X',
    testId:
      '_A___Alanine_C___Cysteine_D___Aspartic acid_E___Glutamic acid_F___Phenylalanine_G___Glycine_H___' +
      'Histidine_I___Isoleucine_K___Lysine_L___Leucine_M___Methionine_N___Asparagine_O___Pyrrolysine_P__' +
      '_Proline_Q___Glutamine_R___Arginine_S___Serine_T___Threonine_U___Selenocysteine_V___Valine_W___Tryptophan_Y___Tyrosine',
  },
  _Am: { alias: '-Am', testId: '-Am___C-Terminal amino' },
  Ac_: { alias: 'Ac-', testId: 'Ac-___N-Terminal acetyl' },
  B: { alias: 'B', testId: '_D___Aspartic acid_N___Asparagine' },
  J: { alias: 'J', testId: '_L___Leucine_I___Isoleucine' },
  Z: { alias: 'Z', testId: '_E___Glutamic acid_Q___Glutamine' },
  // for library update test, doesn't exist initially
  _Peptide1: {
    alias: '_Peptide1',
    testId: '_Peptide1____Peptide1',
  },
  A2: {
    alias: 'A2',
    testId: 'A2___Ala',
  },
});

export type PeptidesType = typeof Peptide;
