/* eslint-disable no-magic-numbers */
import { BrowserContext, Page, chromium, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvasMacro,
  moveMouseAway,
  dragMouseTo,
  waitForKetcherInit,
  waitForIndigoToLoad,
  selectClearCanvasTool,
  resetZoomLevelToDefault,
} from '@utils';
import { pageReload } from '@utils/common/helpers';
import {
  turnOnMacromoleculesEditor,
  zoomWithMouseWheel,
} from '@utils/macromolecules';
import { bondTwoMonomersPointToPoint } from '@utils/macromolecules/polymerBond';

let page: Page;
let sharedContext: BrowserContext;

test.beforeAll(async ({ browser }) => {
  // let sharedContext;
  try {
    sharedContext = await browser.newContext();
  } catch (error) {
    console.error('Error on creation browser context:', error);
    console.log('Restarting browser...');
    await browser.close();
    browser = await chromium.launch();
    sharedContext = await browser.newContext();
  }

  // Reminder: do not pass page as async
  page = await sharedContext.newPage();

  await page.goto('', { waitUntil: 'domcontentloaded' });
  await waitForKetcherInit(page);
  await waitForIndigoToLoad(page);
  await turnOnMacromoleculesEditor(page);
});

test.afterEach(async () => {
  await page.keyboard.press('Escape');
  await resetZoomLevelToDefault(page);
  await selectClearCanvasTool(page);
});

test.afterAll(async ({ browser }) => {
  await page.close();
  await sharedContext.close();
  await browser.contexts().forEach((someContext) => {
    someContext.close();
  });
  // await browser.close();
});

