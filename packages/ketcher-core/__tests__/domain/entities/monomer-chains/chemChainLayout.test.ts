import {
  CoreEditor,
  MACROMOLECULES_BOND_TYPES,
  SequenceMode,
} from 'application/editor';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import type { Chain } from 'domain/entities/monomer-chains/Chain';
import { Vec2, type BaseMonomer } from 'domain/entities';
import { AttachmentPointName } from 'domain/types';
import {
  chemMonomerItem,
  coreEditorTheme,
  peptideMonomerItem,
  polymerEditorTheme,
} from '../../../mock-data';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../helpers/dom';

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

describe('CHEM chain layout (Sequence and Snake modes)', () => {
  let canvas: SVGSVGElement;
  let editor: CoreEditor;

  beforeEach(() => {
    canvas = createPolymerEditorCanvas();
    editor = new CoreEditor({
      theme: coreEditorTheme,
      canvas,
      renderersContainer: createRenderersManager(polymerEditorTheme),
      mode: new SequenceMode(),
    });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  const addPeptide = (position: Vec2): BaseMonomer => {
    const command = editor.drawingEntitiesManager.addMonomer(
      peptideMonomerItem,
      position,
    );
    editor.renderersContainer.update(command);
    return command.operations[0].monomer as BaseMonomer;
  };

  const addChem = (position: Vec2): BaseMonomer => {
    const command = editor.drawingEntitiesManager.addMonomer(
      chemMonomerItem,
      position,
    );
    editor.renderersContainer.update(command);
    return command.operations[0].monomer as BaseMonomer;
  };

  const connect = (
    firstMonomer: BaseMonomer,
    firstAttachmentPoint: AttachmentPointName,
    secondMonomer: BaseMonomer,
    secondAttachmentPoint: AttachmentPointName,
  ): void => {
    editor.renderersContainer.update(
      editor.drawingEntitiesManager.createPolymerBond(
        firstMonomer,
        secondMonomer,
        firstAttachmentPoint,
        secondAttachmentPoint,
        MACROMOLECULES_BOND_TYPES.SINGLE,
      ),
    );
  };

  const buildChains = (): ChainsCollection => {
    const chainsCollection = ChainsCollection.fromMonomers([
      ...editor.drawingEntitiesManager.monomers.values(),
    ]);
    chainsCollection.rearrange();
    return chainsCollection;
  };

  const chainOf = (
    chainsCollection: ChainsCollection,
    monomer: BaseMonomer,
  ): Chain | undefined => chainsCollection.monomerToChain.get(monomer);

  describe('terminal CHEM (one used attachment point) stays in line', () => {
    it('remains in line when connected through R2-R1', () => {
      const peptide1 = addPeptide(new Vec2(0, 0));
      const peptide2 = addPeptide(new Vec2(10, 0));
      const chem = addChem(new Vec2(20, 0));

      connect(
        peptide1,
        AttachmentPointName.R2,
        peptide2,
        AttachmentPointName.R1,
      );
      connect(peptide2, AttachmentPointName.R2, chem, AttachmentPointName.R1);

      const chainsCollection = buildChains();

      expect(chainsCollection.chains).toHaveLength(1);
      expect(chainOf(chainsCollection, chem)).toBe(
        chainOf(chainsCollection, peptide2),
      );
    });

    it('remains in line when connected through R1-R1 (CHEM at the beginning)', () => {
      const chem = addChem(new Vec2(0, 0));
      const peptide1 = addPeptide(new Vec2(10, 0));
      const peptide2 = addPeptide(new Vec2(20, 0));

      connect(chem, AttachmentPointName.R1, peptide1, AttachmentPointName.R1);
      connect(
        peptide1,
        AttachmentPointName.R2,
        peptide2,
        AttachmentPointName.R1,
      );

      const chainsCollection = buildChains();

      expect(chainsCollection.chains).toHaveLength(1);
      expect(chainOf(chainsCollection, chem)).toBe(
        chainOf(chainsCollection, peptide1),
      );
    });

    it('remains in line when connected through R2-R3 (CHEM at the end)', () => {
      const peptide1 = addPeptide(new Vec2(0, 0));
      const peptide2 = addPeptide(new Vec2(10, 0));
      const chem = addChem(new Vec2(20, 0));

      connect(
        peptide1,
        AttachmentPointName.R2,
        peptide2,
        AttachmentPointName.R1,
      );
      connect(peptide2, AttachmentPointName.R2, chem, AttachmentPointName.R3);

      const chainsCollection = buildChains();

      expect(chainsCollection.chains).toHaveLength(1);
      expect(chainOf(chainsCollection, chem)).toBe(
        chainOf(chainsCollection, peptide2),
      );
    });

    it('remains in line when connected through R1-R3 (CHEM at the beginning)', () => {
      const chem = addChem(new Vec2(0, 0));
      const peptide1 = addPeptide(new Vec2(10, 0));
      const peptide2 = addPeptide(new Vec2(20, 0));

      connect(chem, AttachmentPointName.R3, peptide1, AttachmentPointName.R1);
      connect(
        peptide1,
        AttachmentPointName.R2,
        peptide2,
        AttachmentPointName.R1,
      );

      const chainsCollection = buildChains();

      expect(chainsCollection.chains).toHaveLength(1);
      expect(chainOf(chainsCollection, chem)).toBe(
        chainOf(chainsCollection, peptide1),
      );
    });

    it('remains in line as a 5\u2032 cap connected through its own R2 to the neighbor R1', () => {
      const chem = addChem(new Vec2(0, 0));
      const peptide1 = addPeptide(new Vec2(10, 0));
      const peptide2 = addPeptide(new Vec2(20, 0));

      connect(chem, AttachmentPointName.R2, peptide1, AttachmentPointName.R1);
      connect(
        peptide1,
        AttachmentPointName.R2,
        peptide2,
        AttachmentPointName.R1,
      );

      const chainsCollection = buildChains();

      expect(chainsCollection.chains).toHaveLength(1);
      expect(chainOf(chainsCollection, chem)).toBe(
        chainOf(chainsCollection, peptide1),
      );
    });
  });

  describe('internal CHEM (two used attachment points) stays in line with the preceding chain', () => {
    it('remains in line with standard R2-R1 connections', () => {
      const peptide1 = addPeptide(new Vec2(0, 0));
      const chem = addChem(new Vec2(10, 0));
      const peptide2 = addPeptide(new Vec2(20, 0));

      connect(peptide1, AttachmentPointName.R2, chem, AttachmentPointName.R1);
      connect(chem, AttachmentPointName.R2, peptide2, AttachmentPointName.R1);

      const chainsCollection = buildChains();

      expect(chainsCollection.chains).toHaveLength(1);
      expect(chainOf(chainsCollection, chem)).toBe(
        chainOf(chainsCollection, peptide1),
      );
    });

    it('remains in line with nonstandard R3/R4 connections', () => {
      const peptide1 = addPeptide(new Vec2(0, 0));
      const chem = addChem(new Vec2(10, 0));
      const peptide2 = addPeptide(new Vec2(20, 0));

      connect(peptide1, AttachmentPointName.R2, chem, AttachmentPointName.R3);
      connect(chem, AttachmentPointName.R4, peptide2, AttachmentPointName.R1);

      const chainsCollection = buildChains();

      expect(chainsCollection.chains).toHaveLength(1);
      expect(chainOf(chainsCollection, chem)).toBe(
        chainOf(chainsCollection, peptide1),
      );
    });

    it('remains in line with nonstandard R1/R3 connections', () => {
      const peptide1 = addPeptide(new Vec2(0, 0));
      const chem = addChem(new Vec2(10, 0));
      const peptide2 = addPeptide(new Vec2(20, 0));

      connect(peptide1, AttachmentPointName.R2, chem, AttachmentPointName.R1);
      connect(chem, AttachmentPointName.R3, peptide2, AttachmentPointName.R1);

      const chainsCollection = buildChains();

      expect(chainsCollection.chains).toHaveLength(1);
      expect(chainOf(chainsCollection, chem)).toBe(
        chainOf(chainsCollection, peptide1),
      );
    });
  });

  describe('branched CHEM keeps the previous layout behavior', () => {
    it('places a CHEM with more than two used attachment points on the backbone only', () => {
      const peptide1 = addPeptide(new Vec2(0, 0));
      const chem = addChem(new Vec2(10, 0));
      const peptide2 = addPeptide(new Vec2(20, 0));
      const peptide3 = addPeptide(new Vec2(10, 10));

      connect(peptide1, AttachmentPointName.R2, chem, AttachmentPointName.R1);
      connect(chem, AttachmentPointName.R2, peptide2, AttachmentPointName.R1);
      // Third connection makes the CHEM branched (3 used attachment points).
      connect(chem, AttachmentPointName.R3, peptide3, AttachmentPointName.R1);

      const chainsCollection = buildChains();

      // The CHEM stays on the R2-R1 backbone with peptide1/peptide2 ...
      expect(chainOf(chainsCollection, chem)).toBe(
        chainOf(chainsCollection, peptide1),
      );
      expect(chainOf(chainsCollection, peptide2)).toBe(
        chainOf(chainsCollection, chem),
      );
      // ... while the extra (side-chain) connection to peptide3 remains on a
      // separate chain/line, matching the previous behavior for branched CHEMs.
      expect(chainOf(chainsCollection, peptide3)).not.toBe(
        chainOf(chainsCollection, chem),
      );
    });
  });

  describe('non-CHEM monomer layout is unchanged', () => {
    it('keeps two peptides connected through R1-R1 on separate lines', () => {
      const peptide1 = addPeptide(new Vec2(0, 0));
      const peptide2 = addPeptide(new Vec2(10, 0));

      connect(
        peptide1,
        AttachmentPointName.R1,
        peptide2,
        AttachmentPointName.R1,
      );

      const chainsCollection = buildChains();

      expect(chainsCollection.chains).toHaveLength(2);
      expect(chainOf(chainsCollection, peptide1)).not.toBe(
        chainOf(chainsCollection, peptide2),
      );
    });
  });

  describe('CHEM side-chain cross-links do not merge separate chains', () => {
    it('keeps two CHEM backbones separate when cross-linked through non-backbone APs (R4-R4)', () => {
      const chem1 = addChem(new Vec2(0, 0));
      const chem2 = addChem(new Vec2(10, 0));
      const chem3 = addChem(new Vec2(0, 10));
      const chem4 = addChem(new Vec2(10, 10));

      connect(chem1, AttachmentPointName.R2, chem2, AttachmentPointName.R1);
      connect(chem3, AttachmentPointName.R2, chem4, AttachmentPointName.R1);
      connect(chem1, AttachmentPointName.R4, chem3, AttachmentPointName.R4);

      const chainsCollection = buildChains();

      expect(chainsCollection.chains).toHaveLength(2);
      expect(chainOf(chainsCollection, chem1)).toBe(
        chainOf(chainsCollection, chem2),
      );
      expect(chainOf(chainsCollection, chem3)).toBe(
        chainOf(chainsCollection, chem4),
      );
      expect(chainOf(chainsCollection, chem1)).not.toBe(
        chainOf(chainsCollection, chem3),
      );
    });
  });
});
