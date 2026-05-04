import { AttachmentPointName, KetMonomerClass, Struct } from 'ketcher-core';

import { RnaPresetWizardState } from './MonomerCreationWizard.types';
import {
  getAttachmentPointsForRnaPresetComponent,
  getConnectionAttachmentPointsForRnaPresetComponent,
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
  const structBonds = new Map<number, { begin: number; end: number }>();
  const halfBonds = new Map<
    number,
    { begin: number; end: number; bid: number }
  >();
  let halfBondId = 1;

  bonds.forEach(([begin, end], bondIndex) => {
    structBonds.set(bondIndex + 1, { begin, end });

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
    bonds: structBonds,
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

  it('returns sugar/base connection attachment points on component tabs', () => {
    const wizardState = createWizardState();
    wizardState.base.structure = { atoms: [1], bonds: [] };
    wizardState.sugar.structure = { atoms: [2], bonds: [] };
    const struct = createStruct([[1, 2]]);

    expect(
      getConnectionAttachmentPointsForRnaPresetComponent(
        wizardState,
        struct,
        'sugar',
      ),
    ).toEqual([AttachmentPointName.R3]);
    expect(
      getConnectionAttachmentPointsForRnaPresetComponent(
        wizardState,
        struct,
        'base',
      ),
    ).toEqual([AttachmentPointName.R1]);
  });

  it.each<{
    phosphatePosition: '3' | '5';
    expectedSugar: AttachmentPointName;
    expectedPhosphate: AttachmentPointName;
  }>([
    {
      phosphatePosition: '3',
      expectedSugar: AttachmentPointName.R2,
      expectedPhosphate: AttachmentPointName.R1,
    },
    {
      phosphatePosition: '5',
      expectedSugar: AttachmentPointName.R1,
      expectedPhosphate: AttachmentPointName.R2,
    },
  ])(
    "returns sugar/phosphate connection attachment points for $phosphatePosition' position",
    ({ phosphatePosition, expectedSugar, expectedPhosphate }) => {
      const wizardState = createWizardState();
      wizardState.sugar.structure = { atoms: [2], bonds: [] };
      wizardState.phosphate.structure = { atoms: [3], bonds: [] };
      const struct = createStruct([[2, 3]]);

      expect(
        getConnectionAttachmentPointsForRnaPresetComponent(
          wizardState,
          struct,
          'sugar',
          phosphatePosition,
        ),
      ).toEqual([expectedSugar]);
      expect(
        getConnectionAttachmentPointsForRnaPresetComponent(
          wizardState,
          struct,
          'phosphate',
          phosphatePosition,
        ),
      ).toEqual([expectedPhosphate]);
    },
  );

  it('does not return sugar/phosphate connection attachment points until phosphate position is selected', () => {
    const wizardState = createWizardState();
    wizardState.sugar.structure = { atoms: [2], bonds: [] };
    wizardState.phosphate.structure = { atoms: [3], bonds: [] };

    expect(
      getConnectionAttachmentPointsForRnaPresetComponent(
        wizardState,
        createStruct([[2, 3]]),
        'sugar',
      ),
    ).toEqual([]);
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
