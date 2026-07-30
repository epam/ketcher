import { RenderersManager } from 'application/render/renderers/RenderersManager';
import type { BaseMonomerRenderer } from 'application/render/renderers/BaseMonomerRenderer';
import {
  LinkerSequenceNode,
  MonomerSequenceNode,
  Nucleotide,
  Phosphate,
  RNABase,
  Sugar,
} from 'domain/entities';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { ChainsCollection } from 'domain/entities/monomer-chains/ChainsCollection';
import { RnaSubChain } from 'domain/entities/monomer-chains/RnaSubChain';
import { isValidRnaEnumerationStartMonomer } from 'domain/helpers/monomers';
import { KetMonomerClass } from 'domain/constants/monomers';
import { KetAmbiguousMonomerTemplateSubType } from 'application/formatters/types/ket';
import { AttachmentPointName, type MonomerItemType } from 'domain/types';
import { peptideMonomerItem } from '../../../mock-data';

type RenderersManagerInternals = {
  recalculateRnaChainEnumeration(subChain: RnaSubChain): void;
};

const attachmentPoint = (label: AttachmentPointName) => ({
  label,
  attachmentAtom: 0,
  leavingGroup: { atoms: [] },
});

const monomerItem = (
  label: string,
  MonomerClass: KetMonomerClass,
  attachmentPoints: AttachmentPointName[],
  isAntisense = false,
): MonomerItemType => ({
  ...peptideMonomerItem,
  label,
  isAntisense,
  attachmentPoints: attachmentPoints.map(attachmentPoint),
  props: {
    ...peptideMonomerItem.props,
    MonomerClass,
    MonomerType: 'RNA',
    MonomerName: label,
    Name: label,
    MonomerNaturalAnalogCode: label,
  },
});

const createSugar = (isAntisense = false) =>
  new Sugar(
    monomerItem(
      'R',
      KetMonomerClass.Sugar,
      [AttachmentPointName.R1, AttachmentPointName.R2, AttachmentPointName.R3],
      isAntisense,
    ),
  );

const createPhosphate = (isAntisense = false) =>
  new Phosphate(
    monomerItem(
      'P',
      KetMonomerClass.Phosphate,
      [AttachmentPointName.R1, AttachmentPointName.R2],
      isAntisense,
    ),
  );

const createNucleotide = (isAntisense = false) =>
  new Nucleotide(
    createSugar(isAntisense),
    new RNABase(
      monomerItem(
        'A',
        KetMonomerClass.Base,
        [AttachmentPointName.R1],
        isAntisense,
      ),
    ),
    createPhosphate(isAntisense),
  );

const mockRenderer = (monomer: BaseMonomer) => {
  const enumerations: Array<number | null> = [];
  const terminalMarkers: boolean[] = [];

  monomer.renderer = {
    setEnumeration: (enumeration: number | null) => {
      enumerations.push(enumeration);
    },
    redrawEnumeration: (needToDrawTerminalMarker: boolean) => {
      terminalMarkers.push(needToDrawTerminalMarker);
    },
  } as unknown as BaseMonomerRenderer;

  return { enumerations, terminalMarkers };
};

const mockNucleotideRenderers = (nucleotide: Nucleotide) => ({
  base: mockRenderer(nucleotide.rnaBase),
  sugar: mockRenderer(nucleotide.sugar),
});

const recalculateRnaChainEnumeration = (subChain: RnaSubChain) => {
  const renderersManager = new RenderersManager({
    theme: {},
  }) as unknown as RenderersManagerInternals;

  renderersManager.recalculateRnaChainEnumeration(subChain);
};

const createSugarLabeled = (label: string) =>
  new Sugar(
    monomerItem(label, KetMonomerClass.Sugar, [
      AttachmentPointName.R1,
      AttachmentPointName.R2,
      AttachmentPointName.R3,
    ]),
  );

const createPhosphateLabeled = (label: string) =>
  new Phosphate(
    monomerItem(label, KetMonomerClass.Phosphate, [
      AttachmentPointName.R1,
      AttachmentPointName.R2,
    ]),
  );

const createBaseLabeled = (label: string) =>
  new RNABase(
    monomerItem(label, KetMonomerClass.Base, [AttachmentPointName.R1]),
  );

const connect = (
  firstMonomer: BaseMonomer,
  firstAttachmentPoint: AttachmentPointName,
  secondMonomer: BaseMonomer,
  secondAttachmentPoint: AttachmentPointName,
) => {
  const bond = new PolymerBond(firstMonomer, secondMonomer);
  firstMonomer.attachmentPointsToBonds[firstAttachmentPoint] = bond;
  secondMonomer.attachmentPointsToBonds[secondAttachmentPoint] = bond;
  return bond;
};

