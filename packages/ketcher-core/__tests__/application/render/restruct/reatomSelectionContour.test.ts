import ReAtom from 'application/render/restruct/reatom';
import type { Render } from 'application/render/raphaelRender';
import type { RenderOptions } from 'application/render/render.types';
import { Atom, Vec2 } from 'domain/entities';
import { Box2Abs } from 'domain/entities/box2Abs';

// Regression test for https://github.com/epam/ketcher/issues/3946:
// Ctrl+A (and hover) on a molecule with an Inversion/Retention (or Exact
// Change) atom flag highlighted the ".Inv."/".Ret." annotation label
// instead of the atom itself. The annotation is drawn as its own path and
// folded into the atom's visel bounding box (reatom.ts adds it with
// visible=true so it isn't clipped when the view is fit/scrolled), but the
// selection contour reused that same merged box together with a fixed,
// single-line height — so the contour ended up positioned over wherever
// the annotation was placed rather than over the atom label.
//
// This builds a ReAtom without going through the full SVG render pipeline
// (draw() needs a live Raphael/SVG canvas), and instead drives
// getSelectionContour() directly against a minimal fake Render, with the
// visel pre-populated the way draw() would leave it: one box for the
// atom's own label, and — added after — a second box for the aam/invRet
// annotation, positioned well above the atom (mirroring how
// bisectLargestSector places it for an isolated atom with no bonds, as in
// the original bug report).
describe('ReAtom selection contour with an invRet annotation', () => {
  const microModeScale = 1; // identity canvas<->model transform, easier assertions
  const fontszInPx = 13;
  const radiusScaleFactor = 0.2;
  const padding = fontszInPx * radiusScaleFactor;
  const height = fontszInPx * 1.23;

  function createReatom() {
    const atom = new Atom({ label: 'S', pp: new Vec2(0, 0, 0), invRet: 1 });
    const reatom = new ReAtom(atom);
    reatom.showLabel = true;
    atom.implicitH = 2;

    // Box for the atom's own rendered label, centered on the atom position.
    const labelBox = new Box2Abs(-5, -5, 5, 5);
    // Box for the ".Inv." annotation, shifted well above the atom — same
    // shape as what reatom.ts's aam/stereo/query block produces via
    // bisectLargestSector + pathAndRBoxTranslate for an isolated atom.
    const annotationBox = new Box2Abs(-5, -40, 5, -30);

    reatom.visel.boxes.push(labelBox);
    reatom.visel.boundingBox = labelBox;
    // Mirrors reatom.ts: labelBoxCount is captured after the label is
    // drawn but before the annotation is added.
    (reatom as unknown as { labelBoxCount: number }).labelBoxCount = 1;

    reatom.visel.boxes.push(annotationBox);
    reatom.visel.boundingBox = Box2Abs.union(labelBox, annotationBox);

    return reatom;
  }

  function createFakeRender(rect: jest.Mock) {
    const options = {
      microModeScale,
      fontszInPx,
      radiusScaleFactor,
    } as unknown as RenderOptions;

    const render: Partial<Render> = {
      paper: { rect } as unknown as Render['paper'],
      options,
    };
    (render as { ctab: unknown }).ctab = { render };

    return render as Render;
  }

  it('sizes the labeled selection contour around the atom label, not the annotation', () => {
    const reatom = createReatom();
    const rect = jest.fn();
    const render = createFakeRender(rect);

    reatom.getSelectionContour(render);

    expect(rect).toHaveBeenCalledTimes(1);
    const [x, y, width, rectHeight] = rect.mock.calls[0];

    // The contour must cover the atom's own canvas position (0, 0) — the
    // core assertion the original bug violated.
    expect(x).toBeLessThanOrEqual(0);
    expect(x + width).toBeGreaterThanOrEqual(0);
    expect(y).toBeLessThanOrEqual(0);
    expect(y + rectHeight).toBeGreaterThanOrEqual(0);

    // And it should match the label box exactly, ignoring the annotation.
    expect(x).toBeCloseTo(-5 - padding);
    expect(y).toBeCloseTo(-5 - padding);
    expect(width).toBeCloseTo(10 + padding * 2);
    expect(rectHeight).toBeCloseTo(height + padding * 2);
  });
});
