/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { test } from '@fixtures';
import { Page, expect } from '@playwright/test';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { Base } from '@tests/pages/constants/monomers/Bases';
import { Chem } from '@tests/pages/constants/monomers/Chem';
import { Nucleotide } from '@tests/pages/constants/monomers/Nucleotides';
import { Phosphate } from '@tests/pages/constants/monomers/Phosphates';
import { Preset } from '@tests/pages/constants/monomers/Presets';
import { MonomerPreviewTooltip } from '@tests/pages/macromolecules/canvas/MonomerPreviewTooltip';
import { Library } from '@tests/pages/macromolecules/Library';
import { MacroFileType } from '@utils/canvas/types';
import { pasteFromClipboardAndAddToMacromoleculesCanvas } from '@utils/files/readFile';
import { verifyAxoLabsExport } from '@utils/files/receiveFileComparisonData';
import { PresetType } from '@utils/index';
import { getMonomerLocator } from '@utils/macromolecules/monomer';

let page: Page;

test.beforeAll(async ({ initFlexCanvas }) => {
  page = await initFlexCanvas();
});
test.beforeEach(async ({ FlexCanvas: _ }) => {});
test.afterAll(async ({ closePage }) => {
  await closePage();
});

test('Case 1: Check that for AxoLabs, five nucleotide monomers added', async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/8322
   * Description: Check that for AxoLabs, five nucleotide monomers added
   * Scenario:
   *            1. Validate that five chains of three nucleotide monomers are present in the library
   *
   * Version 3.9
   */
  expect(await Library(page).isMonomerExist(Nucleotide.InvdA)).toBeTruthy();
  expect(await Library(page).isMonomerExist(Nucleotide.InvdC)).toBeTruthy();
  expect(await Library(page).isMonomerExist(Nucleotide.InvdG)).toBeTruthy();
  expect(await Library(page).isMonomerExist(Nucleotide.InvdT)).toBeTruthy();
  expect(await Library(page).isMonomerExist(Nucleotide.vinU)).toBeTruthy();
});

test("Case 2: Check that Name and symbol of one nucleotide already in the library changed - what was Inverted dT (InvdT) should now be 3' Inverted dT (3InvdT)", async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/8322
   * Description: Check that Name and symbol of one nucleotide already in the library changed - what was
   *              Inverted dT (InvdT) should now be 3' Inverted dT (3InvdT)
   * Scenario:
   *            1. Load axolabs string via Paste from Clipboard dialog
   *            2. Validate that five chains of three nucleotide monomers are present on the canvas
   *
   * Version 3.9
   */
  expect(await Library(page).isMonomerExist(Nucleotide._3InvdT)).toBeTruthy();

  await Library(page).hoverMonomer(Nucleotide._3InvdT);
  await MonomerPreviewTooltip(page).waitForBecomeVisible();
  expect(await MonomerPreviewTooltip(page).getTitleText()).toContain(
    "3' Inverted dT",
  );
});

function isPresetType(obj: unknown): obj is PresetType {
  if (typeof obj !== 'object' || obj === null) return false;
  const o = obj as Record<string, unknown>;

  return (
    typeof o.alias === 'string' &&
    typeof o.testId === 'string' &&
    typeof o.monomerType === 'string' &&
    typeof o.sugar === 'object' &&
    o.sugar !== null &&
    (o.base === undefined || (typeof o.base === 'object' && o.base !== null)) &&
    (o.phosphate === undefined ||
      (typeof o.phosphate === 'object' && o.phosphate !== null))
  );
}

