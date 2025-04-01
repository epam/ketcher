/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */

import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForPageInit,
  MacroFileType,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  selectSnakeLayoutModeTool,
  openFileAndAddToCanvasMacro,
  selectFlexLayoutModeTool,
  MonomerType,
  ZoomInByKeyboard,
  resetZoomLevelToDefault,
  moveMouseAway,
  selectAllStructuresOnCanvas,
  selectSequenceLayoutModeTool,
} from '@utils';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
import { MacroBondTool } from '@utils/canvas/tools/selectNestedTool/types';
import {
  selectClearCanvasTool,
  turnOnMacromoleculesEditor,
} from '@tests/pages/common/TopLeftToolbar';

let page: Page;

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();

  await waitForPageInit(page);
  await turnOnMacromoleculesEditor(page);
  await selectSnakeLayoutModeTool(page);
});

test.afterEach(async () => {
  await selectClearCanvasTool(page);
});

test.afterAll(async ({ browser }) => {
  await Promise.all(browser.contexts().map((context) => context.close()));
});

interface IMonomer {
  id: number;
  monomerDescription: string;
  alias?: string;
  type: MonomerType | 'Nucleotide' | 'Nucleoside';
  contentType: MacroFileType.Ket | MacroFileType.HELM;
  KETFile?: string;
  HELMString?: string;
  eligibleForAntisense: boolean;
  baseWithR3R1ConnectionPresent: boolean;
  monomerLocatorIndex: number;
  // Set shouldFail to true if you expect test to fail because of existed bug and put issues link to issueNumber
  shouldFail?: boolean;
  // issueNumber is mandatory if shouldFail === true
  issueNumber?: string;
}

interface IPolymer {
  polymerDescription?: string;
  contentType: MacroFileType.Ket | MacroFileType.HELM;
  KETFile?: string;
  HELMString?: string;
  checks: ('side chain' | '')[];
  monomerLocatorIndex: number;
  // Set shouldFail to true if you expect test to fail because of existed bug and put issues link to issueNumber
  shouldFail?: boolean;
  // issueNumber is mandatory if shouldFail === true
  issueNumber?: string;
}

async function loadMonomerOnCanvas(page: Page, polymer: IPolymer | IMonomer) {
  if (polymer.HELMString) {
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      polymer.HELMString,
    );
  }
  if (polymer.KETFile) {
    await openFileAndAddToCanvasMacro(polymer.KETFile, page);
  }
}

