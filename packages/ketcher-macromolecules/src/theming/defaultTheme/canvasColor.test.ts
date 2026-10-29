import { readFileSync } from 'fs';
import { resolve } from 'path';
import { defaultTheme } from './defaultTheme';

const readPackageFile = (relativePath: string) =>
  readFileSync(resolve(__dirname, '../../../..', relativePath), 'utf8');

const moleculesCanvas =
  /@color-background-canvas-light:\s*(#[0-9a-f]{6})/i.exec(
    readPackageFile('ketcher-react/src/style/variables.less'),
  )?.[1];
const macroCustomProperty = /--color-background-canvas:\s*(#[0-9a-f]{6})/i.exec(
  readPackageFile('ketcher-macromolecules/src/theme.less'),
)?.[1];
const coreRendererCanvas =
  /CANVAS_BACKGROUND_COLOR\s*=\s*'(#[0-9a-f]{6})'/i.exec(
    readPackageFile(
      'ketcher-core/src/application/render/renderers/constants.ts',
    ),
  )?.[1];

describe('canvas background', () => {
  it('molecules mode canvas colour is found', () => {
    expect(moleculesCanvas).toBeDefined();
  });

  it('macromolecules theme canvas matches molecules mode', () => {
    expect(defaultTheme.color.background.canvas.toLowerCase()).toBe(
      moleculesCanvas?.toLowerCase(),
    );
  });

  it('macromolecules --color-background-canvas matches molecules mode', () => {
    expect(macroCustomProperty?.toLowerCase()).toBe(
      moleculesCanvas?.toLowerCase(),
    );
  });

  it('macromolecules label backgrounds drawn by core match molecules mode', () => {
    expect(coreRendererCanvas?.toLowerCase()).toBe(
      moleculesCanvas?.toLowerCase(),
    );
  });
});
