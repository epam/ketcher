import { Page, expect } from '@playwright/test';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { MolfileFormat, Struct, SupportedModes } from 'ketcher-core';

export enum MolFileFormat {
  v2000 = 'v2000',
  v3000 = 'v3000',
}

export enum RxnFileFormat {
  v2000 = 'v2000',
  v3000 = 'v3000',
}

export enum SdfFileFormat {
  v2000 = 'v2000',
  v3000 = 'v3000',
}

export enum RdfFileFormat {
  v2000 = 'v2000',
  v3000 = 'v3000',
}

export enum SequenceFileFormat {
  oneLetter = '1-letter',
  threeLetter = '3-letter',
}

export declare type FileFormat =
  | MolFileFormat
  | RxnFileFormat
  | SdfFileFormat
  | RdfFileFormat
  | SequenceFileFormat;

export async function getKet(page: Page): Promise<string> {
  return await page.evaluate(() => window.ketcher.getKet());
}

export async function getFasta(page: Page): Promise<string> {
  return await page.evaluate(() => window.ketcher.getFasta());
}

export async function getIdt(page: Page): Promise<string> {
  return await page.evaluate(() => window.ketcher.getIdt());
}

export async function getSequence(
  page: Page,
  fileFormat?: SequenceFileFormat,
): Promise<string> {
  return await page.evaluate(
    (fileFormat) => window.ketcher.getSequence(fileFormat),
    fileFormat,
  );
}

export function setZoom(page: Page, value: number) {
  return page.evaluate((value) => window.ketcher.setZoom(value), value);
}

export function setMode(page: Page, mode: SupportedModes) {
  return page.evaluate((mode) => window.ketcher.setMode(mode), mode);
}

export async function getCml(page: Page): Promise<string> {
  return await page.evaluate(() => window.ketcher.getCml());
}

export async function getCdxml(page: Page): Promise<string> {
  return await page.evaluate(() => window.ketcher.getCDXml());
}

export async function getCdx(page: Page) {
  return await page.evaluate(() => window.ketcher.getCDX());
}

export async function getSmiles(page: Page): Promise<string> {
  return await page.evaluate(() => window.ketcher.getSmiles());
}

export async function getInchi(page: Page): Promise<string> {
  return await page.evaluate(() => window.ketcher.getInchi());
}

export async function getInChIKey(page: Page) {
  return await page.evaluate(() => window.ketcher.getInChIKey());
}

export async function getExtendedSmiles(page: Page): Promise<string> {
  return await page.evaluate(() => window.ketcher.getSmiles(true));
}

export async function getMolfile(
  page: Page,
  fileFormat?: MolfileFormat,
): Promise<string> {
  return await page.evaluate(
    (fileFormat) => window.ketcher.getMolfile(fileFormat),
    fileFormat,
  );
}

export async function getRxn(
  page: Page,
  fileFormat?: MolfileFormat,
): Promise<string> {
  return await page.evaluate(
    (fileFormat) => window.ketcher.getRxn(fileFormat),
    fileFormat,
  );
}

export async function getRdf(
  page: Page,
  fileFormat?: MolfileFormat,
): Promise<string> {
  return await page.evaluate(
    (fileFormat) => window.ketcher.getRdf(fileFormat),
    fileFormat,
  );
}

export async function getSmarts(page: Page): Promise<string> {
  return await page.evaluate(() => window.ketcher.getSmarts());
}

export async function getSdf(
  page: Page,
  fileFormat: MolfileFormat = 'v2000',
): Promise<string> {
  return await page.evaluate(
    (fileFormat) => window.ketcher.getSdf(fileFormat),
    fileFormat,
  );
}

export async function setMolecule(
  page: Page,
  structStr: string,
  position?: { x: number; y: number },
  rescale?: true,
): Promise<void> {
  return await page.evaluate(
    ({ structStr, position }) =>
      window.ketcher.setMolecule(structStr, { position, rescale }),
    { structStr, position },
  );
}

export async function addFragment(
  page: Page,
  structStr: string,
): Promise<void> {
  return await page.evaluate(
    (structStr) => window.ketcher.addFragment(structStr),
    structStr,
  );
}

export async function layout(page: Page): Promise<void> {
  return await page.evaluate(() => window.ketcher.layout());
}

export async function recognize(
  page: Page,
  image: Blob,
  version?: string,
): Promise<Struct> {
  return await page.evaluate(
    (params: { img: Blob; ver?: string }) => {
      const { img, ver } = params;
      return window.ketcher.recognize(img, ver);
    },
    { img: image, ver: version },
  );
}

export async function enableDearomatizeOnLoad(page: Page): Promise<void> {
  return await page.evaluate(() =>
    window.ketcher.setSettings({ 'general.dearomatize-on-load': 'true' }),
  );
}

export async function enableViewOnlyMode(page: Page): Promise<void> {
  await page.evaluate(() =>
    window.ketcher.editor.options({ viewOnlyMode: true }),
  );

  await waitForViewOnlyModeState(page, true);
}

export async function disableViewOnlyMode(page: Page): Promise<void> {
  await page.evaluate(() =>
    window.ketcher.editor.options({ viewOnlyMode: false }),
  );

  await waitForViewOnlyModeState(page, false);
}

export async function enableViewOnlyModeBySetOptions(
  page: Page,
): Promise<void> {
  await page.evaluate(() =>
    window.ketcher.editor.setOptions(JSON.stringify({ viewOnlyMode: true })),
  );

  await waitForViewOnlyModeState(page, true);
}

export async function disableViewOnlyModeBySetOptions(
  page: Page,
): Promise<void> {
  await page.evaluate(() =>
    window.ketcher.editor.setOptions(JSON.stringify({ viewOnlyMode: false })),
  );

  await waitForViewOnlyModeState(page, false);
}

/*
 * Waits until View Only Mode is in the specified state by checking the state of the "Erase" button.
 */
export async function waitForViewOnlyModeState(
  page: Page,
  isEnabled: boolean,
  timeout = 100000,
): Promise<void> {
  const eraseButton = CommonLeftToolbar(page).eraseButton;

  if (isEnabled) {
    await expect(eraseButton).toBeDisabled({ timeout });
  } else {
    await expect(eraseButton).toBeEnabled({ timeout });
  }
}

export async function disableQueryElements(page: Page): Promise<void> {
  return await page.evaluate(() => {
    return window.ketcher.setSettings({
      // TODO fix types for setSettings in Ketcher-core
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      disableQueryElements: ['Pol', 'CYH', 'CXH'],
    });
  });
}
