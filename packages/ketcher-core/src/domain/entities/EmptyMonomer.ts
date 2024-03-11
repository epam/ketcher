import { BaseMonomer } from './BaseMonomer';
import { EmptySubChain } from 'domain/entities/monomer-chains/EmptySubChain';
import { Struct } from 'domain/entities/struct';

function getEmptyMonomerItem() {
  return {
    label: '',
    struct: new Struct(),
    props: {
      MonomerNaturalAnalogCode: '',
      MonomerName: '',
      Name: '',
    },
  };
}

export class EmptyMonomer extends BaseMonomer {
  constructor() {
    super(getEmptyMonomerItem());
  }

  public getValidSourcePoint() {
    return undefined;
  }

  public getValidTargetPoint() {
    return undefined;
  }

  public get SubChainConstructor() {
    return EmptySubChain;
  }

  public isMonomerTypeDifferentForChaining() {
    return true;
  }
}
