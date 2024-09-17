/* eslint-disable no-magic-numbers */
import {
  chooseFileFormat,
  turnOnMacromoleculesEditor,
} from '@utils/macromolecules';
import { Page, test, BrowserContext, chromium, expect } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForIndigoToLoad,
  waitForKetcherInit,
  openStructurePasteFromClipboard,
  waitForSpinnerFinishedWork,
  selectClearCanvasTool,
  selectSaveTool,
  pressButton,
} from '@utils';
import {
  closeErrorMessage,
  closeOpenStructure,
  pageReload,
} from '@utils/common/helpers';

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
  // await page.keyboard.press('Control+0');
  await selectClearCanvasTool(page);
  // await page.keyboard.press('Control+0');
});

test.afterAll(async ({ browser }) => {
  await page.close();
  await sharedContext.close();
  browser.contexts().forEach((someContext) => {
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

async function openSaveToHELMDialog(page: Page) {
  await selectSaveTool(page);
  await chooseFileFormat(page, 'HELM');
}

interface IHELMString {
  helmDescription: string;
  HELMString: string;
  // Set shouldFail to true if you expect test to fail because of existed bug and put issues link to issueNumber
  shouldFail?: boolean;
  // issueNumber is mandatory if shouldFail === true
  issueNumber?: string;
  // set pageReloadNeeded to true if you need to restart ketcher before test (f.ex. to restart font renderer)
  pageReloadNeeded?: boolean;
  // Some times export result is different to import string
  differentHELMExport?: string;
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
  {
    helmDescription: '10. trash after ending token (RNA)',
    HELMString: 'RNA1{R(A)P}$$$$Bla-bla-bla',
    differentHELMExport: 'RNA1{R(A)P}$$$$V2.0',
  },
  {
    helmDescription: '11. trash after ending token (PEPTIDE)',
    HELMString: 'PEPTIDE1{L}$$$$Bla-bla-bla',
    differentHELMExport: 'PEPTIDE1{L}$$$$V2.0',
  },
  {
    helmDescription: '12. trash after ending token (CHEM)',
    HELMString: 'CHEM1{[A6OH]}$$$$Bla-bla-blaV2.0',
    differentHELMExport: 'CHEM1{[A6OH]}$$$$V2.0',
  },
  {
    helmDescription:
      '13. PEPTIDE: “.” is used between connected monomer units which are groups that represent the repetitive functional unit of the given polymer type.',
    HELMString:
      'PEPTIDE1{A.[Aad].[Abu].[Aca].[Aib].[Apm].[App].[Asu].[Aze].[Bux].C}$$$$V2.0',
  },
  {
    helmDescription:
      '14. RNA (one letter names): “.” is used between connected monomer units which are groups that represent the repetitive functional unit of the given polymer type.',
    HELMString: 'RNA1{R(A)P.R(C)P.R(G)P.R(T)P}$$$$V2.0',
  },
  {
    helmDescription:
      '15. RNA (multi-letters names)“.” is used between connected monomer units which are groups that represent the repetitive functional unit of the given polymer type.',
    HELMString:
      'RNA1{[Sm5moe]([m2nprn])[mepo2].[menoe2]([nobn6p])[m2nen].[bnoe2r]([nC6n2G])[fl2me].[m2nc2r]([nC6n8A])[mepo2]}$$$$V2.0',
  },
  {
    helmDescription: '16. ListOfSimplePolymers - RNAs only',
    HELMString: 'RNA1{R(A)}|RNA2{R(A)P}|RNA3{R(G)P}|RNA4{R(C)P}$$$$V2.0',
  },
  {
    helmDescription: '17. ListOfSimplePolymers - Peptides only',
    HELMString: 'PEPTIDE1{A}|PEPTIDE2{C}|PEPTIDE3{E}|PEPTIDE4{F}$$$$V2.0',
  },
  {
    helmDescription: '18. ListOfSimplePolymers - CHEMs only',
    HELMString: 'CHEM1{[A6OH]}|CHEM2{[SMPEG2]}|CHEM3{[Az]}|CHEM4{[EG]}$$$$V2.0',
  },
  {
    helmDescription: '19. ListOfSimplePolymers - Mix',
    HELMString:
      'RNA1{R(A)}|PEPTIDE1{A}|CHEM1{[A6OH]}|RNA2{R(A)P}|PEPTIDE2{C}|CHEM2{[SMPEG2]}|RNA3{R(G)P}|CHEM3{[Az]}$$$$V2.0',
  },
  {
    helmDescription: '20. ListOfSimplePolymers - Mix - reverse order',
    HELMString:
      'RNA3{R(G)P}|CHEM3{[Az]}|RNA2{R(A)P}|PEPTIDE2{C}|CHEM2{[SMPEG2]}|RNA1{R(A)}|PEPTIDE1{A}|CHEM1{[A6OH]}$$$$V2.0',
    differentHELMExport:
      'RNA1{R(G)P}|CHEM1{[Az]}|RNA2{R(A)P}|PEPTIDE1{C}|CHEM2{[SMPEG2]}|RNA3{R(A)}|PEPTIDE2{A}|CHEM3{[A6OH]}$$$$V2.0',
  },
  {
    helmDescription: '21. Index starts from 100',
    HELMString:
      'RNA100{R(A)}|PEPTIDE10000{A}|CHEM100000{[A6OH]}|RNA1000000{R(A)P}|PEPTIDE10000000{C}|CHEM100000000{[SMPEG2]}|RNA1000000000{R(G)P}|CHEM3{[Az]}$$$$V2.0',
    differentHELMExport:
      'RNA1{R(A)}|PEPTIDE1{A}|CHEM1{[A6OH]}|RNA2{R(A)P}|PEPTIDE2{C}|CHEM2{[SMPEG2]}|RNA3{R(G)P}|CHEM3{[Az]}$$$$V2.0',
  },
  {
    helmDescription: '22. Connection RNA(R2) to Peptide(R1)',
    HELMString: 'PEPTIDE1{A}|RNA1{R(A)P}$RNA1,PEPTIDE1,3:R2-1:R1$$$V2.0',
  },
  {
    helmDescription: '23. Connection CHEM1(R2) to Peptide(R1)',
    HELMString: 'CHEM1{[A6OH]}|PEPTIDE1{A}$CHEM1,PEPTIDE1,1:R2-1:R1$$$V2.0',
  },
  {
    helmDescription: '24. Connection RNA(R2) to CHEM1(R1)',
    HELMString: 'RNA1{R(A)P}|CHEM1{[A6OH]}$CHEM1,RNA1,1:R1-3:R2$$$V2.0',
  },
  {
    helmDescription:
      '25. Connection RNA1(R2) to Peptide1(R1), Peptide1(R2) to CHEM1(R1), CHEM1(R2) to RNA2(R1), RNA2(R2) to Peptide2(R1), Peptide2(R2) to CHEM2(R1), ' +
      'CHEM2(R2) to RNA3(R1), RNA3(R2) to Peptide3(R1), Peptide3(R2) to CHEM3(R1)',
    HELMString:
      'RNA1{R(A)}|PEPTIDE1{A}|CHEM1{[SMPEG2]}|RNA2{R(A)P}|PEPTIDE2{C}|CHEM2{[A6OH]}|RNA3{R(A)P}|PEPTIDE3{D}|CHEM3{[SMCC]}$RNA1,PEPTIDE1,1:R2-1:R1|RNA2,' +
      'PEPTIDE2,3:R2-1:R1|RNA3,PEPTIDE3,3:R2-1:R1|PEPTIDE1,CHEM3,1:R2-1:R1|CHEM3,RNA2,1:R2-1:R1|PEPTIDE2,CHEM2,1:R2-1:R1|CHEM2,RNA3,1:R2-1:R1|PEPTIDE3,CHEM1,1:R2-1:R1$$$V2.0',
  },
  {
    helmDescription:
      '26. List of peptides connected to another list of peptides via R3 to R1',
    HELMString:
      'PEPTIDE1{A.[Aad].[Abu].[Aca].[Aib].[Apm].[App].[Asu].[Aze].[Bux].C}|PEPTIDE2{Q.R.S.T.V.W.Y}$PEPTIDE2,PEPTIDE1,1:R1-6:R3$$$V2.0',
  },
  {
    helmDescription:
      '27. List of peptides connected to another list of RNAs via R1 to R2',
    HELMString:
      'PEPTIDE1{[1Nal].[D-1Nal].C.E.G}|RNA1{R(A)P.R(C)P.R(G)P.R(T)P.R(U)P}$RNA1,PEPTIDE1,15:R2-1:R1$$$V2.0',
  },
  {
    helmDescription:
      '28. List of CHEMs connected to another list of RNAs via R1 to R2',
    HELMString:
      'CHEM1{[MCC]}|RNA1{R(A)P.R(C)P.R(G)P.R(T)P.R(U)P}$RNA1,CHEM1,15:R2-1:R1$$$V2.0',
  },
  {
    helmDescription: '29. Two connections between list of peptides',
    HELMString:
      'PEPTIDE1{C.[Apm].D.[dC].E}|PEPTIDE2{F.[D-gGlu].G.[D-Orn].I}$PEPTIDE1,PEPTIDE2,2:R3-2:R3|PEPTIDE2,PEPTIDE1,4:R3-4:R3$$$V2.0',
  },
  {
    helmDescription: '30. Cycled RNAs',
    HELMString: 'RNA1{R(A)P.R(C)P.R(G)P}$RNA1,RNA1,9:R2-1:R1$$$V2.0',
  },
  {
    helmDescription:
      '31. Simple petide - “+” as the separator within this list represents an AND relationship of the monomers.',
    HELMString: 'PEPTIDE1{(A+C)}$$$$V2.0',
  },
  {
    helmDescription:
      '32. Multi-char petide - “+” as the separator within this list represents an AND relationship of the monomers.',
    HELMString: 'PEPTIDE1{([Aad]+[Abu]+[Aca]+[Aib]+[Apm])}$$$$V2.0',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2321',
  },
  {
    helmDescription:
      '33. Simple RNAs - “+” as the separator within this list represents an AND relationship of the monomers.',
    HELMString: 'RNA1{R(A+C)P}$$$$V2.0',
    pageReloadNeeded: true,
  },
  {
    helmDescription:
      '34. Multi-char RNAs - “+” as the separator within this list represents an AND relationship of the monomers.',
    HELMString:
      'RNA1{[Sm5moe]([m2nprn]+[nobn6p]+[nC6n2G]+[nC6n8A])[mepo2]}$$$$V2.0',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2321',
  },
  {
    helmDescription:
      '35. Simple peptides - The ratio of each element can be given as a numerical value after the monomer' +
      'separated by the colon character. If no value is specified, it is assumed that the proportion of that element is unknown.',
    HELMString: 'PEPTIDE1{(A:1.5+C:0.1)}$$$$V2.0',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2355',
  },
  {
    helmDescription:
      '36. Multi-char peptides - The ratio of each element can be given as a numerical value after the monomer' +
      'separated by the colon character. If no value is specified, it is assumed that the proportion of that element is unknown.',
    HELMString:
      'PEPTIDE1{([Aad]:1.1+[Abu]:2.2+[Aca]:3.3+[Aib]:4.4+[Apm]:5.5)}$$$$V2.0',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2355',
  },
  {
    helmDescription:
      '37. Simple RNAs - The ratio of each element can be given as a numerical value after the monomer' +
      ' separated by the colon character. If no value is specified, it is assumed that the proportion of that element is unknown.',
    HELMString: 'RNA1{R(A:100+C:200)P}$$$$V2.0',
  },
  {
    helmDescription:
      '38. Multi-char RNAs - The ratio of each element can be given as a numerical value after the monomer' +
      ' separated by the colon character. If no value is specified, it is assumed that the proportion of that element is unknown.',
    HELMString:
      'RNA1{[Sm5moe]([m2nprn]:1+[nobn6p]:2+[nC6n2G]:4+[nC6n8A]:5)[mepo2]}$$$$V2.0',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2321',
  },
  {
    helmDescription:
      "39. Two peptides connected R2-R2, one of them don't have R1 AP",
    HELMString:
      'PEPTIDE1{[DACys]}|PEPTIDE2{C}$PEPTIDE2,PEPTIDE1,1:R2-1:R2$$$V2.0',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2358',
  },
  {
    helmDescription:
      '40. Simple peptides - “,” as the separator within this list represents an XOR (excluding OR) relationship of the monomers.',
    HELMString: 'PEPTIDE1{(A,C)}$$$$V2.0',
    pageReloadNeeded: true,
  },
  {
    helmDescription:
      '41. Multi-char peptides - “,” as the separator within this list represents an XOR (excluding OR) relationship of the monomers.',
    HELMString: 'PEPTIDE1{([Aad],[Abu],[Aca],[Aib],[Apm])}$$$$V2.0',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2321',
  },
  {
    helmDescription:
      '42. Simple RNAs - “,” as the separator within this list represents an XOR (excluding OR) relationship of the monomers.',
    HELMString: 'RNA1{R(A,C)P}$$$$V2.0',
  },
  {
    helmDescription:
      '43. Multi-char RNAs - “,” as the separator within this list represents an XOR (excluding OR) relationship of the monomers.',
    HELMString:
      'RNA1{[Sm5moe]([m2nprn],[nobn6p],[nC6n2G],[nC6n8A])[mepo2]}$$$$V2.0',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2321',
  },
  {
    helmDescription:
      '44. Single peptides - The probability of each element can be given as a numerical value after the monomer' +
      ' separated by the colon character. If no value is specified, it is assumed that it the probability of the element is unknown.',
    HELMString: 'PEPTIDE1{(A:10,C:20)}$$$$V2.0',
  },
  {
    helmDescription:
      '45. Multi-char peptides - The probability of each element can be given as a numerical value after the monomer' +
      ' separated by the colon character. If no value is specified, it is assumed that it the probability of the element is unknown.',
    HELMString:
      'PEPTIDE1{([Aad]:10,[Abu]:20,[Aca]:30,[Aib]:40,[Apm]:50)}$$$$V2.0',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2321',
  },
  {
    helmDescription:
      '46. Simple RNAs - The probability of each element can be given as a numerical value after the monomer' +
      ' separated by the colon character. If no value is specified, it is assumed that it the probability of the element is unknown.',
    HELMString: 'RNA1{R(A:10,C:90)P}$$$$V2.0',
  },
  {
    helmDescription:
      '47. Multi-char RNAs - The probability of each element can be given as a numerical value after the monomer' +
      ' separated by the colon character. If no value is specified, it is assumed that it the probability of the element is unknown.',
    HELMString:
      'RNA1{[Sm5moe]([m2nprn]:10,[nobn6p]:20,[nC6n2G]:30,[nC6n8A]:40)[mepo2]}$$$$V2.0',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2321',
  },
  {
    helmDescription: '48. RNA(RA) with single inline Extended SMILES (A)',
    HELMString:
      'RNA1{R([C1(C2=C(N=CN=1)N%91C=N2)N.[*:1]%91 |$;;;;;;;;;;_R1$|])}$$$$V2.0',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2337',
  },
  {
    helmDescription: '49. RNA(RAP) with single inline Extended SMILES (A)',
    HELMString:
      'RNA1{R([C1(C2=C(N=CN=1)N%91C=N2)N.[*:1]%91 |$;;;;;;;;;;_R1$|])P}$$$$V2.0',
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/Indigo/issues/2339, https://github.com/epam/Indigo/issues/2337',
  },
  {
    helmDescription: '50. RNA(RP) with single inline Extended SMILES (P)',
    HELMString: 'RNA1{R[P%91(O)(O)=O.[*:1]%91 |$;;;;_R1$|]}$$$$V2.0',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2337',
  },
  {
    helmDescription: '51. RNA(RP) with single inline Extended SMILES (R)',
    HELMString:
      'RNA1{[O1[C@@H]%91[C@H](O)[C@H](O%92)[C@H]1CO%93.[*:3]%91.[*:1]%93.[*:2]%92 |$;;;;;;;;;_R3;_R1;_R2$|]P}$$$$V2.0',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2337',
  },
  {
    helmDescription: '52. RNA(RAP) with  single inline Extended SMILES (P)',
    HELMString: 'RNA1{R(A)[P%91(O)(O)=O.[*:1]%91 |$;;;;_R1$|]}$$$$V2.0',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2337',
  },
  {
    helmDescription:
      '53. RNA(RAP) with  all monomer inline Extended SMILES (RAP)',
    HELMString:
      'RNA1{[O1[C@@H]%91[C@H](O)[C@H](O%92)[C@H]1CO%93.[*:3]%91.[*:1]%93.[*:2]%92 |$;;;;;;;;;_R3;_R1;_R2$|](A)P}$$$$V2.0',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2339',
  },
  {
    helmDescription:
      '54. Single peptide with inline SMILES (L) without attachment points',
    HELMString: 'PEPTIDE1{[C([C@@H](C(O)=O)N[H])C(C)C]}$$$$V2.0',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2337',
  },
  {
    helmDescription: '55. Single peptide with inline Extended SMILES (L)',
    HELMString:
      'PEPTIDE1{[C([C@@H](C%91=O)N%92)C(C)C.[*:2]%91.[*:1]%92 |$;;;;;;;;_R2;_R1$|]}$$$$V2.0',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2337',
  },
  {
    helmDescription:
      '56. Single CHEM with inline SMILES (A6OH) without attachment points',
    HELMString: 'CHEM1{[N([H])CCCCCCO[H]]}$$$$V2.0',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2337',
  },
  {
    helmDescription: '57. Single CHEM with inline Extended SMILES (A6OH)',
    HELMString:
      'CHEM1{[N%91CCCCCCO%92.[*:2]%91.[*:1]%92 |$;;;;;;;;_R2;_R1$|]}$$$$V2.0',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2337',
  },
  {
    helmDescription: '58. List of peptide of inline Extended Smiles (A,C,D,L)',
    HELMString:
      'PEPTIDE1{[N%91[C@H](C%92=O)C.[*:2]%92.[*:1]%91 |$;;;;;_R2;_R1$|].' +
      '[C%91([C@H](CS%92)N%93)=O.[*:2]%91.[*:1]%93.[*:3]%92 |$;;;;;;_R2;_R1;_R3$|].' +
      '[C%91([C@H](CC(O%92)=O)N%93)=O.[*:1]%93.[*:2]%91.[*:3]%92 |$;;;;;;;;_R1;_R2;_R3$|].' +
      '[C([C@@H](C%91=O)N%92)C(C)C.[*:2]%91.[*:1]%92 |$;;;;;;;;_R2;_R1$|]}$$$$V2.0',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2337',
  },
  {
    helmDescription:
      '59. List of RNAs of inline Extended Smiles (R(A)P, R(C)P, R(G)P)',
    HELMString:
      // eslint-disable-next-line max-len
      'RNA1{[O1[C@@H]%91[C@H](O)[C@H](O%92)[C@H]1CO%93.[*:3]%91.[*:1]%93.[*:2]%92 |$;;;;;;;;;_R3;_R1;_R2$|]([C1(C2=C(N=CN=1)N%91C=N2)N.[*:1]%91 |$;;;;;;;;;;_R1$|])[P%91(O)(O)=O.[*:1]%91 |$;;;;_R1$|]' +
      // eslint-disable-next-line max-len
      '.[O1[C@@H]%91[C@H](O)[C@H](O%92)[C@H]1CO%93.[*:3]%91.[*:1]%93.[*:2]%92 |$;;;;;;;;;_R3;_R1;_R2$|]([C1(N)=NC(=O)N%91C=C1.[*:1]%91 |$;;;;;;;;_R1$|])[P%91(O)(O)=O.[*:1]%91 |$;;;;_R1$|].' +
      // eslint-disable-next-line max-len
      '[O1[C@@H]%91[C@H](O)[C@H](O%92)[C@H]1CO%93.[*:3]%91.[*:1]%93.[*:2]%92 |$;;;;;;;;;_R3;_R1;_R2$|]([C1(C2=C(N=C(N)N1)N%91C=N2)=O.[*:1]%91 |$;;;;;;;;;;;_R1$|])[P%91(O)(O)=O.[*:1]%91 |$;;;;_R1$|]}$$$$V2.0',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2339',
  },
];

test.describe('Import correct HELM sequence: ', () => {
  for (const correctHELMString of correctHELMStrings) {
    test(`${correctHELMString.helmDescription}`, async () => {
      /* 
    Test case1: https://github.com/epam/ketcher/issues/5215
    Test case2: https://github.com/epam/ketcher/issues/5438
    Description: Load correct HELM sequences and compare canvas with the template
    Case:
        1. Load correct HELM via paste from clipboard way
        2. Take screenshot of the canvas to compare it with example
    */
      test.setTimeout(20000);
      if (correctHELMString.pageReloadNeeded) await pageReload(page);

      await loadHELMFromClipboard(page, correctHELMString.HELMString);

      await takeEditorScreenshot(page);

      // Test should be skipped if related bug exists
      test.fixme(
        correctHELMString.shouldFail === true,
        `That test fails because of ${correctHELMString.issueNumber} issue.`,
      );
    });
  }
});

test.describe('Export to HELM: ', () => {
  for (const correctHELMString of correctHELMStrings) {
    test(`${correctHELMString.helmDescription}`, async () => {
      /* 
    Test case: https://github.com/epam/ketcher/issues/5215
    Description: Load correct HELM sequences and compare canvas with the template
    Case:
        1. Load correct HELM via paste from clipboard way
        2. Export canvas to HELM
        2. Compare export result with source HELM string
    */
      test.setTimeout(20000);
      // Test should be skipped if related bug exists
      test.fixme(
        correctHELMString.shouldFail === true,
        `That test fails because of ${correctHELMString.issueNumber} issue.`,
      );
      if (correctHELMString.pageReloadNeeded) await pageReload(page);

      await loadHELMFromClipboard(page, correctHELMString.HELMString);
      await openSaveToHELMDialog(page);
      const HELMExportResult = await page
        .getByTestId('preview-area-text')
        .textContent();

      if (correctHELMString.differentHELMExport) {
        expect(HELMExportResult).toEqual(correctHELMString.differentHELMExport);
      } else {
        expect(HELMExportResult).toEqual(correctHELMString.HELMString);
      }

      await pressButton(page, 'Cancel');
    });
  }
});

const incorrectHELMStrings: IHELMString[] = [
  {
    helmDescription: '1. RNA - Base only',
    HELMString: 'RNA1{(A)}$$$$V2.0',
  },
  {
    helmDescription: '2. No monomer index',
    HELMString: 'RNA{R(A)P}$$$$V2.0',
  },
  {
    helmDescription: '3. Not a HELM content',
    HELMString: 'Bla-bla-blaV2.0',
  },
  {
    helmDescription: '4. wrong sugar name',
    HELMString: 'RNA1{bla-bla-bla(A)P}$$$$V2.0',
  },
  {
    helmDescription: '5. wrong base name',
    HELMString: 'RNA1{R(bla-bla-bla)P}$$$$V2.0',
  },
  {
    helmDescription: '6. wrong phosphate name',
    HELMString: 'RNA1{R(A)bla-bla-bla}$$$$V2.0',
  },
  {
    helmDescription: '7. no RNA name',
    HELMString: 'RNA1{}$$$$V2.0',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2057',
  },
  {
    helmDescription: '8. wrong RNA name',
    HELMString: 'RNA1{bla-bla-bla}$$$$V2.0',
  },
  {
    helmDescription: '9. wrong brakets',
    HELMString: 'RNA1(R(A)P)$$$$V2.0',
  },
  {
    helmDescription: '10. no squire brackets',
    HELMString: 'RNA1{Sm5moe(m2nprn)mepo2}$$$$V2.0',
  },
  {
    helmDescription: '11. No peptide name',
    HELMString: 'PEPTIDE1{}$$$$V2.0',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2057',
  },
  {
    helmDescription: '12. No peptide index',
    HELMString: 'PEPTIDE{L}$$$$V2.0',
  },
  {
    helmDescription: '13. wrong Peptide name',
    HELMString: 'PEPTIDE1{bla-bla-bla}$$$$V2.0',
  },
  {
    helmDescription: '14. wrong brackets',
    HELMString: 'PEPTIDE1(L)$$$$V2.0',
  },
  {
    helmDescription: '15. no ending token',
    HELMString: 'PEPTIDE1{L}',
  },
  {
    helmDescription: '16. no squire brackets',
    HELMString: 'PEPTIDE1{D-gGlu}$$$$V2.0',
  },
  {
    helmDescription: '17. No CHEM name',
    HELMString: 'CHEM1{}$$$$V2.0',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2057',
  },
  {
    helmDescription: '18. No CHEM index',
    HELMString: 'CHEM{[A6OH]}$$$$V2.0',
  },
  {
    helmDescription: '19. wrong CHEM name',
    HELMString: 'CHEM1{[Bla-bla-bla]}$$$$V2.0',
  },
  {
    helmDescription: '20. wrong brackets',
    HELMString: 'CHEM1([A6OH])$$$$V2.0',
  },
  {
    helmDescription: '21. “X” is not valid for CHEM',
    HELMString: 'CHEM1{X}$$$$V2.0',
  },
  {
    helmDescription: '22. “X” is not valid for RNA',
    HELMString: 'RNA1{X}$$$$V2.0',
  },
  {
    helmDescription:
      '23. The character “X” represents one single unknown amino acid in a PEPTIDE polymer.',
    HELMString: 'PEPTIDE1{X}$$$$V2.0',
  },
  {
    helmDescription: '24. The character “*” represents 0..n unknown monomers',
    HELMString: 'CHEM1{*}$$$$V2.0',
  },
  {
    helmDescription:
      '25. Unknown Polymers are marked as BLOB type polymers. These polymers do not contain a list of monomers ' +
      'but they specify their type inside the curly braces. The polymer BLOB1{Bead} for example represents a polymer with the type “Bead”.',
    HELMString: 'BLOB1{}V2.0',
  },
  {
    helmDescription: '26. No monomer index',
    HELMString: 'BLOB{Bead}V2.0',
  },
  {
    helmDescription: '27. CHEM could be the chain of monomers',
    HELMString:
      'CHEM1{[A6OH].[Az].[EG].[MCC].[PEG2].[SMCC].[SMPEG2].[SS3].[hxy].[sDBL]}$$$$V2.0',
  },
  {
    helmDescription: '28. Missing ratio token (PEPTIDE)',
    HELMString: 'PEPTIDE1{(A:+C:0.1)}$$$$V2.0',
  },
  {
    helmDescription: '29. Wrong ratio token type (PEPTIDE)',
    HELMString: 'PEPTIDE1{(A:1.5+C:aaaa)}$$$$V2.0',
  },
  {
    helmDescription: '30. Negative ratio (PEPTIDE)',
    HELMString: 'PEPTIDE1{(A:-10+C:0.1)}$$$$V2.0',
  },
  {
    helmDescription: '31. Missing ratio token (CHEM)',
    HELMString: 'CHEM1{([A6OH]:+[Az]:0.1)}$$$$V2.0',
  },
  {
    helmDescription: '32. Wrong ratio token type (CHEM)',
    HELMString: 'CHEM1{([A6OH]:1.5+[Az]:aaa)}$$$$V2.0',
  },
  {
    helmDescription: '33. Negative ratio (CHEM)',
    HELMString: 'CHEM1{([A6OH]:-10+[Az]:0.1)}$$$$V2.0',
  },
  {
    helmDescription: '34. Missing ratio token (RNA)',
    HELMString: 'RNA1{R(A:+C:200)P}$$$$V2.0',
  },
  {
    helmDescription: '35. Wrong ratio token type (RNA)',
    HELMString: 'RNA1{R(A:100+C:aaa)P}$$$$V2.0',
  },
  {
    helmDescription: '36. Negative ratio (RNA)',
    HELMString: 'RNA1{R(A:-100+C:200)P}$$$$V2.0',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2270',
  },
  {
    helmDescription: '37. Missing probability token (PEPTIDE)',
    HELMString: 'PEPTIDE1{(A:,C:20)}$$$$V2.0',
  },
  {
    helmDescription: '38. Wrong probability token type (PEPTIDE)',
    HELMString: 'PEPTIDE1{(A:10,C:aaa)}$$$$V2.0',
  },
  {
    helmDescription: '39. Negative probability (PEPTIDE)',
    HELMString: 'PEPTIDE1{(A:-10,C:20)}$$$$V2.0',
  },
  {
    helmDescription: '40. Probability is greater than 100 (PEPTIDE)',
    HELMString: 'PEPTIDE1{(A:10,C:1000)}$$$$V2.0',
  },
  {
    helmDescription: '41. Missing probability token (CHEM)',
    HELMString: 'CHEM1{([A6OH]:,[Az]:20)}$$$$V2.0',
  },
  {
    helmDescription: '42. Wrong probability token type (CHEM)',
    HELMString: 'CHEM1{([A6OH]:10,[Az]:aaa)}$$$$V2.0',
  },
  {
    helmDescription: '43. Negative probability (CHEM)',
    HELMString: 'CHEM1{([A6OH]:-10,[Az]:20)}$$$$V2.0',
  },
  {
    helmDescription: '44. Probability is greater than 100 (CHEM)',
    HELMString: 'CHEM1{([A6OH]:10,[Az]:1000)}$$$$V2.0',
  },
  {
    helmDescription: '45. Missing probability token (RNA)',
    HELMString: 'RNA1{R(A:,C:90)P}$$$$V2.0',
  },
  {
    helmDescription: '46. Wrong probability token type (RNA)',
    HELMString: 'RNA1{(R(A:10,C:aaa)P}$$$$V2.0',
  },
  {
    helmDescription: '47. Negative probability (RNA)',
    HELMString: 'RNA1{(R(A:-10,C:90)P}$$$$V2.0',
  },
  {
    helmDescription: '48. Probability is greater than 100 (RNA)',
    HELMString: 'RNA1{(R(A:10,C:1000)P}$$$$V2.0',
  },
  {
    helmDescription:
      '49. CHEM monomers cannot be at the terminus of a set of repeating monomers as the connection order is not defined for CHEMs.',
    HELMString: "CHEM1{[SMPEG2]'5'}$$$$V2.0",
  },
  {
    helmDescription: '50. Negative repeating number (RNA)',
    HELMString: "RNA1{[Sm5moe]([m2nprn])[mepo2]'-5'}$$$$V2.0",
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2062',
  },
  {
    helmDescription: '51. Negative repeating number (PEPTIDE)',
    HELMString: "PEPTIDE1{[D-gGlu]'-5'}$$$$V2.0",
  },
  {
    helmDescription: '52. Negative repeating number (CHEM)',
    HELMString: "CHEM1{[SMPEG2]'-5'}$$$$V2.0",
  },
  {
    helmDescription:
      '53. Repeating in groups for CHEMS cannot be at the terminus of a set of repeating monomers as the connection order is not defined for CHEMs.',
    HELMString:
      "CHEM1{[A6OH].[Az]'2'.[EG]'3'.[MCC]'4'.[PEG2]'5'.[SMCC]'6'}$$$$V2.0",
  },
  {
    helmDescription:
      '54. Group of CHEM monomers cannot be at the terminus of a set of repeating monomers as the connection order is not defined for CHEMs.',
    HELMString: "CHEM1{([Az]+[EG]+[MCC]+[PEG2]+[SMCC])'5'}$$$$V2.0",
  },
  {
    helmDescription: '55. Negative repeating number (PEPTIDE)',
    HELMString: "PEPTIDE1{([Aad]+[Abu]+[Aca]+[Aib]+[Apm])'-5'}$$$$V2.0",
  },
  {
    helmDescription: '56. Negative repeating number (CHEM)',
    HELMString: "CHEM1{([Az]+[EG]+[MCC]+[PEG2]+[SMCC])'-5'}$$$$V2.0",
  },
  {
    helmDescription: '57. Negative repeating number',
    HELMString:
      "RNA1{([Sm5moe]([m2nprn])[mepo2]+[menoe2]([nobn6p])[m2nen]+[bnoe2r]([nC6n2G])[fl2me]+[m2nc2r]([nC6n8A])[mepo2])'-5'}$$$$V2.0",
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2277',
  },
  {
    helmDescription:
      '58. CHEM monomers cannot be at the terminus of a set of repeating monomers as the connection order is not defined for CHEMs.',
    HELMString: "CHEM1{[SMPEG2]'3-7'}$$$$V2.0",
  },
  {
    helmDescription: '59. Invalid range (RNA)',
    HELMString: "RNA1{[Sm5moe]([m2nprn])[mepo2]'5-i'}$$$$V2.0",
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2062',
  },
  {
    helmDescription: '60. Invalid range (PEPTIDE)',
    HELMString: "PEPTIDE1{[D-gGlu]'5-i'}$$$$V2.0",
  },
  {
    helmDescription: '61. Invalid range (CHEM)',
    HELMString: "CHEM1{[SMPEG2]'5-i'}$$$$V2.0",
  },
  {
    helmDescription: '62. Range for CHEMS is impossible',
    HELMString:
      "CHEM1{[A6OH]'1-2'.[Az]'2-3'.[EG]'3-4'.[MCC]'4-5'.[PEG2]'5-6'.[SMCC]'6-7'}$$$$V2.0",
  },
  {
    helmDescription: '63. Range for CHEMS is impossible',
    HELMString: "CHEM1{([Az]+[EG]+[MCC]+[PEG2]+[SMCC])'3-7'}$$$$V2.0",
  },
  {
    helmDescription: '64. Invalid range (PEPTIDE)',
    HELMString: "PEPTIDE1{([Aad]+[Abu]+[Aca]+[Aib]+[Apm])'5-i'}$$$$V2.0",
  },
  {
    helmDescription: '65. Invalid range (CHEM)',
    HELMString: "CHEM1{([Az]+[EG]+[MCC]+[PEG2]+[SMCC])'5-i'}$$$$V2.0",
  },
  {
    helmDescription: '66. Invalid range (RNA)',
    HELMString:
      "RNA1{([Sm5moe]([m2nprn])[mepo2]+[menoe2]([nobn6p])[m2nen]+[bnoe2r]([nC6n2G])[fl2me]+[m2nc2r]([nC6n8A])[mepo2])'5-i'}$$$$V2.0",
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2279',
  },
  {
    helmDescription: '66. Wrong polymer name index (CHEM)',
    HELMString: 'CHEM1{[A6OH]}|PEPTIDE1{A}$CHEM10,PEPTIDE1,1:R2-1:R1$$$V2.0',
  },
  {
    helmDescription: '67. Wrong polymer name in connections section',
    HELMString: 'CHEM1{[A6OH]}|PEPTIDE1{A}$BlaBlaBla,PEPTIDE1,1:R2-1:R1$$$V2.0',
  },
  {
    helmDescription: '68. Wrong monomer index in polymer',
    HELMString: 'PEPTIDE1{A}|RNA1{R(A)P}$RNA1,PEPTIDE1,5:R2-1:R1$$$V2.0V2.0',
  },
  {
    helmDescription:
      "69. Wrong connection point (R4 doesn't exist for A6OH chem)",
    HELMString: 'CHEM1{[A6OH]}|PEPTIDE1{A}$CHEM1,PEPTIDE1,1:R4-1:R1$$$V2.0',
  },
  {
    helmDescription: '70. Missing monomer name',
    HELMString: 'RNA1{R(A)P}|CHEM1{[A6OH]}$CHEM1,1:R1-3:R2$$$V2.0',
  },
  {
    helmDescription: '71. Missing connection points',
    HELMString: 'CHEM1{[A6OH]}|PEPTIDE1{A}$CHEM1,PEPTIDE1$$$V2.0',
  },
  {
    helmDescription:
      '72. RNA(rA) with single inline SMILES (A) without attachment points',
    HELMString: 'RNA1{R([C1(N)=NC=NC2N([H])C=NC1=2])}$$$$V2.0',
  },
  {
    helmDescription:
      '73. RNA(rp) with single inline SMILES (p) without attachment points',
    HELMString: 'RNA1{R[P(O)(O)(=O)O]}$$$$V2.0',
  },
  {
    helmDescription:
      '74. RNA(rAp) with  single inline SMILES (r) without attachment points',
    HELMString: 'RNA1{[O1[C@@H](O)[C@H](O)[C@H](O[H])[C@H]1CO[H]](A)P}$$$$V2.0',
  },
  {
    helmDescription: '75. no ending token (RNA)',
    HELMString: 'RNA1{R(A)P}',
  },
  {
    helmDescription: '76. no ending token (CHEM)',
    HELMString: 'CHEM1{[A6OH]}',
  },
  {
    helmDescription: '77. no ending token (PEPTIDE)',
    HELMString: 'PEPTIDE1{L}',
  },
  {
    helmDescription:
      '78. RNA(R(A)P) with inline SMILES (A) without attachment points',
    HELMString:
      'RNA1{[O1[C@@H]%91[C@H](O)[C@H](O%92)[C@H]1CO%93.[*:3]%91.[*:1]%93.[*:2]%92 |$;;;;;;;;;_R3;_R1;_R2$|]' +
      '([C1(N)=NC=NC2N([H])C=NC1=2])' +
      '[P%91(O)(O)=O.[*:1]%91 |$;;;;_R1$|]}$$$$V2.0',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2339',
  },
  {
    helmDescription:
      '79. RNA(RP) with single inline SMILES (P) without attachment points',
    HELMString: 'RNA1{R[P(O)(O)(=O)O]}$$$$V2.0',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2361',
  },
  {
    helmDescription:
      '80. RNA(R(A)P) with  single inline SMILES (R) without attachment points',
    HELMString: 'RNA1{[O1[C@@H](O)[C@H](O)[C@H](O[H])[C@H]1CO[H]](A)P}$$$$V2.0',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/Indigo/issues/2339',
  },
  {
    helmDescription:
      '81. List of peptide of inline Smiles (A,C,D,L) - no attachment points',
    HELMString:
      'PEPTIDE1{[N([H])[C@H](C(O)=O)C].[C(O)([C@H](CS[H])N[H])=O].[C(O)([C@H](CC(O[H])=O)N[H])=O].[C([C@@H](C(O)=O)N[H])C(C)C]}$$$$V2.0',
  },
];

test.describe('Import incorrect HELM sequence: ', () => {
  for (const incorrectHELMString of incorrectHELMStrings) {
    test(`${incorrectHELMString.helmDescription}`, async () => {
      /* 
      Test case: https://github.com/epam/ketcher/issues/5215
      Description: Load INCORRECT HELM sequences and compare canvas (with error message) with the template
      Case:
        1. Load icorrect HELM
        2. Get error message
        3. Take screenshot to compare it with example
      */
      test.setTimeout(20000);
      if (incorrectHELMString.pageReloadNeeded) await pageReload(page);

      await loadHELMFromClipboard(page, incorrectHELMString.HELMString);
      await takeEditorScreenshot(page);

      // if Error Message is not found - that means that error message didn't appear.
      // That shoul be considered as bug in that case
      const errorMessage = page.getByText('Error message', {
        exact: true,
      });

      if (await errorMessage.isVisible()) {
        await closeErrorMessage(page);
        await closeOpenStructure(page);
      }

      // Test should be skipped if related bug exists
      test.fixme(
        incorrectHELMString.shouldFail === true,
        `That test fails because of ${incorrectHELMString.issueNumber} issue.`,
      );
    });
  }
});
