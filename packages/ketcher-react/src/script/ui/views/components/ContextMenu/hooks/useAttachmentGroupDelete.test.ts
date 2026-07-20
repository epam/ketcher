import { act, renderHook } from '@testing-library/react';
import {
  Atom,
  fromOneAtomDeletion,
  ketcherProvider,
  Struct,
  Vec2,
} from 'ketcher-core';
import useAttachmentGroupDelete from './useAttachmentGroupDelete';

jest.mock('src/hooks', () => ({
  useAppContext: () => ({ ketcherId: 'test-ketcher-id' }),
}));

jest.mock('ketcher-core', () => {
  const actual = jest.requireActual('ketcher-core');

  return {
    ...actual,
    fromOneAtomDeletion: jest.fn(() => 'delete-attachment-group-action'),
    isSuperAttachmentPointById: (struct: Struct, atomId: number) => {
      const atom = struct.atoms.get(atomId);
      return atom?.label === '*' && atom.endpoints.length > 0;
    },
  };
});

describe('useAttachmentGroupDelete', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deletes only the clicked Attachment Group marker', () => {
    const struct = new Struct();
    const firstEndpointId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 0) }),
    );
    const secondEndpointId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(1, 0) }),
    );
    const attachmentGroupId = struct.atoms.add(
      new Atom({
        label: '*',
        pp: new Vec2(0.5, 0),
        endpoints: [firstEndpointId, secondEndpointId],
      }),
    );
    const update = jest.fn();
    const selection = jest.fn();
    const focusCliparea = jest.fn();
    const restruct = {};
    const editor = {
      struct: () => struct,
      render: { ctab: restruct },
      update,
      selection,
      focusCliparea,
    };
    jest
      .spyOn(ketcherProvider, 'getKetcher')
      .mockReturnValue({ editor } as never);
    const { result } = renderHook(() => useAttachmentGroupDelete());

    act(() => {
      result.current({
        props: {
          id: 'atom-context-menu',
          atomIds: [attachmentGroupId],
        },
      } as never);
    });

    expect(fromOneAtomDeletion).toHaveBeenCalledWith(
      restruct,
      attachmentGroupId,
    );
    expect(update).toHaveBeenCalledWith('delete-attachment-group-action');
    expect(selection).toHaveBeenCalledWith(null);
    expect(focusCliparea).toHaveBeenCalled();
    expect(struct.atoms.has(firstEndpointId)).toBe(true);
    expect(struct.atoms.has(secondEndpointId)).toBe(true);
  });

  it('ignores regular atoms', () => {
    const struct = new Struct();
    const atomId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 0) }),
    );
    const update = jest.fn();
    const editor = {
      struct: () => struct,
      render: { ctab: {} },
      update,
      selection: jest.fn(),
      focusCliparea: jest.fn(),
    };
    jest
      .spyOn(ketcherProvider, 'getKetcher')
      .mockReturnValue({ editor } as never);
    const { result } = renderHook(() => useAttachmentGroupDelete());

    act(() => {
      result.current({
        props: {
          id: 'atom-context-menu',
          atomIds: [atomId],
        },
      } as never);
    });

    expect(update).not.toHaveBeenCalled();
  });
});
