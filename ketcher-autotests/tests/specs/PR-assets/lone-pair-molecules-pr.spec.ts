/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-magic-numbers */
/**
 * Generates high-resolution PNG screenshots for PR documentation (Playwright
 * `locator.screenshot()` — real pixels from the running editor).
 *
 * Prerequisite: from repo root, `npm run build` then `npm run serve:standalone` on **4002**
 * (port must be free), or set `KETCHER_URL` + `MODE=standalone` in `ketcher-autotests/.env`.
 *
 * Run: `cd ketcher-autotests && npx playwright install chromium && npm run capture:lone-pair-pr`
 * (uses the `chromium-pr-assets` project: large viewport + deviceScaleFactor 2).
 *
 * Output: `documentation/images/lone-pairs/*.png`
 */
import * as fs from 'fs';
import * as path from 'path';

import { test, expect, Page } from '@fixtures';
import { KETCHER_CANVAS } from '@tests/pages/constants/canvas/Constants';
import {
  AtomsSetting,
  SettingsSection,
} from '@tests/pages/constants/settingsDialog/Constants';
import {
  setSettingsOptions,
  SettingsDialog,
} from '@tests/pages/molecules/canvas/SettingsDialog';
import { TopRightToolbar } from '@tests/pages/molecules/TopRightToolbar';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { setMolecule } from '@utils/formats';
import { waitForSpinnerFinishedWork } from '@utils/common/loaders/waitForSpinnerFinishedWork/waitForSpinnerFinishedWork';
import { waitForRender } from '@utils/common/loaders/waitForRender';
import { resetZoomLevelToDefault, zoomInByKeyboard } from '@utils/keyboard';

const OUT_DIR = path.join(
  process.cwd(),
  '..',
  'documentation',
  'images',
  'lone-pairs',
);

/** Zoom steps so the structure fills more of the canvas (after reset). */
const ZOOM_IN_REPEAT = 18;

const LEGACY_PNG = [
  'ammonia-lone-pairs.png',
  'water-lone-pairs.png',
  'hydrogen-sulfide-lone-pairs.png',
];

let page: Page;

test.beforeAll(async ({ initMoleculesCanvas }) => {
  page = await initMoleculesCanvas();
});

test.afterAll(async ({ closePage }) => {
  await closePage();
});

test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

test.describe('PR asset: lone-pair screenshots', () => {
  test('toolbar, settings, and methylamine / methanol / methanethiol (PNG)', async () => {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    for (const name of LEGACY_PNG) {
      const p = path.join(OUT_DIR, name);
      if (fs.existsSync(p)) {
        fs.unlinkSync(p);
      }
    }

    const canvas = page.locator(
      `[data-testid="${KETCHER_CANVAS}"][data-canvasmode="molecules-mode"]`,
    );

    await setSettingsOptions(page, [
      { option: AtomsSetting.DisplayCarbonExplicitly },
      { option: AtomsSetting.LonePairShowN },
      { option: AtomsSetting.LonePairShowO },
      { option: AtomsSetting.LonePairShowS },
    ]);

    // Left toolbar: lone-pair tool (colon-style icon) among charge tools — real screen capture.
    await waitForRender(page, async () => {
      await expect(page.getByTestId('left-toolbar-buttons')).toBeVisible();
    });
    await page.getByTestId('left-toolbar-buttons').screenshot({
      path: path.join(OUT_DIR, 'left-toolbar-lone-pair-colon-tool.png'),
      type: 'png',
    });

    // Settings → Atoms: default lone-pair visibility for N, O, S, etc. — real dialog capture.
    await TopRightToolbar(page).Settings();
    await SettingsDialog(page).openSection(SettingsSection.General);
    await SettingsDialog(page).openSection(SettingsSection.Atoms);
    await waitForRender(page, async () => {
      await expect(SettingsDialog(page).window).toBeVisible();
      await expect(
        page.getByTestId('lone-pair-show-n-input-span'),
      ).toBeVisible();
    });
    await SettingsDialog(page).window.screenshot({
      path: path.join(OUT_DIR, 'settings-atoms-lone-pair-defaults.png'),
      type: 'png',
    });
    await SettingsDialog(page).cancel();

    const shots: { smiles: string; file: string; title: string }[] = [
      {
        smiles: 'CN',
        file: 'methylamine-lone-pairs.png',
        title: 'methylamine',
      },
      {
        smiles: 'CO',
        file: 'methanol-lone-pairs.png',
        title: 'methanol',
      },
      {
        smiles: 'CS',
        file: 'methanethiol-lone-pairs.png',
        title: 'methanethiol',
      },
    ];

    for (const { smiles, file, title } of shots) {
      await CommonTopLeftToolbar(page).clearCanvas();
      await waitForSpinnerFinishedWork(page, async () => {
        await setMolecule(page, smiles);
      });
      await waitForRender(page, async () => {
        await expect(canvas).toBeVisible();
      });
      const canvasBox = await canvas.boundingBox();
      if (!canvasBox) {
        throw new Error('Unable to get canvas bounding box for PR screenshot');
      }
      await page.mouse.click(canvasBox.x + 20, canvasBox.y + 20);
      await resetZoomLevelToDefault(page);
      await zoomInByKeyboard(page, { repeat: ZOOM_IN_REPEAT });
      await expect(
        page.evaluate(() => window.ketcher.editor.selection() === null),
      ).resolves.toBe(true);

      const outPath = path.join(OUT_DIR, file);
      await canvas.screenshot({
        path: outPath,
        type: 'png',
      });
      expect(
        fs.existsSync(outPath),
        `${title} screenshot missing`,
      ).toBeTruthy();
    }

    expect(
      fs.existsSync(
        path.join(OUT_DIR, 'left-toolbar-lone-pair-colon-tool.png'),
      ),
    ).toBeTruthy();
    expect(
      fs.existsSync(
        path.join(OUT_DIR, 'settings-atoms-lone-pair-defaults.png'),
      ),
    ).toBeTruthy();
  });
});
