import { monomerFactory } from 'application/editor/operations/monomer/monomerFactory';
import { KetSerializer } from 'domain/serializers';

// polymerBondToDrawingEntity runs inside KetSerializer.deserializeToDrawingEntities.
// The error callback is read only when a bond cannot be created; it reaches
// the editor through the KetSerializer editor bridge.
const NO_FREE_ATTACHMENT_POINT_MESSAGE =
  'There is no free attachment point for bond creation.';

// Alanine with a left (R1) and a right (R2) attachment point.
const peptideTemplate = {
  type: 'monomerTemplate',
  atoms: [
    { label: 'N', location: [-0.866, -0.25, 0] },
    { label: 'C', location: [0, 0.25, 0], stereoLabel: 'abs' },
    { label: 'H', location: [-1.732, 0.25, 0] },
    { label: 'C', location: [0.866, -0.25, 0] },
    { label: 'O', location: [1.732, 0.25, 0] },
    { label: 'O', location: [0.866, -1.25, 0] },
    { label: 'C', location: [0, 1.25, 0] },
  ],
  bonds: [
    { type: 1, atoms: [0, 1] },
    { type: 1, atoms: [0, 2] },
    { type: 1, atoms: [1, 3] },
    { type: 1, atoms: [3, 4] },
    { type: 2, atoms: [3, 5] },
    { type: 1, atoms: [1, 6], stereo: 1 },
  ],
  class: 'AminoAcid',
  classHELM: 'PEPTIDE',
  id: 'A___Alanine',
  fullName: 'Alanine',
  alias: 'A',
  aliasHELM: 'A',
  aliasBILN: 'A',
  attachmentPoints: [
    { attachmentAtom: 0, leavingGroup: { atoms: [2] }, type: 'left' },
    { attachmentAtom: 3, leavingGroup: { atoms: [4] }, type: 'right' },
  ],
  naturalAnalogShort: 'A',
  modificationTypes: ['Natural amino acid'],
};

type Endpoint = { monomerId: string; attachmentPointId: string };

const createKet = (connections: Array<[Endpoint, Endpoint]>) =>
  JSON.stringify({
    root: {
      nodes: ['monomer0', 'monomer1', 'monomer2'].map(($ref) => ({ $ref })),
      connections: connections.map(([endpoint1, endpoint2]) => ({
        connectionType: 'single',
        endpoint1,
        endpoint2,
      })),
      templates: [{ $ref: 'monomerTemplate-A___Alanine' }],
    },
    ...Object.fromEntries(
      [0, 1, 2].map((index) => [
        `monomer${index}`,
        {
          type: 'monomer',
          id: String(index),
          position: { x: index * 2, y: -1 },
          alias: 'A',
          templateId: 'A___Alanine',
        },
      ]),
    ),
    'monomerTemplate-A___Alanine': peptideTemplate,
  });

const endpoint = (index: number, attachmentPointId: string): Endpoint => ({
  monomerId: `monomer${index}`,
  attachmentPointId,
});

describe('polymerBondToDrawingEntity through KetSerializer.deserializeToDrawingEntities', () => {
  const errorDispatch = jest.fn();

  beforeAll(() => {
    KetSerializer.setMonomerFactory(monomerFactory);
    KetSerializer.setEditorBridge({
      reportError: errorDispatch,
      getMonomersLibraryJson: () => undefined,
    });
  });

  beforeEach(() => {
    errorDispatch.mockClear();
  });

  const deserialize = (connections: Array<[Endpoint, Endpoint]>) => {
    const result = new KetSerializer().deserializeToDrawingEntities(
      createKet(connections),
    );

    if (!result) {
      throw new Error('Fixture setup failed: the KET did not deserialize');
    }

    return result.drawingEntitiesManager;
  };

  it('creates the bond for a valid connection and reports no error', () => {
    const drawingEntitiesManager = deserialize([
      [endpoint(0, 'R2'), endpoint(1, 'R1')],
    ]);

    expect(drawingEntitiesManager.monomers.size).toBe(3);
    expect(drawingEntitiesManager.polymerBonds.size).toBe(1);
    expect(errorDispatch).not.toHaveBeenCalled();
  });

  it('creates every bond of a chain whose connections use different attachment points', () => {
    const drawingEntitiesManager = deserialize([
      [endpoint(0, 'R2'), endpoint(1, 'R1')],
      [endpoint(1, 'R2'), endpoint(2, 'R1')],
    ]);

    expect(drawingEntitiesManager.polymerBonds.size).toBe(2);
    expect(errorDispatch).not.toHaveBeenCalled();
  });

  it('reports once and creates no bond for a connection whose attachment point is already taken', () => {
    const drawingEntitiesManager = deserialize([
      [endpoint(0, 'R2'), endpoint(1, 'R1')],
      [endpoint(0, 'R2'), endpoint(2, 'R1')],
    ]);

    expect(drawingEntitiesManager.polymerBonds.size).toBe(1);
    expect(errorDispatch).toHaveBeenCalledTimes(1);
    expect(errorDispatch).toHaveBeenCalledWith(
      NO_FREE_ATTACHMENT_POINT_MESSAGE,
    );
  });

  it('reports once and creates no bond for a connection whose attachment point does not exist', () => {
    // Alanine has R1 and R2 only.
    const drawingEntitiesManager = deserialize([
      [endpoint(0, 'R3'), endpoint(1, 'R1')],
    ]);

    expect(drawingEntitiesManager.polymerBonds.size).toBe(0);
    expect(errorDispatch).toHaveBeenCalledTimes(1);
    expect(errorDispatch).toHaveBeenCalledWith(
      NO_FREE_ATTACHMENT_POINT_MESSAGE,
    );
  });

  it('keeps the valid bonds when another connection is rejected', () => {
    const drawingEntitiesManager = deserialize([
      [endpoint(0, 'R2'), endpoint(1, 'R1')],
      [endpoint(0, 'R2'), endpoint(2, 'R1')],
      [endpoint(1, 'R2'), endpoint(2, 'R1')],
    ]);

    expect(drawingEntitiesManager.polymerBonds.size).toBe(2);
    expect(errorDispatch).toHaveBeenCalledTimes(1);
  });
});