const createAmbiguousMonomer = (monomers: BaseMonomer[]) =>
  new AmbiguousMonomer({
    label: '%',
    subtype: KetAmbiguousMonomerTemplateSubType.ALTERNATIVES,
    monomers,
    options: monomers.map((monomer) => ({ templateId: monomer.label })),
  } as never);

type RnaUnit = {
  sugar: Sugar | AmbiguousMonomer;
  base: RNABase | AmbiguousMonomer;
  phosphate: Phosphate | AmbiguousMonomer;
};

const buildRnaUnit = (ambiguous: boolean): RnaUnit => {
  const sugar = ambiguous
    ? createAmbiguousMonomer([
        createSugarLabeled('25mo3r'),
        createSugarLabeled('25R'),
      ])
    : createSugarLabeled('R');
  const base = ambiguous
    ? createAmbiguousMonomer([
        createBaseLabeled('A'),
        createBaseLabeled('C'),
        createBaseLabeled('G'),
      ])
    : createBaseLabeled('A');
  const phosphate = ambiguous
    ? createAmbiguousMonomer([
        createPhosphateLabeled('gly'),
        createPhosphateLabeled('hn'),
      ])
    : createPhosphateLabeled('P');

  connect(sugar, AttachmentPointName.R3, base, AttachmentPointName.R1);
  connect(sugar, AttachmentPointName.R2, phosphate, AttachmentPointName.R1);

  return { sugar, base, phosphate };
};

const getRnaSubChains = (collection: ChainsCollection) =>
  collection.chains
    .flatMap((chain) => chain.subChains)
    .filter(
      (subChain): subChain is RnaSubChain => subChain instanceof RnaSubChain,
    );

