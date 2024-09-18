/* eslint-disable no-magic-numbers */
import {
  chooseFileFormat,
  turnOnMacromoleculesEditor,
} from '@utils/macromolecules';
import { Page, test, BrowserContext, chromium } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForIndigoToLoad,
  waitForKetcherInit,
  openStructurePasteFromClipboard,
  waitForSpinnerFinishedWork,
  selectClearCanvasTool,
  delay,
} from '@utils';
import { pageReload } from '@utils/common/helpers';

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
async function hoverMouseOverMonomer(page: Page, monomerLocatorIndex: number) {
  await page.locator('use').nth(monomerLocatorIndex).hover();
}

interface IHELMString {
  testDescription: string;
  HELMString: string;
  monomerLocatorIndex: number;
  // Set shouldFail to true if you expect test to fail because of existed bug and put issues link to issueNumber
  shouldFail?: boolean;
  // issueNumber is mandatory if shouldFail === true
  issueNumber?: string;
  // set pageReloadNeeded to true if you need to restart ketcher before test (f.ex. to restart font renderer)
  pageReloadNeeded?: boolean;
}

const ambiguousMonomers: IHELMString[] = [
  {
    testDescription: '1. Peptide X (alternatives, from library)',
    HELMString:
      'PEPTIDE1{(A,C,D,E,F,G,H,I,K,L,M,N,O,P,Q,R,S,T,U,V,W,Y)}$$$$V2.0',
    monomerLocatorIndex: 0,
  },
  {
    testDescription: '2. Peptide B (alternatives, from library)',
    HELMString: 'PEPTIDE2{(D,N)}$$$$V2.0',
    monomerLocatorIndex: 0,
  },
  {
    testDescription: '3. Alternatives of 10 Peptides (no probabilities)',
    HELMString: 'PEPTIDE1{(L,K,I,H,G,F,E,D,C,A)}$$$$V2.0',
    monomerLocatorIndex: 0,
  },
  {
    testDescription:
      '4. Alternatives of 10 Peptides (multi-char name, no probabilities)',
    HELMString:
      'PEPTIDE1{([D-2Pal],[Cys_Bn],[AspOMe],[D-gGlu],[aMePhe],[Chg],[dH],[aIle],[Aad],[Ar5c])}$$$$V2.0',
    monomerLocatorIndex: 0,
  },
  {
    testDescription: '5. Alternatives of 10 Peptides (with probabilities)',
    HELMString: 'PEPTIDE1{(L:1,K:3,I:5,H:7,G:9,F:55,E:8,D:6,C:4,A:2)}$$$$V2.0',
    monomerLocatorIndex: 0,
  },
  {
    testDescription:
      '6. Alternatives of 10 Peptides (multi-char name, with probabilities)',
    HELMString:
      'PEPTIDE1{([D-2Pal]:1,[Cys_Bn]:3,[AspOMe]:5,[D-gGlu]:7,[aMePhe]:9,[Chg]:55,[dH]:8,[aIle]:6,[Aad]:4,[Ar5c]:2)}$$$$V2.0',
    monomerLocatorIndex: 0,
  },
  {
    testDescription: '7. Peptide X (Mixture, no quantities, from library)',
    HELMString:
      'PEPTIDE1{(A+C+D+E+F+G+H+I+K+L+M+N+O+P+Q+R+S+T+U+V+W+Y)}$$$$V2.0',
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5534',
  },
  {
    testDescription: '8. Peptide B (Mixture, from library)',
    HELMString: 'PEPTIDE2{(D+N)}$$$$V2.0',
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5534',
  },
  {
    testDescription: '9. Mixture of 10 Peptides (no quantities)',
    HELMString: 'PEPTIDE1{(L+K+I+H+G+F+E+D+C+A)}$$$$V2.0',
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5534',
  },
  {
    testDescription:
      '10. Mixture of 10 Peptides (multi-char name, no quantities)',
    HELMString:
      'PEPTIDE1{([D-2Pal]+[Cys_Bn]+[AspOMe]+[D-gGlu]+[aMePhe]+[Chg]+[dH]+[aIle]+[Aad]+[Ar5c])}$$$$V2.0',
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5534',
  },
  {
    testDescription: '11. Mixture of 10 Peptides (with quantities)',
    HELMString: 'PEPTIDE1{(L:1+K:3+I:5+H:7+G:9+F:10+E:8+D:6+C:4+A:2)}$$$$V2.0',
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5534',
  },
  {
    testDescription:
      '12. Mixture of 10 Peptides (multi-char name, with quantities)',
    HELMString:
      'PEPTIDE1{([D-2Pal]:1+[Cys_Bn]:3+[AspOMe]:5+[D-gGlu]:7+[aMePhe]:9+[Chg]:5+[dH]:8+[aIle]:6+[Aad]:4+[Ar5c]:2)}$$$$V2.0',
    monomerLocatorIndex: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5534',
  },
  {
    testDescription:
      '13. RNA Base N (alternative, no probabilities, from the library)',
    HELMString: 'RNA1{R(U,G,C,A)P}$$$$V2.0',
    monomerLocatorIndex: 1,
  },
  {
    testDescription:
      '14. RNA Base B (alternative, no probabilities, from the library)',
    HELMString: 'RNA1{R(U,G,C)P}$$$$V2.0',
    monomerLocatorIndex: 1,
  },
  {
    testDescription:
      '15. DNA Base N (alternative, no probabilities, from the library)',
    HELMString: 'RNA1{[dR](T,G,C,A)P}$$$$V2.0',
    monomerLocatorIndex: 1,
  },
  {
    testDescription:
      '16. DNA Base B (alternative, no probabilities, from the library)',
    HELMString: 'RNA1{[dR](T,G,C)P}$$$$V2.0',
    monomerLocatorIndex: 1,
  },
  {
    testDescription:
      '17. DNA Base B (alternative, with probabilities, from the library)',
    HELMString: 'RNA1{[dR](T:20,G:50,C:30)P}$$$$V2.0',
    monomerLocatorIndex: 1,
  },
  {
    testDescription:
      '18. Base M (alternative, no probabilities, from the library)',
    HELMString: 'RNA1{R(C,A)P}$$$$V2.0',
    monomerLocatorIndex: 1,
  },
  {
    testDescription:
      '19. Base R (alternative, no probabilities, from the library)',
    HELMString: 'RNA1{R(G,A)P}$$$$V2.0',
    monomerLocatorIndex: 1,
  },
  {
    testDescription:
      '20. Alternatives of 10 bases (multi-char, no probabilities)',
    HELMString:
      'RNA1{R([2imen2],[5meC],[4imen2],[cnes4T],[5eU],[dfB],[4ime6A],[ac4C],[allyl9],[cneT])P}$$$$V2.0',
    monomerLocatorIndex: 1,
  },
  {
    testDescription:
      '21. Alternatives of 10 bases (multi-char, with probabilities)',
    HELMString:
      'RNA1{R([2imen2]:1,[5meC]:3,[4imen2]:5,[cnes4T]:7,[5eU]:9,[dfB]:55,[4ime6A]:8,[ac4C]:6,[allyl9]:4,[cneT]:2)P}$$$$V2.0',
    monomerLocatorIndex: 1,
  },
  {
    testDescription: '22. RNA Base N (mixture, no quantities, from library)',
    HELMString: 'RNA1{R(U+G+C+A)P}$$$$V2.0',
    monomerLocatorIndex: 1,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5534',
  },
  {
    testDescription: '23. RNA Base B (mixture, no quantities, from library)',
    HELMString: 'RNA1{R(U+G+C)P}$$$$V2.0',
    monomerLocatorIndex: 1,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5534',
  },
  {
    testDescription: '24. RNA Base B (mixture, with quantities, from library)',
    HELMString: 'RNA1{R(U:20+G:50+C:30)P}$$$$V2.0',
    monomerLocatorIndex: 1,
  },
  {
    testDescription: '25. DNA Base N (mixture, no quantities, from library)',
    HELMString: 'RNA1{[dR](T+G+C+A)P}$$$$V2.0',
    monomerLocatorIndex: 1,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5534',
  },
  {
    testDescription: '26. DNA Base B (mixture, no quantities, from library)',
    HELMString: 'RNA1{[dR](T+G+C)P}$$$$V2.0',
    monomerLocatorIndex: 1,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5534',
  },
  {
    testDescription: '27. DNA Base B (mixture, with quantities, from library)',
    HELMString: 'RNA1{[dR](T:20+G:50+C:30)P}$$$$V2.0',
    monomerLocatorIndex: 1,
  },
  {
    testDescription: '28. Base M (mixture, no quantities, from library)',
    HELMString: 'RNA1{R(C+A)P}$$$$V2.0',
    monomerLocatorIndex: 1,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5534',
  },
  {
    testDescription: '29. Base R (mixture, no quantities, from library)',
    HELMString: 'RNA1{R(G+A)P}$$$$V2.0',
    monomerLocatorIndex: 1,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5534',
  },
  {
    testDescription: '30. Base R (mixture, with quantities, from library)',
    HELMString: 'RNA1{R(G:30+A:70)P}$$$$V2.0',
    monomerLocatorIndex: 1,
  },
  {
    testDescription: '31. Mixture of 10 bases (multi-char, no quantities)',
    HELMString:
      'RNA1{R([2imen2]+[5meC]+[4imen2]+[cnes4T]+[5eU]+[dfB]+[4ime6A]+[ac4C]+[allyl9]+[cneT])P}$$$$V2.0',
    monomerLocatorIndex: 1,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5534',
  },
  {
    testDescription: '32. Mixture of 10 bases (multi-char, with quantities)',
    HELMString:
      'RNA1{R([2imen2]:1+[5meC]:3+[4imen2]:5+[cnes4T]:7+[5eU]:9+[dfB]:55+[4ime6A]:8+[ac4C]:6+[allyl9]:4+[cneT]:2)P}$$$$V2.0',
    monomerLocatorIndex: 1,
  },
];

test.describe('Preview tooltips checks: ', () => {
  for (const ambiguousMonomer of ambiguousMonomers) {
    test(`${ambiguousMonomer.testDescription}`, async () => {
      /* 
        Test case1: https://github.com/epam/ketcher/issues/5529
        Description: Verify that the ambiguous monomer preview displays a list of full names of monomers making up the ambiguous
        Case:
            1. Load correct HELM via paste from clipboard way
            2. Hover mouse over monomer, wait for preview tooltip
            2. Take screenshot of the canvas to compare it with example
        */
      test.setTimeout(20000);
      if (ambiguousMonomer.pageReloadNeeded) await pageReload(page);

      await loadHELMFromClipboard(page, ambiguousMonomer.HELMString);
      await hoverMouseOverMonomer(page, ambiguousMonomer.monomerLocatorIndex);
      await delay(1);

      await takeEditorScreenshot(page);

      // Test should be skipped if related bug exists
      test.fixme(
        ambiguousMonomer.shouldFail === true,
        `That test fails because of ${ambiguousMonomer.issueNumber} issue.`,
      );
    });
  }
});
