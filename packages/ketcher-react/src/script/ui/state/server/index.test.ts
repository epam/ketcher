import { Atom, Bond, Struct, Vec2 } from 'ketcher-core';
import { serverCall } from './index';

const createEthane = () => {
  const struct = new Struct();
  const begin = struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));
  const end = struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(1, 0) }));

  struct.bonds.add(new Bond({ begin, end, type: Bond.PATTERN.TYPE.SINGLE }));

  return struct;
};

describe('serverCall', () => {
  it('sends only the selected bonds when no atoms are selected', async () => {
    const method = jest.fn();
    const server = Object.assign(Promise.resolve(), { layout: method });
    const editor = {
      selection: () => ({ bonds: [0] }),
      struct: createEthane,
    };

    await serverCall(editor as never, server as never, 'layout', {});

    const [{ selected, struct }] = method.mock.calls[0];
    const { mol0 } = JSON.parse(struct);

    expect(selected).toBeUndefined();
    expect(mol0.bonds[0].selected).toBe(true);
    expect(
      mol0.atoms.some((atom: { selected?: boolean }) => atom.selected),
    ).toBe(false);
  });
});
