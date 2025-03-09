/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Presets } from '@constants/monomers/Presets';
import { Page, test, expect } from '@playwright/test';
import {
  addMonomerToCenterOfCanvas,
  AtomButton,
  bondsSettings,
  clickInTheMiddleOfTheScreen,
  copyToClipboardByKeyboard,
  FunctionalGroups,
  getBondLengthValue,
  MacroFileType,
  MonomerType,
  openFileAndAddToCanvas,
  openSettings,
  pasteFromClipboardAndAddToCanvas,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  pasteFromClipboardByKeyboard,
  pressButton,
  resetZoomLevelToDefault,
  RingButton,
  selectAllStructuresOnCanvas,
  selectAtomInToolbar,
  selectClearCanvasTool,
  selectFlexLayoutModeTool,
  selectFunctionalGroups,
  selectRingButton,
  selectSequenceLayoutModeTool,
  selectSnakeLayoutModeTool,
  selectTopPanelButton,
  setBondLengthValue,
  takeEditorScreenshot,
  TopPanelButton,
  waitForPageInit,
} from '@utils';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import {
  chooseFileFormat,
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
  zoomWithMouseWheel,
} from '@utils/macromolecules';
import { getMonomerLocator } from '@utils/macromolecules/monomer';

declare global {
  interface Window {
    unsubscribeChangeEvent: () => void;
  }
}

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
  await page.evaluate(() => {
    window.unsubscribeChangeEvent = window.ketcher.editor.subscribe(
      'change',
      () => console.log('hello'),
    );
  });
  await selectFunctionalGroups(FunctionalGroups.CF3, page);
  await clickInTheMiddleOfTheScreen(page);
  await selectAtomInToolbar(AtomButton.Bromine, page);

  await clickInTheMiddleOfTheScreen(page);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });

  await page.evaluate(() => {
    if (window.unsubscribeChangeEvent) {
      window.unsubscribeChangeEvent();
      window.unsubscribeChangeEvent = () => {};
    }
  });
});

test(`Case 3: Ketcher doesn't trigger change event in macromolecule mode`, async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/6601 - Test case 3
   * Bug: https://github.com/epam/ketcher/issues/5618
   * Description: Exception when modifying a functional group after adding a ketcher editor subscription
   * Scenario:
   * 1. Go to Macro mode -> Sequence mode
   * 2. Execute ketcher.editor.subscribe("change", () => console.log("in change event")); in the console
   * 3. Type any text on the canvas (Sequence mode)
   * 4. Check the console to see if the change event is triggered
   */
  await selectSequenceLayoutModeTool(page);

  const consoleMessagePromise = page.waitForEvent(
    'console',
    (msg) => msg.text() === 'in change event',
  );

  await page.evaluate(() => {
    window.ketcher.editor.subscribe('change', () =>
      console.log('in change event'),
    );
  });

  await page.keyboard.press('A');

  const consoleMessage = await consoleMessagePromise;

  expect(consoleMessage.text()).toBe('in change event');

  await page.evaluate(() => {
    if (window.unsubscribeChangeEvent) {
      window.unsubscribeChangeEvent();
      window.unsubscribeChangeEvent = () => {};
    }
  });
});

