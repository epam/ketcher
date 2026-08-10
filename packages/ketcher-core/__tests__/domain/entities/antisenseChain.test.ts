import { CoreEditor } from 'application/editor';
import { type BaseMonomer, Vec2 } from 'domain/entities';
import type { UnsplitNucleotide } from 'domain/entities/UnsplitNucleotide';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { AttachmentPointName } from 'domain/types';
import {
  KetMonomerClass,
  RNA_DNA_NON_MODIFIED_PART,
} from 'domain/constants/monomers';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { HydrogenBond } from 'domain/entities/HydrogenBond';
import { getRnaPartLibraryItem } from 'domain/helpers/rna';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../helpers/dom';

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

SVGElement.prototype.getBBox = jest.fn().mockReturnValue({
  x: 0,
  y: 0,
  width: 12,
  height: 12,
});

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
  const monomer = command.operations[0].monomer as UnsplitNucleotide;

  return monomer;
};

const addStandalonePhosphate = (editor: CoreEditor, position: Vec2) => {
  const libraryItem = getRnaPartLibraryItem(
    editor,
    RNA_DNA_NON_MODIFIED_PART.PHOSPHATE,
  );

  if (!libraryItem) {
    throw new Error('Phosphate library item not found');
  }

  return editor.drawingEntitiesManager.addMonomer(libraryItem, position)
    .operations[0].monomer as BaseMonomer;
};

const selectAllMonomers = (editor: CoreEditor) => {
  editor.drawingEntitiesManager.selectDrawingEntities([
    ...editor.drawingEntitiesManager.monomers.values(),
  ]);
};

