/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, expect } from '@playwright/test';
import { test } from '@fixtures';
import {
  clickOnCanvas,
  MacroFileType,
  openFileAndAddToCanvasAsNewProjectMacro,
  pasteFromClipboardAndOpenAsNewProject,
  pasteFromClipboardAndOpenAsNewProjectMacro,
  PresetType,
} from '@utils';
import { Chem } from '@tests/pages/constants/monomers/Chem';
import { Phosphate } from '@tests/pages/constants/monomers/Phosphates';
import { Preset } from '@tests/pages/constants/monomers/Presets';
import { Nucleotide } from '@tests/pages/constants/monomers/Nucleotides';
import { Library } from '@tests/pages/macromolecules/Library';
import {
  AttachmentPoint,
  getMonomerLocator,
} from '@utils/macromolecules/monomer';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import {
  CreateMonomerDialog,
  prepareMoleculeForMonomerCreation,
} from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { MonomerType } from '@tests/pages/constants/createMonomerDialog/Constants';
import { ErrorMessage } from '@tests/pages/constants/notificationMessageBanner/Constants';
import { NotificationMessageBanner } from '@tests/pages/molecules/canvas/createMonomer/NotificationMessageBanner';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import {
  FileType,
  verifyFileExport,
  verifyHELMExport,
  verifySVGExport,
} from '@utils/files/receiveFileComparisonData';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import {
  bondTwoMonomers,
  bondTwoMonomersPointToPoint,
  getAvailableAttachmentPoints,
  getBondLocator,
} from '@utils/macromolecules/polymerBond';
import { ConnectionPointsDialog } from '@tests/pages/macromolecules/canvas/ConnectionPointsDialog';
import { MacroBondDataIds } from '@tests/pages/constants/bondSelectionTool/Constants';

let page: Page;
test.beforeAll(async ({ initFlexCanvas }) => {
  page = await initFlexCanvas();
});
test.afterAll(async ({ closePage }) => {
  await closePage();
});
test.beforeEach(async ({ FlexCanvas: _ }) => {});

const newCHEMs = [
  Chem._5TAMRA,
  Chem.SCY5,
  Chem.Sp18P,
  Chem.SpC3,
  Chem.Dig,
  Chem.JOE,
  Chem._5ROX,
  Chem.TexRd,
  Chem.Cy3,
  Chem.Cy5,
  Chem._56FAM,
  Chem.HEX,
  Chem.TET,
  Chem.Sp9,
  Chem.Cy55,
  Chem._2_Bio,
  Chem.UAmM,
  Chem.AF532,
  Chem.Acryd,
  Chem.AF546,
  Chem.AF647,
  Chem.ThiP,
  Chem.AF488,
  Chem.AF594,
  Chem.IRD700,
  Chem.IRD800,
  Chem.RhoR,
  Chem.RhoG,
  Chem.YakYel,
  Chem.dTp,
  Chem.PCBio,
  Chem.AF405,
  Chem.FAMN,
  Chem.PCS,
  Chem.dSBioT,
  Chem.Dy750,
  Chem.BHQ_1,
  Chem.BHQ_2,
  Chem.BioP,
  Chem._5hxy,
  Chem.IRD800C,
  Chem.Azd,
  Chem.BiAz,
  Chem.AzTAM,
  Chem.FAMK,
  Chem.A647,
  Chem.A532,
  Chem.A590,
  Chem.AR101,
  Chem._5BioT,
  Chem.A550,
  Chem.A565,
  Chem.A488,
  Chem.A633,
  Chem.DBCOT,
  Chem.A700,
  Chem.A425,
  Chem._5SUN,
  Chem.Bio,
  Chem._3SpC3,
  Chem._36FAM,
  Chem._3BioT,
  Chem.BHQ_3,
  Chem.C6,
  Chem.ChTEG,
  Chem.AmMO,
  Chem.MGBEc,
];

const newPhosphates = [Phosphate.AmC12, Phosphate.AmC6];

const newPresets = [
  Preset.dR_5meC_P,
  Preset._12ddR__P,
  Preset.dR_In_P,
  Preset.dR_isoG_P,
  Preset.fR_U_P,
  Preset.fR_C_P,
  Preset.fR_A_P,
  Preset.fR_G_P,
  Preset.R_meA_P,
  Preset.R_In_P,
  Preset.R_G,
];

const newNucleotides = [
  Nucleotide.biodT,
  Nucleotide.FldT,
  Nucleotide.d2AmPr,
  Nucleotide._5MidC,
  Nucleotide._5Ade,
  Nucleotide.InvddT,
  Nucleotide._5OctdU,
  Nucleotide._5TAMdT,
  Nucleotide._8odG,
  Nucleotide.BHQ_1dT,
  Nucleotide.BHQ_2dT,
  Nucleotide.AzddT,
  Nucleotide.BiAzdT,
  Nucleotide.AzTAMdT,
  Nucleotide.FAMKdT,
  Nucleotide.Dab,
  Nucleotide.ddC,
  Nucleotide.InvdT,
];

test(`1. Verify changing the symbol of a CHEM`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Verify changing the symbol of a CHEM
   *
   * Case:
   *      1. Open Macromolecules canvas
   *      2. Validate exisence of new CHEM (SCY5)
   *
   * Version 3.8
   */
  expect(await Library(page).isMonomerExist(Chem.A6OH)).toBeTruthy();
});

test(`2. Verify correcting the structure of a CHEM and assigning it the IDT code`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Verify correcting the structure of a CHEM and assigning it the IDT code
   *
   * Case:
   *      1. Open Macromolecules canvas
   *      2. Load structure with Chem monomer (5TAMRA) using IDT code
   *
   * Version 3.8
   */
  await pasteFromClipboardAndOpenAsNewProjectMacro(
    page,
    MacroFileType.IDT,
    '/56-TAMN/',
  );
  await expect(getMonomerLocator(page, Chem._5TAMRA)).toBeVisible();
});

test(`3. Verify correcting the IDT codes of a preset dR(U)P`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Verify correcting the IDT codes of a preset dR(U)P
   *
   * Case:
   *      1. Open Macromolecules canvas
   *      2. Load structure with preset dR(U)P using IDT codes
   *      3. Validate that the structure is on the canvas and all monomers are correct
   *
   * Version 3.8
   */
  await pasteFromClipboardAndOpenAsNewProjectMacro(
    page,
    MacroFileType.IDT,
    '/5deoxyU//ideoxyU//3deoxyU/',
  );
  expect(await getMonomerLocator(page, Preset.dR_U_P.sugar).count()).toEqual(3);
  if (Preset.dR_U_P.base) {
    expect(await getMonomerLocator(page, Preset.dR_U_P.base).count()).toEqual(
      3,
    );
  }
  if (Preset.dR_U_P.phosphate) {
    expect(
      await getMonomerLocator(page, Preset.dR_U_P.phosphate).count(),
    ).toEqual(2);
  }
});

