/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import {
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
} from '@utils/macromolecules';
import { Page, test, expect } from '@playwright/test';
import {
  takeEditorScreenshot,
  selectClearCanvasTool,
  waitForPageInit,
  MacroFileType,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  selectSnakeLayoutModeTool,
  openFileAndAddToCanvasMacro,
  selectAllStructuresOnCanvas,
  ZoomInByKeyboard,
  resetZoomLevelToDefault,
  ZoomOutByKeyboard,
  pasteFromClipboardByKeyboard,
  selectEraseTool,
  selectRectangleSelectionTool,
  dragMouseTo,
  selectSequenceLayoutModeTool,
  selectFlexLayoutModeTool,
  copyToClipboardByKeyboard,
} from '@utils';
import { pageReload } from '@utils/common/helpers';
import {
  pressRedoButton,
  pressUndoButton,
} from '@utils/macromolecules/topToolBar';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import {
  verifyFileExport,
  FileType,
  verifyHELMExport,
} from '@utils/files/receiveFileComparisonData';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
import { Sugars } from '@constants/monomers/Sugars';

let page: Page;

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();

  await waitForPageInit(page);
  await turnOnMacromoleculesEditor(page);
  await selectSnakeLayoutModeTool(page);
});

test.afterEach(async () => {
  await selectClearCanvasTool(page);
});

test.afterAll(async ({ browser }) => {
  await Promise.all(browser.contexts().map((context) => context.close()));
});

async function callContextMenuForMonomer(
  page: Page,
  monomerLocatorIndex: number,
) {
  const canvasLocator = page.getByTestId('ketcher-canvas');
  await canvasLocator
    .locator('g.monomer')
    .nth(monomerLocatorIndex)
    .click({ button: 'right', force: true });
}

interface IMonomer {
  monomerDescription: string;
  contentType: MacroFileType.Ket | MacroFileType.HELM;
  KETFile?: string;
  HELMString?: string;
  eligibleForAntisense: boolean;
  baseWithR3R1ConnectionPresent: boolean;
  monomerLocatorIndex: number;
  // Set shouldFail to true if you expect test to fail because of existed bug and put issues link to issueNumber
  shouldFail?: boolean;
  // issueNumber is mandatory if shouldFail === true
  issueNumber?: string;
  // set pageReloadNeeded to true if you need to restart ketcher before test (f.ex. to restart font renderer)
  pageReloadNeeded?: boolean;
}

async function loadMonomerOnCanvas(
  page: Page,
  monomer: IMonomer,
  pageReloadNeeded = false,
) {
  if (pageReloadNeeded) await pageReload(page);

  if (monomer.HELMString) {
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      monomer.HELMString,
    );
  }
  if (monomer.KETFile) {
    await openFileAndAddToCanvasMacro(monomer.KETFile, page);
  }
}

const monomers: IMonomer[] = [
  {
    monomerDescription: '1. Peptide A (from library)',
    contentType: MacroFileType.HELM,
    HELMString: 'PEPTIDE1{A}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '2. Ambiguous peptide X (alternatives, from library)',
    contentType: MacroFileType.HELM,
    HELMString:
      'PEPTIDE1{(A,C,D,E,F,G,H,I,K,L,M,N,O,P,Q,R,S,T,U,V,W,Y)}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '3. Ambiguous peptide % (alternatives)',
    contentType: MacroFileType.HELM,
    HELMString: 'PEPTIDE1{(S,T,U,V,W,Y)}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '4. Ambiguous peptide % (mixture)',
    contentType: MacroFileType.HELM,
    HELMString: 'PEPTIDE1{(S+T+U+V+W+Y)}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '5. Sugar R (from library)',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '6. Ambiguous sugar % (alternatives)',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3],[5A6])}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '7. Ambiguous sugar % (mixture)',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3]+[5A6])}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '8. Base A (from library)',
    contentType: MacroFileType.Ket,
    KETFile: 'KET/Antisense-Chains/8. Base A (from library).ket',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '9. Ambiguous DNA Base N (alternatives, from library)',
    contentType: MacroFileType.Ket,
    KETFile:
      'KET/Antisense-Chains/9. Ambiguous DNA Base N (alternatives, from library).ket',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '10. Ambiguous RNA Base N (alternatives, from library)',
    contentType: MacroFileType.Ket,
    KETFile:
      'KET/Antisense-Chains/10. Ambiguous RNA Base N (alternatives, from library).ket',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '11. Ambiguous Base M (alternatives, from library)',
    contentType: MacroFileType.Ket,
    KETFile:
      'KET/Antisense-Chains/11. Ambiguous Base M (alternatives, from library).ket',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '12. Ambiguous DNA Base % (mixture)',
    contentType: MacroFileType.Ket,
    KETFile: 'KET/Antisense-Chains/12. Ambiguous DNA Base % (mixture).ket',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '13. Ambiguous RNA Base % (mixture)',
    contentType: MacroFileType.Ket,
    KETFile: 'KET/Antisense-Chains/13. Ambiguous RNA Base % (mixture).ket',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '14. Ambiguous Base % (mixture)',
    contentType: MacroFileType.Ket,
    KETFile: 'KET/Antisense-Chains/14. Ambiguous Base % (mixture).ket',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '15. Phosphate P (from library)',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{P}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '16. Ambiguous phosphate % (alternatives)',
    contentType: MacroFileType.Ket,
    KETFile:
      'KET/Antisense-Chains/16. Ambiguous phosphate % (alternatives).ket',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '17. Ambiguous phosphate % (mixture)',
    contentType: MacroFileType.Ket,
    KETFile: 'KET/Antisense-Chains/17. Ambiguous phosphate % (mixture).ket',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '18. Unsplit monomer 2-damdA (from library)',
    contentType: MacroFileType.Ket,
    KETFile:
      'KET/Antisense-Chains/18. Unsplit monomer 2-damdA (from library).ket',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '19. Unknown monomer',
    contentType: MacroFileType.Ket,
    KETFile: 'KET/Antisense-Chains/19. Unknown monomer.ket',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '20. CHEM 4aPEGMal (from library)',
    contentType: MacroFileType.HELM,
    HELMString: 'CHEM1{[4aPEGMal]}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '21. Ambiguous CHEM % (alternatives)',
    contentType: MacroFileType.HELM,
    HELMString: 'CHEM1{([4aPEGMal],[sDBL])}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '22. Ambiguous CHEM % (mixture)',
    contentType: MacroFileType.HELM,
    HELMString: 'CHEM1{([4aPEGMal]+[sDBL])}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '23. Ambiguous CHEM % (mixture)',
    contentType: MacroFileType.HELM,
    HELMString: 'CHEM1{([4aPEGMal]+[sDBL])}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '24. Nucleoside - R(A)',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A)}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription:
      '25. Nucleoside with ambuguous alternative sugar - ([25moe3],[5A6])(A)',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3],[5A6])(A)}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '26. Nucleoside with ambuguous mixture sugar - ([25moe3]+[5A6])(A)',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3]+[5A6])(A)}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '27. Nucleoside with ambuguous alternative RNA base N - R(A,C,G,T)',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A,C,G,T)}$$$$V2.0',
    baseWithR3R1ConnectionPresent: true,
    eligibleForAntisense: true,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription:
      '28. Nucleoside with ambuguous alternative DNA base N - R(A,C,G,U)',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A,C,G,U)}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6149',
  },
  {
    monomerDescription:
      '29. Nucleoside with ambuguous alternative base S - R(A,C)',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A,C)}$$$$V2.0',
    baseWithR3R1ConnectionPresent: true,
    eligibleForAntisense: true,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription:
      '30. Nucleoside with ambuguous mixture RNA base - R(A+C+G+T)',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A+C+G+T)}$$$$V2.0',
    baseWithR3R1ConnectionPresent: true,
    eligibleForAntisense: false,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6088',
  },
  {
    monomerDescription:
      '31. Nucleoside with ambuguous mixture DNA base - R(A+C+G+U)',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A+C+G+U)}$$$$V2.0',
    baseWithR3R1ConnectionPresent: true,
    eligibleForAntisense: false,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6088',
  },
  {
    monomerDescription: '32. Nucleoside with ambuguous mixture base - R(A+C)',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A+C)}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6088',
  },
  {
    monomerDescription: '33. Nucleotide A - R(A)P',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A)P}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription:
      '34. Nucleotide A with ambiguous alternative phosphate - R(A)([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A)([bnn],[bP])}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6090',
  },
  {
    monomerDescription:
      '35. Nucleotide A with ambiguous mixture phosphate - R(A)([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A)([bnn]+[bP])}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6090',
  },
  {
    monomerDescription:
      '36. Nucleotide of base A with ambiguous alternative sugar and phosphate P - ([25moe3],[5A6])(A)P',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3],[5A6])(A)P}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '37 Nucleotide of base A with ambiguous alternative sugar and alternative phosphate - ([25moe3],[5A6])(A)([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3],[5A6])(A)([bnn],[bP])}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6090, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '38. Nucleotide of base A with ambiguous mixed sugar and phosphate P - ([25moe3]+[5A6])(A)P',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3]+[5A6])(A)P}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '39 Nucleotide of base A with ambiguous mixed sugar and alternative phosphate - ([25moe3]+[5A6])(A)([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3]+[5A6])(A)([bnn],[bP])}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6090, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '40. Nucleotide of base A with ambiguous alternative sugar and mixed phosphate - ([25moe3],[5A6])(A)([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3],[5A6])(A)([bnn]+[bP])}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6090, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '41. Nucleotide of base A with ambiguous mixed sugar and mixed phosphate - ([25moe3]+[5A6])(A)([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3]+[5A6])(A)([bnn]+[bP])}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6090, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '42. Nucleotide of DNA base N with ambiguous alternative sugar and phosphate P - ([25moe3],[5A6])(A,C,G,T)P',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3],[5A6])(A,C,G,T)P}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '43. Nucleotide of DNA base N with ambiguous alternative sugar and alternative phosphate - ([25moe3],[5A6])(A,C,G,T)([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3],[5A6])(A,C,G,T)([bnn],[bP])}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6090, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '44. Nucleotide of DNA base N with ambiguous mixed sugar and phosphate P - ([25moe3]+[5A6])(A,C,G,T)P',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3]+[5A6])(A,C,G,T)P}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '45. Nucleotide of DNA base N with ambiguous mixed sugar and alternative phosphate - ([25moe3]+[5A6])(A,C,G,T)([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3]+[5A6])(A,C,G,T)([bnn],[bP])}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6090, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '46. Nucleotide of DNA base N with ambiguous alternative sugar and mixed phosphate - ([25moe3],[5A6])(A,C,G,T)([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3],[5A6])(A,C,G,T)([bnn]+[bP])}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6090, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '47. Nucleotide of DNA base N with ambiguous mixed sugar and mixed phosphate - ([25moe3]+[5A6])(A,C,G,T)([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3]+[5A6])(A,C,G,T)([bnn]+[bP])}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6090, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '48. Nucleotide of RNA base N with ambiguous alternative sugar and phosphate P - ([25moe3],[5A6])(A,C,G,U)P',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3],[5A6])(A,C,G,U)P}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '49. Nucleotide of RNA base N with ambiguous alternative sugar and alternative phosphate - ([25moe3],[5A6])(A,C,G,U)([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3],[5A6])(A,C,G,U)([bnn],[bP])}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6090, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '50. Nucleotide of RNA base N with ambiguous mixed sugar and phosphate P - ([25moe3]+[5A6])(A,C,G,U)P',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3]+[5A6])(A,C,G,U)P}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '51. Nucleotide of RNA base N with ambiguous mixed sugar and alternative phosphate - ([25moe3]+[5A6])(A,C,G,U)([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3]+[5A6])(A,C,G,U)([bnn],[bP])}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6090, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '52. Nucleotide of RNA base N with ambiguous alternative sugar and mixed phosphate - ([25moe3],[5A6])(A,C,G,U)([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3],[5A6])(A,C,G,U)([bnn]+[bP])}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6090, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '53. Nucleotide of RNA base N with ambiguous mixed sugar and mixed phosphate - ([25moe3]+[5A6])(A,C,G,U)([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3]+[5A6])(A,C,G,U)([bnn]+[bP])}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6090, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '54. Nucleotide of alternative base M with ambiguous alternative sugar and phosphate P - ([25moe3],[5A6])(A,C)P',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3],[5A6])(A,C)P}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '55. Nucleotide of alternative base M with ambiguous alternative sugar and alternative phosphate - ([25moe3],[5A6])(A,C)([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3],[5A6])(A,C)([bnn],[bP])}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6090, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '56. Nucleotide of alternative base M with ambiguous mixed sugar and alternative phosphate - ([25moe3]+[5A6])(A,C)P',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3]+[5A6])(A,C)P}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '57. Nucleotide of alternative base M with ambiguous mixed sugar and alternative phosphate - ([25moe3]+[5A6])(A,C)([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3]+[5A6])(A,C)([bnn],[bP])}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6090, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '58. Nucleotide of alternative base M with ambiguous alternative sugar and mixed phosphate - ([25moe3],[5A6])(A,C)([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3],[5A6])(A,C)([bnn]+[bP])}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6090, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '59. Nucleotide of alternative base M with ambiguous mixed sugar and mixed phosphate - ([25moe3]+[5A6])(A,C)([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3]+[5A6])(A,C)([bnn]+[bP])}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6090, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '60. Nucleotide of mixed DNA base % with ambiguous alternative sugar and alternative phosphate - ([25moe3],[5A6])(A+C+G+T)P',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3],[5A6])(A+C+G+T)P}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6169',
  },
  {
    monomerDescription:
      '61. Nucleotide of mixed DNA base % with ambiguous alternative sugar and alternative phosphate - ([25moe3],[5A6])(A+C+G+T)([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3],[5A6])(A+C+G+T)([bnn],[bP])}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6169',
  },
  {
    monomerDescription:
      '62. Nucleotide of mixed DNA base % with ambiguous mixed sugar and phosphate P - ([25moe3]+[5A6])(A+C+G+T)P',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3]+[5A6])(A+C+G+T)P}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6169',
  },
  {
    monomerDescription:
      '63. Nucleotide of mixed DNA base % with ambiguous mixed sugar and alternative phosphate - ([25moe3]+[5A6])(A+C+G+T)([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3]+[5A6])(A+C+G+T)([bnn],[bP])}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6169',
  },
  {
    monomerDescription:
      '64. Nucleotide of mixed DNA base % with ambiguous alternative sugar and mixed phosphate - ([25moe3],[5A6])(A+C+G+T)([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3],[5A6])(A+C+G+T)([bnn]+[bP])}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6169',
  },
  {
    monomerDescription:
      '65. Nucleotide of mixed DNA base % with ambiguous mixed sugar and mixed phosphate - ([25moe3]+[5A6])(A+C+G+T)([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3]+[5A6])(A+C+G+T)([bnn]+[bP])}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6169',
  },
  {
    monomerDescription:
      '66. Nucleotide of mixed RNA base % with ambiguous alternative sugar and phosphate P - ([25moe3],[5A6])(A+C+G+U)P',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3],[5A6])(A+C+G+U)P}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6169',
  },
  {
    monomerDescription:
      '67. Nucleotide of mixed RNA base % with ambiguous alternative sugar and alternative phosphate - ([25moe3],[5A6])(A+C+G+U)([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3],[5A6])(A+C+G+U)([bnn],[bP])}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6169',
  },
  {
    monomerDescription:
      '68. Nucleotide of mixed RNA base % with ambiguous mixed sugar and phosphate P - ([25moe3]+[5A6])(A+C+G+U)P',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3]+[5A6])(A+C+G+U)P}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6169',
  },
  {
    monomerDescription:
      '69. Nucleotide of mixed RNA base % with ambiguous mixed sugar and alternative phosphate - ([25moe3]+[5A6])(A+C+G+U)([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3]+[5A6])(A+C+G+U)([bnn],[bP])}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6169',
  },
  {
    monomerDescription:
      '70. Nucleotide of mixed RNA base % with ambiguous alternative sugar and mixed phosphate - ([25moe3],[5A6])(A+C+G+U)([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3],[5A6])(A+C+G+U)([bnn]+[bP])}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6169',
  },
  {
    monomerDescription:
      '71. Nucleotide of mixed RNA base % with ambiguous mixed sugar and mixed phosphate - ([25moe3]+[5A6])(A+C+G+U)([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3]+[5A6])(A+C+G+U)([bnn]+[bP])}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6169',
  },
  {
    monomerDescription:
      '72. Nucleotide of mixed base % with ambiguous alternative sugar and phosphate P - ([25moe3],[5A6])(A+C)P',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3],[5A6])(A+C)P}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6169',
  },
  {
    monomerDescription:
      '73. Nucleotide of mixed base % with ambiguous alternative sugar and alternative phosphate - ([25moe3],[5A6])(A+C)([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3],[5A6])(A+C)([bnn],[bP])}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6169',
  },
  {
    monomerDescription:
      '74. Nucleotide of mixed base % with ambiguous mixed sugar and phosphate P - ([25moe3]+[5A6])(A+C)P',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3]+[5A6])(A+C)([bnn],[bP])}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6169',
  },
  {
    monomerDescription:
      '75. Nucleotide of mixed base % with ambiguous mixed sugar and alternative phosphate - ([25moe3]+[5A6])(A+C)([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3]+[5A6])(A+C)([bnn],[bP])}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6169',
  },
  {
    monomerDescription:
      '76. Nucleotide of mixed base % with ambiguous alternative sugar and mixed phosphate - ([25moe3],[5A6])(A+C)([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3],[5A6])(A+C)([bnn]+[bP])}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6169',
  },
  {
    monomerDescription:
      '77. Nucleotide of mixed base % with ambiguous mixed sugar and mixed phosphate - ([25moe3]+[5A6])(A+C)([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3]+[5A6])(A+C)([bnn]+[bP])}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6169',
  },
];

