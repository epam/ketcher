/* eslint-disable no-magic-numbers */
import {
  chooseFileFormat,
  turnOnMacromoleculesEditor,
} from '@utils/macromolecules';
import { Page, test, BrowserContext, chromium, expect } from '@playwright/test';
import {
  takeEditorScreenshot,
  selectClearCanvasTool,
  waitForIndigoToLoad,
  waitForKetcherInit,
  openStructurePasteFromClipboard,
  waitForSpinnerFinishedWork,
  selectFlexLayoutModeTool,
} from '@utils';
import { pageReload } from '@utils/common/helpers';
import { waitForLoadAndRender } from '@utils/common/loaders/waitForLoad/waitForLoad';

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
  await page.keyboard.press('Control+0');
  await selectClearCanvasTool(page);
  await page.keyboard.press('Control+0');
});

test.afterAll(async ({ browser }) => {
  await page.close();
  await sharedContext.close();
  await browser.contexts().forEach((someContext) => {
    someContext.close();
  });
});

interface IReplaceMonomer {
  MonomerTypeName: string;
  MonomerSubType?: string;
  MonomerAlias: string;
  MonomerDescription: string;
}

interface IReplacementPosition {
  LeftEnd: number;
  Center: number;
  RightEnd: number;
}
interface ISequence {
  FileName: string;
  SequenceName: string;
  ReplacementPositions: IReplacementPosition;
}

interface IFailedTest {
  ReplaceMonomer: IReplaceMonomer;
  Sequence: ISequence;
  ReplacementSybolPosition: number;
  IssueNumber: string;
  Description?: string;
}

const ReplaceMonomers: IReplaceMonomer[] = [
  {
    MonomerTypeName: 'Peptides',
    MonomerAlias: 'Cys_Bn',
    MonomerDescription: 'Peptide (Cys_Bn)',
  },
];

const Sequences: ISequence[] = [
  {
    FileName: '',
    SequenceName: 'sequence made of peptides (A)',
    ReplacementPositions: { LeftEnd: 1, Center: 2, RightEnd: 3 },
  },
];

test.describe('Replacement of first symbol: ', () => {
  for (const ReplaceMonomer of ReplaceMonomers) {
    for (const Sequence of Sequences) {
      test(`${ReplaceMonomer.MonomerDescription} replaces monomer at ${Sequence.SequenceName}`, async () => {
        await openFileAndAddToCanvasMacro(Sequence.FileName, page);
        await selectAndReplaceSymbol(
          page,
          ReplaceMonomer,
          Sequence,
          Sequence.ReplacementPositions.LeftEnd,
        );
        await takeEditorScreenshot(page);
        await selectFlexLayoutModeTool(page);
        await takeEditorScreenshot(page);
      });
    }
  }
});
