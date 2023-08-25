import { Page } from '@playwright/test';
import { AtomLabelType } from '@utils/clicks/types';
import { clickOnAtom, pressButton } from '..';

export enum AttachmentPoint {
  PRIMARY = 'Primary attachment point',
  SECONDARY = 'Secondary attachment point',
}

export async function setAttachmentPoints(
  page: Page,
  atom: { label: AtomLabelType; index: number },
  { primary = false, secondary = false },
  buttonToClick?: 'Apply' | 'Cancel',
) {
  await clickOnAtom(page, atom.label, atom.index);
  await page.getByLabel(AttachmentPoint.PRIMARY).setChecked(primary);
  await page.getByLabel(AttachmentPoint.SECONDARY).setChecked(secondary);

  if (buttonToClick === 'Apply') {
    await pressButton(page, 'Apply');
  } else if (buttonToClick === 'Cancel') {
    await pressButton(page, 'Cancel');
  }
}
