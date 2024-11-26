import { Page } from '@playwright/test';
import { clickOnCanvas } from '@tests/utils';

export enum BondTypeName {
  Single = 'Single Bond',
  Double = 'Double Bond',
  Triple = 'Triple',
  Any = 'Any',
  Aromatic = 'Aromatic',
  SingleDouble = 'Single/Double',
  SingleAromatic = 'Single/Aromatic',
  DoubleAromatic = 'Double/Aromatic',
  Dative = 'Dative',
  Hydrogen = 'Hydrogen',
  SingleUp = 'Single Up',
  SingleDown = 'Single Down',
  SingleUpDown = 'Single Up/Down',
  DoubleCisTrans = 'Double Cis/Trans',
}

const MOUSE_COORDS = {
  x1: 150,
  y1: 150,
  x2: 20,
  y2: 160,
};

const TIMEOUT_MS = 1000;

/**
 * Opens bond toolbar and selects Bond
 * Usage: await selectBond(BondTypeName.Aromatic, page)
 **/
export async function selectBond(type: BondTypeName, page: Page) {
  console.log(`selectBond ${type}`);

  const targetSelector = `div[class*="ToolbarMultiToolItem"] button[title^="${type}"]`;

  // Stops dragging item
  await page.keyboard.press('Escape');
  // Move mouse to empty space
  await page.mouse.move(MOUSE_COORDS.x1, MOUSE_COORDS.y1);
  // Click on canvas to clear selection
  await clickOnCanvas(page, MOUSE_COORDS.x1, MOUSE_COORDS.y1);
  // Click on Bond button
  await clickOnCanvas(page, MOUSE_COORDS.x2, MOUSE_COORDS.y2);

  try {
    await page.click(targetSelector, { timeout: TIMEOUT_MS });
  } catch (e) {
    await clickOnCanvas(page, MOUSE_COORDS.x2, MOUSE_COORDS.y2);
    await page.click(targetSelector, { timeout: TIMEOUT_MS });
  }
}
