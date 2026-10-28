import { Page, test, expect } from '@fixtures';
import { keyboardTypeOnCanvas } from '@utils/keyboard/index';
import { getSymbolLocator } from '@utils/macromolecules/monomer';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';

let page: Page;

test.beforeAll(async ({ initSequenceCanvas }) => {
  page = await initSequenceCanvas();
});

test.beforeEach(async ({ SequenceCanvas: _ }) => {});

test.afterAll(async ({ closePage }) => {
  await closePage();
});

test.describe('Sequence edit mode – issue #4528', () => {
  test('#4528 Enter starts a new sequence without toggling fullscreen', async () => {
    await keyboardTypeOnCanvas(page, 'CCC');
    await CommonTopRightToolbar(page).fullScreen();

    await expect
      .poll(() => page.evaluate(() => !!document.fullscreenElement))
      .toBe(true);

    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');

    await expect
      .poll(() => page.evaluate(() => !!document.fullscreenElement))
      .toBe(true);

    await keyboardTypeOnCanvas(page, 'A');
    await expect(getSymbolLocator(page, { symbolAlias: 'A' })).toHaveCount(1);

    await CommonTopRightToolbar(page).fullScreen();
  });
});
