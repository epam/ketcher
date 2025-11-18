/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, expect } from '@playwright/test';
import { test } from '@fixtures';
import { openFileAndAddToCanvasAsNewProjectMacro } from '@utils/files/readFile';
import { takeElementScreenshot } from '@utils/index';
import {
  getMonomerLocator,
  getSymbolLocator,
} from '@utils/macromolecules/monomer';
import { MonomerPreviewTooltip } from '@tests/pages/macromolecules/canvas/MonomerPreviewTooltip';

let page: Page;
test.beforeAll(async ({ initFlexCanvas }) => {
  page = await initFlexCanvas();
});
test.afterAll(async ({ closePage }) => {
  await closePage();
});
test.beforeEach(async ({ FlexCanvas: _ }) => {});

test(`1. Check that additional monomer properties should be added to the monomer preview on canvas (in snake)`, async ({
  SnakeCanvas: _,
}) => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8553
   * Description: Check that additional monomer properties should be added to the monomer preview on canvas (in snake)
   *
   * Case:
   *      1. Open Macromolecules canvas - Snake mode
   *      2. Load custom peptide structure from KET file to the canvas
   *      3. Hover the monomer and open the tooltip
   *      4. Verify that the IDT alias is displayed in the tooltip
   *      5. Verify that the AxoLabs alias is displayed in the tooltip
   *      6. Verify that the HELM alias is displayed in the tooltip
   *      7. Verify that the modification types are displayed in the tooltip
   *
   * Version 3.10
   */
  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'KET/Chromium-popup/Monomer-preview/monomer-preview.ket',
  );

  const monomer = getMonomerLocator(page, { monomerAlias: 'test' });
  await monomer.hover();

  const monomerPreviewTooltip = MonomerPreviewTooltip(page);
  await monomerPreviewTooltip.waitForBecomeVisible();

  expect.soft(await monomerPreviewTooltip.getIDTAliases()).toEqual('test_IDT');
  expect
    .soft(await monomerPreviewTooltip.getAxoLabsAlias())
    .toEqual('test_AxoLabs');
  expect.soft(await monomerPreviewTooltip.getHELMAlias()).toEqual('test_HELM');
  expect
    .soft(await monomerPreviewTooltip.getModificationTypes())
    .toEqual(
      'Natural amino acid, Inversion, N-methylation, Side chain acetylation, Custom modidication',
    );
});

test(`2. Check that additional monomer properties should be added to the monomer preview on canvas (in flex)`, async ({
  FlexCanvas: _,
}) => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8553
   * Description: Check that additional monomer properties should be added to the monomer preview on canvas (in  flex)
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex mode
   *      2. Load custom peptide structure from KET file to the canvas
   *      3. Hover the monomer and open the tooltip
   *      4. Verify that the IDT alias is displayed in the tooltip
   *      5. Verify that the AxoLabs alias is displayed in the tooltip
   *      6. Verify that the HELM alias is displayed in the tooltip
   *      7. Verify that the modification types are displayed in the tooltip
   *
   * Version 3.10
   */
  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'KET/Chromium-popup/Monomer-preview/monomer-preview.ket',
  );

  const monomer = getMonomerLocator(page, { monomerAlias: 'test' });
  await monomer.hover();

  const monomerPreviewTooltip = MonomerPreviewTooltip(page);
  await monomerPreviewTooltip.waitForBecomeVisible();

  expect.soft(await monomerPreviewTooltip.getIDTAliases()).toEqual('test_IDT');
  expect
    .soft(await monomerPreviewTooltip.getAxoLabsAlias())
    .toEqual('test_AxoLabs');
  expect.soft(await monomerPreviewTooltip.getHELMAlias()).toEqual('test_HELM');
  expect
    .soft(await monomerPreviewTooltip.getModificationTypes())
    .toEqual(
      'Natural amino acid, Inversion, N-methylation, Side chain acetylation, Custom modidication',
    );
});

test(`2. Check that additional monomer properties should be added to the monomer preview on canvas (in sequence)`, async ({
  SequenceCanvas: _,
}) => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8553
   * Description: Check that additional monomer properties should be added to the monomer preview on canvas (in sequence)
   *
   * Case:
   *      1. Open Macromolecules canvas - Sequence mode
   *      2. Load custom peptide structure from KET file to the canvas
   *      3. Hover the monomer and open the tooltip
   *      4. Verify that the IDT alias is displayed in the tooltip
   *      5. Verify that the AxoLabs alias is displayed in the tooltip
   *      6. Verify that the HELM alias is displayed in the tooltip
   *      7. Verify that the modification types are displayed in the tooltip
   *
   * Version 3.10
   */
  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'KET/Chromium-popup/Monomer-preview/monomer-preview.ket',
  );

  const monomer = getSymbolLocator(page, { symbolAlias: 'A' });
  await monomer.hover();

  const monomerPreviewTooltip = MonomerPreviewTooltip(page);
  await monomerPreviewTooltip.waitForBecomeVisible();

  expect.soft(await monomerPreviewTooltip.getIDTAliases()).toEqual('test_IDT');
  expect
    .soft(await monomerPreviewTooltip.getAxoLabsAlias())
    .toEqual('test_AxoLabs');
  expect.soft(await monomerPreviewTooltip.getHELMAlias()).toEqual('test_HELM');
  expect
    .soft(await monomerPreviewTooltip.getModificationTypes())
    .toEqual(
      'Natural amino acid, Inversion, N-methylation, Side chain acetylation, Custom modidication',
    );
});

