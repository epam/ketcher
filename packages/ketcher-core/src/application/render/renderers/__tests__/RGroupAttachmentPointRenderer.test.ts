import { RenderersManager } from '../RenderersManager';
import { AtomRenderer } from '../AtomRenderer';
import { getRGroupAttachmentPointDirection } from '../rGroupAttachmentPointGeometry';
import { Atom } from 'domain/entities/CoreAtom';
import { Atom as StructAtom } from 'domain/entities/atom';
import { Bond, BondType } from 'domain/entities/CoreBond';
import { RGroupAttachmentPoint } from 'domain/entities/rgroupAttachmentPoint';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';
import { AtomLabel } from 'domain/constants';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import * as editorSingleton from 'application/editor/editorSingleton';
import type { CoreEditor } from 'application/editor/Editor';
import { KetSerializer } from 'domain/serializers/ket/ketSerializer';
import { MacromoleculesConverter } from 'application/editor/MacromoleculesConverter';
import { AtomDeleteOperation } from 'application/editor/operations/coreAtom/atom';
import { MonomerToAtomBond } from 'domain/entities/MonomerToAtomBond';

function atom(type: 'primary' | 'secondary') {
  const struct = new Struct();
  const source = new StructAtom({ label: 'C', pp: new Vec2() });
  const id = struct.atoms.add(source);
  const point = new RGroupAttachmentPoint(id, type);
  struct.rgroupAttachmentPoints.add(point);
  return new Atom(
    source.pp,
    { monomerItem: { struct } } as BaseMonomer,
    id,
    AtomLabel.C,
  );
}

