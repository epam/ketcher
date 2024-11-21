/* eslint-disable no-magic-numbers */
import { Locator, Page } from '@playwright/test';
import { hideMonomerPreview } from '@utils/macromolecules/index';
import { moveMouseAway, selectMacroBond, selectSingleBondTool } from '..';
import { DropdownToolIds } from '@utils/clicks/types';

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
  bondType?: DropdownToolIds,
) {
  await selectMacroBond(page, bondType);
  await firstMonomerElement.hover({ force: true });

  if (firstMonomerConnectionPoint) {
    const firstConnectionPoint = firstMonomerElement.locator(
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

  await secondMonomerElement.hover({ force: true });
  if (secondMonomerConnectionPoint) {
    const secondConnectionPoint = secondMonomerElement.locator(
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

export async function bondMonomerPointToMoleculeAtom(
  page: Page,
  monomer: Locator,
  atom: Locator,
  monomerConnectionPoint?: string,
  connectionPointShift?: { x: number; y: number },
) {
  await selectSingleBondTool(page);
  await monomer.hover({ force: true });

  if (monomerConnectionPoint) {
    // const connectionPoint = monomer.locator(
    //   `xpath=//*[text()="${monomerConnectionPoint}"]/..//*[@r="3"]`,
    // );
    const connectionPoint = page
      .locator('g')
      .filter({ hasText: new RegExp(`^${monomerConnectionPoint}$`) })
      .locator('circle');

    // await connectionPoint.hover({ force: true });
    const connectionPointBoundingBox = await connectionPoint.boundingBox();
    const monomerBoundingBox = await monomer.boundingBox();

    if (connectionPointBoundingBox && monomerBoundingBox) {
      const multiplier = 1 / 5;
      const connectionPointCenterX =
        connectionPointBoundingBox.x + connectionPointBoundingBox.width / 2;
      const connectionPointCenterY =
        connectionPointBoundingBox.y + connectionPointBoundingBox.height / 2;

      const monomerCenterX =
        monomerBoundingBox.x + monomerBoundingBox.width / 2;
      const monomerCenterY =
        monomerBoundingBox.y + monomerBoundingBox.height / 2;

      const x =
        connectionPointCenterX +
        (monomerCenterX - connectionPointCenterX) * multiplier;
      const y =
        connectionPointCenterY +
        (monomerCenterY - connectionPointCenterY) * multiplier;

      await page.mouse.move(x, y);
    } else {
      console.log(
        'Failed to locate connection point on the canvas - using Center instead.',
      );
    }
  }
  await page.mouse.down();

  // await atom.hover({ force: true });
  if (connectionPointShift) {
    const atomBoundingBox = await atom.boundingBox();

    if (atomBoundingBox) {
      await page.mouse.move(
        atomBoundingBox.x + atomBoundingBox.width / 2 + connectionPointShift.x,
        atomBoundingBox.y + atomBoundingBox.height / 2 + connectionPointShift.y,
      );
    } else {
      await atom.hover({ force: true });
      console.log(
        'Failed to locate atom on the canvas - using Center instead.',
      );
    }
  }
  await page.mouse.up();

  await moveMouseAway(page);
}

export async function bondNucleotidePointToMoleculeAtom(
  page: Page,
  monomer: Locator,
  atom: Locator,
  monomerConnectionPoint?: string,
  connectionPointShift?: { x: number; y: number },
) {
  await selectSingleBondTool(page);
  await monomer.hover({ force: true });

  if (monomerConnectionPoint) {
    // const connectionPoint = monomer.locator(
    //   `xpath=//*[text()="${monomerConnectionPoint}"]/..//*[@r="3"]`,
    // );
    const connectionPoint = page
      .locator('g')
      .filter({ hasText: new RegExp(`^${monomerConnectionPoint}$`) })
      .locator('circle');

    // await connectionPoint.hover({ force: true });
    const connectionPointBoundingBox = await connectionPoint.boundingBox();

    if (connectionPointBoundingBox) {
      let multiplier = 2;
      switch (monomerConnectionPoint) {
        case 'R2':
          multiplier = 3 / 4;
          break;
        // if we click on the center of R5 connection point - it replace R5 connection point with R1
        // Bug: https://github.com/epam/ketcher/issues/4433, once it fixed - 4 have to be replaced with 2
        case 'R5':
          multiplier = 4;
          break;
      }
      await page.mouse.move(
        connectionPointBoundingBox.x +
          connectionPointBoundingBox.width / multiplier,
        connectionPointBoundingBox.y +
          connectionPointBoundingBox.height / multiplier,
      );
    } else {
      console.log(
        'Failed to locate connection point on the canvas - using Center instead.',
      );
    }
  }
  await page.mouse.down();

  // await atom.hover({ force: true });
  if (connectionPointShift) {
    const atomBoundingBox = await atom.boundingBox();

    if (atomBoundingBox) {
      await page.mouse.move(
        atomBoundingBox.x + atomBoundingBox.width / 2 + connectionPointShift.x,
        atomBoundingBox.y + atomBoundingBox.height / 2 + connectionPointShift.y,
      );
    } else {
      await atom.hover({ force: true });
      console.log(
        'Failed to locate atom on the canvas - using Center instead.',
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

export async function clickOnMicroBondByIndex(page: Page, bondIndex: number) {
  const bondLocator = page
    .getByTestId('ketcher-canvas')
    .locator(`g:nth-child(${bondIndex.toString()}) > path`)
    .first();

  const boundingBox = await bondLocator.boundingBox();

  await bondLocator.click({ force: true });

  // Simple click on element doesn't work always because only black pixels of bond are clickable (what? YES!)
  // So, bonds with empty space in the center (for example - double bond) are not clickable
  if (boundingBox) {
    await page.mouse.click(
      boundingBox.x + boundingBox.width / 2 + 2,
      boundingBox.y + boundingBox.height / 2 + 2,
    );
  }
}
