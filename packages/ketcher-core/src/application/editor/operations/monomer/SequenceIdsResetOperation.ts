import type { Command } from 'domain/entities/Command';
import type { Operation } from 'domain/entities/Operation';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { PolymerBond } from 'domain/entities/PolymerBond';
import type { RenderersManager } from 'application/render/renderers/RenderersManager';
import { MonomerAddOperation } from './MonomerAddOperation';
import { MonomerDeleteOperation } from './MonomerDeleteOperation';
import { MonomerItemModifyOperation } from './MonomerItemModifyOperation';
import {
  PolymerBondDeleteOperation,
  PolymerBondFinishCreationOperation,
  ReconnectPolymerBondOperation,
} from '../polymerBond';

export class SequenceIdsResetOperation implements Operation {
  private readonly sequenceIds = new Map<BaseMonomer, number>();

  constructor(monomers: Iterable<BaseMonomer>) {
    const visited = new Set<BaseMonomer>();
    const pending = [...monomers];
    while (pending.length) {
      const monomer = pending.pop();
      if (!monomer || visited.has(monomer)) continue;
      visited.add(monomer);
      if (monomer.monomerItem.seqId !== undefined) {
        this.sequenceIds.set(monomer, monomer.monomerItem.seqId);
      }
      monomer.bonds.forEach((bond) => {
        if (bond instanceof PolymerBond) {
          const other = bond.getAnotherMonomer(monomer);
          if (other) pending.push(other);
        }
      });
    }
  }

  public static forCommand(
    command: Command,
  ): SequenceIdsResetOperation | undefined {
    const added = new Set(
      command.operations
        .filter((operation) => operation instanceof MonomerAddOperation)
        .map((operation) => operation.monomer),
    );
    const changed = new Set<BaseMonomer>();
    command.operations.forEach((operation) => {
      if (
        operation instanceof MonomerDeleteOperation ||
        (operation instanceof MonomerItemModifyOperation &&
          operation.changesSequence)
      ) {
        changed.add(operation.monomer);
      } else if (
        operation instanceof PolymerBondDeleteOperation ||
        operation instanceof PolymerBondFinishCreationOperation ||
        operation instanceof ReconnectPolymerBondOperation
      ) {
        const bond = operation.polymerBond;
        if (
          bond instanceof PolymerBond &&
          !(
            operation instanceof PolymerBondFinishCreationOperation &&
            added.has(bond.firstMonomer) &&
            bond.secondMonomer &&
            added.has(bond.secondMonomer)
          )
        ) {
          changed.add(bond.firstMonomer);
          if (bond.secondMonomer) changed.add(bond.secondMonomer);
        }
      }
    });
    if (!changed.size) return;
    const operation = new SequenceIdsResetOperation(changed);
    return operation.sequenceIds.size ? operation : undefined;
  }

  public execute(renderersManager: RenderersManager) {
    this.sequenceIds.forEach((_seqId, monomer) => {
      monomer.monomerItem = { ...monomer.monomerItem, seqId: undefined };
    });
    renderersManager.markForReEnumeration();
  }

  public invert(renderersManager: RenderersManager) {
    this.sequenceIds.forEach((seqId, monomer) => {
      monomer.monomerItem = { ...monomer.monomerItem, seqId };
    });
    renderersManager.markForReEnumeration();
  }

  public executeAfterAllOperations(renderersManager: RenderersManager) {
    this.execute(renderersManager);
  }

  public invertAfterAllOperations(renderersManager: RenderersManager) {
    this.invert(renderersManager);
  }
}
