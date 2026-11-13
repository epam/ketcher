import { Command } from 'domain/entities/Command';
import type { Operation } from 'domain/entities/Operation';

describe('Command', () => {
  it('merges commands with large operation lists', () => {
    const operation: Operation = {
      execute: () => {},
      invert: () => {},
    };
    const source = new Command();
    source.operations = Array.from({ length: 200_000 }, () => operation);

    const target = new Command();
    target.merge(source);

    expect(target.operations).toHaveLength(200_000);
  });
});