for (const monomer of monomers.filter((m) => m.eligibleForAntisense)) {
  test(`1. Create antisense chain for: ${monomer.monomerDescription}`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/6134
     * Description: Validate that selecting a valid backbone with the correct R1-R2 connections and right-clicking displays the "Create
     *             Antisense Strand" option (Requirement 1) and creation of antisense is possible
     * Case:
     *       1. Load correct monomer from HELM or KET
     *       2. Select it (using Control+A)
     *       3. Call context menu for monomer and click "Create Antisense Strand" option
     *       4. Take screenshot to validate Antisense creation
     */
    test.setTimeout(20000);
    // Test should be skipped if related bug exists
    test.fixme(
      monomer.shouldFail === true,
      `That test fails because of ${monomer.issueNumber} issue(s).`,
    );

    await loadMonomerOnCanvas(page, monomer, monomer.pageReloadNeeded);

    await selectAllStructuresOnCanvas(page);
    await callContextMenuForMonomer(page, monomer.monomerLocatorIndex);

    const createAntisenseStrandOption = page
      .getByTestId('create_antisense_chain')
      .first();

    // Checking presence of Create Antisense Strand option on the context menu and enabled
    await expect(createAntisenseStrandOption).toHaveCount(1);
    await expect(createAntisenseStrandOption).toHaveAttribute(
      'aria-disabled',
      'false',
    );

    await createAntisenseStrandOption.click();
    await takeEditorScreenshot(page);
  });
}

for (const monomer of monomers.filter(
  (m) => m.baseWithR3R1ConnectionPresent && !m.eligibleForAntisense,
)) {
  test(`2. Check that Create Antisense Strand option disabled for not a sense base: ${monomer.monomerDescription}`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/6134
     * Description: Ensure that the "Create Antisense Strand" option appears but is disabled
     *              when the base connected via R3-R1 is not a sense base
     * Case:
     *       1. Load correct monomer from HELM or KET
     *       2. Select it (using Control+A)
     *       3. Call context menu for monomer
     *       4. Check that "Create Antisense Strand" option present but disabled
     */
    test.setTimeout(20000);
    // Test should be skipped if related bug exists
    test.fixme(
      monomer.shouldFail === true,
      `That test fails because of ${monomer.issueNumber} issue(s).`,
    );
    await loadMonomerOnCanvas(page, monomer, monomer.pageReloadNeeded);

    await selectAllStructuresOnCanvas(page);
    await callContextMenuForMonomer(page, monomer.monomerLocatorIndex);

    const createAntisenseStrandOption = page
      .getByTestId('create_antisense_chain')
      .first();
    const createAntisenseStrandOptionPresent =
      (await createAntisenseStrandOption.count()) > 0;
    // Checking presence of Create Antisense Strand option on the context menu and its disabled state
    await expect(createAntisenseStrandOptionPresent).toBeTruthy();
    if (createAntisenseStrandOptionPresent) {
      await expect(createAntisenseStrandOption).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    }
  });
}

