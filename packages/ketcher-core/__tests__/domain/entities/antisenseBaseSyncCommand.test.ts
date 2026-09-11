import { CoreEditor } from 'application/editor';
import { type BaseMonomer, Vec2 } from 'domain/entities';
import type { UnsplitNucleotide } from 'domain/entities/UnsplitNucleotide';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { Nucleoside } from 'domain/entities/Nucleoside';
import { AttachmentPointName } from 'domain/types';
import { KetMonomerClass } from 'domain/constants/monomers';
import {
  createMirroredBaseCommand,
  getHydrogenBondedPartner,
  isBaseEligibleForDuplexSync,
  isSelectedAntisensePair,
} from 'domain/helpers/antisenseBaseSync';
import { getRnaPartLibraryItem } from 'domain/helpers/rna';
import { getSugarFromRnaBase } from 'domain/helpers/monomers';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

SVGElement.prototype.getBBox = jest
  .fn()
  .mockReturnValue({ x: 0, y: 0, width: 12, height: 12 });

const stubCanvasDimensions = (canvas: SVGSVGElement) => {
  Object.defineProperty(canvas, 'width', {
    configurable: true,
    value: { baseVal: { value: 500 } },
  });
  Object.defineProperty(canvas, 'height', {
    configurable: true,
    value: { baseVal: { value: 500 } },
  });
};

export const buildDuplex = (editor: CoreEditor, senseBaseLabel: string) => {
  Nucleotide.createOnCanvas(senseBaseLabel, new Vec2(0, 0));
  editor.drawingEntitiesManager.selectDrawingEntities([
    ...editor.drawingEntitiesManager.monomers.values(),
  ]);
  editor.drawingEntitiesManager.createAntisenseChain(false);

  const senseBase = [...editor.drawingEntitiesManager.monomers.values()].find(
    (monomer) =>
      monomer.monomerItem.isSense && monomer.hydrogenBonds.length === 1,
  ) as BaseMonomer;
  const antisenseBase = [
    ...editor.drawingEntitiesManager.monomers.values(),
  ].find(
    (monomer) =>
      monomer.monomerItem.isAntisense && monomer.hydrogenBonds.length === 1,
  ) as BaseMonomer;

  editor.drawingEntitiesManager.unselectAllDrawingEntities();

  return { senseBase, antisenseBase };
};

const findLibraryItemByAlias = (editor: CoreEditor, alias: string) => {
  const libraryItem = editor.monomersLibrary.find(
    (item) =>
      !('isAmbiguous' in item && item.isAmbiguous) &&
      item.label === alias &&
      item.props?.MonomerClass === KetMonomerClass.RNA,
  );

  if (!libraryItem) {
    throw new Error(`Library item ${alias} not found`);
  }

  return libraryItem;
};

const addUnsplitNucleotide = (
  editor: CoreEditor,
  alias: string,
  position: Vec2,
) => {
  const libraryItem = findLibraryItemByAlias(editor, alias);
  const command = editor.drawingEntitiesManager.addMonomer(
    libraryItem,
    position,
  );

  return command.operations[0].monomer as UnsplitNucleotide;
};

