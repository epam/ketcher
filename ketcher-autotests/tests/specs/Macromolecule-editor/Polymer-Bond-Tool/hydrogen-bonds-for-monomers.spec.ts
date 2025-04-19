/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvasMacro,
  moveMouseAway,
  dragMouseTo,
  waitForPageInit,
  resetZoomLevelToDefault,
  selectSnakeLayoutModeTool,
  selectFlexLayoutModeTool,
  openFileAndAddToCanvasAsNewProject,
  waitForRender,
  selectAllStructuresOnCanvas,
  copyToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  selectSequenceLayoutModeTool,
  ZoomOutByKeyboard,
} from '@utils';
import { zoomWithMouseWheel } from '@utils/macromolecules';
import {
  bondTwoMonomersPointToPoint,
  getBondLocator,
} from '@utils/macromolecules/polymerBond';
import {
  pressRedoButton,
  pressUndoButton,
  selectClearCanvasTool,
} from '@tests/pages/common/TopLeftToolbar';
import {
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
} from '@tests/pages/common/TopRightToolbar';
import {
  bondSelectionTool,
  commonLeftToolbarLocators,
  selectEraseTool,
  selectHandTool,
} from '@tests/pages/common/CommonLeftToolbar';
import {
  MacroBondDataIds,
  MacroBondType,
} from '@tests/pages/constants/bondSelectionTool/Constants';

let page: Page;
test.setTimeout(40000);
test.describe.configure({ retries: 0 });

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();
  await waitForPageInit(page);
  await turnOnMacromoleculesEditor(page);
});

test.afterEach(async () => {
  await selectClearCanvasTool(page);
  await resetZoomLevelToDefault(page);
});

test.afterAll(async ({ browser }) => {
  await Promise.all(browser.contexts().map((context) => context.close()));
});

interface IMonomer {
  monomerType: string;
  fileName: string;
  alias: string;
  // Set shouldFail to true if you expect test to fail because of existed bug and put issues link to issueNumber
  shouldFail?: boolean;
  // issueNumber is mandatory if shouldFail === true
  issueNumber?: string;
}

/*
 * According to Ljubica Milovic only
 * 1. Peptide
 * 2. Ambiguous peptide
 * 5. Base
 * 6. Ambiguous base
 * 9. Unsplit nucleotide
 * 12. Unresolved monomer
 * has high chances to be connected by hydrogen bonds, so I commented out all the rest to minimize number of combinatory tests
 */
const monomers: { [monomerName: string]: IMonomer } = {
  Peptide: {
    monomerType: 'peptide',
    fileName: 'KET/Hydrogen-bonds/Monomer-templates/1. Peptide.ket',
    alias: 'A',
  },
  'Ambiguous Peptide': {
    monomerType: 'ambiguous peptide',
    fileName: 'KET/Hydrogen-bonds/Monomer-templates/2. Ambiguous peptide.ket',
    alias: '%',
  },
  // Sugar: {
  //   monomerType: 'sugar',
  //   fileName: 'KET/Hydrogen-bonds/Monomer-templates/3. Sugar.ket',
  //   alias: 'R',
  // },
  // 'Ambiguous sugar': {
  //   monomerType: 'ambiguous sugar',
  //   fileName: 'KET/Hydrogen-bonds/Monomer-templates/4. Ambiguous sugar.ket',
  //   alias: '%',
  // },
  Base: {
    monomerType: 'base',
    fileName: 'KET/Hydrogen-bonds/Monomer-templates/5. Base.ket',
    alias: 'A',
  },
  'Ambiguous base': {
    monomerType: 'ambiguous base',
    fileName: 'KET/Hydrogen-bonds/Monomer-templates/6. Ambiguous base.ket',
    alias: '%',
  },
  // Phosphate: {
  //   monomerType: 'phosphate',
  //   fileName: 'KET/Hydrogen-bonds/Monomer-templates/7. Phosphate.ket',
  //   alias: 'P',
  // },
  // 'Ambiguous phosphate': {
  //   monomerType: 'ambiguous phosphate',
  //   fileName: 'KET/Hydrogen-bonds/Monomer-templates/8. Ambiguous phosphate.ket',
  //   alias: '%',
  // },
  'Unsplit nucleotide': {
    monomerType: 'nucleotide',
    fileName: 'KET/Hydrogen-bonds/Monomer-templates/9. Unsplit nucleotide.ket',
    alias: '5hMedC',
  },
  // CHEM: {
  //   monomerType: 'CHEM',
  //   fileName: 'KET/Hydrogen-bonds/Monomer-templates/10. CHEM.ket',
  //   alias: '4aPEGMal',
  // },
  // 'Ambiguous CHEM': {
  //   monomerType: 'Ambiguous CHEM',
  //   fileName: 'KET/Hydrogen-bonds/Monomer-templates/11. Ambiguous CHEM.ket',
  //   alias: '%',
  // },
  'Unresolved monomer': {
    monomerType: 'unresolved monomer',
    fileName: 'KET/Hydrogen-bonds/Monomer-templates/12. Unresolved monomer.ket',
    alias: 'Unknown',
  },
};