describe('R-group attachment points in macro mode', () => {
  let manager: RenderersManager;
  beforeEach(() => {
    document.body.innerHTML =
      '<svg id="polymer-editor-canvas"><g class="drawn-structures"></g></svg>';
    Object.defineProperty(SVGElement.prototype, 'getBBox', {
      configurable: true,
      value: () => ({ x: -12, y: -40, width: 24, height: 40 }),
    });
    manager = new RenderersManager({ theme: {} });
  });
  afterEach(() => {
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it.each(['primary', 'secondary'] as const)(
    'hides carbon labels at a %s point while retaining other element labels',
    (type) => {
      jest.spyOn(editorSingleton, 'provideEditorInstance').mockReturnValue({
        viewModel: { atomsToHalfEdges: new Map() },
      } as unknown as CoreEditor);
      const carbon = atom(type);
      const renderer = new AtomRenderer(carbon);
      expect(renderer.isLabelVisible).toBe(false);
      carbon.label = AtomLabel.N;
      expect(renderer.isLabelVisible).toBe(true);
      carbon.label = AtomLabel.O;
      expect(renderer.isLabelVisible).toBe(true);
      carbon.label = AtomLabel.C;
      carbon.monomer.monomerItem.struct.rgroupAttachmentPoints.clear();
      expect(renderer.isLabelVisible).toBe(true);
    },
  );

  it('numbers all points only while a secondary point is present anywhere on the canvas', () => {
    const primary = atom('primary');
    const secondary = atom('secondary');
    manager.atoms.set(primary.id, new AtomRenderer(primary));
    manager.rerenderRGroupAttachmentPoints();
    expect(
      document.querySelectorAll('[data-testid="attachment-point"]'),
    ).toHaveLength(1);
    expect(
      document.querySelectorAll('[data-testid="attachment-point"] text'),
    ).toHaveLength(0);
    manager.atoms.set(secondary.id, new AtomRenderer(secondary));
    manager.rerenderRGroupAttachmentPoints();
    expect(
      [
        ...document.querySelectorAll('[data-testid="attachment-point"] text'),
      ].map((node) => node.textContent),
    ).toEqual(['1', '2']);
    manager.atoms.delete(secondary.id);
    manager.rerenderRGroupAttachmentPoints();
    expect(
      document.querySelectorAll('[data-testid="attachment-point"]'),
    ).toHaveLength(1);
    expect(
      document.querySelectorAll('[data-testid="attachment-point"] text'),
    ).toHaveLength(0);
    manager.clearRGroups();
    expect(
      document.querySelectorAll('[data-testid="attachment-point"]'),
    ).toHaveLength(0);
  });

  it('separates two points on the same atom and selects/moves the attached atom with undo', () => {
    const attached = atom('primary');
    attached.monomer.monomerItem.struct.rgroupAttachmentPoints.add(
      new RGroupAttachmentPoint(0, 'secondary'),
    );
    manager.atoms.set(attached.id, new AtomRenderer(attached));
    manager.rerenderRGroupAttachmentPoints();
    const points = [...manager.rgroupAttachmentPoints.values()];
    expect(points).toHaveLength(2);
    expect(points[0].endPoint.x).not.toBeCloseTo(points[1].endPoint.x);
    const model = new DrawingEntitiesManager();
    model.atoms.set(attached.id, attached);
    jest.spyOn(editorSingleton, 'provideEditorInstance').mockReturnValue({
      mode: { modeName: 'flex-layout-mode' },
    } as CoreEditor);
    model.getAllSelectedEntitiesForSingleEntity(points[0].attachmentPoint);
    expect(model.selectedEntitiesArr).toEqual([attached]);
    const before = points[0].endPoint;
    const movement = model.moveSelectedDrawingEntities(new Vec2(2, 1));
    movement.operations.forEach((operation) =>
      operation.execute(undefined as never),
    );
    manager.rerenderRGroupAttachmentPoints();
    expect(points[0].endPoint.sub(before)).toEqual(new Vec2(80, 40));
    movement.operations.forEach((operation) =>
      operation.invert(undefined as never),
    );
    expect(attached.position).toEqual(new Vec2());
    expect(
      attached.monomer.monomerItem.struct.rgroupAttachmentPoints.size,
    ).toBe(2);
  });

  it('uses the same one-bond and triple-bond directions as molecules mode', () => {
    const first = atom('primary');
    const second = atom('primary');
    second.moveAbsolute(new Vec2(1, 0));
    const bond = new Bond(first, second, 0);
    first.addBond(bond);
    const single = getRGroupAttachmentPointDirection(first, 'primary', false);
    expect(single.x).toBeCloseTo(-0.5);
    expect(single.y).toBeCloseTo(Math.sqrt(3) / 2);
    bond.type = BondType.Triple;
    expect(
      getRGroupAttachmentPointDirection(first, 'primary', false).x,
    ).toBeCloseTo(-1);
    second.moveAbsolute(new Vec2(0, 1));
    expect(
      getRGroupAttachmentPointDirection(first, 'primary', false).y,
    ).toBeCloseTo(-1);
  });

  it('includes a bond to a monomer when choosing the free AP direction', () => {
    const attached = atom('primary');
    const monomer = { position: new Vec2(0, -1) } as BaseMonomer;
    attached.addBond(new MonomerToAtomBond(monomer, attached));
    const direction = getRGroupAttachmentPointDirection(
      attached,
      'primary',
      false,
    );
    expect(direction.x).toBeCloseTo(Math.sqrt(3) / 2);
    expect(direction.y).toBeCloseTo(0.5);
  });

  it.each(['rectangle', 'lasso'])(
    'selects a point by its visible endpoint with %s',
    (tool) => {
      const attached = atom('primary');
      manager.atoms.set(attached.id, new AtomRenderer(attached));
      manager.rerenderRGroupAttachmentPoints();
      const renderer = [...manager.rgroupAttachmentPoints.values()][0];
      const model = new DrawingEntitiesManager();
      model.atoms.set(attached.id, attached);
      jest.spyOn(editorSingleton, 'provideEditorInstance').mockReturnValue({
        mode: { modeName: 'flex-layout-mode' },
        renderersContainer: manager,
      } as CoreEditor);
      const position = renderer.endPoint;
      if (tool === 'rectangle') {
        model.selectIfLocatedInRectangle(
          position.sub(new Vec2(2, 2)),
          position.add(new Vec2(2, 2)),
          [],
        );
      } else {
        model.selectIfLocatedInPolygon(
          [
            position.add(new Vec2(-2, -2)),
            position.add(new Vec2(2, -2)),
            position.add(new Vec2(2, 2)),
            position.add(new Vec2(-2, 2)),
          ],
          [],
        );
      }
      expect(model.selectedEntitiesArr).toEqual([attached]);
      renderer.drawSelection();
      const root = document.querySelector('[data-testid="attachment-point"]');
      expect(root?.querySelector('rect')?.getAttribute('fill')).toBe('#57FF8F');
      renderer.attachmentPoint.turnOnHover();
      renderer.redrawHover();
      expect(root?.querySelector('rect')?.getAttribute('stroke')).toBe(
        '#0097a8',
      );
      model.selectIfLocatedInRectangle(
        new Vec2(100, 100),
        new Vec2(110, 110),
        [],
      );
      expect(model.selectedEntitiesArr).toHaveLength(0);
    },
  );

  it('preserves point-to-atom membership without duplicates on a mode round trip', () => {
    const source = new KetSerializer().deserializeMicromolecules(
      JSON.stringify({
        root: { nodes: [{ $ref: 'mol0' }], connections: [], templates: [] },
        mol0: {
          type: 'molecule',
          atoms: [
            { label: 'C', location: [0, 0, 0], attachmentPoints: 1 },
            { label: 'N', location: [2, 0, 0], attachmentPoints: 2 },
          ],
          bonds: [],
        },
      }),
    );
    const model = new DrawingEntitiesManager();
    MacromoleculesConverter.convertStructToDrawingEntities(source, model);
    expect(model.micromoleculesHiddenEntities.rgroupAttachmentPoints.size).toBe(
      0,
    );
    const restored = new Struct();
    MacromoleculesConverter.convertDrawingEntitiesToStruct(
      model,
      restored,
      undefined,
      true,
    );
    expect(restored.rgroupAttachmentPoints.size).toBe(2);
    expect(
      [...restored.rgroupAttachmentPoints.values()].map((point) => [
        point.type,
        restored.atoms.get(point.atomId)?.label,
      ]),
    ).toEqual([
      ['primary', 'C'],
      ['secondary', 'N'],
    ]);
  });

  it('removes point metadata with its atom and restores it on undo', () => {
    const attached = atom('secondary');
    const struct = attached.monomer.monomerItem.struct;
    const point = struct.rgroupAttachmentPoints.get(0);
    const operation = new AtomDeleteOperation(
      attached,
      jest.fn(),
      () => attached,
    );
    operation.execute();
    expect(struct.rgroupAttachmentPoints.size).toBe(0);
    operation.invert();
    expect(struct.rgroupAttachmentPoints.get(0)).toBe(point);
    expect(struct.atoms.get(0)).toBeDefined();
  });
});
