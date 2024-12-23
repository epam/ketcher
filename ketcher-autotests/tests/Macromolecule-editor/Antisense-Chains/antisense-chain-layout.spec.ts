/* eslint-disable no-magic-numbers */
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  selectClearCanvasTool,
  waitForPageInit,
  MacroFileType,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  selectSnakeLayoutModeTool,
  openFileAndAddToCanvasMacro,
  selectFlexLayoutModeTool,
  MonomerType,
} from '@utils';
import { pageReload } from '@utils/common/helpers';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { bondTwoMonomers } from '@utils/macromolecules/polymerBond';
import { MacroBondTool } from '@utils/canvas/tools/selectNestedTool/types';

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

interface IMonomer {
  id: number;
  monomerDescription: string;
  alias?: string;
  type: MonomerType | 'Nucleotide' | 'Nucleoside';
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

interface IPolymer {
  polymerDescription?: string;
  contentType: MacroFileType.Ket | MacroFileType.HELM;
  KETFile?: string;
  HELMString?: string;
  checks: ('side chain' | '')[];
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
  polymer: IPolymer | IMonomer,
  pageReloadNeeded = false,
) {
  if (pageReloadNeeded) await pageReload(page);

  if (polymer.HELMString) {
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      polymer.HELMString,
    );
  }
  if (polymer.KETFile) {
    await openFileAndAddToCanvasMacro(polymer.KETFile, page);
  }
}

// async function callContextMenuForMonomer(
//   page: Page,
//   monomerLocatorIndex: number,
// ) {
//   const canvasLocator = page.getByTestId('ketcher-canvas');
//   await canvasLocator
//     .locator('g.monomer')
//     .nth(monomerLocatorIndex)
//     .click({ button: 'right', force: true });
// }

