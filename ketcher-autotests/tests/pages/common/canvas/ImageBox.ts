/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';

type ImageBoxLocators = {
  imageBoxBody: Locator;
  topLeftHandle: Locator;
  topMiddleHandle: Locator;
  topRightHandle: Locator;
  leftMiddleHandle: Locator;
  rightMiddleHandle: Locator;
  bottomLeftHandle: Locator;
  bottomMiddleHandle: Locator;
  bottomRightHandle: Locator;
};

export const ImageBox = async (page: Page, imageBox: Locator) => {
  const imageBoxId = await imageBox.getAttribute('data-image-id');
  const locators: ImageBoxLocators = {
    imageBoxBody: imageBox,
    topLeftHandle: page.locator(
      `[data-testid="imageResize-topLeftPosition"][data-image-id="${imageBoxId}"]`,
    ),
    topMiddleHandle: page.locator(
      `[data-testid="imageResize-topMiddlePosition"][data-image-id="${imageBoxId}"]`,
    ),
    topRightHandle: page.locator(
      `[data-testid="imageResize-topRightPosition"][data-image-id="${imageBoxId}"]`,
    ),
    leftMiddleHandle: page.locator(
      `[data-testid="imageResize-leftMiddlePosition"][data-image-id="${imageBoxId}"]`,
    ),
    rightMiddleHandle: page.locator(
      `[data-testid="imageResize-rightMiddlePosition"][data-image-id="${imageBoxId}"]`,
    ),
    bottomLeftHandle: page.locator(
      `[data-testid="imageResize-bottomLeftPosition"][data-image-id="${imageBoxId}"]`,
    ),
    bottomMiddleHandle: page.locator(
      `[data-testid="imageResize-bottomMiddlePosition"][data-image-id="${imageBoxId}"]`,
    ),
    bottomRightHandle: page.locator(
      `[data-testid="imageResize-bottomRightPosition"][data-image-id="${imageBoxId}"]`,
    ),
  };

  return locators;
};

export type ImageBoxType = Awaited<ReturnType<typeof ImageBox>>;
