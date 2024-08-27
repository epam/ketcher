/* eslint-disable no-magic-numbers */
import {
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
} from '@utils/macromolecules';
import { Page, test, BrowserContext, chromium, expect } from '@playwright/test';
import {
  takeEditorScreenshot,
  selectClearCanvasTool,
  waitForIndigoToLoad,
  waitForKetcherInit,
  selectFlexLayoutModeTool,
  openFileAndAddToCanvasMacro,
  selectSequenceLayoutModeTool,
  receiveFileComparisonData,
  moveMouseAway,
  moveMouseToTheMiddleOfTheScreen,
  getMolfile,
  getSequence,
  getIdt,
  getFasta,
  getKet,
  saveToFile,
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
import {
  clickOnSequenceSymbolByIndex,
  doubleClickOnSequenceSymbolByIndex,
  pressCancelInConfirmYourActionDialog,
  pressYesInConfirmYourActionDialog,
} from '@utils/macromolecules/sequence';
import { pressUndoButton } from '@utils/macromolecules/topToolBar';
import { pageReload } from '@utils/common/helpers';

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
  // ShouldFail?: boolean;
  // KnownBugs?: boolean;
  // BugsInTests?: IBugsInTests[];
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
}

interface IFailedTestSequenceReplaceMonomer {
  TestNameContains?: string[];
  SequenceId?: number[];
  ReplaceMonomerId?: number[];
  BugsInTests: string[];
}

enum monomerIDs {
  peptide_Cys_Bn = 1,
  preset_C = 2,
  preset_R_P = 3,
  preset_R_A = 4,
  sugar_R = 5,
  base_oC64m = 6,
  phosphate_P = 7,
  nucleotide_AmMC6T = 8,
  nucleotide_5NitInd = 9,
  CHEM_Mal = 10,
  peptide_w_o_R2_Ala_al = 11,
  peptide_w_o_natural_analog_w_o_R2__NHBn = 12,
  base_w_o_R2_5meC = 13,
  CHEM_w_o_R2_Mal = 14,
  peptide_w_o_R1_D_OAla = 15,
  peptide_w_o_R1_Boc_ = 16,
  sugar_w_o_R1_5cGT = 17,
}

const replaceMonomers: IReplaceMonomer[] = [
  {
    Id: <number>monomerIDs.peptide_Cys_Bn,
    MonomerType: 'Peptide',
    MonomerAlias: 'Cys_Bn',
    MonomerTestId: 'Cys_Bn___S-benzylcysteine',
    MonomerDescription: 'peptide (Cys_Bn)',
  },
  {
    Id: <number>monomerIDs.preset_C,
    MonomerType: 'RNA',
    MonomerSubType: 'Presets',
    MonomerAlias: 'C',
    MonomerTestId: 'C_C_R_P',
    MonomerDescription: 'preset (C)',
  },
  {
    // Custom preset created at BeforeAll section
    Id: <number>monomerIDs.preset_R_P,
    MonomerType: 'RNA',
    MonomerSubType: 'Presets',
    MonomerAlias: 'R()P',
    MonomerTestId: 'R()P_._R_P',
    MonomerDescription: 'preset (R()P)',
  },
  {
    // Custom preset created at BeforeAll section
    Id: <number>monomerIDs.preset_R_A,
    MonomerType: 'RNA',
    MonomerSubType: 'Presets',
    MonomerAlias: 'R(A)',
    MonomerTestId: 'R(A)_A_R_.',
    MonomerDescription: 'preset (R(A))',
  },
  {
    Id: <number>monomerIDs.sugar_R,
    MonomerType: 'RNA',
    MonomerSubType: 'Sugars',
    MonomerAlias: 'R',
    MonomerTestId: 'R___Ribose',
    MonomerDescription: 'sugar (R)',
  },
  {
    Id: <number>monomerIDs.base_oC64m,
    MonomerType: 'RNA',
    MonomerSubType: 'Bases',
    MonomerAlias: 'oC64m5',
    MonomerTestId: 'oC64m5___4-Hexan-6-ol-5-methylcytosine',
    MonomerDescription: 'base (oC64m5)',
  },
  {
    Id: <number>monomerIDs.phosphate_P,
    MonomerType: 'RNA',
    MonomerSubType: 'Phosphates',
    MonomerAlias: 'P',
    MonomerTestId: 'P___Phosphate',
    MonomerDescription: 'phosphate (P)',
  },
  {
    Id: <number>monomerIDs.nucleotide_AmMC6T,
    MonomerType: 'RNA',
    MonomerSubType: 'Nucleotides',
    MonomerAlias: 'AmMC6T',
    MonomerTestId: 'AmMC6T___Amino Modifier C6 dT',
    MonomerDescription: 'nucleotide (AmMC6T)',
  },
  {
    // Nucleotide without natural analog
    Id: <number>monomerIDs.nucleotide_5NitInd,
    MonomerType: 'RNA',
    MonomerSubType: 'Nucleotides',
    MonomerAlias: '5NitInd',
    MonomerTestId: '5NitInd___5-Nitroindole',
    MonomerDescription: 'nucleotide (5NitInd)',
  },
  {
    Id: <number>monomerIDs.CHEM_Mal,
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
  },
  {
    Id: 6,
    FileName: 'KET/Sequence-Mode-Replacement/sequence of sugars (UNA).ket',
    SequenceName: 'sequence of sugars (UNA)',
    ReplacementPositions: { LeftEnd: 1, Center: 3, RightEnd: 5 },
    ConfirmationOnReplecement: true,
  },
  {
    Id: 7,
    FileName: 'KET/Sequence-Mode-Replacement/sequence of bases (nC6n5U).ket',
    SequenceName: 'sequence of bases (nC6n5U)',
    ReplacementPositions: { LeftEnd: 1, Center: 3, RightEnd: 5 },
    ConfirmationOnReplecement: true,
  },
  {
    Id: 8,
    FileName: 'KET/Sequence-Mode-Replacement/sequence of phosphates (moen).ket',
    SequenceName: 'sequence of phosphates (moen)',
    ReplacementPositions: { LeftEnd: 1, Center: 3, RightEnd: 5 },
    ConfirmationOnReplecement: true,
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
  },
  {
    Id: 11,
    FileName: 'KET/Sequence-Mode-Replacement/sequence of CHEMs (A6OH).ket',
    SequenceName: 'sequence of CHEMs (A6OH)',
    ReplacementPositions: { LeftEnd: 1, Center: 3, RightEnd: 5 },
    ConfirmationOnReplecement: true,
  },
  {
    Id: 12,
    FileName:
      'KET/Sequence-Mode-Replacement/sequence of unresolved nucleotide (5Unres).ket',
    SequenceName: 'sequence of unresolved nucleotide (5Unres)',
    ReplacementPositions: { LeftEnd: 1, Center: 2, RightEnd: 3 },
  },
];

