/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, expect } from '@playwright/test';
import { test } from '@fixtures';
import {
  MacroFileType,
  pasteFromClipboardAndOpenAsNewProjectMacro,
} from '@utils';
import { Chem } from '@tests/pages/constants/monomers/Chem';
import { Phosphate } from '@tests/pages/constants/monomers/Phosphates';
import { Preset } from '@tests/pages/constants/monomers/Presets';
import { Nucleotide } from '@tests/pages/constants/monomers/Nucleotides';
import { Library } from '@tests/pages/macromolecules/Library';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';

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
  Chem._56_FAM,
  Chem.HEX,
  Chem.TET,
  Chem.Sp9,
  Chem.Cy5_5,
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
