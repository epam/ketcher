import { SGroupAddOperation } from 'application/editor/operations/coreSGroup/sgroup';
import { AtomAddOperation } from 'application/editor/operations/coreAtom/atom';
import type { RenderersManager } from 'application/render/renderers/RenderersManager';
import type { Atom } from 'domain/entities/CoreAtom';
import { Command } from 'domain/entities/Command';
import type { SGroupDrawingEntity } from 'domain/entities/SGroupDrawingEntity';

describe('SGroupAddOperation', () => {
  it('renders the S-group after all operations', () => {
    const sgroup = {} as SGroupDrawingEntity;
    const addSGroup = jest.fn();
    const renderersManager = { addSGroup } as unknown as RenderersManager;
    const operation = new SGroupAddOperation(() => sgroup, jest.fn());

    operation.execute();
    expect(addSGroup).not.toHaveBeenCalled();

    operation.executeAfterAllOperations(renderersManager);
    expect(addSGroup).toHaveBeenCalledWith(sgroup);
  });

  it('renders the S-group after the atoms of the same command', () => {
    const addAtom = jest.fn();
    const addSGroup = jest.fn();
    const renderersManager = {
      addAtom,
      addSGroup,
      reinitializeViewModel: jest.fn(),
      runPostRenderMethods: jest.fn(),
    } as unknown as RenderersManager;
    const command = new Command();

    command.addOperation(new AtomAddOperation(() => ({}) as Atom, jest.fn()));
    command.addOperation(
      new SGroupAddOperation(() => ({}) as SGroupDrawingEntity, jest.fn()),
    );
    command.execute(renderersManager);

    expect(addAtom.mock.invocationCallOrder[0]).toBeLessThan(
      addSGroup.mock.invocationCallOrder[0],
    );
  });
});
