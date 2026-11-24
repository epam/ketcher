import {
  BORDER_EXT,
  COP_PADDING_VECTOR,
  DEFAULT_PADDING_VECTOR,
} from '../SGroupRenderer';
import { LABEL_FONT_SIZE, LINE_HEIGHT } from '../atomLabelHydrogenLayout';
import { provideEditorSettings } from 'application/editor/editorSettings';

// SGroupRenderer builds its brackets from atom positions plus a fixed padding,
// never from the box of the label. Hydrogens on a line above or below the
// symbol (atomLabelHydrogenLayout) stay inside the brackets only while that
// padding is at least as tall as the extra line. This guard fails when the
// line moves out, so the padding gets raised with it.
describe('S-group brackets around stacked hydrogens', () => {
  // Pixels the bracket box extends beyond an atom position: it is built from
  // the atom position grown by BORDER_EXT, then by the padding.
  const bracketPaddingPx = (padding: { y: number }) =>
    (BORDER_EXT.y + padding.y) * provideEditorSettings().microModeScale;

  // The H line is LINE_HEIGHT above (or below) the symbol line, and its glyph
  // reaches half the em box (the font size) past its own line centre. That is
  // the furthest the label extends from the symbol line, with the em box as a
  // generous bound of the glyph.
  const stackedHydrogenExtentPx = LINE_HEIGHT + LABEL_FONT_SIZE / 2;

  it('pads the default bracket box at least as far as the stacked hydrogens extend', () => {
    expect(bracketPaddingPx(DEFAULT_PADDING_VECTOR)).toBeGreaterThanOrEqual(
      stackedHydrogenExtentPx,
    );
  });

  it('pads the COP bracket box at least as far as the stacked hydrogens extend', () => {
    expect(bracketPaddingPx(COP_PADDING_VECTOR)).toBeGreaterThanOrEqual(
      stackedHydrogenExtentPx,
    );
  });
});
