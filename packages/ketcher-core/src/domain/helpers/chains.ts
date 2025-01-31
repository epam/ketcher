import { ITwoStrandedChainItem } from 'domain/entities/monomer-chains/ChainsCollection';
import { STRAND_TYPE } from 'domain/constants';

export const getNodeFromTwoStrandedNode = (
  twoStrandedNode: ITwoStrandedChainItem,
  strandType: STRAND_TYPE,
) => {
  return strandType === STRAND_TYPE.SENSE
    ? twoStrandedNode.senseNode
    : twoStrandedNode.antisenseNode;
};
