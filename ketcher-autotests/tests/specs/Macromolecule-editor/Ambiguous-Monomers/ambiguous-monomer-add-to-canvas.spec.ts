import { test } from '@playwright/test';
import { Bases } from '@constants/monomers/Bases';
import { Peptides } from '@constants/monomers/Peptides';
import {
  clickOnTheCanvas,
  moveMouseAway,
  selectMonomer,
  takeEditorScreenshot,
  waitForMonomerPreview,
  waitForPageInit,
} from '@utils';
import { Monomer } from '@utils/types';
import { CommonTopRightToolbar } from '@tests/pages/common/TopRightToolbar';
import { getMonomerLocator } from '@utils/macromolecules/monomer';

interface IAmbiguousMonomerName {
  testDescription: string;
  AmbiguousMonomer: Monomer;
  // Set shouldFail to true if you expect test to fail because of existed bug and put issues link to issueNumber
  shouldFail?: boolean;
  // issueNumber is mandatory if shouldFail === true
  issueNumber?: string;
  // set pageReloadNeeded to true if you need to restart ketcher before test (f.ex. to restart font renderer)
  pageReloadNeeded?: boolean;
}

test.beforeEach(async ({ page }) => {
  await waitForPageInit(page);
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
});

const AmbiguousMonomers: IAmbiguousMonomerName[] = [
  {
    testDescription: "1. 'X' ambiguous peptide",
    AmbiguousMonomer: Peptides.X,
  },
  {
    testDescription: "2. 'B' ambiguous peptide",
    AmbiguousMonomer: Peptides.B,
  },
  {
    testDescription: "3. 'J' ambiguous peptide",
    AmbiguousMonomer: Peptides.J,
  },
  {
    testDescription: "4. 'Z' ambiguous peptide",
    AmbiguousMonomer: Peptides.Z,
  },
  {
    testDescription: "5. 'N' ambiguous DNA base",
    AmbiguousMonomer: Bases.DNA_N,
  },
  {
    testDescription: "6. 'B' ambiguous DNA base",
    AmbiguousMonomer: Bases.DNA_B,
  },
  {
    testDescription: "7. 'H' ambiguous DNA base",
    AmbiguousMonomer: Bases.DNA_H,
  },
  {
    testDescription: "8. 'K' ambiguous DNA base",
    AmbiguousMonomer: Bases.DNA_K,
  },
  {
    testDescription: "9. 'W' ambiguous DNA base",
    AmbiguousMonomer: Bases.DNA_W,
  },
  {
    testDescription: "10. 'Y' ambiguous DNA base",
    AmbiguousMonomer: Bases.DNA_Y,
  },
  {
    testDescription: "11. 'N' ambiguous RNA base",
    AmbiguousMonomer: Bases.RNA_N,
  },
  {
    testDescription: "12. 'B' ambiguous RNA base",
    AmbiguousMonomer: Bases.RNA_B,
  },
  {
    testDescription: "13. 'H' ambiguous RNA base",
    AmbiguousMonomer: Bases.RNA_H,
  },
  {
    testDescription: "14. 'K' ambiguous RNA base",
    AmbiguousMonomer: Bases.RNA_K,
  },
  {
    testDescription: "15. 'W' ambiguous RNA base",
    AmbiguousMonomer: Bases.RNA_W,
  },
  {
    testDescription: "16. 'Y' ambiguous RNA base",
    AmbiguousMonomer: Bases.RNA_Y,
  },
  {
    testDescription: "17. 'M' ambiguous base",
    AmbiguousMonomer: Bases.M,
  },
  {
    testDescription: "18. 'R' ambiguous base",
    AmbiguousMonomer: Bases.R,
  },
  {
    testDescription: "19. 'S' ambiguous base",
    AmbiguousMonomer: Bases.S,
  },
  {
    testDescription: "20. 'V' ambiguous base",
    AmbiguousMonomer: Bases.V,
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
      await selectMonomer(page, AmbiguousMonomer.AmbiguousMonomer);
      await clickOnTheCanvas(page, 0, 0);
      await moveMouseAway(page);
      await getMonomerLocator(page, AmbiguousMonomer.AmbiguousMonomer).hover();
      await waitForMonomerPreview(page);
      await takeEditorScreenshot(page);

      // Test should be skipped if related bug exists
      test.fixme(
        AmbiguousMonomer.shouldFail === true,
        `That test fails because of ${AmbiguousMonomer.issueNumber} issue.`,
      );
    });
  }
});
