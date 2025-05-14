import { Page } from '@playwright/test';
import {
  BottomToolbar,
  openStructureLibrary,
} from '@tests/pages/molecules/BottomToolbar';

export async function openFunctionalGroup(page: Page) {
  await BottomToolbar(page).StructureLibrary();
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
