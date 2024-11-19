/* eslint-disable no-magic-numbers */
import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  selectClearCanvasTool,
  openFileAndAddToCanvasMacro,
  moveMouseAway,
  dragMouseTo,
  waitForPageInit,
  resetZoomLevelToDefault,
} from '@utils';
import { MacroBondTool } from '@utils/canvas/tools/selectNestedTool/types';
import { DropdownToolIds } from '@utils/clicks/types';
import {
  turnOnMacromoleculesEditor,
  zoomWithMouseWheel,
} from '@utils/macromolecules';
import { bondTwoMonomersPointToPoint } from '@utils/macromolecules/polymerBond';
// import { processResetToDefaultState } from '@utils/testAnnotations/resetToDefaultState';

let page: Page;
test.setTimeout(400000);
test.describe.configure({ retries: 0 });

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();
  await waitForPageInit(page);
  await turnOnMacromoleculesEditor(page);
});

test.afterEach(async ({ context: _ }, testInfo) => {
  await selectClearCanvasTool(page);
  await resetZoomLevelToDefault(page);
  // await processResetToDefaultState(testInfo, page);
});

test.afterAll(async ({ browser }) => {
  await Promise.all(browser.contexts().map((context) => context.close()));
});

interface IMonomer {
  monomerType: string;
  fileName: string;
  alias: string;
}

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
  Sugar: {
    monomerType: 'sugar',
    fileName: 'KET/Hydrogen-bonds/Monomer-templates/3. Sugar.ket',
    alias: 'R',
  },
  'Ambiguous sugar': {
    monomerType: 'ambiguous sugar',
    fileName: 'KET/Hydrogen-bonds/Monomer-templates/4. Ambiguous sugar.ket',
    alias: '%',
  },
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
  Phosphate: {
    monomerType: 'phosphate',
    fileName: 'KET/Hydrogen-bonds/Monomer-templates/7. Phosphate.ket',
    alias: 'P',
  },
  'Ambiguous phosphate': {
    monomerType: 'ambiguous phosphate',
    fileName: 'KET/Hydrogen-bonds/Monomer-templates/8. Ambiguous phosphate.ket',
    alias: '%',
  },
  'Unsplit nucleotide': {
    monomerType: 'nucleotide',
    fileName: 'KET/Hydrogen-bonds/Monomer-templates/9. Unsplit nucleotide.ket',
    alias: '5hMedC',
  },
  CHEM: {
    monomerType: 'CHEM',
    fileName: 'KET/Hydrogen-bonds/Monomer-templates/10. CHEM.ket',
    alias: '4aPEGMal',
  },
  'Ambiguous CHEM': {
    monomerType: 'Ambiguous CHEM',
    fileName: 'KET/Hydrogen-bonds/Monomer-templates/11. Ambiguous CHEM.ket',
    alias: '%',
  },
  'Unresolved monomer': {
    monomerType: 'unresolved monomer',
    fileName: 'KET/Hydrogen-bonds/Monomer-templates/12. Unresolved monomer.ket',
    alias: 'Unknown',
  },
};

async function loadTwoMonomers(
  page: Page,
  leftMonomers: IMonomer,
  rightMonomers: IMonomer,
) {
  await openFileAndAddToCanvasMacro(leftMonomers.fileName, page);
  const canvasLocator = page.getByTestId('ketcher-canvas').first();
  const leftMonomerLocator = canvasLocator
    // .locator(`text=${leftMonomers.alias}`)
    .getByText(leftMonomers.alias, { exact: true })
    .locator('..')
    .first();

  await leftMonomerLocator.hover({ force: true });
  await dragMouseTo(500, 370, page);
  await moveMouseAway(page);

  await openFileAndAddToCanvasMacro(rightMonomers.fileName, page);
  const rightMonomerLocator =
    (await canvasLocator
      // locator(`text=${leftMonomers.alias}`)
      .getByText(leftMonomers.alias, {
        exact: true,
      })
      .count()) > 1
      ? canvasLocator
          // .locator(`text=${rightMonomers.alias}`)
          .getByText(rightMonomers.alias, { exact: true })
          .nth(1)
          .locator('..')
          .first()
      : canvasLocator
          // .locator(`text=${rightMonomers.alias}`)
          .getByText(rightMonomers.alias, { exact: true })
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
  bondType?: DropdownToolIds,
) {
  const canvasLocator = page.getByTestId('ketcher-canvas').first();

  const leftMonomerLocator = canvasLocator
    .getByText(leftMonomer.alias, { exact: true })
    .locator('..')
    .first();

  const rightMonomerLocator =
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

  await bondTwoMonomersPointToPoint(
    page,
    leftMonomerLocator,
    rightMonomerLocator,
    undefined,
    undefined,
    bondType,
  );
}

// test(`temporary test for debug purposes`, async () => {
//   await prepareCanvasOneFreeAPLeft(
//     page,
//     sugarMonomers['(R1,R2,R3,R4,R5)'],
//     sugarMonomers['(R1,R2,R3,R4,R5)'],
//     'R1',
//     'R5',
//   );
// });

Object.values(monomers).forEach((leftMonomer) => {
  Object.values(monomers).forEach((rightMonomer) => {
    /*
     *  Test task: https://github.com/epam/ketcher/issues/5984
     *  Description: Verify that only one hydrogen bond can be established between two monomers.
     *  Case: For each %monomerType% from the library (leftMonomers)
     *          For each %monomerType% from the library (rightMonomers) do
     *              1. Clear canvas
     *              2. Load %leftMonomer% and %rigthMonomere% and put them on the canvas
     *              3. Establish hydrogen connection between %leftMonomer%(center) and %rightMonomer%(center)
     *              4. Take screenshot to witness established connection
     */
    test(`1. Connect with hydrogen bond ${leftMonomer.monomerType}(${leftMonomer.alias}) and ${rightMonomer.monomerType}(${rightMonomer.alias})`, async () => {
      test.setTimeout(25000);

      await loadTwoMonomers(page, leftMonomer, rightMonomer);

      await bondTwoMonomersByCenterToCenter(
        page,
        leftMonomer,
        rightMonomer,
        MacroBondTool.HYDROGEN,
      );

      await zoomWithMouseWheel(page, -600);

      await takeEditorScreenshot(page, {
        masks: [page.getByTestId('polymer-library-preview')],
      });
    });
  });
});
