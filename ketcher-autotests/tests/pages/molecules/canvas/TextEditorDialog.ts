/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';
import { waitForRender } from '@utils/common';
import { LeftToolbar } from '../LeftToolbar';
import { clickInTheMiddleOfTheScreen } from '@utils/clicks';

type FontOptions = {
  isBold?: boolean;
  isItalic?: boolean;
  isSuperscript?: boolean;
  isSubscript?: boolean;
  fontSize?: number;
  content?: string;
};

type TextEditorDialogLocators = {
  closeWindowButton: Locator;
  applyButton: Locator;
  cancelButton: Locator;
  textBoldButton: Locator;
  textItalicButton: Locator;
  textSuperscriptButton: Locator;
  textSubscriptButton: Locator;
  specialSymbolsButton: Locator;
  fontSizeDropdown: Locator;
  textEditor: Locator;
};

export const TextEditorDialog = (page: Page) => {
  const locators: TextEditorDialogLocators = {
    closeWindowButton: page.getByTestId('close-window-button'),
    applyButton: page.getByTestId('OK'),
    cancelButton: page.getByTestId('Cancel'),
    textBoldButton: page.getByTestId('text-bold'),
    textItalicButton: page.getByTestId('text-italic'),
    textSuperscriptButton: page.getByTestId('text-superscript'),
    textSubscriptButton: page.getByTestId('text-subscript'),
    specialSymbolsButton: page.getByTestId('special-symbols-button'),
    fontSizeDropdown: page.getByTestId('font-size-button'),
    textEditor: page.getByTestId('text-editor'),
  };
  return {
    ...locators,

    async close() {
      await locators.closeWindowButton.click();
    },

    async apply() {
      await waitForRender(page, async () => {
        await locators.applyButton.click();
      });
    },

    async cancel() {
      await locators.cancelButton.click();
    },

    async clickTextBoldButton() {
      await locators.textBoldButton.click();
    },

    async clickTextItalicButton() {
      await locators.textItalicButton.click();
    },

    async clickTextSuperscriptButton() {
      await locators.textSuperscriptButton.click();
    },

    async clickTextSubscriptButton() {
      await locators.textSubscriptButton.click();
    },

    async clickSpecialSymbolsButton() {
      await locators.specialSymbolsButton.click();
    },

    async clickTextEditor() {
      await locators.textEditor.click();
    },

    async selectAllText() {
      await locators.textEditor.selectText();
    },

    async setText(text: string) {
      await locators.textEditor.fill(text);
    },

    async addText(text: string) {
      await locators.textEditor.pressSequentially(text);
    },

    async selectFontSize(fontSize: number) {
      const numberToSelect = page.getByTestId(`${fontSize}-option`);

      if (fontSize < 4 || fontSize > 144) {
        console.error('Font size must be between 4 and 144.');
      } else {
        await locators.fontSizeDropdown.waitFor({ state: 'visible' });
        await locators.fontSizeDropdown.click();
        await numberToSelect.waitFor({ state: 'visible' });
        await numberToSelect.click();
        await numberToSelect.waitFor({ state: 'hidden' });
      }
    },

    async setOptions(fontOption: FontOptions) {
      if (fontOption.isBold) {
        await locators.textBoldButton.click();
      }

      if (fontOption.isItalic) {
        await locators.textItalicButton.click();
      }

      if (fontOption.isSuperscript) {
        await locators.textSuperscriptButton.click();
      }

      if (fontOption.isSubscript) {
        await locators.textSubscriptButton.click();
      }

      if (fontOption.fontSize) {
        await this.selectFontSize(fontOption.fontSize);
      }

      if (fontOption.content) {
        await this.setText(fontOption.content);
      }

      await this.apply();
    },
  };
};

export async function addTextBoxToCanvas(page: Page) {
  await LeftToolbar(page).text();
  await clickInTheMiddleOfTheScreen(page);
  await TextEditorDialog(page).clickTextEditor();
}

export async function addTextToCanvas(
  page: Page,
  text: string,
  x?: number,
  y?: number,
) {
  await LeftToolbar(page).text();
  if (x !== undefined && y !== undefined) {
    await page.mouse.click(x, y);
  } else {
    await clickInTheMiddleOfTheScreen(page);
  }
  await TextEditorDialog(page).setText(text);
  await TextEditorDialog(page).apply();
}

export type TextEditorDialogType = ReturnType<typeof TextEditorDialog>;
