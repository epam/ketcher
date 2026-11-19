import type { ITwoStrandedChainItem } from 'domain/entities/monomer-chains/ChainsCollection';
import { STRAND_TYPE } from 'domain/constants';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { Phosphate } from 'domain/entities/Phosphate';
import type { Chain } from 'domain/entities/monomer-chains/Chain';
import type { SubChainNode } from 'domain/entities/monomer-chains/types';
import { isRnaBaseOrAmbiguousRnaBase } from 'domain/helpers/monomers';

// Lets Snake mode stagger paired strands and route the phosphate bond through the gap.
export function areSingleNucleotidesPairedAtBaseAndPhosphate(
  firstChain: Chain | undefined,
  secondChain: Chain | undefined,
): boolean {
  if (!firstChain || !secondChain || firstChain === secondChain) {
    return false;
  }

  const first = firstChain.monomers;
  const second = secondChain.monomers;
  if (first.length !== 3 || second.length !== 3) {
    return false;
  }

  const firstBase = first.find(isRnaBaseOrAmbiguousRnaBase);
  const secondBase = second.find(isRnaBaseOrAmbiguousRnaBase);
  const firstPhosphate = first.find((monomer) => monomer instanceof Phosphate);
  const secondPhosphate = second.find(
    (monomer) => monomer instanceof Phosphate,
  );
  return Boolean(
    secondBase &&
    secondPhosphate &&
    firstBase?.hasHydrogenBondWithMonomer(secondBase) &&
    firstPhosphate?.hasHydrogenBondWithMonomer(secondPhosphate),
  );
}

export const getNodeFromTwoStrandedNode = (
  twoStrandedNode: ITwoStrandedChainItem,
  strandType: STRAND_TYPE,
) => {
  return strandType === STRAND_TYPE.SENSE
    ? twoStrandedNode.senseNode
    : twoStrandedNode.antisenseNode;
};

export const getNextConnectedNode = (
  node: SubChainNode,
  monomerToNode: Map<BaseMonomer, SubChainNode>,
) => {
  const r2PolymerBondBetweenNodes =
    node.lastMonomerInNode.attachmentPointsToBonds.R2;
  const anotherMonomerConnectedToAntisenseNode =
    r2PolymerBondBetweenNodes instanceof PolymerBond &&
    r2PolymerBondBetweenNodes?.getAnotherMonomer(node.lastMonomerInNode);
  const nextConnectedNode =
    (anotherMonomerConnectedToAntisenseNode &&
      monomerToNode.get(anotherMonomerConnectedToAntisenseNode)) ||
    undefined;

  return nextConnectedNode;
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