test(`4. Check that the properties arranged in the order`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8553
   * Description: 1. Check that the properties arranged in the order
   *              2. Verify that the line separating the attachment point information from the
   *                 properties should be extended if the properties take up more than one line
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex mode
   *      2. Load custom peptide structure from KET file to the canvas
   *      3. Hover the monomer and open the tooltip
   *      4. Take screenshot of the tooltip to validate the order of properties
   *
   * Version 3.10
   */
  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'KET/Chromium-popup/Monomer-preview/monomer-preview.ket',
  );

  const monomer = getMonomerLocator(page, { monomerAlias: 'test' });
  await monomer.hover();

  const monomerPreviewTooltip = MonomerPreviewTooltip(page);
  await monomerPreviewTooltip.waitForBecomeVisible();

  await takeElementScreenshot(page, monomerPreviewTooltip.window);
});

test(`5. Check that if a monomer doesn't have one of the properties, it not exist on the preview (IDT)`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8553
   * Description: Check that if a monomer doesn't have one of the properties, it not exist on the preview (IDT)
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex mode
   *      2. Load custom peptide structure from KET file to the canvas
   *      3. Hover the monomer and open the tooltip
   *      4. Verify the absence of the IDT alias
   *
   * Version 3.10
   */
  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'KET/Chromium-popup/Monomer-preview/monomer-preview-no-IDT.ket',
  );

  const monomer = getMonomerLocator(page, { monomerAlias: 'test' });
  await monomer.hover();

  const monomerPreviewTooltip = MonomerPreviewTooltip(page);
  await monomerPreviewTooltip.waitForBecomeVisible();

  expect.soft(await monomerPreviewTooltip.getIDTAliases()).toEqual(null);
  expect
    .soft(await monomerPreviewTooltip.getAxoLabsAlias())
    .toEqual('test_AxoLabs');
  expect.soft(await monomerPreviewTooltip.getHELMAlias()).toEqual('test_HELM');
  expect
    .soft(await monomerPreviewTooltip.getModificationTypes())
    .toEqual(
      'Natural amino acid, Inversion, N-methylation, Side chain acetylation, Custom modidication',
    );
});

test(`6. Check that if a monomer doesn't have one of the properties, it not exist on the preview (AxoLabs)`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8553
   * Description: Check that if a monomer doesn't have one of the properties, it not exist on the preview (AxoLabs)
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex mode
   *      2. Load custom peptide structure from KET file to the canvas
   *      3. Hover the monomer and open the tooltip
   *      4. Verify the absence of the AxoLabs alias
   *
   * Version 3.10
   */
  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'KET/Chromium-popup/Monomer-preview/monomer-preview-no-AxoLabs.ket',
  );

  const monomer = getMonomerLocator(page, { monomerAlias: 'test' });
  await monomer.hover();

  const monomerPreviewTooltip = MonomerPreviewTooltip(page);
  await monomerPreviewTooltip.waitForBecomeVisible();

  expect.soft(await monomerPreviewTooltip.getIDTAliases()).toEqual('test_IDT');
  expect.soft(await monomerPreviewTooltip.getAxoLabsAlias()).toEqual(null);
  expect.soft(await monomerPreviewTooltip.getHELMAlias()).toEqual('test_HELM');
  expect
    .soft(await monomerPreviewTooltip.getModificationTypes())
    .toEqual(
      'Natural amino acid, Inversion, N-methylation, Side chain acetylation, Custom modidication',
    );
});

test(`7. Check that if a monomer doesn't have one of the properties, it not exist on the preview (HELM)`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8553
   * Description: Check that if a monomer doesn't have one of the properties, it not exist on the preview (HELM)
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex mode
   *      2. Load custom peptide structure from KET file to the canvas
   *      3. Hover the monomer and open the tooltip
   *      4. Verify the absence of the HELM alias
   *
   * Version 3.10
   */
  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'KET/Chromium-popup/Monomer-preview/monomer-preview-no-HELM.ket',
  );

  const monomer = getMonomerLocator(page, { monomerAlias: 'test' });
  await monomer.hover();

  const monomerPreviewTooltip = MonomerPreviewTooltip(page);
  await monomerPreviewTooltip.waitForBecomeVisible();

  expect.soft(await monomerPreviewTooltip.getIDTAliases()).toEqual('test_IDT');
  expect
    .soft(await monomerPreviewTooltip.getAxoLabsAlias())
    .toEqual('test_AxoLabs');
  expect.soft(await monomerPreviewTooltip.getHELMAlias()).toEqual(null);
  expect
    .soft(await monomerPreviewTooltip.getModificationTypes())
    .toEqual(
      'Natural amino acid, Inversion, N-methylation, Side chain acetylation, Custom modidication',
    );
});

test(`8. Check that if a monomer doesn't have one of the properties, it not exist on the preview (Modifications)`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/8553
   * Description: Check that if a monomer doesn't have one of the properties, it not exist on the preview (Modifications)
   *
   * Case:
   *      1. Open Macromolecules canvas - Flex mode
   *      2. Load custom peptide structure from KET file to the canvas
   *      3. Hover the monomer and open the tooltip
   *      4. Verify the absence of the Modifications
   *
   * Version 3.10
   */
  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'KET/Chromium-popup/Monomer-preview/monomer-preview-no-Modifications.ket',
  );

  const monomer = getMonomerLocator(page, { monomerAlias: 'test' });
  await monomer.hover();

  const monomerPreviewTooltip = MonomerPreviewTooltip(page);
  await monomerPreviewTooltip.waitForBecomeVisible();

  expect.soft(await monomerPreviewTooltip.getIDTAliases()).toEqual('test_IDT');
  expect
    .soft(await monomerPreviewTooltip.getAxoLabsAlias())
    .toEqual('test_AxoLabs');
  expect.soft(await monomerPreviewTooltip.getHELMAlias()).toEqual('test_HELM');
  expect.soft(await monomerPreviewTooltip.getModificationTypes()).toEqual(null);
});
