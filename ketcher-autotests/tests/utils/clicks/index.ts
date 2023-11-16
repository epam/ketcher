import { Page } from '@playwright/test';
import { getAtomByIndex } from '@utils/canvas/atoms';
import { getBondByIndex } from '@utils/canvas/bonds';
import {
  BondType,
  ReactionMappingTool,
  resetCurrentTool,
  selectButtonById,
  selectNestedTool,
  takeEditorScreenshot,
  waitForRender,
} from '..';
import { AtomLabelType, DropdownIds, DropdownToolIds } from './types';

type BoundingBox = {
  width: number;
  height: number;
  y: number;
  x: number;
};

const HALF_DIVIDER = 2;

export async function clickInTheMiddleOfTheScreen(
  page: Page,
  button: 'left' | 'right' = 'left',
) {
  const body = (await page.locator('body').boundingBox()) as BoundingBox;
  await waitForRender(page, async () => {
    await page.mouse.click(
      body.x + body?.width / HALF_DIVIDER,
      body.y + body?.height / HALF_DIVIDER,
      {
        button,
      },
    );
  });
}

export async function getCoordinatesOfTheMiddleOfTheScreen(page: Page) {
  const body = (await page.locator('body').boundingBox()) as BoundingBox;
  return {
    x: body.x + body.width / HALF_DIVIDER,
    y: body.y + body.height / HALF_DIVIDER,
  };
}

/* Usage: await pressButton(page, 'Add to Canvas')
  Click on specified button in Open Structure dialog
*/
export function pressButton(page: Page, name = '') {
  return page.getByRole('button', { name }).click();
}

export function selectOption(page: Page, name = '') {
  return page.getByRole('option', { name }).click();
}

export function selectOptionByText(page: Page, text = '') {
  return page.getByText(text, { exact: true }).click();
}
/* Usage: await pressTab(page, 'Functional Groups')
  Click on specified Tab in Templates dialog
*/
export function pressTab(page: Page, name = '') {
  return page.getByRole('tab', { name }).click();
}

export async function moveMouseToTheMiddleOfTheScreen(page: Page) {
  const { x, y } = await getCoordinatesOfTheMiddleOfTheScreen(page);
  await page.mouse.move(x, y);
}

export async function dragMouseTo(x: number, y: number, page: Page) {
  await page.mouse.down();
  await page.mouse.move(x, y);
  await waitForRender(page, async () => {
    await page.mouse.up();
  });
}

export async function clickOnTheCanvas(
  page: Page,
  xOffsetFromCenter: number,
  yOffsetFromCenter: number,
) {
  const secondStructureCoordinates = await getCoordinatesOfTheMiddleOfTheScreen(
    page,
  );
  await waitForRender(page, async () => {
    await page.mouse.click(
      secondStructureCoordinates.x + xOffsetFromCenter,
      secondStructureCoordinates.y + yOffsetFromCenter,
    );
  });
}

export async function clickByLink(page: Page, url: string) {
  await page.locator(`a[href="${url}"]`).first().click();
}

export async function clickOnBond(
  page: Page,
  bondType: BondType,
  bondNumber: number,
  buttonSelect?: 'left' | 'right' | 'middle',
) {
  const point = await getBondByIndex(page, { type: bondType }, bondNumber);
  await waitForRender(page, async () => {
    await page.mouse.click(point.x, point.y, { button: buttonSelect });
  });
}

export async function clickOnAtom(
  page: Page,
  atomLabel: AtomLabelType,
  atomNumber: number,
  buttonSelect?: 'left' | 'right' | 'middle',
) {
  const point = await getAtomByIndex(page, { label: atomLabel }, atomNumber);
  await waitForRender(page, async () => {
    await page.mouse.click(point.x, point.y, { button: buttonSelect });
  });
}

export async function doubleClickOnAtom(
  page: Page,
  atomLabel: string,
  atomNumber: number,
) {
  const point = await getAtomByIndex(page, { label: atomLabel }, atomNumber);
  await waitForRender(page, async () => {
    await page.mouse.dblclick(point.x, point.y);
  });
}

export async function doubleClickOnBond(
  page: Page,
  bondType: BondType,
  bondNumber: number,
) {
  const point = await getBondByIndex(page, { type: bondType }, bondNumber);
  await waitForRender(page, async () => {
    await page.mouse.dblclick(point.x, point.y);
  });
}

export async function rightClickOnBond(
  page: Page,
  bondType: BondType,
  bondNumber: number,
) {
  const point = await getBondByIndex(page, { type: bondType }, bondNumber);
  await page.mouse.click(point.x, point.y, { button: 'right' });
}

export async function moveOnAtom(
  page: Page,
  atomLabel: string,
  atomNumber: number,
) {
  const point = await getAtomByIndex(page, { label: atomLabel }, atomNumber);
  await page.mouse.move(point.x, point.y);
}

export async function moveOnBond(
  page: Page,
  bondType: BondType,
  bondNumber: number,
) {
  const point = await getBondByIndex(page, { type: bondType }, bondNumber);
  await page.mouse.move(point.x, point.y);
}

export async function openDropdown(page: Page, dropdownElementId: DropdownIds) {
  await page.getByTestId('hand').click();
  // There is a bug in Ketcher – if we click on button too fast, dropdown menu is not opened
  await page
    .getByTestId(dropdownElementId)
    .click({ delay: 200, clickCount: 2 });
}

export async function selectDropdownTool(
  page: Page,
  toolName: DropdownIds,
  toolTypeId: DropdownToolIds,
) {
  await openDropdown(page, toolName);
  const button = page.locator(
    `.default-multitool-dropdown [data-testid="${toolTypeId}"]`,
  );
  await button.click();
}

export async function applyAutoMapMode(
  page: Page,
  mode: string,
  withScreenshot = true,
) {
  await resetCurrentTool(page);
  await selectNestedTool(page, ReactionMappingTool.AUTOMAP);
  await page.getByTestId('automap-mode-input-span').click();
  await selectOption(page, mode);
  await selectButtonById('OK', page);
  if (withScreenshot) {
    await takeEditorScreenshot(page);
  }
}