// const monomers: IPolymer[] = [
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)}|RNA2{R(U)}$RNA1,RNA2,2:pair-2:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)}|RNA2{R(U)}$RNA1,RNA2,2:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)}|RNA2{R}$RNA1,RNA2,2:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)}|RNA2{R}$RNA1,RNA2,1:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{P}|RNA2{R(C)}$RNA2,RNA1,2:pair-1:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{P}|RNA2{R(C)}$RNA2,RNA1,1:pair-1:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)}|PEPTIDE1{A}$RNA1,PEPTIDE1,2:pair-1:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)}|PEPTIDE1{A}$RNA1,PEPTIDE1,1:pair-1:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{[2-damdA]}|RNA2{R(C)}$RNA2,RNA1,2:pair-1:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{[2-damdA]}|RNA2{R(C)}$RNA2,RNA1,1:pair-1:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'CHEM1{[4aPEGMal]}|RNA1{R(C)}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'CHEM1{[4aPEGMal]}|RNA1{R(C)}$RNA1,CHEM1,1:pair-1:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{R(U)}$RNA1,RNA2,2:pair-2:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{R(U)}$RNA1,RNA2,2:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{R}$RNA1,RNA2,2:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{R}$RNA1,RNA2,1:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{P}|RNA2{R(C)P}$RNA2,RNA1,2:pair-1:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{P}|RNA2{R(C)P}$RNA2,RNA1,1:pair-1:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|PEPTIDE1{A}$RNA1,PEPTIDE1,2:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|PEPTIDE1{A}$RNA1,PEPTIDE1,1:pair-1:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|PEPTIDE1{A}$RNA1,PEPTIDE1,3:pair-1:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{[2-damdA]}|RNA2{R(C)P}$RNA2,RNA1,2:pair-1:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{[2-damdA]}|RNA2{R(C)P}$RNA2,RNA1,1:pair-1:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{[2-damdA]}|RNA2{R(C)P}$RNA2,RNA1,3:pair-1:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'CHEM1{[4aPEGMal]}|RNA1{R(C)P}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'CHEM1{[4aPEGMal]}|RNA1{R(C)P}$RNA1,CHEM1,1:pair-1:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'CHEM1{[4aPEGMal]}|RNA1{R(C)P}$RNA1,CHEM1,3:pair-1:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{R(U)}$RNA1,RNA2,3:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{R(U)}$RNA1,RNA2,3:pair-2:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{R}$RNA1,RNA2,3:pair-1:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{P}|RNA2{R(C)P}$RNA2,RNA1,3:pair-1:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{R(U)P}$RNA1,RNA2,2:pair-2:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{R(U)P}$RNA1,RNA2,2:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{R(U)P}$RNA1,RNA2,2:pair-3:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{RP}$RNA1,RNA2,2:pair-1:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{RP}$RNA1,RNA2,1:pair-1:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{RP}$RNA1,RNA2,3:pair-1:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{RP}$RNA2,RNA1,2:pair-2:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{RP}$RNA2,RNA1,2:pair-1:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{RP}$RNA2,RNA1,2:pair-3:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{P}|RNA2{R(C)P}$RNA2,RNA1,2:pair-1:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{P}|RNA2{R(C)P}$RNA2,RNA1,1:pair-1:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{P}|RNA2{R(C)P}$RNA2,RNA1,3:pair-1:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|PEPTIDE1{A}$RNA1,PEPTIDE1,2:pair-1:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|PEPTIDE1{A}$RNA1,PEPTIDE1,1:pair-1:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|PEPTIDE1{A}$RNA1,PEPTIDE1,3:pair-1:pair$$$V2.0',
//     checks: ['side chain'],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{[2-damdA]}|RNA2{R(C)P}$RNA2,RNA1,2:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{[2-damdA]}|RNA2{R(C)P}$RNA2,RNA1,1:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{[2-damdA]}|RNA2{R(C)P}$RNA2,RNA1,3:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'CHEM1{[4aPEGMal]}|RNA1{R(C)P}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'CHEM1{[4aPEGMal]}|RNA1{R(C)P}$RNA1,CHEM1,1:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'CHEM1{[4aPEGMal]}|RNA1{R(C)P}$RNA1,CHEM1,3:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{R(U)}$RNA1,RNA2,3:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{R(U)}$RNA1,RNA2,3:pair-2:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{R}$RNA1,RNA2,3:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{R(U)P.R(U)P}$RNA1,RNA2,2:pair-2:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{R(U)P.R(U)P}$RNA1,RNA2,2:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{R(U)P.R(U)P}$RNA1,RNA2,2:pair-3:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{RP.R(U)P}$RNA1,RNA2,2:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{RP.R(U)P}$RNA1,RNA2,1:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{RP.R(U)P}$RNA1,RNA2,3:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{RP.R(U)P}$RNA2,RNA1,2:pair-2:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{RP.R(U)P}$RNA2,RNA1,2:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{RP.R(U)P}$RNA2,RNA1,2:pair-3:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{P.R(U)P}|RNA2{R(C)P}$RNA2,RNA1,2:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{P.R(U)P}|RNA2{R(C)P}$RNA2,RNA1,1:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{P.R(U)P}|RNA2{R(C)P}$RNA2,RNA1,3:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P}|PEPTIDE1{A}|RNA2{R(U)P}$RNA1,PEPTIDE1,2:pair-1:pair|RNA2,PEPTIDE1,1:R1-1:R2$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P}|PEPTIDE1{A}|RNA2{R(U)P}$RNA1,PEPTIDE1,1:pair-1:pair|PEPTIDE1,RNA2,1:R2-1:R1$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P}|PEPTIDE1{A}|RNA2{R(U)P}$RNA1,PEPTIDE1,3:pair-1:pair|PEPTIDE1,RNA2,1:R2-1:R1$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{[2-damdA].R(U)P}|RNA2{R(C)P}$RNA2,RNA1,2:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{[2-damdA].R(U)P}|RNA2{R(C)P}$RNA2,RNA1,1:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{[2-damdA].R(U)P}|RNA2{R(C)P}$RNA2,RNA1,3:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'CHEM1{[4aPEGMal]}|RNA1{R(C)P}|RNA2{R(U)P}$CHEM1,RNA2,1:R2-1:R1|RNA1,CHEM1,2:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'CHEM1{[4aPEGMal]}|RNA1{R(C)P}|RNA2{R(U)P}$CHEM1,RNA2,1:R2-1:R1|RNA1,CHEM1,1:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'CHEM1{[4aPEGMal]}|RNA1{R(C)P}|RNA2{R(U)P}$CHEM1,RNA2,1:R2-1:R1|RNA1,CHEM1,3:pair-1:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P}|RNA2{R(U)}|RNA3{R(U)P}$RNA1,RNA2,3:pair-1:pair|RNA2,RNA3,1:R2-1:R1$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P}|RNA2{R(U)}|RNA3{R(U)P}$RNA1,RNA2,3:pair-2:pair|RNA2,RNA3,1:R2-1:R1$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P}|RNA2{R}|RNA3{R(U)P}$RNA1,RNA2,3:pair-1:pair|RNA2,RNA3,1:R2-1:R1$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{R(U)P.R(U)P}$RNA1,RNA2,2:pair-2:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{R(U)P.R(U)P}$RNA1,RNA2,2:pair-5:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{R(U)P.R(U)P}$RNA1,RNA2,2:pair-3:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString: 'RNA1{R(C)P}|RNA2{R(U)P.R(U)P}$RNA1,RNA2,1:pair-4:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P}|RNA2{R(U)P.R(U)P}$RNA1,RNA2,1:pair-1:pair|RNA1,RNA2,3:pair-3:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P}|RNA2{R(U)P.R(U)P}$RNA1,RNA2,2:pair-2:pair|RNA1,RNA2,3:pair-5:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P}|RNA2{R(U)P.R(U)P}$RNA1,RNA2,2:pair-2:pair|RNA1,RNA2,3:pair-4:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P}|RNA2{R(U)P.R(U)P}$RNA1,RNA2,2:pair-2:pair|RNA1,RNA2,2:pair-5:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P}|RNA2{R(U)P.R(U)P}$RNA1,RNA2,1:pair-1:pair|RNA1,RNA2,1:pair-4:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P}|RNA2{R(U)P.R(U)P}$RNA2,RNA1,5:pair-2:pair|RNA1,RNA2,2:pair-2:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,2:pair-2:pair|RNA1,RNA2,5:pair-5:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,2:pair-2:pair|RNA1,RNA2,5:pair-8:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,2:pair-5:pair|RNA1,RNA2,5:pair-8:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,2:pair-5:pair|RNA1,RNA2,5:pair-2:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA2,2:pair-8:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,2:pair-8:pair|RNA1,RNA2,5:pair-5:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,2:pair-2:pair|RNA1,RNA2,2:pair-5:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,2:pair-5:pair|RNA1,RNA2,2:pair-8:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA2,5:pair-5:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,5:pair-8:pair|RNA1,RNA2,3:pair-5:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,5:pair-8:pair|RNA1,RNA2,3:pair-2:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,3:pair-2:pair|RNA1,RNA2,5:pair-5:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,3:pair-8:pair|RNA1,RNA2,5:pair-5:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,3:pair-5:pair|RNA1,RNA2,5:pair-2:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,5:pair-2:pair|RNA1,RNA2,3:pair-8:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,6:pair-2:pair|RNA1,RNA2,2:pair-5:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,6:pair-5:pair|RNA1,RNA2,2:pair-2:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,6:pair-5:pair|RNA1,RNA2,2:pair-8:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,6:pair-2:pair|RNA1,RNA2,2:pair-5:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,6:pair-5:pair|RNA1,RNA2,2:pair-2:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,6:pair-5:pair|RNA1,RNA2,2:pair-8:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,3:pair-2:pair|RNA1,RNA2,6:pair-5:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,3:pair-5:pair|RNA1,RNA2,6:pair-2:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,3:pair-8:pair|RNA1,RNA2,6:pair-2:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,3:pair-2:pair|RNA1,RNA2,6:pair-8:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,3:pair-5:pair|RNA1,RNA2,6:pair-8:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,3:pair-8:pair|RNA1,RNA2,6:pair-5:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,3:pair-2:pair|RNA1,RNA2,6:pair-6:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,3:pair-5:pair|RNA1,RNA2,6:pair-9:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,3:pair-8:pair|RNA1,RNA2,6:pair-3:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,3:pair-2:pair|RNA1,RNA2,3:pair-6:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,3:pair-5:pair|RNA1,RNA2,3:pair-6:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,3:pair-8:pair|RNA1,RNA2,3:pair-6:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,6:pair-6:pair|RNA1,RNA2,3:pair-3:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,6:pair-9:pair|RNA1,RNA2,3:pair-6:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,6:pair-3:pair|RNA1,RNA2,3:pair-9:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,3:pair-6:pair|RNA1,RNA2,6:pair-3:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,6:pair-6:pair|RNA1,RNA2,3:pair-9:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,3:pair-6:pair|RNA1,RNA2,3:pair-9:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
//   {
//     polymerDescription: '',
//     contentType: MacroFileType.HELM,
//     HELMString:
//       'RNA1{R(C)P.R(C)P}|RNA2{R(U)P.R(U)P.R(U)P}$RNA1,RNA2,6:pair-6:pair|RNA1,RNA2,6:pair-9:pair$$$V2.0',
//     checks: [''],
//     monomerLocatorIndex: 0,
//   },
// ];