async function loadTwoMonomers(
  page: Page,
  leftMonomer: IMonomer,
  rightMonomer: IMonomer,
) {
  await openFileAndAddToCanvasMacro(leftMonomer.fileName, page);

  const canvasLocator = page.getByTestId('ketcher-canvas').first();

  const leftMonomerLocator = canvasLocator
    .getByText(leftMonomer.alias, { exact: true })
    .locator('..')
    .first();

  await leftMonomerLocator.hover({ force: true });
  await dragMouseTo(500, 370, page);
  await moveMouseAway(page);

  await openFileAndAddToCanvasMacro(rightMonomer.fileName, page);

  const rightMonomerLocator =
    (await canvasLocator
      .getByText(leftMonomer.alias, {
        exact: true,
      })
      .count()) > 1
      ? canvasLocator
          .getByText(rightMonomer.alias, { exact: true })
          .nth(1)
          .locator('..')
          .first()
      : canvasLocator
          .getByText(rightMonomer.alias, { exact: true })
          .locator('..')
          .first();

  await rightMonomerLocator.hover({ force: true });
  // Do NOT put monomers to equel X or Y coordinates - connection line element become zero size (width or hight) and .hover() doesn't work
  await dragMouseTo(600, 372, page);
  await moveMouseAway(page);
}

async function bondTwoMonomersByCenterToCenter(
  page: Page,
  leftMonomer: IMonomer,
  rightMonomer: IMonomer,
  bondType?: MacroBondType,
) {
  const canvasLocator = page.getByTestId('ketcher-canvas').first();

  let leftMonomerLocator = canvasLocator
    .getByText(leftMonomer.alias, { exact: true })
    .locator('..')
    .first();

  let monomerId = await leftMonomerLocator.getAttribute('data-monomerid');
  if (monomerId === null) {
    monomerId = await leftMonomerLocator
      .locator('..')
      .getAttribute('data-monomerid');
  }
  leftMonomerLocator = page.locator(
    `[data-testid="monomer"][data-monomerid="${monomerId}"]`,
  );

  let rightMonomerLocator =
    (await canvasLocator
      .getByText(leftMonomer.alias, { exact: true })
      .count()) > 1
      ? canvasLocator
          .getByText(rightMonomer.alias, { exact: true })
          .nth(1)
          .locator('..')
          .first()
      : canvasLocator
          .getByText(rightMonomer.alias, { exact: true })
          .locator('..')
          .first();

  // atom has alias that depend on attached bond - it could be "BrH" if no bonds and "Br" if one bond attached,
  // this is why we have to false exact for atoms
  if (rightMonomer.monomerType === 'atom') {
    const atomId = await rightMonomerLocator.getAttribute('data-atomid');
    rightMonomerLocator = page.locator(
      `[data-testid="atom"][data-atomid="${atomId}"]`,
    );
  }

  await bondTwoMonomersPointToPoint(
    page,
    leftMonomerLocator,
    rightMonomerLocator,
    undefined,
    undefined,
    bondType,
  );
}

async function hoverOverConnectionLine(page: Page) {
  const bondLine = getBondLocator(page, {
    bondType: MacroBondDataIds.Hydrogen,
  }).first();
  await bondLine.hover({ force: true });
}

async function callContexMenuOverConnectionLine(page: Page) {
  const bondLine = getBondLocator(page, {
    bondType: MacroBondDataIds.Hydrogen,
  }).first();
  await bondLine.click({ button: 'right', force: true });
}

async function clickOnConnectionLine(page: Page) {
  const bondLine = getBondLocator(page, {
    bondType: MacroBondDataIds.Hydrogen,
  }).first();
  await bondLine.click({ force: true });
}

