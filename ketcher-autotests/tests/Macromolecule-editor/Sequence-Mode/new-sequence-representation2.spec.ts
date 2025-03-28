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

interface ISequence {
  Id: number;
  HELM?: string;
  KET?: string;
  SequenceName: string;
  Rotation?: boolean;
  LeftAnchoredHELM?: string;
  RightAnchoredHELM?: string;
}

interface IFailedTestSequenceReplaceMonomer {
  TestNameContains?: string[];
  SequenceId?: number[];
  MonomerId?: number[];
  BugsInTests: string[];
}

const FailedTestNewSequenceRepresentation: IFailedTestSequenceReplaceMonomer[] =
  [
    // {
    //   // Adding monomet to first from the left position of antisense chain works wrong and causes exception:
    //   //Uncaught TypeError: Cannot read properties of undefined (reading 'chain') #6775
    //   TestNameContains: ['Case 27-'],
    //   BugsInTests: ['https://github.com/epam/ketcher/issues/6775'],
    // },
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

const sequencesForAddingDash: ISequence[] = [
  {
    Id: 1,
    SequenceName: '(RNA nucleotide(A))-(RNA nucleotide(A)',
    HELM: `RNA1{R(A)P.R(A)P}|PEPTIDE1{D.D}|RNA2{R(U)P.R(U)P}|PEPTIDE2{D}|PEPTIDE3{D}$PEPTIDE1,RNA1,2:R2-1:R1|RNA1,RNA2,5:pair-2:pair|RNA1,RNA2,2:pair-5:pair|RNA1,PEPTIDE2,6:R2-1:R1|RNA2,PEPTIDE3,6:R2-1:R1$$$V2.0`,
  },
  {
    Id: 2,
    SequenceName: '(RNA nucleoside(A))-(RNA nucleotide(A)',
    HELM: `RNA1{R(A)}|RNA2{R(A)P}|PEPTIDE1{D.D}|PEPTIDE2{D}|RNA3{R(U)}|RNA4{R(U)}$PEPTIDE1,RNA1,2:R2-1:R1|RNA1,RNA2,1:R2-1:R1|RNA2,PEPTIDE2,3:R2-1:R1|RNA2,RNA3,2:pair-2:pair|RNA3,RNA4,1:R2-1:R1|RNA1,RNA4,2:pair-2:pair$$$V2.0`,
  },
  {
    Id: 3,
    SequenceName: '(Peptide( E ))-(RNA nucleotide(A)',
    HELM: `PEPTIDE1{D.D.E}|RNA1{R(A)}|RNA2{R(U)P}|PEPTIDE2{E}$PEPTIDE1,RNA1,3:R2-1:R1|RNA1,RNA2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-1:pair|RNA2,PEPTIDE2,3:R2-1:R1$$$V2.0`,
  },
  {
    Id: 4,
    SequenceName: '(Sugar(12ddR))-(RNA nucleotide(A)',
    HELM: `RNA1{[12ddR]}|RNA2{R(A)P}|PEPTIDE1{D.D}|RNA3{R(U)P.[12ddR]}|PEPTIDE2{D}$PEPTIDE1,RNA1,2:R2-1:R1|RNA1,RNA2,1:R2-1:R1|RNA2,RNA3,2:pair-2:pair|RNA1,RNA3,1:pair-4:pair|RNA2,PEPTIDE2,3:R2-1:R1$$$V2.0`,
  },
  {
    Id: 5,
    SequenceName: '(Phosphate(cmp))-(RNA nucleotide(A)',
    HELM: `RNA1{[cmp].R(A)P}|PEPTIDE1{D.D}|RNA2{R(U)P}|RNA3{[cmp]}|PEPTIDE2{D}$PEPTIDE1,RNA1,2:R2-1:R1|RNA1,RNA2,3:pair-2:pair|RNA1,RNA3,1:pair-1:pair|RNA1,PEPTIDE2,4:R2-1:R1|RNA2,RNA3,3:R2-1:R1$$$V2.0`,
  },
  {
    Id: 6,
    SequenceName: '(CHEM(4aPEGMal))-(RNA nucleotide(A)',
    HELM: `CHEM1{[4aPEGMal]}|RNA1{R(A)P}|PEPTIDE1{D.D}|RNA2{R(U)P}|CHEM2{[4aPEGMal]}|PEPTIDE2{D}$PEPTIDE1,CHEM1,2:R2-1:R1|CHEM1,RNA1,1:R2-1:R1|RNA1,RNA2,2:pair-2:pair|CHEM1,CHEM2,1:pair-1:pair|RNA1,PEPTIDE2,3:R2-1:R1|RNA2,CHEM2,3:R2-1:R1$$$V2.0`,
  },
  {
    Id: 7,
    SequenceName: '(Unsplit nucleotide(5Br-dU))-(RNA nucleotide(A)',
    HELM: `RNA1{[5Br-dU].R(A)P}|PEPTIDE1{D.D}|RNA2{R(U)P}|RNA3{[5Br-dU]}|PEPTIDE2{D}$RNA1,RNA2,3:pair-2:pair|PEPTIDE1,RNA1,2:R2-1:R1|RNA1,PEPTIDE2,4:R2-1:R1|RNA2,RNA3,3:R2-1:R1|RNA1,RNA3,1:pair-1:pair$$$V2.0`,
  },
  {
    Id: 8,
    SequenceName: '(MicroMolecule)-(RNA nucleotide(A)',
    HELM: `RNA1{R(A)P}|PEPTIDE1{D.D}|RNA2{R(U)P}|CHEM1{[C1(=CC([*:2])=CC=C1)[*:1] |$;;;_R2;;;;_R1$|]}|CHEM2{[C1(=CC([*:2])=CC=C1)[*:1] |$;;;_R2;;;;_R1$|]}|PEPTIDE2{D}$RNA1,RNA2,2:pair-2:pair|PEPTIDE1,CHEM1,2:R2-1:R1|CHEM1,RNA1,1:R2-1:R1|RNA1,PEPTIDE2,3:R2-1:R1|RNA2,CHEM2,3:R2-1:R1|CHEM1,CHEM2,1:pair-1:pair$$$V2.0`,
  },
  {
    Id: 9,
    SequenceName: '(Unknown Monomer)-(RNA nucleotide(A)',
    HELM: `CHEM1{*}|RNA1{R(A)P}|PEPTIDE1{D.D}|RNA2{R(U)P}|CHEM2{*}|PEPTIDE2{D}$PEPTIDE1,CHEM1,2:R2-1:R1|CHEM1,RNA1,1:R2-1:R1|RNA1,RNA2,2:pair-2:pair|RNA1,PEPTIDE2,3:R2-1:R1|RNA2,CHEM2,3:R2-1:R1|CHEM1,CHEM2,1:pair-1:pair$$$V2.0`,
  },
  {
    Id: 10,
    SequenceName: '(RNA nucleotide(A))-(RNA nucleoside(A)',
    HELM: `RNA1{R(A)P.R(A)}|PEPTIDE1{D.D}|RNA2{R(U)P}|RNA3{R(U)}|PEPTIDE2{D}$PEPTIDE1,RNA1,2:R2-1:R1|RNA1,RNA3,5:pair-2:pair|RNA3,RNA2,1:R2-1:R1|RNA2,PEPTIDE2,3:R2-1:R1|RNA1,RNA2,2:pair-2:pair$$$V2.0`,
  },
  {
    Id: 11,
    SequenceName: '(RNA nucleoside(A))-(RNA nucleoside(A)',
    HELM: `RNA1{R(A)}|PEPTIDE1{D.D}|RNA2{R(U)}|RNA3{R(A)}|RNA4{R(U)}$PEPTIDE1,RNA1,2:R2-1:R1|RNA1,RNA3,1:R2-1:R1|RNA4,RNA2,1:R2-1:R1|RNA3,RNA4,2:pair-2:pair|RNA1,RNA2,2:pair-2:pair$$$V2.0`,
  },
  {
    Id: 12,
    SequenceName: '(Peptide( E ))-(RNA nucleoside(A)',
    HELM: `PEPTIDE1{D.D.E}|PEPTIDE2{E}|RNA1{R(A)}|RNA2{R(U)}$RNA1,RNA2,2:pair-2:pair|PEPTIDE1,RNA1,3:R2-1:R1|PEPTIDE2,RNA2,1:R1-1:R2|PEPTIDE1,PEPTIDE2,3:pair-1:pair$$$V2.0`,
  },
  {
    Id: 13,
    SequenceName: '(Sugar(12ddR))-(RNA nucleoside(A)',
    HELM: `RNA1{[12ddR]}|PEPTIDE1{D.D}|RNA2{[12ddR]}|RNA3{R(A)}|RNA4{R(U)}$PEPTIDE1,RNA1,2:R2-1:R1|RNA3,RNA4,2:pair-2:pair|RNA1,RNA3,1:R2-1:R1|RNA4,RNA2,1:R2-1:R1|RNA1,RNA2,1:pair-1:pair$$$V2.0`,
  },
  {
    Id: 14,
    SequenceName: '(Phosphate(cmp))-(RNA nucleoside(A)',
    HELM: `RNA1{[cmp].R(A)}|PEPTIDE1{D.D}|RNA2{R(U)[cmp]}$PEPTIDE1,RNA1,2:R2-1:R1|RNA1,RNA2,3:pair-2:pair|RNA1,RNA2,1:pair-3:pair$$$V2.0`,
  },
  {
    Id: 15,
    SequenceName: '(CHEM(4aPEGMal))-(RNA nucleoside(A)',
    HELM: `CHEM1{[4aPEGMal]}|PEPTIDE1{D.D}|CHEM2{[4aPEGMal]}|RNA1{R(A)}|RNA2{R(U)}$PEPTIDE1,CHEM1,2:R2-1:R1|RNA1,RNA2,2:pair-2:pair|CHEM1,RNA1,1:R2-1:R1|RNA2,CHEM2,1:R2-1:R1|CHEM1,CHEM2,1:pair-1:pair$$$V2.0`,
  },
  {
    Id: 16,
    SequenceName: '(Unsplit nucleotide(5Br-dU))-(RNA nucleoside(A)',
    HELM: `RNA1{[5Br-dU].R(A)}|PEPTIDE1{D.D}|RNA2{[5Br-dU]}|RNA3{R(U)}$PEPTIDE1,RNA1,2:R2-1:R1|RNA1,RNA3,3:pair-2:pair|RNA3,RNA2,1:R2-1:R1|RNA1,RNA2,1:pair-1:pair$$$V2.0`,
  },
  {
    Id: 17,
    SequenceName: '(MicroMolecule)-(RNA nucleoside(A)',
    HELM: `PEPTIDE1{D.D}|RNA1{R(A)}|RNA2{R(U)}|CHEM1{[C1(=CC([*:2])=CC=C1)[*:1] |$;;;_R2;;;;_R1$|]}|CHEM2{[C1(=CC([*:2])=CC=C1)[*:1] |$;;;_R2;;;;_R1$|]}$RNA1,RNA2,2:pair-2:pair|RNA2,CHEM2,1:R2-1:R1|PEPTIDE1,CHEM1,2:R2-1:R1|CHEM1,RNA1,1:R2-1:R1|CHEM1,CHEM2,1:pair-1:pair$$$V2.0`,
  },
  {
    Id: 18,
    SequenceName: '(Unknown Monomer)-(RNA nucleoside(A)',
    HELM: `CHEM1{*}|PEPTIDE1{D.D}|CHEM2{*}|RNA1{R(A)}|RNA2{R(U)}$PEPTIDE1,CHEM1,2:R2-1:R1|RNA1,RNA2,2:pair-2:pair|CHEM1,RNA1,1:R2-1:R1|RNA2,CHEM2,1:R2-1:R1|CHEM1,CHEM2,1:pair-1:pair$$$V2.0`,
  },
  {
    Id: 19,
    SequenceName: '(RNA nucleotide(A))-(RNA nucleoside(A)',
    HELM: `RNA1{R(A)P.R(A)}|PEPTIDE1{D.D}|PEPTIDE2{D}|RNA2{R(U)}|RNA3{R(U)P}|PEPTIDE3{D}$PEPTIDE1,RNA1,2:R2-1:R1|RNA1,PEPTIDE2,4:R2-1:R1|RNA1,RNA2,5:pair-2:pair|RNA1,RNA3,2:pair-2:pair|RNA2,RNA3,1:R2-1:R1|RNA3,PEPTIDE3,3:R2-1:R1$$$V2.0`,
  },
  {
    Id: 20,
    SequenceName: '(RNA nucleotide(A))-(Peptide( E )',
    HELM: `PEPTIDE1{E}|RNA1{R(A)P}|PEPTIDE2{D.D}|RNA2{R(U)P}|PEPTIDE3{E}|PEPTIDE4{D}$RNA1,RNA2,2:pair-2:pair|PEPTIDE2,RNA1,2:R2-1:R1|PEPTIDE3,RNA2,1:R2-1:R1|RNA1,PEPTIDE1,3:R2-1:R1|PEPTIDE1,PEPTIDE3,1:pair-1:pair|RNA2,PEPTIDE4,3:R2-1:R1$$$V2.0`,
  },
  {
    Id: 21,
    SequenceName: '(RNA nucleotide(A))-(Sugar(12ddR)',
    HELM: `RNA1{R(A)P.[12ddR]}|PEPTIDE1{D.D}|RNA2{[12ddR]}|RNA3{R(U)P}|PEPTIDE2{D}$RNA1,RNA3,2:pair-2:pair|PEPTIDE1,RNA1,2:R2-1:R1|RNA2,RNA3,1:R2-1:R1|RNA1,RNA2,4:pair-1:pair|RNA3,PEPTIDE2,3:R2-1:R1$$$V2.0`,
  },
  {
    Id: 22,
    SequenceName: '(RNA nucleotide(A))-(Phosphate(cmp)',
    HELM: `RNA1{[cmp]}|RNA2{R(A)P}|PEPTIDE1{D.D}|RNA3{[cmp].R(U)P}|PEPTIDE2{D}$RNA2,RNA3,2:pair-3:pair|PEPTIDE1,RNA2,2:R2-1:R1|RNA2,RNA1,3:R2-1:R1|RNA3,PEPTIDE2,4:R2-1:R1|RNA1,RNA3,1:pair-1:pair$$$V2.0`,
  },
  {
    Id: 23,
    SequenceName: '(RNA nucleotide(A))-(CHEM(4aPEGMal)',
    HELM: `CHEM1{[4aPEGMal]}|RNA1{R(A)P}|PEPTIDE1{D.D}|RNA2{R(U)P}|CHEM2{[4aPEGMal]}|PEPTIDE2{D}$RNA1,RNA2,2:pair-2:pair|PEPTIDE1,RNA1,2:R2-1:R1|RNA1,CHEM1,3:R2-1:R1|CHEM2,RNA2,1:R2-1:R1|RNA2,PEPTIDE2,3:R2-1:R1|CHEM1,CHEM2,1:pair-1:pair$$$V2.0`,
  },
  {
    Id: 24,
    SequenceName: '(RNA nucleotide(A))-(Unsplit nucleotide(5Br-dU)',
    HELM: `RNA1{[5Br-dU]}|RNA2{R(A)P}|PEPTIDE1{D.D}|RNA3{[5Br-dU].R(U)P}|PEPTIDE2{D}$RNA2,RNA3,2:pair-3:pair|PEPTIDE1,RNA2,2:R2-1:R1|RNA2,RNA1,3:R2-1:R1|RNA3,PEPTIDE2,4:R2-1:R1|RNA1,RNA3,1:pair-1:pair$$$V2.0`,
  },
  {
    Id: 25,
    SequenceName: '(RNA nucleotide(A))-(MicroMolecule',
    HELM: `RNA1{R(A)P}|PEPTIDE1{D.D}|RNA2{R(U)P}|CHEM1{[C1(=CC([*:2])=CC=C1)[*:1] |$;;;_R2;;;;_R1$|]}|CHEM2{[C1(=CC([*:2])=CC=C1)[*:1] |$;;;_R2;;;;_R1$|]}|PEPTIDE2{D}$RNA1,RNA2,2:pair-2:pair|PEPTIDE1,RNA1,2:R2-1:R1|RNA1,CHEM1,3:R2-1:R1|RNA2,PEPTIDE2,3:R2-1:R1|CHEM1,CHEM2,1:pair-1:pair|RNA2,CHEM2,1:R1-1:R2$$$V2.0`,
  },
  {
    Id: 26,
    SequenceName: '(RNA nucleotide(A))-(Unknown Monomer',
    HELM: `RNA1{R(A)P}|PEPTIDE1{D.D}|RNA2{R(U)P}|CHEM1{*}|CHEM2{*}|PEPTIDE2{D}$RNA1,RNA2,2:pair-2:pair|PEPTIDE1,RNA1,2:R2-1:R1|RNA1,CHEM2,3:R2-1:R1|CHEM1,RNA2,1:R2-1:R1|RNA2,PEPTIDE2,3:R2-1:R1|CHEM2,CHEM1,1:pair-1:pair$$$V2.0`,
  },
  {
    Id: 27,
    SequenceName: '(RNA nucleoside(A))-(RNA nucleotide(A)',
    HELM: `RNA1{R(A)}|PEPTIDE1{D.D}|RNA2{R(U)P.R(U)}|RNA3{R(A)P}|PEPTIDE2{D}$PEPTIDE1,RNA1,2:R2-1:R1|RNA1,RNA3,1:R2-1:R1|RNA1,RNA2,2:pair-5:pair|RNA3,PEPTIDE2,3:R2-1:R1|RNA3,RNA2,2:pair-2:pair$$$V2.0`,
  },
  {
    Id: 28,
    SequenceName: '(RNA nucleoside(A))-(RNA nucleoside(A)',
    HELM: `RNA1{R(A)}|PEPTIDE1{D.D}|RNA2{R(U)}|RNA3{R(A)}|RNA4{R(U)}$PEPTIDE1,RNA1,2:R2-1:R1|RNA1,RNA3,1:R2-1:R1|RNA4,RNA2,1:R2-1:R1|RNA3,RNA4,2:pair-2:pair|RNA1,RNA2,2:pair-2:pair$$$V2.0`,
  },
  {
    Id: 29,
    SequenceName: '(RNA nucleoside(A))-(Peptide( E )',
    HELM: `PEPTIDE1{E}|PEPTIDE2{D.D}|PEPTIDE3{E}|RNA1{R(A)}|RNA2{R(U)}$RNA1,RNA2,2:pair-2:pair|RNA1,PEPTIDE1,1:R2-1:R1|PEPTIDE2,RNA1,2:R2-1:R1|PEPTIDE3,RNA2,1:R2-1:R1|PEPTIDE1,PEPTIDE3,1:pair-1:pair$$$V2.0`,
  },
  {
    Id: 30,
    SequenceName: '(RNA nucleoside(A))-(Sugar(12ddR)',
    HELM: `RNA1{[12ddR]}|PEPTIDE1{D.D}|RNA2{[12ddR]}|RNA3{R(A)}|RNA4{R(U)}$RNA3,RNA4,2:pair-2:pair|PEPTIDE1,RNA3,2:R2-1:R1|RNA3,RNA1,1:R2-1:R1|RNA2,RNA4,1:R2-1:R1|RNA1,RNA2,1:pair-1:pair$$$V2.0`,
  },
  {
    Id: 31,
    SequenceName: '(RNA nucleoside(A))-(Phosphate(cmp)',
    HELM: `RNA1{R(A)[cmp]}|PEPTIDE1{D.D}|RNA2{[cmp].R(U)}$RNA1,RNA2,2:pair-3:pair|PEPTIDE1,RNA1,2:R2-1:R1|RNA1,RNA2,3:pair-1:pair$$$V2.0`,
  },
  {
    Id: 32,
    SequenceName: '(RNA nucleoside(A))-(CHEM(4aPEGMal)',
    HELM: `CHEM1{[4aPEGMal]}|PEPTIDE1{D.D}|CHEM2{[4aPEGMal]}|RNA1{R(A)}|RNA2{R(U)}$RNA1,RNA2,2:pair-2:pair|PEPTIDE1,RNA1,2:R2-1:R1|RNA1,CHEM1,1:R2-1:R1|CHEM2,RNA2,1:R2-1:R1|CHEM1,CHEM2,1:pair-1:pair$$$V2.0`,
  },
  {
    Id: 33,
    SequenceName: '(RNA nucleoside(A))-(Unsplit nucleotide(5Br-dU)',
    HELM: `RNA1{[5Br-dU]}|PEPTIDE1{D.D}|RNA2{[5Br-dU].R(U)}|RNA3{R(A)}$RNA3,RNA2,2:pair-3:pair|PEPTIDE1,RNA3,2:R2-1:R1|RNA3,RNA1,1:R2-1:R1|RNA1,RNA2,1:pair-1:pair$$$V2.0`,
  },
  {
    Id: 34,
    SequenceName: '(RNA nucleoside(A))-(MicroMolecule',
    HELM: `PEPTIDE1{D.D}|RNA1{R(A)}|RNA2{R(U)}|CHEM1{[C1(=CC([*:2])=CC=C1)[*:1] |$;;;_R2;;;;_R1$|]}|CHEM2{[C1(=CC([*:2])=CC=C1)[*:1] |$;;;_R2;;;;_R1$|]}$RNA1,RNA2,2:pair-2:pair|RNA1,CHEM1,1:R2-1:R1|PEPTIDE1,RNA1,2:R2-1:R1|CHEM2,RNA2,1:R2-1:R1|CHEM1,CHEM2,1:pair-1:pair$$$V2.0`,
  },
  {
    Id: 35,
    SequenceName: '(RNA nucleoside(A))-(Unknown Monomer',
    HELM: `CHEM1{*}|PEPTIDE1{D.D}|RNA1{R(A)}|RNA2{R(U)}|CHEM2{*}$RNA1,RNA2,2:pair-2:pair|PEPTIDE1,RNA1,2:R2-1:R1|RNA1,CHEM1,1:R2-1:R1|CHEM2,RNA2,1:R2-1:R1|CHEM1,CHEM2,1:pair-1:pair$$$V2.0`,
  },
];

for (const sequence of sequencesForAddingDash) {
  test(`Case 42-${sequence.Id}. Adding dash between pair of ${sequence.SequenceName} in sense chain`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 42
     * Description: Check if a line (minus) is added to one side of the sense chain the backbone of the antisense chain should be broken ( see mockups Requirement: 2.3 )
     * Scenario:
     * 1. Clear canvas
     * 2. Load sequence from HELM
     * 3. Switch sequence to edit mode and move cursor to the forth position of sense chain (between target pair of monoemrs)
     * 4. Press minus(dash) keyboard key
     * 5. Load same sequence again to be able to compare result and sourse sequence
     * 6. Take screenshot to validate that backbone of the antisense chain was broken
     * 7. Switch to Flex mode
     * 8. Take screenshot to validate same on flex mode
     * 9. Add info to log if known bugs exist and skip test
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      sequence.HELM || '',
    );
    await selectSequenceLayoutModeTool(page);

    await turnIntoEditModeAndPlaceCursorToThePosition(page, {
      position: 4,
      senseOrAntisense: SequenceChainType.Sense,
      syncEditMode: false,
    });

    await waitForRender(page, async () => {
      await page.keyboard.press('Minus');
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

for (const sequence of sequencesForAddingDash) {
  test(`Case 43-${sequence.Id}. Adding dash between pair of ${sequence.SequenceName} in antisense chain`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 43
     * Description: Check if a line (minus) is added to one side of the antisense chain the backbone of the sense chain should be broken ( see mockups Requirement: 2.3 )
     * Scenario:
     * 1. Clear canvas
     * 2. Load sequence from HELM
     * 3. Switch sequence to edit mode and move cursor to the forth position of antisense chain (between target pair of monoemrs)
     * 4. Press minus(dash) keyboard key
     * 5. Load same sequence again to be able to compare result and sourse sequence
     * 6. Take screenshot to validate that backbone of the antisense chain was broken
     * 7. Switch to Flex mode
     * 8. Take screenshot to validate same on flex mode
     * 9. Add info to log if known bugs exist and skip test
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      sequence.HELM || '',
    );
    await selectSequenceLayoutModeTool(page);

    await turnIntoEditModeAndPlaceCursorToThePosition(page, {
      position: 4,
      senseOrAntisense: SequenceChainType.Antisense,
      syncEditMode: false,
    });

    await waitForRender(page, async () => {
      await page.keyboard.press('Minus');
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

test(`Case 44. Check that a line can not be added if at any of the four positions around the caret there is a gap - just like when the user enters some unsupported symbol - nothing happens`, async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 43
   * Description: Check that a line can not be added if at any of the four positions around the caret there is a gap - just like when the user enters some unsupported symbol - nothing happens ( Requirement: 2.3 )
   * Scenario:
   * 1. Clear canvas
   * 2. Load sequence from HELM
   * 3. Switch sequence to edit mode and move cursor to the second position of sense chain (before the dash)
   * 4. Press minus(dash) keyboard key
   * 5. Take screenshot to validate that nothing happened
   * 6. Switch sequence to edit mode and move cursor to the third position of sense chain (after the dash)
   * 7. Press minus(dash) keyboard key
   * 8. Take screenshot to validate that nothing happened
   * 9. Switch sequence to edit mode and move cursor to the second position of antisense chain (before the gap)
   * 10. Press minus(dash) keyboard key
   * 11. Take screenshot to validate that nothing happened
   * 12. Switch sequence to edit mode and move cursor to the third position of antisense chain (after the gap)
   * 13. Press minus(dash) keyboard key
   * 14. Take screenshot to validate that nothing happened
   */
  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{R(A)P.R(A)}|RNA2{R(U)}|RNA3{R(U)}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA3,2:pair-2:pair$$$V2.0',
  );
  await selectSequenceLayoutModeTool(page);

  await turnIntoEditModeAndPlaceCursorToThePosition(page, {
    position: 2,
    senseOrAntisense: SequenceChainType.Sense,
    syncEditMode: false,
  });
  await waitForRender(page, async () => {
    await page.keyboard.press('Minus');
  });
  await clickInTheMiddleOfTheScreen(page);
  await takeEditorScreenshot(page, { hideMonomerPreview: true });

  await turnIntoEditModeAndPlaceCursorToThePosition(page, {
    position: 3,
    senseOrAntisense: SequenceChainType.Sense,
    syncEditMode: false,
  });
  await waitForRender(page, async () => {
    await page.keyboard.press('Minus');
  });
  await clickInTheMiddleOfTheScreen(page);
  await takeEditorScreenshot(page, { hideMonomerPreview: true });

  await turnIntoEditModeAndPlaceCursorToThePosition(page, {
    position: 2,
    senseOrAntisense: SequenceChainType.Antisense,
    syncEditMode: false,
  });
  await waitForRender(page, async () => {
    await page.keyboard.press('Minus');
  });
  await clickInTheMiddleOfTheScreen(page);
  await takeEditorScreenshot(page, { hideMonomerPreview: true });

  await turnIntoEditModeAndPlaceCursorToThePosition(page, {
    position: 3,
    senseOrAntisense: SequenceChainType.Antisense,
    syncEditMode: false,
  });
  await waitForRender(page, async () => {
    await page.keyboard.press('Minus');
  });
  await clickInTheMiddleOfTheScreen(page);
  await takeEditorScreenshot(page, { hideMonomerPreview: true });
});
