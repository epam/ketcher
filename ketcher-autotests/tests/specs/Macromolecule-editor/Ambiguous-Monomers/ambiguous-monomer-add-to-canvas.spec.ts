import { test } from '@fixtures';
import { Base } from '@tests/pages/constants/monomers/Bases';
import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import {
  moveMouseAway,
  takeEditorScreenshot,
  waitForMonomerPreview,
  waitForPageInit,
} from '@utils';
import { Monomer } from '@utils/types';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { Library } from '@tests/pages/macromolecules/Library';

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
    AmbiguousMonomer: Peptide.X,
  },
  {
    testDescription: "2. 'B' ambiguous peptide",
    AmbiguousMonomer: Peptide.B,
  },
  {
    testDescription: "3. 'J' ambiguous peptide",
    AmbiguousMonomer: Peptide.J,
  },
  {
    testDescription: "4. 'Z' ambiguous peptide",
    AmbiguousMonomer: Peptide.Z,
  },
  {
    testDescription: "5. 'N' ambiguous DNA base",
    AmbiguousMonomer: Base.DNA_N,
  },
  {
    testDescription: "6. 'B' ambiguous DNA base",
    AmbiguousMonomer: Base.DNA_B,
  },
  {
    testDescription: "7. 'H' ambiguous DNA base",
    AmbiguousMonomer: Base.DNA_H,
  },
  {
    testDescription: "8. 'K' ambiguous DNA base",
    AmbiguousMonomer: Base.DNA_K,
  },
  {
    testDescription: "9. 'W' ambiguous DNA base",
    AmbiguousMonomer: Base.DNA_W,
  },
  {
    testDescription: "10. 'Y' ambiguous DNA base",
    AmbiguousMonomer: Base.DNA_Y,
  },
  {
    testDescription: "11. 'N' ambiguous RNA base",
    AmbiguousMonomer: Base.RNA_N,
  },
  {
    testDescription: "12. 'B' ambiguous RNA base",
    AmbiguousMonomer: Base.RNA_B,
  },
  {
    testDescription: "13. 'H' ambiguous RNA base",
    AmbiguousMonomer: Base.RNA_H,
  },
  {
    testDescription: "14. 'K' ambiguous RNA base",
    AmbiguousMonomer: Base.RNA_K,
  },
  {
    testDescription: "15. 'W' ambiguous RNA base",
    AmbiguousMonomer: Base.RNA_W,
  },
  {
    testDescription: "16. 'Y' ambiguous RNA base",
    AmbiguousMonomer: Base.RNA_Y,
  },
  {
    testDescription: "17. 'M' ambiguous base",
    AmbiguousMonomer: Base.M,
  },
  {
    testDescription: "18. 'R' ambiguous base",
    AmbiguousMonomer: Base.R,
  },
  {
    testDescription: "19. 'S' ambiguous base",
    AmbiguousMonomer: Base.S,
  },
  {
    testDescription: "20. 'V' ambiguous base",
    AmbiguousMonomer: Base.V,
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
      await Library(page).dragMonomerOnCanvas(
        AmbiguousMonomer.AmbiguousMonomer,
        { x: 0, y: 0, fromCenter: true },
      );

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
