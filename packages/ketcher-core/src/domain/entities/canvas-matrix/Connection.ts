import { PolymerBond } from 'domain/entities/PolymerBond';
import { SubChainNode } from 'domain/entities';

export type ConnectionDirectionXInDegrees = 0 | 180;
export type ConnectionDirectionInDegrees = 0 | 90 | 180 | 270;
export type ConnectionDirectionOfLastCell = {
  readonly x: number;
  readonly y: number;
};

export class Connection {
  constructor(
    public readonly connectedNode: SubChainNode | null,
    public readonly direction:
      | ConnectionDirectionInDegrees
      | ConnectionDirectionOfLastCell,
    public readonly isVertical: boolean,
    public readonly polymerBond: PolymerBond,
    public xOffset: number,
    public yOffset: number,
  ) {}
}
