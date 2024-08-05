/* eslint-disable no-magic-numbers */
import {
  chooseFileFormat,
  turnOnMacromoleculesEditor,
} from '@utils/macromolecules';
import { Page, test, BrowserContext, chromium } from '@playwright/test';
import {
  takeEditorScreenshot,
  selectClearCanvasTool,
  waitForIndigoToLoad,
  waitForKetcherInit,
  openStructurePasteFromClipboard,
  waitForSpinnerFinishedWork,
} from '@utils';

let page: Page;
let sharedContext: BrowserContext;

test.beforeAll(async ({ browser }) => {
  try {
    sharedContext = await browser.newContext();
  } catch (error) {
    console.error('Error on creation browser context:', error);
    console.log('Restarting browser...');
    await browser.close();
    browser = await chromium.launch();
    sharedContext = await browser.newContext();
  }

  // Reminder: do not pass page as async
  page = await sharedContext.newPage();

  await page.goto('', { waitUntil: 'domcontentloaded' });
  await waitForKetcherInit(page);
  await waitForIndigoToLoad(page);
  await turnOnMacromoleculesEditor(page);
});

test.afterEach(async () => {
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Control+0');
  await selectClearCanvasTool(page);
});

test.afterAll(async ({ browser }) => {
  await page.close();
  await sharedContext.close();
  await browser.contexts().forEach((someContext) => {
    someContext.close();
  });
});

async function loadHELMFromClipboard(page: Page, helmString: string) {
  await openStructurePasteFromClipboard(page);
  await chooseFileFormat(page, 'HELM');
  await page.getByTestId('open-structure-textarea').fill(helmString);
  await waitForSpinnerFinishedWork(
    page,
    async () => await page.getByTestId('add-to-canvas-button').click(),
  );
}
interface IHELMString {
  helmDescription: string;
  HELMString: string;
}

