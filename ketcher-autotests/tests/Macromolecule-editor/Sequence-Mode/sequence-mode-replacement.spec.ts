/* eslint-disable no-magic-numbers */
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
import { Page, test, BrowserContext, chromium } from '@playwright/test';
import {
  takeEditorScreenshot,
  selectClearCanvasTool,
  waitForIndigoToLoad,
  waitForKetcherInit,
  selectFlexLayoutModeTool,
  openFileAndAddToCanvasMacro,
  selectSequenceLayoutModeTool,
  moveMouseAway,
} from '@utils';

import {
  goToCHEMTab,
  goToPeptidesTab,
  goToRNATab,
} from '@utils/macromolecules/library';
import {
  pressAddToPresetsButton,
  pressNewPresetButton,
  selectBaseSlot,
  selectPhosphateSlot,
  selectSugarSlot,
  toggleBasesAccordion,
  toggleNucleotidesAccordion,
  togglePhosphatesAccordion,
  toggleSugarsAccordion,
} from '@utils/macromolecules/rnaBuilder';
import { clickOnSequenceSymbolByIndex } from '@utils/macromolecules/sequence';

let page: Page;
let sharedContext: BrowserContext;

test.beforeAll(async ({ browser }) => {
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
  // Creation of custom presets needed for testing
  await createTestPresets(page);
});

test.afterEach(async () => {
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Control+0');
  await selectClearCanvasTool(page);
  await page.keyboard.press('Control+0');
});

test.afterAll(async ({ browser }) => {
  await page.close();
  await sharedContext.close();
  await browser.contexts().forEach((someContext) => {
    someContext.close();
  });
});

interface IReplaceMonomer {
  Id: number;
  MonomerType: string;
  MonomerSubType?: string;
  MonomerAlias: string;
  MonomerTestId: string;
  MonomerDescription: string;
}

interface IReplacementPosition {
  LeftEnd: number;
  Center: number;
  RightEnd: number;
}
interface ISequence {
  Id: number;
  FileName: string;
  SequenceName: string;
  ReplacementPositions: IReplacementPosition;
  ConfirmationOnReplecement?: boolean;
  KnownBugs?: boolean;
  Description?: string;
}

interface IFailedTest {
  ReplaceMonomerId?: number;
  SequenceId?: number;
  ReplacementSybolPosition?: number;
  IssueNumber: string;
  Description?: string;
}

const replaceMonomers: IReplaceMonomer[] = [
  {
    Id: 1,
    MonomerType: 'Peptide',
    MonomerAlias: 'Cys_Bn',
    MonomerTestId: 'Cys_Bn___S-benzylcysteine',
    MonomerDescription: 'peptide (Cys_Bn)',
  },
  {
    Id: 2,
    MonomerType: 'RNA',
    MonomerSubType: 'Presets',
    MonomerAlias: 'C',
    MonomerTestId: 'C_C_R_P',
    MonomerDescription: 'preset (C)',
  },
  {
    // Custom preset created at BeforeAll section
    Id: 3,
    MonomerType: 'RNA',
    MonomerSubType: 'Presets',
    MonomerAlias: 'R()P',
    MonomerTestId: 'R()P_._R_P',
    MonomerDescription: 'preset (R()P)',
  },
  {
    // Custom preset created at BeforeAll section
    Id: 4,
    MonomerType: 'RNA',
    MonomerSubType: 'Presets',
    MonomerAlias: 'R(A)',
    MonomerTestId: 'R(A)_A_R_.',
    MonomerDescription: 'preset (R(A))',
  },
  {
    Id: 5,
    MonomerType: 'RNA',
    MonomerSubType: 'Sugars',
    MonomerAlias: 'R',
    MonomerTestId: 'R___Ribose',
    MonomerDescription: 'sugar (R)',
  },
  {
    Id: 6,
    MonomerType: 'RNA',
    MonomerSubType: 'Bases',
    MonomerAlias: 'oC64m5',
    MonomerTestId: 'oC64m5___4-Hexan-6-ol-5-methylcytosine',
    MonomerDescription: 'base (oC64m5)',
  },
  {
    Id: 7,
    MonomerType: 'RNA',
    MonomerSubType: 'Phosphates',
    MonomerAlias: 'P',
    MonomerTestId: 'P___Phosphate',
    MonomerDescription: 'phosphate (P)',
  },
  {
    Id: 8,
    MonomerType: 'RNA',
    MonomerSubType: 'Nucleotides',
    MonomerAlias: 'AmMC6T',
    MonomerTestId: 'AmMC6T___Amino Modifier C6 dT',
    MonomerDescription: 'nucleotide (AmMC6T)',
  },
  {
    // Nucleotide without natural analog
    Id: 9,
    MonomerType: 'RNA',
    MonomerSubType: 'Nucleotides',
    MonomerAlias: '5NitInd',
    MonomerTestId: '5NitInd___5-Nitroindole',
    MonomerDescription: 'nucleotide (5NitInd)',
  },
  {
    Id: 10,
    MonomerType: 'CHEM',
    MonomerAlias: 'Mal',
    MonomerTestId: 'Mal___Maleimide',
    MonomerDescription: 'CHEM (Mal)',
  },
];