const shortMonomerList: IMonomer[] = [
  {
    id: 1,
    monomerDescription: '1. Peptide A (from library)',
    alias: 'A',
    type: MonomerType.Peptide,
    contentType: MacroFileType.HELM,
    HELMString: 'PEPTIDE1{A}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    id: 2,
    monomerDescription: '2. Ambiguous peptide X (alternatives, from library)',
    alias: 'X',
    type: MonomerType.Peptide,
    contentType: MacroFileType.HELM,
    HELMString:
      'PEPTIDE1{(A,C,D,E,F,G,H,I,K,L,M,N,O,P,Q,R,S,T,U,V,W,Y)}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    id: 3,
    monomerDescription: '3. Sugar R (from library)',
    alias: 'R',
    type: MonomerType.Sugar,
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    id: 4,
    monomerDescription: '4. Base A (from library)',
    alias: 'A',
    type: MonomerType.Base,
    contentType: MacroFileType.Ket,
    KETFile: 'KET/Antisense-Chains/8. Base A (from library).ket',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    id: 5,
    monomerDescription: '5. Ambiguous DNA Base N (alternatives, from library)',
    alias: 'N',
    type: MonomerType.Base,
    contentType: MacroFileType.Ket,
    KETFile:
      'KET/Antisense-Chains/9. Ambiguous DNA Base N (alternatives, from library).ket',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    id: 6,
    monomerDescription: '6. Phosphate P (from library)',
    alias: 'P',
    type: MonomerType.Phosphate,
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{P}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    id: 7,
    monomerDescription: '7. Unsplit monomer 2-damdA (from library)',
    alias: '2-damdA',
    type: MonomerType.UnsplitNucleotide,
    contentType: MacroFileType.Ket,
    KETFile:
      'KET/Antisense-Chains/18. Unsplit monomer 2-damdA (from library).ket',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    id: 8,
    monomerDescription: '8. Unknown monomer',
    alias: 'Unknown',
    type: MonomerType.UnknownMonomer,
    contentType: MacroFileType.Ket,
    KETFile: 'KET/Antisense-Chains/19. Unknown monomer.ket',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    id: 9,
    monomerDescription: '9. CHEM 4aPEGMal (from library)',
    alias: '4aPEGMal',
    type: MonomerType.CHEM,
    contentType: MacroFileType.HELM,
    HELMString: 'CHEM1{[4aPEGMal]}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    id: 10,
    monomerDescription: '10. Nucleoside - R(A)',
    alias: 'A',
    type: 'Nucleoside',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A)}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    id: 11,
    monomerDescription: '11. Nucleotide A - R(A)P',
    alias: 'A',
    type: 'Nucleotide',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A)P}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    id: 12,
    monomerDescription:
      '12. Nucleotide of DNA base N with sugar R and phosphate P - R(A,C,G,T)P',
    alias: 'N',
    type: 'Nucleotide',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A,C,G,T)P}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    id: 13,
    monomerDescription:
      '13. Nucleoside of sugar R, base that have extra covalent bond - R([nC6n8A])',
    alias: 'nC6n8A',
    type: 'Nucleoside',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    id: 14,
    monomerDescription:
      '14. Nucleoside of sugar R, base that have extra covalent bond and phosphate P - R([nC6n8A])P',
    alias: 'nC6n8A',
    type: 'Nucleoside',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A])P}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    id: 15,
    monomerDescription:
      '15. Nucleoside of sugar R, base that have extra hydrogen bond - R([nC6n8A])',
    alias: 'nC6n8A',
    type: 'Nucleoside',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    id: 16,
    monomerDescription:
      '16. Nucleoside of sugar R, base that have extra hydrogen bond and phosphate P - R([nC6n8A])P',
    alias: 'nC6n8A',
    type: 'Nucleoside',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A])P}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
];

for (const leftMonomer of shortMonomerList) {
  for (const rightMonomer of shortMonomerList) {
    test(`1-${leftMonomer.id}-${rightMonomer.id}. Hydrogen side chain for: ${leftMonomer.monomerDescription} and ${rightMonomer.monomerDescription}`, async () => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/6184
       * Description: Check if hydrogen bonds connect monomers inside one chain, those
       *              hydrogen bonds should be considered as side chain connections for layout purposes
       * Case:
       *       1. Load two monomers on the canvas
       *       2. Connect them with hydrogen bond
       *       3. Switch to the flex/snake mode to refresh layout
       *       4. Take screenshot to validate layout (connection should be considered as side chain)
       */
      test.setTimeout(30000);

      await loadMonomerOnCanvas(page, leftMonomer);
      let leftMonomerAlias;
      if (leftMonomer.type === 'Nucleoside') {
        leftMonomerAlias = 'R';
      } else if (leftMonomer.type === 'Nucleotide') {
        leftMonomerAlias = 'P';
      } else {
        leftMonomerAlias = leftMonomer.alias;
      }
      const leftMonomerLocator = getMonomerLocator(page, {
        monomerAlias: leftMonomerAlias,
      }).first();
      await loadMonomerOnCanvas(page, rightMonomer);
      let rightMonomerAlias;
      if (rightMonomer.type === 'Nucleoside') {
        rightMonomerAlias = 'R';
      } else if (rightMonomer.type === 'Nucleotide') {
        rightMonomerAlias = 'P';
      } else {
        rightMonomerAlias = rightMonomer.alias;
      }

      const rightMonomerLocators = getMonomerLocator(page, {
        monomerAlias: rightMonomerAlias,
      });

      const rightMonomerLocator =
        (await rightMonomerLocators.count()) > 1
          ? rightMonomerLocators.nth(1)
          : rightMonomerLocators.nth(0);

      await bondTwoMonomers(
        page,
        leftMonomerLocator,
        rightMonomerLocator,
        undefined,
        undefined,
        MacroBondTool.HYDROGEN,
      );

      await selectFlexLayoutModeTool(page);
      await selectSnakeLayoutModeTool(page);
      await takeEditorScreenshot(page, { hideMonomerPreview: true });
    });
  }
}

