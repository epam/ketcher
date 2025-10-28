/* eslint-disable no-inline-comments */
/* eslint-disable no-magic-numbers */
import { test } from '@fixtures';
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
  screenshotBetweenUndoRedo,
  resetZoomLevelToDefault,
  takeElementScreenshot,
  pasteFromClipboardAndOpenAsNewProject,
  openFileAndAddToCanvasAsNewProject,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import { getBondByIndex } from '@utils/canvas/bonds';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { drawBenzeneRing } from '@tests/pages/molecules/BottomToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import {
  AromaticityOption,
  HighlightOption,
  MicroAtomOption,
  MicroBondOption,
  QueryAtomOption,
  RingBondCountOption,
} from '@tests/pages/constants/contextMenu/Constants';
import { EnhancedStereochemistry } from '@tests/pages/molecules/canvas/EnhancedStereochemistry';
import { BondPropertiesDialog } from '@tests/pages/molecules/canvas/BondPropertiesDialog';
import { BondTypeOption } from '@tests/pages/constants/bondProperties/Constants';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import {
  AtomsSetting,
  StereochemistrySetting,
} from '@tests/pages/constants/settingsDialog/Constants';
import { setSettingsOption } from '@tests/pages/molecules/canvas/SettingsDialog';
import { AtomPropertiesDialog } from '@tests/pages/molecules/canvas/AtomPropertiesDialog';

