import {
  Nucleotide,
  Nucleoside,
  Phosphate,
  UnresolvedMonomer,
  LinkerSequenceNode,
} from 'domain/entities';
import {
  BaseSequenceItemRenderer,
  SequenceNodeRendererFactory,
} from 'application/render';
import { RendererPool } from '../pooling/RendererPool';
import { NucleotideSequenceItemRenderer } from './NucleotideSequenceItemRenderer';
import { NucleosideSequenceItemRenderer } from './NucleosideSequenceItemRenderer';
import { PeptideSequenceItemRenderer } from './PeptideSequenceItemRenderer';
import { PhosphateSequenceItemRenderer } from './PhosphateSequenceItemRenderer';
import { EmptySequenceItemRenderer } from './EmptySequenceItemRenderer';
import { ChemSequenceItemRenderer } from './ChemSequenceItemRenderer';
import { UnresolvedMonomerSequenceItemRenderer } from './UnresolvedMonomerSequenceItemRenderer';
import { UnsplitNucleotideSequenceItemRenderer } from './UnsplitNucleotideSequenceItemRenderer';
import { AmbiguousSequenceItemRenderer } from './AmbiguousSequenceItemRenderer';
import { BackBoneSequenceItemRenderer } from './BackBoneSequenceItemRenderer';
import { SequenceNodeOptions } from './types';
import { EmptySequenceNode } from 'domain/entities/EmptySequenceNode';
import { BackBoneSequenceNode } from 'domain/entities/BackBoneSequenceNode';
import { AmbiguousMonomerSequenceNode } from 'domain/entities/AmbiguousMonomerSequenceNode';
import { MONOMER_CONST } from 'domain/constants';

export class SequenceNodeRendererPool {
  private static nucleotideRendererPool = new RendererPool<
    SequenceNodeOptions,
    NucleotideSequenceItemRenderer
  >(
    'nucleotide-sequence-item-pool',
    (c) => new NucleotideSequenceItemRenderer(c),
  );

  private static nucleosideRendererPool = new RendererPool<
    SequenceNodeOptions,
    NucleosideSequenceItemRenderer
  >(
    'nucleoside-sequence-item-pool',
    (c) => new NucleosideSequenceItemRenderer(c),
  );

  private static peptideRendererPool = new RendererPool<
    SequenceNodeOptions,
    PeptideSequenceItemRenderer
  >('peptide-sequence-item-pool', (c) => new PeptideSequenceItemRenderer(c));

  private static phosphateRendererPool = new RendererPool<
    SequenceNodeOptions,
    PhosphateSequenceItemRenderer
  >(
    'phosphate-sequence-item-pool',
    (c) => new PhosphateSequenceItemRenderer(c),
  );

  private static emptyRendererPool = new RendererPool<
    SequenceNodeOptions,
    EmptySequenceItemRenderer
  >('empty-sequence-item-pool', (c) => new EmptySequenceItemRenderer(c));

  private static chemRendererPool = new RendererPool<
    SequenceNodeOptions,
    ChemSequenceItemRenderer
  >('chem-sequence-item-pool', (c) => new ChemSequenceItemRenderer(c));

  private static unresolvedRendererPool = new RendererPool<
    SequenceNodeOptions,
    UnresolvedMonomerSequenceItemRenderer
  >(
    'unresolved-sequence-item-pool',
    (c) => new UnresolvedMonomerSequenceItemRenderer(c),
  );

  private static unsplitNucleotideRendererPool = new RendererPool<
    SequenceNodeOptions,
    UnsplitNucleotideSequenceItemRenderer
  >(
    'unsplit-nucleotide-sequence-item-pool',
    (c) => new UnsplitNucleotideSequenceItemRenderer(c),
  );

  private static ambiguousRendererPool = new RendererPool<
    SequenceNodeOptions,
    AmbiguousSequenceItemRenderer
  >(
    'ambiguous-sequence-item-pool',
    (c) => new AmbiguousSequenceItemRenderer(c),
  );

  private static backboneRendererPool = new RendererPool<
    SequenceNodeOptions,
    BackBoneSequenceItemRenderer
  >('backbone-sequence-item-pool', (c) => new BackBoneSequenceItemRenderer(c));

  public static acquire<T = BaseSequenceItemRenderer>(
    options: SequenceNodeOptions,
  ): T {
    options.previousRowsWithAntisense = options.previousRowsWithAntisense ?? 0;

    const { node } = options;

    // Check node types first
    if (node instanceof EmptySequenceNode) {
      return this.emptyRendererPool.acquire(options) as unknown as T;
    }

    if (node instanceof BackBoneSequenceNode) {
      return this.backboneRendererPool.acquire(options) as unknown as T;
    }

    if (node instanceof AmbiguousMonomerSequenceNode) {
      return this.ambiguousRendererPool.acquire(options) as unknown as T;
    }

    if (node instanceof LinkerSequenceNode) {
      return this.chemRendererPool.acquire(options) as unknown as T;
    }

    // Check monomer types
    const monomer = node.monomer;

    if (monomer instanceof UnresolvedMonomer) {
      return this.unresolvedRendererPool.acquire(options) as unknown as T;
    }

    if (node.constructor === Nucleotide) {
      return this.nucleotideRendererPool.acquire(options) as unknown as T;
    }

    if (node.constructor === Nucleoside) {
      return this.nucleosideRendererPool.acquire(options) as unknown as T;
    }

    if (monomer instanceof Phosphate) {
      return this.phosphateRendererPool.acquire(options) as unknown as T;
    }

    if (
      'monomerClass' in monomer &&
      (monomer as unknown as { monomerClass: string }).monomerClass ===
        MONOMER_CONST.AMINO_ACID
    ) {
      return this.peptideRendererPool.acquire(options) as unknown as T;
    }

    if (
      'monomerClass' in monomer &&
      (monomer as unknown as { monomerClass: string }).monomerClass ===
        MONOMER_CONST.CHEM
    ) {
      return this.chemRendererPool.acquire(options) as unknown as T;
    }

    // Fallback to factory for any other types
    return SequenceNodeRendererFactory.fromNode(options);
  }

  public static clear(): void {
    this.nucleotideRendererPool.clear();
    this.nucleosideRendererPool.clear();
    this.peptideRendererPool.clear();
    this.phosphateRendererPool.clear();
    this.emptyRendererPool.clear();
    this.chemRendererPool.clear();
    this.unresolvedRendererPool.clear();
    this.unsplitNucleotideRendererPool.clear();
    this.ambiguousRendererPool.clear();
    this.backboneRendererPool.clear();
  }
}

(window as unknown as { PoolData: SequenceNodeRendererPool }).PoolData =
  SequenceNodeRendererPool;
