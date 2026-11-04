import {
  BORDER_EXT,
  COP_PADDING_VECTOR,
  DEFAULT_PADDING_VECTOR,
} from '../SGroupRenderer';
import {
  COUNT_DROP,
  LABEL_FONT_SIZE,
  LINE_HEIGHT,
} from '../atomLabelHydrogenLayout';
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

  // Digits and capitals of Arial are about 0.72 of the font size tall, so
  // the glyph reaches half of that past the centre of its own line.
  const GLYPH_HEIGHT_RATIO = 0.72;
  const glyphHalfHeightPx = (LABEL_FONT_SIZE * GLYPH_HEIGHT_RATIO) / 2;

  // The furthest the label extends from the symbol line: the H line is
  // LINE_HEIGHT above (or below) it and, below it, the count of H sits a
  // further COUNT_DROP lower, a glyph half-height past its own line.
  const stackedHydrogenExtentPx = LINE_HEIGHT + COUNT_DROP + glyphHalfHeightPx;

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
