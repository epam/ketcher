import { test, expect } from '@playwright/test';
import fs from 'fs';
import { getScrollBarHideCssPath } from '@utils/canvas/helpers';

test.describe('Screenshot style guard', () => {
  test('hideScroll.css resolved path exists', () => {
    const cssPath = getScrollBarHideCssPath();

    expect(
      fs.existsSync(cssPath),
      `Expected hideScroll.css at: ${cssPath}`,
    ).toBe(true);
  });
});
