/* eslint-disable no-magic-numbers */
import { Page, chromium, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  selectClearCanvasTool,
  openFileAndAddToCanvasMacro,
  moveMouseAway,
  dragMouseTo,
  waitForKetcherInit,
  waitForIndigoToLoad,
  resetZoomLevelToDefault,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
import { bondMonomerPointToMoleculeAtom } from '@utils/macromolecules/polymerBond';

test.describe('Connection rules for chems: ', () => {
  let page: Page;
  test.setTimeout(400000);
  test.describe.configure({ retries: 0 });

  test.beforeAll(async ({ browser }) => {
    let sharedContext;
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
    const cntxt = page.context();
    await page.close();
    await cntxt.close();
    await browser.contexts().forEach((someContext) => {
      someContext.close();
    });
    // await browser.close();
  });

  interface IMonomer {
    monomerType: string;
    fileName: string;
    alias: string;
    connectionPoints: { [connectionPointName: string]: string };
  }

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
    // '(R3) - Side only': {
    //   monomerType: 'chem',
    //   fileName: 'KET/CHEM-Templates/03 - (R3) - Side only.ket',
    //   alias: '(R3)_-_Side_only',
    //   connectionPoints: {
    //     R3: 'R3',
    //   },
    // },
    '(R1,R2) - R3 gap': {
      monomerType: 'chem',
      fileName: 'KET/CHEM-Templates/04 - (R1,R2) - R3 gap.ket',
      alias: '(R1,R2)_-_R3_gap',
      connectionPoints: {
        R1: 'R1',
        R2: 'R2',
      },
    },
    // '(R1,R3) - R2 gap': {
    //   monomerType: 'chem',
    //   fileName: 'KET/CHEM-Templates/05 - (R1,R3) - R2 gap.ket',
    //   alias: '(R1,R3)_-_R2_gap',
    //   connectionPoints: {
    //     R1: 'R1',
    //     R3: 'R3',
    //   },
    // },
    // '(R2,R3) - R1 gap': {
    //   monomerType: 'chem',
    //   fileName: 'KET/CHEM-Templates/06 - (R2,R3) - R1 gap.ket',
    //   alias: '(R2,R3)_-_R1_gap',
    //   connectionPoints: {
    //     R2: 'R2',
    //     R3: 'R3',
    //   },
    // },
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
    '(R1,R2,R3,R4)': {
      monomerType: 'chem',
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
    const canvasLocator = page.getByTestId('ketcher-canvas').first();
    const leftMonomerLocator = canvasLocator
      .locator(`text=${leftMonomer.alias}`)
      .locator('..')
      .first();
    await leftMonomerLocator.hover();
    await dragMouseTo(300, 380, page);
    await moveMouseAway(page);
  }

  async function loadMolecule(page: Page, molecule: IMolecule) {
    await openFileAndAddToCanvasMacro(molecule.fileName, page);
    await moveMouseAway(page);
  }

  async function bondMonomerCenterToAtom(
    page: Page,
    leftPeptide: IMonomer,
    rightMolecule: IMolecule,
    atomIndex: number,
  ) {
    const leftPeptideLocator = page
      .getByText(leftPeptide.alias, { exact: true })
      .locator('..')
      .first();

    const rightMoleculeLocator = page
      .getByTestId('ketcher-canvas')
      .locator(rightMolecule.atomLocatorSelectors[atomIndex])
      .first();

    await bondMonomerPointToMoleculeAtom(
      page,
      leftPeptideLocator,
      rightMoleculeLocator,
      undefined,
      rightMolecule.connectionPointShifts[atomIndex],
    );
  }

  Object.values(chemMonomers).forEach((leftMonomer) => {
    Object.values(molecules).forEach((rightMolecule) => {
      /*
       *  Test task: https://github.com/epam/ketcher/issues/5960
       *  Description: Verify that connection points between monomers and molecules can be created by drawing bonds in macro mode
       *  Case: Monomer center to molecule atom connection
       *  Step: 1. Load monomer (chem) and shift it to the left
       *        2. Load molecule (system loads it at the center)
       *        3. Drag center of monomer to first (0th) atom of molecule
       *        Expected result: No connection should be establiched
       *  WARNING: That test tesults are wrong because of bug: https://github.com/epam/ketcher/issues/5976
       *  Screenshots must be updated after fix and fixme should be removed
       */
      test(`Case 11: Connect Center of Chem(${leftMonomer.alias}) to atom of MicroMolecule(${rightMolecule.alias})`, async () => {
        test.setTimeout(30000);

        await loadMonomer(page, leftMonomer);
        await loadMolecule(page, rightMolecule);

        await bondMonomerCenterToAtom(page, leftMonomer, rightMolecule, 0);

        await takeEditorScreenshot(page, {
          masks: [page.getByTestId('polymer-library-preview')],
        });
        test.fixme(
          // eslint-disable-next-line no-self-compare
          true === true,
          `That test results are wrong because of https://github.com/epam/ketcher/issues/5976 issue(s).`,
        );
      });
    });
  });
});
