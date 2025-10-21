/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { test } from '@fixtures';
import { Page, expect } from '@playwright/test';
import { Nucleotide } from '@tests/pages/constants/monomers/Nucleotides';
import { MonomerPreviewTooltip } from '@tests/pages/macromolecules/canvas/MonomerPreviewTooltip';
import { Library } from '@tests/pages/macromolecules/Library';

let page: Page;

test.beforeAll(async ({ initFlexCanvas }) => {
  page = await initFlexCanvas();
});
test.beforeEach(async ({ FlexCanvas: _ }) => {});
test.afterAll(async ({ closePage }) => {
  await closePage();
});

test('Case 1: Check that for AxoLabs, five nucleotide monomers added', async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/8322
   * Description: Check that for AxoLabs, five nucleotide monomers added
   * Scenario:
   *            1. Validate that five chains of three nucleotide monomers are present in the library
   *
   * Version 3.9
   */
  expect(await Library(page).isMonomerExist(Nucleotide.InvdA)).toBeTruthy();
  expect(await Library(page).isMonomerExist(Nucleotide.InvdC)).toBeTruthy();
  expect(await Library(page).isMonomerExist(Nucleotide.InvdG)).toBeTruthy();
  expect(await Library(page).isMonomerExist(Nucleotide.InvdT)).toBeTruthy();
  expect(await Library(page).isMonomerExist(Nucleotide.vinU)).toBeTruthy();
});

test("Case 2: Check that Name and symbol of one nucleotide already in the library changed - what was Inverted dT (InvdT) should now be 3' Inverted dT (3InvdT)", async () => {
  /*
   * Test case: https://github.com/epam/ketcher/issues/8322
   * Description: Check that Name and symbol of one nucleotide already in the library changed - what was
   *              Inverted dT (InvdT) should now be 3' Inverted dT (3InvdT)
   * Scenario:
   *            1. Load axolabs string via Paste from Clipboard dialog
   *            2. Validate that five chains of three nucleotide monomers are present on the canvas
   *
   * Version 3.9
   */
  expect(await Library(page).isMonomerExist(Nucleotide._3InvdT)).toBeTruthy();

  await Library(page).hoverMonomer(Nucleotide._3InvdT);
  await MonomerPreviewTooltip(page).waitForBecomeVisible();
  expect(await MonomerPreviewTooltip(page).getTitleText()).toContain(
    "3' Inverted dT",
  );
});