describe('RenderersManager', () => {
  it.each([
    {
      name: 'standalone sugar',
      createResetNode: () => {
        const sugar = createSugar();

        return {
          monomer: sugar,
          node: new MonomerSequenceNode(sugar),
        };
      },
    },
    {
      name: 'standalone phosphate',
      createResetNode: () => {
        const phosphate = createPhosphate();

        return {
          monomer: phosphate,
          node: new MonomerSequenceNode(phosphate),
        };
      },
    },
    {
      name: 'linker node',
      createResetNode: () => {
        const sugar = createSugar();

        return {
          monomer: sugar,
          node: new LinkerSequenceNode(sugar),
        };
      },
    },
  ])('resets RNA enumeration after $name', ({ createResetNode }) => {
    const first = createNucleotide();
    const second = createNucleotide();
    const reset = createResetNode();
    const third = createNucleotide();
    const fourth = createNucleotide();
    const subChain = new RnaSubChain();

    subChain.add(first);
    subChain.add(second);
    subChain.add(reset.node);
    subChain.add(third);
    subChain.add(fourth);

    const firstRenderer = mockNucleotideRenderers(first);
    const secondRenderer = mockNucleotideRenderers(second);
    const resetRenderer = mockRenderer(reset.monomer);
    const thirdRenderer = mockNucleotideRenderers(third);
    const fourthRenderer = mockNucleotideRenderers(fourth);

    recalculateRnaChainEnumeration(subChain);

    expect(firstRenderer.base.enumerations).toEqual([1]);
    expect(firstRenderer.sugar.enumerations).toEqual([1]);
    expect(secondRenderer.base.enumerations).toEqual([2]);
    expect(secondRenderer.sugar.enumerations).toEqual([2]);
    expect(resetRenderer.enumerations).toEqual([null]);
    expect(resetRenderer.terminalMarkers).toEqual([false]);
    expect(thirdRenderer.base.enumerations).toEqual([1]);
    expect(thirdRenderer.sugar.enumerations).toEqual([1]);
    expect(fourthRenderer.base.enumerations).toEqual([2]);
    expect(fourthRenderer.sugar.enumerations).toEqual([2]);
  });

  it('draws antisense terminal markers at the end of each RNA segment', () => {
    const first = createNucleotide(true);
    const second = createNucleotide(true);
    const resetSugar = createSugar(true);
    const third = createNucleotide(true);
    const fourth = createNucleotide(true);
    const subChain = new RnaSubChain();

    subChain.add(first);
    subChain.add(second);
    subChain.add(new MonomerSequenceNode(resetSugar));
    subChain.add(third);
    subChain.add(fourth);

    const firstRenderer = mockNucleotideRenderers(first);
    const secondRenderer = mockNucleotideRenderers(second);
    const resetRenderer = mockRenderer(resetSugar);
    const thirdRenderer = mockNucleotideRenderers(third);
    const fourthRenderer = mockNucleotideRenderers(fourth);

    recalculateRnaChainEnumeration(subChain);

    expect(firstRenderer.base.terminalMarkers).toEqual([false]);
    expect(secondRenderer.base.terminalMarkers).toEqual([true]);
    expect(resetRenderer.enumerations).toEqual([null]);
    expect(resetRenderer.terminalMarkers).toEqual([false]);
    expect(thirdRenderer.base.terminalMarkers).toEqual([false]);
    expect(fourthRenderer.base.terminalMarkers).toEqual([true]);
  });

  it('keeps modified (ambiguous) RNA components in one continuously enumerated chain (#10735)', () => {
    const units = [true, false, true, false, true].map(buildRnaUnit);

    for (let index = 0; index < units.length - 1; index++) {
      connect(
        units[index].phosphate,
        AttachmentPointName.R2,
        units[index + 1].sugar,
        AttachmentPointName.R1,
      );
    }

    const allMonomers = units.flatMap((unit) => [
      unit.sugar,
      unit.base,
      unit.phosphate,
    ]);
    const collection = ChainsCollection.fromMonomers(allMonomers);
    const rnaSubChains = getRnaSubChains(collection);

    expect(rnaSubChains).toHaveLength(1);

    const baseRenderers = units.map((unit) => mockRenderer(unit.base));
    units.forEach((unit) => mockRenderer(unit.sugar));

    recalculateRnaChainEnumeration(rnaSubChains[0]);

    expect(baseRenderers.map((renderer) => renderer.enumerations)).toEqual([
      [1],
      [2],
      [3],
      [4],
      [5],
    ]);
  });

  it('enumerates a single RNA monomer as base number 1', () => {
    const sugar = createSugarLabeled('R');
    const base = createBaseLabeled('A');
    connect(sugar, AttachmentPointName.R3, base, AttachmentPointName.R1);

    const collection = ChainsCollection.fromMonomers([sugar, base]);
    const rnaSubChains = getRnaSubChains(collection);

    expect(rnaSubChains).toHaveLength(1);

    const baseRenderer = mockRenderer(base);
    mockRenderer(sugar);

    recalculateRnaChainEnumeration(rnaSubChains[0]);

    expect(baseRenderer.enumerations).toEqual([1]);
  });

  it('does not enumerate a cyclic RNA chain (no valid start monomer)', () => {
    const first = buildRnaUnit(false);
    const second = buildRnaUnit(false);

    connect(
      first.phosphate,
      AttachmentPointName.R2,
      second.sugar,
      AttachmentPointName.R1,
    );
    connect(
      second.phosphate,
      AttachmentPointName.R2,
      first.sugar,
      AttachmentPointName.R1,
    );

    const allMonomers = [first, second].flatMap((unit) => [
      unit.sugar,
      unit.base,
      unit.phosphate,
    ]);
    const collection = ChainsCollection.fromMonomers(allMonomers);
    const rnaSubChains = getRnaSubChains(collection);

    expect(rnaSubChains.length).toBeGreaterThan(0);

    const firstBaseRenderer = mockRenderer(first.base);
    const secondBaseRenderer = mockRenderer(second.base);

    rnaSubChains.forEach((subChain) =>
      recalculateRnaChainEnumeration(subChain),
    );

    expect(firstBaseRenderer.enumerations).toEqual([null]);
    expect(secondBaseRenderer.enumerations).toEqual([null]);
  });
});

describe('isValidRnaEnumerationStartMonomer', () => {
  it('treats a monomer without an R1 attachment point as a valid start', () => {
    const phosphate = new Phosphate(
      monomerItem('P', KetMonomerClass.Phosphate, [AttachmentPointName.R2]),
    );

    expect(isValidRnaEnumerationStartMonomer(phosphate)).toBe(true);
  });

  it('treats a monomer with a free R1 attachment point as a valid start', () => {
    const sugar = createSugarLabeled('R');

    expect(isValidRnaEnumerationStartMonomer(sugar)).toBe(true);
  });

  it('treats an R1 bond to a non-R2 attachment point (i !== 2) as a valid start', () => {
    const sugar = createSugarLabeled('R');
    const other = createSugarLabeled('R');
    connect(sugar, AttachmentPointName.R1, other, AttachmentPointName.R3);

    expect(isValidRnaEnumerationStartMonomer(sugar)).toBe(true);
  });

  it('rejects a regular R1→R2 backbone continuation as a start', () => {
    const sugar = createSugarLabeled('R');
    const phosphate = createPhosphateLabeled('P');
    connect(sugar, AttachmentPointName.R1, phosphate, AttachmentPointName.R2);

    expect(isValidRnaEnumerationStartMonomer(sugar)).toBe(false);
  });
});
