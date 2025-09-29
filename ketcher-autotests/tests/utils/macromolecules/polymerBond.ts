/* eslint-disable no-magic-numbers */
import { Locator, Page } from '@playwright/test';
import { hideMonomerPreview } from '@utils/macromolecules/index';
import { MonomerType, moveMouseAway } from '..';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import {
  MacroBondDataIds,
  MacroBondType,
  MicroBondDataIds,
} from '@tests/pages/constants/bondSelectionTool/Constants';
import { AttachmentPoint } from './monomer';
import { AttachmentPointsDialog } from '@tests/pages/macromolecules/canvas/AttachmentPointsDialog';

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
  firstMonomer: Locator,
  secondMonomer: Locator,
  attachmentPoint1?: AttachmentPoint,
  attachmentPoint2?: AttachmentPoint,
  bondType: MacroBondType = MacroBondType.Single,
) {
  await CommonLeftToolbar(page).selectBondTool(bondType);
  await firstMonomer.hover({ force: true });
  await page.mouse.down();
  await secondMonomer.hover({ force: true });
  await page.mouse.up();
  await hideMonomerPreview(page);
  const attachmentPointsDialog = AttachmentPointsDialog(page);
  if (
    (attachmentPoint1 || attachmentPoint2) &&
    (await attachmentPointsDialog.isVisible())
  ) {
    await attachmentPointsDialog.selectAttachmentPoints({
      leftMonomer: attachmentPoint1,
      rightMonomer: attachmentPoint2,
    });

    await attachmentPointsDialog.connect();
  }

  return getBondLocator(page, {
    fromMonomerId:
      (await firstMonomer.getAttribute('data-monomerid')) || undefined,
    toMonomerId:
      (await secondMonomer.getAttribute('data-monomerid')) || undefined,
  });
}

async function getMinFreeAttachmentPoint(
  monomer: Locator,
): Promise<AttachmentPoint | undefined> {
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
    return AttachmentPoint[
      `R${minIndexWithFalse.toString()}` as keyof typeof AttachmentPoint
    ];
  }
  return undefined;
}

function isMonomerAttachmentPoint(value: string): value is AttachmentPoint {
  return Object.values(AttachmentPoint).includes(value as AttachmentPoint);
}

export async function getAvailableAttachmentPoints(
  monomer: Locator,
): Promise<AttachmentPoint[]> {
  const attributes = await monomer.evaluate((element) =>
    Array.from(element.attributes)
      .filter((attr) => attr.name.startsWith('data-R'))
      .map((attr) => ({ name: attr.name, value: attr.value })),
  );

  const falseAttributes = attributes
    .filter((attr) => attr.value === 'false')
    .map((attr) => attr.name.replace('data-', ''))
    .filter(isMonomerAttachmentPoint);

  return falseAttributes;
}

