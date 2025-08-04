import { Page } from '@playwright/test';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { MicroAtomOption } from '@tests/pages/constants/contextMenu/Constants';
import { getAtomByIndex } from '@utils/canvas/atoms/getAtomByIndex/getAtomByIndex';
import { AtomLabelType } from '@utils/clicks/types';

export async function addSuperatomAttachmentPoint(
  page: Page,
  atomLabel: AtomLabelType,
  atomIndex: number,
) {
  await page.keyboard.press('Escape');
  const point = await getAtomByIndex(page, { label: atomLabel }, atomIndex);
  await ContextMenu(page, point).click(MicroAtomOption.AddAttachmentPoint);
}

export async function removeSuperatomAttachmentPoint(
  page: Page,
  atomLabel: AtomLabelType,
  atomIndex: number,
) {
  await page.keyboard.press('Escape');
  const point = await getAtomByIndex(page, { label: atomLabel }, atomIndex);
  await ContextMenu(page, point).click(MicroAtomOption.RemoveAttachmentPoint);
}