test(`4. Verify adding two new phosphates: AmC12, AmC6`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Verify adding two new phosphates: AmC12, AmC6
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      2. Validate presence of new phosphates AmC12, AmC6 in the library
   *      3. Add new phosphates AmC12, AmC6 to the canvas from the library
   *      4. Validate that the phosphates are on the canvas
   *      5. Clean up the canvas
   *      6. Repeat steps 2-5 for each phosphate
   *
   * Version 3.8
   */
  for (const phosphate of newPhosphates) {
    expect(await Library(page).isMonomerExist(phosphate)).toBeTruthy();
    await Library(page).dragMonomerOnCanvas(phosphate, {
      x: 0,
      y: 0,
      fromCenter: true,
    });
    await expect(getMonomerLocator(page, phosphate)).toBeVisible();
    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`5. Check adding eleven new presets`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check adding eleven new presets
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      2. Validate presence of new preset in the library
   *      3. Add new preset to the canvas from the library
   *      4. Validate that the preset is on the canvas
   *      5. Clean up the canvas
   *      6. Repeat steps 2-5 for each preset
   *
   * Version 3.8
   */
  for (const preset of newPresets) {
    expect.soft(await Library(page).isMonomerExist(preset)).toBeTruthy();
    await Library(page).dragMonomerOnCanvas(preset, {
      x: 0,
      y: 0,
      fromCenter: true,
    });
    await expect.soft(getMonomerLocator(page, preset.sugar)).toBeVisible();
    if (preset.base) {
      await expect.soft(getMonomerLocator(page, preset.base)).toBeVisible();
    }
    if (preset.phosphate) {
      await expect
        .soft(getMonomerLocator(page, preset.phosphate))
        .toBeVisible();
    }
    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`6. Check adding nineteen new standalone nucleotides`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check adding nineteen new standalone nucleotides
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      2. Validate presence of new nucleotide in the library
   *      3. Add new nucleotide to the canvas from the library
   *      4. Validate that the nucleotide is on the canvas
   *      5. Clean up the canvas
   *      6. Repeat steps 2-5 for each nucleotide
   *
   * Version 3.8
   */
  for (const nucleotide of newNucleotides) {
    expect.soft(await Library(page).isMonomerExist(nucleotide)).toBeTruthy();
    await Library(page).dragMonomerOnCanvas(nucleotide, {
      x: 0,
      y: 0,
      fromCenter: true,
    });
    await expect.soft(getMonomerLocator(page, nucleotide)).toBeVisible();
    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`7. Check adding sixty-five new CHEMs`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check adding sixty-five new CHEMs
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      2. Validate presence of new CHEM in the library
   *      3. Add new CHEM to the canvas from the library
   *      4. Validate that the CHEM is on the canvas
   *      5. Clean up the canvas
   *      6. Repeat steps 2-5 for each CHEM
   *
   * Version 3.8
   */
  for (const chem of newCHEMs) {
    expect.soft(await Library(page).isMonomerExist(chem)).toBeTruthy();
    await Library(page).dragMonomerOnCanvas(chem, {
      x: 0,
      y: 0,
      fromCenter: true,
    });
    await expect.soft(getMonomerLocator(page, chem)).toBeVisible();
    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`8. Verify that changed symbol CHEM SCY5 can be found through the search window`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Verify that changed symbol CHEM SCY5 can be found through the search window
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      2. Search for the CHEM SCY5 in the library
   *      3. Validate that the CHEM is in the search results
   *
   * Version 3.8
   */
  await Library(page).setSearchValue(Chem.SCY5.alias);
  await Library(page).goToMonomerLibraryLocation(Chem.SCY5);
  await expect(
    Library(page).getMonomerLibraryCardLocator(Chem.SCY5),
  ).toBeVisible();
});

test(`9. Verify that newly added two phosphates can be found through the search window`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Verify that newly added two phosphates can be found through the search window
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      2. Search for the phosphate in the library
   *      3. Validate that the phosphate is in the search results
   *      4. Repeat steps 2-3 for each phosphate
   *
   * Version 3.8
   */
  for (const phosphate of newPhosphates) {
    await Library(page).setSearchValue(phosphate.alias);
    await Library(page).goToMonomerLibraryLocation(phosphate);
    await expect(
      Library(page).getMonomerLibraryCardLocator(phosphate),
    ).toBeVisible();
  }
});

test(`10. Verify that newly added eleven presets can be found through the search window`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Verify that newly added eleven presets can be found through the search window
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      2. Search for the preset in the library
   *      3. Validate that the preset is in the search results
   *      4. Repeat steps 2-3 for each preset
   *
   * Version 3.8
   */
  for (const preset of newPresets) {
    await Library(page).setSearchValue(preset.alias);
    await Library(page).goToMonomerLibraryLocation(preset);
    await expect(
      Library(page).getMonomerLibraryCardLocator(preset),
    ).toBeVisible();
  }
});

test(`11. Verify that newly added nineteen standalone nucleotides can be found through the search window`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Verify that newly added nineteen standalone nucleotides can be found through the search window
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      2. Search for the nucleotide in the library
   *      3. Validate that the nucleotide is in the search results
   *      4. Repeat steps 2-3 for each nucleotide
   *
   * Version 3.8
   */
  for (const nucleotide of newNucleotides) {
    await Library(page).setSearchValue(nucleotide.alias);
    await Library(page).goToMonomerLibraryLocation(nucleotide);
    await expect(
      Library(page).getMonomerLibraryCardLocator(nucleotide),
    ).toBeVisible();
  }
});

test(`12. Verify that newly added sixty-five new CHEMs can be found through the search window`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Verify that newly added sixty-five new CHEMs can be found through the search window
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      2. Search for the CHEM in the library
   *      3. Validate that the CHEM is in the search results
   *      4. Repeat steps 2-3 for each CHEM
   *
   * Version 3.8
   */
  for (const chem of newCHEMs) {
    await Library(page).setSearchValue(chem.alias);
    await Library(page).goToMonomerLibraryLocation(chem);
    await expect(
      Library(page).getMonomerLibraryCardLocator(chem),
    ).toBeVisible();
  }
});

test(`13. Verify that creating a duplicate of a new item is not allowed for CHEM SCY5`, async ({
  MoleculesCanvas: _,
}) => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Verify that creating a duplicate of a new item is not allowed for CHEM SCY5
   *
   * Case:
   *      1. Open Micromolecules canvas
   *      2. Search for the CHEM SCY5 in the library
   *      3. Attempt to create a duplicate of the CHEM SCY5
   *      4. Validate that an error message is displayed
   *
   * Version 3.8
   */
  const createMonomerDialog = CreateMonomerDialog(page);
  const symbolExistsMessageBanner = NotificationMessageBanner(
    page,
    ErrorMessage.symbolExists,
  );

  await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
  await prepareMoleculeForMonomerCreation(page, ['0']);

  await LeftToolbar(page).createMonomer();
  await createMonomerDialog.selectType(MonomerType.CHEM);
  await createMonomerDialog.setSymbol(Chem.SCY5.alias);
  await createMonomerDialog.submit();
  expect(await symbolExistsMessageBanner.isVisible()).toBeTruthy();
  await symbolExistsMessageBanner.ok();

  await createMonomerDialog.discard();
});

test(`14. Verify that creating a duplicate of a new item is not allowed for newly added two phosphates`, async ({
  MoleculesCanvas: _,
}) => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Verify that creating a duplicate of a new item is not allowed for newly added two phosphates
   *
   * Case:
   *      1. Open Micromolecules canvas
   *      2. Search for the phosphate in the library
   *      3. Attempt to create a duplicate of the phosphate
   *      4. Validate that an error message is displayed
   *      5. Repeat steps 2-4 for each phosphate
   *
   * Version 3.8
   */
  const createMonomerDialog = CreateMonomerDialog(page);
  const symbolExistsMessageBanner = NotificationMessageBanner(
    page,
    ErrorMessage.symbolExists,
  );

  await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
  await prepareMoleculeForMonomerCreation(page, ['0']);
  await LeftToolbar(page).createMonomer();
  await createMonomerDialog.selectType(MonomerType.Phosphate);

  for (const phosphate of newPhosphates) {
    await createMonomerDialog.setSymbol(phosphate.alias);
    await createMonomerDialog.submit();
    expect(await symbolExistsMessageBanner.isVisible()).toBeTruthy();
    await symbolExistsMessageBanner.ok();
  }

  await createMonomerDialog.discard();
});

test(`15. Verify that creating a duplicate of a new item is not allowed for newly added nineteen standalone nucleotide`, async ({
  MoleculesCanvas: _,
}) => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Verify that creating a duplicate of a new item is not allowed for newly added nineteen standalone nucleotide
   *
   * Case:
   *      1. Open Micromolecules canvas
   *      2. Search for the nucleotide in the library
   *      3. Attempt to create a duplicate of the nucleotide
   *      4. Validate that an error message is displayed
   *      5. Repeat steps 2-4 for each nucleotide
   *
   * Version 3.8
   */
  const createMonomerDialog = CreateMonomerDialog(page);
  const symbolExistsMessageBanner = NotificationMessageBanner(
    page,
    ErrorMessage.symbolExists,
  );

  await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
  await prepareMoleculeForMonomerCreation(page, ['0']);
  await LeftToolbar(page).createMonomer();
  await createMonomerDialog.selectType(MonomerType.Nucleotide);

  for (const nucleotide of newNucleotides) {
    await createMonomerDialog.setSymbol(nucleotide.alias);
    await createMonomerDialog.submit();
    expect(await symbolExistsMessageBanner.isVisible()).toBeTruthy();
    await symbolExistsMessageBanner.ok();
  }

  await createMonomerDialog.discard();
});