Object.values(monomers).forEach((leftMonomer) => {
  Object.values(monomers).forEach((rightMonomer) => {
    /*
     *  Test task: https://github.com/epam/ketcher/issues/5984
     *  Description: 1. Verify that user can establish hydrogen bonds between two monomers not connected via a single bond
     *               2. Verify that hydrogen bonds are highlighted along with monomers when hovered over
     *               3. Verify that no "Edit Connection Points" dialog appears for hydrogen bonds
     *  Case: For each %monomerType% from the library (leftMonomers)
     *          For each %monomerType% from the library (rightMonomers) do
     *              1. Clear canvas
     *              2. Load %leftMonomer% and %rigthMonomere% and put them on the canvas
     *              3. Establish hydrogen connection between %leftMonomer%(center) and %rightMonomer%(center)
     *              4. Hover mouse cursor over connection line
     *              5. Call right-click context menu to make sure it is absent
     *              6. Take screenshot to witness established connection and bond selection
     */
    test(`1. Connect with hydrogen bond ${leftMonomer.monomerType}(${leftMonomer.alias}) and ${rightMonomer.monomerType}(${rightMonomer.alias})`, async () => {
      test.setTimeout(25000);

      await loadTwoMonomers(page, leftMonomer, rightMonomer);

      await bondTwoMonomersByCenterToCenter(
        page,
        leftMonomer,
        rightMonomer,
        MacroBondType.Hydrogen,
      );

      await zoomWithMouseWheel(page, -600);
      await hoverOverConnectionLine(page);

      await callContexMenuOverConnectionLine(page);

      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
      });
    });
  });
});

const monomersWithNoFreeConnectionPoint: { [monomerName: string]: IMonomer } = {
  Peptide: {
    monomerType: 'peptide',
    fileName:
      'KET/Hydrogen-bonds/Monomer-templates-no-free-connection-points/1. Peptide with no free connection points.ket',
    alias: 'A',
  },
  'Ambiguous Peptide': {
    monomerType: 'ambiguous peptide',
    fileName:
      'KET/Hydrogen-bonds/Monomer-templates-no-free-connection-points/2. Ambiguous peptide with no free connection points.ket',
    alias: '%',
  },
  Sugar: {
    monomerType: 'sugar',
    fileName:
      'KET/Hydrogen-bonds/Monomer-templates-no-free-connection-points/3. Sugar with no free connection points.ket',
    alias: 'R',
  },
  'Ambiguous sugar': {
    monomerType: 'ambiguous sugar',
    fileName:
      'KET/Hydrogen-bonds/Monomer-templates-no-free-connection-points/4. Ambiguous sugar with no free connection points.ket',
    alias: '%',
  },
  Base: {
    monomerType: 'base',
    fileName:
      'KET/Hydrogen-bonds/Monomer-templates-no-free-connection-points/5. Base with no free connection points.ket',
    alias: 'A',
  },
  'Ambiguous base': {
    monomerType: 'ambiguous base',
    fileName:
      'KET/Hydrogen-bonds/Monomer-templates-no-free-connection-points/6. Ambiguous base with no free connection points.ket',
    alias: '%',
  },
  Phosphate: {
    monomerType: 'phosphate',
    fileName:
      'KET/Hydrogen-bonds/Monomer-templates-no-free-connection-points/7. Phosphate with no free connection points.ket',
    alias: 'P',
  },
  'Ambiguous phosphate': {
    monomerType: 'ambiguous phosphate',
    fileName:
      'KET/Hydrogen-bonds/Monomer-templates-no-free-connection-points/8. Ambiguous phosphate with no free connection points.ket',
    alias: '%',
  },
  'Unsplit nucleotide': {
    monomerType: 'nucleotide',
    fileName:
      'KET/Hydrogen-bonds/Monomer-templates-no-free-connection-points/9. Unsplit nucleotide with no free connection points.ket',
    alias: '5hMedC',
  },
  CHEM: {
    monomerType: 'CHEM',
    fileName:
      'KET/Hydrogen-bonds/Monomer-templates-no-free-connection-points/10. CHEM with no free connection points.ket',
    alias: '4aPEGMal',
  },
  'Ambiguous CHEM': {
    monomerType: 'Ambiguous CHEM',
    fileName:
      'KET/Hydrogen-bonds/Monomer-templates-no-free-connection-points/11. Ambiguous CHEM with no free connection points.ket',
    alias: '%',
  },
  'Unresolved monomer': {
    monomerType: 'unresolved monomer',
    fileName:
      'KET/Hydrogen-bonds/Monomer-templates-no-free-connection-points/12. Unresolved monomer with no free connection points.ket',
    alias: 'Unknown',
  },
};

