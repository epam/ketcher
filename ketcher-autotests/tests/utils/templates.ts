import { Page } from '@playwright/test';

export async function openStructureLibrary(page: Page) {
  await page.getByTestId('template-lib').click();
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
