/* eslint-disable no-magic-numbers */
import { expect, Page, test } from '@fixtures';
import {
  clickOnCanvas,
  copyToClipboardByKeyboard,
  MolFileFormat,
  Monomer,
  moveMouseAway,
  moveMouseToTheMiddleOfTheScreen,
  openFileAndAddToCanvasMacro,
  pasteFromClipboardByKeyboard,
  resetZoomLevelToDefault,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { pageReload } from '@utils/common/helpers';
import {
  pressCancelInConfirmYourActionDialog,
  pressYesInConfirmYourActionDialog,
} from '@utils/macromolecules/sequence';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { Preset } from '@tests/pages/constants/monomers/Presets';
import { Sugar } from '@tests/pages/constants/monomers/Sugars';
import { Base } from '@tests/pages/constants/monomers/Bases';
import { Phosphate } from '@tests/pages/constants/monomers/Phosphates';
import { Nucleotide } from '@tests/pages/constants/monomers/Nucleotides';
import { Chem } from '@tests/pages/constants/monomers/Chem';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';
import { keyboardPressOnCanvas } from '@utils/keyboard/index';
import { getSymbolLocator } from '@utils/macromolecules/monomer';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { ErrorMessageDialog } from '@tests/pages/common/ErrorMessageDialog';

let page: Page;

async function configureInitialState(page: Page) {
  await Library(page).switchToRNATab();
}

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();

  await waitForPageInit(page);
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await configureInitialState(page);
  // Creation of custom presets needed for testing
  await createTestPresets(page);
});

test.afterEach(async () => {
  await keyboardPressOnCanvas(page, 'Escape');
  await keyboardPressOnCanvas(page, 'Escape');
  await resetZoomLevelToDefault(page);
  await CommonTopLeftToolbar(page).clearCanvas();
  await resetZoomLevelToDefault(page);
});

test.afterAll(async ({ browser }) => {
  await Promise.all(browser.contexts().map((context) => context.close()));
});

interface IBaseReplaceMonomer {
  Id: number;
  MonomerDescription: string;
}

interface IStandardMonomer extends IBaseReplaceMonomer {
  Monomer: Monomer;
  IsCustomPreset?: false;
  MonomerAlias?: never;
  MonomerTestId?: never;
}

interface ICustomPresetMonomer extends IBaseReplaceMonomer {
  IsCustomPreset: true;
  MonomerAlias: string;
  MonomerTestId: string;
  Monomer?: never;
}

type IReplaceMonomer = IStandardMonomer | ICustomPresetMonomer;

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
    Monomer: Peptide.Cys_Bn,
    MonomerDescription: 'peptide (Cys_Bn)',
  },
  {
    Id: <number>monomerIDs.preset_C,
    Monomer: Preset.C,
    MonomerDescription: 'preset (C)',
  },
  {
    // Custom preset created at BeforeAll section
    Id: <number>monomerIDs.preset_R_P,
    MonomerAlias: 'R()P',
    MonomerTestId: 'R()P_._R_P',
    MonomerDescription: 'preset (R()P)',
    IsCustomPreset: true,
  },
  {
    // Custom preset created at BeforeAll section
    Id: <number>monomerIDs.preset_R_A,
    MonomerAlias: 'R(A)',
    MonomerTestId: 'R(A)_A_R_.',
    MonomerDescription: 'preset (R(A))',
    IsCustomPreset: true,
  },
  {
    Id: <number>monomerIDs.sugar_R,
    Monomer: Sugar.R,
    MonomerDescription: 'sugar (R)',
  },
  {
    Id: <number>monomerIDs.base_oC64m,
    Monomer: Base.oC64m5,
    MonomerDescription: 'base (oC64m5)',
  },
  {
    Id: <number>monomerIDs.phosphate_P,
    Monomer: Phosphate.P,
    MonomerDescription: 'phosphate (P)',
  },
  {
    Id: <number>monomerIDs.nucleotide_AmMC6T,
    Monomer: Nucleotide.AmMC6T,
    MonomerDescription: 'nucleotide (AmMC6T)',
  },
  {
    // Nucleotide without natural analog
    Id: <number>monomerIDs.nucleotide_5NitInd,
    Monomer: Nucleotide._5NitInd,
    MonomerDescription: 'nucleotide (5NitInd)',
  },
  {
    Id: <number>monomerIDs.CHEM_Mal,
    Monomer: Chem.Mal,
    MonomerDescription: 'CHEM (Mal)',
  },
];

