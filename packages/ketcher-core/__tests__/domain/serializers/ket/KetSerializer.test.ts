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
  AtomList,
  RGroup,
  RxnArrow,
  RxnPlus,
  SimpleObject,
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

const ket = new KetSerializer();

describe('deserialize (ToStruct)', () => {
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
    expect(spy).toBeCalled();
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
    expect(spy).toBeCalled();
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
    expect(spy).toBeCalled();
    expect(spy.mock.results[0].value.texts).toBeDefined();
    expect(spy.mock.results[0].value.texts.get(0) instanceof Text).toBeTruthy();
  });
  it('moleculeToStruct', () => {
    const spy = jest.spyOn(moleculeToStruct, 'moleculeToStruct');
    ket.deserialize(moleculeKet);
    expect(spy).toBeCalled();
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
    expect(spy).toBeCalled();
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
    expect(spy).toBeCalled();
    expect(spy.mock.results[0].value).toBeTruthy();
    expect(() => ket.deserialize(errorKet)).toThrow(
      'Cannot deserialize input JSON.',
    );
    expect(spy.mock.results[1].value).toBeFalsy();
  });
});

describe('serialize (ToKet)', () => {
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
    expect(spy).toBeCalled();
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
    expect(spy).toBeCalled();
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
    expect(spyArrow).toBeCalled();
    expect(spyPlus).toBeCalled();
    expect(plus.length).toEqual(1);
    expect(arrow.length).toEqual(1);
    expect(arrow[0].data.mode).toEqual('open-angle');
  });
  it('prepareStructForKet', () => {
    const spy = jest.spyOn(prepareStructForKet, 'prepareStructForKet');
    ket.serialize(prepareStruct);
    expect(spy).toBeCalled();
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
});
