import {
  bondChangingAction,
  fromBondFlipping,
  fromBondsAttrs,
} from 'application/editor/actions/bond';
import { ReStruct, Render } from 'application/render';
import type { RenderOptions } from 'application/render/render.types';
import { Atom, Bond, Struct, Vec2 } from 'domain/entities';

describe('flipping a dative bond', () => {
  const buildFlippableStruct = () => {
    const struct = new Struct();
    const donorId = struct.atoms.add(
      new Atom({ label: 'N', pp: new Vec2(0, 0), fragment: 0 }),
    );
    const acceptorId = struct.atoms.add(
      new Atom({ label: 'B', pp: new Vec2(1, 0), fragment: 0 }),
    );
    const bondId = struct.bonds.add(
      new Bond({
        begin: donorId,
        end: acceptorId,
        type: Bond.PATTERN.TYPE.DATIVE,
      }),
    );
    struct.initHalfBonds();
    struct.initNeighbors();
    struct.setImplicitHydrogen();
    const options = {
      microModeScale: 20,
      width: 100,
      height: 100,
    } as RenderOptions;
    const render = new Render(document as unknown as HTMLElement, options);
    return {
      struct,
      donorId,
      acceptorId,
      bondId,
      reStruct: new ReStruct(struct, render),
    };
  };

  it('recalculates implicit hydrogen on both ends when the bond direction is flipped', () => {
    const { struct, donorId, acceptorId, bondId, reStruct } =
      buildFlippableStruct();

    fromBondFlipping(reStruct, bondId);

    const flipped = Array.from(struct.bonds.values());
    expect(flipped).toHaveLength(1);
    expect(flipped[0].begin).toBe(acceptorId);
    expect(flipped[0].end).toBe(donorId);
    expect(struct.atoms.get(donorId)?.implicitH).toBe(1);
    expect(struct.atoms.get(acceptorId)?.implicitH).toBe(1);
  });

  it('restores implicit hydrogen on both ends when the flip is undone', () => {
    const { struct, donorId, acceptorId, bondId, reStruct } =
      buildFlippableStruct();

    const flipAction = fromBondFlipping(reStruct, bondId);
    flipAction.perform(reStruct);

    const restored = Array.from(struct.bonds.values());
    expect(restored).toHaveLength(1);
    expect(restored[0].begin).toBe(donorId);
    expect(restored[0].end).toBe(acceptorId);
    expect(struct.atoms.get(donorId)?.implicitH).toBe(3);
    expect(struct.atoms.get(acceptorId)?.implicitH).toBe(3);
  });

  it('recalculates implicit hydrogen on both ends when donor and acceptor are swapped', () => {
    const struct = new Struct();
    const donorId = struct.atoms.add(
      new Atom({ label: 'N', pp: new Vec2(0, 0), fragment: 0 }),
    );
    const acceptorId = struct.atoms.add(
      new Atom({ label: 'B', pp: new Vec2(1, 0), fragment: 0 }),
    );
    const bondId = struct.bonds.add(
      new Bond({
        begin: donorId,
        end: acceptorId,
        type: Bond.PATTERN.TYPE.DATIVE,
      }),
    );
    struct.initHalfBonds();
    struct.initNeighbors();
    struct.setImplicitHydrogen();

    expect(struct.atoms.get(donorId)?.implicitH).toBe(3);
    expect(struct.atoms.get(acceptorId)?.implicitH).toBe(3);

    const options = {
      microModeScale: 20,
      width: 100,
      height: 100,
    } as RenderOptions;
    const render = new Render(document as unknown as HTMLElement, options);
    const reStruct = new ReStruct(struct, render);
    const bond = struct.bonds.get(bondId) as Bond;

    bondChangingAction(reStruct, bondId, bond, {
      type: Bond.PATTERN.TYPE.DATIVE,
      stereo: Bond.PATTERN.STEREO.NONE,
    });

    const flipped = Array.from(struct.bonds.values());
    expect(flipped).toHaveLength(1);
    expect(flipped[0].begin).toBe(acceptorId);
    expect(flipped[0].end).toBe(donorId);
    expect(struct.atoms.get(donorId)?.implicitH).toBe(1);
    expect(struct.atoms.get(acceptorId)?.implicitH).toBe(1);
  });
});

describe('changing a bond type with fromBondsAttrs', () => {
  it('recalculates implicit hydrogen on both ends when only the type is set to dative', () => {
    const struct = new Struct();
    const donorId = struct.atoms.add(
      new Atom({ label: 'N', pp: new Vec2(0, 0), fragment: 0 }),
    );
    const acceptorId = struct.atoms.add(
      new Atom({ label: 'B', pp: new Vec2(1, 0), fragment: 0 }),
    );
    const bondId = struct.bonds.add(
      new Bond({
        begin: donorId,
        end: acceptorId,
        type: Bond.PATTERN.TYPE.SINGLE,
      }),
    );
    struct.initHalfBonds();
    struct.initNeighbors();
    struct.setImplicitHydrogen();

    expect(struct.atoms.get(donorId)?.implicitH).toBe(2);
    expect(struct.atoms.get(acceptorId)?.implicitH).toBe(2);

    const options = {
      microModeScale: 20,
      width: 100,
      height: 100,
    } as RenderOptions;
    const render = new Render(document as unknown as HTMLElement, options);
    const reStruct = new ReStruct(struct, render);

    fromBondsAttrs(reStruct, bondId, { type: Bond.PATTERN.TYPE.DATIVE });

    expect(struct.atoms.get(donorId)?.implicitH).toBe(3);
    expect(struct.atoms.get(acceptorId)?.implicitH).toBe(3);
  });
});
