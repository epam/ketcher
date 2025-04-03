/* eslint-disable no-magic-numbers */
import { chooseFileFormat, zoomWithMouseWheel } from '@utils/macromolecules';
import { Page, test, BrowserContext, chromium } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForIndigoToLoad,
  waitForKetcherInit,
  openStructurePasteFromClipboard,
  waitForSpinnerFinishedWork,
  selectMacroBond,
} from '@utils';
import { pageReload } from '@utils/common/helpers';
import { MacroBondTool } from '@utils/canvas/tools/selectNestedTool/types';
import {
  selectClearCanvasTool,
  turnOnMacromoleculesEditor,
} from '@tests/pages/common/TopLeftToolbar';

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
  // await resetZoomLevelToDefault(page);
  await selectClearCanvasTool(page);
  // await resetZoomLevelToDefault(page)
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
    testDescription:
      '1. Ambiguous alternatives peptide made of peptide(R1) and peptide(R1) should result in peptide(R1)',
    HELMString: 'PEPTIDE1{([Pyrro],[-Am])}$$$V2.0',
    monomerLocatorIndex: 2,
  },
  {
    testDescription:
      '2. Ambiguous alternatives peptide made of peptide(R2) and peptide(R2) should result in peptide(R2)',
    HELMString: 'PEPTIDE1{([Glc],[Hva])}$$$V2.0',
    monomerLocatorIndex: 2,
  },
  {
    testDescription:
      '3. Ambiguous alternatives peptide made of peptide(R2+R3) and peptide(R2+R3) should result in peptide(R2+R3)',
    HELMString: 'PEPTIDE1{([Mpa],[Mba])}$$$V2.0',
    monomerLocatorIndex: 2,
  },
  {
    testDescription:
      '4. Ambiguous alternatives peptide made of peptide(R1+R2) and peptide(R1+R2) should result in peptide(R1+R2)',
    HELMString: 'PEPTIDE1{([D-Nle],[2Nal])}$$$V2.0',
    monomerLocatorIndex: 2,
  },
  {
    testDescription:
      '5. Ambiguous alternatives peptide made of peptide(R1+R2+R3) and peptide(R1+R2+R3) should result in peptide(R1+R2+R3)',
    HELMString: 'PEPTIDE1{([Aad],[Asu])}$$$V2.0',
    monomerLocatorIndex: 2,
  },
  {
    testDescription:
      '6. Ambiguous alternatives peptide made of peptide(R1) and peptide(R1+R2+R3) should result in peptide(R1)',
    HELMString: 'PEPTIDE1{([Pyrro],[Asu])}$$$V2.0',
    monomerLocatorIndex: 2,
  },
  {
    testDescription:
      '7. Ambiguous alternatives peptide made of peptide(R2) and peptide(R1) should result in peptide with no APs',
    HELMString: 'PEPTIDE1{([Glc],[-Am])}$$$V2.0',
    monomerLocatorIndex: 2,
  },
  {
    testDescription:
      '8. Ambiguous alternatives peptide made of peptide(R2+R3) and peptide(R2) should result in peptide(R2)',
    HELMString: 'PEPTIDE1{([Mpa],[Hva])}$$$V2.0',
    monomerLocatorIndex: 2,
  },
  {
    testDescription:
      '9. Ambiguous alternatives peptide made of peptide(R1+R2) and peptide(R2+R3) should result in peptide(R2)',
    HELMString: 'PEPTIDE1{([D-Nle],[Mba])}$$$V2.0',
    monomerLocatorIndex: 2,
  },
  {
    testDescription:
      '10. Ambiguous alternatives peptide made of peptide(R1+R2+R3) and peptide(R1+R2) should result in peptide(R1+R2)',
    HELMString: 'PEPTIDE1{([Aad],[2Nal])}$$$V2.0',
    monomerLocatorIndex: 2,
  },
  {
    testDescription:
      '11. Ambiguous alternatives peptide made of peptide(R1) and peptide(R1+R2) should result in peptide(R1)',
    HELMString: 'PEPTIDE1{([Pyrro],[2Nal])}$$$V2.0',
    monomerLocatorIndex: 2,
  },
  {
    testDescription:
      '12. Ambiguous alternatives peptide made of peptide(R2) and peptide(R1+R2+R3) should result in peptide(R2)',
    HELMString: 'PEPTIDE1{([Glc],[Asu])}$$$V2.0',
    monomerLocatorIndex: 2,
  },
  {
    testDescription:
      '13. Ambiguous alternatives peptide made of peptide(R2+R3) and peptide(R1) should result in peptide with no APs',
    HELMString: 'PEPTIDE1{([Mpa],[-Am])}$$$V2.0',
    monomerLocatorIndex: 2,
  },
  {
    testDescription:
      '14. Ambiguous alternatives peptide made of peptide(R1+R2) and peptide(R2) should result in peptide(R2)',
    HELMString: 'PEPTIDE1{([D-Nle],[Hva])}$$$V2.0',
    monomerLocatorIndex: 2,
  },
  {
    testDescription:
      '15. Ambiguous alternatives peptide made of peptide(R1+R2+R3) and peptide(R2+R3) should result in peptide(R2+R3)',
    HELMString: 'PEPTIDE1{([Aad],[Mba])}$$$V2.0',
    monomerLocatorIndex: 2,
  },
  {
    testDescription:
      '16. Ambiguous mixed peptide made of peptide(R1) and peptide(R1) should result in peptide(R1)',
    HELMString: 'PEPTIDE1{([Pyrro]+[-Am])}$$$V2.0',
    monomerLocatorIndex: 2,
  },
  {
    testDescription:
      '17. Ambiguous mixed peptide made of peptide(R2) and peptide(R2) should result in peptide(R2)',
    HELMString: 'PEPTIDE1{([Glc]+[Hva])}$$$V2.0',
    monomerLocatorIndex: 2,
  },
  {
    testDescription:
      '18. Ambiguous mixed peptide made of peptide(R2+R3) and peptide(R2+R3) should result in peptide(R2+R3)',
    HELMString: 'PEPTIDE1{([Mpa]+[Mba])}$$$V2.0',
    monomerLocatorIndex: 2,
  },
  {
    testDescription:
      '19. Ambiguous mixed peptide made of peptide(R1+R2) and peptide(R1+R2) should result in peptide(R1+R2)',
    HELMString: 'PEPTIDE1{([D-Nle]+[2Nal])}$$$V2.0',
    monomerLocatorIndex: 2,
  },
  {
    testDescription:
      '20. Ambiguous mixed peptide made of peptide(R1+R2+R3) and peptide(R1+R2+R3) should result in peptide(R1+R2+R3)',
    HELMString: 'PEPTIDE1{([Aad]+[Asu])}$$$V2.0',
    monomerLocatorIndex: 2,
  },
  {
    testDescription:
      '21. Ambiguous mixed peptide made of peptide(R1) and peptide(R1+R2+R3) should result in peptide(R1)',
    HELMString: 'PEPTIDE1{([Pyrro]+[Asu])}$$$V2.0',
    monomerLocatorIndex: 2,
  },
  {
    testDescription:
      '22. Ambiguous mixed peptide made of peptide(R2) and peptide(R1) should result in peptide with no APs',
    HELMString: 'PEPTIDE1{([Glc]+[-Am])}$$$V2.0',
    monomerLocatorIndex: 2,
  },
  {
    testDescription:
      '23. Ambiguous mixed peptide made of peptide(R2+R3) and peptide(R2) should result in peptide(R2)',
    HELMString: 'PEPTIDE1{([Mpa]+[Hva])}$$$V2.0',
    monomerLocatorIndex: 2,
  },
  {
    testDescription:
      '24. Ambiguous mixed peptide made of peptide(R1+R2) and peptide(R2+R3) should result in peptide(R2)',
    HELMString: 'PEPTIDE1{([D-Nle]+[Mba])}$$$V2.0',
    monomerLocatorIndex: 2,
  },
  {
    testDescription:
      '25. Ambiguous mixed peptide made of peptide(R1+R2+R3) and peptide(R1+R2) should result in peptide(R1+R2)',
    HELMString: 'PEPTIDE1{([Aad]+[2Nal])}$$$V2.0',
    monomerLocatorIndex: 2,
  },
  {
    testDescription:
      '26. Ambiguous mixed peptide made of peptide(R1) and peptide(R1+R2) should result in peptide(R1)',
    HELMString: 'PEPTIDE1{([Pyrro]+[2Nal])}$$$V2.0',
    monomerLocatorIndex: 2,
  },
  {
    testDescription:
      '27. Ambiguous mixed peptide made of peptide(R2) and peptide(R1+R2+R3) should result in peptide(R2)',
    HELMString: 'PEPTIDE1{([Glc]+[Asu])}$$$V2.0',
    monomerLocatorIndex: 2,
  },
  {
    testDescription:
      '28. Ambiguous mixed peptide made of peptide(R2+R3) and peptide(R1) should result in peptide with no APs',
    HELMString: 'PEPTIDE1{([Mpa]+[-Am])}$$$V2.0',
    monomerLocatorIndex: 2,
  },
  {
    testDescription:
      '29. Ambiguous mixed peptide made of peptide(R1+R2) and peptide(R2) should result in peptide(R2)',
    HELMString: 'PEPTIDE1{([D-Nle]+[Hva])}$$$V2.0',
    monomerLocatorIndex: 2,
  },
  {
    testDescription:
      '30. Ambiguous mixed peptide made of peptide(R1+R2+R3) and peptide(R2+R3) should result in peptide(R2+R3)',
    HELMString: 'PEPTIDE1{([Aad]+[Mba])}$$$V2.0',
    monomerLocatorIndex: 2,
  },
  {
    testDescription:
      '31. Ambiguous alternatives base made of base(R1) and base(R1) should result in base(R1)',
    HELMString: 'RNA1{R([2imen2],[5meC])P}$$$$V2.0',
    monomerLocatorIndex: 3,
    pageReloadNeeded: true,
  },
  {
    testDescription:
      '32. Ambiguous alternatives base made of base(R1+R2) and base(R1+R2) should result in base(R1+R2)',
    HELMString: 'RNA1{R([oC64m5],[nC65U])P}$$$$V2.0',
    monomerLocatorIndex: 3,
  },
  {
    testDescription:
      '33. Ambiguous alternatives base made of base(R1+R2+R3) and base(R1+R2+R3) should result in base(R1+R2+R3)',
    HELMString: 'RNA1{R([nC6n5C],[nC6n8A])P}$$$$V2.0',
    monomerLocatorIndex: 3,
  },
  {
    testDescription:
      '34. Ambiguous alternatives base made of base(R1) and base(R1+R2+R3) should result in base(R1)',
    HELMString: 'RNA1{R([2imen2],[nC6n8A])P}$$$$V2.0',
    monomerLocatorIndex: 3,
  },
  {
    testDescription:
      '35. Ambiguous alternatives base made of base(R1+R2) and base(R1) should result in base(R1)',
    HELMString: 'RNA1{R([oC64m5],[5meC])P}$$$$V2.0',
    monomerLocatorIndex: 3,
  },
  {
    testDescription:
      '36. Ambiguous alternatives base made of base(R1+R2+R3) and base(R1+R2) should result in base(R1+R2)',
    HELMString: 'RNA1{R([nC6n5C],[nC65U])P}$$$$V2.0',
    monomerLocatorIndex: 3,
  },
  {
    testDescription:
      '37. Ambiguous mixed base made of base(R1) and base(R1) should result in base(R1)',
    HELMString: 'RNA1{R([2imen2]+[5meC])P}$$$$V2.0',
    monomerLocatorIndex: 3,
  },
  {
    testDescription:
      '38. Ambiguous mixed base made of base(R1+R2) and base(R1+R2) should result in base(R1+R2)',
    HELMString: 'RNA1{R([oC64m5]+[nC65U])P}$$$$V2.0',
    monomerLocatorIndex: 3,
  },
  {
    testDescription:
      '39. Ambiguous mixed base made of base(R1+R2+R3) and base(R1+R2+R3) should result in base(R1+R2+R3)',
    HELMString: 'RNA1{R([nC6n5C]+[nC6n8A])P}$$$$V2.0',
    monomerLocatorIndex: 3,
  },
  {
    testDescription:
      '40. Ambiguous mixed base made of base(R1) and base(R1+R2+R3) should result in base(R1)',
    HELMString: 'RNA1{R([2imen2]+[nC6n8A])P}$$$$V2.0',
    monomerLocatorIndex: 3,
  },
  {
    testDescription:
      '41. Ambiguous mixed base made of base(R1+R2) and base(R1) should result in base(R1)',
    HELMString: 'RNA1{R([oC64m5]+[5meC])P}$$$$V2.0',
    monomerLocatorIndex: 3,
  },
  {
    testDescription:
      '42. Ambiguous mixed base made of base(R1+R2+R3) and base(R1+R2) should result in base(R1+R2)',
    HELMString: 'RNA1{R([nC6n5C]+[nC65U])P}$$$$V2.0',
    monomerLocatorIndex: 3,
  },
];

