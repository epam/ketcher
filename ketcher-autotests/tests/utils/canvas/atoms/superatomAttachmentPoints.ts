import { Page } from '@playwright/test';
import { clickOnAtom } from '@utils';
import { AtomLabelType } from '@utils/clicks/types';

export async function addSuperatomAttachmentPoint(
  page: Page,
  atomLabel: AtomLabelType,
  atomIndex: number,
) {
  await page.keyboard.press('Escape');
  await clickOnAtom(page, atomLabel, atomIndex, 'right');
  await page.getByText('Add attachment point').click();
}

export async function removeSuperatomAttachmentPoint(
  page: Page,
  atomLabel: AtomLabelType,
  atomIndex: number,
) {
  await page.keyboard.press('Escape');
  await clickOnAtom(page, atomLabel, atomIndex, 'right');
  await page.getByText('Remove attachment point').click();
}
