import {
  LocatorScreenshotOptions,
  Page,
  expect,
  Locator,
} from '@playwright/test';
import {
  clickInTheMiddleOfTheScreen,
  clickOnAtom,
  pressButton,
} from '@utils/clicks';
import { ELEMENT_TITLE } from './types';
import {
  Bases,
  Phosphates,
  Sugars,
  TopPanelButton,
  selectMonomer,
  waitForRender,
  AtomButton,
  RingButton,
  STRUCTURE_LIBRARY_BUTTON_NAME,
  TemplateLibrary,
  selectRing,
  waitForSpinnerFinishedWork,
  getControlModifier,
} from '..';
import {
  selectAtomInToolbar,
  selectRectangleSelectionTool,
  selectTopPanelButton,
} from './tools';

import { getLeftTopBarSize } from './common/getLeftTopBarSize';
import { emptyFunction } from '@utils/common/helpers';
import { hideMonomerPreview } from '@utils/macromolecules';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';

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
  await selectAtomInToolbar(AtomButton.Nitrogen, page);
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

  await page.mouse.click(leftBarWidth + offsetX, topBarHeight + offsetY);
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
  options?: { masks?: Locator[]; maxDiffPixelRatio?: number },
) {
  const maxTimeout = 3000;
  const element = page.getByTestId(elementId).first();
  await waitForRender(page, emptyFunction, maxTimeout);
  await expect(element).toHaveScreenshot({
    mask: options?.masks,
    maxDiffPixelRatio: options?.maxDiffPixelRatio,
  });
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
  options?: { masks?: Locator[]; maxDiffPixelRatio?: number },
) {
  const maxTimeout = 3000;
  await waitForRender(page, emptyFunction, maxTimeout);
  await expect(page).toHaveScreenshot({
    mask: options?.masks,
    maxDiffPixelRatio: options?.maxDiffPixelRatio,
  });
}

export async function takePresetsScreenshot(
  page: Page,
  options?: { masks?: Locator[]; maxDiffPixelRatio?: number },
) {
  await takeElementScreenshot(page, 'rna-accordion', options);
}

export async function takeRNABuilderScreenshot(
  page: Page,
  options?: { masks?: Locator[]; maxDiffPixelRatio?: number },
) {
  await takeElementScreenshot(page, 'rna-editor-expanded', options);
}

export async function takeMonomerLibraryScreenshot(
  page: Page,
  options?: { masks?: Locator[]; maxDiffPixelRatio?: number },
) {
  await takeElementScreenshot(page, 'monomer-library', options);
}

export async function takeEditorScreenshot(
  page: Page,
  options?: { masks?: Locator[]; maxDiffPixelRatio?: number },
) {
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

export async function takeLayoutSwitcherScreenshot(page: Page) {
  await takeElementScreenshot(page, 'sequence-type-dropdown');
}

export async function takePolymerEditorScreenshot(page: Page) {
  const maxTimeout = 3000;
  const editor = page.locator('.Ketcher-polymer-editor-root');
  await waitForRender(page, emptyFunction, maxTimeout);
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
  await selectTopPanelButton(TopPanelButton.Undo, page);
  await takeEditorScreenshot(page);
  await selectTopPanelButton(TopPanelButton.Redo, page);
}

export async function screenshotBetweenUndoRedoInMacro(page: Page) {
  await page.getByTestId('undo').click();
  await takeEditorScreenshot(page);
  await page.getByTestId('redo').click();
}

export async function resetAllSettingsToDefault(page: Page) {
  await selectTopPanelButton(TopPanelButton.Settings, page);
  await pressButton(page, 'Reset');
  await pressButton(page, 'Apply');
}

export async function addSingleMonomerToCanvas(
  page: Page,
  monomerFullName: string,
  alias: string,
  positionX: number,
  positionY: number,
  index: number,
) {
  await page.getByTestId(monomerFullName).click();
  await page.mouse.click(positionX, positionY);
  await hideMonomerPreview(page);
  return await page
    .locator(`//\*[name() = 'g' and ./\*[name()='text' and .='${alias}']]`)
    .nth(index);
}

export async function addBondedMonomersToCanvas(
  page: Page,
  monomerFullName: string,
  alias: string,
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
      monomerFullName,
      alias,
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
  monomerType: Sugars | Bases | Phosphates,
) {
  await selectMonomer(page, monomerType);
  await clickInTheMiddleOfTheScreen(page);
  await selectRectangleSelectionTool(page);
}

export async function addPeptideOnCanvas(page: Page, peptideId: string) {
  await page.getByTestId(peptideId).click();
  await clickInTheMiddleOfTheScreen(page);
}

export async function addRnaPresetOnCanvas(
  page: Page,
  presetId: string,
  positionX: number,
  positionY: number,
  sugarIndex: number,
  phosphateIndex: number,
) {
  await page.getByTestId(presetId).click();
  await page.mouse.click(positionX, positionY);
  await hideMonomerPreview(page);
  const sugar = await page
    .locator(`//\*[name() = 'g' and ./\*[name()='text' and .='R']]`)
    .nth(sugarIndex);
  const phosphate = await page
    .locator(`//\*[name() = 'g' and ./\*[name()='text' and .='P']]`)
    .nth(phosphateIndex);

  return { sugar, phosphate };
}

export async function addChemOnCanvas(page: Page, chemId: string) {
  await page.getByTestId('CHEM-TAB').click();
  await page.getByTestId(chemId).click();
  await clickInTheMiddleOfTheScreen(page);
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
  await waitForSpinnerFinishedWork(
    page,
    async () => await page.keyboard.press(`${modifier}+KeyV`, options),
  );
}
