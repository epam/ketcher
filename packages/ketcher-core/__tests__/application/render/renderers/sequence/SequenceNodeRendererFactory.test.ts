import { SequenceNodeRendererFactory } from 'application/render/renderers/sequence/SequenceNodeRendererFactory';
import { LinkerSequenceNode } from 'domain/entities/LinkerSequenceNode';
import { Phosphate } from 'domain/entities/Phosphate';
import { Chem } from 'domain/entities/Chem';
import { PhosphateSequenceItemRenderer } from 'application/render/renderers/sequence/PhosphateSequenceItemRenderer';
import { ChemSequenceItemRenderer } from 'application/render/renderers/sequence/ChemSequenceItemRenderer';
import { Vec2 } from 'domain/entities/vec2';
import { KetMonomerClass, MONOMER_CONST } from 'domain/constants/monomers';
import type { MonomerItemType } from 'domain/types';

const createMonomerItem = (overrides: Partial<MonomerItemType['props']>) => {
  return {
    label: 'test',
    struct: undefined,
    props: {
      id: 'test',
      Name: 'test',
      MonomerName: 'test',
      MonomerNaturalAnalogCode: '',
      MonomerType: MONOMER_CONST.CHEM,
      MonomerClass: KetMonomerClass.CHEM,
      MonomerCaps: {},
      ...overrides,
    },
    attachmentPoints: [],
    expanded: false,
  } as unknown as MonomerItemType;
};

const createRendererForNode = (node: LinkerSequenceNode) => {
  return SequenceNodeRendererFactory.fromNode(
    node,
    new Vec2(0, 0),
    0,
    true,
    {} as never,
    0,
    0,
    { chain: {} as never, senseNodeIndex: 0 } as never,
  );
};

describe('SequenceNodeRendererFactory', () => {
  it('uses phosphate renderer for linker nodes that contain only phosphate monomers', () => {
    const phosphate = new Phosphate(
      createMonomerItem({
        MonomerType: MONOMER_CONST.RNA,
        MonomerClass: KetMonomerClass.Phosphate,
        MonomerNaturalAnalogCode: MONOMER_CONST.P,
      }),
    );

    const renderer = createRendererForNode(new LinkerSequenceNode(phosphate));

    expect(renderer).toBeInstanceOf(PhosphateSequenceItemRenderer);
  });

  it('keeps chem renderer for regular linker nodes', () => {
    const chem = new Chem(createMonomerItem({}));

    const renderer = createRendererForNode(new LinkerSequenceNode(chem));

    expect(renderer).toBeInstanceOf(ChemSequenceItemRenderer);
  });
});
