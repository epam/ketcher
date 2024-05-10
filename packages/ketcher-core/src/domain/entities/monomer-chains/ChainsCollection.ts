import { Chain } from 'domain/entities/monomer-chains/Chain';
import {
  BaseMonomer,
  Chem,
  IsChainCycled,
  Peptide,
  Phosphate,
  RNABase,
  Sugar,
} from 'domain/entities';
import {
  getNextMonomerInChain,
  getRnaBaseFromSugar,
} from 'domain/helpers/monomers';

export class ChainsCollection {
  public chains: Chain[] = [];

  public rearrange() {
    this.chains.sort((chain1, chain2) => {
      if (
        chain2.firstNode?.monomer.position.x +
          chain2.firstNode?.monomer.position.y >
        chain1.firstNode?.monomer.position.x +
          chain1.firstNode?.monomer.position.y
      ) {
        return -1;
      } else {
        return 1;
      }
    });
  }

  public add(chain: Chain) {
    this.chains.push(chain);
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
    > = [Peptide, Chem, Phosphate, Sugar, RNABase],
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
      const isSugarConnectedToR2RnaBase =
        monomer instanceof Sugar &&
        R1ConnectedMonomer instanceof RNABase &&
        getRnaBaseFromSugar(monomer) &&
        R1ConnectedMonomer.attachmentPointsToBonds.R2?.getAnotherMonomer(
          R1ConnectedMonomer,
        ) === monomer;

      return (
        (isFirstMonomerWithR2R1connection || isSugarConnectedToR2RnaBase) &&
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
}
