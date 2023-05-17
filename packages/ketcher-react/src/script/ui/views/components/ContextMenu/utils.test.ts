import { onlyHasProperty } from './utils'

describe('Utils', () => {
  describe('onlyHasProperty', () => {
    type OptionalObject = Record<string, unknown>
    const REQUIRED_PROP_NAME = 'atoms'
    const ANOTHER_PROP_NAME = 'bonds'
    const ANOTHER_PROP_NAME2 = 'sgroups'

    const testTable: [OptionalObject, string, string[] | undefined, boolean][] =
      [
        [{}, REQUIRED_PROP_NAME, undefined, false],
        [{ [ANOTHER_PROP_NAME]: null }, REQUIRED_PROP_NAME, undefined, false],
        [
          { [ANOTHER_PROP_NAME]: null, [ANOTHER_PROP_NAME2]: null },
          REQUIRED_PROP_NAME,
          undefined,
          false
        ],
        [
          { [REQUIRED_PROP_NAME]: null, [ANOTHER_PROP_NAME2]: null },
          REQUIRED_PROP_NAME,
          undefined,
          false
        ],
        [{ [REQUIRED_PROP_NAME]: null }, REQUIRED_PROP_NAME, undefined, false],
        [
          { [REQUIRED_PROP_NAME]: null, [ANOTHER_PROP_NAME2]: null },
          REQUIRED_PROP_NAME,
          [ANOTHER_PROP_NAME2],
          false
        ]
      ]

    it.each(testTable)(
      'Should check that only required field is present in the object except ignore list',
      (testObject, requiredPropName, ignoreList, expectedResult) => {
        const result = onlyHasProperty(testObject, requiredPropName, ignoreList)
        expect(result).toBe(expectedResult)
      }
    )
  })
})
