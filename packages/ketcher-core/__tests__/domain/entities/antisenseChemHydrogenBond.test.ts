import { CoreEditor, MACROMOLECULES_BOND_TYPES } from 'application/editor';
import { SequenceViewModel } from 'application/render/renderers/sequence/SequenceViewModel/SequenceViewModel';
import { type BaseMonomer, Vec2 } from 'domain/entities';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { Nucleoside } from 'domain/entities/Nucleoside';
import { Nucleotide } from 'domain/entities/Nucleotide';
import { AttachmentPointName } from 'domain/types';
import { chemMonomerItem } from '../../mock-data';
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

describe('antisense chain H-bonded to a CHEM of an existing duplex', () => {
  let editor: CoreEditor;

  beforeEach(() => {
    editor = new CoreEditor({
      canvas: createPolymerEditorCanvas(),
      theme: {},
      renderersContainer: createRenderersManager(),
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  const addHydrogenBond = (first: BaseMonomer, second: BaseMonomer) => {
    editor.drawingEntitiesManager.createPolymerBond(
      first,
      second,
      AttachmentPointName.HYDROGEN,
      AttachmentPointName.HYDROGEN,
      MACROMOLECULES_BOND_TYPES.HYDROGEN,
    );
  };

  const addChem = (position: Vec2) =>
    editor.drawingEntitiesManager.addMonomer(chemMonomerItem, position)
      .operations[0].monomer as BaseMonomer;

  const createNucleotide = (base: string, position: Vec2) => {
    const created = Nucleotide.createOnCanvas(base, position);

    if (!created) {
      throw new Error(`Fixture setup failed: nucleotide ${base} not created`);
    }

    return created.node;
  };

  const createNucleoside = (base: string, position: Vec2) => {
    const created = Nucleoside.createOnCanvas(base, position);

    if (!created) {
      throw new Error(`Fixture setup failed: nucleoside ${base} not created`);
    }

    return created.node;
  };

  const isAntisense = (monomers: BaseMonomer[]) =>
    monomers.every((monomer) => monomer.monomerItem.isAntisense);

  const isSense = (monomers: BaseMonomer[]) =>
    monomers.every((monomer) => monomer.monomerItem.isSense);

  it('marks the CHEM-paired chain as antisense to the duplex sense chain', () => {
    const rna1 = createNucleotide('A', new Vec2(0, 0));
    const rna2 = createNucleoside('A', new Vec2(0, 5));
    const rna3 = createNucleoside('U', new Vec2(0, 10));
    const chem = addChem(new Vec2(0, 15));

    editor.drawingEntitiesManager.createPolymerBond(
      chem,
      rna3.sugar,
      AttachmentPointName.R2,
      AttachmentPointName.R1,
    );
    addHydrogenBond(rna2.rnaBase, rna3.rnaBase);
    addHydrogenBond(rna1.rnaBase, chem);

    editor.drawingEntitiesManager.recalculateAntisenseChains();

    expect(isSense([chem, ...rna3.monomers])).toBe(true);
    expect(isAntisense(rna2.monomers)).toBe(true);
    expect(isAntisense(rna1.monomers)).toBe(true);
    expect(
      editor.drawingEntitiesManager.antisenseMonomerToSenseChain
        .get(rna1.rnaBase)
        ?.monomers.includes(chem),
    ).toBe(true);

    const sequenceViewModel = new SequenceViewModel(
      ChainsCollection.fromMonomers([
        ...editor.drawingEntitiesManager.monomers.values(),
      ]),
    );

    expect(sequenceViewModel.chains).toHaveLength(1);
  });

  it('keeps a lone base-to-CHEM pair as two sense chains', () => {
    const rna = createNucleotide('A', new Vec2(0, 0));
    const chem = addChem(new Vec2(0, 5));

    addHydrogenBond(rna.rnaBase, chem);

    editor.drawingEntitiesManager.recalculateAntisenseChains();

    expect(isSense([chem, ...rna.monomers])).toBe(true);
  });
});
