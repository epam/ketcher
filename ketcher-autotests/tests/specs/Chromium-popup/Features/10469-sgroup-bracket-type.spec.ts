import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Page, test, expect } from '@fixtures';
import {
  clickOnCanvas,
  copyAndPaste,
  openFileAndAddToCanvasAsNewProject,
  pasteFromClipboardAndOpenAsNewProject,
  selectAllStructuresOnCanvas,
  takeEditorScreenshot,
} from '@utils';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { getTestDataDirectory } from '@utils/files/readFile';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { SGroupPropertiesDialog } from '@tests/pages/molecules/canvas/S-GroupPropertiesDialog';
import { SGroupCanvas } from '@tests/pages/molecules/canvas/SGroupCanvas';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { RotationTool } from '@tests/pages/common/canvas/RotationTool';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { ErrorMessageDialog } from '@tests/pages/common/ErrorMessageDialog';
import { OpenStructureDialog } from '@tests/pages/common/OpenStructureDialog';
import { SuperatomOption } from '@tests/pages/constants/contextMenu/Constants';
import { getKet } from '@utils/formats';
import { keyboardPressOnCanvas } from '@utils/keyboard';
import { getCanvasByMode } from '@utils/canvas/canvasLocators';
import { getAbbreviationLocator } from '@utils/canvas/s-group-signes/getAbbreviationLocator';
import { getSGroupLabelLocator } from '@utils/canvas/s-group-signes/getSGroupLabelLocator';
import {
  BracketTypeOption,
  ComponentOption,
  ContextOption,
  PropertyLabelType,
  TypeOption,
} from '@tests/pages/constants/s-GroupPropertiesDialog/Constants';

let page: Page;

const TEST_DATA_FOLDER = 'KET/Chromium-popup/10469-sgroup-bracket-type';

function bracketPair(type: 'square' | 'parenthetic' | 'curly') {
  return { opening: { type }, closing: { type } };
}

async function openSGroupDialogForChain() {
  await pasteFromClipboardAndOpenAsNewProject(page, 'CCCCCC');
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).sGroup();
}

async function openSGroupDialogForFile(fileName: string) {
  await openFileAndAddToCanvasAsNewProject(
    page,
    `${TEST_DATA_FOLDER}/${fileName}`,
  );
  await selectAllStructuresOnCanvas(page);
  await LeftToolbar(page).sGroup();
}

type Bounds = { x: number; y: number; width: number; height: number };

function expectSameBounds(actual: Bounds, expected: Bounds) {
  expect(actual.x).toBeCloseTo(expected.x, 1);
  expect(actual.y).toBeCloseTo(expected.y, 1);
  expect(actual.width).toBeCloseTo(expected.width, 1);
  expect(actual.height).toBeCloseTo(expected.height, 1);
}

function withoutSelection(items: Record<string, unknown>[]) {
  return items.map(({ selected: _selected, ...item }) => item);
}

function expectAtomsAtPositions(
  actual: ({ location: number[]; selected?: boolean } & Record<
    string,
    unknown
  >)[],
  expected: ({ location: number[]; selected?: boolean } & Record<
    string,
    unknown
  >)[],
) {
  expect(actual).toHaveLength(expected.length);
  actual.forEach(({ location, selected: _selected, ...attributes }, index) => {
    const {
      location: expectedLocation,
      selected: _expectedSelected,
      ...expectedAttributes
    } = expected[index];
    expect(attributes).toEqual(expectedAttributes);
    expect(location).toHaveLength(expectedLocation.length);
    location.forEach((value, dimension) =>
      expect(value).toBeCloseTo(expectedLocation[dimension], 5),
    );
  });
}

