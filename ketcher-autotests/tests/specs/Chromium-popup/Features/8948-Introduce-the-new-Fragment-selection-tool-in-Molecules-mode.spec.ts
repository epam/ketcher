import { test, expect, Page } from '@fixtures';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { SelectionTypePanel } from '@tests/pages/common/SelectionTypePanel';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { MonomerWizardOption } from '@tests/pages/constants/contextMenu/Constants';
import { MonomerType } from '@tests/pages/constants/createMonomerDialog/Constants';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  CreateMonomerDialog,
  selectAtomAndBonds,
} from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import {
  clickInTheMiddleOfTheCanvas,
  getTooltipLocator,
  getVisibleCanvas,
  keyboardPressOnCanvas,
  takeEditorScreenshot,
} from '@utils';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { pasteFromClipboardAndOpenAsNewProject } from '@utils/files/readFile';
import { getBondLocator } from '@utils/macromolecules/polymerBond';

async function getMoleculesCanvasSvg(page: Page) {
  const canvas = (await getVisibleCanvas(page)).locator(
    '[class*="intermediateCanvas"] > svg',
  );
  await expect(canvas).toHaveCount(1);
  await expect(canvas).toBeVisible();
  return canvas;
}

let page: Page;

test.describe('Fragment Selection tool in Molecules mode', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

  test('Case 1 - Fragment Selection is the last tool in the selection tools menu', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12489
     * Description: Fragment Selection tool is present as the last tool in the selection tools menu in Molecules mode
     * Scenario:
     * 1. Open Molecules mode
     * 2. Expand the selection tools menu
     * 3. Verify the menu contains Rectangle, Lasso, Structure and Fragment Selection tools and Fragment Selection is the last one
     *
     * Version 3.13.0
     */
    const selectionTypePanel = SelectionTypePanel(page);

    await selectionTypePanel.expand();

    expect(await selectionTypePanel.getToolTypes()).toEqual([
      SelectionToolType.Rectangle,
      SelectionToolType.Lasso,
      SelectionToolType.Structure,
      SelectionToolType.Fragment,
    ]);
    await selectionTypePanel.collapse();
  });

  test('Case 2 - Fragment Selection is absent in Macro mode', async ({
    FlexCanvas: _,
  }) => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12489
     * Description: Fragment Selection tool is absent in the selection tools menu in Macro mode
     * Scenario:
     * 1. Switch to Macro mode (Flex layout)
     * 2. Expand the selection tools menu
     * 3. Verify the menu contains only Rectangle, Lasso and Structure Selection tools
     *
     * Version 3.13.0
     */
    const selectionTypePanel = SelectionTypePanel(page);

    await selectionTypePanel.expand();

    expect(await selectionTypePanel.getToolTypes()).toEqual([
      SelectionToolType.Rectangle,
      SelectionToolType.Lasso,
      SelectionToolType.Structure,
    ]);
    await selectionTypePanel.collapse();
  });

  test('Case 3 - Fragment Selection tooltip displays the tool name and hotkey', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12489
     * Description: Tooltip of the Fragment Selection tool displays correct text and hotkey
     * Scenario:
     * 1. Open Molecules mode
     * 2. Expand the selection tools menu
     * 3. Verify the tooltip of the Fragment Selection tool is "Fragment Selection (Shift+Tab)"
     *
     * Version 3.13.0
     */
    const selectionTypePanel = SelectionTypePanel(page);

    await selectionTypePanel.expand();

    await expect(
      selectionTypePanel.toolButton(SelectionToolType.Fragment),
    ).toHaveAttribute('title', 'Fragment Selection (Shift+Tab)');
    await selectionTypePanel.collapse();
  });

  test('Case 4 - Shift+Tab hotkey activates Fragment Selection tool', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12489
     * Description: Shift+Tab hotkey activates the Fragment Selection tool
     * Scenario:
     * 1. Open Molecules mode and select Rectangle Selection tool
     * 2. Press Shift+Tab three times
     * 3. Verify Fragment Selection tool is active
     *
     * Version 3.13.0
     */
    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickInTheMiddleOfTheCanvas(page);

    for (let i = 0; i < 3; i++) {
      await keyboardPressOnCanvas(page, 'Shift+Tab');
    }

    await expect(SelectionTypePanel(page).currentToolButton).toHaveAttribute(
      'data-testid',
      SelectionToolType.Fragment,
    );
  });

  test('Case 5 - Structure Selection tool is renamed in tooltip in Micro and Macro modes', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12489
     * Description: Structure Selection tool tooltip is "Structure Selection (Shift+Tab)" in both Micro and Macro modes
     * Scenario:
     * 1. Open Molecules mode and expand the selection tools menu
     * 2. Verify the tooltip of the Structure Selection tool
     * 3. Switch to Macro mode and expand the selection tools menu
     * 4. Verify the tooltip of the Structure Selection tool
     *
     * Version 3.13.0
     */
    const selectionTypePanel = SelectionTypePanel(page);
    const structureSelectionTooltip = 'Structure Selection (Shift+Tab)';

    await selectionTypePanel.expand();
    await expect(
      selectionTypePanel.toolButton(SelectionToolType.Structure),
    ).toHaveAttribute('title', structureSelectionTooltip);
    await selectionTypePanel.collapse();

    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await selectionTypePanel.expand();
    await expect(
      selectionTypePanel.toolButton(SelectionToolType.Structure),
    ).toHaveAttribute('title', structureSelectionTooltip);
    await selectionTypePanel.collapse();
  });

  test('Case 6 - Hovering left or right side of a bond not in a cycle shows arrows and blue outline', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12489
     * Description: Hovering a side of a bond that is not in a cycle shows arrows and a blue outline for that side
     * Scenario:
     * 1. Add a chain of six carbons (CCCCCC) to the canvas
     * 2. Select Fragment Selection tool
     * 3. Hover the left side of the middle bond
     * 4. Verify the cursor is not forbidden, arrows and outline mark the left fragment
     * 5. Hover the right side of the middle bond
     * 6. Verify the cursor is not forbidden, arrows and outline mark the right fragment
     *
     * Version 3.13.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
    const canvas = await getMoleculesCanvasSvg(page);
    const middleBond = getBondLocator(page, { bondId: 2 });

    await middleBond.hover({ force: true, position: { x: 9, y: 5 } });
    await expect(canvas).not.toHaveCSS('cursor', /not-allowed/);
    await takeEditorScreenshot(page);

    await middleBond.hover({ force: true, position: { x: 26, y: 15 } });
    await expect(canvas).not.toHaveCSS('cursor', /not-allowed/);
    await takeEditorScreenshot(page);
  });

  test('Case 7 - Hovering a bond in a cycle shows forbidden cursor and no arrows', async () => {
    const cycleBondTooltip =
      'Fragment Selection Tool cannot be used on bonds that participate in a cycle.';

    /*
     * Test task: https://github.com/epam/ketcher/issues/12489
     * Description: Hovering a bond that participates in a cycle shows the forbidden cursor and no arrows
     * Scenario:
     * 1. Add ethylcyclohexane (C1CCCCC1CC) to the canvas
     * 2. Select Fragment Selection tool
     * 3. Hover a bond of the ring
     * 4. Verify the cursor is forbidden and no arrows or outline are shown
     *
     * Version 3.13.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'C1CCCCC1CC');
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);

    await getBondLocator(page, { bondId: 0 }).hover({
      force: true,
      position: { x: 10, y: 0 },
    });

    await expect(await getMoleculesCanvasSvg(page)).toHaveCSS(
      'cursor',
      /not-allowed/,
    );
    await expect(getTooltipLocator(page)).toHaveText(cycleBondTooltip);
    await takeEditorScreenshot(page);
  });

  test('Case 8 - Tooltip appears after 200 ms when hovering over a bond in a cycle', async () => {
    const cycleBondTooltip =
      'Fragment Selection Tool cannot be used on bonds that participate in a cycle.';

    /*
     * Test task: https://github.com/epam/ketcher/issues/12489
     * Description: Tooltip for a bond in a cycle appears not earlier than 200 ms after hovering
     * Scenario:
     * 1. Add ethylcyclohexane (C1CCCCC1CC) to the canvas
     * 2. Select Fragment Selection tool
     * 3. Hover a bond of the ring
     * 4. Verify the tooltip with the explanation appears not earlier than 200 ms after the hover
     *
     * Version 3.13.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'C1CCCCC1CC');
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
    const tooltip = getTooltipLocator(page);
    await expect(tooltip).toBeHidden();

    const hoverStartedAt = Date.now();
    await getBondLocator(page, { bondId: 0 }).hover({
      force: true,
      position: { x: 10, y: 0 },
    });
    await tooltip.waitFor({ state: 'visible' });

    expect(Date.now() - hoverStartedAt).toBeGreaterThanOrEqual(200);
    await expect(tooltip).toHaveText(cycleBondTooltip);
  });

  test('Case 9 - Hover outlines all atoms and bonds on the hovered side of a bond', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12489
     * Description: Hovering a side of a bond outlines all atoms and bonds of the fragment on that side
     * Scenario:
     * 1. Add ethylcyclohexane (C1CCCCC1CC) to the canvas
     * 2. Select Fragment Selection tool
     * 3. Hover the bond between the ring and the ethyl group on the ring side
     * 4. Verify all atoms and bonds of the ring are outlined
     *
     * Version 3.13.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'C1CCCCC1CC');
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);

    await getBondLocator(page, { bondId: 6 }).hover({
      force: true,
      position: { x: 10, y: 0 },
    });

    await takeEditorScreenshot(page);
  });

  test('Case 10 - Clicking on a side of a bond selects the corresponding fragment', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12489
     * Description: Clicking a side of a bond selects the fragment on that side, the bond itself is not selected
     * Scenario:
     * 1. Add a chain of six carbons (CCCCCC) to the canvas
     * 2. Select Fragment Selection tool
     * 3. Click the right side of the middle bond
     * 4. Verify only the right fragment is selected
     * 5. Click the left side of the middle bond
     * 6. Verify only the left fragment is selected
     *
     * Version 3.13.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
    const middleBond = getBondLocator(page, { bondId: 2 });

    await middleBond.click({ force: true, position: { x: 26, y: 15 } });
    const rightFragment = await page.evaluate(() =>
      globalThis.window.ketcher.editor.selection(),
    );
    expect(new Set(rightFragment?.atoms)).toEqual(new Set([3, 4, 5]));
    expect(new Set(rightFragment?.bonds)).toEqual(new Set([3, 4]));

    await middleBond.click({ force: true, position: { x: 9, y: 5 } });
    const leftFragment = await page.evaluate(() =>
      globalThis.window.ketcher.editor.selection(),
    );
    expect(new Set(leftFragment?.atoms)).toEqual(new Set([0, 1, 2]));
    expect(new Set(leftFragment?.bonds)).toEqual(new Set([0, 1]));
  });

  test('Case 11 - Clicking on a bond in a cycle does not select any fragment', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12489
     * Description: Fragment Selection tool does not select anything when clicking on a bond in a cycle
     * Scenario:
     * 1. Add ethylcyclohexane (C1CCCCC1CC) to the canvas
     * 2. Select Fragment Selection tool
     * 3. Click a bond of the ring
     * 4. Verify nothing is selected
     *
     * Version 3.13.0
     */
    await pasteFromClipboardAndOpenAsNewProject(page, 'C1CCCCC1CC');
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);

    await getBondLocator(page, { bondId: 0 }).click({
      force: true,
      position: { x: 10, y: 0 },
    });

    const selection = await page.evaluate(() =>
      globalThis.window.ketcher.editor.selection(),
    );
    expect(selection?.atoms ?? []).toEqual([]);
    expect(selection?.bonds ?? []).toEqual([]);
  });

  test('Case 12 - Shift+Tab cycles through all selection tools including Fragment Selection', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12489
     * Description: Repeated Shift+Tab cycles Rectangle, Lasso, Structure and Fragment Selection tools and returns to Rectangle
     * Scenario:
     * 1. Open Molecules mode and select Rectangle Selection tool
     * 2. Press Shift+Tab four times
     * 3. Verify the active tool after each press: Lasso, Structure, Fragment, Rectangle
     *
     * Version 3.13.0
     */
    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );
    await clickInTheMiddleOfTheCanvas(page);

    for (const toolType of [
      SelectionToolType.Lasso,
      SelectionToolType.Structure,
      SelectionToolType.Fragment,
      SelectionToolType.Rectangle,
    ]) {
      await keyboardPressOnCanvas(page, 'Shift+Tab');
      await expect(SelectionTypePanel(page).currentToolButton).toHaveAttribute(
        'data-testid',
        toolType,
      );
    }
  });

  test('Case 13 - Hover in Monomer Creation Wizard does not include already marked nucleotide components', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12489
     * Description: In Monomer Creation Wizard the fragment hover and selection stop at an already marked nucleotide component
     * Scenario:
     * 1. Add a chain of six carbons (CCCCCC) to the canvas
     * 2. Open Monomer Creation Wizard and select Nucleotide (preset) type
     * 3. Mark the first two atoms as Sugar
     * 4. Select Fragment Selection tool and hover the bond between the 3rd and 4th atoms on the left side
     * 5. Verify the Sugar component is not outlined
     * 6. Click the hovered side and verify the Sugar component is not selected
     *
     * Version 3.13.0
     */
    const dialog = CreateMonomerDialog(page);
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    await LeftToolbar(page).createMonomer();
    await dialog.selectType(MonomerType.NucleotidePreset);
    await selectAtomAndBonds(page, { atomIds: [0, 1], bondIds: [0] });
    await ContextMenu(page, getAtomLocator(page, { atomId: 0 })).click([
      MonomerWizardOption.MarkAs,
      MonomerWizardOption.Sugar,
    ]);
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);
    const bond = getBondLocator(page, { bondId: 2 });

    await bond.hover({ force: true, position: { x: 9, y: 5 } });
    await takeEditorScreenshot(page);

    await bond.click({ force: true, position: { x: 9, y: 5 } });
    const selection = await page.evaluate(() =>
      globalThis.window.ketcher.editor.selection(),
    );
    expect(selection?.atoms).toEqual([2]);
    expect(selection?.bonds ?? []).toEqual([]);

    await dialog.discard();
  });

  test('Case 14 - Hover in Monomer Creation Wizard does not include the bond connecting marked and unmarked parts', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/12489
     * Description: In Monomer Creation Wizard the bond connecting a marked component with the rest of the structure is not part of the fragment
     * Scenario:
     * 1. Add a chain of six carbons (CCCCCC) to the canvas
     * 2. Open Monomer Creation Wizard and select Nucleotide (preset) type
     * 3. Mark the first two atoms as Sugar
     * 4. Select Fragment Selection tool and click the bond connecting Sugar with the 3rd atom on the unmarked side
     * 5. Verify the unmarked part is selected without the connecting bond
     *
     * Version 3.13.0
     */
    const dialog = CreateMonomerDialog(page);
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    await LeftToolbar(page).createMonomer();
    await dialog.selectType(MonomerType.NucleotidePreset);
    await selectAtomAndBonds(page, { atomIds: [0, 1], bondIds: [0] });
    await ContextMenu(page, getAtomLocator(page, { atomId: 0 })).click([
      MonomerWizardOption.MarkAs,
      MonomerWizardOption.Sugar,
    ]);
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);

    await getBondLocator(page, { bondId: 1 }).click({
      force: true,
      position: { x: 26, y: 5 },
    });

    const selection = await page.evaluate(() =>
      globalThis.window.ketcher.editor.selection(),
    );
    expect(new Set(selection?.atoms)).toEqual(new Set([2, 3, 4, 5]));
    expect(new Set(selection?.bonds)).toEqual(new Set([2, 3, 4]));

    await dialog.discard();
  });

  test('Case 15 - Gray arrows and tooltip are shown when hovering toward an already marked component in Monomer Creation Wizard', async () => {
    const markedComponentTooltip =
      'The structure fragment in this direction is already marked as a nucleotide component.';

    /*
     * Test task: https://github.com/epam/ketcher/issues/12489
     * Description: Hovering a bond side that leads to a marked component shows gray arrows, forbidden cursor and a tooltip
     * Scenario:
     * 1. Add a chain of six carbons (CCCCCC) to the canvas
     * 2. Open Monomer Creation Wizard and select Nucleotide (preset) type
     * 3. Mark the first two atoms as Sugar
     * 4. Select Fragment Selection tool and hover the bond connecting Sugar with the 3rd atom on the Sugar side
     * 5. Verify the tooltip text, the forbidden cursor and gray arrows
     *
     * Version 3.13.0
     */
    const dialog = CreateMonomerDialog(page);
    await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
    await LeftToolbar(page).createMonomer();
    await dialog.selectType(MonomerType.NucleotidePreset);
    await selectAtomAndBonds(page, { atomIds: [0, 1], bondIds: [0] });
    await ContextMenu(page, getAtomLocator(page, { atomId: 0 })).click([
      MonomerWizardOption.MarkAs,
      MonomerWizardOption.Sugar,
    ]);
    await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Fragment);

    await getBondLocator(page, { bondId: 1 }).hover({
      force: true,
      position: { x: 9, y: 15 },
    });

    await expect(getTooltipLocator(page)).toHaveText(markedComponentTooltip);
    await expect(await getMoleculesCanvasSvg(page)).toHaveCSS(
      'cursor',
      /not-allowed/,
    );
    await takeEditorScreenshot(page);

    await dialog.discard();
  });
});
