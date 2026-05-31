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

export const ImageBox = async (page: Page, imageBox?: Locator) => {
  let imageBoxId;
  if (imageBox) {
    imageBoxId = await imageBox.getAttribute('data-image-id');
  } else {
    imageBoxId = null;
  }
  const locators: ImageBoxLocators = {
    imageBoxBody:
      imageBoxId === null
        ? page.locator('[data-testid="__missing-image-box-id__"]')
        : page.locator(`[data-testid="image"][data-image-id="${imageBoxId}"]`),
    topLeftHandle:
      imageBoxId === null
        ? page.locator('[data-testid="__missing-image-box-id__"]')
        : page.locator(
            `[data-testid="imageResize-topLeftPosition"][data-image-id="${imageBoxId}"]`,
          ),
    topMiddleHandle:
      imageBoxId === null
        ? page.locator('[data-testid="__missing-image-box-id__"]')
        : page.locator(
            `[data-testid="imageResize-topMiddlePosition"][data-image-id="${imageBoxId}"]`,
          ),
    topRightHandle:
      imageBoxId === null
        ? page.locator('[data-testid="__missing-image-box-id__"]')
        : page.locator(
            `[data-testid="imageResize-topRightPosition"][data-image-id="${imageBoxId}"]`,
          ),
    leftMiddleHandle:
      imageBoxId === null
        ? page.locator('[data-testid="__missing-image-box-id__"]')
        : page.locator(
            `[data-testid="imageResize-leftMiddlePosition"][data-image-id="${imageBoxId}"]`,
          ),
    rightMiddleHandle:
      imageBoxId === null
        ? page.locator('[data-testid="__missing-image-box-id__"]')
        : page.locator(
            `[data-testid="imageResize-rightMiddlePosition"][data-image-id="${imageBoxId}"]`,
          ),
    bottomLeftHandle:
      imageBoxId === null
        ? page.locator('[data-testid="__missing-image-box-id__"]')
        : page.locator(
            `[data-testid="imageResize-bottomLeftPosition"][data-image-id="${imageBoxId}"]`,
          ),
    bottomMiddleHandle:
      imageBoxId === null
        ? page.locator('[data-testid="__missing-image-box-id__"]')
        : page.locator(
            `[data-testid="imageResize-bottomMiddlePosition"][data-image-id="${imageBoxId}"]`,
          ),
    bottomRightHandle:
      imageBoxId === null
        ? page.locator('[data-testid="__missing-image-box-id__"]')
        : page.locator(
            `[data-testid="imageResize-bottomRightPosition"][data-image-id="${imageBoxId}"]`,
          ),
  };

  return locators;
};

export type ImageBoxType = Awaited<ReturnType<typeof ImageBox>>;
