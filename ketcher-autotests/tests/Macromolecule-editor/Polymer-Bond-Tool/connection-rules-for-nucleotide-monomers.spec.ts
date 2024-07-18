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
} from '@utils';
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
  await page.keyboard.press('Control+0');
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
    '(R3) - Side only': {
      monomerType: 'nucleotide',
      fileName: 'KET/Nucleotide-Templates/03 - (R3) - Side only.ket',
      alias: '(R3)_-_Side_only',
      connectionPoints: {
        R3: 'R3',
      },
    },
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

  async function bondTwoMonomersByCenterToCenter(
    page: Page,
    leftMonomer: IMonomer,
    rightMonomer: IMonomer,
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
    );

    if (await page.getByRole('dialog').isVisible()) {
      const firstConnectionPointKeyForLeftMonomer = Object.keys(
        leftMonomer.connectionPoints,
      )[0];
      const leftMonomerConnectionPoint =
        leftMonomer.connectionPoints[firstConnectionPointKeyForLeftMonomer];
      await page.getByTitle(leftMonomerConnectionPoint).first().click();

      const firstConnectionPointKeyForRightMonomer = Object.keys(
        rightMonomer.connectionPoints,
      )[0];
      const rightMonomerConnectionPoint =
        rightMonomer.connectionPoints[firstConnectionPointKeyForRightMonomer];
      (await page.getByTitle(rightMonomerConnectionPoint).count()) > 1
        ? await page.getByTitle(rightMonomerConnectionPoint).nth(1).click()
        : await page.getByTitle(rightMonomerConnectionPoint).first().click();

      await page.getByTitle('Connect').first().click();
    }
  }

  // test(`temporary test for debug purposes`, async () => {
  //    await bondTwoMonomersByCenterToCenter(page, nucleotideMonomers['(R1,R2,R3)'], nucleotideMonomers['(R1,R2,R3)']);
  //  });

  Object.values(nucleotideMonomers).forEach((leftNucleotide) => {
    Object.values(nucleotideMonomers).forEach((rightNucleotide) => {
      /*
       *  Test case: https://github.com/epam/ketcher/issues/5122 - Case 1
       *  Description: Validate that unsplit nucleotide could be connected with another unsplit nucleotide (center-to-center way)
       * For each %nucleotideType% from the library (nucleotideMonomers)
       *   For each %nucleotideType2% from the library (nucleotideMonomers)
       *  1. Clear canvas
       *  2. Load %nucleotideType% and %nucleotideType2% and put them on the canvas
       *  3. Establish connection between %nucleotideType%(center) and %nucleotideType%(center)
       *  4. Validate canvas (connection dialog should appear)
       */
      test(`Test case1: Center-to-center of ${leftNucleotide.alias} and ${rightNucleotide.alias}`, async () => {
        test.setTimeout(20000);

        await loadTwoMonomers(page, leftNucleotide, rightNucleotide);

        await bondTwoMonomersByCenterToCenter(
          page,
          leftNucleotide,
          rightNucleotide,
        );

        await zoomWithMouseWheel(page, -800);

        await hoverOverConnectionLine(page);

        await takeEditorScreenshot(page);
      });
    });
  });

  Object.values(nucleotideMonomers).forEach((leftNucleotide) => {
    Object.values(nucleotideMonomers).forEach((rightNucleotide) => {
      Object.values(leftNucleotide.connectionPoints).forEach(
        (leftNucleotideConnectionPoint) => {
          Object.values(rightNucleotide.connectionPoints).forEach(
            (rightNucleotideConnectionPoint) => {
              /*
               *  Test case: https://github.com/epam/ketcher/issues/5122 - Case 2
               *  Description: User can connect any nucleotide to any nucleotide using point-to-point way
               * For each %nucleotideType% from the library (nucleotideMonomers)
               *   For each %nucleotideType2% from the library (nucleotideMonomers)
               *      For each %ConnectionPoint% (avaliable connections of %nucleotideType%)
               *         For each %ConnectionPoint2% (avaliable connections of %nucleotideType2%) do:
               *  1. Clear canvas
               *  2. Load %nucleotideType% and %nucleotideType2% and put them on the canvas
               *  3. Establish connection between %nucleotideType%(%ConnectionPoint%) and %nucleotideType%(%ConnectionPoint2%)
               *  4. Validate canvas (connection should appear)
               */
              test(`Test case2: Cnnct ${leftNucleotideConnectionPoint} to ${rightNucleotideConnectionPoint} of ${leftNucleotide.alias} and ${rightNucleotide.alias}`, async () => {
                test.setTimeout(20000);

                await loadTwoMonomers(page, leftNucleotide, rightNucleotide);

                await bondTwoMonomersByPointToPoint(
                  page,
                  leftNucleotide,
                  rightNucleotide,
                  leftNucleotideConnectionPoint,
                  rightNucleotideConnectionPoint,
                );

                await zoomWithMouseWheel(page, -800);

                await hoverOverConnectionLine(page);

                await takeEditorScreenshot(page);
              });
            },
          );
        },
      );
    });
  });

  const peptideMonomers: { [monomerName: string]: IMonomer } = {
    '(R1) - Left only': {
      monomerType: 'peptide',
      fileName: 'KET/Peptide-Templates/01 - (R1) - Left only.ket',
      alias: '(R1)_-_Left_only',
      connectionPoints: {
        R1: 'R1',
      },
    },
    '(R2) - Right only': {
      monomerType: 'peptide',
      fileName: 'KET/Peptide-Templates/02 - (R2) - Right only.ket',
      alias: '(R2)_-_Right_only',
      connectionPoints: {
        R2: 'R2',
      },
    },
    '(R3) - Side only': {
      monomerType: 'peptide',
      fileName: 'KET/Peptide-Templates/03 - (R3) - Side only.ket',
      alias: '(R3)_-_Side_only',
      connectionPoints: {
        R3: 'R3',
      },
    },
    '(R1,R2) - R3 gap': {
      monomerType: 'peptide',
      fileName: 'KET/Peptide-Templates/04 - (R1,R2) - R3 gap.ket',
      alias: '(R1,R2)_-_R3_gap',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
      },
    },
    '(R1,R3) - R2 gap': {
      monomerType: 'peptide',
      fileName: 'KET/Peptide-Templates/05 - (R1,R3) - R2 gap.ket',
      alias: '(R1,R3)_-_R2_gap',
      connectionPoints: {
        R1: 'R1',
        R3: 'R3',
      },
    },
    '(R2,R3) - R1 gap': {
      monomerType: 'peptide',
      fileName: 'KET/Peptide-Templates/06 - (R2,R3) - R1 gap.ket',
      alias: '(R2,R3)_-_R1_gap',
      connectionPoints: {
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R3,R4)': {
    //   monomerType: 'peptide',
    //   fileName: 'KET/Peptide-Templates/07 - (R3,R4).ket',
    //   alias: '(R3,R4)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    '(R1,R2,R3)': {
      monomerType: 'peptide',
      fileName: 'KET/Peptide-Templates/08 - (R1,R2,R3).ket',
      alias: '(R1,R2,R3)',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R1,R3,R4)': {
    //   monomerType: 'peptide',
    //   fileName: 'KET/Peptide-Templates/09 - (R1,R3,R4).ket',
    //   alias: '(R1,R3,R4)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R2,R3,R4)': {
    //   monomerType: 'peptide',
    //   fileName: 'KET/Peptide-Templates/10 - (R2,R3,R4).ket',
    //   alias: '(R2,R3,R4)',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R3,R4,R5)': {
    //   monomerType: 'peptide',
    //   fileName: 'KET/Peptide-Templates/11 - (R3,R4,R5).ket',
    //   alias: '(R3,R4,R5)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R1,R2,R3,R4)': {
    //   monomerType: 'peptide',
    //   fileName: 'KET/Peptide-Templates/12 - (R1,R2,R3,R4).ket',
    //   alias: '(R1,R2,R3,R4)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R1,R3,R4,R5)': {
    //   monomerType: 'peptide',
    //   fileName: 'KET/Peptide-Templates/13 - (R1,R3,R4,R5).ket',
    //   alias: '(R1,R3,R4,R5)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R2,R3,R4,R5)': {
    //   monomerType: 'peptide',
    //   fileName: 'KET/Peptide-Templates/14 - (R2,R3,R4,R5).ket',
    //   alias: '(R2,R3,R4,R5)',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R1,R2,R3,R4,R5)': {
    //   monomerType: 'peptide',
    //   fileName: 'KET/Peptide-Templates/15 - (R1,R2,R3,R4,R5).ket',
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

  Object.values(nucleotideMonomers).forEach((leftNucleotide) => {
    Object.values(peptideMonomers).forEach((rightPeptide) => {
      Object.values(leftNucleotide.connectionPoints).forEach(
        (leftNucleotideConnectionPoint) => {
          Object.values(rightPeptide.connectionPoints).forEach(
            (rightPeptideConnectionPoint) => {
              /*
               *  Test case: https://github.com/epam/ketcher/issues/5122 - Case 3 (Nucleotide - Peptide)
               *  Description: Validate that unsplit nucleotide could be connected with peptide (with every attachment point of unsplit nucleotide)
               * For each %nucleotideType% from the library (nucleotideMonomers)
               *   For each %peptideType% from the library (peptideMonomers)
               *      For each %ConnectionPoint% (avaliable connections of %nucleotideType%)
               *         For each %ConnectionPoint2% (avaliable connections of %peptideType%) do:
               *  1. Clear canvas
               *  2. Load %nucleotideType% and %peptideType% and put them on the canvas
               *  3. Establish connection between %snucleotideType%(%ConnectionPoint%) and %peptideType%(%ConnectionPoint2%)
               *  4. Validate canvas (connection should appear)
               */
              test(`Case3: Cnnct ${leftNucleotideConnectionPoint} to ${rightPeptideConnectionPoint} of Nuc(${leftNucleotide.alias}) and Pept(${rightPeptide.alias})`, async () => {
                test.setTimeout(20000);

                await loadTwoMonomers(page, leftNucleotide, rightPeptide);

                await bondTwoMonomersByPointToPoint(
                  page,
                  leftNucleotide,
                  rightPeptide,
                  leftNucleotideConnectionPoint,
                  rightPeptideConnectionPoint,
                );

                await zoomWithMouseWheel(page, -600);
                await hoverOverConnectionLine(page);

                await takeEditorScreenshot(page);
              });
            },
          );
        },
      );
    });
  });

  const chemMonomers: { [monomerName: string]: IMonomer } = {
    '(R1) - Left only': {
      monomerType: 'chem',
      fileName: 'KET/CHEM-Templates/01 - (R1) - Left only.ket',
      alias: '(R1)_-_Left_only',
      connectionPoints: {
        R1: 'R1',
      },
    },
    '(R2) - Right only': {
      monomerType: 'chem',
      fileName: 'KET/CHEM-Templates/02 - (R2) - Right only.ket',
      alias: '(R2)_-_Right_only',
      connectionPoints: {
        R2: 'R2',
      },
    },
    '(R3) - Side only': {
      monomerType: 'chem',
      fileName: 'KET/CHEM-Templates/03 - (R3) - Side only.ket',
      alias: '(R3)_-_Side_only',
      connectionPoints: {
        R3: 'R3',
      },
    },
    '(R1,R2) - R3 gap': {
      monomerType: 'chem',
      fileName: 'KET/CHEM-Templates/04 - (R1,R2) - R3 gap.ket',
      alias: '(R1,R2)_-_R3_gap',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
      },
    },
    '(R1,R3) - R2 gap': {
      monomerType: 'chem',
      fileName: 'KET/CHEM-Templates/05 - (R1,R3) - R2 gap.ket',
      alias: '(R1,R3)_-_R2_gap',
      connectionPoints: {
        R1: 'R1',
        R3: 'R3',
      },
    },
    '(R2,R3) - R1 gap': {
      monomerType: 'chem',
      fileName: 'KET/CHEM-Templates/06 - (R2,R3) - R1 gap.ket',
      alias: '(R2,R3)_-_R1_gap',
      connectionPoints: {
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R3,R4)': {
    //   monomerType: 'chem',
    //   fileName: 'KET/CHEM-Templates/07 - (R3,R4).ket',
    //   alias: '(R3,R4)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    '(R1,R2,R3)': {
      monomerType: 'chem',
      fileName: 'KET/CHEM-Templates/08 - (R1,R2,R3).ket',
      alias: '(R1,R2,R3)',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R1,R3,R4)': {
    //   monomerType: 'chem',
    //   fileName: 'KET/CHEM-Templates/09 - (R1,R3,R4).ket',
    //   alias: '(R1,R3,R4)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R2,R3,R4)': {
    //   monomerType: 'chem',
    //   fileName: 'KET/CHEM-Templates/10 - (R2,R3,R4).ket',
    //   alias: '(R2,R3,R4)',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R3,R4,R5)': {
    //   monomerType: 'chem',
    //   fileName: 'KET/CHEM-Templates/11 - (R3,R4,R5).ket',
    //   alias: '(R3,R4,R5)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R1,R2,R3,R4)': {
    //   monomerType: 'chem',
    //   fileName: 'KET/CHEM-Templates/12 - (R1,R2,R3,R4).ket',
    //   alias: '(R1,R2,R3,R4)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R1,R3,R4,R5)': {
    //   monomerType: 'chem',
    //   fileName: 'KET/CHEM-Templates/13 - (R1,R3,R4,R5).ket',
    //   alias: '(R1,R3,R4,R5)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R2,R3,R4,R5)': {
    //   monomerType: 'chem',
    //   fileName: 'KET/CHEM-Templates/14 - (R2,R3,R4,R5).ket',
    //   alias: '(R2,R3,R4,R5)',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R1,R2,R3,R4,R5)': {
    //   monomerType: 'chem',
    //   fileName: 'KET/CHEM-Templates/15 - (R1,R2,R3,R4,R5).ket',
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

  Object.values(nucleotideMonomers).forEach((leftNucleotide) => {
    Object.values(chemMonomers).forEach((rightCHEM) => {
      Object.values(leftNucleotide.connectionPoints).forEach(
        (leftNucleotideConnectionPoint) => {
          Object.values(rightCHEM.connectionPoints).forEach(
            (rightCHEMConnectionPoint) => {
              /*
               *  Test case: https://github.com/epam/ketcher/issues/5122 - Case 4 (Nucleotide - CHEM)
               *  Description: Check if possible to create bond from specific AP of one monomer to specific AP of another monomer ( Nucleotide - Peptides )
               * For each %nucleotideType% from the library (nucleotideMonomers)
               *   For each %CHEMType% from the library (CHEMMonomers)
               *      For each %ConnectionPoint% (avaliable connections of %nucleotideType%)
               *         For each %ConnectionPoint2% (avaliable connections of %CHEMType%) do:
               *  1. Clear canvas
               *  2. Load %nucleotideType% and %CHEMType% and put them on the canvas
               *  3. Establish connection between %snucleotideType%(%ConnectionPoint%) and %CHEMType%(%ConnectionPoint2%)
               *  4. Validate canvas (connection should appear)
               */
              test(`Case4: Cnnct ${leftNucleotideConnectionPoint} to ${rightCHEMConnectionPoint} of Nuc(${leftNucleotide.alias}) and CHEM(${rightCHEM.alias})`, async () => {
                test.setTimeout(20000);

                await loadTwoMonomers(page, leftNucleotide, rightCHEM);

                await bondTwoMonomersByPointToPoint(
                  page,
                  leftNucleotide,
                  rightCHEM,
                  leftNucleotideConnectionPoint,
                  rightCHEMConnectionPoint,
                );

                await zoomWithMouseWheel(page, -600);
                await hoverOverConnectionLine(page);

                await takeEditorScreenshot(page);
              });
            },
          );
        },
      );
    });
  });

  Object.values(nucleotideMonomers).forEach((leftNucleotide) => {
    Object.values(peptideMonomers).forEach((rightPeptide) => {
      /*
       *  Test case: https://github.com/epam/ketcher/issues/5122 - Case 5 (Nucleotide - Peptide)
       *  Description: Validate that unsplit nucleotide could be connected with peptide (center-to-center way)
       * For each %nucleotideType% from the library (nucleotideMonomers)
       *   For each %peptideType% from the library (peptideMonomers)
       *  1. Clear canvas
       *  2. Load %nucleotideType% and %peptideType% and put them on the canvas
       *  3. Establish connection between %snucleotideType%(center) and %peptideType%(center)
       *  4. Validate canvas (connection should appear)
       */
      test(`Case5: Cnnct Center to Center of Nucleotide(${leftNucleotide.alias}) and Peptide(${rightPeptide.alias})`, async () => {
        test.setTimeout(20000);

        await loadTwoMonomers(page, leftNucleotide, rightPeptide);

        await bondTwoMonomersByCenterToCenter(
          page,
          leftNucleotide,
          rightPeptide,
        );

        await zoomWithMouseWheel(page, -600);
        await hoverOverConnectionLine(page);

        await takeEditorScreenshot(page);
      });
    });
  });

  Object.values(nucleotideMonomers).forEach((leftNucleotide) => {
    Object.values(chemMonomers).forEach((rightCHEM) => {
      /*
       *  Test case: https://github.com/epam/ketcher/issues/5122 - Case 6 (Nucleotide - CHEM)
       *  Description: User can connect any Nucleotide to any CHEM using center-to-center way.
       * For each %nucleotideType% from the library (nucleotideMonomers)
       *   For each %CHEMType% from the library (CHEMMonomers)
       *  1. Clear canvas
       *  2. Load %nucleotideType% and %CHEMType% and put them on the canvas
       *  3. Establish connection between %snucleotideType%(center) and %CHEMType%(center)
       *  4. Validate canvas (connection should appear)
       */
      test(`Case6: Cnnct Center to Center of Nucleotide(${leftNucleotide.alias}) and CHEM(${rightCHEM.alias})`, async () => {
        test.setTimeout(20000);

        await loadTwoMonomers(page, leftNucleotide, rightCHEM);

        await bondTwoMonomersByCenterToCenter(page, leftNucleotide, rightCHEM);

        await zoomWithMouseWheel(page, -600);
        await hoverOverConnectionLine(page);

        await takeEditorScreenshot(page);
      });
    });
  });

  const ordinaryMoleculeMonomers: { [monomerName: string]: IMonomer } = {
    '(R1) - Left only': {
      monomerType: 'ordinaryMolecule',
      fileName: 'KET/Ordinary-Molecule-Templates/01 - (R1) - Left only.ket',
      alias: 'F1',
      connectionPoints: {
        R1: 'R1',
      },
    },
    '(R2) - Right only': {
      monomerType: 'ordinaryMolecule',
      fileName: 'KET/Ordinary-Molecule-Templates/02 - (R2) - Right only.ket',
      alias: 'F1',
      connectionPoints: {
        R2: 'R2',
      },
    },
    '(R3) - Side only': {
      monomerType: 'ordinaryMolecule',
      fileName: 'KET/Ordinary-Molecule-Templates/03 - (R3) - Side only.ket',
      alias: 'F1',
      connectionPoints: {
        R3: 'R3',
      },
    },
    '(R1,R2) - R3 gap': {
      monomerType: 'ordinaryMolecule',
      fileName: 'KET/Ordinary-Molecule-Templates/04 - (R1,R2) - R3 gap.ket',
      alias: 'F1',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
      },
    },
    '(R1,R3) - R2 gap': {
      monomerType: 'ordinaryMolecule',
      fileName: 'KET/Ordinary-Molecule-Templates/05 - (R1,R3) - R2 gap.ket',
      alias: 'F1',
      connectionPoints: {
        R1: 'R1',
        R3: 'R3',
      },
    },
    '(R2,R3) - R1 gap': {
      monomerType: 'ordinaryMolecule',
      fileName: 'KET/Ordinary-Molecule-Templates/06 - (R2,R3) - R1 gap.ket',
      alias: 'F1',
      connectionPoints: {
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R3,R4)': {
    //   monomerType: 'ordinaryMolecule',
    //   fileName: 'KET/Ordinary-Molecule-Templates/07 - (R3,R4).ket',
    //   alias: 'F1',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    '(R1,R2,R3)': {
      monomerType: 'ordinaryMolecule',
      fileName: 'KET/Ordinary-Molecule-Templates/08 - (R1,R2,R3).ket',
      alias: 'F1',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R1,R3,R4)': {
    //   monomerType: 'ordinaryMolecule',
    //   fileName: 'KET/Ordinary-Molecule-Templates/09 - (R1,R3,R4).ket',
    //   alias: 'F1',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R2,R3,R4)': {
    //   monomerType: 'ordinaryMolecule',
    //   fileName: 'KET/Ordinary-Molecule-Templates/10 - (R2,R3,R4).ket',
    //   alias: 'F1',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R3,R4,R5)': {
    //   monomerType: 'ordinaryMolecule',
    //   fileName: 'KET/Ordinary-Molecule-Templates/11 - (R3,R4,R5).ket',
    //   alias: 'F1',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R1,R2,R3,R4)': {
    //   monomerType: 'ordinaryMolecule',
    //   fileName: 'KET/Ordinary-Molecule-Templates/12 - (R1,R2,R3,R4).ket',
    //   alias: 'F1',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R1,R3,R4,R5)': {
    //   monomerType: 'ordinaryMolecule',
    //   fileName: 'KET/Ordinary-Molecule-Templates/13 - (R1,R3,R4,R5).ket',
    //   alias: 'F1',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R2,R3,R4,R5)': {
    //   monomerType: 'ordinaryMolecule',
    //   fileName: 'KET/Ordinary-Molecule-Templates/14 - (R2,R3,R4,R5).ket',
    //   alias: 'F1',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R1,R2,R3,R4,R5)': {
    //   monomerType: 'ordinaryMolecule',
    //   fileName: 'KET/Ordinary-Molecule-Templates/15 - (R1,R2,R3,R4,R5).ket',
    //   alias: 'F1',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
  };

  let ordnryMlcleName: string;

  Object.values(nucleotideMonomers).forEach((leftNucleotide) => {
    Object.values(ordinaryMoleculeMonomers).forEach((rightOM) => {
      Object.values(leftNucleotide.connectionPoints).forEach(
        (leftNucleotideConnectionPoint) => {
          Object.values(rightOM.connectionPoints).forEach(
            (rightOMConnectionPoint) => {
              /*
               *  Test case: https://github.com/epam/ketcher/issues/4882 - Case 7
               *  Description: Validate that unsplit nucleotide could be connected with micromolecule (with every attachment point of unsplit nucleotide)
               * For each %chemType% from the library (nucleotideMonomers)
               *   For each %OMType% from the library (ordinaryMoleculeMonomers)
               *      For each %ConnectionPoint% (avaliable connections of %chemType%)
               *         For each %ConnectionPoint2% (avaliable connections of %OMType%) do:
               *  1. Clear canvas
               *  2. Load %chemType% and %OMType% and put them on the canvas
               *  3. Establish connection between %chemType%(%ConnectionPoint%) and %OMType%(%ConnectionPoint2%)
               *  4. Validate canvas (connection should appear)
               */
              ordnryMlcleName = rightOM.fileName.substring(
                rightOM.fileName.indexOf(' - '),
                rightOM.fileName.lastIndexOf('.ket'),
              );
              test(`Test case7: Cnct ${leftNucleotideConnectionPoint} to ${rightOMConnectionPoint} of Nucleotide(${leftNucleotide.alias}) and OM(${ordnryMlcleName})`, async () => {
                test.setTimeout(20000);

                await loadTwoMonomers(page, leftNucleotide, rightOM);

                await bondTwoMonomersByPointToPoint(
                  page,
                  leftNucleotide,
                  rightOM,
                  leftNucleotideConnectionPoint,
                  rightOMConnectionPoint,
                );

                await zoomWithMouseWheel(page, -600);
                await hoverOverConnectionLine(page);

                await takeEditorScreenshot(page);
              });
            },
          );
        },
      );
    });
  });

  Object.values(nucleotideMonomers).forEach((leftNucleotide) => {
    Object.values(ordinaryMoleculeMonomers).forEach((rightOrdinaryMolecule) => {
      /*
       *  Test case: https://github.com/epam/ketcher/issues/4882 - Case 10
       *  Description: User can connect any Nucleotide to any OrdinaryMolecule using center-to-center way.
       *               Select Connection Points dialog opened.
       */
      ordnryMlcleName = rightOrdinaryMolecule.fileName.substring(
        rightOrdinaryMolecule.fileName.indexOf(' - '),
        rightOrdinaryMolecule.fileName.lastIndexOf('.ket'),
      );

      test(`Case 10: Connect Center to Center of Nucleotide(${leftNucleotide.alias}) and OrdinaryMolecule(${ordnryMlcleName})`, async () => {
        test.setTimeout(20000);

        await loadTwoMonomers(page, leftNucleotide, rightOrdinaryMolecule);

        await bondTwoMonomersByCenterToCenter(
          page,
          leftNucleotide,
          rightOrdinaryMolecule,
        );

        await zoomWithMouseWheel(page, -600);

        await hoverOverConnectionLine(page);

        await takeEditorScreenshot(page);
      });
    });
  });
});
