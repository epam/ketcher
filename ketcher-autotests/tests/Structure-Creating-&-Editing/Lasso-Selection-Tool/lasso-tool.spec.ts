import { test } from '@playwright/test';
import {
  takeEditorScreenshot,
  openFileAndAddToCanvas,
  selectRing,
  RingButton,
  clickInTheMiddleOfTheScreen,
  clickOnAtom,
  selectLeftPanelButton,
  LeftPanelButton,
} from '@utils';

test.describe('Lasso tools', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await selectLeftPanelButton(LeftPanelButton.RectangleSelection, page);
    await page.getByRole('button', { name: 'Lasso Selection (Esc)' }).click();
  });

  test.afterEach(async ({ page }) => {
    await takeEditorScreenshot(page);
  });

  const MOVE_PX_50 = 50;
  const MOVE_PX_10 = 10;

  test('Using lasso for selection of bonds and atom labels', async ({
    page,
  }) => {
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.getByTestId('select-lasso').click();
    await page.keyboard.press('Control+a');
  });

  test('Pressing atoms hotkey when atoms are selected', async ({ page }) => {
    await openFileAndAddToCanvas('two-atoms.ket', page);
    await page.keyboard.press('Control+a');
    await page.keyboard.press('o');
  });

  test('Verify deletion of selected atom', async ({ page }) => {
    await openFileAndAddToCanvas('two-benzene-with-atoms.ket', page);
    await clickOnAtom(page, 'C', 0);
    await page.keyboard.press('Delete');
  });

  test('Selection is not reset when using context menu', async ({ page }) => {
    await selectRing(RingButton.Benzene, page);
    await clickInTheMiddleOfTheScreen(page);
    await page.keyboard.press('Control+a');
    await clickOnAtom(page, 'C', 0, 'right');
  });

  test('(50px to Down) Structure Movement with Arrow Keys (1px move)', async ({
    page,
  }) => {
    await openFileAndAddToCanvas('two-benzene-with-atoms.ket', page);
    await page.keyboard.press('Control+a');
    for (let i = 0; i < MOVE_PX_50; i++) {
      await page.keyboard.press('ArrowDown');
    }
  });

  test('(50px to Up) Structure Movement with Arrow Keys (1px move)', async ({
    page,
  }) => {
    await openFileAndAddToCanvas('two-benzene-with-atoms.ket', page);
    await page.keyboard.press('Control+a');
    for (let i = 0; i < MOVE_PX_50; i++) {
      await page.keyboard.press('ArrowUp');
    }
  });

  test('(50px to Right) Structure Movement with Arrow Keys (1px move)', async ({
    page,
  }) => {
    await openFileAndAddToCanvas('two-benzene-with-atoms.ket', page);
    await page.keyboard.press('Control+a');
    for (let i = 0; i < MOVE_PX_50; i++) {
      await page.keyboard.press('ArrowRight');
    }
  });

  test('(50px to Left) Structure Movement with Arrow Keys (1px move)', async ({
    page,
  }) => {
    await openFileAndAddToCanvas('two-benzene-with-atoms.ket', page);
    await page.keyboard.press('Control+a');
    for (let i = 0; i < MOVE_PX_50; i++) {
      await page.keyboard.press('ArrowLeft');
    }
  });

  test('(100px to Down with Shift key) Structure Movement with Arrow Keys (10px move)', async ({
    page,
  }) => {
    await openFileAndAddToCanvas('two-benzene-with-atoms.ket', page);
    await page.keyboard.press('Control+a');
    await page.keyboard.down('Shift');
    for (let i = 0; i < MOVE_PX_10; i++) {
      await page.keyboard.press('ArrowDown');
    }
    await page.keyboard.up('Shift');
  });

  test('(100px to Up with Shift key) Structure Movement with Arrow Keys (10px move)', async ({
    page,
  }) => {
    await openFileAndAddToCanvas('two-benzene-with-atoms.ket', page);
    await page.keyboard.press('Control+a');
    await page.keyboard.down('Shift');
    for (let i = 0; i < MOVE_PX_10; i++) {
      await page.keyboard.press('ArrowUp');
    }
    await page.keyboard.up('Shift');
  });

  test('(100px to Right with Shift key) Structure Movement with Arrow Keys (10px move)', async ({
    page,
  }) => {
    await openFileAndAddToCanvas('two-benzene-with-atoms.ket', page);
    await page.keyboard.press('Control+a');
    await page.keyboard.down('Shift');
    for (let i = 0; i < MOVE_PX_10; i++) {
      await page.keyboard.press('ArrowRight');
    }
    await page.keyboard.up('Shift');
  });

  test('(100px to Left with Shift key) Structure Movement with Arrow Keys (10px move)', async ({
    page,
  }) => {
    await openFileAndAddToCanvas('two-benzene-with-atoms.ket', page);
    await page.keyboard.press('Control+a');
    await page.keyboard.down('Shift');
    for (let i = 0; i < MOVE_PX_10; i++) {
      await page.keyboard.press('ArrowLeft');
    }
    await page.keyboard.up('Shift');
  });
});
