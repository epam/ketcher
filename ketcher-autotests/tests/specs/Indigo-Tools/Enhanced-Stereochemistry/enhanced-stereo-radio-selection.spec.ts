/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@fixtures';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { openFileAndAddToCanvas } from '@utils';
import { EnhancedStereochemistry } from '@tests/pages/molecules/canvas/EnhancedStereochemistry';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';

let page: Page;

test.describe('Enhanced Stereochemistry - Radio button selection', () => {
  test.beforeAll(async ({ initMoleculesCanvas }) => {
    page = await initMoleculesCanvas();
  });
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });
  test.beforeEach(async ({ MoleculesCanvas: _ }) => {});
  test.afterEach(async () => {
    if (await EnhancedStereochemistry(page).isVisible()) {
      await EnhancedStereochemistry(page).closeWindow();
    }
  });

  test('ABS radio is checked by default when opening dialog', async () => {
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/stereo-structure-enchanced.mol',
    );
    await getAtomLocator(page, { atomLabel: 'C', atomId: 21 }).click({
      force: true,
    });
    await LeftToolbar(page).stereochemistry();

    const dialog = EnhancedStereochemistry(page);
    await expect(dialog.absRadio).toBeChecked();
    await expect(dialog.newAndGroupRadio).not.toBeChecked();
    await expect(dialog.newOrGroupRadio).not.toBeChecked();
  });

  test('Clicking Create new AND Group updates radio checked state', async () => {
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/stereo-structure-enchanced.mol',
    );
    await getAtomLocator(page, { atomLabel: 'C', atomId: 21 }).click({
      force: true,
    });
    await LeftToolbar(page).stereochemistry();

    const dialog = EnhancedStereochemistry(page);
    await dialog.newAndGroupRadio.click();

    await expect(dialog.newAndGroupRadio).toBeChecked();
    await expect(dialog.absRadio).not.toBeChecked();
    await expect(dialog.newOrGroupRadio).not.toBeChecked();
  });

  test('Clicking Create new OR Group updates radio checked state', async () => {
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/stereo-structure-enchanced.mol',
    );
    await getAtomLocator(page, { atomLabel: 'C', atomId: 21 }).click({
      force: true,
    });
    await LeftToolbar(page).stereochemistry();

    const dialog = EnhancedStereochemistry(page);
    await dialog.newOrGroupRadio.click();

    await expect(dialog.newOrGroupRadio).toBeChecked();
    await expect(dialog.absRadio).not.toBeChecked();
    await expect(dialog.newAndGroupRadio).not.toBeChecked();
  });

  test('Switching between all radio options updates checked state correctly', async () => {
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/stereo-structure-enchanced.mol',
    );
    await getAtomLocator(page, { atomLabel: 'C', atomId: 21 }).click({
      force: true,
    });
    await LeftToolbar(page).stereochemistry();

    const dialog = EnhancedStereochemistry(page);

    await dialog.newAndGroupRadio.click();
    await expect(dialog.newAndGroupRadio).toBeChecked();
    await expect(dialog.absRadio).not.toBeChecked();

    await dialog.newOrGroupRadio.click();
    await expect(dialog.newOrGroupRadio).toBeChecked();
    await expect(dialog.newAndGroupRadio).not.toBeChecked();

    await dialog.absRadio.click();
    await expect(dialog.absRadio).toBeChecked();
    await expect(dialog.newOrGroupRadio).not.toBeChecked();
  });

  test('Radio selection persists until Apply is clicked', async () => {
    await openFileAndAddToCanvas(
      page,
      'Molfiles-V2000/stereo-structure-enchanced.mol',
    );
    await getAtomLocator(page, { atomLabel: 'C', atomId: 21 }).click({
      force: true,
    });
    await LeftToolbar(page).stereochemistry();

    const dialog = EnhancedStereochemistry(page);

    await dialog.newOrGroupRadio.click();
    await expect(dialog.newOrGroupRadio).toBeChecked();

    await dialog.apply();

    await getAtomLocator(page, { atomLabel: 'C', atomId: 21 }).click({
      force: true,
    });
    await LeftToolbar(page).stereochemistry();

    const reopenedDialog = EnhancedStereochemistry(page);
    await expect(reopenedDialog.addToOrGroupRadio).toBeChecked();
    await expect(reopenedDialog.absRadio).not.toBeChecked();
  });
});
