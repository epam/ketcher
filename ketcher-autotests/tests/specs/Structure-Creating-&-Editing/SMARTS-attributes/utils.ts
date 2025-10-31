import { Page, expect } from '@playwright/test';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';

// Bond attributes:

export async function setBondType(page: Page, bondTypeTestId: string) {
  await page.getByTestId('type-input-span').click();
  await page.getByTestId(bondTypeTestId).click();
}

export async function verifySMARTSExport(page: Page, value: string) {
  await CommonTopLeftToolbar(page).saveFile();
  await SaveStructureDialog(page).chooseFileFormat(
    MoleculesFileFormatType.DaylightSMARTS,
  );
  await expect(SaveStructureDialog(page).saveStructureTextarea).toHaveValue(
    value,
  );
  await SaveStructureDialog(page).closeWindow();
}

export async function verifySMARTSExportWarnings(page: Page) {
  const value =
    'Structure contains query properties of atoms and bonds that are not supported in the SMARTS. Query properties will not be reflected in the file saved.';
  await CommonTopLeftToolbar(page).saveFile();
  await SaveStructureDialog(page).chooseFileFormat(
    MoleculesFileFormatType.DaylightSMARTS,
  );
  await SaveStructureDialog(page).switchToWarningsTab();
  const warningSmartsTextArea = SaveStructureDialog(
    page,
  ).warningTextarea.filter({ hasText: 'SMARTS' });
  const warningText = await warningSmartsTextArea.evaluate(
    (node) => node.textContent,
  );
  expect(warningText).toEqual(value);
  await SaveStructureDialog(page).closeWindow();
}