const shortMonomerList: IMonomer[] = [
  {
    id: 1,
    monomerDescription: '1. Peptide A (from library)',
    alias: 'A',
    type: MonomerType.Peptide,
    contentType: MacroFileType.HELM,
    HELMString: 'PEPTIDE1{A}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    id: 2,
    monomerDescription: '2. Ambiguous peptide X (alternatives, from library)',
    alias: 'X',
    type: MonomerType.Peptide,
    contentType: MacroFileType.HELM,
    HELMString:
      'PEPTIDE1{(A,C,D,E,F,G,H,I,K,L,M,N,O,P,Q,R,S,T,U,V,W,Y)}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    id: 3,
    monomerDescription: '3. Sugar R (from library)',
    alias: 'R',
    type: MonomerType.Sugar,
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    id: 4,
    monomerDescription: '4. Base A (from library)',
    alias: 'A',
    type: MonomerType.Base,
    contentType: MacroFileType.Ket,
    KETFile: 'KET/Antisense-Chains/8. Base A (from library).ket',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    id: 5,
    monomerDescription: '5. Ambiguous DNA Base N (alternatives, from library)',
    alias: 'N',
    type: MonomerType.Base,
    contentType: MacroFileType.Ket,
    KETFile:
      'KET/Antisense-Chains/9. Ambiguous DNA Base N (alternatives, from library).ket',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    id: 6,
    monomerDescription: '6. Phosphate P (from library)',
    alias: 'P',
    type: MonomerType.Phosphate,
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{P}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    id: 7,
    monomerDescription: '7. Unsplit monomer 2-damdA (from library)',
    alias: '2-damdA',
    type: MonomerType.UnresovedNucleotide,
    contentType: MacroFileType.Ket,
    KETFile:
      'KET/Antisense-Chains/18. Unsplit monomer 2-damdA (from library).ket',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    id: 8,
    monomerDescription: '8. Unknown monomer',
    alias: 'Unknown',
    type: MonomerType.UnknownMonomer,
    contentType: MacroFileType.Ket,
    KETFile: 'KET/Antisense-Chains/19. Unknown monomer.ket',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    id: 9,
    monomerDescription: '9. CHEM 4aPEGMal (from library)',
    alias: '4aPEGMal',
    type: MonomerType.CHEM,
    contentType: MacroFileType.HELM,
    HELMString: 'CHEM1{[4aPEGMal]}$$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: false,
    monomerLocatorIndex: 0,
  },
  {
    id: 10,
    monomerDescription: '10. Nucleoside - R(A)',
    alias: 'A',
    type: 'Nucleoside',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A)}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    id: 11,
    monomerDescription: '11. Nucleotide A - R(A)P',
    alias: 'A',
    type: 'Nucleotide',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A)P}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    id: 12,
    monomerDescription:
      '12. Nucleotide of DNA base N with sugar R and phosphate P - R(A,C,G,T)P',
    alias: 'N',
    type: 'Nucleotide',
    contentType: MacroFileType.HELM,
    HELMString: 'RNA1{R(A,C,G,T)P}$$$$V2.0',
    eligibleForAntisense: true,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    id: 13,
    monomerDescription:
      '13. Nucleoside of sugar R, base that have extra covalent bond - R([nC6n8A])',
    alias: 'nC6n8A',
    type: 'Nucleoside',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    id: 14,
    monomerDescription:
      '14. Nucleoside of sugar R, base that have extra covalent bond and phosphate P - R([nC6n8A])P',
    alias: 'nC6n8A',
    type: 'Nucleoside',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A])P}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:R2-1:R1$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    id: 15,
    monomerDescription:
      '15. Nucleoside of sugar R, base that have extra hydrogen bond - R([nC6n8A])',
    alias: 'nC6n8A',
    type: 'Nucleoside',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
  {
    id: 16,
    monomerDescription:
      '16. Nucleoside of sugar R, base that have extra hydrogen bond and phosphate P - R([nC6n8A])P',
    alias: 'nC6n8A',
    type: 'Nucleoside',
    contentType: MacroFileType.HELM,
    HELMString:
      'RNA1{R([nC6n8A])P}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,2:pair-1:pair$$$V2.0',
    eligibleForAntisense: false,
    baseWithR3R1ConnectionPresent: true,
    monomerLocatorIndex: 0,
  },
];