describe('createAntisenseChain with unsplit nucleotides', () => {
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

  it('creates antisense for a split nucleotide (green control)', () => {
    Nucleotide.createOnCanvas('A', new Vec2(0, 0));
    selectAllMonomers(editor);

    const monomersBefore = editor.drawingEntitiesManager.monomers.size;
    editor.drawingEntitiesManager.createAntisenseChain(false);

    expect(editor.drawingEntitiesManager.monomers.size).toBe(
      monomersBefore + 3,
    );

    const antisenseMonomers = [
      ...editor.drawingEntitiesManager.monomers.values(),
    ].filter((monomer) => monomer.monomerItem.isAntisense);

    expect(antisenseMonomers).toHaveLength(3);
    expect(
      antisenseMonomers.some(
        (monomer) => monomer.label === RNA_DNA_NON_MODIFIED_PART.PHOSPHATE,
      ),
    ).toBe(true);
    expect(
      antisenseMonomers.some(
        (monomer) => monomer.label === RNA_DNA_NON_MODIFIED_PART.SUGAR_RNA,
      ),
    ).toBe(true);
    expect(antisenseMonomers.some((monomer) => monomer.label === 'U')).toBe(
      true,
    );
  });

  it('complements 2-damdA into P+R+U and keeps the original as sense', () => {
    const unsplit = addUnsplitNucleotide(editor, '2-damdA', new Vec2(0, 0));
    selectAllMonomers(editor);

    editor.drawingEntitiesManager.createAntisenseChain(false);

    expect(editor.drawingEntitiesManager.monomers.size).toBe(4);
    expect(unsplit.monomerItem.isSense).toBe(true);

    const antisenseMonomers = [
      ...editor.drawingEntitiesManager.monomers.values(),
    ].filter((monomer) => monomer.monomerItem.isAntisense);

    expect(antisenseMonomers).toHaveLength(3);
    expect(antisenseMonomers.map((monomer) => monomer.label).sort()).toEqual(
      ['P', 'R', 'U'].sort(),
    );
    expect(unsplit.hydrogenBonds.length).toBe(1);
  });

  it('creates DNA antisense for 2-damdA with T and dR', () => {
    addUnsplitNucleotide(editor, '2-damdA', new Vec2(0, 0));
    selectAllMonomers(editor);

    editor.drawingEntitiesManager.createAntisenseChain(true);

    const antisenseMonomers = [
      ...editor.drawingEntitiesManager.monomers.values(),
    ].filter((monomer) => monomer.monomerItem.isAntisense);

    expect(antisenseMonomers).toHaveLength(3);
    expect(
      antisenseMonomers.some(
        (monomer) => monomer.label === RNA_DNA_NON_MODIFIED_PART.SUGAR_DNA,
      ),
    ).toBe(true);
    expect(antisenseMonomers.some((monomer) => monomer.label === 'T')).toBe(
      true,
    );
  });

  it('is a no-op for 5NitInd (natural analogue X)', () => {
    addUnsplitNucleotide(editor, '5NitInd', new Vec2(0, 0));
    selectAllMonomers(editor);

    editor.drawingEntitiesManager.createAntisenseChain(false);

    expect(editor.drawingEntitiesManager.monomers.size).toBe(1);
  });

  it('does not bond antisense fragments across an ineligible X unsplit (D13)', () => {
    const first = addUnsplitNucleotide(editor, '2-damdA', new Vec2(0, 0));
    const middle = addUnsplitNucleotide(editor, '5NitInd', new Vec2(1.5, 0));
    const last = addUnsplitNucleotide(editor, '2-damdA', new Vec2(3, 0));

    editor.drawingEntitiesManager.createPolymerBond(
      first,
      middle,
      AttachmentPointName.R2,
      AttachmentPointName.R1,
    );
    editor.drawingEntitiesManager.createPolymerBond(
      middle,
      last,
      AttachmentPointName.R2,
      AttachmentPointName.R1,
    );

    selectAllMonomers(editor);
    editor.drawingEntitiesManager.createAntisenseChain(false);

    const antisenseMonomers = [
      ...editor.drawingEntitiesManager.monomers.values(),
    ].filter((monomer) => monomer.monomerItem.isAntisense);

    expect(antisenseMonomers).toHaveLength(6);

    const antisenseCovalentBonds = [
      ...editor.drawingEntitiesManager.polymerBonds.values(),
    ].filter(
      (bond) =>
        bond instanceof PolymerBond &&
        !(bond instanceof HydrogenBond) &&
        antisenseMonomers.includes(bond.firstMonomer) &&
        bond.secondMonomer &&
        antisenseMonomers.includes(bond.secondMonomer),
    );

    // Per fragment: sugar–base + phosphate–sugar. No covalent link between fragments.
    expect(antisenseCovalentBonds).toHaveLength(4);

    const phosphates = antisenseMonomers.filter(
      (monomer) => monomer.label === RNA_DNA_NON_MODIFIED_PART.PHOSPHATE,
    );
    const interFragmentBond = antisenseCovalentBonds.some((bond) => {
      const monomers = [bond.firstMonomer, bond.secondMonomer];
      return phosphates.every((phosphate) =>
        monomers.some((monomer) => monomer === phosphate),
      );
    });

    expect(interFragmentBond).toBe(false);
  });

  it('complements an unsplit nucleotide followed by a bare phosphate and a nucleotide', () => {
    // Backbone: 2-damdA - P (bare) - R(A) - P. The bare interstitial phosphate
    // must not prevent the leading unsplit nucleotide from being complemented.
    const dem = editor.drawingEntitiesManager;
    const unsplit = addUnsplitNucleotide(editor, '2-damdA', new Vec2(0, 0));
    const standalonePhosphate = addStandalonePhosphate(
      editor,
      new Vec2(1.5, 0),
    );
    const { node: nucleotide } = Nucleotide.createOnCanvas('A', new Vec2(3, 0));

    dem.createPolymerBond(
      unsplit,
      standalonePhosphate,
      AttachmentPointName.R2,
      AttachmentPointName.R1,
    );
    dem.createPolymerBond(
      standalonePhosphate,
      nucleotide.sugar,
      AttachmentPointName.R2,
      AttachmentPointName.R1,
    );

    selectAllMonomers(editor);
    dem.createAntisenseChain(false);

    // The unsplit is complemented (hydrogen-bonded), not copied verbatim.
    expect(unsplit.monomerItem.isSense).toBe(true);
    expect(unsplit.hydrogenBonds.length).toBe(1);

    const antisenseMonomers = [...dem.monomers.values()].filter(
      (monomer) => monomer.monomerItem.isAntisense,
    );

    // Two complementary U bases: one for the split nucleotide, one for the unsplit.
    expect(
      antisenseMonomers.filter((monomer) => monomer.label === 'U'),
    ).toHaveLength(2);
    // No verbatim copy of the unsplit nucleotide on the antisense strand.
    expect(
      antisenseMonomers.some((monomer) => monomer.label === '2-damdA'),
    ).toBe(false);
  });

  it.each(['Dab', 'ddC', '3InvdT', '3Puro', '5Ade', 'InvddT'])(
    'creates antisense for single-AP unsplit %s without dispatching errors',
    (alias) => {
      const errorDispatch = jest.fn();
      editor.events.error.add(errorDispatch);

      addUnsplitNucleotide(editor, alias, new Vec2(0, 0));
      selectAllMonomers(editor);
      editor.drawingEntitiesManager.createAntisenseChain(false);

      expect(errorDispatch).not.toHaveBeenCalled();
      expect(
        [...editor.drawingEntitiesManager.monomers.values()].some(
          (monomer) => monomer.monomerItem.isAntisense,
        ),
      ).toBe(true);
    },
  );
});
