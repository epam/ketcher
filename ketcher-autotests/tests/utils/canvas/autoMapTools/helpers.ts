import { moveOnAtom } from '@utils/clicks';
import { resetCurrentTool } from '../tools';
import { Page } from '@playwright/test';
import { ReactionMappingType } from '@tests/pages/constants/reactionMappingTool/Constants';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';

interface Atom {
  label: string;
  number: number;
}

export async function mapTwoAtoms(page: Page, atom1: Atom, atom2: Atom) {
  await resetCurrentTool(page);
  await LeftToolbar(page).selectReactionMappingTool(
    ReactionMappingType.ReactionMapping,
  );
  await moveOnAtom(page, atom1.label, atom1.number);
  await page.mouse.down();
  await moveOnAtom(page, atom2.label, atom2.number);
  await page.mouse.up();
}
