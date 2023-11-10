import { Page } from "@playwright/test";

// This is a temporary workaround and will be eventually refactored to locator
export async function scrollBar(page: Page) {
    const deltaX = 0;
    const deltaY = 80;
    const anyX = 638;
    const anyY = 524;
    await page.mouse.move(anyX, anyY);
    await page.mouse.wheel(deltaX, deltaY);
  }