import { PolymerBond } from 'domain/entities/PolymerBond';
import { SubChainNode } from 'domain/entities';

type DirectionInDegrees = 0 | 90 | 180 | 270;
type DirectionOfLastCell = { readonly x: number; readonly y: number };

export class Connection {
  constructor(
    public readonly connectedNode: SubChainNode | null,
    public readonly direction: DirectionInDegrees | DirectionOfLastCell,
    public readonly isVertical: boolean,
    public readonly polymerBond: PolymerBond,
    public offset: number,
    public yOffset: number,
  ) {}
}
