import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
import { test } from '@playwright/test';
import {
  Bases,
  DropDown,
  Phosphates,
  Sugars,
  addMonomerToCenterOfCanvas,
  clickInTheMiddleOfTheScreen,
  moveMouseToTheMiddleOfTheScreen,
  selectMonomer,
  selectRectangleSelectionTool,
  takeEditorScreenshot,
  takeMonomerLibraryScreenshot,
  takePresetsScreenshot,
  takeRNABuilderScreenshot,
  waitForPageInit,
  waitForRender,
} from '@utils';

test.describe('RNA Library', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Check the RNA components panel', async ({ page }) => {
    /* 
    Test case: #2748, #2751 - RNA Builder. Accordion component
    Description: Check the RNA components panel. 
    RNA panel consist of:
    RNA Builder(expanded), Presets(5)(expanded), Sugars(199)(collapsed), 
    Bases(160)(collapsed), Phosphates(32)(collapsed)
    */
    await page.getByTestId('RNA-TAB').click();
    await takeMonomerLibraryScreenshot(page, {
      masks: [page.getByTestId('polymer-toggler')],
    });
  });

  test('Collapse RNA Builder', async ({ page }) => {
    /* 
    Test case: #2748, #2751 - RNA Builder. Accordion component
    Description: After click on arrow RNA Builder collapsed.
    */
    await page.getByTestId('RNA-TAB').click();
    await page
      .locator('div')
      .filter({ hasText: /^RNA Builder$/ })
      .getByRole('button')
      .click();
    await takeMonomerLibraryScreenshot(page, {
      masks: [page.getByTestId('polymer-toggler')],
    });
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
      await page.getByTestId('RNA-TAB').click();
      await page.getByTestId(`summary-${data.component}`).click();
      await takeMonomerLibraryScreenshot(page, {
        masks: [page.getByTestId('polymer-toggler')],
      });
    });
  }

  test('Add Sugar monomer to canvas', async ({ page }) => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: The selected sugar monomer should be added to the canvas 
    in the form of a square with rounded edges and in the corresponding color.
    */
    await addMonomerToCenterOfCanvas(
      DropDown.SugarsDropDown,
      Sugars.TwelveddR,
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Add Base monomer to canvas', async ({ page }) => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: The selected base monomer should be added to the canvas 
    in the form of a rhombus and in the corresponding color.
    */
    await addMonomerToCenterOfCanvas(
      DropDown.BasesDropDown,
      Bases.Adenine,
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Add Phosphate monomer to canvas', async ({ page }) => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: The selected phosphate monomer should be added to the canvas 
    in the form of a circle and in the corresponding color.
    */
    await addMonomerToCenterOfCanvas(
      DropDown.PhosphatesDropDown,
      Phosphates.Test6Ph,
      page,
    );
    await takeEditorScreenshot(page);
  });

  test('Add Custom preset to Presets section', async ({ page }) => {
    /* 
    Test case: #2759 - Edit RNA mode
    Description: Custom presets added to Presets section.
    */
    await selectMonomer(DropDown.SugarsDropDown, Sugars.TwelveddR, page);
    await selectMonomer(DropDown.BasesDropDown, Bases.Adenine, page);
    await selectMonomer(DropDown.PhosphatesDropDown, Phosphates.Test6Ph, page);
    await page.getByTestId('add-to-presets-btn').click();
    await page.getByTestId('12ddR(A)Test-6-Ph_A_12ddR_Test-6-Ph').click();
    await takePresetsScreenshot(page, {
      masks: [page.getByTestId('polymer-toggler')],
    });
  });

  test('Add Custom preset to Canvas', async ({ page }) => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: Custom presets added to Canvas.
    */
    await selectMonomer(DropDown.SugarsDropDown, Sugars.ThreeA6, page);
    await selectMonomer(DropDown.BasesDropDown, Bases.NBebnzylAdenine, page);
    await selectMonomer(
      DropDown.PhosphatesDropDown,
      Phosphates.Boranophosphate,
      page,
    );
    await page.getByTestId('add-to-presets-btn').click();
    await page.getByTestId('3A6(baA)bP_baA_3A6_bP').click();
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
    await selectMonomer(DropDown.SugarsDropDown, Sugars.TwelveddR, page);
    await selectMonomer(DropDown.BasesDropDown, Bases.Adenine, page);
    await page.getByTestId('add-to-presets-btn').click();
    await page.getByTestId('12ddR(A)_A_12ddR_.').click();
    await takePresetsScreenshot(page, {
      masks: [page.getByTestId('polymer-toggler')],
    });
  });

  test('Add to presets (different combinations: Sugar+Phosphate', async ({
    page,
  }) => {
    /*
    Test case: #2759 - Edit RNA mode
    Description: Custom presets added to Presets section.
    */
    await selectMonomer(DropDown.SugarsDropDown, Sugars.TwelveddR, page);
    await selectMonomer(
      DropDown.PhosphatesDropDown,
      Phosphates.Boranophosphate,
      page,
    );
    await page.getByTestId('add-to-presets-btn').click();
    await page.getByTestId('12ddR()bP_._12ddR_bP').click();
    await takePresetsScreenshot(page, {
      masks: [page.getByTestId('polymer-toggler')],
    });
  });

  test('Add to presets (different combinations: Base+Phosphate', async ({
    page,
  }) => {
    /*
    Test case: #2759 - Edit RNA mode
    Description: Custom presets added to Presets section.
    */
    await selectMonomer(DropDown.BasesDropDown, Bases.Adenine, page);
    await selectMonomer(
      DropDown.PhosphatesDropDown,
      Phosphates.Boranophosphate,
      page,
    );
    await page.getByTestId('add-to-presets-btn').click();
    await page.getByTestId('(A)bP_A_._bP').click();
    await takePresetsScreenshot(page, {
      masks: [page.getByTestId('polymer-toggler')],
    });
  });

  test('Add Custom preset to Presets section and Edit', async ({ page }) => {
    /* 
    Test case: #2759 - Edit RNA mode
    Description: Custom presets added to Presets section and can be edited.
    */
    await selectMonomer(DropDown.SugarsDropDown, Sugars.TwelveddR, page);
    await selectMonomer(DropDown.BasesDropDown, Bases.Adenine, page);
    await selectMonomer(DropDown.PhosphatesDropDown, Phosphates.Test6Ph, page);
    await page.getByTestId('add-to-presets-btn').click();
    await page.getByTestId('12ddR(A)Test-6-Ph_A_12ddR_Test-6-Ph').click({
      button: 'right',
    });
    await page.getByTestId('edit').locator('div').click();
    await page.getByTestId('rna-builder-slot--base').click();
    await page.getByTestId('baA___N-benzyl-adenine').click();
    await page.getByTestId('save-btn').click();
    await page.getByTestId('12ddR(baA)Test-6-Ph_baA_12ddR_Test-6-Ph').click();
    await takePresetsScreenshot(page, {
      masks: [page.getByTestId('polymer-toggler')],
    });
  });

  test('Add Custom preset to Presets section then Duplicate and Edit', async ({
    page,
  }) => {
    /* 
    Test case: #2759 - Edit RNA mode
    Description: Custom presets added to Presets section then can be duplicated and edited.
    */
    await selectMonomer(DropDown.SugarsDropDown, Sugars.TwelveddR, page);
    await selectMonomer(DropDown.BasesDropDown, Bases.Adenine, page);
    await selectMonomer(DropDown.PhosphatesDropDown, Phosphates.Test6Ph, page);
    await page.getByTestId('add-to-presets-btn').click();
    await page.getByTestId('12ddR(A)Test-6-Ph_A_12ddR_Test-6-Ph').click({
      button: 'right',
    });
    await page.getByTestId('duplicateandedit').locator('div').click();
    await page.getByTestId('12ddR(A)Test-6-Ph_Copy_A_12ddR_Test-6-Ph').click({
      button: 'right',
    });
    await page.getByTestId('edit').locator('div').click();
    await page.getByTestId('rna-builder-slot--phosphate').click();
    await page.getByTestId('P___Phosphate').click();
    await page.getByTestId('save-btn').click();
    await page.getByTestId('12ddR(A)P_A_12ddR_P').click();
    await takePresetsScreenshot(page, {
      masks: [page.getByTestId('polymer-toggler')],
    });
  });

  test('Add Custom preset to Presets section and Delete', async ({ page }) => {
    /* 
    Test case: #2759 - Edit RNA mode
    Description: Custom presets added to Presets section and can be deleted.
    */
    await selectMonomer(DropDown.SugarsDropDown, Sugars.TwelveddR, page);
    await selectMonomer(DropDown.BasesDropDown, Bases.Adenine, page);
    await selectMonomer(DropDown.PhosphatesDropDown, Phosphates.Test6Ph, page);
    await page.getByTestId('add-to-presets-btn').click();
    await page.getByTestId('12ddR(A)Test-6-Ph_A_12ddR_Test-6-Ph').click({
      button: 'right',
    });
    await page.getByTestId('deletepreset').locator('div').click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await takePresetsScreenshot(page, {
      masks: [page.getByTestId('polymer-toggler')],
    });
  });

  test('Add Custom preset to Presets section and Rename', async ({ page }) => {
    /* 
    Test case: #2759 - Edit RNA mode
    Description: Custom presets added to Presets section and can be renamed.
    */
    await selectMonomer(DropDown.SugarsDropDown, Sugars.TwentyFiveR, page);
    await selectMonomer(DropDown.BasesDropDown, Bases.NBebnzylAdenine, page);
    await selectMonomer(
      DropDown.PhosphatesDropDown,
      Phosphates.Boranophosphate,
      page,
    );
    await page.getByTestId('add-to-presets-btn').click();
    await page.getByTestId('25R(baA)bP_baA_25R_bP').click({
      button: 'right',
    });
    await page.getByTestId('edit').locator('div').click();
    await page.getByPlaceholder('Name your structure').click();
    await page.getByPlaceholder('Name your structure').fill('TestMonomers');
    await page.getByTestId('save-btn').click();
    await takePresetsScreenshot(page, {
      masks: [page.getByTestId('polymer-toggler')],
    });
  });

  test('Autofilling RNA name when selects RNA parts', async ({ page }) => {
    /* 
    Test case: #2759 - Edit RNA mode
    Description: RNA name autofilling when selects RNA parts.
    */
    await page.getByTestId('RNA-TAB').click();
    await page.getByTestId('rna-builder-slot--sugar').click();
    await page.getByTestId("3A6___6-amino-hexanol (3' end)").click();
    await page.getByTestId('rna-builder-slot--base').click();
    await page.getByTestId('baA___N-benzyl-adenine').click();
    await page.getByTestId('rna-builder-slot--phosphate').click();
    await page.getByTestId('bP___Boranophosphate').click();
    await selectRectangleSelectionTool(page);
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
      { type: 'sugar', name: "3A6___6-amino-hexanol (3' end)" },
      { type: 'base', name: 'baA___N-benzyl-adenine' },
      { type: 'phosphate', name: 'bP___Boranophosphate' },
    ];

    for (const monomer of monomers) {
      await page.getByTestId('RNA-TAB').click();
      await page.getByTestId(`rna-builder-slot--${monomer.type}`).click();
      await page.getByTestId(monomer.name).click();
    }
    await takeMonomerLibraryScreenshot(page);
  });

  test('Add Sugar-Base Combination to Canvas', async ({ page }) => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: Sugar-Base Combination added to Canvas.
    */
    await selectMonomer(DropDown.SugarsDropDown, Sugars.ThreeA6, page);
    await selectMonomer(DropDown.BasesDropDown, Bases.NBebnzylAdenine, page);
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
    await selectMonomer(DropDown.SugarsDropDown, Sugars.ThreeA6, page);
    await selectMonomer(
      DropDown.PhosphatesDropDown,
      Phosphates.Boranophosphate,
      page,
    );
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
    await selectMonomer(DropDown.BasesDropDown, Bases.NBebnzylAdenine, page);
    await selectMonomer(
      DropDown.PhosphatesDropDown,
      Phosphates.Boranophosphate,
      page,
    );
    await page.getByTestId('add-to-presets-btn').click();
    await page.getByTestId('(baA)bP_baA_._bP').click();
    await moveMouseToTheMiddleOfTheScreen(page);
    await takeEditorScreenshot(page);
  });
});
