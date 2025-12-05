/* eslint-disable no-magic-numbers */
/* eslint-disable no-useless-escape */
import {
  LocatorScreenshotOptions,
  Page,
  expect,
  Locator,
} from '@playwright/test';
import { dragMouseTo, moveOnAtom } from '@utils/clicks';
import { waitForRender, waitForSpinnerFinishedWork } from '@utils/common';
import { getLeftTopBarSize } from './common/getLeftTopBarSize';
import { emptyFunction } from '@utils/common/helpers';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
import { Monomer } from '@utils/types';
import {
  getMonomerLocator,
  AttachmentPoint,
} from '@utils/macromolecules/monomer';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { Library } from '@tests/pages/macromolecules/Library';
import { KETCHER_CANVAS } from '@tests/pages/constants/canvas/Constants';
import { MonomerPreviewTooltip } from '@tests/pages/macromolecules/canvas/MonomerPreviewTooltip';

export async function getLeftToolBarWidth(page: Page): Promise<number> {
  const leftBarSize = await page
    .getByTestId('left-toolbar')
    .filter({ has: page.locator(':visible') })
    .boundingBox();

  // we can get padding / margin values of left toolbar through x property
  if (leftBarSize?.width) {
    return leftBarSize.width + leftBarSize.x;
  }

  return Number.MIN_SAFE_INTEGER;
}

export async function getTopToolBarHeight(page: Page): Promise<number> {
  const topBarSize = await page
    .getByTestId('top-toolbar')
    .filter({ has: page.locator(':visible') })
    .boundingBox();

  // we can get padding / margin values of top toolbar through y property
  if (topBarSize?.height) {
    return topBarSize.height + topBarSize.y;
  }

  return Number.MIN_SAFE_INTEGER;
}

export async function getCoordinatesTopAtomOfBenzeneRing(page: Page) {
  const { carbonAtoms, scale, offset } = await page.evaluate(() => {
    const allAtoms = [...window.ketcher.editor.struct().atoms.values()];
    const onlyCarbons = allAtoms.filter((a) => a.label === 'C');
    return {
      carbonAtoms: onlyCarbons,
      scale: window.ketcher.editor.options().microModeScale,
      offset: window.ketcher?.editor?.options()?.offset,
    };
  });
  let min = {
    x: Infinity,
    y: Infinity,
  };
  for (const carbonAtom of carbonAtoms) {
    if (carbonAtom.pp.y < min.y) {
      min = carbonAtom.pp;
    }
  }
  const { leftBarWidth, topBarHeight } = await getLeftTopBarSize(page);
  return {
    x: min.x * scale + offset.x + leftBarWidth,
    y: min.y * scale + offset.y + topBarHeight,
  };
}

export async function takeElementScreenshot(
  page: Page,
  elementLocator: Locator,
  options?: {
    mask?: Locator[];
    maxDiffPixelRatio?: number;
    maxDiffPixels?: number;
    hideMonomerPreview?: boolean;
    delay?: number;
    padding?: number;
  },
) {
  if (options?.hideMonomerPreview) {
    await page.evaluate(() => {
      window.dispatchEvent(new Event('hidePreview'));
    });
    await MonomerPreviewTooltip(page).waitForBecomeHidden();
  }

  let element = elementLocator;

  if ((await elementLocator.count()) > 1) {
    element = element.filter({ has: page.locator(':visible') }).first();
  }

  await element.waitFor({ state: 'visible' });

  if (!options?.padding) {
    await expect(element).toHaveScreenshot(options);
    return;
  }

  const box = await element.boundingBox();
  if (!box) throw new Error('Cannot get bounding box of element');

  const padding = options.padding;

  const clip = {
    x: Math.max(box.x - padding, 0),
    y: Math.max(box.y - padding, 0),
    width: box.width + padding * 2,
    height: box.height + padding * 2,
  };

  if (options?.delay) {
    await page.waitForTimeout(options.delay);
  }

  const screenshot = await page.screenshot({ clip });

  expect(screenshot).toMatchSnapshot({
    ...options,
  });
}

export async function takePageScreenshot(
  page: Page,
  options?: {
    mask?: Locator[];
    maxDiffPixelRatio?: number;
    timeout?: number;
    hideMonomerPreview?: boolean;
    hideMacromoleculeEditorScrollBars?: boolean;
  },
) {
  await expect(page).toHaveScreenshot(options);
}

export async function takePresetsScreenshot(
  page: Page,
  options?: { mask?: Locator[]; maxDiffPixelRatio?: number },
) {
  await takeElementScreenshot(page, page.getByTestId('rna-accordion'), options);
}

export async function takeRNABuilderScreenshot(
  page: Page,
  options?: {
    mask?: Locator[];
    maxDiffPixelRatio?: number;
    hideMonomerPreview?: boolean;
    timeout?: number;
  },
) {
  await takeElementScreenshot(
    page,
    page.getByTestId('rna-editor-expanded'),
    options,
  );
}

export async function takeMonomerLibraryScreenshot(
  page: Page,
  options?: {
    mask?: Locator[];
    maxDiffPixelRatio?: number;
    maxDiffPixels?: number;
    hideMonomerPreview?: boolean;
    hideMacromoleculeEditorScrollBars?: boolean;
  },
) {
  if (options?.hideMacromoleculeEditorScrollBars) {
    // That works only for Macromolecule editor
    await page.keyboard.press(`ControlOrMeta+KeyB`);
  }
  await takeElementScreenshot(
    page,
    page.getByTestId('monomer-library'),
    options,
  );
}

