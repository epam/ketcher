import {
  LocatorScreenshotOptions,
  Page,
  expect,
  Locator,
} from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  clickOnAtom,
  clickOnCanvas,
  dragMouseTo,
  moveOnAtom,
  pressButton,
} from '@utils/clicks';
import { ELEMENT_TITLE } from './types';
import { getControlModifier } from '@utils/keyboard';
import {
  RingButton,
  TemplateLibrary,
  STRUCTURE_LIBRARY_BUTTON_NAME,
  selectMonomer,
  selectRing,
} from '@utils/selectors';
import { waitForRender, waitForSpinnerFinishedWork } from '@utils/common';
import { openSettings } from './tools';
import { getLeftTopBarSize } from './common/getLeftTopBarSize';
import { emptyFunction } from '@utils/common/helpers';
import { hideMonomerPreview } from '@utils/macromolecules';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
import { Monomer } from '@utils/types';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import { RightToolbar } from '@tests/pages/molecules/RightToolbar';
import { Atom } from '@tests/pages/constants/atoms/atoms';
import { TopLeftToolbar } from '@tests/pages/common/TopLeftToolbar';

export async function drawBenzeneRing(page: Page) {
  await selectRing(RingButton.Benzene, page);
  await clickInTheMiddleOfTheScreen(page);
}

export async function drawCyclohexaneRing(page: Page) {
  await selectRing(RingButton.Cyclohexane, page);
  await clickInTheMiddleOfTheScreen(page);
}

export async function drawCyclopentadieneRing(page: Page) {
  await selectRing(RingButton.Cyclopentadiene, page);
  await clickInTheMiddleOfTheScreen(page);
}

export async function openEditDialogForTemplate(
  page: Page,
  itemToChoose: TemplateLibrary,
  _newName?: string,
) {
  await pressButton(page, STRUCTURE_LIBRARY_BUTTON_NAME);
  await page.getByRole('tab', { name: 'Template Library' }).click();
  await page.getByRole('button', { name: 'Aromatics (18)' }).click();
  await page.getByTitle(itemToChoose).getByRole('button').click();
  await page.getByPlaceholder('template').click();
}

export async function selectAzuleneOnTemplateLibrary(page: Page) {
  await page.getByRole('tab', { name: 'Template Library' }).click();
  await page.getByRole('button', { name: 'Aromatics (18)' }).click();
  await page.getByTitle('Azulene').getByRole('button').click();
}

export async function selectAnyStructuresFromAromaticsTable(
  page: Page,
  itemToChoose: TemplateLibrary,
) {
  await page.getByRole('tab', { name: 'Template Library' }).click();
  await page.getByRole('button', { name: 'Aromatics (18)' }).click();
  await page.getByTitle(itemToChoose).getByRole('button').click();
  await clickInTheMiddleOfTheScreen(page);
}

export async function addCyclopentadieneRingWithTwoAtoms(page: Page) {
  const atomToolbar = RightToolbar(page);

  await atomToolbar.clickAtom(Atom.Nitrogen);
  await clickOnAtom(page, 'C', 0);
  const anyAtom = 3;
  await clickOnAtom(page, 'C', anyAtom);
}

export async function drawElementByTitle(
  page: Page,
  elementTitle: string = ELEMENT_TITLE.HYDROGEN,
  offsetX = 0,
  offsetY = 0,
) {
  const leftBarWidth = await getLeftToolBarWidth(page);
  const topBarHeight = await getTopToolBarHeight(page);
  await page.getByTitle(elementTitle, { exact: true }).click();

  await clickOnCanvas(page, leftBarWidth + offsetX, topBarHeight + offsetY);
}

export async function getLeftToolBarWidth(page: Page): Promise<number> {
  const leftBarSize = await page.getByTestId('left-toolbar').boundingBox();

  // we can get padding / margin values of left toolbar through x property
  if (leftBarSize?.width) {
    return leftBarSize.width + leftBarSize.x;
  }

  return Number.MIN_SAFE_INTEGER;
}

export async function getTopToolBarHeight(page: Page): Promise<number> {
  const topBarSize = await page.getByTestId('top-toolbar').boundingBox();

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

export async function screenshotDialog(page: Page, dialogId: string) {
  const dialog = page.getByTestId(dialogId).getByRole('dialog');
  await expect(dialog).toHaveScreenshot();
}

export async function takeElementScreenshot(
  page: Page,
  elementId: string,
  options?: {
    mask?: Locator[];
    maxDiffPixelRatio?: number;
    maxDiffPixels?: number;
    hideMonomerPreview?: boolean;
  },
) {
  if (options?.hideMonomerPreview) {
    await page.evaluate(() => {
      window.dispatchEvent(new Event('hidePreview'));
    });
    await page.getByTestId('polymer-library-preview').isHidden();
  }

  const element = page.getByTestId(elementId).first();
  await expect(element).toHaveScreenshot(options);
}

export async function getCoordinatesOfTopMostCarbon(page: Page) {
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
  await takeElementScreenshot(page, 'rna-accordion', options);
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
  await takeElementScreenshot(page, 'rna-editor-expanded', options);
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
    const modifier = getControlModifier();
    await page.keyboard.press(`${modifier}+KeyB`);
  }
  await takeElementScreenshot(page, 'monomer-library', options);
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
    const modifier = getControlModifier();
    await page.keyboard.press(`${modifier}+KeyB`);
  }
  await takeElementScreenshot(page, 'ketcher-canvas', options);
}

export async function takeLeftToolbarScreenshot(page: Page) {
  await takeElementScreenshot(page, 'left-toolbar-buttons');
}

export async function takeLeftToolbarMacromoleculeScreenshot(page: Page) {
  await takeElementScreenshot(page, 'left-toolbar');
}

