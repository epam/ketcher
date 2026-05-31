/* eslint-disable no-magic-numbers */
/* tests/pages/macromolecules/tools/Ruler.ts */
import { Page, Locator, expect } from '@playwright/test';
import { waitForRender } from '@utils/common';
import { keyboardPressOnCanvas } from '@utils/keyboard';

type RulerLocators = {
  handle: Locator;
  valueInput: Locator;
};

export const Ruler = (page: Page) => {
  const locators: RulerLocators = {
    handle: page.getByTestId('ruler-handle'),
    valueInput: page.getByTestId('ruler-input'),
  };

  return {
    ...locators,

    async hover() {
      await expect(locators.handle).toBeVisible();
      await locators.handle.hover();
    },

    async click() {
      await expect(locators.handle).toBeVisible();
      await locators.handle.click();
    },

    async clickAndHold() {
      await expect(locators.handle).toBeVisible();
      await locators.handle.hover();
      await page.mouse.down();
    },

    async dragRulerHandle(x: number, y: number) {
      await expect(locators.handle).toBeVisible();
      await locators.handle.hover();
      await page.mouse.down();
      await page.mouse.move(x, y);
      await waitForRender(page, async () => {
        await page.mouse.up();
      });
    },

    async setLength(value: string) {
      await expect(locators.valueInput).toBeVisible();
      await locators.valueInput.fill(value);
      await keyboardPressOnCanvas(page, 'Enter');
    },

    async getLength(): Promise<string> {
      await expect(locators.valueInput).toBeVisible();
      return locators.valueInput.inputValue();
    },

    async hoverOnInputField(): Promise<void> {
      await expect(locators.valueInput).toBeVisible();
      await locators.valueInput.hover();
    },
  };
};

export type RulerType = ReturnType<typeof Ruler>;
