import { Atom, type AtomProperties } from 'domain/entities/CoreAtom';
import { Bond } from 'domain/entities/CoreBond';
import { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';
import { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Vec2 } from 'domain/entities/vec2';
import { AtomLabel, type CoreAtomLabel } from 'domain/constants';
import { provideEditorInstance } from 'application/editor/editorSingleton';

// Shared setup for tests that draw real AtomRenderers into jsdom. A test file
// mocks 'application/editor/editorSingleton' and 'application/ketcherProvider'
// (jest.mock is hoisted, so it cannot live here), then calls
// installEditorStub() and mockTextBoxes().

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * A position in model coordinates (y down) at a visual angle from the origin:
 * 0 degrees is right and 90 is up.
 */
export const at = (deg: number, length = 1) =>
  new Vec2(
    Math.cos((deg * Math.PI) / 180) * length,
    -Math.sin((deg * Math.PI) / 180) * length,
  );

/**
 * The canvas the renderers draw into: BaseRenderer finds it by its selector.
 * Returns it so a test can read what was drawn.
 */
export function createCanvas() {
  document.body.innerHTML =
    '<svg id="polymer-editor-canvas"><g class="drawn-structures"></g></svg>';
  return document.querySelector('.drawn-structures') as SVGGElement;
}

/**
 * A view model that answers like the real one for atom-to-atom bonds: the
 * half-edges of an atom are the directions to its bonded atoms as they are now,
 * so moving an atom or deleting a bond changes them.
 */
export function installEditorStub() {
  (provideEditorInstance as jest.Mock).mockReturnValue({
    ketcherId: 'test',
    viewModel: {
      atomsToHalfEdges: {
        get: (atom: Atom) =>
          atom.bonds
            .filter((bond): bond is Bond => bond instanceof Bond)
            .map((bond) => {
              const other =
                bond.firstAtom === atom ? bond.secondAtom : bond.firstAtom;
              return {
                direction: Vec2.diff(
                  other.position,
                  atom.position,
                ).normalized(),
              };
            }),
      },
      // No half-edge of a bond: a bond renderer builds its root and draws no line.
      bondsToHalfEdges: new Map(),
      getLargestSectorFromAtomNeighbours: () => ({
        neighborAngle: 0,
        largestAngle: Math.PI,
      }),
      loops: new Map(),
    },
  });
}

export function createAtom(
  position: Vec2,
  properties: AtomProperties = {},
  label: CoreAtomLabel = AtomLabel.N,
) {
  const monomer = {
    monomerItem: {
      struct: { atoms: new Map(), bonds: new Map(), frags: new Map() },
    },
  } as unknown as BaseMonomer;
  return new Atom(position, monomer, 1, label, properties);
}

export function connect(first: Atom, second: Atom) {
  const bond = new Bond(first, second, 1);
  first.addBond(bond);
  second.addBond(bond);
  return bond;
}

export function disconnect(bond: Bond) {
  bond.firstAtom.deleteBond(bond.id);
  bond.secondAtom.deleteBond(bond.id);
}

/** A monomer that has only a position and the bonds to atoms. */
export function createMonomer(position: Vec2) {
  const monomer = Object.create(BaseMonomer.prototype) as BaseMonomer;
  const bonds: MonomerToAtomBond[] = [];
  Object.defineProperties(monomer, {
    position: { get: () => position },
    monomerToAtomBonds: { get: () => bonds },
  });
  return {
    monomer,
    moveTo: (newPosition: Vec2) => {
      position = newPosition;
    },
    bondTo: (atom: Atom) => {
      const bond = new MonomerToAtomBond(monomer, atom);
      bonds.push(bond);
      atom.addBond(bond);
      return bond;
    },
  };
}

function union(boxes: Box[]): Box {
  const x0 = Math.min(...boxes.map((box) => box.x));
  const y0 = Math.min(...boxes.map((box) => box.y));
  const x1 = Math.max(...boxes.map((box) => box.x + box.width));
  const y1 = Math.max(...boxes.map((box) => box.y + box.height));
  return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
}

/**
 * jsdom has no layout, so every SVG element reports the box its text would
 * have: the one in `boxes` for a tspan with that text, `fallback` for any other
 * text, and the union of the boxes inside for a text with tspans or a group.
 */
export function mockTextBoxes(
  boxes: Record<string, Box> = {},
  fallback: Box = { x: 0, y: -8, width: 16, height: 10 },
) {
  const boxOf = (element: Element): Box => {
    const children = Array.from(element.children);
    const isLeafText = element.tagName === 'tspan' || children.length === 0;
    if (isLeafText) {
      return boxes[element.textContent ?? ''] ?? fallback;
    }
    return union(children.map(boxOf));
  };
  const previous = Object.getOwnPropertyDescriptor(
    SVGElement.prototype,
    'getBBox',
  );
  Object.defineProperty(SVGElement.prototype, 'getBBox', {
    configurable: true,
    value(this: Element) {
      return boxOf(this);
    },
  });
  return () => {
    if (previous) {
      Object.defineProperty(SVGElement.prototype, 'getBBox', previous);
    } else {
      delete (SVGElement.prototype as { getBBox?: unknown }).getBBox;
    }
  };
}

/** The label of an atom as drawn: its text element in the canvas. */
export function labelElementOf(atom: Atom) {
  return document.querySelector(
    `[data-atomid="${atom.id}"] text`,
  ) as SVGTextElement | null;
}

/** What the label's layout shows: anchor and the texts in drawing order. */
export function drawnLabel(atom: Atom) {
  const text = labelElementOf(atom);
  return {
    anchor: text?.getAttribute('text-anchor'),
    texts: Array.from(text?.querySelectorAll('tspan') ?? []).map(
      (tspan) => tspan.textContent,
    ),
  };
}
