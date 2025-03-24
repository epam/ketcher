import { Chain } from 'domain/entities/monomer-chains/Chain';
import {
  AmbiguousMonomer,
  BaseMonomer,
  Chem,
  IsChainCycled,
  Peptide,
  Phosphate,
  RNABase,
  SubChainNode,
  Sugar,
  UnresolvedMonomer,
  UnsplitNucleotide,
} from 'domain/entities';
import {
  getNextMonomerInChain,
  getPreviousMonomerInChain,
  getRnaBaseFromSugar,
  isMonomerConnectedToR2RnaBase,
  isRnaBaseApplicableForAntisense,
  isRnaBaseOrAmbiguousRnaBase,
} from 'domain/helpers/monomers';
import { BaseSubChain } from 'domain/entities/monomer-chains/BaseSubChain';
import { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';
import { isMonomerSgroupWithAttachmentPoints } from '../../../utilities/monomers';
import { BackBoneSequenceNode } from 'domain/entities/BackBoneSequenceNode';

export interface ComplimentaryChainsWithData {
  complimentaryChain: Chain;
  chain: Chain;
  firstConnectedNode: SubChainNode;
  firstConnectedComplimentaryNode: SubChainNode;
  chainIdxConnection: number;
}

export type GrouppedChain = {
  group: number;
  chain: Chain;
};

export interface ITwoStrandedChainItem {
  senseNode?: SubChainNode | BackBoneSequenceNode;
  senseNodeIndex: number;
  chain: Chain;
  antisenseNode?: SubChainNode | BackBoneSequenceNode;
  antisenseNodeIndex?: number;
  antisenseChain?: Chain;
}

export class ChainsCollection {
  public chains: Chain[] = [];

  public get monomerToChain() {
    const monomerToChain = new Map<BaseMonomer, Chain>();

    this.chains.forEach((chain) => {
      chain.forEachNode(({ node }) => {
        node.monomers.forEach((monomer) => {
          monomerToChain.set(monomer, chain);
        });
      });
    });

    return monomerToChain;
  }

  public get monomerToNode() {
    const monomerToNode = new Map<BaseMonomer, SubChainNode>();

    this.forEachNode(({ node }) => {
      node.monomers.forEach((monomer) => {
        monomerToNode.set(monomer, node);
      });
    });

    return monomerToNode;
  }

  public rearrange() {
    this.chains.sort((chain1, chain2) => {
      // The factor is used to reduce the influence of the X coordinate on the sorting
      // to make the sorting more oriented to Y coordinate
      const X_COORDINATE_REDUCTION_FACTOR = 0.01;
      if (
        chain2.firstNode?.monomer.position.x * X_COORDINATE_REDUCTION_FACTOR +
          chain2.firstNode?.monomer.position.y >
        chain1.firstNode?.monomer.position.x * X_COORDINATE_REDUCTION_FACTOR +
          chain1.firstNode?.monomer.position.y
      ) {
        return -1;
      } else {
        return 1;
      }
    });

    const reorderedChains = new Set<Chain>();
    const monomerToChain = this.monomerToChain;
    this.chains.forEach((chain) => {
      reorderedChains.add(chain);

      chain.forEachNode(({ node }) => {
        node.monomers.forEach((monomer) => {
          const sideConnections = monomer.sideConnections;
          if (sideConnections.length) {
            sideConnections.forEach((sideConnection) => {
              const anotherMonomer = sideConnection.getAnotherMonomer(monomer);
              const anotherChain =
                anotherMonomer && monomerToChain.get(anotherMonomer);
              if (anotherChain && !reorderedChains.has(anotherChain)) {
                reorderedChains.add(anotherChain);
              }
            });
          }
        });
      });
    });

    this.chains = [...reorderedChains.values()];

    this.reorderChainsPutSenseChainOrderInAccordanceAntisenseConnection();
  }

  public add(chain: Chain) {
    this.chains.push(chain);

    return this;
  }

  public static fromMonomers(monomers: BaseMonomer[]) {
    const chainsCollection = new ChainsCollection();
    const filteredMonomers = monomers.filter(
      (monomer) =>
        !monomer.monomerItem.props.isMicromoleculeFragment ||
        isMonomerSgroupWithAttachmentPoints(monomer),
    );

    if (filteredMonomers.length === 0) {
      return chainsCollection;
    }

    const [firstMonomersInRegularChains, firstMonomersInCycledChains] =
      this.getFirstMonomersInChains(filteredMonomers);

    firstMonomersInRegularChains.forEach((monomer) => {
      chainsCollection.add(new Chain(monomer));
    });

    firstMonomersInCycledChains.forEach((monomer) => {
      chainsCollection.add(new Chain(monomer, !!IsChainCycled.CYCLED));
    });

    const firstMonomersInMiddleOfChains =
      this.getFirstMonomersInMiddleOfChains(filteredMonomers);

    if (firstMonomersInMiddleOfChains.length) {
      firstMonomersInMiddleOfChains.forEach(
        (firstMonomerInMiddleOfChain: BaseMonomer) => {
          chainsCollection.add(new Chain(firstMonomerInMiddleOfChain));
        },
      );
    }

    return chainsCollection;
  }

  public static getFirstMonomersInChains(
    monomers: BaseMonomer[],
    MonomerTypes: Array<
      | typeof Peptide
      | typeof Chem
      | typeof Phosphate
      | typeof Sugar
      | typeof RNABase
      | typeof UnresolvedMonomer
      | typeof UnsplitNucleotide
      | typeof AmbiguousMonomer
    > = [
      Peptide,
      Chem,
      Phosphate,
      Sugar,
      RNABase,
      UnresolvedMonomer,
      UnsplitNucleotide,
      AmbiguousMonomer,
    ],
  ) {
    const monomersList = monomers.filter((monomer) =>
      MonomerTypes.some((MonomerType) => monomer instanceof MonomerType),
    );

    const firstMonomersInChains: BaseMonomer[][] = [];

    const firstMonomersInRegularChains =
      this.getFirstMonomersInRegularChains(monomersList);

    const firstMonomersInCycledChains =
      this.getFirstMonomersInCycledChains(monomersList);

    firstMonomersInChains.push(
      firstMonomersInRegularChains,
      firstMonomersInCycledChains,
    );

    return firstMonomersInChains;
  }

  private static getFirstMonomersInMiddleOfChains(monomers: BaseMonomer[]) {
    const initialMonomersSet = new Set(monomers);
    const handledMonomers = new Set<BaseMonomer>();
    const firstMonomersInMiddleOfChains: BaseMonomer[] = [];

    monomers.forEach((monomer) => {
      if (handledMonomers.has(monomer)) {
        return;
      }

      handledMonomers.add(monomer);

      let previousMonomerInChain = getPreviousMonomerInChain(monomer);

      while (
        previousMonomerInChain &&
        !handledMonomers.has(previousMonomerInChain) &&
        !initialMonomersSet.has(previousMonomerInChain)
      ) {
        const previousMonomer = getPreviousMonomerInChain(
          previousMonomerInChain,
        );

        handledMonomers.add(previousMonomerInChain);

        if (!previousMonomer) {
          firstMonomersInMiddleOfChains.push(previousMonomerInChain);
        } else {
          previousMonomerInChain = previousMonomer;
        }
      }
    });

    return firstMonomersInMiddleOfChains;
  }

  public get firstNode() {
    return this.chains[0]?.subChains[0]?.nodes[0];
  }

  private static getFirstMonomersInRegularChains(
    monomersList: BaseMonomer[],
  ): BaseMonomer[] {
    const firstMonomersInRegularChains = monomersList.filter((monomer) => {
      const R1PolymerBond = monomer.attachmentPointsToBonds.R1;

      if (R1PolymerBond instanceof MonomerToAtomBond) {
        return true;
      }

      const isFirstMonomerWithR2R1connection =
        !R1PolymerBond || R1PolymerBond.isSideChainConnection;
      const R1ConnectedMonomer = R1PolymerBond?.getAnotherMonomer(monomer);
      const isRnaBaseConnectedToSugar =
        isRnaBaseOrAmbiguousRnaBase(monomer) &&
        R1ConnectedMonomer instanceof Sugar &&
        getRnaBaseFromSugar(R1ConnectedMonomer) === monomer;

      return (
        (isFirstMonomerWithR2R1connection ||
          isMonomerConnectedToR2RnaBase(monomer)) &&
        !isRnaBaseConnectedToSugar
      );
    });

    return firstMonomersInRegularChains;
  }

  private static getFirstMonomersInCycledChains(
    monomersList: BaseMonomer[],
  ): BaseMonomer[] {
    const handledMonomers = new Set<BaseMonomer>();
    const cyclicChains: BaseMonomer[][] = [];

    monomersList.forEach((monomer) => {
      if (handledMonomers.has(monomer)) {
        return;
      }

      const monomersInSameChain = new Set<BaseMonomer>();
      monomersInSameChain.add(monomer);
      handledMonomers.add(monomer);
      let nextMonomerInChain = getNextMonomerInChain(monomer);

      while (nextMonomerInChain && !handledMonomers.has(nextMonomerInChain)) {
        monomersInSameChain.add(nextMonomerInChain);
        handledMonomers.add(nextMonomerInChain);
        nextMonomerInChain = getNextMonomerInChain(nextMonomerInChain);
      }

      if (monomer === nextMonomerInChain) {
        cyclicChains.push(Array.from(monomersInSameChain));
      }
    });

    const firstMonomersOfCycledChainsSet = cyclicChains.map((cyclicChain) =>
      this.getMonomerWithLowerCoordsFromMonomerList(cyclicChain),
    );

    return firstMonomersOfCycledChainsSet;
  }

  private static getMonomerWithLowerCoordsFromMonomerList(
    monomerList: BaseMonomer[],
  ): BaseMonomer {
    const monomerListShallowCopy = monomerList.slice();

    monomerListShallowCopy.sort((monomer1, monomer2) => {
      if (
        monomer2.position.x + monomer2.position.y >
        monomer1.position.x + monomer1.position.y
      ) {
        return -1;
      } else {
        return 1;
      }
    });

    const monomerWithLowerCoords = monomerListShallowCopy[0];

    return monomerWithLowerCoords;
  }

  public get lastNode() {
    return this.chains[0].lastSubChain.lastNode;
  }

  public get length() {
    return this.chains.reduce((length, chain) => length + chain.length, 0);
  }

  public forEachNode(
    forEachCallback: (params: {
      chainIndex: number;
      subChainIndex: number;
      nodeIndex: number;
      nodeIndexOverall: number;
      node: SubChainNode;
      subChain: BaseSubChain;
      chain: Chain;
    }) => void,
  ) {
    let nodeIndexOverall = 0;

    this.chains.forEach((chain, chainIndex) => {
      chain.subChains.forEach((subChain, subChainIndex) => {
        subChain.nodes.forEach((node, nodeIndex) => {
          forEachCallback({
            chainIndex,
            subChainIndex,
            nodeIndex,
            nodeIndexOverall,
            node,
            subChain,
            chain,
          });
          nodeIndexOverall++;
        });
      });
    });
  }

  private getFirstComplimentaryMonomer(monomer: BaseMonomer) {
    const hydrogenBond = monomer.hydrogenBonds[0];

    if (hydrogenBond) {
      return {
        monomer,
        complimentaryMonomer: hydrogenBond.getAnotherMonomer(monomer),
      };
    }

    return undefined;
  }

  private findCycledComplimentaryChains(
    chain: Chain,
    startChain: Chain,
    previousChain?: Chain,
  ): Chain[] {
    const complimentaryChainsWithData =
      this.getComplimentaryChainsWithData(chain);

    if (complimentaryChainsWithData.length === 0) {
      return [];
    }

    const complimentaryChainGoesToStartChain = complimentaryChainsWithData.find(
      (complimentaryChainsWithData) =>
        complimentaryChainsWithData.complimentaryChain !== previousChain &&
        complimentaryChainsWithData.complimentaryChain === startChain,
    );

    if (complimentaryChainGoesToStartChain) {
      return [chain];
    } else {
      return complimentaryChainsWithData.reduce(
        (acc, complimentaryChainWithData) => {
          return complimentaryChainWithData.complimentaryChain === startChain ||
            complimentaryChainWithData.complimentaryChain === previousChain
            ? [...acc]
            : [
                ...acc,
                ...this.findCycledComplimentaryChains(
                  complimentaryChainWithData.complimentaryChain,
                  startChain,
                  chain,
                ),
              ];
        },
        [] as Chain[],
      );
    }
  }

  public getComplimentaryChainIfNucleotide(
    node: SubChainNode,
    monomerToChain: Map<BaseMonomer, Chain>,
    monomerToNode: Map<BaseMonomer, SubChainNode>,
  ) {
    let complimentaryChain: Chain | undefined;
    let complimentaryNode: SubChainNode | undefined;

    for (const monomerToCheck of node.monomers) {
      const { monomer, complimentaryMonomer } =
        this.getFirstComplimentaryMonomer(monomerToCheck) || {};
      const complimentaryNodeOrUndefined =
        complimentaryMonomer && monomerToNode.get(complimentaryMonomer);
      const complimentaryChainOrUndefined =
        complimentaryMonomer && monomerToChain.get(complimentaryMonomer);

      if (!complimentaryNodeOrUndefined || !complimentaryChainOrUndefined) {
        continue;
      }

      const isRnaMonomer = isRnaBaseApplicableForAntisense(monomer);
      const isRnaComplimentaryMonomer =
        isRnaBaseApplicableForAntisense(complimentaryMonomer);

      if (!isRnaMonomer || !isRnaComplimentaryMonomer) {
        continue;
      }

      // return first found complimentary chain and node
      return {
        complimentaryChain: complimentaryChainOrUndefined,
        complimentaryNode: complimentaryNodeOrUndefined,
      };
    }

    return { complimentaryChain, complimentaryNode };
  }

  private reorderChainsPutSenseChainOrderInAccordanceAntisenseConnection() {
    const handledChain = new Set<Chain>();
    const monomerToChain = this.monomerToChain;
    const monomerToNode = this.monomerToNode;
    const reorderedSenseForSequentialAntisenseChains: Chain[] = new Array(
      this.chains.length,
    );
    this.chains.forEach((chain) => {
      if (!handledChain.has(chain)) {
        reorderedSenseForSequentialAntisenseChains[handledChain.size] = chain;
        handledChain.add(chain);
      }

      if (chain.isAntisense) {
        return;
      }

      chain.forEachNode(({ node: sNode }) => {
        const {
          complimentaryChain: antisenseChain,
          complimentaryNode: antisenseNode,
        } =
          this.getComplimentaryChainIfNucleotide(
            sNode,
            monomerToChain,
            monomerToNode,
          ) ?? {};
        if (!antisenseChain) {
          return;
        }

        let isFindCur = false;
        antisenseChain.forEachNode(({ node: aNode }) => {
          if (aNode === antisenseNode) {
            isFindCur = true;
          }
          if (!isFindCur) {
            const { complimentaryChain: anotherSenseChain } =
              this.getComplimentaryChainIfNucleotide(
                aNode,
                monomerToChain,
                monomerToNode,
              ) ?? {};
            if (anotherSenseChain && !handledChain.has(anotherSenseChain)) {
              const curChainIdx =
                reorderedSenseForSequentialAntisenseChains.findIndex(
                  (v) => v === chain,
                );
              let last = anotherSenseChain;
              for (
                let i = curChainIdx;
                i < reorderedSenseForSequentialAntisenseChains.length;
                i++
              ) {
                const tmp = reorderedSenseForSequentialAntisenseChains[i];
                reorderedSenseForSequentialAntisenseChains[i] = last;
                last = tmp;
              }
              handledChain.add(anotherSenseChain);
            }
          }
        });
      });
    });
    this.chains = [...reorderedSenseForSequentialAntisenseChains];
  }

  // for example
  // 1 x x x
  //   |
  // 2 x x
  //     |
  // 3 x x x
  // 4 x x
  //     |
  // 5 x x
  // in the picture we have 5 chains, if we pass number 1 it return 1, 2 and 3, if pass 5, return 4, 5
  public getAllChainsWithConnectionInBlock(c: Chain) {
    const chains: GrouppedChain[] = [{ group: 0, chain: c }];
    const cycledComplimentaryChains = new Set<Chain>(
      this.findCycledComplimentaryChains(c, c),
    );

    const res: GrouppedChain[] = [{ group: 0, chain: c }];
    const handledChains = new Set<Chain>([c]);
    const monomerToChain = this.monomerToChain;
    const monomerToNode = this.monomerToNode;

    while (chains.length) {
      const { group, chain } = chains.pop() as GrouppedChain;
      const chainNodes = chain.nodes;

      chain.forEachNode(({ node, nodeIndex }) => {
        const { complimentaryChain, complimentaryNode } =
          this.getComplimentaryChainIfNucleotide(
            node,
            monomerToChain,
            monomerToNode,
          ) ?? {};

        if (
          !complimentaryChain ||
          !complimentaryNode ||
          handledChains.has(complimentaryChain) ||
          cycledComplimentaryChains.has(complimentaryChain)
        ) {
          return;
        }

        // find h-bonds intersections for complimentary chain
        const complimentaryChainNodes = complimentaryChain.nodes;
        const firstComplimentaryNodeIndex =
          complimentaryChainNodes.indexOf(complimentaryNode);
        let hasIntersection = false;

        for (
          let i = firstComplimentaryNodeIndex;
          i < complimentaryChainNodes.length;
          i++
        ) {
          const potentialNextComplimentaryNode = complimentaryChainNodes[i];
          const {
            complimentaryNode: nextComplimentaryNode,
            complimentaryChain: nextComplimentaryNodeChain,
          } =
            this.getComplimentaryChainIfNucleotide(
              potentialNextComplimentaryNode,
              monomerToChain,
              monomerToNode,
            ) ?? {};

          if (
            nextComplimentaryNode &&
            nextComplimentaryNodeChain === chain &&
            chainNodes.indexOf(nextComplimentaryNode) > nodeIndex
          ) {
            hasIntersection = true;

            break;
          }
        }

        handledChains.add(complimentaryChain);

        if (hasIntersection) {
          return;
        }

        const el = { chain: complimentaryChain, group: Number(!group) };
        chains.push(el);
        res.push(el);
      });
    }

    return res;
  }

  public getComplimentaryChainsWithData(
    chain: Chain,
  ): ComplimentaryChainsWithData[] {
    const complimentaryChainsWithData: ComplimentaryChainsWithData[] = [];
    const handledChains = new Set<Chain>();
    const monomerToNode = this.monomerToNode;
    const monomerToChain = this.monomerToChain;

    chain.forEachNode(({ node, nodeIndex }) => {
      node.monomers.forEach((monomer) => {
        const { complimentaryMonomer } =
          this.getFirstComplimentaryMonomer(monomer) || {};
        const complimentaryNode =
          complimentaryMonomer && monomerToNode.get(complimentaryMonomer);
        const complimentaryChain =
          complimentaryMonomer && monomerToChain.get(complimentaryMonomer);

        if (
          !complimentaryNode ||
          !complimentaryChain ||
          handledChains.has(complimentaryChain)
        ) {
          return;
        }

        handledChains.add(complimentaryChain);
        complimentaryChainsWithData.push({
          complimentaryChain,
          chain,
          firstConnectedNode: node,
          firstConnectedComplimentaryNode: complimentaryNode,
          chainIdxConnection: nodeIndex,
        });
      });
    });

    return complimentaryChainsWithData;
  }
}
