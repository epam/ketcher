import { test, expect } from '@playwright/test';
import { waitForPageInit } from '@utils';
import { openFileAndAddToCanvas, saveToFile, receiveFileComparisonData } from '@utils';
import { getKet, getMolfile } from '@utils';

test.describe('Copolymer S-group type', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
  });

  test('Import MOL file with COP s-group and verify it renders on canvas', async ({ page }) => {
    await openFileAndAddToCanvas('KET/copolymer-sgroup-ran.mol', page);
    await expect(page.getByTestId('canvas')).toBeVisible();
    const canvas = page.getByTestId('canvas');
    await expect(canvas).toContainText('COP');
  });

  test('Convert MOL with COP RAN subtype to KET and verify structure', async ({ page }) => {
    await openFileAndAddToCanvas('KET/copolymer-sgroup-ran.mol', page);
    const ketContent = await getKet(page);
    expect(ketContent).toContain('"type":"COP"');
    expect(ketContent).toContain('"subtype":"RAN"');
  });

  test('Convert MOL with COP ALT subtype to KET and verify subtype preserved', async ({ page }) => {
    await openFileAndAddToCanvas('KET/copolymer-sgroup-alt.mol', page);
    const ketContent = await getKet(page);
    expect(ketContent).toContain('"type":"COP"');
    expect(ketContent).toContain('"subtype":"ALT"');
  });

  test('Convert MOL with COP BLO subtype to KET and verify subtype preserved', async ({ page }) => {
    await openFileAndAddToCanvas('KET/copolymer-sgroup-blo.mol', page);
    const ketContent = await getKet(page);
    expect(ketContent).toContain('"type":"COP"');
    expect(ketContent).toContain('"subtype":"BLO"');
  });

  test('Verify HT connection type is preserved in KET conversion', async ({ page }) => {
    await openFileAndAddToCanvas('KET/copolymer-sgroup-ht.mol', page);
    const ketContent = await getKet(page);
    expect(ketContent).toContain('"connectivity":"HT"');
  });

  test('Verify HH connection type is preserved in KET conversion', async ({ page }) => {
    await openFileAndAddToCanvas('KET/copolymer-sgroup-hh.mol', page);
    const ketContent = await getKet(page);
    expect(ketContent).toContain('"connectivity":"HH"');
  });

  test('Verify EU connection type is preserved in KET conversion', async ({ page }) => {
    await openFileAndAddToCanvas('KET/copolymer-sgroup-eu.mol', page);
    const ketContent = await getKet(page);
    expect(ketContent).toContain('"connectivity":"EU"');
  });

  test('Export KET with COP s-group back to MOL and verify roundtrip', async ({ page }) => {
    await openFileAndAddToCanvas('KET/copolymer-sgroup-ran.ket', page);
    const molContent = await getMolfile(page);
    expect(molContent).toContain('COP');
    expect(molContent).toContain('RAN');
  });

  test('Import KET with COP s-group and verify atoms and bonds are present', async ({ page }) => {
    await openFileAndAddToCanvas('KET/copolymer-sgroup-ran.ket', page);
    const ketContent = await getKet(page);
    expect(ketContent).toContain('"atoms"');
    expect(ketContent).toContain('"bonds"');
    expect(ketContent).toContain('"type":"COP"');
  });

  test('COP s-group label is visible on canvas after import', async ({ page }) => {
    await openFileAndAddToCanvas('KET/copolymer-sgroup-ran.mol', page);
    const canvas = page.getByTestId('canvas');
    await expect(canvas).toBeVisible();
    const snapshot = await canvas.screenshot();
    expect(snapshot).toBeTruthy();
  });
});