const sequences: ISequence[] = [
  {
    Id: 1,
    FileName: 'KET/Sequence-Mode-Replacement/sequence of peptides (A).ket',
    SequenceName: 'sequence of peptides (A)',
    ReplacementPositions: { LeftEnd: 1, Center: 2, RightEnd: 3 },
  },
  {
    Id: 2,
    FileName:
      'KET/Sequence-Mode-Replacement/sequence of peptides w_o natural analog (4Abz).ket',
    SequenceName: 'sequence of peptides w/o natural analog (4Abz)',
    ReplacementPositions: { LeftEnd: 1, Center: 2, RightEnd: 3 },
  },
  {
    Id: 3,
    FileName: 'KET/Sequence-Mode-Replacement/sequence of presets (A).ket',
    SequenceName: 'sequence of presets (A)',
    ReplacementPositions: { LeftEnd: 1, Center: 2, RightEnd: 3 },
  },
  {
    Id: 4,
    FileName:
      'KET/Sequence-Mode-Replacement/sequence of presets without phosphate (SGNA(U)).ket',
    SequenceName: 'sequence of presets without phosphate (SGNA(U))',
    ReplacementPositions: { LeftEnd: 1, Center: 2, RightEnd: 3 },
  },
  {
    Id: 5,
    FileName:
      'KET/Sequence-Mode-Replacement/sequence of presets without base (SGNA()ibun).ket',
    SequenceName: 'sequence of presets without base (SGNA()ibun)',
    ReplacementPositions: { LeftEnd: 1, Center: 3, RightEnd: 5 },
    ConfirmationOnReplecement: true,
    KnownBugs: true,
    Description: 'https://github.com/epam/ketcher/issues/5236',
  },
  {
    Id: 6,
    FileName: 'KET/Sequence-Mode-Replacement/sequence of sugars (UNA).ket',
    SequenceName: 'sequence of sugars (UNA)',
    ReplacementPositions: { LeftEnd: 1, Center: 3, RightEnd: 5 },
    ConfirmationOnReplecement: true,
    KnownBugs: true,
    Description: 'https://github.com/epam/ketcher/issues/5236',
  },
  {
    Id: 7,
    FileName: 'KET/Sequence-Mode-Replacement/sequence of bases (nC6n5U).ket',
    SequenceName: 'sequence of bases (nC6n5U)',
    ReplacementPositions: { LeftEnd: 1, Center: 3, RightEnd: 5 },
    ConfirmationOnReplecement: true,
    KnownBugs: true,
    Description: 'https://github.com/epam/ketcher/issues/5236',
  },
  {
    Id: 8,
    FileName: 'KET/Sequence-Mode-Replacement/sequence of phosphates (moen).ket',
    SequenceName: 'sequence of phosphates (moen)',
    ReplacementPositions: { LeftEnd: 1, Center: 3, RightEnd: 5 },
    ConfirmationOnReplecement: true,
    KnownBugs: true,
    Description: 'https://github.com/epam/ketcher/issues/5236',
  },
  {
    Id: 9,
    FileName:
      'KET/Sequence-Mode-Replacement/sequence of unsplit nucleotides (2-Amino-dA).ket',
    SequenceName: 'sequence of unsplit nucleotides (2-Amino-dA)',
    ReplacementPositions: { LeftEnd: 1, Center: 2, RightEnd: 3 },
  },
  {
    Id: 10,
    FileName:
      'KET/Sequence-Mode-Replacement/sequence of unsplit nucleotides w_o natural analog (5NitInd).ket',
    SequenceName:
      'sequence of unsplit nucleotides w/o natural analog (5NitInd)',
    ReplacementPositions: { LeftEnd: 1, Center: 2, RightEnd: 3 },
    KnownBugs: true,
    Description: 'https://github.com/epam/ketcher/issues/5240',
  },
  {
    Id: 11,
    FileName: 'KET/Sequence-Mode-Replacement/sequence of CHEMs (A6OH).ket',
    SequenceName: 'sequence of CHEMs (A6OH)',
    ReplacementPositions: { LeftEnd: 1, Center: 3, RightEnd: 5 },
    ConfirmationOnReplecement: true,
    KnownBugs: true,
    Description: 'https://github.com/epam/ketcher/issues/5240',
  },
  {
    Id: 12,
    FileName:
      'KET/Sequence-Mode-Replacement/sequence of unresolved nucleotide (5Unres).ket',
    SequenceName: 'sequence of unresolved nucleotide (5Unres)',
    ReplacementPositions: { LeftEnd: 1, Center: 2, RightEnd: 3 },
  },
];