const chainWithExtraBondToBase: IMonomer[] = [
  {
    monomerDescription:
      '1. Nucleoside of sugar R, base that have extra covalent bond - R([nC6n8A])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription:
      '2. Nucleoside of sugar R, ambiguous alternative base that have extra covalent bond - R([nC6n8A],[nC6n5C])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A],[nC6n5C])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6088',
  },
  {
    monomerDescription:
      '3. Nucleoside of sugar R, ambiguous mixed base that have extra covalent bond - R([nC6n8A]+[nC6n5C])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A]+[nC6n5C])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6088',
  },
  {
    monomerDescription:
      '4. Nucleoside of sugar R, base that have extra covalent bond - R([nC6n8A])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription:
      '5. Nucleoside of sugar R, ambiguous alternative base that have extra covalent bond - R([nC6n8A],[nC6n5C])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A],[nC6n5C])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6088',
  },
  {
    monomerDescription:
      '6. Nucleoside of sugar R, ambiguous mixed base that have extra covalent bond - R([nC6n8A]+[nC6n5C])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A]+[nC6n5C])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6088',
  },
  {
    monomerDescription:
      '7. Nucleoside of sugar R, base that have extra covalent bond - R([nC6n8A])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription:
      '8. Nucleoside of sugar R, ambiguous alternative base that have extra covalent bond - R([nC6n8A],[nC6n5C])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A],[nC6n5C])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6088',
  },
  {
    monomerDescription:
      '9. Nucleoside of sugar R, ambiguous mixed base that have extra covalent bond - R([nC6n8A]+[nC6n5C])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A]+[nC6n5C])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6088',
  },
  {
    monomerDescription:
      '10. Nucleoside of sugar R, base that have extra covalent bond - R([nC6n8A])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription:
      '11. Nucleoside of sugar R, ambiguous alternative base that have extra covalent bond - R([nC6n8A],[nC6n5C])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A],[nC6n5C])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6088',
  },
  {
    monomerDescription:
      '12. Nucleoside of sugar R, ambiguous mixed base that have extra covalent bond - R([nC6n8A]+[nC6n5C])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A]+[nC6n5C])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6088',
  },
  {
    monomerDescription:
      '13. Nucleotide of ambiguous mixed sugar, ambiguous mixed base that have extra covalent bond and ambiguous alternative phopsphate - ([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn],[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '14. Nucleotide of ambiguous mixed sugar, base that have extra covalent bond and ambiguous mixed phopsphate - ([25moe3]+[5A6])([nC6n8A])([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A])([bnn]+[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '15. Nucleotide of ambiguous mixed sugar, base that have extra covalent bond and ambiguous alternative phopsphate - ([25moe3]+[5A6])([nC6n8A])([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A])([bnn],[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '16. Nucleotide of ambiguous mixed sugar, ambiguous alternative base that have extra covalent bond and ambiguous mixed phopsphate - ([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn]+[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '17. Nucleotide of ambiguous mixed sugar, ambiguous alternative base that have extra covalent bond and ambiguous alternative phopsphate - ([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn],[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '18. Nucleotide of ambiguous mixed sugar, ambiguous mixed base that have extra covalent bond and ambiguous mixed phopsphate - ([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn]+[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '19. Nucleotide of ambiguous mixed sugar, ambiguous mixed base that have extra covalent bond and ambiguous alternative phopsphate - ([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn],[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '20. Nucleotide of ambiguous mixed sugar, base that have extra covalent bond and ambiguous mixed phopsphate - ([25moe3]+[5A6])([nC6n8A])([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A])([bnn]+[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '21. Nucleotide of ambiguous mixed sugar, base that have extra covalent bond and ambiguous alternative phopsphate - ([25moe3]+[5A6])([nC6n8A])([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A])([bnn],[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '22. Nucleotide of ambiguous mixed sugar, ambiguous alternative base that have extra covalent bond and ambiguous mixed phopsphate - ([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn]+[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '23. Nucleotide of ambiguous mixed sugar, ambiguous alternative base that have extra covalent bond and ambiguous alternative phopsphate - ([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn],[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '24. Nucleotide of ambiguous mixed sugar, ambiguous mixed base that have extra covalent bond and ambiguous mixed phopsphate - ([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn]+[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '25. Nucleotide of ambiguous mixed sugar, ambiguous mixed base that have extra covalent bond and ambiguous alternative phopsphate - ([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn],[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '26. Nucleotide of ambiguous mixed sugar, base that have extra covalent bond and ambiguous mixed phopsphate - ([25moe3]+[5A6])([nC6n8A])([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A])([bnn]+[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '27. Nucleotide of ambiguous mixed sugar, base that have extra covalent bond and ambiguous alternative phopsphate - ([25moe3]+[5A6])([nC6n8A])([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A])([bnn],[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '28. Nucleotide of ambiguous mixed sugar, ambiguous alternative base that have extra covalent bond and ambiguous mixed phopsphate - ([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn]+[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '29. Nucleotide of ambiguous mixed sugar, ambiguous alternative base that have extra covalent bond and ambiguous alternative phopsphate - ([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn],[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '30. Nucleotide of ambiguous mixed sugar, ambiguous mixed base that have extra covalent bond and ambiguous mixed phopsphate - ([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn]+[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '31. Nucleotide of ambiguous mixed sugar, ambiguous mixed base that have extra covalent bond and ambiguous alternative phopsphate - ([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn],[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '32. Nucleotide of ambiguous mixed sugar, base that have extra covalent bond and ambiguous mixed phopsphate - ([25moe3]+[5A6])([nC6n8A])([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A])([bnn]+[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '33. Nucleotide of ambiguous mixed sugar, base that have extra covalent bond and ambiguous alternative phopsphate - ([25moe3]+[5A6])([nC6n8A])([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A])([bnn],[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '34. Nucleotide of ambiguous mixed sugar, ambiguous alternative base that have extra covalent bond and ambiguous mixed phopsphate - ([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn]+[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '35. Nucleotide of ambiguous mixed sugar, ambiguous alternative base that have extra covalent bond and ambiguous alternative phopsphate - ([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn],[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '36. Nucleotide of ambiguous mixed sugar, ambiguous mixed base that have extra covalent bond and ambiguous mixed phopsphate - ([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn]+[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '37. Nucleotide of ambiguous alternative sugar, ambiguous alternative base that have extra covalent bond and phopsphate P- ([25moe3],[5A6])([nC6n8A],[nC6n5C])P',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3],[5A6])([nC6n8A],[nC6n5C])P}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '38. Nucleotide of ambiguous alternative sugar, ambiguous mixed base that have extra covalent bond and phopsphate P- ([25moe3],[5A6])([nC6n8A]+[nC6n5C])P',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3],[5A6])([nC6n8A]+[nC6n5C])P}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '39. Nucleotide of ambiguous alternative sugar, base that have extra covalent bond and phopsphate P- ([25moe3],[5A6])([nC6n8A])P',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3],[5A6])([nC6n8A])P}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '40. Nucleotide of ambiguous alternative sugar, ambiguous alternative base that have extra covalent bond and phopsphate P- ([25moe3],[5A6])([nC6n8A],[nC6n5C])P',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3],[5A6])([nC6n8A],[nC6n5C])P}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '41. Nucleotide of ambiguous alternative sugar, ambiguous mixed base that have extra covalent bond and phopsphate P- ([25moe3],[5A6])([nC6n8A]+[nC6n5C])P',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3],[5A6])([nC6n8A]+[nC6n5C])P}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '42. Nucleotide of ambiguous alternative sugar, base that have extra covalent bond and phopsphate P- ([25moe3],[5A6])([nC6n8A])P',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3],[5A6])([nC6n8A])P}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '43. Nucleotide of ambiguous alternative sugar, ambiguous alternative base that have extra covalent bond and phopsphate P- ([25moe3],[5A6])([nC6n8A],[nC6n5C])P',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3],[5A6])([nC6n8A],[nC6n5C])P}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '44. Nucleotide of ambiguous alternative sugar, ambiguous mixed base that have extra covalent bond and phopsphate P- ([25moe3],[5A6])([nC6n8A]+[nC6n5C])P',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3],[5A6])([nC6n8A]+[nC6n5C])P}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '45. Nucleotide of ambiguous alternative sugar, base that have extra covalent bond and phopsphate P- ([25moe3],[5A6])([nC6n8A])P',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3],[5A6])([nC6n8A])P}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '46. Nucleotide of ambiguous alternative sugar, ambiguous alternative base that have extra covalent bond and phopsphate P- ([25moe3],[5A6])([nC6n8A],[nC6n5C])P',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3],[5A6])([nC6n8A],[nC6n5C])P}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '47. Nucleotide of ambiguous alternative sugar, ambiguous mixed base that have extra covalent bond and phopsphate P- ([25moe3],[5A6])([nC6n8A]+[nC6n5C])P',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3],[5A6])([nC6n8A]+[nC6n5C])P}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '48. Nucleotide of ambiguous alternative sugar, base that have extra covalent bond and phopsphate P- ([25moe3],[5A6])([nC6n8A])P',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3],[5A6])([nC6n8A])P}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '49. Nucleoside of sugar R, base that have extra hydrogen bond - R([nC6n8A])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription:
      '50. Nucleoside of sugar R, ambiguous alternative base that have extra hydrogen bond - R([nC6n8A],[nC6n5C])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A],[nC6n5C])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6088',
  },
  {
    monomerDescription:
      '51. Nucleoside of sugar R, ambiguous mixed base that have extra hydrogen bond - R([nC6n8A]+[nC6n5C])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A]+[nC6n5C])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6088',
  },
  {
    monomerDescription:
      '52. Nucleoside of sugar R, base that have extra hydrogen bond - R([nC6n8A])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription:
      '53. Nucleoside of sugar R, ambiguous alternative base that have extra hydrogen bond - R([nC6n8A],[nC6n5C])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A],[nC6n5C])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6088',
  },
  {
    monomerDescription:
      '54. Nucleoside of sugar R, ambiguous mixed base that have extra hydrogen bond - R([nC6n8A]+[nC6n5C])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A]+[nC6n5C])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6088',
  },
  {
    monomerDescription:
      '55. Nucleoside of sugar R, base that have extra hydrogen bond - R([nC6n8A])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription:
      '56. Nucleoside of sugar R, ambiguous alternative base that have extra hydrogen bond - R([nC6n8A],[nC6n5C])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A],[nC6n5C])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6088',
  },
  {
    monomerDescription:
      '57. Nucleoside of sugar R, ambiguous mixed base that have extra hydrogen bond - R([nC6n8A]+[nC6n5C])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A]+[nC6n5C])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6088',
  },
  {
    monomerDescription:
      '58. Nucleoside of sugar R, base that have extra hydrogen bond - R([nC6n8A])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription:
      '59. Nucleoside of sugar R, ambiguous alternative base that have extra hydrogen bond - R([nC6n8A],[nC6n5C])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A],[nC6n5C])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6088',
  },
  {
    monomerDescription:
      '60. Nucleoside of sugar R, ambiguous mixed base that have extra hydrogen bond - R([nC6n8A]+[nC6n5C])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A]+[nC6n5C])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6088',
  },
  {
    monomerDescription:
      '61. Nucleotide of ambiguous mixed sugar, ambiguous mixed base that have extra hydrogen bond and ambiguous alternative phopsphate - ([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn],[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '62. Nucleotide of ambiguous mixed sugar, base that have extra hydrogen bond and ambiguous mixed phopsphate - ([25moe3]+[5A6])([nC6n8A])([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A])([bnn]+[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '63. Nucleotide of ambiguous mixed sugar, base that have extra hydrogen bond and ambiguous alternative phopsphate - ([25moe3]+[5A6])([nC6n8A])([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A])([bnn],[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '64. Nucleotide of ambiguous mixed sugar, ambiguous alternative base that have extra hydrogen bond and ambiguous mixed phopsphate - ([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn]+[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '65. Nucleotide of ambiguous mixed sugar, ambiguous alternative base that have extra hydrogen bond and ambiguous alternative phopsphate - ([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn],[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '66. Nucleotide of ambiguous mixed sugar, ambiguous mixed base that have extra hydrogen bond and ambiguous mixed phopsphate - ([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn]+[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '67. Nucleotide of ambiguous mixed sugar, ambiguous mixed base that have extra hydrogen bond and ambiguous alternative phopsphate - ([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn],[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6088',
  },
  {
    monomerDescription:
      '68. Nucleotide of ambiguous mixed sugar, base that have extra hydrogen bond and ambiguous mixed phopsphate - ([25moe3]+[5A6])([nC6n8A])([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A])([bnn]+[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '69. Nucleotide of ambiguous mixed sugar, base that have extra hydrogen bond and ambiguous alternative phopsphate - ([25moe3]+[5A6])([nC6n8A])([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A])([bnn],[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '70. Nucleotide of ambiguous mixed sugar, ambiguous alternative base that have extra hydrogen bond and ambiguous mixed phopsphate - ([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn]+[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '71. Nucleotide of ambiguous mixed sugar, ambiguous alternative base that have extra hydrogen bond and ambiguous alternative phopsphate - ([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn],[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '72. Nucleotide of ambiguous mixed sugar, ambiguous mixed base that have extra hydrogen bond and ambiguous mixed phopsphate - ([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn]+[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '73. Nucleotide of ambiguous mixed sugar, ambiguous mixed base that have extra hydrogen bond and ambiguous alternative phopsphate - ([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn],[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '74. Nucleotide of ambiguous mixed sugar, base that have extra hydrogen bond and ambiguous mixed phopsphate - ([25moe3]+[5A6])([nC6n8A])([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A])([bnn]+[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '75. Nucleotide of ambiguous mixed sugar, base that have extra hydrogen bond and ambiguous alternative phopsphate - ([25moe3]+[5A6])([nC6n8A])([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A])([bnn],[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '76. Nucleotide of ambiguous mixed sugar, ambiguous alternative base that have extra hydrogen bond and ambiguous mixed phopsphate - ([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn]+[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '77. Nucleotide of ambiguous mixed sugar, ambiguous alternative base that have extra hydrogen bond and ambiguous alternative phopsphate - ([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn],[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '78. Nucleotide of ambiguous mixed sugar, ambiguous mixed base that have extra hydrogen bond and ambiguous mixed phopsphate - ([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn]+[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '79. Nucleotide of ambiguous mixed sugar, ambiguous mixed base that have extra hydrogen bond and ambiguous alternative phopsphate - ([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn],[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '80. Nucleotide of ambiguous mixed sugar, base that have extra hydrogen bond and ambiguous mixed phopsphate - ([25moe3]+[5A6])([nC6n8A])([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A])([bnn]+[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '81. Nucleotide of ambiguous mixed sugar, base that have extra hydrogen bond and ambiguous alternative phopsphate - ([25moe3]+[5A6])([nC6n8A])([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A])([bnn],[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '82. Nucleotide of ambiguous mixed sugar, ambiguous alternative base that have extra hydrogen bond and ambiguous mixed phopsphate - ([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn]+[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '83. Nucleotide of ambiguous mixed sugar, ambiguous alternative base that have extra hydrogen bond and ambiguous alternative phopsphate - ([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A],[nC6n5C])([bnn],[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '84. Nucleotide of ambiguous mixed sugar, ambiguous mixed base that have extra hydrogen bond and ambiguous mixed phopsphate - ([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn]+[bP])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3]+[5A6])([nC6n8A]+[nC6n5C])([bnn]+[bP])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '85. Nucleotide of ambiguous alternative sugar, ambiguous alternative base that have extra hydrogen bond and phopsphate P- ([25moe3],[5A6])([nC6n8A],[nC6n5C])P',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3],[5A6])([nC6n8A],[nC6n5C])P}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '86. Nucleotide of ambiguous alternative sugar, ambiguous mixed base that have extra hydrogen bond and phopsphate P- ([25moe3],[5A6])([nC6n8A]+[nC6n5C])P',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3],[5A6])([nC6n8A]+[nC6n5C])P}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '87. Nucleotide of ambiguous alternative sugar, base that have extra hydrogen bond and phopsphate P- ([25moe3],[5A6])([nC6n8A])P',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3],[5A6])([nC6n8A])P}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '88. Nucleotide of ambiguous alternative sugar, ambiguous alternative base that have extra hydrogen bond and phopsphate P- ([25moe3],[5A6])([nC6n8A],[nC6n5C])P',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3],[5A6])([nC6n8A],[nC6n5C])P}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6088',
  },
  {
    monomerDescription:
      '89. Nucleotide of ambiguous alternative sugar, ambiguous mixed base that have extra hydrogen bond and phopsphate P- ([25moe3],[5A6])([nC6n8A]+[nC6n5C])P',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3],[5A6])([nC6n8A]+[nC6n5C])P}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '90. Nucleotide of ambiguous alternative sugar, base that have extra hydrogen bond and phopsphate P- ([25moe3],[5A6])([nC6n8A])P',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3],[5A6])([nC6n8A])P}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '91. Nucleotide of ambiguous alternative sugar, ambiguous alternative base that have extra hydrogen bond and phopsphate P- ([25moe3],[5A6])([nC6n8A],[nC6n5C])P',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3],[5A6])([nC6n8A],[nC6n5C])P}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6088',
  },
  {
    monomerDescription:
      '92. Nucleotide of ambiguous alternative sugar, ambiguous mixed base that have extra hydrogen bond and phopsphate P- ([25moe3],[5A6])([nC6n8A]+[nC6n5C])P',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3],[5A6])([nC6n8A]+[nC6n5C])P}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/6088, https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '93. Nucleotide of ambiguous alternative sugar, base that have extra hydrogen bond and phopsphate P- ([25moe3],[5A6])([nC6n8A])P',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3],[5A6])([nC6n8A])P}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '94. Nucleotide of ambiguous alternative sugar, ambiguous alternative base that have extra hydrogen bond and phopsphate P- ([25moe3],[5A6])([nC6n8A],[nC6n5C])P',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3],[5A6])([nC6n8A],[nC6n5C])P}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
  {
    monomerDescription:
      '95. Nucleotide of ambiguous alternative sugar, ambiguous mixed base that have extra hydrogen bond and phopsphate P- ([25moe3],[5A6])([nC6n8A]+[nC6n5C])P',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3],[5A6])([nC6n8A]+[nC6n5C])P}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6088',
  },
  {
    monomerDescription:
      '96. Nucleotide of ambiguous alternative sugar, base that have extra hydrogen bond and phopsphate P- ([25moe3],[5A6])([nC6n8A])P',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{([25moe3],[5A6])([nC6n8A])P}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6091',
  },
];

for (const chain of chainWithExtraBondToBase) {
  test(`3. Check that Create Antisense Strand option disabled for: ${chain.monomerDescription}`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/6134
     * Description: Check if any of the bases connected to the sugars via R3-R1 have more bonds (hydrogen or covalent),
     *              the "Create Antisense Strand" option appear, but disabled
     * Case:
     *       1. Load correct monomer (with not antisense base) from HELM
     *       2. Select it (using Control+A)
     *       3. Call context menu for monomer
     *       4. Check that "Create Antisense Strand" option present but disabled
     */
    test.setTimeout(20000);
    // Test should be skipped if related bug exists
    test.fixme(
      chain.shouldFail === true,
      `That test fails because of ${chain.issueNumber} issue(s).`,
    );
    await loadMonomerOnCanvas(page, chain, chain.pageReloadNeeded);

    await selectAllStructuresOnCanvas(page);
    await callContextMenuForMonomer(page, chain.monomerLocatorIndex);

    const createAntisenseStrandOption = page
      .getByTestId('create_antisense_chain')
      .first();
    const createAntisenseStrandOptionPresent =
      (await createAntisenseStrandOption.count()) > 0;
    // Checking presence of Create Antisense Strand option on the context menu and its disabled state
    await expect(createAntisenseStrandOptionPresent).toBeTruthy();
    if (createAntisenseStrandOptionPresent) {
      await expect(createAntisenseStrandOption).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    }
  });
}

