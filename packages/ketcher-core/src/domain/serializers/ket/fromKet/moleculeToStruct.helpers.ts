import {
  Atom,
  Bond,
  AtomQueryProperties,
  RGroupAttachmentPoint,
  AttachmentPoints,
} from 'domain/entities';
import { Elements } from 'domain/constants';
import { ifDef } from 'utilities';
import { initiallySelectedType } from 'domain/entities/BaseMicromoleculeEntity';

export function toRlabel(values) {
  let res = 0;
  values.forEach((val) => {
    const rgi = val - 1;
    res |= 1 << rgi;
  });
  return res;
}

export function atomToStruct(source) {
  const params: any = {};

  const queryAttribute: Array<keyof AtomQueryProperties> = [
    'aromaticity',
    'ringMembership',
    'connectivity',
    'ringSize',
    'chirality',
    'customQuery',
  ];
  if (source.type === 'atom-list') {
    params.label = 'L#';
    const ids = source.elements
      .map((el) => Elements.get(el)?.number)
      .filter((id) => id);
    ifDef(params, 'atomList', {
      ids,
      notList: source.notList,
    });
  } else {
    ifDef(params, 'label', source.label);
    // reaction
    ifDef(params, 'aam', source.mapping);
  }
  ifDef(params, 'alias', source.alias);
  ifDef(params, 'pp', {
    x: source.location[0],
    y: -source.location[1],
    z: source.location[2] || 0.0,
  });
  ifDef(params, 'charge', source.charge);
  ifDef(params, 'explicitValence', source.explicitValence);
  ifDef(params, 'isotope', source.isotope);
  ifDef(params, 'radical', source.radical);
  ifDef(params, 'cip', source.cip);
  ifDef(params, 'attachmentPoints', source.attachmentPoints);
  // stereo
  ifDef(params, 'stereoLabel', source.stereoLabel);
  ifDef(params, 'stereoParity', source.stereoParity);
  ifDef(params, 'weight', source.weight);
  // query
  ifDef(params, 'ringBondCount', source.ringBondCount);
  ifDef(params, 'substitutionCount', source.substitutionCount);
  ifDef(params, 'unsaturatedAtom', Number(Boolean(source.unsaturatedAtom)));
  ifDef(params, 'hCount', source.hCount);
  if (
    source.queryProperties &&
    Object.values(source.queryProperties).some((property) => property !== null)
  ) {
    params.queryProperties = {};
    queryAttribute.forEach((attributeName) => {
      ifDef(
        params.queryProperties,
        attributeName,
        source.queryProperties[attributeName],
      );
    });
  }

  // reaction
  ifDef(params, 'invRet', source.invRet);
  ifDef(params, 'exactChangeFlag', Number(Boolean(source.exactChangeFlag)));
  // implicit hydrogens
  ifDef(params, 'implicitHCount', source.implicitHCount);

  const newAtom = new Atom(params);
  newAtom.setInitiallySelected(source.selected);
  return newAtom;
}

export function rglabelToStruct(source) {
  const params: any = {};
  params.label = 'R#';
  ifDef(params, 'pp', {
    x: source.location[0],
    y: -source.location[1],
    z: source.location[2] || 0.0,
  });
  ifDef(params, 'attachmentPoints', source.attachmentPoints);
  const rglabel = toRlabel(source.$refs.map((el) => parseInt(el.slice(3))));
  ifDef(params, 'rglabel', rglabel);
  const newAtom = new Atom(params);
  newAtom.setInitiallySelected(source.selected);
  return newAtom;
}

export function addRGroupAttachmentPointsToStruct(
  struct,
  attachedAtomId: number,
  attachmentPoints: AttachmentPoints | null,
  initiallySelected?: initiallySelectedType,
) {
  const rgroupAttachmentPoints: RGroupAttachmentPoint[] = [];
  if (attachmentPoints === AttachmentPoints.FirstSideOnly) {
    rgroupAttachmentPoints.push(
      new RGroupAttachmentPoint(attachedAtomId, 'primary', initiallySelected),
    );
  } else if (attachmentPoints === AttachmentPoints.SecondSideOnly) {
    rgroupAttachmentPoints.push(
      new RGroupAttachmentPoint(attachedAtomId, 'secondary', initiallySelected),
    );
  } else if (attachmentPoints === AttachmentPoints.BothSides) {
    rgroupAttachmentPoints.push(
      new RGroupAttachmentPoint(attachedAtomId, 'primary', initiallySelected),
    );
    rgroupAttachmentPoints.push(
      new RGroupAttachmentPoint(attachedAtomId, 'secondary', initiallySelected),
    );
  }
  rgroupAttachmentPoints.forEach((rgroupAttachmentPoint) => {
    struct.rgroupAttachmentPoints.add(rgroupAttachmentPoint);
  });
}

/**
 *
 * @param source
 * @param atomOffset if bond is a part of a fragment, then we need to consider atoms from previous fragment.
 * source.atoms contains numbers related to fragment, but we need to count atoms related to struct.
 * @returns newly created Bond
 */
export function bondToStruct(source, atomOffset = 0) {
  const params: any = {};

  ifDef(params, 'type', source.type);
  ifDef(params, 'topology', source.topology);
  ifDef(params, 'reactingCenterStatus', source.center);
  ifDef(params, 'stereo', source.stereo);
  ifDef(params, 'cip', source.cip);
  ifDef(params, 'customQuery', source.customQuery);
  ifDef(params, 'begin', source.atoms[0] + atomOffset);
  ifDef(params, 'end', source.atoms[1] + atomOffset);
  ifDef(params, 'initiallySelected', source.selected);

  const newBond = new Bond(params);
  newBond.setInitiallySelected(source.selected);
  return newBond;
}
