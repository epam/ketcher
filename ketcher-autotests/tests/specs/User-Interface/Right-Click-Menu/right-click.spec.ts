/* eslint-disable no-inline-comments */
/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import {
  pressButton,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  BondType,
  waitForPageInit,
  waitForRender,
  clickOnBond,
  clickOnAtom,
  clickOnCanvas,
  selectAllStructuresOnCanvas,
  screenshotBetweenUndoRedo,
  moveMouseAway,
} from '@utils';
import { resetCurrentTool } from '@utils/canvas/tools';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { getBondByIndex } from '@utils/canvas/bonds';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { drawBenzeneRing } from '@tests/pages/molecules/BottomToolbar';

test.describe('Right-click menu', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Check right-click menu for bonds', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5872
    Description: The menu has appeared and contains the list of Bonds.
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await clickOnCanvas(page, point.x, point.y, { button: 'right' });
    await takeEditorScreenshot(page);
  });

  test('Check right-click submenu for Query bonds', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5876
    Description: The menu has appeared and contains the list of Query Bonds.
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await clickOnCanvas(page, point.x, point.y, { button: 'right' });
    await page.getByText('Query bonds').click();
    await takeEditorScreenshot(page);
  });

  test('Check editing for bonds', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5873
    Description: Single Bond changes on Double Bond.
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await clickOnCanvas(page, point.x, point.y, { button: 'right' });
    await page.getByText('Edit...').click();
    await page.getByTestId('type-input-span').click();
    await page.getByRole('option', { name: 'Double', exact: true }).click();
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Check selecting Bond type for bonds', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5874
    Description: Single Bond changes on Double Bond.
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await clickOnCanvas(page, point.x, point.y, { button: 'right' });
    await page.getByText('Double', { exact: true }).click();
    await takeEditorScreenshot(page);
  });

  test('Check deleting for bonds', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5875
    Description: Bond is deleted
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await clickOnCanvas(page, point.x, point.y, { button: 'right' });
    await page.getByText('Delete', { exact: true }).click();
    await takeEditorScreenshot(page);
  });

  test('Check that right-click menu does not cancel selected tool', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-5877
    Description: Bond is deleted
    */
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas('KET/chain.ket', page);
    await atomToolbar.clickAtom(Atom.Oxygen);
    await waitForRender(page, async () => {
      await clickOnBond(page, BondType.SINGLE, 0, 'right');
    });
    await waitForRender(page, async () => {
      await page.getByText('Double', { exact: true }).click();
    });

    await waitForRender(page, async () => {
      await clickOnAtom(page, 'C', 1);
    });
    await resetCurrentTool(page);
    await takeEditorScreenshot(page);
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
    await clickOnCanvas(page, point.x, point.y, { button: 'right' });
    await takeEditorScreenshot(page);
  });

  test('Check right-click property change for atoms', async ({ page }) => {
    await openFileAndAddToCanvas('KET/chain.ket', page);
    const point = await getAtomByIndex(page, { label: 'C' }, 1);
    await clickOnCanvas(page, point.x, point.y, { button: 'right' });
    await page.getByText('Query properties').click();
    await page.getByText('Ring bond count').click();
    await takeEditorScreenshot(page);
    await page.getByRole('button', { name: 'As drawn' }).first().click();
    await page.getByText('Aromaticity').click();
    await takeEditorScreenshot(page);
    await page.getByRole('button', { name: 'aliphatic' }).click();
    await page.getByText('Unsaturated').first().click();
    await takeEditorScreenshot(page);
    await CommonLeftToolbar(page).areaSelectionDropdownButton.click();
    await takeEditorScreenshot(page);
  });

  test('Check editing for atoms', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5880
    Description: Carbon atom changes to Oxygen.
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);
    const point = await getAtomByIndex(page, { label: 'C' }, 1);
    await clickOnCanvas(page, point.x, point.y, { button: 'right' });
    await page.getByText('Edit...').click();
    await page.getByLabel('Label').click();
    await page.getByLabel('Label').fill('N');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
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
    await clickOnCanvas(page, point.x, point.y, { button: 'right' });
    await takeEditorScreenshot(page);
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
    await clickOnCanvas(page, point.x, point.y, { button: 'right' });
    await takeEditorScreenshot(page);
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
    await clickOnCanvas(page, point.x, point.y, { button: 'right' });
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
    await moveMouseAway(page);
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
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
    await clickOnCanvas(page, point.x, point.y, { button: 'right' });
    await page.getByText('Enhanced stereochemistry...').click();
    await page.getByLabel('Create new OR Group').check();
    await pressButton(page, 'Apply');

    await takeEditorScreenshot(page);

    await page.getByRole('button', { name: 'Settings' }).click();
    await page.getByText('Stereochemistry', { exact: true }).click();
    await page
      .locator('label')
      .filter({ hasText: 'Ignore the chiral flag' })
      .locator('div >> span, span')
      .first()
      .click();
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Check deleting for atoms', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5883
    Description: Atom is deleted by right-click menu
    */
    await openFileAndAddToCanvas('KET/chain-with-stereo.ket', page);
    const point = await getAtomByIndex(page, { label: 'C' }, 2);
    await clickOnCanvas(page, point.x, point.y, { button: 'right' });
    await page.getByText('Delete').click();
    await takeEditorScreenshot(page);
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
    await clickOnCanvas(page, point.x, point.y);
    point = await getAtomByIndex(page, { label: 'O' }, 0);
    await clickOnCanvas(page, point.x, point.y);
    await page.keyboard.up('Shift');
    point = await getAtomByIndex(page, { label: 'N' }, 0);
    await clickOnCanvas(page, point.x, point.y, { button: 'right' });
    await page.getByText('Delete').click();
    await takeEditorScreenshot(page);
  });

  test('Close menu by clicking on canvas', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-10075
    Description: Menu is closed, no new atoms or structures are added to canvas
    */
    const canvasClickX = 300;
    const canvasClickY = 300;
    const atomToolbar = RightToolbar(page);

    await openFileAndAddToCanvas('KET/chain.ket', page);
    await atomToolbar.clickAtom(Atom.Oxygen);
    const point = await getAtomByIndex(page, { label: 'C' }, 2);
    await clickOnCanvas(page, point.x, point.y, { button: 'right' });
    await clickOnCanvas(page, canvasClickX, canvasClickY);
    await takeEditorScreenshot(page);
  });

  test('Right click on an Atom with selected S-Group tool not opens S-Group Properties window', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-10082
    Description: Opens right-click menu for atom
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);
    await LeftToolbar(page).sGroup();
    const point = await getAtomByIndex(page, { label: 'C' }, 2);
    await clickOnCanvas(page, point.x, point.y, { button: 'right' });
    await takeEditorScreenshot(page);
  });

  test('Right click on a Bond with selected S-Group tool not opens S-Group Properties window', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-10082
    Description: Opens right-click menu for bond
    */
    await openFileAndAddToCanvas('KET/chain.ket', page);
    await LeftToolbar(page).sGroup();
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await clickOnCanvas(page, point.x, point.y, { button: 'right' });
    await takeEditorScreenshot(page);
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
    await clickOnCanvas(page, point.x, point.y, { button: 'right' });
    await page.getByText('Attach S-Group...', { exact: true }).click();
    await page.getByPlaceholder('Enter name').click();
    await page.getByPlaceholder('Enter name').fill('A!@#$$$test');
    await page.getByPlaceholder('Enter value').click();
    await page.getByPlaceholder('Enter value').fill('Test!@#$%');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
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
    await clickOnCanvas(page, point.x, point.y);
    point = await getAtomByIndex(page, { label: 'C' }, 2);
    await clickOnCanvas(page, point.x, point.y);
    point = await getAtomByIndex(page, { label: 'C' }, 3);
    await clickOnCanvas(page, point.x, point.y);
    await page.keyboard.up('Shift');

    point = await getAtomByIndex(page, { label: 'C' }, 1);
    await clickOnCanvas(page, point.x, point.y, { button: 'right' });
    await page.getByText('Edit...').click();
    await page.getByLabel('Label').click();
    await page.getByLabel('Label').fill('N');
    await pressButton(page, 'Apply');
    await takeEditorScreenshot(page);
  });

  test('Multiple Bond editing by right-click menu', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-15497
    Description: Three selected Single Bonds changed to Double Bonds.
    */
    let point: { x: number; y: number };
    await openFileAndAddToCanvas('KET/chain.ket', page);
    point = await getBondByIndex(page, { type: BondType.SINGLE }, 1);
    await page.keyboard.down('Shift');
    await clickOnCanvas(page, point.x, point.y);
    point = await getBondByIndex(page, { type: BondType.SINGLE }, 2);
    await clickOnCanvas(page, point.x, point.y);
    point = await getBondByIndex(page, { type: BondType.SINGLE }, 3);
    await clickOnCanvas(page, point.x, point.y);
    await page.keyboard.up('Shift');

    point = await getBondByIndex(page, { type: BondType.SINGLE }, 1);
    await clickOnCanvas(page, point.x, point.y, { button: 'right' });
    await page.getByText('Double', { exact: true }).click();
    await takeEditorScreenshot(page);
  });

  test('Verify that the "Highlight" option appears below "Add attachment point." for selected atom', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4984
    Description: "Highlight" option appears below "Add attachment point." for selected atom.
    Case:
      1. Add Benzene ring on canvas
      2. Right-click on the atom
      3. Observes the "Highlight" option
    */
    await drawBenzeneRing(page);
    await clickOnAtom(page, 'C', 0, 'right');
    await takeEditorScreenshot(page);
  });

  test('Verify that the "Highlight" option appears below "Attach S-Group." for selected bond', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4984
    Description: "Highlight" option appears below "Attach S-Group." for selected bond.
    Case:
      1. Add Benzene ring on canvas
      2. Right-click on the bond
      3. Observes the "Highlight" option
    */
    await drawBenzeneRing(page);
    await clickOnBond(page, BondType.SINGLE, 1, 'right');
    await takeEditorScreenshot(page);
  });

  test('Verify that the "Highlight" option appears below "Enhanced stereochemistry," separated by a horizontal delimiter line for selected multiple atoms and bonds', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4984
    Description: "Highlight" option appears below "Enhanced stereochemistry," separated by a horizontal delimiter line for selected multiple atoms and bonds.
    Case:
      1. Add Benzene ring on canvas
      2. Select multiple atoms and bonds
      2. Right-click on the atom
      3. Observes the "Highlight" option
    */
    await drawBenzeneRing(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await page.keyboard.down('Shift');
    await clickOnBond(page, BondType.DOUBLE, 1);
    await clickOnAtom(page, 'C', 2);
    await page.keyboard.up('Shift');
    await clickOnAtom(page, 'C', 2, 'right');
    await takeEditorScreenshot(page);
  });

  test('Click on the "Highlight" option and confirm that the standard colors are displayed (eight colors and a "No highlight" option)', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4984
    Description: "Highlight" option standard colors are displayed (eight colors and a "No highlight" option).
    Case:
      1. Add Benzene ring on canvas
      2. Right-click on the atom
      3. Click on the "Highlight" option
    */
    await drawBenzeneRing(page);
    await clickOnAtom(page, 'C', 0, 'right');
    await page.getByText('Highlight', { exact: true }).click();
    await takeEditorScreenshot(page);
  });

  test('Select each color individually and verify that the selected atoms are highlighted with the chosen color', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/4984
      Description: The selected atoms are highlighted with the chosen color.
      Steps:
        1. Add Benzene ring on the canvas.
        2. Right-click on an atom.
        3. Click on the "Highlight" option.
        4. Select each color individually and verify the highlights.
    */
    await drawBenzeneRing(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    const colors = [
      '.css-cyxjjb', // Red
      '.css-55t14h', // Orange
      '.css-q0qzfh', // Yellow
      '.css-1pz88a0', // Green
      '.css-d1acvy', // Blue
      '.css-1jrzwzn', // Pink
      '.css-1kxl817', // Burgundy
      '.css-1j267jk', // Purple
    ];

    for (const color of colors) {
      await clickOnAtom(page, 'C', 0, 'right');
      await page.getByText('Highlight', { exact: true }).click();
      await page.locator(color).click();
      await takeEditorScreenshot(page);
    }
  });

  test('Select each color individually and verify that the selected bonds are highlighted with the chosen color', async ({
    page,
  }) => {
    /*
      Test case: https://github.com/epam/ketcher/issues/4984
      Description: The selected bonds are highlighted with the chosen color.
      Steps:
        1. Add Benzene ring on the canvas.
        2. Right-click on an bond.
        3. Click on the "Highlight" option.
        4. Select each color individually and verify the highlights.
    */
    await drawBenzeneRing(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    const colors = [
      '.css-cyxjjb', // Red
      '.css-55t14h', // Orange
      '.css-q0qzfh', // Yellow
      '.css-1pz88a0', // Green
      '.css-d1acvy', // Blue
      '.css-1jrzwzn', // Pink
      '.css-1kxl817', // Burgundy
      '.css-1j267jk', // Purple
    ];

    for (const color of colors) {
      await clickOnBond(page, BondType.SINGLE, 1, 'right');
      await page.getByText('Highlight', { exact: true }).click();
      await page.locator(color).click();
      await takeEditorScreenshot(page);
    }
  });

  test('Select the "No highlight" option and confirm that the highlight is removed from the selected elements', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4984
    Description: The highlight is removed from the selected elements.
    Case:
      1. Add Benzene ring on canvas
      2. Select all structure
      3. Right-click on the atom
      4. Higlight all structure
      5. Select all structure
      6. Right-click on the atom
      7. Select the "No highlight" option
    */
    await drawBenzeneRing(page);
    await selectAllStructuresOnCanvas(page);
    await clickOnAtom(page, 'C', 0, 'right');
    await page.getByText('Highlight', { exact: true }).click();
    await page.locator('.css-d1acvy').click(); // Blue
    await clickOnCanvas(page, 100, 100);
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await clickOnAtom(page, 'C', 0, 'right');
    await page.getByText('Highlight', { exact: true }).click();
    await page.getByText('No highlight').click();
    await clickOnCanvas(page, 100, 100);
    await takeEditorScreenshot(page);
  });

  test('Perform undo and redo operations after applying a highlight and verify that the highlight state is accurately restored', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4984
    Description: The highlight state is accurately restored.
    Case:
      1. Add Benzene ring on canvas
      2. Select all structure
      3. Right-click on the atom
      4. Higlight all structure
      5. Perform Undo/Redo actions
    */
    await drawBenzeneRing(page);
    await selectAllStructuresOnCanvas(page);
    await clickOnAtom(page, 'C', 0, 'right');
    await page.getByText('Highlight', { exact: true }).click();
    await page.locator('.css-d1acvy').click(); // Blue
    await clickOnCanvas(page, 100, 100);
    await takeEditorScreenshot(page);
    await screenshotBetweenUndoRedo(page);
    await takeEditorScreenshot(page);
  });

  test('Apply different highlights to different atoms/bonds and ensure that the highlights do not interfere with each other', async ({
    page,
  }) => {
    /*
    Test case: https://github.com/epam/ketcher/issues/4984
    Description: The highlights do not interfere with each other.
    Case:
      1. Add Benzene ring on canvas
      2. Highlight different atoms/bonds
      3. Verify that the highlights do not interfere with each other
    */
    const highlights = [
      { type: 'atom', index: 0, colorClass: '.css-cyxjjb' }, // Red
      {
        type: 'bond',
        index: 0,
        bondType: BondType.SINGLE,
        colorClass: '.css-d1acvy', // Blue
      },
      { type: 'atom', index: 1, colorClass: '.css-1pz88a0' }, // Green
      {
        type: 'bond',
        index: 1,
        bondType: BondType.SINGLE,
        colorClass: '.css-q0qzfh', // Yellow
      },
      { type: 'atom', index: 2, colorClass: '.css-1pz88a0' }, // Green
      {
        type: 'bond',
        index: 2,
        bondType: BondType.SINGLE,
        colorClass: '.css-1j267jk', // Purple
      },
      { type: 'atom', index: 3, colorClass: '.css-55t14h' }, // Orange
      {
        type: 'bond',
        index: 0,
        bondType: BondType.DOUBLE,
        colorClass: '.css-1jrzwzn', // Pink
      },
    ];

    await drawBenzeneRing(page);

    for (const highlight of highlights) {
      if (highlight.type === 'atom') {
        await clickOnAtom(page, 'C', highlight.index, 'right');
      } else if (
        highlight.type === 'bond' &&
        highlight.bondType !== undefined
      ) {
        await clickOnBond(page, highlight.bondType, highlight.index, 'right');
      }
      await page.getByText('Highlight', { exact: true }).click();
      await page.locator(highlight.colorClass).click();
      await clickOnCanvas(page, 100, 100);
    }
    await takeEditorScreenshot(page);
  });
});
