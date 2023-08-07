/* eslint-disable no-magic-numbers */
import { Page, test } from '@playwright/test';
import {
  selectFunctionalGroups,
  FunctionalGroups,
  selectLeftPanelButton,
  LeftPanelButton,
  clickInTheMiddleOfTheScreen,
  pressButton,
  delay,
  resetCurrentTool,
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  TopPanelButton,
  selectTopPanelButton,
  getControlModifier,
  pasteFromClipboardAndAddToCanvas,
  selectAtomInToolbar,
  AtomButton,
  selectRing,
  RingButton,
  selectNestedTool,
  RgroupTool,
  moveMouseToTheMiddleOfTheScreen,
  selectSaltsAndSolvents,
  SaltsAndSolvents,
  drawFGAndDrag,
  DELAY_IN_SECONDS,
  pressTab,
  FILE_TEST_DATA,
  STRUCTURE_LIBRARY_BUTTON_NAME,
} from '@utils';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { TestIdSelectors } from '@utils/selectors/testIdSelectors';
let point: { x: number; y: number };

const CANVAS_CLICK_X = 300;
const CANVAS_CLICK_Y = 300;

async function cutAndPaste(page: Page) {
  const modifier = getControlModifier();
  await page.getByTestId(TestIdSelectors.RectangleSelection).click();
  // to focus in Editor
  await clickInTheMiddleOfTheScreen(page);
  await page.keyboard.press(`${modifier}+KeyA`);
  await page.keyboard.press(`${modifier}+KeyX`);
  await page.keyboard.press(`${modifier}+KeyV`);
}

async function copyAndPaste(page: Page) {
  const modifier = getControlModifier();
  await page.getByTestId(TestIdSelectors.RectangleSelection).click();
  // to focus in Editor
  await clickInTheMiddleOfTheScreen(page);
  await page.keyboard.press(`${modifier}+KeyA`);
  await page.keyboard.press(`${modifier}+KeyC`);
  await page.keyboard.press(`${modifier}+KeyV`);
}

async function saveToTemplates(page: Page) {
  await selectTopPanelButton(TopPanelButton.Save, page);
  await page.getByRole('button', { name: 'Save to Templates' }).click();
  await page.getByPlaceholder('template').click();
  await page.getByPlaceholder('template').fill('My Template');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
}

async function changeStatusOfAbbreviation(
  page: Page,
  abbreviationStatus: string,
) {
  await clickInTheMiddleOfTheScreen(page, 'right');
  await page.getByText(abbreviationStatus).click();
}

test.describe('Functional Groups', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Open from V2000 file with expanded functional group', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2890
    Description: Functional Group contract and remove abbreviation
    */
    await openFileAndAddToCanvas('functional-groups-expanded.mol', page);

    await changeStatusOfAbbreviation(page, 'Contract Abbreviation');
    await takeEditorScreenshot(page);

    await page.getByText('Bz').click({ button: 'right' });
    await page.getByText('Remove Abbreviation').click();
  });

  test('Open from V2000 file with contracted functional group', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2891
    Description: Functional Group expand and remove abbreviation
    */
    await openFileAndAddToCanvas('functional-group-contracted.mol', page);

    await changeStatusOfAbbreviation(page, 'Expand Abbreviation');
    await takeEditorScreenshot(page);

    await changeStatusOfAbbreviation(page, 'Remove Abbreviation');
  });

  test('Open functional group from library', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2895
    Description: Contracted functional group is on the canvas. FG added on canvas near cursor.
    */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await pressTab(page, 'Functional Groups');
    await selectFunctionalGroups(FunctionalGroups.FMOC, page);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
  });

  test('Copy/Paste action with expanded functional group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2897
    Description: Functional group is copied and pasted as expanded.
    */
    await openFileAndAddToCanvas('functional-groups-expanded.mol', page);
    await copyAndPaste(page);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
  });

  test('Cut/Paste action with expanded functional group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2897
    Description: Functional group is cut and pasted as expanded.
    */
    await openFileAndAddToCanvas('functional-groups-expanded.mol', page);
    await cutAndPaste(page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Copy/Paste action with contracted functional group', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2898
    Description: Functional group is copied and pasted as expanded.
    */
    await openFileAndAddToCanvas('functional-group-contracted.mol', page);
    await copyAndPaste(page);
    await delay(DELAY_IN_SECONDS.THREE);
    await page.mouse.click(CANVAS_CLICK_X, CANVAS_CLICK_Y);
  });

  test('Cut/Paste action with contracted functional group', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2898
    Description: Functional group is cut and pasted as expanded.
    */
    await openFileAndAddToCanvas('functional-group-contracted.mol', page);
    await cutAndPaste(page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Attach functional group to the molecule', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2916
    Description: Contracted FG is connected to the structure.
    */
    await openFileAndAddToCanvas('structure-co2et.mol', page);
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await pressTab(page, 'Functional Groups');
    await selectFunctionalGroups(FunctionalGroups.CO2Et, page);
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
  });

  test('Save functional groups to Custom Templates', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-2953
    Description: Contracted FG is connected to the structure.
    */
    await openFileAndAddToCanvas('custom-template.mol', page);

    await saveToTemplates(page);

    await selectTopPanelButton(TopPanelButton.Clear, page);
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await page.getByRole('button', { name: 'User Templates (1)' }).click();
    await page.getByText('0OOCH3CCl3OO').click();
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
  });
});