const FailedTests: IFailedTest[] = [
  {
    SequenceId: 5,
    IssueNumber: 'https://github.com/epam/ketcher/issues/5236',
    Description:
      '@A@A@ should go to CCCA@A@ if we replace first sybol on A monomer - all monomers wrapped into @ have to be replaced',
  },
];

async function createTestPresets(page: Page) {
  await goToRNATab(page);

  // Create preset without base
  await pressNewPresetButton(page);
  await selectSugarSlot(page);
  await page.getByTestId('R___Ribose').click();
  await moveMouseAway(page);
  await selectPhosphateSlot(page);
  await page.getByTestId('P___Phosphate').click();
  await moveMouseAway(page);
  await pressAddToPresetsButton(page);

  // Create preset without phosphate
  await pressNewPresetButton(page);
  await selectSugarSlot(page);
  await page.getByTestId('R___Ribose').click();
  await moveMouseAway(page);
  await selectBaseSlot(page);
  await page.getByTestId('A___Adenine').click();
  await moveMouseAway(page);
  await pressAddToPresetsButton(page);
}

async function clickOnMonomerFromLibrary(page: Page, monomer: IReplaceMonomer) {
  switch (monomer.MonomerType) {
    case 'Peptide':
      await goToPeptidesTab(page);
      break;
    case 'RNA':
      await goToRNATab(page);
      switch (monomer.MonomerSubType) {
        case 'Presets':
          // await togglePresetsAccordion(page);
          break;
        case 'Sugars':
          await toggleSugarsAccordion(page);
          break;
        case 'Bases':
          await toggleBasesAccordion(page);
          break;
        case 'Phosphates':
          await togglePhosphatesAccordion(page);
          break;
        case 'Nucleotides':
          await toggleNucleotidesAccordion(page);
          break;
        default:
          throw new Error(
            `Tab with name "${monomer.MonomerSubType}" not found.`,
          );
      }
      break;
    case 'CHEM':
      await goToCHEMTab(page);
      break;
    default:
      throw new Error(`Tab with name "${monomer.MonomerType}" not found.`);
  }
  await page.getByTestId(monomer.MonomerTestId).click();
}

async function selectAndReplaceSymbol(
  page: Page,
  replaceMonomer: IReplaceMonomer,
  sequence: ISequence,
  replacementPosition: number,
) {
  await selectSequenceLayoutModeTool(page);
  await clickOnSequenceSymbolByIndex(page, replacementPosition);
  await clickOnMonomerFromLibrary(page, replaceMonomer);
  if (sequence.ConfirmationOnReplecement) {
    await page.getByRole('button', { name: 'Yes' }).click();
  }
  await moveMouseAway(page);
}

function addAnnotation(message: string) {
  test.info().annotations.push({ type: 'WARNING', description: message });
}

async function checkForKnownBugs(
  replaceMonomer: IReplaceMonomer,
  sequence: ISequence,
  replacementPosition: number,
) {
  if (sequence.KnownBugs) {
    addAnnotation(
      `That test works wrong because of bug(s): ${sequence.Description}`,
    );
    addAnnotation(
      `If all bugs has been fixed - screenshots have to be updated, sequence at sequences have to be corrected.`,
    );
    addAnnotation(`SequenceId: ${sequence.Id}`);
    addAnnotation(`ReplaceMonomerId: ${replaceMonomer.Id}`);
    addAnnotation(`ReplacementPosition: ${replacementPosition}`);
    test.info().fixme();
  }
}

