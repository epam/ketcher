import { Phosphate } from 'domain/entities/Phosphate';
import { Sugar } from 'domain/entities/Sugar';
import { RNABase } from 'domain/entities/RNABase';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { type MonomerItemType, AttachmentPointName } from 'domain/types';
import { KetMonomerClass } from 'domain/constants/monomers';
import { Struct, Vec2 } from 'domain/entities';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import {
  getAntisenseTerminalPhosphateCount,
  isAntisenseTerminalPhosphateRun,
} from 'domain/helpers/monomers';

const makeItem = (
  monomerClass: KetMonomerClass,
  analog: string,
  isAntisense: boolean,
): MonomerItemType =>
  ({
    favorite: false,
    label: analog,
    props: {
      MonomerCaps: { R1: 'H', R2: 'OH', R3: 'H' },
      MonomerCode: analog,
      MonomerName: analog,
      MonomerType: monomerClass,
      MonomerClass: monomerClass,
      Name: analog,
      MonomerNaturalAnalogCode: analog,
    },
    struct: new Struct(),
    isAntisense,
  } as unknown as MonomerItemType);

const bond = (
  first: BaseMonomer,
  firstAp: AttachmentPointName,
  second: BaseMonomer,
  secondAp: AttachmentPointName,
) => {
  const polymerBond = new PolymerBond(first);
  polymerBond.setSecondMonomer(second);
  first.setBond(firstAp, polymerBond);
  second.setBond(secondAp, polymerBond);
};

const phosphate = (isAntisense = true) =>
  new Phosphate(makeItem(KetMonomerClass.Phosphate, 'P', isAntisense));

describe('antisense terminal phosphate helpers', () => {
  /**
   * Issue #6438: antisense terminal phosphates must be shown as "p" (or "pp"
   * when there is an adjacent phosphate) in sequence mode, while every other
   * phosphate keeps its default "@" representation. The decision is derived from
   * the monomer graph only, so flex mode / editing are not affected.
   */

  it('counts a single terminal antisense phosphate as one "p"', () => {
    const p = phosphate();
    p.moveAbsolute(new Vec2(0, 0));

    expect(isAntisenseTerminalPhosphateRun([p])).toBe(true);
    expect(getAntisenseTerminalPhosphateCount([p])).toBe(1);
  });

  it('counts two adjacent terminal antisense phosphates (single node) as "pp"', () => {
    const p1 = phosphate();
    const p2 = phosphate();
    p1.moveAbsolute(new Vec2(0, 0));
    p2.moveAbsolute(new Vec2(1, 0));
    // p1(R2) -> p2(R1); both chain ends are free (terminal run)
    bond(p1, AttachmentPointName.R2, p2, AttachmentPointName.R1);

    expect(isAntisenseTerminalPhosphateRun([p1, p2])).toBe(true);
    expect(getAntisenseTerminalPhosphateCount([p1, p2])).toBe(2);
  });

  it('counts a terminal phosphate adjacent to a nucleotide-absorbed phosphate as "pp"', () => {
    // Antisense fragment: sugar(U) - pAbsorbed - pTerminal
    // sugar + base + pAbsorbed form a valid nucleotide (pAbsorbed is not rendered
    // separately), so the terminal phosphate must represent both as "pp".
    const sugar = new Sugar(makeItem(KetMonomerClass.Sugar, 'R', true));
    const base = new RNABase(makeItem(KetMonomerClass.Base, 'U', true));
    const pAbsorbed = phosphate();
    const pTerminal = phosphate();
    [sugar, base, pAbsorbed, pTerminal].forEach((monomer, index) =>
      monomer.moveAbsolute(new Vec2(index, 0)),
    );

    bond(sugar, AttachmentPointName.R3, base, AttachmentPointName.R1);
    bond(sugar, AttachmentPointName.R2, pAbsorbed, AttachmentPointName.R1);
    bond(pAbsorbed, AttachmentPointName.R2, pTerminal, AttachmentPointName.R1);

    expect(isAntisenseTerminalPhosphateRun([pTerminal])).toBe(true);
    expect(getAntisenseTerminalPhosphateCount([pTerminal])).toBe(2);
  });

  it('does not treat a sense phosphate as an antisense terminal run', () => {
    const p = phosphate(false);
    p.moveAbsolute(new Vec2(0, 0));

    expect(isAntisenseTerminalPhosphateRun([p])).toBe(false);
  });

  it('does not treat a non-terminal antisense phosphate as a terminal run', () => {
    const before = phosphate();
    const p = phosphate();
    const after = phosphate();
    [before, p, after].forEach((monomer, index) =>
      monomer.moveAbsolute(new Vec2(index, 0)),
    );
    // before(R2) -> p(R1); p(R2) -> after(R1). p has neighbours on both sides.
    bond(before, AttachmentPointName.R2, p, AttachmentPointName.R1);
    bond(p, AttachmentPointName.R2, after, AttachmentPointName.R1);

    expect(isAntisenseTerminalPhosphateRun([p])).toBe(false);
  });

  it('does not treat a run that is not solely phosphates as a terminal run', () => {
    const sugar = new Sugar(makeItem(KetMonomerClass.Sugar, 'R', true));
    const p = phosphate();
    sugar.moveAbsolute(new Vec2(0, 0));
    p.moveAbsolute(new Vec2(1, 0));

    expect(isAntisenseTerminalPhosphateRun([sugar, p])).toBe(false);
  });
});