test.describe('S-Group bracket type: ', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });

  test.afterEach(async ({ MoleculesCanvas: _ }) => {});

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  const nonDataTypes = [
    TypeOption.MultipleGroup,
    TypeOption.SRUPolymer,
    TypeOption.Copolymer,
    TypeOption.Superatom,
    TypeOption.QueryComponent,
    TypeOption.NucleotideComponent,
  ];

  for (const type of nonDataTypes) {
    test(`Case 1 - Bracket type picker shows square brackets by default for ${type}`, async () => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/10469
       * Description: Every non-Data S-group dialog has a Bracket type picker
       * with square, round and curly brackets, and square is selected for a new S-group
       * Scenario:
       * 1. Paste a carbon chain and select it
       * 2. Open the S-Group dialog and pick the S-group type
       * 3. Verify the three bracket radio buttons and that square is checked
       *
       * Version 3.21.0
       */
      await openSGroupDialogForChain();
      const dialog = SGroupPropertiesDialog(page);
      await dialog.selectType(type);

      await expect(dialog.squareBracketRadioButton).toBeVisible();
      await expect(dialog.roundBracketRadioButton).toBeVisible();
      await expect(dialog.curlyBracketRadioButton).toBeVisible();
      await expect(dialog.squareBracketRadioButton).toBeChecked();
      await expect(dialog.roundBracketRadioButton).not.toBeChecked();
      await expect(dialog.curlyBracketRadioButton).not.toBeChecked();

      await dialog.cancel();
    });
  }

  test('Case 2 - Data S-group has no bracket type picker', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10469
     * Description: Data S-groups have no brackets, so their dialog has no Bracket type picker
     * Scenario:
     * 1. Paste a carbon chain and select it
     * 2. Open the S-Group dialog and pick the Data type
     * 3. Verify that no bracket radio button is shown
     *
     * Version 3.21.0
     */
    await openSGroupDialogForChain();
    const dialog = SGroupPropertiesDialog(page);
    await dialog.selectType(TypeOption.Data);

    await expect(dialog.squareBracketRadioButton).toHaveCount(0);
    await expect(dialog.roundBracketRadioButton).toHaveCount(0);
    await expect(dialog.curlyBracketRadioButton).toHaveCount(0);

    await dialog.cancel();
  });

  test('Case 3 - SRU polymer with round brackets is drawn and saved to KET', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10469
     * Description: An SRU polymer created with round brackets is drawn with
     * round brackets and keeps a parenthetic pair in KET
     * Scenario:
     * 1. Paste a carbon chain and select it
     * 2. Open the S-Group dialog, pick SRU polymer and round brackets, apply
     * 3. Take a screenshot of the canvas
     * 4. Verify the KET export
     *
     * Version 3.21.0
     */
    await openSGroupDialogForChain();
    const dialog = SGroupPropertiesDialog(page);
    await dialog.selectType(TypeOption.SRUPolymer);
    await dialog.selectBracketType(BracketTypeOption.Round);
    await dialog.apply();

    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      `${TEST_DATA_FOLDER}/sru-round-expected.ket`,
      FileType.KET,
    );
  });

  test('Case 4 - Multiple group with curly brackets is drawn and saved to KET', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10469
     * Description: A Multiple group created with curly brackets is drawn with
     * curly brackets and keeps a curly pair in KET
     * Scenario:
     * 1. Paste a carbon chain and select it
     * 2. Open the S-Group dialog, pick Multiple group, set Repeat count 2, pick curly brackets, apply
     * 3. Take a screenshot of the canvas
     * 4. Verify the KET export
     *
     * Version 3.21.0
     */
    await openSGroupDialogForChain();
    const dialog = SGroupPropertiesDialog(page);
    await dialog.setOptions({
      Type: TypeOption.MultipleGroup,
      RepeatCount: '2',
      BracketType: BracketTypeOption.Curly,
    });

    await takeEditorScreenshot(page);
    await verifyFileExport(
      page,
      `${TEST_DATA_FOLDER}/mul-curly-expected.ket`,
      FileType.KET,
    );
  });

  test('Case 5 - Editing an S-group shows its bracket type', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10469
     * Description: The S-Group dialog of an existing S-group shows the stored bracket type
     * Scenario:
     * 1. Open a KET file with an SRU polymer that has curly brackets
     * 2. Select the structure and open the S-Group dialog
     * 3. Verify that curly brackets are checked
     *
     * Version 3.21.0
     */
    await openSGroupDialogForFile('sru-curly.ket');
    const dialog = SGroupPropertiesDialog(page);

    await expect(dialog.curlyBracketRadioButton).toBeChecked();
    await expect(dialog.squareBracketRadioButton).not.toBeChecked();
    await expect(dialog.roundBracketRadioButton).not.toBeChecked();

    await dialog.cancel();
  });

  test('Case 6 - Switching back to square brackets saves a square pair', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10469
     * Description: Editing a styled pair to square saves both square types
     * Scenario:
     * 1. Open a KET file with an SRU polymer that has curly brackets
     * 2. Select the structure, open the S-Group dialog, pick square brackets, apply
     * 3. Verify the KET export has a square opening and closing pair
     *
     * Version 3.21.0
     */
    await openSGroupDialogForFile('sru-curly.ket');
    const dialog = SGroupPropertiesDialog(page);
    await dialog.selectBracketType(BracketTypeOption.Square);
    await dialog.apply();

    await verifyFileExport(
      page,
      `${TEST_DATA_FOLDER}/sru-square-expected.ket`,
      FileType.KET,
    );
  });

  test('Case 7 - Undo and redo restore the bracket type', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10469
     * Description: Changing the bracket type is one undoable step
     * Scenario:
     * 1. Open a KET file with an SRU polymer that has curly brackets
     * 2. Change the bracket type to round in the S-Group dialog
     * 3. Undo and verify the KET export has curly brackets
     * 4. Redo and verify the KET export has round brackets
     *
     * Version 3.21.0
     */
    await openSGroupDialogForFile('sru-curly.ket');
    const dialog = SGroupPropertiesDialog(page);
    await dialog.selectBracketType(BracketTypeOption.Round);
    await dialog.apply();

    await CommonTopLeftToolbar(page).undo();
    await verifyFileExport(
      page,
      `${TEST_DATA_FOLDER}/sru-curly-after-undo-expected.ket`,
      FileType.KET,
    );

    await CommonTopLeftToolbar(page).redo();
    await verifyFileExport(
      page,
      `${TEST_DATA_FOLDER}/sru-round-after-redo-expected.ket`,
      FileType.KET,
    );
  });

  test('Case 8 - KET with every S-group type and bracket type loads and saves unchanged', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10469
     * Description: Round and curly brackets of every non-Data S-group type survive
     * a KET load and save, and each is drawn with its own shape
     * Scenario:
     * 1. Open a KET file with Multiple group (round), Superatom (curly),
     *    Copolymer (round), Query component (curly) and SRU polymer (square)
     * 2. Take a screenshot of the canvas
     * 3. Verify the KET export
     *
     * Version 3.21.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      `${TEST_DATA_FOLDER}/all-types.ket`,
    );

    await takeEditorScreenshot(page);
    const expected = JSON.parse(
      await readFile(
        join(
          getTestDataDirectory(),
          TEST_DATA_FOLDER,
          'all-types-expected.ket',
        ),
        'utf8',
      ),
    );
    for (const { $ref } of expected.root.nodes) {
      const molecule = expected[$ref];
      expected[$ref] = {
        ...molecule,
        atoms: molecule.atoms.map((atom: { location: number[] }) => ({
          ...atom,
          location: atom.location.map((coordinate) =>
            expect.closeTo(coordinate, 6),
          ),
        })),
        stereoFlagPosition: {
          x: expect.closeTo(molecule.stereoFlagPosition.x, 6),
          y: expect.closeTo(molecule.stereoFlagPosition.y, 6),
          z: expect.closeTo(molecule.stereoFlagPosition.z, 6),
        },
      };
    }
    expect(JSON.parse(await getKet(page))).toEqual(expected);
  });

  test('Case 9 - Same-atom S-groups have separate brackets and retain their styles', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10469
     * Description: Independently styled S-groups containing the same atoms
     * have visibly separate bracket pairs without changing their KET data.
     * Scenario:
     * 1. Open a KET with a round SRU and a square Phosphate component over the same atoms
     * 2. Verify both groups, memberships and styles in KET
     * 3. Verify that both left and both right bracket paths have a visible gap
     *    and distinct top and bottom extents, without crossing the Phosphate label
     * 4. Take a screenshot
     *
     * Version 3.21.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      `${TEST_DATA_FOLDER}/same-atoms.ket`,
    );

    const ket = JSON.parse(await getKet(page));
    expect(ket.mol0.atoms).toHaveLength(7);
    expect(ket.mol0.bonds).toHaveLength(7);
    expect(ket.mol0.sgroups).toEqual([
      expect.objectContaining({
        type: 'SRU',
        brackets: bracketPair('parenthetic'),
        atoms: [0, 1, 2, 3, 4, 5, 6],
      }),
      expect.objectContaining({
        type: 'SUP',
        class: 'PHOSPHATE',
        atoms: [0, 1, 2, 3, 4, 5, 6],
      }),
    ]);
    expect(ket.mol0.sgroups[1]).not.toHaveProperty('brackets');

    const canvas = SGroupCanvas(page);
    await expect(canvas.brackets).toHaveCount(4);
    const bounds = (await canvas.bracketBounds()).sort((a, b) => a.x - b.x);
    expect(bounds[1].x - bounds[0].x - bounds[0].width).toBeGreaterThan(1);
    expect(bounds[3].x - bounds[2].x - bounds[2].width).toBeGreaterThan(1);
    expect(Math.abs(bounds[0].y - bounds[1].y)).toBeGreaterThan(1);
    expect(
      Math.abs(bounds[0].y + bounds[0].height - bounds[1].y - bounds[1].height),
    ).toBeGreaterThan(1);
    const labelBounds = await getSGroupLabelLocator(page, {
      labelText: 'Phosphate',
    }).boundingBox();
    expect(labelBounds).not.toBeNull();
    if (!labelBounds) {
      throw new Error('Phosphate label is not visible');
    }
    expect(bounds[3].x - labelBounds.x - labelBounds.width).toBeGreaterThan(1);

    await takeEditorScreenshot(page);
  });

  test('Case 10 - Same-atom S-groups can be edited independently', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10469
     * Description: Each visible bracket opens the properties of its own group.
     * Scenario:
     * 1. Open a KET with a round SRU and square Phosphate component over the same atoms
     * 2. Open each group from its bracket and change its style
     * 3. Verify both styles and unchanged chemistry in KET
     * 4. Undo and redo the second edit and verify each group's style
     *
     * Version 3.21.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      `${TEST_DATA_FOLDER}/same-atoms.ket`,
    );
    const before = JSON.parse(await getKet(page));
    const canvas = SGroupCanvas(page);
    const dialog = SGroupPropertiesDialog(page);

    await canvas.openLeftBracket('outer');
    await expect(dialog.roundBracketRadioButton).toBeChecked();
    await dialog.selectBracketType(BracketTypeOption.Curly);
    await dialog.apply();

    const firstEdit = JSON.parse(await getKet(page));
    expect(
      firstEdit.mol0.sgroups.map((group: { type: string }) => group.type),
    ).toEqual(['SRU', 'SUP']);

    await canvas.openLeftBracket('inner');
    await expect(dialog.squareBracketRadioButton).toBeChecked();
    await dialog.selectBracketType(BracketTypeOption.Round);
    await dialog.apply();

    const after = JSON.parse(await getKet(page));
    expect(after.mol0.atoms).toEqual(before.mol0.atoms);
    expect(after.mol0.bonds).toEqual(before.mol0.bonds);
    expect(after.mol0.sgroups).toEqual([
      expect.objectContaining({
        type: 'SRU',
        brackets: bracketPair('curly'),
        atoms: [0, 1, 2, 3, 4, 5, 6],
      }),
      expect.objectContaining({
        type: 'SUP',
        class: 'PHOSPHATE',
        brackets: bracketPair('parenthetic'),
        atoms: [0, 1, 2, 3, 4, 5, 6],
      }),
    ]);

    await CommonTopLeftToolbar(page).undo();
    const undone = JSON.parse(await getKet(page));
    expect(undone.mol0.sgroups[0].brackets).toEqual(bracketPair('curly'));
    expect(undone.mol0.sgroups[1]).not.toHaveProperty('brackets');

    await CommonTopLeftToolbar(page).redo();
    const redone = JSON.parse(await getKet(page));
    expect(redone.mol0.sgroups[0].brackets).toEqual(bracketPair('curly'));
    expect(redone.mol0.sgroups[1].brackets).toEqual(bracketPair('parenthetic'));
  });

  test('Case 11 - Same-atom brackets stay separate in Macromolecules mode', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10469
     * Description: Both canvas pipelines separate the same-atom S-groups.
     * Scenario:
     * 1. Open a KET with a round SRU and square Phosphate component over the same atoms
     * 2. Switch to Macromolecules Flex and verify separate bracket pairs and label
     * 3. Switch back to Molecules and verify the groups and their styles
     *
     * Version 3.21.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      `${TEST_DATA_FOLDER}/same-atoms.ket`,
    );
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
    });
    await CommonTopRightToolbar(page).selectZoomOutTool(2);

    const canvas = SGroupCanvas(page);
    await expect(canvas.macroBrackets).toHaveCount(4);
    const bounds = (await canvas.macroBracketBounds()).sort(
      (a, b) => a.x - b.x,
    );
    expect(bounds[1].x - bounds[0].x - bounds[0].width).toBeGreaterThan(1);
    expect(bounds[3].x - bounds[2].x - bounds[2].width).toBeGreaterThan(1);
    const labelBounds = await getSGroupLabelLocator(page, {
      labelText: 'Phosphate',
    }).boundingBox();
    expect(labelBounds).not.toBeNull();
    if (!labelBounds) {
      throw new Error('Phosphate label is not visible');
    }
    expect(bounds[3].x - labelBounds.x - labelBounds.width).toBeGreaterThan(1);
    const canvasBounds = await getCanvasByMode(
      page,
      'macromolecules',
    ).boundingBox();
    expect(canvasBounds).not.toBeNull();
    if (!canvasBounds) {
      throw new Error('Macromolecules canvas is not visible');
    }
    for (const bracket of bounds) {
      expect(bracket.x).toBeGreaterThan(canvasBounds.x);
      expect(bracket.x + bracket.width).toBeLessThan(
        canvasBounds.x + canvasBounds.width,
      );
    }
    await canvas.hoverMacroLeftBracket('outer');
    await expect(canvas.macroHoverOutline('SRU')).toBeVisible();
    await canvas.hoverMacroLeftBracket('inner');
    await expect(canvas.macroHoverOutline('SUP')).toBeVisible();
    await page.mouse.move(0, 0);
    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });

    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    const ket = JSON.parse(await getKet(page));
    expect(ket.mol0.sgroups).toEqual([
      expect.objectContaining({
        type: 'SRU',
        brackets: bracketPair('parenthetic'),
      }),
      expect.objectContaining({ type: 'SUP', class: 'PHOSPHATE' }),
    ]);
  });

  test('Case 12 - Style and label edits keep same-atom group hierarchy', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10469
     * Description: Editing a style and label together preserves same-atom groups.
     * Scenario:
     * 1. Open a KET with a round SRU and square Phosphate component over the same atoms
     * 2. Change the outer SRU's style and polymer label together
     * 3. Check both groups, chemistry, coordinates and independent inner-group editing
     * 4. Undo and redo and verify both groups' styles and labels
     *
     * Version 3.21.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      `${TEST_DATA_FOLDER}/same-atoms.ket`,
    );
    const before = JSON.parse(await getKet(page));
    const canvas = SGroupCanvas(page);
    const dialog = SGroupPropertiesDialog(page);

    await canvas.openLeftBracket('outer');
    await expect(dialog.roundBracketRadioButton).toBeChecked();
    await dialog.setPolymerLabelValue('m');
    await dialog.selectBracketType(BracketTypeOption.Curly);
    await dialog.apply();

    const after = JSON.parse(await getKet(page));
    expect(after.mol0.atoms).toEqual(before.mol0.atoms);
    expect(after.mol0.bonds).toEqual(before.mol0.bonds);
    expect(after.mol0.sgroups).toEqual([
      expect.objectContaining({
        type: 'SRU',
        brackets: bracketPair('curly'),
        subscript: 'm',
        atoms: [0, 1, 2, 3, 4, 5, 6],
      }),
      expect.objectContaining({
        type: 'SUP',
        class: 'PHOSPHATE',
        atoms: [0, 1, 2, 3, 4, 5, 6],
      }),
    ]);

    await canvas.openLeftBracket('inner');
    await expect(dialog.squareBracketRadioButton).toBeChecked();
    await dialog.cancel();

    await CommonTopLeftToolbar(page).undo();
    const undone = JSON.parse(await getKet(page));
    expect(undone.mol0.sgroups).toEqual(before.mol0.sgroups);

    await CommonTopLeftToolbar(page).redo();
    const redone = JSON.parse(await getKet(page));
    expect(redone.mol0.sgroups).toEqual(after.mol0.sgroups);
  });

  test('Case 13 - Removing and restoring a same-atom group reflows brackets', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10469
     * Description: A remaining group returns to its original bracket position.
     * Scenario:
     * 1. Open a KET with a round SRU and square Phosphate component over the same atoms
     * 2. Erase the inner group and check the remaining SRU and its position
     * 3. Undo and redo, checking reflow and unchanged chemistry
     *
     * Version 3.21.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      `${TEST_DATA_FOLDER}/same-atoms.ket`,
    );
    const before = JSON.parse(await getKet(page));
    const canvas = SGroupCanvas(page);
    const beforeBounds = (await canvas.bracketBounds()).sort(
      (a, b) => a.x - b.x,
    );

    await CommonLeftToolbar(page).erase();
    await canvas.clickLeftBracket('inner');
    await expect(canvas.brackets).toHaveCount(2);
    const remaining = JSON.parse(await getKet(page));
    expect(remaining.mol0.atoms).toEqual(before.mol0.atoms);
    expect(remaining.mol0.bonds).toEqual(before.mol0.bonds);
    expect(remaining.mol0.sgroups).toEqual([
      expect.objectContaining({
        type: 'SRU',
        brackets: bracketPair('parenthetic'),
      }),
    ]);
    const singleBounds = (await canvas.bracketBounds()).sort(
      (a, b) => a.x - b.x,
    );
    expect(singleBounds[0].x - beforeBounds[0].x).toBeGreaterThan(1);
    expect(singleBounds[0].x).toBeCloseTo(beforeBounds[1].x, 0);

    await CommonTopLeftToolbar(page).undo();
    await expect(canvas.brackets).toHaveCount(4);
    expect(JSON.parse(await getKet(page)).mol0.sgroups).toEqual(
      before.mol0.sgroups,
    );

    await CommonTopLeftToolbar(page).redo();
    await expect(canvas.brackets).toHaveCount(2);
    const redoBounds = (await canvas.bracketBounds()).sort((a, b) => a.x - b.x);
    expect(redoBounds[0].x).toBeCloseTo(singleBounds[0].x, 0);
    expect(JSON.parse(await getKet(page)).mol0.sgroups).toEqual(
      remaining.mol0.sgroups,
    );
  });

  test('Case 14 - Contracting and expanding a same-atom group reflows brackets', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10469
     * Description: Contracted groups do not reserve a bracket position.
     * Scenario:
     * 1. Open a KET with a round SRU and square Phosphate component over the same atoms
     * 2. Contract the inner component and check that only the SRU brackets remain
     * 3. Expand it and verify both bracket pairs and styles
     *
     * Version 3.21.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      `${TEST_DATA_FOLDER}/same-atoms.ket`,
    );
    const canvas = SGroupCanvas(page);
    const dialog = SGroupPropertiesDialog(page);
    await canvas.openLeftBracket('inner');
    await dialog.selectBracketType(BracketTypeOption.Curly);
    await dialog.apply();
    const before = JSON.parse(await getKet(page));
    const beforeBounds = (await canvas.bracketBounds()).sort(
      (a, b) => a.x - b.x,
    );
    await ContextMenu(page, await canvas.leftBracketPoint('inner')).click(
      SuperatomOption.ContractAbbreviation,
    );
    await expect(canvas.brackets).toHaveCount(2);
    const contractedBounds = (await canvas.bracketBounds()).sort(
      (a, b) => a.x - b.x,
    );
    expect(contractedBounds[0].x - beforeBounds[0].x).toBeGreaterThan(1);
    const contracted = JSON.parse(await getKet(page));
    expect(contracted.mol0.sgroups).toEqual([
      expect.objectContaining({
        type: 'SRU',
        brackets: bracketPair('parenthetic'),
      }),
      expect.objectContaining({
        type: 'SUP',
        class: 'PHOSPHATE',
        expanded: false,
        brackets: bracketPair('curly'),
      }),
    ]);

    await ContextMenu(
      page,
      getAbbreviationLocator(page, { type: 'SUP' }),
    ).click(SuperatomOption.ExpandAbbreviation);
    await expect(canvas.brackets).toHaveCount(4);
    const bounds = (await canvas.bracketBounds()).sort((a, b) => a.x - b.x);
    expect(bounds[1].x - bounds[0].x - bounds[0].width).toBeGreaterThan(1);
    expect(bounds[3].x - bounds[2].x - bounds[2].width).toBeGreaterThan(1);
    const expanded = JSON.parse(await getKet(page));
    expect(expanded.mol0.atoms).toEqual(before.mol0.atoms);
    expect(expanded.mol0.bonds).toEqual(before.mol0.bonds);
    expect(expanded.mol0.sgroups).toEqual(before.mol0.sgroups);
  });

  test('Case 15 - Bracket picker is accessible by keyboard', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10469
     * Description: The symbol-only radio options have accessible names.
     * Scenario:
     * 1. Open a new S-group dialog
     * 2. Focus the square option and use arrow keys to select curly
     * 3. Apply and verify the bracket type in KET
     *
     * Version 3.21.0
     */
    await openSGroupDialogForChain();
    const dialog = SGroupPropertiesDialog(page);
    await dialog.selectType(TypeOption.MultipleGroup);
    await expect(dialog.bracketTypePicker).toBeVisible();
    await expect(dialog.squareBracketRadioButton).toHaveAccessibleName(
      'Square brackets',
    );
    await expect(dialog.roundBracketRadioButton).toHaveAccessibleName(
      'Parentheses',
    );
    await expect(dialog.curlyBracketRadioButton).toHaveAccessibleName(
      'Curly brackets',
    );

    await dialog.squareBracketRadioButton.focus();
    await page.keyboard.press('ArrowRight');
    await expect(dialog.roundBracketRadioButton).toBeChecked();
    await expect(dialog.roundBracketRadioButton).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(dialog.curlyBracketRadioButton).toBeChecked();
    await dialog.apply();

    const ket = JSON.parse(await getKet(page));
    expect(ket.mol0.sgroups[0].brackets).toEqual(bracketPair('curly'));
  });

  test('Case 16 - Cancelling a bracket change preserves the group', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10469
     * Description: Cancelling a pending bracket change leaves the group unchanged.
     * Scenario:
     * 1. Open a curly SRU and choose round brackets
     * 2. Cancel and compare the exported KET with the original
     * 3. Reopen the group and verify curly is still selected
     *
     * Version 3.21.0
     */
    await openSGroupDialogForFile('sru-curly.ket');
    const dialog = SGroupPropertiesDialog(page);
    const before = JSON.parse(await getKet(page));
    await dialog.selectBracketType(BracketTypeOption.Round);
    await dialog.cancel();

    expect(JSON.parse(await getKet(page))).toEqual(before);
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await expect(dialog.curlyBracketRadioButton).toBeChecked();
    await dialog.cancel();
  });

  test('Case 17 - Switching group types preserves the selected bracket', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10469
     * Description: Switching between non-DATA types retains the selected bracket.
     * Scenario:
     * 1. Open a curly SRU and switch its type to Multiple group
     * 2. Verify curly remains selected, set a repeat count and apply
     * 3. Reopen the group and verify its type and bracket style
     *
     * Version 3.21.0
     */
    await openSGroupDialogForFile('sru-curly.ket');
    const dialog = SGroupPropertiesDialog(page);
    await dialog.selectType(TypeOption.MultipleGroup);
    await expect(dialog.curlyBracketRadioButton).toBeChecked();
    await dialog.setRepeatCountValue('2');
    await dialog.apply();

    expect(JSON.parse(await getKet(page)).mol0.sgroups[0]).toEqual(
      expect.objectContaining({
        type: 'MUL',
        mul: 2,
        brackets: bracketPair('curly'),
      }),
    );
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await expect(dialog.curlyBracketRadioButton).toBeChecked();
    await dialog.cancel();
  });

  test('Case 18 - Unrelated edits retain the selected bracket', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10469
     * Description: Editing a polymer label does not change its bracket style.
     * Scenario:
     * 1. Open a curly SRU and change only its polymer label
     * 2. Check its style, chemistry and coordinates
     * 3. Undo and redo and verify the corresponding labels and style
     *
     * Version 3.21.0
     */
    await openSGroupDialogForFile('sru-curly.ket');
    const dialog = SGroupPropertiesDialog(page);
    const before = JSON.parse(await getKet(page));
    await dialog.setPolymerLabelValue('m');
    await dialog.apply();

    const after = JSON.parse(await getKet(page));
    expect(after.mol0.atoms).toEqual(before.mol0.atoms);
    expect(after.mol0.bonds).toEqual(before.mol0.bonds);
    expect(after.mol0.sgroups).toEqual([
      { ...before.mol0.sgroups[0], subscript: 'm' },
    ]);

    await CommonTopLeftToolbar(page).undo();
    expect(JSON.parse(await getKet(page)).mol0.sgroups).toEqual(
      before.mol0.sgroups,
    );
    await CommonTopLeftToolbar(page).redo();
    expect(JSON.parse(await getKet(page)).mol0.sgroups).toEqual(
      after.mol0.sgroups,
    );
  });

  test('Case 19 - Unrelated same-atom edits keep group hierarchy', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10469
     * Description: Editing only a label preserves independent same-atom groups.
     * Scenario:
     * 1. Open the round SRU and square Phosphate component over the same atoms
     * 2. Change only the outer SRU's polymer label
     * 3. Verify both groups, chemistry, coordinates and independent inner editing
     * 4. Undo and redo, checking hierarchy and styles
     *
     * Version 3.21.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      `${TEST_DATA_FOLDER}/same-atoms.ket`,
    );
    const before = JSON.parse(await getKet(page));
    const canvas = SGroupCanvas(page);
    const dialog = SGroupPropertiesDialog(page);
    await canvas.openLeftBracket('outer');
    await dialog.setPolymerLabelValue('m');
    await dialog.apply();

    const after = JSON.parse(await getKet(page));
    expect(after.mol0.atoms).toEqual(before.mol0.atoms);
    expect(after.mol0.bonds).toEqual(before.mol0.bonds);
    expect(after.mol0.sgroups).toEqual([
      { ...before.mol0.sgroups[0], subscript: 'm' },
      before.mol0.sgroups[1],
    ]);
    await canvas.openLeftBracket('inner');
    await expect(dialog.squareBracketRadioButton).toBeChecked();
    await dialog.cancel();

    await CommonTopLeftToolbar(page).undo();
    expect(JSON.parse(await getKet(page)).mol0.sgroups).toEqual(
      before.mol0.sgroups,
    );
    await CommonTopLeftToolbar(page).redo();
    expect(JSON.parse(await getKet(page)).mol0.sgroups).toEqual(
      after.mol0.sgroups,
    );
  });

  test('Case 20 - Rotated molecule retains bracket and label positions', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10469
     * Description: Changing the shape does not reposition a rotated SRU or its label.
     * Scenario:
     * 1. Open a rotated SRU with square brackets and record its geometry
     * 2. Change to round and then curly, comparing each pair and polymer label
     * 3. Verify KET chemistry and capture square and curly screenshots
     *
     * Version 3.21.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      `${TEST_DATA_FOLDER}/rotated-sru.ket`,
    );
    const canvas = SGroupCanvas(page);
    const dialog = SGroupPropertiesDialog(page);
    const label = getSGroupLabelLocator(page, { labelText: 'n' });
    const before = JSON.parse(await getKet(page));
    await expect(canvas.brackets).toHaveCount(2);
    const baseline = (await canvas.bracketBounds()).sort((a, b) => a.x - b.x);
    for (const path of await canvas.brackets.all()) {
      expect(await path.getAttribute('d')).toMatch(/^M.*L.*L.*L/);
    }
    const baselineLabel = await label.boundingBox();
    expect(baselineLabel).not.toBeNull();
    if (!baselineLabel) {
      throw new Error('SRU label is not visible');
    }
    await takeEditorScreenshot(page);

    for (const [option, command, style] of [
      [BracketTypeOption.Round, 'C', 'parenthetic'],
      [BracketTypeOption.Curly, 'Q', 'curly'],
    ] as const) {
      await selectAllStructuresOnCanvas(page);
      await LeftToolbar(page).sGroup();
      await dialog.selectBracketType(option);
      await dialog.apply();
      await keyboardPressOnCanvas(page, 'ControlOrMeta+Shift+KeyA');

      const bounds = (await canvas.bracketBounds()).sort((a, b) => a.x - b.x);
      expect(bounds).toHaveLength(2);
      bounds.forEach((box, index) => expectSameBounds(box, baseline[index]));
      const labelBounds = await label.boundingBox();
      expect(labelBounds).not.toBeNull();
      if (!labelBounds) {
        throw new Error('SRU label is not visible');
      }
      expectSameBounds(labelBounds, baselineLabel);
      for (const path of await canvas.brackets.all()) {
        expect(await path.getAttribute('d')).toContain(command);
      }
      const after = JSON.parse(await getKet(page));
      expect(after.mol0.atoms).toEqual(before.mol0.atoms);
      expect(after.mol0.bonds).toEqual(before.mol0.bonds);
      expect(after.mol0.sgroups).toEqual([
        { ...before.mol0.sgroups[0], brackets: bracketPair(style) },
      ]);
    }
    await takeEditorScreenshot(page);
  });

  test('Case 21 - Bracket styles retain label positions in Macromolecules mode', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10469
     * Description: The D3 canvas renders each style without shifting its label.
     * Scenario:
     * 1. Open a square SRU and switch to Macromolecules Flex
     * 2. Return to Molecules and change its style to round and then curly
     * 3. After each change, switch to Flex and compare the brackets and label
     *
     * Version 3.21.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      `${TEST_DATA_FOLDER}/rotated-sru.ket`,
    );
    const canvas = SGroupCanvas(page);
    const dialog = SGroupPropertiesDialog(page);
    const label = getSGroupLabelLocator(page, { labelText: 'n' });
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
    });
    await expect(canvas.macroBrackets).toHaveCount(2);
    const baseline = (await canvas.macroBracketBounds()).sort(
      (a, b) => a.x - b.x,
    );
    for (const path of await canvas.macroBrackets.all()) {
      expect(await path.getAttribute('d')).toMatch(/^M.*L.*L.*L/);
    }
    const baselineLabel = await label.boundingBox();
    expect(baselineLabel).not.toBeNull();
    if (!baselineLabel) {
      throw new Error('SRU label is not visible in Macromolecules mode');
    }

    for (const [option, command] of [
      [BracketTypeOption.Round, 'C'],
      [BracketTypeOption.Curly, 'Q'],
    ] as const) {
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
      await selectAllStructuresOnCanvas(page);
      await LeftToolbar(page).sGroup();
      await dialog.selectBracketType(option);
      await dialog.apply();
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
        enableFlexMode: true,
      });

      await expect(canvas.macroBrackets).toHaveCount(2);
      const bounds = (await canvas.macroBracketBounds()).sort(
        (a, b) => a.x - b.x,
      );
      bounds.forEach((box, index) => expectSameBounds(box, baseline[index]));
      const labelBounds = await label.boundingBox();
      expect(labelBounds).not.toBeNull();
      if (!labelBounds) {
        throw new Error('SRU label is not visible in Macromolecules mode');
      }
      expectSameBounds(labelBounds, baselineLabel);
      for (const path of await canvas.macroBrackets.all()) {
        expect(await path.getAttribute('d')).toContain(command);
      }
    }
  });

  test('Case 22 - Nucleotide label and icon retain their positions', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10469
     * Description: Changing a Nucleotide Component's bracket shape leaves its label and icon in place.
     * Scenario:
     * 1. Open a square Phosphate component nested with a round SRU
     * 2. Change only the component's brackets to curly
     * 3. Compare the label and icon positions and verify both groups in KET
     *
     * Version 3.21.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      `${TEST_DATA_FOLDER}/same-atoms.ket`,
    );
    const canvas = SGroupCanvas(page);
    const dialog = SGroupPropertiesDialog(page);
    const label = getSGroupLabelLocator(page, { labelText: 'Phosphate' });
    const before = JSON.parse(await getKet(page));
    const labelBefore = await label.boundingBox();
    const iconBefore = await canvas.phosphateIcon.boundingBox();
    expect(labelBefore).not.toBeNull();
    expect(iconBefore).not.toBeNull();
    if (!labelBefore || !iconBefore) {
      throw new Error('Phosphate label or icon is not visible');
    }

    await canvas.openLeftBracket('inner');
    await dialog.selectBracketType(BracketTypeOption.Curly);
    await dialog.apply();

    const labelAfter = await label.boundingBox();
    const iconAfter = await canvas.phosphateIcon.boundingBox();
    expect(labelAfter).not.toBeNull();
    expect(iconAfter).not.toBeNull();
    if (!labelAfter || !iconAfter) {
      throw new Error('Phosphate label or icon is not visible after editing');
    }
    expectSameBounds(labelAfter, labelBefore);
    expectSameBounds(iconAfter, iconBefore);
    const after = JSON.parse(await getKet(page));
    expect(after.mol0.sgroups).toEqual([
      before.mol0.sgroups[0],
      { ...before.mol0.sgroups[1], brackets: bracketPair('curly') },
    ]);
  });

  test('Case 23 - Repeat count retains its position when the bracket changes', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10469
     * Description: Changing a Multiple group's bracket does not move its repeat label.
     * Scenario:
     * 1. Create a Multiple group with square brackets and repeat count 2
     * 2. Change its brackets to curly
     * 3. Compare bracket and label positions and verify the repeat count in KET
     *
     * Version 3.21.0
     */
    await openSGroupDialogForChain();
    const dialog = SGroupPropertiesDialog(page);
    const canvas = SGroupCanvas(page);
    await dialog.selectType(TypeOption.MultipleGroup);
    await dialog.setRepeatCountValue('2');
    await dialog.apply();

    const label = getSGroupLabelLocator(page, { labelText: '2' });
    const before = JSON.parse(await getKet(page));
    const baseline = (await canvas.bracketBounds()).sort((a, b) => a.x - b.x);
    const labelBefore = await label.boundingBox();
    expect(labelBefore).not.toBeNull();
    if (!labelBefore) {
      throw new Error('Repeat count label is not visible');
    }

    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await dialog.selectBracketType(BracketTypeOption.Curly);
    await dialog.apply();

    const bounds = (await canvas.bracketBounds()).sort((a, b) => a.x - b.x);
    bounds.forEach((box, index) => expectSameBounds(box, baseline[index]));
    const labelAfter = await label.boundingBox();
    expect(labelAfter).not.toBeNull();
    if (!labelAfter) {
      throw new Error('Repeat count label is not visible after editing');
    }
    expectSameBounds(labelAfter, labelBefore);
    const after = JSON.parse(await getKet(page));
    expect(after.mol0.sgroups).toEqual([
      { ...before.mol0.sgroups[0], brackets: bracketPair('curly') },
    ]);
  });

  test('Case 24 - Creating another same-atom group reflows brackets', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10469
     * Description: Adding and undoing a same-atom group recalculates both bracket pairs.
     * Scenario:
     * 1. Open a single round SRU and record its bracket position
     * 2. Draw a Phosphate component around the same atoms
     * 3. Check separation and unchanged chemistry, then undo and redo
     *
     * Version 3.21.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      `${TEST_DATA_FOLDER}/same-atoms-sru-only.ket`,
    );
    const canvas = SGroupCanvas(page);
    const dialog = SGroupPropertiesDialog(page);
    const before = JSON.parse(await getKet(page));
    const single = (await canvas.bracketBounds()).sort((a, b) => a.x - b.x);
    expect(single).toHaveLength(2);

    await LeftToolbar(page).sGroup();
    await canvas.drawAroundSingleGroup();
    await dialog.selectType(TypeOption.NucleotideComponent);
    await dialog.selectComponent(ComponentOption.Phosphate);
    await dialog.apply();

    await expect(canvas.brackets).toHaveCount(4);
    const created = JSON.parse(await getKet(page));
    expect(withoutSelection(created.mol0.atoms)).toEqual(
      withoutSelection(before.mol0.atoms),
    );
    expect(withoutSelection(created.mol0.bonds)).toEqual(
      withoutSelection(before.mol0.bonds),
    );
    expect(created.mol0.sgroups).toEqual([
      before.mol0.sgroups[0],
      expect.objectContaining({
        type: 'SUP',
        class: 'PHOSPHATE',
        atoms: [0, 1, 2, 3, 4, 5, 6],
      }),
    ]);
    const separated = (await canvas.bracketBounds()).sort((a, b) => a.x - b.x);
    expect(
      separated[1].x - separated[0].x - separated[0].width,
    ).toBeGreaterThan(1);
    expect(
      separated[3].x - separated[2].x - separated[2].width,
    ).toBeGreaterThan(1);

    await CommonTopLeftToolbar(page).undo();
    await expect(canvas.brackets).toHaveCount(2);
    const undone = (await canvas.bracketBounds()).sort((a, b) => a.x - b.x);
    undone.forEach((box, index) => expectSameBounds(box, single[index]));
    expect(JSON.parse(await getKet(page)).mol0.sgroups).toEqual(
      before.mol0.sgroups,
    );

    await CommonTopLeftToolbar(page).redo();
    await expect(canvas.brackets).toHaveCount(4);
    expect(JSON.parse(await getKet(page)).mol0.sgroups).toEqual(
      created.mol0.sgroups,
    );
  });

  test('Case 25 - Contracted same-atom groups reflow in Macromolecules mode', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10469
     * Description: Both renderers exclude contracted groups from bracket layout.
     * Scenario:
     * 1. Contract a Phosphate component nested with a round SRU
     * 2. Switch to Flex and verify one bracket pair and the contracted label
     * 3. Expand in Molecules, return to Flex and verify two separated pairs
     *
     * Version 3.21.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      `${TEST_DATA_FOLDER}/same-atoms.ket`,
    );
    const canvas = SGroupCanvas(page);
    const before = JSON.parse(await getKet(page));
    await ContextMenu(page, await canvas.leftBracketPoint('inner')).click(
      SuperatomOption.ContractAbbreviation,
    );
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
    });
    await expect(canvas.macroBrackets).toHaveCount(2);
    await expect(
      getSGroupLabelLocator(page, { labelText: 'Phosphate' }),
    ).toBeVisible();

    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await ContextMenu(
      page,
      getAbbreviationLocator(page, { type: 'SUP' }),
    ).click(SuperatomOption.ExpandAbbreviation);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
    });
    await expect(canvas.macroBrackets).toHaveCount(4);
    const bounds = (await canvas.macroBracketBounds()).sort(
      (a, b) => a.x - b.x,
    );
    expect(bounds[1].x - bounds[0].x - bounds[0].width).toBeGreaterThan(1);
    expect(bounds[3].x - bounds[2].x - bounds[2].width).toBeGreaterThan(1);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    const after = JSON.parse(await getKet(page));
    expect(after.mol0.atoms).toEqual(before.mol0.atoms);
    expect(after.mol0.bonds).toEqual(before.mol0.bonds);
    expect(after.mol0.sgroups).toEqual(before.mol0.sgroups);
  });

  test('Case 26 - Copying a styled S-group retains its bracket', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10469
     * Description: Copying and pasting a styled group preserves its bracket type.
     * Scenario:
     * 1. Open a curly SRU and copy the whole structure
     * 2. Paste it away from the original
     * 3. Check both groups and undo and redo the paste
     *
     * Version 3.21.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      `${TEST_DATA_FOLDER}/sru-curly.ket`,
    );
    const before = JSON.parse(await getKet(page));
    await copyAndPaste(page);
    await clickOnCanvas(page, 250, 0, { from: 'canvasCenter' });
    await keyboardPressOnCanvas(page, 'ControlOrMeta+Shift+KeyA');

    const pasted = JSON.parse(await getKet(page));
    expect(pasted.root.nodes).toHaveLength(2);
    for (const reference of pasted.root.nodes) {
      const molecule = pasted[reference.$ref];
      expect(molecule.atoms).toHaveLength(before.mol0.atoms.length);
      expect(molecule.bonds).toEqual(before.mol0.bonds);
      expect(molecule.sgroups).toEqual(before.mol0.sgroups);
    }

    await CommonTopLeftToolbar(page).undo();
    expect(JSON.parse(await getKet(page)).root.nodes).toHaveLength(1);
    await CommonTopLeftToolbar(page).redo();
    const redone = JSON.parse(await getKet(page));
    expect(redone.root.nodes).toHaveLength(2);
    const normalizeBonds = (bonds: { atoms: number[]; type: number }[]) =>
      bonds.map((bond) => ({
        ...bond,
        atoms: [...bond.atoms].sort((a, b) => a - b),
      }));
    for (const reference of redone.root.nodes) {
      const molecule = redone[reference.$ref];
      expect(molecule.atoms).toHaveLength(before.mol0.atoms.length);
      expect(normalizeBonds(molecule.bonds)).toEqual(
        normalizeBonds(before.mol0.bonds),
      );
      expect(molecule.sgroups).toHaveLength(1);
      const { atoms, ...attributes } = molecule.sgroups[0];
      const { atoms: beforeAtoms, ...beforeAttributes } =
        before.mol0.sgroups[0];
      expect(attributes).toEqual(beforeAttributes);
      expect([...atoms].sort()).toEqual([...beforeAtoms].sort());
    }
  });

  test('Case 27 - Moving same-atom groups keeps their geometry and styles', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10469
     * Description: Moving groups with the same atoms keeps their brackets separated.
     * Scenario:
     * 1. Open a round SRU and square Phosphate component over the same atoms
     * 2. Select and drag the structure
     * 3. Check geometry, styles and memberships before and after the move
     * 4. Undo and redo the move
     *
     * Version 3.21.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      `${TEST_DATA_FOLDER}/same-atoms.ket`,
    );
    const canvas = SGroupCanvas(page);
    const label = getSGroupLabelLocator(page, { labelText: 'Phosphate' });
    const before = JSON.parse(await getKet(page));
    const beforeBounds = (await canvas.bracketBounds()).sort(
      (a, b) => a.x - b.x,
    );
    const beforeLabel = await label.boundingBox();
    expect(beforeLabel).not.toBeNull();
    if (!beforeLabel) {
      throw new Error('Phosphate label is not visible');
    }

    await selectAllStructuresOnCanvas(page);
    await canvas.dragLeftBracket('outer', { x: 80, y: 40 });
    await keyboardPressOnCanvas(page, 'ControlOrMeta+Shift+KeyA');

    const moved = JSON.parse(await getKet(page));
    const movedBounds = (await canvas.bracketBounds()).sort(
      (a, b) => a.x - b.x,
    );
    const movedLabel = await label.boundingBox();
    expect(movedLabel).not.toBeNull();
    if (!movedLabel) {
      throw new Error('Phosphate label is not visible after moving');
    }

    const offsetX =
      moved.mol0.atoms[0].location[0] - before.mol0.atoms[0].location[0];
    const offsetY =
      moved.mol0.atoms[0].location[1] - before.mol0.atoms[0].location[1];
    expect(Math.hypot(offsetX, offsetY)).toBeGreaterThan(0.1);
    moved.mol0.atoms.forEach((atom: { location: number[] }, index: number) => {
      expect(
        atom.location[0] - before.mol0.atoms[index].location[0],
      ).toBeCloseTo(offsetX, 5);
      expect(
        atom.location[1] - before.mol0.atoms[index].location[1],
      ).toBeCloseTo(offsetY, 5);
    });
    expect(moved.mol0.bonds).toEqual(before.mol0.bonds);
    expect(moved.mol0.sgroups).toEqual(before.mol0.sgroups);
    expect(movedBounds).toHaveLength(4);
    for (let index = 0; index < movedBounds.length; index++) {
      expect(movedBounds[index].x - beforeBounds[index].x).toBeCloseTo(80, 0);
      expect(movedBounds[index].y - beforeBounds[index].y).toBeCloseTo(40, 0);
      expect(movedBounds[index].width).toBeCloseTo(
        beforeBounds[index].width,
        1,
      );
      expect(movedBounds[index].height).toBeCloseTo(
        beforeBounds[index].height,
        1,
      );
    }
    expect(
      movedBounds[1].x - movedBounds[0].x - movedBounds[0].width,
    ).toBeGreaterThan(1);
    expect(
      movedBounds[3].x - movedBounds[2].x - movedBounds[2].width,
    ).toBeGreaterThan(1);
    expect(movedLabel.x - beforeLabel.x).toBeCloseTo(80, 0);
    expect(movedLabel.y - beforeLabel.y).toBeCloseTo(40, 0);

    await CommonTopLeftToolbar(page).undo();
    const undone = JSON.parse(await getKet(page));
    expectAtomsAtPositions(undone.mol0.atoms, before.mol0.atoms);
    expect(undone.mol0.sgroups).toEqual(before.mol0.sgroups);
    await CommonTopLeftToolbar(page).redo();
    const redone = JSON.parse(await getKet(page));
    expectAtomsAtPositions(redone.mol0.atoms, moved.mol0.atoms);
    expect(redone.mol0.sgroups).toEqual(before.mol0.sgroups);
  });

  test('Case 28 - Redoing a pasted pair of same-atom S-groups restores their brackets', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10469
     * Description: Copying and redoing a paste preserves both same-atom groups.
     * Scenario:
     * 1. Open a round SRU and square Phosphate component over the same atoms
     * 2. Copy the structure and paste it away from the original
     * 3. Undo and redo the paste
     * 4. Check the two pairs of brackets, their hierarchy and KET styles
     * 5. Reopen the result and check that all brackets are still visible
     *
     * Version 3.21.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      `${TEST_DATA_FOLDER}/same-atoms.ket`,
    );
    const canvas = SGroupCanvas(page);
    const before = JSON.parse(await getKet(page));
    await copyAndPaste(page);
    await clickOnCanvas(page, 250, 0, { from: 'canvasCenter' });
    await keyboardPressOnCanvas(page, 'ControlOrMeta+Shift+KeyA');
    await expect(canvas.brackets).toHaveCount(8);

    const pasted = JSON.parse(await getKet(page));
    expect(pasted.root.nodes).toHaveLength(2);
    const pastedBounds = (await canvas.bracketBounds()).sort(
      (a, b) => a.x - b.x,
    );
    expect(
      pasted.mol1.sgroups.map((group: { type: string }) => group.type),
    ).toEqual(before.mol0.sgroups.map((group: { type: string }) => group.type));

    await CommonTopLeftToolbar(page).undo();
    await expect(canvas.brackets).toHaveCount(4);
    await CommonTopLeftToolbar(page).redo();
    await expect(canvas.brackets).toHaveCount(8);

    const redone = JSON.parse(await getKet(page));
    expect(redone.root.nodes).toHaveLength(2);
    expect(
      redone.mol1.sgroups.map((group: { type: string }) => group.type),
    ).toEqual(pasted.mol1.sgroups.map((group: { type: string }) => group.type));
    const redoneBounds = (await canvas.bracketBounds()).sort(
      (a, b) => a.x - b.x,
    );
    redoneBounds.forEach((bounds, index) =>
      expectSameBounds(bounds, pastedBounds[index]),
    );
    const sru = redone.mol1.sgroups.find(
      (group: { type: string }) => group.type === 'SRU',
    );
    const phosphate = redone.mol1.sgroups.find(
      (group: { type: string }) => group.type === 'SUP',
    );
    expect(sru).toMatchObject({
      brackets: bracketPair('parenthetic'),
      subscript: 'n',
    });
    expect(phosphate).toMatchObject({ class: 'PHOSPHATE', expanded: true });
    expect(phosphate).not.toHaveProperty('brackets');
    expect([...sru.atoms].sort()).toEqual([...phosphate.atoms].sort());
    expect([...sru.atoms].sort()).toEqual([0, 1, 2, 3, 4, 5, 6]);

    await pasteFromClipboardAndOpenAsNewProject(page, JSON.stringify(redone));
    await expect(canvas.brackets).toHaveCount(8);
    const reopened = JSON.parse(await getKet(page));
    expect(reopened.mol1.sgroups).toEqual(redone.mol1.sgroups);
  });

  test('Case 29 - Undoing structure deletion restores same-atom brackets', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10469
     * Description: Undo restores the hierarchy and styles of deleted groups.
     * Scenario:
     * 1. Open a round SRU and square Phosphate component over the same atoms
     * 2. Select and delete the entire structure
     * 3. Undo, then compare the brackets, styles and chemistry with the original
     * 4. Redo and undo the deletion again
     *
     * Version 3.21.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      `${TEST_DATA_FOLDER}/same-atoms.ket`,
    );
    const canvas = SGroupCanvas(page);
    const before = JSON.parse(await getKet(page));
    const beforeBounds = (await canvas.bracketBounds()).sort(
      (a, b) => a.x - b.x,
    );

    await selectAllStructuresOnCanvas(page);
    await keyboardPressOnCanvas(page, 'Delete');
    await expect(canvas.brackets).toHaveCount(0);

    for (let cycle = 0; cycle < 2; cycle++) {
      await CommonTopLeftToolbar(page).undo();
      await expect(canvas.brackets).toHaveCount(4);
      const restored = JSON.parse(await getKet(page));
      expectAtomsAtPositions(restored.mol0.atoms, before.mol0.atoms);
      expect(restored.mol0.bonds).toEqual(before.mol0.bonds);
      expect(restored.mol0.sgroups).toEqual(before.mol0.sgroups);
      const restoredBounds = (await canvas.bracketBounds()).sort(
        (a, b) => a.x - b.x,
      );
      restoredBounds.forEach((bounds, index) =>
        expectSameBounds(bounds, beforeBounds[index]),
      );
      await CommonTopLeftToolbar(page).redo();
      await expect(canvas.brackets).toHaveCount(0);
    }
  });

  test('Case 30 - Undoing outer-group removal restores hierarchy and KET', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/10469
     * Description: Restoring an outer group retains its child and KET order.
     * Scenario:
     * 1. Open a round SRU and square Phosphate component over the same atoms
     * 2. Erase the outer SRU while keeping the inner component
     * 3. Undo, then compare both bracket pairs, styles and chemistry
     * 4. Redo and undo again, then reopen the saved KET
     *
     * Version 3.21.0
     */
    await openFileAndAddToCanvasAsNewProject(
      page,
      `${TEST_DATA_FOLDER}/same-atoms.ket`,
    );
    const canvas = SGroupCanvas(page);
    const before = JSON.parse(await getKet(page));
    const beforeBounds = (await canvas.bracketBounds()).sort(
      (a, b) => a.x - b.x,
    );

    await CommonLeftToolbar(page).erase();
    await canvas.clickLeftBracket('outer');
    await expect(canvas.brackets).toHaveCount(2);
    expect(JSON.parse(await getKet(page)).mol0.sgroups).toEqual([
      expect.objectContaining({ type: 'SUP', class: 'PHOSPHATE' }),
    ]);

    for (let cycle = 0; cycle < 2; cycle++) {
      await CommonTopLeftToolbar(page).undo();
      await expect(canvas.brackets).toHaveCount(4);
      const restored = JSON.parse(await getKet(page));
      expectAtomsAtPositions(restored.mol0.atoms, before.mol0.atoms);
      expect(restored.mol0.bonds).toEqual(before.mol0.bonds);
      expect(restored.mol0.sgroups).toEqual(before.mol0.sgroups);
      const restoredBounds = (await canvas.bracketBounds()).sort(
        (a, b) => a.x - b.x,
      );
      restoredBounds.forEach((bounds, index) =>
        expectSameBounds(bounds, beforeBounds[index]),
      );
      if (cycle === 0) {
        await CommonTopLeftToolbar(page).redo();
        await expect(canvas.brackets).toHaveCount(2);
      }
    }

    const restoredKet = await getKet(page);
    await pasteFromClipboardAndOpenAsNewProject(page, restoredKet);
    await expect(canvas.brackets).toHaveCount(4);
    expect(JSON.parse(await getKet(page)).mol0.sgroups).toEqual(
      before.mol0.sgroups,
    );
    const reopenedBounds = (await canvas.bracketBounds()).sort(
      (a, b) => a.x - b.x,
    );
    reopenedBounds.forEach((bounds, index) =>
      expectSameBounds(bounds, beforeBounds[index]),
    );
  });

  test('Case 31 - Opening positioned brackets preserves their coordinates', async () => {
    const source = JSON.parse(
      await readFile(
        join(getTestDataDirectory(), TEST_DATA_FOLDER, 'positioned-sru.ket'),
        'utf8',
      ),
    );
    await openFileAndAddToCanvasAsNewProject(
      page,
      `${TEST_DATA_FOLDER}/positioned-sru.ket`,
    );

    const canvas = SGroupCanvas(page);
    await expect(canvas.brackets).toHaveCount(2);
    const saved = JSON.parse(await getKet(page));
    expect(saved.mol0.sgroups[0].brackets).toEqual(
      source.mol0.sgroups[0].brackets,
    );
    expectAtomsAtPositions(saved.mol0.atoms, source.mol0.atoms);

    await pasteFromClipboardAndOpenAsNewProject(page, JSON.stringify(saved));
    const reopened = JSON.parse(await getKet(page));
    expect(reopened.mol0.sgroups[0].brackets).toEqual(
      source.mol0.sgroups[0].brackets,
    );
    expectAtomsAtPositions(reopened.mol0.atoms, source.mol0.atoms);
    await expect(canvas.brackets).toHaveCount(2);
  });

  test('Case 32 - setMolecule preserves positioned brackets and atom coordinates', async () => {
    const sourceText = await readFile(
      join(getTestDataDirectory(), TEST_DATA_FOLDER, 'positioned-sru.ket'),
      'utf8',
    );
    const source = JSON.parse(sourceText);
    await page.evaluate((ket) => window.ketcher.setMolecule(ket), sourceText);

    const saved = JSON.parse(await getKet(page));
    expect(saved.mol0.sgroups[0].brackets).toEqual(
      source.mol0.sgroups[0].brackets,
    );
    expectAtomsAtPositions(saved.mol0.atoms, source.mol0.atoms);
    await expect(SGroupCanvas(page).brackets).toHaveCount(2);
  });

  test('Case 33 - Editing a positioned pair preserves each position and its closing label', async () => {
    await openFileAndAddToCanvasAsNewProject(
      page,
      `${TEST_DATA_FOLDER}/positioned-sru.ket`,
    );
    const canvas = SGroupCanvas(page);
    const closing = page
      .getByTestId('canvas')
      .getByTestId('s-group-bracket')
      .and(page.locator('[data-bracket-side="closing"]'));
    const label = getSGroupLabelLocator(page, { labelText: 'n' });
    const closingBounds = await closing.boundingBox();
    const labelBounds = await label.boundingBox();
    if (!closingBounds || !labelBounds) {
      throw new Error(
        'The positioned closing bracket and label must be visible',
      );
    }
    expect(labelBounds.x).toBeGreaterThan(closingBounds.x);
    expect(labelBounds.y).toBeGreaterThan(
      closingBounds.y + closingBounds.height / 2,
    );
    const before = JSON.parse(await getKet(page));

    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    const dialog = SGroupPropertiesDialog(page);
    await expect(dialog.roundBracketRadioButton).toBeChecked();
    await dialog.selectBracketType(BracketTypeOption.Curly);
    await dialog.apply();

    const after = JSON.parse(await getKet(page));
    const originalBrackets = before.mol0.sgroups[0].brackets;
    expect(after.mol0.sgroups[0].brackets).toEqual({
      opening: { ...originalBrackets.opening, type: 'curly' },
      closing: { ...originalBrackets.closing, type: 'curly' },
    });
    expectAtomsAtPositions(after.mol0.atoms, before.mol0.atoms);
    for (const path of await canvas.brackets.all()) {
      expect(await path.getAttribute('d')).toContain('Q');
    }

    await CommonTopLeftToolbar(page).undo();
    expect(JSON.parse(await getKet(page)).mol0.sgroups[0].brackets).toEqual(
      originalBrackets,
    );
    await CommonTopLeftToolbar(page).redo();
    expect(JSON.parse(await getKet(page)).mol0.sgroups[0].brackets).toEqual(
      after.mol0.sgroups[0].brackets,
    );
  });

  for (const zeroLength of ['opening', 'closing', 'both'] as const) {
    test(`Case 34 - Zero-length ${zeroLength} suppresses the pair through reload, mode changes, and copying`, async () => {
      const source = JSON.parse(
        await readFile(
          join(getTestDataDirectory(), TEST_DATA_FOLDER, 'positioned-sru.ket'),
          'utf8',
        ),
      );
      const expected = source.mol0.sgroups[0].brackets;
      if (zeroLength === 'both') {
        for (const side of ['opening', 'closing'] as const) {
          expected[side].position = {
            start: { x: 0, y: 0 },
            end: { x: 0, y: 0 },
          };
        }
      } else {
        expected[zeroLength].position.end = {
          ...expected[zeroLength].position.start,
        };
      }
      await pasteFromClipboardAndOpenAsNewProject(page, JSON.stringify(source));

      const canvas = SGroupCanvas(page);
      await expect(canvas.brackets).toHaveCount(0);
      const saved = await getKet(page);
      expect(JSON.parse(saved).mol0.sgroups[0].brackets).toEqual(expected);

      await pasteFromClipboardAndOpenAsNewProject(page, saved);
      await expect(canvas.brackets).toHaveCount(0);
      expect(JSON.parse(await getKet(page)).mol0.sgroups[0].brackets).toEqual(
        expected,
      );

      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
        enableFlexMode: true,
      });
      await expect(canvas.macroBrackets).toHaveCount(0);
      expect(JSON.parse(await getKet(page)).mol0.sgroups[0].brackets).toEqual(
        expected,
      );

      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
      await expect(canvas.brackets).toHaveCount(0);
      expect(JSON.parse(await getKet(page)).mol0.sgroups[0].brackets).toEqual(
        expected,
      );

      await copyAndPaste(page);
      await clickOnCanvas(page, 250, 0, { from: 'canvasCenter' });
      await keyboardPressOnCanvas(page, 'ControlOrMeta+Shift+KeyA');
      await expect(canvas.brackets).toHaveCount(2);
      const pasted = JSON.parse(await getKet(page));
      expect(pasted.root.nodes).toHaveLength(2);
      expect(pasted.mol0.sgroups[0].brackets).toEqual(expected);
      expect(pasted.mol1.sgroups[0].brackets).toEqual(
        bracketPair('parenthetic'),
      );

      await CommonTopLeftToolbar(page).undo();
      await expect(canvas.brackets).toHaveCount(0);
      expect(JSON.parse(await getKet(page)).mol0.sgroups[0].brackets).toEqual(
        expected,
      );
      await CommonTopLeftToolbar(page).redo();
      await expect(canvas.brackets).toHaveCount(2);
      const redone = JSON.parse(await getKet(page));
      expect(redone.mol0.sgroups[0].brackets).toEqual(expected);
      expect(redone.mol1.sgroups[0].brackets).toEqual(
        bracketPair('parenthetic'),
      );
    });
  }

  test('Case 35 - Query component style survives KET reload and history', async () => {
    await openSGroupDialogForChain();
    const dialog = SGroupPropertiesDialog(page);
    await dialog.selectType(TypeOption.QueryComponent);
    await dialog.selectBracketType(BracketTypeOption.Curly);
    await dialog.apply();

    const created = JSON.parse(await getKet(page));
    expect(created.mol0.sgroups).toEqual([
      expect.objectContaining({
        type: 'queryComponent',
        brackets: bracketPair('curly'),
      }),
    ]);

    await pasteFromClipboardAndOpenAsNewProject(page, JSON.stringify(created));
    await selectAllStructuresOnCanvas(page);
    await LeftToolbar(page).sGroup();
    await expect(dialog.curlyBracketRadioButton).toBeChecked();
    await dialog.selectBracketType(BracketTypeOption.Round);
    await dialog.apply();
    const edited = JSON.parse(await getKet(page));
    expect(edited.mol0.sgroups[0].brackets).toEqual(bracketPair('parenthetic'));

    await CommonTopLeftToolbar(page).undo();
    expect(JSON.parse(await getKet(page)).mol0.sgroups[0].brackets).toEqual(
      bracketPair('curly'),
    );
    await CommonTopLeftToolbar(page).redo();
    expect(JSON.parse(await getKet(page)).mol0.sgroups[0].brackets).toEqual(
      bracketPair('parenthetic'),
    );
  });

  test('Case 36 - Mixed bracket types report an error without replacing the document', async () => {
    const source = JSON.parse(
      await readFile(
        join(getTestDataDirectory(), TEST_DATA_FOLDER, 'positioned-sru.ket'),
        'utf8',
      ),
    );
    await pasteFromClipboardAndOpenAsNewProject(page, JSON.stringify(source));
    const before = JSON.parse(await getKet(page));
    source.mol0.sgroups[0].brackets.closing.type = 'curly';
    await pasteFromClipboardAndOpenAsNewProject(
      page,
      JSON.stringify(source),
      true,
    );

    const error = ErrorMessageDialog(page);
    await expect(error.errorMessageBody).toContainText(
      'Cannot deserialize input JSON',
    );
    await error.close();
    await OpenStructureDialog(page).closeWindow();
    expect(JSON.parse(await getKet(page))).toEqual(before);
  });

  test('Case 37 - DATA groups do not write bracket data', async () => {
    await openSGroupDialogForChain();
    const dialog = SGroupPropertiesDialog(page);
    await dialog.setOptions({
      Type: TypeOption.Data,
      Context: ContextOption.Fragment,
      FieldName: 'Test',
      FieldValue: '33',
      PropertyLabelType: PropertyLabelType.Absolute,
    });

    const saved = JSON.parse(await getKet(page));
    expect(saved.mol0.sgroups[0]).toMatchObject({
      type: 'DAT',
      fieldName: 'Test',
      fieldData: '33',
    });
    expect(saved.mol0.sgroups[0]).not.toHaveProperty('brackets');
    expect(saved.mol0.sgroups[0]).not.toHaveProperty('bracketType');
  });

  test('Case 38 - Moving a member atom in Flex invalidates positions and is undoable', async () => {
    await openFileAndAddToCanvasAsNewProject(
      page,
      `${TEST_DATA_FOLDER}/positioned-sru.ket`,
    );
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
    });
    const canvas = getCanvasByMode(page, 'macromolecules');
    const atom = canvas.getByTestId('atom').last();
    const bounds = await atom.boundingBox();
    if (!bounds) {
      throw new Error('The member atom must be visible in Flex mode');
    }
    const before = JSON.parse(await getKet(page));
    const x = bounds.x + bounds.width / 2;
    const y = bounds.y + bounds.height / 2;

    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 80, y + 40, { steps: 10 });
    await page.mouse.up();

    const moved = JSON.parse(await getKet(page));
    expect(moved.mol0.atoms[0].location).not.toEqual(
      before.mol0.atoms[0].location,
    );
    expectAtomsAtPositions([moved.mol0.atoms[1]], [before.mol0.atoms[1]]);
    expect(moved.mol0.sgroups[0].brackets).toEqual(bracketPair('parenthetic'));

    await CommonTopLeftToolbar(page).undo();
    const undone = JSON.parse(await getKet(page));
    expectAtomsAtPositions(undone.mol0.atoms, before.mol0.atoms);
    expect(undone.mol0.sgroups[0].brackets).toEqual(
      before.mol0.sgroups[0].brackets,
    );
    await CommonTopLeftToolbar(page).redo();
    const redone = JSON.parse(await getKet(page));
    expectAtomsAtPositions(redone.mol0.atoms, moved.mol0.atoms);
    expect(redone.mol0.sgroups[0].brackets).toEqual(bracketPair('parenthetic'));
  });

  for (const method of ['setMolecule', 'addFragment'] as const) {
    test(`Case 39 - ${method} preserves positioned brackets when atoms stay in place`, async () => {
      const sourceText = await readFile(
        join(getTestDataDirectory(), TEST_DATA_FOLDER, 'positioned-sru.ket'),
        'utf8',
      );
      const source = JSON.parse(sourceText);
      await page.evaluate(
        ({ ket, apiMethod }) =>
          window.ketcher[apiMethod](ket, { position: { x: 0, y: 0 } }),
        { ket: sourceText, apiMethod: method },
      );

      const saved = JSON.parse(await getKet(page));
      expectAtomsAtPositions(saved.mol0.atoms, source.mol0.atoms);
      expect(saved.mol0.sgroups[0].brackets).toEqual(
        source.mol0.sgroups[0].brackets,
      );
      await expect(SGroupCanvas(page).brackets).toHaveCount(2);
    });

    test(`Case 40 - ${method} drops bracket positions when atoms are relocated`, async () => {
      const sourceText = await readFile(
        join(getTestDataDirectory(), TEST_DATA_FOLDER, 'positioned-sru.ket'),
        'utf8',
      );
      const source = JSON.parse(sourceText);
      await page.evaluate(
        ({ ket, apiMethod }) =>
          window.ketcher[apiMethod](ket, { position: { x: 4, y: 3 } }),
        { ket: sourceText, apiMethod: method },
      );

      const saved = JSON.parse(await getKet(page));
      expect(saved.mol0.atoms[0].location).not.toEqual(
        source.mol0.atoms[0].location,
      );
      expect(saved.mol0.sgroups[0].brackets).toEqual(
        bracketPair('parenthetic'),
      );
      await expect(SGroupCanvas(page).brackets).toHaveCount(2);
    });
  }

  test('Case 41 - Deleting a Flex member atom invalidates positions and is undoable', async () => {
    await openFileAndAddToCanvasAsNewProject(
      page,
      `${TEST_DATA_FOLDER}/positioned-sru.ket`,
    );
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
    });
    const canvas = getCanvasByMode(page, 'macromolecules');
    const before = JSON.parse(await getKet(page));
    const atomBounds = await canvas.getByTestId('atom').last().boundingBox();
    const groupBounds = await canvas.getByTestId('s-group').boundingBox();
    if (!atomBounds || !groupBounds) {
      throw new Error('The group and member atom must be visible in Flex mode');
    }
    await page.mouse.move(groupBounds.x - 10, atomBounds.y - 20);
    await page.mouse.down();
    await page.mouse.move(
      atomBounds.x + atomBounds.width + 10,
      atomBounds.y + atomBounds.height + 20,
      { steps: 5 },
    );
    await page.mouse.up();
    await keyboardPressOnCanvas(page, 'Delete');

    const deleted = JSON.parse(await getKet(page));
    expect(deleted.mol0.atoms).toHaveLength(1);
    expect(deleted.mol0.sgroups[0].brackets).toEqual(
      bracketPair('parenthetic'),
    );

    await CommonTopLeftToolbar(page).undo();
    const undone = JSON.parse(await getKet(page));
    const byPosition = (a: { location: number[] }, b: { location: number[] }) =>
      a.location[0] - b.location[0] || a.location[1] - b.location[1];
    expectAtomsAtPositions(
      [...undone.mol0.atoms].sort(byPosition),
      [...before.mol0.atoms].sort(byPosition),
    );
    expect([...undone.mol0.bonds[0].atoms].sort()).toEqual([0, 1]);
    expect([...undone.mol0.sgroups[0].atoms].sort()).toEqual([0, 1]);
    expect(undone.mol0.sgroups[0].brackets).toEqual(
      before.mol0.sgroups[0].brackets,
    );
    await CommonTopLeftToolbar(page).redo();
    const redone = JSON.parse(await getKet(page));
    expect(redone.mol0.atoms).toHaveLength(1);
    expect(redone.mol0.sgroups[0].brackets).toEqual(bracketPair('parenthetic'));
  });

  test('Case 42 - Deleting and restoring all Flex atoms restores bracket positions', async () => {
    await openFileAndAddToCanvasAsNewProject(
      page,
      `${TEST_DATA_FOLDER}/positioned-sru.ket`,
    );
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
    });
    const before = JSON.parse(await getKet(page));
    await keyboardPressOnCanvas(page, 'ControlOrMeta+KeyA');
    await keyboardPressOnCanvas(page, 'Delete');
    expect(JSON.parse(await getKet(page)).root.nodes).toHaveLength(0);

    await CommonTopLeftToolbar(page).undo();
    const undone = JSON.parse(await getKet(page));
    expectAtomsAtPositions(undone.mol0.atoms, before.mol0.atoms);
    expect(undone.mol0.sgroups[0].brackets).toEqual(
      before.mol0.sgroups[0].brackets,
    );
    await CommonTopLeftToolbar(page).redo();
    expect(JSON.parse(await getKet(page)).root.nodes).toHaveLength(0);
    await CommonTopLeftToolbar(page).undo();
    expect(JSON.parse(await getKet(page)).mol0.sgroups[0].brackets).toEqual(
      before.mol0.sgroups[0].brackets,
    );
  });

  test('Case 43 - Switching to Flex keeps a positioned group in the viewport', async () => {
    await openFileAndAddToCanvasAsNewProject(
      page,
      `${TEST_DATA_FOLDER}/positioned-sru.ket`,
    );
    const before = JSON.parse(await getKet(page));
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
    });
    const canvas = getCanvasByMode(page, 'macromolecules');
    const viewport = await canvas.boundingBox();
    const group = await canvas.getByTestId('s-group').boundingBox();
    if (!viewport || !group) {
      throw new Error('The positioned group must be visible in Flex mode');
    }
    expect(group.x).toBeGreaterThanOrEqual(viewport.x);
    expect(group.y).toBeGreaterThanOrEqual(viewport.y);
    expect(group.x + group.width).toBeLessThanOrEqual(
      viewport.x + viewport.width,
    );
    expect(group.y + group.height).toBeLessThanOrEqual(
      viewport.y + viewport.height,
    );
    const saved = JSON.parse(await getKet(page));
    expectAtomsAtPositions(saved.mol0.atoms, before.mol0.atoms);
    expect(saved.mol0.sgroups[0].brackets).toEqual(
      before.mol0.sgroups[0].brackets,
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    const microViewport = await getCanvasByMode(
      page,
      'molecules',
    ).boundingBox();
    if (!microViewport) {
      throw new Error('The molecules viewport must be visible after switching');
    }
    const bracketBounds = await SGroupCanvas(page).bracketBounds();
    expect(bracketBounds).toHaveLength(2);
    for (const bracket of bracketBounds) {
      expect(bracket.x).toBeGreaterThanOrEqual(microViewport.x);
      expect(bracket.y).toBeGreaterThanOrEqual(microViewport.y);
      expect(bracket.x + bracket.width).toBeLessThanOrEqual(
        microViewport.x + microViewport.width,
      );
      expect(bracket.y + bracket.height).toBeLessThanOrEqual(
        microViewport.y + microViewport.height,
      );
    }
    expectAtomsAtPositions(
      JSON.parse(await getKet(page)).mol0.atoms,
      before.mol0.atoms,
    );
  });

  test('Case 44 - KET export preserves the molecule selection', async () => {
    await openFileAndAddToCanvasAsNewProject(
      page,
      `${TEST_DATA_FOLDER}/positioned-sru.ket`,
    );
    await selectAllStructuresOnCanvas(page);
    const saved = JSON.parse(await getKet(page));
    expect(
      saved.mol0.atoms.every((atom: { selected?: boolean }) => atom.selected),
    ).toBe(true);
    expect(
      saved.mol0.bonds.every((bond: { selected?: boolean }) => bond.selected),
    ).toBe(true);
  });

  test('Case 45 - Rotating a positioned group in Flex invalidates positions and is undoable', async () => {
    await openFileAndAddToCanvasAsNewProject(
      page,
      `${TEST_DATA_FOLDER}/positioned-sru.ket`,
    );
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
    });
    const before = JSON.parse(await getKet(page));
    await keyboardPressOnCanvas(page, 'ControlOrMeta+KeyA');
    const rotation = RotationTool(page);
    const handleBounds = await rotation.rotationHandle.boundingBox();
    const centerBounds = await rotation.rotationCenterHandle.boundingBox();
    if (!handleBounds || !centerBounds) {
      throw new Error('The rotation handles must be visible in Flex mode');
    }
    const start = {
      x: handleBounds.x + handleBounds.width / 2,
      y: handleBounds.y + handleBounds.height / 2,
    };
    const center = {
      x: centerBounds.x + centerBounds.width / 2,
      y: centerBounds.y + centerBounds.height / 2,
    };
    const target = {
      x: center.x - (start.y - center.y),
      y: center.y + (start.x - center.x),
    };
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(target.x, target.y, { steps: 5 });
    await page.mouse.up();

    const rotated = JSON.parse(await getKet(page));
    expect(rotated.mol0.atoms[0].location).not.toEqual(
      before.mol0.atoms[0].location,
    );
    expect(rotated.mol0.sgroups[0].brackets).toEqual(
      bracketPair('parenthetic'),
    );

    await CommonTopLeftToolbar(page).undo();
    const undone = JSON.parse(await getKet(page));
    expectAtomsAtPositions(undone.mol0.atoms, before.mol0.atoms);
    expect(undone.mol0.sgroups[0].brackets).toEqual(
      before.mol0.sgroups[0].brackets,
    );
    await CommonTopLeftToolbar(page).redo();
    const redone = JSON.parse(await getKet(page));
    expectAtomsAtPositions(redone.mol0.atoms, rotated.mol0.atoms);
    expect(redone.mol0.sgroups[0].brackets).toEqual(bracketPair('parenthetic'));
  });

  test('Case 46 - Opening positioned KET directly in Flex preserves its positions', async () => {
    const sourceText = await readFile(
      join(getTestDataDirectory(), TEST_DATA_FOLDER, 'positioned-sru.ket'),
      'utf8',
    );
    const source = JSON.parse(sourceText);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
    });
    await page.evaluate((ket) => window.ketcher.setMolecule(ket), sourceText);
    await expect(SGroupCanvas(page).macroBrackets).toHaveCount(2);
    const saved = JSON.parse(await getKet(page));
    expectAtomsAtPositions(saved.mol0.atoms, source.mol0.atoms);
    expect(saved.mol0.sgroups[0].brackets).toEqual(
      source.mol0.sgroups[0].brackets,
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await expect(SGroupCanvas(page).brackets).toHaveCount(2);
    const switched = JSON.parse(await getKet(page));
    expectAtomsAtPositions(switched.mol0.atoms, source.mol0.atoms);
    expect(switched.mol0.sgroups[0].brackets).toEqual(
      source.mol0.sgroups[0].brackets,
    );
  });

  test('Case 47 - Positioned group with a same-atom superatom stays in the Flex viewport', async () => {
    await openFileAndAddToCanvasAsNewProject(
      page,
      `${TEST_DATA_FOLDER}/positioned-sru-with-superatom.ket`,
    );
    const before = JSON.parse(await getKet(page));
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor({
      enableFlexMode: true,
    });

    const canvas = getCanvasByMode(page, 'macromolecules');
    const viewport = await canvas.boundingBox();
    const brackets = canvas.getByTestId('s-group-bracket');
    await expect(brackets).toHaveCount(2);
    if (!viewport) {
      throw new Error('The Flex canvas must be visible');
    }
    for (const bracket of await brackets.all()) {
      const bounds = await bracket.boundingBox();
      if (!bounds) {
        throw new Error('Both positioned brackets must be visible');
      }
      expect(bounds.x).toBeGreaterThanOrEqual(viewport.x);
      expect(bounds.y).toBeGreaterThanOrEqual(viewport.y);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(
        viewport.x + viewport.width,
      );
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(
        viewport.y + viewport.height,
      );
    }

    const flex = JSON.parse(await getKet(page));
    expectAtomsAtPositions(flex.mol0.atoms, before.mol0.atoms);
    expect(flex.mol0.sgroups).toEqual(before.mol0.sgroups);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    const restored = JSON.parse(await getKet(page));
    expectAtomsAtPositions(restored.mol0.atoms, before.mol0.atoms);
    expect(restored.mol0.sgroups).toEqual(before.mol0.sgroups);
  });
});
