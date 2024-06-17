import { PolymerBond } from 'domain/entities/PolymerBond';
import { SubChainNode } from 'domain/entities';

export class Connection {
  constructor(
    public polymerBond: PolymerBond,
    public connectedNode: SubChainNode,
    public direction: number,
  ) {}
}
