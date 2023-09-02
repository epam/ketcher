/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import {
  pressButton,
  delay,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  DELAY_IN_SECONDS,
  BondType,
  selectAtomInToolbar,
  AtomButton,
  resetCurrentTool,
  selectLeftPanelButton,
  LeftPanelButton,
  clickInTheMiddleOfTheScreen,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { getBondByIndex } from '@utils/canvas/bonds';

test.describe('Right-click menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Check right-click menu for bonds', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5872
    Description: The menu has appeared and contains the list of Bonds.
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await page.mouse.click(point.x, point.y, { button: 'right' });
  });

  test('Check right-click submenu for Query bonds', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5876
    Description: The menu has appeared and contains the list of Query Bonds.
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.getByText('Query bonds').click();
  });

  test('Check editing for bonds', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5873
    Description: Single Bond changes on Double Bond.
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.getByText('Edit...').click();
    await page.getByRole('button', { name: 'Single', exact: true }).click();
    await page.getByRole('option', { name: 'Double', exact: true }).click();
    await pressButton(page, 'Apply');
  });

  test('Check selecting Bond type for bonds', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5874
    Description: Single Bond changes on Double Bond.
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.getByText('Double', { exact: true }).click();
  });

  test('Check deleting for bonds', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5875
    Description: Bond is deleted
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.getByText('Delete', { exact: true }).click();
  });

  test('Check that right-click menu does not cancel selected tool', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-5877
    Description: Bond is deleted
    */
    let point: { x: number; y: number };
    await openFileAndAddToCanvas('KET/chain.ket', page);
    await selectAtomInToolbar(AtomButton.Oxygen, page);
    point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.getByText('Double', { exact: true }).click();

    await delay(DELAY_IN_SECONDS.TWO);

    point = await getAtomByIndex(page, { label: 'C' }, 1);
    await page.mouse.click(point.x, point.y);
    await resetCurrentTool(page);
  });

  test('Check right-click menu for atoms', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5879
    Description: The menu has appeared and contains the following items:
    - Edit
    - Enhanced stereochemistry (Should be grayed out if enhanced stereochemistry can not be added.)
    - Delete
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);
    const point = await getAtomByIndex(page, { label: 'C' }, 1);
    await page.mouse.click(point.x, point.y, { button: 'right' });
  });

  test('Check right-click property change for atoms', async ({ page }) => {
    await openFileAndAddToCanvas('KET/chain.ket', page);
    const point = await getAtomByIndex(page, { label: 'C' }, 1);
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.getByText('Query properties').click();
    await page.getByText('Ring bond count').click();
    await takeEditorScreenshot(page);
    await page.getByRole('button', { name: 'As drawn' }).first().click();
    await page.getByText('Substitution count').click();
    await takeEditorScreenshot(page);
    await page.getByRole('button', { name: '6' }).last().click();
    await page.getByText('Unsaturated').first().click();
    await takeEditorScreenshot(page);
    await page.getByRole('button', { name: 'Saturated' }).last().click();
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Check editing for atoms', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5880
    Description: Carbon atom changes to Oxygen.
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);
    const point = await getAtomByIndex(page, { label: 'C' }, 1);
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.getByText('Edit...').click();
    await page.getByLabel('Label').click();
    await page.getByLabel('Label').fill('N');
    await pressButton(page, 'Apply');
  });

  test('Check that menu Enhanced stereochemistry is grayed out if atom does not have enhanced stereochemistry', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-5881
    Description: The menu has appeared and contains the following items:
    - Edit
    - Enhanced stereochemistry (Should be grayed out if enhanced stereochemistry can not be added.)
    - Delete
    */
    await openFileAndAddToCanvas('KET/chain-with-stereo.ket', page);
    const point = await getAtomByIndex(page, { label: 'C' }, 1);
    await page.mouse.click(point.x, point.y, { button: 'right' });
  });

  test('Check that the menu Enhanced stereochemistry is NOT grayed out if the atom have enhanced stereochemistry', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-5882
    Description: 'Enhanced stereochemistry' is NOT grayed out (User can add Enhanced stereochemistry)
    */
    await openFileAndAddToCanvas('KET/chain-with-stereo.ket', page);
    const point = await getAtomByIndex(page, { label: 'C' }, 2);
    await page.mouse.click(point.x, point.y, { button: 'right' });
  });

  test('Check creating new AND Group from Enhanced stereochemistry item', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-5884
    Description: Near the atom with the stereochemistry the '&1' and '&2' is displayed.
    And 'Mixed' flag appears. After add Ignore the chiral flag in settings - 'Mixed' flag dissapear.
    */
    await openFileAndAddToCanvas('KET/chain-with-stereo.ket', page);
    const point = await getAtomByIndex(page, { label: 'C' }, 2);
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.getByText('Enhanced stereochemistry...').click();
    await page.getByLabel('Create new AND Group').check();
    await pressButton(page, 'Apply');

    await takeEditorScreenshot(page);

    await page.getByRole('button', { name: 'Settings' }).click();
    await page.getByText('Stereochemistry', { exact: true }).click();
    await page
      .locator('label')
      .filter({ hasText: 'Ignore the chiral flag' })
      .click();
    await pressButton(page, 'Apply');
  });

  test('Check creating new OR Group from Enhanced stereochemistry item', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-5885
    Description: Near the atom with the stereochemistry the '&1' and 'or1' is displayed.
    And 'Mixed' flag appears. After add Ignore the chiral flag in settings - 'Mixed' flag dissapear.
    */
    await openFileAndAddToCanvas('KET/chain-with-stereo.ket', page);
    const point = await getAtomByIndex(page, { label: 'C' }, 2);
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.getByText('Enhanced stereochemistry...').click();
    await page.getByLabel('Create new OR Group').check();
    await pressButton(page, 'Apply');

    await takeEditorScreenshot(page);

    await page.getByRole('button', { name: 'Settings' }).click();
    await page.getByText('Stereochemistry', { exact: true }).click();
    await page
      .locator('label')
      .filter({ hasText: 'Ignore the chiral flag' })
      .locator('div span')
      .click();
    await pressButton(page, 'Apply');
  });

  test('Check deleting for atoms', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5883
    Description: Atom is deleted by right-click menu
    */
    await openFileAndAddToCanvas('KET/chain-with-stereo.ket', page);
    const point = await getAtomByIndex(page, { label: 'C' }, 2);
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.getByText('Delete').click();
  });

  test('Check that there are no error when deleting few stereo bond via context-menu', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-8926
    Description: Only selected atoms and bonds are deleted. No error is thrown.
    */
    let point: { x: number; y: number };
    await openFileAndAddToCanvas('KET/chain-with-stereo-and-atoms.ket', page);
    point = await getAtomByIndex(page, { label: 'N' }, 0);
    await page.keyboard.down('Shift');
    await page.mouse.click(point.x, point.y);
    point = await getAtomByIndex(page, { label: 'O' }, 0);
    await page.mouse.click(point.x, point.y);
    await page.keyboard.up('Shift');
    point = await getAtomByIndex(page, { label: 'N' }, 0);
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.getByText('Delete').click();
  });

  test('Close menu by clicking on canvas', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-10075
    Description: Menu is closed, no new atoms or structures are added to canvas
    */
    const canvasClickX = 300;
    const canvasClickY = 300;
    await openFileAndAddToCanvas('KET/chain.ket', page);
    await selectAtomInToolbar(AtomButton.Oxygen, page);
    const point = await getAtomByIndex(page, { label: 'C' }, 2);
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.mouse.click(canvasClickX, canvasClickY);
  });

  test('Right click on an Atom with selected S-Group tool not opens S-Group Properties window', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-10082
    Description: Opens right-click menu for atom
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    const point = await getAtomByIndex(page, { label: 'C' }, 2);
    await page.mouse.click(point.x, point.y, { button: 'right' });
  });

  test('Right click on a Bond with selected S-Group tool not opens S-Group Properties window', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-10082
    Description: Opens right-click menu for bond
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await page.mouse.click(point.x, point.y, { button: 'right' });
  });

  test('Check Attach S-Group for bond by right-click menu', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-15495
    Description: S-Group for Bond is attached.
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.getByText('Attach S-Group...', { exact: true }).click();
    await page.getByPlaceholder('Enter name').click();
    await page.getByPlaceholder('Enter name').fill('A!@#$$$test');
    await page.getByPlaceholder('Enter value').click();
    await page.getByPlaceholder('Enter value').fill('Test!@#$%');
    await pressButton(page, 'Apply');
  });

  test('Multiple Atom editing by right-click menu', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-15496
    Description: Three selected Carbon atoms changed to Nitrogen atoms.
    */
    let point: { x: number; y: number };
    await openFileAndAddToCanvas('KET/chain.ket', page);
    point = await getAtomByIndex(page, { label: 'C' }, 1);
    await page.keyboard.down('Shift');
    await page.mouse.click(point.x, point.y);
    point = await getAtomByIndex(page, { label: 'C' }, 2);
    await page.mouse.click(point.x, point.y);
    point = await getAtomByIndex(page, { label: 'C' }, 3);
    await page.mouse.click(point.x, point.y);
    await page.keyboard.up('Shift');

    point = await getAtomByIndex(page, { label: 'C' }, 1);
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.getByText('Edit...').click();
    await page.getByLabel('Label').click();
    await page.getByLabel('Label').fill('N');
    await pressButton(page, 'Apply');
  });

  // it seems like the screenshot is being done too early
  test.fixme('Multiple Bond editing by right-click menu', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-15497
    Description: Three selected Single Bonds changed to Double Bonds.
    */
    let point: { x: number; y: number };
    await openFileAndAddToCanvas('KET/chain.ket', page);
    point = await getBondByIndex(page, { type: BondType.SINGLE }, 1);
    await page.keyboard.down('Shift');
    await page.mouse.click(point.x, point.y);
    point = await getBondByIndex(page, { type: BondType.SINGLE }, 2);
    await page.mouse.click(point.x, point.y);
    point = await getBondByIndex(page, { type: BondType.SINGLE }, 3);
    await page.mouse.click(point.x, point.y);
    await page.keyboard.up('Shift');

    point = await getBondByIndex(page, { type: BondType.SINGLE }, 1);
    await page.mouse.click(point.x, point.y, { button: 'right' });
    await page.getByText('Double', { exact: true }).click();
  });
});
