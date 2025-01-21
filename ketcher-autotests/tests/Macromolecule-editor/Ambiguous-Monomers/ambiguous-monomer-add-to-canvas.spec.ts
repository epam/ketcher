import { Bases, Peptides } from '@constants/monomers';
import { test } from '@playwright/test';
import {
  clickOnTheCanvas,
  selectMonomer,
  takeEditorScreenshot,
  waitForPageInit,
} from '@utils';
import { turnOnMacromoleculesEditor } from '@utils/macromolecules';
import { MonomerLocationTabs } from '@utils/macromolecules/library';

interface IAmbiguousMonomerName {
  testDescription: string;
  AmbiguousMonomerName: Peptides | Bases;
  MonomerLocationTab: MonomerLocationTabs;
  // Set shouldFail to true if you expect test to fail because of existed bug and put issues link to issueNumber
  shouldFail?: boolean;
  // issueNumber is mandatory if shouldFail === true
  issueNumber?: string;
  // set pageReloadNeeded to true if you need to restart ketcher before test (f.ex. to restart font renderer)
  pageReloadNeeded?: boolean;
}

test.beforeEach(async ({ page }) => {
  await waitForPageInit(page);
  await turnOnMacromoleculesEditor(page);
});

const AmbiguousMonomers: IAmbiguousMonomerName[] = [
  {
    testDescription: "1. 'X' ambiguous peptide",
    AmbiguousMonomerName: Peptides.X,
    MonomerLocationTab: MonomerLocationTabs.PEPTIDES,
  },
  {
    testDescription: "2. 'B' ambiguous peptide",
    AmbiguousMonomerName: Peptides.B,
    MonomerLocationTab: MonomerLocationTabs.PEPTIDES,
  },
  {
    testDescription: "3. 'J' ambiguous peptide",
    AmbiguousMonomerName: Peptides.J,
    MonomerLocationTab: MonomerLocationTabs.PEPTIDES,
  },
  {
    testDescription: "4. 'Z' ambiguous peptide",
    AmbiguousMonomerName: Peptides.Z,
    MonomerLocationTab: MonomerLocationTabs.PEPTIDES,
  },
  {
    testDescription: "5. 'N' ambiguous DNA base",
    AmbiguousMonomerName: Bases.DNA_N,
    MonomerLocationTab: MonomerLocationTabs.BASES,
  },
  {
    testDescription: "6. 'B' ambiguous DNA base",
    AmbiguousMonomerName: Bases.DNA_B,
    MonomerLocationTab: MonomerLocationTabs.BASES,
  },
  {
    testDescription: "7. 'H' ambiguous DNA base",
    AmbiguousMonomerName: Bases.DNA_H,
    MonomerLocationTab: MonomerLocationTabs.BASES,
  },
  {
    testDescription: "8. 'K' ambiguous DNA base",
    AmbiguousMonomerName: Bases.DNA_K,
    MonomerLocationTab: MonomerLocationTabs.BASES,
  },
  {
    testDescription: "9. 'W' ambiguous DNA base",
    AmbiguousMonomerName: Bases.DNA_W,
    MonomerLocationTab: MonomerLocationTabs.BASES,
  },
  {
    testDescription: "10. 'Y' ambiguous DNA base",
    AmbiguousMonomerName: Bases.DNA_Y,
    MonomerLocationTab: MonomerLocationTabs.BASES,
  },
  {
    testDescription: "11. 'N' ambiguous RNA base",
    AmbiguousMonomerName: Bases.RNA_N,
    MonomerLocationTab: MonomerLocationTabs.BASES,
  },
  {
    testDescription: "12. 'B' ambiguous RNA base",
    AmbiguousMonomerName: Bases.RNA_B,
    MonomerLocationTab: MonomerLocationTabs.BASES,
  },
  {
    testDescription: "13. 'H' ambiguous RNA base",
    AmbiguousMonomerName: Bases.RNA_H,
    MonomerLocationTab: MonomerLocationTabs.BASES,
  },
  {
    testDescription: "14. 'K' ambiguous RNA base",
    AmbiguousMonomerName: Bases.RNA_K,
    MonomerLocationTab: MonomerLocationTabs.BASES,
  },
  {
    testDescription: "15. 'W' ambiguous RNA base",
    AmbiguousMonomerName: Bases.RNA_W,
    MonomerLocationTab: MonomerLocationTabs.BASES,
  },
  {
    testDescription: "16. 'Y' ambiguous RNA base",
    AmbiguousMonomerName: Bases.RNA_Y,
    MonomerLocationTab: MonomerLocationTabs.BASES,
  },
  {
    testDescription: "17. 'M' ambiguous base",
    AmbiguousMonomerName: Bases.M,
    MonomerLocationTab: MonomerLocationTabs.BASES,
  },
  {
    testDescription: "18. 'R' ambiguous base",
    AmbiguousMonomerName: Bases.R,
    MonomerLocationTab: MonomerLocationTabs.BASES,
  },
  {
    testDescription: "19. 'S' ambiguous base",
    AmbiguousMonomerName: Bases.S,
    MonomerLocationTab: MonomerLocationTabs.BASES,
  },
  {
    testDescription: "20. 'V' ambiguous base",
    AmbiguousMonomerName: Bases.V,
    MonomerLocationTab: MonomerLocationTabs.BASES,
  },
];

test.describe('Put ambiguous monomer on the canvas from library:', () => {
  for (const AmbiguousMonomer of AmbiguousMonomers) {
    test(`${AmbiguousMonomer.testDescription}`, async ({ page }) => {
      /* 
        Test task: https://github.com/epam/ketcher/issues/5558
        8. Verify the addition of ambuguous monomers to the canvas
        Case:
          1. Find monomer at the library and click on it
          2. Click at the center of canvas
          3. Take screenshot of the canvas to make sure selected monomer appeared on the canvas
        */
      await selectMonomer(page, AmbiguousMonomer.AmbiguousMonomerName);
      await clickOnTheCanvas(page, 0, 0);
      await takeEditorScreenshot(page);

      // Test should be skipped if related bug exists
      test.fixme(
        AmbiguousMonomer.shouldFail === true,
        `That test fails because of ${AmbiguousMonomer.issueNumber} issue.`,
      );
    });
  }
});