describe('duplex traversal', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;

  beforeEach(() => {
    canvas = createPolymerEditorCanvas();
    stubCanvasDimensions(canvas);
    editor = new CoreEditor({
      canvas,
      theme: {},
      renderersContainer: createRenderersManager(),
    });
  });

  afterEach(() => {
    canvas.remove();
  });

  it('finds the hydrogen bonded partner of a sense base', () => {
    const { senseBase, antisenseBase } = buildDuplex(editor, 'A');

    expect(getHydrogenBondedPartner(senseBase)).toBe(antisenseBase);
    expect(getHydrogenBondedPartner(antisenseBase)).toBe(senseBase);
  });

  it('returns undefined for a missing monomer or one without a hydrogen bond', () => {
    expect(getHydrogenBondedPartner(undefined)).toBeUndefined();

    const unbonded = addUnsplitNucleotide(editor, '2-damdA', new Vec2(0, 0));

    expect(unbonded.hydrogenBonds).toHaveLength(0);
    expect(getHydrogenBondedPartner(unbonded)).toBeUndefined();
  });

  it('treats a base on a sugar with a backbone connection as eligible', () => {
    const { senseBase } = buildDuplex(editor, 'A');

    expect(isBaseEligibleForDuplexSync(senseBase)).toBe(true);
  });

  it('treats an unsplit nucleotide with a backbone connection as eligible', () => {
    const first = addUnsplitNucleotide(editor, '2-damdA', new Vec2(0, 0));
    const second = addUnsplitNucleotide(editor, '2-damdA', new Vec2(1.5, 0));

    editor.drawingEntitiesManager.createPolymerBond(
      first,
      second,
      AttachmentPointName.R2,
      AttachmentPointName.R1,
    );

    expect(isBaseEligibleForDuplexSync(first)).toBe(true);
    expect(isBaseEligibleForDuplexSync(second)).toBe(true);
  });

  it('treats a base on a sugar without a backbone connection as ineligible', () => {
    // Nucleoside: sugar + base, no phosphate, so the sugar has no R2 backbone
    // bond. The base is still reachable through R1/R3, so this exercises the
    // ineligible branch rather than the "no sugar at all" branch.
    const { node } = Nucleoside.createOnCanvas('A', new Vec2(0, 0));

    expect(isBaseEligibleForDuplexSync(node.rnaBase as BaseMonomer)).toBe(
      false,
    );
  });

  it('reports a pair as selected only when both sides are selected', () => {
    const { senseBase, antisenseBase } = buildDuplex(editor, 'A');

    editor.drawingEntitiesManager.selectDrawingEntities([senseBase]);
    expect(isSelectedAntisensePair(senseBase)).toBe(false);

    editor.drawingEntitiesManager.selectDrawingEntities([
      senseBase,
      antisenseBase,
    ]);
    expect(isSelectedAntisensePair(senseBase)).toBe(true);
  });
});

