import { Page } from '@playwright/test';
import { turnOnMacromoleculesEditor } from '.';
import { RNA_TAB } from '@constants/testIdConstants';

export type RnaAccordionType = keyof typeof RnaAccordionTypes;

export const RnaAccordionTypes = {
  Presets: {
    summaryTestId: 'summary-Presets',
    detailsTestId: 'rna-accordion-details-Presets',
  },
  Sugars: {
    summaryTestId: 'summary-Sugars',
    detailsTestId: 'rna-accordion-details-Sugars',
  },
  Bases: {
    summaryTestId: 'summary-Bases',
    detailsTestId: 'rna-accordion-details-Bases',
  },
  Phosphates: {
    summaryTestId: 'summary-Phosphates',
    detailsTestId: 'rna-accordion-details-Phosphates',
  },
  Nucleotides: {
    summaryTestId: 'summary-Nucleotides',
    detailsTestId: 'rna-accordion-details-Nucleotides',
  },
};

export async function toggleRnaBuilderAccordion(page: Page) {
  await page.getByTestId('rna-builder-expand-button').click();
}

export async function toggleAccordionItem(
  page: Page,
  accordionType: RnaAccordionType,
) {
  await page
    .getByTestId(RnaAccordionTypes[accordionType].summaryTestId)
    .click();
}

export async function toggleRnaBuilder(
  page: Page,
  action: 'expand' | 'collapse',
) {
  const isExpanded = await page.getByTestId('rna-editor-expanded').isVisible();

  if (
    (action === 'expand' && !isExpanded) ||
    (action === 'collapse' && isExpanded)
  ) {
    await toggleRnaBuilderAccordion(page);
  }
}

export async function toggleRnaAccordionItem(
  page: Page,
  accordionType: RnaAccordionType,
  action: 'expand' | 'collapse',
) {
  const isExpanded = await page
    .getByTestId(RnaAccordionTypes[accordionType].detailsTestId)
    .isVisible();

  if (
    (action === 'expand' && !isExpanded) ||
    (action === 'collapse' && isExpanded)
  ) {
    await toggleAccordionItem(page, accordionType);
  }
}

export async function gotoRNA(page: Page) {
  await turnOnMacromoleculesEditor(page);
  await page.getByTestId(RNA_TAB).click();
  await toggleRnaBuilderAccordion(page);
}

export async function toggleSugarsAccordion(page: Page) {
  await toggleAccordionItem(page, 'Sugars');
}

export async function toggleBasesAccordion(page: Page) {
  await toggleAccordionItem(page, 'Bases');
}

export async function togglePhosphatesAccordion(page: Page) {
  await toggleAccordionItem(page, 'Phosphates');
}

export async function togglePresetsAccordion(page: Page) {
  await toggleAccordionItem(page, 'Presets');
}

export async function toggleNucleotidesAccordion(page: Page) {
  await toggleAccordionItem(page, 'Nucleotides');
}

export async function pressNewPresetButton(page: Page) {
  await page.getByRole('button', { name: 'New Preset' }).click();
}

export async function selectSugarSlot(page: Page) {
  await page.getByTestId('rna-builder-slot--sugar').click();
}

export async function selectBaseSlot(page: Page) {
  await page.getByTestId('rna-builder-slot--base').click();
}

export async function selectPhosphateSlot(page: Page) {
  await page.getByTestId('rna-builder-slot--phosphate').click();
}

export async function pressAddToPresetsButton(page: Page) {
  await page.getByTestId('add-to-presets-btn').click();
}

export async function expandCollapseRnaBuilder(page: Page) {
  await page
    .locator('div')
    .filter({ hasText: /^RNA Builder$/ })
    .getByRole('button')
    .click();
}
