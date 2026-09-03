import { Render, ReStruct } from 'application/render';
import type { RenderOptions } from 'application/render/render.types';
import { AttachmentGroup, Struct, Vec2 } from 'domain/entities';

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
    } as unknown as DOMMatrix);
  svgSvgElement.createSVGPoint = () =>
    ({
      x: 0,
      y: 0,
      matrixTransform() {
        return this;
      },
    } as unknown as DOMPoint);
  window.SVGElement.prototype.getBBox = () =>
    ({ x: 0, y: 0, width: 10, height: 10 } as DOMRect);
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

  function renderAttachmentGroup() {
    const struct = new Struct();
    const attachmentGroupId = struct.addAttachmentGroup(
      new AttachmentGroup({ atomIds: [], pp: new Vec2(1, 1) }),
    );
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

  it('renders the active marker on center hover', () => {
    const { attachmentGroup, container, render } = renderAttachmentGroup();

    attachmentGroup.setHover(true, render);

    expect(
      container.querySelectorAll(
        '[data-attachment-group-marker-state="centerHovered"]',
      ),
    ).toHaveLength(3);
  });
});