test.describe('Connection rules for Nucleotide monomers: ', () => {
  test.setTimeout(400000);
  test.describe.configure({ retries: 0 });

  interface IMonomer {
    monomerType: string;
    fileName: string;
    alias: string;
    connectionPoints: { [connectionPointName: string]: string };
  }

  const nucleotideMonomers: { [monomerName: string]: IMonomer } = {
    '(R1) - Left only': {
      monomerType: 'nucleotide',
      fileName: 'KET/Nucleotide-Templates/01 - (R1) - Left only.ket',
      alias: '(R1)_-_Left_only',
      connectionPoints: {
        R1: 'R1',
      },
    },
    '(R2) - Right only': {
      monomerType: 'nucleotide',
      fileName: 'KET/Nucleotide-Templates/02 - (R2) - Right only.ket',
      alias: '(R2)_-_Right_only',
      connectionPoints: {
        R2: 'R2',
      },
    },
    // '(R3) - Side only': {
    //   monomerType: 'nucleotide',
    //   fileName: 'KET/Nucleotide-Templates/03 - (R3) - Side only.ket',
    //   alias: '(R3)_-_Side_only',
    //   connectionPoints: {
    //     R3: 'R3',
    //   },
    // },
    '(R1,R2) - R3 gap': {
      monomerType: 'nucleotide',
      fileName: 'KET/Nucleotide-Templates/04 - (R1,R2) - R3 gap.ket',
      alias: '(R1,R2)_-_R3_gap',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
      },
    },
    '(R1,R3) - R2 gap': {
      monomerType: 'nucleotide',
      fileName: 'KET/Nucleotide-Templates/05 - (R1,R3) - R2 gap.ket',
      alias: '(R1,R3)_-_R2_gap',
      connectionPoints: {
        R1: 'R1',
        R3: 'R3',
      },
    },
    '(R2,R3) - R1 gap': {
      monomerType: 'nucleotide',
      fileName: 'KET/Nucleotide-Templates/06 - (R2,R3) - R1 gap.ket',
      alias: '(R2,R3)_-_R1_gap',
      connectionPoints: {
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R3,R4)': {
    //   monomerType: 'nucleotide',
    //   fileName: 'KET/Nucleotide-Templates/07 - (R3,R4).ket',
    //   alias: '(R3,R4)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    '(R1,R2,R3)': {
      monomerType: 'nucleotide',
      fileName: 'KET/Nucleotide-Templates/08 - (R1,R2,R3).ket',
      alias: '(R1,R2,R3)',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R1,R3,R4)': {
    //   monomerType: 'nucleotide',
    //   fileName: 'KET/Nucleotide-Templates/09 - (R1,R3,R4).ket',
    //   alias: '(R1,R3,R4)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R2,R3,R4)': {
    //   monomerType: 'nucleotide',
    //   fileName: 'KET/Nucleotide-Templates/10 - (R2,R3,R4).ket',
    //   alias: '(R2,R3,R4)',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R3,R4,R5)': {
    //   monomerType: 'nucleotide',
    //   fileName: 'KET/Nucleotide-Templates/11 - (R3,R4,R5).ket',
    //   alias: '(R3,R4,R5)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R1,R2,R3,R4)': {
    //   monomerType: 'nucleotide',
    //   fileName: 'KET/Nucleotide-Templates/12 - (R1,R2,R3,R4).ket',
    //   alias: '(R1,R2,R3,R4)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R1,R3,R4,R5)': {
    //   monomerType: 'nucleotide',
    //   fileName: 'KET/Nucleotide-Templates/13 - (R1,R3,R4,R5).ket',
    //   alias: '(R1,R3,R4,R5)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R2,R3,R4,R5)': {
    //   monomerType: 'nucleotide',
    //   fileName: 'KET/Nucleotide-Templates/14 - (R2,R3,R4,R5).ket',
    //   alias: '(R2,R3,R4,R5)',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R1,R2,R3,R4,R5)': {
    //   monomerType: 'nucleotide',
    //   fileName: 'KET/Nucleotide-Templates/15 - (R1,R2,R3,R4,R5).ket',
    //   alias: '(R1,R2,R3,R4,R5)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
  };

  async function hoverOverConnectionLine(page: Page) {
    const bondLine = page.locator('g[pointer-events="stroke"]').first();
    await bondLine.hover();
  }

  async function loadTwoMonomers(
    page: Page,
    leftMonomer: IMonomer,
    rightMonomer: IMonomer,
  ) {
    await openFileAndAddToCanvasMacro(leftMonomer.fileName, page);
    const leftMonomerLocator =
      leftMonomer.monomerType === 'nucleotide'
        ? page.getByText(leftMonomer.alias).locator('..').locator('..').first()
        : page.getByText(leftMonomer.alias).locator('..').first();
    await leftMonomerLocator.hover();
    await dragMouseTo(500, 370, page);
    await moveMouseAway(page);

    await openFileAndAddToCanvasMacro(rightMonomer.fileName, page);
    let rightMonomerLocator;
    if (rightMonomer.monomerType === 'nucleotide') {
      rightMonomerLocator =
        (await page.getByText(leftMonomer.alias).count()) > 1
          ? page
              .getByText(rightMonomer.alias)
              .nth(1)
              .locator('..')
              .locator('..')
              .first()
          : page
              .getByText(rightMonomer.alias)
              .locator('..')
              .locator('..')
              .first();
    } else {
      rightMonomerLocator =
        (await page.getByText(leftMonomer.alias).count()) > 1
          ? page.getByText(rightMonomer.alias).nth(1).locator('..').first()
          : page.getByText(rightMonomer.alias).locator('..').first();
    }

    await rightMonomerLocator.hover();
    // Do NOT put monomers to equel X or Y coordinates - connection line element become zero size (width or hight) and .hover() doesn't work
    await dragMouseTo(600, 371, page);
    await moveMouseAway(page);
  }

  async function bondTwoMonomersByPointToPoint(
    page: Page,
    leftMonomer: IMonomer,
    rightMonomer: IMonomer,
    leftMonomerConnectionPoint?: string,
    rightMonomerConnectionPoint?: string,
  ) {
    const leftMonomerLocator =
      leftMonomer.monomerType === 'nucleotide'
        ? page.getByText(leftMonomer.alias).locator('..').locator('..').first()
        : page.getByText(leftMonomer.alias).locator('..').first();

    let rightMonomerLocator;
    if (rightMonomer.monomerType === 'nucleotide') {
      rightMonomerLocator =
        (await page.getByText(leftMonomer.alias).count()) > 1
          ? page
              .getByText(rightMonomer.alias)
              .nth(1)
              .locator('..')
              .locator('..')
              .first()
          : page
              .getByText(rightMonomer.alias)
              .locator('..')
              .locator('..')
              .first();
    } else {
      rightMonomerLocator =
        (await page.getByText(leftMonomer.alias).count()) > 1
          ? page.getByText(rightMonomer.alias).nth(1).locator('..').first()
          : page.getByText(rightMonomer.alias).locator('..').first();
    }

    await bondTwoMonomersPointToPoint(
      page,
      leftMonomerLocator,
      rightMonomerLocator,
      leftMonomerConnectionPoint,
      rightMonomerConnectionPoint,
    );
  }

  const baseMonomers: { [monomerName: string]: IMonomer } = {
    '(R1) - Left only': {
      monomerType: 'base',
      fileName: 'KET/Base-Templates/01 - (R1) - Left only.ket',
      alias: '(R1)_-_Left_only',
      connectionPoints: {
        R1: 'R1',
      },
    },
    '(R2) - Right only': {
      monomerType: 'base',
      fileName: 'KET/Base-Templates/02 - (R2) - Right only.ket',
      alias: '(R2)_-_Right_only',
      connectionPoints: {
        R2: 'R2',
      },
    },
    // '(R3) - Side only': {
    //   monomerType: 'base',
    //   fileName: 'KET/Base-Templates/03 - (R3) - Side only.ket',
    //   alias: '(R3)_-_Side_only',
    //   connectionPoints: {
    //     R3: 'R3',
    //   },
    // },
    '(R1,R2) - R3 gap': {
      monomerType: 'base',
      fileName: 'KET/Base-Templates/04 - (R1,R2) - R3 gap.ket',
      alias: '(R1,R2)_-_R3_gap',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
      },
    },
    // '(R1,R3) - R2 gap': {
    //   monomerType: 'base',
    //   fileName: 'KET/Base-Templates/05 - (R1,R3) - R2 gap.ket',
    //   alias: '(R1,R3)_-_R2_gap',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //   },
    // },
    // '(R2,R3) - R1 gap': {
    //   monomerType: 'base',
    //   fileName: 'KET/Base-Templates/06 - (R2,R3) - R1 gap.ket',
    //   alias: '(R2,R3)_-_R1_gap',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //   },
    // },
    // '(R3,R4)': {
    //        monomerType: 'base',
    //   fileName: 'KET/Base-Templates/07 - (R3,R4).ket',
    //   alias: '(R3,R4)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R1,R2,R3)': {
    //   monomerType: 'base',
    //   fileName: 'KET/Base-Templates/08 - (R1,R2,R3).ket',
    //   alias: '(R1,R2,R3)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R2: 'R2',
    //     R3: 'R3',
    //   },
    // },
    // '(R1,R3,R4)': {
    // monomerType: 'base',
    //   fileName: 'KET/Base-Templates/09 - (R1,R3,R4).ket',
    //   alias: '(R1,R3,R4)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R2,R3,R4)': {
    // monomerType: 'base',
    //   fileName: 'KET/Base-Templates/10 - (R2,R3,R4).ket',
    //   alias: '(R2,R3,R4)',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R3,R4,R5)': {
    // monomerType: 'base',
    //   fileName: 'KET/Base-Templates/11 - (R3,R4,R5).ket',
    //   alias: '(R3,R4,R5)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R1,R2,R3,R4)': {
    // monomerType: 'base',
    //   fileName: 'KET/Base-Templates/12 - (R1,R2,R3,R4).ket',
    //   alias: '(R1,R2,R3,R4)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R1,R3,R4,R5)': {
    // monomerType: 'base',
    //   fileName: 'KET/Base-Templates/13 - (R1,R3,R4,R5).ket',
    //   alias: '(R1,R3,R4,R5)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R2,R3,R4,R5)': {
    // monomerType: 'base',
    //   fileName: 'KET/Base-Templates/14 - (R2,R3,R4,R5).ket',
    //   alias: '(R2,R3,R4,R5)',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R1,R2,R3,R4,R5)': {
    // monomerType: 'base',
    //   fileName: 'KET/Base-Templates/15 - (R1,R2,R3,R4,R5).ket',
    //   alias: '(R1,R2,R3,R4,R5)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    N: {
      monomerType: 'base',
      fileName:
        'KET/Base-Templates/16 - W - ambiguous alternatives from library (R1).ket',
      alias: 'W',
      connectionPoints: {
        R1: 'R1',
      },
    },
    // '%': {
    //   monomerType: 'base',
    //   fileName: 'KET/Base-Templates/17 - W - ambiguous mixed (R1).ket',
    //   alias: '%',
    //   connectionPoints: {
    //     R1: 'R1',
    //   },
    // },
  };

  Object.values(nucleotideMonomers).forEach((leftNucleotide) => {
    Object.values(baseMonomers).forEach((rightBase) => {
      Object.values(leftNucleotide.connectionPoints).forEach(
        (leftNucleotideConnectionPoint) => {
          Object.values(rightBase.connectionPoints).forEach(
            (rightBaseConnectionPoint) => {
              /*
               *  Test case: https://github.com/epam/ketcher/issues/5122 - Case 11 (Nucleotide - Base)
               *  Description: Validate that unsplit nucleotide could be connected with base (with every attachment point of unsplit nucleotide)
               * For each %nucleotideType% from the library (nucleotideMonomers)
               *   For each %baseType% from the library (baseMonomers)
               *      For each %ConnectionPoint% (avaliable connections of %nucleotideType%)
               *         For each %ConnectionPoint2% (avaliable connections of %baseType%) do:
               *  1. Clear canvas
               *  2. Load %nucleotideType% and %baseType% and put them on the canvas
               *  3. Establish connection between %snucleotideType%(%ConnectionPoint%) and %baseType%(%ConnectionPoint2%)
               *  4. Validate canvas (connection should appear)
               */
              test(`Case11: Cnnct ${leftNucleotideConnectionPoint} to ${rightBaseConnectionPoint} of Nuc(${leftNucleotide.alias}) and Base(${rightBase.alias})`, async () => {
                test.setTimeout(40000);

                /* In order to fix problem with label renderer (one pixel shift) 
                   we have to try to reload page
                */
                if (
                  leftNucleotideConnectionPoint === 'R1' &&
                  rightBaseConnectionPoint === 'R1' &&
                  leftNucleotide.alias === '(R1)_-_Left_only' &&
                  rightBase.alias === '(R1)_-_Left_only'
                ) {
                  await pageReload(page);
                }

                await loadTwoMonomers(page, leftNucleotide, rightBase);

                await bondTwoMonomersByPointToPoint(
                  page,
                  leftNucleotide,
                  rightBase,
                  leftNucleotideConnectionPoint,
                  rightBaseConnectionPoint,
                );

                await zoomWithMouseWheel(page, -600);
                await hoverOverConnectionLine(page);

                await takeEditorScreenshot(page, {
                  masks: [page.getByTestId('polymer-library-preview')],
                });
              });
            },
          );
        },
      );
    });
  });
});
