import { fromMultipleMove } from 'application/editor/actions';
import { Render, ReStruct } from 'application/render';
import type { RenderOptions } from 'application/render/render.types';
import { AttachmentGroup, Atom, Bond, Struct, Vec2 } from 'domain/entities';

jest.mock('application/render/restruct/hoverPath', () => ({
  uniteHoverPaths: (hoverPaths: Array<{ remove?: () => void }>) => {
    hoverPaths.forEach((hoverPath) => hoverPath.remove?.());
    return hoverPaths.length > 0 ? 'M 0 0 L 1 0 L 1 1 Z' : undefined;
  },
}));

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
      attachmentGroupId,
      container,
      render,
      restruct,
      attachmentGroup: restruct.attachmentGroups.get(attachmentGroupId)!,
    };
  }

  function renderPopulatedAttachmentGroup() {
    const struct = new Struct();
    const firstAtomId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 1) }),
    );
    const secondAtomId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(2, 1) }),
    );
    const internalBondId = struct.bonds.add(
      new Bond({
        begin: firstAtomId,
        end: secondAtomId,
        type: Bond.PATTERN.TYPE.SINGLE,
      }),
    );
    const attachmentGroupId = struct.addAttachmentGroup(
      new AttachmentGroup({ atomIds: [firstAtomId, secondAtomId] }),
    );
    const container = document.createElement('div');
    document.body.appendChild(container);
    const render = new Render(container, options);
    const restruct = new ReStruct(struct, render);
    render.ctab = restruct;
    restruct.update(true);

    return {
      atomIds: [firstAtomId, secondAtomId],
      internalBondId,
      attachmentGroupId,
      container,
      render,
      restruct,
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

  it('renders an unconnected selected marker without an outline until it is hovered', () => {
    const { attachmentGroup, attachmentGroupId, container, render, restruct } =
      renderAttachmentGroup();

    restruct.setSelection({ attachmentGroups: [attachmentGroupId] });
    render.update(false);

    const markerBackground = container.querySelector(
      'circle[data-attachment-group-marker-state="selected"]',
    );
    const markerGlyph = container.querySelector(
      'path[data-attachment-group-marker-state="selected"]',
    );

    expect(attachmentGroup.selected).toBe(true);
    expect(markerBackground?.getAttribute('fill')).toBe('#57ff8f');
    expect(markerBackground?.getAttribute('stroke')).toBe('none');
    expect(markerGlyph?.getAttribute('stroke')).toBe('#0097a8');

    attachmentGroup.setHover(true, render);

    const hoveredMarkerBackground = container.querySelector(
      'circle[data-attachment-group-marker-state="hovered"]',
    );
    expect(hoveredMarkerBackground?.getAttribute('stroke')).toBe('#0097a8');
  });

  it('renders a connected selected marker without an outline until it is hovered', () => {
    const { attachmentGroup, attachmentGroupId, container, render, restruct } =
      renderAttachmentGroup(true);

    restruct.setSelection({ attachmentGroups: [attachmentGroupId] });
    render.update(false);

    const markerElements = container.querySelectorAll(
      '[data-attachment-group-marker-state="connectedSelected"]',
    );
    const markerBackground = container.querySelector(
      'circle[data-attachment-group-marker-state="connectedSelected"]',
    );

    expect(markerElements).toHaveLength(3);
    expect(markerBackground?.getAttribute('fill')).toBe('#57ff8f');
    expect(markerBackground?.getAttribute('stroke')).toBe('none');

    attachmentGroup.setHover(true, render);

    const hoveredMarkerBackground = container.querySelector(
      'circle[data-attachment-group-marker-state="connectedHovered"]',
    );
    expect(hoveredMarkerBackground?.getAttribute('stroke')).toBe('#0097a8');
  });

  it('preserves the member atoms and bonds hover outline after selecting the marker', () => {
    const {
      atomIds,
      internalBondId,
      attachmentGroup,
      attachmentGroupId,
      container,
      render,
      restruct,
    } = renderPopulatedAttachmentGroup();
    const getGroupHoverOutlines = () =>
      Array.from(container.querySelectorAll('path')).filter(
        (path) =>
          !path.hasAttribute('data-attachment-group-marker-state') &&
          path.getAttribute('stroke') === '#0097a8',
      );

    attachmentGroup.setHover(true, render);
    expect(getGroupHoverOutlines()).toHaveLength(1);

    restruct.setSelection({
      attachmentGroups: [attachmentGroupId],
      atoms: atomIds,
      bonds: [internalBondId],
    });
    render.update(false);

    expect(getGroupHoverOutlines()).toHaveLength(1);
  });

  it('updates the marker and connected haptic bond while member atoms are moved', () => {
    const struct = new Struct();
    const memberAtomIds = [0, 2].map((x) =>
      struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(x, 1) })),
    );
    const connectedAtomId = struct.atoms.add(
      new Atom({ label: 'Fe', pp: new Vec2(4, 1) }),
    );
    const internalBondId = struct.bonds.add(
      new Bond({
        begin: memberAtomIds[0],
        end: memberAtomIds[1],
        type: Bond.PATTERN.TYPE.SINGLE,
      }),
    );
    const attachmentGroupId = struct.addAttachmentGroup(
      new AttachmentGroup({ atomIds: memberAtomIds }),
    );
    const hapticBondId = struct.bonds.add(
      new Bond({
        begin: attachmentGroupId,
        end: connectedAtomId,
        type: Bond.PATTERN.TYPE.HAPTIC,
      }),
    );
    const container = document.createElement('div');
    document.body.appendChild(container);
    const render = new Render(container, options);
    const restruct = new ReStruct(struct, render);
    render.ctab = restruct;
    render.update(true);

    fromMultipleMove(
      restruct,
      {
        atoms: memberAtomIds,
        attachmentGroups: [attachmentGroupId],
        bonds: [internalBondId],
      },
      new Vec2(1, 2),
    );
    render.update(false);

    expect(struct.attachmentGroups.get(attachmentGroupId)?.pp).toEqual(
      new Vec2(2, 3),
    );
    expect(struct.bonds.get(hapticBondId)?.center).toEqual(new Vec2(3, 2));
  });
});
