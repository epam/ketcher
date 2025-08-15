import { waitForMonomerPreview } from '@utils/macromolecules';
import { Page, test, expect } from '@fixtures';
import {
  addMonomerToCenterOfCanvas,
  clickInTheMiddleOfTheScreen,
  dragMouseTo,
  openFileAndAddToCanvasMacro,
  pressButton,
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
  clickOnCanvas,
  MonomerType,
  Monomer,
} from '@utils';
import { clearLocalStorage, pageReload } from '@utils/common/helpers';
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
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import {
  monomerLibraryTypeLocation,
  MonomerTypeLocation,
  RNASection,
  RNASectionArea,
} from '@tests/pages/constants/library/Constants';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { LibraryPresetOption } from '@tests/pages/constants/contextMenu/Constants';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';

async function drawThreeMonomers(page: Page) {
  const x1 = 301;
  const y1 = 102;
  const x2 = 303;
  const y2 = 504;
  const x3 = 705;
  const y3 = 106;
  await Library(page).dragMonomerOnCanvas(Sugars._3A6, {
    x: x1,
    y: y1,
  });
  await Library(page).dragMonomerOnCanvas(Bases.baA, {
    x: x2,
    y: y2,
  });
  await Library(page).dragMonomerOnCanvas(Phosphates.P, {
    x: x3,
    y: y3,
  });
  await clickOnCanvas(page, x3, y3, { from: 'pageTopLeft' });
}

async function drawThreeMonomersConnectedWithBonds(page: Page) {
  const sugar = getMonomerLocator(page, Sugars._3A6).nth(0);
  const base = getMonomerLocator(page, Bases.baA).nth(0);
  const phosphate = getMonomerLocator(page, Phosphates.P).nth(0);

  await drawThreeMonomers(page);
  await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
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

  await Library(page).dragMonomerOnCanvas(Bases.baA, {
    x: 0,
    y: 0,
    fromCenter: true,
  });
  await Library(page).dragMonomerOnCanvas(Phosphates.P, {
    x,
    y,
  });
  await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
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

  await Library(page).dragMonomerOnCanvas(Sugars._3A6, {
    x: 0,
    y: 0,
    fromCenter: true,
  });
  await Library(page).dragMonomerOnCanvas(Phosphates.P, {
    x,
    y,
  });
  await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
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
  await Library(page).dragMonomerOnCanvas(Sugars._3A6, {
    x: 0,
    y: 0,
    fromCenter: true,
  });
  await Library(page).dragMonomerOnCanvas(Bases.baA, {
    x,
    y,
  });
  await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
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
  await Library(page).switchToRNATab();
}

