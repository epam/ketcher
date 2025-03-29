/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Bases } from '@constants/monomers/Bases';
import { Page, test, expect } from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  MacroBondType,
  MacroFileType,
  MonomerType,
  openFileAndAddToCanvasMacro,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  resetZoomLevelToDefault,
  selectAllStructuresOnCanvas,
  selectClearCanvasTool,
  selectFlexLayoutModeTool,
  selectSequenceLayoutModeTool,
  selectSnakeLayoutModeTool,
  SequenceChainType,
  SequenceModeType,
  SymbolType,
  takeEditorScreenshot,
  waitForPageInit,
  waitForRender,
} from '@utils';
import { MacroBondTool } from '@utils/canvas/tools/selectNestedTool/types';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
import {
  getMonomerLocator,
  getSymbolLocator,
  turnSyncEditModeOff,
  turnSyncEditModeOn,
} from '@utils/macromolecules/monomer';
import {
  bondTwoMonomers,
  getBondLocator,
} from '@utils/macromolecules/polymerBond';
import {
  pressYesInConfirmYourActionDialog,
  switchToDNAMode,
  switchToPeptideMode,
  switchToRNAMode,
} from '@utils/macromolecules/sequence';

let page: Page;

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();

  await waitForPageInit(page);
  await turnOnMacromoleculesEditor(page);
  await selectSequenceLayoutModeTool(page);
});

test.afterEach(async () => {
  await selectClearCanvasTool(page);
  await resetZoomLevelToDefault(page);
  await selectFlexLayoutModeTool(page);
});

test.afterAll(async ({ browser }) => {
  await Promise.all(browser.contexts().map((context) => context.close()));
});

interface IMonomerToAdd {
  Id: number;
  Type: SequenceModeType;
  Letter: string;
}

const monomersToAdd: IMonomerToAdd[] = [
  {
    Id: 1,
    Type: SequenceModeType.RNA,
    Letter: 'C',
  },
  {
    Id: 2,
    Type: SequenceModeType.Peptide,
    Letter: 'E',
  },
];

const dash: IMonomerToAdd[] = [
  {
    Id: 3,
    Type: SequenceModeType.Dash,
    Letter: '-',
  },
];

const enter: IMonomerToAdd[] = [
  {
    Id: 4,
    Type: SequenceModeType.Enter,
    Letter: 'Enter',
  },
];

interface ISequence {
  Id: number;
  HELM?: string;
  KET?: string;
  SequenceName: string;
  Rotation?: boolean;
  LeftAnchoredHELM?: string;
  RightAnchoredHELM?: string;
}

