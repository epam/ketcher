import { Page } from '@playwright/test';
import { MolfileFormat } from 'ketcher-core';

export async function getKet(page: Page) {
  return await page.evaluate(() => window.ketcher.getKet());
}

export async function getCml(page: Page) {
  return await page.evaluate(() => window.ketcher.getCml());
}

export async function getCdxml(page: Page) {
  return await page.evaluate(() => window.ketcher.getCDXml());
}

export async function getCdx(page: Page) {
  return await page.evaluate(() => window.ketcher.getCDX());
}

export async function getSmiles(page: Page) {
  return await page.evaluate(() => window.ketcher.getSmiles());
}

export async function getInchi(page: Page) {
  return await page.evaluate(() => window.ketcher.getInchi());
}

export async function getInChIKey(page: Page) {
  return await page.evaluate(() => window.ketcher.getInChIKey());
}

export async function getExtendedSmiles(page: Page) {
  return await page.evaluate(() => window.ketcher.getSmiles(true));
}

export async function getMolfile(page: Page, fileFormat?: MolfileFormat) {
  return await page.evaluate(
    (fileFormat) => window.ketcher.getMolfile(fileFormat),
    fileFormat,
  );
}

export async function getRxn(page: Page, fileFormat?: MolfileFormat) {
  return await page.evaluate(
    (fileFormat) => window.ketcher.getRxn(fileFormat),
    fileFormat,
  );
}

export async function getSmarts(page: Page) {
  return await page.evaluate(() => window.ketcher.getSmarts());
}

export async function getSdf(page: Page, fileFormat: MolfileFormat = 'v2000') {
  return await page.evaluate(
    (fileFormat) => window.ketcher.getSdf(fileFormat),
    fileFormat,
  );
}

export async function setMolecule(page: Page, structStr: string) {
  return await page.evaluate(
    (structStr) => window.ketcher.setMolecule(structStr),
    structStr,
  );
}

export async function addFragment(page: Page, structStr: string) {
  return await page.evaluate(
    (structStr) => window.ketcher.setMolecule(structStr),
    structStr,
  );
}

export async function enableDearomatizeOnLoad(page: Page) {
  return await page.evaluate(() =>
    window.ketcher.setSettings({ 'general.dearomatize-on-load': 'true' }),
  );
}

export async function disableQueryElements(page: Page) {
  return await page.evaluate(() => {
    return window.ketcher.setSettings({
      // TODO fix types for setSettings in Ketcher-core
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      disableQueryElements: ['Pol', 'CYH', 'CXH'],
    });
  });
}