test.describe('RNA Library', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await configureInitialState(page);
  });

  test.afterEach(async ({ context: _ }) => {
    await CommonTopLeftToolbar(page).clearCanvas();
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
      await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
      await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

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
    await Library(page).rnaBuilder.expand();
    await takeMonomerLibraryScreenshot(page);

    // Reset to default state
    await Library(page).rnaBuilder.collapse();
  });

  const testData = [
    {
      component: RNASection.Presets,
      description:
        'After clicking on the arrow, the Presets component collapsed.',
    },
    {
      component: RNASection.Sugars,
      description:
        'After clicking on the arrow, the Sugars component expanded.',
    },
    {
      component: RNASection.Bases,
      description: 'After clicking on the arrow, the Bases component expanded.',
    },
    {
      component: RNASection.Phosphates,
      description:
        'After clicking on the arrow, the Phosphates component expanded.',
    },
  ];

  function getEnumKeyByValue<T extends Record<string, string>>(
    enumObj: T,
    value: string,
  ): keyof T | undefined {
    return (Object.keys(enumObj) as Array<keyof T>).find(
      (key) => enumObj[key] === value,
    );
  }

  for (const [index, data] of testData.entries()) {
    const enumKey = getEnumKeyByValue(RNASection, data.component);
    test(`Check ${enumKey} component`, async () => {
      /* 
      Test case: #2748, #2751 - RNA Builder. Accordion component
      */
      await Library(page).openRNASection(data.component);

      await takeMonomerLibraryScreenshot(page);

      // Reset to default state: expand the 'Presets' component after verifying the last item
      if (index === testData.length - 1) {
        await Library(page).openRNASection(RNASection.Presets);
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
    await Library(page).rnaBuilder.expand();
    await Library(page).selectMonomers([
      Sugars._25R,
      Bases.A,
      Phosphates.Test_6_Ph,
    ]);
    await Library(page).rnaBuilder.addToPresets();
    await Library(page).selectCustomPreset('25R(A)Test-6-Ph_A_25R_Test-6-Ph');
    await Library(page).rnaBuilder.collapse();
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

    await Library(page).rnaBuilder.expand();
    await Library(page).selectMonomers([
      Sugars._25R,
      Bases.A,
      Phosphates.Test_6_Ph,
    ]);
    await Library(page).rnaBuilder.addToPresets();
    await Library(page).selectCustomPreset('25R(A)Test-6-Ph_A_25R_Test-6-Ph');
    await Library(page).rnaBuilder.collapse();
    await takePresetsScreenshot(page);

    await reloadPageAndConfigureInitialState(page);
    await Library(page).selectCustomPreset('25R(A)Test-6-Ph_A_25R_Test-6-Ph');
    await Library(page).rnaBuilder.collapse();
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

    await Library(page).rnaBuilder.expand();
    await Library(page).selectMonomers([
      Sugars._25R,
      Bases.A,
      Phosphates.Test_6_Ph,
    ]);
    await Library(page).rnaBuilder.addToPresets();
    await Library(page).selectCustomPreset('25R(A)Test-6-Ph_A_25R_Test-6-Ph');
    await Library(page).rnaBuilder.collapse();
    await takePresetsScreenshot(page);

    await reloadPageAndConfigureInitialState(page);
    await Library(page).rnaBuilder.expand();
    await Library(page).selectMonomers([
      Sugars._25R,
      Bases.A,
      Phosphates.Test_6_Ph,
    ]);
    await Library(page).rnaBuilder.addToPresets();
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

    await Library(page).rnaBuilder.expand();
    await Library(page).selectMonomers([Sugars._3A6, Bases.baA, Phosphates.bP]);
    await Library(page).rnaBuilder.addToPresets();
    await Library(page).selectCustomPreset('3A6(baA)bP_baA_3A6_bP');
    await clickInTheMiddleOfTheScreen(page);
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
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

    await Library(page).rnaBuilder.expand();
    await Library(page).selectMonomers([Bases.baA, Phosphates.bP]);
    await Library(page).rnaBuilder.selectSugarSlot();
    await Library(page).selectMonomer(Sugars._3SS6);
    await Library(page).rnaBuilder.selectSugarSlot();
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

    await Library(page).rnaBuilder.expand();
    await Library(page).selectMonomers([Sugars._25R, Bases.A]);
    await Library(page).rnaBuilder.addToPresets();
    await Library(page).selectCustomPreset('25R(A)_A_25R_.');
    await Library(page).rnaBuilder.collapse();
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

    await Library(page).rnaBuilder.expand();
    await Library(page).selectMonomers([Sugars._25R, Phosphates.bP]);
    await Library(page).rnaBuilder.addToPresets();
    await Library(page).selectCustomPreset('25R()bP_._25R_bP');
    await Library(page).rnaBuilder.collapse();
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

    await Library(page).rnaBuilder.expand();
    await Library(page).selectMonomers([Bases.A, Phosphates.bP]);
    await Library(page).rnaBuilder.selectBaseSlot();
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

    await Library(page).rnaBuilder.expand();
    await Library(page).selectMonomers([
      Sugars._25R,
      Bases.A,
      Phosphates.Test_6_Ph,
    ]);
    await Library(page).rnaBuilder.addToPresets();
    const customPreset = page.getByTestId('25R(A)Test-6-Ph_A_25R_Test-6-Ph');
    await ContextMenu(page, customPreset).click(LibraryPresetOption.Edit);
    await Library(page).rnaBuilder.selectBaseSlot();
    await Library(page).selectMonomer(Bases.baA);
    await moveMouseAway(page);
    await Library(page).rnaBuilder.save();
    await Library(page).selectCustomPreset(
      '25R(baA)Test-6-Ph_baA_25R_Test-6-Ph',
    );

    // To avoid unstable test execution
    // Allows see a right preset in a viewport
    await Library(page).rnaBuilder.collapse();
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

    await Library(page).rnaBuilder.expand();
    await Library(page).selectMonomers([
      Sugars._25R,
      Bases.A,
      Phosphates.Test_6_Ph,
    ]);
    await Library(page).rnaBuilder.addToPresets();
    const customPreset = page.getByTestId('25R(A)Test-6-Ph_A_25R_Test-6-Ph');
    await ContextMenu(page, customPreset).click(
      LibraryPresetOption.DuplicateAndEdit,
    );
    await Library(page).rnaBuilder.save();
    // To avoid unstable test execution
    // Allows see a right preset in a veiwport
    await Library(page).rnaBuilder.collapse();
    const customPresetCopy = page.getByTestId(
      '25R(A)Test-6-Ph_Copy_A_25R_Test-6-Ph',
    );
    await ContextMenu(page, customPresetCopy).click(LibraryPresetOption.Edit);
    await Library(page).rnaBuilder.selectPhosphateSlot();
    await Library(page).selectMonomer(Phosphates.P);
    await Library(page).rnaBuilder.save();
    await Library(page).selectCustomPreset('25R(A)P_A_25R_P');
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

    await Library(page).rnaBuilder.expand();
    const resetA = page.getByTestId(Presets.A.testId);
    await ContextMenu(page, resetA).click(LibraryPresetOption.DuplicateAndEdit);
    await Library(page).rnaBuilder.cancel();
    // To avoid unstable test execution
    // Allows see a right preset in a veiwport
    await Library(page).rnaBuilder.collapse();
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

      await Library(page).rnaBuilder.expand();
      await Library(page).selectMonomers([
        Sugars._25R,
        Bases.A,
        Phosphates.Test_6_Ph,
      ]);
      await Library(page).rnaBuilder.addToPresets();
      const customPreset = page.getByTestId('25R(A)Test-6-Ph_A_25R_Test-6-Ph');
      await ContextMenu(page, customPreset).click(
        LibraryPresetOption.DeletePreset,
      );
      await page.getByRole('button', { name: 'Delete' }).click();
      await takePresetsScreenshot(page);

      // Reset to default state
      await Library(page).rnaBuilder.collapse();
    },
  );

  test('Add Custom preset to Presets section and Rename', async () => {
    /* 
    Test case: #2759 - Edit RNA mode
    Description: Custom presets added to Presets section and can be renamed.
    */
    await Library(page).rnaBuilder.expand();
    await Library(page).selectMonomers([Sugars._25R, Bases.baA, Phosphates.bP]);
    await Library(page).rnaBuilder.addToPresets();
    const customPreset = page.getByTestId('25R(baA)bP_baA_25R_bP');
    await ContextMenu(page, customPreset).click(LibraryPresetOption.Edit);
    await page.getByPlaceholder('Name your structure').click();
    await page.getByPlaceholder('Name your structure').fill('TestMonomers');
    await Library(page).rnaBuilder.save();
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

    await Library(page).rnaBuilder.expand();
    await Library(page).rnaBuilder.selectSugarSlot();
    await Library(page).selectMonomer(Sugars._3A6);
    await moveMouseAway(page);
    await Library(page).rnaBuilder.selectBaseSlot();
    await Library(page).selectMonomer(Bases.baA);
    await moveMouseAway(page);
    await Library(page).rnaBuilder.selectPhosphateSlot();
    await Library(page).selectMonomer(Phosphates.bP);
    await takeRNABuilderScreenshot(page, { hideMonomerPreview: true });

    // Reset to default state
    await Library(page).rnaBuilder.collapse();
  });

  test('Add names to RNA manually', async () => {
    /* 
    Test case: #2759 - Edit RNA mode
    Description: RNA name added.
    */
    await Library(page).rnaBuilder.expand();
    await Library(page).rnaBuilder.selectSugarSlot();
    await Library(page).selectMonomer(Sugars._25R);
    // To avoid unstable test execution
    // Hide tooltip which overlays 'rna-builder-slot--base' element
    await moveMouseAway(page);
    await Library(page).rnaBuilder.selectBaseSlot();
    await Library(page).selectMonomer(Bases.A);
    await Library(page).rnaBuilder.selectPhosphateSlot();
    await Library(page).selectMonomer(Phosphates.Test_6_Ph);
    await page.getByPlaceholder('Name your structure').click();
    await page.getByPlaceholder('Name your structure').fill('cTest');
    await Library(page).rnaBuilder.addToPresets();
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

    await Library(page).rnaBuilder.expand();
    for (const monomer of monomers) {
      await Library(page).selectMonomer(monomer.name);
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

    await Library(page).rnaBuilder.expand();
    await Library(page).selectMonomers([Sugars._3A6, Bases.baA]);
    await Library(page).rnaBuilder.addToPresets();
    await Library(page).dragMonomerOnCanvas(
      {
        alias: '3A6(baA)_baA_3A6_.',
        testId: '3A6(baA)_baA_3A6_.',
      } as Monomer,
      {
        x: 0,
        y: 0,
        fromCenter: true,
      },
    );
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
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

    await Library(page).rnaBuilder.expand();
    await Library(page).selectMonomers([Sugars._3A6, Phosphates.bP]);
    await Library(page).rnaBuilder.addToPresets();
    await Library(page).dragMonomerOnCanvas(
      {
        alias: '3A6()bP_._3A6_bP',
        testId: '3A6()bP_._3A6_bP',
      } as Monomer,
      {
        x: 0,
        y: 0,
        fromCenter: true,
      },
    );
    await CommonLeftToolbar(page).selectAreaSelectionTool(
      SelectionToolType.Rectangle,
    );
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

    await Library(page).rnaBuilder.expand();
    await Library(page).selectMonomers([Bases.baA, Phosphates.bP]);
    await Library(page).rnaBuilder.selectBaseSlot();
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
    { monomer: Sugars.R, description: 'Sugar monomer deleted.' },
    { monomer: Bases.A, description: 'Base monomer deleted.' },
    { monomer: Phosphates.P, description: 'Phosphate monomer deleted.' },
  ];

  for (const monomer of monomersToDelete) {
    test(`Open file from .ket and Delete ${monomer.monomer.alias} monomer`, async () => {
      await openFileAndAddToCanvasMacro(
        page,
        'KET/monomers-connected-with-bonds.ket',
      );
      await CommonLeftToolbar(page).selectEraseTool();
      await getMonomerLocator(page, monomer.monomer).click();
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
      await CommonLeftToolbar(page).selectEraseTool();
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
    await CommonLeftToolbar(page).selectEraseTool();
    await bondLine.click();
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
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
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
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
      await Library(page).dragMonomerOnCanvas(molecule.description, {
        x: -10,
        y: -10,
        fromCenter: true,
      });
      await CommonLeftToolbar(page).selectAreaSelectionTool(
        SelectionToolType.Rectangle,
      );
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
      await CommonLeftToolbar(page).selectAreaSelectionTool(
        SelectionToolType.Rectangle,
      );
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
      await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
      await getMonomerLocator(page, Sugars._25R).click();
      await pressEscapeWhenPullBond(page);
      await takeEditorScreenshot(page);

      // Reset to default
      await Library(page).openRNASection(RNASection.Presets);
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
    await CommonTopLeftToolbar(page).clearCanvas();
    await takeEditorScreenshot(page);
  });

  test('Open Sugar-Base-Phosphate from .ket file and press Clear canvas', async () => {
    /* 
    Test case: Clear Canvas tool
    Description: Canvas is cleared
    */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/monomers-connected-with-bonds.ket',
    );
    await CommonTopLeftToolbar(page).clearCanvas();
    await takeEditorScreenshot(page);
  });

  test('Save file with three Monomers as .ket file', async () => {
    /* 
    Test case: Open&save files
    Description: File saved with three Monomers as .ket file
    */
    // Reload needed as monomer IDs increment in prior tests, affecting data comparasion
    await reloadPageAndConfigureInitialState(page);
    await configureInitialState(page);

    await openFileAndAddToCanvasMacro(
      page,
      'KET/monomers-connected-with-bonds.ket',
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
      page,
      'KET/monomers-connected-with-bonds.ket',
    );
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
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

    await Library(page).rnaBuilder.expand();
    await Library(page).selectMonomer(Sugars._12ddR);
    await Library(page).rnaBuilder.selectBaseSlot();
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
      await Library(page).dragMonomerOnCanvas(monomer, {
        x: 0,
        y: 0,
        fromCenter: true,
      });

      await page.keyboard.press('Escape');
      await Library(page).openRNASection(RNASection.Nucleotides);
      await clickInTheMiddleOfTheScreen(page);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await dragMouseTo(x, y, page);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
      await CommonLeftToolbar(page).selectEraseTool();
      await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
        hideMacromoleculeEditorScrollBars: true,
      });
    });
  }

  test('Validate that chain with unsplit nucleotides looks correct on micro-mode canvas, on macro-flex, on macro-snake and squence canvas', async () => {
    /* 
    Test case: #4382
    Description: Chain with unsplit nucleotides looks correct on micro-mode canvas, on macro-flex, on macro-snake and squence canvas
    */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/chain-with-unsplit-nucleotides.ket',
    );
    await takeEditorScreenshot(page);
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
    await moveMouseAway(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await takeEditorScreenshot(page);
    await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
    await takeEditorScreenshot(page);

    // reset to default state
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
    await configureInitialState(page);
  });

  test('Validate that unsplit nucleotides in chain does not interrupt enumeration of RNA chain in flex mode', async () => {
    /* 
    Test case: #4382
    Description: Unsplit nucleotides in chain does not interrupt enumeration of RNA chain in flex mode
    */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/chain-with-unsplit-nucleotides.ket',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });

  test('Validate that unsplit nucleotides could be deleted from sequence', async () => {
    /* 
    Test case: #4382
    Description: unsplit nucleotides can be deleted from sequence
    */
    await openFileAndAddToCanvasMacro(
      page,
      'KET/chain-with-unsplit-nucleotides.ket',
    );
    await CommonLeftToolbar(page).selectEraseTool();
    await getMonomerLocator(page, Nucleotides.AmMC6T).click();
    await getMonomerLocator(page, { monomerAlias: 'Super G' }).click();
    await getMonomerLocator(page, { monomerAlias: '5-Bromo dU' }).click();
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
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
      const x = 300;
      const y = 500;

      await Library(page).dragMonomerOnCanvas(monomer, {
        x,
        y,
      });
      await page.keyboard.press('Escape');
      await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
      await moveMouseAway(page);
      await getMonomerLocator(page, monomer).hover();
      await waitForMonomerPreview(page);
      await takeEditorScreenshot(page);

      // Reset to default state
      await Library(page).openRNASection(RNASection.Presets);
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
      await Library(page).dragMonomerOnCanvas(monomer, {
        x: -10,
        y: -10,
        fromCenter: true,
      });
      await page.keyboard.press('Escape');
      await clickInTheMiddleOfTheScreen(page);
      await dragMouseTo(x, y, page);
      await moveMouseAway(page);
      await takeEditorScreenshot(page);
      await CommonTopLeftToolbar(page).undo();
      await takeEditorScreenshot(page);
      await CommonTopLeftToolbar(page).redo();
      await CommonLeftToolbar(page).selectEraseTool();
      await clickOnCanvas(page, x, y, { from: 'pageTopLeft' });
      await takeEditorScreenshot(page);
      await CommonTopLeftToolbar(page).undo();
      await takeEditorScreenshot(page);

      // Reset to default state
      await Library(page).openRNASection(RNASection.Presets);
    });
  }

  test('Validate it is not possible to create preset if Sugar is without R3 connection point (Base is selected and we select Sugar)', async () => {
    /* 
    Test case: https://github.com/epam/ketcher/issues/3816
    Description: It is not possible to create preset if Sugar is without R3 connection point.
    */
    await Library(page).rnaBuilder.expand();
    await Library(page).rnaBuilder.selectBaseSlot();
    await Library(page).selectMonomer(Bases.baA);
    await Library(page).rnaBuilder.selectSugarSlot();
    await takePresetsScreenshot(page);

    // Reset to default state
    await Library(page).rnaBuilder.collapse();
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

    await Library(page).addMonomerToFavorites(Presets.A);
    await Library(page).switchToFavoritesTab();
    await takeMonomerLibraryScreenshot(page);

    await Library(page).removeMonomerFromFavorites(Presets.A);
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

    await Library(page).setSearchValue('No monomers and presets');
    await Library(page).searchEditbox.blur();
    await takeMonomerLibraryScreenshot(page);

    await Library(page).switchToRNATab();
    await takeMonomerLibraryScreenshot(page);

    await Library(page).switchToCHEMTab();
    await takeMonomerLibraryScreenshot(page);

    // await rnaLibrarySearch.press('Escape');
    // Case 27 here. Dirty hack, can't believe I did it.
    const xCoordinate = 1241;
    const yCoordinate = 62;
    await clickOnCanvas(page, xCoordinate, yCoordinate, {
      from: 'pageTopLeft',
    });

    await Library(page).switchToRNATab();
    await takeMonomerLibraryScreenshot(page);

    await Library(page).switchToPeptidesTab();
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

    await Library(page).rnaBuilder.expand();
    await Library(page).selectMonomers([
      Sugars._25R,
      Bases.A,
      Phosphates.Test_6_Ph,
    ]);
    await Library(page).rnaBuilder.addToPresets();
    await Library(page).rnaBuilder.collapse();

    const customPreset = page.getByTestId('25R(A)Test-6-Ph_A_25R_Test-6-Ph');
    await ContextMenu(page, customPreset).click(
      LibraryPresetOption.DeletePreset,
    );
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
    await Library(page).hideLibrary();
    await takePageScreenshot(page);

    await Library(page).showLibrary();
    await takePageScreenshot(page);
  });

  test('Check that After reloading the page, monomers added to the Favorites section not disappear', async () => {
    /*
     *Test case: https://github.com/epam/ketcher/issues/4422 - Case 18
     *Description:
     *  Case 18:
     *    Check that After reloading the page, monomers added to the Favorites section not disappear
     */
    await Library(page).addMonomerToFavorites(Presets.A);
    await Library(page).switchToFavoritesTab();
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

    await Library(page).rnaBuilder.expand();
    await rnaNameEditBox.fill(rnaName);
    await takeRNABuilderScreenshot(page);

    for (let i = 0; i < rnaName.length; i++) {
      await rnaNameEditBox.press('Backspace');
    }
    await takeRNABuilderScreenshot(page);

    // Reset to default state
    await Library(page).rnaBuilder.collapse();
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
    await Library(page).openRNASection(RNASection.Sugars);
    await scrollAccordionContentToTheTop(page, RNASectionArea.Sugars);
    await Library(page).hoverMonomer(Sugars._12ddR);
    await waitForMonomerPreview(page);
    await takeMonomerLibraryScreenshot(page, { hideMonomerPreview: true });

    await Library(page).openRNASection(RNASection.Bases);
    await scrollAccordionContentToTheTop(page, RNASectionArea.Bases);
    await Library(page).hoverMonomer(Bases._2imen2);
    await waitForMonomerPreview(page);
    await takeMonomerLibraryScreenshot(page, { hideMonomerPreview: true });

    // await Library(page).openRNASection(RNASection.Phosphates);
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
    await clearLocalStorage(page);
    await reloadPageAndConfigureInitialState(page);

    await Library(page).rnaBuilder.expand();

    // Case 22
    await Library(page).chemTab.hover();
    await takeMonomerLibraryScreenshot(page);

    // Case 23
    await Library(page).selectMonomer(Chem.Test_6_Ch);
    await takeElementScreenshot(page, page.getByTestId(Chem.Test_6_Ch.testId), {
      maxDiffPixelRatio: 0.03,
      hideMonomerPreview: true,
    });
    await moveMouseAway(page);

    // Case 24
    await Library(page).hoverMonomer(Chem.SMPEG2);
    await waitForMonomerPreview(page);
    await takeMonomerLibraryScreenshot(page);
    await moveMouseAway(page);

    // Case 25
    await Library(page).setSearchValue('SMCC');
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
    await Library(page).newPreset();
    await expect(Library(page).rnaBuilder.cancelButton).toBeVisible();

    await Library(page).rnaBuilder.cancel();
  });

  interface ISearchString {
    testDescription: string;
    SearchString: string;
    // Location where searched monomer located (we have to go to that location to make sure it is where)
    ResultMonomerLocationTab: MonomerTypeLocation;
    // Set shouldFail to true if you expect test to fail because of existed bug and put issues link to issueNumber
    shouldFail?: boolean;
    // issueNumber is mandatory if shouldFail === true
    issueNumber?: string;
    // set pageReloadNeeded to true if you need to restart ketcher before test (f.ex. to restart font renderer)
    pageReloadNeeded?: boolean;
  }

  const IDTSearchStrings: ISearchString[] = [
    {
      testDescription: '1. Verify search by full IDT alias (5Br-dU)',
      SearchString: '5Br-dU',
      ResultMonomerLocationTab:
        monomerLibraryTypeLocation[MonomerType.Nucleotide],
    },
    {
      testDescription: '2. Verify search by part of IDT alias (itInd))',
      SearchString: 'itInd',
      ResultMonomerLocationTab:
        monomerLibraryTypeLocation[MonomerType.Nucleotide],
    },
    {
      testDescription: '3. Verify search with a single symbol /',
      SearchString: '/',
      ResultMonomerLocationTab:
        monomerLibraryTypeLocation[MonomerType.Nucleotide],
    },
    {
      testDescription:
        '4. Verify search with a specific ending symbol before the second / (hos/)',
      SearchString: 'hos/',
      ResultMonomerLocationTab:
        monomerLibraryTypeLocation[MonomerType.Phosphate],
    },
    {
      testDescription:
        '5. Verify no results when additional symbols are added after the second / (Ind/Am)',
      SearchString: 'Ind/Am',
      ResultMonomerLocationTab:
        monomerLibraryTypeLocation[MonomerType.Nucleotide],
    },
    {
      testDescription:
        '6. Verify case insensitivity of the search (/5SUPER-DT)',
      SearchString: '/5SUPER-DT',
      ResultMonomerLocationTab:
        monomerLibraryTypeLocation[MonomerType.Nucleotide],
      shouldFail: true,
      issueNumber: 'https://github.com/epam/ketcher/issues/5452',
    },
    {
      testDescription:
        '7. Verify search returns multiple monomers with the same starting symbol (Super))',
      SearchString: 'Super',
      ResultMonomerLocationTab:
        monomerLibraryTypeLocation[MonomerType.Nucleotide],
      shouldFail: true,
      issueNumber: 'https://github.com/epam/ketcher/issues/5452',
    },
    {
      testDescription:
        '8. Verify search returns multiple monomers that have endpoint3 modification (/3))',
      SearchString: '/3',
      ResultMonomerLocationTab:
        monomerLibraryTypeLocation[MonomerType.Nucleotide],
      shouldFail: true,
      issueNumber: 'https://github.com/epam/ketcher/issues/5452',
    },
    {
      testDescription:
        '9. Verify search returns multiple monomers that have endpoint5 modification (/5))',
      SearchString: '/5',
      ResultMonomerLocationTab:
        monomerLibraryTypeLocation[MonomerType.Nucleotide],
      shouldFail: true,
      issueNumber: 'https://github.com/epam/ketcher/issues/5452',
    },
    {
      testDescription:
        '10. Verify search returns multiple monomers that have internal modification (/i))',
      SearchString: '/i',
      ResultMonomerLocationTab:
        monomerLibraryTypeLocation[MonomerType.Nucleotide],
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
         * 0. Close RNA builder if it is opened
         * 1. Fill Search field with value
         * 2. Switch to monomer's tab to see it
         * 3. Take screenshot of the library to make sure search works
         */
        await Library(page).rnaBuilder.collapse();

        await Library(page).setSearchValue(IDTSearchString.SearchString);
        await Library(page).goToMonomerLocation(
          IDTSearchString.ResultMonomerLocationTab,
        );

        await Library(page).searchEditbox.blur();
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
      await Library(page).selectMonomer(Peptides.X);
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
      await Library(page).selectMonomer(Bases.DNA_N);
      await waitForMonomerPreview(page);
      await takeMonomerLibraryScreenshot(page);

      await Library(page).selectMonomer(Bases.RNA_N);
      await waitForMonomerPreview(page);
      await takeMonomerLibraryScreenshot(page);

      await Library(page).selectMonomer(Bases.M);
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
      ResultMonomerLocationTab: monomerLibraryTypeLocation[MonomerType.Peptide],
    },
    {
      testDescription:
        "2. Search 'Leucine' as component of ambiguous peptide (should be J ambiguous monomer)",
      SearchString: 'Leucine',
      ResultMonomerLocationTab: monomerLibraryTypeLocation[MonomerType.Peptide],
    },
    {
      testDescription: "3. Search 'W' ambiguous DNA and RNA bases",
      SearchString: 'W',
      ResultMonomerLocationTab: monomerLibraryTypeLocation[MonomerType.Base],
    },
    {
      testDescription:
        "4. Search 'Thymine'  as component of ambiguous DNA base",
      SearchString: 'Thymine',
      ResultMonomerLocationTab: monomerLibraryTypeLocation[MonomerType.Base],
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
        await Library(page).setSearchValue(
          AmbiguousMonomersSearchString.SearchString,
        );
        await Library(page).goToMonomerLocation(
          AmbiguousMonomersSearchString.ResultMonomerLocationTab,
        );
        await Library(page).searchEditbox.blur();
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