const sequences: ISequence[] = [
  {
    Id: 1,
    SequenceName: '(A---A)(A---A)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)}$RNA1,RNA2,8:pair-2:pair|RNA1,RNA2,5:pair-5:pair|RNA1,RNA2,2:pair-8:pair$$$V2.0',
  },
  {
    Id: 2,
    SequenceName: '(A---A)(A---A)(A---O)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA2,2:pair-5:pair|RNA2,CHEM1,1:R1-1:R2|RNA1,CHEM1,8:pair-1:pair$$$V2.0',
  },
  {
    Id: 3,
    SequenceName: '(A---A)(A---A)(O---O)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P.R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA2,2:pair-5:pair|RNA1,CHEM2,6:R2-1:R1|RNA2,CHEM1,1:R1-1:R2|CHEM2,CHEM1,1:pair-1:pair$$$V2.0',
  },
  {
    Id: 4,
    SequenceName: '(A---A)(A---A)(AA)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)}$RNA1,RNA2,5:pair-5:pair|RNA1,RNA2,2:pair-8:pair$$$V2.0',
  },
  {
    Id: 5,
    SequenceName: '(A---A)(A---A)(AO)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA2,2:pair-5:pair|RNA2,CHEM1,1:R1-1:R2$$$V2.0',
  },
  {
    Id: 6,
    SequenceName: '(A---A)(A---A)(OO)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P.R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA2,2:pair-5:pair|RNA1,CHEM2,6:R2-1:R1|RNA2,CHEM1,1:R1-1:R2$$$V2.0',
  },
  {
    Id: 7,
    SequenceName: '(A---A)(A---A)(Ab)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA2,2:pair-5:pair$$$V2.0',
  },
  {
    Id: 8,
    SequenceName: '(A---A)(A---O)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P}|RNA3{R(U)}|CHEM1{[4aPEGMal]}$RNA1,RNA2,8:pair-2:pair|RNA1,RNA3,2:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|CHEM1,RNA3,1:R2-1:R1|RNA1,CHEM1,5:pair-1:pair$$$V2.0',
  },
  {
    Id: 9,
    SequenceName: '(A---A)(A---O)(O---A)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P}|RNA3{R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA3,2:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|CHEM1,RNA3,1:R2-1:R1|RNA1,CHEM2,6:R2-1:R1|CHEM2,RNA2,1:pair-2:pair|RNA1,CHEM1,5:pair-1:pair$$$V2.0',
  },
  {
    Id: 10,
    SequenceName: '(A---A)(A---O)(AA)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P}|RNA3{R(U)}|CHEM1{[4aPEGMal]}$RNA1,RNA3,2:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|CHEM1,RNA3,1:R2-1:R1|RNA1,CHEM1,5:pair-1:pair$$$V2.0',
  },
  {
    Id: 11,
    SequenceName: '(A---A)(A---O)(OA)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P}|RNA3{R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA3,2:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|CHEM1,RNA3,1:R2-1:R1|RNA1,CHEM1,5:pair-1:pair|RNA1,CHEM2,6:R2-1:R1$$$V2.0',
  },
  {
    Id: 12,
    SequenceName: '(A---A)(A---O)(Ab)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)}|CHEM1{[4aPEGMal]}$RNA1,RNA2,2:pair-2:pair|CHEM1,RNA2,1:R2-1:R1|RNA1,CHEM1,5:pair-1:pair$$$V2.0',
  },
  {
    Id: 13,
    SequenceName: '(A---A)(A---O)(Ob)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,2:pair-2:pair|CHEM1,RNA2,1:R2-1:R1|RNA1,CHEM1,5:pair-1:pair|RNA1,CHEM2,6:R2-1:R1$$$V2.0',
  },
  {
    Id: 14,
    SequenceName: '(A---A)(O---O)(A---A)',
    HELM: 'RNA1{R(A)P}|RNA2{R(A)}|RNA3{R(U)P}|RNA4{R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA2,RNA3,2:pair-2:pair|RNA1,RNA4,2:pair-2:pair|RNA1,CHEM1,3:R2-1:R1|CHEM1,RNA2,1:R2-1:R1|RNA3,CHEM2,3:R2-1:R1|CHEM2,RNA4,1:R2-1:R1|CHEM1,CHEM2,1:pair-1:pair$$$V2.0',
  },
  {
    Id: 15,
    SequenceName: '(A---A)(O---O)(AA)',
    HELM: 'RNA1{R(A)P}|RNA2{R(A)}|RNA3{R(U)P}|RNA4{R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA4,2:pair-2:pair|RNA1,CHEM1,3:R2-1:R1|CHEM1,RNA2,1:R2-1:R1|RNA3,CHEM2,3:R2-1:R1|CHEM2,RNA4,1:R2-1:R1|CHEM1,CHEM2,1:pair-1:pair$$$V2.0',
  },
  {
    Id: 16,
    SequenceName: '(A---A)(O---O)(Ab)',
    HELM: 'RNA1{R(A)P}|RNA2{R(A)}|RNA3{R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA3,2:pair-2:pair|RNA1,CHEM1,3:R2-1:R1|CHEM1,RNA2,1:R2-1:R1|CHEM2,RNA3,1:R2-1:R1|CHEM1,CHEM2,1:pair-1:pair$$$V2.0',
  },
  {
    Id: 17,
    SequenceName: '(A---A)(AA)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)}$RNA1,RNA2,8:pair-2:pair|RNA1,RNA2,2:pair-8:pair$$$V2.0',
  },
  {
    Id: 18,
    SequenceName: '(A---A)(AA)(A---O)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)}|CHEM1{[4aPEGMal]}$RNA1,RNA2,2:pair-5:pair|RNA1,CHEM1,8:pair-1:pair|RNA2,CHEM1,1:R1-1:R2$$$V2.0',
  },
  {
    Id: 19,
    SequenceName: '(A---A)(AA)(O---O)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P.R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,2:pair-5:pair|RNA1,CHEM2,6:R2-1:R1|RNA2,CHEM1,1:R1-1:R2|CHEM2,CHEM1,1:pair-1:pair$$$V2.0',
  },
  {
    Id: 20,
    SequenceName: '(A---A)(AA)(AA)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)}$RNA1,RNA2,2:pair-8:pair$$$V2.0',
  },
  {
    Id: 21,
    SequenceName: '(A---A)(AA)(AO)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)}|CHEM1{[4aPEGMal]}$RNA1,RNA2,2:pair-5:pair|RNA2,CHEM1,1:R1-1:R2$$$V2.0',
  },
  {
    Id: 22,
    SequenceName: '(A---A)(AA)(OO)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P.R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,2:pair-5:pair|RNA1,CHEM2,6:R2-1:R1|RNA2,CHEM1,1:R1-1:R2$$$V2.0',
  },
  {
    Id: 23,
    SequenceName: '(A---A)(AA)(Ab)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)}$RNA1,RNA2,2:pair-5:pair$$$V2.0',
  },
  {
    Id: 24,
    SequenceName: '(A---A)(AO)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P}|RNA3{R(U)}|CHEM1{[4aPEGMal]}$RNA1,RNA2,8:pair-2:pair|RNA1,RNA3,2:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|CHEM1,RNA3,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 25,
    SequenceName: '(A---A)(AO)(O---A)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P}|RNA3{R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA3,2:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|CHEM1,RNA3,1:R2-1:R1|RNA1,CHEM2,6:R2-1:R1|CHEM2,RNA2,1:pair-2:pair$$$V2.0',
  },
  {
    Id: 26,
    SequenceName: '(A---A)(AO)(AA)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P}|RNA3{R(U)}|CHEM1{[4aPEGMal]}$RNA1,RNA3,2:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|CHEM1,RNA3,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 27,
    SequenceName: '(A---A)(AO)(OA)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P}|RNA3{R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA3,2:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|CHEM1,RNA3,1:R2-1:R1|RNA1,CHEM2,6:R2-1:R1$$$V2.0',
  },
  {
    Id: 28,
    SequenceName: '(A---A)(AO)(Ab)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)}|CHEM1{[4aPEGMal]}$RNA1,RNA2,2:pair-2:pair|CHEM1,RNA2,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 29,
    SequenceName: '(A---A)(AO)(Ob)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,2:pair-2:pair|CHEM1,RNA2,1:R2-1:R1|RNA1,CHEM2,6:R2-1:R1$$$V2.0',
  },
  {
    Id: 30,
    SequenceName: '(A---A)(OO)(A---A)',
    HELM: 'RNA1{R(A)P}|RNA2{R(A)}|RNA3{R(U)P}|RNA4{R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA2,RNA3,2:pair-2:pair|RNA1,RNA4,2:pair-2:pair|RNA1,CHEM1,3:R2-1:R1|CHEM1,RNA2,1:R2-1:R1|RNA3,CHEM2,3:R2-1:R1|CHEM2,RNA4,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 31,
    SequenceName: '(A---A)(OO)(AA)',
    HELM: 'RNA1{R(A)P}|RNA2{R(A)}|RNA3{R(U)P}|RNA4{R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA4,2:pair-2:pair|RNA1,CHEM1,3:R2-1:R1|CHEM1,RNA2,1:R2-1:R1|RNA3,CHEM2,3:R2-1:R1|CHEM2,RNA4,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 32,
    SequenceName: '(A---A)(OO)(Ab)',
    HELM: 'RNA1{R(A)P}|RNA2{R(A)}|RNA3{R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA3,2:pair-2:pair|RNA1,CHEM1,3:R2-1:R1|CHEM1,RNA2,1:R2-1:R1|CHEM2,RNA3,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 33,
    SequenceName: '(A---A)(Ab)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)}|RNA3{R(U)}$RNA1,RNA2,8:pair-2:pair|RNA1,RNA3,2:pair-2:pair$$$V2.0',
  },
  {
    Id: 38,
    SequenceName: '(A---A)(A_)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)}$RNA1,RNA2,8:pair-2:pair|RNA1,RNA2,2:pair-5:pair$$$V2.0',
  },
  {
    Id: 39,
    SequenceName: '(A---A)(A_)(A---O)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)}|CHEM1{[4aPEGMal]}$RNA1,RNA2,2:pair-2:pair|RNA1,CHEM1,8:pair-1:pair|RNA2,CHEM1,1:R1-1:R2$$$V2.0',
  },
  {
    Id: 40,
    SequenceName: '(A---A)(A_)(O---O)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,2:pair-2:pair|RNA1,CHEM2,6:R2-1:R1|CHEM2,CHEM1,1:pair-1:pair|CHEM1,RNA2,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 41,
    SequenceName: '(A---A)(A_)(A---p)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{P.R(U)}$RNA1,RNA2,2:pair-3:pair|RNA1,RNA2,8:pair-1:pair$$$V2.0',
  },
  {
    Id: 42,
    SequenceName: '(A---A)(A_)(O---p)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{P.R(U)}|CHEM1{[4aPEGMal]}$RNA1,RNA2,2:pair-3:pair|RNA1,CHEM1,6:R2-1:R1|CHEM1,RNA2,1:pair-1:pair$$$V2.0',
  },
  {
    Id: 43,
    SequenceName: '(A---A)(O_)(A---O)',
    HELM: 'RNA1{R(A)P}|RNA2{R(A)}|RNA3{R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA3,2:pair-2:pair|RNA2,CHEM1,2:pair-1:pair|RNA1,CHEM2,3:R2-1:R1|CHEM2,RNA2,1:R2-1:R1|CHEM1,RNA3,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 44,
    SequenceName: '(A---A)(O_)(A---p)',
    HELM: 'RNA1{R(A)P}|RNA2{R(A)}|RNA3{P.R(U)}|CHEM1{[4aPEGMal]}$RNA1,RNA3,2:pair-3:pair|RNA1,CHEM1,3:R2-1:R1|CHEM1,RNA2,1:R2-1:R1|RNA2,RNA3,2:pair-1:pair$$$V2.0',
  },
  // { // Removed since it consisit of two - chain and side chain
  //   Id: 45,
  //   SequenceName: '(A---A)(b_)(A---O)',
  //   HELM: 'RNA1{R(A)}|RNA2{R(A)}|RNA3{R(U)}|CHEM1{[4aPEGMal]}$RNA1,RNA3,2:pair-2:pair|RNA2,CHEM1,2:pair-1:pair|RNA3,CHEM1,1:R1-1:R2$$$V2.0',
  //   Rotation: true,
  //   LeftAnchoredHELM:
  //     'RNA1{R(A)}|RNA2{R(A)}|RNA3{R(U)}|CHEM1{[4aPEGMal]}|PEPTIDE1{D.D.D.D}$RNA1,RNA3,2:pair-2:pair|RNA2,CHEM1,2:pair-1:pair|RNA3,CHEM1,1:R1-1:R2|PEPTIDE1,RNA1,4:R2-1:R1$$$V2.0',
  //   RightAnchoredHELM:
  //     'RNA1{R(A)}|RNA2{R(A)}|RNA3{R(U)}|CHEM1{[4aPEGMal]}|PEPTIDE1{D.D.D.D}$RNA1,RNA3,2:pair-2:pair|RNA2,CHEM1,2:pair-1:pair|RNA3,CHEM1,1:R1-1:R2|PEPTIDE1,RNA2,1:R1-1:R2$$$V2.0',
  // },
  {
    // known issue = https://github.com/epam/ketcher/issues/6761
    Id: 47,
    SequenceName: '(A---A)(_b)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)}|RNA3{R(U)}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA3,2:pair-2:pair$$$V2.0',
  },
  {
    Id: 50,
    SequenceName: '(O---A)(A---O)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)P}|RNA3{R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA2,CHEM1,3:R2-1:R1|CHEM1,RNA3,1:R2-1:R1|CHEM2,RNA1,1:R2-1:R1|CHEM2,RNA3,1:pair-2:pair|RNA1,RNA2,5:pair-2:pair|RNA1,CHEM1,2:pair-1:pair$$$V2.0',
  },
  {
    Id: 51,
    SequenceName: '(O---A)(AO)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)P}|RNA3{R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA2,CHEM1,3:R2-1:R1|CHEM1,RNA3,1:R2-1:R1|CHEM2,RNA1,1:R2-1:R1|CHEM2,RNA3,1:pair-2:pair|RNA1,RNA2,5:pair-2:pair$$$V2.0',
  },
  {
    Id: 52,
    SequenceName: '(p---A)(A---O)(A---A)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P}|RNA3{R(U)}|CHEM1{[4aPEGMal]}$RNA2,CHEM1,3:R2-1:R1|CHEM1,RNA3,1:R2-1:R1|RNA1,RNA2,6:pair-2:pair|RNA1,RNA3,1:pair-2:pair$$$V2.0',
  },
  {
    Id: 53,
    SequenceName: '(p---A)(AO)(A---A)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P}|RNA3{R(U)}|CHEM1{[4aPEGMal]}$RNA2,CHEM1,3:R2-1:R1|CHEM1,RNA3,1:R2-1:R1|RNA1,RNA2,6:pair-2:pair|RNA1,RNA3,1:pair-2:pair$$$V2.0',
  },
  {
    Id: 54,
    SequenceName: '(A---O)(A---A)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,8:pair-2:pair|RNA1,RNA2,5:pair-5:pair|RNA2,CHEM1,6:R2-1:R1|RNA1,CHEM1,2:pair-1:pair$$$V2.0',
  },
  {
    Id: 55,
    SequenceName: '(A---O)(A---A)(O---A)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-5:pair|RNA2,CHEM1,6:R2-1:R1|RNA1,CHEM1,2:pair-1:pair|RNA1,CHEM2,6:R2-1:R1|CHEM2,RNA2,1:pair-2:pair$$$V2.0',
  },
  {
    Id: 56,
    SequenceName: '(A---O)(A---A)(A---O)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|RNA1,CHEM1,2:pair-1:pair|CHEM2,RNA2,1:R2-1:R1|RNA1,CHEM2,8:pair-1:pair$$$V2.0',
  },
  {
    Id: 57,
    SequenceName: '(A---O)(A---A)(O---O)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}|CHEM3{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|RNA1,CHEM1,2:pair-1:pair|CHEM2,RNA2,1:R2-1:R1|RNA1,CHEM3,6:R2-1:R1|CHEM3,CHEM2,1:pair-1:pair$$$V2.0',
  },
  {
    Id: 58,
    SequenceName: '(A---O)(A---A)(AA)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-5:pair|RNA2,CHEM1,6:R2-1:R1|RNA1,CHEM1,2:pair-1:pair$$$V2.0',
  },
  {
    Id: 59,
    SequenceName: '(A---O)(A---A)(OA)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-5:pair|RNA2,CHEM1,6:R2-1:R1|RNA1,CHEM1,2:pair-1:pair|RNA1,CHEM2,6:R2-1:R1$$$V2.0',
  },
  {
    Id: 60,
    SequenceName: '(A---O)(A---A)(AO)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|RNA1,CHEM1,2:pair-1:pair|CHEM2,RNA2,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 61,
    SequenceName: '(A---O)(A---A)(OO)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}|CHEM3{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|RNA1,CHEM1,2:pair-1:pair|CHEM2,RNA2,1:R2-1:R1|RNA1,CHEM3,6:R2-1:R1$$$V2.0',
  },
  {
    Id: 62,
    SequenceName: '(A---O)(A---A)(Ab)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|RNA1,CHEM1,2:pair-1:pair$$$V2.0',
  },
  {
    Id: 63,
    SequenceName: '(A---O)(A---A)(Ob)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|RNA1,CHEM1,2:pair-1:pair|RNA1,CHEM2,6:R2-1:R1$$$V2.0',
  },
  {
    Id: 64,
    SequenceName: '(A---O)(O---A)(A---A)',
    HELM: 'RNA1{R(A)P}|RNA2{R(A)}|RNA3{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA2,RNA3,2:pair-2:pair|RNA3,CHEM1,6:R2-1:R1|RNA1,CHEM1,2:pair-1:pair|RNA1,CHEM2,3:R2-1:R1|CHEM2,RNA2,1:R2-1:R1|CHEM2,RNA3,1:pair-5:pair$$$V2.0',
  },
  {
    Id: 65,
    SequenceName: '(A---O)(AA)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,8:pair-2:pair|RNA2,CHEM1,6:R2-1:R1|RNA1,CHEM1,2:pair-1:pair$$$V2.0',
  },
  {
    Id: 66,
    SequenceName: '(A---O)(OA)(A---A)',
    HELM: 'RNA1{R(A)P}|RNA2{R(A)}|RNA3{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA2,RNA3,2:pair-2:pair|RNA3,CHEM1,6:R2-1:R1|RNA1,CHEM1,2:pair-1:pair|RNA1,CHEM2,3:R2-1:R1|CHEM2,RNA2,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 69,
    SequenceName: '(A---O)(A_)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,8:pair-2:pair|RNA1,CHEM1,2:pair-1:pair|RNA2,CHEM1,3:R2-1:R1$$$V2.0',
  },
  {
    Id: 70,
    SequenceName: '(A---O)(O_)(A---A)',
    HELM: 'RNA1{R(A)P}|RNA2{R(A)}|RNA3{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA2,RNA3,2:pair-2:pair|RNA1,CHEM1,2:pair-1:pair|RNA3,CHEM1,3:R2-1:R1|RNA1,CHEM2,3:R2-1:R1|CHEM2,RNA2,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 73,
    SequenceName: '(O---O)(A---A)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA2,2:pair-5:pair|CHEM1,RNA1,1:R2-1:R1|CHEM1,CHEM2,1:pair-1:pair|RNA2,CHEM2,6:R2-1:R1$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA2,2:pair-5:pair|CHEM1,RNA1,1:R2-1:R1|CHEM1,CHEM2,1:pair-1:pair|RNA2,CHEM2,6:R2-1:R1|PEPTIDE1,CHEM1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA2,2:pair-5:pair|CHEM1,RNA1,1:R2-1:R1|CHEM1,CHEM2,1:pair-1:pair|RNA2,CHEM2,6:R2-1:R1|PEPTIDE1,RNA1,1:R1-4:R2$$$V2.0',
  },
  {
    Id: 74,
    SequenceName: '(O---O)(A---A)(A---O)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}|CHEM3{[4aPEGMal]}$RNA1,RNA2,2:pair-2:pair|CHEM1,RNA1,1:R2-1:R1|CHEM1,CHEM2,1:pair-1:pair|RNA2,CHEM2,3:R2-1:R1|RNA2,CHEM3,1:R1-1:R2|RNA1,CHEM3,5:pair-1:pair$$$V2.0',
  },
  {
    Id: 75,
    SequenceName: '(O---O)(A---A)(O---O)',
    HELM: 'RNA1{R(A)P}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}|CHEM3{[4aPEGMal]}|CHEM4{[4aPEGMal]}$RNA1,RNA2,2:pair-2:pair|CHEM1,RNA1,1:R2-1:R1|CHEM1,CHEM2,1:pair-1:pair|RNA2,CHEM2,3:R2-1:R1|RNA2,CHEM3,1:R1-1:R2|RNA1,CHEM4,3:R2-1:R1|CHEM4,CHEM3,1:pair-1:pair$$$V2.0',
  },
  {
    Id: 76,
    SequenceName: '(O---O)(A---A)(AA)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,2:pair-5:pair|CHEM1,RNA1,1:R2-1:R1|CHEM1,CHEM2,1:pair-1:pair|RNA2,CHEM2,6:R2-1:R1$$$V2.0',
  },
  {
    Id: 77,
    SequenceName: '(O---O)(A---A)(AO)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}|CHEM3{[4aPEGMal]}$RNA1,RNA2,2:pair-2:pair|CHEM1,RNA1,1:R2-1:R1|CHEM1,CHEM2,1:pair-1:pair|RNA2,CHEM2,3:R2-1:R1|RNA2,CHEM3,1:R1-1:R2$$$V2.0',
  },
  {
    Id: 78,
    SequenceName: '(O---O)(A---A)(OO)',
    HELM: 'RNA1{R(A)P}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}|CHEM3{[4aPEGMal]}|CHEM4{[4aPEGMal]}$RNA1,RNA2,2:pair-2:pair|CHEM1,RNA1,1:R2-1:R1|CHEM1,CHEM2,1:pair-1:pair|RNA2,CHEM2,3:R2-1:R1|RNA2,CHEM3,1:R1-1:R2|RNA1,CHEM4,3:R2-1:R1$$$V2.0',
  },
  {
    Id: 79,
    SequenceName: '(O---O)(A---A)(Ab)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,2:pair-2:pair|CHEM1,RNA1,1:R2-1:R1|CHEM1,CHEM2,1:pair-1:pair|RNA2,CHEM2,3:R2-1:R1$$$V2.0',
  },
  {
    Id: 80,
    SequenceName: '(O---O)(AA)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|CHEM1,RNA1,1:R2-1:R1|CHEM1,CHEM2,1:pair-1:pair|RNA2,CHEM2,6:R2-1:R1$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|CHEM1,RNA1,1:R2-1:R1|CHEM1,CHEM2,1:pair-1:pair|RNA2,CHEM2,6:R2-1:R1|PEPTIDE1,CHEM1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|CHEM1,RNA1,1:R2-1:R1|CHEM1,CHEM2,1:pair-1:pair|RNA2,CHEM2,6:R2-1:R1|PEPTIDE1,RNA1,1:R1-4:R2$$$V2.0',
  },
  // { // Removed since it consisit of two - chain and side chain
  //   Id: 81,
  //   SequenceName: '(O---O)(Ab)(A---A)',
  //   HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|CHEM1,RNA1,1:R2-1:R1|CHEM1,CHEM2,1:pair-1:pair$$$V2.0',
  // },
  {
    Id: 82,
    SequenceName: '(O---O)(A_)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|CHEM1,RNA1,1:R2-1:R1|CHEM1,CHEM2,1:pair-1:pair|RNA2,CHEM2,1:R2-1:R1$$$V2.0',
  },
  // { // Removed since it consisit of two - chain and side chain
  //   Id: 83,
  //   SequenceName: '(O---O)(_b)(A---A)',
  //   HELM: 'RNA1{R(A)}|RNA2{R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,2:pair-2:pair|CHEM1,CHEM2,1:pair-1:pair|CHEM1,RNA1,1:R2-1:R1$$$V2.0',
  // },
  {
    Id: 84,
    SequenceName: '(p---O)(A---A)(A---A)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,6:pair-2:pair|RNA1,RNA2,3:pair-5:pair|RNA2,CHEM1,6:R2-1:R1|CHEM1,RNA1,1:pair-1:pair$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,6:pair-2:pair|RNA1,RNA2,3:pair-5:pair|RNA2,CHEM1,6:R2-1:R1|CHEM1,RNA1,1:pair-1:pair|PEPTIDE1,RNA1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,6:pair-2:pair|RNA1,RNA2,3:pair-5:pair|RNA2,CHEM1,6:R2-1:R1|CHEM1,RNA1,1:pair-1:pair|PEPTIDE1,RNA1,1:R1-5:R2$$$V2.0',
  },
  {
    Id: 85,
    SequenceName: '(p---O)(A---A)(A---O)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,3:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|CHEM1,RNA1,1:pair-1:pair|CHEM2,RNA2,1:R2-1:R1|CHEM2,RNA1,1:pair-6:pair$$$V2.0',
  },
  {
    Id: 86,
    SequenceName: '(p---O)(A---A)(O---O)',
    HELM: 'RNA1{P.R(A)P}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}|CHEM3{[4aPEGMal]}$RNA1,RNA2,3:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|CHEM1,RNA1,1:pair-1:pair|CHEM2,RNA2,1:R2-1:R1|RNA1,CHEM3,4:R2-1:R1|CHEM3,CHEM2,1:pair-1:pair$$$V2.0',
  },
  {
    Id: 87,
    SequenceName: '(p---O)(A---A)(AA)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,3:pair-5:pair|RNA2,CHEM1,6:R2-1:R1|CHEM1,RNA1,1:pair-1:pair$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,3:pair-5:pair|RNA2,CHEM1,6:R2-1:R1|CHEM1,RNA1,1:pair-1:pair|PEPTIDE1,RNA1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,3:pair-5:pair|RNA2,CHEM1,6:R2-1:R1|CHEM1,RNA1,1:pair-1:pair|PEPTIDE1,RNA1,1:R1-5:R2$$$V2.0',
  },
  {
    Id: 88,
    SequenceName: '(p---O)(A---A)(AO)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,3:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|CHEM1,RNA1,1:pair-1:pair|CHEM2,RNA2,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 89,
    SequenceName: '(p---O)(A---A)(OO)',
    HELM: 'RNA1{P.R(A)P}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}|CHEM3{[4aPEGMal]}$RNA1,RNA2,3:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|CHEM1,RNA1,1:pair-1:pair|CHEM2,RNA2,1:R2-1:R1|RNA1,CHEM3,4:R2-1:R1|CHEM3,CHEM2,1:pair-1:pair$$$V2.0',
  },
  {
    Id: 90,
    SequenceName: '(p---O)(A---A)(Ab)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,3:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|CHEM1,RNA1,1:pair-1:pair$$$V2.0',
  },
  {
    Id: 91,
    SequenceName: '(p---O)(AA)(A---A)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,6:pair-2:pair|RNA2,CHEM1,6:R2-1:R1|CHEM1,RNA1,1:pair-1:pair$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,6:pair-2:pair|RNA2,CHEM1,6:R2-1:R1|CHEM1,RNA1,1:pair-1:pair|PEPTIDE1,RNA1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,6:pair-2:pair|RNA2,CHEM1,6:R2-1:R1|CHEM1,RNA1,1:pair-1:pair|PEPTIDE1,RNA1,1:R1-5:R2$$$V2.0',
  },
  // { // Removed since it consisit of two - chain and side chain
  //   Id: 92,
  //   SequenceName: '(p---O)(Ab)(A---A)',
  //   HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)}|CHEM1{[4aPEGMal]}$RNA1,RNA2,6:pair-2:pair|CHEM1,RNA1,1:pair-1:pair$$$V2.0',
  // },
  {
    Id: 93,
    SequenceName: '(p---O)(A_)(A---A)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)}|CHEM1{[4aPEGMal]}$RNA1,RNA2,6:pair-2:pair|CHEM1,RNA1,1:pair-1:pair|RNA2,CHEM1,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 94,
    SequenceName: '(A---p)(A---A)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|RNA3{P}$RNA1,RNA2,5:pair-5:pair|RNA1,RNA3,2:pair-1:pair|RNA2,RNA3,6:R2-1:R1|RNA1,RNA2,8:pair-2:pair$$$V2.0',
  },
  {
    Id: 95,
    SequenceName: '(A---p)(A---A)(O---A)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P.R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-5:pair|RNA1,RNA3,2:pair-1:pair|RNA2,RNA3,6:R2-1:R1|RNA1,CHEM1,6:R2-1:R1|CHEM1,RNA2,1:pair-2:pair$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P.R(A)P}|RNA2{R(U)P.R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-5:pair|RNA1,RNA3,2:pair-1:pair|RNA2,RNA3,6:R2-1:R1|RNA1,CHEM1,6:R2-1:R1|CHEM1,RNA2,1:pair-2:pair|PEPTIDE1,RNA1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P.R(A)P}|RNA2{R(U)P.R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-5:pair|RNA1,RNA3,2:pair-1:pair|RNA2,RNA3,6:R2-1:R1|RNA1,CHEM1,6:R2-1:R1|CHEM1,RNA2,1:pair-2:pair|CHEM1,PEPTIDE1,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 96,
    SequenceName: '(A---p)(A---A)(A---O)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA3,2:pair-1:pair|RNA2,CHEM1,1:R1-1:R2|RNA1,CHEM1,8:pair-1:pair|RNA2,RNA3,3:R2-1:R1$$$V2.0',
  },
  {
    Id: 97,
    SequenceName: '(A---p)(A---A)(O---O)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA3,2:pair-1:pair|RNA2,CHEM1,1:R1-1:R2|RNA2,RNA3,3:R2-1:R1|RNA1,CHEM2,6:R2-1:R1|CHEM2,CHEM1,1:pair-1:pair$$$V2.0',
  },
  {
    Id: 98,
    SequenceName: '(A---p)(A---A)(AA)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|RNA3{P}$RNA1,RNA2,5:pair-5:pair|RNA1,RNA3,2:pair-1:pair|RNA2,RNA3,6:R2-1:R1$$$V2.0',
  },
  {
    Id: 99,
    SequenceName: '(A---p)(A---A)(OA)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P.R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-5:pair|RNA1,RNA3,2:pair-1:pair|RNA2,RNA3,6:R2-1:R1|RNA1,CHEM1,6:R2-1:R1$$$V2.0',
  },
  {
    Id: 100,
    SequenceName: '(A---p)(A---A)(AO)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA3,2:pair-1:pair|RNA2,CHEM1,1:R1-1:R2|RNA2,RNA3,3:R2-1:R1$$$V2.0',
  },
  {
    Id: 101,
    SequenceName: '(A---p)(A---A)(OO)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA3,2:pair-1:pair|RNA2,CHEM1,1:R1-1:R2|RNA2,RNA3,3:R2-1:R1|RNA1,CHEM2,6:R2-1:R1$$$V2.0',
  },
  {
    Id: 102,
    SequenceName: '(A---p)(A---A)(Ab)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P}|RNA3{P}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA3,2:pair-1:pair|RNA2,RNA3,3:R2-1:R1$$$V2.0',
  },
  {
    Id: 103,
    SequenceName: '(A---p)(A---A)(Ob)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA3,2:pair-1:pair|RNA2,RNA3,3:R2-1:R1|RNA1,CHEM1,6:R2-1:R1$$$V2.0',
  },
  {
    Id: 104,
    SequenceName: '(A---p)(O---A)(A---A)',
    HELM: 'RNA1{R(A)P}|RNA2{R(A)}|RNA3{R(U)P.R(U)P}|RNA4{P}|CHEM1{[4aPEGMal]}$RNA1,RNA4,2:pair-1:pair|RNA3,RNA4,6:R2-1:R1|RNA2,RNA3,2:pair-2:pair|RNA1,CHEM1,3:R2-1:R1|CHEM1,RNA2,1:R2-1:R1|CHEM1,RNA3,1:pair-5:pair$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P}|RNA2{R(A)}|RNA3{R(U)P.R(U)P}|RNA4{P}|CHEM1{[4aPEGMal]}$RNA1,RNA4,2:pair-1:pair|RNA3,RNA4,6:R2-1:R1|RNA2,RNA3,2:pair-2:pair|RNA1,CHEM1,3:R2-1:R1|CHEM1,RNA2,1:R2-1:R1|CHEM1,RNA3,1:pair-5:pair|PEPTIDE1,RNA1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P}|RNA2{R(A)}|RNA3{R(U)P.R(U)P}|RNA4{P}|CHEM1{[4aPEGMal]}$RNA1,RNA4,2:pair-1:pair|RNA3,RNA4,6:R2-1:R1|RNA2,RNA3,2:pair-2:pair|RNA1,CHEM1,3:R2-1:R1|CHEM1,RNA2,1:R2-1:R1|CHEM1,RNA3,1:pair-5:pair|PEPTIDE1,RNA2,1:R1-1:R2$$$V2.0',
  },
  {
    Id: 106,
    SequenceName: '(A---p)(AA)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|RNA3{P}$RNA1,RNA3,2:pair-1:pair|RNA2,RNA3,6:R2-1:R1|RNA1,RNA2,8:pair-2:pair$$$V2.0',
  },
  {
    Id: 107,
    SequenceName: '(A---p)(OA)(A---A)',
    HELM: 'RNA1{R(A)P}|RNA2{R(A)}|RNA3{R(U)P.R(U)P}|RNA4{P}|CHEM1{[4aPEGMal]}$RNA1,RNA4,2:pair-1:pair|RNA3,RNA4,6:R2-1:R1|RNA2,RNA3,2:pair-2:pair|RNA1,CHEM1,3:R2-1:R1|CHEM1,RNA2,1:R2-1:R1$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P}|RNA2{R(A)}|RNA3{R(U)P.R(U)P}|RNA4{P}|CHEM1{[4aPEGMal]}$RNA1,RNA4,2:pair-1:pair|RNA3,RNA4,6:R2-1:R1|RNA2,RNA3,2:pair-2:pair|RNA1,CHEM1,3:R2-1:R1|CHEM1,RNA2,1:R2-1:R1|PEPTIDE1,RNA1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P}|RNA2{R(A)}|RNA3{R(U)P.R(U)P}|RNA4{P}|CHEM1{[4aPEGMal]}$RNA1,RNA4,2:pair-1:pair|RNA3,RNA4,6:R2-1:R1|RNA2,RNA3,2:pair-2:pair|RNA1,CHEM1,3:R2-1:R1|CHEM1,RNA2,1:R2-1:R1|RNA2,PEPTIDE1,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 110,
    SequenceName: '(A---p)(A_)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P}|RNA3{P}$RNA1,RNA3,2:pair-1:pair|RNA1,RNA2,8:pair-2:pair|RNA2,RNA3,3:R2-1:R1$$$V2.0',
  },
  {
    Id: 111,
    SequenceName: '(A---p)(O_)(A---A)',
    HELM: 'RNA1{R(A)P}|RNA2{R(A)}|RNA3{R(U)P}|RNA4{P}|CHEM1{[4aPEGMal]}$RNA1,RNA4,2:pair-1:pair|RNA2,RNA3,2:pair-2:pair|RNA3,RNA4,3:R2-1:R1|RNA1,CHEM1,3:R2-1:R1|CHEM1,RNA2,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 114,
    SequenceName: '(O---p)(A---A)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,2:pair-5:pair|RNA2,RNA3,6:R2-1:R1|RNA1,RNA2,5:pair-2:pair|CHEM1,RNA1,1:R2-1:R1|CHEM1,RNA3,1:pair-1:pair$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,2:pair-5:pair|RNA2,RNA3,6:R2-1:R1|RNA1,RNA2,5:pair-2:pair|CHEM1,RNA1,1:R2-1:R1|CHEM1,RNA3,1:pair-1:pair|PEPTIDE1,CHEM1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,2:pair-5:pair|RNA2,RNA3,6:R2-1:R1|RNA1,RNA2,5:pair-2:pair|CHEM1,RNA1,1:R2-1:R1|CHEM1,RNA3,1:pair-1:pair|RNA1,PEPTIDE1,4:R2-1:R1$$$V2.0',
  },
  {
    Id: 115,
    SequenceName: '(O---p)(A---A)(A---O)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,2:pair-2:pair|RNA2,RNA3,3:R2-1:R1|CHEM1,RNA1,1:R2-1:R1|CHEM1,RNA3,1:pair-1:pair|CHEM2,RNA2,1:R2-1:R1|CHEM2,RNA1,1:pair-5:pair$$$V2.0',
  },
  {
    Id: 116,
    SequenceName: '(O---p)(A---A)(O---O)',
    HELM: 'RNA1{R(A)P}|RNA2{R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}|CHEM3{[4aPEGMal]}$RNA1,RNA2,2:pair-2:pair|RNA2,RNA3,3:R2-1:R1|CHEM1,RNA1,1:R2-1:R1|CHEM1,RNA3,1:pair-1:pair|CHEM2,RNA2,1:R2-1:R1|RNA1,CHEM3,3:R2-1:R1|CHEM3,CHEM2,1:pair-1:pair$$$V2.0',
  },
  {
    Id: 117,
    SequenceName: '(O---p)(A---A)(AA)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|RNA3{P}$RNA1,RNA2,5:pair-5:pair|RNA1,RNA3,2:pair-1:pair|RNA2,RNA3,6:R2-1:R1$$$V2.0',
  },
  {
    Id: 118,
    SequenceName: '(O---p)(A---A)(AO)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA3,2:pair-1:pair|RNA2,RNA3,3:R2-1:R1|RNA2,CHEM1,1:R1-1:R2$$$V2.0',
  },
  {
    Id: 119,
    SequenceName: '(O---p)(A---A)(OO)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA3,2:pair-1:pair|RNA2,RNA3,3:R2-1:R1|RNA2,CHEM1,1:R1-1:R2|RNA1,CHEM2,6:R2-1:R1$$$V2.0',
  },
  {
    Id: 120,
    SequenceName: '(O---p)(A---A)(Ab)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P}|RNA3{P}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA3,2:pair-1:pair|RNA2,RNA3,3:R2-1:R1$$$V2.0',
  },
  {
    Id: 121,
    SequenceName: '(O---p)(AA)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA2,RNA3,6:R2-1:R1|RNA1,RNA2,5:pair-2:pair|CHEM1,RNA1,1:R2-1:R1|CHEM1,RNA3,1:pair-1:pair$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA2,RNA3,6:R2-1:R1|RNA1,RNA2,5:pair-2:pair|CHEM1,RNA1,1:R2-1:R1|CHEM1,RNA3,1:pair-1:pair|PEPTIDE1,CHEM1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA2,RNA3,6:R2-1:R1|RNA1,RNA2,5:pair-2:pair|CHEM1,RNA1,1:R2-1:R1|CHEM1,RNA3,1:pair-1:pair|PEPTIDE1,RNA1,1:R1-4:R2$$$V2.0',
  },
  {
    Id: 123,
    SequenceName: '(O---p)(A_)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|CHEM1,RNA1,1:R2-1:R1|CHEM1,RNA3,1:pair-1:pair|RNA2,RNA3,3:R2-1:R1$$$V2.0',
  },
  {
    Id: 124,
    SequenceName: '(p---p)(A---A)(A---A)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|RNA3{P}$RNA1,RNA2,3:pair-5:pair|RNA2,RNA3,6:R2-1:R1|RNA1,RNA2,6:pair-2:pair|RNA3,RNA1,1:pair-1:pair$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|RNA3{P}$RNA1,RNA2,3:pair-5:pair|RNA2,RNA3,6:R2-1:R1|RNA1,RNA2,6:pair-2:pair|RNA3,RNA1,1:pair-1:pair|PEPTIDE1,RNA1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|RNA3{P}$RNA1,RNA2,3:pair-5:pair|RNA2,RNA3,6:R2-1:R1|RNA1,RNA2,6:pair-2:pair|RNA3,RNA1,1:pair-1:pair|PEPTIDE1,RNA1,1:R1-5:R2$$$V2.0',
  },
  {
    Id: 125,
    SequenceName: '(p---p)(A---A)(A---O)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,3:pair-2:pair|RNA2,RNA3,3:R2-1:R1|RNA3,RNA1,1:pair-1:pair|CHEM1,RNA2,1:R2-1:R1|CHEM1,RNA1,1:pair-6:pair$$$V2.0',
  },
  {
    Id: 126,
    SequenceName: '(p---p)(A---A)(O---O)',
    HELM: 'RNA1{P.R(A)P}|RNA2{R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,3:pair-2:pair|RNA2,RNA3,3:R2-1:R1|RNA3,RNA1,1:pair-1:pair|CHEM1,RNA2,1:R2-1:R1|RNA1,CHEM2,4:R2-1:R1|CHEM2,CHEM1,1:pair-1:pair$$$V2.0',
  },
  {
    Id: 127,
    SequenceName: '(p---p)(A---A)(AA)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|RNA3{P}$RNA1,RNA2,3:pair-5:pair|RNA2,RNA3,6:R2-1:R1|RNA3,RNA1,1:pair-1:pair$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|RNA3{P}$RNA1,RNA2,3:pair-5:pair|RNA2,RNA3,6:R2-1:R1|RNA3,RNA1,1:pair-1:pair|PEPTIDE1,RNA1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|RNA3{P}$RNA1,RNA2,3:pair-5:pair|RNA2,RNA3,6:R2-1:R1|RNA3,RNA1,1:pair-1:pair|RNA1,PEPTIDE1,5:R2-1:R1$$$V2.0',
  },
  {
    Id: 128,
    SequenceName: '(p---p)(A---A)(AO)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,3:pair-2:pair|RNA2,RNA3,3:R2-1:R1|RNA3,RNA1,1:pair-1:pair|CHEM1,RNA2,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 129,
    SequenceName: '(p---p)(A---A)(OO)',
    HELM: 'RNA1{P.R(A)P}|RNA2{R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,3:pair-2:pair|RNA2,RNA3,3:R2-1:R1|RNA3,RNA1,1:pair-1:pair|CHEM1,RNA2,1:R2-1:R1|RNA1,CHEM2,4:R2-1:R1$$$V2.0',
  },
  {
    Id: 130,
    SequenceName: '(p---p)(A---A)(Ab)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P}|RNA3{P}$RNA1,RNA2,3:pair-2:pair|RNA2,RNA3,3:R2-1:R1|RNA3,RNA1,1:pair-1:pair$$$V2.0',
  },
  {
    Id: 131,
    SequenceName: '(p---p)(AA)(A---A)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|RNA3{P}$RNA2,RNA3,6:R2-1:R1|RNA1,RNA2,6:pair-2:pair|RNA3,RNA1,1:pair-1:pair$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|RNA3{P}$RNA2,RNA3,6:R2-1:R1|RNA1,RNA2,6:pair-2:pair|RNA3,RNA1,1:pair-1:pair|PEPTIDE1,RNA1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|RNA3{P}$RNA2,RNA3,6:R2-1:R1|RNA1,RNA2,6:pair-2:pair|RNA3,RNA1,1:pair-1:pair|RNA1,PEPTIDE1,5:R2-1:R1$$$V2.0',
  },
  {
    Id: 132,
    SequenceName: '(p---p)(A_)(A---A)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P}|RNA3{P}$RNA1,RNA2,6:pair-2:pair|RNA3,RNA1,1:pair-1:pair|RNA2,RNA3,3:R2-1:R1$$$V2.0',
  },
  {
    Id: 133,
    SequenceName: '(AA)(A---A)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)}$RNA1,RNA2,5:pair-5:pair|RNA1,RNA2,8:pair-2:pair$$$V2.0',
  },
  {
    Id: 134,
    SequenceName: '(AA)(A---A)(A---O)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA2,CHEM1,1:R1-1:R2|RNA1,CHEM1,8:pair-1:pair$$$V2.0',
  },
  {
    Id: 135,
    SequenceName: '(AA)(A---A)(O---O)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P.R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA2,CHEM1,1:R1-1:R2|RNA1,CHEM2,6:R2-1:R1|CHEM2,CHEM1,1:pair-1:pair$$$V2.0',
  },
  {
    Id: 136,
    SequenceName: '(AA)(A---A)(AA)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)}$RNA1,RNA2,5:pair-5:pair$$$V2.0',
  },
  {
    Id: 137,
    SequenceName: '(AA)(A---A)(AO)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA2,CHEM1,1:R1-1:R2$$$V2.0',
  },
  {
    Id: 138,
    SequenceName: '(AA)(A---A)(OO)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P.R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA2,CHEM1,1:R1-1:R2|RNA1,CHEM2,6:R2-1:R1$$$V2.0',
  },
  {
    Id: 139,
    SequenceName: '(AA)(A---A)(Ab)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P.R(U)}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA1,CHEM1,6:R2-1:R1$$$V2.0',
  },
  {
    Id: 140,
    SequenceName: '(AA)(A---O)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P}|RNA3{R(U)}|CHEM1{[4aPEGMal]}$RNA1,RNA2,8:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|CHEM1,RNA3,1:R2-1:R1|RNA1,CHEM1,5:pair-1:pair$$$V2.0',
  },
  {
    Id: 141,
    SequenceName: '(AA)(O---O)(A---A)',
    HELM: 'RNA1{R(A)P}|RNA2{R(A)}|RNA3{R(U)P}|RNA4{R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA2,RNA3,2:pair-2:pair|RNA3,CHEM1,3:R2-1:R1|CHEM1,RNA4,1:R2-1:R1|RNA1,CHEM2,3:R2-1:R1|CHEM2,RNA2,1:R2-1:R1|CHEM2,CHEM1,1:pair-1:pair$$$V2.0',
  },
  {
    Id: 142,
    SequenceName: '(AA)(AA)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)}$RNA1,RNA2,8:pair-2:pair$$$V2.0',
  },
  {
    Id: 143,
    SequenceName: '(AA)(AO)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P}|RNA3{R(U)}|CHEM1{[4aPEGMal]}$RNA1,RNA2,8:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|CHEM1,RNA3,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 144,
    SequenceName: '(AA)(OO)(A---A)',
    HELM: 'RNA1{R(A)P}|RNA2{R(A)}|RNA3{R(U)P}|RNA4{R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA2,RNA3,2:pair-2:pair|RNA3,CHEM1,3:R2-1:R1|CHEM1,RNA4,1:R2-1:R1|RNA1,CHEM2,3:R2-1:R1|CHEM2,RNA2,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 145,
    SequenceName: '(OA)(A---O)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)P}|RNA3{R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|CHEM1,RNA3,1:R2-1:R1|RNA1,CHEM1,2:pair-1:pair|CHEM2,RNA1,1:R2-1:R1$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P.R(A)}|RNA2{R(U)P}|RNA3{R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|CHEM1,RNA3,1:R2-1:R1|RNA1,CHEM1,2:pair-1:pair|CHEM2,RNA1,1:R2-1:R1|PEPTIDE1,CHEM2,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P.R(A)}|RNA2{R(U)P}|RNA3{R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|CHEM1,RNA3,1:R2-1:R1|RNA1,CHEM1,2:pair-1:pair|CHEM2,RNA1,1:R2-1:R1|PEPTIDE1,RNA1,1:R1-4:R2$$$V2.0',
  },
  {
    Id: 146,
    SequenceName: '(OA)(AO)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)P}|RNA3{R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|CHEM1,RNA3,1:R2-1:R1|CHEM2,RNA1,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 147,
    SequenceName: '(pA)(A---O)(A---A)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P}|RNA3{R(U)}|CHEM1{[4aPEGMal]}$RNA1,RNA2,6:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|CHEM1,RNA3,1:R2-1:R1|RNA1,CHEM1,3:pair-1:pair$$$V2.0',
  },
  {
    Id: 148,
    SequenceName: '(pA)(AO)(A---A)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P}|RNA3{R(U)}|CHEM1{[4aPEGMal]}$RNA1,RNA2,6:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|CHEM1,RNA3,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 149,
    SequenceName: '(AO)(A---A)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,8:pair-2:pair|RNA1,RNA2,5:pair-5:pair|RNA2,CHEM1,6:R2-1:R1$$$V2.0',
  },
  {
    Id: 150,
    SequenceName: '(AO)(A---A)(O---A)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-5:pair|RNA2,CHEM1,6:R2-1:R1|RNA1,CHEM2,6:R2-1:R1|CHEM2,RNA2,1:pair-2:pair$$$V2.0',
  },
  {
    Id: 151,
    SequenceName: '(AO)(A---A)(A---O)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|RNA2,CHEM2,1:R1-1:R2|RNA1,CHEM2,8:pair-1:pair$$$V2.0',
  },
  {
    Id: 152,
    SequenceName: '(AO)(A---A)(O---O)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}|CHEM3{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|RNA2,CHEM2,1:R1-1:R2|RNA1,CHEM3,6:R2-1:R1|CHEM3,CHEM2,1:pair-1:pair$$$V2.0',
  },
  {
    Id: 153,
    SequenceName: '(AO)(A---A)(AA)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-5:pair|RNA2,CHEM1,6:R2-1:R1$$$V2.0',
  },
  {
    Id: 154,
    SequenceName: '(AO)(A---A)(OA)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-5:pair|RNA2,CHEM1,6:R2-1:R1|RNA1,CHEM2,6:R2-1:R1|CHEM2,RNA2,1:pair-2:pair$$$V2.0',
  },
  {
    Id: 155,
    SequenceName: '(AO)(A---A)(AO)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|RNA2,CHEM2,1:R1-1:R2$$$V2.0',
  },
  {
    Id: 156,
    SequenceName: '(AO)(A---A)(OO)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}|CHEM3{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|RNA2,CHEM2,1:R1-1:R2|RNA1,CHEM3,6:R2-1:R1$$$V2.0',
  },
  {
    Id: 157,
    SequenceName: '(AO)(A---A)(Ab)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA2,CHEM1,3:R2-1:R1$$$V2.0',
  },
  {
    Id: 158,
    SequenceName: '(AO)(A---A)(Ob)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|RNA1,CHEM2,6:R2-1:R1$$$V2.0',
  },
  {
    Id: 159,
    SequenceName: '(AO)(O---A)(A---A)',
    HELM: 'RNA1{R(A)P}|RNA2{R(A)}|RNA3{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA2,RNA3,2:pair-2:pair|RNA3,CHEM1,6:R2-1:R1|RNA1,CHEM2,3:R2-1:R1|CHEM2,RNA2,1:R2-1:R1|CHEM2,RNA3,1:pair-5:pair$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P}|RNA2{R(A)}|RNA3{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA2,RNA3,2:pair-2:pair|RNA3,CHEM1,6:R2-1:R1|RNA1,CHEM2,3:R2-1:R1|CHEM2,RNA2,1:R2-1:R1|CHEM2,RNA3,1:pair-5:pair|PEPTIDE1,RNA1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P}|RNA2{R(A)}|RNA3{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA2,RNA3,2:pair-2:pair|RNA3,CHEM1,6:R2-1:R1|RNA1,CHEM2,3:R2-1:R1|CHEM2,RNA2,1:R2-1:R1|CHEM2,RNA3,1:pair-5:pair|RNA2,PEPTIDE1,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 160,
    SequenceName: '(AO)(AA)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,8:pair-2:pair|RNA2,CHEM1,6:R2-1:R1$$$V2.0',
  },
  {
    Id: 161,
    SequenceName: '(AO)(OA)(A---A)',
    HELM: 'RNA1{R(A)P}|RNA2{R(A)}|RNA3{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA2,RNA3,2:pair-2:pair|RNA3,CHEM1,6:R2-1:R1|RNA1,CHEM2,3:R2-1:R1|CHEM2,RNA2,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 162,
    SequenceName: '(OO)(A---A)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA2,2:pair-5:pair|RNA2,CHEM1,6:R2-1:R1|CHEM2,RNA1,1:R2-1:R1$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA2,2:pair-5:pair|RNA2,CHEM1,6:R2-1:R1|CHEM2,RNA1,1:R2-1:R1|PEPTIDE1,CHEM2,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA2,2:pair-5:pair|RNA2,CHEM1,6:R2-1:R1|CHEM2,RNA1,1:R2-1:R1|RNA1,PEPTIDE1,4:R2-1:R1$$$V2.0',
  },
  {
    Id: 163,
    SequenceName: '(OO)(A---A)(A---O)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}|CHEM3{[4aPEGMal]}$RNA1,RNA2,2:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|CHEM2,RNA1,1:R2-1:R1|CHEM3,RNA2,1:R2-1:R1|CHEM3,RNA1,1:pair-5:pair$$$V2.0',
  },
  // {
  //   Id: 164,
  //   SequenceName: '(OO)(A---A)(O---O)',
  //   HELM: 'RNA1{R(A)P}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}|CHEM3{[4aPEGMal]}|CHEM4{[4aPEGMal]}$RNA1,RNA2,2:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|CHEM2,RNA1,1:R2-1:R1|CHEM3,RNA2,1:R2-1:R1|RNA1,CHEM4,3:R2-1:R1|CHEM4,CHEM3,1:pair-1:pair$$$V2.0',
  // },
  {
    Id: 165,
    SequenceName: '(OO)(A---A)(AA)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,2:pair-5:pair|RNA2,CHEM1,6:R2-1:R1|CHEM2,RNA1,1:R2-1:R1$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,2:pair-5:pair|RNA2,CHEM1,6:R2-1:R1|CHEM2,RNA1,1:R2-1:R1|PEPTIDE1,CHEM2,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,2:pair-5:pair|RNA2,CHEM1,6:R2-1:R1|CHEM2,RNA1,1:R2-1:R1|PEPTIDE1,RNA1,1:R1-4:R2$$$V2.0',
  },
  {
    Id: 166,
    SequenceName: '(OO)(A---A)(AO)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}|CHEM3{[4aPEGMal]}$RNA1,RNA2,2:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|CHEM2,RNA1,1:R2-1:R1|CHEM3,RNA2,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 167,
    SequenceName: '(OO)(A---A)(OO)',
    HELM: 'RNA1{R(A)P}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}|CHEM3{[4aPEGMal]}|CHEM4{[4aPEGMal]}$RNA1,RNA2,2:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|CHEM2,RNA1,1:R2-1:R1|CHEM3,RNA2,1:R2-1:R1|RNA1,CHEM4,3:R2-1:R1$$$V2.0',
  },
  {
    Id: 168,
    SequenceName: '(OO)(A---A)(Ab)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,2:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|CHEM2,RNA1,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 169,
    SequenceName: '(OO)(AA)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA2,CHEM1,6:R2-1:R1|CHEM2,RNA1,1:R2-1:R1$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA2,CHEM1,6:R2-1:R1|CHEM2,RNA1,1:R2-1:R1|PEPTIDE1,CHEM2,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA2,CHEM1,6:R2-1:R1|CHEM2,RNA1,1:R2-1:R1|PEPTIDE1,RNA1,1:R1-4:R2$$$V2.0',
  },
  {
    Id: 170,
    SequenceName: '(pO)(A---A)(A---A)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,6:pair-2:pair|RNA1,RNA2,3:pair-5:pair|RNA2,CHEM1,6:R2-1:R1$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,6:pair-2:pair|RNA1,RNA2,3:pair-5:pair|RNA2,CHEM1,6:R2-1:R1|PEPTIDE1,RNA1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,6:pair-2:pair|RNA1,RNA2,3:pair-5:pair|RNA2,CHEM1,6:R2-1:R1|RNA1,PEPTIDE1,5:R2-1:R1$$$V2.0',
  },
  {
    Id: 171,
    SequenceName: '(pO)(A---A)(A---O)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,3:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|CHEM2,RNA2,1:R2-1:R1|CHEM2,RNA1,1:pair-6:pair$$$V2.0',
  },
  {
    Id: 172,
    SequenceName: '(pO)(A---A)(O---O)',
    HELM: 'RNA1{P.R(A)P}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}|CHEM3{[4aPEGMal]}$RNA1,RNA2,3:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|CHEM2,RNA2,1:R2-1:R1|RNA1,CHEM3,4:R2-1:R1|CHEM3,CHEM2,1:pair-1:pair$$$V2.0',
  },
  {
    Id: 173,
    SequenceName: '(pO)(A---A)(AA)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,3:pair-5:pair|RNA2,CHEM1,6:R2-1:R1$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,3:pair-5:pair|RNA2,CHEM1,6:R2-1:R1|PEPTIDE1,RNA1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,3:pair-5:pair|RNA2,CHEM1,6:R2-1:R1|RNA1,PEPTIDE1,5:R2-1:R1$$$V2.0',
  },
  {
    Id: 174,
    SequenceName: '(pO)(A---A)(AO)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,3:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|CHEM2,RNA2,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 175,
    SequenceName: '(pO)(A---A)(OO)',
    HELM: 'RNA1{P.R(A)P}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}|CHEM3{[4aPEGMal]}$RNA1,RNA2,3:pair-2:pair|RNA2,CHEM1,3:R2-1:R1|CHEM2,RNA2,1:R2-1:R1|RNA1,CHEM3,4:R2-1:R1$$$V2.0',
  },
  {
    Id: 176,
    SequenceName: '(pO)(A---A)(Ab)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,3:pair-2:pair|RNA2,CHEM1,3:R2-1:R1$$$V2.0',
  },
  {
    Id: 177,
    SequenceName: '(pO)(AA)(A---A)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,6:pair-2:pair|RNA2,CHEM1,6:R2-1:R1$$$V2.0',
  },
  // Commented out because of the bug: https://github.com/epam/ketcher/issues/6712
  // {
  //   Id: 178,
  //   SequenceName: '(bO)(A---A)(Ab)',
  //   HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,2:pair-2:pair|RNA2,CHEM1,3:R2-1:R1$$$V2.0',
  // },
  {
    Id: 179,
    SequenceName: '(Ap)(A---A)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|RNA3{P}$RNA1,RNA2,5:pair-5:pair|RNA1,RNA2,8:pair-2:pair|RNA2,RNA3,6:R2-1:R1$$$V2.0',
  },
  {
    Id: 180,
    SequenceName: '(Ap)(A---A)(O---A)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P.R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-5:pair|RNA2,RNA3,6:R2-1:R1|RNA1,CHEM1,6:R2-1:R1|CHEM1,RNA2,1:pair-2:pair$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P.R(A)P}|RNA2{R(U)P.R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-5:pair|RNA2,RNA3,6:R2-1:R1|RNA1,CHEM1,6:R2-1:R1|CHEM1,RNA2,1:pair-2:pair|PEPTIDE1,RNA1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P.R(A)P}|RNA2{R(U)P.R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-5:pair|RNA2,RNA3,6:R2-1:R1|RNA1,CHEM1,6:R2-1:R1|CHEM1,RNA2,1:pair-2:pair|PEPTIDE1,CHEM1,1:R1-1:R2$$$V2.0',
  },
  {
    Id: 181,
    SequenceName: '(Ap)(A---A)(A---O)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA2,RNA3,3:R2-1:R1|RNA2,CHEM1,1:R1-1:R2|RNA1,CHEM1,8:pair-1:pair$$$V2.0',
  },
  {
    Id: 182,
    SequenceName: '(Ap)(A---A)(O---O)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA2,RNA3,3:R2-1:R1|RNA2,CHEM1,1:R1-1:R2|RNA1,CHEM2,6:R2-1:R1|CHEM2,CHEM1,1:pair-1:pair$$$V2.0',
  },
  {
    Id: 183,
    SequenceName: '(Ap)(A---A)(AA)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|RNA3{P}$RNA1,RNA2,5:pair-5:pair|RNA2,RNA3,6:R2-1:R1$$$V2.0',
  },
  {
    Id: 184,
    SequenceName: '(Ap)(A---A)(OA)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P.R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-5:pair|RNA2,RNA3,6:R2-1:R1|RNA1,CHEM1,6:R2-1:R1$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P.R(A)P}|RNA2{R(U)P.R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-5:pair|RNA2,RNA3,6:R2-1:R1|RNA1,CHEM1,6:R2-1:R1|PEPTIDE1,RNA1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P.R(A)P}|RNA2{R(U)P.R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-5:pair|RNA2,RNA3,6:R2-1:R1|RNA1,CHEM1,6:R2-1:R1|PEPTIDE1,CHEM1,1:R1-1:R2$$$V2.0',
  },
  {
    Id: 185,
    SequenceName: '(Ap)(A---A)(AO)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA2,RNA3,3:R2-1:R1|RNA2,CHEM1,1:R1-1:R2$$$V2.0',
  },
  {
    Id: 186,
    SequenceName: '(Ap)(A---A)(OO)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA2,RNA3,3:R2-1:R1|RNA2,CHEM1,1:R1-1:R2|RNA1,CHEM2,6:R2-1:R1$$$V2.0',
  },
  {
    Id: 187,
    SequenceName: '(Ap)(A---A)(Ab)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P}|RNA3{P}$RNA1,RNA2,5:pair-2:pair|RNA2,RNA3,3:R2-1:R1$$$V2.0',
  },
  {
    Id: 188,
    SequenceName: '(Ap)(A---A)(Ob)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA2,RNA3,3:R2-1:R1|RNA1,CHEM1,6:R2-1:R1$$$V2.0',
  },
  {
    Id: 189,
    SequenceName: '(Ap)(O---A)(A---A)',
    HELM: 'RNA1{R(A)P}|RNA2{R(A)}|RNA3{R(U)P.R(U)P}|RNA4{P}|CHEM1{[4aPEGMal]}$RNA2,RNA3,2:pair-2:pair|RNA3,RNA4,6:R2-1:R1|RNA1,CHEM1,3:R2-1:R1|CHEM1,RNA2,1:R2-1:R1|CHEM1,RNA3,1:pair-5:pair$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P}|RNA2{R(A)}|RNA3{R(U)P.R(U)P}|RNA4{P}|CHEM1{[4aPEGMal]}$RNA2,RNA3,2:pair-2:pair|RNA3,RNA4,6:R2-1:R1|RNA1,CHEM1,3:R2-1:R1|CHEM1,RNA2,1:R2-1:R1|CHEM1,RNA3,1:pair-5:pair|PEPTIDE1,RNA1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P}|RNA2{R(A)}|RNA3{R(U)P.R(U)P}|RNA4{P}|CHEM1{[4aPEGMal]}$RNA2,RNA3,2:pair-2:pair|RNA3,RNA4,6:R2-1:R1|RNA1,CHEM1,3:R2-1:R1|CHEM1,RNA2,1:R2-1:R1|CHEM1,RNA3,1:pair-5:pair|RNA2,PEPTIDE1,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 190,
    SequenceName: '(Ap)(AA)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|RNA3{P}$RNA1,RNA2,8:pair-2:pair|RNA2,RNA3,6:R2-1:R1$$$V2.0',
  },
  {
    Id: 191,
    SequenceName: '(Ap)(OA)(A---A)',
    HELM: 'RNA1{R(A)P}|RNA2{R(A)}|RNA3{R(U)P.R(U)P}|RNA4{P}|CHEM1{[4aPEGMal]}$RNA2,RNA3,2:pair-2:pair|RNA3,RNA4,6:R2-1:R1|RNA1,CHEM1,3:R2-1:R1|CHEM1,RNA2,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 192,
    SequenceName: '(Op)(A---A)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|RNA3{P}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA2,2:pair-5:pair|CHEM1,RNA1,1:R2-1:R1|RNA2,RNA3,6:R2-1:R1$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|RNA3{P}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA2,2:pair-5:pair|CHEM1,RNA1,1:R2-1:R1|RNA2,RNA3,6:R2-1:R1|PEPTIDE1,CHEM1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|RNA3{P}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA2,2:pair-5:pair|CHEM1,RNA1,1:R2-1:R1|RNA2,RNA3,6:R2-1:R1|PEPTIDE1,RNA1,1:R1-4:R2$$$V2.0',
  },
  {
    Id: 193,
    SequenceName: '(Op)(A---A)(A---O)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|RNA3{P}|CHEM2{[4aPEGMal]}$RNA1,RNA2,2:pair-2:pair|CHEM1,RNA1,1:R2-1:R1|RNA2,RNA3,3:R2-1:R1|CHEM2,RNA2,1:R2-1:R1|CHEM2,RNA1,1:pair-5:pair$$$V2.0',
  },
  {
    Id: 194,
    SequenceName: '(Op)(A---A)(O---O)',
    HELM: 'RNA1{R(A)P}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|RNA3{P}|CHEM2{[4aPEGMal]}|CHEM3{[4aPEGMal]}$RNA1,RNA2,2:pair-2:pair|CHEM1,RNA1,1:R2-1:R1|RNA2,RNA3,3:R2-1:R1|CHEM2,RNA2,1:R2-1:R1|RNA1,CHEM3,3:R2-1:R1|CHEM3,CHEM2,1:pair-1:pair$$$V2.0',
  },
  {
    Id: 195,
    SequenceName: '(Op)(A---A)(AA)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|RNA3{P}$RNA1,RNA2,2:pair-5:pair|CHEM1,RNA1,1:R2-1:R1|RNA2,RNA3,6:R2-1:R1$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|RNA3{P}$RNA1,RNA2,2:pair-5:pair|CHEM1,RNA1,1:R2-1:R1|RNA2,RNA3,6:R2-1:R1|PEPTIDE1,CHEM1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|RNA3{P}$RNA1,RNA2,2:pair-5:pair|CHEM1,RNA1,1:R2-1:R1|RNA2,RNA3,6:R2-1:R1|RNA1,PEPTIDE1,4:R2-1:R1$$$V2.0',
  },
  {
    Id: 196,
    SequenceName: '(Op)(A---A)(AO)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|RNA3{P}|CHEM2{[4aPEGMal]}$RNA1,RNA2,2:pair-2:pair|CHEM1,RNA1,1:R2-1:R1|RNA2,RNA3,3:R2-1:R1|CHEM2,RNA2,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 197,
    SequenceName: '(Op)(A---A)(OO)',
    HELM: 'RNA1{R(A)P}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|RNA3{P}|CHEM2{[4aPEGMal]}|CHEM3{[4aPEGMal]}$RNA1,RNA2,2:pair-2:pair|CHEM1,RNA1,1:R2-1:R1|RNA2,RNA3,3:R2-1:R1|CHEM2,RNA2,1:R2-1:R1|RNA1,CHEM3,3:R2-1:R1$$$V2.0',
  },
  {
    Id: 198,
    SequenceName: '(Op)(A---A)(Ab)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}|RNA3{P}$RNA1,RNA2,2:pair-2:pair|CHEM1,RNA1,1:R2-1:R1|RNA2,RNA3,3:R2-1:R1$$$V2.0',
  },
  {
    Id: 199,
    SequenceName: '(Op)(AA)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|RNA3{P}$RNA1,RNA2,5:pair-2:pair|CHEM1,RNA1,1:R2-1:R1|RNA2,RNA3,6:R2-1:R1$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|RNA3{P}$RNA1,RNA2,5:pair-2:pair|CHEM1,RNA1,1:R2-1:R1|RNA2,RNA3,6:R2-1:R1|PEPTIDE1,CHEM1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|CHEM1{[4aPEGMal]}|RNA3{P}$RNA1,RNA2,5:pair-2:pair|CHEM1,RNA1,1:R2-1:R1|RNA2,RNA3,6:R2-1:R1|RNA1,PEPTIDE1,4:R2-1:R1$$$V2.0',
  },
  {
    Id: 200,
    SequenceName: '(pp)(A---A)(A---A)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|RNA3{P}$RNA1,RNA2,6:pair-2:pair|RNA1,RNA2,3:pair-5:pair|RNA2,RNA3,6:R2-1:R1$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|RNA3{P}$RNA1,RNA2,6:pair-2:pair|RNA1,RNA2,3:pair-5:pair|RNA2,RNA3,6:R2-1:R1|PEPTIDE1,RNA1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|RNA3{P}$RNA1,RNA2,6:pair-2:pair|RNA1,RNA2,3:pair-5:pair|RNA2,RNA3,6:R2-1:R1|RNA1,PEPTIDE1,5:R2-1:R1$$$V2.0',
  },
  {
    Id: 201,
    SequenceName: '(pp)(A---A)(A---O)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,3:pair-2:pair|RNA2,RNA3,3:R2-1:R1|CHEM1,RNA2,1:R2-1:R1|CHEM1,RNA1,1:pair-6:pair$$$V2.0',
  },
  {
    Id: 202,
    SequenceName: '(pp)(A---A)(O---O)',
    HELM: 'RNA1{P.R(A)P}|RNA2{R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,3:pair-2:pair|RNA2,RNA3,3:R2-1:R1|CHEM1,RNA2,1:R2-1:R1|RNA1,CHEM2,4:R2-1:R1|CHEM2,CHEM1,1:pair-1:pair$$$V2.0',
  },
  {
    Id: 203,
    SequenceName: '(pp)(A---A)(AA)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|RNA3{P}$RNA1,RNA2,6:pair-2:pair|RNA1,RNA2,3:pair-5:pair|RNA2,RNA3,6:R2-1:R1$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|RNA3{P}$RNA1,RNA2,6:pair-2:pair|RNA1,RNA2,3:pair-5:pair|RNA2,RNA3,6:R2-1:R1|PEPTIDE1,RNA1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|RNA3{P}$RNA1,RNA2,6:pair-2:pair|RNA1,RNA2,3:pair-5:pair|RNA2,RNA3,6:R2-1:R1|RNA1,PEPTIDE1,5:R2-1:R1$$$V2.0',
  },
  {
    Id: 204,
    SequenceName: '(pp)(A---A)(AO)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,3:pair-2:pair|RNA2,RNA3,3:R2-1:R1|CHEM1,RNA2,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 205,
    SequenceName: '(pp)(A---A)(OO)',
    HELM: 'RNA1{P.R(A)P}|RNA2{R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,3:pair-2:pair|RNA2,RNA3,3:R2-1:R1|CHEM1,RNA2,1:R2-1:R1|RNA1,CHEM2,4:R2-1:R1$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{P.R(A)P}|RNA2{R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,3:pair-2:pair|RNA2,RNA3,3:R2-1:R1|CHEM1,RNA2,1:R2-1:R1|RNA1,CHEM2,4:R2-1:R1|PEPTIDE1,RNA1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'PEPTIDE1{D.D.D.D}|RNA1{P.R(A)P}|RNA2{R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,3:pair-2:pair|RNA2,RNA3,3:R2-1:R1|CHEM1,RNA2,1:R2-1:R1|RNA1,CHEM2,4:R2-1:R1|CHEM2,PEPTIDE1,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 206,
    SequenceName: '(pp)(A---A)(Ab)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P}|RNA3{P}$RNA1,RNA2,3:pair-2:pair|RNA2,RNA3,3:R2-1:R1$$$V2.0',
  },
  {
    Id: 207,
    SequenceName: '(pp)(AA)(A---A)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P}|RNA3{P}$RNA1,RNA2,6:pair-2:pair|RNA2,RNA3,6:R2-1:R1$$$V2.0',
  },
  // Removed because of the bug: https://github.com/epam/ketcher/issues/6712
  // {
  //   Id: 208,
  //   SequenceName: '(bp)(A---A)(Ab)',
  //   HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)P}|RNA3{P}$RNA1,RNA2,2:pair-2:pair|RNA2,RNA3,3:R2-1:R1$$$V2.0',
  // },
  {
    Id: 209,
    SequenceName: '(Ab)(A---A)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)}$RNA1,RNA2,8:pair-2:pair|RNA1,RNA2,5:pair-5:pair$$$V2.0',
  },
  {
    Id: 210,
    SequenceName: '(Ab)(A---A)(A---O)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA2,CHEM1,1:R1-1:R2|RNA1,CHEM1,8:pair-1:pair$$$V2.0',
  },
  {
    Id: 211,
    SequenceName: '(Ab)(A---A)(O---O)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|RNA2,CHEM1,1:R1-1:R2|RNA1,CHEM2,6:R2-1:R1|CHEM2,CHEM1,1:pair-1:pair$$$V2.0',
  },
  {
    Id: 212,
    SequenceName: '(Ab)(A---A)(AA)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)}$RNA1,RNA2,5:pair-5:pair$$$V2.0',
  },
  {
    Id: 213,
    SequenceName: '(Ab)(A---A)(AO)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|CHEM1,RNA2,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 214,
    SequenceName: '(Ab)(A---A)(OO)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|CHEM1,RNA2,1:R2-1:R1|RNA1,CHEM2,6:R2-1:R1$$$V2.0',
  },
  {
    Id: 215,
    SequenceName: '(Ab)(A---A)(bO)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-2:pair|CHEM1,RNA2,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 216,
    SequenceName: '(Ab)(A---A)(Ab)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)}$RNA1,RNA2,5:pair-2:pair$$$V2.0',
  },
  {
    Id: 217,
    SequenceName: '(Ab)(A---O)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,8:pair-2:pair|RNA1,CHEM1,5:pair-1:pair|CHEM1,RNA2,1:R1-3:R2$$$V2.0',
  },
  {
    Id: 218,
    SequenceName: '(Ab)(O---O)(A---A)',
    HELM: 'RNA1{R(A)P}|RNA2{R(A)}|RNA3{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA2,RNA3,2:pair-2:pair|CHEM1,RNA3,1:R1-3:R2|RNA1,CHEM2,3:R2-1:R1|CHEM2,RNA2,1:R2-1:R1|CHEM2,CHEM1,1:pair-1:pair$$$V2.0',
  },
  {
    Id: 219,
    SequenceName: '(Ab)(AA)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)}$RNA1,RNA2,8:pair-2:pair$$$V2.0',
  },
  {
    Id: 220,
    SequenceName: '(Ab)(AO)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,8:pair-2:pair|RNA2,CHEM1,3:R2-1:R1$$$V2.0',
  },
  {
    Id: 221,
    SequenceName: '(Ab)(OO)(A---A)',
    HELM: 'RNA1{R(A)P}|RNA2{R(A)}|RNA3{R(U)P}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA2,RNA3,2:pair-2:pair|RNA3,CHEM1,3:R2-1:R1|RNA1,CHEM2,3:R2-1:R1|CHEM2,RNA2,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 222,
    SequenceName: '(Ob)(A---A)(A---O)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,2:pair-2:pair|CHEM1,RNA1,1:R2-1:R1|CHEM2,RNA2,1:R2-1:R1|RNA1,CHEM2,5:pair-1:pair$$$V2.0',
  },
  {
    Id: 223,
    SequenceName: '(Ob)(A---A)(AO)',
    HELM: 'RNA1{R(A)P.R(A)}|RNA2{R(U)}|CHEM1{[4aPEGMal]}|CHEM2{[4aPEGMal]}$RNA1,RNA2,2:pair-2:pair|CHEM1,RNA1,1:R2-1:R1|CHEM2,RNA2,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 224,
    SequenceName: '(Ob)(A---O)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)}|CHEM1{[4aPEGMal]}|RNA2{R(U)P}|CHEM2{[4aPEGMal]}$CHEM1,RNA1,1:R2-1:R1|RNA1,RNA2,5:pair-2:pair|RNA1,CHEM2,2:pair-1:pair|RNA2,CHEM2,3:R2-1:R1$$$V2.0',
  },
  {
    Id: 225,
    SequenceName: '(Ob)(AO)(A---A)',
    HELM: 'RNA1{R(A)P.R(A)}|CHEM1{[4aPEGMal]}|RNA2{R(U)P}|CHEM2{[4aPEGMal]}$CHEM1,RNA1,1:R2-1:R1|RNA1,RNA2,5:pair-2:pair|RNA2,CHEM2,3:R2-1:R1$$$V2.0',
  },
  {
    Id: 226,
    SequenceName: '(pb)(A---A)(A---O)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)}|CHEM1{[4aPEGMal]}$RNA1,RNA2,3:pair-2:pair|CHEM1,RNA2,1:R2-1:R1|RNA1,CHEM1,6:pair-1:pair$$$V2.0',
  },
  {
    Id: 227,
    SequenceName: '(pb)(A---A)(AO)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)}|CHEM1{[4aPEGMal]}$RNA1,RNA2,3:pair-2:pair|CHEM1,RNA2,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 228,
    SequenceName: '(pb)(A---O)(A---A)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,6:pair-2:pair|RNA1,CHEM1,3:pair-1:pair|CHEM1,RNA2,1:R1-3:R2$$$V2.0',
  },
  {
    Id: 229,
    SequenceName: '(pb)(AO)(A---A)',
    HELM: 'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,6:pair-2:pair|CHEM1,RNA2,1:R1-3:R2$$$V2.0',
  },
  {
    Id: 230,
    SequenceName: '(A---A)(E---A)(p---A)',
    HELM: 'RNA1{R(A)P}|RNA2{P}|RNA3{R(U)P.R(U)P.R(U)}|PEPTIDE1{E}$RNA1,RNA3,2:pair-8:pair|RNA1,PEPTIDE1,3:R2-1:R1|PEPTIDE1,RNA2,1:R2-1:R1|PEPTIDE1,RNA3,1:pair-5:pair|RNA2,RNA3,1:pair-2:pair$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'RNA1{R(A)P}|RNA2{P}|RNA3{R(U)P.R(U)P.R(U)}|PEPTIDE1{E}|PEPTIDE2{D.D.D.D}$RNA1,RNA3,2:pair-8:pair|RNA1,PEPTIDE1,3:R2-1:R1|PEPTIDE1,RNA2,1:R2-1:R1|PEPTIDE1,RNA3,1:pair-5:pair|RNA2,RNA3,1:pair-2:pair|PEPTIDE2,RNA1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'RNA1{R(A)P}|RNA2{P}|RNA3{R(U)P.R(U)P.R(U)}|PEPTIDE1{E}|PEPTIDE2{D.D.D.D}$RNA1,RNA3,2:pair-8:pair|RNA1,PEPTIDE1,3:R2-1:R1|PEPTIDE1,RNA2,1:R2-1:R1|PEPTIDE1,RNA3,1:pair-5:pair|RNA2,RNA3,1:pair-2:pair|RNA2,PEPTIDE2,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 231,
    SequenceName: '(A---A)(E---A)(p---O)',
    HELM: 'RNA1{R(A)P}|RNA2{P}|RNA3{R(U)P.R(U)}|PEPTIDE1{E}|CHEM1{[4aPEGMal]}$RNA1,RNA3,2:pair-5:pair|RNA1,PEPTIDE1,3:R2-1:R1|PEPTIDE1,RNA2,1:R2-1:R1|PEPTIDE1,RNA3,1:pair-2:pair|CHEM1,RNA3,1:R2-1:R1|RNA2,CHEM1,1:pair-1:pair$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'RNA1{R(A)P}|RNA2{P}|RNA3{R(U)P.R(U)}|PEPTIDE1{E}|CHEM1{[4aPEGMal]}|PEPTIDE2{D.D.D.D}$RNA1,RNA3,2:pair-5:pair|RNA1,PEPTIDE1,3:R2-1:R1|PEPTIDE1,RNA2,1:R2-1:R1|PEPTIDE1,RNA3,1:pair-2:pair|CHEM1,RNA3,1:R2-1:R1|RNA2,CHEM1,1:pair-1:pair|PEPTIDE2,RNA1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'RNA1{R(A)P}|RNA2{P}|RNA3{R(U)P.R(U)}|PEPTIDE1{E}|CHEM1{[4aPEGMal]}|PEPTIDE2{D.D.D.D}$RNA1,RNA3,2:pair-5:pair|RNA1,PEPTIDE1,3:R2-1:R1|PEPTIDE1,RNA2,1:R2-1:R1|PEPTIDE1,RNA3,1:pair-2:pair|CHEM1,RNA3,1:R2-1:R1|RNA2,CHEM1,1:pair-1:pair|RNA2,PEPTIDE2,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 232,
    SequenceName: '(A---A)(E---A)(p---p)',
    HELM: 'RNA1{R(A)P}|RNA2{P}|RNA3{P.R(U)P.R(U)}|PEPTIDE1{E}$RNA1,RNA3,2:pair-6:pair|RNA1,PEPTIDE1,3:R2-1:R1|PEPTIDE1,RNA2,1:R2-1:R1|PEPTIDE1,RNA3,1:pair-3:pair|RNA2,RNA3,1:pair-1:pair$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'RNA1{R(A)P}|RNA2{P}|RNA3{P.R(U)P.R(U)}|PEPTIDE1{E}|PEPTIDE2{D.D.D.D}$RNA1,RNA3,2:pair-6:pair|RNA1,PEPTIDE1,3:R2-1:R1|PEPTIDE1,RNA2,1:R2-1:R1|PEPTIDE1,RNA3,1:pair-3:pair|PEPTIDE2,RNA1,4:R2-1:R1|RNA2,RNA3,1:pair-1:pair$$$V2.0',
    RightAnchoredHELM:
      'RNA1{R(A)P}|RNA2{P}|RNA3{P.R(U)P.R(U)}|PEPTIDE1{E}|PEPTIDE2{D.D.D.D}$RNA1,RNA3,2:pair-6:pair|RNA1,PEPTIDE1,3:R2-1:R1|PEPTIDE1,RNA2,1:R2-1:R1|PEPTIDE1,RNA3,1:pair-3:pair|RNA2,RNA3,1:pair-1:pair|RNA2,PEPTIDE2,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 233,
    SequenceName: '(A---A)(E---A)(pA)',
    HELM: 'RNA1{R(A)P}|RNA2{P}|RNA3{R(U)P.R(U)P.R(U)}|PEPTIDE1{E}$RNA1,RNA3,2:pair-8:pair|RNA1,PEPTIDE1,3:R2-1:R1|PEPTIDE1,RNA2,1:R2-1:R1|PEPTIDE1,RNA3,1:pair-5:pair$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'RNA1{R(A)P}|RNA2{P}|RNA3{R(U)P.R(U)P.R(U)}|PEPTIDE1{E}|PEPTIDE2{D.D.D.D}$RNA1,RNA3,2:pair-8:pair|RNA1,PEPTIDE1,3:R2-1:R1|PEPTIDE1,RNA2,1:R2-1:R1|PEPTIDE1,RNA3,1:pair-5:pair|PEPTIDE2,RNA1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'RNA1{R(A)P}|RNA2{P}|RNA3{R(U)P.R(U)P.R(U)}|PEPTIDE1{E}|PEPTIDE2{D.D.D.D}$RNA1,RNA3,2:pair-8:pair|RNA1,PEPTIDE1,3:R2-1:R1|PEPTIDE1,RNA2,1:R2-1:R1|PEPTIDE1,RNA3,1:pair-5:pair|RNA2,PEPTIDE2,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 234,
    SequenceName: '(A---A)(E---A)(pO)',
    HELM: 'RNA1{R(A)P}|RNA2{P}|RNA3{R(U)P.R(U)}|PEPTIDE1{E}|CHEM1{[4aPEGMal]}$RNA1,RNA3,2:pair-5:pair|RNA1,PEPTIDE1,3:R2-1:R1|PEPTIDE1,RNA2,1:R2-1:R1|PEPTIDE1,RNA3,1:pair-2:pair|CHEM1,RNA3,1:R2-1:R1$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'RNA1{R(A)P}|RNA2{P}|RNA3{R(U)P.R(U)}|PEPTIDE1{E}|CHEM1{[4aPEGMal]}|PEPTIDE2{D.D.D.D}$RNA1,RNA3,2:pair-5:pair|RNA1,PEPTIDE1,3:R2-1:R1|PEPTIDE1,RNA2,1:R2-1:R1|PEPTIDE1,RNA3,1:pair-2:pair|CHEM1,RNA3,1:R2-1:R1|PEPTIDE2,RNA1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'RNA1{R(A)P}|RNA2{P}|RNA3{R(U)P.R(U)}|PEPTIDE1{E}|CHEM1{[4aPEGMal]}|PEPTIDE2{D.D.D.D}$RNA1,RNA3,2:pair-5:pair|RNA1,PEPTIDE1,3:R2-1:R1|PEPTIDE1,RNA2,1:R2-1:R1|PEPTIDE1,RNA3,1:pair-2:pair|CHEM1,RNA3,1:R2-1:R1|RNA2,PEPTIDE2,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 235,
    SequenceName: '(A---A)(A---A)(Ap)',
    HELM: 'RNA1{R(A)P.R(A)P.R(A)}|RNA2{P.R(U)P.R(U)}$RNA1,RNA2,5:pair-3:pair|RNA1,RNA2,2:pair-6:pair|RNA1,RNA2,8:pair-1:pair$$$V2.0',
  },
  {
    Id: 236,
    SequenceName: '(A---A)(A---A)(Op)',
    HELM: 'RNA1{R(A)P.R(A)P}|RNA2{P.R(U)P.R(U)}|CHEM1{[4aPEGMal]}$RNA1,RNA2,5:pair-3:pair|RNA1,RNA2,2:pair-6:pair|RNA1,CHEM1,6:R2-1:R1|CHEM1,RNA2,1:pair-1:pair$$$V2.0',
  },
  {
    Id: 237,
    SequenceName: '(A---A)(E---A)(pp)',
    HELM: 'RNA1{R(A)P}|RNA2{P}|RNA3{P.R(U)P.R(U)}|PEPTIDE1{E}$RNA1,RNA3,2:pair-6:pair|RNA1,PEPTIDE1,3:R2-1:R1|PEPTIDE1,RNA2,1:R2-1:R1|PEPTIDE1,RNA3,1:pair-3:pair$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'RNA1{R(A)P}|RNA2{P}|RNA3{P.R(U)P.R(U)}|PEPTIDE1{E}|PEPTIDE2{D.D.D.D}$RNA1,RNA3,2:pair-6:pair|RNA1,PEPTIDE1,3:R2-1:R1|PEPTIDE1,RNA2,1:R2-1:R1|PEPTIDE1,RNA3,1:pair-3:pair|PEPTIDE2,RNA1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'RNA1{R(A)P}|RNA2{P}|RNA3{P.R(U)P.R(U)}|PEPTIDE1{E}|PEPTIDE2{D.D.D.D}$RNA1,RNA3,2:pair-6:pair|RNA1,PEPTIDE1,3:R2-1:R1|PEPTIDE1,RNA2,1:R2-1:R1|PEPTIDE1,RNA3,1:pair-3:pair|RNA2,PEPTIDE2,1:R2-1:R1$$$V2.0',
  },
  {
    Id: 238,
    SequenceName: '(A---A)(E---A)(pb)',
    HELM: 'RNA1{R(A)P}|RNA2{P}|RNA3{R(U)P.R(U)}|PEPTIDE1{E}$RNA1,RNA3,2:pair-5:pair|RNA1,PEPTIDE1,3:R2-1:R1|PEPTIDE1,RNA2,1:R2-1:R1|PEPTIDE1,RNA3,1:pair-2:pair$$$V2.0',
    Rotation: true,
    LeftAnchoredHELM:
      'RNA1{R(A)P}|RNA2{P}|RNA3{R(U)P.R(U)}|PEPTIDE1{E}|PEPTIDE2{D.D.D.D}$RNA1,RNA3,2:pair-5:pair|RNA1,PEPTIDE1,3:R2-1:R1|PEPTIDE1,RNA2,1:R2-1:R1|PEPTIDE1,RNA3,1:pair-2:pair|PEPTIDE2,RNA1,4:R2-1:R1$$$V2.0',
    RightAnchoredHELM:
      'RNA1{R(A)P}|RNA2{P}|RNA3{R(U)P.R(U)}|PEPTIDE1{E}|PEPTIDE2{D.D.D.D}$RNA1,RNA3,2:pair-5:pair|RNA1,PEPTIDE1,3:R2-1:R1|PEPTIDE1,RNA2,1:R2-1:R1|PEPTIDE1,RNA3,1:pair-2:pair|RNA2,PEPTIDE2,1:R2-1:R1$$$V2.0',
  },
];

interface IFailedTestSequenceReplaceMonomer {
  TestNameContains?: string[];
  SequenceId?: number[];
  MonomerId?: number[];
  BugsInTests: string[];
}

const FailedTestNewSequenceRepresentation: IFailedTestSequenceReplaceMonomer[] =
  [
    {
      // Adding monomet to first from the left position of antisense chain works wrong and causes exception:
      // Uncaught TypeError: Cannot read properties of undefined (reading 'chain') #6775
      TestNameContains: ['Case 27-'],
      BugsInTests: ['https://github.com/epam/ketcher/issues/6775'],
    },
  ];

function filterBugsInTests(
  testName: string,
  sequenceId: number,
  monomerId?: number,
): string[] {
  return FailedTestNewSequenceRepresentation.filter((item) => {
    const testNameMatch =
      item.TestNameContains === undefined ||
      item.TestNameContains.some((substring) => testName.includes(substring));
    const sequenceIdMatch =
      item.SequenceId === undefined || item.SequenceId.includes(sequenceId);
    const replaceMonomerIdMatch =
      item.MonomerId === undefined ||
      item.MonomerId === undefined ||
      (monomerId !== undefined && item.MonomerId.includes(monomerId));

    return testNameMatch && sequenceIdMatch && replaceMonomerIdMatch;
  }).flatMap((item) => item.BugsInTests || []);
}

function addAnnotation(message: string) {
  test.info().annotations.push({ type: 'WARNING', description: message });
}

async function checkForKnownBugs(sequence: ISequence, monomer?: IMonomerToAdd) {
  // Check if particular combination of test, sequence, replaceMonomer has any known bugs that makes test case works wrong
  const testSequenceRepresentationMatchingBugs = filterBugsInTests(
    test.info().title,
    sequence.Id,
    monomer?.Id,
  );

  const allMatchingBugs = [...testSequenceRepresentationMatchingBugs];

  if (allMatchingBugs && allMatchingBugs.length > 0) {
    addAnnotation(`That test works wrong because of bug(s):`);
    allMatchingBugs.forEach((bug) => {
      addAnnotation(`${bug}`);
    });
    addAnnotation(
      `If all bugs has been fixed - screenshots have to be updated, propper items in FailedTestSequenceReplaceMonomers collection have to be removed.`,
    );
    addAnnotation(`SequenceId: ${sequence.Id}`);
    if (monomer) {
      addAnnotation(`MonomerId: ${monomer.Id}`);
    }
    test.info().fixme();
  }
}

async function selectSequenceMode(page: Page, sequenceMode: SequenceModeType) {
  switch (sequenceMode) {
    case SequenceModeType.RNA:
      await switchToRNAMode(page);
      break;
    case SequenceModeType.DNA:
      await switchToDNAMode(page);
      break;
    case SequenceModeType.Peptide:
      await switchToPeptideMode(page);
      break;
    default:
      await switchToRNAMode(page);
      break;
  }
}

async function turnIntoEditModeAndPlaceCursorToThePosition(
  page: Page,
  {
    position,
    senseOrAntisense = SequenceChainType.Sense,
    syncEditMode = true,
  }: {
    position: number;
    senseOrAntisense?: SequenceChainType;
    syncEditMode?: boolean;
  },
) {
  const firstSymbol = getSymbolLocator(page, {
    isAntisense: false,
    nodeIndexOverall: 0,
  }).first();

  await firstSymbol.dblclick();

  await page.keyboard.press('ArrowLeft');

  for (let i = 1; i < position; i++) {
    await page.keyboard.press('ArrowRight');
  }

  if (syncEditMode) {
    await turnSyncEditModeOn(page);
  } else {
    await turnSyncEditModeOff(page);
  }

  if (senseOrAntisense === SequenceChainType.Antisense) {
    await page.keyboard.press('ArrowDown');
  }
}

const excludeNonUniqueFirstSymbolPairsIds = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 38, 39, 40, 41, 42, 43, 44, 47,
  51, 53, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 69, 70, 74, 75, 76,
  77, 78, 79, 80, 82, 85, 86, 87, 88, 89, 90, 91, 93, 95, 96, 97, 98, 99, 100,
  101, 102, 103, 104, 106, 107, 110, 111, 115, 116, 117, 118, 119, 120, 121,
  123, 125, 126, 127, 128, 129, 130, 131, 132, 134, 135, 136, 137, 138, 139,
  140, 141, 142, 143, 144, 146, 148, 150, 151, 152, 153, 154, 155, 156, 157,
  158, 159, 160, 161, 163, 164, 165, 166, 167, 168, 169, 171, 172, 173, 174,
  175, 176, 177, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191,
  193, 194, 195, 196, 197, 198, 199, 201, 202, 203, 204, 205, 206, 207, 210,
  211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 223, 224, 225, 227,
  228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238,
];
const uniqueFirstSymbolPairs = sequences.filter(
  (sequence) => !excludeNonUniqueFirstSymbolPairsIds.includes(sequence.Id),
);
for (const monomer of monomersToAdd) {
  for (const sequence of uniqueFirstSymbolPairs) {
    test(`Case 1-${sequence.Id}-${monomer.Id}. Add ${monomer.Type} (${monomer.Letter}) to ${sequence.SequenceName} to first position`, async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6517 - Test case 1
       * Description: User can add monomer (of every type) to first position in sequence (of every configuration) in edit mode (SYNC mode is ON)
       * Scenario:
       * 1. Clear canvas
       * 2. Load sequence from HELM
       * 3. Switch sequence to edit mode and move cursor to the first position
       * 4. Select monomer type (using switcher on the top - RNA/DNA/Peptide)
       * 5. Press keyboard key to add monomer to the first position
       * 6. Add on the canvas source sequence from HELM to be able easily compare consition after and before adding monomer
       * 7. Take screenshot to validate that monomer was added in Sequence mode
       * 8. Switch to Flex mode
       * 9. Take screenshot to validate that monomer was added in Flex mode canvas
       * 10. Add info to log if known bugs exist and skip test
       */
      if (sequence.HELM) {
        await pasteFromClipboardAndAddToMacromoleculesCanvas(
          page,
          MacroFileType.HELM,
          !sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM || '',
        );
      }
      await selectSequenceLayoutModeTool(page);
      await selectSequenceMode(page, monomer.Type);

      await turnIntoEditModeAndPlaceCursorToThePosition(page, { position: 1 });

      await waitForRender(page, async () => {
        await page.keyboard.press(monomer.Letter);
      });
      await clickInTheMiddleOfTheScreen(page);

      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
      );
      await takeEditorScreenshot(page, { hideMonomerPreview: true });
      await selectFlexLayoutModeTool(page);

      await takeEditorScreenshot(page, { hideMonomerPreview: true });

      // skip that test if bug(s) exists
      await checkForKnownBugs(sequence, monomer);
    });
  }
}