const monomersWithAliases = [
  { axoLabsString: "5'-AAA-3'", expectedMonomer: Preset.A },
  { axoLabsString: "5'-CCC-3'", expectedMonomer: Preset.C },
  { axoLabsString: "5'-GGG-3'", expectedMonomer: Preset.G },
  { axoLabsString: "5'-dIdIdI-3'", expectedMonomer: Preset.dR_In_P },
  { axoLabsString: "5'-AmAmAm-3'", expectedMonomer: Preset.MOE_A_P },
  { axoLabsString: "5'-GmGmGm-3'", expectedMonomer: Preset.MOE_G_P },
  { axoLabsString: "5'-TmTmTm-3'", expectedMonomer: Preset.MOE_T_P },
  { axoLabsString: "5'-AfAfAf-3'", expectedMonomer: Preset.fR_A_P },
  { axoLabsString: "5'-CfCfCf-3'", expectedMonomer: Preset.fR_C_P },
  { axoLabsString: "5'-GfGfGf-3'", expectedMonomer: Preset.fR_G_P },
  { axoLabsString: "5'-UfUfUf-3'", expectedMonomer: Preset.fR_U_P },
  {
    axoLabsString: "5'-(5MdC)(5MdC)(5MdC)-3'",
    expectedMonomer: Preset.dR_5meC_P,
  },
  {
    axoLabsString: "5'-(invdA)(invdA)(invdA)-3'",
    expectedMonomer: Nucleotide.InvdA,
  },
  {
    axoLabsString: "5'-(invdC)(invdC)(invdC)-3'",
    expectedMonomer: Nucleotide.InvdC,
  },
  {
    axoLabsString: "5'-(invdG)(invdG)(invdG)-3'",
    expectedMonomer: Nucleotide.InvdG,
  },
  {
    axoLabsString: "5'-(invdT)(invdT)(invdT)-3'",
    expectedMonomer: Nucleotide.InvdT,
  },
  {
    axoLabsString: "5'-(vinu)(vinu)(vinu)-3'",
    expectedMonomer: Nucleotide.vinU,
  },
  {
    axoLabsString: "5'-(NHC6)(NHC6)(NHC6)-3'",
    expectedMonomer: Chem.A6OH,
  },
  { axoLabsString: "5'-pAAp-3'", expectedMonomer: Phosphate.P },
  { axoLabsString: "5'-AsAsAsA-3'", expectedMonomer: Phosphate.sP },
];

test('Case 3: Check that for following structures in the library, aliases assigned: A, C, G, U, dI, Am, Gm, Tm, Af, Cf, Gf, Uf, (5MdC), (invdA), (invdC), (invdG), (invdT), (vinu), (NHC6), p, s', async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/8322
   * Description: 1. Check that for following structures in the library, aliases assigned: A, C, G, U, dI, Am, Gm, Tm, Af,
   *                 Cf, Gf, Uf, (5MdC), (invdA), (invdC), (invdG), (invdT), (vinu), (NHC6), p, s
   *              2. Verify that in the Open... and Save as... windows, a new format added "AxoLabs", and it placed bellow IDT
   *              3. Check that if "AxoLabs" is chosen as a format on import that string interpreted as an AxoLabs string
   *              4. Check that if "AxoLabs" is chosen as a format on export, the canvas contents saved as an AxoLabs string (if possible)
   *
   * Scenario:
   *            1. Load axolabs string via Paste from Clipboard dialog
   *            2. Validate that five chains of three nucleotide monomers are present on the canvas
   *
   * Version 3.9
   */
  test.slow();
  for (const monomer of monomersWithAliases) {
    await CommonTopLeftToolbar(page).clearCanvas();
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.AxoLabs,
      monomer.axoLabsString,
    );
    const monomerOnCanvas = isPresetType(monomer.expectedMonomer)
      ? getMonomerLocator(page, monomer.expectedMonomer.base ?? Base.NoBase)
      : getMonomerLocator(page, monomer.expectedMonomer);

    await expect(monomerOnCanvas.nth(0)).toBeVisible();
    await expect(monomerOnCanvas.nth(1)).toBeVisible();
    await expect(monomerOnCanvas.nth(2)).toBeVisible();

    await verifyAxoLabsExport(page, monomer.axoLabsString);
  }
});