Object.values(monomersWithNoFreeConnectionPoint).forEach((leftMonomer) => {
  Object.values(monomersWithNoFreeConnectionPoint).forEach((rightMonomer) => {
    /*
     *  Test task: https://github.com/epam/ketcher/issues/5984
     *  Description: Verify that hydrogen bonds don't require attachment points and can be established multiple times for one monomer
     *  Case: For each %monomerType% from the library (leftMonomers)
     *          For each %monomerType% from the library (rightMonomers) do
     *              1. Clear canvas
     *              2. Load %leftMonomer% and %rigthMonomere% and put them on the canvas
     *              3. Establish hydrogen connection between %leftMonomer%(center) and %rightMonomer%(center)
     *              4. Take screenshot to witness established connection
     */
    // eslint-disable-next-line max-len
    test(`2. Connect with hydrogen bond ${leftMonomer.monomerType}(${leftMonomer.alias}) and ${rightMonomer.monomerType}(${rightMonomer.alias}) having them no free connection points`, async () => {
      test.setTimeout(25000);

      await loadTwoMonomers(page, leftMonomer, rightMonomer);

      await bondTwoMonomersByCenterToCenter(
        page,
        leftMonomer,
        rightMonomer,
        MacroBondType.Hydrogen,
      );

      const bondLine = getBondLocator(page, {
        bondType: MacroBondDataIds.Hydrogen,
      });

      expect(await bondLine.count()).toEqual(1);
    });
  });
});

Object.values(monomers).forEach((leftMonomer) => {
  Object.values(monomers).forEach((rightMonomer) => {
    /*
     *  Test task: https://github.com/epam/ketcher/issues/5984
     *  Description: 1. Verify that only one hydrogen bond can be established between two monomers
     *               2. Verify error message when trying to establish multiple hydrogen bonds between
     *                  the same two monomers(error message: "Unable to establish multiple hydrogen bonds between two monomers
     *  Case: For each %monomerType% from the library (leftMonomers)
     *          For each %monomerType% from the library (rightMonomers) do
     *              1. Clear canvas
     *              2. Load %leftMonomer% and %rigthMonomere% and put them on the canvas
     *              3. Establish hydrogen connection between %leftMonomer%(center) and %rightMonomer%(center)
     *              4. Establish hydrogen connection between %leftMonomer%(center) and %rightMonomer%(center) one more time
     *              5. Take screenshot to witness error message
     */
    test(`3. Connect with hydrogen bond ${leftMonomer.monomerType}(${leftMonomer.alias}) and ${rightMonomer.monomerType}(${rightMonomer.alias}) twice`, async () => {
      test.setTimeout(25000);

      await loadTwoMonomers(page, leftMonomer, rightMonomer);

      await bondTwoMonomersByCenterToCenter(
        page,
        leftMonomer,
        rightMonomer,
        MacroBondType.Hydrogen,
      );

      await bondTwoMonomersByCenterToCenter(
        page,
        leftMonomer,
        rightMonomer,
        MacroBondType.Hydrogen,
      );

      await zoomWithMouseWheel(page, -600);

      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
      });
    });
  });
});

async function chooseConnectionPointsInConnectionDialog(
  page: Page,
  leftMonomerConnectionPointName: string,
  rightMonomerConnectionPointName: string,
) {
  const connectionPointDialog = page.getByRole('dialog');
  if (await connectionPointDialog.isVisible()) {
    await page.getByTitle(leftMonomerConnectionPointName).first().click();

    (await page.getByTitle(rightMonomerConnectionPointName).count()) > 1
      ? await page.getByTitle(rightMonomerConnectionPointName).nth(1).click()
      : await page.getByTitle(rightMonomerConnectionPointName).first().click();

    const connectButton = page.getByTitle('Connect').first();
    await connectButton.click();
  }
}

