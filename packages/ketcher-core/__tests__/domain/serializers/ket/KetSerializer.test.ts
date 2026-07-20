import * as moleculeToKet from 'domain/serializers/ket/toKet/moleculeToKet';
import * as moleculeToStruct from 'domain/serializers/ket/fromKet/moleculeToStruct';
import * as prepareStructForKet from 'domain/serializers/ket/toKet/prepare';
import * as rgroupToKet from 'domain/serializers/ket/toKet/rgroupToKet';
import * as rgroupToStruct from 'domain/serializers/ket/fromKet/rgroupToStruct';
import * as rxnToKet from 'domain/serializers/ket/toKet/rxnToKet';
import * as rxnToStruct from 'domain/serializers/ket/fromKet/rxnToStruct';
import * as simpleObjectToStruct from 'domain/serializers/ket/fromKet/simpleObjectToStruct';
import * as textToStruct from 'domain/serializers/ket/fromKet/textToStruct';
import * as validate from 'domain/serializers/ket/validate';

import {
  Atom,
  AtomList,
  Bond,
  RGroup,
  RxnArrow,
  RxnPlus,
  SimpleObject,
  Struct,
  Text,
  Vec2,
} from 'domain/entities';
import {
  contentRgroupStruct,
  moleculeContentStruct,
  moleculeSgroupStruct,
  prepareStruct,
} from './fixtures/toKet';
import {
  errorKet,
  moleculeKet,
  moleculeRgroupKet,
  moleculeSgroupKet,
  preparedKet,
  rxnKet,
  simpleObjectKet,
  textKet,
  withoutHeaderKet,
} from './fixtures/toStruct';

import { KetSerializer } from 'domain/serializers';
import {
  createPolymerEditorCanvas,
  createRenderersManager,
} from '../../../helpers/dom';
import { CoreEditor } from 'application/editor';

const ket = new KetSerializer();

type KetMoleculeForTest = {
  type?: string;
  atoms?: Array<{ label?: string }>;
};

const hapticAtomAtomKet = JSON.stringify({
  ket_version: '2.0.0',
  root: {
    nodes: [{ $ref: 'mol0' }, { $ref: 'mol1' }],
    connections: [
      {
        type: 'haptic',
        endpoint1: { atomId: '0', moleculeId: 'mol0' },
        endpoint2: { atomId: '0', moleculeId: 'mol1' },
      },
    ],
    templates: [],
  },
  mol0: {
    type: 'molecule',
    atoms: [{ label: 'Fe', location: [3.38, -5.45, 0] }],
    bonds: [],
  },
  mol1: {
    type: 'molecule',
    atoms: [{ label: 'C', location: [3.38, -5.45, 0] }],
    bonds: [],
  },
});

const hapticSapAtomKet = JSON.stringify({
  ket_version: '2.0.0',
  root: {
    nodes: [{ $ref: 'mol0' }, { $ref: 'mol1' }],
    connections: [
      {
        type: 'haptic',
        endpoint1: { atomId: '0', moleculeId: 'mol0' },
        endpoint2: { attachmentGroupId: '0', moleculeId: 'mol1' },
      },
    ],
    templates: [],
  },
  mol0: {
    type: 'molecule',
    atoms: [{ label: 'Fe', location: [3.38, -5.45, 0] }],
    bonds: [],
  },
  mol1: {
    type: 'molecule',
    atoms: [
      { label: 'C', location: [3.38, -5.45, 0] },
      { label: 'C', location: [3.38, -6.45, 0] },
      { label: 'C', location: [4.25, -6.95, 0] },
      { label: 'C', location: [5.12, -6.45, 0] },
      { label: 'C', location: [5.12, -5.45, 0] },
      { label: 'C', location: [4.25, -4.95, 0] },
    ],
    bonds: [
      { type: 1, atoms: [5, 0] },
      { type: 1, atoms: [0, 1] },
      { type: 1, atoms: [1, 2] },
      { type: 1, atoms: [2, 3] },
      { type: 1, atoms: [3, 4] },
      { type: 1, atoms: [4, 5] },
    ],
    attachmentGroups: [{ id: '0', atoms: [0, 1, 2, 3, 4, 5] }],
  },
});

