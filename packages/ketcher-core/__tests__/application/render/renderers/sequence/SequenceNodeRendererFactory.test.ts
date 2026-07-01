import { SequenceNodeRendererFactory } from 'application/render/renderers/sequence/SequenceNodeRendererFactory';
import { LinkerSequenceNode } from 'domain/entities/LinkerSequenceNode';
import { Phosphate } from 'domain/entities/Phosphate';
import { Chem } from 'domain/entities/Chem';
import { AmbiguousMonomer } from 'domain/entities/AmbiguousMonomer';
import { PhosphateSequenceItemRenderer } from 'application/render/renderers/sequence/PhosphateSequenceItemRenderer';
import { ChemSequenceItemRenderer } from 'application/render/renderers/sequence/ChemSequenceItemRenderer';
import { Vec2 } from 'domain/entities/vec2';
import { KetMonomerClass, MONOMER_CONST } from 'domain/constants/monomers';
import { KetAmbiguousMonomerTemplateSubType } from 'application/formatters/types/ket';
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

/**
 * Creates a minimal fake Chain object for testing.
 * NOTE: If BaseSequenceItemRenderer starts accessing chain properties during construction,
 * this helper will need to be updated to include those properties.
 */
const createFakeChain = () => {
  return {} as unknown as Parameters<
    typeof SequenceNodeRendererFactory.fromNode
  >[4];
};

/**
 * Creates a minimal fake ITwoStrandedChainItem for testing.
 * NOTE: If BaseSequenceItemRenderer starts accessing twoStrandedNode properties during construction,
 * this helper will need to be updated to include those properties.
 */
const createFakeTwoStrandedNode = (): Parameters<
  typeof SequenceNodeRendererFactory.fromNode
>[7] => {
  return {
    chain: createFakeChain(),
    senseNodeIndex: 0,
  } as Parameters<typeof SequenceNodeRendererFactory.fromNode>[7];
};

const createRendererForNode = (
  node: LinkerSequenceNode,
  monomerIndexInChain = 0,
  isLastMonomerInChain = true,
) => {
  return SequenceNodeRendererFactory.fromNode(
    node,
    new Vec2(0, 0),
    monomerIndexInChain,
    isLastMonomerInChain,
    createFakeChain(),
    0,
    0,
    createFakeTwoStrandedNode(),
  );
};

describe('SequenceNodeRendererFactory', () => {
  describe('phosphate linker rendering at edge positions', () => {
    it('uses phosphate renderer for phosphate linker at first position (index 0)', () => {
      const phosphate = new Phosphate(
        createMonomerItem({
          MonomerType: MONOMER_CONST.RNA,
          MonomerClass: KetMonomerClass.Phosphate,
          MonomerNaturalAnalogCode: MONOMER_CONST.P,
        }),
      );

      const renderer = createRendererForNode(
        new LinkerSequenceNode(phosphate),
        0, // first position
        false, // not last
      );

      expect(renderer).toBeInstanceOf(PhosphateSequenceItemRenderer);
    });

    it('uses phosphate renderer for phosphate linker at last position', () => {
      const phosphate = new Phosphate(
        createMonomerItem({
          MonomerType: MONOMER_CONST.RNA,
          MonomerClass: KetMonomerClass.Phosphate,
          MonomerNaturalAnalogCode: MONOMER_CONST.P,
        }),
      );

      const renderer = createRendererForNode(
        new LinkerSequenceNode(phosphate),
        5, // some position
        true, // last in chain
      );

      expect(renderer).toBeInstanceOf(PhosphateSequenceItemRenderer);
    });

    it('uses chem renderer for phosphate linker in middle position', () => {
      const phosphate = new Phosphate(
        createMonomerItem({
          MonomerType: MONOMER_CONST.RNA,
          MonomerClass: KetMonomerClass.Phosphate,
          MonomerNaturalAnalogCode: MONOMER_CONST.P,
        }),
      );

      const renderer = createRendererForNode(
        new LinkerSequenceNode(phosphate),
        2, // middle position (not 0)
        false, // not last
      );

      expect(renderer).toBeInstanceOf(ChemSequenceItemRenderer);
    });
  });

  it('keeps chem renderer for regular linker nodes', () => {
    const chem = new Chem(createMonomerItem({}));

    const renderer = createRendererForNode(new LinkerSequenceNode(chem));

    expect(renderer).toBeInstanceOf(ChemSequenceItemRenderer);
  });

  describe('linker rendering logic', () => {
    it('uses phosphate renderer for phosphate-only linker at edge', () => {
      const phosphate = new Phosphate(
        createMonomerItem({
          MonomerType: MONOMER_CONST.RNA,
          MonomerClass: KetMonomerClass.Phosphate,
          MonomerNaturalAnalogCode: MONOMER_CONST.P,
        }),
      );

      const linkerNode = new LinkerSequenceNode(phosphate);

      const RendererClass = SequenceNodeRendererFactory.getLinkerRendererClass(
        linkerNode,
        0, // first position
        false, // not last
      );

      expect(RendererClass).toBe(PhosphateSequenceItemRenderer);
    });

    it('uses phosphate renderer for single phosphate linker at edge', () => {
      const phosphate = new Phosphate(
        createMonomerItem({
          MonomerType: MONOMER_CONST.RNA,
          MonomerClass: KetMonomerClass.Phosphate,
          MonomerNaturalAnalogCode: MONOMER_CONST.P,
        }),
      );

      const linkerNode = new LinkerSequenceNode(phosphate);

      const RendererClass = SequenceNodeRendererFactory.getLinkerRendererClass(
        linkerNode,
        0, // first position (edge)
        false,
      );

      expect(RendererClass).toBe(PhosphateSequenceItemRenderer);
    });

    it('uses phosphate renderer for ambiguous phosphate monomer at edge', () => {
      const phosphateMonomerItem = createMonomerItem({
        MonomerType: MONOMER_CONST.RNA,
        MonomerClass: KetMonomerClass.Phosphate,
        MonomerNaturalAnalogCode: '',
      });
      const phosphateMonomer = new Phosphate(phosphateMonomerItem);

      const ambiguousPhosphate = new AmbiguousMonomer({
        id: 'test-ambiguous',
        label: 'P',
        monomers: [phosphateMonomer],
        subtype: KetAmbiguousMonomerTemplateSubType.ALTERNATIVES,
        options: [],
        isAmbiguous: true,
      });
      ambiguousPhosphate.monomerClass = KetMonomerClass.Phosphate;

      const linkerNode = new LinkerSequenceNode(ambiguousPhosphate);

      const RendererClass = SequenceNodeRendererFactory.getLinkerRendererClass(
        linkerNode,
        0, // first position
        false,
      );

      expect(RendererClass).toBe(PhosphateSequenceItemRenderer);
    });

    it('uses chem renderer for phosphate linker in middle position', () => {
      const phosphate = new Phosphate(
        createMonomerItem({
          MonomerType: MONOMER_CONST.RNA,
          MonomerClass: KetMonomerClass.Phosphate,
          MonomerNaturalAnalogCode: MONOMER_CONST.P,
        }),
      );

      const linkerNode = new LinkerSequenceNode(phosphate);

      const RendererClass = SequenceNodeRendererFactory.getLinkerRendererClass(
        linkerNode,
        2, // middle position (not edge)
        false, // not last
      );

      // Even all-phosphate linker uses Chem renderer in middle
      expect(RendererClass).toBe(ChemSequenceItemRenderer);
    });
  });
});
