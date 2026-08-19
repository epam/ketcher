import { AtomAdd, AtomDelete } from 'application/editor/operations';
import { BaseOperation } from 'application/editor/operations/BaseOperation';
import { OperationType } from 'application/editor/operations/OperationType';
import { Render } from 'application/render';
import { ReStruct } from 'application/render/restruct';
import type { RenderOptions } from 'application/render/render.types';
import { Struct, Vec2 } from 'domain/entities';
import { KetcherLogger } from 'utilities';

describe('BaseOperation.invert()', () => {
  let restruct: ReStruct;

  beforeEach(() => {
    const struct = new Struct();
    const options = {
      scale: 40,
      width: 100,
      height: 100,
    } as unknown as RenderOptions;
    const render = new Render(document as unknown as HTMLElement, options);
    restruct = new ReStruct(struct, render);
  });

  it('should round-trip paired operations via the base default invert()', () => {
    const pos = new Vec2(1, 2);
    const addOp = new AtomAdd({ label: 'C' }, pos);
    addOp.execute(restruct);

    const atomId = addOp.data.aid;
    if (atomId == null) {
      throw new Error('Atom id was not generated');
    }
    expect(restruct.molecule.atoms.has(atomId)).toBe(true);

    const deleteOp = addOp.invert();
    expect(deleteOp).toBeInstanceOf(AtomDelete);
    expect(deleteOp.data).toBe(addOp.data);

    deleteOp.execute(restruct);
    expect(restruct.molecule.atoms.has(atomId)).toBe(false);

    const restoreOp = deleteOp.invert();
    expect(restoreOp).toBeInstanceOf(AtomAdd);
    restoreOp.execute(restruct);
    expect(restruct.molecule.atoms.has(atomId)).toBe(true);
  });

  it('logs an error and returns itself when InverseConstructor is not wired', () => {
    class UnwiredOperation extends BaseOperation {
      constructor() {
        super(OperationType.ATOM_ADD);
      }
    }

    const errorSpy = jest
      .spyOn(KetcherLogger, 'error')
      .mockImplementation(() => undefined);
    const op = new UnwiredOperation();

    const result = op.invert();

    expect(errorSpy).toHaveBeenCalledWith(
      'Operation.invert() is not implemented',
    );
    expect(result).toBe(op);

    errorSpy.mockRestore();
  });
});