export async function takeRightToolbarScreenshot(page: Page) {
  await takeElementScreenshot(page, 'right-toolbar');
}

export async function takeTopToolbarScreenshot(page: Page) {
  await takeElementScreenshot(page, 'top-toolbar');
}

export async function takePolymerEditorScreenshot(page: Page) {
  const editor = page.locator('.Ketcher-polymer-editor-root');
  await expect(editor).toHaveScreenshot();
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

export async function screenshotBetweenUndoRedo(page: Page) {
  await TopLeftToolbar(page).undo();
  await takeEditorScreenshot(page, {
    maxDiffPixels: 1,
  });
  await TopLeftToolbar(page).redo();
}

export async function screenshotBetweenUndoRedoInMacro(page: Page) {
  await TopLeftToolbar(page).undo();
  await takeEditorScreenshot(page);
  await TopLeftToolbar(page).redo();
}

export async function resetAllSettingsToDefault(page: Page) {
  await openSettings(page);
  await pressButton(page, 'Reset');
  await pressButton(page, 'Apply');
}

export async function addSingleMonomerToCanvas(
  page: Page,
  monomer: Monomer,
  positionX: number,
  positionY: number,
  index: number,
) {
  await page.getByTestId(monomer.testId).click();
  await clickOnCanvas(page, positionX, positionY, { waitForRenderTimeOut: 0 });
  await hideMonomerPreview(page);
  return getMonomerLocator(page, monomer).nth(index);
}

export async function addBondedMonomersToCanvas(
  page: Page,
  monomerType: Monomer,
  initialPositionX: number,
  initialPositionY: number,
  deltaX: number,
  deltaY: number,
  amount: number,
  connectTitle1?: string,
  connectTitle2?: string,
) {
  const monomers = [];
  for (let index = 0; index < amount; index++) {
    const monomer = await addSingleMonomerToCanvas(
      page,
      monomerType,
      initialPositionX + deltaX * index,
      initialPositionY + deltaY * index,
      index,
    );
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

export async function addMonomerToCenterOfCanvas(
  page: Page,
  monomerType: Monomer,
) {
  await selectMonomer(page, monomerType);
  await clickInTheMiddleOfTheScreen(page);
  await CommonLeftToolbar(page).selectAreaSelectionTool(
    SelectionToolType.Rectangle,
  );
}

export async function addPeptideOnCanvas(page: Page, peptide: Monomer) {
  await page.getByTestId(peptide.testId).click();
  await clickInTheMiddleOfTheScreen(page);
}

export async function addRnaPresetOnCanvas(
  page: Page,
  preset: Monomer,
  positionX: number,
  positionY: number,
  sugarIndex: number,
  phosphateIndex: number,
) {
  await page.getByTestId(preset.testId).click();
  await clickOnCanvas(page, positionX, positionY);
  await hideMonomerPreview(page);
  const sugar = page
    .locator(`//\*[name() = 'g' and ./\*[name()='text' and .='R']]`)
    .nth(sugarIndex);
  const phosphate = page
    .locator(`//\*[name() = 'g' and ./\*[name()='text' and .='P']]`)
    .nth(phosphateIndex);

  return { sugar, phosphate };
}

export async function copyToClipboardByKeyboard(
  page: Page,
  options?:
    | {
        delay?: number;
      }
    | undefined,
) {
  const modifier = getControlModifier();
  // Dirty hack for old tests - operation below waits while system finishes all canvas operations
  // before proceeding next. Sometimes - select object on the screen took time
  await waitForRender(page, emptyFunction);

  await waitForSpinnerFinishedWork(
    page,
    async () => await page.keyboard.press(`${modifier}+KeyC`, options),
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
  const modifier = getControlModifier();
  // Dirty hack for old tests - operation below waits while system finishes all canvas operations
  // before proceeding next. Sometimes - select object on the screen took time
  await waitForRender(page, emptyFunction);

  await waitForSpinnerFinishedWork(
    page,
    async () => await page.keyboard.press(`${modifier}+KeyX`, options),
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
  const modifier = getControlModifier();
  // Dirty hack for old tests - operation below waits while system finishes all canvas operations
  // before proceeding next. For ex. - select object on the screen can took time
  await waitForRender(page, emptyFunction);

  await waitForSpinnerFinishedWork(
    page,
    async () => await page.keyboard.press(`${modifier}+KeyV`, options),
  );
}

export async function selectUndoByKeyboard(
  page: Page,
  options?:
    | {
        delay?: number;
      }
    | undefined,
) {
  const modifier = getControlModifier();

  await waitForRender(page, async () => {
    await page.keyboard.press(`${modifier}+KeyZ`, options);
  });
}

export async function selectRedoByKeyboard(
  page: Page,
  options?:
    | {
        delay?: number;
      }
    | undefined,
) {
  const modifier = getControlModifier();

  await waitForRender(page, async () => {
    await page.keyboard.press(`${modifier}+Shift+KeyZ`, options);
  });
}

export async function copyToClipboardByIcon(page: Page) {
  await page.getByTestId('copy-to-clipboard').click();
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

export async function waitForElementInCanvas(
  page: Page,
  text: string,
): Promise<void> {
  const canvas = page.getByTestId('ketcher-canvas');
  const targetElement = canvas.locator(`div:has-text("${text}")`);
  await expect(targetElement).toBeVisible();
}
export async function selectCanvasArea(
  page: Page,
  firstCorner: { x: number; y: number },
  secondCorner: { x: number; y: number },
) {
  await CommonLeftToolbar(page).selectAreaSelectionTool(
    SelectionToolType.Rectangle,
  );
  await page.mouse.move(firstCorner.x, firstCorner.y);
  await dragMouseTo(secondCorner.x, secondCorner.y, page);
}
