import { Page } from '@playwright/test';
import { AnyFunction, waitForCustomEvent } from '../helpers';
// eslint-disable-next-line @typescript-eslint/no-empty-function
const emptyFunction: AnyFunction = async () => {};

export const waitForRender = async (
  page: Page,
  callback = emptyFunction,
  timeout = 3000,
) => {
  await Promise.all([
    waitForCustomEvent(page, 'renderComplete', timeout),
    callback(),
  ]);
};

export const waitForCopy = async (
  page: Page,
  callback = emptyFunction,
  timeout = 3000,
) => {
  await Promise.all([
    waitForCustomEvent(page, 'copyOrCutComplete', timeout),
    callback(),
  ]);
};

export const waitForCut = async (
  page: Page,
  callback = emptyFunction,
  timeout = 3000,
) => {
  await waitForRender(page, async () => {
    await Promise.all([
      waitForCustomEvent(page, 'copyOrCutComplete', timeout),
      callback(),
    ]);
  });
};

export const waitForPaste = async (
  page: Page,
  callback = emptyFunction,
  timeout = 3000,
) => {
  await Promise.all([
    waitForCustomEvent(page, 'requestCompleted', timeout),
    callback(),
  ]);
};
