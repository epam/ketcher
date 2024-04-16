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

  private static getFirstMonomersInCycledChains(
    monomersList: BaseMonomer[],
  ): BaseMonomer[] {
    const firstMonomersOfCycledChainsSet = new Set<BaseMonomer>();

    for (let monomer of monomersList) {
      if (monomer instanceof RNABase) {
        const R1PolymerBond = monomer.attachmentPointsToBonds.R1;
        const R1ConnectedMonomer = R1PolymerBond?.getAnotherMonomer(monomer);

        if (R1ConnectedMonomer instanceof Sugar) {
          monomer = R1ConnectedMonomer;
        }
      }

      const R1PolymerBond = monomer.attachmentPointsToBonds.R1;

      if (R1PolymerBond) {
        const R1ConnectedMonomer = R1PolymerBond?.getAnotherMonomer(monomer);

        if (!R1ConnectedMonomer) continue;

        if (!(monomer instanceof Sugar)) {
          const R3PolymerBond = monomer.attachmentPointsToBonds.R3;

          if (R3PolymerBond) continue;
        }

        const isMonomerInCycledChain = this.isMonomerInCycledChain(
          R1ConnectedMonomer,
          monomer,
        );

        if (isMonomerInCycledChain) {
          const monomerListInCycledChain =
            this.getMonomerListFromCycledChain(monomer);

          const monomerWithLesserId = this.getMonomerWithLesserId(
            monomerListInCycledChain,
          );

          firstMonomersOfCycledChainsSet.add(monomerWithLesserId);
        }
      }
    }

    return Array.from(firstMonomersOfCycledChainsSet);
  }

  private static isMonomerInCycledChain(
    monomer: BaseMonomer,
    firstMonomer: BaseMonomer,
  ): boolean {
    const R1PolymerBond = monomer.attachmentPointsToBonds.R1;

    if (!(firstMonomer instanceof Sugar)) {
      const R3PolymerBond = monomer.attachmentPointsToBonds.R3;

      if (R3PolymerBond) return false;
    }

    if (!R1PolymerBond) return false;

    const R1ConnectedMonomer = R1PolymerBond?.getAnotherMonomer(monomer);

    const R1ConnectedMonomerR1Bond =
      R1ConnectedMonomer?.attachmentPointsToBonds.R1;

    if (R1ConnectedMonomerR1Bond === R1PolymerBond) return false;

    if (!R1ConnectedMonomer) return false;

    if (R1ConnectedMonomer.id === firstMonomer.id) return true;

    return this.isMonomerInCycledChain(R1ConnectedMonomer, firstMonomer);
  }

  private static getMonomerWithLesserId(
    monomerList: BaseMonomer[],
  ): BaseMonomer {
    const monomerListShallowCopy = monomerList.slice();

    monomerListShallowCopy.sort((a, b) => a.id - b.id);

    const monomerWithLesserId =
      monomerList.find(
        (monomer) => monomer.id === monomerListShallowCopy[0].id,
      ) || monomerList[0];

    return monomerWithLesserId;
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