const eligibleForAntisenseMonomerList: IMonomer[] = [
  {
    id: 1,
    monomerDescription: 'Nucleoside base A - R(A)',
    alias: 'A',
    type: 'Nucleoside',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A)}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    id: 2,
    monomerDescription:
      'Nucleoside with ambiguous alternative RNA base W - R(A,U)',
    // Alias is not W because of the a bug
    alias: '%',
    type: 'Nucleoside',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A,U)}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    id: 3,
    monomerDescription: 'Nucleoside with ambiguous mixed RNA base % - R(A+U)',
    alias: '%',
    type: 'Nucleoside',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A+U)}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    id: 4,
    monomerDescription:
      'Nucleoside with ambiguous alternative DNA base H - R(A,C,T)',
    alias: 'H',
    type: 'Nucleoside',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A,C,T)}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    id: 5,
    monomerDescription: 'Nucleoside with ambiguous mixed DNA base % - R(A+C+T)',
    alias: '%',
    type: 'Nucleoside',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A+C+T)}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    id: 6,
    monomerDescription: 'Nucleotide base A - R(A)P',
    alias: 'A',
    type: 'Nucleotide',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A)P}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    id: 7,
    monomerDescription:
      'Nucleotide with ambiguous alternative RNA base W - R(A,U)P',
    // Alias is not W because of the a bug
    alias: '%',
    type: 'Nucleotide',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A,U)P}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    id: 8,
    monomerDescription: 'Nucleotide with ambiguous mixed RNA base % - R(A+U)P',
    alias: '%',
    type: 'Nucleotide',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A+U)P}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    id: 9,
    monomerDescription:
      'Nucleotide with ambiguous alternative DNA base H - R(A,C,T)P',
    alias: 'H',
    type: 'Nucleotide',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A,C,T)P}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    id: 10,
    monomerDescription:
      'Nucleotide with ambiguous mixed DNA base % - R(A+C+T)P',
    alias: '%',
    type: 'Nucleotide',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A+C+T)P}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
];

for (const leftMonomer of eligibleForAntisenseMonomerList) {
  for (const rightMonomer of eligibleForAntisenseMonomerList) {
    test(`2-${leftMonomer.id}-${rightMonomer.id}. Creating sense/antisense connection for: ${leftMonomer.monomerDescription} and ${rightMonomer.monomerDescription}`, async () => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/6184
       * Description: Check if monomers who participate in those H-bonds should be oriented
       *                 towards each other (one of the chains should be "flipped")
       * Case:
       *       1. Load two monomers (eligable for antisense) on the canvas
       *       2. Bond its bases with hydrogen bond
       *       3. Switch to the flex/snake mode to refresh layout
       *       4. Take screenshot to validate layout (connection should be considered as side chain)
       */
      test.setTimeout(20000);

      await loadMonomerOnCanvas(page, leftMonomer);

      const leftMonomerLocator = getMonomerLocator(page, {
        monomerAlias: leftMonomer.alias,
      }).first();
      await loadMonomerOnCanvas(page, rightMonomer);

      const rightMonomerLocators = getMonomerLocator(page, {
        monomerAlias: rightMonomer.alias,
      });

      const rightMonomerLocator =
        (await rightMonomerLocators.count()) > 1
          ? rightMonomerLocators.nth(1)
          : rightMonomerLocators.nth(0);

      await bondTwoMonomers(
        page,
        leftMonomerLocator,
        rightMonomerLocator,
        undefined,
        undefined,
        MacroBondTool.HYDROGEN,
      );

      await selectFlexLayoutModeTool(page);
      await selectSnakeLayoutModeTool(page);
      await takeEditorScreenshot(page, { hideMonomerPreview: true });
    });
  }
}

