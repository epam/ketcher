import {
  chooseTab,
  Tabs,
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
  waitForMonomerPreview,
} from '@utils/macromolecules';
import { Page, test, expect } from '@playwright/test';
import {
  addMonomerToCenterOfCanvas,
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  openFileAndAddToCanvasMacro,
  pressButton,
  selectEraseTool,
  selectMonomer,
  selectRectangleSelectionTool,
  takeEditorScreenshot,
  takeMonomerLibraryScreenshot,
  takePageScreenshot,
  takePresetsScreenshot,
  takeRNABuilderScreenshot,
  waitForPageInit,
  waitForRender,
  moveMouseAway,
  takeElementScreenshot,
  takeTopToolbarScreenshot,
  selectSnakeLayoutModeTool,
  selectSequenceLayoutModeTool,
  selectClearCanvasTool,
  clickOnCanvas,
  selectMacroBond,
  selectMonomers,
  addMonomerToFavorites,
  removeMonomerFromFavorites,
  selectCustomPreset,
} from '@utils';
import {
  expandCollapseRnaBuilder,
  pressAddToPresetsButton,
  pressNewPresetButton,
  pressSaveButton,
  selectBaseSlot,
  selectPhosphateSlot,
  selectSugarSlot,
  toggleBasesAccordion,
  toggleNucleotidesAccordion,
  toggleSugarsAccordion,
  RnaAccordionType,
  toggleRnaAccordionItem,
  toggleRnaBuilder,
} from '@utils/macromolecules/rnaBuilder';
import {
  goToMonomerLocationTab,
  MonomerLocationTabs,
} from '@utils/macromolecules/library';
import { clearLocalStorage, pageReload } from '@utils/common/helpers';
import { MacroBondTool } from '@utils/canvas/tools/selectNestedTool/types';
import {
  pressRedoButton,
  pressUndoButton,
} from '@utils/macromolecules/topToolBar';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { Bases } from '@constants/monomers/Bases';
import { Chem } from '@constants/monomers/Chem';
import { Nucleotides } from '@constants/monomers/Nucleotides';
import { Peptides } from '@constants/monomers/Peptides';
import { Phosphates } from '@constants/monomers/Phosphates';
import { Presets } from '@constants/monomers/Presets';
import { Sugars } from '@constants/monomers/Sugars';
import { getMonomerLocator } from '@utils/macromolecules/monomer';

async function drawThreeMonomers(page: Page) {
  const x1 = 301;
  const y1 = 102;
  const x2 = 303;
  const y2 = 504;
  const x3 = 705;
  const y3 = 106;
  await selectMonomer(page, Sugars._3A6);
  await clickOnCanvas(page, x1, y1);
  await selectMonomer(page, Bases.baA);
  await clickOnCanvas(page, x2, y2);
  await selectMonomer(page, Phosphates.P);
  await clickOnCanvas(page, x3, y3);
}

async function drawThreeMonomersConnectedWithBonds(page: Page) {
  const sugar = getMonomerLocator(page, Sugars._3A6).nth(0);
  const base = getMonomerLocator(page, Bases.baA).nth(0);
  const phosphate = getMonomerLocator(page, Phosphates.P).nth(0);

  await drawThreeMonomers(page);
  await selectMacroBond(page, MacroBondTool.SINGLE);
  await sugar.hover();
  await page.mouse.down();
  await base.hover();
  await page.mouse.up();
  await sugar.hover();
  await page.mouse.down();
  await phosphate.hover();
  await page.mouse.up();
}

async function drawBasePhosphate(page: Page) {
  const x = 800;
  const y = 350;
  const base = getMonomerLocator(page, Bases.baA).nth(0);
  const phosphate = getMonomerLocator(page, Phosphates.P).nth(0);

  await selectMonomer(page, Bases.baA);
  await clickInTheMiddleOfTheScreen(page);
  await selectMonomer(page, Phosphates.P);
  await clickOnCanvas(page, x, y);
  await selectMacroBond(page, MacroBondTool.SINGLE);
  await base.hover();
  await page.mouse.down();
  await phosphate.hover();
  await page.mouse.up();
  await pressButton(page, 'R2');
  await pressButton(page, 'Connect');
}

async function drawSugarPhosphate(page: Page) {
  const x = 800;
  const y = 350;
  const sugar = getMonomerLocator(page, Sugars._3A6).nth(0);
  const phosphate = getMonomerLocator(page, Phosphates.P).nth(0);

  await selectMonomer(page, Sugars._3A6);
  await clickInTheMiddleOfTheScreen(page);
  await selectMonomer(page, Phosphates.P);
  await clickOnCanvas(page, x, y);
  await selectMacroBond(page, MacroBondTool.SINGLE);
  await sugar.hover();
  await page.mouse.down();
  await phosphate.hover();
  await page.mouse.up();
}

async function drawSugarBase(page: Page) {
  const x = 800;
  const y = 350;
  const sugar = getMonomerLocator(page, Sugars._3A6).nth(0);
  const base = getMonomerLocator(page, Bases.baA).nth(0);
  await selectMonomer(page, Sugars._3A6);
  await clickInTheMiddleOfTheScreen(page);
  await selectMonomer(page, Bases.baA);
  await clickOnCanvas(page, x, y);
  await selectMacroBond(page, MacroBondTool.SINGLE);
  await sugar.hover();
  await page.mouse.down();
  await base.hover();
  await page.mouse.up();
}

async function pressEscapeWhenPullBond(page: Page) {
  const anyPointX = 300;
  const anyPointY = 500;
  await page.mouse.down();
  await page.mouse.move(anyPointX, anyPointY);
  await page.keyboard.press('Escape');
  await waitForRender(page, async () => {
    await page.mouse.up();
  });
}

async function reloadPageAndConfigureInitialState(page: Page) {
  await pageReload(page);
  await configureInitialState(page);
}

async function configureInitialState(page: Page) {
  await chooseTab(page, Tabs.Rna);
}