const attachmentGroupOnlyKet = JSON.stringify({
  ket_version: '2.0.0',
  root: {
    nodes: [{ $ref: 'mol0' }],
    connections: [],
    templates: [],
  },
  mol0: {
    type: 'molecule',
    atoms: [
      { label: 'C', location: [0, 0, 0] },
      { label: 'C', location: [1, 0, 0] },
    ],
    bonds: [{ type: 1, atoms: [0, 1] }],
    attachmentGroups: [{ id: '0', atoms: [0, 1] }],
  },
});

const sharedAttachmentGroupKet = JSON.stringify({
  ket_version: '2.0.0',
  root: {
    nodes: [{ $ref: 'mol0' }, { $ref: 'mol1' }, { $ref: 'mol2' }],
    connections: [
      {
        type: 'haptic',
        endpoint1: { atomId: '0', moleculeId: 'mol0' },
        endpoint2: { attachmentGroupId: '0', moleculeId: 'mol1' },
      },
      {
        type: 'haptic',
        endpoint1: { atomId: '0', moleculeId: 'mol2' },
        endpoint2: { attachmentGroupId: '0', moleculeId: 'mol1' },
      },
    ],
    templates: [],
  },
  mol0: {
    type: 'molecule',
    atoms: [{ label: 'Fe', location: [-1, 0, 0] }],
    bonds: [],
  },
  mol1: {
    type: 'molecule',
    atoms: [
      { label: 'C', location: [0, 0, 0] },
      { label: 'C', location: [1, 0, 0] },
    ],
    bonds: [{ type: 1, atoms: [0, 1] }],
    attachmentGroups: [{ id: '0', atoms: [0, 1] }],
  },
  mol2: {
    type: 'molecule',
    atoms: [{ label: 'Fe', location: [2, 0, 0] }],
    bonds: [],
  },
});

function createHapticAtomAtomStruct() {
  const struct = new Struct();
  const feAtomId = struct.atoms.add(
    new Atom({ label: 'Fe', pp: new Vec2(0, 0) }),
  );
  const carbonAtomId = struct.atoms.add(
    new Atom({ label: 'C', pp: new Vec2(1, 0) }),
  );

  struct.bonds.add(
    new Bond({
      type: Bond.PATTERN.TYPE.HAPTIC,
      begin: feAtomId,
      end: carbonAtomId,
    }),
  );
  struct.markFragments();

  return struct;
}

function createHapticSapStruct() {
  const struct = new Struct();
  const feAtomId = struct.atoms.add(
    new Atom({ label: 'Fe', pp: new Vec2(0, 0) }),
  );
  const firstCarbonAtomId = struct.atoms.add(
    new Atom({ label: 'C', pp: new Vec2(1, 0) }),
  );
  const secondCarbonAtomId = struct.atoms.add(
    new Atom({ label: 'C', pp: new Vec2(2, 0) }),
  );
  const superAttachmentPointAtomId = struct.atoms.add(
    new Atom({
      label: '*',
      pp: new Vec2(1.5, 0),
      endpoints: [firstCarbonAtomId, secondCarbonAtomId],
    }),
  );

  struct.bonds.add(
    new Bond({
      type: Bond.PATTERN.TYPE.SINGLE,
      begin: firstCarbonAtomId,
      end: secondCarbonAtomId,
    }),
  );
  struct.bonds.add(
    new Bond({
      type: Bond.PATTERN.TYPE.HAPTIC,
      begin: feAtomId,
      end: superAttachmentPointAtomId,
      endpoints: [firstCarbonAtomId, secondCarbonAtomId],
      attach: 'ALL',
    }),
  );
  struct.markFragments();

  return struct;
}