const excludeNonUniquePairsOfFirstAndSecondSymbolsIds = [
  2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 15, 16, 18, 19, 20, 21, 22, 23, 24, 24,
  25, 26, 27, 28, 29, 31, 32, 33, 33, 39, 40, 41, 42, 43, 43, 44, 55, 56, 57,
  58, 59, 60, 61, 62, 63, 74, 75, 76, 77, 78, 79, 85, 86, 87, 88, 89, 90, 95,
  96, 97, 98, 99, 100, 101, 102, 103, 115, 116, 117, 118, 119, 120, 125, 126,
  127, 128, 129, 130, 134, 135, 136, 137, 138, 139, 152, 153, 154, 155, 156,
  157, 158, 163, 165, 166, 167, 168, 171, 172, 173, 174, 175, 176, 180, 181,
  182, 183, 184, 185, 186, 187, 188, 193, 194, 195, 196, 197, 198, 201, 202,
  203, 204, 205, 206, 210, 211, 212, 213, 214, 215, 216, 223, 227, 230, 231,
  232, 233, 234, 235, 236, 237, 238,
];
const uniquePairsOfFirstAndSecondSymbols = sequences.filter(
  (sequence) =>
    !excludeNonUniquePairsOfFirstAndSecondSymbolsIds.includes(sequence.Id),
);

