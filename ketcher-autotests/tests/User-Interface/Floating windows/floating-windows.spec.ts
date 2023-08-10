import { test } from '@playwright/test';
import {
  selectTopPanelButton,
  TopPanelButton,
  takeEditorScreenshot,
  pasteFromClipboardAndAddToCanvas,
  openFileAndAddToCanvas,
  openFile,
  FILE_TEST_DATA,
  pasteFromClipboard,
  waitForLoad,
  pressButton,
} from '@utils';

test.describe('Click and drag FG on canvas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test.afterEach(async ({ page }) => {
    // await resetCurrentTool(page);
    await takeEditorScreenshot(page);
  });

  test('Calculate values (data on canvas)', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-3998
      Description: verify the floating window with calculated values 
    */
    await openFileAndAddToCanvas('bicycle.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test('Calculated values: check accuracy', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-3999(1)
      Description: verify 0 decimal places after the dot for calculated values 
    */
    await openFileAndAddToCanvas('bicycle.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
    await page
      .getByRole('listitem')
      .filter({ hasText: 'Molecular Weight:Decimal places3' })
      .getByRole('button', { name: '3' })
      .click();
    await page.getByRole('option', { name: '0' }).click();
    await page.getByRole('button', { name: '3', exact: true }).click();
    await page.getByRole('option', { name: '0' }).click();
  });

  test('Calculated values: check accuracy 2', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-3999(2)
      Description: verify 7 decimal places after the dot for calculated values 
    */
    await openFileAndAddToCanvas('bicycle.mol', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
    await page
      .getByRole('listitem')
      .filter({ hasText: 'Molecular Weight:Decimal places3' })
      .getByRole('button', { name: '3' })
      .click();
    await page.getByRole('option', { name: '7' }).click();
    await page.getByRole('button', { name: '3', exact: true }).click();
    await page.getByRole('option', { name: '7' }).click();
  });

  test('Calculate values: verify UI (empty canvas)', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4002
      Description: verify empty fields in floating window for empty canvas 
    */
    // await page.getByRole('button', { name: 'Calculated Values (Alt+C)' }).click();
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test('Open structure: Open window', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4003
      Description: verify floating window for open/drag file or paste from clipboard 
    */
    await selectTopPanelButton(TopPanelButton.Open, page);
  });

  test('Floating windows - Extended table: Verify UI', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4010
      Description: verify visual representation of "Extended" table 
    */
    await page.getByTestId('extended-table').click();
  });

  test('Calculated Values', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4000
      Description: Chamge dedcimal places
    */
    await openFileAndAddToCanvas('calculated-values-chain.ket', page);
    await selectTopPanelButton(TopPanelButton.Calculated, page);
    await page.getByText('Decimal places3').first().click();
    await page.getByRole('option', { name: '4' }).click();
    await page.getByText('Decimal places3').click();
    await page.getByRole('option', { name: '1' }).click();
    await page.keyboard.press('Escape');
    await selectTopPanelButton(TopPanelButton.Calculated, page);
  });

  test('Opening text file', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4005
      Description: open text file via "open file" 
    */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('cml-1945.cml', page);
  });

  test('Paste from clipboard', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4006
      Description: place structure via paste from clipboard 
    */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await page.getByText('Paste from clipboard').click();
    await pasteFromClipboardAndAddToCanvas(
      page,
      
max-len
Enforce a maximum line length

Very long lines of code in any language can be difficult to read. In order to aid in readability and maintainability many coders have developed a convention to limit lines of code to X number of characters (traditionally 80 characters).

var foo = { "bar": "This is a bar.", "baz": { "qux": "This is a qux" }, "difficult": "to read" }; // very long

Rule Details
This rule enforces a maximum line length to increase code readability and maintainability. The length of a line is defined as the number of Unicode characters in the line.

Options
This rule can have up to two numbers as positional arguments (for code and tabWidth options), followed by an object option (provided positional arguments have priority):

"code" (default 80) enforces a maximum line length
"tabWidth" (default 4) specifies the character width for tab characters
"comments" enforces a maximum line length for comments; defaults to value of code
"ignorePattern" ignores lines matching a regular expression; can only match a single line and need to be double escaped when written in YAML or JSON
"ignoreComments": true ignores all trailing comments and comments on their own line
"ignoreTrailingComments": true ignores only trailing comments
"ignoreUrls": true ignores lines that contain a URL
"ignoreStrings": true ignores lines that contain a double-quoted or single-quoted string
"ignoreTemplateLiterals": true ignores lines that contain a template literal
"ignoreRegExpLiterals": true ignores lines that contain a RegExp literal
code
Examples of incorrect code for this rule with the default { "code": 80 } option:

Open in Playground
/*eslint max-len: ["error", { "code": 80 }]*/

var foo = { "bar": "This is a bar.", "baz": { "qux": "This is a qux" }, "difficult": "to read" };



Examples of correct code for this rule with the default { "code": 80 } option:

Open in Playground
/*eslint max-len: ["error", { "code": 80 }]*/

var foo = {
  "bar": "This is a bar.",
  "baz": { "qux": "This is a qux" },
  "easier": "to read"
};







tabWidth
Examples of incorrect code for this rule with the default { "tabWidth": 4 } option:

Open in Playground
/*eslint max-len: ["error", { "code": 80, "tabWidth": 4 }]*/

\t  \t  var foo = { "bar": "This is a bar.", "baz": { "qux": "This is a qux" } };



Examples of correct code for this rule with the default { "tabWidth": 4 } option:

Open in Playground
/*eslint max-len: ["error", { "code": 80, "tabWidth": 4 }]*/

\t  \t  var foo = {
\t  \t  \t  \t  "bar": "This is a bar.",
\t  \t  \t  \t  "baz": { "qux": "This is a qux" }
\t  \t  };






comments
Examples of incorrect code for this rule with the { "comments": 65 } option:

Open in Playground
/*eslint max-len: ["error", { "comments": 65 }]*/

/**
 * This is a comment that violates the maximum line length we have specified
**/





ignoreComments
Examples of correct code for this rule with the { "ignoreComments": true } option:

Open in Playground
/*eslint max-len: ["error", { "ignoreComments": true }]*/

/**
 * This is a really really really really really really really really really long comment
**/





ignoreTrailingComments
Examples of correct code for this rule with the { "ignoreTrailingComments": true } option:

Open in Playground
/*eslint max-len: ["error", { "ignoreTrailingComments": true }]*/

var foo = 'bar'; // This is a really really really really really really really long comment



ignoreUrls
Examples of correct code for this rule with the { "ignoreUrls": true } option:

Open in Playground
/*eslint max-len: ["error", { "ignoreUrls": true }]*/

var url = 'https://www.example.com/really/really/really/really/really/really/really/long';



ignoreStrings
Examples of correct code for this rule with the { "ignoreStrings": true } option:

Open in Playground
/*eslint max-len: ["error", { "ignoreStrings": true }]*/
      'VmpDRDAxMDAEAwIBAAAAAAAAAAAAAAAAAAAAAAQCEAClnXYBBmHkAKuSsgHwQBgBAAMOAAIA////////AAAAAAAAAAETAAEAAQABAOIECQBTYW5zU2VyaWYBgAIAAAADgAMAAAAEAhAApR11AQbh4gCrErQB8MAZAQSABAAAAAACCACmm4UBBmHkAAIEAgAGACsEAgABAAAABIAFAAAAAAIIACiYhQHwQBgBAgQCAAcAKwQCAAAAAAAEgAYAAAAAAggApZ12ATJd/gACBAIACAArBAIAAAAAAASABwAAAAACCACnmaMB8EAYAQIEAgAGACsEAgABAAAABIAIAAAAAAIIABC8owEGYeQAAgQCAAYAKwQCAAEAAAAEgAkAAAAAAggAq5KyASdu/gACBAIABgArBAIAAQAAAAWACgAAAAQGBAAGAAAABQYEAAQAAAAABgIAAgABBgIAAAAAAAWACwAAAAQGBAAHAAAABQYEAAUAAAAABgIAAgABBgIAAAAAAAWADAAAAAQGBAAEAAAABQYEAAgAAAAABgIAAQABBgIAAAAAAAWADQAAAAQGBAAFAAAABQYEAAYAAAAABgIAAQABBgIAAAAAAAWADgAAAAQGBAAIAAAABQYEAAkAAAAABgIAAgABBgIAAAAAAAWADwAAAAQGBAAJAAAABQYEAAcAAAAABgIAAQABBgIAAAAAAAAAAAAAAA==',
    );
  });

  test('Paste from clipboard/bad data', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4008
      Description: bad data via paste from clipboard 
    */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await page.getByText('Paste from clipboard').click();
    await pasteFromClipboardAndAddToCanvas(
      page,
      // eslint-disable-next-line max-len
      'VAAA==',
    );
  });

  test('Opening text file/placeholder', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4009
      Description: open text file via "open file", check loading
    */
    await selectTopPanelButton(TopPanelButton.Open, page);
    await openFile('cml-1945.cml', page);
  });
  test('Paste from clipboard as a new project', async ({ page }) => {
    /*
      Test case: EPMLSOPKET-4011
      Description: place structure via paste from clipboard 
    */
    await pasteFromClipboard(
      page,
      FILE_TEST_DATA.benzeneArrowBenzeneReagentHclV2000,
    );
    await waitForLoad(page, () => {
      pressButton(page, 'Open as New Project');
    });
  });
});
