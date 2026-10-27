import { test, expect } from '@fixtures';
import {
  waitForPageInit,
  openFileAndAddToCanvasMacro,
  copyToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
} from '@utils';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';

test('ordinary macro clipboard paste commits immediately and undo restores the document', async ({
  page,
}) => {
  await waitForPageInit(page);
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await openFileAndAddToCanvasMacro(page, 'KET/monomers-chains.ket');
  const count = () =>
    page.evaluate(
      async () => JSON.parse(await window.ketcher.getKet()).root.nodes.length,
    );
  const before = await count();
  await page.keyboard.press('ControlOrMeta+KeyA');
  await copyToClipboardByKeyboard(page);
  await pasteFromClipboardByKeyboard(page);
  await expect.poll(count).toBe(before * 2);
  await expect(page.getByTestId('paste-preview')).toHaveCount(0);
  await page.keyboard.press('ControlOrMeta+KeyZ');
  await expect.poll(count).toBe(before);
});

test('R-group paste waits for a click and Escape cancels without changing the document', async ({
  page,
}) => {
  await waitForPageInit(page);
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  const ket = JSON.stringify({
    root: { nodes: [{ $ref: 'rg1' }], connections: [], templates: [] },
    rg1: {
      type: 'rgroup',
      rlogic: { number: 1, range: '1', resth: true },
      atoms: [
        { label: 'C', location: [0, 0, 0] },
        { label: 'O', location: [1, 0, 0] },
      ],
      bonds: [{ type: 1, atoms: [0, 1] }],
    },
  });
  await page.evaluate((text) => navigator.clipboard.writeText(text), ket);
  const count = () =>
    page.evaluate(
      async () => JSON.parse(await window.ketcher.getKet()).root.nodes.length,
    );
  await pasteFromClipboardByKeyboard(page);
  await expect(page.getByTestId('paste-preview')).toBeVisible();
  expect(await count()).toBe(0);
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('paste-preview')).toHaveCount(0);
  expect(await count()).toBe(0);
  await pasteFromClipboardByKeyboard(page);
  await expect(page.getByTestId('paste-preview')).toBeVisible();
  await page
    .locator('[data-canvasmode="macromolecules-mode"]')
    .click({ position: { x: 300, y: 250 } });
  await expect(page.getByTestId('paste-preview')).toHaveCount(0);
  await expect.poll(count).toBeGreaterThan(0);
  await page.keyboard.press('ControlOrMeta+KeyZ');
  await expect.poll(count).toBe(0);
});