const shortMonomerList: IMonomer[] = [
  {
    monomerDescription: '1. Peptide A (from library)',
    contentType: MacroFileType.HELM,
    HELMString: 'PEPTIDE1{A}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '2. Ambiguous peptide X (alternatives, from library)',
    contentType: MacroFileType.HELM,
    HELMString:
      'PEPTIDE1{(A,C,D,E,F,G,H,I,K,L,M,N,O,P,Q,R,S,T,U,V,W,Y)}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '3. Sugar R (from library)',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '4. Base A (from library)',
    contentType: MacroFileType.Ket,
    KETFile: 'KET/Antisense-Chains/8. Base A (from library).ket',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '5. Ambiguous DNA Base N (alternatives, from library)',
    contentType: MacroFileType.Ket,
    KETFile:
      'KET/Antisense-Chains/9. Ambiguous DNA Base N (alternatives, from library).ket',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '6. Phosphate P (from library)',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{P}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '7. Unsplit monomer 2-damdA (from library)',
    contentType: MacroFileType.Ket,
    KETFile:
      'KET/Antisense-Chains/18. Unsplit monomer 2-damdA (from library).ket',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '8. Unknown monomer',
    contentType: MacroFileType.Ket,
    KETFile: 'KET/Antisense-Chains/19. Unknown monomer.ket',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '9. CHEM 4aPEGMal (from library)',
    contentType: MacroFileType.HELM,
    HELMString: 'CHEM1{[4aPEGMal]}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '10. Nucleoside - R(A)',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A)}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '11. Nucleotide A - R(A)P',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A)P}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription:
      '12. Nucleotide of DNA base N with sugar R and phosphate P - R(A,C,G,T)P',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A,C,G,T)P}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription:
      '13. Nucleoside of sugar R, base that have extra covalent bond - R([nC6n8A])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription:
      '14. Nucleoside of sugar R, base that have extra covalent bond and phosphate P - R([nC6n8A])P',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A])P}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription:
      '15. Nucleoside of sugar R, base that have extra hydrogen bond - R([nC6n8A])',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription:
      '16. Nucleoside of sugar R, base that have extra hydrogen bond and phosphate P - R([nC6n8A])P',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A])P}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
];

