import { Render, ReStruct } from 'application/render';
import type { RenderOptions } from 'application/render/render.types';
import { AttachmentGroup, Atom, Bond, Struct, Vec2 } from 'domain/entities';

type SvgSvgElementWithRaphaelMethods = SVGSVGElement & {
  createSVGMatrix: () => DOMMatrix;
  createSVGPoint: () => DOMPoint;
};

function mockSvgDomApi() {
  const svgSvgElement = window.SVGSVGElement
    .prototype as unknown as SvgSvgElementWithRaphaelMethods;

  svgSvgElement.createSVGMatrix = () =>
    ({
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      e: 0,
      f: 0,
      inverse() {
        return this;
      },
      multiply() {
        return this;
      },
      translate() {
        return this;
      },
      scale() {
        return this;
      },
      rotate() {
        return this;
      },
    }) as unknown as DOMMatrix;
  svgSvgElement.createSVGPoint = () =>
    ({
      x: 0,
      y: 0,
      matrixTransform() {
        return this;
      },
    }) as unknown as DOMPoint;
  window.SVGElement.prototype.getBBox = () =>
    ({ x: 0, y: 0, width: 10, height: 10 }) as DOMRect;
}

describe('ReAttachmentGroup marker states', () => {
  const options = {
    microModeScale: 40,
    width: 100,
    height: 100,
  } as RenderOptions;

  beforeEach(() => {
    document.body.innerHTML = '';
    mockSvgDomApi();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  function renderAttachmentGroup(connected = false) {
    const struct = new Struct();
    const connectedAtomId = struct.atoms.add(
      new Atom({ label: 'Fe', pp: new Vec2(3, 1) }),
    );
    const attachmentGroupId = struct.addAttachmentGroup(
      new AttachmentGroup({ atomIds: [], pp: new Vec2(1, 1) }),
    );
    if (connected) {
      struct.bonds.add(
        new Bond({
          begin: attachmentGroupId,
          end: connectedAtomId,
          type: Bond.PATTERN.TYPE.HAPTIC,
        }),
      );
      struct.initHalfBonds();
      struct.initNeighbors();
      struct.updateHalfBonds([
        ...struct.atoms.keys(),
        ...struct.attachmentGroups.keys(),
      ]);
    }
    const container = document.createElement('div');
    document.body.appendChild(container);
    const render = new Render(container, options);
    const restruct = new ReStruct(struct, render);
    render.ctab = restruct;
    restruct.update(true);

    return {
      container,
      render,
      attachmentGroup: restruct.attachmentGroups.get(attachmentGroupId)!,
    };
  }

  it('renders the default marker when neither the group nor center is hovered', () => {
    const { container } = renderAttachmentGroup();

    expect(
      container.querySelectorAll(
        '[data-attachment-group-marker-state="default"]',
      ),
    ).toHaveLength(3);
    expect(container.querySelector('text')?.textContent).not.toBe('*');
  });

  it('preserves the gray marker glyph and highlights its outline and stroke when hovered', () => {
    const { attachmentGroup, container, render } = renderAttachmentGroup();
    const defaultGlyph = container.querySelector(
      'path[data-attachment-group-marker-state="default"]',
    );

    attachmentGroup.setHover(true, render);

    const targetElements = container.querySelectorAll(
      '[data-attachment-group-marker-state="hovered"]',
    );
    const targetOutline = container.querySelector(
      'circle[data-attachment-group-marker-state="hovered"]',
    );
    const targetGlyph = container.querySelector(
      'path[data-attachment-group-marker-state="hovered"]',
    );

    expect(targetElements).toHaveLength(3);
    expect(targetOutline?.getAttribute('stroke')).toBe('#0097a8');
    expect(targetGlyph?.getAttribute('stroke')).toBe('#0097a8');
    expect(targetGlyph?.getAttribute('d')).toBe(
      defaultGlyph?.getAttribute('d'),
    );
    expect(targetGlyph?.getAttribute('stroke-width')).toBe(
      defaultGlyph?.getAttribute('stroke-width'),
    );
  });

  it('renders the existing active marker when hovered and connected', () => {
    const { attachmentGroup, container, render } = renderAttachmentGroup(true);
    attachmentGroup.setHover(true, render);

    expect(
      container.querySelectorAll(
        '[data-attachment-group-marker-state="connectedHovered"]',
      ),
    ).toHaveLength(3);
  });
});