Object.values(monomers).forEach((leftMonomer) => {
  Object.values(monomers).forEach((rightMonomer) => {
    /*
     *  Test task: https://github.com/epam/ketcher/issues/5984
     *  Description: Verify error message when trying to establish hydrogen bond between monomers
     *               connected by a single bond(an error message: "Unable to establish a hydrogen bond between two monomers connected with a single bond.)
     *  Case: For each %monomerType% from the library (leftMonomers)
     *          For each %monomerType% from the library (rightMonomers) do
     *              1. Clear canvas
     *              2. Load %leftMonomer% and %rigthMonomere% and put them on the canvas
     *              3. Establish single bond connection between %leftMonomer%(center) and %rightMonomer%(center)
     *              4. Close error message (if appear): You have connected monomers with attachment points of the same group
     *              5. Establish hydrogen connection between %leftMonomer%(center) and %rightMonomer%(center)
     *              5. Validate error message
     */
    // eslint-disable-next-line max-len
    test(`4. Connect with hydrogen bond ${leftMonomer.monomerType}(${leftMonomer.alias}) and ${rightMonomer.monomerType}(${rightMonomer.alias}) already connected with single bond`, async () => {
      test.setTimeout(25000);

      const errorTooltip = page.getByTestId('error-tooltip').first();
      const errorTooltipCloseButton = page
        .locator('#error-tooltip')
        .getByRole('button')
        .first();

      await loadTwoMonomers(page, leftMonomer, rightMonomer);

      await bondTwoMonomersByCenterToCenter(
        page,
        leftMonomer,
        rightMonomer,
        MacroBondType.Single,
      );

      await chooseConnectionPointsInConnectionDialog(page, 'R1', 'R1');

      if (await errorTooltip.isVisible()) {
        // closing error message (if appear): You have connected monomers with attachment points of the same group
        await errorTooltipCloseButton.click();
        await errorTooltip.waitFor({ state: 'detached' });
      }

      await bondTwoMonomersByCenterToCenter(
        page,
        leftMonomer,
        rightMonomer,
        MacroBondType.Hydrogen,
      );

      // Error message is wrong because of a bug!
      // it should be "Unable to establish a hydrogen bond between two monomers connected with a single bond"
      await expect(errorTooltip).toHaveText(
        "There can't be more than 1 bond between the first and the second monomer",
      );

      if (await errorTooltip.isVisible()) {
        await errorTooltipCloseButton.click();
        await errorTooltip.waitFor({ state: 'detached' });
      }

      test.fixme(
        // eslint-disable-next-line no-self-compare
        true === true,
        `That test results are wrong because of https://github.com/epam/ketcher/issues/5934 issue(s).`,
      );
    });
  });
});

Object.values(monomers).forEach((leftMonomer) => {
  Object.values(monomers).forEach((rightMonomer) => {
    /*
     *  Test task: https://github.com/epam/ketcher/issues/5984
     *  Description: Verify that hydrogen bonds behave as side-chain connections for layout purposes
     *  Case: For each %monomerType% from the library (leftMonomers)
     *          For each %monomerType% from the library (rightMonomers) do
     *              1. Clear canvas
     *              2. Load %leftMonomer% and %rigthMonomere% and put them on the canvas
     *              3. Establish hydrogen connection between %leftMonomer%(center) and %rightMonomer%(center)
     *              4. Switch mode to Snake
     *              5. Take screenshot to witness layout (hydrogen connection should be considered as side-chain)
     *              6. Switch mode back to Flex for backward compatibility
     */
    test(`5. Connect with hydrogen bond ${leftMonomer.monomerType}(${leftMonomer.alias}) and ${rightMonomer.monomerType}(${rightMonomer.alias}) and switch to Snake`, async () => {
      test.setTimeout(25000);

      await loadTwoMonomers(page, leftMonomer, rightMonomer);

      await bondTwoMonomersByCenterToCenter(
        page,
        leftMonomer,
        rightMonomer,
        MacroBondType.Hydrogen,
      );

      await zoomWithMouseWheel(page, -600);

      await selectSnakeLayoutModeTool(page);

      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
      });

      await selectFlexLayoutModeTool(page);
    });
  });
});

async function callContexMenu(page: Page, locatorText: string) {
  const canvasLocator = page.getByTestId('ketcher-canvas');
  await canvasLocator.getByText(locatorText, { exact: true }).click({
    button: 'right',
  });
}

async function expandMonomer(page: Page, locatorText: string) {
  await callContexMenu(page, locatorText);
  await waitForRender(page, async () => {
    await page.getByText('Expand monomer').click();
  });
}

async function collapseMonomer(page: Page) {
  // await clickInTheMiddleOfTheScreen(page, 'right');
  const canvasLocator = page.getByTestId('ketcher-canvas');
  const attachmentPoint = canvasLocator
    .getByText('R1', { exact: true })
    .first();

  if (await attachmentPoint.isVisible()) {
    await attachmentPoint.click({
      button: 'right',
    });
  } else {
    await canvasLocator.getByText('R2', { exact: true }).first().click({
      button: 'right',
    });
  }
  await waitForRender(page, async () => {
    await page.getByText('Collapse monomer').click();
  });
}