for (const monomer1 of shortMonomerList) {
  for (const monomer2 of shortMonomerList) {
    test(`4. Antisence for two chains: ${monomer1.monomerDescription} and ${monomer2.monomerDescription}`, async () => {
      /*
       * Test task: https://github.com/epam/ketcher/issues/6134
       * Description: Check if multiple chains are selected and more than one satisfies the previous requirements(Requirement 1.2),
       *              the "Create Antisense Strand" option appear, multiple antisense chains are created
       * Case:
       *       1. Load two correct monomers from HELM
       *       2. Select it (using Control+A)
       *       3. Call context menu for monomer and click "Create Antisense Strand" option
       *       4. Take screenshot to validate Antisense creation
       */
      test.setTimeout(20000);
      // Test should be skipped if related bug exists
      test.fixme(
        monomer1.shouldFail === true || monomer2.shouldFail === true,
        `That test fails because of ${monomer1.issueNumber} ${monomer2.issueNumber} issue(s).`,
      );
      await loadMonomerOnCanvas(
        page,
        monomer1,
        monomer1.pageReloadNeeded || monomer2.pageReloadNeeded,
      );
      await loadMonomerOnCanvas(page, monomer2);

      await selectAllStructuresOnCanvas(page);
      await callContextMenuForMonomer(page, monomer1.monomerLocatorIndex);

      const createAntisenseStrandOption = page
        .getByTestId('create_antisense_chain')
        .first();

      if (
        (monomer1.eligibleForAntisense &&
          monomer1.baseWithR3R1ConnectionPresent &&
          monomer2.eligibleForAntisense &&
          monomer2.baseWithR3R1ConnectionPresent) ||
        (monomer1.eligibleForAntisense &&
          monomer1.baseWithR3R1ConnectionPresent &&
          !monomer2.eligibleForAntisense &&
          !monomer2.baseWithR3R1ConnectionPresent) ||
        (!monomer1.eligibleForAntisense &&
          !monomer1.baseWithR3R1ConnectionPresent &&
          monomer2.eligibleForAntisense &&
          monomer2.baseWithR3R1ConnectionPresent)
      ) {
        // Checking presence of Create Antisense Strand option on the context menu and enabled
        await expect(createAntisenseStrandOption).toHaveCount(1);
        await expect(createAntisenseStrandOption).toHaveAttribute(
          'aria-disabled',
          'false',
        );

        await createAntisenseStrandOption.click();
        await takeEditorScreenshot(page);
      } else if (
        monomer1.baseWithR3R1ConnectionPresent ||
        monomer2.baseWithR3R1ConnectionPresent
      ) {
        const createAntisenseStrandOptionPresent =
          (await createAntisenseStrandOption.count()) > 0;
        // Checking presence of Create Antisense Strand option on the context menu and its disabled state
        await expect(createAntisenseStrandOptionPresent).toBeTruthy();
        if (createAntisenseStrandOptionPresent) {
          await expect(createAntisenseStrandOption).toHaveAttribute(
            'aria-disabled',
            'true',
          );
        }
      }
    });
  }
}

const chainWithAllTypeOfConnections: IMonomer[] = [
  {
    monomerDescription:
      'All type of monomers connected to R1, R2, R3, R4 attachment points',
    contentType: MacroFileType.Ket,
    KETFile:
      'KET/Antisense-Chains/Check that all non R1-R2 connections of backbone monomers (except R3-R1 for sugar and base!!!) are ignored.ket',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
];

test(`5. Check that all non R1-R2 connections of backbone monomers (except R3-R1 for sugar and base!!!) are ignored`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6134
   * Description: Check that all non R1-R2 connections of backbone monomers (except R3-R1 for sugar and base!!!) are ignored
   * Case:
   *       1. Load chain with all type of monomers connected to R1, R2, R3, R4 attachment points
   *       2. Select it (using Control+A)
   *       3. Call context menu for monomer and click "Create Antisense Strand" option
   *       4. Take screenshot to validate Antisense creation and that all monomers connected via non-R1-R2 are ignored
   */
  test.setTimeout(20000);

  const chain = chainWithAllTypeOfConnections[0];
  await loadMonomerOnCanvas(page, chain, chain.pageReloadNeeded);

  await selectAllStructuresOnCanvas(page);
  await callContextMenuForMonomer(page, chain.monomerLocatorIndex);

  const createAntisenseStrandOption = page
    .getByTestId('create_antisense_chain')
    .first();

  // Checking presence of Create Antisense Strand option on the context menu and enabled
  await expect(createAntisenseStrandOption).toHaveCount(1);
  await expect(createAntisenseStrandOption).toHaveAttribute(
    'aria-disabled',
    'false',
  );

  await createAntisenseStrandOption.click();
  await takeEditorScreenshot(page);
});

