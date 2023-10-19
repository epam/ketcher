import { Page } from '@playwright/test';
import { STRUCTURE_LIBRARY_BUTTON_TEST_ID } from '@tests/Templates/templates.costants';
export async function openStructureLibrary(page: Page) {
  await page.getByTestId(STRUCTURE_LIBRARY_BUTTON_TEST_ID).click();
}

export async function openFunctionalGroup(page: Page) {
  await openStructureLibrary(page);
  await page.getByText('Functional Group').click();
}

export async function editStructureTemplate(
  page: Page,
  templateCategory: string,
  templateName: string,
) {
  const editStructureButton = page.getByTitle(templateName).getByRole('button');
  await openStructureLibrary(page);
  await page.getByText(templateCategory).click();
  await editStructureButton.click();
}
