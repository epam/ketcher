import type { Struct } from 'domain/entities/struct';
import { SupportedFormat } from './structFormatter.types';

export const MOLFILE_V2000_ATOM_BOND_LIMIT = 999;

export function isMolfileV2000LimitExceeded(struct: Struct): boolean {
  return (
    struct.atoms.size > MOLFILE_V2000_ATOM_BOND_LIMIT ||
    struct.bonds.size > MOLFILE_V2000_ATOM_BOND_LIMIT
  );
}

export { isMolfileV2000LimitExceeded as exceedsMolfileV2000Limit };

// Ketcher's own V2000 parser cannot read query features (MRV lines),
// so such molfiles are loaded by Indigo (#9905)
export function isMolfileWithQueryFeatures(
  format: SupportedFormat,
  struct: string,
): boolean {
  return format === SupportedFormat.mol && struct.includes('MRV');
}

export const macromoleculesFilesInputFormats = {
  ket: 'chemical/x-indigo-ket',
  mol: 'chemical/x-mdl-molfile',
  seq: {
    rna: 'chemical/x-rna-sequence',
    dna: 'chemical/x-dna-sequence',
    peptide: 'chemical/x-peptide-sequence',
    peptide3Letter: 'chemical/x-peptide-sequence-3-letter',
  },
  fasta: {
    rna: 'chemical/x-rna-fasta',
    dna: 'chemical/x-dna-fasta',
    peptide: 'chemical/x-peptide-fasta',
  },
  idt: 'chemical/x-idt',
  'axo-labs': 'chemical/x-axo-labs',
  helm: 'chemical/x-helm',
  biln: 'chemical/x-biln',
};
