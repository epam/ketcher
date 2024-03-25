/* eslint-disable prettier/prettier */
/* eslint-disable no-magic-numbers */
import { test } from '@playwright/test';
import {
  waitForPageInit,
  takeEditorScreenshot,
  selectClearCanvasTool,
  openFileAndAddToCanvasMacro,
  moveMouseAway,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';

test.describe('Connection rules for Base monomers: ', () => {
  test.beforeAll(async ({ page }) => {
    await waitForPageInit(page);
    await turnOnMacromoleculesEditor(page);
  });

  test.beforeEach(async ({ page }) => {
    await selectClearCanvasTool(page);
  });

  interface IMonomer {
    fileName: string;
    connectionPoints: [...number[]];
  }

  const baseMonomers: { [monomerName: string]: IMonomer } = {
    '(R1) - Left only': {
      fileName: 'KET/Base-Templates/01 - (R1) - Left only.ket',
      connectionPoints: [1],
    },
    '(R1,R2) - R3 gap': {
      fileName: 'KET/Base-Templates/04 - (R1,R2) - R3 gap.ket',
      connectionPoints: [1, 2],
    },
    '(R1,R3) - R2 gap': {
      fileName: 'KET/Base-Templates/05 - (R1,R3) - R2 gap.ket',
      connectionPoints: [1, 3],
    },
    '(R1,R2,R3)': {
      fileName: 'KET/Base-Templates/08 - (R1,R2,R3).ket',
      connectionPoints: [1, 2, 3],
    },
    '(R1,R3,R4)': {
      fileName: 'KET/Base-Templates/09 - (R1,R3,R4).ket',
      connectionPoints: [1, 3, 4],
    },
    '(R1,R2,R3,R4)': {
      fileName: 'KET/Base-Templates/12 - (R1,R2,R3,R4).ket',
      connectionPoints: [1, 2, 3, 4],
    },
    '(R1,R3,R4,R5)': {
      fileName: 'KET/Base-Templates/13 - (R1,R3,R4,R5).ket',
      connectionPoints: [1, 3, 4, 5],
    },
    '(R1,R2,R3,R4,R5)': {
      fileName: 'KET/Base-Templates/15 - (R1,R2,R3,R4,R5).ket',
      connectionPoints: [1, 2, 3, 4, 5],
    },
  };

  test('Connect R1 to R1', async ({ page }) => {
    await openFileAndAddToCanvasMacro(
      baseMonomers['(R1) - Left only'].fileName,
      page,
    );
    await moveMouseAway(page);
    await takeEditorScreenshot(page);
  });
});
