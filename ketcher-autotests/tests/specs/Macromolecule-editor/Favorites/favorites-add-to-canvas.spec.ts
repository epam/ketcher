import { Peptide } from '@tests/pages/constants/monomers/Peptides';
import { test } from '@fixtures';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Library } from '@tests/pages/macromolecules/Library';
import { takeEditorScreenshot, waitForPageInit } from '@utils';
import { hideMonomerPreview } from '@utils/macromolecules';

test('Add molecule to favorites, switch to Favorites tab and drag it to the canvas', async ({
  page,
}) => {
  await waitForPageInit(page);
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();

  await Library(page).addMonomerToFavorites(Peptide.A);
  await Library(page).dragMonomerOnCanvas(
    Peptide.A,
    {
      x: 0,
      y: 0,
      fromCenter: true,
    },
    true,
  );
  await hideMonomerPreview(page);
  await takeEditorScreenshot(page);
});