const chainOfNucleotidesWithAllTypesOfPhosphateAndSugar: IMonomer[] = [
  {
    monomerDescription: 'All type of sugars and phosphates in one chain',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{[25d3r]([4ime6A])[bP].[25mo3r]([az8A])[cm].[25moe3]([baA])[cmp].[25R]([br8A])[co].[3A6]([c3A])[fl2me].[4sR]([c7io7A])' +
      '[gly].[5A6]([c7io7n])[hn].[ana]([meA])[Ssp].[Am2d]([m2A])[Smp].[ALtri2]([io2A])[s2p].[ALtri1]([imprn2])[Rsp].[ALmecl]([impr6n])[Rmp].' +
      '[allyl2]([fl2A])[prn].[aFR]([eaA])[P-].[afl2Nm]([e6A])[oxy].[afhna]([dabA])[nen].[Ae2d]([daA])[msp].[acn4d]([cyp6A])[mp].' +
      '[5S6Sm5]([cyh6A])[moen].[5S6Rm5]([cpmA])[mn].[5R6Sm5]([clA])[mepo2].[5R6Rm5]([cl8A])[me].[5formD]([cl2cyp])[m2np].[aoe2r]([mo2A])[en].' +
      '[aR]([moprn2])[sP].[bcdna]([ms2A])[eop].[Bcm2r]([n2A])[sP-]}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
];

test(`6. Check that every nucleotide (sugar and phosphate are part of the backbone and connected via R2(s)-R1(p), and the sugar is connected to a "sense base" via R3(s)-R1(b)) transform into a nucleotide on the antisense chain that contains ribose (R), phosphate (P), and the appropriate "antisense base"`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6134
   * Description: Check that every nucleotide (sugar and phosphate are part of the backbone and connected via R2(s)-R1(p),
   *              and the sugar is connected to a "sense base" via R3(s)-R1(b)) transform into a nucleotide on the antisense
   *              chain that contains ribose (R), phosphate (P), and the appropriate "antisense base"
   * Case:
   *       1. Load chain with all type of phosphates and sugars
   *       2. Select it (using Control+A)
   *       3. Call context menu for monomer and click "Create Antisense Strand" option
   *       4. Take screenshot to validate Antisense creation and that all sugars and phosphates converted to R and P
   */
  test.setTimeout(20000);

  const chain = chainOfNucleotidesWithAllTypesOfPhosphateAndSugar[0];
  await loadMonomerOnCanvas(page, chain, chain.pageReloadNeeded);

  await selectAllStructuresOnCanvas(page);
  await callContextMenuForMonomer(page, chain.monomerLocatorIndex);

  const createAntisenseStrandOption = page
    .getByTestId('create_antisense_chain')
    .first();

  // Checking presence of Create Antisense Strand option on the context menu and enabled
  await expect(createAntisenseStrandOption).toHaveCount(1);
  await expect(createAntisenseStrandOption).toHaveAttribute(
    'aria-disabled',
    'false',
  );

  await createAntisenseStrandOption.click();
  for (let i = 0; i < 4; i++) await ZoomOutByKeyboard(page);
  await takeEditorScreenshot(page);
  await resetZoomLevelToDefault(page);
});

const chainOfNucleosidesWithAllTypesOfSugar: IMonomer[] = [
  {
    monomerDescription: 'Nucleosides with all type of sugars in one chain',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{[Bcm3d]([n8A])}|RNA2{[Bcm3r]([nC6n8A])}|RNA3{[Bcoh4d]([nen2A])}|RNA4{[bn2r]([o8A])}|RNA5{[bnanc]([phen2A])}|' +
      'RNA6{[bnancm]([z8A])}|RNA7{[bnoe2r]([5meC])}|RNA8{[bu2r]([ac4C])}|RNA9{[c4d]([br5C])}|RNA10{[c4m]([cdaC])}|RNA11{[C52r]([cl5C])}|' +
      'RNA12{[C92r]([cpC])}|RNA13{[cena]([ethy5C])}|RNA14{[cet]([fl3mC])}|RNA15{[ciPr]([fl5C])}|RNA16{[clhna]([form5C])}|RNA17{[d5m]([gclamp])}|' +
      'RNA18{[d5moe]([ggclam])}|RNA19{[dhp]([hm5C])}|RNA20{[Dlyspn]([m4C])}|RNA21{[dmac]([nC65C])}|RNA22{[dmaeac]([nC6n5C])}|' +
      'RNA23{[dmaeoe]([npry5C])}|RNA24{[dmaoe]([oC64m5])}|RNA25{[dR]([oh4C])}|RNA26{[e2noe2]([oh5C])}|RNA27{[e2r]([prpC])}|' +
      'RNA28{[eom2r]([s2C])}|RNA29{[eR]([tCnitr])}|RNA30{[fcena]([tCo])}|RNA31{[fhna]([thiz5C])}|RNA32{[fl2Nmc]([z5C])}|' +
      'RNA33{[fl3e2r]([4imen2])}|RNA34{[fl3pr2]([allyl9])}|RNA35{[fl5pr2]([br8G])}|RNA36{[fle2r]([c3ally])}|RNA37{[fleana]([c3G])}|' +
      'RNA38{[FMOE]([c7G])}|RNA39{[fR]([c7io7G])}|RNA40{[GalNAc]([cl6G])}|RNA41{[guane2]([impr2G])}|RNA42{[hx]([isoG])}|RNA43{[imbu2r]([m1G])}|' +
      'RNA44{[ime2r]([m22G])}|RNA45{[ipr2r]([m2G])}|RNA46{[iprmno]([m6G])}|RNA47{[Ld]([m7G])}|RNA48{[Liprgl]([m7h8G])}|RNA49{[lLR]([ms6G])}|' +
      'RNA50{[Llyspn]([n8G])}|RNA51{[LR]([nC6n2G])}|RNA52{[m2e2r]([nen2G])}|RNA53{[m2nc2r]([npr2G])}|RNA54{[m2nenc]([o8G])}|' +
      'RNA55{[m2npr2]([o8s9G])}|RNA56{[m3ALln]([s6G])}|RNA57{[m3ana]([s8G])}|RNA58{[m5d]([z7G])}|RNA59{[m5m]([z8c3G])}|RNA60{[me3d]([cnes4T])}|' +
      'RNA61{[me3fl2]([cneT])}|RNA62{[me3m]([h56T])}|RNA63{[me3r]([mo4bn3])}|RNA64{[meclna]([npomT])}|RNA65{[menoe2]([s2T])}|RNA66{[mn2lna]([s4T])}|' +
      'RNA67{[mnc2r]([z5T])}|RNA68{[mne2r]([5eU])}|RNA69{[mnobna]([5fU])}|RNA70{[MOE]([5iU])}|RNA71{[moe3an]([5tpU])}|RNA72{[moeon2]([allyl5])}|' +
      'RNA73{[mon2ln]([br5U])}|RNA74{[mopr2d]([brviny])}|RNA75{[mph]([cl5U])}|RNA76{[mR]([CN5U])}|RNA77{[ms2r]([cpU])}|RNA78{[mse2r]([d4U])}|' +
      'RNA79{[mseac]([DBCOnC])}|RNA80{[msoe2r]([e5U])}|RNA81{[n2r]([form5U])}|RNA82{[n3co4d]([h456U])}|RNA83{[n3d]([h456UR])}|RNA84{[n3fl2r]([hU])}|' +
      'RNA85{[n3m]([ipr5U])}|RNA86{[n5d]([m1Yra])}|RNA87{[n5fl2r]([m3U])}|RNA88{[n5m]([m6T])}|RNA89{[n5r]([m6U])}|RNA90{[nac2r]([mnm5U])}|' +
      'RNA91{[nbu2r]([mo5U])}|RNA92{[nC52r]([nC65U])}|RNA93{[nC62r]([nC6n5U])}|RNA94{[ne2r]([npr5U])}|RNA95{[nma]([oh5U])}|RNA96{[Nmc]([ohm5U])}|' +
      'RNA97{[npr2r]([Oro])}|RNA98{[ox23ar]([thiz5U])}|RNA99{[ph2r]([vinyl5])}|RNA100{[phoe2r]([z6pry5])}|RNA101{[phs2r]([z6U])}|RNA102{[pna]([tfU])}|' +
      'RNA103{[PONA]([thien5])}|RNA104{[pr2r]([pr56U])}|RNA105{[prparg]([prpU])}|RNA106{[pyren1]([psiU])}|RNA107{[qR]([s2U])}|RNA108{[Rcet]([s4U])}|' +
      'RNA109{[Rcmoe]([io5C])}|RNA110{[Rflcln]([c7py7A])}|RNA111{[RGNA]([2imen2])}|RNA112{[Rhe5d]([m2nprn])}|RNA113{[Rm5ALl]([c7py7N])}|' +
      'RNA114{[Rm5d]([c7A])}|RNA115{[Rm5fl2]([m1A])}|RNA116{[Rm5lna]([c7cn7A])}|RNA117{[Rm5moe]([cl2A])}|RNA118{[Diprgl]([m3C])}$RNA1,RNA2,1:R2-1:R1|' +
      'RNA2,RNA3,1:R2-1:R1|RNA3,RNA4,1:R2-1:R1|RNA4,RNA5,1:R2-1:R1|RNA5,RNA6,1:R2-1:R1|RNA6,RNA7,1:R2-1:R1|RNA7,RNA8,1:R2-1:R1|RNA8,RNA9,1:R2-1:R1|' +
      'RNA9,RNA10,1:R2-1:R1|RNA10,RNA11,1:R2-1:R1|RNA11,RNA12,1:R2-1:R1|RNA12,RNA13,1:R2-1:R1|RNA13,RNA14,1:R2-1:R1|RNA14,RNA15,1:R2-1:R1|' +
      'RNA15,RNA16,1:R2-1:R1|RNA16,RNA17,1:R2-1:R1|RNA17,RNA18,1:R2-1:R1|RNA18,RNA19,1:R2-1:R1|RNA19,RNA118,1:R2-1:R1|RNA118,RNA20,1:R2-1:R1|' +
      'RNA20,RNA21,1:R2-1:R1|RNA21,RNA22,1:R2-1:R1|RNA22,RNA23,1:R2-1:R1|RNA23,RNA24,1:R2-1:R1|RNA24,RNA25,1:R2-1:R1|RNA25,RNA26,1:R2-1:R1|' +
      'RNA26,RNA27,1:R2-1:R1|RNA27,RNA28,1:R2-1:R1|RNA28,RNA29,1:R2-1:R1|RNA29,RNA30,1:R2-1:R1|RNA30,RNA31,1:R2-1:R1|RNA31,RNA32,1:R2-1:R1|' +
      'RNA32,RNA33,1:R2-1:R1|RNA33,RNA34,1:R2-1:R1|RNA34,RNA35,1:R2-1:R1|RNA35,RNA36,1:R2-1:R1|RNA36,RNA37,1:R2-1:R1|RNA37,RNA38,1:R2-1:R1|' +
      'RNA38,RNA39,1:R2-1:R1|RNA39,RNA40,1:R2-1:R1|RNA40,RNA41,1:R2-1:R1|RNA41,RNA42,1:R2-1:R1|RNA42,RNA43,1:R2-1:R1|RNA43,RNA44,1:R2-1:R1|' +
      'RNA44,RNA45,1:R2-1:R1|RNA45,RNA46,1:R2-1:R1|RNA46,RNA47,1:R2-1:R1|RNA47,RNA48,1:R2-1:R1|RNA48,RNA49,1:R2-1:R1|RNA49,RNA50,1:R2-1:R1|' +
      'RNA50,RNA51,1:R2-1:R1|RNA51,RNA52,1:R2-1:R1|RNA52,RNA53,1:R2-1:R1|RNA53,RNA54,1:R2-1:R1|RNA54,RNA55,1:R2-1:R1|RNA55,RNA56,1:R2-1:R1|' +
      'RNA56,RNA57,1:R2-1:R1|RNA57,RNA58,1:R2-1:R1|RNA58,RNA59,1:R2-1:R1|RNA59,RNA60,1:R2-1:R1|RNA60,RNA61,1:R2-1:R1|RNA61,RNA62,1:R2-1:R1|' +
      'RNA62,RNA63,1:R2-1:R1|RNA63,RNA64,1:R2-1:R1|RNA64,RNA65,1:R2-1:R1|RNA65,RNA66,1:R2-1:R1|RNA66,RNA67,1:R2-1:R1|RNA67,RNA68,1:R2-1:R1|' +
      'RNA68,RNA69,1:R2-1:R1|RNA69,RNA70,1:R2-1:R1|RNA70,RNA71,1:R2-1:R1|RNA71,RNA72,1:R2-1:R1|RNA72,RNA73,1:R2-1:R1|RNA73,RNA74,1:R2-1:R1|' +
      'RNA74,RNA75,1:R2-1:R1|RNA75,RNA76,1:R2-1:R1|RNA76,RNA77,1:R2-1:R1|RNA77,RNA78,1:R2-1:R1|RNA78,RNA79,1:R2-1:R1|RNA79,RNA80,1:R2-1:R1|' +
      'RNA80,RNA81,1:R2-1:R1|RNA81,RNA82,1:R2-1:R1|RNA82,RNA83,1:R2-1:R1|RNA83,RNA84,1:R2-1:R1|RNA84,RNA85,1:R2-1:R1|RNA85,RNA86,1:R2-1:R1|' +
      'RNA86,RNA87,1:R2-1:R1|RNA87,RNA88,1:R2-1:R1|RNA88,RNA89,1:R2-1:R1|RNA89,RNA90,1:R2-1:R1|RNA90,RNA91,1:R2-1:R1|RNA91,RNA92,1:R2-1:R1|' +
      'RNA92,RNA93,1:R2-1:R1|RNA93,RNA94,1:R2-1:R1|RNA94,RNA95,1:R2-1:R1|RNA95,RNA96,1:R2-1:R1|RNA96,RNA97,1:R2-1:R1|RNA98,RNA99,1:R2-1:R1|' +
      'RNA99,RNA100,1:R2-1:R1|RNA100,RNA101,1:R2-1:R1|RNA101,RNA102,1:R2-1:R1|RNA102,RNA103,1:R2-1:R1|RNA103,RNA104,1:R2-1:R1|RNA104,RNA105,1:R2-1:R1|' +
      'RNA105,RNA106,1:R2-1:R1|RNA106,RNA107,1:R2-1:R1|RNA107,RNA108,1:R2-1:R1|RNA108,RNA109,1:R2-1:R1|RNA109,RNA110,1:R2-1:R1|RNA110,RNA111,1:R2-1:R1|' +
      'RNA111,RNA112,1:R2-1:R1|RNA112,RNA113,1:R2-1:R1|RNA113,RNA114,1:R2-1:R1|RNA114,RNA115,1:R2-1:R1|RNA115,RNA116,1:R2-1:R1|RNA116,RNA117,1:R2-1:R1|' +
      'RNA97,RNA98,1:R2-1:R1$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
];

test(`7. Check that every nucleoside (not a nucleotide, sugar is connected through R2 to something that is not phosphate, or has a free R2, but is connected to a "sense base" through R3) transform into a nucleoside on the antisense chain that contains ribose (R) and the appropriate "antisense base"`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6134
   * Description: Check that every nucleoside (not a nucleotide, sugar is connected through R2 to something that is not phosphate,
   *              or has a free R2, but is connected to a "sense base" through R3) transform into a nucleoside
   *              on the antisense chain that contains ribose (R) and the appropriate "antisense base"
   * Case:
   *       1. Load chain with all type of phosphates and sugars
   *       2. Select it (using Control+A)
   *       3. Call context menu for monomer and click "Create Antisense Strand" option
   *       4. Take screenshot to validate Antisense creation and that all sugars and phosphates connected to R and P
   */
  test.setTimeout(20000);

  const chain = chainOfNucleosidesWithAllTypesOfSugar[0];
  await loadMonomerOnCanvas(page, chain, chain.pageReloadNeeded);

  await selectAllStructuresOnCanvas(page);
  await callContextMenuForMonomer(page, chain.monomerLocatorIndex);

  const createAntisenseStrandOption = page
    .getByTestId('create_antisense_chain')
    .first();

  // Checking presence of Create Antisense Strand option on the context menu and enabled
  await expect(createAntisenseStrandOption).toHaveCount(1);
  await expect(createAntisenseStrandOption).toHaveAttribute(
    'aria-disabled',
    'false',
  );

  await createAntisenseStrandOption.click();
  for (let i = 0; i < 5; i++) await ZoomOutByKeyboard(page);
  await takeEditorScreenshot(page);
  await resetZoomLevelToDefault(page);
});

const chainOfAllTypesModifiedMonomers: IMonomer[] = [
  {
    monomerDescription: 'All types of modified monomers in one chain',
    contentType: MacroFileType.Ket,
    KETFile:
      'KET/Antisense-Chains/Check that all other monomers in the backbone that are not a part of the nucleotide or a nucleoside directly copied to the antisense strand.ket',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
];

test(`8. Check that all other monomers in the backbone that are not a part of the nucleotide or a nucleoside directly copied to the antisense strand`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6134
   * Description: Check that all other monomers in the backbone that are not a part of the nucleotide or a nucleoside
   *              directly copied to the antisense strand
   * Case:
   *       1. Load chain with all types of modified monomers in one
   *       2. Select it (using Control+A)
   *       3. Call context menu for monomer and click "Create Antisense Strand" option
   *       4. Take screenshot to validate Antisense creation and that monomers directly copied to antisense
   */
  test.setTimeout(20000);

  const chain = chainOfAllTypesModifiedMonomers[0];
  await loadMonomerOnCanvas(page, chain, chain.pageReloadNeeded);

  await selectAllStructuresOnCanvas(page);
  await callContextMenuForMonomer(page, chain.monomerLocatorIndex);

  const createAntisenseStrandOption = page
    .getByTestId('create_antisense_chain')
    .first();

  // Checking presence of Create Antisense Strand option on the context menu and enabled
  await expect(createAntisenseStrandOption).toHaveCount(1);
  await expect(createAntisenseStrandOption).toHaveAttribute(
    'aria-disabled',
    'false',
  );

  await createAntisenseStrandOption.click();
  for (let i = 0; i < 2; i++) await ZoomOutByKeyboard(page);
  await takeEditorScreenshot(page);
  await resetZoomLevelToDefault(page);
});

const chainOfNucleotidesAndPeptides: IMonomer[] = [
  {
    monomerDescription: 'All types of modified monomers in one chain',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R(U)P.R(G)P.R(C)P}|PEPTIDE1{[1Nal].[Cys_Bn].[AspOMe]}$RNA1,PEPTIDE1,9:R2-1:R1$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
];

test(`9. Check that the antisense chain should be "flipped" in relation to the sense chain checks`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6134
   * Description: 1. If the left most sugar/amino acid of the sense chain has a terminal indicator of 5'/N,
   *                 then the left most sugar/amino acid of the antisense chain should have a terminal indicator of 3'/C
   *              2. If the numbering of the sense chain increases from left to right, the numbering of the antisense chain should increase right to left
   *              3. If the sense chain was oriented bases down, the antisense chain should be oriented bases up
   *
   * Case:
   *       1. Load chain with all types of modified monomers in one
   *       2. Select it (using Control+A)
   *       3. Call context menu for monomer and click "Create Antisense Strand" option
   *       4. Take screenshot to validate Antisense creation and numbering order
   */
  test.setTimeout(20000);

  const chain = chainOfNucleotidesAndPeptides[0];
  await loadMonomerOnCanvas(page, chain, chain.pageReloadNeeded);

  await selectAllStructuresOnCanvas(page);
  await callContextMenuForMonomer(page, chain.monomerLocatorIndex);

  const createAntisenseStrandOption = page
    .getByTestId('create_antisense_chain')
    .first();

  // Checking presence of Create Antisense Strand option on the context menu and enabled
  await expect(createAntisenseStrandOption).toHaveCount(1);
  await expect(createAntisenseStrandOption).toHaveAttribute(
    'aria-disabled',
    'false',
  );

  await createAntisenseStrandOption.click();
  for (let i = 0; i < 6; i++) await ZoomInByKeyboard(page);
  await takeEditorScreenshot(page);
  await resetZoomLevelToDefault(page);
});

