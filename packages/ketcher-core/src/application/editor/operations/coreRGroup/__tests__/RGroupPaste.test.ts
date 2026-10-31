import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { KetSerializer } from 'domain/serializers/ket/ketSerializer';
import { MacromoleculesConverter } from 'application/editor/MacromoleculesConverter';
import * as editorSingleton from 'application/editor/editorSingleton';
import type { CoreEditor } from 'application/editor/Editor';
import type { RenderersManager } from 'application/render/renderers/RenderersManager';
import type { RGroupProperties } from '../RGroupPropertiesOperation';
import { getRGroupDefinitions } from 'domain/helpers/rGroupDefinitions';
import { Struct } from 'domain/entities/struct';

function definition(
  id: number,
  properties: RGroupProperties,
): DrawingEntitiesManager {
  const struct = new KetSerializer().deserializeMicromolecules(
    JSON.stringify({
      root: { nodes: [{ $ref: `rg${id}` }], connections: [], templates: [] },
      [`rg${id}`]: {
        type: 'rgroup',
        rlogic: { number: id, ...properties },
        atoms: [
          { label: 'C', location: [0, 0, 0] },
          { label: 'O', location: [1, 0, 0] },
        ],
        bonds: [{ type: 1, atoms: [0, 1] }],
      },
    }),
  );
  const manager = new DrawingEntitiesManager();
  MacromoleculesConverter.convertStructToDrawingEntities(struct, manager);
  return manager;
}

function propertiesOf(manager: DrawingEntitiesManager, id: number) {
  return [
    manager.micromoleculesHiddenEntities.rgroups.get(id),
    ...[...manager.monomers.values()].map((monomer) =>
      monomer.monomerItem.struct.rgroups.get(id),
    ),
  ]
    .filter((group) => group !== undefined)
    .map(({ range, resth, ifthen }) => ({ range, resth, ifthen }));
}

describe('pasting R-group definitions', () => {
  const renderers = new Proxy({}, { get: () => jest.fn() }) as RenderersManager;
  beforeEach(() => {
    jest.spyOn(editorSingleton, 'provideEditorInstance').mockReturnValue({
      viewModel: { initialize: jest.fn() },
    } as unknown as CoreEditor);
  });
  afterEach(() => jest.restoreAllMocks());

  it.each([
    [
      { range: '2-3', resth: false, ifthen: 0 },
      { range: '1', resth: true, ifthen: 2 },
    ],
    [
      { range: '2-3', resth: true, ifthen: 2 },
      { range: '', resth: false, ifthen: 0 },
    ],
  ])(
    'merges fragments and overwrites all logic, with undo/redo',
    (oldProperties, pastedProperties) => {
      const target = definition(1, oldProperties);
      const source = definition(1, pastedProperties);
      const { command } = source.mergeInto(target);
      expect(target.atoms.size).toBe(4);
      expect(
        getRGroupDefinitions(target.atoms.values(), target.bonds.values()).get(
          1,
        )?.atoms,
      ).toHaveLength(4);
      expect(propertiesOf(target, 1)).toEqual(expect.arrayOf(pastedProperties));
      const roundTrip = new Struct();
      MacromoleculesConverter.convertDrawingEntitiesToStruct(
        target,
        roundTrip,
        undefined,
        true,
      );
      expect(roundTrip.atoms.size).toBe(4);
      expect(roundTrip.rgroups.get(1)).toMatchObject(pastedProperties);
      command.invert(renderers);
      expect(target.atoms.size).toBe(2);
      expect(propertiesOf(target, 1)).toEqual(expect.arrayOf(oldProperties));
      command.execute(renderers);
      expect(target.atoms.size).toBe(4);
      expect(propertiesOf(target, 1)).toEqual(expect.arrayOf(pastedProperties));
    },
  );

  it('does not replace logic when the incoming group has no definition fragments', () => {
    const original = { range: '2-3', resth: true, ifthen: 2 };
    const target = definition(1, original);
    const source = definition(1, { range: '', resth: false, ifthen: 0 });
    source.monomers.forEach((monomer) => {
      monomer.monomerItem.struct.rgroups.get(1)!.frags.clear();
    });
    source.mergeInto(target);
    expect(
      target.monomers.values().next().value!.monomerItem.struct.rgroups.get(1),
    ).toMatchObject(original);
    expect(target.micromoleculesHiddenEntities.rgroups.get(1)).toMatchObject(
      original,
    );
  });

  it('preserves definitions with other numbers', () => {
    const original = { range: '2-3', resth: true, ifthen: 0 };
    const incoming = { range: '1', resth: false, ifthen: 0 };
    const target = definition(1, original);
    definition(2, incoming).mergeInto(target);
    expect(propertiesOf(target, 1)).toEqual(expect.arrayOf(original));
    expect(propertiesOf(target, 2)).toEqual(expect.arrayOf(incoming));
  });
});