const FailedTestSequenceReplaceMonomers: IFailedTestSequenceReplaceMonomer[] = [
  {
    //  Replace monomer from library at view mode goes wrong for all types of monomer converded to @ symbol #5236
    TestNameContains: [
      'Case 1-',
      'Case 2-',
      'Case 3-',
      'Case 4-',
      'Case 5-',
      'Case 6-',
      'Case 13-',
      'Case 14-',
    ],
    SequenceId: [5, 6, 7, 8],
    BugsInTests: ['https://github.com/epam/ketcher/issues/5236'],
  },
  {
    //  Adding unsplit nucleotide with unknown natural analog works wrong #5240
    TestNameContains: [
      'Case 1-',
      'Case 2-',
      'Case 3-',
      'Case 4-',
      'Case 5-',
      'Case 6-',
      'Case 13-',
      'Case 14-',
    ],
    SequenceId: [10, 11],
    BugsInTests: ['https://github.com/epam/ketcher/issues/5240'],
  },
  {
    // Replacement of any monomer in the sequence on preset without base works wrong (it losts phosphate) #5337
    ReplaceMonomerId: [3],
    BugsInTests: ['https://github.com/epam/ketcher/issues/5337'],
  },
  {
    // Replacing all monomers (or part of them) in edit mode - works wrong - system cuts sequence on two #5341
    TestNameContains: ['Case 14-'],
    BugsInTests: ['https://github.com/epam/ketcher/issues/5341'],
  },
  {
    //  Replacement of one base to base connected nucleoside to another one cause sequences disappear from the canvas #5333
    TestNameContains: ['Case 17-'],
    SequenceId: [13],
    ReplaceMonomerId: [13],
    BugsInTests: ['https://github.com/epam/ketcher/issues/5333'],
  },
  {
    // Creation preset without phosphate causes R3less sugars disabled in the library FOREVER #5313
    TestNameContains: ['Case 8-', 'Case 11-'],
    ReplaceMonomerId: [17],
    BugsInTests: ['https://github.com/epam/ketcher/issues/5313'],
  },
  {
    // Side chain connection is not shown if nucleotides connected from base to base (same problem with nuclesides) #5318
    TestNameContains: ['Case 17-', 'Case 18-'],
    SequenceId: [13, 14],
    BugsInTests: ['https://github.com/epam/ketcher/issues/5318'],
  },
  {
    // Side chain connection is not shown if nucleotides connected from phosphate to base #5320
    TestNameContains: ['Case 17-', 'Case 18-'],
    SequenceId: [17],
    BugsInTests: ['https://github.com/epam/ketcher/issues/5320'],
  },
  {
    // Side chain connection is not shown for presets w/o bases connected from phosphate to phosphate #5339
    TestNameContains: ['Case 17-', 'Case 18-'],
    SequenceId: [18, 19],
    BugsInTests: ['https://github.com/epam/ketcher/issues/5339'],
  },
  {
    // Side chain connection is not shown for presets w/o bases connected from phosphate to sugar #5340
    TestNameContains: ['Case 17-', 'Case 18-'],
    SequenceId: [20],
    BugsInTests: ['https://github.com/epam/ketcher/issues/5340'],
  },
  {
    // Some side chain bonds are not shown in Sequence mode for bases, CHEMs, phosphates and sugars #5317
    TestNameContains: ['Case 17-', 'Case 18-'],
    SequenceId: [23, 24, 27, 28],
    BugsInTests: ['https://github.com/epam/ketcher/issues/5317'],
  },
  {
    //  Prelacement of any preset side connected to another preset wrong - system losts side chain bond #5344
    TestNameContains: ['Case 17-'],
    SequenceId: [13, 14, 15, 16, 17],
    ReplaceMonomerId: [13, 14],
    BugsInTests: ['https://github.com/epam/ketcher/issues/5344'],
  },
  {
    // Prelacement of any preset side connected to another preset wrong - system losts side chain bond #5344
    TestNameContains: ['Case 17-'],
    SequenceId: [18, 19, 20, 21],
    ReplaceMonomerId: [13],
    BugsInTests: ['https://github.com/epam/ketcher/issues/5344'],
  },
  {
    //  Prelacement of any monomer (side connected to another one) on monomer of different type works wrong - system keeps side chain bond (it shouldn't) #5345
    TestNameContains: ['Case 17-'],
    SequenceId: [22],
    ReplaceMonomerId: [11, 12, 13, 15, 16, 17, 18, 20],
    BugsInTests: ['https://github.com/epam/ketcher/issues/5345'],
  },
  {
    //  Prelacement of any monomer (side connected to another one) on monomer of different type works wrong - system keeps side chain bond (it shouldn't) #5345
    TestNameContains: ['Case 18-'],
    SequenceId: [22],
    ReplaceMonomerId: [13, 15, 16, 17, 18, 20],
    BugsInTests: ['https://github.com/epam/ketcher/issues/5345'],
  },
  {
    //  Prelacement of any monomer (side connected to another one) on monomer of different type works wrong - system keeps side chain bond (it shouldn't) #5345
    TestNameContains: ['Case 17-', 'Case 18-'],
    SequenceId: [23],
    ReplaceMonomerId: [11, 12, 13, 15, 16, 17, 18, 19, 20],
    BugsInTests: ['https://github.com/epam/ketcher/issues/5345'],
  },
  {
    //  Prelacement of any monomer (side connected to another one) on monomer of different type works wrong - system keeps side chain bond (it shouldn't) #5345
    TestNameContains: ['Case 17-', 'Case 18-'],
    SequenceId: [24],
    ReplaceMonomerId: [11, 12, 13, 15, 16, 17, 18, 19],
    BugsInTests: ['https://github.com/epam/ketcher/issues/5345'],
  },
  {
    //  Prelacement of any monomer (side connected to another one) on monomer of different type works wrong - system keeps side chain bond (it shouldn't) #5345
    TestNameContains: ['Case 17-'],
    SequenceId: [25, 26],
    ReplaceMonomerId: [13, 15, 16, 17, 18, 19, 20],
    BugsInTests: ['https://github.com/epam/ketcher/issues/5345'],
  },
  {
    //  Prelacement of any monomer (side connected to another one) on monomer of different type works wrong - system keeps side chain bond (it shouldn't) #5345
    TestNameContains: ['Case 17-', 'Case 18-'],
    SequenceId: [27],
    ReplaceMonomerId: [11, 12, 13, 15, 16, 17, 19, 20],
    BugsInTests: ['https://github.com/epam/ketcher/issues/5345'],
  },
  {
    //  Prelacement of any monomer (side connected to another one) on monomer of different type works wrong - system keeps side chain bond (it shouldn't) #5345
    TestNameContains: ['Case 17-', 'Case 18-'],
    SequenceId: [28],
    ReplaceMonomerId: [11, 12, 13, 15, 17, 19, 20],
    BugsInTests: ['https://github.com/epam/ketcher/issues/5345'],
  },
  {
    //  Prelacement of any monomer (side connected to another one) on monomer of different type works wrong - system keeps side chain bond (it shouldn't) #5345
    TestNameContains: ['Case 18-'],
    SequenceId: [28],
    ReplaceMonomerId: [11, 12, 13, 15, 16, 17, 19, 20],
    BugsInTests: ['https://github.com/epam/ketcher/issues/5345'],
  },
  {
    //  Prelacement of any monomer (side connected to another one) on monomer of different type works wrong -
    // system keeps side chain bond (it shouldn't) #5345
    TestNameContains: ['Case 17-'],
    SequenceId: [29],
    ReplaceMonomerId: [11, 12, 13, 15, 17, 18, 19, 20],
    BugsInTests: ['https://github.com/epam/ketcher/issues/5345'],
  },
  {
    // Prelacement of any preset (side connected to another monomer) another type of monomer should cause
    // confirm action dialog on side chain bond loss #5346
    TestNameContains: ['Case 18-'],
    SequenceId: [13, 14, 15, 16, 17, 18, 19, 20, 22],
    ReplaceMonomerId: [11, 12, 15, 17, 18, 19, 20],
    BugsInTests: ['https://github.com/epam/ketcher/issues/5346'],
  },
  {
    // Prelacement of any preset (side connected to another monomer) another type of monomer should cause
    // confirm action dialog on side chain bond loss #5346
    TestNameContains: ['Case 18-'],
    SequenceId: [25, 26],
    ReplaceMonomerId: [11, 12, 13, 15, 16, 17, 18, 19, 20],
    BugsInTests: ['https://github.com/epam/ketcher/issues/5346'],
  },
  {
    // Prelacement of any preset (side connected to another monomer) another type of monomer should cause
    // confirm action dialog on side chain bond loss #5346
    TestNameContains: ['Case 18-'],
    SequenceId: [17, 18, 19, 20, 22, 23, 24, 25, 26, 27, 28, 29],
    ReplaceMonomerId: [14],
    BugsInTests: ['https://github.com/epam/ketcher/issues/5346'],
  },
  {
    // Prelacement of any preset side connected to another preset wrong - system losts side chain bond #5344
    TestNameContains: ['Case 18-'],
    SequenceId: [14, 15, 16],
    ReplaceMonomerId: [13, 14],
    BugsInTests: ['https://github.com/epam/ketcher/issues/5344'],
  },
  {
    // Prelacement of any preset side connected to another preset wrong - system losts side chain bond #5344
    TestNameContains: ['Case 18-'],
    SequenceId: [17, 18, 19, 20],
    ReplaceMonomerId: [13],
    BugsInTests: ['https://github.com/epam/ketcher/issues/5344'],
  },
  {
    // Prelacement of any preset (side connected to another monomer) another type of monomer should cause
    // confirm action dialog on side chain bond loss #5346
    TestNameContains: ['Case 19-'],
    SequenceId: [
      13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
    ],
    ReplaceMonomerId: [11, 12, 15, 17, 18, 19, 20],
    BugsInTests: ['https://github.com/epam/ketcher/issues/5346'],
  },
  {
    // Prelacement of any preset side connected to another preset wrong - system losts side chain bond #5344
    TestNameContains: ['Case 19-'],
    SequenceId: [
      13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
    ],
    ReplaceMonomerId: [13, 14],
    BugsInTests: ['https://github.com/epam/ketcher/issues/5344'],
  },
];

function filterBugsInTests(
  testName: string,
  sequenceId: number,
  replaceMonomerId: number,
): string[] {
  return FailedTestSequenceReplaceMonomers.filter((item) => {
    const testNameMatch =
      item.TestNameContains === undefined ||
      item.TestNameContains.some((substring) => testName.includes(substring));
    const sequenceIdMatch =
      // item.SequenceId === undefined || item.SequenceId === sequenceId;
      item.SequenceId === undefined || item.SequenceId.includes(sequenceId);
    const replaceMonomerIdMatch =
      item.ReplaceMonomerId === undefined ||
      // item.ReplaceMonomerId === replaceMonomerId;
      item.ReplaceMonomerId === undefined ||
      item.ReplaceMonomerId.includes(replaceMonomerId);

    return testNameMatch && sequenceIdMatch && replaceMonomerIdMatch;
  }).flatMap((item) => item.BugsInTests || []);
}

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

  // Create preset 25mo3r(nC6n5C)Test-6-Ph
  await pressNewPresetButton(page);
  await selectSugarSlot(page);
  await page
    .getByTestId('25mo3r___3-O-Methylribose (2,5 connectivity)')
    .click();
  await moveMouseAway(page);
  await selectBaseSlot(page);
  await page.getByTestId('nC6n5C___Amino-Modier C6 dC').click();
  await moveMouseAway(page);
  await selectPhosphateSlot(page);
  await page.getByTestId('Test-6-Ph___Test-6-AP-Phosphate').click();
  await moveMouseAway(page);
  await pressAddToPresetsButton(page);

  // Create preset 25mo3r(nC6n5C)
  await pressNewPresetButton(page);
  await selectSugarSlot(page);
  await page
    .getByTestId('25mo3r___3-O-Methylribose (2,5 connectivity)')
    .click();
  await moveMouseAway(page);
  await selectBaseSlot(page);
  await page.getByTestId('nC6n5C___Amino-Modier C6 dC').click();
  await moveMouseAway(page);
  await pressAddToPresetsButton(page);

  // Create preset 25mo3r()Test-6-Ph
  await pressNewPresetButton(page);
  await selectSugarSlot(page);
  await page
    .getByTestId('25mo3r___3-O-Methylribose (2,5 connectivity)')
    .click();
  await moveMouseAway(page);
  await selectPhosphateSlot(page);
  await page.getByTestId('Test-6-Ph___Test-6-AP-Phosphate').click();
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
    await pressYesInConfirmYourActionDialog(page);
  }
  await moveMouseAway(page);
}

async function selectAndReplaceSymbolWithError(
  page: Page,
  replaceMonomer: IReplaceMonomer,
  replacementPosition: number,
) {
  await selectSequenceLayoutModeTool(page);
  await clickOnSequenceSymbolByIndex(page, replacementPosition);
  await clickOnMonomerFromLibrary(page, replaceMonomer);
  await moveMouseAway(page);
}

async function selectAndReplaceAllSymbols(
  page: Page,
  replaceMonomer: IReplaceMonomer,
  sequence: ISequence,
) {
  await selectSequenceLayoutModeTool(page);

  await page.keyboard.down('Shift');
  await clickOnSequenceSymbolByIndex(
    page,
    sequence.ReplacementPositions.LeftEnd,
  );
  await clickOnSequenceSymbolByIndex(
    page,
    sequence.ReplacementPositions.Center,
  );
  await clickOnSequenceSymbolByIndex(
    page,
    sequence.ReplacementPositions.RightEnd,
  );
  await page.keyboard.up('Shift');

  await clickOnMonomerFromLibrary(page, replaceMonomer);
  if (sequence.ConfirmationOnReplecement) {
    await pressYesInConfirmYourActionDialog(page);
  }
  await moveMouseAway(page);
}

async function selectAllSymbols(page: Page, sequence: ISequence) {
  await selectSequenceLayoutModeTool(page);

  await page.keyboard.down('Shift');
  await clickOnSequenceSymbolByIndex(
    page,
    sequence.ReplacementPositions.LeftEnd,
  );
  await clickOnSequenceSymbolByIndex(
    page,
    sequence.ReplacementPositions.Center,
  );
  await clickOnSequenceSymbolByIndex(
    page,
    sequence.ReplacementPositions.RightEnd,
  );
  await page.keyboard.up('Shift');
  await moveMouseAway(page);
}

async function selectAndReplaceAllSymbolsWithError(
  page: Page,
  replaceMonomer: IReplaceMonomer,
  sequence: ISequence,
) {
  await selectSequenceLayoutModeTool(page);
  await selectAllSymbols(page, sequence);
  await clickOnMonomerFromLibrary(page, replaceMonomer);

  await moveMouseAway(page);
}

