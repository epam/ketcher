/* eslint-disable no-magic-numbers */
import { chooseTab, Tabs } from '@utils/macromolecules';
import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  selectFlexLayoutModeTool,
  selectSequenceLayoutModeTool,
  MonomerType,
  waitForPageInit,
  MacroFileType,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
} from '@utils';
import { pageReload } from '@utils/common/helpers';
import { selectClearCanvasTool } from '@tests/pages/common/TopLeftToolbar';
import {
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
} from '@tests/pages/common/TopRightToolbar';
import {
  getMonomerLocator,
  MonomerLocatorOptions,
} from '@utils/macromolecules/monomer';

let page: Page;

async function configureInitialState(page: Page) {
  await chooseTab(page, Tabs.Rna);
}

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();

  await waitForPageInit(page);
  await turnOnMacromoleculesEditor(page);
  await configureInitialState(page);
});

test.afterEach(async () => {
  await selectClearCanvasTool(page);
});

test.afterAll(async ({ browser }) => {
  await Promise.all(browser.contexts().map((context) => context.close()));
});

async function hoverMouseOverMicroMonomer(
  page: Page,
  monomerLocatorIndex: number,
) {
  await page.locator('tspan').nth(monomerLocatorIndex).hover({ force: true });
}

async function hoverMouseOverSequenceModeMonomer(page: Page) {
  await page.locator('text').first().hover();
}

