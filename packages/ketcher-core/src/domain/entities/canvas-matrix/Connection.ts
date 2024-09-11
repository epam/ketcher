import { PolymerBond } from 'domain/entities/PolymerBond';
import { SubChainNode } from 'domain/entities';

export class Connection {
  constructor(
    public readonly connectedNode: SubChainNode | null,
    public readonly direction: 0 | 90 | 180 | 270 | { x: number; y: number },
    public readonly isVertical: boolean,
    public readonly polymerBond: PolymerBond,
    public offset: number,
    public yOffset: number,
  ) {}
}
