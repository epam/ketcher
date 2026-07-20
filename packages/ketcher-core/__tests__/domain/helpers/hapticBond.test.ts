import { Atom } from 'domain/entities/atom';
import { Bond } from 'domain/entities/bond';
import { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';
import {
  getAttachmentGroupIdForHapticBondHalf,
  isAllowedNonSapHapticBondMetal,
  isAtomPartOfSuperAttachmentPoint,
  isHapticBondWithAttachmentGroup,
  isHapticBondPairAllowed,
  isSuperAttachmentPointAtom,
  isSuperAttachmentPointWithHapticBond,
  remapEndpointAtomIds,
  prepareHapticBondAttributes,
} from 'domain/helpers/hapticBond';

describe('hapticBond helpers', () => {
  it('detects a super-attachment point atom by label and endpoints', () => {
    expect(
      isSuperAttachmentPointAtom({ label: '*', endpoints: [1, 2, 3] }),
    ).toBe(true);
    expect(isSuperAttachmentPointAtom({ label: '*', endpoints: [] })).toBe(
      false,
    );
  });

  it('detects when an atom is part of a super-attachment point', () => {
    const struct = new Struct();
    const endpointId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 1) }),
    );
    const sapId = struct.atoms.add(
      new Atom({
        label: '*',
        pp: new Vec2(0, 0),
        endpoints: [endpointId],
      }),
    );
    const unrelatedAtomId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(1, 1) }),
    );

    expect(isAtomPartOfSuperAttachmentPoint(struct, sapId)).toBe(true);
    expect(isAtomPartOfSuperAttachmentPoint(struct, endpointId)).toBe(true);
    expect(isAtomPartOfSuperAttachmentPoint(struct, unrelatedAtomId)).toBe(
      false,
    );
  });

  it('allows haptic bonds between a SAP and a regular atom only', () => {
    const sapAtom = { label: '*', endpoints: [1, 2, 3] };
    const carbonAtom = { label: 'C', endpoints: [] };

    expect(isHapticBondPairAllowed(sapAtom, carbonAtom)).toBe(true);
    expect(isHapticBondPairAllowed(sapAtom, sapAtom)).toBe(false);
  });

  it('recognizes allowed metals for non-SAP haptic bonds', () => {
    expect(isAllowedNonSapHapticBondMetal({ label: 'Ti', endpoints: [] })).toBe(
      true,
    );
    expect(isAllowedNonSapHapticBondMetal({ label: 'Al', endpoints: [] })).toBe(
      false,
    );
  });

  it('detects when a SAP has an established haptic bond', () => {
    const struct = new Struct();
    const sapId = struct.atoms.add(
      new Atom({ label: '*', pp: new Vec2(0, 0), endpoints: [2, 3, 4] }),
    );
    const metalId = struct.atoms.add(
      new Atom({ label: 'Fe', pp: new Vec2(1, 0) }),
    );
    const endpointId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 1) }),
    );

    expect(isSuperAttachmentPointWithHapticBond(struct, sapId)).toBe(false);

    struct.bonds.add(
      new Bond({
        type: Bond.PATTERN.TYPE.HAPTIC,
        begin: sapId,
        end: metalId,
        endpoints: [endpointId],
        attach: 'ALL',
      }),
    );

    expect(isSuperAttachmentPointWithHapticBond(struct, sapId)).toBe(true);
    expect(isSuperAttachmentPointWithHapticBond(struct, metalId)).toBe(false);
  });

  it('distinguishes Attachment Group haptic bonds from atom-to-atom haptic bonds', () => {
    const struct = new Struct();
    const endpointId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 1) }),
    );
    const attachmentGroupId = struct.atoms.add(
      new Atom({
        label: '*',
        pp: new Vec2(0, 0),
        endpoints: [endpointId],
      }),
    );
    const metalId = struct.atoms.add(
      new Atom({ label: 'Fe', pp: new Vec2(1, 0) }),
    );
    const carbonId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(2, 0) }),
    );

    expect(
      isHapticBondWithAttachmentGroup(
        struct,
        new Bond({
          type: Bond.PATTERN.TYPE.HAPTIC,
          begin: attachmentGroupId,
          end: metalId,
        }),
      ),
    ).toBe(true);
    expect(
      isHapticBondWithAttachmentGroup(
        struct,
        new Bond({
          type: Bond.PATTERN.TYPE.HAPTIC,
          begin: metalId,
          end: carbonId,
        }),
      ),
    ).toBe(false);
    expect(
      isHapticBondWithAttachmentGroup(
        struct,
        new Bond({
          type: Bond.PATTERN.TYPE.SINGLE,
          begin: attachmentGroupId,
          end: metalId,
        }),
      ),
    ).toBe(false);
  });

  it('resolves only the Attachment Group side of a haptic bond', () => {
    const struct = new Struct();
    const endpointId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 1) }),
    );
    const attachmentGroupId = struct.atoms.add(
      new Atom({
        label: '*',
        pp: new Vec2(0, 0),
        endpoints: [endpointId],
      }),
    );
    const centralAtomId = struct.atoms.add(
      new Atom({ label: 'Fe', pp: new Vec2(2, 0) }),
    );
    const hapticBond = new Bond({
      type: Bond.PATTERN.TYPE.HAPTIC,
      begin: centralAtomId,
      end: attachmentGroupId,
    });

    expect(
      getAttachmentGroupIdForHapticBondHalf(
        struct,
        hapticBond,
        new Vec2(0.25, 0),
      ),
    ).toBe(attachmentGroupId);
    expect(
      getAttachmentGroupIdForHapticBondHalf(
        struct,
        hapticBond,
        new Vec2(1.75, 0),
      ),
    ).toBeNull();
    expect(
      getAttachmentGroupIdForHapticBondHalf(
        struct,
        new Bond({
          type: Bond.PATTERN.TYPE.HAPTIC,
          begin: endpointId,
          end: centralAtomId,
        }),
        new Vec2(0.25, 0),
      ),
    ).toBeNull();
  });

  it('allows only one listed metal in a non-SAP haptic bond pair', () => {
    expect(
      isHapticBondPairAllowed(
        { label: 'Ti', endpoints: [] },
        { label: 'N', endpoints: [] },
      ),
    ).toBe(true);
    expect(
      isHapticBondPairAllowed(
        { label: 'Ti', endpoints: [] },
        { label: 'Au', endpoints: [] },
      ),
    ).toBe(false);
    expect(
      isHapticBondPairAllowed(
        { label: 'Al', endpoints: [] },
        { label: 'N', endpoints: [] },
      ),
    ).toBe(false);
  });

  it('remaps endpoint atom ids through an id map', () => {
    const idMap = new Map([
      [1, 10],
      [2, 20],
      [3, 30],
    ]);

    expect(remapEndpointAtomIds([1, 2, 99], idMap)).toEqual([10, 20]);
  });

  it('prepares haptic bond attributes from a super-attachment point atom', () => {
    const bond = prepareHapticBondAttributes(
      { type: Bond.PATTERN.TYPE.HAPTIC, begin: 1, end: 2 },
      { endpoints: [3, 4] },
      { endpoints: [] },
    );

    expect(bond).toEqual({
      type: Bond.PATTERN.TYPE.HAPTIC,
      begin: 1,
      end: 2,
      attach: 'ALL',
      endpoints: [3, 4],
    });
  });
});