for (const leftMonomer of shortMonomerList) {
  for (const rightMonomer of shortMonomerList) {
    test(
      `1-${leftMonomer.id}-${rightMonomer.id}. Hydrogen side chain for: ${leftMonomer.monomerDescription} and ${rightMonomer.monomerDescription}`,
      { tag: ['@IncorrectResultBecauseOfBug'] },
      async () => {
        /*
         * Test task: https://github.com/epam/ketcher/issues/6184
         * Description: Check if hydrogen bonds connect monomers inside one chain, those
         *              hydrogen bonds should be considered as side chain connections for layout purposes
         * Case:
         *       1. Load two monomers on the canvas (load first, move it to the left, load second)
         *       2. Connect them with hydrogen bond
         *       3. Switch to the flex/snake mode to refresh layout
         *       4. Take screenshot to validate layout (connection should be considered as side chain)
         *
         *  WARNING: Some test tesults are wrong because of bugs:
         *  https://github.com/epam/ketcher/issues/6194
         *  https://github.com/epam/ketcher/issues/6195
         *  Screenshots must be updated after fix and fixme should be removed
         */
        test.setTimeout(20000);

        await loadMonomerOnCanvas(page, leftMonomer);
        let leftMonomerAlias;
        if (leftMonomer.type === 'Nucleoside') {
          leftMonomerAlias = 'R';
        } else if (leftMonomer.type === 'Nucleotide') {
          leftMonomerAlias = 'P';
        } else {
          leftMonomerAlias = leftMonomer.alias;
        }
        const leftMonomerLocator = (
          await getMonomerLocator(page, {
            monomerAlias: leftMonomerAlias,
          })
        ).first();
        await loadMonomerOnCanvas(page, rightMonomer);
        let rightMonomerAlias;
        if (rightMonomer.type === 'Nucleoside') {
          rightMonomerAlias = 'R';
        } else if (rightMonomer.type === 'Nucleotide') {
          rightMonomerAlias = 'P';
        } else {
          rightMonomerAlias = rightMonomer.alias;
        }
        const rightMonomerLocator =
          (await (
            await getMonomerLocator(page, {
              monomerAlias: rightMonomerAlias,
            })
          ).count()) > 1
            ? (
                await getMonomerLocator(page, {
                  monomerAlias: rightMonomerAlias,
                })
              ).nth(1)
            : (
                await getMonomerLocator(page, {
                  monomerAlias: rightMonomerAlias,
                })
              ).first();

        await bondTwoMonomers(
          page,
          leftMonomerLocator,
          rightMonomerLocator,
          undefined,
          undefined,
          MacroBondTool.HYDROGEN,
        );

        await selectFlexLayoutModeTool(page);
        await selectSnakeLayoutModeTool(page);
        await takeEditorScreenshot(page);
      },
    );
  }
}