describe('createMirroredBaseCommand', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;

  beforeEach(() => {
    canvas = createPolymerEditorCanvas();
    stubCanvasDimensions(canvas);
    editor = new CoreEditor({
      canvas,
      theme: {},
      renderersContainer: createRenderersManager(),
    });
  });

  afterEach(() => {
    canvas.remove();
  });

  const resolveBaseLibraryItem = (label: string) =>
    getRnaPartLibraryItem(editor, label, KetMonomerClass.Base);

  it('rewrites the paired base when the natural analogue changes', () => {
    const { senseBase, antisenseBase } = buildDuplex(editor, 'A');
    const newBaseItem = resolveBaseLibraryItem('C');

    if (!newBaseItem) {
      throw new Error('Library item C not found');
    }

    const command = createMirroredBaseCommand({
      drawingEntitiesManager: editor.drawingEntitiesManager,
      editedBase: senseBase,
      previousNaturalAnalogue: 'A',
      newBaseMonomerItem: newBaseItem,
      needToEditAntisense: true,
      resolveBaseLibraryItem,
    });

    expect(command).toBeDefined();
    expect(antisenseBase.label).toBe('G');
  });

  it('rewrites the paired sense base when the antisense strand is edited', () => {
    const { senseBase, antisenseBase } = buildDuplex(editor, 'A');
    const newBaseItem = resolveBaseLibraryItem('A');

    if (!newBaseItem) {
      throw new Error('Library item A not found');
    }

    // The antisense base opposite a sense A is U on ribose, so editing it to
    // A must rewrite the sense side back through the same symmetric table.
    const command = createMirroredBaseCommand({
      drawingEntitiesManager: editor.drawingEntitiesManager,
      editedBase: antisenseBase,
      previousNaturalAnalogue: 'U',
      newBaseMonomerItem: newBaseItem,
      needToEditAntisense: true,
      resolveBaseLibraryItem,
    });

    expect(command).toBeDefined();
    expect(senseBase.label).toBe('U');
    expect(antisenseBase.hydrogenBonds).toHaveLength(1);
  });

  it('leaves the paired base alone when the analogue is unchanged', () => {
    const { senseBase, antisenseBase } = buildDuplex(editor, 'A');
    const labelBefore = antisenseBase.label;
    const newBaseItem = resolveBaseLibraryItem('A');

    if (!newBaseItem) {
      throw new Error('Library item A not found');
    }

    const command = createMirroredBaseCommand({
      drawingEntitiesManager: editor.drawingEntitiesManager,
      editedBase: senseBase,
      previousNaturalAnalogue: 'A',
      newBaseMonomerItem: newBaseItem,
      needToEditAntisense: true,
      resolveBaseLibraryItem,
    });

    expect(command).toBeUndefined();
    expect(antisenseBase.label).toBe(labelBefore);
  });

  it('does nothing when antisense editing is off', () => {
    const { senseBase, antisenseBase } = buildDuplex(editor, 'A');
    const labelBefore = antisenseBase.label;
    const newBaseItem = resolveBaseLibraryItem('C');

    if (!newBaseItem) {
      throw new Error('Library item C not found');
    }

    const command = createMirroredBaseCommand({
      drawingEntitiesManager: editor.drawingEntitiesManager,
      editedBase: senseBase,
      previousNaturalAnalogue: 'A',
      newBaseMonomerItem: newBaseItem,
      needToEditAntisense: false,
      resolveBaseLibraryItem,
    });

    expect(command).toBeUndefined();
    expect(antisenseBase.label).toBe(labelBefore);
  });

  it('does nothing when the paired base is itself selected', () => {
    const { senseBase, antisenseBase } = buildDuplex(editor, 'A');
    const labelBefore = antisenseBase.label;
    editor.drawingEntitiesManager.selectDrawingEntities([
      senseBase,
      antisenseBase,
    ]);
    const newBaseItem = resolveBaseLibraryItem('C');

    if (!newBaseItem) {
      throw new Error('Library item C not found');
    }

    const command = createMirroredBaseCommand({
      drawingEntitiesManager: editor.drawingEntitiesManager,
      editedBase: senseBase,
      previousNaturalAnalogue: 'A',
      newBaseMonomerItem: newBaseItem,
      needToEditAntisense: true,
      resolveBaseLibraryItem,
    });

    expect(command).toBeUndefined();
    expect(antisenseBase.label).toBe(labelBefore);
  });

  it('leaves the paired sugar and phosphate untouched', () => {
    const { senseBase, antisenseBase } = buildDuplex(editor, 'A');
    const partnerSugar = getSugarFromRnaBase(antisenseBase);
    const sugarLabelBefore = partnerSugar?.label;
    const newBaseItem = resolveBaseLibraryItem('C');

    if (!newBaseItem) {
      throw new Error('Library item C not found');
    }

    createMirroredBaseCommand({
      drawingEntitiesManager: editor.drawingEntitiesManager,
      editedBase: senseBase,
      previousNaturalAnalogue: 'A',
      newBaseMonomerItem: newBaseItem,
      needToEditAntisense: true,
      resolveBaseLibraryItem,
    });

    expect(getSugarFromRnaBase(antisenseBase)?.label).toBe(sugarLabelBefore);
  });

  it('discards a modification on the paired base', () => {
    const { senseBase, antisenseBase } = buildDuplex(editor, 'C');
    const modifiedItem = resolveBaseLibraryItem('5meC');

    if (!modifiedItem) {
      throw new Error('Library item 5meC not found');
    }

    // Give the antisense side a modified base whose natural analogue is G.
    editor.drawingEntitiesManager.modifyMonomerItem(
      antisenseBase,
      modifiedItem,
    );

    const newBaseItem = resolveBaseLibraryItem('A');

    if (!newBaseItem) {
      throw new Error('Library item A not found');
    }

    createMirroredBaseCommand({
      drawingEntitiesManager: editor.drawingEntitiesManager,
      editedBase: senseBase,
      previousNaturalAnalogue: 'C',
      newBaseMonomerItem: newBaseItem,
      needToEditAntisense: true,
      resolveBaseLibraryItem,
    });

    // Plain complement, not a modified one: the modification is gone.
    expect(antisenseBase.label).toBe('U');
  });

  it('is reverted by inverting the returned command', () => {
    const { senseBase, antisenseBase } = buildDuplex(editor, 'A');
    const labelBefore = antisenseBase.label;
    const newBaseItem = resolveBaseLibraryItem('C');

    if (!newBaseItem) {
      throw new Error('Library item C not found');
    }

    const command = createMirroredBaseCommand({
      drawingEntitiesManager: editor.drawingEntitiesManager,
      editedBase: senseBase,
      previousNaturalAnalogue: 'A',
      newBaseMonomerItem: newBaseItem,
      needToEditAntisense: true,
      resolveBaseLibraryItem,
    });

    command?.invert(editor.renderersContainer);

    expect(antisenseBase.label).toBe(labelBefore);
  });
});
