// jest.mock() is hoisted before imports, so the factory must be self-contained.
jest.mock('../raphaelRender', () => ({ Render: jest.fn() }));

jest.mock('application/editor/shared/coordinates', () => ({
  Coordinates: {
    modelToCanvas: jest.fn().mockReturnValue({ x: 10, y: 10 }),
  },
}));

import { RenderStruct } from '../renderStruct';
import { Render } from '../raphaelRender';
import { Atom } from 'domain/entities/atom';
import { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';

const MockRender = Render as jest.MockedClass<typeof Render>;

type MockRenderInstance = Pick<InstanceType<typeof Render>, 'setMolecule'> & {
  clientArea: { innerHTML: string };
  ctab: { atoms: { forEach: jest.Mock } };
  paper: { canvas: { style: Record<string, string> } };
};

function makeMockInstance(svgContent: string): MockRenderInstance {
  return {
    setMolecule: jest.fn(),
    clientArea: { innerHTML: svgContent },
    ctab: { atoms: { forEach: jest.fn() } },
    paper: { canvas: { style: {} } },
  };
}

/**
 * Builds a minimal Struct with one carbon atom at the origin.
 * Identical to the pattern used in struct.test.ts.
 */
function singleCarbonStruct(name: string): Struct {
  const s = new Struct();
  s.name = name;
  s.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));
  return s;
}

/**
 * Two structs that share the same name but differ in atom placement,
 * producing distinct coordinate bounding boxes.
 */
function bicycloVariant(maxX: number): Struct {
  const s = new Struct();
  s.name = 'Bicyclo[4-2-1]nonane';
  s.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) }));
  s.atoms.add(new Atom({ label: 'C', pp: new Vec2(maxX, 0) }));
  return s;
}

// Each test passes a unique autoScaleMargin so isEqual(previousOptions, opts)
// is false at the start of each describe block, resetting the module-level cache.
let optionsSeed = 0;
function freshOptions() {
  return { autoScaleMargin: ++optionsSeed };
}

describe('RenderStruct caching', () => {
  beforeEach(() => {
    MockRender.mockReset();
    MockRender.mockReturnValue(
      makeMockInstance('<svg>default</svg>') as unknown as InstanceType<
        typeof Render
      >,
    );
  });

  it('reuses cached SVG when the same Struct object is rendered again with unchanged options', () => {
    const struct = singleCarbonStruct('Methane');
    const opts = freshOptions();
    const wrapper = document.createElement('div');

    RenderStruct.render(wrapper, struct, opts);
    RenderStruct.render(wrapper, struct, opts);

    expect(MockRender).toHaveBeenCalledTimes(1);
    expect(wrapper.innerHTML).toBe('<svg>default</svg>');
  });

  it('does not share cached SVG between different Struct objects with the same name and different coordinates', () => {
    const opts = freshOptions();
    const structA = bicycloVariant(1);
    const structB = bicycloVariant(5);
    const wrapperA = document.createElement('div');
    const wrapperB = document.createElement('div');

    MockRender.mockImplementationOnce(
      () =>
        makeMockInstance('<svg>bicyclo-A</svg>') as unknown as InstanceType<
          typeof Render
        >,
    ).mockImplementationOnce(
      () =>
        makeMockInstance('<svg>bicyclo-B</svg>') as unknown as InstanceType<
          typeof Render
        >,
    );

    // Initial renders — each struct is a distinct identity in the cache
    RenderStruct.render(wrapperA, structA, opts);
    RenderStruct.render(wrapperB, structB, opts);
    expect(MockRender).toHaveBeenCalledTimes(2);

    // Re-renders with identical options — must serve from cache, no new Render calls
    RenderStruct.render(wrapperA, structA, opts);
    RenderStruct.render(wrapperB, structB, opts);
    expect(MockRender).toHaveBeenCalledTimes(2);

    expect(wrapperA.innerHTML).toBe('<svg>bicyclo-A</svg>');
    expect(wrapperB.innerHTML).toBe('<svg>bicyclo-B</svg>');
  });

  it('invalidates the cache when render options change', () => {
    const struct = singleCarbonStruct('Methane');
    const wrapper = document.createElement('div');

    RenderStruct.render(wrapper, struct, freshOptions());
    expect(MockRender).toHaveBeenCalledTimes(1);

    RenderStruct.render(wrapper, struct, freshOptions());
    expect(MockRender).toHaveBeenCalledTimes(2);
  });
});
