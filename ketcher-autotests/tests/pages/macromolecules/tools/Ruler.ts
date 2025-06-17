/* eslint-disable no-magic-numbers */
/* tests/pages/macromolecules/tools/Ruler.ts */
import { Page, Locator, expect } from '@playwright/test';

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

    async dragRulerHandle(offsetX: number, offsetY: number) {
      await expect(locators.handle).toBeVisible();
      const box = await locators.handle.boundingBox();
      if (!box) return;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(
        box.x + box.width / 2 + offsetX,
        box.y + box.height / 2 + offsetY,
      );
      await page.mouse.up();
    },

    async setLength(value: string) {
      await expect(locators.valueInput).toBeVisible();
      await locators.valueInput.fill(value);
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
