import { test, expect } from '@fixtures';
import { waitForPageInit } from '@utils/common';
import { takeMonomerLibraryScreenshot } from '@utils';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { Chem } from '@tests/pages/constants/monomers/Chem';

test.describe('Open Ketcher', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  });

  test('Switch to Polymer Editor', async ({ page }) => {
    /* 
    Test case: #2496 - chem monomer library
    Description: Switch to Polymer Editor
    */
    await expect(page.getByText('CHEM')).toBeVisible();
  });

  test('Open Chem tab in library', async ({ page }) => {
    /* 
    Test case: #2496 - chem monomer library
    Description: Open Chem tab in library
    */
    await Library(page).switchToCHEMTab();
    expect(await Library(page).isMonomerExist(Chem.A6OH)).toBeTruthy();
    await takeMonomerLibraryScreenshot(page);
  });
});