const correctHELMStrings: IHELMString[] = [
  {
    helmDescription: '1. Simple standard RNA, no phosphate',
    HELMString: 'RNA1{R(A)}$$$$V2.0',
  },
  {
    helmDescription: '2. Simple standard RNA',
    HELMString: 'RNA1{R(A)P}$$$$V2.0',
  },
  {
    helmDescription: '3. imple unusual RNA, no phosphate',
    HELMString: 'RNA1{[Sm5moe]([m2nprn])}$$$$V2.0',
  },
  {
    helmDescription: '4. Simple unusual RNA, no base',
    HELMString: 'RNA1{[Sm5moe][mepo2]}$$$$V2.0',
  },
  {
    helmDescription: '5. Simple unusual RNA',
    HELMString: 'RNA1{[Sm5moe]([m2nprn])[mepo2]}$$$$V2.0',
  },
  {
    helmDescription: '6. Simple standard PEPTIDE',
    HELMString: 'PEPTIDE1{L}$$$$V2.0',
  },
  {
    helmDescription: '7. Simple unusual PEPTIDE',
    HELMString: 'PEPTIDE1{[D-gGlu]}$$$$V2.0',
  },
  {
    helmDescription: '8. Simple standard CHEM',
    HELMString: 'CHEM1{[A6OH]}$$$$V2.0',
  },
  {
    helmDescription: '9. Simple unusual CHEM',
    HELMString: 'CHEM1{[SMPEG2]}$$$$V2.0',
  },
  //   {
  //     helmDescription: '10. no ending token (RNA)',
  //     HELMString: 'RNA1{R(A)P}',
  //   },
  {
    helmDescription: '11. trash after ending token (RNA)',
    HELMString: 'RNA1{R(A)P}$$$$Bla-bla-bla',
  },
  {
    helmDescription: '12. trash after ending token (PEPTIDE)',
    HELMString: 'PEPTIDE1{L}$$$$Bla-bla-bla',
  },
  //   {
  //     helmDescription: '13. no ending token (CHEM)',
  //     HELMString: 'CHEM1{[A6OH]}',
  //   },
  {
    helmDescription: '14. trash after ending token (CHEM)',
    HELMString: 'CHEM1{[A6OH]}$$$$Bla-bla-blaV2.0',
  },
  {
    helmDescription:
      '15. PEPTIDE: “.” is used between connected monomer units which are groups that represent the repetitive functional unit of the given polymer type.',
    HELMString:
      'PEPTIDE1{A.[Aad].[Abu].[Aca].[Aib].[Apm].[App].[Asu].[Aze].[Bux].C}$$$$V2.0',
  },
  {
    helmDescription:
      '16. RNA (one letter names): “.” is used between connected monomer units which are groups that represent the repetitive functional unit of the given polymer type.',
    HELMString: 'RNA1{R(A)P.R(C)P.R(G)P.R(T)P}$$$$V2.0',
  },
  {
    helmDescription:
      '17. RNA (multi-letters names)“.” is used between connected monomer units which are groups that represent the repetitive functional unit of the given polymer type.',
    HELMString:
      'RNA1{[Sm5moe]([m2nprn])[mepo2].[menoe2]([nobn6p])[m2nen].[bnoe2r]([nC6n2G])[fl2me].[m2nc2r]([nC6n8A])[mepo2]}$$$$V2.0',
  },
  {
    helmDescription: '18. ListOfSimplePolymers - RNAs only',
    HELMString: 'RNA1{R(A)}|RNA2{R(A)P}|RNA3{R(G)P}|RNA4{R(C)P}$$$$V2.0',
  },
  {
    helmDescription: '19. ListOfSimplePolymers - Peptides only',
    HELMString: 'PEPTIDE1{A}|PEPTIDE2{C}|PEPTIDE3{E}|PEPTIDE4{F}$$$$V2.0',
  },
  {
    helmDescription: '20. ListOfSimplePolymers - CHEMs only',
    HELMString: 'CHEM1{[A6OH]}|CHEM2{[SMPEG2]}|CHEM3{[Az]}|CHEM4{[EG]}$$$$V2.0',
  },
  {
    helmDescription: '21. ListOfSimplePolymers - Mix',
    HELMString:
      'RNA1{R(A)}|PEPTIDE1{A}|CHEM1{[A6OH]}|RNA2{R(A)P}|PEPTIDE2{C}|CHEM2{[SMPEG2]}|RNA3{R(G)P}|CHEM3{[Az]}$$$$V2.0',
  },
  {
    helmDescription: '22. ListOfSimplePolymers - Mix - reverse order',
    HELMString:
      'RNA3{R(G)P}|CHEM3{[Az]}|RNA2{R(A)P}|PEPTIDE2{C}|CHEM2{[SMPEG2]}|RNA1{R(A)}|PEPTIDE1{A}|CHEM1{[A6OH]}$$$$V2.0',
  },
  {
    helmDescription: '23. Index starts from 100',
    HELMString:
      'RNA100{R(A)}|PEPTIDE10000{A}|CHEM100000{[A6OH]}|RNA1000000{R(A)P}|PEPTIDE10000000{C}|CHEM100000000{[SMPEG2]}|RNA1000000000{R(G)P}|CHEM3{[Az]}$$$$V2.0',
  },
  {
    helmDescription: '24. Connection RNA(R2) to Peptide(R1)',
    HELMString: 'PEPTIDE1{A}|RNA1{R(A)P}$RNA1,PEPTIDE1,3:R2-1:R1$$$V2.0',
  },
  {
    helmDescription: '25. Connection CHEM1(R2) to Peptide(R1)',
    HELMString: 'CHEM1{[A6OH]}|PEPTIDE1{A}$CHEM1,PEPTIDE1,1:R2-1:R1$$$V2.0',
  },
  {
    helmDescription: '26. Connection RNA(R2) to CHEM1(R1)',
    HELMString: 'RNA1{R(A)P}|CHEM1{[A6OH]}$CHEM1,RNA1,1:R1-3:R2$$$V2.0',
  },
  {
    helmDescription:
      '27. Connection RNA1(R2) to Peptide1(R1), Peptide1(R2) to CHEM1(R1), CHEM1(R2) to RNA2(R1), RNA2(R2) to Peptide2(R1), Peptide2(R2) to CHEM2(R1), ' +
      'CHEM2(R2) to RNA3(R1), RNA3(R2) to Peptide3(R1), Peptide3(R2) to CHEM3(R1)',
    HELMString:
      'RNA1{R(A)}|PEPTIDE1{A}|CHEM1{[SMPEG2]}|RNA2{R(A)P}|PEPTIDE2{C}|CHEM2{[A6OH]}|RNA3{R(A)P}|PEPTIDE3{D}|CHEM3{[SMCC]}$RNA1,PEPTIDE1,1:R2-1:R1|RNA2,' +
      'PEPTIDE2,3:R2-1:R1|RNA3,PEPTIDE3,3:R2-1:R1|PEPTIDE1,CHEM3,1:R2-1:R1|CHEM3,RNA2,1:R2-1:R1|PEPTIDE2,CHEM2,1:R2-1:R1|CHEM2,RNA3,1:R2-1:R1|PEPTIDE3,CHEM1,1:R2-1:R1$$$V2.0',
  },
  {
    helmDescription:
      '28. List of peptides connected to another list of peptides via R3 to R1',
    HELMString:
      'PEPTIDE1{A.[Aad].[Abu].[Aca].[Aib].[Apm].[App].[Asu].[Aze].[Bux].C}|PEPTIDE2{Q.R.S.T.V.W.Y}$PEPTIDE2,PEPTIDE1,1:R1-6:R3$$$V2.0',
  },
  {
    helmDescription:
      '29. List of peptides connected to another list of RNAs via R1 to R2',
    HELMString:
      'PEPTIDE1{[1Nal].[D-1Nal].C.E.G}|RNA1{R(A)P.R(C)P.R(G)P.R(T)P.R(U)P}$RNA1,PEPTIDE1,15:R2-1:R1$$$V2.0',
  },
  {
    helmDescription:
      '30. List of CHEMs connected to another list of RNAs via R1 to R2',
    HELMString:
      'CHEM1{[MCC]}|RNA1{R(A)P.R(C)P.R(G)P.R(T)P.R(U)P}$RNA1,CHEM1,15:R2-1:R1$$$V2.0',
  },
  {
    helmDescription: '31. Two connections between list of peptides',
    HELMString:
      'PEPTIDE1{C.[Apm].D.[dC].E}|PEPTIDE2{F.[D-gGlu].G.[D-Orn].I}$PEPTIDE1,PEPTIDE2,2:R3-2:R3|PEPTIDE2,PEPTIDE1,4:R3-4:R3$$$V2.0',
  },
  {
    helmDescription: '32. Cycled RNAs',
    HELMString: 'RNA1{R(A)P.R(C)P.R(G)P}$RNA1,RNA1,9:R2-1:R1$$$V2.0',
  },
];

test.describe('Import correct HELM sequence: ', () => {
  for (const correctHELMString of correctHELMStrings) {
    test(`${correctHELMString.helmDescription}`, async () => {
      /* 
    Test case: https://github.com/epam/ketcher/issues/5215
    Description: Load correct HELM sequences and compare canvas with the template
    */
      await loadHELMFromClipboard(page, correctHELMString.HELMString);
      await takeEditorScreenshot(page);
    });
  }
});
