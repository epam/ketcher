/* eslint-disable no-magic-numbers */
import { Locator, Page, test, expect } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvasMacro,
  moveMouseAway,
  dragMouseTo,
  resetZoomLevelToDefault,
  MonomerType,
  waitForPageInit,
} from '@utils';
import { selectClearCanvasTool } from '@tests/pages/common/TopLeftToolbar';
import { turnOnMacromoleculesEditor } from '@tests/pages/common/TopRightToolbar';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import {
  bondMonomerPointToMoleculeAtom,
  bondTwoMonomersPointToPoint,
} from '@utils/macromolecules/polymerBond';

let page: Page;

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();

  await waitForPageInit(page);
  await turnOnMacromoleculesEditor(page);
});

test.afterAll(async ({ browser }) => {
  await Promise.all(browser.contexts().map((context) => context.close()));
});

test.afterEach(async () => {
  await resetZoomLevelToDefault(page);
  await TopLeftToolbar(page).clearCanvas();
});

test.describe('Connection rules for Base monomers: ', () => {
  test.setTimeout(20000);
  test.describe.configure({ retries: 0 });

  interface IMonomer {
    monomerType: MonomerType;
    fileName: string;
    alias: string;
    connectionPoints: { [connectionPointName: string]: string };
  }

  const baseMonomers: { [monomerName: string]: IMonomer } = {
    '(R1) - Left only': {
      monomerType: MonomerType.Base,
      fileName: 'KET/Base-Templates/01 - (R1) - Left only.ket',
      alias: '(R1)_-_Left_only',
      connectionPoints: {
        R1: 'R1',
      },
    },
    '(R2) - Right only': {
      monomerType: MonomerType.Base,
      fileName: 'KET/Base-Templates/02 - (R2) - Right only.ket',
      alias: '(R2)_-_Right_only',
      connectionPoints: {
        R2: 'R2',
      },
    },
    // '(R3) - Side only': {
    //   monomerType: MonomerType.Base,
    //   fileName: 'KET/Base-Templates/03 - (R3) - Side only.ket',
    //   alias: '(R3)_-_Side_only',
    //   connectionPoints: {
    //     R3: 'R3',
    //   },
    // },
    '(R1,R2) - R3 gap': {
      monomerType: MonomerType.Base,
      fileName: 'KET/Base-Templates/04 - (R1,R2) - R3 gap.ket',
      alias: '(R1,R2)_-_R3_gap',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
      },
    },
    // '(R1,R3) - R2 gap': {
    //   monomerType: MonomerType.Base,
    //   fileName: 'KET/Base-Templates/05 - (R1,R3) - R2 gap.ket',
    //   alias: '(R1,R3)_-_R2_gap',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //   },
    // },
    // '(R2,R3) - R1 gap': {
    //   monomerType: MonomerType.Base,
    //   fileName: 'KET/Base-Templates/06 - (R2,R3) - R1 gap.ket',
    //   alias: '(R2,R3)_-_R1_gap',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //   },
    // },
    // '(R3,R4)': {
    //        monomerType: MonomerType.Base,
    //   fileName: 'KET/Base-Templates/07 - (R3,R4).ket',
    //   alias: '(R3,R4)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R1,R2,R3)': {
    //   monomerType: MonomerType.Base,
    //   fileName: 'KET/Base-Templates/08 - (R1,R2,R3).ket',
    //   alias: '(R1,R2,R3)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R2: 'R2',
    //     R3: 'R3',
    //   },
    // },
    // '(R1,R3,R4)': {
    // monomerType: MonomerType.Base,
    //   fileName: 'KET/Base-Templates/09 - (R1,R3,R4).ket',
    //   alias: '(R1,R3,R4)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R2,R3,R4)': {
    // monomerType: MonomerType.Base,
    //   fileName: 'KET/Base-Templates/10 - (R2,R3,R4).ket',
    //   alias: '(R2,R3,R4)',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R3,R4,R5)': {
    // monomerType: MonomerType.Base,
    //   fileName: 'KET/Base-Templates/11 - (R3,R4,R5).ket',
    //   alias: '(R3,R4,R5)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R1,R2,R3,R4)': {
    // monomerType: MonomerType.Base,
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
    // monomerType: MonomerType.Base,
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
    // monomerType: MonomerType.Base,
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
    // monomerType: MonomerType.Base,
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
      monomerType: MonomerType.Base,
      fileName:
        'KET/Base-Templates/16 - W - ambiguous alternatives from library (R1).ket',
      alias: 'W',
      connectionPoints: {
        R1: 'R1',
      },
    },
    // '%': {
    //   monomerType: MonomerType.Base,
    //   fileName: 'KET/Base-Templates/17 - W - ambiguous mixed (R1).ket',
    //   alias: '%',
    //   connectionPoints: {
    //     R1: 'R1',
    //   },
    // },
  };

  async function loadTwoMonomers(
    page: Page,
    leftMonomer: IMonomer,
    rightMonomer: IMonomer,
  ): Promise<{ leftMonomer: Locator; rightMonomer: Locator }> {
    await openFileAndAddToCanvasMacro(leftMonomer.fileName, page);
    const leftMonomerLocator = getMonomerLocator(page, {
      monomerAlias: leftMonomer.alias,
      monomerType: leftMonomer.monomerType,
    }).first();

    await leftMonomerLocator.hover({ force: true });

    await dragMouseTo(500, 370, page);
    await moveMouseAway(page);

    await openFileAndAddToCanvasMacro(rightMonomer.fileName, page);
    const tmpMonomerLocator = getMonomerLocator(page, {
      monomerAlias: rightMonomer.alias,
      monomerType: rightMonomer.monomerType,
    });
    const rightMonomerLocator =
      (await tmpMonomerLocator.count()) > 1
        ? tmpMonomerLocator.nth(1)
        : tmpMonomerLocator.first();

    await rightMonomerLocator.hover({ force: true });
    // Do NOT put monomers to equel X or Y coordinates - connection line element become zero size (width or hight) and .hover() doesn't work
    await dragMouseTo(600, 375, page);
    await moveMouseAway(page);

    return {
      leftMonomer: leftMonomerLocator,
      rightMonomer: rightMonomerLocator,
    };
  }

  /*
  test(`temporary test for debug purposes1`, async () => {
    await bondTwoMonomersPointToPoint(
      page,
      baseMonomers['(R1,R2,R3)'],
      baseMonomers['(R1,R3,R4)'],
      'R3',
      'R1',
      MacroBondType.Single,
    );
  });
  test(`temporary test for debug purposes2`, async () => {
    await bondTwoMonomersByPointToPoint(
      page,
      baseMonomers['(R1,R2,R3)'],
      baseMonomers['(R1,R3,R4)'],
      'R3',
      'R4',
      MacroBondType.Single,
    );
  });
  */

  Object.values(baseMonomers).forEach((leftBase) => {
    Object.values(baseMonomers).forEach((rightBase) => {
      Object.values(leftBase.connectionPoints).forEach(
        (leftBaseConnectionPoint) => {
          Object.values(rightBase.connectionPoints).forEach(
            (rightBaseConnectionPoint) => {
              /*
               *  Test case: https://github.com/epam/ketcher/issues/3805
               *  Description: These bunch of tests validates that system able to establish connections for Base monomers.
               * For each %BaseType% from the library (baseMonomers)
               *   For each %BaseType2% from the library (baseMonomers)
               *      For each %ConnectionPoint% (avaliable connections of %BaseType%)
               *         For each %ConnectionPoint2% (avaliable connections of %BaseType2%) do:
               *  1. Clear canvas
               *  2. Load %BaseType% and %BaseType2% and put them on the canvas
               *  3. Establish connection between %BaseType%(%ConnectionPoint%) and %BaseType%(%ConnectionPoint2%)
               *  4. Validate canvas (connection should appear)
               */
              test(`Connect ${leftBaseConnectionPoint} to ${rightBaseConnectionPoint} of ${leftBase.alias} and ${rightBase.alias}`, async () => {
                test.setTimeout(30000);

                const {
                  leftMonomer: leftMonomerLocator,
                  rightMonomer: rightMonomerLocator,
                } = await loadTwoMonomers(page, leftBase, rightBase);

                const bondLine = await bondTwoMonomersPointToPoint(
                  page,
                  leftMonomerLocator,
                  rightMonomerLocator,
                  leftBaseConnectionPoint,
                  rightBaseConnectionPoint,
                );

                await expect(bondLine).toBeVisible();
              });
            },
          );
        },
      );
    });
  });

  const peptideMonomers: { [monomerName: string]: IMonomer } = {
    '(R1) - Left only': {
      monomerType: MonomerType.Peptide,
      fileName: 'KET/Peptide-Templates/01 - (R1) - Left only.ket',
      alias: '(R1)_-_Left_only',
      connectionPoints: {
        R1: 'R1',
      },
    },
    '(R2) - Right only': {
      monomerType: MonomerType.Peptide,
      fileName: 'KET/Peptide-Templates/02 - (R2) - Right only.ket',
      alias: '(R2)_-_Right_only',
      connectionPoints: {
        R2: 'R2',
      },
    },
    // '(R3) - Side only': {
    //   monomerType: MonomerType.Peptide,
    //   fileName: 'KET/Peptide-Templates/03 - (R3) - Side only.ket',
    //   alias: '(R3)_-_Side_only',
    //   connectionPoints: {
    //     R3: 'R3',
    //   },
    // },
    '(R1,R2) - R3 gap': {
      monomerType: MonomerType.Peptide,
      fileName: 'KET/Peptide-Templates/04 - (R1,R2) - R3 gap.ket',
      alias: '(R1,R2)_-_R3_gap',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
      },
    },
    '(R1,R3) - R2 gap': {
      monomerType: MonomerType.Peptide,
      fileName: 'KET/Peptide-Templates/05 - (R1,R3) - R2 gap.ket',
      alias: '(R1,R3)_-_R2_gap',
      connectionPoints: {
        R1: 'R1',
        R3: 'R3',
      },
    },
    '(R2,R3) - R1 gap': {
      monomerType: MonomerType.Peptide,
      fileName: 'KET/Peptide-Templates/06 - (R2,R3) - R1 gap.ket',
      alias: '(R2,R3)_-_R1_gap',
      connectionPoints: {
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R3,R4)': {
    //   monomerType: MonomerType.Peptide,
    //   fileName: 'KET/Peptide-Templates/07 - (R3,R4).ket',
    //   alias: '(R3,R4)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    '(R1,R2,R3)': {
      monomerType: MonomerType.Peptide,
      fileName: 'KET/Peptide-Templates/08 - (R1,R2,R3).ket',
      alias: '(R1,R2,R3)',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R1,R3,R4)': {
    //   monomerType: MonomerType.Peptide,
    //   fileName: 'KET/Peptide-Templates/09 - (R1,R3,R4).ket',
    //   alias: '(R1,R3,R4)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R2,R3,R4)': {
    //   monomerType: MonomerType.Peptide,
    //   fileName: 'KET/Peptide-Templates/10 - (R2,R3,R4).ket',
    //   alias: '(R2,R3,R4)',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R3,R4,R5)': {
    //   monomerType: MonomerType.Peptide,
    //   fileName: 'KET/Peptide-Templates/11 - (R3,R4,R5).ket',
    //   alias: '(R3,R4,R5)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R1,R2,R3,R4)': {
    //   monomerType: MonomerType.Peptide,
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
    //   monomerType: MonomerType.Peptide,
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
    //   monomerType: MonomerType.Peptide,
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
    //   monomerType: MonomerType.Peptide,
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
    J: {
      monomerType: MonomerType.Peptide,
      fileName:
        'KET/Peptide-Templates/16 - J - ambiguous alternatives from library (R1,R2).ket',
      alias: 'J',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
      },
    },
    // '%': {
    //   monomerType: MonomerType.Peptide,
    //   fileName: 'KET/Base-Templates/17 - J - ambiguous mixed (R1,R2).ket',
    //   alias: '%',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R2: 'R2',
    //   },
    // },
  };

  Object.values(baseMonomers).forEach((leftBase) => {
    Object.values(peptideMonomers).forEach((rightPeptide) => {
      Object.values(leftBase.connectionPoints).forEach(
        (leftBaseConnectionPoint) => {
          Object.values(rightPeptide.connectionPoints).forEach(
            (rightPeptideConnectionPoint) => {
              /*
               *  Test case: https://github.com/epam/ketcher/issues/4572 - Case 3 (Base - Peptide)
               *  Description: Check if possible to create bond from specific AP of one monomer to specific AP of another monomer ( Base - Peptides )
               * For each %baseType% from the library (baseMonomers)
               *   For each %peptideType% from the library (peptideMonomers)
               *      For each %ConnectionPoint% (avaliable connections of %baseType%)
               *         For each %ConnectionPoint2% (avaliable connections of %peptideType%) do:
               *  1. Clear canvas
               *  2. Load %baseType% and %peptideType% and put them on the canvas
               *  3. Establish connection between %baseType%(%ConnectionPoint%) and %peptideType%(%ConnectionPoint2%)
               *  4. Validate canvas (connection should appear)
               */
              test(`Case3: Cnnct ${leftBaseConnectionPoint} to ${rightPeptideConnectionPoint} of Base(${leftBase.alias}) and Peptide(${rightPeptide.alias})`, async () => {
                test.setTimeout(30000);

                const {
                  leftMonomer: leftMonomerLocator,
                  rightMonomer: rightMonomerLocator,
                } = await loadTwoMonomers(page, leftBase, rightPeptide);

                const bondLine = await bondTwoMonomersPointToPoint(
                  page,
                  leftMonomerLocator,
                  rightMonomerLocator,
                  leftBaseConnectionPoint,
                  rightPeptideConnectionPoint,
                );

                await expect(bondLine).toBeVisible();
              });
            },
          );
        },
      );
    });
  });

  const chemMonomers: { [monomerName: string]: IMonomer } = {
    '(R1) - Left only': {
      monomerType: MonomerType.CHEM,
      fileName: 'KET/CHEM-Templates/01 - (R1) - Left only.ket',
      alias: '(R1)_-_Left_only',
      connectionPoints: {
        R1: 'R1',
      },
    },
    '(R2) - Right only': {
      monomerType: MonomerType.CHEM,
      fileName: 'KET/CHEM-Templates/02 - (R2) - Right only.ket',
      alias: '(R2)_-_Right_only',
      connectionPoints: {
        R2: 'R2',
      },
    },
    // '(R3) - Side only': {
    //   monomerType: MonomerType.CHEM,
    //   fileName: 'KET/CHEM-Templates/03 - (R3) - Side only.ket',
    //   alias: '(R3)_-_Side_only',
    //   connectionPoints: {
    //     R3: 'R3',
    //   },
    // },
    '(R1,R2) - R3 gap': {
      monomerType: MonomerType.CHEM,
      fileName: 'KET/CHEM-Templates/04 - (R1,R2) - R3 gap.ket',
      alias: '(R1,R2)_-_R3_gap',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
      },
    },
    // '(R1,R3) - R2 gap': {
    //   monomerType: MonomerType.CHEM,
    //   fileName: 'KET/CHEM-Templates/05 - (R1,R3) - R2 gap.ket',
    //   alias: '(R1,R3)_-_R2_gap',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //   },
    // },
    // '(R2,R3) - R1 gap': {
    //   monomerType: MonomerType.CHEM,
    //   fileName: 'KET/CHEM-Templates/06 - (R2,R3) - R1 gap.ket',
    //   alias: '(R2,R3)_-_R1_gap',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //   },
    // },
    // '(R3,R4)': {
    //   monomerType: MonomerType.CHEM,
    //   fileName: 'KET/CHEM-Templates/07 - (R3,R4).ket',
    //   alias: '(R3,R4)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    '(R1,R2,R3)': {
      monomerType: MonomerType.CHEM,
      fileName: 'KET/CHEM-Templates/08 - (R1,R2,R3).ket',
      alias: '(R1,R2,R3)',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R1,R3,R4)': {
    //   monomerType: MonomerType.CHEM,
    //   fileName: 'KET/CHEM-Templates/09 - (R1,R3,R4).ket',
    //   alias: '(R1,R3,R4)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R2,R3,R4)': {
    //   monomerType: MonomerType.CHEM,
    //   fileName: 'KET/CHEM-Templates/10 - (R2,R3,R4).ket',
    //   alias: '(R2,R3,R4)',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R3,R4,R5)': {
    //   monomerType: MonomerType.CHEM,
    //   fileName: 'KET/CHEM-Templates/11 - (R3,R4,R5).ket',
    //   alias: '(R3,R4,R5)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    '(R1,R2,R3,R4)': {
      monomerType: MonomerType.CHEM,
      fileName: 'KET/CHEM-Templates/12 - (R1,R2,R3,R4).ket',
      alias: '(R1,R2,R3,R4)',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
        R4: 'R4',
      },
    },
    // '(R1,R3,R4,R5)': {
    //   monomerType: MonomerType.CHEM,
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
    //   monomerType: MonomerType.CHEM,
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
    //   monomerType: MonomerType.CHEM,
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

  Object.values(baseMonomers).forEach((leftBase) => {
    Object.values(chemMonomers).forEach((rightCHEM) => {
      Object.values(leftBase.connectionPoints).forEach(
        (leftBaseConnectionPoint) => {
          Object.values(rightCHEM.connectionPoints).forEach(
            (rightCHEMConnectionPoint) => {
              /*
               *  Test case: https://github.com/epam/ketcher/issues/4572 - Case 4 (Base - CHEM)
               *  Description: Check if possible to create bond from specific AP of one monomer to specific AP of another monomer ( Base - CHEM )
               * For each %baseType% from the library (baseMonomers)
               *   For each %CHEMType% from the library (CHEMMonomers)
               *      For each %ConnectionPoint% (avaliable connections of %baseType%)
               *         For each %ConnectionPoint2% (avaliable connections of %CHEMType%) do:
               *  1. Clear canvas
               *  2. Load %baseType% and %CHEMType% and put them on the canvas
               *  3. Establish connection between %baseType%(%ConnectionPoint%) and %CHEMType%(%ConnectionPoint2%)
               *  4. Validate canvas (connection should appear)
               */
              test(`Case4: Cnnct ${leftBaseConnectionPoint} to ${rightCHEMConnectionPoint} of Base(${leftBase.alias}) and CHEM(${rightCHEM.alias})`, async () => {
                test.setTimeout(30000);

                const {
                  leftMonomer: leftMonomerLocator,
                  rightMonomer: rightMonomerLocator,
                } = await loadTwoMonomers(page, leftBase, rightCHEM);

                const bondLine = await bondTwoMonomersPointToPoint(
                  page,
                  leftMonomerLocator,
                  rightMonomerLocator,
                  leftBaseConnectionPoint,
                  rightCHEMConnectionPoint,
                );

                await expect(bondLine).toBeVisible();
              });
            },
          );
        },
      );
    });
  });

  Object.values(baseMonomers).forEach((leftBase) => {
    Object.values(peptideMonomers).forEach((rightPeptide) => {
      /*
       *  Test case: https://github.com/epam/ketcher/issues/4592 - Case 4 (Base - Peptide)
       *  Description: User can connect any Base to any Peptide using center-to-center way.
       * For each %baseType% from the library (baseMonomers)
       *   For each %peptideType% from the library (peptideMonomers)
       *  1. Clear canvas
       *  2. Load %baseType% and %peptideType% and put them on the canvas
       *  3. Establish connection between %baseType%(center) and %peptideType%(center) (select free connection points in appeared dialog)
       *  4. Validate canvas (connection should appear)
       */
      test(`Case5: Cnnct Center to Center of Base(${leftBase.alias}) and Peptide(${rightPeptide.alias})`, async () => {
        test.setTimeout(30000);

        const {
          leftMonomer: leftMonomerLocator,
          rightMonomer: rightMonomerLocator,
        } = await loadTwoMonomers(page, leftBase, rightPeptide);

        const bondLine = await bondTwoMonomersPointToPoint(
          page,
          leftMonomerLocator,
          rightMonomerLocator,
          undefined,
          undefined,
          undefined,
          true,
        );

        await expect(bondLine).toBeVisible();
      });
    });
  });

  Object.values(baseMonomers).forEach((leftBase) => {
    Object.values(chemMonomers).forEach((rightCHEM) => {
      /*
       *  Test case: https://github.com/epam/ketcher/issues/4592 - Case 7 (Base - CHEM)
       *  Description: User can connect any Phosphate to any CHEM using center-to-center way.
       * For each %baseType% from the library (baseMonomers)
       *   For each %CHEMType% from the library (chemMonomers)
       *  1. Clear canvas
       *  2. Load %baseType% and %CHEMType% and put them on the canvas
       *  3. Establish connection between %baseType%(center) and %CHEMType%(center) (select free connection points in appeared dialog)
       *  4. Validate canvas (connection should appear)
       */
      test(`Case6: Cnnct Center to Center of Base(${leftBase.alias}) and CHEM(${rightCHEM.alias})`, async () => {
        test.setTimeout(30000);

        const {
          leftMonomer: leftMonomerLocator,
          rightMonomer: rightMonomerLocator,
        } = await loadTwoMonomers(page, leftBase, rightCHEM);

        const bondLine = await bondTwoMonomersPointToPoint(
          page,
          leftMonomerLocator,
          rightMonomerLocator,
          undefined,
          undefined,
          undefined,
          true,
        );

        await expect(bondLine).toBeVisible();
      });
    });
  });

  const ordinaryMoleculeMonomers: { [monomerName: string]: IMonomer } = {
    '(R1) - Left only': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/01 - (R1) - Left only.ket',
      alias: 'F1',
      connectionPoints: {
        R1: 'R1',
      },
    },
    '(R2) - Right only': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/02 - (R2) - Right only.ket',
      alias: 'F1',
      connectionPoints: {
        R2: 'R2',
      },
    },
    '(R3) - Side only': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/03 - (R3) - Side only.ket',
      alias: 'F1',
      connectionPoints: {
        R3: 'R3',
      },
    },
    '(R1,R2) - R3 gap': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/04 - (R1,R2) - R3 gap.ket',
      alias: 'F1',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
      },
    },
    '(R1,R3) - R2 gap': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/05 - (R1,R3) - R2 gap.ket',
      alias: 'F1',
      connectionPoints: {
        R1: 'R1',
        R3: 'R3',
      },
    },
    '(R2,R3) - R1 gap': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/06 - (R2,R3) - R1 gap.ket',
      alias: 'F1',
      connectionPoints: {
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R3,R4)': {
    //   monomerType: MonomerType.Molecule,
    //   fileName: 'KET/Ordinary-Molecule-Templates/07 - (R3,R4).ket',
    //   alias: 'F1',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    '(R1,R2,R3)': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/08 - (R1,R2,R3).ket',
      alias: 'F1',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R1,R3,R4)': {
    //   monomerType: MonomerType.Molecule,
    //   fileName: 'KET/Ordinary-Molecule-Templates/09 - (R1,R3,R4).ket',
    //   alias: 'F1',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R2,R3,R4)': {
    //   monomerType: MonomerType.Molecule,
    //   fileName: 'KET/Ordinary-Molecule-Templates/10 - (R2,R3,R4).ket',
    //   alias: 'F1',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R3,R4,R5)': {
    //   monomerType: MonomerType.Molecule,
    //   fileName: 'KET/Ordinary-Molecule-Templates/11 - (R3,R4,R5).ket',
    //   alias: 'F1',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    '(R1,R2,R3,R4)': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/12 - (R1,R2,R3,R4).ket',
      alias: 'F1',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
        R4: 'R4',
      },
    },
    // '(R1,R3,R4,R5)': {
    //   monomerType: MonomerType.Molecule,
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
    //   monomerType: MonomerType.Molecule,
    //   fileName: 'KET/Ordinary-Molecule-Templates/14 - (R2,R3,R4,R5).ket',
    //   alias: 'F1',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    '(R1,R2,R3,R4,R5)': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/15 - (R1,R2,R3,R4,R5).ket',
      alias: 'F1',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
        R4: 'R4',
        R5: 'R5',
      },
    },
  };

  let ordinaryMoleculeName: string;

  Object.values(baseMonomers).forEach((leftBase) => {
    Object.values(ordinaryMoleculeMonomers).forEach((rightOM) => {
      Object.values(leftBase.connectionPoints).forEach(
        (leftBaseConnectionPoint) => {
          Object.values(rightOM.connectionPoints).forEach(
            (rightOMConnectionPoint) => {
              /*
               *  Test case: https://github.com/epam/ketcher/issues/4882 - Case 4
               *  Description: Check if possible to create bond from specific AP of one monomer to specific AP of another monomer ( Base - Ordinary Molecule )
               * For each %chemType% from the library (baseMonomers)
               *   For each %OMType% from the library (ordinaryMoleculeMonomers)
               *      For each %ConnectionPoint% (avaliable connections of %chemType%)
               *         For each %ConnectionPoint2% (avaliable connections of %OMType%) do:
               *  1. Clear canvas
               *  2. Load %chemType% and %OMType% and put them on the canvas
               *  3. Establish connection between %chemType%(%ConnectionPoint%) and %OMType%(%ConnectionPoint2%)
               *  4. Validate canvas (connection should appear)
               */
              ordinaryMoleculeName = rightOM.fileName.substring(
                rightOM.fileName.indexOf(' - '),
                rightOM.fileName.lastIndexOf('.ket'),
              );
              test(`Test case8: Connect ${leftBaseConnectionPoint} to ${rightOMConnectionPoint} of Base(${leftBase.alias}) and OM(${ordinaryMoleculeName})`, async () => {
                test.setTimeout(30000);

                const {
                  leftMonomer: leftMonomerLocator,
                  rightMonomer: rightMonomerLocator,
                } = await loadTwoMonomers(page, leftBase, rightOM);

                const bondLine = await bondTwoMonomersPointToPoint(
                  page,
                  leftMonomerLocator,
                  rightMonomerLocator,
                  leftBaseConnectionPoint,
                  rightOMConnectionPoint,
                );

                await expect(bondLine).toBeVisible();
              });
            },
          );
        },
      );
    });
  });

  Object.values(baseMonomers).forEach((leftBase) => {
    Object.values(ordinaryMoleculeMonomers).forEach((rightOrdinaryMolecule) => {
      /*
       *  Test case: https://github.com/epam/ketcher/issues/4882 - Case 9
       *  Description: User can connect any Base to any OrdinaryMolecule using center-to-center way.
       *               Select Connection Points dialog opened.
       */
      ordinaryMoleculeName = rightOrdinaryMolecule.fileName.substring(
        rightOrdinaryMolecule.fileName.indexOf(' - '),
        rightOrdinaryMolecule.fileName.lastIndexOf('.ket'),
      );

      test(`Case 9: Connect Center to Center of Base(${leftBase.alias}) and OrdinaryMolecule(${ordinaryMoleculeName})`, async () => {
        test.setTimeout(30000);

        const {
          leftMonomer: leftMonomerLocator,
          rightMonomer: rightMonomerLocator,
        } = await loadTwoMonomers(page, leftBase, rightOrdinaryMolecule);

        const bondLine = await bondTwoMonomersPointToPoint(
          page,
          leftMonomerLocator,
          rightMonomerLocator,
          undefined,
          undefined,
          undefined,
          true,
        );

        await expect(bondLine).toBeVisible();
      });
    });
  });

  interface IMolecule {
    moleculeType: string;
    fileName: string;
    alias: string;
    atomLocatorSelectors: string[];
    connectionPointShifts: { x: number; y: number }[];
  }

  const molecules: { [moleculeName: string]: IMolecule } = {
    'Benzene ring': {
      moleculeType: 'Molecule',
      fileName: 'KET/Molecule-Templates/1 - Benzene ring.ket',
      alias: 'Benzene ring',
      atomLocatorSelectors: [
        'g > circle',
        'g:nth-child(2) > circle',
        'g:nth-child(3) > circle',
        'g:nth-child(4) > circle',
        'g:nth-child(5) > circle',
        'g:nth-child(6) > circle',
      ],
      connectionPointShifts: [
        { x: 0, y: 2 },
        { x: -2, y: 2 },
        { x: 2, y: 2 },
        { x: 0, y: -2 },
        { x: 2, y: -2 },
        { x: -2, y: -2 },
      ],
    },
  };

  async function loadMonomer(page: Page, leftMonomer: IMonomer) {
    await openFileAndAddToCanvasMacro(leftMonomer.fileName, page);
    await getMonomerLocator(page, {
      monomerAlias: leftMonomer.alias,
    })
      .first()
      .hover();
    await dragMouseTo(300, 380, page);
    await moveMouseAway(page);
  }

  async function loadMolecule(page: Page, molecule: IMolecule) {
    await openFileAndAddToCanvasMacro(molecule.fileName, page);
    await moveMouseAway(page);
  }

  async function bondMonomerPointToAtom(
    page: Page,
    leftPeptide: IMonomer,
    rightMolecule: IMolecule,
    attachmentPoint: string,
    atomIndex: number,
  ) {
    const leftPeptideLocator = getMonomerLocator(page, {
      monomerAlias: leftPeptide.alias,
    }).first();

    const rightMoleculeLocator = page
      .getByTestId('ketcher-canvas')
      .locator(rightMolecule.atomLocatorSelectors[atomIndex])
      .first();

    await bondMonomerPointToMoleculeAtom(
      page,
      leftPeptideLocator,
      rightMoleculeLocator,
      attachmentPoint,
      rightMolecule.connectionPointShifts[atomIndex],
    );
  }

  Object.values(baseMonomers).forEach((leftMonomer) => {
    Object.values(molecules).forEach((rightMolecule) => {
      /*
       *  Test task: https://github.com/epam/ketcher/issues/5960
       *  Description: Verify that connection points between monomers and molecules can be created by drawing bonds in macro mode
       *  Case: Connect monomer all commection points to moleule atoms
       *  Step: 1. Load monomer (base) and shift it to the left
       *        2. Load molecule (system loads it at the center)
       *        3. Drag every connection point of monomer to any free atom of molecule
       *        Expected result: Connection should be established
       */
      test(`Case 11: Connect evey connection point of Base(${leftMonomer.alias}) to atom of MicroMolecule(${rightMolecule.alias})`, async () => {
        test.setTimeout(30000);

        await loadMonomer(page, leftMonomer);
        await loadMolecule(page, rightMolecule);

        const attachmentPointCount = Object.keys(
          leftMonomer.connectionPoints,
        ).length;
        const atomCount = Object.keys(
          rightMolecule.atomLocatorSelectors,
        ).length;

        for (
          let atomIndex = 0;
          atomIndex < Math.min(attachmentPointCount, atomCount);
          atomIndex++
        ) {
          await bondMonomerPointToAtom(
            page,
            leftMonomer,
            rightMolecule,
            Object.keys(leftMonomer.connectionPoints)[atomIndex],
            atomIndex,
          );
        }

        await takeEditorScreenshot(page, {
          hideMonomerPreview: true,
        });
      });
    });
  });
});