const monomersToAddWithEnter = [
  ...Object.values(monomersToAdd),
  ...Object.values(enter),
];

for (const monomer of monomersToAddWithEnter) {
  for (const sequence of uniquePairsOfFirstAndSecondSymbols) {
    test(`Case 2-${sequence.Id}-${monomer.Id}. Add ${monomer.Type} (${monomer.Letter}) to ${sequence.SequenceName} to second position`, async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6517 - Test case 2
       * Description: User can add monomer (of every type) to second position in sequence (of every configuration)
       *              in edit mode (SYNC mode is ON)
       * Scenario:
       * 1. Clear canvas
       * 2. Load sequence from HELM
       * 3. Switch sequence to edit mode and move cursor to the second position
       * 4. Select monomer type (using switcher on the top - RNA/DNA/Peptide)
       * 5. Press keyboard key to add monomer to the second position
       * 6. Take screenshot to validate that monomer was added in Sequence mode
       * 6. Switch to Flex mode
       * 7. Take screenshot to validate that monomer was added in Flex mode canvas
       * 8. Add info to log if known bugs exist and skip test
       */
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
      );
      await selectSequenceLayoutModeTool(page);
      await selectSequenceMode(page, monomer.Type);

      await turnIntoEditModeAndPlaceCursorToThePosition(page, { position: 2 });

      await waitForRender(page, async () => {
        await page.keyboard.press(monomer.Letter);
      });
      await clickInTheMiddleOfTheScreen(page);

      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
      );
      await takeEditorScreenshot(page, { hideMonomerPreview: true });
      await selectFlexLayoutModeTool(page);

      await takeEditorScreenshot(page, { hideMonomerPreview: true });

      // skip that test if bug(s) exists
      await checkForKnownBugs(sequence, monomer);
    });
  }
}