async function selectAndReplaceAllSymbolsInEditMode(
  page: Page,
  replaceMonomer: IReplaceMonomer,
  sequence: ISequence,
) {
  await selectSequenceLayoutModeTool(page);

  await page.keyboard.down('Shift');
  await clickOnSequenceSymbolByIndex(
    page,
    sequence.ReplacementPositions.LeftEnd,
  );
  await clickOnSequenceSymbolByIndex(
    page,
    sequence.ReplacementPositions.Center,
  );
  await doubleClickOnSequenceSymbolByIndex(
    page,
    sequence.ReplacementPositions.RightEnd,
  );
  await page.keyboard.up('Shift');

  await clickOnMonomerFromLibrary(page, replaceMonomer);
  if (sequence.ConfirmationOnReplecement) {
    await pressYesInConfirmYourActionDialog(page);
  }
  await moveMouseAway(page);
}

async function selectAndReplaceAllSymbolsInEditModeWithError(
  page: Page,
  replaceMonomer: IReplaceMonomer,
  sequence: ISequence,
) {
  await selectSequenceLayoutModeTool(page);

  await page.keyboard.down('Shift');
  await clickOnSequenceSymbolByIndex(
    page,
    sequence.ReplacementPositions.LeftEnd,
  );
  await clickOnSequenceSymbolByIndex(
    page,
    sequence.ReplacementPositions.Center,
  );
  await doubleClickOnSequenceSymbolByIndex(
    page,
    sequence.ReplacementPositions.RightEnd,
  );
  await page.keyboard.up('Shift');

  await clickOnMonomerFromLibrary(page, replaceMonomer);
  await moveMouseAway(page);
}

async function selectAndReplaceSymbolInEditMode(
  page: Page,
  replaceMonomer: IReplaceMonomer,
  sequence: ISequence,
  replacementPosition: number,
) {
  await selectSequenceLayoutModeTool(page);
  await doubleClickOnSequenceSymbolByIndex(page, replacementPosition);
  await clickOnMonomerFromLibrary(page, replaceMonomer);
  if (sequence.ConfirmationOnReplecement) {
    await pressYesInConfirmYourActionDialog(page);
  }
  await moveMouseToTheMiddleOfTheScreen(page);
  await page.mouse.click(400, 400);
}

async function selectAndReplaceSymbolInEditModeWithError(
  page: Page,
  replaceMonomer: IReplaceMonomer,
  replacementPosition: number,
) {
  await selectSequenceLayoutModeTool(page);
  await doubleClickOnSequenceSymbolByIndex(page, replacementPosition);
  await clickOnMonomerFromLibrary(page, replaceMonomer);
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
  // Check if particular combination of test, sequence, replaceMonomer has any known bugs that makes test case works wrong
  const testSequenceReplaceMonomersMatchingBugs = filterBugsInTests(
    test.info().title,
    sequence.Id,
    replaceMonomer.Id,
  );

  const allMatchingBugs = [...testSequenceReplaceMonomersMatchingBugs];

  if (allMatchingBugs && allMatchingBugs.length > 0) {
    addAnnotation(`That test works wrong because of bug(s):`);
    allMatchingBugs.forEach((bug) => {
      addAnnotation(`${bug}`);
    });
    addAnnotation(
      `If all bugs has been fixed - screenshots have to be updated, propper items in FailedTestSequenceReplaceMonomers collection have to be removed.`,
    );
    addAnnotation(`SequenceId: ${sequence.Id}`);
    addAnnotation(`ReplaceMonomerId: ${replaceMonomer.Id}`);
    addAnnotation(`ReplacementPosition: ${replacementPosition}`);
    test.info().fixme();
  }
}

async function closeErrorMessage(page: Page) {
  const errorMessage = await page.getByText('Error message', {
    exact: true,
  });
  const closeWindowButton = await page.getByRole('button', {
    name: 'Close window',
  });

  await closeWindowButton.click();
  await errorMessage.waitFor({ state: 'hidden' });
  // await closeWindowButton.click();
}