for (const replaceMonomer of replaceMonomers) {
  for (const sequence of sequences) {
    test(`1-${sequence.Id}-${replaceMonomer.Id}. Replace first symbol at ${sequence.SequenceName} on ${replaceMonomer.MonomerDescription}`, async () => {
      /*
        Test case: https://github.com/epam/ketcher/issues/5290 - Test case 1
        Description: User can replace first symbol (of every type) in sequence with another monomer (of every type) in viev mode
        Scenario:
        1. Clear canvas
        2. Load sequence from file (sequence contains monomers of nessussary type)
        3. Select first symbol
        4. Click on monomer from the library
        5. Take screenshot to validate that replacement work in Sequence mode canvas
        6. Switch to Flex mode
        7. Take screenshot to validate that replacement work in Flex mode canvas
        8. Add info to log if known bugs exist and skip test
      */
      await openFileAndAddToCanvasMacro(sequence.FileName, page);
      await selectAndReplaceSymbol(
        page,
        replaceMonomer,
        sequence,
        sequence.ReplacementPositions.LeftEnd,
      );
      await takeEditorScreenshot(page);
      await selectFlexLayoutModeTool(page);
      await takeEditorScreenshot(page);

      // skip that test if bug(s) exists
      await checkForKnownBugs(
        replaceMonomer,
        sequence,
        sequence.ReplacementPositions.LeftEnd,
      );
    });
  }
}

for (const replaceMonomer of replaceMonomers) {
  for (const sequence of sequences) {
    test(`2-${sequence.Id}-${replaceMonomer.Id}. Replace center symbol at ${sequence.SequenceName} on ${replaceMonomer.MonomerDescription}`, async () => {
      /*
        Test case: https://github.com/epam/ketcher/issues/5290 - Test case 2
        Description: User can replace symbol (of every type) in the midle of sequence with another monomer (of every type) in viev mode
        Scenario:
        1. Clear canvas
        2. Load sequence from file (sequence contains monomers of nessussary type)
        3. Select symbol in the meddle of sequence
        4. Click on monomer from the library
        5. Take screenshot to validate that replacement work in Sequence mode canvas
        6. Switch to Flex mode
        7. Take screenshot to validate that replacement work in Flex mode canvas
        8. Add info to log if known bugs exist and skip test
      */
      await openFileAndAddToCanvasMacro(sequence.FileName, page);
      await selectAndReplaceSymbol(
        page,
        replaceMonomer,
        sequence,
        sequence.ReplacementPositions.Center,
      );
      await takeEditorScreenshot(page);
      await selectFlexLayoutModeTool(page);
      await takeEditorScreenshot(page);

      // skip that test if bug(s) exists
      await checkForKnownBugs(
        replaceMonomer,
        sequence,
        sequence.ReplacementPositions.Center,
      );
    });
  }
}

for (const replaceMonomer of replaceMonomers) {
  for (const sequence of sequences) {
    test(`3-${sequence.Id}-${replaceMonomer.Id}. Replace last symbol at ${sequence.SequenceName} on ${replaceMonomer.MonomerDescription}`, async () => {
      /*
          Test case: https://github.com/epam/ketcher/issues/5290 - Test case 3
          Description: User can replace end symbol (of every type) in the sequence with another monomer (of every type) in viev mode
          Scenario:
          1. Clear canvas
          2. Load sequence from file (sequence contains monomers of nessussary type)
          3. Select last symbol in the sequence
          4. Click on monomer from the library
          5. Take screenshot to validate that replacement work in Sequence mode canvas
          6. Switch to Flex mode
          7. Take screenshot to validate that replacement work in Flex mode canvas
          8. Add info to log if known bugs exist and skip test
        */
      await openFileAndAddToCanvasMacro(sequence.FileName, page);
      await selectAndReplaceSymbol(
        page,
        replaceMonomer,
        sequence,
        sequence.ReplacementPositions.RightEnd,
      );
      await takeEditorScreenshot(page);
      await selectFlexLayoutModeTool(page);
      await takeEditorScreenshot(page);

      // skip that test if bug(s) exists
      await checkForKnownBugs(
        replaceMonomer,
        sequence,
        sequence.ReplacementPositions.RightEnd,
      );
    });
  }
}