test(`3. Check that shorter chain (fewer monomers) should get "flipped", and if they are of the same size, the chain whose center is lower on the canvas`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6184
   * Description: Check that shorter chain (fewer monomers) should get "flipped", and if they are of the same size, the chain whose center is lower on the canvas
   * Case:
   *       1. Load short chain on the canvas
   *       2. Load long chain on the canvas
   *       3. Take screenshot to validate initial state
   *       4. Connect to bases with hydrogen bond
   *       5. Switch to Flex mode and back to Snake - chains got filipped
   *       6. Take screenshot to validate flipping
   */
  test.setTimeout(20000);

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{R(A)P.R(G)P.R(C)P}|PEPTIDE1{[1Nal].[Cys_Bn].[AspOMe]}$RNA1,PEPTIDE1,9:R2-1:R1$$$V2.0',
  );

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{R(U)P.R(G)P.R(C)P}|PEPTIDE1{[1Nal].[Cys_Bn].[AspOMe].[aMePhe]}$RNA1,PEPTIDE1,9:R2-1:R1$$$V2.0',
  );
  for (let i = 0; i < 5; i++) await ZoomInByKeyboard(page);
  await takeEditorScreenshot(page, { hideMonomerPreview: true });

  await bondTwoMonomers(
    page,
    getMonomerLocator(page, { monomerAlias: 'A' }),
    getMonomerLocator(page, { monomerAlias: 'U' }),
    undefined,
    undefined,
    MacroBondTool.HYDROGEN,
  );

  await selectFlexLayoutModeTool(page);
  await selectSnakeLayoutModeTool(page);

  await moveMouseAway(page);
  await takeEditorScreenshot(page, { hideMonomerPreview: true });

  await resetZoomLevelToDefault(page);
});

test(`4. For R3-R1 sugar-base side connections (when the base does not have hydrogen bonds),' +
  ' that base should be oriented like other bases in the chain (or if there is a tie, bellow the sugar)`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6184
   * Description: For R3-R1 sugar-base side connections (when the base does not have hydrogen bonds),
   *              that base should be oriented like other bases in the chain (or if there is a tie,
   *              bellow the sugar)
   * Case:
   *       1. Load short chain on the canvas
   *       2. Load long chain on the canvas
   *       3. Take screenshot to validate initial state
   *       4. Connect to bases with hydrogen bond
   *       5. Switch to Flex mode and back to Snake - all bases from bottom chain got filipped
   *       6. Take screenshot to validate flipping
   */
  test.setTimeout(20000);

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{R(A)P.R(G)P.R(C)P}|PEPTIDE1{[1Nal].[Cys_Bn].[AspOMe]}$RNA1,PEPTIDE1,9:R2-1:R1$$$V2.0',
  );

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{R(U)P.R(G)P.R(C)P}|PEPTIDE1{[1Nal].[Cys_Bn].[AspOMe].[aMePhe]}$RNA1,PEPTIDE1,9:R2-1:R1$$$V2.0',
  );
  for (let i = 0; i < 5; i++) await ZoomInByKeyboard(page);
  await takeEditorScreenshot(page, { hideMonomerPreview: true });

  await bondTwoMonomers(
    page,
    getMonomerLocator(page, { monomerAlias: 'A' }),
    getMonomerLocator(page, { monomerAlias: 'U' }),
    undefined,
    undefined,
    MacroBondTool.HYDROGEN,
  );

  await selectFlexLayoutModeTool(page);
  await selectSnakeLayoutModeTool(page);

  await moveMouseAway(page);
  await takeEditorScreenshot(page, { hideMonomerPreview: true });

  await resetZoomLevelToDefault(page);
});