for (const replaceMonomer of replaceMonomers) {
  for (const sequence of sequences) {
    test(`Case 1-${sequence.Id}-${replaceMonomer.Id}. Replace first symbol at ${sequence.SequenceName} on ${replaceMonomer.MonomerDescription} in view mode`, async () => {
      /*
        Test case: https://github.com/epam/ketcher/issues/5290 - Test case 1
        Description: User can replace first symbol (of every type) in sequence with another monomer (of every type) in view mode
        Scenario:
        1. Clear canvas
        2. Load sequence from file (sequence contains monomers of necessary type)
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
      await moveMouseAway(page);
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
    test(`Case 2-${sequence.Id}-${replaceMonomer.Id}. Replace center symbol at ${sequence.SequenceName} on ${replaceMonomer.MonomerDescription} in view mode`, async () => {
      /*
        Test case: https://github.com/epam/ketcher/issues/5290 - Test case 2
        Description: User can replace symbol (of every type) in the midle of sequence with another monomer (of every type) in view mode
        Scenario:
        1. Clear canvas
        2. Load sequence from file (sequence contains monomers of necessary type)
        3. Select symbol in the middle of sequence
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
      await moveMouseAway(page);
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
    test(`Case 3-${sequence.Id}-${replaceMonomer.Id}. Replace last symbol at ${sequence.SequenceName} on ${replaceMonomer.MonomerDescription} in view mode`, async () => {
      /*
          Test case: https://github.com/epam/ketcher/issues/5290 - Test case 3
          Description: User can replace end symbol (of every type) in the sequence with another monomer (of every type) in view mode
          Scenario:
          1. Clear canvas
          2. Load sequence from file (sequence contains monomers of necessary type)
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
      await moveMouseAway(page);
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

for (const replaceMonomer of replaceMonomers) {
  for (const sequence of sequences) {
    test(`Case 4-${sequence.Id}-${replaceMonomer.Id}. Replace first symbol at ${sequence.SequenceName} on ${replaceMonomer.MonomerDescription} in edit mode`, async () => {
      /*
          Test case: https://github.com/epam/ketcher/issues/5290 - Test case 4
          Description: User can replace first symbol (of every type) in sequence with another monomer (of every type) in edit mode
          Scenario:
          1. Clear canvas
          2. Load sequence from file (sequence contains monomers of necessary type)
          3. Double click on first symbol (that turns sequence into edit mode)
          4. Click on monomer from the library
          5. Take screenshot to validate that replacement work in Sequence mode canvas
          6. Switch to Flex mode
          7. Take screenshot to validate that replacement work in Flex mode canvas
          8. Add info to log if known bugs exist and skip test
        */
      await openFileAndAddToCanvasMacro(sequence.FileName, page);
      await selectAndReplaceSymbolInEditMode(
        page,
        replaceMonomer,
        sequence,
        sequence.ReplacementPositions.LeftEnd,
      );
      await takeEditorScreenshot(page);
      await selectFlexLayoutModeTool(page);
      await moveMouseAway(page);
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
    test(`Case 5-${sequence.Id}-${replaceMonomer.Id}. Replace center symbol at ${sequence.SequenceName} on ${replaceMonomer.MonomerDescription} in edit mode`, async () => {
      /*
          Test case: https://github.com/epam/ketcher/issues/5290 - Test case 5
          Description: User can replace symbol (of every type) in the middle of sequence with another monomer (of every type) in edit mode
          Scenario:
          1. Clear canvas
          2. Load sequence from file (sequence contains monomers of necessary type)
          3. Double click symbol in the middle of sequence (that turns sequence into edit mode)
          4. Click on monomer from the library
          5. Take screenshot to validate that replacement work in Sequence mode canvas
          6. Switch to Flex mode
          7. Take screenshot to validate that replacement work in Flex mode canvas
          8. Add info to log if known bugs exist and skip test
        */
      await openFileAndAddToCanvasMacro(sequence.FileName, page);
      await selectAndReplaceSymbolInEditMode(
        page,
        replaceMonomer,
        sequence,
        sequence.ReplacementPositions.Center,
      );
      await takeEditorScreenshot(page);
      await selectFlexLayoutModeTool(page);
      await moveMouseAway(page);
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
    test(`Case 6-${sequence.Id}-${replaceMonomer.Id}. Replace last symbol at ${sequence.SequenceName} on ${replaceMonomer.MonomerDescription} in edit mode`, async () => {
      /*
            Test case: https://github.com/epam/ketcher/issues/5290 - Test case 6
            Description: User can replace end symbol (of every type) in the sequence with another monomer (of every type) in edit mode
            Scenario:
            1. Clear canvas
            2. Load sequence from file (sequence contains monomers of necessary type)
            3. Double click on the last symbol (that turns sequence into edit mode)
            4. Click on monomer from the library
            5. Take screenshot to validate that replacement work in Sequence mode canvas
            6. Switch to Flex mode
            7. Take screenshot to validate that replacement work in Flex mode canvas
            8. Add info to log if known bugs exist and skip test
          */
      await openFileAndAddToCanvasMacro(sequence.FileName, page);
      await selectAndReplaceSymbolInEditMode(
        page,
        replaceMonomer,
        sequence,
        sequence.ReplacementPositions.RightEnd,
      );
      await takeEditorScreenshot(page);
      await selectFlexLayoutModeTool(page);
      await moveMouseAway(page);
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

const noR2ConnectionPointReplaceMonomers: IReplaceMonomer[] = [
  {
    Id: 11,
    MonomerType: 'Peptide',
    MonomerAlias: 'Ala-al',
    MonomerTestId: 'Ala-al___(2S)-2-aminopropanal',
    MonomerDescription: 'peptide w/o R2 (Ala-al)',
  },
  {
    Id: 12,
    MonomerType: 'Peptide',
    MonomerAlias: '-NHBn',
    MonomerTestId: '-NHBn___C-Terminal benzylamino',
    MonomerDescription: 'peptide w/o natural analog w/o R2 (-NHBn)',
  },
  {
    Id: 13,
    MonomerType: 'RNA',
    MonomerSubType: 'Bases',
    MonomerAlias: '5meC',
    MonomerTestId: '5meC___5-methyl-cytidine',
    MonomerDescription: 'base w/o R2 (5meC)',
  },
  {
    Id: 14,
    MonomerType: 'CHEM',
    MonomerAlias: 'Az',
    MonomerTestId: 'Az___4-azidobutyric acid',
    MonomerDescription: 'CHEM w/o R2 (Mal)',
  },
];

for (const noR2ConnectionPointReplaceMonomer of noR2ConnectionPointReplaceMonomers) {
  for (const sequence of sequences) {
    test(`Case 7-${sequence.Id}-${noR2ConnectionPointReplaceMonomer.Id}. 
      Can't replace first symbol at ${sequence.SequenceName} on ${noR2ConnectionPointReplaceMonomer.MonomerDescription} (view mode)`, async () => {
      /*
        Test case: https://github.com/epam/ketcher/issues/5290 - Test case 7
        Description: User can't replace first symbol (of every type) in sequence with another monomer (of every type) with no R2 in view mode
        Scenario:
        1. Clear canvas
        2. Load sequence from file (sequence contains monomers of necessary type)
        3. Select first symbol
        4. Click on monomer from the library that has no R2 connection point
        5. Validate that error message occures
        6. Add info to log if known bugs exist and skip test
      */
      await openFileAndAddToCanvasMacro(sequence.FileName, page);
      await selectAndReplaceSymbolWithError(
        page,
        noR2ConnectionPointReplaceMonomer,
        sequence.ReplacementPositions.LeftEnd,
      );

      const fullErrorMessage = page.getByText(
        'It is impossible to merge fragments. Attachment point to establish bonds are not available.',
      );
      await expect(fullErrorMessage).toBeVisible();

      await closeErrorMessage(page);
      // skip that test if bug(s) exists
      await checkForKnownBugs(
        noR2ConnectionPointReplaceMonomer,
        sequence,
        sequence.ReplacementPositions.LeftEnd,
      );
    });
  }
}

const noR1ConnectionPointReplaceMonomers: IReplaceMonomer[] = [
  {
    Id: <number>monomerIDs.peptide_w_o_R1_D_OAla,
    MonomerType: 'Peptide',
    MonomerAlias: 'D-OAla',
    MonomerTestId: 'D-OAla___D-lactic acid',
    MonomerDescription: 'peptide w/o R1 (D-OAla)',
  },
  {
    Id: <number>monomerIDs.peptide_w_o_R1_Boc_,
    MonomerType: 'Peptide',
    MonomerAlias: 'Boc-',
    MonomerTestId: 'Boc-___N-Terminal tert-butyloxycarbonyl',
    MonomerDescription: 'peptide w/o R1 (Boc-)',
  },
  {
    Id: <number>monomerIDs.sugar_w_o_R1_5cGT,
    MonomerType: 'RNA',
    MonomerSubType: 'Sugars',
    MonomerAlias: '5cGT',
    MonomerTestId: "5cGT___2-(methylamino)acetamide (GeneTools 5'-cap for PMO)",
    MonomerDescription: 'sugar w/o R1 (5cGT)',
  },
];

const noR1orR2ConnectionPointReplaceMonomers: IReplaceMonomer[] = [
  ...noR2ConnectionPointReplaceMonomers,
  ...noR1ConnectionPointReplaceMonomers,
];

for (const noR1orR2ConnectionPointReplaceMonomer of noR1orR2ConnectionPointReplaceMonomers) {
  for (const sequence of sequences) {
    test(`Case 8-${sequence.Id}-${noR1orR2ConnectionPointReplaceMonomer.Id}. 
      Can't replace symbol in the center of ${sequence.SequenceName} on ${noR1orR2ConnectionPointReplaceMonomer.MonomerDescription} (view mode)`, async () => {
      /*
        Test case: https://github.com/epam/ketcher/issues/5290 - Test case 8
        Description: User can't replace symbol (of every type) in the middle of sequence with another monomer (of every type) with no R1 or R2 in view mode
        Scenario:
        1. Clear canvas
        2. Load sequence from file (sequence contains monomers of necessary type)
        3. Select symbol in the center of sequence
        4. Click on monomer from the library that has no R1 or R2 connection points
        5. Validate that error message occures
        6. Add info to log if known bugs exist and skip test
      */
      test.setTimeout(20000);

      await openFileAndAddToCanvasMacro(sequence.FileName, page);
      await selectAndReplaceSymbolWithError(
        page,
        noR1orR2ConnectionPointReplaceMonomer,
        sequence.ReplacementPositions.Center,
      );

      const fullErrorMessage = page.getByText(
        'It is impossible to merge fragments. Attachment point to establish bonds are not available.',
      );
      await expect(fullErrorMessage).toBeVisible();

      await closeErrorMessage(page);
      // skip that test if bug(s) exists
      await checkForKnownBugs(
        noR1orR2ConnectionPointReplaceMonomer,
        sequence,
        sequence.ReplacementPositions.Center,
      );
    });
  }
}

for (const noR1ConnectionPointReplaceMonomer of noR1ConnectionPointReplaceMonomers) {
  for (const sequence of sequences) {
    test(`Case 9-${sequence.Id}-${noR1ConnectionPointReplaceMonomer.Id}. 
      Can't replace last symbol at ${sequence.SequenceName} on ${noR1ConnectionPointReplaceMonomer.MonomerDescription} (view mode)`, async () => {
      /*
        Test case: https://github.com/epam/ketcher/issues/5290 - Test case 9
        Description: User can't replace symbol (of every type) in the middle of sequence with another monomer (of every type) with no R1 or R2 in view mode
        Scenario:
        1. Clear canvas
        2. Load sequence from file (sequence contains monomers of necessary type)
        3. Select last symbol of sequence
        4. Click on monomer from the library that has no R1 or R2 connection points
        5. Validate that error message occures
        6. Add info to log if known bugs exist and skip test
      */
      test.setTimeout(20000);

      await openFileAndAddToCanvasMacro(sequence.FileName, page);
      await selectAndReplaceSymbolWithError(
        page,
        noR1ConnectionPointReplaceMonomer,
        sequence.ReplacementPositions.RightEnd,
      );

      const fullErrorMessage = page.getByText(
        'It is impossible to merge fragments. Attachment point to establish bonds are not available.',
      );
      await expect(fullErrorMessage).toBeVisible();

      await closeErrorMessage(page);
      // skip that test if bug(s) exists
      await checkForKnownBugs(
        noR1ConnectionPointReplaceMonomer,
        sequence,
        sequence.ReplacementPositions.RightEnd,
      );
    });
  }
}

for (const noR2ConnectionPointReplaceMonomer of noR2ConnectionPointReplaceMonomers) {
  for (const sequence of sequences) {
    test(`Case 10-${sequence.Id}-${noR2ConnectionPointReplaceMonomer.Id}. 
      Can't replace first symbol at ${sequence.SequenceName} on ${noR2ConnectionPointReplaceMonomer.MonomerDescription} (edit mode)`, async () => {
      /*
        Test case: https://github.com/epam/ketcher/issues/5290 - Test case 10
        Description: User can't replace first symbol (of every type) in sequence with another monomer (of every type) with no R2 in edit mode
        Scenario:
        1. Clear canvas
        2. Load sequence from file (sequence contains monomers of necessary type)
        3. Double click on the first symbol (that turns sequence into edit mode)
        4. Click on monomer from the library that has no R2 connection point
        5. Validate that error message occures
        6. Add info to log if known bugs exist and skip test
      */
      await openFileAndAddToCanvasMacro(sequence.FileName, page);
      await selectAndReplaceSymbolInEditModeWithError(
        page,
        noR2ConnectionPointReplaceMonomer,
        sequence.ReplacementPositions.LeftEnd,
      );

      const fullErrorMessage = page.getByText(
        'It is impossible to merge fragments. Attachment point to establish bonds are not available.',
      );
      await expect(fullErrorMessage).toBeVisible();

      await closeErrorMessage(page);
      // skip that test if bug(s) exists
      await checkForKnownBugs(
        noR2ConnectionPointReplaceMonomer,
        sequence,
        sequence.ReplacementPositions.LeftEnd,
      );
    });
  }
}

for (const noR1orR2ConnectionPointReplaceMonomer of noR1orR2ConnectionPointReplaceMonomers) {
  for (const sequence of sequences) {
    test(`Case 11-${sequence.Id}-${noR1orR2ConnectionPointReplaceMonomer.Id}. 
      Can't replace symbol in the center of ${sequence.SequenceName} on ${noR1orR2ConnectionPointReplaceMonomer.MonomerDescription} (edit mode)`, async () => {
      /*
        Test case: https://github.com/epam/ketcher/issues/5290 - Test case 11
        Description: User can't replace symbol (of every type) in the middle of sequence with another monomer (of every type) with no R1 or R2 in edit mode
        Scenario:
        1. Clear canvas
        2. Load sequence from file (sequence contains monomers of necessary type)
        3. Double click symbol in the center of sequence (that turns sequence into edit mode)
        4. Click on monomer from the library that has no R1 or R2 connection points
        5. Validate that error message occures
        6. Add info to log if known bugs exist and skip test
      */
      test.setTimeout(20000);

      await openFileAndAddToCanvasMacro(sequence.FileName, page);
      await selectAndReplaceSymbolWithError(
        page,
        noR1orR2ConnectionPointReplaceMonomer,
        sequence.ReplacementPositions.Center,
      );

      const fullErrorMessage = page.getByText(
        'It is impossible to merge fragments. Attachment point to establish bonds are not available.',
      );
      await expect(fullErrorMessage).toBeVisible();

      await closeErrorMessage(page);
      // skip that test if bug(s) exists
      await checkForKnownBugs(
        noR1orR2ConnectionPointReplaceMonomer,
        sequence,
        sequence.ReplacementPositions.Center,
      );
    });
  }
}

for (const noR1ConnectionPointReplaceMonomer of noR1ConnectionPointReplaceMonomers) {
  for (const sequence of sequences) {
    test(`Case 12-${sequence.Id}-${noR1ConnectionPointReplaceMonomer.Id}. 
      Can't replace last symbol at ${sequence.SequenceName} on ${noR1ConnectionPointReplaceMonomer.MonomerDescription} (edit mode)`, async () => {
      /*
        Test case: https://github.com/epam/ketcher/issues/5290 - Test case 12
        Description: User can't replace last symbol (of every type) of sequence with another monomer (of every type) with no R1 or R2 in edit mode
        Scenario:
        1. Clear canvas
        2. Load sequence from file (sequence contains monomers of necessary type)
        3. Double click on the last sequence of sequence (that turns sequence into edit mode)
        4. Click on monomer from the library that has no R1 or R2 connection points
        5. Validate that error message occures
        6. Add info to log if known bugs exist and skip test
      */
      test.setTimeout(20000);

      await openFileAndAddToCanvasMacro(sequence.FileName, page);
      await selectAndReplaceSymbolWithError(
        page,
        noR1ConnectionPointReplaceMonomer,
        sequence.ReplacementPositions.RightEnd,
      );

      const fullErrorMessage = page.getByText(
        'It is impossible to merge fragments. Attachment point to establish bonds are not available.',
      );
      await expect(fullErrorMessage).toBeVisible();

      await closeErrorMessage(page);
      // skip that test if bug(s) exists
      await checkForKnownBugs(
        noR1ConnectionPointReplaceMonomer,
        sequence,
        sequence.ReplacementPositions.RightEnd,
      );
    });
  }
}

for (const replaceMonomer of replaceMonomers) {
  for (const sequence of sequences) {
    test(`Case 13-${sequence.Id}-${replaceMonomer.Id}. Replace all symbols at ${sequence.SequenceName} on ${replaceMonomer.MonomerDescription} in view mode`, async () => {
      /*
        Test case: https://github.com/epam/ketcher/issues/5290 - Test case 13
        Description: User can replace all symbols (of every type) in sequence with another monomer (of every type) in view mode
        Scenario:
        1. Clear canvas
        2. Load sequence from file (sequence contains monomers of necessary type)
        3. Select all symbol of target type
        4. Click on monomer from the library
        5. Take screenshot to validate that replacement work in Sequence mode canvas
        6. Switch to Flex mode
        7. Take screenshot to validate that replacement work in Flex mode canvas
        8. Add info to log if known bugs exist and skip test
      */
      await openFileAndAddToCanvasMacro(sequence.FileName, page);
      await selectAndReplaceAllSymbols(page, replaceMonomer, sequence);
      await takeEditorScreenshot(page);
      await selectFlexLayoutModeTool(page);
      await moveMouseAway(page);
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
    test(`Case 14-${sequence.Id}-${replaceMonomer.Id}. Replace all symbols at ${sequence.SequenceName} on ${replaceMonomer.MonomerDescription} in view mode`, async () => {
      /*
        Test case: https://github.com/epam/ketcher/issues/5290 - Test case 14
        Description: User can replace all symbols (of every type) in sequence with another monomer (of every type) in edit mode
        Scenario:
        1. Clear canvas
        2. Load sequence from file (sequence contains monomers of necessary type)
        3. Hold Shift key and select all symbol of target type and double click on the last
        4. Click on monomer from the library
        5. Take screenshot to validate that replacement work in Sequence mode canvas
        6. Switch to Flex mode
        7. Take screenshot to validate that replacement work in Flex mode canvas
        8. Add info to log if known bugs exist and skip test
      */
      await openFileAndAddToCanvasMacro(sequence.FileName, page);
      await selectAndReplaceAllSymbolsInEditMode(
        page,
        replaceMonomer,
        sequence,
      );
      await takeEditorScreenshot(page);
      await selectFlexLayoutModeTool(page);
      await moveMouseAway(page);
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

for (const noR1ConnectionPointReplaceMonomer of noR1ConnectionPointReplaceMonomers) {
  for (const sequence of sequences) {
    test(`Case 15-${sequence.Id}-${noR1ConnectionPointReplaceMonomer.Id}. 
      Can't replace all symbols at ${sequence.SequenceName} on ${noR1ConnectionPointReplaceMonomer.MonomerDescription} (view mode)`, async () => {
      /*
        Test case: https://github.com/epam/ketcher/issues/5290 - Test case 15
        Description: User can't replace all symbols (of every type) of sequence with another monomer (of every type) with no R1 or R2 in view mode
        Scenario:
        1. Clear canvas
        2. Load sequence from file (sequence contains monomers of necessary type)
        3. Select all symbols
        4. Click on monomer from the library that has no R1 or R2 connection points
        5. Validate that error message occures
        6. Add info to log if known bugs exist and skip test
      */
      test.setTimeout(20000);
      // const title = test.info().title;
      // // If (for some reasons) on random test ErrorMessage doesn't work - use that dirty hack - page reload helps
      // if (title.includes('Case 15-1-17.')) {
      //   await pageReload(page);
      // }

      await openFileAndAddToCanvasMacro(sequence.FileName, page);
      await selectAndReplaceAllSymbolsWithError(
        page,
        noR1ConnectionPointReplaceMonomer,
        sequence,
      );

      const fullErrorMessage = page.getByText(
        'It is impossible to merge fragments. Attachment point to establish bonds are not available.',
      );
      await expect(fullErrorMessage).toBeVisible();

      await closeErrorMessage(page);
      // skip that test if bug(s) exists
      await checkForKnownBugs(
        noR1ConnectionPointReplaceMonomer,
        sequence,
        sequence.ReplacementPositions.RightEnd,
      );
    });
  }
}

for (const noR1ConnectionPointReplaceMonomer of noR1ConnectionPointReplaceMonomers) {
  for (const sequence of sequences) {
    test(`Case 16-${sequence.Id}-${noR1ConnectionPointReplaceMonomer.Id}. 
      Can't replace all symbols at ${sequence.SequenceName} on ${noR1ConnectionPointReplaceMonomer.MonomerDescription} (edit mode)`, async () => {
      /*
        Test case: https://github.com/epam/ketcher/issues/5290 - Test case 16
        Description: User can't replace all symbols (of every type) of sequence with another monomer (of every type) with no R1 or R2 in edit mode
        Scenario:
        1. Clear canvas
        2. Load sequence from file (sequence contains monomers of necessary type)
        3. Hold Shift key and select all symbols and double click on the last symbol of sequence (that turns sequence into edit mode)
        4. Click on monomer from the library that has no R1 or R2 connection points
        5. Validate that error message occures
        6. Add info to log if known bugs exist and skip test
      */
      test.setTimeout(20000);

      await openFileAndAddToCanvasMacro(sequence.FileName, page);
      await selectAndReplaceAllSymbolsInEditModeWithError(
        page,
        noR1ConnectionPointReplaceMonomer,
        sequence,
      );

      const fullErrorMessage = page.getByText(
        'It is impossible to merge fragments. Attachment point to establish bonds are not available.',
      );
      await expect(fullErrorMessage).toBeVisible();

      await closeErrorMessage(page);
      // skip that test if bug(s) exists
      await checkForKnownBugs(
        noR1ConnectionPointReplaceMonomer,
        sequence,
        sequence.ReplacementPositions.RightEnd,
      );
    });
  }
}

const twoSequences: ISequence[] = [
  {
    Id: 13,
    FileName:
      'KET/Sequence-Mode-Replacement/base to base connected two sequences of presets (U) w_o phosphates.ket',
    SequenceName:
      'base to base connected two sequences of presets (U) w_o phosphates',
    ReplacementPositions: { LeftEnd: 1, Center: 2, RightEnd: 3 },
  },
  {
    Id: 14,
    FileName:
      'KET/Sequence-Mode-Replacement/base to base connected two sequences of presets (U).ket',
    SequenceName: 'base to base connected two sequences of presets (U)',
    ReplacementPositions: { LeftEnd: 1, Center: 2, RightEnd: 3 },
  },
  {
    Id: 15,
    FileName:
      'KET/Sequence-Mode-Replacement/base to sugar connected two sequences of presets (U) w_o phosphate.ket',
    SequenceName:
      'base to sugar connected two sequences of presets (U) w_o phosphate',
    ReplacementPositions: { LeftEnd: 3, Center: 4, RightEnd: 5 },
  },
  {
    Id: 16,
    FileName:
      'KET/Sequence-Mode-Replacement/base to sugar connected two sequences of presets (U).ket',
    SequenceName: 'base to sugar connected two sequences of presets (U)',
    ReplacementPositions: { LeftEnd: 3, Center: 4, RightEnd: 5 },
  },
  {
    Id: 17,
    FileName:
      'KET/Sequence-Mode-Replacement/phosphate to base connected two sequences of presets (U).ket',
    SequenceName: 'phosphate to base connected two sequences of presets (U)',
    ReplacementPositions: { LeftEnd: 2, Center: 3, RightEnd: 4 },
  },
  {
    Id: 18,
    FileName:
      'KET/Sequence-Mode-Replacement/phosphate to phosphate connected two sequences of presets (U) w_o base.ket',
    SequenceName:
      'phosphate to phosphate connected two sequences of presets (U) w_o base',
    ReplacementPositions: { LeftEnd: 1, Center: 3, RightEnd: 5 },
    ConfirmationOnReplecement: true,
  },
  {
    Id: 19,
    FileName:
      'KET/Sequence-Mode-Replacement/phosphate to phosphate connected two sequences of presets (U).ket',
    SequenceName:
      'phosphate to phosphate connected two sequences of presets (U)',
    ReplacementPositions: { LeftEnd: 2, Center: 3, RightEnd: 4 },
  },
  {
    Id: 20,
    FileName:
      'KET/Sequence-Mode-Replacement/phosphate to sugar connected two sequences of presets (U) w_o base.ket',
    SequenceName:
      'phosphate to sugar connected two sequences of presets (U) w_o base',
    ReplacementPositions: { LeftEnd: 2, Center: 4, RightEnd: 6 },
    ConfirmationOnReplecement: true,
  },
  {
    Id: 21,
    FileName:
      'KET/Sequence-Mode-Replacement/phosphate to sugar connected two sequences of presets (U).ket',
    SequenceName: 'phosphate to sugar connected two sequences of presets (U)',
    ReplacementPositions: { LeftEnd: 3, Center: 4, RightEnd: 5 },
  },
  {
    Id: 22,
    FileName:
      'KET/Sequence-Mode-Replacement/two sequence of unsplit nucleotides (AmMC6T).ket',
    SequenceName: 'two sequence of unsplit nucleotides (AmMC6T)',
    ReplacementPositions: { LeftEnd: 4, Center: 5, RightEnd: 6 },
  },
  {
    Id: 23,
    FileName:
      'KET/Sequence-Mode-Replacement/two sequences of bases (nC6n5U).ket',
    SequenceName: 'two sequences of bases (nC6n5U)',
    ReplacementPositions: { LeftEnd: 6, Center: 8, RightEnd: 10 },
    ConfirmationOnReplecement: true,
  },
  {
    Id: 24,
    FileName:
      'KET/Sequence-Mode-Replacement/two sequences of CHEMs (4aPEGMal).ket',
    SequenceName: 'two sequences of CHEMs (4aPEGMal)',
    ReplacementPositions: { LeftEnd: 6, Center: 8, RightEnd: 10 },
    ConfirmationOnReplecement: true,
  },
  {
    Id: 25,
    FileName:
      'KET/Sequence-Mode-Replacement/two sequences of peptides (D-gGlu).ket',
    SequenceName: 'two sequences of peptides (D-gGlu)',
    ReplacementPositions: { LeftEnd: 4, Center: 5, RightEnd: 6 },
  },
  {
    Id: 26,
    FileName:
      'KET/Sequence-Mode-Replacement/two sequences of peptides w_o natural analog (Apm).ket',
    SequenceName: 'two sequences of peptides w_o natural analog (Apm)',
    ReplacementPositions: { LeftEnd: 4, Center: 5, RightEnd: 6 },
  },
  {
    Id: 27,
    FileName:
      'KET/Sequence-Mode-Replacement/two sequences of phosphates (Test-6-Ph).ket',
    SequenceName: 'two sequences of phosphates (Test-6-Ph)',
    ReplacementPositions: { LeftEnd: 6, Center: 8, RightEnd: 10 },
    ConfirmationOnReplecement: true,
  },
  {
    Id: 28,
    FileName: 'KET/Sequence-Mode-Replacement/two sequences of sugars (5A6).ket',
    SequenceName: 'two sequences of sugars (5A6)',
    ReplacementPositions: { LeftEnd: 6, Center: 8, RightEnd: 10 },
    ConfirmationOnReplecement: true,
  },
  {
    Id: 29,
    FileName:
      'KET/Sequence-Mode-Replacement/two sequences of unresolved nucleotide (5Unres).ket',
    SequenceName: 'two sequences of unresolved nucleotide (5Unres)',
    ReplacementPositions: { LeftEnd: 4, Center: 5, RightEnd: 6 },
  },
];

const withSideConnectionReplaceMonomers: IReplaceMonomer[] = [
  {
    Id: 11,
    MonomerType: 'Peptide',
    MonomerAlias: 'Hcy',
    MonomerTestId: 'Hcy___homocysteine',
    MonomerDescription: 'peptide (Hcy)',
  },
  {
    Id: 12,
    MonomerType: 'Peptide',
    MonomerAlias: 'Test-6-P',
    MonomerTestId: 'Test-6-P___Test-6-AP-Peptide',
    MonomerDescription: 'peptide w/o natural analog(Test-6-P)',
  },
  {
    // Custom preset created at BeforeAll section
    Id: 13,
    MonomerType: 'RNA',
    MonomerSubType: 'Presets',
    MonomerAlias: '25mo3r(nC6n5C)Test-6-Ph',
    MonomerTestId: '25mo3r(nC6n5C)Test-6-Ph_nC6n5C_25mo3r_Test-6-Ph',
    MonomerDescription: 'preset (25mo3r(nC6n5C)Test-6-Ph)',
  },
  {
    // Custom preset created at BeforeAll section
    Id: 14,
    MonomerType: 'RNA',
    MonomerSubType: 'Presets',
    MonomerAlias: '25mo3r(nC6n5C)',
    MonomerTestId: '25mo3r(nC6n5C)_nC6n5C_25mo3r_.',
    MonomerDescription: 'preset w/o phosphate (25mo3r(nC6n5C))',
  },
  {
    // Custom preset created at BeforeAll section
    Id: 15,
    MonomerType: 'RNA',
    MonomerSubType: 'Presets',
    MonomerAlias: '25mo3r()Test-6-Ph',
    MonomerTestId: '25mo3r()Test-6-Ph_._25mo3r_Test-6-Ph',
    MonomerDescription: 'preset without base (25mo3r()Test-6-Ph)',
  },
  {
    Id: 16,
    MonomerType: 'RNA',
    MonomerSubType: 'Sugars',
    MonomerAlias: '5formD',
    MonomerTestId: '5formD___5-Formyl-2-deoxyribose',
    MonomerDescription: 'sugar (5formD)',
  },
  {
    Id: 17,
    MonomerType: 'RNA',
    MonomerSubType: 'Bases',
    MonomerAlias: 'nC6n2G',
    MonomerTestId: 'nC6n2G___6-Aminohexyl-2-aminoguanine',
    MonomerDescription: 'base (nC6n2G)',
  },
  {
    Id: 18,
    MonomerType: 'RNA',
    MonomerSubType: 'Phosphates',
    MonomerAlias: 'Test-6-Ph',
    MonomerTestId: 'Test-6-Ph___Test-6-AP-Phosphate',
    MonomerDescription: 'phosphate (Test-6-Ph)',
  },
  {
    Id: 19,
    MonomerType: 'RNA',
    MonomerSubType: 'Nucleotides',
    MonomerAlias: 'AmMC6T',
    MonomerTestId: 'AmMC6T___Amino Modifier C6 dT',
    MonomerDescription: 'nucleotide (AmMC6T)',
  },
  {
    Id: 20,
    MonomerType: 'CHEM',
    MonomerAlias: 'sDBL',
    MonomerTestId: 'sDBL___Symmetric Doubler',
    MonomerDescription: 'CHEM (sDBL)',
  },
];

for (const replaceMonomer of withSideConnectionReplaceMonomers) {
  for (const sequence of twoSequences) {
    test(`Case 17-${sequence.Id}-${replaceMonomer.Id}. Replace first symbol at ${sequence.SequenceName} on ${replaceMonomer.MonomerDescription} (view mode)`, async () => {
      /*
        Test case: https://github.com/epam/ketcher/issues/5290 - Test case 17
        Description: User can replace first symbol (of every type) connected to another sequence (via R3 side connection)
                     in sequence with another monomer (of the same type!) in view mode
        Scenario:
        1. Clear canvas
        2. Load sequence from file (sequence contains monomers of necessary type)
        3. Select first symbol
        4. Click on monomer from the library
        5. Take screenshot to validate that replacement work in Sequence mode canvas
        6. Switch to Flex mode
        7. Take screenshot to validate that replacement work in Flex mode canvas
        8. Add info to log if known bugs exist and skip test
      */
      test.setTimeout(20000);

      await openFileAndAddToCanvasMacro(sequence.FileName, page);
      await selectAndReplaceSymbol(
        page,
        replaceMonomer,
        sequence,
        sequence.ReplacementPositions.LeftEnd,
      );
      await takeEditorScreenshot(page);
      await selectFlexLayoutModeTool(page);
      await moveMouseAway(page);
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

for (const replaceMonomer of withSideConnectionReplaceMonomers) {
  for (const sequence of twoSequences) {
    test(`Case 18-${sequence.Id}-${replaceMonomer.Id}. Replace center symbol at ${sequence.SequenceName} on ${replaceMonomer.MonomerDescription} (view mode)`, async () => {
      /*
        Test case: https://github.com/epam/ketcher/issues/5290 - Test case 18
        Description: User can replace symbol (of every type) at the center connected to another sequence (via R3 side connection)
                     in sequence with another monomer (of the same type!) in view mode
        Scenario:
        1. Clear canvas
        2. Load sequence from file (sequence contains monomers of necessary type)
        3. Select symbol at the center
        4. Click on monomer from the library
        5. Take screenshot to validate that replacement work in Sequence mode canvas
        6. Switch to Flex mode
        7. Take screenshot to validate that replacement work in Flex mode canvas
        8. Add info to log if known bugs exist and skip test
      */
      test.setTimeout(20000);

      await openFileAndAddToCanvasMacro(sequence.FileName, page);
      await selectAndReplaceSymbol(
        page,
        replaceMonomer,
        sequence,
        sequence.ReplacementPositions.Center,
      );
      await takeEditorScreenshot(page);
      await selectFlexLayoutModeTool(page);
      await moveMouseAway(page);
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

for (const replaceMonomer of withSideConnectionReplaceMonomers) {
  for (const sequence of twoSequences) {
    test(`Case 19-${sequence.Id}-${replaceMonomer.Id}. Replace last symbol at ${sequence.SequenceName} on ${replaceMonomer.MonomerDescription} (view mode)`, async () => {
      /*
        Test case: https://github.com/epam/ketcher/issues/5290 - Test case 19
        Description: User can replace last symbol (of every type) connected to another sequence (via R3 side connection)
                     in sequence with another monomer (of the same type!) in view mode
        Scenario:
        1. Clear canvas
        2. Load sequence from file (sequence contains monomers of necessary type)
        3. Select last symbol
        4. Click on monomer from the library
        5. Take screenshot to validate that replacement work in Sequence mode canvas
        6. Switch to Flex mode
        7. Take screenshot to validate that replacement work in Flex mode canvas
        8. Add info to log if known bugs exist and skip test
      */
      test.setTimeout(20000);

      await openFileAndAddToCanvasMacro(sequence.FileName, page);
      await selectAndReplaceSymbol(
        page,
        replaceMonomer,
        sequence,
        sequence.ReplacementPositions.RightEnd,
      );
      await takeEditorScreenshot(page);
      await selectFlexLayoutModeTool(page);
      await moveMouseAway(page);
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

for (const replaceMonomer of withSideConnectionReplaceMonomers) {
  for (const sequence of twoSequences) {
    test(`Case 20-${sequence.Id}-${replaceMonomer.Id}. Replace first symbol at ${sequence.SequenceName} on ${replaceMonomer.MonomerDescription} in edit mode`, async () => {
      /*
          Test case: https://github.com/epam/ketcher/issues/5290 - Test case 4
          Description: User can replace first symbol (of every type) connected to another sequence (via R3 side connection) in sequence 
                      with another monomer (of the same type!) in edit mode
          Scenario:
          1. Clear canvas
          2. Load sequence from file (sequence contains monomers of necessary type)
          3. Double click on first symbol (that turns sequence into edit mode)
          4. Click on monomer from the library
          5. Take screenshot to validate that replacement work in Sequence mode canvas
          6. Switch to Flex mode
          7. Take screenshot to validate that replacement work in Flex mode canvas
          8. Add info to log if known bugs exist and skip test
        */
      await openFileAndAddToCanvasMacro(sequence.FileName, page);
      await selectAndReplaceSymbolInEditMode(
        page,
        replaceMonomer,
        sequence,
        sequence.ReplacementPositions.LeftEnd,
      );
      await takeEditorScreenshot(page);
      await selectFlexLayoutModeTool(page);
      await moveMouseAway(page);
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

for (const replaceMonomer of withSideConnectionReplaceMonomers) {
  for (const sequence of twoSequences) {
    test(`Case 21-${sequence.Id}-${replaceMonomer.Id}. Replace center symbol at ${sequence.SequenceName} on ${replaceMonomer.MonomerDescription} in edit mode`, async () => {
      /*
          Test case: https://github.com/epam/ketcher/issues/5290 - Test case 5
          Description: User can replace symbol (of every type) at the center connected to another sequence (via R3 side connection) in sequence 
                       with another monomer (of the same type!) in view mode
          Scenario:
          1. Clear canvas
          2. Load sequence from file (sequence contains monomers of necessary type)
          3. Double click symbol in the middle of sequence (that turns sequence into edit mode)
          4. Click on monomer from the library
          5. Take screenshot to validate that replacement work in Sequence mode canvas
          6. Switch to Flex mode
          7. Take screenshot to validate that replacement work in Flex mode canvas
          8. Add info to log if known bugs exist and skip test
        */
      await openFileAndAddToCanvasMacro(sequence.FileName, page);
      await selectAndReplaceSymbolInEditMode(
        page,
        replaceMonomer,
        sequence,
        sequence.ReplacementPositions.Center,
      );
      await takeEditorScreenshot(page);
      await selectFlexLayoutModeTool(page);
      await moveMouseAway(page);
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

for (const replaceMonomer of withSideConnectionReplaceMonomers) {
  for (const sequence of twoSequences) {
    test(`Case 22-${sequence.Id}-${replaceMonomer.Id}. Replace last symbol at ${sequence.SequenceName} on ${replaceMonomer.MonomerDescription} in edit mode`, async () => {
      /*
            Test case: https://github.com/epam/ketcher/issues/5290 - Test case 6
            Description: User can replace last symbol (of every type) connected to another sequence (via R3 side connection) in sequence 
                         with another monomer (of the same type!) in edit mode
            Scenario:
            1. Clear canvas
            2. Load sequence from file (sequence contains monomers of necessary type)
            3. Double click on the last symbol (that turns sequence into edit mode)
            4. Click on monomer from the library
            5. Take screenshot to validate that replacement work in Sequence mode canvas
            6. Switch to Flex mode
            7. Take screenshot to validate that replacement work in Flex mode canvas
            8. Add info to log if known bugs exist and skip test
          */
      await openFileAndAddToCanvasMacro(sequence.FileName, page);
      await selectAndReplaceSymbolInEditMode(
        page,
        replaceMonomer,
        sequence,
        sequence.ReplacementPositions.RightEnd,
      );
      await takeEditorScreenshot(page);
      await selectFlexLayoutModeTool(page);
      await moveMouseAway(page);
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

test(`23. Verify functionality of 'Cancel' option in warning modal window`, async () => {
  /*
        Test case: https://github.com/epam/ketcher/issues/5363 - Test case 23
        Description: Verify functionality of 'Cancel' option in warning modal window
        Scenario:
        1. Clear canvas
        2. Load sequence from file (sequence contains bases wrapped into one @ symbol)
        3. Click on the last symbol (to select it)
        4. Go to Peptide tab
        4. Click on monomer from the library (Cys_Bn) - Confirm you actions dialod opens
        5. Check if Confirm you actions dialod opened
        6. Click Cancel
        7. Take screenshot to validate that dialog closed and nothing changed

      */
  const sequence: ISequence = {
    Id: 7,
    FileName: 'KET/Sequence-Mode-Replacement/sequence of bases (nC6n5U).ket',
    SequenceName: 'sequence of bases (nC6n5U)',
    ReplacementPositions: { LeftEnd: 1, Center: 3, RightEnd: 5 },
    ConfirmationOnReplecement: true,
  };

  const replaceMonomer: IReplaceMonomer = {
    Id: <number>monomerIDs.peptide_Cys_Bn,
    MonomerType: 'Peptide',
    MonomerAlias: 'Cys_Bn',
    MonomerTestId: 'Cys_Bn___S-benzylcysteine',
    MonomerDescription: 'peptide (Cys_Bn)',
  };

  await openFileAndAddToCanvasMacro(sequence.FileName, page);
  await selectSequenceLayoutModeTool(page);
  await clickOnSequenceSymbolByIndex(
    page,
    sequence.ReplacementPositions.RightEnd,
  );
  await clickOnMonomerFromLibrary(page, replaceMonomer);

  const fullDialogMessage = page.getByText(
    'Symbol @ can represent multiple monomers, all of them are going to be deleted. Do you want to proceed?',
  );
  await expect(fullDialogMessage).toBeVisible();

  pressCancelInConfirmYourActionDialog(page);

  await takeEditorScreenshot(page);

  await checkForKnownBugs(
    replaceMonomer,
    sequence,
    sequence.ReplacementPositions.RightEnd,
  );
});

test(`24. Verify functionality of 'Cancel' option for multiple selected monomers`, async () => {
  /*
        Test case: https://github.com/epam/ketcher/issues/5363 - Test case 24
        Description: Verify functionality of 'Cancel' option for multiple selected monomers
        Scenario:
        1. Clear canvas
        2. Load sequence from file (sequence contains bases wrapped into one @ symbol)
        3. Select all symbol of target type (to select it)
        4. Go to Peptide tab
        4. Click on monomer from the library (Cys_Bn) - Confirm you actions dialod opens
        5. Check if Confirm you actions dialod opened
        6. Click Cancel
        7. Take screenshot to validate that dialog closed and nothing changed

      */
  const sequence: ISequence = {
    Id: 7,
    FileName: 'KET/Sequence-Mode-Replacement/sequence of bases (nC6n5U).ket',
    SequenceName: 'sequence of bases (nC6n5U)',
    ReplacementPositions: { LeftEnd: 1, Center: 3, RightEnd: 5 },
    ConfirmationOnReplecement: true,
  };

  const replaceMonomer: IReplaceMonomer = {
    Id: <number>monomerIDs.peptide_Cys_Bn,
    MonomerType: 'Peptide',
    MonomerAlias: 'Cys_Bn',
    MonomerTestId: 'Cys_Bn___S-benzylcysteine',
    MonomerDescription: 'peptide (Cys_Bn)',
  };

  await openFileAndAddToCanvasMacro(sequence.FileName, page);
  await selectSequenceLayoutModeTool(page);
  await page.keyboard.down('Shift');
  await clickOnSequenceSymbolByIndex(
    page,
    sequence.ReplacementPositions.LeftEnd,
  );
  await clickOnSequenceSymbolByIndex(
    page,
    sequence.ReplacementPositions.Center,
  );
  await clickOnSequenceSymbolByIndex(
    page,
    sequence.ReplacementPositions.RightEnd,
  );
  await page.keyboard.up('Shift');
  await clickOnMonomerFromLibrary(page, replaceMonomer);

  const fullDialogMessage = page.getByText(
    'Symbol @ can represent multiple monomers, all of them are going to be deleted. Do you want to proceed?',
  );
  await expect(fullDialogMessage).toBeVisible();

  pressCancelInConfirmYourActionDialog(page);

  await takeEditorScreenshot(page);

  await checkForKnownBugs(
    replaceMonomer,
    sequence,
    sequence.ReplacementPositions.RightEnd,
  );
});

test(`25. Verify undo/redo functionality after replacing monomers`, async () => {
  /*
        Test case: https://github.com/epam/ketcher/issues/5363 - Test case 25
        Description: Verify undo/redo functionality after replacing monomers
        Scenario:
        1. Clear canvas
        2. Load sequence from file (sequence contains bases wrapped into one @ symbol)
        3. Select all symbol of target type (to select it)
        4. Replace them with peptide (Cys_Bn)
        5. Take screenshot to validate that symbols has been replaced
        6. Press Undo button at toolbar
        7. Take screenshot to validate that all changes has been rolled back
      */
  const sequence: ISequence = {
    Id: 7,
    FileName: 'KET/Sequence-Mode-Replacement/sequence of bases (nC6n5U).ket',
    SequenceName: 'sequence of bases (nC6n5U)',
    ReplacementPositions: { LeftEnd: 1, Center: 3, RightEnd: 5 },
    ConfirmationOnReplecement: true,
  };

  const replaceMonomer: IReplaceMonomer = {
    Id: <number>monomerIDs.peptide_Cys_Bn,
    MonomerType: 'Peptide',
    MonomerAlias: 'Cys_Bn',
    MonomerTestId: 'Cys_Bn___S-benzylcysteine',
    MonomerDescription: 'peptide (Cys_Bn)',
  };

  await openFileAndAddToCanvasMacro(sequence.FileName, page);
  await selectAndReplaceAllSymbols(page, replaceMonomer, sequence);
  await takeEditorScreenshot(page);
  await pressUndoButton(page);
  await takeEditorScreenshot(page);

  await checkForKnownBugs(
    replaceMonomer,
    sequence,
    sequence.ReplacementPositions.RightEnd,
  );
});

test(`26. Copy and paste replaced monomers`, async () => {
  /*
        Test case: https://github.com/epam/ketcher/issues/5363 - Test case 26
        Description: Copy and paste replaced monomers
        Scenario:
        1. Clear canvas
        2. Load sequence from file (sequence contains bases wrapped into one @ symbol)
        3. Select all symbol of target type (to select it)
        4. Go to Peptide tab
        4. Click on monomer from the library (Cys_Bn) - Confirm you actions dialod opens
        5. Press Yes button
        6. Take screenshot to validate that symbols has been replaced
        7. Select that symbols again
        7. Press Ctrl+C to copy selected symbols
        8. Press Ctrl+P to paste them on the canvas
        9. Take screenshot to validate that all monomers appeared on the Sequence canvas
        10. Switch to Flex mode
        11. Take screenshot to validate that all monomers appeared on the Flex canvas
      */
  const sequence: ISequence = {
    Id: 7,
    FileName: 'KET/Sequence-Mode-Replacement/sequence of bases (nC6n5U).ket',
    SequenceName: 'sequence of bases (nC6n5U)',
    ReplacementPositions: { LeftEnd: 1, Center: 3, RightEnd: 5 },
    ConfirmationOnReplecement: true,
  };

  const replaceMonomer: IReplaceMonomer = {
    Id: <number>monomerIDs.peptide_Cys_Bn,
    MonomerType: 'Peptide',
    MonomerAlias: 'Cys_Bn',
    MonomerTestId: 'Cys_Bn___S-benzylcysteine',
    MonomerDescription: 'peptide (Cys_Bn)',
  };

  await openFileAndAddToCanvasMacro(sequence.FileName, page);
  await selectAndReplaceAllSymbols(page, replaceMonomer, sequence);
  await takeEditorScreenshot(page);
  await selectAllSymbols(page, sequence);
  await page.keyboard.press('Control+c');
  await page.keyboard.press('Control+v');
  await takeEditorScreenshot(page);
  await selectFlexLayoutModeTool(page);
  await takeEditorScreenshot(page);
  await checkForKnownBugs(
    replaceMonomer,
    sequence,
    sequence.ReplacementPositions.RightEnd,
  );
});

test(`27. Verify switching from Macro mode to Micro mode and back without data loss`, async () => {
  /*
        Test case: https://github.com/epam/ketcher/issues/5363 - Test case 27
        Description: Verify switching from Macro mode to Micro mode and back without data loss
        Scenario:
        1. Clear canvas
        2. Load sequence from file (sequence contains bases wrapped into one @ symbol)
        3. Select all symbol of target type (to select it)
        4. Replace them with peptide (Cys_Bn)
        5. Take screenshot to validate that symbols has been replaced
        6. Switch to Molecules mode
        7. Take screenshot to validate canvas looks correct
        8. Switch to Macromolecules mode
        9. Take screenshot to validate canvas looks correct
      */
  const sequence: ISequence = {
    Id: 7,
    FileName: 'KET/Sequence-Mode-Replacement/sequence of bases (nC6n5U).ket',
    SequenceName: 'sequence of bases (nC6n5U)',
    ReplacementPositions: { LeftEnd: 1, Center: 3, RightEnd: 5 },
    ConfirmationOnReplecement: true,
  };

  const replaceMonomer: IReplaceMonomer = {
    Id: <number>monomerIDs.peptide_Cys_Bn,
    MonomerType: 'Peptide',
    MonomerAlias: 'Cys_Bn',
    MonomerTestId: 'Cys_Bn___S-benzylcysteine',
    MonomerDescription: 'peptide (Cys_Bn)',
  };

  await openFileAndAddToCanvasMacro(sequence.FileName, page);
  await selectAndReplaceAllSymbols(page, replaceMonomer, sequence);
  await takeEditorScreenshot(page);
  await turnOnMicromoleculesEditor(page);
  await takeEditorScreenshot(page);
  await turnOnMacromoleculesEditor(page);
  await takeEditorScreenshot(page);

  await checkForKnownBugs(
    replaceMonomer,
    sequence,
    sequence.ReplacementPositions.RightEnd,
  );
});

test(`28. Verify saving and reopening a structure with replaced monomers in KET`, async () => {
  /*
        Test case: https://github.com/epam/ketcher/issues/5363 - Test case 27
        Description: Verify switching from Macro mode to Micro mode and back without data loss
        Scenario:
        1. Clear canvas
        2. Load sequence from file (sequence consists of preset_As)
        3. Select all symbol of target type (to select it)
        4. Replace them with preset (C)
        5. Take screenshot to validate that symbols has been replaced
        6. Save to KET
        7. Compate result with the template
      */

  await pageReload(page);

  const sequence: ISequence = {
    Id: 3,
    FileName: 'KET/Sequence-Mode-Replacement/sequence of presets (A).ket',
    SequenceName: 'sequence of presets (A)',
    ReplacementPositions: { LeftEnd: 1, Center: 2, RightEnd: 3 },
  };

  const replaceMonomer: IReplaceMonomer = {
    Id: <number>monomerIDs.preset_C,
    MonomerType: 'RNA',
    MonomerSubType: 'Presets',
    MonomerAlias: 'C',
    MonomerTestId: 'C_C_R_P',
    MonomerDescription: 'preset (C)',
  };

  await openFileAndAddToCanvasMacro(sequence.FileName, page);
  await selectAndReplaceAllSymbols(page, replaceMonomer, sequence);
  await takeEditorScreenshot(page);

  const expectedKetFile = await getKet(page);
  await saveToFile(
    'Common/Sequence-Mode-Replacement/replacement-expected.ket',
    expectedKetFile,
  );

  const { fileExpected: ketFileExpected, file: ketFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/Common/Sequence-Mode-Replacement/replacement-expected.ket',
    });

  expect(ketFile).toEqual(ketFileExpected);

  await checkForKnownBugs(
    replaceMonomer,
    sequence,
    sequence.ReplacementPositions.RightEnd,
  );
});

test(`29. Verify saving and reopening a structure with replaced monomers in MOL V3000`, async () => {
  /*
        Test case: https://github.com/epam/ketcher/issues/5363 - Test case 27
        Description: Verify switching from Macro mode to Micro mode and back without data loss
        Scenario:
        1. Clear canvas
        2. Load sequence from file (sequence consists of preset_As)
        3. Select all symbol of target type (to select it)
        4. Replace them with preset (C)
        5. Take screenshot to validate that symbols has been replaced
        6. Save to Mol v3000
        7. Compate result with the template
        */
  const sequence: ISequence = {
    Id: 3,
    FileName: 'KET/Sequence-Mode-Replacement/sequence of presets (A).ket',
    SequenceName: 'sequence of presets (A)',
    ReplacementPositions: { LeftEnd: 1, Center: 2, RightEnd: 3 },
  };

  const replaceMonomer: IReplaceMonomer = {
    Id: <number>monomerIDs.preset_C,
    MonomerType: 'RNA',
    MonomerSubType: 'Presets',
    MonomerAlias: 'C',
    MonomerTestId: 'C_C_R_P',
    MonomerDescription: 'preset (C)',
  };

  await openFileAndAddToCanvasMacro(sequence.FileName, page);
  await selectAndReplaceAllSymbols(page, replaceMonomer, sequence);
  await takeEditorScreenshot(page);

  const expectedFile = await getMolfile(page, 'v3000');
  await saveToFile(
    'tests/test-data/Common/Sequence-Mode-Replacement/replacement-expected.mol',
    expectedFile,
  );

  const METADATA_STRING_INDEX = [1];

  const { fileExpected: molFileExpected, file: molFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/Common/Sequence-Mode-Replacement/replacement-expected.mol',
      fileFormat: 'v3000',
      metaDataIndexes: METADATA_STRING_INDEX,
    });

  expect(molFile).toEqual(molFileExpected);

  await checkForKnownBugs(
    replaceMonomer,
    sequence,
    sequence.ReplacementPositions.RightEnd,
  );
});

test(`30. Verify saving and reopening a structure with replaced monomers in Sequence`, async () => {
  /*
        Test case: https://github.com/epam/ketcher/issues/5363 - Test case 27
        Description: Verify switching from Macro mode to Micro mode and back without data loss
        Scenario:
        1. Clear canvas
        2. Load sequence from file (sequence consists of preset_As)
        3. Select all symbol of target type (to select it)
        4. Replace them with preset (C)
        5. Take screenshot to validate that symbols has been replaced
        6. Save to Sequence
        7. Compate result with the template
        */
  const sequence: ISequence = {
    Id: 3,
    FileName: 'KET/Sequence-Mode-Replacement/sequence of presets (A).ket',
    SequenceName: 'sequence of presets (A)',
    ReplacementPositions: { LeftEnd: 1, Center: 2, RightEnd: 3 },
  };

  const replaceMonomer: IReplaceMonomer = {
    Id: <number>monomerIDs.preset_C,
    MonomerType: 'RNA',
    MonomerSubType: 'Presets',
    MonomerAlias: 'C',
    MonomerTestId: 'C_C_R_P',
    MonomerDescription: 'preset (C)',
  };

  await openFileAndAddToCanvasMacro(sequence.FileName, page);
  await selectAndReplaceAllSymbols(page, replaceMonomer, sequence);
  await takeEditorScreenshot(page);

  const expectedFile = await getSequence(page);
  await saveToFile(
    'Common/Sequence-Mode-Replacement/replacement-expected.seq',
    expectedFile,
  );

  const METADATA_STRING_INDEX = [1];

  const { fileExpected: sequenceFileExpected, file: sequenceFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/Common/Sequence-Mode-Replacement/replacement-expected.seq',
      metaDataIndexes: METADATA_STRING_INDEX,
    });

  expect(sequenceFile).toEqual(sequenceFileExpected);
  await checkForKnownBugs(
    replaceMonomer,
    sequence,
    sequence.ReplacementPositions.RightEnd,
  );
});

test(`31. Verify saving and reopening a structure with replaced monomers in FASTA`, async () => {
  /*
        Test case: https://github.com/epam/ketcher/issues/5363 - Test case 27
        Description: Verify switching from Macro mode to Micro mode and back without data loss
        Scenario:
        1. Clear canvas
        2. Load sequence from file (sequence consists of preset_As)
        3. Select all symbol of target type (to select it)
        4. Replace them with preset (C)
        5. Take screenshot to validate that symbols has been replaced
        9. Save to FASTA

      */
  const sequence: ISequence = {
    Id: 3,
    FileName: 'KET/Sequence-Mode-Replacement/sequence of presets (A).ket',
    SequenceName: 'sequence of presets (A)',
    ReplacementPositions: { LeftEnd: 1, Center: 2, RightEnd: 3 },
  };

  const replaceMonomer: IReplaceMonomer = {
    Id: <number>monomerIDs.preset_C,
    MonomerType: 'RNA',
    MonomerSubType: 'Presets',
    MonomerAlias: 'C',
    MonomerTestId: 'C_C_R_P',
    MonomerDescription: 'preset (C)',
  };

  await openFileAndAddToCanvasMacro(sequence.FileName, page);
  await selectAndReplaceAllSymbols(page, replaceMonomer, sequence);
  await takeEditorScreenshot(page);

  const expectedFile = await getFasta(page);
  await saveToFile(
    'Common/Sequence-Mode-Replacement/replacement-expected.fasta',
    expectedFile,
  );

  const METADATA_STRING_INDEX = [1];

  const { fileExpected: fastaFileExpected, file: fastaFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/Common/Sequence-Mode-Replacement/replacement-expected.fasta',
      metaDataIndexes: METADATA_STRING_INDEX,
    });

  expect(fastaFile).toEqual(fastaFileExpected);

  await checkForKnownBugs(
    replaceMonomer,
    sequence,
    sequence.ReplacementPositions.RightEnd,
  );
});

test(`32. Verify saving and reopening a structure with replaced monomers in IDT`, async () => {
  /*
        Test case: https://github.com/epam/ketcher/issues/5363 - Test case 27
        Description: Verify switching from Macro mode to Micro mode and back without data loss
        Scenario:
        1. Clear canvas
        2. Load sequence from file (sequence consists of preset_As)
        3. Select all symbol of target type (to select it)
        4. Replace them with preset (C)
        5. Take screenshot to validate that symbols has been replaced
        6. Save to KET
        7. Save to Mol v3000
        8. Save to Sequence
        9. Save to FASTA
        10. Save to IDT
        11. Save to HELM
      */
  const sequence: ISequence = {
    Id: 3,
    FileName: 'KET/Sequence-Mode-Replacement/sequence of presets (A).ket',
    SequenceName: 'sequence of presets (A)',
    ReplacementPositions: { LeftEnd: 1, Center: 2, RightEnd: 3 },
  };

  const replaceMonomer: IReplaceMonomer = {
    Id: <number>monomerIDs.preset_C,
    MonomerType: 'RNA',
    MonomerSubType: 'Presets',
    MonomerAlias: 'C',
    MonomerTestId: 'C_C_R_P',
    MonomerDescription: 'preset (C)',
  };

  await openFileAndAddToCanvasMacro(sequence.FileName, page);
  await selectAndReplaceAllSymbols(page, replaceMonomer, sequence);
  await takeEditorScreenshot(page);

  const expectedFile = await getIdt(page);
  await saveToFile(
    'Common/Sequence-Mode-Replacement/replacement-expected.idt',
    expectedFile,
  );

  const METADATA_STRING_INDEX = [1];

  const { fileExpected: idtFileExpected, file: idtFile } =
    await receiveFileComparisonData({
      page,
      expectedFileName:
        'tests/test-data/Common/Sequence-Mode-Replacement/replacement-expected.idt',
      metaDataIndexes: METADATA_STRING_INDEX,
    });

  expect(idtFile).toEqual(idtFileExpected);
  await checkForKnownBugs(
    replaceMonomer,
    sequence,
    sequence.ReplacementPositions.RightEnd,
  );
});
