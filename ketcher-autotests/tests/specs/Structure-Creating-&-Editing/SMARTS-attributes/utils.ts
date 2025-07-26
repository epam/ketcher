import { Page, expect } from '@playwright/test';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { MoleculesFileFormatType } from '@tests/pages/constants/fileFormats/microFileFormats';

// Custom query - bond properties:

export async function setCustomQueryForBond(page: Page, customQuery: string) {
  await page.getByTestId('custom-query-checkbox').check();
  await page.getByTestId('bond-custom-query').fill(customQuery);
}

// Bond attributes:

export async function setBondType(page: Page, bondTypeTestId: string) {
  await page.getByTestId('type-input-span').click();
  await page.getByTestId(bondTypeTestId).click();
}

export async function setBondTopology(page: Page, bondTopologyTestId: string) {
  await page.getByTestId('topology-input-span').click();
  await page.getByTestId(bondTopologyTestId).click();
}

export async function setReactingCenter(
  page: Page,
  reactingCenterOptionTestId: string,
) {
  await page.getByTestId('reacting-center-input-span').click();
  await page.getByTestId(reactingCenterOptionTestId).click();
}

// Other

export async function checkSmartsValue(page: Page, value: string) {
  const saveStructureTextarea = SaveStructureDialog(page).saveStructureTextarea;

  await CommonTopLeftToolbar(page).saveFile();
  await SaveStructureDialog(page).chooseFileFormat(
    MoleculesFileFormatType.DaylightSMARTS,
  );
  await expect(saveStructureTextarea).toHaveValue(value);
}

export async function checkSmartsWarnings(page: Page) {
  const value =
    'Structure contains query properties of atoms and bonds that are not supported in the SMARTS. Query properties will not be reflected in the file saved.';
  const warningsTab = SaveStructureDialog(page).warningsTab;
  const warningTextarea = SaveStructureDialog(page).warningTextarea;

  await warningsTab.click();
  const warningSmartsTextArea = warningTextarea.filter({ hasText: 'SMARTS' });
  const warningText = await warningSmartsTextArea.evaluate(
    (node) => node.textContent,
  );
  expect(warningText).toEqual(value);
}
