import { AttachmentPointName, KetMonomerClass, Struct } from 'ketcher-core';

import { RnaPresetWizardState } from './MonomerCreationWizard.types';
import {
  getAttachmentPointsForRnaPresetComponent,
  getVisibleAttachmentPointsForRnaPreset,
} from './RnaPresetAttachmentPointsVisibility';

const createWizardState = (): RnaPresetWizardState => ({
  preset: {
    name: '',
    errors: {
      name: undefined,
      phosphatePosition: undefined,
    },
    notifications: new Map(),
    manuallyModifiedSymbols: {
      base: false,
      sugar: false,
      phosphate: false,
    },
  },
  base: {
    values: {
      type: KetMonomerClass.Base,
      symbol: '',
      name: '',
      naturalAnalogue: '',
      aliasHELM: '',
    },
    errors: {},
    notifications: new Map(),
    structure: undefined,
  },
  sugar: {
    values: {
      type: KetMonomerClass.Sugar,
      symbol: '',
      name: '',
      naturalAnalogue: '',
      aliasHELM: '',
    },
    errors: {},
    notifications: new Map(),
    structure: undefined,
  },
  phosphate: {
    values: {
      type: KetMonomerClass.Phosphate,
      symbol: '',
      name: '',
      naturalAnalogue: '',
      aliasHELM: '',
    },
    errors: {},
    notifications: new Map(),
    structure: undefined,
  },
});

const createStruct = (bonds: Array<[number, number]>) => {
  const atoms = new Map<number, { neighbors: number[] }>();
  const halfBonds = new Map<
    number,
    { begin: number; end: number; bid: number }
  >();
  let halfBondId = 1;

  bonds.forEach(([begin, end], bondIndex) => {
    if (!atoms.has(begin)) {
      atoms.set(begin, { neighbors: [] });
    }

    if (!atoms.has(end)) {
      atoms.set(end, { neighbors: [] });
    }

    halfBonds.set(halfBondId, { begin, end, bid: bondIndex + 1 });
    atoms.get(begin)?.neighbors.push(halfBondId);
    halfBondId += 1;

    halfBonds.set(halfBondId, { begin: end, end: begin, bid: bondIndex + 1 });
    atoms.get(end)?.neighbors.push(halfBondId);
    halfBondId += 1;
  });

  return {
    atoms,
    halfBonds,
  } as unknown as Struct;
};

describe('RnaPresetAttachmentPointsVisibility', () => {
  it('returns all attachment points assigned to the selected component', () => {
    const wizardState = createWizardState();
    wizardState.base.structure = { atoms: [1, 3], bonds: [] };
    wizardState.sugar.structure = { atoms: [2], bonds: [] };
    const assignedAttachmentPoints = new Map<
      AttachmentPointName,
      [number, number]
    >([
      [AttachmentPointName.R1, [1, 11]],
      [AttachmentPointName.R2, [2, 12]],
      [AttachmentPointName.R3, [3, 13]],
    ]);

    expect(
      getAttachmentPointsForRnaPresetComponent(
        assignedAttachmentPoints,
        wizardState,
        'base',
      ),
    ).toEqual(
      new Map([
        [AttachmentPointName.R1, [1, 11]],
        [AttachmentPointName.R3, [3, 13]],
      ]),
    );
  });

  it('hides attachment points already occupied by default component connections on the preset tab', () => {
    const wizardState = createWizardState();
    wizardState.base.structure = { atoms: [1], bonds: [] };
    wizardState.sugar.structure = { atoms: [2, 4], bonds: [] };
    wizardState.phosphate.structure = { atoms: [3], bonds: [] };
    const assignedAttachmentPoints = new Map<
      AttachmentPointName,
      [number, number]
    >([
      [AttachmentPointName.R1, [1, 11]],
      [AttachmentPointName.R2, [2, 12]],
      [AttachmentPointName.R3, [3, 13]],
      [AttachmentPointName.R4, [4, 14]],
    ]);

    const visibleAttachmentPoints = getVisibleAttachmentPointsForRnaPreset(
      assignedAttachmentPoints,
      wizardState,
      createStruct([
        [1, 11],
        [2, 12],
        [3, 13],
        [4, 14],
        [1, 2],
      ]),
    );

    expect(visibleAttachmentPoints).toEqual(
      new Map([
        [AttachmentPointName.R3, [3, 13]],
        [AttachmentPointName.R4, [4, 14]],
      ]),
    );
  });

  it('shows attachment points on the preset tab again after component bonds are removed', () => {
    const wizardState = createWizardState();
    wizardState.base.structure = { atoms: [1], bonds: [] };
    wizardState.sugar.structure = { atoms: [2], bonds: [] };
    const assignedAttachmentPoints = new Map<
      AttachmentPointName,
      [number, number]
    >([
      [AttachmentPointName.R1, [1, 11]],
      [AttachmentPointName.R2, [2, 12]],
    ]);

    expect(
      getVisibleAttachmentPointsForRnaPreset(
        assignedAttachmentPoints,
        wizardState,
        createStruct([
          [1, 11],
          [2, 12],
        ]),
      ),
    ).toEqual(assignedAttachmentPoints);
  });
});
