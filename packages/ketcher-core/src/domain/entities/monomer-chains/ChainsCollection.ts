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
import { getRnaBaseFromSugar } from 'domain/helpers/monomers';

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

    const firstMonomersInCycledChains = this.getFirstMonomersInCycledChains(
      monomersList,
      firstMonomersInRegularChains,
    );

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
    firstMonomersInRegularChainsList?: BaseMonomer[],
  ): BaseMonomer[] {
    const firstMonomersOfCycledChainsSet = new Set<BaseMonomer>();

    for (const monomer of monomersList) {
      let currentMonomer = monomer;

      if (monomer instanceof RNABase) {
        const R1PolymerBond = monomer.attachmentPointsToBonds.R1;
        const R1ConnectedMonomer = R1PolymerBond?.getAnotherMonomer(monomer);

        if (R1ConnectedMonomer instanceof Sugar) {
          currentMonomer = R1ConnectedMonomer;
        }
      }

      const R1PolymerBond = currentMonomer?.attachmentPointsToBonds.R1;

      if (R1PolymerBond) {
        const R1ConnectedMonomer =
          R1PolymerBond?.getAnotherMonomer(currentMonomer);

        if (!R1ConnectedMonomer) continue;

        const isMonomerInCycledChain =
          this.isMonomerInCycledChain(currentMonomer);

        if (isMonomerInCycledChain) {
          const monomerListInCycledChain =
            this.getMonomerListFromCycledChain(currentMonomer);

          const isAlreadyInFirstMonomersRegularChainsList =
            !!firstMonomersInRegularChainsList?.find((monomer) =>
              monomerListInCycledChain.includes(monomer),
            );

          if (isAlreadyInFirstMonomersRegularChainsList) continue;

          const monomerWithLowerCoords =
            this.getMonomerWithLowerCoordsFromMonomerList(
              monomerListInCycledChain,
            );

          firstMonomersOfCycledChainsSet.add(monomerWithLowerCoords);
        }
      }
    }

    return Array.from(firstMonomersOfCycledChainsSet);
  }

  private static isMonomerInCycledChain(monomer: BaseMonomer): boolean {
    let currentMonomer = monomer;
    let result = false;

    const monomersInChainSet = new Set<BaseMonomer>();
    monomersInChainSet.add(currentMonomer);

    while (true) {
      const R1PolymerBond = currentMonomer.attachmentPointsToBonds.R1;

      if (!R1PolymerBond) break;

      const R1ConnectedMonomer =
        R1PolymerBond?.getAnotherMonomer(currentMonomer);

      if (!R1ConnectedMonomer) break;

      const R1ConnectedMonomerR1Bond =
        R1ConnectedMonomer?.attachmentPointsToBonds.R1;

      if (R1ConnectedMonomerR1Bond === R1PolymerBond) break;

      if (monomersInChainSet.has(R1ConnectedMonomer)) {
        result = true;
        break;
      } else {
        monomersInChainSet.add(R1ConnectedMonomer);
        currentMonomer = R1ConnectedMonomer;
      }
    }

    return result;
  }

  private static getMonomerWithLowerCoordsFromMonomerList(
    monomerList: BaseMonomer[],
  ): BaseMonomer {
    const monomerWithLowerCoords = monomerList.reduce(
      (monomerWithLowerCoordsAcc, monomer) => {
        if (
          monomer.position.x < monomerWithLowerCoordsAcc.position.x ||
          (monomer.position.x === monomerWithLowerCoordsAcc.position.x &&
            monomer.position.y < monomerWithLowerCoordsAcc.position.y)
        ) {
          return monomer;
        }
        return monomerWithLowerCoordsAcc;
      },
      monomerList[0],
    );

    return monomerWithLowerCoords;
  }

  private static getMonomerListFromCycledChain(
    monomer: BaseMonomer,
  ): BaseMonomer[] {
    const firstMonomer = monomer;
    const monomerList: BaseMonomer[] = [];

    let nextMonomer: BaseMonomer = firstMonomer;

    do {
      const R1PolymerBond = nextMonomer.attachmentPointsToBonds.R1;

      nextMonomer =
        R1PolymerBond?.getAnotherMonomer(nextMonomer) || firstMonomer;

      monomerList.push(nextMonomer);
    } while (nextMonomer !== firstMonomer);

    return monomerList;
  }
}
