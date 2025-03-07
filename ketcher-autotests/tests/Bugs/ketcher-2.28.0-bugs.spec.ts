/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@playwright/test';
import {
  AtomButton,
  clickInTheMiddleOfTheScreen,
  copyToClipboardByKeyboard,
  FunctionalGroups,
  MacroFileType,
  pasteFromClipboardAndAddToCanvas,
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
  selectSnakeLayoutModeTool,
  selectTopPanelButton,
  takeEditorScreenshot,
  TopPanelButton,
  waitForPageInit,
} from '@utils';
import {
  chooseFileFormat,
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
} from '@utils/macromolecules';

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
