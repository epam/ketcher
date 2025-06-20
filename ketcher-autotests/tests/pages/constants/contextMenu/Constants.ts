import { Locator } from '@playwright/test';

export type ClickTarget = Locator | { x: number; y: number };

export enum MonomerOption {
  Copy = 'copy',
  CreateAntisenseRNAStrand = 'create_antisense_rna_chain',
  CreateAntisenseDNAStrand = 'create_antisense_dna_chain',
  ModifyAminoAcids = 'modify_amino_acids',
  Delete = 'delete',
}

export enum ModifyAminoAcidsOption {
  NaturalAminoAcid = 'aminoAcidModification-Natural amino acid',
  Citrullination = 'aminoAcidModification-Citrullination',
  Hydroxylation = 'aminoAcidModification-Hydroxylation',
  Inversion = 'aminoAcidModification-Inversion',
  NMethylation = 'aminoAcidModification-N-methylation',
  Phosphorylation = 'aminoAcidModification-Phosphorylation',
  SideChainAcetylation = 'aminoAcidModification-Side chain acetylation',
}

export type ContextMenuOption = MonomerOption | ModifyAminoAcidsOption;