function createAttachmentGroupStruct() {
  const struct = new Struct();
  const firstCarbonAtomId = struct.atoms.add(
    new Atom({ label: 'C', pp: new Vec2(0, 0) }),
  );
  const secondCarbonAtomId = struct.atoms.add(
    new Atom({ label: 'C', pp: new Vec2(1, 0) }),
  );

  struct.bonds.add(
    new Bond({
      type: Bond.PATTERN.TYPE.SINGLE,
      begin: firstCarbonAtomId,
      end: secondCarbonAtomId,
    }),
  );
  struct.markFragments();
  struct.atoms.add(
    new Atom({
      label: '*',
      pp: new Vec2(0.5, 0),
      endpoints: [firstCarbonAtomId, secondCarbonAtomId],
      fragment: struct.atoms.get(firstCarbonAtomId)?.fragment ?? -1,
    }),
  );

  return struct;
}

function createSharedAttachmentGroupStruct() {
  const struct = createHapticSapStruct();
  const superAttachmentPointAtomId = Array.from(struct.atoms.entries()).find(
    ([, atom]) => atom.label === '*',
  )?.[0];
  const secondIronAtomId = struct.atoms.add(
    new Atom({ label: 'Fe', pp: new Vec2(3, 0) }),
  );

  if (superAttachmentPointAtomId !== undefined) {
    const endpoints = struct.atoms.get(superAttachmentPointAtomId)?.endpoints;
    struct.bonds.add(
      new Bond({
        type: Bond.PATTERN.TYPE.HAPTIC,
        begin: secondIronAtomId,
        end: superAttachmentPointAtomId,
        endpoints,
        attach: 'ALL',
      }),
    );
  }
  struct.clearFragments();
  struct.markFragments();

  return struct;
}

