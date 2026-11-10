import { KetSerializer } from 'domain/serializers';
import {
  DEFAULT_SGROUP_BRACKET_TYPE,
  SGroup,
  SGroupBracketType,
} from 'domain/entities/sgroup';
import type { Struct } from 'domain/entities';

const ket = new KetSerializer();

const makeKet = (sgroup: Record<string, unknown>) =>
  JSON.stringify({
    root: { nodes: [{ $ref: 'mol0' }] },
    mol0: {
      type: 'molecule',
      atoms: [
        { label: 'C', location: [0, 0, 0] },
        { label: 'C', location: [1, 0, 0] },
      ],
      bonds: [{ type: 1, atoms: [0, 1] }],
      sgroups: [{ atoms: [0, 1], ...sgroup }],
    },
  });

const firstSGroup = (struct: Struct): SGroup =>
  struct.sgroups.values().next().value as SGroup;

const serializedSGroups = (struct: Struct) =>
  JSON.parse(ket.serialize(struct)).mol0.sgroups as Record<string, unknown>[];

describe('S-group bracket type', () => {
  it('round-trips a parenthetic bracket pair through KET', () => {
    const brackets = {
      opening: { type: 'parenthetic' },
      closing: { type: 'parenthetic' },
    };
    const struct = ket.deserialize(
      makeKet({ type: 'SRU', subscript: 'n', connectivity: 'HT', brackets }),
    );

    expect(firstSGroup(struct).data.bracketType).toBe(SGroupBracketType.Round);
    expect(serializedSGroups(struct)[0].brackets).toEqual(brackets);
    expect(serializedSGroups(struct)[0]).not.toHaveProperty('bracketType');
  });

  it('round-trips independent bracket positions in atom coordinates', () => {
    const brackets = {
      opening: {
        type: 'parenthetic',
        position: { start: { x: -1, y: 2 }, end: { x: -1, y: -3 } },
      },
      closing: {
        type: 'parenthetic',
        position: { start: { x: 4, y: -2 }, end: { x: 3, y: 5 } },
      },
    };
    const struct = ket.deserialize(
      makeKet({ type: 'SRU', subscript: 'n', connectivity: 'HT', brackets }),
    );

    expect(firstSGroup(struct).data.brackets?.opening.position).toEqual({
      start: { x: -1, y: -2 },
      end: { x: -1, y: 3 },
    });
    expect(serializedSGroups(struct)[0].brackets).toEqual(brackets);
  });

  it('drops stored bracket positions when scaling moves group atoms', () => {
    const brackets = {
      opening: {
        type: 'parenthetic',
        position: { start: { x: -1, y: -1 }, end: { x: -1, y: 1 } },
      },
      closing: {
        type: 'parenthetic',
        position: { start: { x: 2, y: -1 }, end: { x: 2, y: 1 } },
      },
    };
    const struct = ket.deserialize(
      makeKet({ type: 'SRU', subscript: 'n', connectivity: 'HT', brackets }),
    );

    struct.scale(2);

    expect(serializedSGroups(struct)[0].brackets).toEqual({
      opening: { type: 'parenthetic' },
      closing: { type: 'parenthetic' },
    });
    expect(JSON.parse(ket.serialize(struct)).mol0.atoms[1].location).toEqual([
      2, 0, 0,
    ]);
  });

  it('keeps positions when scaling moves only atoms outside the group', () => {
    const brackets = {
      opening: {
        position: { start: { x: -1, y: -1 }, end: { x: -1, y: 1 } },
      },
      closing: {
        type: 'square',
        position: { start: { x: 2, y: -1 }, end: { x: 2, y: 1 } },
      },
    };
    const struct = ket.deserialize(
      makeKet({
        type: 'SRU',
        atoms: [0],
        subscript: 'n',
        connectivity: 'HT',
        brackets,
      }),
    );

    struct.scale(2);

    expect(serializedSGroups(struct)[0].brackets).toEqual(brackets);
    expect(JSON.parse(ket.serialize(struct)).mol0.atoms[1].location).toEqual([
      2, 0, 0,
    ]);
  });

  it('drops stored positions when normalizing a longer bond', () => {
    const brackets = {
      opening: {
        type: 'curly',
        position: { start: { x: -1, y: -1 }, end: { x: -1, y: 1 } },
      },
      closing: {
        type: 'curly',
        position: { start: { x: 3, y: -1 }, end: { x: 3, y: 1 } },
      },
    };
    const source = JSON.parse(
      makeKet({ type: 'SRU', subscript: 'n', connectivity: 'HT', brackets }),
    );
    source.mol0.atoms[1].location = [2, 0, 0];
    const struct = ket.deserialize(JSON.stringify(source));

    struct.rescale();

    expect(serializedSGroups(struct)[0].brackets).toEqual({
      opening: { type: 'curly' },
      closing: { type: 'curly' },
    });
    expect(JSON.parse(ket.serialize(struct)).mol0.atoms[1].location).toEqual([
      1, 0, 0,
    ]);
  });

  it('preserves a zero-length pair during coordinate-system scaling', () => {
    const brackets = {
      opening: {
        type: 'parenthetic',
        position: { start: { x: -1, y: 1 }, end: { x: -1, y: 1 } },
      },
      closing: {
        type: 'parenthetic',
        position: { start: { x: 2, y: -1 }, end: { x: 2, y: 1 } },
      },
    };
    const struct = ket.deserialize(
      makeKet({ type: 'SRU', subscript: 'n', connectivity: 'HT', brackets }),
    );

    struct.scale(2, { scaleBracketPositions: true });

    expect(serializedSGroups(struct)[0].brackets).toEqual({
      opening: {
        type: 'parenthetic',
        position: { start: { x: -2, y: 2 }, end: { x: -2, y: 2 } },
      },
      closing: {
        type: 'parenthetic',
        position: { start: { x: 4, y: -2 }, end: { x: 4, y: 2 } },
      },
    });
    struct.scale(0.5, { scaleBracketPositions: true });
    expect(serializedSGroups(struct)[0].brackets).toEqual(brackets);
  });

  it.each([
    [
      'opening',
      { start: { x: 1, y: 1 }, end: { x: 1, y: 1 } },
      { start: { x: 3, y: 0 }, end: { x: 3, y: 1 } },
    ],
    [
      'closing',
      { start: { x: 2, y: 0 }, end: { x: 2, y: 1 } },
      { start: { x: 3, y: 3 }, end: { x: 3, y: 3 } },
    ],
    [
      'both',
      { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } },
      { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } },
    ],
  ])(
    'retains a zero-length %s position through unchanged KET round trips',
    (_side, opening, closing) => {
      const brackets = {
        opening: { position: opening },
        closing: { type: 'square', position: closing },
      };
      const struct = ket.deserialize(
        makeKet({ type: 'MUL', mul: 2, brackets }),
      );
      const saved = ket.serialize(struct);

      expect(JSON.parse(saved).mol0.sgroups[0].brackets).toEqual(brackets);
      expect(serializedSGroups(ket.deserialize(saved))[0].brackets).toEqual(
        brackets,
      );
    },
  );

  it('does not share bracket positions with a cloned S-group', () => {
    const position = {
      start: { x: -1, y: 2 },
      end: { x: -1, y: -3 },
    };
    const group = firstSGroup(
      ket.deserialize(
        makeKet({
          type: 'MUL',
          mul: 2,
          brackets: { opening: { position }, closing: { position } },
        }),
      ),
    );
    const clone = SGroup.clone(
      group,
      new Map([
        [0, 0],
        [1, 1],
      ]),
    );
    const clonedPosition = clone.data.brackets?.opening.position;
    if (!clonedPosition) {
      throw new Error('Expected the cloned S-group to retain its position');
    }

    clonedPosition.start.x = 10;

    expect(group.data.brackets?.opening.position?.start.x).toBe(-1);
    expect(clone.data.brackets?.closing.position?.start.x).toBe(-1);
  });

  it.each([
    [
      'only the opening position',
      {
        opening: { position: { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } } },
        closing: {},
      },
    ],
    [
      'only the closing position',
      {
        opening: {},
        closing: { position: { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } } },
      },
    ],
    [
      'a missing endpoint',
      {
        opening: { position: { start: { x: 0, y: 0 } } },
        closing: { position: { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } } },
      },
    ],
    [
      'a missing coordinate',
      {
        opening: { position: { start: { x: 0 }, end: { x: 0, y: 1 } } },
        closing: { position: { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } } },
      },
    ],
    [
      'a non-numeric coordinate',
      {
        opening: { position: { start: { x: '0', y: 0 }, end: { x: 0, y: 1 } } },
        closing: { position: { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } } },
      },
    ],
    [
      'an unexpected point property',
      {
        opening: {
          position: { start: { x: 0, y: 0, z: 0 }, end: { x: 0, y: 1 } },
        },
        closing: { position: { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } } },
      },
    ],
    [
      'an unexpected position property',
      {
        opening: {
          position: { start: { x: 0, y: 0 }, end: { x: 0, y: 1 }, extra: true },
        },
        closing: { position: { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } } },
      },
    ],
  ])('rejects %s as invalid KET', (_description, brackets) => {
    expect(() =>
      ket.deserialize(makeKet({ type: 'MUL', mul: 2, brackets })),
    ).toThrow('Cannot deserialize input JSON.');
  });

  it.each([
    ['empty pair', {}],
    ['missing opening', { closing: {} }],
    ['missing closing', { opening: {} }],
    ['third branch', { opening: {}, closing: {}, branch: {} }],
    ['unexpected third bracket', { opening: {}, closing: {}, middle: {} }],
    ['unexpected bracket property', { opening: { extra: true }, closing: {} }],
    ['unsupported type', { opening: { type: 'angle' }, closing: {} }],
    ['numeric type', { opening: { type: 1 }, closing: {} }],
    ['null type', { opening: { type: null }, closing: {} }],
    ['object type', { opening: { type: {} }, closing: {} }],
    ['array type', { opening: { type: [] }, closing: {} }],
  ])(
    'rejects %s through the runtime KET serializer',
    (_description, brackets) => {
      expect(() =>
        ket.deserialize(makeKet({ type: 'MUL', mul: 2, brackets })),
      ).toThrow('Cannot deserialize input JSON.');
    },
  );

  it.each([
    [{}, { type: 'parenthetic' }],
    [{ type: 'parenthetic' }, {}],
    [{ type: 'square' }, { type: 'curly' }],
    [{ type: 'curly' }, { type: 'square' }],
    [{ type: 'parenthetic' }, { type: 'curly' }],
    [{ type: 'curly' }, { type: 'parenthetic' }],
  ])(
    'rejects different effective opening and closing types: %o / %o',
    (opening, closing) => {
      expect(() =>
        ket.deserialize(
          makeKet({ type: 'MUL', mul: 2, brackets: { opening, closing } }),
        ),
      ).toThrow('Cannot deserialize input JSON.');
    },
  );

  it.each([
    [{}, { type: 'square' }],
    [{ type: 'square' }, {}],
  ])(
    'accepts omitted and explicit square as the same type',
    (opening, closing) => {
      const struct = ket.deserialize(
        makeKet({ type: 'MUL', mul: 2, brackets: { opening, closing } }),
      );
      expect(firstSGroup(struct).data.bracketType).toBe(
        SGroupBracketType.Square,
      );
      expect(serializedSGroups(struct)[0].brackets).toEqual({
        opening,
        closing,
      });
    },
  );

  it('should default new S-groups to square brackets', () => {
    expect(new SGroup(SGroup.TYPES.SRU).data.bracketType).toBe(
      SGroupBracketType.Square,
    );
    expect(DEFAULT_SGROUP_BRACKET_TYPE).toBe(SGroupBracketType.Square);
  });

  it('should keep the bracket type when an S-group is cloned', () => {
    const sgroup = new SGroup(SGroup.TYPES.MUL);
    sgroup.data.bracketType = SGroupBracketType.Curly;

    expect(SGroup.clone(sgroup, new Map()).data.bracketType).toBe(
      SGroupBracketType.Curly,
    );
  });

  it.each([
    [{ type: 'SRU', subscript: 'n', connectivity: 'HT' }],
    [{ type: 'MUL', mul: 2 }],
    [{ type: 'SUP', name: 'X' }],
    [{ type: 'COP', subtype: 'RAN', connectivity: 'HT' }],
    [{ type: 'queryComponent' }],
    [{ type: 'SUP', name: '', expanded: true, class: 'PHOSPHATE' }],
  ])(
    'should preserve every supported bracket type in a KET round trip for %o',
    (sgroup) => {
      [
        { bracketType: SGroupBracketType.Square, ketType: 'square' },
        { bracketType: SGroupBracketType.Round, ketType: 'parenthetic' },
        { bracketType: SGroupBracketType.Curly, ketType: 'curly' },
      ].forEach(({ bracketType, ketType }) => {
        const brackets = {
          opening: { type: ketType },
          closing: { type: ketType },
        };
        const struct = ket.deserialize(makeKet({ ...sgroup, brackets }));

        expect(firstSGroup(struct).data.bracketType).toBe(bracketType);
        expect(serializedSGroups(struct)[0].brackets).toEqual(brackets);
        expect(serializedSGroups(struct)[0]).not.toHaveProperty('bracketType');
      });
    },
  );

  it('round-trips mixed Query, Copolymer, and Nucleotide Component styles without changing chemistry', () => {
    const input = JSON.parse(makeKet({ type: 'MUL', mul: 2 }));
    input.mol0.atoms = [
      { label: 'C', location: [0, 0, 0] },
      { label: 'N', location: [1, 0, 0] },
    ];
    input.mol0.bonds = [{ type: 2, atoms: [0, 1] }];
    input.mol0.sgroups = [
      {
        type: 'queryComponent',
        atoms: [0, 1],
        brackets: { opening: { type: 'curly' }, closing: { type: 'curly' } },
      },
      {
        type: 'COP',
        atoms: [0, 1],
        subtype: 'RAN',
        connectivity: 'HT',
        brackets: {
          opening: { type: 'parenthetic' },
          closing: { type: 'parenthetic' },
        },
      },
      {
        type: 'SUP',
        atoms: [0, 1],
        name: '',
        expanded: true,
        class: 'PHOSPHATE',
        brackets: { opening: { type: 'curly' }, closing: { type: 'curly' } },
      },
    ];

    const serialized = JSON.parse(
      ket.serialize(ket.deserialize(JSON.stringify(input))),
    );
    expect(serialized.mol0.atoms).toEqual(input.mol0.atoms);
    expect(serialized.mol0.bonds).toEqual(input.mol0.bonds);
    expect(serialized.mol0.sgroups).toEqual(
      expect.arrayContaining(
        input.mol0.sgroups.map((sgroup: Record<string, unknown>) =>
          expect.objectContaining(sgroup),
        ),
      ),
    );
    expect(serialized.mol0.sgroups).toHaveLength(3);

    const reloaded = ket.deserialize(JSON.stringify(serialized));
    expect(JSON.parse(ket.serialize(reloaded))).toEqual(serialized);
  });

  it('should read a KET S-group without bracketType as square', () => {
    const struct = ket.deserialize(
      makeKet({ type: 'SRU', subscript: 'n', connectivity: 'HT' }),
    );

    expect(firstSGroup(struct).data.bracketType).toBe(SGroupBracketType.Square);
  });

  it('should accept explicit square and omit it on save', () => {
    const struct = ket.deserialize(
      makeKet({ type: 'MUL', mul: 2, bracketType: 'square' }),
    );

    expect(firstSGroup(struct).data.bracketType).toBe(SGroupBracketType.Square);
    expect(serializedSGroups(struct)[0]).not.toHaveProperty('bracketType');
  });

  it.each([
    ['round', 'parenthetic'],
    ['curly', 'curly'],
  ])('migrates the provisional %s style to a %s pair', (legacy, type) => {
    const struct = ket.deserialize(
      makeKet({ type: 'MUL', mul: 2, bracketType: legacy }),
    );

    expect(serializedSGroups(struct)[0]).toMatchObject({
      brackets: { opening: { type }, closing: { type } },
    });
    expect(serializedSGroups(struct)[0]).not.toHaveProperty('bracketType');
  });

  it('prefers the new pair over the provisional style', () => {
    const brackets = {
      opening: { type: 'curly' },
      closing: { type: 'curly' },
    };
    const struct = ket.deserialize(
      makeKet({ type: 'MUL', mul: 2, bracketType: 'round', brackets }),
    );

    expect(firstSGroup(struct).data.bracketType).toBe(SGroupBracketType.Curly);
    expect(serializedSGroups(struct)[0].brackets).toEqual(brackets);
    expect(serializedSGroups(struct)[0]).not.toHaveProperty('bracketType');
  });

  it('should never write brackets for Data S-groups', () => {
    const struct = ket.deserialize(
      makeKet({
        type: 'DAT',
        fieldName: 'name',
        fieldData: 'value',
      }),
    );
    firstSGroup(struct).data.bracketType = SGroupBracketType.Round;

    expect(serializedSGroups(struct)[0]).not.toHaveProperty('bracketType');
    expect(serializedSGroups(struct)[0]).not.toHaveProperty('brackets');
  });

  it.each(['angle', 0, null, {}, [], true])(
    'reports invalid KET when bracketType is %p',
    (bracketType) => {
      expect(() =>
        ket.deserialize(makeKet({ type: 'MUL', mul: 2, bracketType })),
      ).toThrow('Cannot deserialize input JSON.');
    },
  );
});