test.describe('Functional Groups', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  test('Open from V3000 file with contracted and expanded functional groups', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2893
    Description: Contracted and Expanded functional groups are displayed on the canvas.
    */
    await openFileAndAddToCanvas('V3000-contracted-and-expanded-fg.mol', page);
  });

  test('Open from .ket file with contracted and expanded functional groups', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2894
    Description: Contracted and Expanded functional groups are displayed on the canvas.
    */
    await openFileAndAddToCanvas('expanded-and-contracted-fg.ket', page);
  });

  test('Paste from Clipboard with contracted and expanded functional groups', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-2892
    Description: Contracted and Expanded functional groups are displayed on the canvas.
    */
    await pasteFromClipboardAndAddToCanvas(
      page,
      FILE_TEST_DATA.expandedAndContractedFg,
    );
    await clickInTheMiddleOfTheScreen(page);
  });

  test.fixme(
    'Highlight Functional Group with Selection tool',
    async ({ page }) => {
      /*
    Test case: EPMLSOPKET-2899
    Description: Expanded functional group are highlight with Selection tool.
    */
      const x = 570;
      const y = 320;
      await openFileAndAddToCanvas('functional-group-expanded.mol', page);
      await page.mouse.move(x, y);
    },
  );

  test('Add Bond to expanded Functional Group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5236
    Description: When Adding 'Bond' to expanded Functional Group system display 'Edit Abbreviation' pop-up window.
    */
    await openFileAndAddToCanvas('functional-group-expanded.mol', page);
    await selectLeftPanelButton(LeftPanelButton.SingleBond, page);
    point = await getAtomByIndex(page, { label: 'C' }, 3);
    await page.mouse.click(point.x, point.y);
  });

  test('Add Atom to expanded Functional Group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5238
    Description: When Adding 'Atom' to expanded Functional Group system display 'Edit Abbreviation' pop-up window.
    */
    await openFileAndAddToCanvas('functional-group-expanded.mol', page);
    await selectAtomInToolbar(AtomButton.Nitrogen, page);
    point = await getAtomByIndex(page, { label: 'C' }, 3);
    await page.mouse.click(point.x, point.y);
  });

  test('Add Chain to expanded Functional Group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5237
    Description: When Adding 'Chain' to expanded Functional Group system display 'Edit Abbreviation' pop-up window.
    */
    await openFileAndAddToCanvas('functional-group-expanded.mol', page);
    await selectLeftPanelButton(LeftPanelButton.Chain, page);
    point = await getAtomByIndex(page, { label: 'C' }, 3);
    await page.mouse.click(point.x, point.y);
  });

  test('Add Template to expanded Functional Group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5239
    Description: When Adding 'Template' to expanded Functional Group system display 'Edit Abbreviation' pop-up window.
    */
    await openFileAndAddToCanvas('functional-group-expanded.mol', page);
    await selectRing(RingButton.Benzene, page);
    point = await getAtomByIndex(page, { label: 'C' }, 3);
    await page.mouse.click(point.x, point.y);
  });

  test('Add Charge Plus to expanded Functional Group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5240
    Description: When Adding 'Charge Plus' to expanded Functional Group system display 'Edit Abbreviation' pop-up window.
    */
    await openFileAndAddToCanvas('functional-group-expanded.mol', page);
    await selectLeftPanelButton(LeftPanelButton.ChargePlus, page);
    point = await getAtomByIndex(page, { label: 'C' }, 3);
    await page.mouse.click(point.x, point.y);
  });

  test('Add Charge Minus to expanded Functional Group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5241
    Description: When Adding 'Charge Minus' to expanded Functional Group system display 'Edit Abbreviation' pop-up window.
    */
    await openFileAndAddToCanvas('functional-group-expanded.mol', page);
    await selectLeftPanelButton(LeftPanelButton.ChargeMinus, page);
    point = await getAtomByIndex(page, { label: 'C' }, 3);
    await page.mouse.click(point.x, point.y);
  });

  test('Add Erase to expanded Functional Group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-5242
    Description: When Adding 'Erase' to expanded Functional Group system display 'Edit Abbreviation' pop-up window.
    */
    await openFileAndAddToCanvas('functional-group-expanded.mol', page);
    await selectLeftPanelButton(LeftPanelButton.Erase, page);
    point = await getAtomByIndex(page, { label: 'C' }, 3);
    await page.mouse.click(point.x, point.y);
  });

  test('Click S-Group tool to expanded Functional Group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-3937
    Description: When click 'S-Group tool to expanded Functional Group system display 'Edit Abbreviation' pop-up window.
    */
    await openFileAndAddToCanvas('functional-group-expanded.mol', page);
    await page.keyboard.press('Control+a');
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
  });

  test('Click S-Group tool to contracted Functional Group', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-13009
    Description: When click 'S-Group tool to contracted Functional Group system display 'Edit Abbreviation' pop-up window.
    */
    await openFileAndAddToCanvas('functional-group-contracted.mol', page);
    await page.keyboard.press('Control+a');
    await selectLeftPanelButton(LeftPanelButton.S_Group, page);
  });

  test('Add R-Group Label Tool to expanded Functional Group', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-5244
    Description: When Adding 'R-Group Label Tool' to expanded Functional Group system display 'Edit Abbreviation' pop-up window.
    */
    await openFileAndAddToCanvas('functional-group-expanded.mol', page);
    await selectLeftPanelButton(LeftPanelButton.R_GroupLabelTool, page);
    point = await getAtomByIndex(page, { label: 'C' }, 3);
    await page.mouse.click(point.x, point.y);
  });

  test('Add R-Group Fragment Tool to expanded Functional Group', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-5244
    Description: When Adding 'R-Group Fragment Tool' to expanded Functional Group system display 'Edit Abbreviation' pop-up window.
    */
    await openFileAndAddToCanvas('functional-group-expanded.mol', page);
    await selectNestedTool(page, RgroupTool.R_GROUP_FRAGMENT);
    point = await getAtomByIndex(page, { label: 'C' }, 3);
    await page.mouse.click(point.x, point.y);
  });

  test('Add Attachment Point Tool to expanded Functional Group', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-5244
    Description: When Adding 'Attachment Point Tool' to expanded Functional Group system display 'Edit Abbreviation' pop-up window.
    */
    await openFileAndAddToCanvas('functional-group-expanded.mol', page);
    await selectNestedTool(page, RgroupTool.ATTACHMENT_POINTS);
    point = await getAtomByIndex(page, { label: 'C' }, 3);
    await page.mouse.click(point.x, point.y);
  });

  test('Ordinary elements should not show explicit valences (SO3H)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-8915
    Description: Ordinary elements should not show explicit valences for 'S'.
    */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await pressTab(page, 'Functional Groups');
    await selectFunctionalGroups(FunctionalGroups.SO3H, page);
    await clickInTheMiddleOfTheScreen(page);

    await clickInTheMiddleOfTheScreen(page, 'right');
    await page.getByText('Expand Abbreviation').click();
  });

  test('Ordinary elements should not show explicit valences (PO4H2)', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-8915
    Description: Ordinary elements should not show explicit valences for 'P'.
    */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await pressTab(page, 'Functional Groups');
    await selectFunctionalGroups(FunctionalGroups.PO4H2, page);
    await clickInTheMiddleOfTheScreen(page);

    await clickInTheMiddleOfTheScreen(page, 'right');
    await page.getByText('Expand Abbreviation').click();
  });

  test('Selection highlight is displayed correctly for functional groups with longer names', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-8916
    Description: Selection highlight all abbreviation.
    */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await pressTab(page, 'Functional Groups');
    await selectFunctionalGroups(FunctionalGroups.PhCOOH, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Selection highlight is displayed correctly for salts and solvents with longer names', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-13010
    Description: Selection highlight all abbreviation.
    */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await pressTab(page, 'Salts and Solvents');
    await selectSaltsAndSolvents(SaltsAndSolvents.MethaneSulphonicAcid, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await clickInTheMiddleOfTheScreen(page);
  });

  test('Selection highlight appears immediately after hover over text', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-8920
    Description: Selection highlight appears immediately after hover over text.
    */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await pressTab(page, 'Salts and Solvents');
    await selectSaltsAndSolvents(SaltsAndSolvents.MethaneSulphonicAcid, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await page.getByText('me').first().hover();
  });

  test('Add Atom by hotkey to expanded Functional Group', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-8928
    Description: When Adding 'Atom' by hotkey to expanded Functional Group system display 'Edit Abbreviation' pop-up window.
    */
    await openFileAndAddToCanvas('functional-group-expanded.mol', page);
    point = await getAtomByIndex(page, { label: 'C' }, 3);
    await page.mouse.move(point.x, point.y);
    await page.keyboard.press('n');
  });

  test('Add Atom by hotkey to expanded Salts and Solvents', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-8928
    Description: When Adding 'Atom' by hotkey to expanded Salts and Solvents system display 'Edit Abbreviation' pop-up window.
    */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await pressTab(page, 'Salts and Solvents');
    await selectSaltsAndSolvents(SaltsAndSolvents.MethaneSulphonicAcid, page);
    await clickInTheMiddleOfTheScreen(page);

    await clickInTheMiddleOfTheScreen(page, 'right');
    await page.getByText('Expand Abbreviation').click();

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    point = await getAtomByIndex(page, { label: 'S' }, 0);
    await page.mouse.move(point.x, point.y);
    await page.keyboard.press('n');
  });

  test('Add Functional Group abbreviation to FG connected to terminal atoms of structure', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-10112
    Description: With each addition of FG to FG connected to terminal atoms of structure,
    bond is not disappears and structure is not decreases.
    */
    const x = 540;
    const y = 350;
    await openFileAndAddToCanvas('chain.ket', page);
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await pressTab(page, 'Functional Groups');
    await selectFunctionalGroups(FunctionalGroups.CN, page);
    point = await getAtomByIndex(page, { label: 'C' }, 0);
    await page.mouse.click(point.x, point.y);

    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await pressTab(page, 'Functional Groups');
    await selectFunctionalGroups(FunctionalGroups.Ms, page);
    await page.mouse.click(x, y);
    await resetCurrentTool(page);
  });

  test('Hotkey (Del) can delete Functional Groups abbreviation', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-11844
    Description: Hotkey (Del) delete Functional Groups abbreviation.
    */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await pressTab(page, 'Functional Groups');
    await selectFunctionalGroups(FunctionalGroups.Boc, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    await page.keyboard.press('Delete');
    await resetCurrentTool(page);
  });

  test('Hotkey (Del) can delete Salts and Solvents abbreviation', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-11844
    Description: Hotkey (Del) delete Salts and Solvents abbreviation.
    */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await pressTab(page, 'Salts and Solvents');
    await selectSaltsAndSolvents(SaltsAndSolvents.MethaneSulphonicAcid, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    await page.keyboard.press('Delete');
    await resetCurrentTool(page);
  });

  test.skip('Hotkey for Atom can replace Functional Groups abbreviation', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-11845
    Description: Hotkey for Atom (e.g. N) replace Functional Group abbreviation.
    */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await pressTab(page, 'Functional Groups');
    await selectFunctionalGroups(FunctionalGroups.Boc, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    await page.keyboard.press('n');
    await resetCurrentTool(page);
  });

  test.skip('Hotkey for Atom can replace Salts and Solvents abbreviation', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-11845
    Description: Hotkey for Atom (e.g. N) replace Salts and Solvents abbreviation.
    */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await pressTab(page, 'Salts and Solvents');
    await selectSaltsAndSolvents(SaltsAndSolvents.MethaneSulphonicAcid, page);
    await clickInTheMiddleOfTheScreen(page);

    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await moveMouseToTheMiddleOfTheScreen(page);
    await page.keyboard.press('o');
    await resetCurrentTool(page);
  });

  test('Select Functional Group by hovering one of the atom of structure and press hotkey', async ({
    page,
  }) => {
    /*
    Test case: EPMLSOPKET-11849
    Description: Structure on canvas not becomes 'undefined' when atom is hovered and Functional Group selected using hotkey.
    */
    await openFileAndAddToCanvas('chain.ket', page);
    point = await getAtomByIndex(page, { label: 'C' }, 3);
    await page.mouse.move(point.x, point.y);
    await page.keyboard.press('Shift+t');
    await pressTab(page, 'Functional Groups');
    await page.getByTitle('Boc').click();
    await clickInTheMiddleOfTheScreen(page);
    await resetCurrentTool(page);
  });

  test('Expand/Contract unknown superatom', async ({ page }) => {
    /*
    Test case: EPMLSOPKET-11851
    Description: Unknown superatom expand and contract.
    */
    await openFileAndAddToCanvas('unknown-superatom.mol', page);
    await clickInTheMiddleOfTheScreen(page, 'right');
    await page.getByText('Expand Abbreviation').click();
    await takeEditorScreenshot(page);

    await clickInTheMiddleOfTheScreen(page, 'right');
    await page.getByText('Contract Abbreviation').click();
  });

  test.fixme(
    'Check that expanded Functional Groups not overlap each other',
    async ({ page }) => {
      /*
      Test case: EPMLSOPKET-12977
      Description: Expanded Functional Groups not overlap each other
    */
      await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
      await pressTab(page, 'Functional Groups');
      await selectFunctionalGroups(FunctionalGroups.Cbz, page);
      await clickInTheMiddleOfTheScreen(page);

      await drawFGAndDrag(FunctionalGroups.Boc, 50, page);

      await page.keyboard.press('Control+a');
      await clickInTheMiddleOfTheScreen(page, 'right');
      await page.getByText('Expand Abbreviation').click();
    },
  );

  test.skip('After expand a Functional Group hotkeys not stop working', async ({
    page,
  }) => {
    /*
      Test case: EPMLSOPKET-12987
      Description: After expand a Functional Group hotkeys not stop working
    */
    await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
    await pressTab(page, 'Functional Groups');
    await selectFunctionalGroups(FunctionalGroups.Cbz, page);
    await clickInTheMiddleOfTheScreen(page);

    await clickInTheMiddleOfTheScreen(page, 'right');
    await page.getByText('Expand Abbreviation').click();

    await page.keyboard.press('n');
  });
});
