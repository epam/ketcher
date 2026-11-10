import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { Vec2 } from 'domain/entities';
import { AttachmentPointName } from 'domain/types';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import type { PolymerBond } from 'domain/entities/PolymerBond';
import { Coordinates } from 'application/editor/shared/coordinates';
import {
  buildCircularReplacementExtension,
  computeFlexInsertionLayout,
  findBondInsertionTarget,
  getInsertionEnds,
} from 'application/editor/libraryItemDragDrop/insertion';
import { peptideMonomerItem } from '../../../mock-data';

const { R1, R2 } = AttachmentPointName;

function addPeptide(manager: DrawingEntitiesManager, x: number, y = 0) {
  const command = manager.addMonomer(peptideMonomerItem, new Vec2(x, y));
  return (command.operations[0] as unknown as { monomer: BaseMonomer }).monomer;
}

function bond(
  manager: DrawingEntitiesManager,
  first: BaseMonomer,
  second: BaseMonomer,
): PolymerBond {
  const command = manager.createPolymerBond(first, second, R2, R1);
  return (command.operations[0] as unknown as { polymerBond: PolymerBond })
    .polymerBond;
}

function chain(length: number, spacing: number, closeRing = false) {
  const manager = new DrawingEntitiesManager();
  const monomers = Array.from({ length }, (_, index) =>
    addPeptide(manager, index * spacing),
  );
  const bonds = monomers
    .slice(0, -1)
    .map((monomer, index) => bond(manager, monomer, monomers[index + 1]));
  return { manager, monomers, bonds, closeRing };
}

describe('getInsertionEnds', () => {
  it('orders the ends left/right and keeps the original APs', () => {
    const { monomers, bonds } = chain(3, 1.5);
    const ends = getInsertionEnds(bonds[0]);
    expect(ends?.left).toBe(monomers[0]);
    expect(ends?.right).toBe(monomers[1]);
    expect(ends?.leftAp).toBe(R2);
    expect(ends?.rightAp).toBe(R1);
  });
});

describe('computeFlexInsertionLayout', () => {
  it('extends a short bond to 3 Å and shifts only the right part', () => {
    const { manager, monomers, bonds } = chain(4, 1.5);
    const ends = getInsertionEnds(bonds[1]);
    if (!ends) throw new Error('no ends');
    const layout = computeFlexInsertionLayout(manager, ends, false);

    expect(layout.delta).toBeCloseTo(1.5);
    expect(layout.middle.x).toBeCloseTo(1.5 + 1.5);
    expect(new Set(layout.shiftedMonomers)).toEqual(
      new Set([monomers[2], monomers[3]]),
    );
  });

  it('does not shift anything for a bond of 3 Å or longer', () => {
    const { manager, bonds } = chain(3, 3);
    const ends = getInsertionEnds(bonds[0]);
    if (!ends) throw new Error('no ends');
    const layout = computeFlexInsertionLayout(manager, ends, false);

    expect(layout.delta).toBe(0);
    expect(layout.shiftedMonomers).toHaveLength(0);
    expect(layout.middle.x).toBeCloseTo(1.5);
  });

  it('needs more room for phosphate-containing presets', () => {
    const { manager, bonds } = chain(3, 3);
    const ends = getInsertionEnds(bonds[0]);
    if (!ends) throw new Error('no ends');
    const layout = computeFlexInsertionLayout(manager, ends, true);

    // horizontal bond: 2C = 4.5 Å
    expect(layout.delta).toBeCloseTo(1.5);
  });
});

describe('findBondInsertionTarget', () => {
  const thresholds = { outer: 20, inner: 10 };

  it('reports near and nearest levels and ignores far cursors', () => {
    const { manager, bonds } = chain(2, 3);
    const middle = Coordinates.modelToCanvas(new Vec2(1.5, 0));

    const nearest = findBondInsertionTarget(
      manager,
      new Vec2(middle.x, middle.y + 5),
      thresholds,
      false,
    );
    expect(nearest?.bond).toBe(bonds[0]);
    expect(nearest?.level).toBe('nearest');

    const near = findBondInsertionTarget(
      manager,
      new Vec2(middle.x, middle.y + 15),
      thresholds,
      false,
    );
    expect(near?.level).toBe('near');

    expect(
      findBondInsertionTarget(
        manager,
        new Vec2(middle.x, middle.y + 40),
        thresholds,
        false,
      ),
    ).toBeNull();
  });
});

describe('buildCircularReplacementExtension', () => {
  it('does nothing outside a circular structure', () => {
    const { manager, monomers } = chain(3, 1.5);
    const command = buildCircularReplacementExtension(
      manager,
      monomers[1],
      monomers[0],
    );
    expect(command.operations).toHaveLength(0);
  });

  it('extends the phosphate bond in a ring and shifts the far side', () => {
    const manager = new DrawingEntitiesManager();
    const m0 = addPeptide(manager, 0, 0);
    const m1 = addPeptide(manager, 1.5, 0);
    const m2 = addPeptide(manager, 1.5, 1.5);
    const m3 = addPeptide(manager, 0, 1.5);
    bond(manager, m0, m1);
    bond(manager, m1, m2);
    bond(manager, m2, m3);
    bond(manager, m3, m0);

    const command = buildCircularReplacementExtension(manager, m1, m0);

    // vertical bond: 2C = 2·√(1.5² − 0.75²) ≈ 2.6 Å, so it grows by ≈ 1.1 Å
    expect(command.operations.length).toBeGreaterThan(0);
    expect(m2.position.y).toBeCloseTo(1.5 + (2.598 - 1.5), 1);
    expect(m3.position.y).toBeCloseTo(1.5 + (2.598 - 1.5), 1);
    expect(m0.position.y).toBe(0);
    expect(m1.position.y).toBe(0);
  });
});
