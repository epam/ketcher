import { Page } from '@playwright/test';

type BoundingBox = {
  width: number;
  height: number;
  y: number;
  x: number;
};

export async function clickInTheMiddleOfTheScreen(
  page: Page,
  button: 'left' | 'right' = 'left'
) {
  const body = (await page.locator('body').boundingBox()) as BoundingBox;
  await page.mouse.click(body.x + body?.width / 2, body.y + body?.height / 2, {
    button,
  });
}

export async function getCoordinatesOfTheMiddleOfTheScreen(page: Page) {
  const body = (await page.locator('body').boundingBox()) as BoundingBox;
  return {
    x: body.x + body.width / 2,
    y: body.y + body.height / 2,
  };
}

/* Usage: await pressButton(page, 'Add to Canvas') 
  Click on specified button in Open Structure dialog
*/
export function pressButton(page: Page, name = '') {
  return page.getByRole('button', { name }).click();
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
