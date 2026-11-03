import type { StructService } from 'ketcher-core';

let indigo: StructService | undefined;
export class IndigoProvider {
  static getIndigo(): StructService | undefined {
    return indigo;
  }

  static setIndigo(newIndigo: StructService) {
    indigo = newIndigo;
  }
}
