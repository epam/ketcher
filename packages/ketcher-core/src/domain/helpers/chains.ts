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

export const getPreviousConnectedNode = (
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