const expandableMonomersWithHydrogenBonds: IMonomer[] = [
  {
    monomerType: 'peptide',
    fileName:
      'KET/Hydrogen-bonds/Monomer-templates-hydrogen-bonds/1. Peptide with hydrogen bonds.ket',
    alias: 'A',
  },
  {
    monomerType: 'sugar',
    fileName:
      'KET/Hydrogen-bonds/Monomer-templates-hydrogen-bonds/2. Sugar with hydrogen bonds.ket',
    alias: 'R',
  },
  {
    monomerType: 'base',
    fileName:
      'KET/Hydrogen-bonds/Monomer-templates-hydrogen-bonds/3. Base with hydrogen bonds.ket',
    alias: 'nC6n5C',
  },
  {
    monomerType: 'phosphate',
    fileName:
      'KET/Hydrogen-bonds/Monomer-templates-hydrogen-bonds/4. Phosphate  with hydrogen bonds.ket',
    alias: 'P',
  },
  {
    monomerType: 'unsplit nucleotide',
    fileName:
      'KET/Hydrogen-bonds/Monomer-templates-hydrogen-bonds/5. Unsplit nucleotide with hydrogen bonds.ket',
    alias: '5hMedC',
  },
  {
    monomerType: 'CHEM',
    fileName:
      'KET/Hydrogen-bonds/Monomer-templates-hydrogen-bonds/6. CHEM with hydrogen bonds.ket',
    alias: '4aPEGMal',
  },
];

expandableMonomersWithHydrogenBonds.forEach((monomer, index) => {
  test(`6.${index + 1} Expand and collapse ${monomer.monomerType}(${
    monomer.alias
  }) having it hydrogen bonds on Molecules canvas`, async () => {
    /*
     *  Test task: https://github.com/epam/ketcher/issues/5984
     *  Description: 1. Verify that switching from macromolecules mode to small molecules mode hides hydrogen bonds if monomer got expanded
     *               2. Verify that switching back to macromolecules mode restores the hydrogen bonds after monomer got collapsed
     *  Case: For each expandable monomer type from the library
     *          1. Clear canvas
     *          2. Load target monomer (surrounded by others) on the molecules canvas (micromolecules canvas)
     *          3. Take screenshot to witness initial state
     *          3. Expand target monomer (ignoring others)
     *          4. Take screenshot to witness hydrogen bonds got hidden
     *          5. Collapce target monomer back
     *          6. Take screenshot to witness hydrogen bonds got shown
     */
    await turnOnMicromoleculesEditor(page);
    await openFileAndAddToCanvasAsNewProject(monomer.fileName, page);
    await takeEditorScreenshot(page);
    await expandMonomer(page, monomer.alias);
    await takeEditorScreenshot(page);
    await collapseMonomer(page);
    await takeEditorScreenshot(page);

    await turnOnMacromoleculesEditor(page);
    // Test should be skipped if related bug exists
    test.fixme(
      monomer.shouldFail === true,
      `That test results are wrong because of ${monomer.issueNumber} issue(s).`,
    );
  });
});

Object.values(monomers).forEach((leftMonomer) => {
  Object.values(monomers).forEach((rightMonomer) => {
    /*
     *  Test task: https://github.com/epam/ketcher/issues/5984
     *  Description: Verify undo/redo functionality when adding or removing hydrogen bonds in macromolecules mode
     *  Case: For each %monomerType% from the library (leftMonomers)
     *          For each %monomerType% from the library (rightMonomers) do
     *              1. Clear canvas
     *              2. Load %leftMonomer% and %rigthMonomere% and put them on the canvas
     *              3. Establish hydrogen connection between %leftMonomer%(center) and %rightMonomer%(center)
     *              4. Take screenshot to witness established connection and bond selection
     *              5. Press Undo button
     *              6. Take screenshot to witness hydrigen connection got removed
     *              7. Press Redo button
     *              8. Take screenshot to witness hydrigen connection got removed
     */
    test(`7. Try Undo/Redo on hydrogen bond between ${leftMonomer.monomerType}(${leftMonomer.alias}) and ${rightMonomer.monomerType}(${rightMonomer.alias})`, async () => {
      test.setTimeout(25000);

      await loadTwoMonomers(page, leftMonomer, rightMonomer);

      await bondTwoMonomersByCenterToCenter(
        page,
        leftMonomer,
        rightMonomer,
        MacroBondType.Hydrogen,
      );

      await zoomWithMouseWheel(page, -600);

      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
      });

      await pressUndoButton(page);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
      });

      await pressRedoButton(page);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
      });
    });
  });
});

