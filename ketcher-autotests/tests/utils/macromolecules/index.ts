/* eslint-disable no-magic-numbers */
import { Page } from '@playwright/test';
import {
  RNA_TAB,
  PEPTIDES_TAB,
  FAVORITES_TAB,
  CHEM_TAB,
} from '@constants/testIdConstants';
import {
  moveMouseToTheMiddleOfTheScreen,
  waitForSpinnerFinishedWork,
} from '@utils';

export async function waitForMonomerPreview(page: Page) {
  await page
    .getByTestId('polymer-library-preview')
    .waitFor({ state: 'visible' });
}

export async function hideMonomerPreview(page: Page) {
  await page.mouse.move(9999, 9999);
  await page
    .getByTestId('polymer-library-preview')
    .waitFor({ state: 'detached' });
}

export async function zoomWithMouseWheel(page: Page, zoomLevelDelta: number) {
  await moveMouseToTheMiddleOfTheScreen(page);
  await page.keyboard.down('Control');
  await page.mouse.wheel(0, zoomLevelDelta);
  await page.keyboard.up('Control');
}

export async function scrollDown(page: Page, scrollDelta: number) {
  await moveMouseToTheMiddleOfTheScreen(page);
  await page.mouse.wheel(0, scrollDelta);
}

export async function scrollUp(page: Page, scrollDelta: number) {
  await moveMouseToTheMiddleOfTheScreen(page);
  await page.mouse.wheel(0, -scrollDelta);
}

export async function chooseFileFormat(
  page: Page,
  fileFomat:
    | 'Ket'
    | 'MDL Molfile V3000'
    | 'FASTA'
    | 'Sequence'
    | 'Sequence (1-letter code)'
    | 'Sequence (3-letter code)'
    | 'IDT'
    | 'HELM'
    | 'SVG Document',
) {
  await page.getByTestId('dropdown-select').click();
  await waitForSpinnerFinishedWork(page, async () => {
    await page.getByRole('option', { name: fileFomat }).click();
  });
}

export const Tabs = {
  Favorites: { displayName: 'Favorites', testId: FAVORITES_TAB },
  Peptides: { displayName: 'Peptides', testId: PEPTIDES_TAB },
  Rna: { displayName: 'RNA', testId: RNA_TAB },
  Chem: { displayName: 'CHEM', testId: CHEM_TAB },
};

export async function chooseTab(
  page: Page,
  tab: (typeof Tabs)[keyof typeof Tabs],
) {
  await page.getByTestId(tab.testId).click();
}
