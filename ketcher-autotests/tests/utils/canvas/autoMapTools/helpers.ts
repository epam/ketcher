import { moveOnAtom } from '@utils/clicks';
import { resetCurrentTool, selectLeftPanelButton } from '../tools';
import { Page } from '@playwright/test';
import { LeftPanelButton } from '@utils/selectors';

interface Atom {
  label: string;
  number: number;
}

export async function mapTwoAtoms(page: Page, atom1: Atom, atom2: Atom) {
  await resetCurrentTool(page);
  await selectLeftPanelButton(LeftPanelButton.ReactionMappingTool, page);
  await moveOnAtom(page, atom1.label, atom1.number);
  await page.mouse.down();
  await moveOnAtom(page, atom2.label, atom2.number);
  await page.mouse.up();
}
