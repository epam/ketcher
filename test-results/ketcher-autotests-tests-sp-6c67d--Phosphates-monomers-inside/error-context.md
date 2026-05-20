# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ketcher-autotests/tests/specs/Chromium-popup/API/api-for-update-monomer-library-in-sdf-format.spec.ts >> API for replace Library >> Case 5: Replace whole library with library of 3000 Phosphates monomers inside
- Location: ketcher-autotests/tests/specs/Chromium-popup/API/api-for-update-monomer-library-in-sdf-format.spec.ts:380:7

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "", waiting until "load"

```

# Test source

```ts
  1  | import { Page } from '@playwright/test';
  2  | import { waitForKetcherInit } from './waitForKetcherInit/waitForKetcherInit';
  3  | import { waitForIndigoToLoad } from './waitForIndigoToLoad';
  4  | 
  5  | export const waitForPageInit = async (page: Page) => {
> 6  |   await page.goto('');
     |              ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  7  |   await waitForKetcherInit(page);
  8  |   await waitForIndigoToLoad(page);
  9  | };
  10 | 
```