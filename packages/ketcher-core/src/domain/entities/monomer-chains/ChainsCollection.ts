import { Chain } from 'domain/entities/monomer-chains/Chain';
import {
  BaseMonomer,
  Chem,
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

    return this;
  }

  public static fromMonomers(monomers: BaseMonomer[]) {
    const chainsCollection = new ChainsCollection();
    const firstMonomersInChains = this.getFirstMonomersInChains(monomers);

    firstMonomersInChains.forEach((monomer) => {
      chainsCollection.add(new Chain(monomer));
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

    const firstMonomersInChains = monomersList.filter((monomer) => {
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

    return firstMonomersInChains;
  }

  public get firstNode() {
    return this.chains[0]?.subChains[0]?.nodes[0];
  }

  public get lastNode() {
    return this.chains[0].lastSubChain.lastNode;
  }

  public get length() {
    return this.chains.reduce((length, chain) => length + chain.length, 0);
  }
}