// Adding monomer to third position in sequence make sense only if second sense/antisense pair contains dash
// Otherwise it would be duplacate check with adding monomer to second position
const excludeNonWithDashSecondPairsIds = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 50, 51, 52, 53, 54, 55, 56, 57,
  58, 59, 60, 61, 62, 63, 64, 65, 66, 69, 73, 74, 75, 76, 77, 78, 79, 80, 82,
  84, 85, 86, 87, 88, 89, 90, 91, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102,
  103, 104, 106, 107, 110, 111, 114, 115, 116, 117, 118, 119, 120, 121, 123,
  124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138,
  139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153,
  154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168,
  169, 170, 171, 172, 173, 174, 175, 176, 177, 179, 180, 181, 182, 183, 184,
  185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199,
  200, 201, 202, 203, 204, 205, 206, 207, 209, 210, 211, 212, 213, 214, 215,
  216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230,
  231, 232, 233, 234, 235, 236, 237, 238,
];
const secondSymbolPairsWithDash = sequences.filter(
  (sequence) => !excludeNonWithDashSecondPairsIds.includes(sequence.Id),
);
for (const monomer of monomersToAddWithEnter) {
  for (const sequence of secondSymbolPairsWithDash) {
    test(`Case 3-${sequence.Id}-${monomer.Id}. Add ${monomer.Type} (${monomer.Letter}) to ${sequence.SequenceName} to third position`, async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6517 - Test case 3
       * Description: User can add monomer (of every type) to third position in sequence (of every configuration)
       *              in edit mode (SYNC mode is ON)
       * Scenario:
       * 1. Clear canvas
       * 2. Load sequence from HELM
       * 3. Switch sequence to edit mode and move cursor to the third position
       * 4. Select monomer type (using switcher on the top - RNA/DNA/Peptide)
       * 5. Press keyboard key to add monomer to the third position
       * 6. Take screenshot to validate that monomer was added in Sequence mode
       * 6. Switch to Flex mode
       * 7. Take screenshot to validate that monomer was added in Flex mode canvas
       * 8. Add info to log if known bugs exist and skip test
       */
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
      );
      await selectSequenceLayoutModeTool(page);
      await selectSequenceMode(page, monomer.Type);

      await turnIntoEditModeAndPlaceCursorToThePosition(page, { position: 3 });

      await waitForRender(page, async () => {
        await page.keyboard.press(monomer.Letter);
      });
      await clickInTheMiddleOfTheScreen(page);

      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
      );
      await takeEditorScreenshot(page, { hideMonomerPreview: true });
      await selectFlexLayoutModeTool(page);

      await takeEditorScreenshot(page, { hideMonomerPreview: true });

      // skip that test if bug(s) exists
      await checkForKnownBugs(sequence, monomer);
    });
  }
}

const excludeNonUniqueLastSymbolPairsIds = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 38, 39, 40, 41, 42, 43, 44, 47,
  51, 53, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 69, 70, 74, 75, 76,
  77, 78, 79, 80, 82, 85, 86, 87, 88, 89, 90, 91, 93, 95, 96, 97, 98, 99, 100,
  101, 102, 103, 104, 106, 107, 110, 111, 115, 116, 117, 118, 119, 120, 121,
  123, 125, 126, 127, 128, 129, 130, 131, 132, 134, 135, 136, 137, 138, 139,
  140, 141, 142, 143, 144, 146, 148, 150, 151, 152, 153, 154, 155, 156, 157,
  158, 159, 160, 161, 163, 164, 165, 166, 167, 168, 169, 171, 172, 173, 174,
  175, 176, 177, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191,
  193, 194, 195, 196, 197, 198, 199, 201, 202, 203, 204, 205, 206, 207, 210,
  211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 223, 224, 225, 227,
  228, 229,
];
const uniqueLastSymbolPairs = sequences.filter(
  (sequence) => !excludeNonUniqueLastSymbolPairsIds.includes(sequence.Id),
);
for (const monomer of monomersToAdd) {
  for (const sequence of uniqueLastSymbolPairs) {
    test(`Case 4-${sequence.Id}-${monomer.Id}. Add ${monomer.Type} (${monomer.Letter}) to ${sequence.SequenceName} to last position`, async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6517 - Test case 4
       * Description: User can add monomer (of every type) to last position in sequence (of every configuration)
       *              in edit mode (SYNC mode is ON)
       * Scenario:
       * 1. Clear canvas
       * 2. Load sequence from HELM
       * 3. Switch sequence to edit mode and move cursor to the last position
       * 4. Select monomer type (using switcher on the top - RNA/DNA/Peptide)
       * 5. Press keyboard key to add monomer to the last position
       * 6. Add on the canvas source sequence from HELM to be able easily compare consition after and before adding monomer
       * 7. Take screenshot to validate that monomer was added in Sequence mode
       * 8. Switch to Flex mode
       * 9. Take screenshot to validate that monomer was added in Flex mode canvas
       * 10 . Add info to log if known bugs exist and skip test
       */
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        (!sequence.Rotation ? sequence.HELM : sequence.LeftAnchoredHELM) || '',
      );

      await selectSequenceLayoutModeTool(page);
      await selectSequenceMode(page, monomer.Type);

      await turnIntoEditModeAndPlaceCursorToThePosition(page, { position: 9 });

      await waitForRender(page, async () => {
        await page.keyboard.press(monomer.Letter);
      });
      await clickInTheMiddleOfTheScreen(page);

      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        (!sequence.Rotation ? sequence.HELM : sequence.LeftAnchoredHELM) || '',
      );

      await takeEditorScreenshot(page, { hideMonomerPreview: true });
      await selectFlexLayoutModeTool(page);

      await takeEditorScreenshot(page, { hideMonomerPreview: true });

      // skip that test if bug(s) exists
      await checkForKnownBugs(sequence, monomer);
    });
  }
}

for (const sequence of uniquePairsOfFirstAndSecondSymbols) {
  test(`Case 5-${sequence.Id}. Delete first symbol at ${sequence.SequenceName} with Delete key`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6517 - Test case 5
     * Description: User can delete monomer (of every type) on first position in sequence (of every configuration)
     *              in edit mode (SYNC mode is ON)
     * Scenario:
     * 1. Clear canvas
     * 2. Load sequence from HELM
     * 3. Switch sequence to edit mode and move cursor to the first position
     * 4. Press Delete keyboard key to delete first symbol in seqience
     * 5. Add on the canvas source sequence from HELM to be able easily compare consition after and before adding monomer
     * 6. Take screenshot to validate that monomer was deleted in Sequence mode
     * 7. Switch to Flex mode
     * 8. Take screenshot to validate that monomer was deleted in Flex mode canvas
     * 9. Add info to log if known bugs exist and skip test
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
    );
    await selectSequenceLayoutModeTool(page);
    await selectSequenceMode(page, SequenceModeType.RNA);

    await turnIntoEditModeAndPlaceCursorToThePosition(page, { position: 1 });

    await waitForRender(page, async () => {
      await page.keyboard.press('Delete');
    });
    await clickInTheMiddleOfTheScreen(page);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
    );

    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await selectFlexLayoutModeTool(page);

    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    // skip that test if bug(s) exists
    await checkForKnownBugs(sequence);
  });
}

for (const sequence of sequences) {
  test(`Case 6-${sequence.Id}. Delete second symbol at ${sequence.SequenceName} with Delete key`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6517 - Test case 6
     * Description: User can delete monomer (of every type) on second position in sequence (of every configuration)
     *              in edit mode (SYNC mode is ON)
     * Scenario:
     * 1. Clear canvas
     * 2. Load sequence from HELM
     * 3. Switch sequence to edit mode and move cursor to the second position
     * 4. Press Delete keyboard key to delete second symbol in seqience
     * 5. Add on the canvas source sequence from HELM to be able easily compare consition after and before adding monomer
     * 6. Take screenshot to validate that monomer was deleted in Sequence mode
     * 7. Switch to Flex mode
     * 8. Take screenshot to validate that monomer was deleted in Flex mode canvas
     * 9. Add info to log if known bugs exist and skip test
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
    );
    await selectSequenceLayoutModeTool(page);
    await selectSequenceMode(page, SequenceModeType.RNA);

    await turnIntoEditModeAndPlaceCursorToThePosition(page, { position: 2 });

    await waitForRender(page, async () => {
      await page.keyboard.press('Delete');
    });
    await clickInTheMiddleOfTheScreen(page);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
    );

    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await selectFlexLayoutModeTool(page);

    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    // skip that test if bug(s) exists
    await checkForKnownBugs(sequence);
  });
}
const excludeNonUniquePairsOfSecondAndThirdSymbolsIds = [
  50, 51, 52, 53, 54, 56, 57, 58, 60, 61, 62, 65, 69, 73, 74, 75, 76, 77, 78,
  79, 80, 82, 84, 85, 86, 87, 88, 89, 90, 91, 93, 94, 95, 96, 97, 98, 99, 100,
  101, 102, 103, 104, 106, 107, 110, 111, 114, 115, 116, 117, 118, 119, 120,
  121, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136,
  137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151,
  152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166,
  167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 179, 180, 181, 182,
  183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197,
  198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 209, 210, 211, 212, 213,
  214, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229,
];
const uniquePairsOfSecondAndThirdSymbols = sequences.filter(
  (sequence) =>
    !excludeNonUniquePairsOfSecondAndThirdSymbolsIds.includes(sequence.Id),
);
for (const sequence of uniquePairsOfSecondAndThirdSymbols) {
  test(`Case 7-${sequence.Id}. Delete third symbol at ${sequence.SequenceName} with Delete key`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6517 - Test case 7
     * Description: User can delete monomer (of every type) on third position in sequence (of every configuration)
     *              in edit mode (SYNC mode is ON)
     * Scenario:
     * 1. Clear canvas
     * 2. Load sequence from HELM
     * 3. Switch sequence to edit mode and move cursor to the third position
     * 4. Press Delete keyboard key to delete third symbol in seqience
     * 6. Add on the canvas source sequence from HELM to be able easily compare consition after and before adding monomer
     * 7. Take screenshot to validate that monomer was deleted in Sequence mode
     * 8. Switch to Flex mode
     * 9. Take screenshot to validate that monomer was deleted in Flex mode canvas
     * 10. Add info to log if known bugs exist and skip test
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.LeftAnchoredHELM) || '',
    );
    await selectSequenceLayoutModeTool(page);
    await selectSequenceMode(page, SequenceModeType.RNA);

    await turnIntoEditModeAndPlaceCursorToThePosition(page, {
      position: !sequence.Rotation ? 3 : 7,
    });

    await waitForRender(page, async () => {
      await page.keyboard.press('Delete');
    });
    await clickInTheMiddleOfTheScreen(page);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.LeftAnchoredHELM) || '',
    );

    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await selectFlexLayoutModeTool(page);

    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    // skip that test if bug(s) exists
    await checkForKnownBugs(sequence);
  });
}

for (const sequence of uniquePairsOfFirstAndSecondSymbols) {
  test(`Case 8-${sequence.Id}. Delete first symbol at ${sequence.SequenceName} Backspace key`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6517 - Test case 8
     * Description: User can delete monomer (of every type) on first position in sequence (of every configuration)
     *              in edit mode (SYNC mode is ON)
     * Scenario:
     * 1. Clear canvas
     * 2. Load sequence from HELM
     * 3. Switch sequence to edit mode and move cursor to the second position
     * 4. Press Backspace keyboard key to delete first symbol in seqience
     * 5. Take screenshot to validate that monomer was deleted in Sequence mode
     * 6. Switch to Flex mode
     * 7. Take screenshot to validate that monomer was deleted in Flex mode canvas
     * 8. Add info to log if known bugs exist and skip test
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
    );
    await selectSequenceLayoutModeTool(page);
    await selectSequenceMode(page, SequenceModeType.RNA);

    await turnIntoEditModeAndPlaceCursorToThePosition(page, { position: 2 });

    await waitForRender(page, async () => {
      await page.keyboard.press('Backspace');
    });
    await clickInTheMiddleOfTheScreen(page);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
    );
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await selectFlexLayoutModeTool(page);

    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    // skip that test if bug(s) exists
    await checkForKnownBugs(sequence);
  });
}

for (const sequence of sequences) {
  test(`Case 9-${sequence.Id}. Delete second symbol at ${sequence.SequenceName} Backspace key`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6517 - Test case 9
     * Description: User can delete monomer (of every type) on second position in sequence (of every configuration)
     *              in edit mode (SYNC mode is ON)
     * Scenario:
     * 1. Clear canvas
     * 2. Load sequence from HELM
     * 3. Switch sequence to edit mode and move cursor to the third position
     * 4. Press Backspace keyboard key to delete second symbol in seqience
     * 5. Take screenshot to validate that monomer was deleted in Sequence mode
     * 6. Switch to Flex mode
     * 7. Take screenshot to validate that monomer was deleted in Flex mode canvas
     * 8. Add info to log if known bugs exist and skip test
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
    );
    await selectSequenceLayoutModeTool(page);
    await selectSequenceMode(page, SequenceModeType.RNA);

    await turnIntoEditModeAndPlaceCursorToThePosition(page, { position: 3 });

    await waitForRender(page, async () => {
      await page.keyboard.press('Backspace');
    });
    await clickInTheMiddleOfTheScreen(page);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
    );
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await selectFlexLayoutModeTool(page);

    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    // skip that test if bug(s) exists
    await checkForKnownBugs(sequence);
  });
}

for (const sequence of uniquePairsOfSecondAndThirdSymbols) {
  test(`Case 10-${sequence.Id}. Delete third symbol at ${sequence.SequenceName} Backspace key`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6517 - Test case 7
     * Description: User can delete monomer (of every type) on third position in sequence (of every configuration)
     *              in edit mode (SYNC mode is ON)
     * Scenario:
     * 1. Clear canvas
     * 2. Load sequence from HELM
     * 3. Switch sequence to edit mode and move cursor to the forth position
     * 4. Press Backspace keyboard key to delete third symbol in seqience
     * 5. Take screenshot to validate that monomer was deleted in Sequence mode
     * 6. Switch to Flex mode
     * 7. Take screenshot to validate that monomer was deleted in Flex mode canvas
     * 8. Add info to log if known bugs exist and skip test
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.LeftAnchoredHELM) || '',
    );
    await selectSequenceLayoutModeTool(page);
    await selectSequenceMode(page, SequenceModeType.RNA);

    await turnIntoEditModeAndPlaceCursorToThePosition(page, {
      position: !sequence.Rotation ? 4 : 8,
    });

    await waitForRender(page, async () => {
      await page.keyboard.press('Backspace');
    });

    await clickInTheMiddleOfTheScreen(page);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.LeftAnchoredHELM) || '',
    );
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await selectFlexLayoutModeTool(page);

    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    // skip that test if bug(s) exists
    await checkForKnownBugs(sequence);
  });
}