const sequences: ISequence[] = [
  {
    Id: 1,
    FileName: 'KET/Sequence-Mode-Replacement/sequence of peptides (A).ket',
    SequenceName: 'sequence of peptides (A)',
    ReplacementPositions: { LeftEnd: 0, Center: 1, RightEnd: 2 },
  },
  {
    Id: 2,
    FileName:
      'KET/Sequence-Mode-Replacement/sequence of peptides w_o natural analog (4Abz).ket',
    SequenceName: 'sequence of peptides w/o natural analog (4Abz)',
    ReplacementPositions: { LeftEnd: 0, Center: 1, RightEnd: 2 },
  },
  {
    Id: 3,
    FileName: 'KET/Sequence-Mode-Replacement/sequence of presets (A).ket',
    SequenceName: 'sequence of presets (A)',
    ReplacementPositions: { LeftEnd: 0, Center: 1, RightEnd: 2 },
  },
  {
    Id: 4,
    FileName:
      'KET/Sequence-Mode-Replacement/sequence of presets without phosphate (SGNA(U)).ket',
    SequenceName: 'sequence of presets without phosphate (SGNA(U))',
    ReplacementPositions: { LeftEnd: 0, Center: 1, RightEnd: 2 },
  },
  {
    Id: 5,
    FileName:
      'KET/Sequence-Mode-Replacement/sequence of presets without base (SGNA()ibun).ket',
    SequenceName: 'sequence of presets without base (SGNA()ibun)',
    ReplacementPositions: { LeftEnd: 0, Center: 2, RightEnd: 4 },
    ConfirmationOnReplecement: true,
  },
  {
    Id: 6,
    FileName: 'KET/Sequence-Mode-Replacement/sequence of sugars (UNA).ket',
    SequenceName: 'sequence of sugars (UNA)',
    ReplacementPositions: { LeftEnd: 0, Center: 2, RightEnd: 4 },
    ConfirmationOnReplecement: true,
  },
  {
    Id: 7,
    FileName: 'KET/Sequence-Mode-Replacement/sequence of bases (nC6n5U).ket',
    SequenceName: 'sequence of bases (nC6n5U)',
    ReplacementPositions: { LeftEnd: 0, Center: 2, RightEnd: 4 },
    ConfirmationOnReplecement: true,
  },
  {
    Id: 8,
    FileName: 'KET/Sequence-Mode-Replacement/sequence of phosphates (moen).ket',
    SequenceName: 'sequence of phosphates (moen)',
    ReplacementPositions: { LeftEnd: 0, Center: 2, RightEnd: 4 },
    ConfirmationOnReplecement: true,
  },
  {
    Id: 9,
    FileName:
      'KET/Sequence-Mode-Replacement/sequence of unsplit nucleotides (2-Amino-dA).ket',
    SequenceName: 'sequence of unsplit nucleotides (2-Amino-dA)',
    ReplacementPositions: { LeftEnd: 0, Center: 1, RightEnd: 2 },
  },
  {
    Id: 10,
    FileName:
      'KET/Sequence-Mode-Replacement/sequence of unsplit nucleotides w_o natural analog (5NitInd).ket',
    SequenceName:
      'sequence of unsplit nucleotides w/o natural analog (5NitInd)',
    ReplacementPositions: { LeftEnd: 0, Center: 1, RightEnd: 2 },
  },
  {
    Id: 11,
    FileName: 'KET/Sequence-Mode-Replacement/sequence of CHEMs (A6OH).ket',
    SequenceName: 'sequence of CHEMs (A6OH)',
    ReplacementPositions: { LeftEnd: 0, Center: 2, RightEnd: 4 },
    ConfirmationOnReplecement: true,
  },
  {
    Id: 12,
    FileName:
      'KET/Sequence-Mode-Replacement/sequence of unresolved nucleotide (5Unres).ket',
    SequenceName: 'sequence of unresolved nucleotide (5Unres)',
    ReplacementPositions: { LeftEnd: 0, Center: 1, RightEnd: 2 },
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
  await Library(page).switchToRNATab();

  // Create preset without base
  await Library(page).newPreset();
  await Library(page).rnaBuilder.selectSugarSlot();
  await Library(page).selectMonomer(Sugar.R);

  await Library(page).rnaBuilder.selectPhosphateSlot();
  await Library(page).selectMonomer(Phosphate.P);

  await Library(page).rnaBuilder.addToPresets();

  // Create preset without phosphate
  await Library(page).newPreset();
  await Library(page).rnaBuilder.selectSugarSlot();
  await Library(page).selectMonomer(Sugar.R);

  await Library(page).rnaBuilder.selectBaseSlot();
  await Library(page).selectMonomer(Base.A);

  await Library(page).rnaBuilder.addToPresets();

  // Create preset 25mo3r(nC6n5C)Test-6-Ph
  await Library(page).newPreset();
  await Library(page).rnaBuilder.selectSugarSlot();
  await Library(page).selectMonomer(Sugar._25mo3r);

  await Library(page).rnaBuilder.selectBaseSlot();
  await Library(page).selectMonomer(Base.nC6n5C);

  await Library(page).rnaBuilder.selectPhosphateSlot();
  await Library(page).selectMonomer(Phosphate.Test_6_Ph);

  await Library(page).rnaBuilder.addToPresets();

  // Create preset 25mo3r(nC6n5C)
  await Library(page).newPreset();
  await Library(page).rnaBuilder.selectSugarSlot();
  await Library(page).selectMonomer(Sugar._25mo3r);

  await Library(page).rnaBuilder.selectBaseSlot();
  await Library(page).selectMonomer(Base.nC6n5C);

  await Library(page).rnaBuilder.addToPresets();

  // Create preset 25mo3r()Test-6-Ph
  await Library(page).newPreset();
  await Library(page).rnaBuilder.selectSugarSlot();
  await Library(page).selectMonomer(Sugar._25mo3r);

  await Library(page).rnaBuilder.selectPhosphateSlot();
  await Library(page).selectMonomer(Phosphate.Test_6_Ph);

  await Library(page).rnaBuilder.addToPresets();
}

async function clickOnMonomerFromLibrary(page: Page, monomer: IReplaceMonomer) {
  if (monomer.IsCustomPreset) {
    await Library(page).selectCustomPreset(monomer.MonomerTestId);
  } else {
    await Library(page).selectMonomer(monomer.Monomer);
  }
}

async function selectAndReplaceSymbol(
  page: Page,
  replaceMonomer: IReplaceMonomer,
  sequence: ISequence,
  replacementPosition: number,
) {
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(
    LayoutMode.Sequence,
  );
  await getSymbolLocator(page, {
    nodeIndexOverall: replacementPosition,
  }).click();
  await clickOnMonomerFromLibrary(page, replaceMonomer);
  if (sequence.ConfirmationOnReplecement) {
    await pressYesInConfirmYourActionDialog(page);
  }
}

async function selectAndReplaceSymbolWithError(
  page: Page,
  replaceMonomer: IReplaceMonomer,
  replacementPosition: number,
) {
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(
    LayoutMode.Sequence,
  );
  await getSymbolLocator(page, {
    nodeIndexOverall: replacementPosition,
  }).click();
  await clickOnMonomerFromLibrary(page, replaceMonomer);
}

async function selectAndReplaceAllSymbols(
  page: Page,
  replaceMonomer: IReplaceMonomer,
  sequence: ISequence,
) {
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(
    LayoutMode.Sequence,
  );

  await page.keyboard.down('Shift');
  await getSymbolLocator(page, {
    nodeIndexOverall: sequence.ReplacementPositions.LeftEnd,
  }).click();
  await getSymbolLocator(page, {
    nodeIndexOverall: sequence.ReplacementPositions.Center,
  }).click();
  await getSymbolLocator(page, {
    nodeIndexOverall: sequence.ReplacementPositions.RightEnd,
  }).click();
  await page.keyboard.up('Shift');

  await clickOnMonomerFromLibrary(page, replaceMonomer);
  if (sequence.ConfirmationOnReplecement) {
    await pressYesInConfirmYourActionDialog(page);
  }
}

async function selectAllSymbols(page: Page, sequence: ISequence) {
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(
    LayoutMode.Sequence,
  );

  await page.keyboard.down('Shift');
  await getSymbolLocator(page, {
    nodeIndexOverall: sequence.ReplacementPositions.LeftEnd,
  }).click();
  await getSymbolLocator(page, {
    nodeIndexOverall: sequence.ReplacementPositions.Center,
  }).click();
  await getSymbolLocator(page, {
    nodeIndexOverall: sequence.ReplacementPositions.RightEnd,
  }).click();
  await page.keyboard.up('Shift');
}

async function selectAndReplaceAllSymbolsWithError(
  page: Page,
  replaceMonomer: IReplaceMonomer,
  sequence: ISequence,
) {
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(
    LayoutMode.Sequence,
  );
  await selectAllSymbols(page, sequence);
  await clickOnMonomerFromLibrary(page, replaceMonomer);
}

async function selectAndReplaceAllSymbolsInEditMode(
  page: Page,
  replaceMonomer: IReplaceMonomer,
  sequence: ISequence,
) {
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(
    LayoutMode.Sequence,
  );

  await page.keyboard.down('Shift');
  await getSymbolLocator(page, {
    nodeIndexOverall: sequence.ReplacementPositions.LeftEnd,
  }).click();
  await getSymbolLocator(page, {
    nodeIndexOverall: sequence.ReplacementPositions.Center,
  }).click();
  await getSymbolLocator(page, {
    nodeIndexOverall: sequence.ReplacementPositions.RightEnd,
  }).dblclick();
  await page.keyboard.up('Shift');

  await clickOnMonomerFromLibrary(page, replaceMonomer);
  if (sequence.ConfirmationOnReplecement) {
    await pressYesInConfirmYourActionDialog(page);
  }
}

async function selectAndReplaceAllSymbolsInEditModeWithError(
  page: Page,
  replaceMonomer: IReplaceMonomer,
  sequence: ISequence,
) {
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(
    LayoutMode.Sequence,
  );

  await page.keyboard.down('Shift');
  await getSymbolLocator(page, {
    nodeIndexOverall: sequence.ReplacementPositions.LeftEnd,
  }).click();
  await getSymbolLocator(page, {
    nodeIndexOverall: sequence.ReplacementPositions.Center,
  }).click();
  await getSymbolLocator(page, {
    nodeIndexOverall: sequence.ReplacementPositions.RightEnd,
  }).dblclick();
  await page.keyboard.up('Shift');

  await clickOnMonomerFromLibrary(page, replaceMonomer);
}

async function selectAndReplaceSymbolInEditMode(
  page: Page,
  replaceMonomer: IReplaceMonomer,
  sequence: ISequence,
  replacementPosition: number,
) {
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(
    LayoutMode.Sequence,
  );
  await getSymbolLocator(page, {
    nodeIndexOverall: replacementPosition,
  }).dblclick();
  await clickOnMonomerFromLibrary(page, replaceMonomer);
  if (sequence.ConfirmationOnReplecement) {
    await pressYesInConfirmYourActionDialog(page);
  }
  await moveMouseToTheMiddleOfTheScreen(page);
  await clickOnCanvas(page, 400, 400, { from: 'pageTopLeft' });
}

async function selectAndReplaceSymbolInEditModeWithError(
  page: Page,
  replaceMonomer: IReplaceMonomer,
  replacementPosition: number,
) {
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(
    LayoutMode.Sequence,
  );
  await getSymbolLocator(page, {
    nodeIndexOverall: replacementPosition,
  }).dblclick();
  await clickOnMonomerFromLibrary(page, replaceMonomer);
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
      await openFileAndAddToCanvasMacro(page, sequence.FileName);
      await selectAndReplaceSymbol(
        page,
        replaceMonomer,
        sequence,
        sequence.ReplacementPositions.LeftEnd,
      );
      await moveMouseAway(page);
      await takeEditorScreenshot(page, { hideMonomerPreview: true });
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Flex,
      );

      await takeEditorScreenshot(page, { hideMonomerPreview: true });

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
      await openFileAndAddToCanvasMacro(page, sequence.FileName);
      await selectAndReplaceSymbol(
        page,
        replaceMonomer,
        sequence,
        sequence.ReplacementPositions.Center,
      );
      await moveMouseAway(page);
      await takeEditorScreenshot(page, { hideMonomerPreview: true });
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Flex,
      );

      await takeEditorScreenshot(page, { hideMonomerPreview: true });

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
      await openFileAndAddToCanvasMacro(page, sequence.FileName);
      await selectAndReplaceSymbol(
        page,
        replaceMonomer,
        sequence,
        sequence.ReplacementPositions.RightEnd,
      );
      await moveMouseAway(page);
      await takeEditorScreenshot(page, { hideMonomerPreview: true });
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Flex,
      );

      await takeEditorScreenshot(page, { hideMonomerPreview: true });

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
      await openFileAndAddToCanvasMacro(page, sequence.FileName);
      await selectAndReplaceSymbolInEditMode(
        page,
        replaceMonomer,
        sequence,
        sequence.ReplacementPositions.LeftEnd,
      );
      await takeEditorScreenshot(page, { hideMonomerPreview: true });
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Flex,
      );
      await takeEditorScreenshot(page, { hideMonomerPreview: true });

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
      await openFileAndAddToCanvasMacro(page, sequence.FileName);
      await selectAndReplaceSymbolInEditMode(
        page,
        replaceMonomer,
        sequence,
        sequence.ReplacementPositions.Center,
      );

      await takeEditorScreenshot(page, { hideMonomerPreview: true });
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Flex,
      );

      await takeEditorScreenshot(page, { hideMonomerPreview: true });

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
      await openFileAndAddToCanvasMacro(page, sequence.FileName);
      await selectAndReplaceSymbolInEditMode(
        page,
        replaceMonomer,
        sequence,
        sequence.ReplacementPositions.RightEnd,
      );

      await takeEditorScreenshot(page, { hideMonomerPreview: true });
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Flex,
      );

      await takeEditorScreenshot(page, { hideMonomerPreview: true });

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
    Monomer: Peptide.Ala_al,
    MonomerDescription: 'peptide w/o R2 (Ala-al)',
  },
  {
    Id: 12,
    Monomer: Peptide._NHBn,
    MonomerDescription: 'peptide w/o natural analog w/o R2 (-NHBn)',
  },
  {
    Id: 13,
    Monomer: Base._5meC,
    MonomerDescription: 'base w/o R2 (5meC)',
  },
  {
    Id: 14,
    Monomer: Chem.Az,
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
      await openFileAndAddToCanvasMacro(page, sequence.FileName);
      await selectAndReplaceSymbolWithError(
        page,
        noR2ConnectionPointReplaceMonomer,
        sequence.ReplacementPositions.LeftEnd,
      );

      const fullErrorMessage = page.getByText(
        'It is impossible to merge fragments. Attachment point to establish bonds are not available.',
      );
      await expect(fullErrorMessage).toBeVisible();

      await ErrorMessageDialog(page).close();
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
    Monomer: Peptide.D_OAla,
    MonomerDescription: 'peptide w/o R1 (D-OAla)',
  },
  {
    Id: <number>monomerIDs.peptide_w_o_R1_Boc_,
    Monomer: Peptide.Boc_,
    MonomerDescription: 'peptide w/o R1 (Boc-)',
  },
  {
    Id: <number>monomerIDs.sugar_w_o_R1_5cGT,
    Monomer: Sugar._5cGT,
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

      await openFileAndAddToCanvasMacro(page, sequence.FileName);
      await selectAndReplaceSymbolWithError(
        page,
        noR1orR2ConnectionPointReplaceMonomer,
        sequence.ReplacementPositions.Center,
      );

      const fullErrorMessage = page.getByText(
        'It is impossible to merge fragments. Attachment point to establish bonds are not available.',
      );
      await expect(fullErrorMessage).toBeVisible();

      await ErrorMessageDialog(page).close();
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

      await openFileAndAddToCanvasMacro(page, sequence.FileName);
      await selectAndReplaceSymbolWithError(
        page,
        noR1ConnectionPointReplaceMonomer,
        sequence.ReplacementPositions.RightEnd,
      );

      const fullErrorMessage = page.getByText(
        'It is impossible to merge fragments. Attachment point to establish bonds are not available.',
      );
      await expect(fullErrorMessage).toBeVisible();

      await ErrorMessageDialog(page).close();
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
      await openFileAndAddToCanvasMacro(page, sequence.FileName);
      await selectAndReplaceSymbolInEditModeWithError(
        page,
        noR2ConnectionPointReplaceMonomer,
        sequence.ReplacementPositions.LeftEnd,
      );

      const fullErrorMessage = page.getByText(
        'It is impossible to merge fragments. Attachment point to establish bonds are not available.',
      );
      await expect(fullErrorMessage).toBeVisible();

      await ErrorMessageDialog(page).close();
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

      await openFileAndAddToCanvasMacro(page, sequence.FileName);
      await selectAndReplaceSymbolWithError(
        page,
        noR1orR2ConnectionPointReplaceMonomer,
        sequence.ReplacementPositions.Center,
      );

      const fullErrorMessage = page.getByText(
        'It is impossible to merge fragments. Attachment point to establish bonds are not available.',
      );
      await expect(fullErrorMessage).toBeVisible();

      await ErrorMessageDialog(page).close();
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

      await openFileAndAddToCanvasMacro(page, sequence.FileName);
      await selectAndReplaceSymbolWithError(
        page,
        noR1ConnectionPointReplaceMonomer,
        sequence.ReplacementPositions.RightEnd,
      );

      const fullErrorMessage = page.getByText(
        'It is impossible to merge fragments. Attachment point to establish bonds are not available.',
      );
      await expect(fullErrorMessage).toBeVisible();

      await ErrorMessageDialog(page).close();
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
      await openFileAndAddToCanvasMacro(page, sequence.FileName);
      await selectAndReplaceAllSymbols(page, replaceMonomer, sequence);

      await moveMouseAway(page);
      await takeEditorScreenshot(page, { hideMonomerPreview: true });
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Flex,
      );

      await takeEditorScreenshot(page, { hideMonomerPreview: true });

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
      await openFileAndAddToCanvasMacro(page, sequence.FileName);
      await selectAndReplaceAllSymbolsInEditMode(
        page,
        replaceMonomer,
        sequence,
      );

      await moveMouseAway(page);
      await takeEditorScreenshot(page, { hideMonomerPreview: true });
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Flex,
      );

      await takeEditorScreenshot(page, { hideMonomerPreview: true });

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

      await openFileAndAddToCanvasMacro(page, sequence.FileName);
      await selectAndReplaceAllSymbolsWithError(
        page,
        noR1ConnectionPointReplaceMonomer,
        sequence,
      );

      const fullErrorMessage = page.getByText(
        'It is impossible to merge fragments. Attachment point to establish bonds are not available.',
      );
      await expect(fullErrorMessage).toBeVisible();

      await ErrorMessageDialog(page).close();
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

      await openFileAndAddToCanvasMacro(page, sequence.FileName);
      await selectAndReplaceAllSymbolsInEditModeWithError(
        page,
        noR1ConnectionPointReplaceMonomer,
        sequence,
      );

      const fullErrorMessage = page.getByText(
        'It is impossible to merge fragments. Attachment point to establish bonds are not available.',
      );
      await expect(fullErrorMessage).toBeVisible();

      await ErrorMessageDialog(page).close();
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
    ReplacementPositions: { LeftEnd: 0, Center: 1, RightEnd: 2 },
  },
  {
    Id: 14,
    FileName:
      'KET/Sequence-Mode-Replacement/base to base connected two sequences of presets (U).ket',
    SequenceName: 'base to base connected two sequences of presets (U)',
    ReplacementPositions: { LeftEnd: 0, Center: 1, RightEnd: 2 },
  },
  {
    Id: 15,
    FileName:
      'KET/Sequence-Mode-Replacement/base to sugar connected two sequences of presets (U) w_o phosphate.ket',
    SequenceName:
      'base to sugar connected two sequences of presets (U) w_o phosphate',
    ReplacementPositions: { LeftEnd: 0, Center: 1, RightEnd: 2 },
  },
  {
    Id: 16,
    FileName:
      'KET/Sequence-Mode-Replacement/base to sugar connected two sequences of presets (U).ket',
    SequenceName: 'base to sugar connected two sequences of presets (U)',
    ReplacementPositions: { LeftEnd: 0, Center: 1, RightEnd: 2 },
  },
  {
    Id: 17,
    FileName:
      'KET/Sequence-Mode-Replacement/phosphate to base connected two sequences of presets (U).ket',
    SequenceName: 'phosphate to base connected two sequences of presets (U)',
    ReplacementPositions: { LeftEnd: 0, Center: 1, RightEnd: 2 },
  },
  {
    Id: 18,
    FileName:
      'KET/Sequence-Mode-Replacement/phosphate to phosphate connected two sequences of presets (U) w_o base.ket',
    SequenceName:
      'phosphate to phosphate connected two sequences of presets (U) w_o base',
    ReplacementPositions: { LeftEnd: 0, Center: 2, RightEnd: 4 },
    ConfirmationOnReplecement: true,
  },
  {
    Id: 19,
    FileName:
      'KET/Sequence-Mode-Replacement/phosphate to phosphate connected two sequences of presets (U).ket',
    SequenceName:
      'phosphate to phosphate connected two sequences of presets (U)',
    ReplacementPositions: { LeftEnd: 0, Center: 1, RightEnd: 2 },
  },
  {
    Id: 20,
    FileName:
      'KET/Sequence-Mode-Replacement/phosphate to sugar connected two sequences of presets (U) w_o base.ket',
    SequenceName:
      'phosphate to sugar connected two sequences of presets (U) w_o base',
    ReplacementPositions: { LeftEnd: 0, Center: 2, RightEnd: 4 },
    ConfirmationOnReplecement: true,
  },
  {
    Id: 21,
    FileName:
      'KET/Sequence-Mode-Replacement/phosphate to sugar connected two sequences of presets (U).ket',
    SequenceName: 'phosphate to sugar connected two sequences of presets (U)',
    ReplacementPositions: { LeftEnd: 0, Center: 1, RightEnd: 2 },
  },
  {
    Id: 22,
    FileName:
      'KET/Sequence-Mode-Replacement/two sequence of unsplit nucleotides (AmMC6T).ket',
    SequenceName: 'two sequence of unsplit nucleotides (AmMC6T)',
    ReplacementPositions: { LeftEnd: 0, Center: 1, RightEnd: 2 },
  },
  {
    Id: 23,
    FileName:
      'KET/Sequence-Mode-Replacement/two sequences of bases (nC6n5U).ket',
    SequenceName: 'two sequences of bases (nC6n5U)',
    ReplacementPositions: { LeftEnd: 0, Center: 2, RightEnd: 4 },
    ConfirmationOnReplecement: true,
  },
  {
    Id: 24,
    FileName:
      'KET/Sequence-Mode-Replacement/two sequences of CHEMs (4aPEGMal).ket',
    SequenceName: 'two sequences of CHEMs (4aPEGMal)',
    ReplacementPositions: { LeftEnd: 0, Center: 2, RightEnd: 4 },
    ConfirmationOnReplecement: true,
  },
  {
    Id: 25,
    FileName:
      'KET/Sequence-Mode-Replacement/two sequences of peptides (D-gGlu).ket',
    SequenceName: 'two sequences of peptides (D-gGlu)',
    ReplacementPositions: { LeftEnd: 0, Center: 1, RightEnd: 2 },
  },
  {
    Id: 26,
    FileName:
      'KET/Sequence-Mode-Replacement/two sequences of peptides w_o natural analog (Apm).ket',
    SequenceName: 'two sequences of peptides w_o natural analog (Apm)',
    ReplacementPositions: { LeftEnd: 0, Center: 1, RightEnd: 2 },
  },
  {
    Id: 27,
    FileName:
      'KET/Sequence-Mode-Replacement/two sequences of phosphates (Test-6-Ph).ket',
    SequenceName: 'two sequences of phosphates (Test-6-Ph)',
    ReplacementPositions: { LeftEnd: 0, Center: 2, RightEnd: 4 },
    ConfirmationOnReplecement: true,
  },
  {
    Id: 28,
    FileName: 'KET/Sequence-Mode-Replacement/two sequences of sugars (5A6).ket',
    SequenceName: 'two sequences of sugars (5A6)',
    ReplacementPositions: { LeftEnd: 0, Center: 2, RightEnd: 4 },
    ConfirmationOnReplecement: true,
  },
  {
    Id: 29,
    FileName:
      'KET/Sequence-Mode-Replacement/two sequences of unresolved nucleotide (5Unres).ket',
    SequenceName: 'two sequences of unresolved nucleotide (5Unres)',
    ReplacementPositions: { LeftEnd: 0, Center: 1, RightEnd: 2 },
  },
];

