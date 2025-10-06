import { test } from '@fixtures';
import {
  takeEditorScreenshot,
  clickOnAtom,
  openFileAndAddToCanvas,
  waitForPageInit,
} from '@utils';
import { selectExtendedTableElement } from '@tests/pages/molecules/canvas/ExtendedTableDialog';
import { ExtendedTableButton } from '@tests/pages/constants/extendedTableWindow/Constants';

test.describe('Generic node', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/heteroatoms-structure.mol',
    );
  });
  function getEnumKeyByValue<T extends Record<string, string>>(
    enumObj: T,
    value: T[keyof T],
  ): keyof T | undefined {
    return (Object.keys(enumObj) as Array<keyof T>).find(
      (k) => enumObj[k] === value,
    );
  }
  const extendedAtomsTests = [
    ExtendedTableButton.A,
    ExtendedTableButton.AH,
    ExtendedTableButton.Q,
    ExtendedTableButton.QH,
    ExtendedTableButton.M,
    ExtendedTableButton.MH,
    ExtendedTableButton.X,
    ExtendedTableButton.XH,
  ];
  for (const extendedAtom of extendedAtomsTests) {
    const key = getEnumKeyByValue(ExtendedTableButton, extendedAtom);
    test(`adding atoms_${key}`, async ({ page }) => {
      await selectExtendedTableElement(page, extendedAtom);
      await clickOnAtom(page, 'S', 0);
      await takeEditorScreenshot(page);
    });
  }
});