describe('deserialize (ToStruct)', () => {
  const canvas = createPolymerEditorCanvas();
  // @ts-expect-error TS6133: Instantiated for side effects (singleton registration)
  const _editor = new CoreEditor({
    canvas,
    theme: {},
    renderersContainer: createRenderersManager(),
  });
  const parsedPrepareContent = JSON.parse(preparedKet);
  const deserData = ket.deserialize(preparedKet);
  it('correct work with atoms', () => {
    const preparedAtoms = parsedPrepareContent.mol0.atoms;
    preparedAtoms.forEach((props, id) => {
      const locationWithNegativeY = props.location.map((coordinate, index) => {
        return index === 1 ? -coordinate : coordinate;
      });
      const relatedAtom = deserData.atoms.get(id);
      const label = props.type === 'rg-label' ? 'R#' : 'C';
      // const vec = new Vec2(...props.location)
      const vec = new Vec2(...locationWithNegativeY);
      expect(label).toEqual(relatedAtom!.label);
      expect(vec).toEqual(relatedAtom!.pp);
    });
  });
  it('correct work with bonds', () => {
    const preparedBonds = parsedPrepareContent.mol0.bonds;
    preparedBonds.forEach((props, id) => {
      const relatedBond = deserData.bonds.get(id);
      expect(props.type).toEqual(relatedBond!.type);
      expect(props.atoms[0]).toEqual(relatedBond!.begin);
      expect(props.atoms[1]).toEqual(relatedBond!.end);
    });
  });
  it('struct should not have name attr', () => {
    expect(ket.deserialize(withoutHeaderKet).name).toBeFalsy();
  });
  it('rxnToStruct', () => {
    const spy = jest.spyOn(rxnToStruct, 'rxnToStruct');
    ket.deserialize(rxnKet);
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.results[0].value.rxnArrows).toBeDefined();
    expect(
      spy.mock.results[0].value.rxnArrows.get(0) instanceof RxnArrow,
    ).toBeTruthy();
    expect(spy.mock.results[0].value.rxnArrows.size).toEqual(1);
    expect(spy.mock.results[0].value.rxnArrows.get(0).mode).toEqual(
      'open-angle',
    );
    expect(spy.mock.results[1].value.rxnPluses).toBeDefined();
    expect(
      spy.mock.results[0].value.rxnPluses.get(0) instanceof RxnPlus,
    ).toBeTruthy();
    expect(spy.mock.results[1].value.rxnPluses.size).toEqual(2);
  });
  it('simpleObjectToStruct', () => {
    const spy = jest.spyOn(simpleObjectToStruct, 'simpleObjectToStruct');
    ket.deserialize(simpleObjectKet);
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.results[0].value.simpleObjects).toBeDefined();
    expect(spy.mock.results[0].value.simpleObjects.size).toEqual(1);
    expect(spy.mock.results[0].value.simpleObjects.get(0).mode).toEqual(
      'ellipse',
    );
    expect(
      spy.mock.results[0].value.simpleObjects.get(0) instanceof SimpleObject,
    ).toBeTruthy();
  });
  it('textToStruct', () => {
    const spy = jest.spyOn(textToStruct, 'textToStruct');
    ket.deserialize(textKet);
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.results[0].value.texts).toBeDefined();
    expect(spy.mock.results[0].value.texts.get(0) instanceof Text).toBeTruthy();
  });
  it('moleculeToStruct', () => {
    const spy = jest.spyOn(moleculeToStruct, 'moleculeToStruct');
    ket.deserialize(moleculeKet);
    expect(spy).toHaveBeenCalled();
    // atoms
    expect(spy.mock.results[0].value.atoms.get(0).label).toEqual('R#');
    expect(spy.mock.results[1].value.atoms.get(2).charge).toEqual(5);
    expect(spy.mock.results[1].value.atoms.get(4).label).toEqual('L#');
    expect(
      spy.mock.results[1].value.atoms.get(4).atomList instanceof AtomList,
    ).toBeTruthy();
    expect(spy.mock.results[1].value.atoms.get(4).atomList.ids).toEqual([4, 3]);
    expect(spy.mock.results[1].value.atoms.size).toEqual(7);
    // bonds
    expect(spy.mock.results[1].value.bonds.size).toEqual(7);
    expect(spy.mock.results[1].value.bonds.get(6).stereo).toBeTruthy();
    expect(spy.mock.results[1].value.bonds.get(0).type).toEqual(1);
    expect(spy.mock.results[1].value.bonds.get(1).type).toEqual(2);
    // sgroups
    ket.deserialize(moleculeSgroupKet);
    expect(spy.mock.results[2].value.sgroups.get(0).type).toEqual('GEN');
    expect(spy.mock.results[3].value.sgroups.get(0).type).toEqual('MUL');
    expect(spy.mock.results[3].value.sgroups.get(0).data.mul).toEqual(1);
    expect(spy.mock.results[4].value.sgroups.get(0).type).toEqual('SRU');
    expect(spy.mock.results[4].value.sgroups.get(0).data.subscript).toEqual(
      'n',
    );
    expect(spy.mock.results[4].value.sgroups.get(0).data.connectivity).toEqual(
      'ht',
    );
    expect(spy.mock.results[5].value.sgroups.get(0).type).toEqual('MUL');
    expect(spy.mock.results[5].value.sgroups.get(0).data.mul).toEqual(3);
    expect(spy.mock.results[6].value.sgroups.get(0).type).toEqual('SUP');
    expect(spy.mock.results[6].value.sgroups.get(0).data.name).toEqual('B');
    expect(spy.mock.results[7].value.sgroups.get(0).type).toEqual('SRU');
    expect(spy.mock.results[7].value.sgroups.get(0).data.subscript).toEqual(
      'n',
    );
    expect(spy.mock.results[7].value.sgroups.get(0).data.connectivity).toEqual(
      'hh',
    );
  });
  it('rgroupToStruct', () => {
    const spy = jest.spyOn(rgroupToStruct, 'rgroupToStruct');
    ket.deserialize(moleculeRgroupKet);
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.results[0].value).toBeTruthy();
    expect(spy.mock.results[0].value.atoms.size).toEqual(4);
    expect(spy.mock.results[0].value.bonds.size).toEqual(3);
    expect(spy.mock.results[0].value.rgroups.get(14)).toBeTruthy();
    expect(
      spy.mock.results[0].value.rgroups.get(14) instanceof RGroup,
    ).toBeTruthy();
  });
  it('validation function', () => {
    const spy = jest.spyOn(validate, 'validate');
    ket.deserialize(preparedKet);
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.results[0].value).toBeTruthy();
    expect(() => ket.deserialize(errorKet)).toThrow(
      'Cannot deserialize input JSON.',
    );
    expect(spy.mock.results[1].value).toBeFalsy();
  });
  it('deserializes haptic atom-atom connections from root connections', () => {
    const struct = ket.deserialize(hapticAtomAtomKet);
    const hapticBonds = Array.from(struct.bonds.values()).filter(
      (bond) => bond.type === Bond.PATTERN.TYPE.HAPTIC,
    );

    expect(struct.atoms.size).toEqual(2);
    expect(hapticBonds.length).toEqual(1);
    expect(struct.atoms.get(hapticBonds[0].begin)?.label).toEqual('Fe');
    expect(struct.atoms.get(hapticBonds[0].end)?.label).toEqual('C');
  });
  it('deserializes haptic SAP connections from attachment groups', () => {
    const struct = ket.deserialize(hapticSapAtomKet);
    const superAttachmentPointAtom = Array.from(struct.atoms.values()).find(
      (atom) => atom.label === '*',
    );
    const hapticBond = Array.from(struct.bonds.values()).find(
      (bond) => bond.type === Bond.PATTERN.TYPE.HAPTIC,
    );

    expect(superAttachmentPointAtom?.endpoints).toEqual([1, 2, 3, 4, 5, 6]);
    expect(hapticBond?.endpoints).toEqual([1, 2, 3, 4, 5, 6]);
  });
  it('deserializes an attachment group without a haptic connection', () => {
    const struct = ket.deserializeMicromolecules(attachmentGroupOnlyKet);
    const superAttachmentPointAtoms = Array.from(struct.atoms.values()).filter(
      (atom) => atom.label === '*',
    );

    expect(superAttachmentPointAtoms).toHaveLength(1);
    expect(superAttachmentPointAtoms[0].endpoints).toEqual([0, 1]);
    expect(struct.bonds.size).toEqual(1);
  });
  it('reuses one attachment group for multiple haptic connections', () => {
    const struct = ket.deserialize(sharedAttachmentGroupKet);
    const superAttachmentPointAtomIds = Array.from(struct.atoms.entries())
      .filter(([, atom]) => atom.label === '*')
      .map(([atomId]) => atomId);
    const hapticBonds = Array.from(struct.bonds.values()).filter(
      (bond) => bond.type === Bond.PATTERN.TYPE.HAPTIC,
    );

    expect(superAttachmentPointAtomIds).toHaveLength(1);
    expect(hapticBonds).toHaveLength(2);
    expect(
      hapticBonds.every(
        (bond) =>
          bond.begin === superAttachmentPointAtomIds[0] ||
          bond.end === superAttachmentPointAtomIds[0],
      ),
    ).toBe(true);
  });
});

