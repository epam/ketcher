import { Bond, MonomerMicromolecule, type Struct } from 'ketcher-core';
import { isHydrogenBondBetweenMonomers, onlyHasProperty } from './utils';

describe('isHydrogenBondBetweenMonomers', () => {
  const monomerGroup = () =>
    Object.create(MonomerMicromolecule.prototype) as MonomerMicromolecule;

  const makeStruct = (
    beginGroup?: MonomerMicromolecule,
    endGroup?: MonomerMicromolecule,
  ) =>
    ({
      getGroupFromAtomId: (atomId: number | undefined) =>
        atomId === 1 ? beginGroup : endGroup,
    }) as Struct;

  const hydrogenBond = {
    type: Bond.PATTERN.TYPE.HYDROGEN,
    begin: 1,
    end: 2,
  } as Bond;

  it('returns true for a hydrogen bond between distinct monomers', () => {
    expect(
      isHydrogenBondBetweenMonomers(
        hydrogenBond,
        makeStruct(monomerGroup(), monomerGroup()),
      ),
    ).toBe(true);
  });

  it('returns false for a regular bond between monomers', () => {
    expect(
      isHydrogenBondBetweenMonomers(
        { ...hydrogenBond, type: Bond.PATTERN.TYPE.SINGLE } as Bond,
        makeStruct(monomerGroup(), monomerGroup()),
      ),
    ).toBe(false);
  });

  it('returns false when both endpoints belong to the same monomer', () => {
    const group = monomerGroup();

    expect(
      isHydrogenBondBetweenMonomers(hydrogenBond, makeStruct(group, group)),
    ).toBe(false);
  });

  it('returns false when the endpoints are not in monomer groups', () => {
    expect(isHydrogenBondBetweenMonomers(hydrogenBond, makeStruct())).toBe(
      false,
    );
  });
});

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
});
