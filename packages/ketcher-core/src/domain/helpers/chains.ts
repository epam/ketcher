import { ITwoStrandedChainItem } from 'domain/entities/monomer-chains/ChainsCollection';
import { STRAND_TYPE } from 'domain/constants';
import { BaseMonomer, PolymerBond, SubChainNode } from 'domain/entities';

export const getNodeFromTwoStrandedNode = (
  twoStrandedNode: ITwoStrandedChainItem,
  strandType: STRAND_TYPE,
) => {
  return strandType === STRAND_TYPE.SENSE
    ? twoStrandedNode.senseNode
    : twoStrandedNode.antisenseNode;
};

export const getPreviousConnectedAntisenseNode = (
  node: SubChainNode,
  monomerToNode: Map<BaseMonomer, SubChainNode>,
) => {
  const r2PolymerBondBetweenNodes =
    node.lastMonomerInNode.attachmentPointsToBonds.R2;
  const anotherMonomerConnectedToAntisenseNode =
    r2PolymerBondBetweenNodes instanceof PolymerBond &&
    r2PolymerBondBetweenNodes?.getAnotherMonomer(node.lastMonomerInNode);
  const previousConnectedNode =
    (anotherMonomerConnectedToAntisenseNode &&
      monomerToNode.get(anotherMonomerConnectedToAntisenseNode)) ||
    undefined;

  return previousConnectedNode;
};

export const getPreviousConnectedSenseNode = (
  node: SubChainNode,
  monomerToNode: Map<BaseMonomer, SubChainNode>,
) => {
  const r1PolymerBondBetweenNodes =
    node.firstMonomerInNode.attachmentPointsToBonds.R1;
  const anotherMonomerConnectedToAntisenseNode =
    r1PolymerBondBetweenNodes instanceof PolymerBond &&
    r1PolymerBondBetweenNodes?.getAnotherMonomer(node.firstMonomerInNode);
  const previousConnectedNode =
    (anotherMonomerConnectedToAntisenseNode &&
      monomerToNode.get(anotherMonomerConnectedToAntisenseNode)) ||
    undefined;

  return previousConnectedNode;
};