test(`10. Check that options "Delete" and "Copy" added to the r-click menu`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6134
   * Description: Check that options "Delete" and "Copy" added to the r-click menu
   *
   * Case:
   *       1. Load monomer
   *       2. Select it (using Control+A)
   *       3. Call context menu for monomer and check if Delete and Copy present and enabled
   */
  test.setTimeout(20000);

  const chain = chainOfNucleotidesAndPeptides[0];
  await loadMonomerOnCanvas(page, chain, chain.pageReloadNeeded);

  await selectAllStructuresOnCanvas(page);
  await callContextMenuForMonomer(page, chain.monomerLocatorIndex);

  const deleteOption = page.getByTestId('delete').first();
  const copyOption = page.getByTestId('copy').first();
  // Checking presence of Copy and Delete options are in the context menu and enabled
  await expect(deleteOption).toHaveCount(1);
  await expect(copyOption).toHaveCount(1);
  await expect(deleteOption).toHaveAttribute('aria-disabled', 'false');
  await expect(copyOption).toHaveAttribute('aria-disabled', 'false');
});

test(`11. Check that option "Delete" deletes the selected monomers and all the bonds of those monomers and Undo restore all monomers and bonds`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6134
   * Description: Check that option "Delete" deletes the selected monomers and all the bonds of those monomers and Undo restore all monomers and bonds
   *
   * Case:
   *       1. Load monomer
   *       2. Select it (using Control+A)
   *       3. Take screenshot to validate initial state
   *       4. Call context menu for monomer and click Delete
   *       5. Take screenshot to witness clear canvas
   *       6. Press Undo
   *       7. Take screenshot to witness initial state got back
   */
  test.setTimeout(20000);

  const chain = chainOfNucleotidesAndPeptides[0];
  await loadMonomerOnCanvas(page, chain, chain.pageReloadNeeded);

  await selectAllStructuresOnCanvas(page);
  await takeEditorScreenshot(page);
  await callContextMenuForMonomer(page, chain.monomerLocatorIndex);

  const deleteOption = page.getByTestId('delete').first();
  // Checking presence of Delete options are in the context menu and enabled
  await expect(deleteOption).toHaveCount(1);
  await expect(deleteOption).toHaveAttribute('aria-disabled', 'false');

  await deleteOption.click();
  await takeEditorScreenshot(page);

  await pressUndoButton(page);
  await takeEditorScreenshot(page);
});

test(`12. Check that option "Copy" copies the selected monomers and any bonds between them as the default format`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6134
   * Description: Check that option "Copy" copies the selected monomers and any bonds between them as the default format
   *
   * Case:
   *       1. Load monomer
   *       2. Select it (using Control+A)
   *       3. Take screenshot to validate initial state
   *       4. Call context menu for monomer and click Copy
   *       5. Paste clipboard content to the canvas
   *       6. Take screenshot to witness the result
   */
  test.setTimeout(20000);

  const chain = chainOfNucleotidesAndPeptides[0];
  await loadMonomerOnCanvas(page, chain, chain.pageReloadNeeded);

  await selectAllStructuresOnCanvas(page);
  await takeEditorScreenshot(page);
  await callContextMenuForMonomer(page, chain.monomerLocatorIndex);

  const copyOption = page.getByTestId('copy').first();
  // Checking presence of Delete options are in the context menu and enabled
  await expect(copyOption).toHaveCount(1);
  await expect(copyOption).toHaveAttribute('aria-disabled', 'false');

  await copyOption.click();
  await pasteFromClipboardByKeyboard(page);

  await takeEditorScreenshot(page);
});

test(`13. Validate that creating, deleting, and modifying the antisense chain supports the undo/redo functionality`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6134
   * Description: Validate that creating, deleting, and modifying the antisense chain supports the undo/redo functionality
   * Case:
   *       1. Load chain with antisense base
   *       2. Select it (using Control+A)
   *       3. Call context menu for monomer and click "Create Antisense Strand" option
   *       4. Take screenshot to validate Antisense creation
   *       5. Delete sugar R from the antisense chain
   *       6. Take screenshot to validate deletion
   *       7. Move sugar R to the new position
   *       8. Take screenshot to validate movement
   *       9. Undo all actions taking screenshots after each action to validate the undo functionality
   *      10. Redo all actions taking screenshots after each action to validate the redo functionality
   */
  test.setTimeout(30000);

  const chain = chainOfNucleotidesAndPeptides[0];
  await loadMonomerOnCanvas(page, chain, chain.pageReloadNeeded);

  await selectAllStructuresOnCanvas(page);
  await callContextMenuForMonomer(page, chain.monomerLocatorIndex);

  const createAntisenseStrandOption = page
    .getByTestId('create_antisense_chain')
    .first();

  // Checking presence of Create Antisense Strand option on the context menu and enabled
  await expect(createAntisenseStrandOption).toHaveCount(1);
  await expect(createAntisenseStrandOption).toHaveAttribute(
    'aria-disabled',
    'false',
  );

  await createAntisenseStrandOption.click();
  await takeEditorScreenshot(page, { hideMonomerPreview: true });

  const sugarRs = getMonomerLocator(page, Sugars.R);

  await selectRectangleSelectionTool(page);
  await sugarRs.nth(2).click();
  await selectEraseTool(page);
  await takeEditorScreenshot(page, { hideMonomerPreview: true });

  await selectRectangleSelectionTool(page);
  await sugarRs.nth(1).click();
  await dragMouseTo(200, 200, page);
  await takeEditorScreenshot(page, { hideMonomerPreview: true });

  await pressUndoButton(page);
  await takeEditorScreenshot(page, { hideMonomerPreview: true });

  await pressUndoButton(page);
  await takeEditorScreenshot(page, { hideMonomerPreview: true });

  await pressUndoButton(page);
  await takeEditorScreenshot(page, { hideMonomerPreview: true });

  await pressRedoButton(page);
  await takeEditorScreenshot(page, { hideMonomerPreview: true });

  await pressRedoButton(page);
  await takeEditorScreenshot(page, { hideMonomerPreview: true });

  await pressRedoButton(page);
  await takeEditorScreenshot(page, { hideMonomerPreview: true });
});

