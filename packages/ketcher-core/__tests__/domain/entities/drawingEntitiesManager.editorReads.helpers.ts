import { CoreEditor } from 'application/editor';
import type { BaseMode } from 'application/editor/modes/BaseMode';
import { BaseMonomer, Vec2 } from 'domain/entities';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { KetMonomerClass } from 'domain/constants/monomers';
import { AttachmentPointName } from 'domain/types';
import { KetSerializer } from 'domain/serializers/ket/ketSerializer';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';

// One molecule of two carbons joined by a single bond. Deserialized, it
// becomes one Chem monomer holding 2 atoms and 1 bond.
const yellow = { regular: 'yellow' };

// The colors the renderers read for the peptides and sugars these tests draw.
const renderTheme = {
  monomer: {
    color: { A: yellow, CHEM: yellow, X: yellow, R: yellow, P: yellow },
  },
  peptide: { color: { A: yellow, X: yellow } },
};

export const ETHANE_KET = JSON.stringify({
  root: { nodes: [{ $ref: 'mol0' }] },
  mol0: {
    type: 'molecule',
    atoms: [
      { label: 'C', location: [0, 0, 0] },
      { label: 'C', location: [1, 0, 0] },
    ],
    bonds: [{ type: 1, atoms: [0, 1] }],
  },
});

export const stubCanvasDimensions = (canvas: SVGSVGElement) => {
  Object.defineProperty(canvas, 'width', {
    configurable: true,
    value: { baseVal: { value: 500 } },
  });
  Object.defineProperty(canvas, 'height', {
    configurable: true,
    value: { baseVal: { value: 500 } },
  });
};

export const createEditor = (mode?: BaseMode) => {
  const canvas = createPolymerEditorCanvas();

  stubCanvasDimensions(canvas);

  const editor = new CoreEditor({
    canvas,
    theme: {},
    renderersContainer: createRenderersManager(renderTheme),
    mode,
  });

  return { canvas, editor };
};

// The one line that builds an empty clone to merge the editor's manager into.
// The refactor changes this construction and nothing else about these tests.
export const makeDetachedManager = (editor: CoreEditor) =>
  editor.drawingEntitiesManager.createEmptySibling();

// The one line that centers a detached manager on the canvas of an editor.
// The refactor changes this signature and nothing else about these tests.
export const centerDetached = (
  dem: DrawingEntitiesManager,
  editor: CoreEditor,
) => dem.centerMacroStructure(editor.canvasOffset);

export const deserializeKet = (ketText: string) => {
  const deserialized = new KetSerializer().deserializeToDrawingEntities(
    ketText,
  );

  if (!deserialized) {
    throw new Error('Fixture setup failed: KET did not deserialize');
  }

  return deserialized.drawingEntitiesManager;
};

const findPeptideItem = (editor: CoreEditor, label: string) => {
  const item = editor.monomersLibrary.find(
    (libraryItem) =>
      !('isAmbiguous' in libraryItem && libraryItem.isAmbiguous) &&
      libraryItem.label === label &&
      libraryItem.props?.MonomerClass === KetMonomerClass.AminoAcid,
  );

  if (!item) {
    throw new Error(`Fixture setup failed: peptide ${label} not found`);
  }

  return item;
};

// Adds a peptide and draws it, the way the library drop leaves it.
export const addPeptide = (
  editor: CoreEditor,
  label: string,
  x: number,
  y: number,
) => {
  const command = editor.drawingEntitiesManager.addMonomer(
    findPeptideItem(editor, label),
    new Vec2(x, y),
  );

  editor.renderersContainer.update(command);

  return command.operations[0].monomer as BaseMonomer;
};

// Bonds first.R2 to second.R1 and draws it, the way the bond tool leaves it.
export const bondPeptides = (
  editor: CoreEditor,
  first: BaseMonomer,
  second: BaseMonomer,
) => {
  const command = editor.drawingEntitiesManager.createPolymerBond(
    first,
    second,
    AttachmentPointName.R2,
    AttachmentPointName.R1,
  );

  editor.renderersContainer.update(command);

  return command.operations[0].polymerBond as PolymerBond;
};

// Three peptides on one horizontal line: B sits 0.1 off the line from A to C,
// within half a monomer, so a bond A-C is overlapped by B. D-E is a second,
// clear bond lower down.
export const addOverlapFixture = (editor: CoreEditor) => {
  const a = addPeptide(editor, 'A', 0, 0);
  const b = addPeptide(editor, 'A', 2, 0.1);
  const c = addPeptide(editor, 'A', 4, 0);
  const d = addPeptide(editor, 'A', 0, 5);
  const e = addPeptide(editor, 'A', 4, 5);
  const overlappedBond = bondPeptides(editor, a, c);
  const clearBond = bondPeptides(editor, d, e);

  return { a, b, c, d, e, overlappedBond, clearBond };
};
