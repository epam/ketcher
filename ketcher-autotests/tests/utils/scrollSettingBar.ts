import { Page } from "@playwright/test";

// It's a temporary workaround and will be eventually refactored to locator
export async function scrollSettingBar (page: Page, scrollLength: number){ 
    const deltaX = 0;
    const scrollBarCoordinatesX = 638;
    const scrollBarCoordinatesY = 524;
    await page.mouse.move(scrollBarCoordinatesX, scrollBarCoordinatesY);
    await page.mouse.wheel(deltaX, scrollLength);
  }