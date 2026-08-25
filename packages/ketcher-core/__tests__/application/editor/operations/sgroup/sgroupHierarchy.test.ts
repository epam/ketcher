import { SGroupAddToHierarchy } from 'application/editor/operations';
import type { ReStruct } from 'application/render';
import { KetcherLogger } from 'utilities';

describe('SGroupAddToHierarchy', () => {
  it('logs an error and returns when s-group is missing', () => {
    const getSGroupMock = jest.fn().mockReturnValue(undefined);
    const insertMock = jest.fn();
    const loggerSpy = jest
      .spyOn(KetcherLogger, 'error')
      .mockImplementation(() => undefined);
    const restruct = {
      molecule: {
        sgroups: {
          get: getSGroupMock,
        },
        sGroupForest: {
          insert: insertMock,
        },
      },
    } as unknown as ReStruct;
    const operation = new SGroupAddToHierarchy(100500);

    operation.execute(restruct);

    expect(loggerSpy).toHaveBeenCalledWith(
      'SGroupAddToHierarchy: S-Group 100500 not found',
    );
    expect(getSGroupMock).toHaveBeenCalledWith(100500);
    expect(insertMock).not.toHaveBeenCalled();

    loggerSpy.mockRestore();
  });
});