async function callContextMenuForMonomer(
  page: Page,
  monomerLocatorIndex: number,
) {
  const canvasLocator = page.getByTestId('ketcher-canvas');
  await canvasLocator
    .locator('g.monomer')
    .nth(monomerLocatorIndex)
    .click({ button: 'right', force: true });
}

const longChain: IMonomer[] = [
  {
    id: 1,
    monomerDescription: '',
    type: 'Nucleotide',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R(U)P.R(G)P.R(C)P}|PEPTIDE1{[1Nal].[Cys_Bn].[AspOMe].[aMePhe]}|' +
      'RNA2{R(U)P.R(G)P.R(C)P}|PEPTIDE2{[1Nal].[Cys_Bn].[AspOMe].[aMePhe]}|' +
      'RNA3{R(U)P.R(G)P.R(C)P}|PEPTIDE3{[1Nal].[Cys_Bn].[AspOMe].[aMePhe]}' +
      '$RNA1,PEPTIDE1,9:R2-1:R1|RNA2,PEPTIDE2,9:R2-1:R1|PEPTIDE1,RNA2,4:R2-1:R1|' +
      'RNA3,PEPTIDE3,9:R2-1:R1|PEPTIDE2,RNA3,4:R2-1:R1$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
];

test(`5. Check that backbones should be placed parallel to each other`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6184
   * Description: Check that backbones should be placed parallel to each other
   * Case:
   *       1. Load very long chain on the canvas
   *       2. Create antisense chain
   *       3. Take screenshot to validate parallel backbones
   */
  test.setTimeout(20000);

  const chain = longChain[0];

  if (chain.HELMString) {
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      chain.HELMString,
    );
  }

  await selectAllStructuresOnCanvas(page);
  await callContextMenuForMonomer(page, 0);
  const createAntisenseStrandOption = page
    .getByTestId('create_antisense_rna_chain')
    .first();
  await createAntisenseStrandOption.click();

  await moveMouseAway(page);
  await takeEditorScreenshot(page, { hideMonomerPreview: true });
});

test(`6. Check that chains should be placed in such a way that the left-most monomer' +
  ' that has a hydrogen bond from the non-"flipped" chain has the monomer that is ' +
  'connected to it via a hydrogen bond from the other chain bellow it`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6184
   * Description: Check that chains should be placed in such a way that the left-most monomer
   *              that has a hydrogen bond from the non-"flipped" chain has the monomer that is
   *              connected to it via a hydrogen bond from the other chain bellow it
   * Case:
   *       1. Load very long chain with short antisense connected on the canvas
   *       2. Take screenshot to validate layout
   */
  test.setTimeout(20000);

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{R(U)P.R(G)P.R(C)P}|PEPTIDE1{[1Nal].[Cys_Bn].[AspOMe].[aMePhe]}|' +
      'RNA2{R(U)P.R(G)P.R(C)P}|PEPTIDE2{[1Nal].[Cys_Bn].[AspOMe].[aMePhe]}|' +
      'RNA3{R(U)P.R(G)P.R(C)P}|PEPTIDE3{[1Nal].[Cys_Bn].[AspOMe].[aMePhe]}|' +
      'RNA4{R(G)P.R(G)P.R(G)P.R(G)P.R(G)P}$RNA1,PEPTIDE1,9:R2-1:R1|' +
      'RNA2,PEPTIDE2,9:R2-1:R1|PEPTIDE1,RNA2,4:R2-1:R1|RNA3,PEPTIDE3,9:R2-1:R1|' +
      'PEPTIDE2,RNA3,4:R2-1:R1|RNA3,RNA4,8:pair-2:pair$$$V2.0',
  );

  await takeEditorScreenshot(page, { hideMonomerPreview: true });
});

