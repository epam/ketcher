import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
import { test } from '@playwright/test';
import {
  Bases,
  DropDown,
  Phosphates,
  Sugars,
  addMonomerToCenterOfCanvas,
  clickInTheMiddleOfTheScreen,
  selectMonomer,
  selectRectangleSelectionTool,
  takePageScreenshot,
  waitForPageInit,
} from '@utils';

test.describe('RNA Library', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Check the RNA components panel', async ({ page }) => {
    /* 
    Test case: #2748 - RNA Builder. Accordion component
    Description: Check the RNA components panel. 
    RNA panel consist of:
    RNA Builder(expanded), Presets(5)(expanded), Sugars(199)(collapsed), 
    Bases(160)(collapsed), Phosphates(32)(collapsed)
    */
    await page.getByTestId('RNA-TAB').click();
    await takePageScreenshot(page);
  });

  test('Collapse RNA Builder', async ({ page }) => {
    /* 
    Test case: #2748 - RNA Builder. Accordion component
    Description: After click on arrow RNA Builder collapsed.
    */
    await page.getByTestId('RNA-TAB').click();
    await page
      .locator('div')
      .filter({ hasText: /^RNA Builder$/ })
      .getByRole('button')
      .click();
    await takePageScreenshot(page);
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
      Test case: #2748 - RNA Builder. Accordion component
      */
      await page.getByTestId('RNA-TAB').click();
      await page.getByTestId(`summary-${data.component}`).click();
      await takePageScreenshot(page);
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
    await takePageScreenshot(page);
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
    await takePageScreenshot(page);
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
    await takePageScreenshot(page);
  });

  test('Add Custom preset to Presets section', async ({ page }) => {
    /* 
    Test case: #2507 - Add RNA monomers to canvas
    Description: Custom presets added to Presets section.
    */
    await selectMonomer(DropDown.SugarsDropDown, Sugars.TwelveddR, page);
    await selectMonomer(DropDown.BasesDropDown, Bases.Adenine, page);
    await selectMonomer(DropDown.PhosphatesDropDown, Phosphates.Test6Ph, page);
    await page.getByTestId('add-to-presets-btn').click();
    await page.getByTestId('12ddR(A)Test-6-Ph_A_12ddR_Test-6-Ph').click();
    await takePageScreenshot(page);
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
    await takePageScreenshot(page);
  });
});
