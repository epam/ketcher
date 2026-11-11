import { hasTerminalPhosphate } from '../monomers';
import type { MonomerItemType } from 'domain/types';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { Sugar } from 'domain/entities/Sugar';
import { RNABase } from 'domain/entities/RNABase';
import { Phosphate } from 'domain/entities/Phosphate';
import { Peptide } from 'domain/entities/Peptide';
import { Struct } from 'domain/entities/struct';
import { KetMonomerClass } from 'domain/constants/monomers';

function makeMonomerItem(
  label: string,
  monomerClass: KetMonomerClass,
): MonomerItemType {
  return {
    label,
    props: {
      MonomerNaturalAnalogCode: label,
      MonomerClass: monomerClass,
    },
    struct: new Struct(),
  } as unknown as MonomerItemType;
}

function makeSugar() {
  const sugar = new Sugar(makeMonomerItem('R', KetMonomerClass.Sugar));
  sugar.attachmentPointsToBonds = { R1: null, R2: null, R3: null };
  return sugar;
}

function makeBase() {
  const base = new RNABase(makeMonomerItem('A', KetMonomerClass.Base));
  base.attachmentPointsToBonds = { R1: null };
  return base;
}

function makePhosphate() {
  const phosphate = new Phosphate(
    makeMonomerItem('P', KetMonomerClass.Phosphate),
  );
  phosphate.attachmentPointsToBonds = { R1: null, R2: null };
  return phosphate;
}

function makePeptide() {
  const peptide = new Peptide(makeMonomerItem('A', KetMonomerClass.AminoAcid));
  peptide.attachmentPointsToBonds = { R1: null, R2: null };
  return peptide;
}

// Connects R2 of the first monomer to R1 of the second one
function connectBackbone(first: BaseMonomer, second: BaseMonomer) {
  const bond = new PolymerBond(first, second);
  first.attachmentPointsToBonds.R2 = bond;
  second.attachmentPointsToBonds.R1 = bond;
}

function connectBase(sugar: Sugar, base: RNABase) {
  const bond = new PolymerBond(sugar, base);
  sugar.attachmentPointsToBonds.R3 = bond;
  base.attachmentPointsToBonds.R1 = bond;
}

// Builds a backbone from a pattern like 'RPRPR', where R is a sugar with a base
function makeRnaChain(pattern: string) {
  const monomers: BaseMonomer[] = [];
  let previous: BaseMonomer | undefined;

  pattern.split('').forEach((symbol) => {
    let current: BaseMonomer;
    if (symbol === 'R') {
      const sugar = makeSugar();
      const base = makeBase();
      connectBase(sugar, base);
      monomers.push(base);
      current = sugar;
    } else {
      current = makePhosphate();
    }
    monomers.push(current);
    if (previous) {
      connectBackbone(previous, current);
    }
    previous = current;
  });

  return monomers;
}

function makePeptideChain(length: number) {
  const monomers = Array.from({ length }, makePeptide);
  monomers.slice(1).forEach((monomer, index) => {
    connectBackbone(monomers[index], monomer);
  });

  return monomers;
}

describe('hasTerminalPhosphate', () => {
  it('returns true for a phosphate at the end of a chain', () => {
    expect(hasTerminalPhosphate(makeRnaChain('RPRPRP'))).toBe(true);
  });

  it('returns true for a phosphate at the start of a chain', () => {
    expect(hasTerminalPhosphate(makeRnaChain('PRPR'))).toBe(true);
  });

  it('returns false when phosphates are only between nucleotides', () => {
    expect(hasTerminalPhosphate(makeRnaChain('RPRPR'))).toBe(false);
  });

  it('returns false for a peptide chain', () => {
    expect(hasTerminalPhosphate(makePeptideChain(3))).toBe(false);
  });

  it('returns true when only one of several chains has a terminal phosphate', () => {
    expect(
      hasTerminalPhosphate([...makeRnaChain('RPRPR'), ...makeRnaChain('RPRP')]),
    ).toBe(true);
  });

  it('returns false for a cyclic chain', () => {
    const monomers = makeRnaChain('RPRP');
    const sugars = monomers.filter((monomer) => monomer instanceof Sugar);
    const lastPhosphate = monomers[monomers.length - 1];
    connectBackbone(lastPhosphate, sugars[0]);

    expect(hasTerminalPhosphate(monomers)).toBe(false);
  });

  it('returns false for an empty structure', () => {
    expect(hasTerminalPhosphate([])).toBe(false);
  });
});