async function chooseFreeAttachmentPointsInDialogIfAppeared(
  page: Page,
  firstMonomer: Locator,
  secondMonomer: Locator,
  firstMonomerAttachmentPoint?: AttachmentPoint,
  secondMonomerAttachmentPoint?: AttachmentPoint,
): Promise<{
  leftMonomerAttachmentPoint: AttachmentPoint | undefined;
  rightMonomerAttachmentPoint: AttachmentPoint | undefined;
}> {
  if (await page.getByRole('dialog').isVisible()) {
    if (!firstMonomerAttachmentPoint) {
      firstMonomerAttachmentPoint = await getMinFreeAttachmentPoint(
        firstMonomer,
      );
    }
    if (!secondMonomerAttachmentPoint) {
      secondMonomerAttachmentPoint = await getMinFreeAttachmentPoint(
        secondMonomer,
      );
    }

    if (firstMonomerAttachmentPoint && secondMonomerAttachmentPoint) {
      await page.getByTitle(firstMonomerAttachmentPoint).first().click();

      (await page.getByTitle(secondMonomerAttachmentPoint).count()) > 1
        ? await page.getByTitle(secondMonomerAttachmentPoint).nth(1).click()
        : await page.getByTitle(secondMonomerAttachmentPoint).first().click();
    }

    await AttachmentPointsDialog(page).connect();

    return {
      leftMonomerAttachmentPoint: firstMonomerAttachmentPoint,
      rightMonomerAttachmentPoint: secondMonomerAttachmentPoint,
    };
  }
  const firstMonomerType = await firstMonomer.getAttribute('data-monomertype');
  const secondMonomerType = await firstMonomer.getAttribute('data-monomertype');

  const firstMonomerAvailableConnectionPoints =
    await getAvailableAttachmentPoints(firstMonomer);
  const secondMonomerAvailableConnectionPoints =
    await getAvailableAttachmentPoints(secondMonomer);

  if (!firstMonomerAttachmentPoint && !secondMonomerAttachmentPoint) {
    if (
      firstMonomerAvailableConnectionPoints.includes(AttachmentPoint.R2) &&
      secondMonomerAvailableConnectionPoints.includes(AttachmentPoint.R1)
    ) {
      firstMonomerAttachmentPoint = AttachmentPoint.R2;
      secondMonomerAttachmentPoint = AttachmentPoint.R1;
    } else if (
      firstMonomerAvailableConnectionPoints.includes(AttachmentPoint.R1) &&
      secondMonomerAvailableConnectionPoints.includes(AttachmentPoint.R2)
    ) {
      firstMonomerAttachmentPoint = AttachmentPoint.R1;
      secondMonomerAttachmentPoint = AttachmentPoint.R2;
    }

    if (
      firstMonomerType === MonomerType.Sugar &&
      secondMonomerType === MonomerType.Base &&
      firstMonomerAvailableConnectionPoints.includes(AttachmentPoint.R3) &&
      secondMonomerAvailableConnectionPoints.includes(AttachmentPoint.R1)
    ) {
      firstMonomerAttachmentPoint = AttachmentPoint.R3;
      secondMonomerAttachmentPoint = AttachmentPoint.R1;
    }

    if (
      firstMonomerType === MonomerType.Base &&
      secondMonomerType === MonomerType.Sugar &&
      firstMonomerAvailableConnectionPoints.includes(AttachmentPoint.R1) &&
      secondMonomerAvailableConnectionPoints.includes(AttachmentPoint.R3)
    ) {
      firstMonomerAttachmentPoint = AttachmentPoint.R1;
      secondMonomerAttachmentPoint = AttachmentPoint.R3;
    }

    return {
      leftMonomerAttachmentPoint: firstMonomerAttachmentPoint,
      rightMonomerAttachmentPoint: secondMonomerAttachmentPoint,
    };
  }

  if (
    firstMonomerAttachmentPoint === AttachmentPoint.R1 &&
    !secondMonomerAttachmentPoint &&
    secondMonomerAvailableConnectionPoints.includes(AttachmentPoint.R2)
  ) {
    secondMonomerAttachmentPoint = AttachmentPoint.R2;
  }

  if (
    firstMonomerAttachmentPoint === AttachmentPoint.R2 &&
    !secondMonomerAttachmentPoint &&
    secondMonomerAvailableConnectionPoints.includes(AttachmentPoint.R1)
  ) {
    secondMonomerAttachmentPoint = AttachmentPoint.R1;
  }

  if (
    !firstMonomerAttachmentPoint &&
    firstMonomerAvailableConnectionPoints.includes(AttachmentPoint.R2) &&
    secondMonomerAttachmentPoint === AttachmentPoint.R1
  ) {
    firstMonomerAttachmentPoint = AttachmentPoint.R2;
  }

  if (
    !firstMonomerAttachmentPoint &&
    firstMonomerAvailableConnectionPoints.includes(AttachmentPoint.R1) &&
    secondMonomerAttachmentPoint === AttachmentPoint.R2
  ) {
    firstMonomerAttachmentPoint = AttachmentPoint.R1;
  }

  if (
    firstMonomerType === MonomerType.Base &&
    secondMonomerType === MonomerType.Sugar &&
    firstMonomerAttachmentPoint === AttachmentPoint.R1 &&
    !secondMonomerAttachmentPoint &&
    secondMonomerAvailableConnectionPoints.includes(AttachmentPoint.R3)
  ) {
    secondMonomerAttachmentPoint = AttachmentPoint.R3;
  }

  if (
    firstMonomerType === MonomerType.Base &&
    secondMonomerType === MonomerType.Sugar &&
    !firstMonomerAttachmentPoint &&
    firstMonomerAvailableConnectionPoints.includes(AttachmentPoint.R1) &&
    secondMonomerAttachmentPoint === AttachmentPoint.R3
  ) {
    firstMonomerAttachmentPoint = AttachmentPoint.R1;
  }

  if (
    firstMonomerType === MonomerType.Sugar &&
    secondMonomerType === MonomerType.Base &&
    firstMonomerAttachmentPoint === AttachmentPoint.R3 &&
    !secondMonomerAttachmentPoint &&
    secondMonomerAvailableConnectionPoints.includes(AttachmentPoint.R1)
  ) {
    secondMonomerAttachmentPoint = AttachmentPoint.R1;
  }

  if (
    firstMonomerType === MonomerType.Sugar &&
    secondMonomerType === MonomerType.Base &&
    !firstMonomerAttachmentPoint &&
    firstMonomerAvailableConnectionPoints.includes(AttachmentPoint.R3) &&
    secondMonomerAttachmentPoint === AttachmentPoint.R1
  ) {
    firstMonomerAttachmentPoint = AttachmentPoint.R3;
  }

  if (firstMonomerAvailableConnectionPoints.length === 1) {
    firstMonomerAttachmentPoint = firstMonomerAvailableConnectionPoints[0];
  }
  if (secondMonomerAvailableConnectionPoints.length === 1) {
    secondMonomerAttachmentPoint = secondMonomerAvailableConnectionPoints[0];
  }

  return {
    leftMonomerAttachmentPoint: firstMonomerAttachmentPoint,
    rightMonomerAttachmentPoint: secondMonomerAttachmentPoint,
  };
}