test(`16. Verify that creating a duplicate of a new item is not allowed for newly added sixty-five new CHEMs`, async ({
  MoleculesCanvas: _,
}) => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Verify that creating a duplicate of a new item is not allowed for newly added sixty-five new CHEMs
   *
   * Case:
   *      1. Open Micromolecules canvas
   *      2. Search for the CHEM in the library
   *      3. Attempt to create a duplicate of the CHEM
   *      4. Validate that an error message is displayed
   *      5. Repeat steps 2-4 for each CHEM
   *
   * Version 3.8
   */
  const createMonomerDialog = CreateMonomerDialog(page);
  const symbolExistsMessageBanner = NotificationMessageBanner(
    page,
    ErrorMessage.symbolExists,
  );

  await pasteFromClipboardAndOpenAsNewProject(page, 'CCC');
  await prepareMoleculeForMonomerCreation(page, ['0']);
  await LeftToolbar(page).createMonomer();
  await createMonomerDialog.selectType(MonomerType.CHEM);

  for (const chem of newCHEMs) {
    await createMonomerDialog.setSymbol(chem.alias);
    await createMonomerDialog.submit();
    expect(await symbolExistsMessageBanner.isVisible()).toBeTruthy();
    await symbolExistsMessageBanner.ok();
  }

  await createMonomerDialog.discard();
});

