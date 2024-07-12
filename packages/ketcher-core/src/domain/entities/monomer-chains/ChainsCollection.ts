import { Chain } from 'domain/entities/monomer-chains/Chain';
import {
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
  getRnaBaseFromSugar,
  isMonomerConnectedToR2RnaBase,
} from 'domain/helpers/monomers';
import { BaseSubChain } from 'domain/entities/monomer-chains/BaseSubChain';

export class ChainsCollection {
  public chains: Chain[] = [];

  private get monomerToChain() {
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
  }

  public add(chain: Chain) {
    this.chains.push(chain);

    return this;
  }

  public static fromMonomers(monomers: BaseMonomer[]) {
    const chainsCollection = new ChainsCollection();
    const [firstMonomersInRegularChains, firstMonomersInCycledChains] =
      this.getFirstMonomersInChains(monomers);

    firstMonomersInRegularChains.forEach((monomer) => {
      chainsCollection.add(new Chain(monomer));
    });

    firstMonomersInCycledChains.forEach((monomer) => {
      chainsCollection.add(new Chain(monomer, !!IsChainCycled.CYCLED));
    });

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
    > = [
      Peptide,
      Chem,
      Phosphate,
      Sugar,
      RNABase,
      UnresolvedMonomer,
      UnsplitNucleotide,
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

  public get firstNode() {
    return this.chains[0]?.subChains[0]?.nodes[0];
  }

  private static getFirstMonomersInRegularChains(
    monomersList: BaseMonomer[],
  ): BaseMonomer[] {
    const firstMonomersInRegularChains = monomersList.filter((monomer) => {
      const R1PolymerBond = monomer.attachmentPointsToBonds.R1;
      const isFirstMonomerWithR2R1connection =
        !R1PolymerBond || R1PolymerBond.isSideChainConnection;

      const R1ConnectedMonomer = R1PolymerBond?.getAnotherMonomer(monomer);
      const isRnaBaseConnectedToSugar =
        monomer instanceof RNABase &&
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
}