interface IMonomerForHydrogenBondTest {
  Id: number;
  ContentType: MacroFileType;
  SenseForm: string;
  AntiSenseForm: string;
  Description: string;
}
const sequencesForHydrogenBondTests: IMonomerForHydrogenBondTest[] = [
  {
    Id: 1,
    ContentType: MacroFileType.HELM,
    SenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{[dR](U)}$RNA1,RNA2,1:R2-1:R1$$$V2.0',
    AntiSenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{[dR](U)}$RNA2,RNA1,1:R2-1:R1$$$V2.0',
    Description: 'DNA(U)',
  },
  {
    Id: 2,
    ContentType: MacroFileType.HELM,
    SenseForm: 'RNA1{[Sm6fhn]([c7io7n])}|RNA2{R(T)}$RNA1,RNA2,1:R2-1:R1$$$V2.0',
    AntiSenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{R(T)}$RNA2,RNA1,1:R2-1:R1$$$V2.0',
    Description: 'RNA(T)',
  },
  {
    Id: 3,
    ContentType: MacroFileType.HELM,
    SenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{[dR](A,C,G,T)}$RNA1,RNA2,1:R2-1:R1$$$V2.0',
    AntiSenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{[dR](A,C,G,T)}$RNA1,RNA2,1:R1-1:R2$$$V2.0',
    Description: 'Ambiguous DNA(N)',
  },
  {
    Id: 4,
    ContentType: MacroFileType.HELM,
    SenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{[dR](A,C,G,U)}$RNA1,RNA2,1:R2-1:R1$$$V2.0',
    AntiSenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{[dR](A,C,G,U)}$RNA1,RNA2,1:R1-1:R2$$$V2.0',
    Description: 'Ambiguous RNA(N)',
  },
  {
    Id: 5,
    ContentType: MacroFileType.HELM,
    SenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{[dR](A,C,G)}$RNA1,RNA2,1:R2-1:R1$$$V2.0',
    AntiSenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{[dR](A,C,G)}$RNA1,RNA2,1:R1-1:R2$$$V2.0',
    Description: 'Ambiguous RNA/DNA(V)',
  },
  {
    Id: 6,
    ContentType: MacroFileType.HELM,
    SenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|PEPTIDE1{E}$RNA1,PEPTIDE1,1:R2-1:R1$$$V2.0',
    AntiSenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|PEPTIDE1{E}$RNA1,PEPTIDE1,1:R1-1:R2$$$V2.0',
    Description: 'Peptide(E)',
  },
  {
    Id: 7,
    ContentType: MacroFileType.HELM,
    SenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|PEPTIDE1{(C,D)}$RNA1,PEPTIDE1,1:R2-1:R1$$$V2.0',
    AntiSenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|PEPTIDE1{(C,D)}$RNA1,PEPTIDE1,1:R1-1:R2$$$V2.0',
    Description: 'Ambiguous Alternative Peptide(%)',
  },
  {
    Id: 8,
    ContentType: MacroFileType.HELM,
    SenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|PEPTIDE1{(C+D)}$RNA1,PEPTIDE1,1:R2-1:R1$$$V2.0',
    AntiSenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|PEPTIDE1{(C+D)}$RNA1,PEPTIDE1,1:R1-1:R2$$$V2.0',
    Description: 'Ambiguous Mixed Peptide(%)',
  },
  {
    Id: 9,
    ContentType: MacroFileType.HELM,
    SenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|PEPTIDE1{(L,I)}$RNA1,PEPTIDE1,1:R2-1:R1$$$V2.0',
    AntiSenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|PEPTIDE1{(L,I)}$RNA1,PEPTIDE1,1:R1-1:R2$$$V2.0',
    Description: 'Ambiguous Alternative Peptide(J)',
  },
  // Removed due to bug: https://github.com/epam/ketcher/issues/6736
  // {
  //   Id: 10,
  //   ContentType: MacroFileType.HELM,
  //   SenseForm:
  //     'RNA1{[Sm6fhn]([c7io7n])}|RNA2{[12ddR]}$RNA1,RNA2,1:R2-1:R1$$$V2.0',
  //   AntiSenseForm:
  //     'RNA1{[Sm6fhn]([c7io7n])}|RNA2{[12ddR]}$RNA1,RNA2,1:R1-1:R2$$$V2.0',
  //   Description: 'Sugar(12ddR)',
  // },
  {
    Id: 11,
    ContentType: MacroFileType.HELM,
    SenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{(R,[3A6])}$RNA1,RNA2,1:R2-1:R1$$$V2.0',
    AntiSenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{(R,[3A6])}$RNA1,RNA2,1:R1-1:R2$$$V2.0',
    Description: 'Ambiguous Alternative Sugar(%)',
  },

  {
    Id: 12,
    ContentType: MacroFileType.HELM,
    SenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{(R+[3A6])}$RNA1,RNA2,1:R2-1:R1$$$V2.0',
    AntiSenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{(R+[3A6])}$RNA1,RNA2,1:R1-1:R2$$$V2.0',
    Description: 'Ambiguous Mixed Sugar(%)',
  },
  // Removed due to bug: https://github.com/epam/ketcher/issues/6736
  // {
  //   Id: 13,
  //   ContentType: MacroFileType.Ket,
  //   SenseForm:
  //     'KET/New-Sequence-Representation/MonomersForHydrogenBondTests/13. Sence Base(oC64m5).ket',
  //   AntiSenseForm:
  //     'KET/New-Sequence-Representation/MonomersForHydrogenBondTests/13. Antisense Base(oC64m5).ket',
  //   Description: 'Base(oC64m5)',
  // },
  {
    Id: 14,
    ContentType: MacroFileType.Ket,
    SenseForm:
      'KET/New-Sequence-Representation/MonomersForHydrogenBondTests/14. Sense Ambiguous Alternatives Base(%).ket',
    AntiSenseForm:
      'KET/New-Sequence-Representation/MonomersForHydrogenBondTests/14. Antisense Ambiguous Alternatives Base(%).ket',
    Description: 'Ambiguous Alternative Base(%)',
  },
  {
    Id: 15,
    ContentType: MacroFileType.Ket,
    SenseForm:
      'KET/New-Sequence-Representation/MonomersForHydrogenBondTests/15. Sense Ambiguous Mixed Base(%).ket',
    AntiSenseForm:
      'KET/New-Sequence-Representation/MonomersForHydrogenBondTests/15. Antisense Ambiguous Mixed Base(%).ket',
    Description: 'Ambiguous Mixed Base(%)',
  },
  {
    Id: 16,
    ContentType: MacroFileType.HELM,
    SenseForm: 'RNA1{[Sm6fhn]([c7io7n])P}$$$$V2.0',
    AntiSenseForm: 'RNA1{P.[Sm6fhn]([c7io7n])}$$$$V2.0',
    Description: 'Phosphate(P)',
  },
  {
    Id: 17,
    ContentType: MacroFileType.Ket,
    SenseForm:
      'KET/New-Sequence-Representation/MonomersForHydrogenBondTests/17. Sense Ambiguous Mixed Phosphate(%).ket',
    AntiSenseForm:
      'KET/New-Sequence-Representation/MonomersForHydrogenBondTests/17. Antisense Ambiguous Mixed Phosphate(%).ket',
    Description: 'Ambiguous Mixed Phosphate(%)',
  },
  {
    Id: 18,
    ContentType: MacroFileType.Ket,
    SenseForm:
      'KET/New-Sequence-Representation/MonomersForHydrogenBondTests/18. Sense Ambiguous Alternatives Phosphate(%).ket',
    AntiSenseForm:
      'KET/New-Sequence-Representation/MonomersForHydrogenBondTests/18. Antisense Ambiguous Alternatives Phosphate(%).ket',
    Description: 'Ambiguous Alternatives Phosphate(%)',
  },
  // Removed due to bug: https://github.com/epam/ketcher/issues/6736
  // {
  //   Id: 19,
  //   ContentType: MacroFileType.HELM,
  //   SenseForm:
  //     'RNA1{[Sm6fhn]([c7io7n])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,1:R2-1:R1$$$V2.0',
  //   AntiSenseForm:
  //     'RNA1{[Sm6fhn]([c7io7n])}|CHEM1{[4aPEGMal]}$CHEM1,RNA1,1:R2-1:R1$$$V2.0',
  //   Description: 'CHEM(4aPEGMal)',
  // },
  {
    Id: 20,
    ContentType: MacroFileType.HELM,
    SenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|CHEM1{([sDBL],[4aPEGMal])}$RNA1,CHEM1,1:R2-1:R1$$$V2.0',
    AntiSenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|CHEM1{([sDBL],[4aPEGMal])}$CHEM1,RNA1,1:R2-1:R1$$$V2.0',
    Description: 'Ambiguous Alternative CHEM(%)',
  },
  {
    Id: 21,
    ContentType: MacroFileType.HELM,
    SenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|CHEM1{([sDBL]+[4aPEGMal])}$RNA1,CHEM1,1:R2-1:R1$$$V2.0',
    AntiSenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|CHEM1{([sDBL]+[4aPEGMal])}$CHEM1,RNA1,1:R2-1:R1$$$V2.0',
    Description: 'Ambiguous Mixed CHEM(%)',
  },
  {
    Id: 22,
    ContentType: MacroFileType.HELM,
    SenseForm: 'RNA1{[Sm6fhn]([c7io7n])}|CHEM1{*}$RNA1,CHEM1,1:R2-1:R1$$$V2.0',
    AntiSenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|CHEM1{*}$CHEM1,RNA1,1:R2-1:R1$$$V2.0',
    Description: 'Unknown monomer',
  },
  // Removed due to bug: https://github.com/epam/ketcher/issues/6736
  // {
  //   Id: 23,
  //   ContentType: MacroFileType.HELM,
  //   SenseForm:
  //     'RNA1{[Sm6fhn]([c7io7n])}|CHEM1{[C1([*:1])C=CC=C([*:2])C=1 |$;_R1;;;;;_R2;$|]}$RNA1,CHEM1,1:R2-1:R1$$$V2.0',
  //   AntiSenseForm:
  //     'RNA1{[Sm6fhn]([c7io7n])}|CHEM1{[C1([*:1])C=CC=C([*:2])C=1 |$;_R1;;;;;_R2;$|]}$CHEM1,RNA1,1:R2-1:R1$$$V2.0',
  //   Description: 'Micro Molecule',
  // },
  {
    Id: 24,
    ContentType: MacroFileType.HELM,
    SenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{[5Br-dU]}$RNA1,RNA2,1:R2-1:R1$$$V2.0',
    AntiSenseForm: 'RNA1{[5Br-dU].[Sm6fhn]([c7io7n])}$$$$V2.0',
    Description: 'Unsplit nucleotide',
  },
  {
    Id: 25,
    ContentType: MacroFileType.HELM,
    SenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{R([cl6pur])}$RNA1,RNA2,1:R2-1:R1$$$V2.0',
    AntiSenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{R([cl6pur])}$RNA2,RNA1,1:R2-1:R1$$$V2.0',
    Description: 'RNA without natural analog (X)',
  },
];

const emptySequence: IMonomerForHydrogenBondTest = {
  Id: 1,
  ContentType: MacroFileType.HELM,
  SenseForm: 'RNA1{[Sm6fhn]([c7io7n])}$$$$V2.0',
  AntiSenseForm: 'RNA1{[Sm6fhn]([c7io7n])}$$$$V2.0',
  Description: 'Empty sequence',
};

const symbolRepresentingMultipleMonomers: IMonomerForHydrogenBondTest = {
  Id: 1,
  ContentType: MacroFileType.HELM,
  SenseForm:
    'RNA1{[Sm6fhn]([c7io7n])}|CHEM1{[4aPEGMal]}|CHEM2{[4FB]}$RNA1,CHEM1,1:R2-1:R1|CHEM1,CHEM2,1:R2-1:R1$$$V2.0',
  AntiSenseForm:
    'RNA1{[Sm6fhn]([c7io7n])}|CHEM1{[4aPEGMal]}|CHEM2{[4FB]}$RNA1,CHEM1,1:R1-1:R2|CHEM1,CHEM2,1:R1-1:R2$$$V2.0',
  Description: 'Empty sequence',
};

async function setupSenseAndAntiSenseSequences(
  page: Page,
  senseSequence: IMonomerForHydrogenBondTest,
  antisenseSequence: IMonomerForHydrogenBondTest,
) {
  await selectSnakeLayoutModeTool(page);
  if (senseSequence.ContentType === MacroFileType.HELM) {
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      senseSequence.SenseForm,
    );
  }
  if (antisenseSequence.ContentType === MacroFileType.HELM) {
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      antisenseSequence.AntiSenseForm,
    );
  }
  if (senseSequence.ContentType === MacroFileType.Ket) {
    await openFileAndAddToCanvasMacro(senseSequence.SenseForm, page);
  }
  if (antisenseSequence.ContentType === MacroFileType.Ket) {
    await openFileAndAddToCanvasMacro(antisenseSequence.AntiSenseForm, page);
  }

  const senseBase = getMonomerLocator(page, Bases.c7io7n).first();
  const antisenseBase = getMonomerLocator(page, Bases.c7io7n).nth(1);

  await bondTwoMonomers(
    page,
    senseBase,
    antisenseBase,
    undefined,
    undefined,
    MacroBondTool.HYDROGEN,
  );
}

for (const senseSequence of sequencesForHydrogenBondTests) {
  for (const antisenseSequence of sequencesForHydrogenBondTests) {
    test(`Case 11-${senseSequence.Id}-${antisenseSequence.Id}. [${senseSequence.Description}]---[${antisenseSequence.Description}] Establish/Delete Hydrogen Bonds checks for single monomer`, async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 1
       * Description: 1. Check that right clicking on a symbol that has no hydrogen bonds with a symbol bellow/above it, give the option to "Establish Hydrogen Bonds"
       *              2. Check If there are no H-bonds, the option "Delete Hydrogen Bonds" is disabled ( Requirement: 1.2 )
       *              3. Check that a hydrogen bond established between the monomer that was clicked on and the monomer placed bellow/above it ( Requirement: 1.1 )
       *              4. Check if a symbol has H-bonds with a symbol opposite it, the option "Establish Hydrogen Bonds" disabled ( Requirement: 1.1 )
       *              5. Check that if the symbol represents a nucleotide/nucleoside, a hydrogen bond established from the base (no need for a "sense base" check) ( Requirement: 1.1 )
       *              6. Check that right clicking on a symbol that has any H-bonds give the option to "Delete Hydrogen Bonds" ( Requirement: 1.2 )
       *              7. Check that clicking on "Delete Hydrogen Bonds" will remove hydrogen bonds
       * Scenario:
       * 1. Load sense and antisense sequences (and connect their c7io7n bases with hydrogen bond to make sence/antisense sequence)
       * 2. Switch to Sequence mode
       * 3. Getting sense and antisense symbol ids and locators
       * 4. Check that context menu has "Establish Hydrogen Bonds" option available and enabled ("Delete Hydrogen Bonds" option should be disabled)
       * 5. Click "Establish Hydrogen Bonds" and check that hydrogen bond was established between sense and antisense symbols
       * 6. If sense symbol is a RNA or DNA, check that all bases have hydrogen connection
       * 7. Right click on the sense symbol and check that "Establish Hydrogen Bonds" option is disabled
       * 8. Click on "Delete Hydrogen Bonds"
       * 9. Check that hydrogen bond was removed
       */

      await setupSenseAndAntiSenseSequences(
        page,
        senseSequence,
        antisenseSequence,
      );

      await selectSequenceLayoutModeTool(page);

      const senseSymbolId = await getSymbolLocator(page, {
        hydrogenConnectionNumber: 0,
        isAntisense: false,
      })
        .first()
        .getAttribute('data-symbol-id');
      const antisenseSymbolId = await getSymbolLocator(page, {
        hydrogenConnectionNumber: 0,
        isAntisense: true,
      })
        .first()
        .getAttribute('data-symbol-id');

      const senseSymbol = await getSymbolLocator(page, {
        symbolId: senseSymbolId || '',
      }).first();
      const antisenseSymbol = await getSymbolLocator(page, {
        symbolId: antisenseSymbolId || '',
      }).first();

      const establishHydrogenBondsOption = page
        .getByTestId('establish_hydrogen_bond')
        .first();
      const deleteHydrogenBondsOption = page
        .getByTestId('delete_hydrogen_bond')
        .first();

      // 1. Check that right clicking on a symbol that has no hydrogen bonds with a symbol bellow/above it, give the option to "Establish Hydrogen Bonds"
      await senseSymbol.click({ button: 'right', force: true });
      await expect(establishHydrogenBondsOption).toBeEnabled();
      // 2. Check If there are no H-bonds, the option "Delete Hydrogen Bonds" is disabled ( Requirement: 1.2 )
      await expect(deleteHydrogenBondsOption).toBeDisabled();

      // 3. Check that a hydrogen bond established between the monomer that was clicked on and the monomer placed bellow/above it ( Requirement: 1.1 )
      await establishHydrogenBondsOption.click({ force: true });
      const senseHydrogenConnectionNumber = await senseSymbol.getAttribute(
        'data-hydrogen-connection-number',
      );
      const antisenseHydrogenConnectionNumber =
        await antisenseSymbol.getAttribute('data-hydrogen-connection-number');
      expect(senseHydrogenConnectionNumber).toBe('1');
      expect(antisenseHydrogenConnectionNumber).toBe('1');

      // 4. Check if a symbol has H-bonds with a symbol opposite it, the option "Establish Hydrogen Bonds" disabled ( Requirement: 1.1 )
      // Dirty hack to make sure that the symbol got menu opened for it
      await senseSymbol.dblclick({ force: true });
      await clickInTheMiddleOfTheScreen(page);
      await clickInTheMiddleOfTheScreen(page);
      await senseSymbol.click({ button: 'right', force: true });

      await expect(establishHydrogenBondsOption).toBeDisabled();

      // 5. Check that if the symbol represents a nucleotide/nucleoside, a hydrogen bond established from the base (no need for a "sense base" check) ( Requirement: 1.1 )
      const senseSymbolType = await senseSymbol.getAttribute(
        'data-symbol-type',
      );
      if (
        senseSymbolType === SymbolType.RNA ||
        senseSymbolType === SymbolType.DNA
      ) {
        await selectFlexLayoutModeTool(page);

        const hydrogenBondsAll = getBondLocator(page, {
          bondType: MacroBondType.Hydrogen,
        });

        const basesWithHydrogenConnection = getMonomerLocator(page, {
          monomerType: MonomerType.Base,
          hydrogenConnectionNumber: 1,
        });
        const basesAll = getMonomerLocator(page, {
          monomerType: MonomerType.Base,
        });
        // All bases should have hydrogen connection
        expect(await basesWithHydrogenConnection.count()).toBe(
          await basesAll.count(),
        );
        // All hydrogen bonds should be present (two bonds in total)
        expect(await hydrogenBondsAll.count()).toBe(2);
        await selectSequenceLayoutModeTool(page);
      }

      // 6. Check that right clicking on a symbol that has any H-bonds give the option to "Delete Hydrogen Bonds" ( Requirement: 1.2 )
      await senseSymbol.click({ button: 'right', force: true });
      await expect(deleteHydrogenBondsOption).toBeEnabled();

      // 7. Check that clicking on "Delete Hydrogen Bonds" will remove hydrogen bond
      await deleteHydrogenBondsOption.click({ force: true });
      expect(
        await senseSymbol.getAttribute('data-hydrogen-connection-number'),
      ).toBe('0');
      expect(
        await antisenseSymbol.getAttribute('data-hydrogen-connection-number'),
      ).toBe('0');
    });
  }
}

for (const senseSequence of sequencesForHydrogenBondTests) {
  for (const antisenseSequence of sequencesForHydrogenBondTests) {
    test(`Case 12-${senseSequence.Id}-${antisenseSequence.Id}. [${senseSequence.Description}]---[${antisenseSequence.Description}] Establish/Delete Hydrogen Bonds checks for multipal monomers`, async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 2
       * Description: 1. Check if multiple monomers/symbols are selected and at least one of them does not have hydrogen bonds established with the monomer/symbol above/bellow it the option "Establish Hydrogen Bonds" available from the r-click menu ( Requirement: 1.3 )
       *              2. Check if multiple monomers/symbols are selected and all symbols have H-bonds established with the monomer/symbol above/bellow it the option "Establish Hydrogen Bonds" disabled from the r-click menu ( Requirement: 1.3 )
       *              3. Check If multiple monomers are selected, and any of them have hydrogen bonds, the option "Delete Hydrogen Bonds" available in the r-click menu ( Requirement: 1.4 )
       *              4. Check If multiple monomers are selected, and selected symbols have no H-bonds, the option "Delete Hydrogen Bonds" disabled in the r-click menu ( Requirement: 1.4 )
       *              5. Verify warning message on deleting all hydrogen bonds between two chains ( Requirement: 1.5 )
       * Scenario:
       * 1. Load sense and antisense sequences (and connect their c7io7n bases with hydrogen bond to make sence/antisense sequence)
       * 2. Switch to Sequence mode
       * 3. Select all symbols and check that context menu has "Establish Hydrogen Bonds" option available and enabled ("Delete Hydrogen Bonds" option should be disabled)
       * 4. Establish hydrogen bonds between all selected symbols
       * 5. Select all symbols and check that context menu has "Establish Hydrogen Bonds" disabled
       * 6. Select all symbols, call context menu and click "Delete Hydrogen Bonds" to delete all hydrogen bonds
       * 7. Select all symbols and check that context menu has "Delete Hydrogen Bonds" disabled
       */

      await setupSenseAndAntiSenseSequences(
        page,
        senseSequence,
        antisenseSequence,
      );

      await selectSequenceLayoutModeTool(page);

      const senseSymbolId = await getSymbolLocator(page, {
        hydrogenConnectionNumber: 0,
        isAntisense: false,
      })
        .first()
        .getAttribute('data-symbol-id');
      const antisenseSymbolId = await getSymbolLocator(page, {
        hydrogenConnectionNumber: 0,
        isAntisense: true,
      })
        .first()
        .getAttribute('data-symbol-id');

      const senseSymbolWithHBondId = await getSymbolLocator(page, {
        hydrogenConnectionNumber: 1,
        isAntisense: false,
      })
        .first()
        .getAttribute('data-symbol-id');
      const antisenseSymbolWithHBondId = await getSymbolLocator(page, {
        hydrogenConnectionNumber: 1,
        isAntisense: true,
      })
        .first()
        .getAttribute('data-symbol-id');

      const senseSymbol = await getSymbolLocator(page, {
        symbolId: senseSymbolId || '',
      }).first();
      const antisenseSymbol = await getSymbolLocator(page, {
        symbolId: antisenseSymbolId || '',
      }).first();
      const senseSymbolWithHBond = await getSymbolLocator(page, {
        symbolId: senseSymbolWithHBondId || '',
      }).first();
      const antisenseSymbolWithHBond = await getSymbolLocator(page, {
        symbolId: antisenseSymbolWithHBondId || '',
      }).first();

      const establishHydrogenBondsOption = page
        .getByTestId('establish_hydrogen_bond')
        .first();
      const deleteHydrogenBondsOption = page
        .getByTestId('delete_hydrogen_bond')
        .first();

      // 1. Check if multiple monomers/symbols are selected and at least one of them does not have hydrogen bonds established
      //    with the monomer/symbol above/bellow it the option "Establish Hydrogen Bonds" available from the r-click menu ( Requirement: 1.3 )
      await selectAllStructuresOnCanvas(page);
      await senseSymbolWithHBond.click({ button: 'right', force: true });
      await expect(establishHydrogenBondsOption).toBeEnabled();

      // 3. Check If multiple monomers are selected, and any of them have hydrogen bonds, the option "Delete Hydrogen Bonds"
      //    available in the r-click menu ( Requirement: 1.4 )
      await clickInTheMiddleOfTheScreen(page);
      await senseSymbol.click({ button: 'right', force: true });
      await expect(deleteHydrogenBondsOption).toBeEnabled();

      // 2. Check if multiple monomers/symbols are selected and all symbols have H-bonds established with the monomer/symbol
      //    above/bellow it the option "Establish Hydrogen Bonds" disabled from the r-click menu ( Requirement: 1.3 )
      await clickInTheMiddleOfTheScreen(page);
      await senseSymbolWithHBond.click({ button: 'right', force: true });
      await establishHydrogenBondsOption.click({ force: true });
      await selectAllStructuresOnCanvas(page);
      await antisenseSymbol.click({ button: 'right', force: true });
      await expect(establishHydrogenBondsOption).toBeDisabled();

      // 4. Check If multiple monomers are selected, and selected symbols have no H-bonds, the option "Delete Hydrogen Bonds" disabled in the r-click menu ( Requirement: 1.4 )
      await clickInTheMiddleOfTheScreen(page);
      await selectAllStructuresOnCanvas(page);
      await antisenseSymbol.click({ button: 'right', force: true });
      await deleteHydrogenBondsOption.click({ force: true });
      // 5. Verify warning message on deleting all hydrogen bonds between two chains ( Requirement: 1.5 )
      await pressYesInConfirmYourActionDialog(page);
      await selectAllStructuresOnCanvas(page);
      await antisenseSymbolWithHBond.click({ button: 'right', force: true });
      await expect(deleteHydrogenBondsOption).toBeDisabled();
    });
  }
}