test(`7. Check that distance between all monomers should be minimum one bond length`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6184
   * Description: Check that distance between all monomers should be minimum one bond length
   * Case:
   *       1. Load very long chain with short antisense connected on the canvas
   *       2. Take screenshot to validate distance between monomers
   */
  test.setTimeout(20000);

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{R(U)P.R(G)P.R(C)P}|PEPTIDE1{[1Nal].[Cys_Bn].[AspOMe].[aMePhe]}|' +
      'RNA2{R(U)P.R(G)P.R(C)P}|PEPTIDE2{[1Nal].[Cys_Bn].[AspOMe].[aMePhe]}|' +
      'RNA3{R(U)P.R(G)P.R(C)P}|PEPTIDE3{[1Nal].[Cys_Bn].[AspOMe].[aMePhe]}|' +
      'RNA4{R(G)P.R(G)P.R(G)P.R(G)P.R(G)P}$RNA1,PEPTIDE1,9:R2-1:R1|' +
      'RNA2,PEPTIDE2,9:R2-1:R1|PEPTIDE1,RNA2,4:R2-1:R1|RNA3,PEPTIDE3,9:R2-1:R1|' +
      'PEPTIDE2,RNA3,4:R2-1:R1|RNA3,RNA4,8:pair-2:pair$$$V2.0',
  );

  await takeEditorScreenshot(page, { hideMonomerPreview: true });
});

test(`8. Check that multiple backbones/chains can be placed in on a line if they are both connected via H-bonds to the same chain (but not to each other!!!)`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6184
   * Description: Check that multiple backbones/chains can be placed in on a line if they
   *              are both connected via H-bonds to the same chain (but not to each other!!!)
   * Case:
   *       1. Load very long chain with short antisense connected on the canvas
   *       2. Take screenshot to validate layout
   */
  test.setTimeout(20000);

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{R(U)P.R(G)P.R(C)P}|PEPTIDE1{[1Nal].[Cys_Bn].[AspOMe].[aMePhe]}|' +
      'RNA2{R(U)P.R(G)P.R(C)P}|PEPTIDE2{[1Nal].[Cys_Bn].[AspOMe].[aMePhe]}|' +
      'RNA3{R(U)P.R(G)P.R(C)P}|PEPTIDE3{[1Nal].[Cys_Bn].[AspOMe].[aMePhe]}|' +
      'RNA4{R(G)P.R(G)P.R(G)P}|RNA5{R(G)P.R(G)P}$RNA1,PEPTIDE1,9:R2-1:R1|' +
      'RNA2,PEPTIDE2,9:R2-1:R1|PEPTIDE1,RNA2,4:R2-1:R1|RNA3,PEPTIDE3,9:R2-1:R1|' +
      'PEPTIDE2,RNA3,4:R2-1:R1|RNA1,RNA4,5:pair-2:pair|RNA2,RNA5,5:pair-2:pair$$$V2.0',
  );

  await takeEditorScreenshot(page, { hideMonomerPreview: true });
});

test(`9. Check if there is a circular hydrogen bond connection between three or more chains, 
      those hydrogen bonds should be considered as side chain connection for layout purposes`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6184
   * Description: Check if there is a circular hydrogen bond connection between three or more chains,
   *              those hydrogen bonds should be considered as side chain connection for layout purposes
   * Case:
   *       1. Load very long chain with short antisense connected on the canvas
   *       2. Take screenshot to validate layout
   */
  test.setTimeout(20000);

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{R(C)P.R(A)P.R(A)P}|' +
      'RNA2{R(G)P.R(T)P.R(U)P}|' +
      'RNA3{R(C)P.R(A)P.R(A)P}$' +
      'RNA1,RNA2,8:pair-8:pair|' +
      'RNA2,RNA3,2:pair-2:pair|' +
      'RNA3,RNA1,8:pair-2:pair$$$V2.0',
  );

  await takeEditorScreenshot(page, { hideMonomerPreview: true });
});