Object.values(monomers).forEach((leftMonomer) => {
  Object.values(monomers).forEach((rightMonomer) => {
    /*
     *  Test task: https://github.com/epam/ketcher/issues/5984
     *  Description: Verify deleting functionality of hydrogen bonds in macromolecules mode
     *  Case: For each %monomerType% from the library (leftMonomers)
     *          For each %monomerType% from the library (rightMonomers) do
     *              1. Clear canvas
     *              2. Load %leftMonomer% and %rigthMonomere% and put them on the canvas
     *              3. Establish hydrogen connection between %leftMonomer%(center) and %rightMonomer%(center)
     *              4. Take screenshot to witness established connection
     *              5. Press Erase button
     *              6. Click on hydrogen bond to delete it
     *              7. Take screenshot to witness hydrigen connection got removed
     */
    test(`8. Delete of hydrogen bond between ${leftMonomer.monomerType}(${leftMonomer.alias}) and ${rightMonomer.monomerType}(${rightMonomer.alias})`, async () => {
      test.setTimeout(25000);

      await loadTwoMonomers(page, leftMonomer, rightMonomer);

      await bondTwoMonomersByCenterToCenter(
        page,
        leftMonomer,
        rightMonomer,
        MacroBondType.Hydrogen,
      );

      const bondLine = getBondLocator(page, {
        bondType: MacroBondDataIds.Hydrogen,
      });

      expect(await bondLine.count()).toEqual(1);

      await selectEraseTool(page);
      await clickOnConnectionLine(page);

      expect(await bondLine.count()).toEqual(0);
    });
  });
});

Object.values(monomers).forEach((leftMonomer) => {
  Object.values(monomers).forEach((rightMonomer) => {
    /*
     *  Test task: https://github.com/epam/ketcher/issues/5984
     *  Description: Verify deleting functionality of hydrogen bonds in macromolecules mode
     *  Case: For each %monomerType% from the library (leftMonomers)
     *          For each %monomerType% from the library (rightMonomers) do
     *              1. Clear canvas
     *              2. Load %leftMonomer% and %rigthMonomere% and put them on the canvas
     *              3. Establish hydrogen connection between %leftMonomer%(center) and %rightMonomer%(center)
     *              5. Select all monomers on the canvas (via Ctrl+A)
     *              6. Copy selection to clipboard (via Ctrl+C)
     *              7. Move mouse curson to certan position
     *              8. Paste from clipboard
     *              9. Take screenshot to witness copy of monomers connected with hydrogen bonds connected on the canvas
     */
    test(`9. Copy and paste ${leftMonomer.monomerType}(${leftMonomer.alias}) and ${rightMonomer.monomerType}(${rightMonomer.alias})`, async () => {
      test.setTimeout(25000);

      await loadTwoMonomers(page, leftMonomer, rightMonomer);

      await bondTwoMonomersByCenterToCenter(
        page,
        leftMonomer,
        rightMonomer,
        MacroBondType.Hydrogen,
      );

      await selectAllStructuresOnCanvas(page);
      await copyToClipboardByKeyboard(page);
      await page.mouse.move(500, 300);
      await pasteFromClipboardByKeyboard(page);

      await zoomWithMouseWheel(page, -600);

      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
      });
    });
  });
});

test(`10. Verify switch to flex/snake/sequence modes functionality of hydrogen bonds in macromolecules mode`, async () => {
  /*
   *  Test task: https://github.com/epam/ketcher/issues/5984
   *  Description: Verify switch to flex/snake/sequence modes functionality of hydrogen bonds in macromolecules mode
   *  Case: 1. Load file with monomers connected with single and hydrogen bonds being at Flex mode
   *        2. Take screenshot to witness canvas at Flex mode
   *        3. Switch to Snake mode
   *        5. Take screenshot to witness canvas at Snake mode
   *        6. Switch to Sequence mode
   *        7. Take screenshot to witness canvas at Sequence mode
   */
  test.setTimeout(25000);

  await openFileAndAddToCanvasMacro(
    'KET/Hydrogen-bonds/All hydrogen connections at once.ket',
    page,
  );
  await moveMouseAway(page);
  await zoomWithMouseWheel(page, 100);
  await takeEditorScreenshot(page);

  await selectSnakeLayoutModeTool(page);
  await takeEditorScreenshot(page);

  await selectSequenceLayoutModeTool(page);
  await ZoomOutByKeyboard(page);
  await ZoomOutByKeyboard(page);
  await moveMouseAway(page);
  await takeEditorScreenshot(page);

  await selectFlexLayoutModeTool(page);
});