test(`14. Validate that both sense and antisense strands can be exported correctly in supported file formats`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6134
   * Description: Validate that creating, deleting, and modifying the antisense chain supports the undo/redo functionality
   * Case:
   *       1. Load chain with antisense base
   *       2. Select it (using Control+A)
   *       3. Call context menu for monomer and click "Create Antisense Strand" option
   *       4. Validate export to KET file
   *       5. Validate exported MOL V3000 file
   *       6. Validate exported HELM file
   */
  test.setTimeout(30000);

  const chain = chainOfNucleotidesAndPeptides[0];
  await loadMonomerOnCanvas(page, chain, chain.pageReloadNeeded);

  await selectAllStructuresOnCanvas(page);
  await callContextMenuForMonomer(page, chain.monomerLocatorIndex);

  const createAntisenseStrandOption = page
    .getByTestId('create_antisense_chain')
    .first();

  // Checking presence of Create Antisense Strand option on the context menu and enabled
  await expect(createAntisenseStrandOption).toHaveCount(1);
  await expect(createAntisenseStrandOption).toHaveAttribute(
    'aria-disabled',
    'false',
  );

  await createAntisenseStrandOption.click();

  await verifyFileExport(
    page,
    'KET/Antisense-Chains/Antisense-expected.ket',
    FileType.KET,
  );

  await verifyFileExport(
    page,
    'KET/Antisense-Chains/Antisense-expected.mol',
    FileType.MOL,
    'v3000',
  );

  await verifyHELMExport(
    page,
    'RNA1{R(U)P.R(G)P.R(C)P}|PEPTIDE1{[1Nal].[Cys_Bn].[AspOMe]}|' +
      'RNA2{R(A)P.R(C)P.R(G)P}|PEPTIDE2{[1Nal].[Cys_Bn].[AspOMe]}' +
      '$RNA1,PEPTIDE1,9:R2-1:R1|RNA1,RNA2,2:pair-2:pair|' +
      'RNA1,RNA2,5:pair-5:pair|RNA1,RNA2,8:pair-8:pair|' +
      'RNA2,PEPTIDE2,9:R2-1:R1$$$V2.0',
  );
});

test(`15. Ensure that switching between (Flex, Snake, Sequence) modes does not break the alignment or hydrogen bonding between the sense and antisense strands`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6134
   * Description: Ensure that switching between (Flex, Snake, Sequence) modes does not break the alignment or hydrogen bonding between the sense and antisense strands
   * Case:
   *       1. Load chain with antisense base
   *       2. Select it (using Control+A)
   *       3. Call context menu for monomer and click "Create Antisense Strand" option
   *       4. Switch to Snake mode
   *       6. Take screenshot to validate layout
   *       7. Switch to Sequence mode
   *       8. Take screenshot to validate layout
   *       9. Switch to Flex mode
   *      10. Take screenshot to validate layout
   */
  test.setTimeout(20000);

  const chain = chainOfNucleotidesAndPeptides[0];
  await loadMonomerOnCanvas(page, chain, chain.pageReloadNeeded);

  await selectAllStructuresOnCanvas(page);
  await callContextMenuForMonomer(page, chain.monomerLocatorIndex);

  const createAntisenseStrandOption = page
    .getByTestId('create_antisense_chain')
    .first();

  // Checking presence of Create Antisense Strand option on the context menu and enabled
  await expect(createAntisenseStrandOption).toHaveCount(1);
  await expect(createAntisenseStrandOption).toHaveAttribute(
    'aria-disabled',
    'false',
  );

  await createAntisenseStrandOption.click();

  await selectSnakeLayoutModeTool(page);
  await takeEditorScreenshot(page, { hideMonomerPreview: true });

  await selectSequenceLayoutModeTool(page);
  await takeEditorScreenshot(page, { hideMonomerPreview: true });

  await selectFlexLayoutModeTool(page);
  await takeEditorScreenshot(page, { hideMonomerPreview: true });
});

test(`16. Ensure that switching between macro and micro modes does not break the alignment or hydrogen bonding between the sense and antisense strands`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6134
   * Description: Ensure that switching between (Flex, Snake, Sequence) modes does not break the alignment or hydrogen bonding between the sense and antisense strands
   * Case:
   *       1. Load chain with antisense base
   *       2. Select it (using Control+A)
   *       3. Call context menu for monomer and click "Create Antisense Strand" option
   *       4. Switch to Molecules mode
   *       6. Take screenshot to validate layout
   *       7. Switch to Macromolecules mode
   *       8. Take screenshot to validate layout
   */
  test.setTimeout(20000);

  const chain = chainOfNucleotidesAndPeptides[0];
  await loadMonomerOnCanvas(page, chain, chain.pageReloadNeeded);

  await selectAllStructuresOnCanvas(page);
  await callContextMenuForMonomer(page, chain.monomerLocatorIndex);

  const createAntisenseStrandOption = page
    .getByTestId('create_antisense_chain')
    .first();

  // Checking presence of Create Antisense Strand option on the context menu and enabled
  await expect(createAntisenseStrandOption).toHaveCount(1);
  await expect(createAntisenseStrandOption).toHaveAttribute(
    'aria-disabled',
    'false',
  );

  await createAntisenseStrandOption.click();

  await turnOnMicromoleculesEditor(page);
  await takeEditorScreenshot(page, { hideMonomerPreview: true });

  await turnOnMacromoleculesEditor(page);
  await takeEditorScreenshot(page, { hideMonomerPreview: true });
});

test.fail(
  `17. Verify that copying the sense and antisense strand and pasting it within the same canvas retains the correct orientation and complementary base pairing`,
  async () => {
    /*
     * IMPORTANT: Test fails because we have a bug: https://github.com/epam/ketcher/issues/6441
     * Test task: https://github.com/epam/ketcher/issues/6134
     * Description: Verify that copying the sense and antisense strand and pasting it within the same canvas retains the correct orientation and complementary base pairing
     * Case:
     *       1. Load chain with antisense base
     *       2. Select it (using Control+A)
     *       3. Call context menu for monomer and click "Create Antisense Strand" option
     *       4. Select all structures on the canvas
     *       6. Copy structures to clipboard
     *       7. Paste clipboard content to the canvas
     *       8. Take screenshot to validate layout
     */
    test.setTimeout(30000);
    await pageReload(page);

    const chain = chainOfNucleotidesAndPeptides[0];

    await loadMonomerOnCanvas(page, chain, chain.pageReloadNeeded);

    await selectAllStructuresOnCanvas(page);
    await callContextMenuForMonomer(page, chain.monomerLocatorIndex);

    const createAntisenseStrandOption = page
      .getByTestId('create_antisense_chain')
      .first();

    // Checking presence of Create Antisense Strand option on the context menu and enabled
    await expect(createAntisenseStrandOption).toHaveCount(1);
    await expect(createAntisenseStrandOption).toHaveAttribute(
      'aria-disabled',
      'false',
    );

    await createAntisenseStrandOption.click();

    await selectAllStructuresOnCanvas(page);
    await copyToClipboardByKeyboard(page);
    await pasteFromClipboardByKeyboard(page);
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  },
);

test(`18. Flipping checks`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/6134
   * Description: 1. If the sense chain was oriented bases down, the antisense chain should be oriented bases up.
   *              2. If the sense chain was oriented bases up, the antisense chain should be oriented bases down.
   *              3. If the left most sugar/amino acid of the sense chain has a terminal indicator of 5'/N, then the left most sugar/amino acid of the antisense chain should have a terminal indicator of 3'/C.
   *              4. If the left most sugar/amino acid of the sense chain has a terminal indicator of 3'/C, then the left most sugar/amino acid of the antisense chain should have a terminal indicator of 5'/N.
   *              5. If the numbering of the sense chain increases from left to right, the numbering of the antisense chain should increase right to left.
   *              6. If the numbering of the sense chain increases from right to left, the numbering of the antisense chain should increase left to right.
   * Case:
   *       1. Load chain/antisense pair (and standalone nucleotide)
   *       2. Take screenshot to validate initial state (numbering, orientation, terminal indicator)
   *       3. Connect to antisense chain extra nucleotide
   *       4. Switch to Flex mode and back to Snake - chains got filipped
   *       5. Take screenshot to validate new state (numbering, orientation, terminal indicator)
   */
  test.setTimeout(20000);

  await pageReload(page);
  await selectSnakeLayoutModeTool(page);

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'RNA1{[dR](A,C,G,T)P.[dR](A,G,T)P.[dR](A,T)P}|RNA2{R(A,C,G,U)P.R(A,C,U)P.R(A,U)[Ssp]}|' +
      'RNA3{[RSpabC](A,U)P}$RNA1,RNA2,2:pair-2:pair|RNA1,RNA2,5:pair-5:pair|RNA1,RNA2,8:pair-8:pair$$$V2.0',
  );
  for (let i = 0; i < 5; i++) await ZoomInByKeyboard(page);

  await takeEditorScreenshot(page, { hideMonomerPreview: true });

  await bondTwoMonomers(
    page,
    getMonomerLocator(page, { monomerAlias: 'Ssp' }),
    getMonomerLocator(page, { monomerAlias: 'RSpabC' }),
  );

  await selectFlexLayoutModeTool(page);
  await selectSnakeLayoutModeTool(page);

  await takeEditorScreenshot(page, { hideMonomerPreview: true });

  await resetZoomLevelToDefault(page);
});
