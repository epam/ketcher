/**
 * #9370 — Creating monomers from selections in macromolecules mode (requirements 1.1–1.5).
 *
 * In flex/snake, right-clicking a selection that contains chemical structure shows
 * "Create monomer"; clicking it opens the monomer creation wizard with the structure
 * loaded, and submit/discard returns to the previous macro sub-mode.
 *
 * Verified app behavior (Phase 0 + menu probes):
 * - In macro mode all canvas right-clicks open the ketcher-macromolecules context menus;
 *   the create entry is `create_monomer` in the selected-entities menu.
 * - A free small molecule renders as regular atoms; selecting its atoms shows an
 *   enabled "Create monomer".
 * - A small molecule bonded to a polymer is auto-grouped into a CHEM fragment monomer
 *   ("F1") when the file opens in flex mode; such fragments are not editable monomers,
 *   so a monomer + fragment selection does NOT offer "Create monomer" (documented here).
 */
import { Locator, Page, expect } from '@playwright/test';
import { test } from '@fixtures';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import {
  ConnectionPointOption,
  MacroMonomerOption,
  MonomerOption,
} from '@tests/pages/constants/contextMenu/Constants';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { CreateMonomerDialog } from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { MonomerType as WizardMonomerType } from '@tests/pages/constants/createMonomerDialog/Constants';
import { MonomerType } from '@utils/types';
import {
  dragMouseTo,
  getVisibleCanvas,
  openFileAndAddToCanvasAsNewProjectMacro,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
import { getMonomerLocator } from '@utils/macromolecules/monomer';

const BENZENE_FIXTURE = 'KET/Chromium-popup/benzene-ring-with-atoms.ket';
// A chemically valid five-carbon chain: its atoms can be marked as attachment
// points in the wizard (the ring fixture's over-bonded atoms cannot).
const CHAIN_FIXTURE = 'KET/Chromium-popup/chain-with-singleup-bond.ket';
const MIXED_SELECTION_FIXTURE =
  'KET/Micro structures connected to polymer chains are not shown on Sequence mode canvas.ket';
const NEW_MONOMER_CODE = 'ZZ';
const NEW_MONOMER_NAME = 'Monomer from macro selection';
// Alias the editor assigns to the benzene ring auto-grouped as a CHEM fragment.
const FRAGMENT_ALIAS = 'F1';
const SMALL_MOLECULE_ATOM_COUNT = 6;
// Offset from the canvas top-left corner used to right-click an empty area.
const EMPTY_CANVAS_OFFSET = 60;

/** Number of atom elements rendered on the canvas (DOM — reliable in macro mode). */
async function getAtomCount(page: Page): Promise<number> {
  return getAtomLocator(page, {}).count();
}

/** Context menu opened on an atom of the selected small molecule. */
const smallMoleculeMenu = (page: Page) =>
  ContextMenu(page, getAtomLocator(page, {}).first());

/** Marks a chain atom as an attachment point on the open wizard canvas. */
async function markAtomAsConnectionPoint(page: Page): Promise<void> {
  // The macro-mode canvas layer stays in the DOM with zero-size atom elements;
  // only the wizard canvas atoms are visible.
  const chainAtom = getAtomLocator(page, { atomLabel: 'C' })
    .filter({ visible: true })
    .first();
  await ContextMenu(page, chainAtom).click(
    ConnectionPointOption.MarkAsConnectionPoint,
  );
}

/** The benzene ring auto-grouped as a CHEM fragment monomer. */
const fragmentMonomer = (page: Page) =>
  getMonomerLocator(page, {
    monomerAlias: FRAGMENT_ALIAS,
    monomerType: MonomerType.CHEM,
  });

let page: Page;

test.describe('#9370 Creating monomers from selections in macromolecules mode', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });

  test.beforeEach(async ({ FlexCanvas: _ }) => {});

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('1.1a: In flex, right-clicking a single small molecule shows enabled "Create monomer"', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 1.1)
     * Description: Right-clicking a selection of exactly one small molecule in flex mode
     * shows the "Create monomer" option, enabled.
     * Scenario:
     * 1. Open a macro file containing only a six-membered ring in flex mode
     * 2. Select all (the single small molecule)
     * 3. Right-click the selection and check the menu
     *
     * Version 3.21.0
     */
    await openFileAndAddToCanvasAsNewProjectMacro(page, BENZENE_FIXTURE);
    await selectAllStructuresOnCanvas(page);
    const menu = smallMoleculeMenu(page);
    await menu.open();
    const option = menu.getOptionLocator(MacroMonomerOption.CreateMonomer);
    await expect(option).toBeVisible();
    await expect(option).toBeEnabled();
  });

  test('1.1b: In flex, right-clicking an empty canvas shows no "Create monomer" option', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 1.1)
     * Description: The "Create monomer" option is not shown when right-clicking
     * an empty area of the canvas (no structure selected).
     * Scenario:
     * 1. Open a macro file containing only a six-membered ring in flex mode
     * 2. Right-click an empty area of the canvas
     * 3. Check that no context menu with the option appears
     *
     * Version 3.21.0
     */
    await openFileAndAddToCanvasAsNewProjectMacro(page, BENZENE_FIXTURE);
    const canvas = await getVisibleCanvas(page);
    const canvasBox = (await canvas.boundingBox())!;
    const menu = ContextMenu(page, {
      x: canvasBox.x + EMPTY_CANVAS_OFFSET,
      y: canvasBox.y + EMPTY_CANVAS_OFFSET,
    });
    await menu.open();
    expect(
      await menu.getOptionLocator(MacroMonomerOption.CreateMonomer).count(),
    ).toBe(0);
  });

  test('1.1c: In flex, right-clicking a lone monomer shows no create option but edit options', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 1.2)
     * Description: A selection without chemical structure (a single collapsed monomer)
     * does not offer "Create monomer"; the edit options are shown instead.
     * Scenario:
     * 1. Drag one peptide from the library onto the flex canvas
     * 2. Right-click it and check the macro menu
     *
     * Version 3.21.0
     */
    await Library(page).switchToPeptidesTab();
    await Library(page).dragMonomerOnCanvas(Peptide.A, { x: 250, y: 300 });
    const monomer = getMonomerLocator(page, Peptide.A).first();
    await expect(monomer).toBeVisible();
    const menu = ContextMenu(page, monomer);
    expect(await menu.isOptionVisible(MacroMonomerOption.CreateMonomer)).toBe(
      false,
    );
    expect(await menu.isOptionVisible(MacroMonomerOption.EditMonomer)).toBe(
      true,
    );
  });

  test('1.2a: In flex, a monomer + bonded-structure selection does not offer "Create monomer"', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 1.2)
     * Description (actual behavior): a small molecule bonded to a polymer is auto-grouped
     * into a CHEM fragment monomer when the file opens in flex mode; fragments are not
     * editable monomers, so the selection of the alanine + its benzene fragment does not
     * offer "Create monomer" (the edit options are shown instead).
     * Scenario:
     * 1. Open a macro file with an alanine monomer bonded to a six-membered ring in flex mode
     * 2. Select all and right-click the selection
     * 3. Check that "Create monomer" is absent and the edit options are present
     *
     * Version 3.21.0
     */
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      MIXED_SELECTION_FIXTURE,
    );
    await expect(fragmentMonomer(page)).toBeVisible();
    await selectAllStructuresOnCanvas(page);
    const menu = ContextMenu(page, getMonomerLocator(page, Peptide.A).first());
    expect(await menu.isOptionVisible(MacroMonomerOption.CreateMonomer)).toBe(
      false,
    );
    expect(await menu.isOptionVisible(MacroMonomerOption.EditMonomer)).toBe(
      true,
    );
  });

  test('1.2b: In flex, right-clicking two disconnected monomers shows no create option', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 1.2)
     * Description: "Create monomer" is only offered for a continuous (connected) selection;
     * two unconnected monomers do not form one.
     * Scenario:
     * 1. Drag two peptides apart on the flex canvas
     * 2. Select both with a rubber band and right-click
     * 3. Check that the macro menu has no "Create monomer" option
     *
     * Version 3.21.0
     */
    await Library(page).switchToPeptidesTab();
    const library = Library(page);
    await library.dragMonomerOnCanvas(Peptide.A, { x: 200, y: 250 });
    await library.dragMonomerOnCanvas(Peptide.C, { x: 380, y: 420 });
    const monomerA = getMonomerLocator(page, Peptide.A).first();
    const monomerC = getMonomerLocator(page, Peptide.C).first();
    await expect(monomerA).toBeVisible();
    await expect(monomerC).toBeVisible();

    await rubberBandSelect(page, [monomerA, monomerC]);

    const menu = ContextMenu(page, monomerA);
    expect(await menu.isOptionVisible(MacroMonomerOption.CreateMonomer)).toBe(
      false,
    );
  });

  test('1.2c: In flex, right-clicking two bonded monomers shows enabled "Create monomer"', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 1.2)
     * Description: A continuous selection of two bonded monomers offers the
     * "Create monomer" option, enabled.
     * Scenario:
     * 1. Drag two peptides onto the flex canvas and bond them
     * 2. Select both with a rubber band and right-click
     * 3. Check that "Create monomer" is visible and enabled
     *
     * Version 3.21.0
     */
    await Library(page).switchToPeptidesTab();
    const library = Library(page);
    await library.dragMonomerOnCanvas(Peptide.A, { x: 200, y: 250 });
    await library.dragMonomerOnCanvas(Peptide.C, { x: 380, y: 420 });
    const monomerA = getMonomerLocator(page, Peptide.A).first();
    const monomerC = getMonomerLocator(page, Peptide.C).first();
    await bondTwoMonomers(page, monomerA, monomerC);

    await rubberBandSelect(page, [monomerA, monomerC]);

    const menu = ContextMenu(page, monomerA);
    await menu.open();
    const option = menu.getOptionLocator(MacroMonomerOption.CreateMonomer);
    await expect(option).toBeVisible();
    await expect(option).toBeEnabled();
  });

  test('1.3: In the small-molecule menu, "Create monomer" sits in its own section above Delete', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 1.3)
     * Description: The create option is rendered in a separate section (separator line)
     * above the Delete item of the menu.
     * Scenario:
     * 1. Open the small-molecule fixture and select all
     * 2. Right-click the selection
     * 3. Check that "Create monomer" is above "Delete" with a separator between them
     *
     * Version 3.21.0
     */
    await openFileAndAddToCanvasAsNewProjectMacro(page, BENZENE_FIXTURE);
    await selectAllStructuresOnCanvas(page);
    const menu = smallMoleculeMenu(page);
    await menu.open();

    const createOption = menu.getOptionLocator(
      MacroMonomerOption.CreateMonomer,
    );
    const deleteOption = menu.getOptionLocator(MonomerOption.Delete);
    await expect(createOption).toBeVisible();
    await expect(deleteOption).toBeVisible();

    const createBox = (await createOption.boundingBox())!;
    const deleteBox = (await deleteOption.boundingBox())!;
    expect(createBox.y).toBeLessThan(deleteBox.y);
    // The menu renders separator lines between the option groups.
    expect(await menu.getSeparatorLocator().count()).toBeGreaterThanOrEqual(1);
  });

  test('1.4a: In flex, clicking "Create monomer" opens the wizard with the structure loaded', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 1.4)
     * Description: Clicking the create option switches to molecules mode and opens the
     * monomer creation wizard with the selected structure loaded.
     * Scenario:
     * 1. Open the small-molecule fixture, select all, right-click
     * 2. Click "Create monomer"
     * 3. Check that the wizard is visible and its canvas holds the ring's atoms
     *
     * Version 3.21.0
     */
    await openFileAndAddToCanvasAsNewProjectMacro(page, BENZENE_FIXTURE);
    await selectAllStructuresOnCanvas(page);
    const menu = smallMoleculeMenu(page);
    await menu.click(MacroMonomerOption.CreateMonomer);

    const dialog = CreateMonomerDialog(page);
    await expect(dialog.window).toBeVisible();
    // In molecules mode explicit hydrogens may be added to the loaded structure.
    expect(await getAtomCount(page)).toBeGreaterThanOrEqual(
      SMALL_MOLECULE_ATOM_COUNT,
    );
    await dialog.discard();
  });

  test('1.4b: In snake, clicking "Create monomer" opens the wizard with the structure loaded', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 1.4)
     * Description: The same entry point works in snake mode.
     * Scenario:
     * 1. Open the small-molecule fixture in flex and switch to snake mode
     * 2. Select all, right-click, click "Create monomer"
     * 3. Check that the wizard is visible with the structure loaded
     *
     * Version 3.21.0
     */
    await openFileAndAddToCanvasAsNewProjectMacro(page, BENZENE_FIXTURE);
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await selectAllStructuresOnCanvas(page);
    const menu = smallMoleculeMenu(page);
    expect(await menu.isOptionVisible(MacroMonomerOption.CreateMonomer)).toBe(
      true,
    );
    // Closing the menu clears the selection; right-click alone does not re-select,
    // so select again before opening the menu for the click.
    await selectAllStructuresOnCanvas(page);
    await menu.click(MacroMonomerOption.CreateMonomer);

    const dialog = CreateMonomerDialog(page);
    await expect(dialog.window).toBeVisible();
    // In molecules mode explicit hydrogens may be added to the loaded structure.
    expect(await getAtomCount(page)).toBeGreaterThanOrEqual(
      SMALL_MOLECULE_ATOM_COUNT,
    );
    await dialog.discard();
  });

  test('1.5a: In flex, submitting the wizard replaces the molecule with the new monomer', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 1.5)
     * Description: Submitting the wizard returns to macromolecules mode (flex) where the
     * selected molecule is replaced by the newly created monomer. The loaded structure has
     * no attachment points, so one is marked inside the wizard before submitting (a new
     * monomer must have at least one).
     * Scenario:
     * 1. Open the small-chain fixture, select all, open the wizard via the menu
     * 2. Mark a chain atom as a connection point, set type/code/name and submit
     * 3. Check that flex mode is back, the new monomer exists and no atoms remain
     *
     * Version 3.21.0
     */
    await openFileAndAddToCanvasAsNewProjectMacro(page, CHAIN_FIXTURE);
    await selectAllStructuresOnCanvas(page);
    const menu = smallMoleculeMenu(page);
    await menu.click(MacroMonomerOption.CreateMonomer);

    const dialog = CreateMonomerDialog(page);
    await expect(dialog.window).toBeVisible();
    await markAtomAsConnectionPoint(page);
    await dialog.selectType(WizardMonomerType.CHEM);
    await dialog.setCode(NEW_MONOMER_CODE);
    await dialog.setName(NEW_MONOMER_NAME);
    await dialog.submit({ ignoreWarning: true });

    await expect(dialog.window).toBeHidden();
    expect(await MacromoleculesTopToolbar(page).getActiveLayoutMode()).toBe(
      LayoutMode.Flex,
    );
    const newMonomer = getMonomerLocator(page, {
      monomerAlias: NEW_MONOMER_CODE,
    });
    expect(await newMonomer.count()).toBe(1);
    expect(await getAtomCount(page)).toBe(0);
  });

  test('1.5b: In flex, discarding the wizard leaves the structure intact', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 1.5)
     * Description: Discarding the wizard returns to macromolecules mode with the original
     * structure unchanged.
     * Scenario:
     * 1. Open the small-molecule fixture, select all, open the wizard via the menu
     * 2. Click discard
     * 3. Check that flex mode is back and the ring's atoms are still present
     *
     * Version 3.21.0
     */
    await openFileAndAddToCanvasAsNewProjectMacro(page, BENZENE_FIXTURE);
    await selectAllStructuresOnCanvas(page);
    const menu = smallMoleculeMenu(page);
    await menu.click(MacroMonomerOption.CreateMonomer);

    const dialog = CreateMonomerDialog(page);
    await expect(dialog.window).toBeVisible();
    await dialog.discard();

    await expect(dialog.window).toBeHidden();
    expect(await MacromoleculesTopToolbar(page).getActiveLayoutMode()).toBe(
      LayoutMode.Flex,
    );
    expect(await getAtomCount(page)).toBe(SMALL_MOLECULE_ATOM_COUNT);
    expect(
      await getMonomerLocator(page, { monomerAlias: NEW_MONOMER_CODE }).count(),
    ).toBe(0);
  });

  test('1.5c: In snake, submitting the wizard returns to snake with the new monomer on the canvas', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/9370 (requirement 1.5)
     * Description: Submitting from snake mode returns to snake; the layout is re-triggered
     * and the molecule is replaced by the new monomer. The loaded structure has no
     * attachment points, so one is marked inside the wizard before submitting.
     * Scenario:
     * 1. Open the small-chain fixture in flex and switch to snake mode
     * 2. Select all, open the wizard via the menu, mark a connection point, set type/code/name and submit
     * 3. Check that snake mode is back with the new monomer present and no atoms left
     *
     * Version 3.21.0
     */
    await openFileAndAddToCanvasAsNewProjectMacro(page, CHAIN_FIXTURE);
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await selectAllStructuresOnCanvas(page);
    const menu = smallMoleculeMenu(page);
    await menu.click(MacroMonomerOption.CreateMonomer);

    const dialog = CreateMonomerDialog(page);
    await expect(dialog.window).toBeVisible();
    await markAtomAsConnectionPoint(page);
    await dialog.selectType(WizardMonomerType.CHEM);
    await dialog.setCode(NEW_MONOMER_CODE);
    await dialog.setName(NEW_MONOMER_NAME);
    await dialog.submit({ ignoreWarning: true });

    await expect(dialog.window).toBeHidden();
    expect(await MacromoleculesTopToolbar(page).getActiveLayoutMode()).toBe(
      LayoutMode.Snake,
    );
    const newMonomer = getMonomerLocator(page, {
      monomerAlias: NEW_MONOMER_CODE,
    }).first();
    await expect(newMonomer).toBeVisible();
    expect(await getAtomCount(page)).toBe(0);
  });
});

/** Rubber-band selection around the union of the given monomers' bounding boxes. */
async function rubberBandSelect(
  page: Page,
  monomers: Locator[],
): Promise<void> {
  // The area-selection tool is required for a drag to select instead of act on entities.
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Rectangle);
  const boxes = [];
  for (const monomer of monomers) {
    boxes.push((await monomer.boundingBox())!);
  }
  const minX = Math.min(...boxes.map((box) => box.x)) - 10;
  const minY = Math.min(...boxes.map((box) => box.y)) - 10;
  const maxX = Math.max(...boxes.map((box) => box.x + box.width)) + 10;
  const maxY = Math.max(...boxes.map((box) => box.y + box.height)) + 10;
  await page.mouse.move(minX, minY);
  await dragMouseTo(page, maxX, maxY);
}