const buttonIdToTitle: {
  [key: string]: string;
} = {
  [MacroBondType.Single]: 'Single Bond (1)',
  [MacroBondType.Hydrogen]: 'Hydrogen Bond (2)',
};

Object.entries(MacroBondType).forEach(([key, dataTestId]) => {
  /*
   *  Test task: https://github.com/epam/ketcher/issues/5984
   *  Description: Verify that hydrogen bond option located and can be selected from the bond menu in the sidebar
   *  Case: 1. Open bond drop-down control
   *        2. Validate that each option has propper title
   *        3. Select bond
   *        4. Validate bond button is active
   */
  test(`11. ${key} bond tool: verification`, async () => {
    test.setTimeout(25000);
    // to reset Bond tool state
    await selectHandTool(page);
    await commonLeftToolbarLocators(
      page,
    ).bondSelectionDropdownExpandButton.click();

    const button = page.getByTestId(dataTestId).first();
    await expect(button).toHaveAttribute('title', buttonIdToTitle[dataTestId]);

    await selectHandTool(page);
    await bondSelectionTool(page, dataTestId);
    await expect(button).toHaveAttribute('class', /active/);
  });
});

test(`12. Verify that hydrogen bonds cannot be established between small molecules in macromolecules mode`, async () => {
  /*
   *  Test task: https://github.com/epam/ketcher/issues/5984
   *  Description: Verify that hydrogen bonds cannot be established between small molecules in macromolecules mode
   *  Case: 1. Load file with monomers connected with single and hydrogen bonds being at Flex mode
   *        2. Take screenshot to witness canvas at Flex mode
   *        3. Switch to Snake mode
   *        5. Take screenshot to witness canvas at Snake mode
   *        6. Switch to Sequence mode
   *        7. Take screenshot to witness canvas at Sequence mode
   */
  test.setTimeout(25000);

  await openFileAndAddToCanvasMacro(
    'KET/Hydrogen-bonds/All hydrogen connections at once.ket',
    page,
  );
  await moveMouseAway(page);
  await zoomWithMouseWheel(page, 100);
  await takeEditorScreenshot(page);

  await selectSnakeLayoutModeTool(page);
  await takeEditorScreenshot(page);

  await selectSequenceLayoutModeTool(page);
  await ZoomOutByKeyboard(page);
  await ZoomOutByKeyboard(page);
  await moveMouseAway(page);
  await takeEditorScreenshot(page);

  await selectFlexLayoutModeTool(page);
});

const molecules: { [monomerName: string]: IMonomer } = {
  Atom: {
    monomerType: 'atom',
    fileName: 'KET/Hydrogen-bonds/Monomer-templates/13. Atom.ket',
    alias: 'BrH',
  },
};

Object.values(monomers).forEach((leftMonomer) => {
  Object.values(molecules).forEach((rightMolecule) => {
    /*
     *  Test task: https://github.com/epam/ketcher/issues/5984
     *  Description: Verify that hydrogen bonds cannot be established between small molecules in macromolecules mode
     *  Case: For each %monomerType% from the library (leftMonomers)
     *          For each %moleculeType% from the library (rightMolecule) do
     *              1. Clear canvas
     *              2. Load %leftMonomer% and %rigthMolecule% and put them on the canvas
     *              3. Establish single bond connection between %leftMonomer%(center) and %rightMolecule%(atom)
     *              4. Take screenshot to witness established connection and bond selection works fine
     *              5. Remove  established bond by Undo operation
     *              6. Establish hydrogen connection between %leftMonomer%(center) and %rightMolecule%(atom)
     *              7. Take screenshot to witness no connection established
     */
    test(`13. Connect with hydrogen bond ${leftMonomer.monomerType}(${leftMonomer.alias}) and ${rightMolecule.monomerType}(${rightMolecule.alias})`, async () => {
      test.setTimeout(25000);

      await loadTwoMonomers(page, leftMonomer, rightMolecule);

      await bondTwoMonomersByCenterToCenter(
        page,
        leftMonomer,
        rightMolecule,
        MacroBondType.Hydrogen,
      );

      const bondLine = getBondLocator(page, {
        bondType: MacroBondDataIds.Hydrogen,
      }).first();

      expect(await bondLine.count()).toEqual(0);
    });
  });
});