describe('serialize (ToKet)', () => {
  const canvas = createPolymerEditorCanvas();
  // @ts-expect-error TS6133: Instantiated for side effects (singleton registration)
  const _editor = new CoreEditor({
    canvas,
    theme: {},
    renderersContainer: createRenderersManager(),
  });
  const parsedNewPrepareStruct = JSON.parse(ket.serialize(prepareStruct));
  const parsedPrepareContent = JSON.parse(preparedKet);
  it('correct work with atoms', () => {
    parsedNewPrepareStruct.mol0.atoms.forEach((atom, id) => {
      const relatedAtom = parsedPrepareContent.mol0.atoms[id];
      relatedAtom.location[1] = -relatedAtom.location[1];
      expect(atom).toEqual(relatedAtom);
    });
  });
  it('correct work with bonds', () => {
    parsedNewPrepareStruct.mol0.bonds.forEach((bond, id) => {
      const relatedBond = parsedPrepareContent.mol0.bonds[id];
      expect(bond).toEqual(relatedBond);
    });
  });
  it('correct work with simple object', () => {
    const structSimpleObject = parsedNewPrepareStruct.root.nodes[3];
    const simpleObjectKet = parsedPrepareContent.root.nodes[0];
    expect(structSimpleObject).toEqual(simpleObjectKet);
  });
  it('correct work with text', () => {
    const structText = parsedNewPrepareStruct.root.nodes[4];
    const textKet = parsedPrepareContent.root.nodes[4];
    expect(structText).toEqual(textKet);
  });
  it('correct work with rxnArrow', () => {
    const structArrow = parsedNewPrepareStruct.root.nodes[1];
    const arrowKet = parsedPrepareContent.root.nodes[2];
    expect(structArrow).toEqual(arrowKet);
  });
  it('correct work with rxnPlus', () => {
    const structPlus = parsedNewPrepareStruct.root.nodes[2];
    const plusKet = parsedPrepareContent.root.nodes[3];
    expect(structPlus).toEqual(plusKet);
  });
  it('moleculeToKet', () => {
    const spy = jest.spyOn(moleculeToKet, 'moleculeToKet');
    ket.serialize(moleculeContentStruct);
    // atoms
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.results[0].value.atoms[0].type).toEqual('rg-label');
    expect(spy.mock.results[1].value.atoms[2].charge).toEqual(5);
    expect(
      spy.mock.results[1].value.atoms.filter(
        (item) => item.type === 'atom-list',
      ),
    ).toBeTruthy();
    expect(spy.mock.results[1].value.atoms[4].elements).toEqual(['Be', 'Li']);
    expect(spy.mock.results[1].value.atoms.length).toEqual(7);
    // bonds
    expect(spy.mock.results[1].value.bonds.length).toEqual(7);
    expect(
      spy.mock.results[1].value.bonds.filter((bond) => bond.stereo).length,
    ).toEqual(1);
    expect(
      spy.mock.results[1].value.bonds.filter((bond) => bond.type === 1).length,
    ).toEqual(4);
    expect(
      spy.mock.results[1].value.bonds.filter((bond) => bond.type === 2).length,
    ).toEqual(3);
    // sgroups
    ket.serialize(moleculeSgroupStruct);
    expect(spy.mock.results[2].value.sgroups[0].type).toEqual('GEN');
    expect(spy.mock.results[2].value.sgroups[1].type).toEqual('MUL');
    expect(spy.mock.results[2].value.sgroups[1].mul).toEqual(1);
    expect(spy.mock.results[2].value.sgroups[2].type).toEqual('SRU');
    expect(spy.mock.results[2].value.sgroups[2].subscript).toEqual('n');
    expect(spy.mock.results[2].value.sgroups[2].connectivity).toEqual('HT');
    expect(spy.mock.results[2].value.sgroups[3].type).toEqual('MUL');
    expect(spy.mock.results[2].value.sgroups[3].mul).toEqual(1);
    expect(spy.mock.results[2].value.sgroups[4].type).toEqual('SUP');
    expect(spy.mock.results[2].value.sgroups[5].subscript).toEqual('n');
    expect(spy.mock.results[2].value.sgroups[5].connectivity).toEqual('HT');
  });
  it('rgroupToKet', () => {
    const spy = jest.spyOn(rgroupToKet, 'rgroupToKet');
    const result = JSON.parse(ket.serialize(contentRgroupStruct)).rg14;
    expect(spy).toHaveBeenCalled();
    expect(result).toBeTruthy();
    expect(result.atoms.length).toEqual(4);
    expect(result.bonds.length).toEqual(3);
    expect(result.rlogic.number).toEqual(14);
  });
  it('rxnToKet', () => {
    const spyArrow = jest.spyOn(rxnToKet, 'arrowToKet');
    const spyPlus = jest.spyOn(rxnToKet, 'plusToKet');
    const result = JSON.parse(ket.serialize(prepareStruct));
    const plus = result.root.nodes.filter((item) => item.type === 'plus');
    const arrow = result.root.nodes.filter((item) => item.type === 'arrow');
    expect(spyArrow).toHaveBeenCalled();
    expect(spyPlus).toHaveBeenCalled();
    expect(plus.length).toEqual(1);
    expect(arrow.length).toEqual(1);
    expect(arrow[0].data.mode).toEqual('open-angle');
  });
  it('prepareStructForKet', () => {
    const spy = jest.spyOn(prepareStructForKet, 'prepareStructForKet');
    ket.serialize(prepareStruct);
    expect(spy).toHaveBeenCalled();
    expect(
      spy.mock.results[0].value.filter((item) => item.type === 'molecule')
        .length,
    ).toEqual(1);
    expect(
      spy.mock.results[0].value.filter((item) => item.type === 'molecule')[0]
        .fragment.atoms.size,
    ).toEqual(6);
    expect(
      spy.mock.results[0].value.filter((item) => item.type === 'molecule')[0]
        .fragment.bonds.size,
    ).toEqual(6);
    expect(
      spy.mock.results[0].value.filter((item) => item.type === 'arrow').length,
    ).toBeTruthy();
    expect(
      spy.mock.results[0].value.filter((item) => item.type === 'arrow')[0].data
        .mode,
    ).toEqual('open-angle');
    expect(
      spy.mock.results[0].value.filter((item) => item.type === 'plus').length,
    ).toBeTruthy();
    expect(
      spy.mock.results[0].value.filter((item) => item.type === 'simpleObject')
        .length,
    ).toBeTruthy();
    expect(
      spy.mock.results[0].value.filter(
        (item) => item.type === 'simpleObject',
      )[0].data.mode,
    ).toEqual('rectangle');
    expect(
      spy.mock.results[0].value.filter((item) => item.type === 'text').length,
    ).toBeTruthy();
  });
  it('serializes haptic atom-atom bonds as root connections', () => {
    const result = JSON.parse(ket.serialize(createHapticAtomAtomStruct()));
    const connection = result.root.connections[0];

    expect(connection.type).toEqual('haptic');
    expect(connection.endpoint1.atomId).toEqual('0');
    expect(connection.endpoint2.atomId).toEqual('0');
    expect(result.mol0.bonds).toBeUndefined();
    expect(result.mol1.bonds).toBeUndefined();
    expect(result.root.nodes).toEqual([{ $ref: 'mol0' }, { $ref: 'mol1' }]);
  });
  it('serializes haptic SAP bonds as attachment groups', () => {
    const result = JSON.parse(ket.serialize(createHapticSapStruct()));
    const connection = result.root.connections[0];
    const attachmentMolecule = result[connection.endpoint2.moleculeId];

    expect(connection.type).toEqual('haptic');
    expect(result.root.nodes).toEqual([{ $ref: 'mol0' }, { $ref: 'mol1' }]);
    expect(connection.endpoint2.attachmentGroupId).toEqual('0');
    expect(attachmentMolecule.attachmentGroups).toEqual([
      { id: '0', atoms: [0, 1] },
    ]);
    expect(
      (Object.values(result) as KetMoleculeForTest[])
        .filter((value) => value?.type === 'molecule')
        .flatMap((molecule) => molecule.atoms ?? [])
        .some((atom) => atom.label === '*'),
    ).toBe(false);
  });
  it('serializes an attachment group without a haptic connection', () => {
    const result = JSON.parse(ket.serialize(createAttachmentGroupStruct()));

    expect(result.root.connections).toEqual([]);
    expect(result.mol0.attachmentGroups).toEqual([{ id: '0', atoms: [0, 1] }]);
    expect(result.mol0.atoms.some((atom) => atom.label === '*')).toBe(false);
  });
  it('reuses one serialized attachment group for multiple haptic bonds', () => {
    const result = JSON.parse(
      ket.serialize(createSharedAttachmentGroupStruct()),
    );
    const hapticConnections = result.root.connections.filter(
      (connection) => connection.type === 'haptic',
    );
    const attachmentGroupEndpoints = hapticConnections.map(
      (connection) => connection.endpoint2,
    );
    const attachmentMolecule = result[attachmentGroupEndpoints[0].moleculeId];

    expect(hapticConnections).toHaveLength(2);
    expect(
      new Set(
        attachmentGroupEndpoints.map((endpoint) => JSON.stringify(endpoint)),
      ).size,
    ).toBe(1);
    expect(attachmentMolecule.attachmentGroups).toEqual([
      { id: '0', atoms: [0, 1] },
    ]);
  });
});
