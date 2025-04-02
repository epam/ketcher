/* eslint-disable no-magic-numbers */
import { test, expect } from '@playwright/test';
import { waitForPageInit, turnOnMacromoleculesEditor } from '@utils';

test.describe('getKet', () => {
  test.beforeEach(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test('Check that generateImage method works with macromolecules', async ({
    page,
  }) => {
    const jsonString = JSON.stringify({
      root: {
        nodes: [
          {
            $ref: 'monomer243878',
          },
        ],
        connections: [],
        templates: [
          {
            $ref: 'monomerTemplate-Cya___3-sulfoalanine',
          },
        ],
      },
      monomer243878: {
        type: 'monomer',
        id: '243878',
        position: {
          x: 6.42571029663086,
          y: -5.901278495788574,
        },
        alias: 'Cya',
        templateId: 'Cya___3-sulfoalanine',
      },
      'monomerTemplate-Cya___3-sulfoalanine': {
        type: 'monomerTemplate',
        atoms: [
          { label: 'C', location: [0.5437, 0.778, 0] },
          { label: 'C', location: [0.5429, -0.7228, 0], stereoLabel: 'abs' },
          { label: 'C', location: [1.8417, -1.4748, 0] },
          { label: 'O', location: [1.841, -2.6748, 0] },
          { label: 'O', location: [2.8815, -0.8757, 0] },
          { label: 'N', location: [-0.756, -1.4748, 0] },
          { label: 'H', location: [-1.7964, -0.8767, 0] },
          { label: 'S', location: [-0.7551, 1.53, 0] },
          { label: 'O', location: [-0.7544, 2.73, 0] },
          { label: 'O', location: [-1.7949, 0.9309, 0] },
          { label: 'O', location: [-1.794, 2.1307, 0] },
        ],
        bonds: [
          { type: 1, atoms: [1, 0], stereo: 1 },
          { type: 1, atoms: [1, 2] },
          { type: 2, atoms: [2, 3] },
          { type: 1, atoms: [2, 4] },
          { type: 1, atoms: [1, 5] },
          { type: 1, atoms: [5, 6] },
          { type: 1, atoms: [0, 7] },
          { type: 2, atoms: [7, 8] },
          { type: 2, atoms: [7, 9] },
          { type: 1, atoms: [7, 10] },
        ],
        class: 'AminoAcid',
        classHELM: 'PEPTIDE',
        id: 'Cya___3-sulfoalanine',
        fullName: '3-sulfoalanine',
        alias: 'Cya',
        attachmentPoints: [
          { attachmentAtom: 5, leavingGroup: { atoms: [6] }, type: 'left' },
          { attachmentAtom: 2, leavingGroup: { atoms: [4] }, type: 'right' },
        ],
        naturalAnalogShort: 'A',
      },
    });

    await page.waitForFunction(() => window.ketcher);

    const image = await page.evaluate(async (jsonString) => {
      const result = await window.ketcher.generateImage(jsonString);
      return result;
    }, jsonString);

    expect(image).not.toBeNull();
    expect(image).not.toBe('');
  });
});