test(`Case 5: In Snake mode, structure in HELM format does not open via Paste from clipboard`, async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/6601 - Test case 5
   * Bug: https://github.com/epam/ketcher/issues/5609
   * Description: In Snake mode, structure in HELM format does not open via Paste from clipboard
   * Scenario:
   * 1. Go to Macro mode -> the Snake mode
   * 2. Execute ketcher.editor.subscribe("change", () => console.log("in change event")); in the console
   * 3. Type any text щn the canvas (Sequence mode)
   * 4. Check the console to see if the change event is triggered
   */
  await selectSnakeLayoutModeTool(page);

  const errorMessages: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errorMessages.push(msg.text());
    }
  });

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'PEPTIDE1{C.[Apm].D.[dC].E}|PEPTIDE2{F.[D-gGlu].G.[D-Orn].I}$PEPTIDE1,PEPTIDE2,2:R3-2:R3|PEPTIDE2,PEPTIDE1,4:R3-4:R3$$$V2.0',
  );

  expect(errorMessages).toEqual([]);

  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test(`Case 6: When saving in SVG format, unsplit nucleotides, whose names consist of several rows, are left without part of the name`, async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/6601 - Test case 6
   * Bug: https://github.com/epam/ketcher/issues/5552
   * Description: When saving in SVG format, unsplit nucleotides, whose names consist of several rows, are left without part of the name
   * Scenario:
   * 1. Switch to the Macro mode – the Flex mode
   * 2. In the RNA tab in the “Nucleotides” section, select 5HydMe-dC, 2-Amino-dA, 5-Bromo dU and add them to the canvas
   * 3. Save them in the SVG file format
   * 4. Take a screenshot to validate the names are displayed correctly
   */
  await selectFlexLayoutModeTool(page);

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{[2-damdA].[5Br-dU].[5hMedC]}$$$$V2.0',
  );

  await selectTopPanelButton(TopPanelButton.Save, page);
  await chooseFileFormat(page, 'SVG Document');
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test(`Case 7: Hydrogens are not shown for single atoms in Macro mode (and for atom in bonds too)`, async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/6601 - Test case 7
   * Bug: https://github.com/epam/ketcher/issues/5675
   * Description: Hydrogens are not shown for single atoms in Macro mode (and for atom in bonds too)
   * Scenario:
   * 1. Put on Micro molecules canvas simple atoms (Li and C in my case)
   * 2. Switch to Macro mode
   * 3. Take a screenshot to validate hydrogens should be shown
   */
  await turnOnMicromoleculesEditor(page);
  await pasteFromClipboardAndAddToCanvas(page, '[LiH].C');
  await clickInTheMiddleOfTheScreen(page);
  await turnOnMacromoleculesEditor(page);

  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test(`Case 8: There is no bond in the Sequence mode`, async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/6601 - Test case 8
   * Bug: https://github.com/epam/ketcher/issues/4439
   * Description: There is no bond in the Sequence mode
   * Scenario:
   * 1. Load from HELM chain connected to side chain
   * 2. Switch to Sequence mode
   * 3. Take a screenshot to validate the bond should be shown
   */
  await selectSequenceLayoutModeTool(page);

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{R(C)P.RP.RP.R(C)P}|RNA2{R(G)P}$RNA2,RNA1,1:R1-6:R3$$$V2.0',
  );

  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test(`Case 9: In the Text-editing mode, after inserting a fragment at the end of the sequence, where there is a phosphate, the cursor does not blink`, async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/6601 - Test case 9
   * Bug: https://github.com/epam/ketcher/issues/4534
   * Description: In the Text-editing mode, after inserting a fragment at the end of the sequence, where there is a phosphate, the cursor does not blink
   * Scenario:
   * 1. Switch to the Macro mode – Flex mode
   * 2. Put T preset from the library select all and copy it to clipboard
   * 3. Switch to the Sequence mode - the Text-editing mode
   * 4. Enter any sequence (for example, UUU)
   * 5. Paste the copied preset to the end of the sequence
   * 6. Take a screenshot to validate the cursor blinks in the right place
   */
  await selectFlexLayoutModeTool(page);
  await addMonomerToCenterOfCanvas(page, Presets.T);
  await selectAllStructuresOnCanvas(page);
  await copyToClipboardByKeyboard(page);
  await selectClearCanvasTool(page);

  await selectSequenceLayoutModeTool(page);
  await page.keyboard.press('U');
  await page.keyboard.press('U');
  await page.keyboard.press('U');
  await page.keyboard.press('ArrowDown');
  await pasteFromClipboardByKeyboard(page);

  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test(`Case 10: System reset micromolecule canvas settings to default if switched to Macro mode and back`, async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/6601 - Test case 10
   * Bug: https://github.com/epam/ketcher/issues/5855
   * Description: System reset micromolecule canvas settings to default if switched to Macro mode and back
   * Scenario:
   * 1. Go to Micro
   * 2. Open Settings, Bond section
   * 3. Set Bond length to 80 and click Apply
   * 4. Switch to Macro mode
   * 5. Switch back to Micro mode again
   * 6. Open Settings, Bond section again
   * 7. Check if Bond length remains the same (80)
   */
  await turnOnMicromoleculesEditor(page);
  await openSettings(page);
  await bondsSettings(page);
  await setBondLengthValue(page, '80');
  await pressButton(page, 'Apply');

  await turnOnMacromoleculesEditor(page);
  await turnOnMicromoleculesEditor(page);
  await openSettings(page);
  await bondsSettings(page);
  const bondLengthValue = await getBondLengthValue(page);
  expect(bondLengthValue).toBe('80');
  await pressButton(page, 'Cancel');
});

test(`Case 12: Label shift problem for ambiguous monomers`, async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/6601 - Test case 12
   * Bug: https://github.com/epam/ketcher/issues/5982
   * Description: Label shift problem for ambiguous monomers
   * Scenario:
   * 1. Load from HELM ambiguous monomer
   * 2. Load from HELM one more ambiguous monomer
   * 3. Take a screenshot to validate Sugar label (Mod0) at center of monomer
   */
  await selectFlexLayoutModeTool(page);

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'PEPTIDE1{[O1[C@@H]%91[C@H](O)[C@H](O%92)[C@H]1CO%93.[*:3]%91.[*:1]%93.[*:2]%92 |$;;;;;;;;;_R3;_R1;_R2$|]}$$$$V2.0',
  );

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{[O1[C@@H]%91[C@H](O)[C@H](O%92)[C@H]1CO%93.[*:3]%91.[*:1]%93.[*:2]%92 |$;;;;;;;;;_R3;_R1;_R2$|]([C1(C2=C(N=CN=1)N%91C=N2)N.[*:1]%91 |$;;;;;;;;;;_R1$|])[P%91(O)(O)=O.[*:1]%91 |$;;;;_R1$|]}$$$$V2.0',
  );

  await zoomWithMouseWheel(page, -600);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test(`Case 13: Export to ket (and getKET function) change incrementally internal IDs every call`, async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/6601 - Test case 13
   * Bug: https://github.com/epam/ketcher/issues/5873
   * Description: Export to ket (and getKET function) change incrementally internal IDs every call
   * Scenario:
   * 1. Go to Micro mode
   * 2. Load from file: Export to ket (and getKET function) change incrementally internal IDs every call.ket
   * 3. Save the file as .ket
   * 4. Save the file as .ket again to validate the internal IDs remain the same
   */
  await turnOnMicromoleculesEditor(page);

  await openFileAndAddToCanvas(
    'KET/Bugs/Export to ket (and getKET function) change incrementally internal IDs every call.ket',
    page,
  );

  await verifyFileExport(
    page,
    'KET/Bugs/Export to ket (and getKET function) change incrementally internal IDs every call-expected.ket',
    FileType.KET,
  );

  await verifyFileExport(
    page,
    'KET/Bugs/Export to ket (and getKET function) change incrementally internal IDs every call-expected.ket',
    FileType.KET,
  );
});