interface IHELMString {
  testDescription: string;
  HELMString: string;
  monomerLocatorOptions: MonomerLocatorOptions;
  monomerLocatorIndexOnMicro: number;
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
    monomerLocatorOptions: {
      monomerAlias: 'X',
      monomerType: MonomerType.Peptide,
    },
    monomerLocatorIndexOnMicro: 0,
    pageReloadNeeded: true,
  },
  {
    testDescription: '2. Peptide B (alternatives, from library)',
    HELMString: 'PEPTIDE2{(D,N)}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: 'B',
      monomerType: MonomerType.Peptide,
    },
    monomerLocatorIndexOnMicro: 0,
    pageReloadNeeded: true,
  },
  {
    testDescription: '3. Alternatives of 10 Peptides (no probabilities)',
    HELMString: 'PEPTIDE1{(L,K,I,H,G,F,E,D,C,A)}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
    monomerLocatorIndexOnMicro: 0,
    pageReloadNeeded: true,
  },
  {
    testDescription:
      '4. Alternatives of 10 Peptides (multi-char name, no probabilities)',
    HELMString:
      'PEPTIDE1{([D-2Pal],[Cys_Bn],[AspOMe],[D-gGlu],[aMePhe],[Chg],[dH],[aIle],[Aad],[Ar5c])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
    monomerLocatorIndexOnMicro: 0,
    pageReloadNeeded: true,
  },
  {
    testDescription: '5. Alternatives of 10 Peptides (with probabilities)',
    HELMString: 'PEPTIDE1{(L:1,K:3,I:5,H:7,G:9,F:55,E:8,D:6,C:4,A:2)}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
    monomerLocatorIndexOnMicro: 0,
    pageReloadNeeded: true,
  },
  {
    testDescription:
      '6. Alternatives of 10 Peptides (multi-char name, with probabilities)',
    HELMString:
      'PEPTIDE1{([D-2Pal]:1,[Cys_Bn]:3,[AspOMe]:5,[D-gGlu]:7,[aMePhe]:9,[Chg]:55,[dH]:8,[aIle]:6,[Aad]:4,[Ar5c]:2)}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
    monomerLocatorIndexOnMicro: 0,
    pageReloadNeeded: true,
  },
  {
    testDescription: '7. Peptide X (Mixture, no quantities)',
    HELMString:
      'PEPTIDE1{(A+C+D+E+F+G+H+I+K+L+M+N+O+P+Q+R+S+T+U+V+W+Y)}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
    monomerLocatorIndexOnMicro: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/5534, https://github.com/epam/ketcher/issues/5566',
    pageReloadNeeded: true,
  },
  {
    testDescription: '8. Peptide B (Mixture)',
    HELMString: 'PEPTIDE2{(D+N)}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
    monomerLocatorIndexOnMicro: 0,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/5534, https://github.com/epam/ketcher/issues/5566',
    pageReloadNeeded: true,
  },
  {
    testDescription: '9. Mixture of 10 Peptides (no quantities)',
    HELMString: 'PEPTIDE1{(L+K+I+H+G+F+E+D+C+A)}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
    monomerLocatorIndexOnMicro: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5534',
    pageReloadNeeded: true,
  },
  {
    testDescription:
      '10. Mixture of 10 Peptides (multi-char name, no quantities)',
    HELMString:
      'PEPTIDE1{([D-2Pal]+[Cys_Bn]+[AspOMe]+[D-gGlu]+[aMePhe]+[Chg]+[dH]+[aIle]+[Aad]+[Ar5c])}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
    monomerLocatorIndexOnMicro: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5534',
    pageReloadNeeded: true,
  },
  {
    testDescription: '11. Mixture of 10 Peptides (with quantities)',
    HELMString: 'PEPTIDE1{(L:1+K:3+I:5+H:7+G:9+F:10+E:8+D:6+C:4+A:2)}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
    monomerLocatorIndexOnMicro: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5534',
    pageReloadNeeded: true,
  },
  {
    testDescription:
      '12. Mixture of 10 Peptides (multi-char name, with quantities)',
    HELMString:
      'PEPTIDE1{([D-2Pal]:1+[Cys_Bn]:3+[AspOMe]:5+[D-gGlu]:7+[aMePhe]:9+[Chg]:5+[dH]:8+[aIle]:6+[Aad]:4+[Ar5c]:2)}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Peptide,
    },
    monomerLocatorIndexOnMicro: 0,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5534',
    pageReloadNeeded: true,
  },
  {
    testDescription:
      '13. RNA Base N (alternative, no probabilities, from the library)',
    HELMString: 'RNA1{R(U,G,C,A)P}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: 'N',
      monomerType: MonomerType.Base,
    },
    monomerLocatorIndexOnMicro: 1,
    pageReloadNeeded: true,
  },
  {
    testDescription:
      '14. RNA Base B (alternative, no probabilities, from the library)',
    HELMString: 'RNA1{R(U,G,C)P}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: 'B',
      monomerType: MonomerType.Base,
    },
    monomerLocatorIndexOnMicro: 1,
    pageReloadNeeded: true,
  },
  {
    testDescription:
      '15. DNA Base N (alternative, no probabilities, from the library)',
    HELMString: 'RNA1{[dR](T,G,C,A)P}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: 'N',
      monomerType: MonomerType.Base,
    },
    monomerLocatorIndexOnMicro: 1,
    pageReloadNeeded: true,
  },
  {
    testDescription:
      '16. DNA Base B (alternative, no probabilities, from the library)',
    HELMString: 'RNA1{[dR](T,G,C)P}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: 'B',
      monomerType: MonomerType.Base,
    },
    monomerLocatorIndexOnMicro: 1,
    pageReloadNeeded: true,
  },
  {
    testDescription: '17. DNA Base B (alternative, with probabilities)',
    HELMString: 'RNA1{[dR](T:20,G:50,C:30)P}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Base,
    },
    monomerLocatorIndexOnMicro: 1,
    pageReloadNeeded: true,
  },
  {
    testDescription:
      '18. Base M (alternative, no probabilities, from the library)',
    HELMString: 'RNA1{R(C,A)P}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: 'M',
      monomerType: MonomerType.Base,
    },
    monomerLocatorIndexOnMicro: 1,
  },
  {
    testDescription:
      '19. Base R (alternative, no probabilities, from the library)',
    HELMString: 'RNA1{R(G,A)P}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: 'R',
      monomerType: MonomerType.Base,
    },
    monomerLocatorIndexOnMicro: 1,
  },
  // dfB	  2,4-Difluoro-Benzene
  // cnes4T	4-Cyanoethylthiothymine
  // 5eU	  5-ethynyl-uracil
  // 5meC	  5-methylcytosine
  // 2imen2	N2-[(Imidazo-2-yl)ethylamino]adenine
  // 4imen2	N2-[(Imidazol-4-yl)ethyl]guanine
  // cneT	  N3-(2-Cyanoethyl)thymine
  // ac4C	  N4-acetylcytosine
  // 4ime6A	N6-[2-(4-Imidazoyl)ethyl]adenine
  // allyl9	N9-allyl-8-oxoguanine
  {
    testDescription:
      '20. Alternatives of 10 bases (multi-char, no probabilities)',
    HELMString:
      'RNA1{R([2imen2],[5meC],[4imen2],[cnes4T],[5eU],[dfB],[4ime6A],[ac4C],[allyl9],[cneT])P}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Base,
    },
    monomerLocatorIndexOnMicro: 1,
  },
  {
    testDescription:
      '21. Alternatives of 10 bases (multi-char, with probabilities)',
    HELMString:
      'RNA1{R([2imen2]:1,[5meC]:3,[4imen2]:5,[cnes4T]:7,[5eU]:9,[dfB]:55,[4ime6A]:8,[ac4C]:6,[allyl9]:4,[cneT]:2)P}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Base,
    },
    monomerLocatorIndexOnMicro: 1,
  },
  {
    testDescription: '22. RNA Base % (mixture, no quantities)',
    HELMString: 'RNA1{R(U+G+C+A)P}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Base,
    },
    monomerLocatorIndexOnMicro: 1,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5534',
  },
  {
    testDescription: '23. RNA Base % (mixture, no quantities)',
    HELMString: 'RNA1{R(U+G+C)P}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Base,
    },
    monomerLocatorIndexOnMicro: 1,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5534',
    pageReloadNeeded: true,
  },
  {
    testDescription: '24. RNA Base % (mixture, with quantities)',
    HELMString: 'RNA1{R(U:20+G:50+C:30)P}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Base,
    },
    monomerLocatorIndexOnMicro: 1,
    pageReloadNeeded: true,
  },
  {
    testDescription: '25. DNA Base % (mixture, no quantities)',
    HELMString: 'RNA1{[dR](T+G+C+A)P}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Base,
    },
    monomerLocatorIndexOnMicro: 1,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/5534, https://github.com/epam/ketcher/issues/5566',
    pageReloadNeeded: true,
  },
  {
    testDescription: '26. DNA Base % (mixture, no quantities)',
    HELMString: 'RNA1{[dR](T+G+C)P}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Base,
    },
    monomerLocatorIndexOnMicro: 1,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/5534, https://github.com/epam/ketcher/issues/5566',
  },
  {
    testDescription: '27. DNA Base % (mixture, with quantities)',
    HELMString: 'RNA1{[dR](T:20+G:50+C:30)P}$$$$V2.0',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5566',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Base,
    },
    monomerLocatorIndexOnMicro: 1,
  },
  {
    testDescription: '28. Base % (mixture, no quantities)',
    HELMString: 'RNA1{R(C+A)P}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Base,
    },
    monomerLocatorIndexOnMicro: 1,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/5534, https://github.com/epam/ketcher/issues/5566',
    pageReloadNeeded: true,
  },
  {
    testDescription: '29. Base % (mixture, no quantities)',
    HELMString: 'RNA1{R(G+A)P}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Base,
    },
    monomerLocatorIndexOnMicro: 1,
    shouldFail: true,
    issueNumber:
      'https://github.com/epam/ketcher/issues/5534, https://github.com/epam/ketcher/issues/5566',
    pageReloadNeeded: true,
  },
  {
    testDescription: '30. Base % (mixture, with quantities)',
    HELMString: 'RNA1{R(G:30+A:70)P}$$$$V2.0',
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5566',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Base,
    },
    monomerLocatorIndexOnMicro: 1,
    pageReloadNeeded: true,
  },
  {
    testDescription: '31. Mixture of 10 bases (multi-char, no quantities)',
    HELMString:
      'RNA1{R([2imen2]+[5meC]+[4imen2]+[cnes4T]+[5eU]+[dfB]+[4ime6A]+[ac4C]+[allyl9]+[cneT])P}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Base,
    },
    monomerLocatorIndexOnMicro: 1,
    shouldFail: true,
    issueNumber: 'https://github.com/epam/ketcher/issues/5534',
    pageReloadNeeded: true,
  },
  {
    testDescription: '32. Mixture of 10 bases (multi-char, with quantities)',
    HELMString:
      'RNA1{R([2imen2]:1+[5meC]:3+[4imen2]:5+[cnes4T]:7+[5eU]:9+[dfB]:55+[4ime6A]:8+[ac4C]:6+[allyl9]:4+[cneT]:2)P}$$$$V2.0',
    monomerLocatorOptions: {
      monomerAlias: '%',
      monomerType: MonomerType.Base,
    },
    monomerLocatorIndexOnMicro: 1,
    pageReloadNeeded: true,
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
      test.setTimeout(30000);
      if (ambiguousMonomer.pageReloadNeeded) await pageReload(page);

      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        ambiguousMonomer.HELMString,
      );
      await getMonomerLocator(
        page,
        ambiguousMonomer.monomerLocatorOptions,
      ).hover({ force: true });
      await page
        .getByTestId('polymer-library-preview')
        .waitFor({ state: 'visible' });

      await takeEditorScreenshot(page);

      // Test should be skipped if related bug exists
      test.fixme(
        ambiguousMonomer.shouldFail === true,
        `That test fails because of ${ambiguousMonomer.issueNumber} issue.`,
      );
    });
  }

  for (const ambiguousMonomer of ambiguousMonomers) {
    test(`${ambiguousMonomer.testDescription} in small molecules mode`, async () => {
      /* 
        Test case1: https://github.com/epam/ketcher/issues/5585
        Description: Verify that the ambiguous monomer preview displays a list of full names of monomers making up the ambiguous
        Case:
            1. Load correct HELM via paste from clipboard way
            2. Switch to micromolecule mode
            3. Hover mouse over monomer, wait for preview tooltip
            4. Take screenshot of the canvas to compare it with example
        */
      test.slow();
      await pageReload(page);
      if (ambiguousMonomer.pageReloadNeeded) await pageReload(page);
      await selectFlexLayoutModeTool(page);
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        ambiguousMonomer.HELMString,
      );
      await turnOnMicromoleculesEditor(page);

      await hoverMouseOverMicroMonomer(
        page,
        ambiguousMonomer.monomerLocatorIndexOnMicro,
      );
      await page
        .getByTestId('polymer-library-preview')
        .waitFor({ state: 'visible' });

      await takeEditorScreenshot(page);
      await turnOnMacromoleculesEditor(page);

      // Test should be skipped if related bug exists
      test.fixme(
        ambiguousMonomer.shouldFail === true,
        `That test fails because of ${ambiguousMonomer.issueNumber} issue.`,
      );
    });
  }

  for (const ambiguousMonomer of ambiguousMonomers) {
    test(`${ambiguousMonomer.testDescription} in sequence view`, async () => {
      /* 
        Test case1: https://github.com/epam/ketcher/issues/5604
        Description: Verify that the ambiguous monomer preview displays a list of full names of monomers making up the ambiguous
        Case:
            1. Load correct HELM via paste from clipboard way
            2. Hover mouse over monomer, wait for preview tooltip
            2. Take screenshot of the canvas to compare it with example
        */
      test.setTimeout(20000);
      if (ambiguousMonomer.pageReloadNeeded) await pageReload(page);

      await selectSequenceLayoutModeTool(page);
      await pasteFromClipboardAndAddToMacromoleculesCanvas(
        page,
        MacroFileType.HELM,
        ambiguousMonomer.HELMString,
      );
      await hoverMouseOverSequenceModeMonomer(page);
      await page
        .getByTestId('polymer-library-preview')
        .waitFor({ state: 'visible' });
      await takeEditorScreenshot(page);

      // Test should be skipped if related bug exists
      test.fixme(
        ambiguousMonomer.shouldFail === true,
        `That test fails because of ${ambiguousMonomer.issueNumber} issue.`,
      );
    });
  }
});