for (const leftMonomer of eligibleForAntisenseMonomerList) {
  for (const rightMonomer of eligibleForAntisenseMonomerList) {
    test(`10-${leftMonomer.id}-${rightMonomer.id}. Sequence mode: Creating sense/antisense connection for: ${leftMonomer.monomerDescription} and ${rightMonomer.monomerDescription}`, async () => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/6184
       * Description: Sense and antisense chains should be treated as completely separate chains
       *              in sequence mode, without any hydrogen bonds connecting them
       * Case:
       *       1. Load two monomers (eligable for antisense) on the canvas
       *       2. Bond its bases with hydrogen bond
       *       3. Switch to the sequence mode
       *       4. Take screenshot to validate that sense and antisense chains are treated as separate chains
       */
      test.setTimeout(20000);

      await loadMonomerOnCanvas(page, leftMonomer);

      const leftMonomerLocator = getMonomerLocator(page, {
        monomerAlias: leftMonomer.alias,
      }).first();

      await loadMonomerOnCanvas(page, rightMonomer);

      const rightMonomerLocators = getMonomerLocator(page, {
        monomerAlias: rightMonomer.alias,
      });

      const rightMonomerLocator =
        (await rightMonomerLocators.count()) > 1
          ? rightMonomerLocators.nth(1)
          : rightMonomerLocators.nth(0);

      await bondTwoMonomers(
        page,
        leftMonomerLocator,
        rightMonomerLocator,
        undefined,
        undefined,
        MacroBondTool.HYDROGEN,
      );

      await selectSequenceLayoutModeTool(page);
      await takeEditorScreenshot(page, { hideMonomerPreview: true });
      await selectSnakeLayoutModeTool(page);
    });
  }
}

for (const leftMonomer of shortMonomerList) {
  for (const rightMonomer of shortMonomerList) {
    test(
      `11-${leftMonomer.id}-${rightMonomer.id}. Sequence mode: Hydrogen side chain for: ${leftMonomer.monomerDescription} and ${rightMonomer.monomerDescription}`,
      { tag: ['@IncorrectResultBecauseOfBug'] },
      async () => {
        /*
         * Test task: https://github.com/epam/ketcher/issues/6184
         * Description: Check if hydrogen bonds connect monomers between chains (but not between bases), those
         *              hydrogen bonds should be considered as side chain connections and shown correct at sequence mode
         * Case:
         *       1. Load two monomers on the canvas
         *       2. Connect them with hydrogen bond
         *       3. Switch to the sequence mode
         *       4. Take screenshot to validate layout (connection should be considered as side chain)
         *
         *  WARNING: Some test tesults are wrong because of bug: https://github.com/epam/ketcher/issues/6204
         *  Screenshots must be updated after fix and fixme should be removed
         */
        test.setTimeout(20000);

        await loadMonomerOnCanvas(page, leftMonomer);
        let leftMonomerAlias;
        if (leftMonomer.type === 'Nucleoside') {
          leftMonomerAlias = 'R';
        } else if (leftMonomer.type === 'Nucleotide') {
          leftMonomerAlias = 'P';
        } else {
          leftMonomerAlias = leftMonomer.alias;
        }
        const leftMonomerLocator = getMonomerLocator(page, {
          monomerAlias: leftMonomerAlias,
        }).first();
        await loadMonomerOnCanvas(page, rightMonomer);
        let rightMonomerAlias;
        if (rightMonomer.type === 'Nucleoside') {
          rightMonomerAlias = 'R';
        } else if (rightMonomer.type === 'Nucleotide') {
          rightMonomerAlias = 'P';
        } else {
          rightMonomerAlias = rightMonomer.alias;
        }

        const rightMonomerLocators = getMonomerLocator(page, {
          monomerAlias: rightMonomerAlias,
        });

        const rightMonomerLocator =
          (await rightMonomerLocators.count()) > 1
            ? rightMonomerLocators.nth(1)
            : rightMonomerLocators.nth(0);

        await bondTwoMonomers(
          page,
          leftMonomerLocator,
          rightMonomerLocator,
          undefined,
          undefined,
          MacroBondTool.HYDROGEN,
        );

        await selectSequenceLayoutModeTool(page);
        await takeEditorScreenshot(page, { hideMonomerPreview: true });
        await selectSnakeLayoutModeTool(page);
      },
    );
  }
}
