import {
  BackBoneSequenceNode,
  EmptySequenceNode,
  HydrogenBond,
  LinkerSequenceNode,
  SubChainNode,
} from 'domain/entities';
import { ITwoStrandedChainItem } from 'domain/entities/monomer-chains/ChainsCollection';

export function isNodeRestrictedForHydrogenBondCreation(
  node: SubChainNode | BackBoneSequenceNode | undefined,
) {
  return (
    !node ||
    node instanceof LinkerSequenceNode ||
    node instanceof BackBoneSequenceNode ||
    node instanceof EmptySequenceNode
  );
}

export function isTwoStrandedNodeRestrictedForHydrogenBondCreation(
  twoStrandedNode?: ITwoStrandedChainItem,
) {
  const senseNodeHydrogenBonds =
    twoStrandedNode?.senseNode?.monomers.reduce((acc, monomer) => {
      return acc.concat(monomer.hydrogenBonds);
    }, [] as HydrogenBond[]) || [];

  return Boolean(
    isNodeRestrictedForHydrogenBondCreation(twoStrandedNode?.senseNode) ||
      isNodeRestrictedForHydrogenBondCreation(twoStrandedNode?.antisenseNode) ||
      twoStrandedNode?.antisenseNode?.monomers.some((monomer) =>
        monomer.hydrogenBonds.some((hydrogenBond) => {
          return senseNodeHydrogenBonds.includes(hydrogenBond);
        }),
      ),
  );
}