for (const senseSequence of sequencesForHydrogenBondTests) {
  test(`Case 13-${senseSequence.Id}. ${senseSequence.Description} - Check if there is no monomer opposite it, the option "Establish Hydrogen Bonds" disabled`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 3
     * Description: Check if there is no monomer opposite it, the option "Establish Hydrogen Bonds" disabled ( Requirement: 1.1 )
     * Scenario:
     * 1. Load sense and empty antisense sequences (and connect their c7io7n bases with hydrogen bond to make sence/antisense sequence)
     * 2. Switch to Sequence mode
     * 3. Getting sense and antisense symbol ids and locators
     * 4. Open context menu for sense symbol and check that context menu has "Establish Hydrogen Bonds" option disabled
     */

    await setupSenseAndAntiSenseSequences(page, senseSequence, emptySequence);

    await selectSequenceLayoutModeTool(page);

    const senseSymbolId = await getSymbolLocator(page, {
      hydrogenConnectionNumber: 0,
      isAntisense: false,
    })
      .first()
      .getAttribute('data-symbol-id');

    const senseSymbol = await getSymbolLocator(page, {
      symbolId: senseSymbolId || '',
    }).first();

    const establishHydrogenBondsOption = page
      .getByTestId('establish_hydrogen_bond')
      .first();

    // Check if there is no monomer opposite it, the option "Establish Hydrogen Bonds" disabled ( Requirement: 1.1 )
    await senseSymbol.click({ button: 'right', force: true });
    await expect(establishHydrogenBondsOption).toBeDisabled();
  });
}

for (const senseSequence of sequencesForHydrogenBondTests) {
  test(`Case 14-${senseSequence.Id}. ${senseSequence.Description} - Check that "Establish Hydrogen Bonds" is disabled if any of the symbols (the one that was clicked on, or the one opposite it) is the @ symbol representing multiple monomers`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 4
     * Description: Check that "Establish Hydrogen Bonds" is disabled if any of the symbols (the one that was clicked on, or the one opposite it) is the @ symbol representing multiple monomers ( Requirement: 1.1 )
     * Scenario:
     * 1. Load sense and empty antisense sequences (and connect their c7io7n bases with hydrogen bond to make sence/antisense sequence)
     * 2. Switch to Sequence mode
     * 3. Getting sense and antisense symbol ids and locators
     * 4. Open context menu for sense symbol and check that context menu has "Establish Hydrogen Bonds" option disabled
     */

    await setupSenseAndAntiSenseSequences(
      page,
      senseSequence,
      symbolRepresentingMultipleMonomers,
    );

    await selectSequenceLayoutModeTool(page);

    const senseSymbolId = await getSymbolLocator(page, {
      hydrogenConnectionNumber: 0,
      isAntisense: false,
    })
      .first()
      .getAttribute('data-symbol-id');

    const senseSymbol = await getSymbolLocator(page, {
      symbolId: senseSymbolId || '',
    }).first();

    const establishHydrogenBondsOption = page
      .getByTestId('establish_hydrogen_bond')
      .first();

    // Check if there is no monomer opposite it, the option "Establish Hydrogen Bonds" disabled ( Requirement: 1.1 )
    await senseSymbol.click({ button: 'right', force: true });
    await expect(establishHydrogenBondsOption).toBeDisabled();
  });
}

test(`Case 15. Verify warning message on deleting all hydrogen bonds between two chains`, async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 5
   * Description: Verify warning message on deleting all hydrogen bonds between two chains
   * Scenario:
   * 1. Load sequence with two chains connected with hydrogen bonds
   * 2. Select all symbols and call context menu
   * 3. Click on "Delete Hydrogen Bonds"
   * 4. Take screenshot to validate sequence order
   */

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)P.R(U)P.R(U)}|RNA3{[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)}|RNA4{R(U)P.R(U)P.R(U)}|RNA5{[dR](T)P.[dR](T)}|RNA6{R(U)}|RNA7{[dR](T)P.[dR](T)P.[dR](T)P.[dR](T)}$RNA1,RNA2,2:pair-14:pair|RNA1,RNA2,5:pair-11:pair|RNA1,RNA2,8:pair-8:pair|RNA1,RNA2,11:pair-5:pair|RNA1,RNA2,14:pair-2:pair|RNA1,RNA3,20:pair-11:pair|RNA1,RNA3,23:pair-8:pair|RNA1,RNA3,26:pair-5:pair|RNA1,RNA3,29:pair-2:pair|RNA1,RNA4,35:pair-8:pair|RNA1,RNA4,38:pair-5:pair|RNA1,RNA4,41:pair-2:pair|RNA1,RNA5,47:pair-5:pair|RNA1,RNA5,50:pair-2:pair|RNA1,RNA6,56:pair-2:pair|RNA1,RNA7,62:pair-11:pair|RNA1,RNA7,65:pair-8:pair|RNA1,RNA7,68:pair-5:pair|RNA1,RNA7,71:pair-2:pair$$$V2.0',
  );

  await selectSequenceLayoutModeTool(page);
  await selectAllStructuresOnCanvas(page);

  const anySymbolA = getSymbolLocator(page, { symbolAlias: 'A' }).first();

  await anySymbolA.click({ button: 'right', force: true });
  const deleteHydrogenBondsOption = page
    .getByTestId('delete_hydrogen_bond')
    .first();

  await deleteHydrogenBondsOption.click({ force: true });
  await pressYesInConfirmYourActionDialog(page);

  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test(`Case 16. Check that when all H-bonds are deleted, the chain(s) that used to be placed bellow should be placed bellow the chain that was on top, one bellow the other starting from the chain on the left`, async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 6
   * Description: Check that when all H-bonds are deleted, the chain(s) that used to be placed bellow should be placed bellow the chain that was on top, one bellow the other starting from the chain on the left ( Requirement: 1.5 )
   * Scenario:
   * 1. Load sequence with two chains connected with hydrogen bonds (antisense chain oriented form Y, X, W ... to A)
   * 2. Select all symbols and call context menu
   * 3. Click on "Delete Hydrogen Bonds"
   * 4. Take screenshot to validate former antisenese sequence orientation (from A, B, C ... to Y)
   */

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)P.R(A)}|RNA2{R(A)P}|PEPTIDE1{(D,N).C.D.E.F.H.I.K.L.M.N.O.P.Q.R.S.T.V.W.(A,C,D,E,F,G,H,I,K,L,M,N,O,P,Q,R,S,T,U,V,W,Y).Y}$RNA2,PEPTIDE1,3:R2-1:R1|RNA2,RNA1,2:pair-65:pair|RNA1,PEPTIDE1,2:pair-21:pair|RNA1,PEPTIDE1,5:pair-20:pair|RNA1,PEPTIDE1,8:pair-19:pair|RNA1,PEPTIDE1,11:pair-18:pair|RNA1,PEPTIDE1,14:pair-17:pair|RNA1,PEPTIDE1,17:pair-16:pair|RNA1,PEPTIDE1,20:pair-15:pair|RNA1,PEPTIDE1,23:pair-14:pair|RNA1,PEPTIDE1,26:pair-13:pair|RNA1,PEPTIDE1,29:pair-12:pair|RNA1,PEPTIDE1,32:pair-11:pair|RNA1,PEPTIDE1,35:pair-10:pair|RNA1,PEPTIDE1,38:pair-9:pair|RNA1,PEPTIDE1,41:pair-8:pair|RNA1,PEPTIDE1,44:pair-7:pair|RNA1,PEPTIDE1,47:pair-6:pair|RNA1,PEPTIDE1,50:pair-5:pair|RNA1,PEPTIDE1,53:pair-4:pair|RNA1,PEPTIDE1,56:pair-3:pair|RNA1,PEPTIDE1,59:pair-2:pair|RNA1,PEPTIDE1,62:pair-1:pair$$$V2.0',
  );

  await selectSequenceLayoutModeTool(page);
  await selectAllStructuresOnCanvas(page);

  const anySymbolA = getSymbolLocator(page, { symbolAlias: 'A' }).first();

  await anySymbolA.click({ button: 'right', force: true });
  const deleteHydrogenBondsOption = page
    .getByTestId('delete_hydrogen_bond')
    .first();

  await deleteHydrogenBondsOption.click({ force: true });
  await pressYesInConfirmYourActionDialog(page);

  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

for (const monomer of monomersToAdd) {
  for (const sequence of uniqueFirstSymbolPairs) {
    test(`Case 17-${sequence.Id}-${monomer.Id}. Add ${monomer.Type} (${monomer.Letter}) to ${sequence.SequenceName} to first position of sence chain`, async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 7
       * Description: User can add monomer (of every type) to first position in sense chain of sequence (of every configuration) in edit mode
       * Scenario:
       * 1. Clear canvas
       * 2. Load sequence from HELM
       * 3. Switch sequence to edit mode (Sync mode OFF) and move cursor to the first position of sense chain
       * 4. Select monomer type (using switcher on the top - RNA/DNA/Peptide)
       * 5. Press keyboard key to add monomer to the first position of sense chain
       * 5. Load same sequence again to be able to compare result and sourse sequence
       * 6. Add on the canvas source sequence from HELM to be able easily compare consition after and before adding monomer
       * 7. Take screenshot to validate that monomer was added in Sequence mode
       * 8. Switch to Flex mode
       * 9. Take screenshot to validate that monomer was added in Flex mode canvas
       * 10. Add info to log if known bugs exist and skip test
       */
      if (sequence.HELM) {
        await pasteFromClipboardAndAddToMacromoleculesCanvas(
          page,
          MacroFileType.HELM,
          !sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM || '',
        );
      }
      await selectSequenceLayoutModeTool(page);
      await selectSequenceMode(page, monomer.Type);

      await turnIntoEditModeAndPlaceCursorToThePosition(page, {
        position: 1,
        senseOrAntisense: SequenceChainType.Sense,
        syncEditMode: false,
      });

      await waitForRender(page, async () => {
        await page.keyboard.press(monomer.Letter);
      });
      await clickInTheMiddleOfTheScreen(page);

      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
      );
      await takeEditorScreenshot(page, { hideMonomerPreview: true });
      await selectFlexLayoutModeTool(page);

      await takeEditorScreenshot(page, { hideMonomerPreview: true });

      // skip that test if bug(s) exists
      await checkForKnownBugs(sequence, monomer);
    });
  }
}
const monomersToAddWithDashAndEnter = [
  ...Object.values(monomersToAdd),
  ...Object.values(dash),
  ...Object.values(enter),
];
for (const monomer of monomersToAddWithDashAndEnter) {
  for (const sequence of uniquePairsOfFirstAndSecondSymbols) {
    test(`Case 18-${sequence.Id}-${monomer.Id}. Add ${monomer.Type} (${monomer.Letter}) to ${sequence.SequenceName} to second position of sence chain`, async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 8
       * Description: User can add monomer (of every type) to second position in sense chain of sequence (of every configuration) in edit mode
       * Scenario:
       * 1. Clear canvas
       * 2. Load sequence from HELM
       * 3. Switch sequence to edit mode and move cursor to the second position of sense chain
       * 4. Select monomer type (using switcher on the top - RNA/DNA/Peptide)
       * 5. Press keyboard key to add monomer to the second position of sense chain
       * 5. Load same sequence again to be able to compare result and sourse sequence
       * 6. Take screenshot to validate that monomer was added in Sequence mode
       * 6. Switch to Flex mode
       * 7. Take screenshot to validate that monomer was added in Flex mode canvas
       * 8. Add info to log if known bugs exist and skip test
       */
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
      );
      await selectSequenceLayoutModeTool(page);
      await selectSequenceMode(page, monomer.Type);

      await turnIntoEditModeAndPlaceCursorToThePosition(page, {
        position: 2,
        senseOrAntisense: SequenceChainType.Sense,
        syncEditMode: false,
      });

      await waitForRender(page, async () => {
        await page.keyboard.press(monomer.Letter);
      });
      await clickInTheMiddleOfTheScreen(page);

      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
      );
      await takeEditorScreenshot(page, { hideMonomerPreview: true });
      await selectFlexLayoutModeTool(page);

      await takeEditorScreenshot(page, { hideMonomerPreview: true });

      // skip that test if bug(s) exists
      await checkForKnownBugs(sequence, monomer);
    });
  }
}

for (const monomer of monomersToAddWithDashAndEnter) {
  for (const sequence of secondSymbolPairsWithDash) {
    test(`Case 19-${sequence.Id}-${monomer.Id}. Add ${monomer.Type} (${monomer.Letter}) to ${sequence.SequenceName} to third position of sense chain`, async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 9
       * Description: User can add monomer (of every type) to third position in sense chain of sequence (of every configuration) in edit mode
       * Scenario:
       * 1. Clear canvas
       * 2. Load sequence from HELM
       * 3. Switch sequence to edit mode and move cursor to the third position of sense chain
       * 4. Select monomer type (using switcher on the top - RNA/DNA/Peptide)
       * 5. Press keyboard key to add monomer to the third position of sense chain
       * 5. Load same sequence again to be able to compare result and sourse sequence
       * 6. Take screenshot to validate that monomer was added in Sequence mode
       * 6. Switch to Flex mode
       * 7. Take screenshot to validate that monomer was added in Flex mode canvas
       * 8. Add info to log if known bugs exist and skip test
       */
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
      );
      await selectSequenceLayoutModeTool(page);
      await selectSequenceMode(page, monomer.Type);

      await turnIntoEditModeAndPlaceCursorToThePosition(page, {
        position: 3,
        senseOrAntisense: SequenceChainType.Sense,
        syncEditMode: false,
      });

      await waitForRender(page, async () => {
        await page.keyboard.press(monomer.Letter);
      });
      await clickInTheMiddleOfTheScreen(page);

      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
      );
      await takeEditorScreenshot(page, { hideMonomerPreview: true });
      await selectFlexLayoutModeTool(page);

      await takeEditorScreenshot(page, { hideMonomerPreview: true });

      // skip that test if bug(s) exists
      await checkForKnownBugs(sequence, monomer);
    });
  }
}

for (const monomer of monomersToAdd) {
  for (const sequence of uniqueLastSymbolPairs) {
    test(`Case 20-${sequence.Id}-${monomer.Id}. Add ${monomer.Type} (${monomer.Letter}) to ${sequence.SequenceName} to last position of sense chain`, async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 10
       * Description: User can add monomer (of every type) to last position in sense chain of sequence (of every configuration) in edit mode
       * Scenario:
       * 1. Clear canvas
       * 2. Load sequence from HELM
       * 3. Switch sequence to edit mode and move cursor to the last position of sencse chain
       * 4. Select monomer type (using switcher on the top - RNA/DNA/Peptide)
       * 5. Press keyboard key to add monomer to the last position of sencse chain
       * 5. Load same sequence again to be able to compare result and sourse sequence
       * 6. Add on the canvas source sequence from HELM to be able easily compare consition after and before adding monomer
       * 7. Take screenshot to validate that monomer was added in Sequence mode
       * 8. Switch to Flex mode
       * 9. Take screenshot to validate that monomer was added in Flex mode canvas
       * 10 . Add info to log if known bugs exist and skip test
       */
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        (!sequence.Rotation ? sequence.HELM : sequence.LeftAnchoredHELM) || '',
      );

      await selectSequenceLayoutModeTool(page);
      await selectSequenceMode(page, monomer.Type);

      await turnIntoEditModeAndPlaceCursorToThePosition(page, {
        position: 9,
        senseOrAntisense: SequenceChainType.Sense,
        syncEditMode: false,
      });

      await waitForRender(page, async () => {
        await page.keyboard.press(monomer.Letter);
      });
      await clickInTheMiddleOfTheScreen(page);

      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        (!sequence.Rotation ? sequence.HELM : sequence.LeftAnchoredHELM) || '',
      );

      await takeEditorScreenshot(page, { hideMonomerPreview: true });
      await selectFlexLayoutModeTool(page);

      await takeEditorScreenshot(page, { hideMonomerPreview: true });

      // skip that test if bug(s) exists
      await checkForKnownBugs(sequence, monomer);
    });
  }
}

for (const sequence of uniquePairsOfFirstAndSecondSymbols) {
  test(`Case 21-${sequence.Id}. Delete first symbol of sense chain at ${sequence.SequenceName} with Delete key`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 11
     * Description: User can delete monomer (of every type) on first position in sense chain of sequence (of every configuration) in edit mode
     * Scenario:
     * 1. Clear canvas
     * 2. Load sequence from HELM
     * 3. Switch sequence to edit mode and move cursor to the first position of sense chain
     * 4. Press Delete keyboard key to delete first symbol of sense chain in seqience
     * 5. Add on the canvas source sequence from HELM to be able easily compare consition after and before adding monomer
     * 6. Take screenshot to validate that monomer was deleted in Sequence mode
     * 7. Switch to Flex mode
     * 8. Take screenshot to validate that monomer was deleted in Flex mode canvas
     * 9. Add info to log if known bugs exist and skip test
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
    );
    await selectSequenceLayoutModeTool(page);
    await selectSequenceMode(page, SequenceModeType.RNA);

    await turnIntoEditModeAndPlaceCursorToThePosition(page, {
      position: 1,
      senseOrAntisense: SequenceChainType.Sense,
      syncEditMode: false,
    });

    await waitForRender(page, async () => {
      await page.keyboard.press('Delete');
    });
    await clickInTheMiddleOfTheScreen(page);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
    );

    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await selectFlexLayoutModeTool(page);

    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    // skip that test if bug(s) exists
    await checkForKnownBugs(sequence);
  });
}

for (const sequence of sequences) {
  test(`Case 22-${sequence.Id}. Delete second symbol  of sense chain at ${sequence.SequenceName} with Delete key`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 12
     * Description: User can delete monomer (of every type) on second position in sense chain of sequence (of every configuration) in edit mode
     * Scenario:
     * 1. Clear canvas
     * 2. Load sequence from HELM
     * 3. Switch sequence to edit mode and move cursor to the second position of sense chain
     * 4. Press Delete keyboard key to delete second symbol of sense chain in seqience
     * 5. Load same sequence again to be able to compare result and sourse sequence
     * 5. Add on the canvas source sequence from HELM to be able easily compare consition after and before adding monomer
     * 6. Take screenshot to validate that monomer was deleted in Sequence mode
     * 7. Switch to Flex mode
     * 8. Take screenshot to validate that monomer was deleted in Flex mode canvas
     * 9. Add info to log if known bugs exist and skip test
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
    );
    await selectSequenceLayoutModeTool(page);
    await selectSequenceMode(page, SequenceModeType.RNA);

    await turnIntoEditModeAndPlaceCursorToThePosition(page, {
      position: 2,
      senseOrAntisense: SequenceChainType.Sense,
      syncEditMode: false,
    });

    await waitForRender(page, async () => {
      await page.keyboard.press('Delete');
    });
    await clickInTheMiddleOfTheScreen(page);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
    );

    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await selectFlexLayoutModeTool(page);

    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    // skip that test if bug(s) exists
    await checkForKnownBugs(sequence);
  });
}

for (const sequence of uniquePairsOfSecondAndThirdSymbols) {
  test(`Case 23-${sequence.Id}. Delete third symbol of sense chain at ${sequence.SequenceName} with Delete key`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 13
     * Description: User can delete monomer (of every type) on third position in sense chain of sequence (of every configuration) in edit mode
     * Scenario:
     * 1. Clear canvas
     * 2. Load sequence from HELM
     * 3. Switch sequence to edit mode and move cursor to the third position of sense chain
     * 4. Press Delete keyboard key to delete third symbol of sense chain in seqience
     * 5. Load same sequence again to be able to compare result and sourse sequence
     * 6. Add on the canvas source sequence from HELM to be able easily compare consition after and before adding monomer
     * 7. Take screenshot to validate that monomer was deleted in Sequence mode
     * 8. Switch to Flex mode
     * 9. Take screenshot to validate that monomer was deleted in Flex mode canvas
     * 10. Add info to log if known bugs exist and skip test
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.LeftAnchoredHELM) || '',
    );
    await selectSequenceLayoutModeTool(page);
    await selectSequenceMode(page, SequenceModeType.RNA);

    await turnIntoEditModeAndPlaceCursorToThePosition(page, {
      position: !sequence.Rotation ? 3 : 7,
      senseOrAntisense: SequenceChainType.Sense,
      syncEditMode: false,
    });

    await waitForRender(page, async () => {
      await page.keyboard.press('Delete');
    });
    await clickInTheMiddleOfTheScreen(page);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.LeftAnchoredHELM) || '',
    );

    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await selectFlexLayoutModeTool(page);

    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    // skip that test if bug(s) exists
    await checkForKnownBugs(sequence);
  });
}

for (const sequence of uniquePairsOfFirstAndSecondSymbols) {
  test(`Case 24-${sequence.Id}. Delete first symbol of sense chain at ${sequence.SequenceName} Backspace key`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 14
     * Description: User can delete monomer (of every type) on first position in sense chain of sequence (of every configuration) in edit mode
     * Scenario:
     * 1. Clear canvas
     * 2. Load sequence from HELM
     * 3. Switch sequence to edit mode and move cursor to the second position of sense chain
     * 4. Press Backspace keyboard key to delete first symbol of sense chain in seqience
     * 5. Load same sequence again to be able to compare result and sourse sequence
     * 5. Take screenshot to validate that monomer was deleted in Sequence mode
     * 6. Switch to Flex mode
     * 7. Take screenshot to validate that monomer was deleted in Flex mode canvas
     * 8. Add info to log if known bugs exist and skip test
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
    );
    await selectSequenceLayoutModeTool(page);
    await selectSequenceMode(page, SequenceModeType.RNA);

    await turnIntoEditModeAndPlaceCursorToThePosition(page, {
      position: 2,
      senseOrAntisense: SequenceChainType.Sense,
      syncEditMode: false,
    });

    await waitForRender(page, async () => {
      await page.keyboard.press('Backspace');
    });
    await clickInTheMiddleOfTheScreen(page);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
    );
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await selectFlexLayoutModeTool(page);

    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    // skip that test if bug(s) exists
    await checkForKnownBugs(sequence);
  });
}

for (const sequence of sequences) {
  test(`Case 25-${sequence.Id}. Delete second symbol of sense chain at ${sequence.SequenceName} Backspace key`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 15
     * Description: User can delete monomer (of every type) on second position in sense chain of sequence (of every configuration) in edit mode
     * Scenario:
     * 1. Clear canvas
     * 2. Load sequence from HELM
     * 3. Switch sequence to edit mode and move cursor to the third position of sense chain
     * 4. Press Backspace keyboard key to delete second symbol of sense chain in seqience
     * 5. Load same sequence again to be able to compare result and sourse sequence
     * 5. Take screenshot to validate that monomer was deleted in Sequence mode
     * 6. Switch to Flex mode
     * 7. Take screenshot to validate that monomer was deleted in Flex mode canvas
     * 8. Add info to log if known bugs exist and skip test
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
    );
    await selectSequenceLayoutModeTool(page);
    await selectSequenceMode(page, SequenceModeType.RNA);

    await turnIntoEditModeAndPlaceCursorToThePosition(page, {
      position: 3,
      senseOrAntisense: SequenceChainType.Sense,
      syncEditMode: false,
    });

    await waitForRender(page, async () => {
      await page.keyboard.press('Backspace');
    });
    await clickInTheMiddleOfTheScreen(page);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
    );
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await selectFlexLayoutModeTool(page);

    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    // skip that test if bug(s) exists
    await checkForKnownBugs(sequence);
  });
}