const withSideConnectionReplaceMonomers: IReplaceMonomer[] = [
  {
    Id: 11,
    Monomer: Peptide.Hcy,
    MonomerDescription: 'peptide (Hcy)',
  },
  {
    Id: 12,
    Monomer: Peptide.Test_6_P,
    MonomerDescription: 'peptide w/o natural analog(Test-6-P)',
  },
  {
    // Custom preset created at BeforeAll section
    Id: 13,
    MonomerAlias: '25mo3r(nC6n5C)Test-6-Ph',
    MonomerTestId: '25mo3r(nC6n5C)Test-6-Ph_nC6n5C_25mo3r_Test-6-Ph',
    MonomerDescription: 'preset (25mo3r(nC6n5C)Test-6-Ph)',
    IsCustomPreset: true,
  },
  {
    // Custom preset created at BeforeAll section
    Id: 14,
    MonomerAlias: '25mo3r(nC6n5C)',
    MonomerTestId: '25mo3r(nC6n5C)_nC6n5C_25mo3r_.',
    MonomerDescription: 'preset w/o phosphate (25mo3r(nC6n5C))',
    IsCustomPreset: true,
  },
  {
    // Custom preset created at BeforeAll section
    Id: 15,
    MonomerAlias: '25mo3r()Test-6-Ph',
    MonomerTestId: '25mo3r()Test-6-Ph_._25mo3r_Test-6-Ph',
    MonomerDescription: 'preset without base (25mo3r()Test-6-Ph)',
    IsCustomPreset: true,
  },
  {
    Id: 16,
    Monomer: Sugar._5formD,
    MonomerDescription: 'sugar (5formD)',
  },
  {
    Id: 17,
    Monomer: Base.nC6n2G,
    MonomerDescription: 'base (nC6n2G)',
  },
  {
    Id: 18,
    Monomer: Phosphate.Test_6_Ph,
    MonomerDescription: 'phosphate (Test-6-Ph)',
  },
  {
    Id: 19,
    Monomer: Nucleotide.AmMC6T,
    MonomerDescription: 'nucleotide (AmMC6T)',
  },
  {
    Id: 20,
    Monomer: Chem.sDBL,
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

      await openFileAndAddToCanvasMacro(page, sequence.FileName);
      await selectAndReplaceSymbol(
        page,
        replaceMonomer,
        sequence,
        sequence.ReplacementPositions.LeftEnd,
      );

      await moveMouseAway(page);
      await takeEditorScreenshot(page, { hideMonomerPreview: true });
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Flex,
      );

      await takeEditorScreenshot(page, { hideMonomerPreview: true });

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

      await openFileAndAddToCanvasMacro(page, sequence.FileName);
      await selectAndReplaceSymbol(
        page,
        replaceMonomer,
        sequence,
        sequence.ReplacementPositions.Center,
      );

      await moveMouseAway(page);
      await takeEditorScreenshot(page, { hideMonomerPreview: true });
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Flex,
      );

      await takeEditorScreenshot(page, { hideMonomerPreview: true });

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

      await openFileAndAddToCanvasMacro(page, sequence.FileName);
      await selectAndReplaceSymbol(
        page,
        replaceMonomer,
        sequence,
        sequence.ReplacementPositions.RightEnd,
      );

      await moveMouseAway(page);
      await takeEditorScreenshot(page, { hideMonomerPreview: true });
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Flex,
      );
      await moveMouseAway(page);

      await takeEditorScreenshot(page, { hideMonomerPreview: true });

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
      await openFileAndAddToCanvasMacro(page, sequence.FileName);
      await selectAndReplaceSymbolInEditMode(
        page,
        replaceMonomer,
        sequence,
        sequence.ReplacementPositions.LeftEnd,
      );

      await takeEditorScreenshot(page, { hideMonomerPreview: true });
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Flex,
      );

      await takeEditorScreenshot(page, { hideMonomerPreview: true });

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
      await openFileAndAddToCanvasMacro(page, sequence.FileName);
      await selectAndReplaceSymbolInEditMode(
        page,
        replaceMonomer,
        sequence,
        sequence.ReplacementPositions.Center,
      );

      await takeEditorScreenshot(page, { hideMonomerPreview: true });
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Flex,
      );

      await takeEditorScreenshot(page, { hideMonomerPreview: true });

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
      await openFileAndAddToCanvasMacro(page, sequence.FileName);
      await selectAndReplaceSymbolInEditMode(
        page,
        replaceMonomer,
        sequence,
        sequence.ReplacementPositions.RightEnd,
      );

      await takeEditorScreenshot(page, { hideMonomerPreview: true });
      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Flex,
      );

      await takeEditorScreenshot(page, { hideMonomerPreview: true });

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
    ReplacementPositions: { LeftEnd: 0, Center: 2, RightEnd: 4 },
    ConfirmationOnReplecement: true,
  };

  const replaceMonomer: IReplaceMonomer = {
    Id: <number>monomerIDs.peptide_Cys_Bn,
    Monomer: Peptide.Cys_Bn,
    MonomerDescription: 'peptide (Cys_Bn)',
  };

  await openFileAndAddToCanvasMacro(page, sequence.FileName);
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(
    LayoutMode.Sequence,
  );
  await getSymbolLocator(page, {
    nodeIndexOverall: sequence.ReplacementPositions.RightEnd,
  }).click();
  await clickOnMonomerFromLibrary(page, replaceMonomer);

  const fullDialogMessage = page.getByText(
    'Symbol @ can represent multiple monomers, all of them are going to be deleted. Do you want to proceed?',
  );
  await expect(fullDialogMessage).toBeVisible();

  pressCancelInConfirmYourActionDialog(page);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });

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
    ReplacementPositions: { LeftEnd: 0, Center: 2, RightEnd: 4 },
    ConfirmationOnReplecement: true,
  };

  const replaceMonomer: IReplaceMonomer = {
    Id: <number>monomerIDs.peptide_Cys_Bn,
    Monomer: Peptide.Cys_Bn,
    MonomerDescription: 'peptide (Cys_Bn)',
  };

  await openFileAndAddToCanvasMacro(page, sequence.FileName);
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(
    LayoutMode.Sequence,
  );
  await page.keyboard.down('Shift');
  await getSymbolLocator(page, {
    nodeIndexOverall: sequence.ReplacementPositions.LeftEnd,
  }).click();
  await getSymbolLocator(page, {
    nodeIndexOverall: sequence.ReplacementPositions.Center,
  }).click();
  await getSymbolLocator(page, {
    nodeIndexOverall: sequence.ReplacementPositions.RightEnd,
  }).click();
  await page.keyboard.up('Shift');
  await clickOnMonomerFromLibrary(page, replaceMonomer);

  const fullDialogMessage = page.getByText(
    'Symbol @ can represent multiple monomers, all of them are going to be deleted. Do you want to proceed?',
  );
  await expect(fullDialogMessage).toBeVisible();

  pressCancelInConfirmYourActionDialog(page);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });

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
    ReplacementPositions: { LeftEnd: 0, Center: 2, RightEnd: 4 },
    ConfirmationOnReplecement: true,
  };

  const replaceMonomer: IReplaceMonomer = {
    Id: <number>monomerIDs.peptide_Cys_Bn,
    Monomer: Peptide.Cys_Bn,
    MonomerDescription: 'peptide (Cys_Bn)',
  };

  await openFileAndAddToCanvasMacro(page, sequence.FileName);
  await selectAndReplaceAllSymbols(page, replaceMonomer, sequence);

  await takeEditorScreenshot(page, { hideMonomerPreview: true });
  await CommonTopLeftToolbar(page).undo();

  await takeEditorScreenshot(page, { hideMonomerPreview: true });

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
    ReplacementPositions: { LeftEnd: 0, Center: 2, RightEnd: 4 },
    ConfirmationOnReplecement: true,
  };

  const replaceMonomer: IReplaceMonomer = {
    Id: <number>monomerIDs.peptide_Cys_Bn,
    Monomer: Peptide.Cys_Bn,
    MonomerDescription: 'peptide (Cys_Bn)',
  };

  await openFileAndAddToCanvasMacro(page, sequence.FileName);
  await selectAndReplaceAllSymbols(page, replaceMonomer, sequence);

  await takeEditorScreenshot(page, { hideMonomerPreview: true });
  await selectAllSymbols(page, sequence);
  await copyToClipboardByKeyboard(page);
  await pasteFromClipboardByKeyboard(page);

  await takeEditorScreenshot(page, { hideMonomerPreview: true });
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);

  await takeEditorScreenshot(page, { hideMonomerPreview: true });
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
    ReplacementPositions: { LeftEnd: 0, Center: 2, RightEnd: 4 },
    ConfirmationOnReplecement: true,
  };

  const replaceMonomer: IReplaceMonomer = {
    Id: <number>monomerIDs.peptide_Cys_Bn,
    Monomer: Peptide.Cys_Bn,
    MonomerDescription: 'peptide (Cys_Bn)',
  };

  await openFileAndAddToCanvasMacro(page, sequence.FileName);
  await selectAndReplaceAllSymbols(page, replaceMonomer, sequence);

  await takeEditorScreenshot(page, { hideMonomerPreview: true });
  await CommonTopRightToolbar(page).turnOnMicromoleculesEditor();
  await takeEditorScreenshot(page, { hideMonomerPreview: true });
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await takeEditorScreenshot(page, { hideMonomerPreview: true });

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
    ReplacementPositions: { LeftEnd: 0, Center: 1, RightEnd: 2 },
  };

  const replaceMonomer: IReplaceMonomer = {
    Id: <number>monomerIDs.preset_C,
    Monomer: Preset.C,
    MonomerDescription: 'preset (C)',
  };

  await openFileAndAddToCanvasMacro(page, sequence.FileName);
  await selectAndReplaceAllSymbols(page, replaceMonomer, sequence);

  await takeEditorScreenshot(page, { hideMonomerPreview: true });

  await verifyFileExport(
    page,
    'Common/Sequence-Mode-Replacement/replacement-expected.ket',
    FileType.KET,
  );

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
    ReplacementPositions: { LeftEnd: 0, Center: 1, RightEnd: 2 },
  };

  const replaceMonomer: IReplaceMonomer = {
    Id: <number>monomerIDs.preset_C,
    Monomer: Preset.C,
    MonomerDescription: 'preset (C)',
  };

  await openFileAndAddToCanvasMacro(page, sequence.FileName);
  await selectAndReplaceAllSymbols(page, replaceMonomer, sequence);

  await takeEditorScreenshot(page, { hideMonomerPreview: true });

  verifyFileExport(
    page,
    'Common/Sequence-Mode-Replacement/replacement-expected.mol',
    FileType.MOL,
    MolFileFormat.v3000,
    [1],
  );

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
    ReplacementPositions: { LeftEnd: 0, Center: 1, RightEnd: 2 },
  };

  const replaceMonomer: IReplaceMonomer = {
    Id: <number>monomerIDs.preset_C,
    Monomer: Preset.C,
    MonomerDescription: 'preset (C)',
  };

  await openFileAndAddToCanvasMacro(page, sequence.FileName);
  await selectAndReplaceAllSymbols(page, replaceMonomer, sequence);

  await takeEditorScreenshot(page, { hideMonomerPreview: true });

  await verifyFileExport(
    page,
    'Common/Sequence-Mode-Replacement/replacement-expected.seq',
    FileType.SEQ,
  );
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
    ReplacementPositions: { LeftEnd: 0, Center: 1, RightEnd: 2 },
  };

  const replaceMonomer: IReplaceMonomer = {
    Id: <number>monomerIDs.preset_C,
    Monomer: Preset.C,
    MonomerDescription: 'preset (C)',
  };

  await openFileAndAddToCanvasMacro(page, sequence.FileName);
  await selectAndReplaceAllSymbols(page, replaceMonomer, sequence);

  await takeEditorScreenshot(page, { hideMonomerPreview: true });

  await verifyFileExport(
    page,
    'Common/Sequence-Mode-Replacement/replacement-expected.fasta',
    FileType.FASTA,
  );

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
    ReplacementPositions: { LeftEnd: 0, Center: 1, RightEnd: 2 },
  };

  const replaceMonomer: IReplaceMonomer = {
    Id: <number>monomerIDs.preset_C,
    Monomer: Preset.C,
    MonomerDescription: 'preset (C)',
  };

  await openFileAndAddToCanvasMacro(page, sequence.FileName);
  await selectAndReplaceAllSymbols(page, replaceMonomer, sequence);

  await takeEditorScreenshot(page, { hideMonomerPreview: true });
  await verifyFileExport(
    page,
    'Common/Sequence-Mode-Replacement/replacement-expected.idt',
    FileType.IDT,
  );
  await checkForKnownBugs(
    replaceMonomer,
    sequence,
    sequence.ReplacementPositions.RightEnd,
  );
});
