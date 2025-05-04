import { test, expect } from '@playwright/test';
import { takeEditorScreenshot, waitForPageInit } from '@utils';
import {
  selectOpenFileTool,
  selectSaveTool,
  topLeftToolbarLocators,
} from '@tests/pages/common/TopLeftToolbar';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import {
  MoleculesFileFormatName,
  MoleculesFileFormatType,
} from '@tests/pages/constants/fileFormats/microFileFormats';

test.describe('Open Ketcher', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Open button tooltip', async ({ page }) => {
    // Test case: EPMLSOPKET-1833
    const button = topLeftToolbarLocators(page).openButton;
    await expect(button).toHaveAttribute('title', 'Open... (Ctrl+O)');
  });

  test('Open button UI', async ({ page }) => {
    // Test case: EPMLSOPKET-1834
    await selectOpenFileTool(page);
    await takeEditorScreenshot(page);
  });

  test('Save button tooltip', async ({ page }) => {
    // Test case: EPMLSOPKET-1842
    const button = topLeftToolbarLocators(page).saveButton;
    await expect(button).toHaveAttribute('title', 'Save as... (Ctrl+S)');
  });

  test('Save button UI', async ({ page }) => {
    // Test case: EPMLSOPKET-1843
    const saveStructureTextarea =
      SaveStructureDialog(page).saveStructureTextarea;

    await selectSaveTool(page);
    await takeEditorScreenshot(page, {
      mask: [saveStructureTextarea],
    });
  });

  const fileFormats = [
    [MoleculesFileFormatType.KetFormat, MoleculesFileFormatName.KetFormat],
    [
      MoleculesFileFormatType.MDLMolfileV2000,
      MoleculesFileFormatName.MDLMolfileV2000,
    ],
    [
      MoleculesFileFormatType.MDLMolfileV3000,
      MoleculesFileFormatName.MDLMolfileV3000,
    ],
    [MoleculesFileFormatType.SDFV2000, MoleculesFileFormatName.SDFV2000],
    [MoleculesFileFormatType.SDFV3000, MoleculesFileFormatName.SDFV3000],
    [MoleculesFileFormatType.RDFV2000, MoleculesFileFormatName.RDFV2000],
    [MoleculesFileFormatType.RDFV3000, MoleculesFileFormatName.RDFV3000],
    [
      MoleculesFileFormatType.DaylightSMARTS,
      MoleculesFileFormatName.DaylightSMARTS,
    ],
    [
      MoleculesFileFormatType.DaylightSMILES,
      MoleculesFileFormatName.DaylightSMILES,
    ],
    [
      MoleculesFileFormatType.ExtendedSMILES,
      MoleculesFileFormatName.ExtendedSMILES,
    ],
    [MoleculesFileFormatType.CML, MoleculesFileFormatName.CML],
    [MoleculesFileFormatType.InChI, MoleculesFileFormatName.InChI],
    [
      MoleculesFileFormatType.InChIAuxInfo,
      MoleculesFileFormatName.InChIAuxInfo,
    ],
    [MoleculesFileFormatType.InChIKey, MoleculesFileFormatName.InChIKey],
    [MoleculesFileFormatType.SVGDocument, MoleculesFileFormatName.SVGDocument],
    [MoleculesFileFormatType.PNGImage, MoleculesFileFormatName.PNGImage],
    [MoleculesFileFormatType.CDXML, MoleculesFileFormatName.CDXML],
    [MoleculesFileFormatType.Base64CDX, MoleculesFileFormatName.Base64CDX],
    [MoleculesFileFormatType.CDX, MoleculesFileFormatName.CDX],
  ];

  for (const fileFormat of fileFormats) {
    test(`dropdown options check_${fileFormat[1]}`, async ({ page }) => {
      const fileFormatDropdonwList =
        SaveStructureDialog(page).fileFormatDropdownList;
      await selectSaveTool(page);
      await fileFormatDropdonwList.click();

      const option = page.getByTestId(fileFormat[0]);
      await expect(option).toBeVisible();
    });
  }
});