export async function bondTwoMonomersPointToPoint(
  page: Page,
  firstMonomer: Locator,
  secondMonomer: Locator,
  firstMonomerAttachmentPoint?: AttachmentPoint,
  secondMonomerAttachmentPoint?: AttachmentPoint,
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

  if (firstMonomerAttachmentPoint) {
    const firstAttachmentPoint = firstMonomer.getByTestId(
      firstMonomerAttachmentPoint,
    );

    const firstAttachmentPointBoundingBox =
      await firstAttachmentPoint.boundingBox();

    if (firstAttachmentPointBoundingBox) {
      await page.mouse.move(
        // if we click on the center of R5 connection point - it replace R5 connection point with R1
        // Bug: https://github.com/epam/ketcher/issues/4433, once it fixed - 4 have to be replaced with 2
        firstAttachmentPointBoundingBox.x +
          firstAttachmentPointBoundingBox.width / 4,
        firstAttachmentPointBoundingBox.y +
          firstAttachmentPointBoundingBox.height / 4,
      );
    } else {
      console.log(
        'Failed to locate connection point on the canvas - using Center instead.',
      );
    }
  }
  await page.mouse.down();

  await secondMonomer.hover({ force: true });
  if (secondMonomerAttachmentPoint) {
    const secondAttachmentPoint = secondMonomer.getByTestId(
      secondMonomerAttachmentPoint,
    );
    const secondAttachmentPointBoundingBox =
      await secondAttachmentPoint.boundingBox();

    if (secondAttachmentPointBoundingBox) {
      await page.mouse.move(
        // if we click on the center of R5 connection point - it replace R5 connection point with R1
        // Bug: https://github.com/epam/ketcher/issues/4433, once it fixed - 4 have to be replaced with 2
        secondAttachmentPointBoundingBox.x +
          secondAttachmentPointBoundingBox.width / 4,
        secondAttachmentPointBoundingBox.y +
          secondAttachmentPointBoundingBox.height / 4,
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
    const { leftMonomerAttachmentPoint, rightMonomerAttachmentPoint } =
      await chooseFreeAttachmentPointsInDialogIfAppeared(
        page,
        firstMonomer,
        secondMonomer,
        firstMonomerAttachmentPoint,
        secondMonomerAttachmentPoint,
      );
    firstMonomerAttachmentPoint = leftMonomerAttachmentPoint;
    secondMonomerAttachmentPoint = rightMonomerAttachmentPoint;
  }

  const monomerOrAtom = await secondMonomer.getAttribute('data-testid');

  let bondLocator: Locator = page.locator('');
  if (monomerOrAtom === 'monomer') {
    bondLocator = getBondLocator(page, {
      fromMonomerId:
        (await firstMonomer.getAttribute('data-monomerid')) || undefined,
      toMonomerId:
        (await secondMonomer.getAttribute('data-monomerid')) || undefined,
      fromAttachmentPoint: firstMonomerAttachmentPoint,
      toAttachmentPoint: secondMonomerAttachmentPoint,
    });
  } else if (monomerOrAtom === 'atom') {
    bondLocator = getBondLocator(page, {
      fromMonomerId:
        (await firstMonomer.getAttribute('data-monomerid')) || undefined,
      toAtomId: (await secondMonomer.getAttribute('data-atomid')) || undefined,
      fromAttachmentPoint: firstMonomerAttachmentPoint,
      toAttachmentPoint: secondMonomerAttachmentPoint,
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

export function getBondLocator(
  page: Page,
  {
    bondType,
    bondStereo,
    bondId,
    fromMonomerId,
    toMonomerId,
    toAtomId,
    fromAttachmentPoint,
    toAttachmentPoint,
    fromAtomId,
    fromSGroupId,
    toSGroupId,
  }: {
    bondType?: MacroBondDataIds | MicroBondDataIds | number;
    bondStereo?: BondStereo;
    bondId?: string | number;
    fromMonomerId?: string | number;
    toMonomerId?: string | number;
    toAtomId?: string | number;
    fromAttachmentPoint?: string;
    toAttachmentPoint?: string;
    fromAtomId?: string | number;
    fromSGroupId?: string | number;
    toSGroupId?: string | number;
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
  if (fromAttachmentPoint !== undefined) {
    attributes['data-fromattachmentpoint'] = fromAttachmentPoint;
  }
  if (toAttachmentPoint !== undefined) {
    attributes['data-toattachmentpoint'] = toAttachmentPoint;
  }
  if (fromAtomId !== undefined) {
    attributes['data-fromatomid'] = String(fromAtomId);
  }
  if (fromSGroupId !== undefined) {
    attributes['data-fromsgroupid'] = String(fromSGroupId);
  }
  if (toSGroupId !== undefined) {
    attributes['data-tosgroupid'] = String(toSGroupId);
  }

  const attributeSelectors = Object.entries(attributes)
    .map(([key, value]) => `[${key}="${value}"]`)
    .join('');

  const locator = page.locator(attributeSelectors);

  return locator;
}
