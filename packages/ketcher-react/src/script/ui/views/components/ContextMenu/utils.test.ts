import { Atom, Bond, Struct, Vec2 } from 'ketcher-core';
import {
  isSuperAttachmentPointCreationSelectionValid,
  isSuperAttachmentPointCreationSelectionVisible,
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
    it('is visible and enabled for two continuous selected atoms', () => {
      const { struct, firstAtomId, secondAtomId } = createTwoConnectedAtoms();
      const selection = { atoms: [firstAtomId, secondAtomId] };

      expect(
        isSuperAttachmentPointCreationSelectionVisible(struct, selection),
      ).toBe(true);
      expect(
        isSuperAttachmentPointCreationSelectionValid(struct, selection),
      ).toBe(true);
    });

    it('is enabled when bonds between the selected atoms are also selected', () => {
      const { struct, firstAtomId, secondAtomId, bondId } =
        createTwoConnectedAtoms();

      expect(
        isSuperAttachmentPointCreationSelectionValid(struct, {
          atoms: [firstAtomId, secondAtomId],
          bonds: [bondId],
        }),
      ).toBe(true);
    });

    it('is hidden when fewer than two atoms are selected', () => {
      const { struct, firstAtomId } = createTwoConnectedAtoms();

      expect(
        isSuperAttachmentPointCreationSelectionVisible(struct, {
          atoms: [firstAtomId],
        }),
      ).toBe(false);
    });

    it('is hidden when the selected atoms are not continuous', () => {
      const { struct, firstAtomId } = createTwoConnectedAtoms();
      const disconnectedAtomId = struct.atoms.add(
        new Atom({ label: 'C', pp: new Vec2(3, 0) }),
      );

      expect(
        isSuperAttachmentPointCreationSelectionVisible(struct, {
          atoms: [firstAtomId, disconnectedAtomId],
        }),
      ).toBe(false);
    });

    it('remains visible but is disabled when another element is selected', () => {
      const { struct, firstAtomId, secondAtomId } = createTwoConnectedAtoms();
      const selection = {
        atoms: [firstAtomId, secondAtomId],
        rxnArrows: [0],
      };

      expect(
        isSuperAttachmentPointCreationSelectionVisible(struct, selection),
      ).toBe(true);
      expect(
        isSuperAttachmentPointCreationSelectionValid(struct, selection),
      ).toBe(false);
    });

    it('remains visible but is disabled when an unrelated bond is selected', () => {
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

      expect(
        isSuperAttachmentPointCreationSelectionVisible(struct, selection),
      ).toBe(true);
      expect(
        isSuperAttachmentPointCreationSelectionValid(struct, selection),
      ).toBe(false);
    });

    it('remains visible but is disabled when an atom is already in an Attachment Group', () => {
      const { struct, firstAtomId, secondAtomId } = createTwoConnectedAtoms();
      struct.atoms.add(
        new Atom({
          label: '*',
          pp: new Vec2(0.5, 0),
          endpoints: [firstAtomId, secondAtomId],
        }),
      );
      const selection = { atoms: [firstAtomId, secondAtomId] };

      expect(
        isSuperAttachmentPointCreationSelectionVisible(struct, selection),
      ).toBe(true);
      expect(
        isSuperAttachmentPointCreationSelectionValid(struct, selection),
      ).toBe(false);
    });
  });
});
