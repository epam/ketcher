import { Peptide } from 'domain/entities';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { HydrogenBond } from 'domain/entities/HydrogenBond';
import { SnakeLayoutModel } from 'domain/entities/snake-layout-model/SnakeLayoutModel';
import { AttachmentPointName } from 'domain/types';
import { peptideMonomerItem } from '../../mock-data';

// SnakeLayoutModel is built here with no editor. fillAntisenseNodes joins an
// antisense monomer to the sense monomer it is hydrogen bonded to when both are
// RNA-base-applicable (isRnaBaseApplicableForAntisense) or when the given
// manager's antisenseMonomerToSenseChain maps the antisense monomer to the
// chain of that sense monomer. Peptides are never RNA-base-applicable, so the
// manager's map alone decides.

const CELL_WIDTH_IN_ANGSTROMS = 1;

const buildHydrogenBondedPeptides = () => {
  const sense = new Peptide(peptideMonomerItem);
  const antisense = new Peptide({ ...peptideMonomerItem, isAntisense: true });
  const hydrogenBond = new HydrogenBond(sense, antisense);

  sense.setBond(AttachmentPointName.HYDROGEN, hydrogenBond);
  antisense.setBond(AttachmentPointName.HYDROGEN, hydrogenBond);

  const chainsCollection = ChainsCollection.fromMonomers([sense, antisense]);

  return { sense, antisense, chainsCollection };
};

const collectNodes = (
  chainsCollection: ChainsCollection,
  drawingEntitiesManager: DrawingEntitiesManager,
) => {
  const model = new SnakeLayoutModel(
    chainsCollection,
    drawingEntitiesManager,
    CELL_WIDTH_IN_ANGSTROMS,
    false,
  );
  const nodes: Parameters<Parameters<SnakeLayoutModel['forEachNode']>[0]>[0][] =
    [];

  model.forEachNode((node) => nodes.push(node));

  return nodes;
};

describe('SnakeLayoutModel', () => {
  it('pairs an antisense monomer with its sense partner when the given manager maps it to the partner chain', () => {
    const { sense, antisense, chainsCollection } =
      buildHydrogenBondedPeptides();
    const drawingEntitiesManager = new DrawingEntitiesManager();
    const senseChain = chainsCollection.monomerToChain.get(sense);

    expect(senseChain).toBeDefined();
    drawingEntitiesManager.antisenseMonomerToSenseChain.set(
      antisense,
      senseChain as NonNullable<typeof senseChain>,
    );

    const nodes = collectNodes(chainsCollection, drawingEntitiesManager);

    expect(nodes).toHaveLength(1);
    expect(nodes[0].senseNode?.monomers).toEqual([sense]);
    expect(nodes[0].antisenseNode?.monomers).toEqual([antisense]);
  });

  it('leaves an antisense monomer unpaired when the given manager does not map it', () => {
    const { sense, chainsCollection } = buildHydrogenBondedPeptides();

    const nodes = collectNodes(chainsCollection, new DrawingEntitiesManager());

    expect(nodes).toHaveLength(1);
    expect(nodes[0].senseNode?.monomers).toEqual([sense]);
    expect(nodes[0].antisenseNode).toBeUndefined();
  });
});
