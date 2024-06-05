/* eslint-disable no-magic-numbers */
import { Locator, Page } from '@playwright/test';
import { hideMonomerPreview } from '@utils/macromolecules/index';
import { moveMouseAway, selectSingleBondTool } from '..';

export async function bondTwoMonomers(
  page: Page,
  firstMonomerElement: Locator,
  secondMonomerElement: Locator,
  connectTitle1?: string,
  connectTitle2?: string,
  needSelectAttachmentPoint = true,
  needConnect = true,
) {
  await selectSingleBondTool(page);
  await firstMonomerElement.hover();
  await page.mouse.down();
  await secondMonomerElement.hover();
  await page.mouse.up();
  await hideMonomerPreview(page);
  const dialog = await page.getByRole('dialog');
  if ((await dialog.isVisible()) && needSelectAttachmentPoint) {
    if (connectTitle1) {
      await page.locator(`button[title='${connectTitle1}']`).nth(0).click();
    }
    if (connectTitle2) {
      await page.locator(`button[title='${connectTitle2}']`).nth(1).click();
    }
    if (needConnect) {
      await page.locator('button[title=Connect]').click();
    }
  }
}

export async function bondTwoMonomersPointToPoint(
  page: Page,
  firstMonomerElement: Locator,
  secondMonomerElement: Locator,
  firstMonomerConnectionPoint?: string,
  secondMonomerConnectionPoint?: string,
) {
  await selectSingleBondTool(page);
  await firstMonomerElement.hover();

  if (firstMonomerConnectionPoint) {
    const firstConnectionPoint = await firstMonomerElement.locator(
      `xpath=//*[text()="${firstMonomerConnectionPoint}"]/..//*[@r="3"]`,
    );
    const firstConnectionPointBoundingBox =
      await firstConnectionPoint.boundingBox();

    if (firstConnectionPointBoundingBox) {
      await page.mouse.move(
        // if we click on the center of R5 connection point - it replace R5 connection point with R1
        // Bug: https://github.com/epam/ketcher/issues/4433, once it fixed - 4 have to be replaced with 2
        firstConnectionPointBoundingBox.x +
          firstConnectionPointBoundingBox.width / 4,
        firstConnectionPointBoundingBox.y +
          firstConnectionPointBoundingBox.height / 4,
      );
    } else {
      console.log(
        'Failed to locate connection point on the canvas - using Center instead.',
      );
    }
  }
  await page.mouse.down();

  await secondMonomerElement.hover();
  if (secondMonomerConnectionPoint) {
    const secondConnectionPoint = await secondMonomerElement.locator(
      `xpath=//*[text()="${secondMonomerConnectionPoint}"]/..//*[@r="3"]`,
    );

    const secondConnectionPointBoundingBox =
      await secondConnectionPoint.boundingBox();

    if (secondConnectionPointBoundingBox) {
      await page.mouse.move(
        // if we click on the center of R5 connection point - it replace R5 connection point with R1
        // Bug: https://github.com/epam/ketcher/issues/4433, once it fixed - 4 have to be replaced with 2
        secondConnectionPointBoundingBox.x +
          secondConnectionPointBoundingBox.width / 4,
        secondConnectionPointBoundingBox.y +
          secondConnectionPointBoundingBox.height / 4,
      );
    } else {
      console.log(
        'Failed to locate connection point on the canvas - using Center instead.',
      );
    }
  }
  await page.mouse.up();

  await moveMouseAway(page);
}

export async function pressCancelAtSelectConnectionPointDialog(page: Page) {
  await page.getByRole('button', { name: 'Cancel' }).click();
}

export async function pressConnectAtSelectConnectionPointDialog(page: Page) {
  await page.getByRole('button', { name: 'Connect' }).click();
}

export async function selectLeftConnectionPointAtSelectConnectionPointDialog(
  page: Page,
  connectionPoint: string,
) {
  await page.getByRole('button', { name: connectionPoint }).first().click();
}

export async function selectRightConnectionPointAtSelectConnectionPointDialog(
  page: Page,
  connectionPoint: string,
) {
  const rightMonomerLocator =
    (await page.getByRole('button', { name: connectionPoint }).count()) > 1
      ? page.getByRole('button', { name: connectionPoint }).nth(1)
      : page.getByRole('button', { name: connectionPoint }).first();

  await rightMonomerLocator.click();
}
