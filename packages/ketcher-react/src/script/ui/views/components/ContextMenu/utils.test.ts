import { AttachmentGroup, Atom, Bond, Struct, Vec2 } from 'ketcher-core';
import {
  getEditableAtomIds,
  getEditableBondIds,
  isAttachmentGroupCreationSelectionValid,
  onlyHasProperty,
} from './utils';

function createTwoConnectedAtoms() {
  const struct = new Struct();
  const firstAtomId = struct.atoms.add(
    new Atom({ label: 'C', pp: new Vec2(0, 0) }),
  );
  const secondAtomId = struct.atoms.add(
    new Atom({ label: 'C', pp: new Vec2(1, 0) }),
  );
  const bondId = struct.bonds.add(
    new Bond({ begin: firstAtomId, end: secondAtomId, type: 1 }),
  );

  return { struct, firstAtomId, secondAtomId, bondId };
}

describe('Utils', () => {
  describe('context menu editable selection', () => {
    it('excludes Attachment Groups from editable atoms', () => {
      const struct = new Struct();
      const regularAtomId = struct.atoms.add(
        new Atom({ label: 'C', pp: new Vec2(0, 0) }),
      );
      const attachmentGroupId = struct.addAttachmentGroup(
        new AttachmentGroup({ atomIds: [regularAtomId] }),
      );

      expect(
        getEditableAtomIds(struct, [regularAtomId, attachmentGroupId]),
      ).toEqual([regularAtomId]);
    });

    it('excludes Attachment Group haptic bonds from editable bonds', () => {
      const struct = new Struct();
      const endpointId = struct.atoms.add(
        new Atom({ label: 'C', pp: new Vec2(0, 0) }),
      );
      const attachmentGroupId = struct.addAttachmentGroup(
        new AttachmentGroup({ atomIds: [endpointId] }),
      );
      const metalId = struct.atoms.add(
        new Atom({ label: 'Fe', pp: new Vec2(1, 0) }),
      );
      const regularAtomId = struct.atoms.add(
        new Atom({ label: 'C', pp: new Vec2(2, 0) }),
      );
      const hapticBondId = struct.bonds.add(
        new Bond({
          begin: attachmentGroupId,
          end: metalId,
          type: Bond.PATTERN.TYPE.HAPTIC,
        }),
      );
      const regularBondId = struct.bonds.add(
        new Bond({
          begin: metalId,
          end: regularAtomId,
          type: Bond.PATTERN.TYPE.SINGLE,
        }),
      );
      const nonSapHapticBondId = struct.bonds.add(
        new Bond({
          begin: endpointId,
          end: metalId,
          type: Bond.PATTERN.TYPE.HAPTIC,
        }),
      );

      expect(
        getEditableBondIds(struct, [
          regularBondId,
          hapticBondId,
          nonSapHapticBondId,
        ]),
      ).toEqual([regularBondId, nonSapHapticBondId]);
    });
  });

  describe('onlyHasProperty', () => {
    type OptionalObject = Record<string, unknown>;
    const REQUIRED_PROP_NAME = 'atoms';
    const ANOTHER_PROP_NAME = 'bonds';
    const ANOTHER_PROP_NAME2 = 'sgroups';

    const testTable: [OptionalObject, string, string[] | undefined, boolean][] =
      [
        [{}, REQUIRED_PROP_NAME, undefined, false],
        [{ [ANOTHER_PROP_NAME]: null }, REQUIRED_PROP_NAME, undefined, false],
        [
          { [ANOTHER_PROP_NAME]: null, [ANOTHER_PROP_NAME2]: null },
          REQUIRED_PROP_NAME,
          undefined,
          false,
        ],
        [
          { [REQUIRED_PROP_NAME]: null, [ANOTHER_PROP_NAME2]: null },
          REQUIRED_PROP_NAME,
          undefined,
          false,
        ],
        [{ [REQUIRED_PROP_NAME]: null }, REQUIRED_PROP_NAME, undefined, true],
        [
          { [REQUIRED_PROP_NAME]: null, [ANOTHER_PROP_NAME2]: null },
          REQUIRED_PROP_NAME,
          [ANOTHER_PROP_NAME2],
          true,
        ],
        [
          {
            [REQUIRED_PROP_NAME]: null,
            [ANOTHER_PROP_NAME]: null,
            [ANOTHER_PROP_NAME2]: null,
          },
          REQUIRED_PROP_NAME,
          [ANOTHER_PROP_NAME, ANOTHER_PROP_NAME2],
          true,
        ],
      ];

    it.each(testTable)(
      'Should check that only a required field is present in the object except ignore list',
      (testObject, requiredPropName, ignoreList, expectedResult) => {
        const result = onlyHasProperty(
          testObject,
          requiredPropName,
          ignoreList,
        );
        expect(result).toBe(expectedResult);
      },
    );
  });

  describe('Attachment Group creation selection', () => {
    it('is enabled for two continuous selected atoms', () => {
      const { struct, firstAtomId, secondAtomId } = createTwoConnectedAtoms();
      const selection = { atoms: [firstAtomId, secondAtomId] };

      expect(isAttachmentGroupCreationSelectionValid(struct, selection)).toBe(
        true,
      );
    });

    it('is enabled when bonds between the selected atoms are also selected', () => {
      const { struct, firstAtomId, secondAtomId, bondId } =
        createTwoConnectedAtoms();

      expect(
        isAttachmentGroupCreationSelectionValid(struct, {
          atoms: [firstAtomId, secondAtomId],
          bonds: [bondId],
        }),
      ).toBe(true);
    });

    it('is disabled when fewer than two atoms are selected', () => {
      const { struct, firstAtomId } = createTwoConnectedAtoms();

      expect(
        isAttachmentGroupCreationSelectionValid(struct, {
          atoms: [firstAtomId],
        }),
      ).toBe(false);
    });

    it('is disabled when the selected atoms are not continuous', () => {
      const { struct, firstAtomId } = createTwoConnectedAtoms();
      const disconnectedAtomId = struct.atoms.add(
        new Atom({ label: 'C', pp: new Vec2(3, 0) }),
      );

      expect(
        isAttachmentGroupCreationSelectionValid(struct, {
          atoms: [firstAtomId, disconnectedAtomId],
        }),
      ).toBe(false);
    });

    it('is disabled when another element is selected', () => {
      const { struct, firstAtomId, secondAtomId } = createTwoConnectedAtoms();
      const selection = {
        atoms: [firstAtomId, secondAtomId],
        rxnArrows: [0],
      };

      expect(isAttachmentGroupCreationSelectionValid(struct, selection)).toBe(
        false,
      );
    });

    it('is disabled when an unrelated bond is selected', () => {
      const { struct, firstAtomId, secondAtomId } = createTwoConnectedAtoms();
      const thirdAtomId = struct.atoms.add(
        new Atom({ label: 'C', pp: new Vec2(3, 0) }),
      );
      const fourthAtomId = struct.atoms.add(
        new Atom({ label: 'C', pp: new Vec2(4, 0) }),
      );
      const unrelatedBondId = struct.bonds.add(
        new Bond({ begin: thirdAtomId, end: fourthAtomId, type: 1 }),
      );
      const selection = {
        atoms: [firstAtomId, secondAtomId],
        bonds: [unrelatedBondId],
      };

      expect(isAttachmentGroupCreationSelectionValid(struct, selection)).toBe(
        false,
      );
    });

    it('is disabled when an atom is already in an Attachment Group', () => {
      const { struct, firstAtomId, secondAtomId } = createTwoConnectedAtoms();
      struct.addAttachmentGroup(
        new AttachmentGroup({ atomIds: [firstAtomId, secondAtomId] }),
      );
      const selection = { atoms: [firstAtomId, secondAtomId] };

      expect(isAttachmentGroupCreationSelectionValid(struct, selection)).toBe(
        false,
      );
    });
  });
});
