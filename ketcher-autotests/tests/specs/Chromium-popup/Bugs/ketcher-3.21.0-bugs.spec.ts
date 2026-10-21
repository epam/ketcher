import { Page, test, expect } from '@fixtures';
import {
  MacroFileType,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  SymbolType,
} from '@utils';
import { getSymbolLocator } from '@utils/macromolecules/monomer';

let page: Page;

test.describe('Bugs: ketcher-3.21.0', () => {
  test.beforeAll(async ({ initSequenceCanvas }) => {
    page = await initSequenceCanvas();
  });

  test.beforeEach(async ({ SequenceCanvas: _ }) => {});

  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1 — Phosphate in antisense is shown as p symbol if it comes first', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/6544
     * Bug: https://github.com/epam/ketcher/issues/6544
     * Description: Phosphate that follows a nucleotide in antisense chain is shown as p symbol, not as @ symbol
     *
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM: RNA1{P.R(A)P.R(A)}|RNA2{R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,3:pair-2:pair|RNA2,RNA3,3:R2-1:R1|RNA3,RNA1,1:pair-1:pair|CHEM1,RNA2,1:R2-1:R1|CHEM1,RNA1,1:pair-6:pair$$$V2.0
     * 3. Verify that antisense chain has one phosphate symbol (p) and one CHEM symbol (@)
     *
     * Version 3.21.0
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,3:pair-2:pair|RNA2,RNA3,3:R2-1:R1|RNA3,RNA1,1:pair-1:pair|CHEM1,RNA2,1:R2-1:R1|CHEM1,RNA1,1:pair-6:pair$$$V2.0',
    );

    await expect(
      getSymbolLocator(page, {
        isAntisense: true,
        dataSymbolType: SymbolType.Phosphate,
      }),
    ).toHaveCount(1);
    await expect(
      getSymbolLocator(page, {
        isAntisense: true,
        dataSymbolType: SymbolType.CHEM,
      }),
    ).toHaveCount(1);
  });

  test('Case 2 — Sense chain is not affected when antisense phosphate follows a nucleotide', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/6544
     * Bug: https://github.com/epam/ketcher/issues/6544
     * Description: Sense chain still shows its first phosphate as p symbol and has no @ symbol
     *
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM: RNA1{P.R(A)P.R(A)}|RNA2{R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,3:pair-2:pair|RNA2,RNA3,3:R2-1:R1|RNA3,RNA1,1:pair-1:pair|CHEM1,RNA2,1:R2-1:R1|CHEM1,RNA1,1:pair-6:pair$$$V2.0
     * 3. Verify that sense chain has one phosphate symbol (p) and no CHEM symbols (@)
     *
     * Version 3.21.0
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{P.R(A)P.R(A)}|RNA2{R(U)P}|RNA3{P}|CHEM1{[4aPEGMal]}$RNA1,RNA2,3:pair-2:pair|RNA2,RNA3,3:R2-1:R1|RNA3,RNA1,1:pair-1:pair|CHEM1,RNA2,1:R2-1:R1|CHEM1,RNA1,1:pair-6:pair$$$V2.0',
    );

    await expect(
      getSymbolLocator(page, {
        isAntisense: false,
        dataSymbolType: SymbolType.Phosphate,
      }),
    ).toHaveCount(1);
    await expect(
      getSymbolLocator(page, {
        isAntisense: false,
        dataSymbolType: SymbolType.CHEM,
      }),
    ).toHaveCount(0);
  });

  test('Case 3 — Trailing phosphate after a nucleotide is shown as p symbol', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/6544
     * Bug: https://github.com/epam/ketcher/issues/6544
     * Description: Phosphate that follows a nucleotide at the end of a sense chain is shown as p symbol, not as @ symbol
     *
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM: RNA1{R(A)P.P}$$$$V2.0
     * 3. Verify that there is one phosphate symbol (p) and no CHEM symbols (@)
     *
     * Version 3.21.0
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.P}$$$$V2.0',
    );

    await expect(
      getSymbolLocator(page, { dataSymbolType: SymbolType.Phosphate }),
    ).toHaveCount(1);
    await expect(
      getSymbolLocator(page, { dataSymbolType: SymbolType.CHEM }),
    ).toHaveCount(0);
  });

  test('Case 4 — Two phosphates after a nucleotide are still shown as @ symbol', async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/6544
     * Bug: https://github.com/epam/ketcher/issues/6544
     * Description: Several phosphates in a row after a nucleotide are still shown as one linker (@ symbol)
     *
     * Scenario:
     * 1. Go to Macro - Sequence mode (clean canvas)
     * 2. Load from HELM: RNA1{R(A)P.P.P}$$$$V2.0
     * 3. Verify that there are no phosphate symbols (p) and one CHEM symbol (@)
     *
     * Version 3.21.0
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.P.P}$$$$V2.0',
    );

    await expect(
      getSymbolLocator(page, { dataSymbolType: SymbolType.Phosphate }),
    ).toHaveCount(0);
    await expect(
      getSymbolLocator(page, { dataSymbolType: SymbolType.CHEM }),
    ).toHaveCount(1);
  });
});
