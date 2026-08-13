import { SGroupAddToHierarchy } from 'application/editor/operations';
import type { ReStruct } from 'application/render';

describe('SGroupAddToHierarchy', () => {
  it('throws a clear error when s-group is missing', () => {
    const getSGroupMock = jest.fn().mockReturnValue(undefined);
    const restruct = {
      molecule: {
        sgroups: {
          get: getSGroupMock,
        },
      },
    } as unknown as ReStruct;
    const operation = new SGroupAddToHierarchy(100500);

    expect(() => operation.execute(restruct)).toThrow(
      'SGroupAddToHierarchy: S-Group 100500 not found',
    );
    expect(getSGroupMock).toHaveBeenCalledWith(100500);
  });
});