export async function takeEditorScreenshot(
  page: Page,
  options?: {
    mask?: Locator[];
    maxDiffPixelRatio?: number;
    maxDiffPixels?: number;
    hideMonomerPreview?: boolean;
    hideMacromoleculeEditorScrollBars?: boolean;
  },
) {
  if (options?.hideMacromoleculeEditorScrollBars) {
    // That works only for Macromolecule editor
    await page.keyboard.press(`ControlOrMeta+KeyB`);
  }
  await takeElementScreenshot(page, page.getByTestId(KETCHER_CANVAS), options);
}

export async function takeLeftToolbarScreenshot(page: Page) {
  await takeElementScreenshot(page, page.getByTestId('left-toolbar-buttons'));
}

export async function takeLeftToolbarMacromoleculeScreenshot(page: Page) {
  await takeElementScreenshot(page, page.getByTestId('left-toolbar'));
}

export async function takeRightToolbarScreenshot(page: Page) {
  await takeElementScreenshot(page, page.getByTestId('right-toolbar'));
}

export async function takeTopToolbarScreenshot(page: Page) {
  await takeElementScreenshot(page, page.getByTestId('top-toolbar'));
}

export async function takeMultitoolDropdownScreenshot(page: Page) {
  const dropdown = page.locator('.default-multitool-dropdown');
  await expect(dropdown).toHaveScreenshot();
}

/**
 * Returns an editor screenshot
 * Usage: convenient for temporary comparison of different states
 *
 * const beforeImage = await getEditorScreenshot(page); // first snapshoot
 *
 * // some state changes implemented here
 *
 * const afterImage = await getEditorScreenshot(page); // second snashoot
 *
 * expect(beforeImage.compare(afterImage)).not.toBe(0); // comparison
 **/
export async function getEditorScreenshot(
  page: Page,
  options?: LocatorScreenshotOptions,
) {
  return await page.locator('[class*="App-module_canvas"]').screenshot(options);
}

export async function delay(seconds = 1) {
  const msInSecond = 1000;
  return new Promise((resolve) =>
    setTimeout(() => resolve(true), seconds * msInSecond),
  );
}

export async function addBondedMonomersToCanvas(
  page: Page,
  monomerType: Monomer,
  initialPositionX: number,
  initialPositionY: number,
  deltaX: number,
  deltaY: number,
  amount: number,
  connectTitle1?: AttachmentPoint,
  connectTitle2?: AttachmentPoint,
) {
  const monomers = [];
  for (let index = 0; index < amount; index++) {
    await Library(page).dragMonomerOnCanvas(monomerType, {
      x: initialPositionX + deltaX * index,
      y: initialPositionY + deltaY * index,
    });
    const monomer = getMonomerLocator(page, monomerType).nth(index);
    monomers.push(monomer);
    if (index > 0) {
      await bondTwoMonomers(
        page,
        monomers[index - 1],
        monomer,
        connectTitle1,
        connectTitle2,
      );
    }
  }
  return monomers;
}

export async function copyToClipboardByKeyboard(
  page: Page,
  options?:
    | {
        delay?: number;
      }
    | undefined,
) {
  // Dirty hack for old tests - operation below waits while system finishes all canvas operations
  // before proceeding next. Sometimes - select object on the screen took time
  await waitForRender(page, emptyFunction);

  await waitForSpinnerFinishedWork(
    page,
    async () => await page.keyboard.press(`ControlOrMeta+KeyC`, options),
  );
}

export async function cutToClipboardByKeyboard(
  page: Page,
  options?:
    | {
        delay?: number;
      }
    | undefined,
) {
  // Dirty hack for old tests - operation below waits while system finishes all canvas operations
  // before proceeding next. Sometimes - select object on the screen took time
  await waitForRender(page, emptyFunction);

  await waitForSpinnerFinishedWork(
    page,
    async () => await page.keyboard.press(`ControlOrMeta+KeyX`, options),
  );
}

export async function pasteFromClipboardByKeyboard(
  page: Page,
  options?:
    | {
        delay?: number;
      }
    | undefined,
) {
  // Dirty hack for old tests - operation below waits while system finishes all canvas operations
  // before proceeding next. For ex. - select object on the screen can took time
  await waitForRender(page, emptyFunction);

  await waitForSpinnerFinishedWork(
    page,
    async () => await page.keyboard.press(`ControlOrMeta+KeyV`, options),
  );
}

export async function undoByKeyboard(
  page: Page,
  options?:
    | {
        delay?: number;
      }
    | undefined,
) {
  await waitForRender(page, async () => {
    await page.keyboard.press(`ControlOrMeta+KeyZ`, options);
  });
}

export async function redoByKeyboard(
  page: Page,
  options?:
    | {
        delay?: number;
      }
    | undefined,
) {
  await waitForRender(page, async () => {
    await page.keyboard.press(`ControlOrMeta+Shift+KeyZ`, options);
  });
}

export async function copyStructureByCtrlMove(
  page: Page,
  atom: string,
  atomIndex: number,
  targetCoordinates: { x: number; y: number } = { x: 300, y: 300 },
) {
  await moveOnAtom(page, atom, atomIndex);
  await page.keyboard.down('Control');
  await dragMouseTo(targetCoordinates.x, targetCoordinates.y, page);
  await page.keyboard.up('Control');
}

export async function selectCanvasArea(
  page: Page,
  firstCorner: { x: number; y: number },
  secondCorner: { x: number; y: number },
) {
  await CommonLeftToolbar(page).areaSelectionTool(SelectionToolType.Rectangle);
  await page.mouse.move(firstCorner.x, firstCorner.y);
  await dragMouseTo(secondCorner.x, secondCorner.y, page);
}
