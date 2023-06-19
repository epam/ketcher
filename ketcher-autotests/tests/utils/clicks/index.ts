import { Page } from '@playwright/test';

type BoundingBox = {
  width: number;
  height: number;
  y: number;
  x: number;
};

const HALF_DIVIDER = 2;

export async function clickInTheMiddleOfTheScreen(
  page: Page,
  button: 'left' | 'right' = 'left'
) {
  const body = (await page.locator('body').boundingBox()) as BoundingBox;
  await page.mouse.click(
    body.x + body?.width / HALF_DIVIDER,
    body.y + body?.height / HALF_DIVIDER,
    {
      button,
    }
  );
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
  await page.mouse.up();
}

export async function clickOnTheCanvas(
  page: Page,
  xOffsetFromCenter: number,
  yOffsetFromCenter: number
) {
  const secondStructureCoordinates = await getCoordinatesOfTheMiddleOfTheScreen(
    page
  );
  await page.mouse.click(
    secondStructureCoordinates.x + xOffsetFromCenter,
    secondStructureCoordinates.y + yOffsetFromCenter
  );
}

export async function clickByLink(page: Page, url: string) {
  await page.locator(`a[href="${url}"]`).first().click();
}