test(`17. Check that newly added two phosphates can be saved and opened for KET`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check that newly added two phosphates can be saved and opened for KET
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      3. Add new phosphates AmC12, AmC6 to the canvas from the library
   *      4. Validate that the phosphates are on the canvas
   *      5. Save the structure as KET file
   *      6. Clear the canvas
   *      7. Open the saved KET file
   *      8. Validate that the phosphates are on the canvas after reopening
   *      9. Clean up the canvas
   *      10. Repeat steps 2-5 for each phosphate
   *
   * Version 3.8
   */
  for (const phosphate of newPhosphates) {
    await Library(page).dragMonomerOnCanvas(phosphate, {
      x: 0,
      y: 0,
      fromCenter: true,
    });
    await expect(getMonomerLocator(page, phosphate)).toBeVisible();

    await verifyFileExport(
      page,
      `KET/Chromium-popup/New-monomers/Phosphates/${phosphate.alias}-expected.ket`,
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      `KET/Chromium-popup/New-monomers/Phosphates/${phosphate.alias}-expected.ket`,
    );
    await expect(getMonomerLocator(page, phosphate)).toBeVisible();
    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`18. Check that newly added eleven presets can be saved and opened for KET`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check that newly added eleven presets can be saved and opened for KET
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      3. Add new preset to the canvas from the library
   *      4. Validate that the preset is on the canvas
   *      5. Save the structure as KET file
   *      6. Clear the canvas
   *      7. Open the saved KET file
   *      8. Validate that the preset is on the canvas after reopening
   *      9. Clean up the canvas
   *      10. Repeat steps 2-5 for each preset
   *
   * Version 3.8
   */
  for (const preset of newPresets) {
    await Library(page).dragMonomerOnCanvas(preset, {
      x: 0,
      y: 0,
      fromCenter: true,
    });
    await expect.soft(getMonomerLocator(page, preset.sugar)).toBeVisible();
    if (preset.base) {
      await expect.soft(getMonomerLocator(page, preset.base)).toBeVisible();
    }
    if (preset.phosphate) {
      await expect
        .soft(getMonomerLocator(page, preset.phosphate))
        .toBeVisible();
    }

    await verifyFileExport(
      page,
      `KET/Chromium-popup/New-monomers/Presets/${preset.alias}-expected.ket`,
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      `KET/Chromium-popup/New-monomers/Presets/${preset.alias}-expected.ket`,
    );

    await expect.soft(getMonomerLocator(page, preset.sugar)).toBeVisible();
    if (preset.base) {
      await expect.soft(getMonomerLocator(page, preset.base)).toBeVisible();
    }
    if (preset.phosphate) {
      await expect
        .soft(getMonomerLocator(page, preset.phosphate))
        .toBeVisible();
    }

    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`19. Check that newly added nineteen standalone nucleotide can be saved and opened for KET`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check that newly added nineteen standalone nucleotide can be saved and opened for KET
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      3. Add new nucleotide to the canvas from the library
   *      4. Validate that the nucleotide is on the canvas
   *      5. Save the structure as KET file
   *      6. Clear the canvas
   *      7. Open the saved KET file
   *      8. Validate that the nucleotide is on the canvas after reopening
   *      9. Clean up the canvas
   *      10. Repeat steps 2-5 for each nucleotide
   *
   * Version 3.8
   */
  for (const nucleotide of newNucleotides) {
    await Library(page).dragMonomerOnCanvas(nucleotide, {
      x: 0,
      y: 0,
      fromCenter: true,
    });
    await expect(getMonomerLocator(page, nucleotide)).toBeVisible();

    await verifyFileExport(
      page,
      `KET/Chromium-popup/New-monomers/Nucleotides/${nucleotide.alias}-expected.ket`,
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      `KET/Chromium-popup/New-monomers/Nucleotides/${nucleotide.alias}-expected.ket`,
    );
    await expect(getMonomerLocator(page, nucleotide)).toBeVisible();
    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`20. Check that newly added sixty-five new CHEMs can be saved and opened for KET`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check that newly added sixty-five new CHEMs can be saved and opened for KET
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      3. Add new CHEM to the canvas from the library
   *      4. Validate that the CHEM is on the canvas
   *      5. Save the structure as KET file
   *      6. Clear the canvas
   *      7. Open the saved KET file
   *      8. Validate that the CHEM is on the canvas after reopening
   *      9. Clean up the canvas
   *      10. Repeat steps 2-5 for each CHEM
   *
   * Version 3.8
   */
  for (const chem of newCHEMs) {
    await Library(page).dragMonomerOnCanvas(chem, {
      x: 0,
      y: 0,
      fromCenter: true,
    });
    await expect(getMonomerLocator(page, chem)).toBeVisible();

    await verifyFileExport(
      page,
      `KET/Chromium-popup/New-monomers/CHEMs/${chem.alias}-expected.ket`,
      FileType.KET,
    );
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      `KET/Chromium-popup/New-monomers/CHEMs/${chem.alias}-expected.ket`,
    );
    await expect(getMonomerLocator(page, chem)).toBeVisible();
    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

// test(`21. Check that newly added two phosphates can be saved and opened for MOL V3000`, async () => {
// Commented out because of https://github.com/epam/Indigo/issues/3206
//   /*
//    * Test task: https://github.com/epam/ketcher/issues/7910
//    * Description: Check that newly added two phosphates can be saved and opened for MOL V3000
//    *
//    * Case:
//    *      1. Open Macromolecules canvas - Flex
//    *      3. Add new phosphates AmC12, AmC6 to the canvas from the library
//    *      4. Validate that the phosphates are on the canvas
//    *      5. Save the structure as MOL V3000 file
//    *      6. Clear the canvas
//    *      7. Open the saved MOL V3000 file
//    *      8. Validate that the phosphates are on the canvas after reopening
//    *      9. Clean up the canvas
//    *      10. Repeat steps 2-5 for each phosphate
//    *
//    * Version 3.8
//    */
//   for (const phosphate of newPhosphates) {
//     await Library(page).dragMonomerOnCanvas(phosphate, {
//       x: 0,
//       y: 0,
//       fromCenter: true,
//     });
//     await expect(getMonomerLocator(page, phosphate)).toBeVisible();

//     await verifyFileExport(
//       page,
//       `Molfiles-V3000/Chromium-popup/New-monomers/Phosphates/${phosphate.alias}-expected.mol`,
//       FileType.MOL,
//     );
//     await openFileAndAddToCanvasAsNewProjectMacro(
//       page,
//       `Molfiles-V3000/Chromium-popup/New-monomers/Phosphates/${phosphate.alias}-expected.mol`,
//     );
//     await expect(getMonomerLocator(page, phosphate)).toBeVisible();
//     await CommonTopLeftToolbar(page).clearCanvas();
//   }
// });

// test(`22. Check that newly added eleven presets can be saved and opened for MOL V3000`, async () => {
// Commented out because of https://github.com/epam/Indigo/issues/3206
//   /*
//    * Test task: https://github.com/epam/ketcher/issues/7910
//    * Description: Check that newly added eleven presets can be saved and opened for MOL V3000
//    *
//    * Case:
//    *      1. Open Macromolecules canvas - Flex
//    *      3. Add new preset to the canvas from the library
//    *      4. Validate that the preset is on the canvas
//    *      5. Save the structure as MOL V3000 file
//    *      6. Clear the canvas
//    *      7. Open the saved MOL V3000 file
//    *      8. Validate that the preset is on the canvas after reopening
//    *      9. Clean up the canvas
//    *      10. Repeat steps 2-5 for each preset
//    *
//    * Version 3.8
//    */
//   for (const preset of newPresets) {
//     await Library(page).dragMonomerOnCanvas(preset, {
//       x: 0,
//       y: 0,
//       fromCenter: true,
//     });
//     await expect.soft(getMonomerLocator(page, preset.sugar)).toBeVisible();
//     if (preset.base) {
//       await expect.soft(getMonomerLocator(page, preset.base)).toBeVisible();
//     }
//     if (preset.phosphate) {
//       await expect
//         .soft(getMonomerLocator(page, preset.phosphate))
//         .toBeVisible();
//     }

//     await verifyFileExport(
//       page,
//       `Molfiles-V3000/Chromium-popup/New-monomers/Presets/${preset.alias}-expected.mol`,
//       FileType.MOL,
//     );
//     await openFileAndAddToCanvasAsNewProjectMacro(
//       page,
//       `Molfiles-V3000/Chromium-popup/New-monomers/Presets/${preset.alias}-expected.mol`,
//     );

//     await expect.soft(getMonomerLocator(page, preset.sugar)).toBeVisible();
//     if (preset.base) {
//       await expect.soft(getMonomerLocator(page, preset.base)).toBeVisible();
//     }
//     if (preset.phosphate) {
//       await expect
//         .soft(getMonomerLocator(page, preset.phosphate))
//         .toBeVisible();
//     }

//     await CommonTopLeftToolbar(page).clearCanvas();
//   }
// });

// test(`23. Check that newly added nineteen standalone nucleotide can be saved and opened for MOL V3000`, async () => {
// Commented out because of https://github.com/epam/Indigo/issues/3206
//   /*
//    * Test task: https://github.com/epam/ketcher/issues/7910
//    * Description: Check that newly added nineteen standalone nucleotide can be saved and opened for MOL V3000
//    *
//    * Case:
//    *      1. Open Macromolecules canvas - Flex
//    *      3. Add new nucleotide to the canvas from the library
//    *      4. Validate that the nucleotide is on the canvas
//    *      5. Save the structure as MOL V3000 file
//    *      6. Clear the canvas
//    *      7. Open the saved MOL V3000 file
//    *      8. Validate that the nucleotide is on the canvas after reopening
//    *      9. Clean up the canvas
//    *      10. Repeat steps 2-5 for each nucleotide
//    *
//    * Version 3.8
//    */
//   for (const nucleotide of newNucleotides) {
//     await Library(page).dragMonomerOnCanvas(nucleotide, {
//       x: 0,
//       y: 0,
//       fromCenter: true,
//     });
//     await expect(getMonomerLocator(page, nucleotide)).toBeVisible();

//     await verifyFileExport(
//       page,
//       `Molfiles-V3000/Chromium-popup/New-monomers/Nucleotides/${nucleotide.alias}-expected.mol`,
//       FileType.MOL,
//     );
//     await openFileAndAddToCanvasAsNewProjectMacro(
//       page,
//       `Molfiles-V3000/Chromium-popup/New-monomers/Nucleotides/${nucleotide.alias}-expected.mol`,
//     );
//     await expect(getMonomerLocator(page, nucleotide)).toBeVisible();
//     await CommonTopLeftToolbar(page).clearCanvas();
//   }
// });

// test(`24. Check that newly added sixty-five new CHEMs can be saved and opened for MOL V3000`, async () => {
// Commented out because of https://github.com/epam/Indigo/issues/3206
//   /*
//    * Test task: https://github.com/epam/ketcher/issues/7910
//    * Description: Check that newly added sixty-five new CHEMs can be saved and opened for MOL V3000
//    *
//    * Case:
//    *      1. Open Macromolecules canvas - Flex
//    *      3. Add new CHEM to the canvas from the library
//    *      4. Validate that the CHEM is on the canvas
//    *      5. Save the structure as MOL V3000 file
//    *      6. Clear the canvas
//    *      7. Open the saved MOL V3000 file
//    *      8. Validate that the CHEM is on the canvas after reopening
//    *      9. Clean up the canvas
//    *      10. Repeat steps 2-5 for each CHEM
//    *
//    * Version 3.8
//    */
//   for (const chem of newCHEMs) {
//     await Library(page).dragMonomerOnCanvas(chem, {
//       x: 0,
//       y: 0,
//       fromCenter: true,
//     });
//     await expect(getMonomerLocator(page, chem)).toBeVisible();

//     await verifyFileExport(
//       page,
//       `Molfiles-V3000/Chromium-popup/New-monomers/CHEMs/${chem.alias}-expected.mol`,
//       FileType.MOL,
//     );
//     await openFileAndAddToCanvasAsNewProjectMacro(
//       page,
//       `Molfiles-V3000/Chromium-popup/New-monomers/CHEMs/${chem.alias}-expected.mol`,
//     );
//     const monomerLocator = getMonomerLocator(page, chem);
//     await expect(monomerLocator).toBeVisible();
//     await CommonTopLeftToolbar(page).clearCanvas();
//   }
// });

test.fail(
  `25. Check that newly added two phosphates can be saved and opened for IDT`,
  async () => {
    // Fails due to issue with IDT export: https://github.com/epam/Indigo/issues/3144
    /*
     * Test task: https://github.com/epam/ketcher/issues/7910
     * Description: Check that newly added two phosphates can be saved and opened for IDT
     *
     * Case:
     *      1. Open Macromolecules canvas - Flex
     *      3. Add new phosphates AmC12, AmC6 to the canvas from the library
     *      4. Validate that the phosphates are on the canvas
     *      5. Save the structure as IDT file
     *      6. Clear the canvas
     *      7. Open the saved IDT file
     *      8. Validate that the phosphates are on the canvas after reopening
     *      9. Clean up the canvas
     *      10. Repeat steps 2-5 for each phosphate
     *
     * Version 3.8
     */
    for (const phosphate of newPhosphates) {
      await Library(page).dragMonomerOnCanvas(phosphate, {
        x: 0,
        y: 0,
        fromCenter: true,
      });
      await expect(getMonomerLocator(page, phosphate)).toBeVisible();

      await verifyFileExport(
        page,
        `IDT/Chromium-popup/New-monomers/Phosphates/${phosphate.alias}-expected.idt`,
        FileType.IDT,
      );
      await openFileAndAddToCanvasAsNewProjectMacro(
        page,
        `IDT/Chromium-popup/New-monomers/Phosphates/${phosphate.alias}-expected.idt`,
      );
      await expect(getMonomerLocator(page, phosphate)).toBeVisible();
      await CommonTopLeftToolbar(page).clearCanvas();
    }
  },
);

test(`26. Check that newly added eleven presets can be saved and opened for IDT`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check that newly added eleven presets can be saved and opened for IDT
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      3. Add new preset to the canvas from the library
   *      4. Validate that the preset is on the canvas
   *      5. Save the structure as IDT file
   *      6. Clear the canvas
   *      7. Open the saved IDT file
   *      8. Validate that the preset is on the canvas after reopening
   *      9. Clean up the canvas
   *      10. Repeat steps 2-5 for each preset
   *
   * Version 3.8
   */
  for (const preset of newPresets) {
    await Library(page).dragMonomerOnCanvas(preset, {
      x: 0,
      y: 0,
      fromCenter: true,
    });
    await expect.soft(getMonomerLocator(page, preset.sugar)).toBeVisible();
    if (preset.base) {
      await expect.soft(getMonomerLocator(page, preset.base)).toBeVisible();
    }
    if (preset.phosphate) {
      await expect
        .soft(getMonomerLocator(page, preset.phosphate))
        .toBeVisible();
    }

    await verifyFileExport(
      page,
      `IDT/Chromium-popup/New-monomers/Presets/${preset.alias}-expected.idt`,
      FileType.IDT,
    );
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      `IDT/Chromium-popup/New-monomers/Presets/${preset.alias}-expected.idt`,
    );

    await expect.soft(getMonomerLocator(page, preset.sugar)).toBeVisible();
    if (preset.base) {
      await expect.soft(getMonomerLocator(page, preset.base)).toBeVisible();
    }
    if (preset.phosphate) {
      await expect
        .soft(getMonomerLocator(page, preset.phosphate))
        .toBeVisible();
    }

    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`27. Check that newly added nineteen standalone nucleotide can be saved and opened for IDT`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check that newly added nineteen standalone nucleotide can be saved and opened for IDT
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      2. Add new nucleotide to the canvas from the library
   *      3. Check if it has R1 attachment point, if yes add 2_damdA nucleotide first, if not add nucleotide first and then dA
   *      4. Validate that the nucleotide is on the canvas
   *      5. Save the structure as IDT file
   *      6. Clear the canvas
   *      7. Open the saved IDT file
   *      8. Validate that the nucleotide is on the canvas after reopening
   *      9. Clean up the canvas
   *      10. Repeat steps 2-5 for each nucleotide
   *
   * Version 3.8
   */
  for (const nucleotide of newNucleotides) {
    await Library(page).clickMonomerAutochain(nucleotide);
    if (
      await getMonomerLocator(page, nucleotide).evaluate((el) =>
        el.hasAttribute('data-R1'),
      )
    ) {
      await CommonTopLeftToolbar(page).clearCanvas();
      await Library(page).clickMonomerAutochain(Nucleotide._2_damdA);
      await Library(page).clickMonomerAutochain(nucleotide);
    } else {
      await Library(page).clickMonomerAutochain(Nucleotide._2_damdA);
    }

    await expect(getMonomerLocator(page, nucleotide)).toBeVisible();

    await verifyFileExport(
      page,
      `IDT/Chromium-popup/New-monomers/Nucleotides/${nucleotide.alias}-expected.idt`,
      FileType.IDT,
    );
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      `IDT/Chromium-popup/New-monomers/Nucleotides/${nucleotide.alias}-expected.idt`,
    );
    await expect(getMonomerLocator(page, nucleotide)).toBeVisible();
    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

const ubnormalCHEMs = [
  Chem._5TAMRA,
  Chem.SCY5,
  Chem._56FAM,
  Chem.HEX,
  Chem.TET,
  Chem._2_Bio,
  Chem.Acryd,
  Chem.ThiP,
  Chem.IRD700,
  Chem.IRD800,
  Chem.YakYel,
  Chem.PCBio,
  Chem.AF405,
  Chem.FAMN,
  Chem.Dy750,
  Chem.BioP,
  Chem._5hxy,
  Chem.IRD800C,
  Chem.BiAz,
  Chem.AzTAM,
  Chem.FAMK,
  Chem._5BioT,
  Chem.DBCOT,
  Chem.A700,
  Chem.A425,
  Chem._5SUN,
];

test(`28. Check that newly added sixty-five new CHEMs can be saved and opened for IDT`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check that newly added sixty-five new CHEMs can be saved and opened for IDT
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      3. Add new CHEM to the canvas from the library
   *      4. Validate that the CHEM is on the canvas
   *      5. Save the structure as IDT file
   *      6. Clear the canvas
   *      7. Open the saved IDT file
   *      8. Validate that the CHEM is on the canvas after reopening
   *      9. Clean up the canvas
   *      10. Repeat steps 2-5 for each CHEM
   *
   * Version 3.8
   */
  test.slow();
  const normalCHEMs = newCHEMs.filter((c) => !ubnormalCHEMs.includes(c));
  for (const chem of normalCHEMs) {
    await Library(page).clickMonomerAutochain(chem);
    if (
      await getMonomerLocator(page, chem)
        .first()
        .evaluate((el) => el.hasAttribute('data-R1'))
    ) {
      await CommonTopLeftToolbar(page).clearCanvas();
      await Library(page).clickMonomerAutochain(Chem.Sp18P);
      await Library(page).clickMonomerAutochain(chem);
    } else {
      await Library(page).clickMonomerAutochain(Chem.Sp18P);
    }
    await expect(getMonomerLocator(page, chem).first()).toBeVisible();

    await verifyFileExport(
      page,
      `IDT/Chromium-popup/New-monomers/CHEMs/${chem.alias}-expected.idt`,
      FileType.IDT,
    );
    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      `IDT/Chromium-popup/New-monomers/CHEMs/${chem.alias}-expected.idt`,
    );
    await expect(getMonomerLocator(page, chem).first()).toBeVisible();
    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`29. Check that newly added two phosphates can be saved and opened for HELM`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check that newly added two phosphates can be saved and opened for HELM
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      3. Add new phosphates AmC12, AmC6 to the canvas from the library
   *      4. Validate that the phosphates are on the canvas
   *      5. Save the structure as HELM file
   *      6. Clear the canvas
   *      7. Open the saved HELM file
   *      8. Validate that the phosphates are on the canvas after reopening
   *      9. Clean up the canvas
   *      10. Repeat steps 2-5 for each phosphate
   *
   * Version 3.8
   */
  for (const phosphate of newPhosphates) {
    await Library(page).clickMonomerAutochain(phosphate);
    await expect(getMonomerLocator(page, phosphate)).toBeVisible();

    await verifyHELMExport(page, `RNA1{[${phosphate.alias}]}$$$$V2.0`);
    await pasteFromClipboardAndOpenAsNewProjectMacro(
      page,
      MacroFileType.HELM,
      `RNA1{[${phosphate.alias}]}$$$$V2.0`,
    );
    await expect(getMonomerLocator(page, phosphate)).toBeVisible();
    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

const newPresetsWithHELMs: [PresetType, string][] = [
  [Preset.dR_5meC_P, 'RNA1{d([m5C])p}$$$$V2.0'],
  [Preset._12ddR__P, 'RNA1{[d12r].p}$$$$V2.0'],
  [Preset.dR_In_P, 'RNA1{d([Hyp])p}$$$$V2.0'],
  [Preset.dR_isoG_P, 'RNA1{d([isoG])p}$$$$V2.0'],
  [Preset.fR_U_P, 'RNA1{[fl2r](U)p}$$$$V2.0'],
  [Preset.fR_C_P, 'RNA1{[fl2r](C)p}$$$$V2.0'],
  [Preset.fR_A_P, 'RNA1{[fl2r](A)p}$$$$V2.0'],
  [Preset.fR_G_P, 'RNA1{[fl2r](G)p}$$$$V2.0'],
  [Preset.R_meA_P, 'RNA1{r([m6A])p}$$$$V2.0'],
  [Preset.R_In_P, 'RNA1{r([Hyp])p}$$$$V2.0'],
  [Preset.R_G, 'RNA1{r(G)}$$$$V2.0'],
];
test(`30. Check that newly added eleven presets can be saved and opened for HELM`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check that newly added eleven presets can be saved and opened for HELM
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      3. Add new preset to the canvas from the library
   *      4. Validate that the preset is on the canvas
   *      5. Save the structure as HELM file
   *      6. Clear the canvas
   *      7. Open the saved HELM file
   *      8. Validate that the preset is on the canvas after reopening
   *      9. Clean up the canvas
   *      10. Repeat steps 2-5 for each preset
   *
   * Version 3.8
   */
  for (const preset of newPresetsWithHELMs) {
    await Library(page).clickMonomerAutochain(preset[0]);
    await expect.soft(getMonomerLocator(page, preset[0].sugar)).toBeVisible();
    if (preset[0].base) {
      await expect.soft(getMonomerLocator(page, preset[0].base)).toBeVisible();
    }
    if (preset[0].phosphate) {
      await expect
        .soft(getMonomerLocator(page, preset[0].phosphate))
        .toBeVisible();
    }

    await verifyHELMExport(page, preset[1]);
    await pasteFromClipboardAndOpenAsNewProjectMacro(
      page,
      MacroFileType.HELM,
      preset[1],
    );

    await expect.soft(getMonomerLocator(page, preset[0].sugar)).toBeVisible();
    if (preset[0].base) {
      await expect.soft(getMonomerLocator(page, preset[0].base)).toBeVisible();
    }
    if (preset[0].phosphate) {
      await expect
        .soft(getMonomerLocator(page, preset[0].phosphate))
        .toBeVisible();
    }

    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`31. Check that newly added nineteen standalone nucleotide can be saved and opened for HELM`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check that newly added nineteen standalone nucleotide can be saved and opened for HELM
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      3. Add new nucleotide to the canvas from the library
   *      4. Validate that the nucleotide is on the canvas
   *      5. Save the structure as HELM file
   *      6. Clear the canvas
   *      7. Open the saved HELM file
   *      8. Validate that the nucleotide is on the canvas after reopening
   *      9. Clean up the canvas
   *      10. Repeat steps 2-5 for each nucleotide
   *
   * Version 3.8
   */
  for (const nucleotide of newNucleotides) {
    await Library(page).clickMonomerAutochain(nucleotide);
    await expect(getMonomerLocator(page, nucleotide)).toBeVisible();

    await verifyHELMExport(page, `RNA1{[${nucleotide.alias}]}$$$$V2.0`);
    await pasteFromClipboardAndOpenAsNewProjectMacro(
      page,
      MacroFileType.HELM,
      `RNA1{[${nucleotide.alias}]}$$$$V2.0`,
    );

    await expect(getMonomerLocator(page, nucleotide)).toBeVisible();
    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`32. Check that newly added sixty-five new CHEMs can be saved and opened for HELM`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check that newly added sixty-five new CHEMs can be saved and opened for HELM
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      3. Add new CHEM to the canvas from the library
   *      4. Validate that the CHEM is on the canvas
   *      5. Save the structure as HELM file
   *      6. Clear the canvas
   *      7. Open the saved HELM file
   *      8. Validate that the CHEM is on the canvas after reopening
   *      9. Clean up the canvas
   *      10. Repeat steps 2-5 for each CHEM
   *
   * Version 3.8
   */
  test.slow();
  for (const chem of newCHEMs) {
    await Library(page).clickMonomerAutochain(chem);
    await expect(getMonomerLocator(page, chem)).toBeVisible();

    await verifyHELMExport(page, `CHEM1{[${chem.alias}]}$$$$V2.0`);
    await pasteFromClipboardAndOpenAsNewProjectMacro(
      page,
      MacroFileType.HELM,
      `CHEM1{[${chem.alias}]}$$$$V2.0`,
    );

    await expect(getMonomerLocator(page, chem)).toBeVisible();
    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`33. Check that newly added two phosphates can be saved to SVG Document`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check that newly added two phosphates can be saved to SVG Document
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      3. Add new phosphates AmC12, AmC6 to the canvas from the library
   *      4. Validate that the phosphates are on the canvas
   *      5. Save the structure as SVG Document
   *      6. Validate resulted SVG Document
   *      7. Clear the canvas
   *
   * Version 3.8
   */
  for (const phosphate of newPhosphates) {
    await Library(page).clickMonomerAutochain(phosphate);
    await expect(getMonomerLocator(page, phosphate)).toBeVisible();
    await verifySVGExport(page);
    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`34. Check that newly added eleven presets can be saved to SVG Document`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check that newly added eleven presets can be saved to SVG Document
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      3. Add new preset to the canvas from the library
   *      4. Validate that the preset is on the canvas
   *      5. Save the structure as SVG Document
   *      6. Validate resulted SVG Document
   *      7. Clear the canvas
   *
   * Version 3.8
   */
  for (const preset of newPresets) {
    await Library(page).clickMonomerAutochain(preset);
    await expect.soft(getMonomerLocator(page, preset.sugar)).toBeVisible();
    if (preset.base) {
      await expect.soft(getMonomerLocator(page, preset.base)).toBeVisible();
    }
    if (preset.phosphate) {
      await expect
        .soft(getMonomerLocator(page, preset.phosphate))
        .toBeVisible();
    }

    await verifySVGExport(page);
    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`35. Check that newly added nineteen standalone nucleotide can be saved to SVG Document`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check that newly added nineteen standalone nucleotide can be saved to SVG Document
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      3. Add new nucleotide to the canvas from the library
   *      4. Validate that the preset is on the canvas
   *      5. Save the structure as SVG Document
   *      6. Validate resulted SVG Document
   *      7. Clear the canvas
   *
   * Version 3.8
   */
  for (const nucleotide of newNucleotides) {
    await Library(page).clickMonomerAutochain(nucleotide);
    await expect(getMonomerLocator(page, nucleotide)).toBeVisible();
    await verifySVGExport(page);
    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`36. Check that newly added sixty-five new CHEMs can be saved to SVG Document`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check that newly added sixty-five new CHEMs can be saved to SVG Document
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      3. Add new CHEM to the canvas from the library
   *      4. Validate that the preset is on the canvas
   *      5. Save the structure as SVG Document
   *      6. Validate resulted SVG Document
   *      7. Clear the canvas
   *
   * Version 3.8
   */
  test.slow();
  for (const chem of newCHEMs) {
    await Library(page).clickMonomerAutochain(chem);
    await expect(getMonomerLocator(page, chem)).toBeVisible();
    await verifySVGExport(page);
    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`37. Check that newly added two phosphates can be deleted from canvas by Erase tool and restored by Undo`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check that newly added two phosphates can be deleted from canvas by Erase tool and restored by Undo
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      3. Add new phosphates AmC12, AmC6 to the canvas from the library
   *      4. Validate that the phosphates are on the canvas
   *      5. Delete the phosphate by Erase tool
   *      6. Validate that the phosphate is deleted from the canvas
   *      7. Restore the phosphate by Undo
   *      8. Validate that the phosphates are on the canvas
   *      9. Clear the canvas
   *
   * Version 3.8
   */
  for (const phosphate of newPhosphates) {
    await Library(page).clickMonomerAutochain(phosphate);
    // to remove selection after adding monomer
    await clickOnCanvas(page, 0, 0);

    const monomer = getMonomerLocator(page, phosphate);
    await expect(monomer).toBeVisible();
    await CommonLeftToolbar(page).selectEraseTool();
    await monomer.click();
    await expect(monomer).not.toBeVisible();
    await CommonTopLeftToolbar(page).undo();
    await expect(monomer).toBeVisible();
    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`38. Check that newly added eleven presets can be deleted from canvas by Erase tool and restored by Undo`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check that newly added eleven presets can be deleted from canvas by Erase tool and restored by Undo
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      3. Add new preset to the canvas from the library
   *      4. Validate that the preset is on the canvas
   *      5. Delete the preset by Erase tool
   *      6. Validate that the preset is deleted from the canvas
   *      7. Restore the preset by Undo
   *      8. Validate that the presets are on the canvas
   *      9. Clear the canvas
   *
   * Version 3.8
   */
  test.slow();
  for (const preset of newPresets) {
    await Library(page).clickMonomerAutochain(preset);
    // to remove selection after adding monomer
    await clickOnCanvas(page, 0, 0);

    const sugarMonomer = getMonomerLocator(page, preset.sugar);
    const baseMonomer = preset.base
      ? getMonomerLocator(page, preset.base)
      : null;
    const phosphateMonomer = preset.phosphate
      ? getMonomerLocator(page, preset.phosphate)
      : null;
    await expect.soft(sugarMonomer).toBeVisible();
    if (baseMonomer) await expect.soft(baseMonomer).toBeVisible();
    if (phosphateMonomer) await expect.soft(phosphateMonomer).toBeVisible();

    await CommonLeftToolbar(page).selectEraseTool();

    await sugarMonomer.click();
    if (baseMonomer) await baseMonomer.click();
    if (phosphateMonomer) await phosphateMonomer.click();

    await expect.soft(sugarMonomer).not.toBeVisible();
    if (baseMonomer) await expect.soft(baseMonomer).not.toBeVisible();
    if (phosphateMonomer) await expect.soft(phosphateMonomer).not.toBeVisible();

    await CommonTopLeftToolbar(page).undo();
    if (baseMonomer) await CommonTopLeftToolbar(page).undo();
    if (phosphateMonomer) await CommonTopLeftToolbar(page).undo();

    await expect.soft(sugarMonomer).toBeVisible();
    if (baseMonomer) await expect.soft(baseMonomer).toBeVisible();
    if (phosphateMonomer) await expect.soft(phosphateMonomer).toBeVisible();

    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`39. Check that newly added nineteen standalone nucleotide can be deleted from canvas by Erase tool and restored by Undo
`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check that newly added nineteen standalone nucleotide can be deleted from canvas by Erase tool and restored by Undo

   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      3. Add new nucleotide to the canvas from the library
   *      4. Validate that the preset is on the canvas
   *      5. Delete the nucleotide by Erase tool
   *      6. Validate that the nucleotide is deleted from the canvas
   *      7. Restore the nucleotide by Undo
   *      8. Validate that the nucleotides are on the canvas
   *      9. Clear the canvas
   *
   * Version 3.8
   */
  for (const nucleotide of newNucleotides) {
    await Library(page).clickMonomerAutochain(nucleotide);
    // to remove selection after adding monomer
    await clickOnCanvas(page, 0, 0);

    const monomer = getMonomerLocator(page, nucleotide);
    await expect(monomer).toBeVisible();
    await CommonLeftToolbar(page).selectEraseTool();
    await monomer.click();
    await expect(monomer).not.toBeVisible();
    await CommonTopLeftToolbar(page).undo();
    await expect(monomer).toBeVisible();
    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`40. Check that newly added sixty-five new CHEMs can be deleted from canvas by Erase tool and restored by Undo`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check that newly added sixty-five new CHEMs can be deleted from canvas by Erase tool and restored by Undo
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      3. Add new CHEM to the canvas from the library
   *      4. Validate that the CHEM is on the canvas
   *      5. Delete the CHEM by Erase tool
   *      6. Validate that the CHEM is deleted from the canvas
   *      7. Restore the CHEM by Undo
   *      8. Validate that the CHEMs are on the canvas
   *      9. Clear the canvas
   *
   * Version 3.8
   */
  test.slow();
  for (const chem of newCHEMs) {
    await Library(page).clickMonomerAutochain(chem);
    // to remove selection after adding monomer
    await clickOnCanvas(page, 0, 0);

    const monomer = getMonomerLocator(page, chem);
    await expect(monomer).toBeVisible();
    await CommonLeftToolbar(page).selectEraseTool();
    await monomer.click();
    await expect(monomer).not.toBeVisible();
    await CommonTopLeftToolbar(page).undo();
    await expect(monomer).toBeVisible();
    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`41. Check that newly added two phosphates can be deleted from canvas by Clear canvas button and restored by Undo`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check that newly added two phosphates can be deleted from canvas by Clear canvas button and restored by Undo
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      3. Add new phosphates AmC12, AmC6 to the canvas from the library
   *      4. Validate that the phosphates are on the canvas
   *      5. Delete the phosphate by pressing Clear canvas button
   *      6. Validate that the phosphate is deleted from the canvas
   *      7. Restore the phosphate by Undo
   *      8. Validate that the phosphates are on the canvas
   *      9. Clear the canvas
   *
   * Version 3.8
   */
  for (const phosphate of newPhosphates) {
    await Library(page).clickMonomerAutochain(phosphate);
    // to remove selection after adding monomer
    await clickOnCanvas(page, 0, 0);

    const monomer = getMonomerLocator(page, phosphate);
    await expect(monomer).toBeVisible();
    await CommonTopLeftToolbar(page).clearCanvas();
    await expect(monomer).not.toBeVisible();
    await CommonTopLeftToolbar(page).undo();
    await expect(monomer).toBeVisible();
    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`42. Check that newly added eleven presets can be deleted from canvas by Clear canvas button and restored by Undo`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check that newly added eleven presets can be deleted from canvas by Clear canvas button and restored by Undo
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      3. Add new preset to the canvas from the library
   *      4. Validate that the preset is on the canvas
   *      5. Delete the preset by pressing Clear canvas button
   *      6. Validate that the preset is deleted from the canvas
   *      7. Restore the preset by Undo
   *      8. Validate that the presets are on the canvas
   *      9. Clear the canvas
   *
   * Version 3.8
   */
  test.slow();
  for (const preset of newPresets) {
    await Library(page).clickMonomerAutochain(preset);
    // to remove selection after adding monomer
    await clickOnCanvas(page, 0, 0);

    const sugarMonomer = getMonomerLocator(page, preset.sugar);
    const baseMonomer = preset.base
      ? getMonomerLocator(page, preset.base)
      : null;
    const phosphateMonomer = preset.phosphate
      ? getMonomerLocator(page, preset.phosphate)
      : null;
    await expect.soft(sugarMonomer).toBeVisible();
    if (baseMonomer) await expect.soft(baseMonomer).toBeVisible();
    if (phosphateMonomer) await expect.soft(phosphateMonomer).toBeVisible();

    await CommonTopLeftToolbar(page).clearCanvas();

    await expect.soft(sugarMonomer).not.toBeVisible();
    if (baseMonomer) await expect.soft(baseMonomer).not.toBeVisible();
    if (phosphateMonomer) await expect.soft(phosphateMonomer).not.toBeVisible();

    await CommonTopLeftToolbar(page).undo();

    await expect.soft(sugarMonomer).toBeVisible();
    if (baseMonomer) await expect.soft(baseMonomer).toBeVisible();
    if (phosphateMonomer) await expect.soft(phosphateMonomer).toBeVisible();

    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`43. Check that newly added nineteen standalone nucleotide can be deleted from canvas by Clear canvas button and restored by Undo`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check that newly added nineteen standalone nucleotide can be deleted from canvas by Clear canvas button and restored by Undo

   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      3. Add new nucleotide to the canvas from the library
   *      4. Validate that the preset is on the canvas
   *      5. Delete the nucleotide by pressing Clear canvas button
   *      6. Validate that the nucleotide is deleted from the canvas
   *      7. Restore the nucleotide by Undo
   *      8. Validate that the nucleotides are on the canvas
   *      9. Clear the canvas
   *
   * Version 3.8
   */
  for (const nucleotide of newNucleotides) {
    await Library(page).clickMonomerAutochain(nucleotide);
    // to remove selection after adding monomer
    await clickOnCanvas(page, 0, 0);

    const monomer = getMonomerLocator(page, nucleotide);
    await expect(monomer).toBeVisible();
    await CommonTopLeftToolbar(page).clearCanvas();
    await expect(monomer).not.toBeVisible();
    await CommonTopLeftToolbar(page).undo();
    await expect(monomer).toBeVisible();
    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`44.   Check that newly added sixty-five new CHEMs can be deleted from canvas by Clear canvas buttonl and restored by Undo`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description:   Check that newly added sixty-five new CHEMs can be deleted from canvas by Clear canvas buttonl and restored by Undo
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      3. Add new CHEM to the canvas from the library
   *      4. Validate that the CHEM is on the canvas
   *      5. Delete the CHEM by pressing Clear canvas button
   *      6. Validate that the CHEM is deleted from the canvas
   *      7. Restore the CHEM by Undo
   *      8. Validate that the CHEMs are on the canvas
   *      9. Clear the canvas
   *
   * Version 3.8
   */
  test.slow();
  for (const chem of newCHEMs) {
    await Library(page).clickMonomerAutochain(chem);
    // to remove selection after adding monomer
    await clickOnCanvas(page, 0, 0);

    const monomer = getMonomerLocator(page, chem);
    await expect(monomer).toBeVisible();
    await CommonTopLeftToolbar(page).clearCanvas();
    await expect(monomer).not.toBeVisible();
    await CommonTopLeftToolbar(page).undo();
    await expect(monomer).toBeVisible();
    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`45.1 Check that newly added two phosphates can be connected to any monomer by Single bond tool from center to center`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check that newly added two phosphates can be connected to any monomer by Single bond tool from center to center
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      3. Add new phosphates AmC12, AmC6 to the canvas from the library
   *      4. Add 2_damdA nucleotide to the canvas from the library
   *      5. Bond the phosphate to 2_damdA by Single bond tool from center to center
   *      6. Validate that bond is created
   *      7. Clear the canvas
   *      8. Repeat steps 2-6 for each phosphate
   *
   * Version 3.8
   */
  for (const phosphate of newPhosphates) {
    await Library(page).clickMonomerAutochain(phosphate);
    // to remove selection after adding monomer
    await clickOnCanvas(page, 0, 0);
    await Library(page).clickMonomerAutochain(Nucleotide._2_damdA);
    const monomer = getMonomerLocator(page, phosphate);
    const monomerConnectTo = getMonomerLocator(page, Nucleotide._2_damdA);

    await bondTwoMonomers(page, monomer, monomerConnectTo);
    if (await ConnectionPointsDialog(page).isVisible()) {
      await ConnectionPointsDialog(page).selectAttachmentPoints({
        leftMonomer: (await getAvailableAttachmentPoints(monomer))[0],
        rightMonomer: AttachmentPoint.R1,
      });
      await ConnectionPointsDialog(page).connect();
    }
    const bond = getBondLocator(page, {
      bondType: MacroBondDataIds.Single,
      toConnectionPoint: AttachmentPoint.R1,
      toMonomerId: (
        (await monomerConnectTo.getAttribute('data-monomerid')) || ''
      ).toString(),
    });

    await expect(bond).toBeAttached();
    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`45.2 Check that newly added two phosphates can be connected to any monomer by Single bond tool from attachment point to attachment point`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check that newly added two phosphates can be connected to any monomer by Single bond tool from attachment point to attachment point
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      3. Add new phosphates AmC12, AmC6 to the canvas from the library
   *      4. Add 2_damdA nucleotide to the canvas from the library
   *      5. Bond the phosphate to 2_damdA by Single bond tool from attachment point to attachment point
   *      6. Validate that bond is created
   *      7. Clear the canvas
   *      8. Repeat steps 2-6 for each phosphate
   *
   * Version 3.8
   */
  for (const phosphate of newPhosphates) {
    await Library(page).clickMonomerAutochain(phosphate);
    // to remove selection after adding monomer
    await clickOnCanvas(page, 0, 0);
    await Library(page).clickMonomerAutochain(Nucleotide._2_damdA);
    const monomer = getMonomerLocator(page, phosphate);
    const monomerConnectTo = getMonomerLocator(page, Nucleotide._2_damdA);

    const bond = await bondTwoMonomersPointToPoint(
      page,
      monomer,
      monomerConnectTo,
      (
        await getAvailableAttachmentPoints(monomer)
      )[0],
      AttachmentPoint.R1,
    );

    await expect(bond).toBeAttached();
    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`46.1 Check that newly added eleven presets can be connected to any monomer by Single bond tool from center to center`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check that newly added eleven presets can be connected to any monomer by Single bond tool from center to center
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      3. Add new preset to the canvas from the library
   *      4. Add 2_damdA nucleotide to the canvas from the library
   *      5. Bond the preset to 2_damdA by Single bond tool from center to center
   *      6. Validate that bond is created
   *      7. Clear the canvas
   *      8. Repeat steps 2-6 for each preset
   *
   * Version 3.8
   */
  for (const preset of newPresets) {
    await Library(page).clickMonomerAutochain(preset);
    // to remove selection after adding monomer
    await clickOnCanvas(page, 0, 0);
    await Library(page).clickMonomerAutochain(Nucleotide._2_damdA);
    const monomer = getMonomerLocator(page, preset.sugar);
    const monomerConnectTo = getMonomerLocator(page, Nucleotide._2_damdA);

    const bond = await bondTwoMonomersPointToPoint(
      page,
      monomer,
      monomerConnectTo,
      (
        await getAvailableAttachmentPoints(monomer)
      )[0],
      AttachmentPoint.R1,
    );

    await expect(bond).toBeAttached();
    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`46.2 Check that newly added eleven presets can be connected to any monomer by Single bond tool from attachment point to attachment point`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check that newly added eleven presets can be connected to any monomer by Single bond tool from attachment point to attachment point
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      3. Add new preset to the canvas from the library
   *      4. Add 2_damdA nucleotide to the canvas from the library
   *      5. Bond the preset (sugar) to 2_damdA by Single bond tool from attachment point to attachment point
   *      6. Validate that bond is created
   *      7. Clear the canvas
   *      8. Repeat steps 2-6 for each nucleotide
   *
   * Version 3.8
   */
  for (const preset of newPresets) {
    await Library(page).clickMonomerAutochain(preset);
    // to remove selection after adding monomer
    await clickOnCanvas(page, 0, 0);
    await Library(page).clickMonomerAutochain(Nucleotide._2_damdA);
    const monomer = getMonomerLocator(page, preset.sugar);
    const monomerConnectTo = getMonomerLocator(page, Nucleotide._2_damdA);

    const bond = await bondTwoMonomersPointToPoint(
      page,
      monomer,
      monomerConnectTo,
      (
        await getAvailableAttachmentPoints(monomer)
      )[0],
      AttachmentPoint.R2,
    );

    await expect(bond).toBeAttached();
    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`47.1 Check that newly added nineteen standalone nucleotide can be connected to any monomer by Single bond tool from center to center`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check that newly added nineteen standalone nucleotide can be connected to any monomer by Single bond tool from center to center
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      3. Add new nucleotide to the canvas from the library
   *      4. Add 2_damdA nucleotide to the canvas from the library
   *      5. Bond the nucleotide to 2_damdA by Single bond tool from center to center
   *      6. Validate that bond is created
   *      7. Clear the canvas
   *      8. Repeat steps 2-6 for each nucleotide
   *
   * Version 3.8
   */
  for (const nucleotide of newNucleotides) {
    await Library(page).clickMonomerAutochain(nucleotide);
    // to remove selection after adding monomer
    await clickOnCanvas(page, 0, 0);
    await Library(page).clickMonomerAutochain(Nucleotide._2_damdA);
    const monomer = getMonomerLocator(page, nucleotide);
    const monomerConnectTo = getMonomerLocator(page, Nucleotide._2_damdA);

    const bond = await bondTwoMonomersPointToPoint(
      page,
      monomer,
      monomerConnectTo,
      (
        await getAvailableAttachmentPoints(monomer)
      )[0],
      AttachmentPoint.R1,
    );

    await expect(bond).toBeAttached();
    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`47.2 Check that newly added nineteen standalone nucleotide can be connected to any monomer by Single bond tool from attachment point to attachment point`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check that newly added nineteen standalone nucleotide can be connected to any monomer by Single bond tool from attachment point to attachment point
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      3. Add new nucleotide to the canvas from the library
   *      4. Add 2_damdA nucleotide to the canvas from the library
   *      5. Bond the nucleotide to 2_damdA by Single bond tool from attachment point to attachment point
   *      6. Validate that bond is created
   *      7. Clear the canvas
   *      8. Repeat steps 2-6 for each nucleotide
   *
   * Version 3.8
   */
  for (const nucleotide of newNucleotides) {
    await Library(page).clickMonomerAutochain(nucleotide);
    // to remove selection after adding monomer
    await clickOnCanvas(page, 0, 0);
    await Library(page).clickMonomerAutochain(Nucleotide._2_damdA);
    const monomer = getMonomerLocator(page, nucleotide);
    const monomerConnectTo = getMonomerLocator(page, Nucleotide._2_damdA);

    const bond = await bondTwoMonomersPointToPoint(
      page,
      monomer,
      monomerConnectTo,
      (
        await getAvailableAttachmentPoints(monomer)
      )[0],
      AttachmentPoint.R1,
    );

    await expect(bond).toBeAttached();
    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`48.1  Check that newly added sixty-five new CHEMs can be connected to any monomer by Single bond tool from center to center`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check that newly added sixty-five new CHEMs can be connected to any monomer by Single bond tool from center to center
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      3. Add new CHEMs to the canvas from the library
   *      4. Add 2_damdA nucleotide to the canvas from the library
   *      5. Bond the CHEM to 2_damdA by Single bond tool from center to center
   *      6. Validate that bond is created
   *      7. Clear the canvas
   *      8. Repeat steps 2-6 for each CHEM
   *
   * Version 3.8
   */
  for (const chem of newCHEMs) {
    await Library(page).clickMonomerAutochain(chem);
    // to remove selection after adding monomer
    await clickOnCanvas(page, 0, 0);
    await Library(page).clickMonomerAutochain(Nucleotide._2_damdA);
    const monomer = getMonomerLocator(page, chem);
    const monomerConnectTo = getMonomerLocator(page, Nucleotide._2_damdA);

    const bond = await bondTwoMonomersPointToPoint(
      page,
      monomer,
      monomerConnectTo,
      (
        await getAvailableAttachmentPoints(monomer)
      )[0],
      AttachmentPoint.R1,
    );

    await expect(bond).toBeAttached();
    await CommonTopLeftToolbar(page).clearCanvas();
  }
});

test(`48.2 Check that newly added sixty-five new CHEMs can be connected to any monomer by Single bond tool from attachment point to attachment point`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7910
   * Description: Check that newly added sixty-five new CHEMs can be connected to any monomer by Single bond tool from attachment point to attachment point
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex
   *      3. Add new CHEMs to the canvas from the library
   *      4. Add 2_damdA nucleotide to the canvas from the library
   *      5. Bond the CHEM to 2_damdA by Single bond tool from attachment point to attachment point
   *      6. Validate that bond is created
   *      7. Clear the canvas
   *      8. Repeat steps 2-6 for each CHEM
   *
   * Version 3.8
   */
  test.slow();
  for (const chem of newCHEMs) {
    await Library(page).clickMonomerAutochain(chem);
    // to remove selection after adding monomer
    await clickOnCanvas(page, 0, 0);
    await Library(page).clickMonomerAutochain(Nucleotide._2_damdA);
    const monomer = getMonomerLocator(page, chem);
    const monomerConnectTo = getMonomerLocator(page, Nucleotide._2_damdA);

    const bond = await bondTwoMonomersPointToPoint(
      page,
      monomer,
      monomerConnectTo,
      (
        await getAvailableAttachmentPoints(monomer)
      )[0],
      AttachmentPoint.R1,
    );

    await expect(bond).toBeAttached();
    await CommonTopLeftToolbar(page).clearCanvas();
  }
});