test(`Case 14: Antisense of layout doesn't work on flex mode after load`, async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/6601 - Test case 13
   * Bug: https://github.com/epam/ketcher/issues/6109
   * Description: Antisense of layout doesn't work on flex mode after load
   * Scenario:
   * 1. Go to Macro mode -> Flex mode
   * 2. Load from HELM certain sequence
   * 3. Take a screenshot to validate antisense of layout works as expected
   */
  await selectFlexLayoutModeTool(page);

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{R(A)P}$$$$V2.0',
  );

  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test(`Case 16: Lets get back to U (instead of T) for the complementary base of A`, async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/6601 - Test case 13
   * Bug: https://github.com/epam/ketcher/issues/6115
   * Description: Lets get back to U (instead of T) for the complementary base of A
   * Scenario:
   * 1. Go to Macro mode -> Snake mode
   * 2. Load from HELM: A preset
   * 3. Select all monomers and click Create Antisense Strand from context menu
   * 4. Validate the complementary base of A is U
   */
  await selectFlexLayoutModeTool(page);

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{R(A)P}$$$$V2.0',
  );

  const baseA = getMonomerLocator(page, {
    monomerAlias: 'A',
    monomerType: MonomerType.Base,
  }).first();

  await selectAllStructuresOnCanvas(page);
  await baseA.click({ button: 'right', force: true });
  const createAntisenseStrandOption = page
    .getByTestId('create_antisense_chain')
    .first();

  await createAntisenseStrandOption.click();

  const baseU = getMonomerLocator(page, {
    monomerAlias: 'U',
    monomerType: MonomerType.Base,
  }).first();
  await expect(baseU).toHaveCount(1);
});
