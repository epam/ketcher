import {
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
} from '@utils/macromolecules';
import { Page, test, expect } from '@playwright/test';
import {
  Bases,
  Phosphates,
  Sugars,
  addMonomerToCenterOfCanvas,
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  moveMouseToTheMiddleOfTheScreen,
  openFileAndAddToCanvasMacro,
  pressButton,
  receiveFileComparisonData,
  saveToFile,
  selectEraseTool,
  selectMonomer,
  selectRectangleSelectionTool,
  selectSingleBondTool,
  takeEditorScreenshot,
  takeLeftToolbarMacromoleculeScreenshot,
  takeMonomerLibraryScreenshot,
  takePageScreenshot,
  takePresetsScreenshot,
  takeRNABuilderScreenshot,
  waitForPageInit,
  waitForRender,
  moveMouseAway,
  delay,
  takeElementScreenshot,
} from '@utils';
import { getKet } from '@utils/formats';
import {
  goToCHEMTab,
  gotoRNA,
  pressNewPresetButton,
  toggleBasesAccordion,
  togglePhosphatesAccordion,
  toggleSugarsAccordion,
} from '@utils/macromolecules/rnaBuilder';

async function expandCollapseRnaBuilder(page: Page) {
  await page
    .locator('div')
    .filter({ hasText: /^RNA Builder$/ })
    .getByRole('button')
    .click();
}

async function drawThreeMonomers(page: Page) {
  const x = 800;
  const y = 350;
  const x1 = 650;
  const y1 = 150;
  await selectMonomer(page, Sugars.ThreeA6);
  await clickInTheMiddleOfTheScreen(page);
  await selectMonomer(page, Bases.NBebnzylAdenine);
  await page.mouse.click(x, y);
  await selectMonomer(page, Phosphates.Phosphate);
  await page.mouse.click(x1, y1);
}

async function drawThreeMonomersConnectedWithBonds(page: Page) {
  const sugars = await page.getByText('3A6').locator('..');
  const sugar1 = sugars.nth(0);
  const bases = await page.getByText('baA').locator('..');
  const base1 = bases.nth(0);
  const phosphates = await page.getByText('P').locator('..');
  const phosphate1 = phosphates.nth(0);
  await drawThreeMonomers(page);
  await selectSingleBondTool(page);
  await sugar1.hover();
  await page.mouse.down();
  await base1.hover();
  await page.mouse.up();
  await sugar1.hover();
  await page.mouse.down();
  await phosphate1.hover();
  await page.mouse.up();
}

async function drawBasePhosphate(page: Page) {
  const x = 800;
  const y = 350;
  const bases = await page.getByText('baA').locator('..');
  const base1 = bases.nth(0);
  const phosphates = await page.getByText('P').locator('..');
  const phosphate1 = phosphates.nth(0);
  await selectMonomer(page, Bases.NBebnzylAdenine);
  await clickInTheMiddleOfTheScreen(page);
  await selectMonomer(page, Phosphates.Phosphate);
  await page.mouse.click(x, y);
  await selectSingleBondTool(page);
  await base1.hover();
  await page.mouse.down();
  await phosphate1.hover();
  await page.mouse.up();
  await pressButton(page, 'R2');
  await pressButton(page, 'Connect');
}

async function drawSugarPhosphate(page: Page) {
  const x = 800;
  const y = 350;
  const sugars = await page.getByText('3A6').locator('..');
  const sugar1 = sugars.nth(0);
  const phosphates = await page.getByText('P').locator('..');
  const phosphate1 = phosphates.nth(0);
  await selectMonomer(page, Sugars.ThreeA6);
  await clickInTheMiddleOfTheScreen(page);
  await selectMonomer(page, Phosphates.Phosphate);
  await page.mouse.click(x, y);
  await selectSingleBondTool(page);
  await sugar1.hover();
  await page.mouse.down();
  await phosphate1.hover();
  await page.mouse.up();
}

