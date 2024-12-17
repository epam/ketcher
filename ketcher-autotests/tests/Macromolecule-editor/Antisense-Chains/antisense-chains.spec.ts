/* eslint-disable no-magic-numbers */
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
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
} from '@utils';
import { pageReload } from '@utils/common/helpers';

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
  eligableForAntisense: boolean;
  baseWithR3R1ConnectionPresent: boolean;
  monomerLocatorIndex: number;
  // Set shouldFail to true if you expect test to fail because of existed bug and put issues link to issueNumber
  shouldFail?: boolean;
  // issueNumber is mandatory if shouldFail === true
  issueNumber?: string;
  // set pageReloadNeeded to true if you need to restart ketcher before test (f.ex. to restart font renderer)
  pageReloadNeeded?: boolean;
}

const monomers: IMonomer[] = [
  {
    monomerDescription: '1. Peptide A (from library)',
    contentType: MacroFileType.HELM,
    HELMString: 'PEPTIDE1{A}$$$$V2.0',
    eligableForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '2. Ambiguous peptide X (alternatives, from library)',
    contentType: MacroFileType.HELM,
    HELMString:
      'PEPTIDE1{(A,C,D,E,F,G,H,I,K,L,M,N,O,P,Q,R,S,T,U,V,W,Y)}$$$$V2.0',
    eligableForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '3. Ambiguous peptide % (alternatives)',
    contentType: MacroFileType.HELM,
    HELMString: 'PEPTIDE1{(S,T,U,V,W,Y)}$$$$V2.0',
    eligableForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '4. Ambiguous peptide % (mixture)',
    contentType: MacroFileType.HELM,
    HELMString: 'PEPTIDE1{(S+T+U+V+W+Y)}$$$$V2.0',
    eligableForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '5. Sugar R (from library)',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R}$$$$V2.0',
    eligableForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '6. Ambiguous sugar % (alternatives)',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3],[5A6])}$$$$V2.0',
    eligableForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '7. Ambiguous sugar % (mixture)',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3]+[5A6])}$$$$V2.0',
    eligableForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '8. Base A (from library)',
    contentType: MacroFileType.Ket,
    KETFile: 'KET/Antisense-Chains/8. Base A (from library).ket',
    eligableForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '9. Ambiguous DNA Base N (alternatives, from library)',
    contentType: MacroFileType.Ket,
    KETFile:
      'KET/Antisense-Chains/9. Ambiguous DNA Base N (alternatives, from library).ket',
    eligableForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '10. Ambiguous RNA Base N (alternatives, from library)',
    contentType: MacroFileType.Ket,
    KETFile:
      'KET/Antisense-Chains/10. Ambiguous RNA Base N (alternatives, from library).ket',
    eligableForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '11. Ambiguous Base M (alternatives, from library)',
    contentType: MacroFileType.Ket,
    KETFile:
      'KET/Antisense-Chains/11. Ambiguous Base M (alternatives, from library).ket',
    eligableForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '12. Ambiguous DNA Base % (mixture)',
    contentType: MacroFileType.Ket,
    KETFile: 'KET/Antisense-Chains/12. Ambiguous DNA Base % (mixture).ket',
    eligableForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '13. Ambiguous RNA Base % (mixture)',
    contentType: MacroFileType.Ket,
    KETFile: 'KET/Antisense-Chains/13. Ambiguous RNA Base % (mixture).ket',
    eligableForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '14. Ambiguous Base % (mixture)',
    contentType: MacroFileType.Ket,
    KETFile: 'KET/Antisense-Chains/14. Ambiguous Base % (mixture).ket',
    eligableForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '15. Phosphate P (from library)',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{P}$$$$V2.0',
    eligableForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '16. Ambiguous phosphate % (alternatives)',
    contentType: MacroFileType.Ket,
    KETFile:
      'KET/Antisense-Chains/16. Ambiguous phosphate % (alternatives).ket',
    eligableForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '17. Ambiguous phosphate % (mixture)',
    contentType: MacroFileType.Ket,
    KETFile: 'KET/Antisense-Chains/17. Ambiguous phosphate % (mixture).ket',
    eligableForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '18. Unsplit monomer 2-damdA (from library)',
    contentType: MacroFileType.Ket,
    KETFile:
      'KET/Antisense-Chains/18. Unsplit monomer 2-damdA (from library).ket',
    eligableForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '19. Unknown monomer',
    contentType: MacroFileType.Ket,
    KETFile: 'KET/Antisense-Chains/19. Unknown monomer.ket',
    eligableForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '20. CHEM 4aPEGMal (from library)',
    contentType: MacroFileType.HELM,
    HELMString: 'CHEM1{[4aPEGMal]}$$$$V2.0',
    eligableForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '21. Ambiguous CHEM % (alternatives)',
    contentType: MacroFileType.HELM,
    HELMString: 'CHEM1{([4aPEGMal],[sDBL])}$$$$V2.0',
    eligableForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '22. Ambiguous CHEM % (mixture)',
    contentType: MacroFileType.HELM,
    HELMString: 'CHEM1{([4aPEGMal]+[sDBL])}$$$$V2.0',
    eligableForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '23. Ambiguous CHEM % (mixture)',
    contentType: MacroFileType.HELM,
    HELMString: 'CHEM1{([4aPEGMal]+[sDBL])}$$$$V2.0',
    eligableForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription: '24. Nucleoside - R(A)',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A)}$$$$V2.0',
    eligableForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription:
      '25. Nucleoside with ambuguous alternative sugar - ([25moe3],[5A6])(A)',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{([25moe3],[5A6])(A)}$$$$V2.0',
    eligableForAntisense: true,
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
    eligableForAntisense: true,
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
    eligableForAntisense: true,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription:
      '28. Nucleoside with ambuguous alternative DNA base N - R(A,C,G,U)',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A,C,G,U)}$$$$V2.0',
    eligableForAntisense: true,
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
    eligableForAntisense: true,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription:
      '30. Nucleoside with ambuguous mixture RNA base - R(A+C+G+T)',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A+C+G+T)}$$$$V2.0',
    baseWithR3R1ConnectionPresent: true,
    eligableForAntisense: false,
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
    eligableForAntisense: false,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6088',
  },
  {
    monomerDescription: '32. Nucleoside with ambuguous mixture base - R(A+C)',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A+C)}$$$$V2.0',
    eligableForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6088',
  },
  {
    monomerDescription: '33. Nucleotide A - R(A)P',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A)P}$$$$V2.0',
    eligableForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    monomerDescription:
      '34. Nucleotide A with ambiguous alternative phosphate - R(A)([bnn],[bP])',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A)([bnn],[bP])}$$$$V2.0',
    eligableForAntisense: true,
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
    eligableForAntisense: true,
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
    eligableForAntisense: true,
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
    eligableForAntisense: true,
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
    eligableForAntisense: true,
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
    eligableForAntisense: true,
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
    eligableForAntisense: true,
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
    eligableForAntisense: true,
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
    eligableForAntisense: true,
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
    eligableForAntisense: true,
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
    eligableForAntisense: true,
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
    eligableForAntisense: true,
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
    eligableForAntisense: true,
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
    eligableForAntisense: true,
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
    eligableForAntisense: true,
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
    eligableForAntisense: true,
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
    eligableForAntisense: true,
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
    eligableForAntisense: true,
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
    eligableForAntisense: true,
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
    eligableForAntisense: true,
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
    eligableForAntisense: true,
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
    eligableForAntisense: true,
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
    eligableForAntisense: true,
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
    eligableForAntisense: true,
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
    eligableForAntisense: true,
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
    eligableForAntisense: true,
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
    eligableForAntisense: false,
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
    eligableForAntisense: false,
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
    eligableForAntisense: false,
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
    eligableForAntisense: false,
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
    eligableForAntisense: false,
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
    eligableForAntisense: false,
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
    eligableForAntisense: false,
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
    eligableForAntisense: false,
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
    eligableForAntisense: false,
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
    eligableForAntisense: false,
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
    eligableForAntisense: false,
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
    eligableForAntisense: false,
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
    eligableForAntisense: false,
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
    eligableForAntisense: false,
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
    eligableForAntisense: false,
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
    eligableForAntisense: false,
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
    eligableForAntisense: false,
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
    eligableForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/6169',
  },
];

for (const monomer of monomers.filter((m) => m.eligableForAntisense)) {
  test(`Create antisense chain for: ${monomer.monomerDescription}`, async () => {
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
    if (monomer.pageReloadNeeded) await pageReload(page);

    if (monomer.KETFile) {
      await openFileAndAddToCanvasMacro(monomer.KETFile, page);
    }
    if (monomer.HELMString) {
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        monomer.HELMString,
      );
    }

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
  (m) => m.baseWithR3R1ConnectionPresent && !m.eligableForAntisense,
)) {
  test(`Create antisense chain for: ${monomer.monomerDescription}`, async () => {
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
    if (monomer.pageReloadNeeded) await pageReload(page);

    if (monomer.KETFile) {
      await openFileAndAddToCanvasMacro(monomer.KETFile, page);
    }
    if (monomer.HELMString) {
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        monomer.HELMString,
      );
    }

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
