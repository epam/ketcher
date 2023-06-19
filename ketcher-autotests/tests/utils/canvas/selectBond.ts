import { Page } from '@playwright/test';

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
  SingleUp = 'Single Up Bond',
  SingleDown = 'Single Down',
  SingleUpDown = 'Single Up/Down',
  DoubleCisTrans = 'Double Cis/Trans',
}

/**
 * Opens bond toolbar and selects Bond
 * Usage: await selectBond(BondTypeName.Aromatic, page)
 **/
export async function selectBond(type: BondTypeName, page: Page) {
  console.log(`selectBond ${type}`);

  const targetSelector = `div[class*="ToolbarMultiToolItem"] button[title^="${type}"]`;

  await page.keyboard.press('Escape'); // Stops dragging item
  await page.mouse.move(150, 150); // Move mouse to empty space
  await page.mouse.click(150, 150); // Click on canvas to clear selection
  await page.mouse.click(20, 160); // Click on Bond button

  try {
    await page.click(targetSelector, { timeout: 1000 });
  } catch (e) {
    await page.mouse.click(20, 160);
    await page.click(targetSelector, { timeout: 1000 });
  }
}
