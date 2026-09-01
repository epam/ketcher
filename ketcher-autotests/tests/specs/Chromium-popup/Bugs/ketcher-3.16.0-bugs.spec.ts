import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { Page, test, expect } from '@fixtures';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';
import {
  selectAllStructuresOnCanvas,
  openFileAndAddToCanvas,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
  takeElementScreenshot,
  takeEditorScreenshot,
  dragMouseTo,
  takeTopToolbarScreenshot,
  selectByAtomAndBondIds,
  clickInTheMiddleOfTheCanvas,
  pasteFromClipboardAndOpenAsNewProject,
  selectPartOfMolecules,
  copyToClipboardByKeyboard,
  pasteFromClipboardByKeyboard,
  clickOnCanvas,
} from '@utils';
import { Library } from '@tests/pages/macromolecules/Library';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LeftToolbar } from '@tests/pages/molecules/LeftToolbar';
import { getAtomLocator } from '@utils/canvas/atoms/getAtomLocator/getAtomLocator';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import { MonomerType } from '@tests/pages/constants/createMonomerDialog/Constants';
import { CreateMonomerDialog } from '@tests/pages/molecules/canvas/CreateMonomerDialog';
import { NucleotidePresetSection } from '@tests/pages/molecules/canvas/createMonomer/NucleotidePresetSection';
import {
  MicroAtomOption,
  MonomerOnMicroOption,
} from '@tests/pages/constants/contextMenu/Constants';
import { getAbbreviationLocator } from '@utils/canvas/s-group-signes/getAbbreviationLocator';
import { RNASection } from '@tests/pages/constants/library/Constants';
import { TopRightToolbar } from '@tests/pages/molecules/TopRightToolbar';
import { AtomPropertiesDialog } from '@tests/pages/molecules/canvas/AtomPropertiesDialog';
import { ImplicitHCount } from '@tests/pages/constants/atomProperties/Constants';
import { NotificationMessageBanner } from '@tests/pages/molecules/canvas/createMonomer/NotificationMessageBanner';
import { ErrorMessage } from '@tests/pages/constants/notificationMessageBanner/Constants';
import { Preset } from '@tests/pages/constants/monomers/Presets';
import { verifySMARTSExport } from '@utils/files/receiveFileComparisonData';

let page: Page;
test.beforeAll(async ({ initMoleculesCanvas }) => {
  page = await initMoleculesCanvas();
});
test.afterAll(async ({ closePage }) => {
  await closePage();
});
test.beforeEach(async ({ MoleculesCanvas: _ }) => {});

test('Case 1: Copy/paste action with large structions shouldnt cause expections', async () => {
  /**
   * Test task: https://github.com/epam/ketcher/issues/10502
   * Bug: https://github.com/epam/ketcher/issues/3848
   * Description: When part of the large structure is copied using Ctrl+C/Ctrl+V hotkeys it shoudn't throw and error
   * Scenario:
   * 1. Load molecule from file: AllPossibleQueryFeatures.zip (unzip first)
   * 2. Select few rings
   * 3. Press Ctrl+C/Ctrl+V reasonably fast
   * Actual result: exception is thrown
   * Expected result: there are not errors in the console
   */
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await openFileAndAddToCanvas(
    page,
    'KET/all-possible-query-features-with-out-custom-query.ket',
  );
  await selectPartOfMolecules(page, 150);
  await copyToClipboardByKeyboard(page);
  await pasteFromClipboardByKeyboard(page);
  await clickOnCanvas(page, 0, 0);
  const clipboardErrors = consoleErrors.filter((error) =>
    error.includes('No valid data on clipboard'),
  );
  expect(clipboardErrors.length).toBe(0);
});
