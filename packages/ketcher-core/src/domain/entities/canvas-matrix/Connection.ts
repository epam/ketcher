import { PolymerBond } from 'domain/entities/PolymerBond';
import { SubChainNode } from 'domain/entities';

export class Connection {
  constructor(
    public polymerBond: PolymerBond,
    public connectedNode: SubChainNode | null,
    public direction: number | { x: number; y: number },
    public offset: number,
    public yOffset: number,
    public isVertical: boolean,
  ) {}
}
