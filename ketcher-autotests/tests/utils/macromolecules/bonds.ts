import { Page, Locator } from '@fixtures';

/**
 * Structural bond inspection for the macromolecule canvas.
 *
 * Bonds are rendered with stable data attributes in both flex and snake modes
 * (see FlexModePolymerBondRenderer / SnakeModePolymerBondRenderer /
 * MonomerToAtomBondRenderer): `data-testid="bond"`, `data-frommonomerid`,
 * `data-tomonomerid` (absent on monomer-to-atom bonds), and
 * `data-fromattachmentpoint` / `data-toattachmentpoint`. Prefer these helpers
 * over screenshots whenever a test needs to assert bond existence or structure.
 */

const BOND_TEST_ID = 'bond';

/** Reads the `data-monomerid` of the first monomer matching the locator. */
export async function getMonomerId(monomer: Locator): Promise<string> {
  const id = await monomer.first().getAttribute('data-monomerid');
  if (!id) {
    throw new Error('Monomer locator does not have a data-monomerid attribute');
  }
  return id;
}

/** CSS selectors matching every bond connected to a monomer (either direction). */
function monomerBondSelectors(monomerId: string): string[] {
  return [
    `[data-testid="${BOND_TEST_ID}"][data-frommonomerid="${monomerId}"]`,
    `[data-testid="${BOND_TEST_ID}"][data-tomonomerid="${monomerId}"]`,
  ];
}

/** All bonds (polymer and monomer-to-atom) connected to a canvas monomer. */
export async function getMonomerBonds(
  page: Page,
  monomer: Locator,
): Promise<Locator> {
  const monomerId = await getMonomerId(monomer);
  return page.locator(monomerBondSelectors(monomerId).join(', '));
}

/**
 * Number of bonds connected to a canvas monomer. Pass `attachmentPoint`
 * (e.g. 'R1') to count only bonds using that attachment point on either end.
 */
export async function countMonomerBonds(
  page: Page,
  monomer: Locator,
  attachmentPoint?: string,
): Promise<number> {
  const monomerId = await getMonomerId(monomer);
  const selectors = monomerBondSelectors(monomerId).map((selector) =>
    attachmentPoint
      ? `${selector}:is([data-fromattachmentpoint="${attachmentPoint}"], [data-toattachmentpoint="${attachmentPoint}"])`
      : selector,
  );
  return page.locator(selectors.join(', ')).count();
}

/** Whether a bond exists between two canvas monomers (either direction). */
export async function hasBondBetweenMonomers(
  page: Page,
  monomerA: Locator,
  monomerB: Locator,
): Promise<boolean> {
  const [monomerIdA, monomerIdB] = await Promise.all([
    getMonomerId(monomerA),
    getMonomerId(monomerB),
  ]);
  return (
    (await getBondLocatorBetweenMonomers(
      page,
      monomerIdA,
      monomerIdB,
    ).count()) > 0
  );
}

/** The bond between two canvas monomers, or a locator with no matches if there is none. */
function getBondLocatorBetweenMonomers(
  page: Page,
  monomerIdA: string,
  monomerIdB: string,
): Locator {
  return page.locator(
    [
      `[data-testid="${BOND_TEST_ID}"][data-frommonomerid="${monomerIdA}"][data-tomonomerid="${monomerIdB}"]`,
      `[data-testid="${BOND_TEST_ID}"][data-frommonomerid="${monomerIdB}"][data-tomonomerid="${monomerIdA}"]`,
    ].join(', '),
  );
}

export interface BondAttachmentPoints {
  /** Attachment point used on `from` monomer (null for monomer-to-atom bonds). */
  from: string | null;
  /** Attachment point used on `to` monomer. */
  to: string | null;
}

/**
 * Attachment points of the bond between two canvas monomers, or null if they
 * are not bonded. The `from`/`to` roles follow the bond's own direction and do
 * not necessarily match the argument order.
 */
export async function getBondAttachmentPoints(
  page: Page,
  monomerA: Locator,
  monomerB: Locator,
): Promise<BondAttachmentPoints | null> {
  const [monomerIdA, monomerIdB] = await Promise.all([
    getMonomerId(monomerA),
    getMonomerId(monomerB),
  ]);
  const bond = getBondLocatorBetweenMonomers(
    page,
    monomerIdA,
    monomerIdB,
  ).first();
  if ((await bond.count()) === 0) {
    return null;
  }
  return {
    from: await bond.getAttribute('data-fromattachmentpoint'),
    to: await bond.getAttribute('data-toattachmentpoint'),
  };
}
