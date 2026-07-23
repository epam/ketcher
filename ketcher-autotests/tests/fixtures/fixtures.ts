import { mergeTests } from '@playwright/test';
import { test as moleculesCanvas } from './canvas/moleculesCanvasFixtures';
import { test as flexCanvas } from './canvas/flexCanvasFixtures';
import { test as sequenceCanvas } from './canvas/sequenceCanvasFixtures';
import { test as snakeCanvas } from './canvas/snakeCanvasFixtures';
export const test = mergeTests(
  moleculesCanvas,
  flexCanvas,
  snakeCanvas,
  sequenceCanvas,
);
export { chromium, expect } from '@playwright/test';
export type { Page, Locator } from '@playwright/test';
