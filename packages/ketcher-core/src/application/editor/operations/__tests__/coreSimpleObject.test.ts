import type { RenderersManager } from 'application/render/renderers/RenderersManager';
import {
  SimpleObjectAddOperation,
  SimpleObjectDeleteOperation,
} from 'domain/entities/CoreSimpleObjectOperations';
import { CoreSimpleObject } from 'domain/entities/CoreSimpleObject';
import { SimpleObjectMode } from 'domain/entities/simpleObject';
import { Vec2 } from 'domain/entities/vec2';

function createRenderersManagerMock() {
  return {
    addSimpleObject: vi.fn(),
    deleteSimpleObject: vi.fn(),
  } as unknown as RenderersManager & {
    addSimpleObject: ReturnType<typeof vi.fn>;
    deleteSimpleObject: ReturnType<typeof vi.fn>;
  };
}

function createModel() {
  const model = new Set<CoreSimpleObject>();
  const add = (simpleObject?: CoreSimpleObject) => {
    const object =
      simpleObject ??
      new CoreSimpleObject(
        SimpleObjectMode.rectangle,
        new Vec2(0, 0),
        new Vec2(1, 1),
      );
    model.add(object);
    return object;
  };
  const remove = (simpleObject: CoreSimpleObject) => {
    model.delete(simpleObject);
  };
  return { model, add, remove };
}

describe('SimpleObjectAddOperation', () => {
  it('adds the model object and renders it on execute', () => {
    const { model, add, remove } = createModel();
    const renderersManager = createRenderersManagerMock();
    const operation = new SimpleObjectAddOperation(add, remove);

    operation.execute(renderersManager);

    expect(model.has(operation.simpleObject)).toBe(true);
    expect(renderersManager.addSimpleObject).toHaveBeenCalledWith(
      operation.simpleObject,
    );
  });

  it('removes the model object and its renderer on invert', () => {
    const { model, add, remove } = createModel();
    const renderersManager = createRenderersManagerMock();
    const operation = new SimpleObjectAddOperation(add, remove);

    operation.execute(renderersManager);
    operation.invert(renderersManager);

    expect(model.size).toBe(0);
    expect(renderersManager.deleteSimpleObject).toHaveBeenCalledWith(
      operation.simpleObject,
    );
  });
});

describe('SimpleObjectDeleteOperation', () => {
  it('removes the model object and its renderer on execute', () => {
    const { model, add, remove } = createModel();
    const renderersManager = createRenderersManagerMock();
    const simpleObject = add();
    const operation = new SimpleObjectDeleteOperation(
      simpleObject,
      remove,
      add,
    );

    operation.execute(renderersManager);

    expect(model.has(simpleObject)).toBe(false);
    expect(renderersManager.deleteSimpleObject).toHaveBeenCalledWith(
      simpleObject,
    );
  });

  it('restores the model object and its renderer on invert', () => {
    const { model, add, remove } = createModel();
    const renderersManager = createRenderersManagerMock();
    const simpleObject = add();
    const operation = new SimpleObjectDeleteOperation(
      simpleObject,
      remove,
      add,
    );

    operation.execute(renderersManager);
    operation.invert(renderersManager);

    expect(model.has(simpleObject)).toBe(true);
    expect(renderersManager.addSimpleObject).toHaveBeenCalledWith(simpleObject);
  });
});
