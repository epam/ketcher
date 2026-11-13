import { Atom, Bond, SGroup, Struct, Vec2 } from 'ketcher-core';
import { normalizePptxStructure } from './normalizePptxStructure';

function addAtom(struct: Struct, position: Vec2): number {
  return struct.atoms.add(new Atom({ label: 'C', pp: position }));
}

function connect(struct: Struct, begin: number, end: number): void {
  struct.bonds.add(new Bond({ begin, end, type: Bond.PATTERN.TYPE.SINGLE }));
}

function getAtomPosition(struct: Struct, atomId: number): Vec2 {
  const atom = struct.atoms.get(atomId);
  if (!atom) {
    throw new Error(`Atom ${atomId} was not found`);
  }
  return atom.pp;
}

function createDetachedSuperatomStructure(
  includeUnrelatedComponent = false,
): Struct {
  const struct = new Struct();
  const mainAtomIds = [
    new Vec2(0, 0),
    new Vec2(1, 0),
    new Vec2(2, 0),
    new Vec2(3, 0),
    new Vec2(3, 1),
    new Vec2(2, 1),
    new Vec2(1, 1),
    new Vec2(0, 1),
  ].map((position) => addAtom(struct, position));
  mainAtomIds.forEach((atomId, index) => {
    connect(struct, atomId, mainAtomIds[(index + 1) % mainAtomIds.length]);
  });

  const superatom = new SGroup(SGroup.TYPES.SUP);
  superatom.data.name = 'TFA';
  const superatomId = struct.sgroups.add(superatom);
  superatom.id = superatomId;

  const superatomAtomIds = [
    new Vec2(-8, 10),
    new Vec2(-7, 10),
    new Vec2(-6, 10),
    new Vec2(-5, 10),
    new Vec2(-5, 11),
    new Vec2(-4, 11),
  ].map((position) => addAtom(struct, position));
  superatomAtomIds.forEach((atomId, index) => {
    struct.atomAddToSGroup(superatomId, atomId);
    if (index > 0) {
      connect(struct, superatomAtomIds[index - 1], atomId);
    }
  });

  if (includeUnrelatedComponent) {
    addAtom(struct, new Vec2(30, 30));
  }

  return struct;
}

describe('normalizePptxStructure', () => {
  it('moves a detached labeled SUP group above the main structure without mutating the input', () => {
    const original = createDetachedSuperatomStructure();
    const originalGroup = original.sgroups.get(0);
    if (!originalGroup) {
      throw new Error('TFA SGroup was not found');
    }
    const originalGroupCenter =
      originalGroup.getContractedPosition(original).position;
    const originalFirstSuperatomAtom = getAtomPosition(
      original,
      originalGroup.atoms[0],
    );
    const originalLastSuperatomAtom = getAtomPosition(
      original,
      originalGroup.atoms[originalGroup.atoms.length - 1],
    );

    const { struct: normalized, positionAdjusted } =
      normalizePptxStructure(original);

    const normalizedGroup = normalized.sgroups.get(0);
    if (!normalizedGroup) {
      throw new Error('Normalized TFA SGroup was not found');
    }
    const normalizedGroupCenter =
      normalizedGroup.getContractedPosition(normalized).position;
    const normalizedFirstAtom = getAtomPosition(
      normalized,
      normalizedGroup.atoms[0],
    );
    const normalizedLastAtom = getAtomPosition(
      normalized,
      normalizedGroup.atoms[normalizedGroup.atoms.length - 1],
    );

    expect(normalized).not.toBe(original);
    expect(positionAdjusted).toBe(true);
    expect(normalizedGroupCenter.x).toBeCloseTo(3);
    expect(normalizedGroupCenter.y).toBeCloseTo(-0.5);
    expect(normalizedFirstAtom.sub(normalizedLastAtom)).toEqual(
      originalFirstSuperatomAtom.sub(originalLastSuperatomAtom),
    );
    expect(originalGroupCenter.x).toBeCloseTo(-35 / 6);
    expect(originalGroupCenter.y).toBeCloseTo(31 / 3);
    expect(getAtomPosition(original, originalGroup.atoms[0])).toEqual(
      originalFirstSuperatomAtom,
    );
  });

  it('leaves a labeled SUP group in place when other components make its role ambiguous', () => {
    const original = createDetachedSuperatomStructure(true);
    const originalGroup = original.sgroups.get(0);
    if (!originalGroup) {
      throw new Error('TFA SGroup was not found');
    }
    const originalPosition =
      originalGroup.getContractedPosition(original).position;

    const { struct: normalized, positionAdjusted } =
      normalizePptxStructure(original);

    const normalizedGroup = normalized.sgroups.get(0);
    if (!normalizedGroup) {
      throw new Error('Normalized TFA SGroup was not found');
    }
    const normalizedPosition =
      normalizedGroup.getContractedPosition(normalized).position;

    expect(normalized).toBe(original);
    expect(positionAdjusted).toBe(false);
    expect(normalizedPosition.x).toBeCloseTo(originalPosition.x);
    expect(normalizedPosition.y).toBeCloseTo(originalPosition.y);
  });
});
