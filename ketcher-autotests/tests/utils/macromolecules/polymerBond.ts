/* eslint-disable no-magic-numbers */
import { Locator, Page } from '@playwright/test';
import { hideMonomerPreview } from '@utils/macromolecules/index';
import { clickOnCanvas, MonomerType, moveMouseAway } from '..';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import {
  MacroBondDataIds,
  MacroBondType,
} from '@tests/pages/constants/bondSelectionTool/Constants';

export enum BondType {
  None = 0,
  Single = 1,
  Double = 2,
  Triple = 3,
  Aromatic = 4,
  SingleDouble = 5,
  SingleAromatic = 6,
  DoubleAromatic = 7,
  Any = 8,
  Dative = 9,
  Hydrogen = 10,
}
export enum BondStereo {
  None = 0,
  Up = 1,
  Either = 4,
  Down = 6,
  CisTrans = 3,
}

export async function bondTwoMonomers(
  page: Page,
  firstMonomerElement: Locator,
  secondMonomerElement: Locator,
  connectTitle1?: string,
  connectTitle2?: string,
  bondType: MacroBondType = MacroBondType.Single,
  needSelectAttachmentPoint = true,
  needConnect = true,
) {
  await CommonLeftToolbar(page).selectBondTool(bondType);
  await firstMonomerElement.hover({ force: true });
  await page.mouse.down();
  await secondMonomerElement.hover({ force: true });
  await page.mouse.up();
  await hideMonomerPreview(page);
  const dialog = page.getByRole('dialog');
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

async function getMinFreeConnectionPoint(
  monomer: Locator,
): Promise<string | undefined> {
  // Find the attribute with the minimum index that has a value of "false"
  const minIndexWithFalse = await monomer.evaluate((el) => {
    // Get all attributes of a monomer
    const attributes = Array.from(el.attributes);

    // Filter attributes that match the pattern "data-R<number>" and the value "false"
    const falseAttributes = attributes
      .map((attr) => {
        // Checking the attribute name
        const match = attr.name.match(/^data-R(\d+)$/);
        // Check the value
        return match && attr.value === 'false' ? Number(match[1]) : null;
      })
      // Remove null
      .filter((index): index is number => index !== null);

    // Return the minimum index if attributes are found, or null
    return falseAttributes.length > 0 ? Math.min(...falseAttributes) : null;
  });

  if (minIndexWithFalse) {
    return `R${minIndexWithFalse.toString()}`;
  }
  return undefined;
}

async function getAvailableConnectionPoints(
  monomer: Locator,
): Promise<string[]> {
  // Get all attributes of an element
  const attributes = await monomer.evaluate((element) => {
    // Get all attributes of the data-Rn type
    return Array.from(element.attributes)
      .filter((attr) => attr.name.startsWith('data-R'))
      .map((attr) => ({ name: attr.name, value: attr.value }));
  });

  // Filter attributes with the value "false" and remove the prefix "data-"
  const falseAttributes = attributes
    .filter((attr) => attr.value === 'false')
    .map((attr) => attr.name.replace('data-', ''));

  return falseAttributes;
}

async function chooseFreeConnectionPointsInDialogIfAppeared(
  page: Page,
  firstMonomer: Locator,
  secondMonomer: Locator,
  firstMonomerConnectionPoint?: string,
  secondMonomerConnectionPoint?: string,
): Promise<{
  leftMonomerConnectionPoint: string | undefined;
  rightMonomerConnectionPoint: string | undefined;
}> {
  if (await page.getByRole('dialog').isVisible()) {
    if (!firstMonomerConnectionPoint) {
      firstMonomerConnectionPoint = await getMinFreeConnectionPoint(
        firstMonomer,
      );
    }
    if (!secondMonomerConnectionPoint) {
      secondMonomerConnectionPoint = await getMinFreeConnectionPoint(
        secondMonomer,
      );
    }

    if (firstMonomerConnectionPoint && secondMonomerConnectionPoint) {
      await page.getByTitle(firstMonomerConnectionPoint).first().click();

      (await page.getByTitle(secondMonomerConnectionPoint).count()) > 1
        ? await page.getByTitle(secondMonomerConnectionPoint).nth(1).click()
        : await page.getByTitle(secondMonomerConnectionPoint).first().click();
    }

    await page.getByTitle('Connect').first().click();

    return {
      leftMonomerConnectionPoint: firstMonomerConnectionPoint,
      rightMonomerConnectionPoint: secondMonomerConnectionPoint,
    };
  }
  const firstMonomerType = await firstMonomer.getAttribute('data-monomertype');
  const secondMonomerType = await firstMonomer.getAttribute('data-monomertype');

  const firstMonomerAvailableConnectionPoints =
    await getAvailableConnectionPoints(firstMonomer);
  const secondMonomerAvailableConnectionPoints =
    await getAvailableConnectionPoints(secondMonomer);

  if (!firstMonomerConnectionPoint && !secondMonomerConnectionPoint) {
    if (
      firstMonomerAvailableConnectionPoints.includes('R2') &&
      secondMonomerAvailableConnectionPoints.includes('R1')
    ) {
      firstMonomerConnectionPoint = 'R2';
      secondMonomerConnectionPoint = 'R1';
    } else if (
      firstMonomerAvailableConnectionPoints.includes('R1') &&
      secondMonomerAvailableConnectionPoints.includes('R2')
    ) {
      firstMonomerConnectionPoint = 'R1';
      secondMonomerConnectionPoint = 'R2';
    }

    if (
      firstMonomerType === MonomerType.Sugar &&
      secondMonomerType === MonomerType.Base &&
      firstMonomerAvailableConnectionPoints.includes('R3') &&
      secondMonomerAvailableConnectionPoints.includes('R1')
    ) {
      firstMonomerConnectionPoint = 'R3';
      secondMonomerConnectionPoint = 'R1';
    }

    if (
      firstMonomerType === MonomerType.Base &&
      secondMonomerType === MonomerType.Sugar &&
      firstMonomerAvailableConnectionPoints.includes('R1') &&
      secondMonomerAvailableConnectionPoints.includes('R3')
    ) {
      firstMonomerConnectionPoint = 'R1';
      secondMonomerConnectionPoint = 'R3';
    }

    return {
      leftMonomerConnectionPoint: firstMonomerConnectionPoint,
      rightMonomerConnectionPoint: secondMonomerConnectionPoint,
    };
  }

  if (
    firstMonomerConnectionPoint === 'R1' &&
    !secondMonomerConnectionPoint &&
    secondMonomerAvailableConnectionPoints.includes('R2')
  ) {
    secondMonomerConnectionPoint = 'R2';
  }

  if (
    firstMonomerConnectionPoint === 'R2' &&
    !secondMonomerConnectionPoint &&
    secondMonomerAvailableConnectionPoints.includes('R1')
  ) {
    secondMonomerConnectionPoint = 'R1';
  }

  if (
    !firstMonomerConnectionPoint &&
    firstMonomerAvailableConnectionPoints.includes('R2') &&
    secondMonomerConnectionPoint === 'R1'
  ) {
    firstMonomerConnectionPoint = 'R2';
  }

  if (
    !firstMonomerConnectionPoint &&
    firstMonomerAvailableConnectionPoints.includes('R1') &&
    secondMonomerConnectionPoint === 'R2'
  ) {
    firstMonomerConnectionPoint = 'R1';
  }

  if (
    firstMonomerType === MonomerType.Base &&
    secondMonomerType === MonomerType.Sugar &&
    firstMonomerConnectionPoint === 'R1' &&
    !secondMonomerConnectionPoint &&
    secondMonomerAvailableConnectionPoints.includes('R3')
  ) {
    secondMonomerConnectionPoint = 'R3';
  }

  if (
    firstMonomerType === MonomerType.Base &&
    secondMonomerType === MonomerType.Sugar &&
    !firstMonomerConnectionPoint &&
    firstMonomerAvailableConnectionPoints.includes('R1') &&
    secondMonomerConnectionPoint === 'R3'
  ) {
    firstMonomerConnectionPoint = 'R1';
  }

  if (
    firstMonomerType === MonomerType.Sugar &&
    secondMonomerType === MonomerType.Base &&
    firstMonomerConnectionPoint === 'R3' &&
    !secondMonomerConnectionPoint &&
    secondMonomerAvailableConnectionPoints.includes('R1')
  ) {
    secondMonomerConnectionPoint = 'R1';
  }

  if (
    firstMonomerType === MonomerType.Sugar &&
    secondMonomerType === MonomerType.Base &&
    !firstMonomerConnectionPoint &&
    firstMonomerAvailableConnectionPoints.includes('R3') &&
    secondMonomerConnectionPoint === 'R1'
  ) {
    firstMonomerConnectionPoint = 'R3';
  }

  if (firstMonomerAvailableConnectionPoints.length === 1) {
    firstMonomerConnectionPoint = firstMonomerAvailableConnectionPoints[0];
  }
  if (secondMonomerAvailableConnectionPoints.length === 1) {
    secondMonomerConnectionPoint = secondMonomerAvailableConnectionPoints[0];
  }

  return {
    leftMonomerConnectionPoint: firstMonomerConnectionPoint,
    rightMonomerConnectionPoint: secondMonomerConnectionPoint,
  };
}

export async function bondTwoMonomersPointToPoint(
  page: Page,
  firstMonomer: Locator,
  secondMonomer: Locator,
  firstMonomerConnectionPoint?: string,
  secondMonomerConnectionPoint?: string,
  bondType?: MacroBondType,
  // if true - first free from left connection point will be selected in the dialog for both monomers
  chooseConnectionPointsInDialogIfAppeared = false,
): Promise<Locator> {
  if (bondType) {
    await CommonLeftToolbar(page).selectBondTool(bondType);
  } else {
    await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
  }

  await firstMonomer.hover({ force: true });

  if (firstMonomerConnectionPoint) {
    const firstConnectionPoint = firstMonomer.locator(
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

  await secondMonomer.hover({ force: true });
  if (secondMonomerConnectionPoint) {
    const secondConnectionPoint = secondMonomer.locator(
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

  if (chooseConnectionPointsInDialogIfAppeared) {
    const { leftMonomerConnectionPoint, rightMonomerConnectionPoint } =
      await chooseFreeConnectionPointsInDialogIfAppeared(
        page,
        firstMonomer,
        secondMonomer,
        firstMonomerConnectionPoint,
        secondMonomerConnectionPoint,
      );
    firstMonomerConnectionPoint = leftMonomerConnectionPoint;
    secondMonomerConnectionPoint = rightMonomerConnectionPoint;
  }

  const monomerOrAtom = await secondMonomer.getAttribute('data-testid');

  let bondLocator: Locator = page.locator('');
  if (monomerOrAtom === 'monomer') {
    bondLocator = getBondLocator(page, {
      fromMonomerId:
        (await firstMonomer.getAttribute('data-monomerid')) || undefined,
      toMonomerId:
        (await secondMonomer.getAttribute('data-monomerid')) || undefined,
      fromConnectionPoint: firstMonomerConnectionPoint,
      toConnectionPoint: secondMonomerConnectionPoint,
    });
  } else if (monomerOrAtom === 'atom') {
    bondLocator = getBondLocator(page, {
      fromMonomerId:
        (await firstMonomer.getAttribute('data-monomerid')) || undefined,
      toAtomId: (await secondMonomer.getAttribute('data-atomid')) || undefined,
      fromConnectionPoint: firstMonomerConnectionPoint,
      toConnectionPoint: secondMonomerConnectionPoint,
    });
  }

  return bondLocator;
}

export async function bondMonomerPointToMoleculeAtom(
  page: Page,
  monomer: Locator,
  atom: Locator,
  monomerConnectionPoint?: string,
  connectionPointShift?: { x: number; y: number },
) {
  await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
  await monomer.hover({ force: true });

  if (monomerConnectionPoint) {
    const connectionPoint = page
      .locator('g')
      .filter({ hasText: new RegExp(`^${monomerConnectionPoint}$`) })
      .locator('circle');

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

  if (connectionPointShift) {
    const atomBoundingBox = await atom.boundingBox();

    if (atomBoundingBox) {
      await page.mouse.move(
        atomBoundingBox.x + atomBoundingBox.width / 2 + connectionPointShift.x,
        atomBoundingBox.y + atomBoundingBox.height / 2 + connectionPointShift.y,
      );
    }
  } else {
    await atom.hover({ force: true });
    // console.log('Failed to locate atom on the canvas - using Center instead.');
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
  await CommonLeftToolbar(page).selectBondTool(MacroBondType.Single);
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
    .getByTestId(KETCHER_CANVAS)
    .locator(`g:nth-child(${bondIndex.toString()}) > path`)
    .first();

  const boundingBox = await bondLocator.boundingBox();

  await bondLocator.click({ force: true });

  // Simple click on element doesn't work always because only black pixels of bond are clickable (what? YES!)
  // So, bonds with empty space in the center (for example - double bond) are not clickable
  if (boundingBox) {
    await clickOnCanvas(
      page,
      boundingBox.x + boundingBox.width / 2 + 2,
      boundingBox.y + boundingBox.height / 2 + 2,
    );
  }
}

export function getBondLocator(
  page: Page,
  {
    bondType,
    bondStereo,
    bondId,
    fromMonomerId,
    toMonomerId,
    toAtomId,
    fromConnectionPoint,
    toConnectionPoint,
  }: {
    bondType?: MacroBondDataIds | number;
    bondStereo?: BondStereo;
    bondId?: string | number;
    fromMonomerId?: string | number;
    toMonomerId?: string | number;
    toAtomId?: string | number;
    fromConnectionPoint?: string;
    toConnectionPoint?: string;
  },
): Locator {
  const attributes: { [key: string]: string } = {};

  attributes['data-testid'] = 'bond';

  if (bondType !== undefined) attributes['data-bondtype'] = String(bondType);
  if (bondStereo !== undefined) {
    attributes['data-bondstereo'] = String(bondStereo);
  }
  if (bondId !== undefined) attributes['data-bondid'] = String(bondId);
  if (fromMonomerId !== undefined) {
    attributes['data-frommonomerid'] = String(fromMonomerId);
  }
  if (toMonomerId !== undefined) {
    attributes['data-tomonomerid'] = String(toMonomerId);
  }
  if (toAtomId !== undefined) attributes['data-toatomid'] = String(toAtomId);
  if (fromConnectionPoint !== undefined) {
    attributes['data-fromconnectionpoint'] = fromConnectionPoint;
  }
  if (toConnectionPoint !== undefined) {
    attributes['data-toconnectionpoint'] = toConnectionPoint;
  }

  const attributeSelectors = Object.entries(attributes)
    .map(([key, value]) => `[${key}="${value}"]`)
    .join('');

  const locator = page.locator(attributeSelectors);

  return locator;
}
