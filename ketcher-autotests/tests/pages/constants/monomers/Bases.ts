import { MonomerType } from '@utils/types';
import { createMonomerGroup } from './common';

export const Base = createMonomerGroup(MonomerType.Base, {
  A: { alias: 'A', testId: 'A___Adenine' },
  _2imen2: {
    alias: '2imen2',
    testId: '2imen2___N2-[(Imidazo-2-yl)ethylamino]adenine',
  },
  _4ime6A: {
    alias: '4ime6A',
    testId: '4ime6A___N6-[2-(4-Imidazoyl)ethyl]adenine',
  },
  _5meC: { alias: '5meC', testId: '5meC___5-methylcytosine' },
  Base: {
    alias: 'Base',
    testId: 'Base___Base Test monomer',
  },
  NoBase: {
    alias: 'No Base On The Canvas',
    testId: 'No Such Base In The Library',
  },
  baA: { alias: 'baA', testId: 'baA___N6-benzyladenine' },
  C: { alias: 'C', testId: 'C___Cytosine' },
  cpmA: {
    alias: 'cpmA',
    testId: 'cpmA___N6-cyclopropylmethyladenine',
  },
  c3A: { alias: 'c3A', testId: 'c3A___3-Deazaadenine' },
  c7A: { alias: 'c7A', testId: 'c7A___7-Deazaadenine' },
  c7io7n: {
    alias: 'c7io7n',
    testId: 'c7io7n___7-Deaza-7-iodo-2-aminoadenine',
  },
  cdaC: {
    alias: 'cdaC',
    testId: 'cdaC___5-cyclopropyl-4-dimethylamino-cytosine',
  },
  clA: { alias: 'clA', testId: 'clA___T-clamp OMe' },
  dabA: {
    alias: 'dabA',
    testId: 'dabA___7-deaza-8-aza-7-bromo-2-amino-Adenine',
  },
  G: { alias: 'G', testId: 'G___Guanine' },
  In: { alias: 'In', testId: 'In___Inosine' },
  isoG: { alias: 'isoG', testId: 'isoG___Isoguanine' },
  oC64m5: {
    alias: 'oC64m5',
    testId: 'oC64m5___4-Hexan-6-ol-5-methylcytosine',
  },
  nC6n2G: {
    alias: 'nC6n2G',
    testId: 'nC6n2G___6-Aminohexyl-2-aminoguanine',
  },
  nC6n5C: { alias: 'nC6n5C', testId: 'nC6n5C___Amino-Modier C6 dC' },
  nC6n5U: { alias: 'nC6n5U', testId: 'nC6n5U___Amino-Modier C6 dT' },
  nC6n8A: {
    alias: 'nC6n8A',
    testId: 'nC6n8A___6-Aminohexyl-8-aminoadenine',
  },
  meA: { alias: 'meA', testId: 'meA___N6-methyladenine' },
  U: { alias: 'U', testId: 'U___Uracil' },
  T: { alias: 'T', testId: 'T___Thymine' },
  cl6pur: { alias: 'cl6pur', testId: 'cl6pur___6-Chloropurine' },
  DNA_N: {
    alias: 'N',
    testId: '_A___Adenine_C___Cytosine_G___Guanine_T___Thymine',
  },
  DNA_B: {
    alias: 'B',
    testId: '_C___Cytosine_G___Guanine_T___Thymine',
  },
  DNA_D: {
    alias: 'D',
    testId: '_A___Adenine_G___Guanine_T___Thymine',
  },
  DNA_H: {
    alias: 'H',
    testId: '_A___Adenine_C___Cytosine_T___Thymine',
  },
  DNA_K: { alias: 'K', testId: '_G___Guanine_T___Thymine' },
  DNA_W: { alias: 'W', testId: '_A___Adenine_T___Thymine' },
  DNA_Y: { alias: 'Y', testId: '_C___Cytosine_T___Thymine' },
  RNA_N: {
    alias: 'N',
    testId: '_A___Adenine_C___Cytosine_G___Guanine_U___Uracil',
  },
  RNA_B: {
    alias: 'B',
    testId: '_C___Cytosine_G___Guanine_U___Uracil',
  },
  RNA_D: {
    alias: 'D',
    testId: '_A___Adenine_G___Guanine_U___Uracil',
  },
  RNA_H: {
    alias: 'H',
    testId: '_A___Adenine_C___Cytosine_U___Uracil',
  },
  RNA_K: { alias: 'K', testId: '_G___Guanine_U___Uracil' },
  RNA_W: { alias: 'W', testId: '_A___Adenine_U___Uracil' },
  RNA_Y: { alias: 'Y', testId: '_C___Cytosine_U___Uracil' },
  M: { alias: 'M', testId: '_A___Adenine_C___Cytosine' },
  R: { alias: 'R', testId: '_A___Adenine_G___Guanine' },
  S: { alias: 'S', testId: '_C___Cytosine_G___Guanine' },
  V: { alias: 'V', testId: '_A___Adenine_C___Cytosine_G___Guanine' },
  e6A: { alias: 'e6A', testId: 'e6A___2-amino-6-etoxypurine' },
  h456UR: {
    alias: 'h456UR',
    testId: 'h456UR___(4R)-tetrahydro-4-hydroxy-1H-pyrimidin-2-one',
  },
  // for library update test, doesn't exist initially
  Base1: { alias: 'Base1', testId: 'Base1___Base1' },
  _Base1: { alias: '_Base1', testId: '_Base1____Base1' },
  BaseX: { alias: 'BaseX', testId: 'BaseX___BaseX' },
});

export type BasesType = typeof Base;
