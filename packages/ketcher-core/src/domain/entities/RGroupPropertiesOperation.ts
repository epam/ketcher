import type { Operation } from 'domain/entities/Operation';
import type { RGroup } from 'domain/entities/rgroup';

export type RGroupProperties = Pick<RGroup, 'range' | 'resth' | 'ifthen'>;

/** Update logic without changing molecule-local fragment membership. */
export class RGroupPropertiesOperation implements Operation {
  private readonly previous: RGroupProperties[];

  constructor(
    private readonly groups: RGroup[],
    private readonly properties: RGroupProperties,
  ) {
    this.previous = groups.map(({ range, resth, ifthen }) => ({
      range,
      resth,
      ifthen,
    }));
    this.execute();
  }

  public execute(): void {
    this.groups.forEach((group) => Object.assign(group, this.properties));
  }

  public invert(): void {
    this.groups.forEach((group, index) =>
      Object.assign(group, this.previous[index]),
    );
  }
}
