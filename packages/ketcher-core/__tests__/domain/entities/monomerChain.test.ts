import { Chain } from 'domain/entities/monomer-chains/Chain';
import { Phosphate } from 'domain/entities/Phosphate';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { MonomerSequenceNode } from 'domain/entities/MonomerSequenceNode';
import { type MonomerItemType, AttachmentPointName } from 'domain/types';
import { KetMonomerClass } from 'domain/constants/monomers';
import { Struct, Vec2 } from 'domain/entities';

// Helper to create a phosphate monomer item
const createPhosphateMonomerItem = (isAntisense: boolean): MonomerItemType => ({
  favorite: false,
  label: 'P',
  props: {
    BranchMonomer: '',
    MonomerCaps: { R1: 'H', R2: 'OH' },
    MonomerCode: 'P',
    MonomerName: 'Phosphate',
    MonomerType: 'PHOSPHATE',
    MonomerClass: KetMonomerClass.Phosphate,
    Name: 'Phosphate',
    MonomerNaturalAnalogCode: 'P',
  },
  struct: new Struct(),
  isAntisense,
});

describe('Chain - Antisense Phosphate Rendering', () => {
  /**
   * Test for issue #6438: System shows phosphate as CHEM in antisense chain
   * Terminal phosphates in antisense chains should be rendered as "p" (MonomerSequenceNode)
   * not as "@" (LinkerSequenceNode)
   */

  it('should render antisense phosphate as standalone (MonomerSequenceNode) when followed by another phosphate', () => {
    // Arrange: Create two phosphates in antisense chain (p-p pattern)
    const phosphate1 = new Phosphate(createPhosphateMonomerItem(true));
    const phosphate2 = new Phosphate(createPhosphateMonomerItem(true));
    phosphate1.moveAbsolute(new Vec2(0, 0));
    phosphate2.moveAbsolute(new Vec2(1, 0));

    // Connect them: phosphate1(R2) -> phosphate2(R1)
    const bond = new PolymerBond(phosphate1);
    bond.setSecondMonomer(phosphate2);
    phosphate1.setBond(AttachmentPointName.R2, bond);
    phosphate2.setBond(AttachmentPointName.R1, bond);

    // Act: Create chain starting with first phosphate
    const chain = new Chain(phosphate1);

    // Assert: First phosphate should be MonomerSequenceNode (displayed as "p")
    // because it's followed by another phosphate, not a nucleoside/nucleotide
    expect(chain.nodes.length).toBeGreaterThan(0);
    const phosphate1Node = chain.nodes.find((node) =>
      node.monomers.includes(phosphate1),
    );
    expect(phosphate1Node).toBeDefined();
    expect(phosphate1Node).toBeInstanceOf(MonomerSequenceNode);
  });

  it('should render standalone antisense phosphate as MonomerSequenceNode', () => {
    // Arrange: Create a single antisense phosphate (no connections)
    const phosphate = new Phosphate(createPhosphateMonomerItem(true));
    phosphate.moveAbsolute(new Vec2(0, 0));

    // Act: Create chain with just the phosphate
    const chain = new Chain(phosphate);

    // Assert: Standalone antisense phosphate should be MonomerSequenceNode (displayed as "p")
    expect(chain.nodes.length).toBe(1);
    expect(chain.nodes[0]).toBeInstanceOf(MonomerSequenceNode);
    expect(chain.nodes[0].monomers).toContain(phosphate);
  });

  it('should render sense standalone phosphate as MonomerSequenceNode', () => {
    // Arrange: Create a single sense phosphate (no connections)
    const phosphate = new Phosphate(createPhosphateMonomerItem(false));
    phosphate.moveAbsolute(new Vec2(0, 0));

    // Act: Create chain with just the phosphate
    const chain = new Chain(phosphate);

    // Assert: Standalone sense phosphate should also be MonomerSequenceNode
    // (this is existing behavior - we're verifying we didn't break it)
    expect(chain.nodes.length).toBe(1);
    expect(chain.nodes[0]).toBeInstanceOf(MonomerSequenceNode);
    expect(chain.nodes[0].monomers).toContain(phosphate);
  });
});
