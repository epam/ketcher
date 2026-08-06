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
import { RnaSubChain } from 'domain/entities/monomer-chains/RnaSubChain';
import { KetMonomerClass } from 'domain/constants/monomers';
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
});