test.describe('Monomer APs checks: ', () => {
  for (const ambiguousMonomer of ambiguousMonomers) {
    test(`${ambiguousMonomer.testDescription}`, async () => {
      /* 
          Test case1: https://github.com/epam/ketcher/issues/5614
          Description: Verify that the ambiguous monomer has an attachment point Rn only if all the monomers making up that ambiguous monomer have the attachment point Rn.
          Case:
              1. Load correct HELM via paste from clipboard way
              2. Turn on Single Bond tool
              3. Hover mouse over monomer
              4. Take screenshot of the canvas to compare it with example
          */
      test.setTimeout(25000);
      if (ambiguousMonomer.pageReloadNeeded) await pageReload(page);
      await zoomWithMouseWheel(page, -600);

      await loadHELMFromClipboard(page, ambiguousMonomer.HELMString);
      await selectMacroBond(page, MacroBondTool.SINGLE);
      await hoverMouseOverMonomer(page, ambiguousMonomer.monomerLocatorIndex);
      await takeEditorScreenshot(page, {
        hideMonomerPreview: true,
      });

      await zoomWithMouseWheel(page, 600);
      // Test should be skipped if related bug exists
      test.fixme(
        ambiguousMonomer.shouldFail === true,
        `That test fails because of ${ambiguousMonomer.issueNumber} issue.`,
      );
    });
  }
});
