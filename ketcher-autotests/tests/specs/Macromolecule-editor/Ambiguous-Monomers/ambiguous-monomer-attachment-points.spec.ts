/* eslint-disable no-magic-numbers */
import { zoomWithMouseWheel } from '@utils/macromolecules';
import { Page, test } from '@fixtures';
import {
  takeEditorScreenshot,
  MonomerType,
  waitForPageInit,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
} from '@utils';
import { pageReload } from '@utils/common/helpers';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MacroBondType } from '@tests/pages/constants/bondSelectionTool/Constants';
import {
  getMonomerLocator,
  MonomerLocatorOptions,
} from '@utils/macromolecules/monomer';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';

let page: Page;

async function configureInitialState(page: Page) {
  await Library(page).switchToRNATab();
}

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();

  await waitForPageInit(page);
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await configureInitialState(page);
});

test.afterEach(async () => {
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  // await resetZoomLevelToDefault(page);
  await CommonTopLeftToolbar(page).clearCanvas();
  // await resetZoomLevelToDefault(page)
});

test.afterAll(async ({ browser }) => {
  await Promise.all(browser.contexts().map((context) => context.close()));
});

interface IHELMString {
  testDescription: string;
  HELMString: string;
  monomerLocatorOptions: MonomerLocatorOptions;
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
    HELMString: 'PEPTIDE1{([Pyrro],[-Am])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
  },
  {
    testDescription:
      '2. Ambiguous alternatives peptide made of peptide(R2) and peptide(R2) should result in peptide(R2)',
    HELMString: 'PEPTIDE1{([Glc],[Hva])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
  },
  {
    testDescription:
      '3. Ambiguous alternatives peptide made of peptide(R2+R3) and peptide(R2+R3) should result in peptide(R2+R3)',
    HELMString: 'PEPTIDE1{([Mpa],[Mba])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
  },
  {
    testDescription:
      '4. Ambiguous alternatives peptide made of peptide(R1+R2) and peptide(R1+R2) should result in peptide(R1+R2)',
    HELMString: 'PEPTIDE1{([D-Nle],[2Nal])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
  },
  {
    testDescription:
      '5. Ambiguous alternatives peptide made of peptide(R1+R2+R3) and peptide(R1+R2+R3) should result in peptide(R1+R2+R3)',
    HELMString: 'PEPTIDE1{([Aad],[Asu])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
  },
  {
    testDescription:
      '6. Ambiguous alternatives peptide made of peptide(R1) and peptide(R1+R2+R3) should result in peptide(R1)',
    HELMString: 'PEPTIDE1{([Pyrro],[Asu])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
  },
  {
    testDescription:
      '7. Ambiguous alternatives peptide made of peptide(R2) and peptide(R1) should result in peptide with no APs',
    HELMString: 'PEPTIDE1{([Glc],[-Am])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
  },
  {
    testDescription:
      '8. Ambiguous alternatives peptide made of peptide(R2+R3) and peptide(R2) should result in peptide(R2)',
    HELMString: 'PEPTIDE1{([Mpa],[Hva])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
  },
  {
    testDescription:
      '9. Ambiguous alternatives peptide made of peptide(R1+R2) and peptide(R2+R3) should result in peptide(R2)',
    HELMString: 'PEPTIDE1{([D-Nle],[Mba])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
  },
  {
    testDescription:
      '10. Ambiguous alternatives peptide made of peptide(R1+R2+R3) and peptide(R1+R2) should result in peptide(R1+R2)',
    HELMString: 'PEPTIDE1{([Aad],[2Nal])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
  },
  {
    testDescription:
      '11. Ambiguous alternatives peptide made of peptide(R1) and peptide(R1+R2) should result in peptide(R1)',
    HELMString: 'PEPTIDE1{([Pyrro],[2Nal])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
  },
  {
    testDescription:
      '12. Ambiguous alternatives peptide made of peptide(R2) and peptide(R1+R2+R3) should result in peptide(R2)',
    HELMString: 'PEPTIDE1{([Glc],[Asu])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
  },
  {
    testDescription:
      '13. Ambiguous alternatives peptide made of peptide(R2+R3) and peptide(R1) should result in peptide with no APs',
    HELMString: 'PEPTIDE1{([Mpa],[-Am])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
  },
  {
    testDescription:
      '14. Ambiguous alternatives peptide made of peptide(R1+R2) and peptide(R2) should result in peptide(R2)',
    HELMString: 'PEPTIDE1{([D-Nle],[Hva])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
  },
  {
    testDescription:
      '15. Ambiguous alternatives peptide made of peptide(R1+R2+R3) and peptide(R2+R3) should result in peptide(R2+R3)',
    HELMString: 'PEPTIDE1{([Aad],[Mba])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
  },
  {
    testDescription:
      '16. Ambiguous mixed peptide made of peptide(R1) and peptide(R1) should result in peptide(R1)',
    HELMString: 'PEPTIDE1{([Pyrro]+[-Am])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
  },
  {
    testDescription:
      '17. Ambiguous mixed peptide made of peptide(R2) and peptide(R2) should result in peptide(R2)',
    HELMString: 'PEPTIDE1{([Glc]+[Hva])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
  },
  {
    testDescription:
      '18. Ambiguous mixed peptide made of peptide(R2+R3) and peptide(R2+R3) should result in peptide(R2+R3)',
    HELMString: 'PEPTIDE1{([Mpa]+[Mba])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
  },
  {
    testDescription:
      '19. Ambiguous mixed peptide made of peptide(R1+R2) and peptide(R1+R2) should result in peptide(R1+R2)',
    HELMString: 'PEPTIDE1{([D-Nle]+[2Nal])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
  },
  {
    testDescription:
      '20. Ambiguous mixed peptide made of peptide(R1+R2+R3) and peptide(R1+R2+R3) should result in peptide(R1+R2+R3)',
    HELMString: 'PEPTIDE1{([Aad]+[Asu])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
  },
  {
    testDescription:
      '21. Ambiguous mixed peptide made of peptide(R1) and peptide(R1+R2+R3) should result in peptide(R1)',
    HELMString: 'PEPTIDE1{([Pyrro]+[Asu])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
  },
  {
    testDescription:
      '22. Ambiguous mixed peptide made of peptide(R2) and peptide(R1) should result in peptide with no APs',
    HELMString: 'PEPTIDE1{([Glc]+[-Am])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
  },
  {
    testDescription:
      '23. Ambiguous mixed peptide made of peptide(R2+R3) and peptide(R2) should result in peptide(R2)',
    HELMString: 'PEPTIDE1{([Mpa]+[Hva])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
  },
  {
    testDescription:
      '24. Ambiguous mixed peptide made of peptide(R1+R2) and peptide(R2+R3) should result in peptide(R2)',
    HELMString: 'PEPTIDE1{([D-Nle]+[Mba])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
  },
  {
    testDescription:
      '25. Ambiguous mixed peptide made of peptide(R1+R2+R3) and peptide(R1+R2) should result in peptide(R1+R2)',
    HELMString: 'PEPTIDE1{([Aad]+[2Nal])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
  },
  {
    testDescription:
      '26. Ambiguous mixed peptide made of peptide(R1) and peptide(R1+R2) should result in peptide(R1)',
    HELMString: 'PEPTIDE1{([Pyrro]+[2Nal])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
  },
  {
    testDescription:
      '27. Ambiguous mixed peptide made of peptide(R2) and peptide(R1+R2+R3) should result in peptide(R2)',
    HELMString: 'PEPTIDE1{([Glc]+[Asu])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
  },
  {
    testDescription:
      '28. Ambiguous mixed peptide made of peptide(R2+R3) and peptide(R1) should result in peptide with no APs',
    HELMString: 'PEPTIDE1{([Mpa]+[-Am])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
  },
  {
    testDescription:
      '29. Ambiguous mixed peptide made of peptide(R1+R2) and peptide(R2) should result in peptide(R2)',
    HELMString: 'PEPTIDE1{([D-Nle]+[Hva])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
  },
  {
    testDescription:
      '30. Ambiguous mixed peptide made of peptide(R1+R2+R3) and peptide(R2+R3) should result in peptide(R2+R3)',
    HELMString: 'PEPTIDE1{([Aad]+[Mba])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
  },
  {
    testDescription:
      '31. Ambiguous alternatives base made of base(R1) and base(R1) should result in base(R1)',
    HELMString: 'RNA1{R([2imen2],[5meC])P}$$$$$V2.0',
    pageReloadNeeded: true,
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Base,
    },
  },
  {
    testDescription:
      '32. Ambiguous alternatives base made of base(R1+R2) and base(R1+R2) should result in base(R1+R2)',
    HELMString: 'RNA1{R([oC64m5],[nC65U])P}$$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Base,
    },
  },
  {
    testDescription:
      '33. Ambiguous alternatives base made of base(R1+R2+R3) and base(R1+R2+R3) should result in base(R1+R2+R3)',
    HELMString: 'RNA1{R([nC6n5C],[nC6n8A])P}$$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Base,
    },
  },
  {
    testDescription:
      '34. Ambiguous alternatives base made of base(R1) and base(R1+R2+R3) should result in base(R1)',
    HELMString: 'RNA1{R([2imen2],[nC6n8A])P}$$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Base,
    },
  },
  {
    testDescription:
      '35. Ambiguous alternatives base made of base(R1+R2) and base(R1) should result in base(R1)',
    HELMString: 'RNA1{R([oC64m5],[5meC])P}$$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Base,
    },
  },
  {
    testDescription:
      '36. Ambiguous alternatives base made of base(R1+R2+R3) and base(R1+R2) should result in base(R1+R2)',
    HELMString: 'RNA1{R([nC6n5C],[nC65U])P}$$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Base,
    },
  },
  {
    testDescription:
      '37. Ambiguous mixed base made of base(R1) and base(R1) should result in base(R1)',
    HELMString: 'RNA1{R([2imen2]+[5meC])P}$$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Base,
    },
  },
  {
    testDescription:
      '38. Ambiguous mixed base made of base(R1+R2) and base(R1+R2) should result in base(R1+R2)',
    HELMString: 'RNA1{R([oC64m5]+[nC65U])P}$$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Base,
    },
  },
  {
    testDescription:
      '39. Ambiguous mixed base made of base(R1+R2+R3) and base(R1+R2+R3) should result in base(R1+R2+R3)',
    HELMString: 'RNA1{R([nC6n5C]+[nC6n8A])P}$$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Base,
    },
  },
  {
    testDescription:
      '40. Ambiguous mixed base made of base(R1) and base(R1+R2+R3) should result in base(R1)',
    HELMString: 'RNA1{R([2imen2]+[nC6n8A])P}$$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Base,
    },
  },
  {
    testDescription:
      '41. Ambiguous mixed base made of base(R1+R2) and base(R1) should result in base(R1)',
    HELMString: 'RNA1{R([oC64m5]+[5meC])P}$$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Base,
    },
  },
  {
    testDescription:
      '42. Ambiguous mixed base made of base(R1+R2+R3) and base(R1+R2) should result in base(R1+R2)',
    HELMString: 'RNA1{R([nC6n5C]+[nC65U])P}$$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Base,
    },
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

      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        ambiguousMonomer.HELMString,
      );
      await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
      await getMonomerLocator(
        page,
        ambiguousMonomer.monomerLocatorOptions,
      ).hover();
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
