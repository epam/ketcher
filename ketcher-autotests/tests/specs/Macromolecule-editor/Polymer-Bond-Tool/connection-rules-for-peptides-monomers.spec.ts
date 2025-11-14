/* eslint-disable no-magic-numbers */
import { Locator, Page, test, expect } from '@fixtures';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvasMacro,
  moveMouseAway,
  dragMouseTo,
  waitForPageInit,
  resetZoomLevelToDefault,
  MonomerType,
} from '@utils';
import {
  getMonomerLocator,
  AttachmentPoint,
} from '@utils/macromolecules/monomer';
import {
  bondMonomerPointToMoleculeAtom,
  bondTwoMonomersPointToPoint,
} from '@utils/macromolecules/polymerBond';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { KETCHER_CANVAS } from '@tests/pages/constants/canvas/Constants';

test.describe('Connection rules for peptides: ', () => {
  let page: Page;
  test.setTimeout(400000);
  test.describe.configure({ retries: 0 });

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    await waitForPageInit(page);
    await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  });

  test.afterEach(async () => {
    await resetZoomLevelToDefault(page);
    await CommonTopLeftToolbar(page).clearCanvas();
  });

  test.afterAll(async ({ browser }) => {
    await Promise.all(browser.contexts().map((context) => context.close()));
  });

  interface IMolecule {
    moleculeType: string;
    fileName: string;
    alias: string;
    atomLocatorSelectors: string[];
    attachmentPointShifts: { x: number; y: number }[];
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
      attachmentPointShifts: [
        { x: 0, y: 2 },
        { x: -2, y: 2 },
        { x: 2, y: 2 },
        { x: 0, y: -2 },
        { x: 2, y: -2 },
        { x: -2, y: -2 },
      ],
    },
  };

  interface IMonomer {
    monomerType: MonomerType;
    fileName: string;
    alias: string;
    attachmentPoints: { [connectionPointName: string]: AttachmentPoint };
  }

  const peptideMonomers: { [monomerName: string]: IMonomer } = {
    '(R1) - Left only': {
      monomerType: MonomerType.Peptide,
      fileName: 'KET/Peptide-Templates/01 - (R1) - Left only.ket',
      alias: '(R1)_-_Left_only',
      attachmentPoints: {
        R1: AttachmentPoint.R1,
      },
    },
    '(R2) - Right only': {
      monomerType: MonomerType.Peptide,
      fileName: 'KET/Peptide-Templates/02 - (R2) - Right only.ket',
      alias: '(R2)_-_Right_only',
      attachmentPoints: {
        R2: AttachmentPoint.R2,
      },
    },
    // '(R3) - Side only': {
    '(R1,R2) - R3 gap': {
      monomerType: MonomerType.Peptide,
      fileName: 'KET/Peptide-Templates/04 - (R1,R2) - R3 gap.ket',
      alias: '(R1,R2)_-_R3_gap',
      attachmentPoints: {
        R1: AttachmentPoint.R1,
        R2: AttachmentPoint.R2,
      },
    },
    '(R1,R3) - R2 gap': {
      monomerType: MonomerType.Peptide,
      fileName: 'KET/Peptide-Templates/05 - (R1,R3) - R2 gap.ket',
      alias: '(R1,R3)_-_R2_gap',
      attachmentPoints: {
        R1: AttachmentPoint.R1,
        R3: AttachmentPoint.R3,
      },
    },
    '(R2,R3) - R1 gap': {
      monomerType: MonomerType.Peptide,
      fileName: 'KET/Peptide-Templates/06 - (R2,R3) - R1 gap.ket',
      alias: '(R2,R3)_-_R1_gap',
      attachmentPoints: {
        R2: AttachmentPoint.R2,
        R3: AttachmentPoint.R3,
      },
    },
    // '(R3,R4)': {
    '(R1,R2,R3)': {
      monomerType: MonomerType.Peptide,
      fileName: 'KET/Peptide-Templates/08 - (R1,R2,R3).ket',
      alias: '(R1,R2,R3)',
      attachmentPoints: {
        R1: AttachmentPoint.R1,
        R2: AttachmentPoint.R2,
        R3: AttachmentPoint.R3,
      },
    },
    // '(R1,R3,R4)': {
    // '(R2,R3,R4)': {
    // '(R3,R4,R5)': {
    // '(R1,R2,R3,R4)': {
    // '(R1,R3,R4,R5)': {
    // '(R2,R3,R4,R5)': {
    // '(R1,R2,R3,R4,R5)': {
    J: {
      monomerType: MonomerType.Peptide,
      fileName:
        'KET/Peptide-Templates/16 - J - ambiguous alternatives from library (R1,R2).ket',
      alias: 'J',
      attachmentPoints: {
        R1: AttachmentPoint.R1,
        R2: AttachmentPoint.R2,
      },
    },
    // '%': {
  };

  const tmpPeptideMonomers: { [monomerName: string]: IMonomer } = {
    'Test-6-P-x': {
      monomerType: MonomerType.Peptide,
      fileName: 'KET/Peptide-Templates/Test-6-P-x.ket',
      alias: 'Test-6-P-x',
      attachmentPoints: {
        R1: AttachmentPoint.R1,
        R2: AttachmentPoint.R2,
        R3: AttachmentPoint.R3,
        R4: AttachmentPoint.R4,
        R5: AttachmentPoint.R5,
      },
    },
    'Test-6-P-Main': {
      monomerType: MonomerType.Peptide,
      fileName:
        'KET/Peptide-Templates/peptide-connection-rules-cases-template.ket',
      alias: 'Test-6-P-x',
      attachmentPoints: {
        R1: AttachmentPoint.R1,
        R2: AttachmentPoint.R2,
        R3: AttachmentPoint.R3,
        R4: AttachmentPoint.R4,
        R5: AttachmentPoint.R5,
        R6: AttachmentPoint.R6,
      },
    },
    'Test-6-P-1': {
      monomerType: MonomerType.Peptide,
      fileName:
        'KET/Peptide-Templates/peptide-connection-rules-cases-template.ket',
      alias: 'Test-6-P-1',
      attachmentPoints: {
        R1: AttachmentPoint.R1,
        R2: AttachmentPoint.R2,
        R3: AttachmentPoint.R3,
        R4: AttachmentPoint.R4,
        R5: AttachmentPoint.R5,
        R6: AttachmentPoint.R6,
      },
    },
    'Test-6-P-2': {
      monomerType: MonomerType.Peptide,
      fileName:
        'KET/Peptide-Templates/peptide-connection-rules-cases-template.ket',
      alias: 'Test-6-P-2',
      attachmentPoints: {
        R1: AttachmentPoint.R1,
        R2: AttachmentPoint.R2,
        R3: AttachmentPoint.R3,
        R4: AttachmentPoint.R4,
        R5: AttachmentPoint.R5,
        R6: AttachmentPoint.R6,
      },
    },
    'Test-6-P-3': {
      monomerType: MonomerType.Peptide,
      fileName:
        'KET/Peptide-Templates/peptide-connection-rules-cases-template.ket',
      alias: 'Test-6-P-3',
      attachmentPoints: {
        R1: AttachmentPoint.R1,
        R2: AttachmentPoint.R2,
        R3: AttachmentPoint.R3,
        R4: AttachmentPoint.R4,
        R5: AttachmentPoint.R5,
        R6: AttachmentPoint.R6,
      },
    },
    'Test-6-P-4': {
      monomerType: MonomerType.Peptide,
      fileName:
        'KET/Peptide-Templates/peptide-connection-rules-cases-template.ket',
      alias: 'Test-6-P-4',
      attachmentPoints: {
        R1: AttachmentPoint.R1,
        R2: AttachmentPoint.R2,
        R3: AttachmentPoint.R3,
        R4: AttachmentPoint.R4,
        R5: AttachmentPoint.R5,
        R6: AttachmentPoint.R6,
      },
    },
    'Test-6-P-5': {
      monomerType: MonomerType.Peptide,
      fileName:
        'KET/Peptide-Templates/peptide-connection-rules-cases-template.ket',
      alias: 'Test-6-P-5',
      attachmentPoints: {
        R1: AttachmentPoint.R1,
        R2: AttachmentPoint.R2,
        R3: AttachmentPoint.R3,
        R4: AttachmentPoint.R4,
        R5: AttachmentPoint.R5,
        R6: AttachmentPoint.R6,
      },
    },
  };

  async function prepareCanvasOneFreeAPLeft(
    page: Page,
    peptide: IMonomer,
    freePeptideAttachmentPoint: string,
  ): Promise<{ leftMonomer: Locator; rightMonomer: Locator }> {
    await openFileAndAddToCanvasMacro(
      page,
      tmpPeptideMonomers['Test-6-P-1'].fileName,
    );

    await openFileAndAddToCanvasMacro(page, peptide.fileName);
    const peptideLocator = getMonomerLocator(page, {
      monomerAlias: peptide.alias,
    }).first();
    await peptideLocator.hover();
    await dragMouseTo(550, 370, page);
    await moveMouseAway(page);

    for await (const peptideAttachmentPoint of Object.values(
      peptide.attachmentPoints,
    )) {
      const tmpPeptide =
        tmpPeptideMonomers[`Test-6-P-${peptideAttachmentPoint[1]}`];
      if (peptideAttachmentPoint !== freePeptideAttachmentPoint) {
        await bondTwoMonomersByPointToPoint(
          page,
          peptide,
          tmpPeptide,
          peptideAttachmentPoint,
          peptideAttachmentPoint,
        );
      }
    }

    const leftMonomerLocator = getMonomerLocator(page, {
      monomerAlias: tmpPeptideMonomers['Test-6-P-Main'].alias,
      monomerType: tmpPeptideMonomers['Test-6-P-Main'].monomerType,
    }).first();
    const tmpMonomerLocator = getMonomerLocator(page, {
      monomerAlias: peptide.alias,
      monomerType: peptide.monomerType,
    });
    const rightMonomerLocator =
      (await tmpMonomerLocator.count()) > 1
        ? tmpMonomerLocator.nth(1)
        : tmpMonomerLocator.first();

    return {
      leftMonomer: leftMonomerLocator,
      rightMonomer: rightMonomerLocator,
    };
  }

  async function prepareCanvasNoFreeAPLeft(
    page: Page,
    CHEM: IMonomer,
  ): Promise<{ leftMonomer: Locator; rightMonomer: Locator }> {
    await openFileAndAddToCanvasMacro(
      page,
      tmpPeptideMonomers['Test-6-P-1'].fileName,
    );

    await openFileAndAddToCanvasMacro(page, CHEM.fileName);
    const CHEMLocator = getMonomerLocator(page, {
      monomerAlias: CHEM.alias,
    }).first();
    await CHEMLocator.hover();
    await dragMouseTo(550, 370, page);
    await moveMouseAway(page);

    for await (const CHEMAttachmentPoint of Object.values(
      CHEM.attachmentPoints,
    )) {
      const tmpCHEM = tmpPeptideMonomers[`Test-6-P-${CHEMAttachmentPoint[1]}`];
      await bondTwoMonomersByPointToPoint(
        page,
        CHEM,
        tmpCHEM,
        CHEMAttachmentPoint,
        CHEMAttachmentPoint,
      );
    }

    const leftMonomerLocator = getMonomerLocator(page, {
      monomerAlias: tmpPeptideMonomers['Test-6-P-Main'].alias,
      monomerType: tmpPeptideMonomers['Test-6-P-Main'].monomerType,
    }).first();
    const tmpMonomerLocator = getMonomerLocator(page, {
      monomerAlias: CHEM.alias,
      monomerType: CHEM.monomerType,
    });
    const rightMonomerLocator =
      (await tmpMonomerLocator.count()) > 1
        ? tmpMonomerLocator.nth(1)
        : tmpMonomerLocator.first();

    return {
      leftMonomer: leftMonomerLocator,
      rightMonomer: rightMonomerLocator,
    };
  }

  async function loadTwoMonomers(
    page: Page,
    leftMonomer: IMonomer,
    rightMonomer: IMonomer,
  ): Promise<{ leftMonomer: Locator; rightMonomer: Locator }> {
    await openFileAndAddToCanvasMacro(page, leftMonomer.fileName);
    const leftMonomerLocator = getMonomerLocator(page, {
      monomerAlias: leftMonomer.alias,
      monomerType: leftMonomer.monomerType,
    }).first();

    await leftMonomerLocator.hover({ force: true });

    await dragMouseTo(500, 370, page);
    await moveMouseAway(page);

    await openFileAndAddToCanvasMacro(page, rightMonomer.fileName);
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

  async function bondTwoMonomersByPointToPoint(
    page: Page,
    leftMonomer: IMonomer,
    rightMonomer: IMonomer,
    leftMonomersAttachmentPoint?: AttachmentPoint,
    rightMonomersAttachmentPoint?: AttachmentPoint,
  ) {
    const leftMonomerLocator = getMonomerLocator(page, {
      monomerAlias: leftMonomer.alias,
    }).first();

    const rightMonomerLocator = getMonomerLocator(page, {
      monomerAlias: rightMonomer.alias,
    }).first();

    await bondTwoMonomersPointToPoint(
      page,
      leftMonomerLocator,
      rightMonomerLocator,
      leftMonomersAttachmentPoint,
      rightMonomersAttachmentPoint,
    );
  }

  Object.values(peptideMonomers).forEach((leftPeptide) => {
    Object.values(peptideMonomers).forEach((rightPeptide) => {
      /*
       *  Test case: https://github.com/epam/ketcher/issues/3807 - Case 1
       *  Description: A default bond between 2 monomers is created using R2 of first monomer and R1 of the second monomer.
       */
      if (
        Object.values(leftPeptide.attachmentPoints).includes(
          AttachmentPoint.R2,
        ) &&
        Object.values(rightPeptide.attachmentPoints).includes(
          AttachmentPoint.R1,
        )
      ) {
        test(`Case 1: Connect Center to Center of ${leftPeptide.alias} and ${rightPeptide.alias}`, async () => {
          test.setTimeout(30000);

          const {
            leftMonomer: leftMonomerLocator,
            rightMonomer: rightMonomerLocator,
          } = await loadTwoMonomers(page, leftPeptide, rightPeptide);

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
      }
    });
  });

  Object.values(peptideMonomers).forEach((leftPeptide) => {
    Object.values(peptideMonomers).forEach((rightPeptide) => {
      Object.values(leftPeptide.attachmentPoints).forEach(
        (leftPeptideAttachmentPoint) => {
          Object.values(rightPeptide.attachmentPoints).forEach(
            (rightPeptideAttachmentPoint) => {
              if (leftPeptideAttachmentPoint === rightPeptideAttachmentPoint) {
                /*
                 *  Test case: https://github.com/epam/ketcher/issues/3807 - Case 2
                 *  Description: If a user tries to connect 2 monomers that have only identical free attachment
                 *               points (for example, R1 and R1 or R2 and R2), a bond is created, and a message occurs.
                 */
                test(`Case 2: Connect ${leftPeptideAttachmentPoint} to ${rightPeptideAttachmentPoint} of ${leftPeptide.alias} and ${rightPeptide.alias}`, async () => {
                  test.setTimeout(30000);

                  const {
                    leftMonomer: leftMonomerLocator,
                    rightMonomer: rightMonomerLocator,
                  } = await loadTwoMonomers(page, leftPeptide, rightPeptide);

                  const bondLine = await bondTwoMonomersPointToPoint(
                    page,
                    leftMonomerLocator,
                    rightMonomerLocator,
                    leftPeptideAttachmentPoint,
                    rightPeptideAttachmentPoint,
                  );

                  await expect(bondLine).toBeVisible();
                  const errorMessage = page
                    .getByTestId('error-tooltip')
                    .first();
                  await expect(errorMessage).toContainText(
                    'You have connected monomers with attachment points of the same group',
                  );
                });
              }
            },
          );
        },
      );
    });
  });

  Object.values(peptideMonomers).forEach((rightPeptide) => {
    Object.values(tmpPeptideMonomers['Test-6-P-x'].attachmentPoints).forEach(
      (leftPeptideAttachmentPoint) => {
        Object.values(rightPeptide.attachmentPoints).forEach(
          (rightPeptideAttachmentPoint) => {
            /*
             *  Test case: https://github.com/epam/ketcher/issues/3807 - Case 3
             *  Description: If there is only one free attachment point (R1…Rn), a bond is created by default
             *               using only one existing possibility to connect to another monomer (no modal window appears).
             *   For each %peptideSType% from peptideMonomers:
             *     For each %MonomerConnection% (avaliable connections of monomer)
             *       left it unoccupied and occupy the rest
             *       For each %Test-6-Ch-AttachmentPoint% of Test-6-P from (R1, R2, R3, R4, R5)
             *         Establish connection between Test-6-Ch(%AttachmentPoint%) and %peptideSType%(%MonomerConnection%)
             *         Validate canvas
             */
            test(`Case 3: Connect ${leftPeptideAttachmentPoint} to ${rightPeptideAttachmentPoint} of Test-6-P and ${rightPeptide.alias}`, async () => {
              test.setTimeout(35000);

              const {
                leftMonomer: leftMonomerLocator,
                rightMonomer: rightMonomerLocator,
              } = await prepareCanvasOneFreeAPLeft(
                page,
                rightPeptide,
                rightPeptideAttachmentPoint,
              );

              const bondLine = await bondTwoMonomersPointToPoint(
                page,
                leftMonomerLocator,
                rightMonomerLocator,
                leftPeptideAttachmentPoint,
                rightPeptideAttachmentPoint,
              );
              await expect(bondLine).toBeVisible();
            });
          },
        );
      },
    );
  });

  //   peptideMonomers['(R3,R4)'],
  //   peptideMonomers['(R1,R3,R4)'],
  //   peptideMonomers['(R2,R3,R4)'],
  //   peptideMonomers['(R3,R4,R5)'],
  //   peptideMonomers['(R1,R2,R3,R4)'],
  //   peptideMonomers['(R1,R3,R4,R5)'],
  //   peptideMonomers['(R2,R3,R4,R5)'],
  //   peptideMonomers['(R1,R2,R3,R4,R5)'],

  // Object.values(selectedPeptides).forEach((rightPeptide) => {
  //   Object.values(tmpPeptideMonomers['Test-6-P-x'].connectionPoints).forEach(
  //     (leftPeptideAttachmentPoint) => {
  //       /*
  //        *  Test case: https://github.com/epam/ketcher/issues/3806 - Case 4.1 (point to point case)
  //        *  Description: If default connection is not possible (R1 and R2 are occupied), and there is more than 1 free AP,
  //        *               modal window appears where user can choose between other possibilities of APs (R3...Rn).
  //        *   For each %peptideSType% from ((R3,R4), (R1,R3,R4), (R2,R3,R4), (R3,R4,R5), (R1,R2,R3,R4), (R1,R3,R4,R5), (R2,R3,R4,R5), (R1,R2,R3,R4,R5)):
  //        *     For each %Test-6-Ch-AttachmentPoint% of Test-6-Ch from (R1, R2, R3, R4, R5)
  //        *       Establish connection between Test-6-P(%AttachmentPoint%) and %peptideType%(%MonomerConnection%)
  //        *       Validate canvas (Dialog should appear)
  //        *       Select any free AP and click Connect (connection should appear)
  //        */
  //         test.setTimeout(15000);


  //           page,
  //           tmpPeptideMonomers['Test-6-P-x'],
  //           rightPeptide,
  //           leftPeptideAttachmentPoint,

  //       });

  //           rightPeptide.connectionPoints,
  //         )[Object.keys(rightPeptide.connectionPoints).length - 1];
  //           } else {

  //
  //
  //       });
  //       });
  // });

  // Object.values(selectedPeptides).forEach((rightPeptide) => {
  //   Object.values(rightPeptide.connectionPoints).forEach(
  //     (rightPeptideAttachmentPoint) => {
  //       /*
  //        *  Test case: https://github.com/epam/ketcher/issues/3806 - Case 4.2 (center to point case)
  //        *  Description: If default connection is not possible (R1 and R2 are occupied), and there is more than 1 free AP,
  //        *               modal window appears where user can choose between other possibilities of APs (R3...Rn).
  //        *   For each %peptideSType% from ((R3,R4), (R1,R3,R4), (R2,R3,R4), (R3,R4,R5), (R1,R2,R3,R4), (R1,R3,R4,R5), (R2,R3,R4,R5), (R1,R2,R3,R4,R5)):
  //        *     For each %Test-6-Ch-AttachmentPoint% of Test-6-Ch from (R1, R2, R3, R4, R5)
  //        *       Establish connection between Test-6-P(Center) and %peptideType%(%MonomerConnection%)
  //        *       Validate canvas (Dialog should appear)
  //        *       Select any free AP and click Connect (connection should appear)
  //        */
  //         !(
  //       ) {
  //           test.setTimeout(15000);


  //             page,
  //             tmpPeptideMonomers['Test-6-P-x'],
  //             rightPeptide,
  //             rightPeptideAttachmentPoint,

  //       });




  //       });
  //         });
  // });

  Object.values(peptideMonomers).forEach((rightPeptide) => {
    Object.values(tmpPeptideMonomers['Test-6-P-x'].attachmentPoints).forEach(
      (leftPeptideAttachmentPoint) => {
        /*
         *  Test case: https://github.com/epam/ketcher/issues/3806 - Case 5
         *  Description: If a user tries to connect a monomer to the monomer that does not have any free attachment point, no bond is created, and a message occurs.
         *                (point to center case)
         *   For each %peptideSType% from peptideMonomers:
         *     For each %MonomerConnection% (avaliable connections of monomer)
         *       occupy all connections
         *       For each %AttachmentPoint% of Test-6-P from (R1, R2, R3, R4, R5)
         *         Establish connection between Test-6-P(%AttachmentPoint%) and %peptideSType%(center)
         *         Validate canvas (No connection established)
         */
        test(`Case 5: Connect ${leftPeptideAttachmentPoint} to Center of Test-6-P and ${rightPeptide.alias}`, async () => {
          test.setTimeout(35000);

          const {
            leftMonomer: leftMonomerLocator,
            rightMonomer: rightMonomerLocator,
          } = await prepareCanvasNoFreeAPLeft(page, rightPeptide);

          const bondLine = await bondTwoMonomersPointToPoint(
            page,
            leftMonomerLocator,
            rightMonomerLocator,
            leftPeptideAttachmentPoint,
          );
          await expect(bondLine).toBeHidden();
        });
      },
    );
  });

  Object.values(peptideMonomers).forEach((leftPeptide) => {
    Object.values(tmpPeptideMonomers['Test-6-P-x'].attachmentPoints).forEach(
      (rightPeptideAttachmentPoint) => {
        /*
         *  Test case: https://github.com/epam/ketcher/issues/3806 - Case 6
         *  Description: User drags a bond from the center of the first monomer to the specific AP of the second monomer.
         *                By default, if it is not R2-R1 or R1-R2 than - connection dialog should appear.
         *   For each %peptideSType% from peptideMonomers (that have R2 avaliable):
         *     For each %AttachmentPoint% of Test-6-P from (R1, R2, R3, R4, R5)
         *         Establish connection between %peptideType%(center) and Test-6-P(%Test-6-P-AttachmentPoint%)
         *         Validate canvas (Connection should be established)
         */

        test(`Case 6: Connect Center to ${rightPeptideAttachmentPoint} of ${leftPeptide.alias} and Test-6-P`, async () => {
          test.setTimeout(30000);

          const {
            leftMonomer: leftMonomerLocator,
            rightMonomer: rightMonomerLocator,
          } = await loadTwoMonomers(
            page,
            leftPeptide,
            tmpPeptideMonomers['Test-6-P-x'],
          );

          const bondLine = await bondTwoMonomersPointToPoint(
            page,
            leftMonomerLocator,
            rightMonomerLocator,
            undefined,
            rightPeptideAttachmentPoint,
            undefined,
            true,
          );

          await expect(bondLine).toBeVisible();
        });
      },
    );
  });

  Object.values(peptideMonomers).forEach((leftPeptide) => {
    Object.values(peptideMonomers).forEach((rightPeptide) => {
      Object.values(leftPeptide.attachmentPoints).forEach(
        (leftPeptideAttachmentPoint) => {
          Object.values(rightPeptide.attachmentPoints).forEach(
            (rightPeptideAttachmentPoint) => {
              /*
               *  Test case: https://github.com/epam/ketcher/issues/3807 - Case 7
               *  Description: User clicks on the specific AP of the first monomer and drags a bond to the specific AP of the second monomer.
               */
              test(`Case 7: Connect ${leftPeptideAttachmentPoint} to ${rightPeptideAttachmentPoint} of ${leftPeptide.alias} and ${rightPeptide.alias}`, async () => {
                test.setTimeout(30000);

                const {
                  leftMonomer: leftMonomerLocator,
                  rightMonomer: rightMonomerLocator,
                } = await loadTwoMonomers(page, leftPeptide, rightPeptide);

                const bondLine = await bondTwoMonomersPointToPoint(
                  page,
                  leftMonomerLocator,
                  rightMonomerLocator,
                  leftPeptideAttachmentPoint,
                  rightPeptideAttachmentPoint,
                );

                await expect(bondLine).toBeVisible();
              });
            },
          );
        },
      );
    });
  });

  Object.values(peptideMonomers).forEach((rightPeptide) => {
    /*
     *  Test case: https://github.com/epam/ketcher/issues/3807 - Case 8
     *  Description: If selected attachment point is occupied, no bond is created, and warning message appears (center to center case).
     *   For each %peptideSType% from peptideMonomers:
     *     For each %MonomerConnection% (avaliable connections of monomer)
     *       left it unoccupied and occupy the rest
     *       For each %Test-6-Ch-AttachmentPoint% of Test-6-P from (R1, R2, R3, R4, R5)
     *         Establish connection between Test-6-P(center) and %peptideSType%(center)
     *         Validate canvas (No connection established)
     */
    test(`Case 8: Connect Center to Center of Test-6-P and ${rightPeptide.alias}`, async () => {
      test.setTimeout(35000);

      const {
        leftMonomer: leftMonomerLocator,
        rightMonomer: rightMonomerLocator,
      } = await prepareCanvasNoFreeAPLeft(page, rightPeptide);

      const bondLine = await bondTwoMonomersPointToPoint(
        page,
        leftMonomerLocator,
        rightMonomerLocator,
      );
      await expect(bondLine).toBeHidden();
    });
  });

  const ordinaryMoleculeMonomers: { [monomerName: string]: IMonomer } = {
    '(R1) - Left only': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/01 - (R1) - Left only.ket',
      alias: 'F1',
      attachmentPoints: {
        R1: AttachmentPoint.R1,
      },
    },
    '(R2) - Right only': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/02 - (R2) - Right only.ket',
      alias: 'F1',
      attachmentPoints: {
        R2: AttachmentPoint.R2,
      },
    },
    '(R3) - Side only': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/03 - (R3) - Side only.ket',
      alias: 'F1',
      attachmentPoints: {
        R3: AttachmentPoint.R3,
      },
    },
    '(R1,R2) - R3 gap': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/04 - (R1,R2) - R3 gap.ket',
      alias: 'F1',
      attachmentPoints: {
        R1: AttachmentPoint.R1,
        R2: AttachmentPoint.R2,
      },
    },
    '(R1,R3) - R2 gap': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/05 - (R1,R3) - R2 gap.ket',
      alias: 'F1',
      attachmentPoints: {
        R1: AttachmentPoint.R1,
        R3: AttachmentPoint.R3,
      },
    },
    '(R2,R3) - R1 gap': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/06 - (R2,R3) - R1 gap.ket',
      alias: 'F1',
      attachmentPoints: {
        R2: AttachmentPoint.R2,
        R3: AttachmentPoint.R3,
      },
    },
    // '(R3,R4)': {
    '(R1,R2,R3)': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/08 - (R1,R2,R3).ket',
      alias: 'F1',
      attachmentPoints: {
        R1: AttachmentPoint.R1,
        R2: AttachmentPoint.R2,
        R3: AttachmentPoint.R3,
      },
    },
    // '(R1,R3,R4)': {
    // '(R2,R3,R4)': {
    // '(R3,R4,R5)': {
    '(R1,R2,R3,R4)': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/12 - (R1,R2,R3,R4).ket',
      alias: 'F1',
      attachmentPoints: {
        R1: AttachmentPoint.R1,
        R2: AttachmentPoint.R2,
        R3: AttachmentPoint.R3,
        R4: AttachmentPoint.R4,
      },
    },
    // '(R1,R3,R4,R5)': {
    // '(R2,R3,R4,R5)': {
    '(R1,R2,R3,R4,R5)': {
      monomerType: MonomerType.Molecule,
      fileName: 'KET/Ordinary-Molecule-Templates/15 - (R1,R2,R3,R4,R5).ket',
      alias: 'F1',
      attachmentPoints: {
        R1: AttachmentPoint.R1,
        R2: AttachmentPoint.R2,
        R3: AttachmentPoint.R3,
        R4: AttachmentPoint.R4,
        R5: AttachmentPoint.R5,
      },
    },
  };

  let ordinaryMoleculeName: string;

  Object.values(peptideMonomers).forEach((leftPeptide) => {
    Object.values(ordinaryMoleculeMonomers).forEach((rightOM) => {
      Object.values(leftPeptide.attachmentPoints).forEach(
        (leftPeptideAttachmentPoint) => {
          Object.values(rightOM.attachmentPoints).forEach(
            (rightOMAttachmentPoint) => {
              /*
               *  Test case: https://github.com/epam/ketcher/issues/4882 - Case 2
               *  Description: Check if possible to create bond from specific AP of one monomer to specific AP of another monomer ( Peptide - Ordinary Molecule )
               * For each %chemType% from the library (peptideMonomers)
               *   For each %OMType% from the library (ordinaryMoleculeMonomers)
               *      For each %AttachmentPoint% (avaliable connections of %chemType%)
               *         For each %AttachmentPoint2% (avaliable connections of %OMType%) do:
               *  1. Clear canvas
               *  2. Load %chemType% and %OMType% and put them on the canvas
               *  3. Establish connection between %chemType%(%AttachmentPoint%) and %OMType%(%AttachmentPoint2%)
               *  4. Validate canvas (connection should appear)
               */
              ordinaryMoleculeName = rightOM.fileName.substring(
                rightOM.fileName.indexOf(' - '),
                rightOM.fileName.lastIndexOf('.ket'),
              );
              test(`Test case9: Connect ${leftPeptideAttachmentPoint} to ${rightOMAttachmentPoint} of Peptide(${leftPeptide.alias}) and OM(${ordinaryMoleculeName})`, async () => {
                test.setTimeout(30000);

                const {
                  leftMonomer: leftMonomerLocator,
                  rightMonomer: rightMonomerLocator,
                } = await loadTwoMonomers(page, leftPeptide, rightOM);

                const bondLine = await bondTwoMonomersPointToPoint(
                  page,
                  leftMonomerLocator,
                  rightMonomerLocator,
                  leftPeptideAttachmentPoint,
                  rightOMAttachmentPoint,
                );

                await expect(bondLine).toBeVisible();
              });
            },
          );
        },
      );
    });
  });

  Object.values(peptideMonomers).forEach((leftPeptide) => {
    Object.values(ordinaryMoleculeMonomers).forEach((rightOrdinaryMolecule) => {
      /*
       *  Test case: https://github.com/epam/ketcher/issues/4882 - Case 7
       *  Description: User can connect any Peptide to any OrdinaryMolecule using center-to-center way.
       *               Select Attachment Points dialog opened.
       */
      ordinaryMoleculeName = rightOrdinaryMolecule.fileName.substring(
        rightOrdinaryMolecule.fileName.indexOf(' - '),
        rightOrdinaryMolecule.fileName.lastIndexOf('.ket'),
      );

      test(`Case 10: Connect Center to Center of Peptide(${leftPeptide.alias}) and OrdinaryMolecule(${ordinaryMoleculeName})`, async () => {
        test.setTimeout(30000);

        const {
          leftMonomer: leftMonomerLocator,
          rightMonomer: rightMonomerLocator,
        } = await loadTwoMonomers(page, leftPeptide, rightOrdinaryMolecule);

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

  async function loadMonomer(page: Page, leftMonomer: IMonomer) {
    await openFileAndAddToCanvasMacro(page, leftMonomer.fileName);

    const leftMonomerLocator = getMonomerLocator(page, {
      monomerAlias: leftMonomer.alias,
    }).first();

    await leftMonomerLocator.hover();
    await dragMouseTo(300, 380, page);
    await moveMouseAway(page);
  }

  async function loadMolecule(page: Page, molecule: IMolecule) {
    await openFileAndAddToCanvasMacro(page, molecule.fileName);
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
      .getByTestId(KETCHER_CANVAS)
      .locator(rightMolecule.atomLocatorSelectors[atomIndex])
      .first();

    await bondMonomerPointToMoleculeAtom(
      page,
      leftPeptideLocator,
      rightMoleculeLocator,
      attachmentPoint,
      rightMolecule.attachmentPointShifts[atomIndex],
    );
  }

  Object.values(peptideMonomers).forEach((leftPeptide) => {
    Object.values(molecules).forEach((rightMolecule) => {
      /*
       *  Test task: https://github.com/epam/ketcher/issues/5960
       *  Description: Verify that connection points between monomers and molecules can be created by drawing bonds in macro mode
       *  Case: Connect monomer all commection points to moleule atoms
       *  Step: 1. Load monomer (peptide) and shift it to the left
       *        2. Load molecule (system loads it at the center)
       *        3. Drag every connection point of monomer to any free atom of molecule
       *        Expected result: Connection should be established
       */

      test(`Case 12: Connect evey connection point of Peptide(${leftPeptide.alias}) to atom of MicroMolecule(${rightMolecule.alias})`, async () => {
        test.setTimeout(30000);

        await loadMonomer(page, leftPeptide);
        await loadMolecule(page, rightMolecule);

        const attachmentPointCount = Object.keys(
          leftPeptide.attachmentPoints,
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
            leftPeptide,
            rightMolecule,
            Object.keys(leftPeptide.attachmentPoints)[atomIndex],
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
