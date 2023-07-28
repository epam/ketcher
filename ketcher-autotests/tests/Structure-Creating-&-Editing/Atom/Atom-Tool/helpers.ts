import { Page } from '@playwright/test';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { dragMouseTo, moveOnAtom } from '@utils/clicks';

export async function createNextChainElement(
  page: Page,
  previousAtomLabel: string,
  previousAtomIdx: number,
  directionX: number,
  directionY: number,
) {
  await moveOnAtom(page, previousAtomLabel, previousAtomIdx);

  const previousAtomPos = await getAtomByIndex(
    page,
    { label: previousAtomLabel },
    previousAtomIdx,
  );

  await dragMouseTo(
    previousAtomPos.x + directionX,
    previousAtomPos.y + directionY,
    page,
  );
}