for (const sequence of uniquePairsOfSecondAndThirdSymbols) {
  test(`Case 26-${sequence.Id}. Delete third symbol of sense chain at ${sequence.SequenceName} Backspace key`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 16
     * Description: User can delete monomer (of every type) on third position in sense chain of sequence (of every configuration) in edit mode
     * Scenario:
     * 1. Clear canvas
     * 2. Load sequence from HELM
     * 3. Switch sequence to edit mode and move cursor to the forth position of sense chain
     * 4. Press Backspace keyboard key to delete third symbol of sense chain in seqience
     * 5. Load same sequence again to be able to compare result and sourse sequence
     * 5. Take screenshot to validate that monomer was deleted in Sequence mode
     * 6. Switch to Flex mode
     * 7. Take screenshot to validate that monomer was deleted in Flex mode canvas
     * 8. Add info to log if known bugs exist and skip test
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.LeftAnchoredHELM) || '',
    );
    await selectSequenceLayoutModeTool(page);
    await selectSequenceMode(page, SequenceModeType.RNA);

    await turnIntoEditModeAndPlaceCursorToThePosition(page, {
      position: !sequence.Rotation ? 4 : 8,
      senseOrAntisense: SequenceChainType.Sense,
      syncEditMode: false,
    });

    await waitForRender(page, async () => {
      await page.keyboard.press('Backspace');
    });

    await clickInTheMiddleOfTheScreen(page);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.LeftAnchoredHELM) || '',
    );
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await selectFlexLayoutModeTool(page);

    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    // skip that test if bug(s) exists
    await checkForKnownBugs(sequence);
  });
}

for (const monomer of monomersToAdd) {
  for (const sequence of uniqueFirstSymbolPairs) {
    test(`Case 27-${sequence.Id}-${monomer.Id}. Add ${monomer.Type} (${monomer.Letter}) to ${sequence.SequenceName} to first position of antisence chain`, async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 17
       * Description: User can add monomer (of every type) to first position in antisense chain of sequence (of every configuration) in edit mode
       * Scenario:
       * 1. Clear canvas
       * 2. Load sequence from HELM
       * 3. Switch sequence to edit mode (Sync mode OFF) and move cursor to the first position of antisense chain
       * 4. Select monomer type (using switcher on the top - RNA/DNA/Peptide)
       * 5. Press keyboard key to add monomer to the first position of antisense chain
       * 5. Load same sequence again to be able to compare result and sourse sequence
       * 6. Add on the canvas source sequence from HELM to be able easily compare consition after and before adding monomer
       * 7. Take screenshot to validate that monomer was added in Sequence mode
       * 8. Switch to Flex mode
       * 9. Take screenshot to validate that monomer was added in Flex mode canvas
       * 10. Add info to log if known bugs exist and skip test
       */
      if (sequence.HELM) {
        await pasteFromClipboardAndAddToMacromoleculesCanvas(
          page,
          MacroFileType.HELM,
          !sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM || '',
        );
      }
      await selectSequenceLayoutModeTool(page);
      await selectSequenceMode(page, monomer.Type);

      await turnIntoEditModeAndPlaceCursorToThePosition(page, {
        position: 1,
        senseOrAntisense: SequenceChainType.Antisense,
        syncEditMode: false,
      });

      await waitForRender(page, async () => {
        await page.keyboard.press(monomer.Letter);
      });
      await clickInTheMiddleOfTheScreen(page);

      await page.keyboard.press('Shift');
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
      );
      await takeEditorScreenshot(page, { hideMonomerPreview: true });
      await selectFlexLayoutModeTool(page);

      await takeEditorScreenshot(page, { hideMonomerPreview: true });

      // skip that test if bug(s) exists
      await checkForKnownBugs(sequence, monomer);
    });
  }
}

for (const monomer of monomersToAddWithDashAndEnter) {
  for (const sequence of uniquePairsOfFirstAndSecondSymbols) {
    test(`Case 28-${sequence.Id}-${monomer.Id}. Add ${monomer.Type} (${monomer.Letter}) to ${sequence.SequenceName} to second position of antisence chain`, async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 18
       * Description: User can add monomer (of every type) to second position in antisense chain of sequence (of every configuration) in edit mode
       * Scenario:
       * 1. Clear canvas
       * 2. Load sequence from HELM
       * 3. Switch sequence to edit mode and move cursor to the second position of antisense chain
       * 4. Select monomer type (using switcher on the top - RNA/DNA/Peptide)
       * 5. Press keyboard key to add monomer to the second position of antisense chain
       * 5. Load same sequence again to be able to compare result and sourse sequence
       * 6. Take screenshot to validate that monomer was added in Sequence mode
       * 6. Switch to Flex mode
       * 7. Take screenshot to validate that monomer was added in Flex mode canvas
       * 8. Add info to log if known bugs exist and skip test
       */
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
      );
      await selectSequenceLayoutModeTool(page);
      await selectSequenceMode(page, monomer.Type);

      await turnIntoEditModeAndPlaceCursorToThePosition(page, {
        position: 2,
        senseOrAntisense: SequenceChainType.Antisense,
        syncEditMode: false,
      });

      await waitForRender(page, async () => {
        await page.keyboard.press(monomer.Letter);
      });
      await clickInTheMiddleOfTheScreen(page);

      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
      );
      await takeEditorScreenshot(page, { hideMonomerPreview: true });
      await selectFlexLayoutModeTool(page);

      await takeEditorScreenshot(page, { hideMonomerPreview: true });

      // skip that test if bug(s) exists
      await checkForKnownBugs(sequence, monomer);
    });
  }
}

for (const monomer of monomersToAddWithDashAndEnter) {
  for (const sequence of secondSymbolPairsWithDash) {
    test(`Case 29-${sequence.Id}-${monomer.Id}. Add ${monomer.Type} (${monomer.Letter}) to ${sequence.SequenceName} to third position of antisense chain`, async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 19
       * Description: User can add monomer (of every type) to third position in antisense chain of sequence (of every configuration) in edit mode
       * Scenario:
       * 1. Clear canvas
       * 2. Load sequence from HELM
       * 3. Switch sequence to edit mode and move cursor to the third position of antisense chain
       * 4. Select monomer type (using switcher on the top - RNA/DNA/Peptide)
       * 5. Press keyboard key to add monomer to the third position of antisense chain
       * 5. Load same sequence again to be able to compare result and sourse sequence
       * 6. Take screenshot to validate that monomer was added in Sequence mode
       * 6. Switch to Flex mode
       * 7. Take screenshot to validate that monomer was added in Flex mode canvas
       * 8. Add info to log if known bugs exist and skip test
       */
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
      );
      await selectSequenceLayoutModeTool(page);
      await selectSequenceMode(page, monomer.Type);

      await turnIntoEditModeAndPlaceCursorToThePosition(page, {
        position: 3,
        senseOrAntisense: SequenceChainType.Antisense,
        syncEditMode: false,
      });

      await waitForRender(page, async () => {
        await page.keyboard.press(monomer.Letter);
      });
      await clickInTheMiddleOfTheScreen(page);

      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
      );
      await takeEditorScreenshot(page, { hideMonomerPreview: true });
      await selectFlexLayoutModeTool(page);

      await takeEditorScreenshot(page, { hideMonomerPreview: true });

      // skip that test if bug(s) exists
      await checkForKnownBugs(sequence, monomer);
    });
  }
}

for (const monomer of monomersToAdd) {
  for (const sequence of uniqueLastSymbolPairs) {
    test(`Case 30-${sequence.Id}-${monomer.Id}. Add ${monomer.Type} (${monomer.Letter}) to ${sequence.SequenceName} to last position of antisense chain`, async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 20
       * Description: User can add monomer (of every type) to last position in sense chain of sequence (of every configuration) in edit mode
       * Scenario:
       * 1. Clear canvas
       * 2. Load sequence from HELM
       * 3. Switch sequence to edit mode and move cursor to the last position of antisencse chain
       * 4. Select monomer type (using switcher on the top - RNA/DNA/Peptide)
       * 5. Press keyboard key to add monomer to the last position of antisencse chain
       * 5. Load same sequence again to be able to compare result and sourse sequence
       * 6. Add on the canvas source sequence from HELM to be able easily compare consition after and before adding monomer
       * 7. Take screenshot to validate that monomer was added in Sequence mode
       * 8. Switch to Flex mode
       * 9. Take screenshot to validate that monomer was added in Flex mode canvas
       * 10 . Add info to log if known bugs exist and skip test
       */
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        (!sequence.Rotation ? sequence.HELM : sequence.LeftAnchoredHELM) || '',
      );

      await selectSequenceLayoutModeTool(page);
      await selectSequenceMode(page, monomer.Type);

      await turnIntoEditModeAndPlaceCursorToThePosition(page, {
        position: 9,
        senseOrAntisense: SequenceChainType.Antisense,
        syncEditMode: false,
      });

      await waitForRender(page, async () => {
        await page.keyboard.press(monomer.Letter);
      });
      await clickInTheMiddleOfTheScreen(page);

      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        (!sequence.Rotation ? sequence.HELM : sequence.LeftAnchoredHELM) || '',
      );

      await takeEditorScreenshot(page, { hideMonomerPreview: true });
      await selectFlexLayoutModeTool(page);

      await takeEditorScreenshot(page, { hideMonomerPreview: true });

      // skip that test if bug(s) exists
      await checkForKnownBugs(sequence, monomer);
    });
  }
}

for (const sequence of uniquePairsOfFirstAndSecondSymbols) {
  test(`Case 31-${sequence.Id}. Delete first symbol of antisense chain at ${sequence.SequenceName} with Delete key`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 21
     * Description: User can delete monomer (of every type) on first position in antisense chain of sequence (of every configuration) in edit mode
     * Scenario:
     * 1. Clear canvas
     * 2. Load sequence from HELM
     * 3. Switch sequence to edit mode and move cursor to the first position of antisense chain
     * 4. Press Delete keyboard key to delete first symbol of antisense chain in seqience
     * 5. Load same sequence again to be able to compare result and sourse sequence
     * 5. Add on the canvas source sequence from HELM to be able easily compare consition after and before adding monomer
     * 6. Take screenshot to validate that monomer was deleted in Sequence mode
     * 7. Switch to Flex mode
     * 8. Take screenshot to validate that monomer was deleted in Flex mode canvas
     * 9. Add info to log if known bugs exist and skip test
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
    );
    await selectSequenceLayoutModeTool(page);
    await selectSequenceMode(page, SequenceModeType.RNA);

    await turnIntoEditModeAndPlaceCursorToThePosition(page, {
      position: 1,
      senseOrAntisense: SequenceChainType.Antisense,
      syncEditMode: false,
    });

    await waitForRender(page, async () => {
      await page.keyboard.press('Delete');
    });
    await clickInTheMiddleOfTheScreen(page);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
    );

    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await selectFlexLayoutModeTool(page);

    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    // skip that test if bug(s) exists
    await checkForKnownBugs(sequence);
  });
}

for (const sequence of sequences) {
  test(`Case 32-${sequence.Id}. Delete second symbol  of antisense chain at ${sequence.SequenceName} with Delete key`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 22
     * Description: User can delete monomer (of every type) on second position in antisense chain of sequence (of every configuration) in edit mode
     * Scenario:
     * 1. Clear canvas
     * 2. Load sequence from HELM
     * 3. Switch sequence to edit mode and move cursor to the second position of antisense chain
     * 4. Press Delete keyboard key to delete second symbol of antisense chain in seqience
     * 5. Load same sequence again to be able to compare result and sourse sequence
     * 5. Add on the canvas source sequence from HELM to be able easily compare consition after and before adding monomer
     * 6. Take screenshot to validate that monomer was deleted in Sequence mode
     * 7. Switch to Flex mode
     * 8. Take screenshot to validate that monomer was deleted in Flex mode canvas
     * 9. Add info to log if known bugs exist and skip test
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
    );
    await selectSequenceLayoutModeTool(page);
    await selectSequenceMode(page, SequenceModeType.RNA);

    await turnIntoEditModeAndPlaceCursorToThePosition(page, {
      position: 2,
      senseOrAntisense: SequenceChainType.Antisense,
      syncEditMode: false,
    });

    await waitForRender(page, async () => {
      await page.keyboard.press('Delete');
    });
    await clickInTheMiddleOfTheScreen(page);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
    );

    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await selectFlexLayoutModeTool(page);

    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    // skip that test if bug(s) exists
    await checkForKnownBugs(sequence);
  });
}

for (const sequence of uniquePairsOfSecondAndThirdSymbols) {
  test(`Case 33-${sequence.Id}. Delete third symbol of antisense chain at ${sequence.SequenceName} with Delete key`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 23
     * Description: User can delete monomer (of every type) on third position in antisense chain of sequence (of every configuration) in edit mode
     * Scenario:
     * 1. Clear canvas
     * 2. Load sequence from HELM
     * 3. Switch sequence to edit mode and move cursor to the third position of antisense chain
     * 4. Press Delete keyboard key to delete third symbol of antisense chain in seqience
     * 5. Load same sequence again to be able to compare result and sourse sequence
     * 6. Add on the canvas source sequence from HELM to be able easily compare consition after and before adding monomer
     * 7. Take screenshot to validate that monomer was deleted in Sequence mode
     * 8. Switch to Flex mode
     * 9. Take screenshot to validate that monomer was deleted in Flex mode canvas
     * 10. Add info to log if known bugs exist and skip test
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.LeftAnchoredHELM) || '',
    );
    await selectSequenceLayoutModeTool(page);
    await selectSequenceMode(page, SequenceModeType.RNA);

    await turnIntoEditModeAndPlaceCursorToThePosition(page, {
      position: !sequence.Rotation ? 3 : 7,
      senseOrAntisense: SequenceChainType.Antisense,
      syncEditMode: false,
    });

    await waitForRender(page, async () => {
      await page.keyboard.press('Delete');
    });
    await clickInTheMiddleOfTheScreen(page);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.LeftAnchoredHELM) || '',
    );

    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await selectFlexLayoutModeTool(page);

    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    // skip that test if bug(s) exists
    await checkForKnownBugs(sequence);
  });
}

for (const sequence of uniquePairsOfFirstAndSecondSymbols) {
  test(`Case 34-${sequence.Id}. Delete first symbol of antisense chain at ${sequence.SequenceName} Backspace key`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 24
     * Description: User can delete monomer (of every type) on first position in antisense chain of sequence (of every configuration) in edit mode
     * Scenario:
     * 1. Clear canvas
     * 2. Load sequence from HELM
     * 3. Switch sequence to edit mode and move cursor to the second position of antisense chain
     * 4. Press Backspace keyboard key to delete first symbol of antisense chain in seqience
     * 5. Load same sequence again to be able to compare result and sourse sequence
     * 5. Take screenshot to validate that monomer was deleted in Sequence mode
     * 6. Switch to Flex mode
     * 7. Take screenshot to validate that monomer was deleted in Flex mode canvas
     * 8. Add info to log if known bugs exist and skip test
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
    );
    await selectSequenceLayoutModeTool(page);
    await selectSequenceMode(page, SequenceModeType.RNA);

    await turnIntoEditModeAndPlaceCursorToThePosition(page, {
      position: 2,
      senseOrAntisense: SequenceChainType.Antisense,
      syncEditMode: false,
    });

    await waitForRender(page, async () => {
      await page.keyboard.press('Backspace');
    });
    await clickInTheMiddleOfTheScreen(page);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
    );
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await selectFlexLayoutModeTool(page);

    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    // skip that test if bug(s) exists
    await checkForKnownBugs(sequence);
  });
}

for (const sequence of sequences) {
  test(`Case 35-${sequence.Id}. Delete second symbol of antisense chain at ${sequence.SequenceName} Backspace key`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 35
     * Description: User can delete monomer (of every type) on second position in antisense chain of sequence (of every configuration) in edit mode
     * Scenario:
     * 1. Clear canvas
     * 2. Load sequence from HELM
     * 3. Switch sequence to edit mode and move cursor to the third position of antisense chain
     * 4. Press Backspace keyboard key to delete second symbol of antisense chain in seqience
     * 5. Load same sequence again to be able to compare result and sourse sequence
     * 5. Take screenshot to validate that monomer was deleted in Sequence mode
     * 6. Switch to Flex mode
     * 7. Take screenshot to validate that monomer was deleted in Flex mode canvas
     * 8. Add info to log if known bugs exist and skip test
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
    );
    await selectSequenceLayoutModeTool(page);
    await selectSequenceMode(page, SequenceModeType.RNA);

    await turnIntoEditModeAndPlaceCursorToThePosition(page, {
      position: 3,
      senseOrAntisense: SequenceChainType.Antisense,
      syncEditMode: false,
    });

    await waitForRender(page, async () => {
      await page.keyboard.press('Backspace');
    });
    await clickInTheMiddleOfTheScreen(page);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.RightAnchoredHELM) || '',
    );
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await selectFlexLayoutModeTool(page);

    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    // skip that test if bug(s) exists
    await checkForKnownBugs(sequence);
  });
}

for (const sequence of uniquePairsOfSecondAndThirdSymbols) {
  test(`Case 36-${sequence.Id}. Delete third symbol of antisense chain at ${sequence.SequenceName} Backspace key`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 36
     * Description: User can delete monomer (of every type) on third position in antisense chain of sequence (of every configuration) in edit mode
     * Scenario:
     * 1. Clear canvas
     * 2. Load sequence from HELM
     * 3. Switch sequence to edit mode and move cursor to the forth position of antisense chain
     * 4. Press Backspace keyboard key to delete third symbol of antisense chain in seqience
     * 5. Load same sequence again to be able to compare result and sourse sequence
     * 5. Take screenshot to validate that monomer was deleted in Sequence mode
     * 6. Switch to Flex mode
     * 7. Take screenshot to validate that monomer was deleted in Flex mode canvas
     * 8. Add info to log if known bugs exist and skip test
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.LeftAnchoredHELM) || '',
    );
    await selectSequenceLayoutModeTool(page);
    await selectSequenceMode(page, SequenceModeType.RNA);

    await turnIntoEditModeAndPlaceCursorToThePosition(page, {
      position: !sequence.Rotation ? 4 : 8,
      senseOrAntisense: SequenceChainType.Antisense,
      syncEditMode: false,
    });

    await waitForRender(page, async () => {
      await page.keyboard.press('Backspace');
    });

    await clickInTheMiddleOfTheScreen(page);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      (!sequence.Rotation ? sequence.HELM : sequence.LeftAnchoredHELM) || '',
    );
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await selectFlexLayoutModeTool(page);

    await takeEditorScreenshot(page, { hideMonomerPreview: true });

    // skip that test if bug(s) exists
    await checkForKnownBugs(sequence);
  });
}

test(`Case 37. Verify that above and bellow the chains where the caret is placed there are two triangles that indicate that changes occur in both strands`, async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 37
   * Description: Verify that above and bellow the chains where the caret is placed there are two triangles that indicate that changes occur in both strands ( Requirement: 2.1 )
   * Scenario:
   * 1. Clear canvas
   * 2. Load sequence from HELM
   * 3. Switch sequence to edit mode (SYNC is ON) and move cursor to the middle of sense chain
   * 4. Take screenshot to validate presence of triangles
   */
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA2,2:pair-5:pair$$$V2.0',
  );
  await selectSequenceLayoutModeTool(page);

  await turnIntoEditModeAndPlaceCursorToThePosition(page, {
    position: 2,
    senseOrAntisense: SequenceChainType.Sense,
    syncEditMode: true,
  });

  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test(`Case 38. Check that up and down arrows on the keyboard allow the user to switch between adding the typed symbol to one or the other chain - caret for the first or caret for the second chain indicate it`, async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 38
   * Description: Check that up and down arrows on the keyboard allow the user to switch between adding the typed symbol
   *              to one or the other chain - caret for the first or caret for the second chain indicate it ( Requirement: 2.1 )
   * Scenario:
   * 1. Clear canvas
   * 2. Load sequence from HELM
   * 3. Switch sequence to edit mode (SYNC is OFF) and move cursor to the middle of sense chain
   * 4. Take screenshot to validate cursor position in sense chain
   * 5. Press down arrow on the keyboard
   * 6. Take screenshot to validate cursor position in antisense chain
   * 7. Press up arrow on the keyboard
   */
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{R(A)P.R(A)}|RNA2{R(U)P.R(U)}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA2,2:pair-5:pair$$$V2.0',
  );
  await selectSequenceLayoutModeTool(page);

  await turnIntoEditModeAndPlaceCursorToThePosition(page, {
    position: 2,
    senseOrAntisense: SequenceChainType.Sense,
    syncEditMode: true,
  });
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });

  await page.keyboard.press('ArrowDown');
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });

  await page.keyboard.press('ArrowUp');
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test(`Case 39. Check if a line break (enter) is added in SYNC mode ON, both backbone chains should be broken`, async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 39
   * Description: Check if a line break (enter) is added in SYNC mode ON, both backbone chains should be broken ( Requirement: 2.2 )
   * Scenario:
   * 1. Clear canvas
   * 2. Load sequence from HELM
   * 3. Switch sequence to edit mode (SYNC is ON) and move cursor to the middle of sense chain
   * 4. Press Enter on the keyboard
   * 5. Click in the middle of the screen to exit edit mode
   * 6. Take screenshot to validate both backbone chains are broken
   */
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{R(A)P.R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)P.R(U)}$RNA1,RNA2,5:pair-8:pair|RNA1,RNA2,2:pair-11:pair|RNA1,RNA2,8:pair-5:pair|RNA1,RNA2,11:pair-2:pair$$$V2.0',
  );
  await selectSequenceLayoutModeTool(page);

  await turnIntoEditModeAndPlaceCursorToThePosition(page, {
    position: 3,
    senseOrAntisense: SequenceChainType.Sense,
    syncEditMode: true,
  });
  await page.keyboard.press('Enter');
  await clickInTheMiddleOfTheScreen(page);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test(`Case 40. Check if a line break (enter) is added in SYNC mode Off to sense chain, sense chains should be broken`, async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 40
   * Description: Check if a line break (enter) is added in SYNC mode Off to sence chain, sense chains should be broken ( Requirement: 2.2 )
   * Scenario:
   * 1. Clear canvas
   * 2. Load sequence from HELM
   * 3. Switch sequence to edit mode (SYNC is OFF) and move cursor to the middle of sense chain
   * 4. Press Enter on the keyboard
   * 5. Click in the middle of the screen to exit edit mode
   * 6. Take screenshot to validate sence chains is broken
   */
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{R(A)P.R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)P.R(U)}$RNA1,RNA2,5:pair-8:pair|RNA1,RNA2,2:pair-11:pair|RNA1,RNA2,8:pair-5:pair|RNA1,RNA2,11:pair-2:pair$$$V2.0',
  );
  await selectSequenceLayoutModeTool(page);

  await turnIntoEditModeAndPlaceCursorToThePosition(page, {
    position: 3,
    senseOrAntisense: SequenceChainType.Sense,
    syncEditMode: true,
  });
  await page.keyboard.press('Enter');
  await clickInTheMiddleOfTheScreen(page);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test(`Case 41. Check if a line break (enter) is added in SYNC mode Off to sense chain, antisense chains should be broken`, async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 41
   * Description: Check if a line break (enter) is added in SYNC mode Off to sence chain, sense chains should be broken ( Requirement: 2.2 )
   * Scenario:
   * 1. Clear canvas
   * 2. Load sequence from HELM
   * 3. Switch sequence to edit mode (SYNC is OFF) and move cursor to the middle of sense chain
   * 4. Press Enter on the keyboard
   * 5. Click in the middle of the screen to exit edit mode
   * 6. Take screenshot to validate sence chains is broken
   */
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{R(A)P.R(A)P.R(A)P.R(A)}|RNA2{R(U)P.R(U)P.R(U)P.R(U)}$RNA1,RNA2,5:pair-8:pair|RNA1,RNA2,2:pair-11:pair|RNA1,RNA2,8:pair-5:pair|RNA1,RNA2,11:pair-2:pair$$$V2.0',
  );
  await selectSequenceLayoutModeTool(page);

  await turnIntoEditModeAndPlaceCursorToThePosition(page, {
    position: 3,
    senseOrAntisense: SequenceChainType.Antisense,
    syncEditMode: true,
  });
  await page.keyboard.press('Enter');
  await clickInTheMiddleOfTheScreen(page);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});