async function drawSugarBase(page: Page) {
  const x = 800;
  const y = 350;
  const sugars = await page.getByText('3A6').locator('..');
  const sugar1 = sugars.nth(0);
  const bases = await page.getByText('baA').locator('..');
  const base1 = bases.nth(0);
  await selectMonomer(page, Sugars.ThreeA6);
  await clickInTheMiddleOfTheScreen(page);
  await selectMonomer(page, Bases.NBebnzylAdenine);
  await page.mouse.click(x, y);
  await selectSingleBondTool(page);
  await sugar1.hover();
  await page.mouse.down();
  await base1.hover();
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

test.describe('RNA Library', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
    await page.getByTestId('RNA-TAB').click();
  });

  test('Check that switch between Macro and Micro mode does not crash application', async ({
    page,
  }) => {
    /* 
    Test case: #3498
    Description: Application does not crash. 
    Test working incorrect because we have bug: https://github.com/epam/ketcher/issues/3498
    */
    await turnOnMicromoleculesEditor(page);
    await turnOnMacromoleculesEditor(page);
    await takePageScreenshot(page);
  });

  test('Check the RNA components panel', async ({ page }) => {
    /* 
    Test case: #2748, #2751 - RNA Builder. Accordion component
    Description: Check the RNA components panel. 
    RNA panel consist of:
    RNA Builder(collapsed), Presets(5)(expanded), Sugars(199)(collapsed), 
    Bases(160)(collapsed), Phosphates(32)(collapsed)
    */
    await takeMonomerLibraryScreenshot(page);
  });

  test('Expand RNA Builder', async ({ page }) => {
    /* 
    Test case: #2748, #2751 - RNA Builder. Accordion component
    Description: After click on arrow RNA Builder expanded.
    */
    await expandCollapseRnaBuilder(page);
    await takeMonomerLibraryScreenshot(page);
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

  for (const data of testData) {
    test(`Check ${data.component} component`, async ({ page }) => {
      /* 
      Test case: #2748, #2751 - RNA Builder. Accordion component
      */
      await page.getByTestId(`summary-${data.component}`).click();
      await takeMonomerLibraryScreenshot(page);
    });
  }

  test('Add Sugar monomer to canvas', async ({ page }) => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: The selected sugar monomer should be added to the canvas 
    in the form of a square with rounded edges and in the corresponding color.
    */
    await addMonomerToCenterOfCanvas(page, Sugars.TwelveddR);
    await takeEditorScreenshot(page);
  });

  test('Add Base monomer to canvas', async ({ page }) => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: The selected base monomer should be added to the canvas 
    in the form of a rhombus and in the corresponding color.
    */
    await addMonomerToCenterOfCanvas(page, Bases.Adenine);
    await takeEditorScreenshot(page);
  });

  test('Add Phosphate monomer to canvas', async ({ page }) => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: The selected phosphate monomer should be added to the canvas 
    in the form of a circle and in the corresponding color.
    */
    await addMonomerToCenterOfCanvas(page, Phosphates.Test6Ph);
    await takeEditorScreenshot(page);
  });

  test('Sugar preview window when hovered on canvas', async ({ page }) => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: The selected sugar monomer should be added to the canvas 
    in the form of a square with rounded edges and in the corresponding color.
    When hover over monomer window with preview appears.
    */
    await addMonomerToCenterOfCanvas(page, Sugars.TwelveddR);
    await page.getByText('12ddR').locator('..').first().hover();
    await takeEditorScreenshot(page);
  });

  test('Base preview window when hovered on canvas', async ({ page }) => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: The selected base monomer should be added to the canvas 
    in the form of a rhombus and in the corresponding color.
    When hover over monomer window with preview appears.
    */
    await addMonomerToCenterOfCanvas(page, Bases.TClampOMe);
    await page.getByText('clA').locator('..').first().hover();
    await takeEditorScreenshot(page);
  });

  test('Phosphate preview window when hovered on canvas', async ({ page }) => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: The selected phosphate monomer should be added to the canvas 
    in the form of a circle and in the corresponding color.
    When hover over monomer window with preview appears.
    */
    await addMonomerToCenterOfCanvas(page, Phosphates.Test6Ph);
    await page.getByText('Test-6-Ph').locator('..').first().hover();
    await takeEditorScreenshot(page);
  });

  test('Add Custom preset to Presets section', async ({ page }) => {
    /* 
    Test case: #2759 - Edit RNA mode
    Description: Custom presets added to Presets section.
    */
    await expandCollapseRnaBuilder(page);
    await selectMonomer(page, Sugars.TwelveddR);
    await selectMonomer(page, Bases.Adenine);
    await selectMonomer(page, Phosphates.Test6Ph);
    await page.getByTestId('add-to-presets-btn').click();
    await page.getByTestId('12ddR(A)Test-6-Ph_A_12ddR_Test-6-Ph').click();
    await expandCollapseRnaBuilder(page);
    await takePresetsScreenshot(page);
  });

  test('Add Custom preset to Presets section and display after page reload', async ({
    page,
  }) => {
    await expandCollapseRnaBuilder(page);
    await selectMonomer(page, Sugars.TwelveddR);
    await selectMonomer(page, Bases.Adenine);
    await selectMonomer(page, Phosphates.Test6Ph);
    await page.getByTestId('add-to-presets-btn').click();
    await page.getByTestId('12ddR(A)Test-6-Ph_A_12ddR_Test-6-Ph').click();
    await expandCollapseRnaBuilder(page);
    await takePresetsScreenshot(page);
    await page.reload();
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
    await page.getByTestId('RNA-TAB').click();
    await page.getByTestId('12ddR(A)Test-6-Ph_A_12ddR_Test-6-Ph').click();
    await expandCollapseRnaBuilder(page);
    await takePresetsScreenshot(page);
  });

  test('Add Custom preset to Canvas', async ({ page }) => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: Custom presets added to Canvas.
    */
    await expandCollapseRnaBuilder(page);
    await selectMonomer(page, Sugars.ThreeA6);
    await selectMonomer(page, Bases.NBebnzylAdenine);
    await selectMonomer(page, Phosphates.Boranophosphate);
    await page.getByTestId('add-to-presets-btn').click();
    await page.getByTestId('3A6(baA)bP_baA_3A6_bP').click();
    await clickInTheMiddleOfTheScreen(page);
    await selectRectangleSelectionTool(page);
    await takeEditorScreenshot(page);
  });

  test('Add RNA to canvas when Sugar does not contain R3 attachment point(for example 3SS6(nC65C)oxy/ am6(daA)Rsp )', async ({
    page,
  }) => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas https://github.com/epam/ketcher/issues/3615
    Description: RNA added to canvas when Sugar does not contain R3 attachment point.
    The test is currently not functioning correctly as the bug has not been fixed
    */
    await expandCollapseRnaBuilder(page);
    await selectMonomer(page, Sugars.ThreeSS6);
    await selectMonomer(page, Bases.NBebnzylAdenine);
    await selectMonomer(page, Phosphates.Boranophosphate);
    await page.getByTestId('add-to-presets-btn').click();
    await page.getByTestId('3SS6(baA)bP_baA_3SS6_bP').click();
    await clickInTheMiddleOfTheScreen(page);
    await selectRectangleSelectionTool(page);
    await takeEditorScreenshot(page);
  });

  test('Add to presets (different combinations: Sugar+Base', async ({
    page,
  }) => {
    /*
    Test case: #2759 - Edit RNA mode
    Description: Custom presets added to Presets section.
    */
    await expandCollapseRnaBuilder(page);
    await selectMonomer(page, Sugars.TwelveddR);
    await selectMonomer(page, Bases.Adenine);
    await page.getByTestId('add-to-presets-btn').click();
    await page.getByTestId('12ddR(A)_A_12ddR_.').click();
    await expandCollapseRnaBuilder(page);
    await takePresetsScreenshot(page);
  });

  test('Add to presets (different combinations: Sugar+Phosphate', async ({
    page,
  }) => {
    /*
    Test case: #2759 - Edit RNA mode
    Description: Custom presets added to Presets section.
    */
    await expandCollapseRnaBuilder(page);
    await selectMonomer(page, Sugars.TwelveddR);
    await selectMonomer(page, Phosphates.Boranophosphate);
    await page.getByTestId('add-to-presets-btn').click();
    await page.getByTestId('12ddR()bP_._12ddR_bP').click();
    await expandCollapseRnaBuilder(page);
    await takePresetsScreenshot(page);
  });

  test('Add to presets (different combinations: Base+Phosphate', async ({
    page,
  }) => {
    /*
    Test case: #2759 - Edit RNA mode
    Description: Custom presets added to Presets section.
    */
    await expandCollapseRnaBuilder(page);
    await selectMonomer(page, Bases.Adenine);
    await selectMonomer(page, Phosphates.Boranophosphate);
    await page.getByTestId('add-to-presets-btn').click();
    await page.getByTestId('(A)bP_A_._bP').click();
    await takePresetsScreenshot(page);
  });

  test('Add Custom preset to Presets section and Edit', async ({ page }) => {
    /* 
    Test case: #2759 - Edit RNA mode
    Description: Custom presets added to Presets section and can be edited.
    */
    await expandCollapseRnaBuilder(page);
    await selectMonomer(page, Sugars.TwelveddR);
    await selectMonomer(page, Bases.Adenine);
    await selectMonomer(page, Phosphates.Test6Ph);
    await page.getByTestId('add-to-presets-btn').click();
    await page.getByTestId('12ddR(A)Test-6-Ph_A_12ddR_Test-6-Ph').click({
      button: 'right',
    });
    await page.getByTestId('edit').locator('div').click();
    await page.getByTestId('rna-builder-slot--base').click();
    await page.getByTestId('baA___N-benzyl-adenine').click();
    await page.getByTestId('save-btn').click();
    await page.getByTestId('12ddR(baA)Test-6-Ph_baA_12ddR_Test-6-Ph').click();
    // To avoid unstable test execution
    // Allows see a right preset in a viewport
    await expandCollapseRnaBuilder(page);
    await takePresetsScreenshot(page);
  });

  test('Add Custom preset to Presets section then Duplicate and Edit', async ({
    page,
  }) => {
    /* 
    Test case: #2759 - Edit RNA mode
    Description: Custom presets added to Presets section then can be duplicated and edited.
    */
    await expandCollapseRnaBuilder(page);
    await selectMonomer(page, Sugars.TwelveddR);
    await selectMonomer(page, Bases.Adenine);
    await selectMonomer(page, Phosphates.Test6Ph);
    await page.getByTestId('add-to-presets-btn').click();
    await page.getByTestId('12ddR(A)Test-6-Ph_A_12ddR_Test-6-Ph').click({
      button: 'right',
    });
    await page.getByTestId('duplicateandedit').locator('div').click();
    await page.getByTestId('save-btn').click();
    // To avoid unstable test execution
    // Allows see a right preset in a veiwport
    await expandCollapseRnaBuilder(page);
    await page.getByTestId('12ddR(A)Test-6-Ph_Copy_A_12ddR_Test-6-Ph').click({
      button: 'right',
    });
    await page.getByTestId('edit').click();
    await page.getByTestId('rna-builder-slot--phosphate').click();
    await page.getByTestId('P___Phosphate').click();
    await page.getByTestId('save-btn').click();
    await page.getByTestId('12ddR(A)P_A_12ddR_P').click();
    await takePresetsScreenshot(page);
  });

  test('Add Custom preset to Presets section and Delete', async ({ page }) => {
    /* 
    Test case: #2759 - Edit RNA mode
    Description: Custom presets added to Presets section and can be deleted.
    Test working incorrect because we have bug: https://github.com/epam/ketcher/issues/3561
    */
    await expandCollapseRnaBuilder(page);
    await selectMonomer(page, Sugars.TwelveddR);
    await selectMonomer(page, Bases.Adenine);
    await selectMonomer(page, Phosphates.Test6Ph);
    await page.getByTestId('add-to-presets-btn').click();
    await page.getByTestId('12ddR(A)Test-6-Ph_A_12ddR_Test-6-Ph').click({
      button: 'right',
    });
    await page.getByTestId('deletepreset').click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await takePresetsScreenshot(page);
  });

  test('Add Custom preset to Presets section and Rename', async ({ page }) => {
    /* 
    Test case: #2759 - Edit RNA mode
    Description: Custom presets added to Presets section and can be renamed.
    */
    await expandCollapseRnaBuilder(page);
    await selectMonomer(page, Sugars.TwentyFiveR);
    await selectMonomer(page, Bases.NBebnzylAdenine);
    await selectMonomer(page, Phosphates.Boranophosphate);
    await page.getByTestId('add-to-presets-btn').click();
    await page.getByTestId('25R(baA)bP_baA_25R_bP').click({
      button: 'right',
    });
    await page.getByTestId('edit').locator('div').click();
    await page.getByPlaceholder('Name your structure').click();
    await page.getByPlaceholder('Name your structure').fill('TestMonomers');
    await page.getByTestId('save-btn').click();
    await takePresetsScreenshot(page);
  });

  test('Autofilling RNA name when selects RNA parts', async ({ page }) => {
    /* 
    Test case: #2759 - Edit RNA mode
    Description: RNA name autofilling when selects RNA parts.
    */
    await expandCollapseRnaBuilder(page);
    await page.getByTestId('rna-builder-slot--sugar').click();
    await page.getByTestId("3A6___6-amino-hexanol (3' end)").click();
    await moveMouseAway(page);
    await page.getByTestId('rna-builder-slot--base').click();
    await page.getByTestId('baA___N-benzyl-adenine').click();
    await moveMouseAway(page);
    await page.getByTestId('rna-builder-slot--phosphate').click();
    await page.getByTestId('bP___Boranophosphate').click();
    await moveMouseAway(page);
    await takeRNABuilderScreenshot(page);
  });

  test('Add names to RNA manually', async ({ page }) => {
    /* 
    Test case: #2759 - Edit RNA mode
    Description: RNA name added.
    */
    await expandCollapseRnaBuilder(page);
    await page.getByTestId('rna-builder-slot--sugar').click();
    await page.getByTestId('25R___2,5-Ribose').click();
    // To avoid unstable test execution
    // Hide tooltip which overlays 'rna-builder-slot--base' element
    await moveMouseAway(page);
    await page.getByTestId('rna-builder-slot--base').click();
    await page.getByTestId('A___Adenine').click();
    await page.getByTestId('rna-builder-slot--phosphate').click();
    await page.getByTestId('Test-6-Ph___Test-6-AP-Phosphate').click();
    await page.getByPlaceholder('Name your structure').click();
    await page.getByPlaceholder('Name your structure').fill('cTest');
    await page.getByTestId('add-to-presets-btn').click();
    await clickInTheMiddleOfTheScreen(page);
    await takeRNABuilderScreenshot(page);
  });

  test('Highlight Sugar, Phosphate and Base in Library, once it chosen in RNA Builder', async ({
    page,
  }) => {
    /* 
    Test case: #2759 - Edit RNA mode
    Description: Sugar, Phosphate and Base highlighted in Library.
    */
    const monomers = [
      {
        type: 'sugar',
        groupName: 'Sugars',
        name: "3A6___6-amino-hexanol (3' end)",
      },
      { type: 'base', groupName: 'Bases', name: 'baA___N-benzyl-adenine' },
      {
        type: 'phosphate',
        groupName: 'Phosphates',
        name: 'bP___Boranophosphate',
      },
    ];

    await expandCollapseRnaBuilder(page);
    for (const monomer of monomers) {
      await page.getByTestId(`rna-builder-slot--${monomer.type}`).click();
      await page.getByTestId(monomer.name).click();
      await page
        .getByTestId(`rna-accordion-details-${monomer.groupName}`)
        .hover();
      await page.mouse.wheel(0, 0);
      await clickInTheMiddleOfTheScreen(page);
      await takeMonomerLibraryScreenshot(page, { maxDiffPixelRatio: 0.03 });
    }
  });

  test('Add Sugar-Base Combination to Canvas', async ({ page }) => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: Sugar-Base Combination added to Canvas.
    */
    await expandCollapseRnaBuilder(page);
    await selectMonomer(page, Sugars.ThreeA6);
    await selectMonomer(page, Bases.NBebnzylAdenine);
    await page.getByTestId('add-to-presets-btn').click();
    await page.getByTestId('3A6(baA)_baA_3A6_.').click();
    await clickInTheMiddleOfTheScreen(page);
    await selectRectangleSelectionTool(page);
    await takeEditorScreenshot(page);
  });

  test('Add Sugar-Phosphate Combination to Canvas', async ({ page }) => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: Sugar-Phosphate Combination added to Canvas.
    */
    await expandCollapseRnaBuilder(page);
    await selectMonomer(page, Sugars.ThreeA6);
    await selectMonomer(page, Phosphates.Boranophosphate);
    // To avoid unstable test execution
    // Hide tooltip which overlays 'add-to-presets-btn' element
    await moveMouseAway(page);
    await page.getByTestId('add-to-presets-btn').click();
    await page.getByTestId('3A6()bP_._3A6_bP').click();
    await clickInTheMiddleOfTheScreen(page);
    await selectRectangleSelectionTool(page);
    await takeEditorScreenshot(page);
  });

  test('Can not Add Base-Phosphate Combination to Canvas', async ({ page }) => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: Base-Phosphate Combination not added to Canvas.
    */
    await expandCollapseRnaBuilder(page);
    await selectMonomer(page, Bases.NBebnzylAdenine);
    await selectMonomer(page, Phosphates.Boranophosphate);
    await page.getByTestId('add-to-presets-btn').click();
    await page.getByTestId('(baA)bP_baA_._bP').click();
    await moveMouseToTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });

  test('Add Sugar and Base Combination to Canvas and connect with bond', async ({
    page,
  }) => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: Sugar and Base Combination added to Canvas and connect with bond.
    */
    const bondLine = await page.locator('g[pointer-events="stroke"]');
    await drawSugarBase(page);
    await bondLine.hover();
    await takeEditorScreenshot(page);
  });

  test('Add Sugar and Phosphate Combination to Canvas and connect with bond', async ({
    page,
  }) => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: Sugar and Phosphate Combination added to Canvas and connect with bond.
    */
    const bondLine = await page.locator('g[pointer-events="stroke"]');
    await drawSugarPhosphate(page);
    await bondLine.hover();
    await takeEditorScreenshot(page);
  });

  test('Add Base and Phosphate Combination to Canvas and connect with bond', async ({
    page,
  }) => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: Base and Phosphate Combination added to Canvas and connect with bond.
    */
    const bondLine = await page.locator('g[pointer-events="stroke"]');
    await drawBasePhosphate(page);
    await bondLine.hover();
    await takeEditorScreenshot(page);
  });

  test('Add Sugar-Base-Phosphate Combination to Canvas and connect with bond', async ({
    page,
  }) => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: Sugar-Base-Phosphate Combination added to Canvas and connect with bond.
    */
    const bondLine = await page.locator('g[pointer-events="stroke"]').first();
    await drawThreeMonomersConnectedWithBonds(page);
    await bondLine.hover();
    await takeEditorScreenshot(page);
  });

  const monomersToDelete = [
    { text: '12ddR', description: 'Sugar monomer deleted.' },
    { text: 'baA', description: 'Base monomer deleted.' },
    { text: 'P', description: 'Phosphate monomer deleted.' },
  ];

  for (const monomer of monomersToDelete) {
    test(`Open file from .ket and Delete ${monomer.text} monomer`, async ({
      page,
    }) => {
      await openFileAndAddToCanvasMacro(
        'KET/monomers-connected-with-bonds.ket',
        page,
      );
      await selectEraseTool(page);
      await page.getByText(monomer.text).locator('..').first().click();
      await takeEditorScreenshot(page);
    });
  }

  const monomerToDelete = [
    { text: '3A6', description: 'Sugar monomer deleted.' },
    { text: 'baA', description: 'Base monomer deleted.' },
    { text: 'P', description: 'Phosphate monomer deleted.' },
  ];

  for (const monomer of monomerToDelete) {
    test(`Draw Sugar-Base-Phosphate and Delete ${monomer.text} monomer`, async ({
      page,
    }) => {
      await drawThreeMonomersConnectedWithBonds(page);
      await selectEraseTool(page);
      await page.getByText(monomer.text).locator('..').first().click();
      await takeEditorScreenshot(page);
    });
  }

  test('Draw Sugar-Base-Phosphate and Delete connecting bond', async ({
    page,
  }) => {
    /* 
    Test case: Bond tool
    Description: Bond deleted.
    */
    const bondLine = await page.locator('g[pointer-events="stroke"]').first();
    await drawThreeMonomersConnectedWithBonds(page);
    await selectEraseTool(page);
    await bondLine.click();
    await takeEditorScreenshot(page);
  });

  test('Draw Sugar-Base-Phosphate and try to attach bond to occupied attachment point', async ({
    page,
  }) => {
    /* 
    Test case: Bond tool
    Description: A message appears at the bottom of the canvas: 
    Monomers don't have any connection point available.
    */
    const sugars = await page.getByText('3A6').locator('..');
    const sugar1 = sugars.nth(0);
    const bases = await page.getByText('baA').locator('..');
    const base1 = bases.nth(0);
    const phosphates = await page.getByText('P').locator('..');
    const phosphate1 = phosphates.nth(0);
    await drawThreeMonomers(page);
    await selectSingleBondTool(page);
    await sugar1.hover();
    await page.mouse.down();
    await base1.hover();
    await page.mouse.up();
    await phosphate1.hover();
    await page.mouse.down();
    await base1.hover();
    await page.mouse.up();
    await takeEditorScreenshot(page);
  });

  const molecules = [
    { type: 'Sugars', description: '25R___2,5-Ribose' },
    { type: 'Bases', description: 'baA___N-benzyl-adenine' },
    { type: 'Phosphates', description: 'bP___Boranophosphate' },
  ];

  for (const molecule of molecules) {
    test(`Move ${molecule.type} on canvas to new position`, async ({
      page,
    }) => {
      /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: Sugar/Base/Phosphate moved to new position.
    */
      const anyPointX = 300;
      const anyPointY = 500;
      await page.getByTestId(`summary-${molecule.type}`).click();
      await page.getByTestId(molecule.description).click();
      await clickInTheMiddleOfTheScreen(page);
      await selectRectangleSelectionTool(page);
      await clickInTheMiddleOfTheScreen(page);
      await dragMouseTo(anyPointX, anyPointY, page);
      await takeEditorScreenshot(page);
    });
  }

  const monomersToMove = ['3A6', 'baA', 'P'];

  for (const monomer of monomersToMove) {
    test(`Draw Sugar-Base-Phosphate and Move ${monomer} monomer`, async ({
      page,
    }) => {
      /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: Sugar/Base/Phosphate monomer moved to new position. 
    Bonds are connected to monomers. 
    */
      const anyPointX = 300;
      const anyPointY = 500;
      await drawThreeMonomersConnectedWithBonds(page);
      await selectRectangleSelectionTool(page);
      await page.getByText(monomer).locator('..').first().click();
      await dragMouseTo(anyPointX, anyPointY, page);
      await takeEditorScreenshot(page);
    });
  }

  test('Press "Escape" button while pull the bond from monomer', async ({
    page,
  }) => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: Bond does not remain on the canvas and returns to original position.
    Test working incorrect now because we have bug https://github.com/epam/ketcher/issues/3539
    */
    await addMonomerToCenterOfCanvas(page, Sugars.TwentyFiveR);
    await selectSingleBondTool(page);
    await page.getByText('25R').locator('..').first().click();
    await pressEscapeWhenPullBond(page);
    await takeEditorScreenshot(page);
  });

  test('Check presence of Clear canvas button in left menu', async ({
    page,
  }) => {
    /* 
    Test case: Clear Canvas tool
    Description: Clear canvas button presence in left menu
    */
    await takeLeftToolbarMacromoleculeScreenshot(page);
  });

  test('Draw Sugar-Base-Phosphate and press Clear canvas', async ({ page }) => {
    /* 
    Test case: Clear Canvas tool
    Description: Canvas is cleared
    */
    await drawThreeMonomersConnectedWithBonds(page);
    await page.getByTestId('clear-canvas').click();
    await takeEditorScreenshot(page);
  });

  test('Open Sugar-Base-Phosphate from .ket file and press Clear canvas', async ({
    page,
  }) => {
    /* 
    Test case: Clear Canvas tool
    Description: Canvas is cleared
    */
    await openFileAndAddToCanvasMacro(
      'KET/monomers-connected-with-bonds.ket',
      page,
    );
    await page.getByTestId('clear-canvas').click();
    await takeEditorScreenshot(page);
  });

  test('Save file with three Monomers as .ket file', async ({ page }) => {
    /* 
    Test case: Open&save files
    Description: File saved with three Monomers as .ket file
    */
    await openFileAndAddToCanvasMacro(
      'KET/monomers-connected-with-bonds.ket',
      page,
    );
    const expectedFile = await getKet(page);
    await saveToFile(
      'KET/monomers-connected-with-bonds-expected.ket',
      expectedFile,
    );

    const { fileExpected: ketFileExpected, file: ketFile } =
      await receiveFileComparisonData({
        page,
        expectedFileName:
          'tests/test-data/KET/monomers-connected-with-bonds-expected.ket',
      });
    expect(ketFile).toEqual(ketFileExpected);
  });

  test('Open Sugar-Base-Phosphate from .ket file and switch to Micromolecule mode', async ({
    page,
  }) => {
    /* 
    Test case: https://github.com/epam/ketcher/issues/3498
    Description: Ketcher switch to Micromolecule mode
    Test is not working properly because we have bug.
    */
    await openFileAndAddToCanvasMacro(
      'KET/monomers-connected-with-bonds.ket',
      page,
    );
    await turnOnMicromoleculesEditor(page);
    await takePageScreenshot(page);
  });

  test('It is possible to add/remove RNA presets into the Favourite library', async ({
    page,
  }) => {
    /*
     *Test case: https://github.com/epam/ketcher/issues/4422 - Case 6-7
     *Description:
     *  Case 6:
     *    It is possible to add RNA presets into the Favourite library
     *  Case 7:
     *    It is possible to delete RNA presets from the Favourite library
     */
    await page.getByText('★').first().click();
    await page.getByTestId('FAVORITES-TAB').click();
    await takeMonomerLibraryScreenshot(page);

    await page.getByText('★').first().click();
    await takeMonomerLibraryScreenshot(page);
  });

  test('Check that presets and monomers appear back after cleaning search field', async ({
    page,
  }) => {
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
    const rnaLibrarySearch = page.getByTestId('monomer-library-input');
    await rnaLibrarySearch.fill('No monomers and presets');
    await takeMonomerLibraryScreenshot(page);

    await page.getByTestId('RNA-TAB').click();
    await takeMonomerLibraryScreenshot(page);

    await page.getByTestId('CHEM-TAB').click();
    await takeMonomerLibraryScreenshot(page);

    // await rnaLibrarySearch.press('Escape');
    // Case 27 here. Dirty hack, can't believe I did it.
    const xCoodinate = 1241;
    const yCoodinate = 62;
    await page.mouse.click(xCoodinate, yCoodinate);

    await page.getByTestId('RNA-TAB').click();
    await takeMonomerLibraryScreenshot(page);

    await page.getByTestId('PEPTIDES-TAB').click();
    await takeMonomerLibraryScreenshot(page);
  });

  test('Check that can delete preset from Presets section', async ({
    page,
  }) => {
    /*
     *Test case: https://github.com/epam/ketcher/issues/4422 - Case 14
     *Description:
     *  Case 14:
     *    Check that can delete preset from Presets section
     */
    await expandCollapseRnaBuilder(page);
    await selectMonomer(page, Sugars.TwelveddR);
    await selectMonomer(page, Bases.Adenine);
    await selectMonomer(page, Phosphates.Test6Ph);
    await page.getByTestId('add-to-presets-btn').click();
    await expandCollapseRnaBuilder(page);

    const customPreset = page.getByTestId(
      '12ddR(A)Test-6-Ph_A_12ddR_Test-6-Ph',
    );
    await customPreset.hover();
    await customPreset.click({ button: 'right' });
    await page.getByText('Delete Preset').click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await takeMonomerLibraryScreenshot(page);
  });

  test('Check that after hiding library panel that there is no residual strip remains (which concealing content on the canvas)', async ({
    page,
  }) => {
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

  test('Check that After reloading the page, monomers added to the Favorites section not disappear', async ({
    page,
  }) => {
    /*
     *Test case: https://github.com/epam/ketcher/issues/4422 - Case 18
     *Description:
     *  Case 18:
     *    Check that After reloading the page, monomers added to the Favorites section not disappear
     */
    await page.getByText('★').first().click();
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
    await page.getByTestId('FAVORITES-TAB').click();
    await takeMonomerLibraryScreenshot(page);
  });

  test('Select all entered text in RNA Builder and delete', async ({
    page,
  }) => {
    /*
     *Test case: https://github.com/epam/ketcher/issues/4422 - Case 20
     *Description:
     *  Case 20:
     *    Select all entered text in RNA Builder and delete
     */
    await gotoRNA(page);

    const rnaNameEditBox = page.getByPlaceholder('Name your structure');
    const rnaName = 'Random Text';

    await rnaNameEditBox.fill(rnaName);
    await takeRNABuilderScreenshot(page);

    for (let i = 0; i < rnaName.length; i++) {
      await rnaNameEditBox.press('Backspace');
    }
    await takeRNABuilderScreenshot(page);
  });

  test('Check that preview window disappears when a cursor moves off from RNA in library', async ({
    page,
  }) => {
    /*
     *Test case: https://github.com/epam/ketcher/issues/4422 - Case 21
     *Description:
     *  Case 20:
     *    Check that preview window disappears when a cursor moves off from RNA in library
     *    (phosphates, sugars, bases)
     */
    await gotoRNA(page);

    await toggleSugarsAccordion(page);
    await page.getByText('12ddR').hover();
    await delay(1);
    await takeMonomerLibraryScreenshot(page);
    await moveMouseAway(page);
    await takeMonomerLibraryScreenshot(page);

    await toggleBasesAccordion(page);
    await page.getByText('cpmA').hover();
    await delay(1);
    await takeMonomerLibraryScreenshot(page);
    await moveMouseAway(page);
    await takeMonomerLibraryScreenshot(page);

    await togglePhosphatesAccordion(page);
    await page.getByText('Test-6-Ph').hover();
    await delay(1);
    await takeMonomerLibraryScreenshot(page);
    await moveMouseAway(page);
    await takeMonomerLibraryScreenshot(page);
  });

  test('CHEM tab check at Library', async ({ page }) => {
    /*
     *Test case: https://github.com/epam/ketcher/issues/4422 - Case 22 - 25
     *Description:
     *  Case 22 - Check CHEM frame when it's being hovered over in library
     *  Case 23 - CHEM gets highlighted when it's being selected in library
     *  Case 24 - Preview window appearing when hover over CHEM in library
     *  Case 25 - Search CHEM by entering its name in search field
     */
    await gotoRNA(page);
    // Case 22
    await page.getByTestId('CHEM-TAB').hover();
    await takeMonomerLibraryScreenshot(page);

    // Case 23
    await goToCHEMTab(page);
    await page.getByTestId('Test-6-Ch___Test-6-AP-Chem').click();
    await moveMouseAway(page);
    await takeElementScreenshot(page, 'Test-6-Ch___Test-6-AP-Chem', {
      maxDiffPixelRatio: 0.03,
    });
    // await takeMonomerLibraryScreenshot(page);
    await moveMouseAway(page);

    // Case 24
    await page.getByTestId('SMPEG2___SM(PEG)2 linker from Pierce').hover();
    await delay(1);
    await takeMonomerLibraryScreenshot(page);
    await moveMouseAway(page);

    // Case 25
    const rnaLibrarySearch = page.getByTestId('monomer-library-input');
    await rnaLibrarySearch.fill('SMCC');
    await takeMonomerLibraryScreenshot(page);
  });

  test('RNA builder expands when clicking on New Preset button', async ({
    page,
  }) => {
    /*
     *Test case: https://github.com/epam/ketcher/issues/4422 - Case 26
     *Description:
     *  Case 26 - RNA builder expands when clicking on 'New Preset' button
     */
    await gotoRNA(page);

    await pressNewPresetButton(page);
    await expect(page.getByTestId('cancel-btn')).toBeVisible();

    await page.getByTestId('cancel-btn').click();
  });
});
