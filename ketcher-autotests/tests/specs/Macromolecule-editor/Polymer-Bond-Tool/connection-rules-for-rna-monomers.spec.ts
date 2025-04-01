/* eslint-disable no-magic-numbers */
import { Page, test, Locator } from '@playwright/test';
import {
  selectClearCanvasTool,
  turnOnMacromoleculesEditor,
} from '@tests/pages/common/TopLeftToolbar';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvasMacro,
  moveMouseAway,
  dragMouseTo,
  resetZoomLevelToDefault,
  waitForPageInit,
  MonomerType,
} from '@utils';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { bondTwoMonomersPointToPoint } from '@utils/macromolecules/polymerBond';

test.describe('Connection rules for RNAs: ', () => {
  let page: Page;
  test.setTimeout(400000);
  test.describe.configure({ retries: 0 });

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test.afterEach(async () => {
    await resetZoomLevelToDefault(page);
    await selectClearCanvasTool(page);
  });

  test.afterAll(async ({ browser }) => {
    await Promise.all(browser.contexts().map((context) => context.close()));
  });

  interface IMonomer {
    monomerType: MonomerType;
    fileName: string;
    alias: string;
    connectionPoints: { [connectionPointName: string]: string };
  }

  const sugarMonomers: { [monomerName: string]: IMonomer } = {
    '(R1) - Left only': {
      monomerType: MonomerType.Sugar,
      fileName: 'KET/Sugar-Templates/01 - (R1) - Left only.ket',
      alias: '(R1)_-_Left_only',
      connectionPoints: {
        R1: 'R1',
      },
    },
    '(R2) - Right only': {
      monomerType: MonomerType.Sugar,
      fileName: 'KET/Sugar-Templates/02 - (R2) - Right only.ket',
      alias: '(R2)_-_Right_only',
      connectionPoints: {
        R2: 'R2',
      },
    },
    // '(R3) - Side only': {
    //   monomerType: MonomerType.Sugar,
    //   fileName: 'KET/Sugar-Templates/03 - (R3) - Side only.ket',
    //   alias: '(R3)_-_Side_only',
    //   connectionPoints: {
    //     R3: 'R3',
    //   },
    // },
    '(R1,R2) - R3 gap': {
      monomerType: MonomerType.Sugar,
      fileName: 'KET/Sugar-Templates/04 - (R1,R2) - R3 gap.ket',
      alias: '(R1,R2)_-_R3_gap',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
      },
    },
    '(R1,R3) - R2 gap': {
      monomerType: MonomerType.Sugar,
      fileName: 'KET/Sugar-Templates/05 - (R1,R3) - R2 gap.ket',
      alias: '(R1,R3)_-_R2_gap',
      connectionPoints: {
        R1: 'R1',
        R3: 'R3',
      },
    },
    '(R2,R3) - R1 gap': {
      monomerType: MonomerType.Sugar,
      fileName: 'KET/Sugar-Templates/06 - (R2,R3) - R1 gap.ket',
      alias: '(R2,R3)_-_R1_gap',
      connectionPoints: {
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R3,R4)': {
    //        monomerType: MonomerType.Sugar,
    //   fileName: 'KET/Sugar-Templates/07 - (R3,R4).ket',
    //   alias: '(R3,R4)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    '(R1,R2,R3)': {
      monomerType: MonomerType.Sugar,
      fileName: 'KET/Sugar-Templates/08 - (R1,R2,R3).ket',
      alias: '(R1,R2,R3)',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
        R3: 'R3',
      },
    },
    // '(R1,R3,R4)': {
    // monomerType: MonomerType.Sugar,
    //   fileName: 'KET/Sugar-Templates/09 - (R1,R3,R4).ket',
    //   alias: '(R1,R3,R4)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R2,R3,R4)': {
    // monomerType: MonomerType.Sugar,
    //   fileName: 'KET/Sugar-Templates/10 - (R2,R3,R4).ket',
    //   alias: '(R2,R3,R4)',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R3,R4,R5)': {
    // monomerType: MonomerType.Sugar,
    //   fileName: 'KET/Sugar-Templates/11 - (R3,R4,R5).ket',
    //   alias: '(R3,R4,R5)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R1,R2,R3,R4)': {
    // monomerType: MonomerType.Sugar,
    //   fileName: 'KET/Sugar-Templates/12 - (R1,R2,R3,R4).ket',
    //   alias: '(R1,R2,R3,R4)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R1,R3,R4,R5)': {
    // monomerType: MonomerType.Sugar,
    //   fileName: 'KET/Sugar-Templates/13 - (R1,R3,R4,R5).ket',
    //   alias: '(R1,R3,R4,R5)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R2,R3,R4,R5)': {
    // monomerType: MonomerType.Sugar,
    //   fileName: 'KET/Sugar-Templates/14 - (R2,R3,R4,R5).ket',
    //   alias: '(R2,R3,R4,R5)',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R1,R2,R3,R4,R5)': {
    // monomerType: MonomerType.Sugar,
    //   fileName: 'KET/Sugar-Templates/15 - (R1,R2,R3,R4,R5).ket',
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

  const phosphateMonomers: { [monomerName: string]: IMonomer } = {
    '(R1) - Left only': {
      monomerType: MonomerType.Phosphate,
      fileName: 'KET/Phosphate-Templates/01 - (R1) - Left only.ket',
      alias: '(R1)_-_Left_only',
      connectionPoints: {
        R1: 'R1',
      },
    },
    '(R2) - Right only': {
      monomerType: MonomerType.Phosphate,
      fileName: 'KET/Phosphate-Templates/02 - (R2) - Right only.ket',
      alias: '(R2)_-_Right_only',
      connectionPoints: {
        R2: 'R2',
      },
    },
    // '(R3) - Side only': {
    //   monomerType: MonomerType.Phosphate,
    //   fileName: 'KET/Phosphate-Templates/03 - (R3) - Side only.ket',
    //   alias: '(R3)_-_Side_only',
    //   connectionPoints: {
    //     R3: 'R3',
    //   },
    // },
    '(R1,R2) - R3 gap': {
      monomerType: MonomerType.Phosphate,
      fileName: 'KET/Phosphate-Templates/04 - (R1,R2) - R3 gap.ket',
      alias: '(R1,R2)_-_R3_gap',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
      },
    },
    // '(R1,R3) - R2 gap': {
    //   monomerType: MonomerType.Phosphate,
    //   fileName: 'KET/Phosphate-Templates/05 - (R1,R3) - R2 gap.ket',
    //   alias: '(R1,R3)_-_R2_gap',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //   },
    // },
    // '(R2,R3) - R1 gap': {
    //   monomerType: MonomerType.Phosphate,
    //   fileName: 'KET/Phosphate-Templates/06 - (R2,R3) - R1 gap.ket',
    //   alias: '(R2,R3)_-_R1_gap',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //   },
    // },
    // '(R3,R4)': {
    //        monomerType: MonomerType.Phosphate,
    //   fileName: 'KET/Phosphate-Templates/07 - (R3,R4).ket',
    //   alias: '(R3,R4)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R1,R2,R3)': {
    //   monomerType: MonomerType.Phosphate,
    //   fileName: 'KET/Phosphate-Templates/08 - (R1,R2,R3).ket',
    //   alias: '(R1,R2,R3)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R2: 'R2',
    //     R3: 'R3',
    //   },
    // },
    // '(R1,R3,R4)': {
    // monomerType: MonomerType.Phosphate,
    //   fileName: 'KET/Phosphate-Templates/09 - (R1,R3,R4).ket',
    //   alias: '(R1,R3,R4)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R2,R3,R4)': {
    // monomerType: MonomerType.Phosphate,
    //   fileName: 'KET/Phosphate-Templates/10 - (R2,R3,R4).ket',
    //   alias: '(R2,R3,R4)',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R3,R4,R5)': {
    // monomerType: MonomerType.Phosphate,
    //   fileName: 'KET/Phosphate-Templates/11 - (R3,R4,R5).ket',
    //   alias: '(R3,R4,R5)',
    //   connectionPoints: {
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R1,R2,R3,R4)': {
    // monomerType: MonomerType.Phosphate,
    //   fileName: 'KET/Phosphate-Templates/12 - (R1,R2,R3,R4).ket',
    //   alias: '(R1,R2,R3,R4)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //   },
    // },
    // '(R1,R3,R4,R5)': {
    // monomerType: MonomerType.Phosphate,
    //   fileName: 'KET/Phosphate-Templates/13 - (R1,R3,R4,R5).ket',
    //   alias: '(R1,R3,R4,R5)',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R2,R3,R4,R5)': {
    // monomerType: MonomerType.Phosphate,
    //   fileName: 'KET/Phosphate-Templates/14 - (R2,R3,R4,R5).ket',
    //   alias: '(R2,R3,R4,R5)',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //     R4: 'R4',
    //     R5: 'R5',
    //   },
    // },
    // '(R1,R2,R3,R4,R5)': {
    // monomerType: MonomerType.Phosphate,
    //   fileName: 'KET/Phosphate-Templates/15 - (R1,R2,R3,R4,R5).ket',
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

  async function bondTwoMonomersByCenterToCenter(
    page: Page,
    leftMonomer: IMonomer,
    rightMonomer: IMonomer,
  ) {
    const leftMonomerLocator = getMonomerLocator(page, {
      monomerAlias: leftMonomer.alias,
    }).first();

    const rightMonomerLocators = getMonomerLocator(page, {
      monomerAlias: rightMonomer.alias,
    });

    const rightMonomerLocator =
      (await page.getByText(leftMonomer.alias).count()) > 1
        ? rightMonomerLocators.nth(1)
        : rightMonomerLocators.nth(0);

    await rightMonomerLocator.hover();

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

  Object.values(sugarMonomers).forEach((leftSugar) => {
    Object.values(baseMonomers).forEach((rightBase) => {
      /*
       *  Test case: https://github.com/epam/ketcher/issues/3809 - Case 1
       *  Sugar could be connected with base using R3 of sugar and R1 of base. (Center-to-center connection)
       *  If no R3 available - open Select Connection Points dialog
       */
      test(`Case 1: Connect Center to Center of Sugar(${leftSugar.alias}) and Base(${rightBase.alias})`, async () => {
        test.setTimeout(40000);

        await loadTwoMonomers(page, leftSugar, rightBase);

        await bondTwoMonomersByCenterToCenter(page, leftSugar, rightBase);

        // await zoomWithMouseWheel(page, -500);

        const bondLine = page.locator('g[pointer-events="stroke"]').first();
        await bondLine.hover();

        await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.01 });
      });
    });
  });

  Object.values(phosphateMonomers).forEach((leftPhosphate) => {
    Object.values(sugarMonomers).forEach((rightSugar) => {
      /*
       *  Test case: https://github.com/epam/ketcher/issues/3809 - Case 2.1
       *  If user drags a bond from phosphate to sugar then R2 of phosphate is connected with R1 of sugar (Center to Center).
       *  If R2 is not available but R1 is than system establishes Sugar(R1)-Phosphate(R2)
       */
      test(`Case 2.1: Connect Center to Center of Phosphate(${leftPhosphate.alias}) and Sugar(${rightSugar.alias})`, async () => {
        test.setTimeout(20000);

        await loadTwoMonomers(page, leftPhosphate, rightSugar);

        await bondTwoMonomersByCenterToCenter(page, leftPhosphate, rightSugar);

        // await zoomWithMouseWheel(page, -600);

        const bondLine = page.locator('g[pointer-events="stroke"]').first();
        await bondLine.hover();

        await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.01 });
      });
    });
  });

  Object.values(sugarMonomers).forEach((leftSugar) => {
    Object.values(phosphateMonomers).forEach((rightPhosphate) => {
      /*
       *  Test case: https://github.com/epam/ketcher/issues/3809 - Case 2.2
       *  If user drags a bond for sugar to phosphate then R2 of sugar is connected with the R1 of phosphate (Center to Center).
       *  If R2 is not available but R1 is than system establishes Phosphate(R1)-Sugar(R2)
       */
      test(`Case 2.2: Connect Center to Center of Sugar(${leftSugar.alias}) and Phosphate(${rightPhosphate.alias})`, async () => {
        test.setTimeout(20000);

        await loadTwoMonomers(page, leftSugar, rightPhosphate);

        await bondTwoMonomersByCenterToCenter(page, leftSugar, rightPhosphate);

        // await zoomWithMouseWheel(page, -600);

        const bondLine = page.locator('g[pointer-events="stroke"]').first();
        await bondLine.hover();

        await takeEditorScreenshot(page, { maxDiffPixelRatio: 0.01 });
      });
    });
  });
});