test.describe('Right-click menu', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Check right-click menu for bonds', async ({ page }) => {
    /*
     * Test case: EPMLSOPKET-5872
     * Description: The menu has appeared and contains the list of Bonds.
     *
     * Test task: https://github.com/epam/ketcher/issues/7391
     * Test case: Verify that Delete option in small molecules mode has an icon in right-click menu for bonds
     * Case:
     *      1. Load molecule with bond
     *      2. Right-click on any bond to open context menu
     *      3. Take menu screenshot to validate Delete option icon
     *
     * Version 3.6
     */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await ContextMenu(page, point).open();
    await takeElementScreenshot(page, ContextMenu(page, point).contextMenuBody);
  });

  test('Check right-click submenu for Query bonds', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5876
    Description: The menu has appeared and contains the list of Query Bonds.
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await ContextMenu(page, point).hover(MicroBondOption.QueryBonds);
    await takeEditorScreenshot(page);
  });

  test('Check editing for bonds', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5873
    Description: Single Bond changes on Double Bond.
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await ContextMenu(page, point).click(MicroBondOption.Edit);
    await BondPropertiesDialog(page).selectBondType(BondTypeOption.Double);
    await BondPropertiesDialog(page).apply();
    await takeEditorScreenshot(page);
  });

  test('Check selecting Bond type for bonds', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5874
    Description: Single Bond changes on Double Bond.
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await ContextMenu(page, point).click(MicroBondOption.Double);
    await takeEditorScreenshot(page);
  });

  test('Check deleting for bonds', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5875
    Description: Bond is deleted
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await ContextMenu(page, point).click(MicroBondOption.Delete);
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

    await openFileAndAddToCanvas(page, 'KET/chain.ket');
    await atomToolbar.clickAtom(Atom.Oxygen);
    await waitForRender(page, async () => {
      const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
      await ContextMenu(page, point).click(MicroBondOption.Double);
    });

    await waitForRender(page, async () => {
      await clickOnAtom(page, 'C', 1);
    });
    await CommonLeftToolbar(page).selectAreaSelectionTool();
    await takeEditorScreenshot(page);
  });

  test('Check right-click menu for atoms', async ({ page }) => {
    /*
     * Test case: EPMLSOPKET-5879
     * Description: The menu has appeared and contains the following items:
     * - Edit
     * - Enhanced stereochemistry (Should be grayed out if enhanced stereochemistry can not be added.)
     * - Delete
     *
     *
     * Test task: https://github.com/epam/ketcher/issues/7391
     * Test case: Verify that Delete option in small molecules mode has an icon in right-click menu for atomss
     * Case:
     *      1. Load molecule with atom
     *      2. Right-click on any atom to open context menu
     *      3. Take menu screenshot to validate Delete option icon
     *
     * Version 3.6
     */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await ContextMenu(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 1 }),
    ).open();
    await takeElementScreenshot(
      page,
      ContextMenu(page, getAtomLocator(page, { atomLabel: 'C', atomId: 1 }))
        .contextMenuBody,
    );
  });

  test('Check right-click menu for S-Groups selection', async ({ page }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7391
     * Test case: Verify that Delete option in small molecules mode has an icon in right-click menu for S-Groups selection
     * Case:
     *      1. Load molecule with S-Group
     *      2. Select it all (using Ctrl+A)
     *      3. Right-click on any atom to open context menu
     *      4. Take menu screenshot to validate Delete option icon
     *
     * Version 3.6
     */
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      'CCCCCCCCC |SgD:8,7,6,5,4,3,2,1,0:xxx:vvv::: :|',
    );
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await selectAllStructuresOnCanvas(page);
    await ContextMenu(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 1 }),
    ).open();
    await takeElementScreenshot(
      page,
      ContextMenu(page, getAtomLocator(page, { atomLabel: 'C', atomId: 1 }))
        .contextMenuBody,
    );
  });

  test('Check right-click property change for atoms', async ({ page }) => {
    await openFileAndAddToCanvas(page, 'KET/chain.ket');
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await ContextMenu(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 1 }),
    ).hover([MicroAtomOption.QueryProperties, QueryAtomOption.RingBondCount]);
    await takeEditorScreenshot(page);
    await page.getByTestId(RingBondCountOption.AsDrawn).first().click();
    await page.getByTestId(QueryAtomOption.Aromaticity).click();
    await takeEditorScreenshot(page);
    await page.getByTestId(AromaticityOption.Aliphatic).click();
    await page.getByTestId(QueryAtomOption.Unsaturated).first().click();
    await takeEditorScreenshot(page);
    await CommonLeftToolbar(page).areaSelectionDropdownButton.click();
    await takeEditorScreenshot(page);
  });

  test('Check editing for atoms', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5880
    Description: Carbon atom changes to Oxygen.
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await ContextMenu(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 1 }),
    ).click(MicroAtomOption.Edit);
    await AtomPropertiesDialog(page).fillLabel('N');
    await AtomPropertiesDialog(page).apply();
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
    await openFileAndAddToCanvas(page, 'KET/chain-with-stereo.ket');
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await ContextMenu(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 1 }),
    ).open();
    await takeEditorScreenshot(page);
  });

  test('Check that the menu Enhanced stereochemistry is NOT grayed out if the atom have enhanced stereochemistry', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-5882
    Description: 'Enhanced stereochemistry' is NOT grayed out (User can add Enhanced stereochemistry)
    */
    await openFileAndAddToCanvas(page, 'KET/chain-with-stereo.ket');
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await ContextMenu(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 2 }),
    ).open();
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
    await openFileAndAddToCanvas(page, 'KET/chain-with-stereo.ket');
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await ContextMenu(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 2 }),
    ).click(MicroAtomOption.EnhancedStereochemistry);
    await EnhancedStereochemistry(page).selectCreateNewAndGroup();
    await EnhancedStereochemistry(page).apply();

    await takeEditorScreenshot(page);

    await setSettingsOption(page, StereochemistrySetting.IgnoreTheChiralFlag);
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
    await openFileAndAddToCanvas(page, 'KET/chain-with-stereo.ket');
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await resetZoomLevelToDefault(page);
    await ContextMenu(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 2 }),
    ).click(MicroAtomOption.EnhancedStereochemistry);

    await EnhancedStereochemistry(page).selectCreateNewOrGroup();
    await EnhancedStereochemistry(page).apply();
    await takeEditorScreenshot(page);

    await setSettingsOption(page, StereochemistrySetting.IgnoreTheChiralFlag);
    await takeEditorScreenshot(page);
  });

  test('Check deleting for atoms', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5883
    Description: Atom is deleted by right-click menu
    */
    await openFileAndAddToCanvas(page, 'KET/chain-with-stereo.ket');
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await ContextMenu(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 2 }),
    ).click(MicroAtomOption.Delete);
    await takeEditorScreenshot(page);
  });

  test('Check that there are no error when deleting few stereo bond via context-menu', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-8926
    Description: Only selected atoms and bonds are deleted. No error is thrown.
    */
    // let point: { x: number; y: number };
    await openFileAndAddToCanvasAsNewProject(
      page,
      'KET/chain-with-stereo-and-atoms.ket',
    );
    await page.keyboard.down('Shift');
    await getAtomLocator(page, { atomLabel: 'N', atomId: 2 }).click();
    await getAtomLocator(page, { atomLabel: 'O', atomId: 3 }).click();
    await page.keyboard.up('Shift');
    await ContextMenu(
      page,
      getAtomLocator(page, { atomLabel: 'N', atomId: 2 }),
    ).click(MicroAtomOption.Delete);
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

    await openFileAndAddToCanvas(page, 'KET/chain.ket');
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await atomToolbar.clickAtom(Atom.Oxygen);
    await ContextMenu(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 2 }),
    ).open();
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
    await openFileAndAddToCanvas(page, 'KET/chain.ket');
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await LeftToolbar(page).sGroup();
    await ContextMenu(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 2 }),
    ).open();
    await takeEditorScreenshot(page);
  });

  test('Right click on a Bond with selected S-Group tool not opens S-Group Properties window', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-10082
    Description: Opens right-click menu for bond
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');
    await LeftToolbar(page).sGroup();
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await ContextMenu(page, point).open();
    await takeEditorScreenshot(page);
  });

  test('Check Attach S-Group for bond by right-click menu', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-15495
    Description: S-Group for Bond is attached.
    */
    await openFileAndAddToCanvas(page, 'KET/chain.ket');
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 0);
    await ContextMenu(page, point).click(MicroBondOption.AttachSGroup);
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
    // let point: { x: number; y: number };
    await openFileAndAddToCanvasAsNewProject(page, 'KET/chain.ket');
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await page.keyboard.down('Shift');
    await getAtomLocator(page, { atomLabel: 'C', atomId: 1 }).click();
    await getAtomLocator(page, { atomLabel: 'C', atomId: 2 }).click();
    await getAtomLocator(page, { atomLabel: 'C', atomId: 3 }).click();
    await page.keyboard.up('Shift');
    await ContextMenu(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 1 }),
    ).click(MicroAtomOption.Edit);
    await AtomPropertiesDialog(page).fillLabel('N');
    await AtomPropertiesDialog(page).apply();
    await takeEditorScreenshot(page);
  });

  test('Multiple Bond editing by right-click menu', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-15497
    Description: Three selected Single Bonds changed to Double Bonds.
    */
    let point: { x: number; y: number };
    await openFileAndAddToCanvas(page, 'KET/chain.ket');
    point = await getBondByIndex(page, { type: BondType.SINGLE }, 1);
    await page.keyboard.down('Shift');
    await clickOnCanvas(page, point.x, point.y, { from: 'pageTopLeft' });
    point = await getBondByIndex(page, { type: BondType.SINGLE }, 2);
    await clickOnCanvas(page, point.x, point.y, { from: 'pageTopLeft' });
    point = await getBondByIndex(page, { type: BondType.SINGLE }, 3);
    await clickOnCanvas(page, point.x, point.y, { from: 'pageTopLeft' });
    await page.keyboard.up('Shift');

    point = await getBondByIndex(page, { type: BondType.SINGLE }, 1);
    await ContextMenu(page, point).click(MicroBondOption.Double);
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
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await ContextMenu(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 0 }),
    ).open();
    await takeEditorScreenshot(page);
  });

  test('Check that removed Add attachment point functionality', async ({
    page,
  }) => {
    /*
    * Version 3.8
    Test case: https://github.com/epam/ketcher/issues/7683
    Description: "Add attachment point" functionality removed from right-click menu.
    Case:
      1. Add Benzene ring on canvas
      2. Right-click on the atom
      3. Observes that "Add attachment point" functionality removed from right-click menu.
    */
    await drawBenzeneRing(page);
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await ContextMenu(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 0 }),
    ).open();
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
    const point = await getBondByIndex(page, { type: BondType.SINGLE }, 1);
    await ContextMenu(page, point).open();
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
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await page.keyboard.down('Shift');
    await clickOnBond(page, BondType.DOUBLE, 1);
    await clickOnAtom(page, 'C', 2);
    await page.keyboard.up('Shift');
    await ContextMenu(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 2 }),
    ).open();
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
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await ContextMenu(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 0 }),
    ).hover(MicroAtomOption.Highlight);
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
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
    const colors = [
      HighlightOption.Red,
      HighlightOption.Orange,
      HighlightOption.Yellow,
      HighlightOption.Green,
      HighlightOption.Blue,
      HighlightOption.Pink,
      HighlightOption.Magenta,
      HighlightOption.Purple,
    ];

    for (const color of colors) {
      await ContextMenu(
        page,
        getAtomLocator(page, { atomLabel: 'C', atomId: 0 }),
      ).click([MicroBondOption.Highlight, color]);
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
      HighlightOption.Red,
      HighlightOption.Orange,
      HighlightOption.Yellow,
      HighlightOption.Green,
      HighlightOption.Blue,
      HighlightOption.Pink,
      HighlightOption.Magenta,
      HighlightOption.Purple,
    ];

    for (const color of colors) {
      const point = await getBondByIndex(page, { type: BondType.SINGLE }, 1);
      await ContextMenu(page, point).click([MicroBondOption.Highlight, color]);
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
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await selectAllStructuresOnCanvas(page);
    await ContextMenu(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 0 }),
    ).click([MicroBondOption.Highlight, HighlightOption.Blue]);
    await clickOnCanvas(page, 100, 100);
    await takeEditorScreenshot(page);
    await selectAllStructuresOnCanvas(page);
    await ContextMenu(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 0 }),
    ).click([MicroAtomOption.Highlight, HighlightOption.NoHighlight]);
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
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    await selectAllStructuresOnCanvas(page);
    await ContextMenu(
      page,
      getAtomLocator(page, { atomLabel: 'C', atomId: 0 }),
    ).click([MicroBondOption.Highlight, HighlightOption.Blue]);
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
      { type: 'atom', index: 0, colorClass: HighlightOption.Red },
      {
        type: 'bond',
        index: 0,
        bondType: BondType.SINGLE,
        colorClass: HighlightOption.Blue,
      },
      { type: 'atom', index: 4, colorClass: HighlightOption.Green },
      {
        type: 'bond',
        index: 1,
        bondType: BondType.SINGLE,
        colorClass: HighlightOption.Yellow,
      },
      { type: 'atom', index: 2, colorClass: HighlightOption.Green },
      {
        type: 'bond',
        index: 2,
        bondType: BondType.SINGLE,
        colorClass: HighlightOption.Purple,
      },
      { type: 'atom', index: 5, colorClass: HighlightOption.Orange },
      {
        type: 'bond',
        index: 0,
        bondType: BondType.DOUBLE,
        colorClass: HighlightOption.Pink,
      },
    ];

    await drawBenzeneRing(page);
    await setSettingsOption(page, AtomsSetting.DisplayCarbonExplicitly);
    let point: { x: number; y: number } = { x: 0, y: 0 };
    for (const highlight of highlights) {
      if (highlight.type === 'atom') {
        await ContextMenu(
          page,
          getAtomLocator(page, {
            atomLabel: 'C',
            atomId: highlight.index,
          }),
        ).click([MicroBondOption.Highlight, highlight.colorClass]);
      } else if (
        highlight.type === 'bond' &&
        highlight.bondType !== undefined
      ) {
        point = await getBondByIndex(
          page,
          { type: highlight.bondType },
          highlight.index,
        );
        await ContextMenu(page, point).click([
          MicroBondOption.Highlight,
          highlight.colorClass,
        ]);
      }
    }
    await takeEditorScreenshot(page);
  });
});
