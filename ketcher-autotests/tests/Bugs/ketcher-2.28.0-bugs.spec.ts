/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@playwright/test';
import {
  AtomButton,
  clickInTheMiddleOfTheScreen,
  copyToClipboardByKeyboard,
  FunctionalGroups,
  MacroFileType,
  MonomerType,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  pasteFromClipboardByKeyboard,
  resetZoomLevelToDefault,
  RingButton,
  selectAllStructuresOnCanvas,
  selectAtomInToolbar,
  selectClearCanvasTool,
  selectFlexLayoutModeTool,
  selectFunctionalGroups,
  selectRingButton,
  selectSequenceLayoutModeTool,
  selectSingleBondTool,
  selectSnakeLayoutModeTool,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import {
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
} from '@utils/macromolecules';
import {
  getAtomLocator,
  getMonomerLocator,
} from '@utils/macromolecules/monomer';
import { bondMonomerPointToMoleculeAtom } from '@utils/macromolecules/polymerBond';
import { clickOnSequenceSymbol } from '@utils/macromolecules/sequence';

let page: Page;

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();

  await waitForPageInit(page);
  await turnOnMacromoleculesEditor(page);
});

test.afterEach(async () => {
  await turnOnMacromoleculesEditor(page);
  await selectClearCanvasTool(page);
  await resetZoomLevelToDefault(page);
});

test.afterAll(async ({ browser }) => {
  await Promise.all(browser.contexts().map((context) => context.close()));
});

test(`Case 1: Copy/Cut-Paste functionality not working for microstructures in Macro mode`, async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/6601 - Test case 1
   * Bug: https://github.com/epam/ketcher/issues/4526
   * Description: Copy/Cut-Paste functionality not working for microstructures in Macro mode
   * Scenario:
   * 1. Add Benzene ring in Micro mode
   * 2. Switch to Macro -> Flex
   * 3. Try copy/paste and cut/paste actions
   * 4. Take a screenshot to validate the it works as expected (paste action should be successful)
   */
  await turnOnMicromoleculesEditor(page);
  await selectRingButton(RingButton.Benzene, page);
  await clickInTheMiddleOfTheScreen(page);

  await turnOnMacromoleculesEditor(page);
  await selectFlexLayoutModeTool(page);

  await clickInTheMiddleOfTheScreen(page);
  await selectAllStructuresOnCanvas(page);
  await copyToClipboardByKeyboard(page);
  await pasteFromClipboardByKeyboard(page);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test(`Case 2: Exception when modifying a functional group after adding a ketcher editor subscription`, async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/6601 - Test case 2
   * Bug: https://github.com/epam/ketcher/issues/5115
   * Description: Exception when modifying a functional group after adding a ketcher editor subscription
   * Scenario:
   * 1. Go to Micro mode
   * 2. Execute ketcher.editor.subscribe("change", () => console.log("hello")); in the console (or add any other change subscription)
   * 3. In the canvas, add a functional group such as "CF3"
   * 4. Click on another atom such as "Br" and click on the functional group
   * 5. Take a screenshot to validate the exception is not thrown and replacement is successful
   */
  await turnOnMicromoleculesEditor(page);
  await page.evaluate(() =>
    window.ketcher.editor.subscribe('change', () => console.log('hello')),
  );
  await selectFunctionalGroups(FunctionalGroups.CF3, page);
  await clickInTheMiddleOfTheScreen(page);
  await selectAtomInToolbar(AtomButton.Bromine, page);

  await clickInTheMiddleOfTheScreen(page);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test(`Case 3: Connection between molecule and monomer does not affect an amount of implicit hydrogens`, async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/6601 - Test case 3
   * Bug: https://github.com/epam/ketcher/issues/6021
   * Description: Connection between molecule and monomer does not affect an amount of implicit hydrogens
   * Scenario:
   * 1. Go to Molecules mode
   * 2. Create any molecule with implicit hydrogen in any atom label
   * 3. Go to Macromolecules mode
   * 4. Add any monomer to canvas
   * 5. Validate that atom label has 3 implicit hydrogens
   * 6. Connect monomer to molecule's atom with implicit hydrogen in label
   * 7. Validate that atom label has 2 implicit hydrogens
   */
  await turnOnMicromoleculesEditor(page);
  await selectAtomInToolbar(AtomButton.Phosphorus, page);
  await clickInTheMiddleOfTheScreen(page);

  await turnOnMacromoleculesEditor(page);
  await selectFlexLayoutModeTool(page);
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'PEPTIDE1{A}$$$$V2.0',
  );

  const leftPeptideLocator = getMonomerLocator(page, {
    monomerAlias: 'A',
  }).first();

  const rightMoleculeLocator = getAtomLocator(page, {
    atomAlias: 'P',
  }).first();

  const atomLabelBefore = await rightMoleculeLocator.textContent();
  expect(atomLabelBefore).toBe('PH3');

  await bondMonomerPointToMoleculeAtom(
    page,
    leftPeptideLocator,
    rightMoleculeLocator,
    'R2',
  );

  const atomLabelAfter = await rightMoleculeLocator.textContent();
  expect(atomLabelAfter).toBe('PH2');
});

test(`Case 4: Side chain attachment point shown in wrong place in Snake mode`, async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/6601 - Test case 4
   * Bug: https://github.com/epam/ketcher/issues/6022
   * Description: Side chain attachment point shown in wrong place in Snake mode
   * Scenario:
   * 1. Go to Macro - Snake mode
   * 2. Put on the canvas A preset
   * 3. Turn on Bond tool
   * 4. Hover mouse cursor over base
   * 5. Take a screenshot to validate the side chain attachment point is shown in the right place
   */
  await turnOnMacromoleculesEditor(page);
  await selectSnakeLayoutModeTool(page);
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{R(A)P}$$$$V2.0',
  );

  await selectSingleBondTool(page);
  const baseLocator = getMonomerLocator(page, {
    monomerAlias: 'A',
    monomerType: MonomerType.Base,
  }).first();

  await baseLocator.hover({ force: true });
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test(`Case 5: When pressing Enter, a user can create new sequences in the “Modify RNA Builder” mode`, async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/6601 - Test case 5
   * Bug: https://github.com/epam/ketcher/issues/4723
   * Description: When pressing Enter, a user can create new sequences in the “Modify RNA Builder” mode
   * Scenario:
   * 1. Switch to the Macro mode – the Sequence mode
   * 2. Add a sequence of letters and select any
   * 3. Right-click on selected letters and choose the “Modify in RNA Builder” option
   * 4. Press the “Enter” key
   * 5. Enter letters
   * 6. Take a screenshot to validate user can not create new sequences in the “Modify RNA Builder” mode
   */
  await turnOnMacromoleculesEditor(page);
  await selectSequenceLayoutModeTool(page);
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{R(U)P.R(U)P.R(U)}$$$$V2.0',
  );

  await selectAllStructuresOnCanvas(page);
  await clickOnSequenceSymbol(page, 'U');
  await clickOnSequenceSymbol(page, 'U', { button: 'right' });
  await page.getByTestId('modify_in_rna_builder').click();

  await page.keyboard.press('Enter');
  await page.keyboard.type('AAA');

  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});