test.describe('RNA Library', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
    await configureInitialState(page);
  });

  test.afterEach(async ({ context: _ }) => {
    await selectClearCanvasTool(page);
  });

  test.afterAll(async ({ browser }) => {
    await Promise.all(browser.contexts().map((context) => context.close()));
  });

  test(
    'Check that switch between Macro and Micro mode does not crash application',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
      /* 
    Test case: #3498
    Description: Application does not crash. 
    Test working incorrect because we have bug: https://github.com/epam/ketcher/issues/3498
    */
      await turnOnMicromoleculesEditor(page);
      await turnOnMacromoleculesEditor(page);

      await configureInitialState(page);
    },
  );

  test('Check the RNA components panel', async () => {
    /* 
    Test case: #2748, #2751 - RNA Builder. Accordion component
    Description: Check the RNA components panel. 
    RNA panel consist of:
    RNA Builder(collapsed), Presets(5)(expanded), Sugars(199)(collapsed), 
    Bases(160)(collapsed), Phosphates(32)(collapsed)
    */
    await takeMonomerLibraryScreenshot(page);
  });

  test('Expand RNA Builder', async () => {
    /* 
    Test case: #2748, #2751 - RNA Builder. Accordion component
    Description: After click on arrow RNA Builder expanded.
    */
    await expandCollapseRnaBuilder(page);
    await takeMonomerLibraryScreenshot(page);

    // Reset to default state
    await toggleRnaBuilder(page, 'collapse');
  });

  const testData = [
    {
      component: 'Presets',
      description:
        'After clicking on the arrow, the Presets component collapsed.',
    },
    {
      component: 'Sugars',
      description:
        'After clicking on the arrow, the Sugars component expanded.',
    },
    {
      component: 'Bases',
      description: 'After clicking on the arrow, the Bases component expanded.',
    },
    {
      component: 'Phosphates',
      description:
        'After clicking on the arrow, the Phosphates component expanded.',
    },
  ];

  for (const [index, data] of testData.entries()) {
    test(`Check ${data.component} component`, async () => {
      /* 
      Test case: #2748, #2751 - RNA Builder. Accordion component
      */
      await toggleRnaAccordionItem(
        page,
        data.component as RnaAccordionType,
        'expand',
      );

      await takeMonomerLibraryScreenshot(page);

      // Reset to default state: expand the 'Presets' component after verifying the last item
      if (index === testData.length - 1) {
        await toggleRnaAccordionItem(page, 'Presets', 'expand');
      }
    });
  }

  test('Add Sugar monomer to canvas', async () => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: The selected sugar monomer should be added to the canvas 
    in the form of a square with rounded edges and in the corresponding color.
    */
    // Reload the page to reset the state, as previous tests affects the behavior when adding the sugar monomer
    await reloadPageAndConfigureInitialState(page);

    await addMonomerToCenterOfCanvas(page, Sugars._12ddR);
    await takeEditorScreenshot(page);
  });

  test('Add Base monomer to canvas', async () => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: The selected base monomer should be added to the canvas 
    in the form of a rhombus and in the corresponding color.
    */
    await addMonomerToCenterOfCanvas(page, Bases.A);
    await takeEditorScreenshot(page);
  });

  test('Add Phosphate monomer to canvas', async () => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: The selected phosphate monomer should be added to the canvas 
    in the form of a circle and in the corresponding color.
    */
    await addMonomerToCenterOfCanvas(page, Phosphates.Test_6_Ph);
    await takeEditorScreenshot(page);
  });

  test('Sugar preview window when hovered on canvas', async () => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: The selected sugar monomer should be added to the canvas 
    in the form of a square with rounded edges and in the corresponding color.
    When hover over monomer window with preview appears.
    */
    await addMonomerToCenterOfCanvas(page, Sugars._12ddR);
    await getMonomerLocator(page, Sugars._12ddR).hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('Base preview window when hovered on canvas', async () => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: The selected base monomer should be added to the canvas 
    in the form of a rhombus and in the corresponding color.
    When hover over monomer window with preview appears.
    */
    await addMonomerToCenterOfCanvas(page, Bases.clA);
    await getMonomerLocator(page, Bases.clA).hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('Phosphate preview window when hovered on canvas', async () => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: The selected phosphate monomer should be added to the canvas 
    in the form of a circle and in the corresponding color.
    When hover over monomer window with preview appears.
    */
    await addMonomerToCenterOfCanvas(page, Phosphates.Test_6_Ph);
    await getMonomerLocator(page, Phosphates.Test_6_Ph).hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('Add Custom preset to Presets section', async () => {
    /* 
    Test case: #2759 - Edit RNA mode
    Description: Custom presets added to Presets section.
    */
    await expandCollapseRnaBuilder(page);
    await selectMonomers(page, [Sugars._25R, Bases.A, Phosphates.Test_6_Ph]);
    await pressAddToPresetsButton(page);
    await selectCustomPreset(page, '25R(A)Test-6-Ph_A_25R_Test-6-Ph');
    await expandCollapseRnaBuilder(page);
    await takePresetsScreenshot(page);
  });

  test('Add Custom preset to Presets section and display after page reload', async () => {
    /* 
    Test case: #4427 - Edit RNA mode
    Description: Custom presets added to Presets section and saved in local storage after reload.
    */
    // Reload the page to reset the state, as previous tests affects the RNA-bulder state
    await clearLocalStorage(page);
    await reloadPageAndConfigureInitialState(page);

    await expandCollapseRnaBuilder(page);
    await selectMonomers(page, [Sugars._25R, Bases.A, Phosphates.Test_6_Ph]);
    await pressAddToPresetsButton(page);
    await selectCustomPreset(page, '25R(A)Test-6-Ph_A_25R_Test-6-Ph');
    await expandCollapseRnaBuilder(page);
    await takePresetsScreenshot(page);

    await reloadPageAndConfigureInitialState(page);
    await selectCustomPreset(page, '25R(A)Test-6-Ph_A_25R_Test-6-Ph');
    await expandCollapseRnaBuilder(page);
    await takePresetsScreenshot(page);
  });

  test('Add same Custom preset to Presets section', async () => {
    /* 
    Test case: #4427 - Edit RNA mode
    Description: System alert that you should rename preset.
    */
    // Reload the page to reset the state, as previous tests affects the RNA-bulder state
    await clearLocalStorage(page);
    await reloadPageAndConfigureInitialState(page);

    await expandCollapseRnaBuilder(page);
    await selectMonomers(page, [Sugars._25R, Bases.A, Phosphates.Test_6_Ph]);
    await pressAddToPresetsButton(page);
    await selectCustomPreset(page, '25R(A)Test-6-Ph_A_25R_Test-6-Ph');
    await expandCollapseRnaBuilder(page);
    await takePresetsScreenshot(page);

    await reloadPageAndConfigureInitialState(page);
    await expandCollapseRnaBuilder(page);
    await selectMonomers(page, [Sugars._25R, Bases.A, Phosphates.Test_6_Ph]);
    await pressAddToPresetsButton(page);
    await takeEditorScreenshot(page);
  });

  test('Add Custom preset to Canvas', async () => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: Custom presets added to Canvas.
    */
    // Reload the page to reset the state, as previous tests affects the RNA-bulder state
    await clearLocalStorage(page);
    await reloadPageAndConfigureInitialState(page);

    await expandCollapseRnaBuilder(page);
    await selectMonomers(page, [Sugars._3A6, Bases.baA, Phosphates.bP]);
    await pressAddToPresetsButton(page);
    await selectCustomPreset(page, '3A6(baA)bP_baA_3A6_bP');
    await clickInTheMiddleOfTheScreen(page);
    await selectRectangleSelectionTool(page);
    await takeEditorScreenshot(page);
  });

  test('Add to RNA Sugar which does not contain R3 attachment point(for example 3SS6)', async () => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas https://github.com/epam/ketcher/issues/3615
    Description: Try to add to RNA Sugar which does not contain R3 attachment point(for example 3SS6).
    Test was updated since logic for RNA Builder was changed in a scope of https://github.com/epam/ketcher/issues/3816
    */
    // Reload the page to reset the state, as previous tests affects the RNA-bulder state
    await clearLocalStorage(page);
    await reloadPageAndConfigureInitialState(page);

    await expandCollapseRnaBuilder(page);
    await selectMonomers(page, [Bases.baA, Phosphates.bP]);
    await selectSugarSlot(page);
    await selectMonomer(page, Sugars._3SS6);
    await selectSugarSlot(page);
    await takeRNABuilderScreenshot(page);
  });

  test('Add to presets (different combinations: Sugar+Base', async () => {
    /*
    Test case: #2759 - Edit RNA mode
    Description: Custom presets added to Presets section.
    */
    // Reload needed to reset the RNA builder state, as values from previous tests are preserved
    await clearLocalStorage(page);
    await reloadPageAndConfigureInitialState(page);

    await expandCollapseRnaBuilder(page);
    await selectMonomers(page, [Sugars._25R, Bases.A]);
    await pressAddToPresetsButton(page);
    await selectCustomPreset(page, '25R(A)_A_25R_.');
    await expandCollapseRnaBuilder(page);
    await takePresetsScreenshot(page);
  });

  test('Add to presets (different combinations: Sugar+Phosphate', async () => {
    /*
    Test case: #2759 - Edit RNA mode
    Description: Custom presets added to Presets section.
    */
    // Reload needed to reset the RNA builder state, as values from previous tests are preserved
    await clearLocalStorage(page);
    await reloadPageAndConfigureInitialState(page);

    await expandCollapseRnaBuilder(page);
    await selectMonomers(page, [Sugars._25R, Phosphates.bP]);
    await pressAddToPresetsButton(page);
    await selectCustomPreset(page, '25R()bP_._25R_bP');
    await expandCollapseRnaBuilder(page);
    await takePresetsScreenshot(page);
  });

  test('Add to presets (different combinations: Base+Phosphate', async () => {
    /*
    Test case: #2759 - Edit RNA mode
    Description: Custom preset Base+Phosphate could not be added to Presets.
    */
    // Reload the page to reset the state, as previous tests affects the RNA-bulder state
    await clearLocalStorage(page);
    await reloadPageAndConfigureInitialState(page);

    await expandCollapseRnaBuilder(page);
    await selectMonomers(page, [Bases.A, Phosphates.bP]);
    await selectBaseSlot(page);
    await takeRNABuilderScreenshot(page);
  });

  test('Add Custom preset to Presets section and Edit', async () => {
    /* 
    Test case: #2759 - Edit RNA mode
    Description: Custom presets added to Presets section and can be edited.
    */
    // Reload needed to reset the already added custom preset
    await clearLocalStorage(page);
    await reloadPageAndConfigureInitialState(page);

    await expandCollapseRnaBuilder(page);
    await selectMonomers(page, [Sugars._25R, Bases.A, Phosphates.Test_6_Ph]);
    await pressAddToPresetsButton(page);
    await page.getByTestId('25R(A)Test-6-Ph_A_25R_Test-6-Ph').click({
      button: 'right',
    });
    await page.getByTestId('edit').locator('div').click();
    await selectBaseSlot(page);
    await selectMonomer(page, Bases.baA);
    await moveMouseAway(page);
    await pressSaveButton(page);
    await selectCustomPreset(page, '25R(baA)Test-6-Ph_baA_25R_Test-6-Ph');

    // To avoid unstable test execution
    // Allows see a right preset in a viewport
    await expandCollapseRnaBuilder(page);
    await takePresetsScreenshot(page);
  });

  test('Add Custom preset to Presets section then Duplicate and Edit', async () => {
    /* 
    Test case: #2759 - Edit RNA mode
    Description: Custom presets added to Presets section then can be duplicated and edited.
    */
    // Reload the page to reset the state, as previous tests affects the RNA-bulder state
    await clearLocalStorage(page);
    await reloadPageAndConfigureInitialState(page);

    await expandCollapseRnaBuilder(page);
    await selectMonomers(page, [Sugars._25R, Bases.A, Phosphates.Test_6_Ph]);
    await pressAddToPresetsButton(page);
    await page.getByTestId('25R(A)Test-6-Ph_A_25R_Test-6-Ph').click({
      button: 'right',
    });
    await page.getByTestId('duplicateandedit').locator('div').click();
    await pressSaveButton(page);
    // To avoid unstable test execution
    // Allows see a right preset in a veiwport
    await expandCollapseRnaBuilder(page);
    await page.getByTestId('25R(A)Test-6-Ph_Copy_A_25R_Test-6-Ph').click({
      button: 'right',
    });
    await page.getByTestId('edit').click();
    await selectPhosphateSlot(page);
    await selectMonomer(page, Phosphates.P);
    await pressSaveButton(page);
    await selectCustomPreset(page, '25R(A)P_A_25R_P');
    await moveMouseAway(page);
    await takePresetsScreenshot(page);
  });

  test('After clicking Duplicate and Edit button and subsequently clicking Cancel, preset not saved', async () => {
    /* 
    Test case: #3633 - Edit RNA mode
    Description: After clicking Duplicate and Edit button and subsequently clicking Cancel, preset not saved
    */
    // Reload needed to reset the RNA builder state, as values from previous tests are preserved
    await clearLocalStorage(page);
    await reloadPageAndConfigureInitialState(page);

    await expandCollapseRnaBuilder(page);
    await page.getByTestId(Presets.A.testId).click({
      button: 'right',
    });
    await page.getByTestId('duplicateandedit').locator('div').click();
    await page.getByTestId('cancel-btn').click();
    // To avoid unstable test execution
    // Allows see a right preset in a veiwport
    await expandCollapseRnaBuilder(page);
    await takePresetsScreenshot(page);
  });

  test(
    'Add Custom preset to Presets section and Delete',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
      /* 
    Test case: #2759 - Edit RNA mode
    Description: Custom presets added to Presets section and can be deleted.
    Test working incorrect because we have bug: https://github.com/epam/ketcher/issues/3561
    */
      // Reload needed to reset the RNA builder state, as values from previous tests are preserved
      await clearLocalStorage(page);
      await reloadPageAndConfigureInitialState(page);

      await expandCollapseRnaBuilder(page);
      await selectMonomers(page, [Sugars._25R, Bases.A, Phosphates.Test_6_Ph]);
      await pressAddToPresetsButton(page);
      await page.getByTestId('25R(A)Test-6-Ph_A_25R_Test-6-Ph').click({
        button: 'right',
      });
      await page.getByTestId('deletepreset').click();
      await page.getByRole('button', { name: 'Delete' }).click();
      await takePresetsScreenshot(page);

      // Reset to default state
      await toggleRnaBuilder(page, 'collapse');
    },
  );

  test('Add Custom preset to Presets section and Rename', async () => {
    /* 
    Test case: #2759 - Edit RNA mode
    Description: Custom presets added to Presets section and can be renamed.
    */
    await expandCollapseRnaBuilder(page);
    await selectMonomers(page, [Sugars._25R, Bases.baA, Phosphates.bP]);
    await pressAddToPresetsButton(page);
    await page.getByTestId('25R(baA)bP_baA_25R_bP').click({
      button: 'right',
    });
    await page.getByTestId('edit').locator('div').click();
    await page.getByPlaceholder('Name your structure').click();
    await page.getByPlaceholder('Name your structure').fill('TestMonomers');
    await pressSaveButton(page);
    await takePresetsScreenshot(page);
  });

  test('Autofilling RNA name when selects RNA parts', async () => {
    /* 
    Test case: #2759 - Edit RNA mode
    Description: RNA name autofilling when selects RNA parts.
    */
    // Reload needed to reset the RNA builder state, as values from previous tests are preserved
    await clearLocalStorage(page);
    await reloadPageAndConfigureInitialState(page);

    await expandCollapseRnaBuilder(page);
    await selectSugarSlot(page);
    await selectMonomer(page, Sugars._3A6);
    await moveMouseAway(page);
    await selectBaseSlot(page);
    await selectMonomer(page, Bases.baA);
    await moveMouseAway(page);
    await selectPhosphateSlot(page);
    await selectMonomer(page, Phosphates.bP);
    await takeRNABuilderScreenshot(page, { hideMonomerPreview: true });

    // Reset to default state
    await toggleRnaBuilder(page, 'collapse');
  });

  test('Add names to RNA manually', async () => {
    /* 
    Test case: #2759 - Edit RNA mode
    Description: RNA name added.
    */
    await expandCollapseRnaBuilder(page);
    await selectSugarSlot(page);
    await selectMonomer(page, Sugars._25R);
    // To avoid unstable test execution
    // Hide tooltip which overlays 'rna-builder-slot--base' element
    await moveMouseAway(page);
    await selectBaseSlot(page);
    await selectMonomer(page, Bases.A);
    await selectPhosphateSlot(page);
    await selectMonomer(page, Phosphates.Test_6_Ph);
    await page.getByPlaceholder('Name your structure').click();
    await page.getByPlaceholder('Name your structure').fill('cTest');
    await pressAddToPresetsButton(page);
    await takeRNABuilderScreenshot(page);
  });

  test('Highlight Sugar, Phosphate and Base in Library, once it chosen in RNA Builder', async () => {
    /* 
    Test case: #2759 - Edit RNA mode
    Description: Sugar, Phosphate and Base highlighted in Library.
    */
    // Reload needed to reset the RNA builder state, as values from previous tests are preserved
    await clearLocalStorage(page);
    await reloadPageAndConfigureInitialState(page);

    const monomers = [
      {
        type: 'sugar',
        groupName: 'Sugars',
        name: Sugars._3A6,
      },
      { type: 'base', groupName: 'Bases', name: Bases.baA },
      {
        type: 'phosphate',
        groupName: 'Phosphates',
        name: Phosphates.bP,
      },
    ];

    await expandCollapseRnaBuilder(page);
    for (const monomer of monomers) {
      await selectMonomer(page, monomer.name);
      await page
        .getByTestId(`rna-accordion-details-${monomer.groupName}`)
        .hover();
      await page.mouse.wheel(0, 0);
      await clickInTheMiddleOfTheScreen(page);
      await takeMonomerLibraryScreenshot(page, { maxDiffPixelRatio: 0.03 });
    }
  });

  test('Add Sugar-Base Combination to Canvas', async () => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: Sugar-Base Combination added to Canvas.
    */
    // Reload the page to reset the state, as previous tests affects the RNA-bulder state
    await clearLocalStorage(page);
    await reloadPageAndConfigureInitialState(page);

    await expandCollapseRnaBuilder(page);
    await selectMonomers(page, [Sugars._3A6, Bases.baA]);
    await pressAddToPresetsButton(page);
    await selectCustomPreset(page, '3A6(baA)_baA_3A6_.');
    await clickInTheMiddleOfTheScreen(page);
    await selectRectangleSelectionTool(page);
    await takeEditorScreenshot(page);
  });

  test('Add Sugar-Phosphate Combination to Canvas', async () => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: Sugar-Phosphate Combination added to Canvas.
    */
    // Reload needed to reset the RNA builder state, as values from previous tests are preserved
    await clearLocalStorage(page);
    await reloadPageAndConfigureInitialState(page);

    await expandCollapseRnaBuilder(page);
    await selectMonomers(page, [Sugars._3A6, Phosphates.bP]);
    await pressAddToPresetsButton(page);
    await selectCustomPreset(page, '3A6()bP_._3A6_bP');
    await clickInTheMiddleOfTheScreen(page);
    await selectRectangleSelectionTool(page);
    await takeEditorScreenshot(page);
  });

  test('Can not Add Base-Phosphate Combination to Presets', async () => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: Base-Phosphate Combination not added to Presets.
    */
    // Reload the page to reset the state, as previous tests affects the RNA-bulder state
    await clearLocalStorage(page);
    await reloadPageAndConfigureInitialState(page);

    await expandCollapseRnaBuilder(page);
    await selectMonomers(page, [Bases.baA, Phosphates.bP]);
    await selectBaseSlot(page);
    await takeRNABuilderScreenshot(page);
  });

  test('Add Sugar and Base Combination to Canvas and connect with bond', async () => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: Sugar and Base Combination added to Canvas and connect with bond.
    */
    // Reload needed to reset the RNA builder state, as values from previous tests are preserved
    await clearLocalStorage(page);
    await reloadPageAndConfigureInitialState(page);

    const bondLine = page.locator('g[pointer-events="stroke"]');
    await drawSugarBase(page);
    await bondLine.hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('Add Sugar and Phosphate Combination to Canvas and connect with bond', async () => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: Sugar and Phosphate Combination added to Canvas and connect with bond.
    */
    const bondLine = page.locator('g[pointer-events="stroke"]');
    await drawSugarPhosphate(page);
    await bondLine.hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('Add Base and Phosphate Combination to Canvas and connect with bond', async () => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: Base and Phosphate Combination added to Canvas and connect with bond.
    */
    const bondLine = page.locator('g[pointer-events="stroke"]');
    await drawBasePhosphate(page);
    await bondLine.hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  test('Add Sugar-Base-Phosphate Combination to Canvas and connect with bond', async () => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: Sugar-Base-Phosphate Combination added to Canvas and connect with bond.
    */
    const bondLine = page.locator('g[pointer-events="stroke"]').nth(1);
    await drawThreeMonomersConnectedWithBonds(page);
    await bondLine.hover();
    await waitForMonomerPreview(page);
    await takeEditorScreenshot(page);
  });

  const monomersToDelete = [
    { text: 'R', description: 'Sugar monomer deleted.' },
    { text: 'A', description: 'Base monomer deleted.' },
    { text: 'P', description: 'Phosphate monomer deleted.' },
  ];

  for (const monomer of monomersToDelete) {
    test(`Open file from .ket and Delete ${monomer.text} monomer`, async () => {
      await openFileAndAddToCanvasMacro(
        'KET/monomers-connected-with-bonds.ket',
        page,
      );
      await selectEraseTool(page);
      await getMonomerLocator(page, { monomerAlias: monomer.text }).click();
      await takeEditorScreenshot(page);
    });
  }

  const monomerToDelete = [
    { monomer: Sugars._3A6, description: 'Sugar monomer deleted.' },
    { monomer: Bases.baA, description: 'Base monomer deleted.' },
    { monomer: Phosphates.P, description: 'Phosphate monomer deleted.' },
  ];

  for (const monomer of monomerToDelete) {
    test(`Draw Sugar-Base-Phosphate and Delete ${monomer.monomer.alias} monomer`, async () => {
      await drawThreeMonomersConnectedWithBonds(page);
      await selectEraseTool(page);
      await getMonomerLocator(page, monomer.monomer).click();
      await takeEditorScreenshot(page);
    });
  }

  test('Draw Sugar-Base-Phosphate and Delete connecting bond', async () => {
    /* 
    Test case: Bond tool
    Description: Bond deleted.
    */
    const bondLine = page.locator('g[pointer-events="stroke"]').nth(1);
    await drawThreeMonomersConnectedWithBonds(page);
    await selectEraseTool(page);
    await bondLine.click();
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });

  test('Draw Sugar-Base-Phosphate and try to attach bond to occupied attachment point', async () => {
    /* 
    Test case: Bond tool
    Description: A message appears at the bottom of the canvas: 
    Monomers don't have any connection point available.
    */
    const sugar = getMonomerLocator(page, Sugars._3A6).nth(0);
    const base = getMonomerLocator(page, Bases.baA).nth(0);
    const phosphate = getMonomerLocator(page, Phosphates.P).nth(0);

    await drawThreeMonomers(page);
    await selectMacroBond(page, MacroBondTool.SINGLE);
    await sugar.hover();
    await page.mouse.down();
    await base.hover();
    await page.mouse.up();
    await phosphate.hover();
    await page.mouse.down();
    await base.hover();
    await page.mouse.up();
    await takeEditorScreenshot(page);
  });

  const molecules = [
    { type: 'Sugars', description: Sugars._25R },
    { type: 'Bases', description: Bases.baA },
    { type: 'Phosphates', description: Phosphates.bP },
  ];

  for (const molecule of molecules) {
    test(`Move ${molecule.type} on canvas to new position`, async () => {
      /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: Sugar/Base/Phosphate moved to new position.
    */
      const anyPointX = 300;
      const anyPointY = 500;
      await page.getByTestId(`summary-${molecule.type}`).click();
      await page.getByTestId(molecule.description.testId).click();
      await clickInTheMiddleOfTheScreen(page);
      await selectRectangleSelectionTool(page);
      await clickInTheMiddleOfTheScreen(page);
      await dragMouseTo(anyPointX, anyPointY, page);
      await takeEditorScreenshot(page);
    });
  }

  const monomersToMove = [Sugars._3A6, Bases.baA, Phosphates.P];

  for (const monomer of monomersToMove) {
    test(`Draw Sugar-Base-Phosphate and Move ${monomer.alias} monomer`, async () => {
      /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: Sugar/Base/Phosphate monomer moved to new position. 
    Bonds are connected to monomers. 
    */
      const anyPointX = 400;
      const anyPointY = 400;
      await drawThreeMonomersConnectedWithBonds(page);
      await selectRectangleSelectionTool(page);
      await getMonomerLocator(page, monomer).click();
      await dragMouseTo(anyPointX, anyPointY, page);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
    });
  }

  test(
    'Press "Escape" button while pull the bond from monomer',
    { tag: ['@IncorrectResultBecauseOfBug'] },
    async () => {
      /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: Bond does not remain on the canvas and returns to original position.
    Test working incorrect now because we have bug https://github.com/epam/ketcher/issues/3539
    */
      await addMonomerToCenterOfCanvas(page, Sugars._25R);
      await selectMacroBond(page, MacroBondTool.SINGLE);
      await getMonomerLocator(page, Sugars._25R).click();
      await pressEscapeWhenPullBond(page);
      await takeEditorScreenshot(page);

      // Reset to default
      await toggleRnaAccordionItem(page, 'Presets', 'expand');
    },
  );

  test('Check presence of Clear canvas button in top menu', async () => {
    /* 
    Test case: Clear Canvas tool
    Description: Clear canvas button presence in left menu
    */
    // Remove mouse from Clear Canvas button for correct screenshot
    await moveMouseAway(page);

    await takeTopToolbarScreenshot(page);
  });

  test('Draw Sugar-Base-Phosphate and press Clear canvas', async () => {
    /* 
    Test case: Clear Canvas tool
    Description: Canvas is cleared
    */
    await drawThreeMonomersConnectedWithBonds(page);
    await selectClearCanvasTool(page);
    await takeEditorScreenshot(page);
  });

  test('Open Sugar-Base-Phosphate from .ket file and press Clear canvas', async () => {
    /* 
    Test case: Clear Canvas tool
    Description: Canvas is cleared
    */
    await openFileAndAddToCanvasMacro(
      'KET/monomers-connected-with-bonds.ket',
      page,
    );
    await selectClearCanvasTool(page);
    await takeEditorScreenshot(page);
  });

  test('Save file with three Monomers as .ket file', async () => {
    /* 
    Test case: Open&save files
    Description: File saved with three Monomers as .ket file
    */
    // Reload needed as monomer IDs increment in prior tests, affecting data comparasion
    await reloadPageAndConfigureInitialState(page);

    await openFileAndAddToCanvasMacro(
      'KET/monomers-connected-with-bonds.ket',
      page,
    );
    await verifyFileExport(
      page,
      'KET/monomers-connected-with-bonds-expected.ket',
      FileType.KET,
    );
  });

  test('Open Sugar-Base-Phosphate from .ket file and switch to Micromolecule mode', async () => {
    /* 
    Test case: https://github.com/epam/ketcher/issues/3498
    Description: Ketcher switch to Micromolecule mode
    Sugar does not have R3 attachment point so bond between sugar and base is not created
    */
    await openFileAndAddToCanvasMacro(
      'KET/monomers-connected-with-bonds.ket',
      page,
    );
    await turnOnMicromoleculesEditor(page);
    await takePageScreenshot(page);
  });

  test('Validate it is not possible to create preset if Sugar is without R3 connection point (Sugar is selected and we select Base)', async () => {
    /* 
    Test case: https://github.com/epam/ketcher/issues/3816
    Description: It is not possible to create preset if Sugar is without R3 connection point.
    */
    // Reload the page to reset the state, as previous tests affects the behavior when adding the sugar monomer
    await clearLocalStorage(page);
    await reloadPageAndConfigureInitialState(page);

    await expandCollapseRnaBuilder(page);
    await selectMonomer(page, Sugars._12ddR);
    await selectBaseSlot(page);
    await takePresetsScreenshot(page);
  });

  const rnaNucleotides = [
    Nucleotides._2_damdA,
    Nucleotides._5hMedC,
    Nucleotides.Super_G,
    Nucleotides.AmMC6T,
    Nucleotides.Super_T,
    Nucleotides._5Br_dU,
    Nucleotides._5NitInd,
  ];

  for (const monomer of rnaNucleotides) {
    test(`Validate that you can put unsplit nucleotide ${monomer.testId} on the canvas from library, select it and move it, delete it`, async () => {
      /*
    Test case: Import/Saving files/#4382
    Description: Unsplit nucleotide on the canvas from library can be selected, moved and deleted.
    */
      // Reload the page to reset the state, as previous tests affects the behavior when adding the sugar monomer
      await clearLocalStorage(page);
      await reloadPageAndConfigureInitialState(page);

      const x = 200;
      const y = 200;
      await selectMonomer(page, monomer);

      await clickInTheMiddleOfTheScreen(page);
      await page.keyboard.press('Escape');
      await toggleNucleotidesAccordion(page);
      await clickInTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page);
      await dragMouseTo(x, y, page);
      await takeEditorScreenshot(page);
      await selectEraseTool(page);
      await clickOnCanvas(page, x, y);
      await takeEditorScreenshot(page);
    });
  }

  test('Validate that chain with unsplit nucleotides looks correct on micro-mode canvas, on macro-flex, on macro-snake and squence canvas', async () => {
    /* 
    Test case: #4382
    Description: Chain with unsplit nucleotides looks correct on micro-mode canvas, on macro-flex, on macro-snake and squence canvas
    */
    await openFileAndAddToCanvasMacro(
      'KET/chain-with-unsplit-nucleotides.ket',
      page,
    );
    await takeEditorScreenshot(page);
    await selectSnakeLayoutModeTool(page);
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
    await selectSequenceLayoutModeTool(page);
    await takeEditorScreenshot(page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page);

    // reset to default state
    await turnOnMacromoleculesEditor(page);
    await configureInitialState(page);
  });

  test('Validate that unsplit nucleotides in chain does not interrupt enumeration of RNA chain in flex mode', async () => {
    /* 
    Test case: #4382
    Description: Unsplit nucleotides in chain does not interrupt enumeration of RNA chain in flex mode
    */
    await openFileAndAddToCanvasMacro(
      'KET/chain-with-unsplit-nucleotides.ket',
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Validate that unsplit nucleotides could be deleted from sequence', async () => {
    /* 
    Test case: #4382
    Description: unsplit nucleotides can be deleted from sequence
    */
    await openFileAndAddToCanvasMacro(
      'KET/chain-with-unsplit-nucleotides.ket',
      page,
    );
    await selectEraseTool(page);
    await getMonomerLocator(page, Nucleotides.AmMC6T).click();
    await getMonomerLocator(page, { monomerAlias: 'Super G' }).click();
    await getMonomerLocator(page, { monomerAlias: '5-Bromo dU' }).click();
    await takeEditorScreenshot(page);
  });

  const rnaNucleotides1 = [
    Nucleotides._2_damdA,
    Nucleotides._5hMedC,
    Nucleotides.Super_G,
    Nucleotides.AmMC6T,
    Nucleotides.Super_T,
    Nucleotides._5Br_dU,
    Nucleotides._5NitInd,
  ];

  for (const monomer of rnaNucleotides1) {
    test(`Validate that preview tooltip is shown if mouse hover on unsplit nucleotide ${monomer.testId}`, async () => {
      /*
    Test case: Import/Saving files/#4382
    Description: Unsplit nucleotide on the canvas from library can be selected, moved and deleted.
    */
      await selectMonomer(page, monomer);
      await clickInTheMiddleOfTheScreen(page);
      await page.keyboard.press('Escape');
      await clickInTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page);

      // Reset to default state
      await toggleRnaAccordionItem(page, 'Presets', 'expand');
    });
  }

  const rnaNucleotides2 = [
    Nucleotides._2_damdA,
    Nucleotides._5hMedC,
    Nucleotides.Super_G,
    Nucleotides.AmMC6T,
    Nucleotides.Super_T,
    Nucleotides._5Br_dU,
    Nucleotides._5NitInd,
  ];

  for (const monomer of rnaNucleotides2) {
    test(`Validate that Undo/redo tool works correct with unsplit nucleotide ${monomer.testId}`, async () => {
      /*
    Test case: Import/Saving files/#4382
    Description: Undo/redo tool works correct with unsplit nucleotide.
    */
      const x = 200;
      const y = 200;
      await selectMonomer(page, monomer);

      await clickInTheMiddleOfTheScreen(page);
      await page.keyboard.press('Escape');
      await clickInTheMiddleOfTheScreen(page);
      await dragMouseTo(x, y, page);
      await takeEditorScreenshot(page);
      await pressUndoButton(page);
      await takeEditorScreenshot(page);
      await pressRedoButton(page);
      await selectEraseTool(page);
      await clickOnCanvas(page, x, y);
      await takeEditorScreenshot(page);
      await pressUndoButton(page);
      await takeEditorScreenshot(page);

      // Reset to default state
      await toggleRnaAccordionItem(page, 'Presets', 'expand');
    });
  }

  test('Validate it is not possible to create preset if Sugar is without R3 connection point (Base is selected and we select Sugar)', async () => {
    /* 
    Test case: https://github.com/epam/ketcher/issues/3816
    Description: It is not possible to create preset if Sugar is without R3 connection point.
    */
    await expandCollapseRnaBuilder(page);
    await selectBaseSlot(page);
    await selectMonomer(page, Bases.baA);
    await selectSugarSlot(page);
    await takePresetsScreenshot(page);

    // Reset to default state
    await toggleRnaBuilder(page, 'collapse');
  });

  test('It is possible to add/remove RNA presets into the Favourite library', async () => {
    /*
     *Test case: https://github.com/epam/ketcher/issues/4422 - Case 6-7
     *Description:
     *  Case 6:
     *    It is possible to add RNA presets into the Favourite library
     *  Case 7:
     *    It is possible to delete RNA presets from the Favourite library
     */
    // Reload the page to reset the Favorites elements
    await clearLocalStorage(page);
    await reloadPageAndConfigureInitialState(page);

    await addMonomerToFavorites(page, Presets.A);
    await chooseTab(page, Tabs.Favorites);
    await takeMonomerLibraryScreenshot(page);

    await removeMonomerFromFavorites(page, Presets.A);
    await waitForMonomerPreview(page);
    await takeMonomerLibraryScreenshot(page);
  });

  test('Check that presets and monomers appear back after cleaning search field', async () => {
    /* 
    Test case: https://github.com/epam/ketcher/issues/4422 - Case 11-12, 27
    Description: 
      Case 11:
        Check that default presets appear back after cleaning search field
      Case 12:
        Check that default monomers appear back after cleaning search field
      Case 27:
        Check that search menu clear button erase all entered text
    */
    // Reload the page to reset the state, as previous tests affects the RNA-bulder state
    await clearLocalStorage(page);
    await reloadPageAndConfigureInitialState(page);

    const rnaLibrarySearch = page.getByTestId('monomer-library-input');
    await rnaLibrarySearch.fill('No monomers and presets');
    await takeMonomerLibraryScreenshot(page);

    await chooseTab(page, Tabs.Rna);
    await takeMonomerLibraryScreenshot(page);

    await chooseTab(page, Tabs.Chem);
    await takeMonomerLibraryScreenshot(page);

    // await rnaLibrarySearch.press('Escape');
    // Case 27 here. Dirty hack, can't believe I did it.
    const xCoordinate = 1241;
    const yCoordinate = 62;
    await clickOnCanvas(page, xCoordinate, yCoordinate);

    await chooseTab(page, Tabs.Rna);
    await takeMonomerLibraryScreenshot(page);

    await chooseTab(page, Tabs.Peptides);
    await takeMonomerLibraryScreenshot(page);
  });

  test('Check that can delete preset from Presets section', async () => {
    /*
     *Test case: https://github.com/epam/ketcher/issues/4422 - Case 14
     *Description:
     *  Case 14:
     *    Check that can delete preset from Presets section
     */
    // Reload the page to reset the state, as previous tests affects the RNA-bulder state
    await clearLocalStorage(page);
    await reloadPageAndConfigureInitialState(page);

    await expandCollapseRnaBuilder(page);
    await selectMonomers(page, [Sugars._25R, Bases.A, Phosphates.Test_6_Ph]);
    await pressAddToPresetsButton(page);
    await expandCollapseRnaBuilder(page);

    const customPreset = page.getByTestId('25R(A)Test-6-Ph_A_25R_Test-6-Ph');
    await customPreset.hover();
    await customPreset.click({ button: 'right' });
    await page.getByText('Delete Preset').click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await takeMonomerLibraryScreenshot(page);
  });

  test('Check that after hiding library panel that there is no residual strip remains (which concealing content on the canvas)', async () => {
    /*
     *Test case: https://github.com/epam/ketcher/issues/4422 - Case 16
     *Description:
     *  Case 16:
     *    Check that after hiding library panel that there is no residual strip remains (which concealing content on the canvas)
     */
    await page.getByText('Hide').click();
    await takePageScreenshot(page);

    await page.getByText('Show Library').click();
    await takePageScreenshot(page);
  });

  test('Check that After reloading the page, monomers added to the Favorites section not disappear', async () => {
    /*
     *Test case: https://github.com/epam/ketcher/issues/4422 - Case 18
     *Description:
     *  Case 18:
     *    Check that After reloading the page, monomers added to the Favorites section not disappear
     */
    await addMonomerToFavorites(page, Presets.A);
    await pageReload(page);
    await chooseTab(page, Tabs.Favorites);
    await takeMonomerLibraryScreenshot(page);

    await configureInitialState(page);
  });

  test('Select all entered text in RNA Builder and delete', async () => {
    /*
     *Test case: https://github.com/epam/ketcher/issues/4422 - Case 20
     *Description:
     *  Case 20:
     *    Select all entered text in RNA Builder and delete
     */
    const rnaNameEditBox = page.getByPlaceholder('Name your structure');
    const rnaName = 'Random Text';

    await toggleRnaBuilder(page, 'expand');
    await rnaNameEditBox.fill(rnaName);
    await takeRNABuilderScreenshot(page);

    for (let i = 0; i < rnaName.length; i++) {
      await rnaNameEditBox.press('Backspace');
    }
    await takeRNABuilderScreenshot(page);

    // Reset to default state
    await toggleRnaBuilder(page, 'collapse');
  });

  async function scrollAccordionContentToTheTop(
    page: Page,
    contentLocator: string,
  ) {
    // Dirty hack
    await page.getByTestId(contentLocator).click();
    await page.keyboard.press('Home');
  }

  test('Check that preview window disappears when a cursor moves off from RNA in library', async () => {
    /*
     *Test case: https://github.com/epam/ketcher/issues/4422 - Case 21
     *Description:
     *  Case 20:
     *    Check that preview window disappears when a cursor moves off from RNA in library
     *    (phosphates, sugars, bases)
     */
    await toggleSugarsAccordion(page);
    await scrollAccordionContentToTheTop(page, 'rna-accordion-details-Sugars');
    await page.getByTestId(Sugars._12ddR.testId).hover();
    await waitForMonomerPreview(page);
    await takeMonomerLibraryScreenshot(page, { hideMonomerPreview: true });

    await toggleBasesAccordion(page);
    await scrollAccordionContentToTheTop(page, 'rna-accordion-details-Bases');
    await page.getByTestId(Bases._2imen2.testId).hover();
    await waitForMonomerPreview(page);
    await takeMonomerLibraryScreenshot(page, { hideMonomerPreview: true });

    // await togglePhosphatesAccordion(page);
    // await scrollAccordionContentToTheTop(
    //   page,
    //   'rna-accordion-details-Phosphates',
    // );
    // await page.getByTestId('P___Phosphate').hover();
    // await waitForMonomerPreview(page);
    // await takeMonomerLibraryScreenshot(page, { hideMonomerPreview: true });
  });

  test('CHEM tab check at Library', async () => {
    /*
     *Test case: https://github.com/epam/ketcher/issues/4422 - Case 22 - 25
     *Description:
     *  Case 22 - Check CHEM frame when it's being hovered over in library
     *  Case 23 - CHEM gets highlighted when it's being selected in library
     *  Case 24 - Preview window appearing when hover over CHEM in library
     *  Case 25 - Search CHEM by entering its name in search field
     */
    // Reload needed to reset the RNA builder state, as values from previous tests are preserved
    await clearLocalStorage(page);
    await reloadPageAndConfigureInitialState(page);

    await toggleRnaBuilder(page, 'expand');

    // Case 22
    await page.getByTestId('CHEM-TAB').hover();
    await takeMonomerLibraryScreenshot(page);

    // Case 23
    await selectMonomer(page, Chem.Test_6_Ch);
    await takeElementScreenshot(page, Chem.Test_6_Ch.testId, {
      maxDiffPixelRatio: 0.03,
      hideMonomerPreview: true,
    });
    await moveMouseAway(page);

    // Case 24
    await page.getByTestId(Chem.SMPEG2.testId).hover();
    await waitForMonomerPreview(page);
    await takeMonomerLibraryScreenshot(page);
    await moveMouseAway(page);

    // Case 25
    const rnaLibrarySearch = page.getByTestId('monomer-library-input');
    await rnaLibrarySearch.fill('SMCC');
    await takeMonomerLibraryScreenshot(page);

    // Reset to default
    await configureInitialState(page);
  });

  test('RNA builder expands when clicking on New Preset button', async () => {
    /*
     *Test case: https://github.com/epam/ketcher/issues/4422 - Case 26
     *Description:
     *  Case 26 - RNA builder expands when clicking on 'New Preset' button
     */
    await pressNewPresetButton(page);
    await expect(page.getByTestId('cancel-btn')).toBeVisible();

    await page.getByTestId('cancel-btn').click();
  });

  interface ISearchString {
    testDescription: string;
    SearchString: string;
    // Location where searched monomer located (we have to go to that location to make sure it is where)
    ResultMonomerLocationTab: MonomerLocationTabs;
    // Set shouldFail to true if you expect test to fail because of existed bug and put issues link to issueNumber
    shouldFail?: boolean;
    // issueNumber is mandatory if shouldFail === true
    issueNumber?: string;
    // set pageReloadNeeded to true if you need to restart ketcher before test (f.ex. to restart font renderer)
    pageReloadNeeded?: boolean;
  }

  async function searchMonomerByName(page: Page, monomerName: string) {
    const rnaLibrarySearch = page.getByTestId('monomer-library-input');
    await rnaLibrarySearch.fill(monomerName);
  }

  async function blurMonomerSearchInput(page: Page) {
    const rnaLibrarySearch = page.getByTestId('monomer-library-input');
    rnaLibrarySearch.blur();
  }

  const IDTSearchStrings: ISearchString[] = [
    {
      testDescription: '1. Verify search by full IDT alias (5Br-dU)',
      SearchString: '5Br-dU',
      ResultMonomerLocationTab: MonomerLocationTabs.NUCLEOTIDES,
    },
    {
      testDescription: '2. Verify search by part of IDT alias (itInd))',
      SearchString: 'itInd',
      ResultMonomerLocationTab: MonomerLocationTabs.NUCLEOTIDES,
    },
    {
      testDescription: '3. Verify search with a single symbol /',
      SearchString: '/',
      ResultMonomerLocationTab: MonomerLocationTabs.NUCLEOTIDES,
    },
    {
      testDescription:
        '4. Verify search with a specific ending symbol before the second / (hos/)',
      SearchString: 'hos/',
      ResultMonomerLocationTab: MonomerLocationTabs.PHOSPHATES,
    },
    {
      testDescription:
        '5. Verify no results when additional symbols are added after the second / (Ind/Am)',
      SearchString: 'Ind/Am',
      ResultMonomerLocationTab: MonomerLocationTabs.NUCLEOTIDES,
    },
    {
      testDescription:
        '6. Verify case insensitivity of the search (/5SUPER-DT)',
      SearchString: '/5SUPER-DT',
      ResultMonomerLocationTab: MonomerLocationTabs.NUCLEOTIDES,
      shouldFail: true,
      issueNumber: 'https://github.com/epam/ketcher/issues/5452',
    },
    {
      testDescription:
        '7. Verify search returns multiple monomers with the same starting symbol (Super))',
      SearchString: 'Super',
      ResultMonomerLocationTab: MonomerLocationTabs.NUCLEOTIDES,
      shouldFail: true,
      issueNumber: 'https://github.com/epam/ketcher/issues/5452',
    },
    {
      testDescription:
        '8. Verify search returns multiple monomers that have endpoint3 modification (/3))',
      SearchString: '/3',
      ResultMonomerLocationTab: MonomerLocationTabs.NUCLEOTIDES,
      shouldFail: true,
      issueNumber: 'https://github.com/epam/ketcher/issues/5452',
    },
    {
      testDescription:
        '9. Verify search returns multiple monomers that have endpoint5 modification (/5))',
      SearchString: '/5',
      ResultMonomerLocationTab: MonomerLocationTabs.NUCLEOTIDES,
      shouldFail: true,
      issueNumber: 'https://github.com/epam/ketcher/issues/5452',
    },
    {
      testDescription:
        '10. Verify search returns multiple monomers that have internal modification (/i))',
      SearchString: '/i',
      ResultMonomerLocationTab: MonomerLocationTabs.NUCLEOTIDES,
      shouldFail: true,
      issueNumber: 'https://github.com/epam/ketcher/issues/5452',
    },
  ];

  test.describe('Search by IDT alias: ', () => {
    for (const IDTSearchString of IDTSearchStrings) {
      test(`${IDTSearchString.testDescription}`, async () => {
        /*
         * Test task: https://github.com/epam/ketcher/issues/5539
         * Verify search by full IDT alias
         * Case:
         * 1. Fill Search field with value
         * 2. Switch to monomer's tab to see it
         * 3. Take screenshot of the library to make sure search works
         */
        await searchMonomerByName(page, IDTSearchString.SearchString);
        await goToMonomerLocationTab(
          page,
          IDTSearchString.ResultMonomerLocationTab,
        );

        await blurMonomerSearchInput(page);
        await takeMonomerLibraryScreenshot(page);

        // Test should be skipped if related bug exists
        test.fixme(
          IDTSearchString.shouldFail === true,
          `That test fails because of ${IDTSearchString.issueNumber} issue.`,
        );
      });
    }
  });

  test(
    'Ambiguous Amino Acids section checks',
    {
      tag: ['@IncorrectResultBecauseOfBug'],
    },
    async () => {
      /*
   *Test task: https://github.com/epam/ketcher/issues/5558
   *Cases:
   *  1. Verify the addition of the "Ambiguous Amino Acids" subsection at the bottom in the peptides section
      2. Verify the correct addition of ambiguous monomers in the "Ambiguous Amino Acids" subsection (The first monomer is X, and the others are arranged alphabetically)
      3. Verify the class designation of ambiguous monomers as "AminoAcid" and classified as "Alternatives"

      IMPORTANT: Result of execution is incorrect because of https://github.com/epam/ketcher/issues/5578 issue.
      Locator and assert needs to be updated after fix
   */
      await pageReload(page);

      // const sectionTitle = page.getByText('Ambiguous Amino acids');
      // 1. Verify the addition of the "Ambiguous Amino Acids" subsection at the bottom in the peptides section
      // await expect(sectionTitle).toHaveText('Ambiguous Amino acids');

      // 2. Verify the correct addition of ambiguous monomers in the "Ambiguous Amino Acids" subsection (The first monomer is X, and the others are arranged alphabetically)
      // 3. Verify the class designation of ambiguous monomers as "AminoAcid" and classified as "Alternatives"
      await selectMonomer(page, Peptides.X);
      await waitForMonomerPreview(page);
      await takeMonomerLibraryScreenshot(page);

      // Test should be skipped if related bug exists
      test.fixme(
        true,
        `That test fails because of https://github.com/epam/ketcher/issues/5578 issue.`,
      );
    },
  );

  test(
    'Ambiguous Bases section checks',
    {
      tag: ['@IncorrectResultBecauseOfBug'],
    },
    async () => {
      /*
   *Test task: https://github.com/epam/ketcher/issues/5558
   *Cases:
   *  4. Verify the addition of "Ambiguous Bases", "Ambiguous DNA Bases" and 
         "Ambiguous RNA Bases" subsection in the RNA tab of the library
      5. Verify the correct addition of ambiguous monomers in the "Ambiguous Bases" subsection(The first monomer is N (DNA version), 
         followed by N (RNA version) and the others are arranged alphabetically (with the DNA version going before RNA version))
      6. Verify the class designation of ambiguous monomers as "Base" and ambiguous monomers in the "Ambiguous Bases", "Ambiguous DNA Bases" and 
         "Ambiguous RNA Bases" subsection are classified as "Alternatives"

      IMPORTANT: Result of execution is incorrect because of https://github.com/epam/ketcher/issues/5580 issue.
      Screenshots needs to be updated after fix
   */
      await pageReload(page);

      // const sectionAmbiguousBases = page.getByText('Ambiguous Bases');
      // const sectionAmbiguousDNABases = page.getByText('Ambiguous DNA Bases');
      // const sectionAmbiguousRNABases = page.getByText('Ambiguous RNA Bases');

      // 4. Verify the addition of "Ambiguous Bases", "Ambiguous DNA Bases" and "Ambiguous RNA Bases" subsection in the RNA tab of the library
      // await expect(sectionAmbiguousBases).toHaveText('Ambiguous Bases');
      // await expect(sectionAmbiguousDNABases).toHaveText('Ambiguous DNA Bases');
      // await expect(sectionAmbiguousRNABases).toHaveText('Ambiguous RNA Bases');

      // 5. Verify the correct addition of ambiguous monomers in the "Ambiguous Bases" subsection(The first monomer is N (DNA version),
      //    followed by N (RNA version) and the others are arranged alphabetically (with the DNA version going before RNA version))
      // 6. Verify the class designation of ambiguous monomers as "Base" and ambiguous monomers in the "Ambiguous Bases", "Ambiguous DNA Bases" and
      //    "Ambiguous RNA Bases" subsection are classified as "Alternatives"
      await selectMonomer(page, Bases.DNA_N);
      await waitForMonomerPreview(page);
      await takeMonomerLibraryScreenshot(page);
      await toggleBasesAccordion(page);

      await selectMonomer(page, Bases.RNA_N);
      await waitForMonomerPreview(page);
      await takeMonomerLibraryScreenshot(page);
      await toggleBasesAccordion(page);

      await selectMonomer(page, Bases.M);
      await waitForMonomerPreview(page);
      await takeMonomerLibraryScreenshot(page);

      // Test should be skipped if related bug exists
      test.fixme(
        true,
        `That test fails because of https://github.com/epam/ketcher/issues/5580 issue.`,
      );
    },
  );

  const AmbiguousMonomersSearchStrings: ISearchString[] = [
    {
      testDescription: "1. Search 'J' ambiguous peptide",
      SearchString: 'J',
      ResultMonomerLocationTab: MonomerLocationTabs.PEPTIDES,
    },
    {
      testDescription:
        "2. Search 'Leucine' as component of ambiguous peptide (should be J ambiguous monomer)",
      SearchString: 'Leucine',
      ResultMonomerLocationTab: MonomerLocationTabs.PEPTIDES,
    },
    {
      testDescription: "3. Search 'W' ambiguous DNA and RNA bases",
      SearchString: 'W',
      ResultMonomerLocationTab: MonomerLocationTabs.BASES,
    },
    {
      testDescription:
        "4. Search 'Thymine'  as component of ambiguous DNA base",
      SearchString: 'Thymine',
      ResultMonomerLocationTab: MonomerLocationTabs.BASES,
    },
  ];

  test.describe('Search ambiguous monomers: ', () => {
    for (const AmbiguousMonomersSearchString of AmbiguousMonomersSearchStrings) {
      test(`${AmbiguousMonomersSearchString.testDescription}`, async () => {
        /* 
      Test task: https://github.com/epam/ketcher/issues/5558
      7. Verify ambiguous monomer search functionality in the library
      Case:
        1. Fill Search field with value
        2. Switch to monomer's tab to see it
        3. Take screenshot of the library to make sure search works
      */
        await searchMonomerByName(
          page,
          AmbiguousMonomersSearchString.SearchString,
        );
        await goToMonomerLocationTab(
          page,
          AmbiguousMonomersSearchString.ResultMonomerLocationTab,
        );
        await blurMonomerSearchInput(page);
        await takeMonomerLibraryScreenshot(page);

        // Test should be skipped if related bug exists
        test.fixme(
          AmbiguousMonomersSearchString.shouldFail === true,
          `That test fails because of ${AmbiguousMonomersSearchString.issueNumber} issue.`,
        );
      });
    }
  });
});
