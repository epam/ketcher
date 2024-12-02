import { Page } from '@playwright/test';
import { TopPanelButton } from '@utils/selectors';
import { MolfileFormat, Struct, SupportedModes } from 'ketcher-core';
import { clickOnFileFormatDropdown } from './clicks';
import { selectTopPanelButton } from '@utils/canvas/tools/helpers';

export async function getKet(page: Page): Promise<string> {
  return await page.evaluate(() => window.ketcher.getKet());
}

export async function getFasta(page: Page): Promise<string> {
  return await page.evaluate(() => window.ketcher.getFasta());
}

export async function getIdt(page: Page): Promise<string> {
  return await page.evaluate(() => window.ketcher.getIdt());
}

export async function getSequence(page: Page): Promise<string> {
  return await page.evaluate(() => window.ketcher.getSequence());
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
): Promise<void> {
  return await page.evaluate(
    (structStr) => window.ketcher.setMolecule(structStr),
    structStr,
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
  return await page.evaluate(() =>
    window.ketcher.editor.options({ viewOnlyMode: true }),
  );
}

export async function disableViewOnlyMode(page: Page): Promise<void> {
  return await page.evaluate(() =>
    window.ketcher.editor.options({ viewOnlyMode: false }),
  );
}

export async function enableViewOnlyModeBySetOptions(
  page: Page,
): Promise<void> {
  return await page.evaluate(() =>
    window.ketcher.editor.setOptions(JSON.stringify({ viewOnlyMode: true })),
  );
}

export async function disableViewOnlyModeBySetOptions(
  page: Page,
): Promise<void> {
  return await page.evaluate(() =>
    window.ketcher.editor.setOptions(JSON.stringify({ viewOnlyMode: false })),
  );
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

export enum FileFormatOption {
  KET = 'Ket Format-option',
  MOLV2000 = 'MDL Molfile V2000-option',
  MOLV3000 = 'MDL Molfile V3000-option',
  SDFV2000 = 'SDF V2000-option',
  SDFV3000 = 'SDF V3000-option',
  RDFV2000 = 'RDF V2000-option',
  RDFV3000 = 'RDF V3000-option',
  DaylightSMARTS = 'Daylight SMARTS-option',
  DaylightSMILES = 'Daylight SMILES-option',
  ExtendedSMILES = 'Extended SMILES-option',
  CML = 'CML-option',
  InChI = 'InChI-option',
  InChIAuxInfo = 'InChI AuxInfo-option',
  InChIKey = 'InChIKey-option',
  SVG = 'SVG Document-option',
  PNG = 'PNG Image-option',
  CDXML = 'CDXML-option',
  Base64CDX = 'Base64 CDX-option',
  CDX = 'CDX-option',
}

export async function selectSaveFileFormat(
  page: Page,
  formatOption: FileFormatOption,
) {
  await selectTopPanelButton(TopPanelButton.Save, page);
  await clickOnFileFormatDropdown(page);
  await page.getByTestId(formatOption).click();
}
