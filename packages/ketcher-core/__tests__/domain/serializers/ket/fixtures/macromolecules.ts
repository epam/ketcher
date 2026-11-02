/* eslint-disable @typescript-eslint/no-explicit-any */

// A hand-written macromolecules KET. Counts below are written from this content:
//   monomer0  peptide A (Alanine):  7 atoms, 6 bonds, attachment points R1, R2
//   monomer1  peptide G (Glycine):  6 atoms, 5 bonds, attachment points R1, R2
//   monomer2  CHEM Sp (Spacer):     4 atoms, 3 bonds, attachment points R1, R2
//   monomer3  ambiguous monomer "alternatives" of A and G
//   mol0      a plain benzene ring (6 atoms, 6 bonds), no S-group
// Connections:
//   monomer0.R2 - monomer1.R1   polymer bond
//   monomer1.R2 - monomer2.R1   polymer bond
//   monomer2.R2 - monomer3.R1   polymer bond
//   monomer0 .. monomer2        hydrogen bond
//   monomer0.R1 - mol0 atom 5   monomer-to-molecule bond

export const ALANINE_TEMPLATE_ID = 'A___Alanine';
export const GLYCINE_TEMPLATE_ID = 'G___Glycine';
export const SPACER_TEMPLATE_ID = 'Sp___Spacer';
export const AMBIGUOUS_TEMPLATE_ID = 'alternatives__A___Alanine__G___Glycine_';

export const alanineTemplate = {
  type: 'monomerTemplate',
  atoms: [
    { label: 'N', location: [-0.866, -0.25, 0] },
    { label: 'C', location: [0, 0.25, 0], stereoLabel: 'abs' },
    { label: 'H', location: [-1.732, 0.25, 0] },
    { label: 'C', location: [0.866, -0.25, 0] },
    { label: 'O', location: [1.732, 0.25, 0] },
    { label: 'O', location: [0.866, -1.25, 0] },
    { label: 'C', location: [0, 1.25, 0] },
  ],
  bonds: [
    { type: 1, atoms: [0, 1] },
    { type: 1, atoms: [0, 2] },
    { type: 1, atoms: [1, 3] },
    { type: 1, atoms: [3, 4] },
    { type: 2, atoms: [3, 5] },
    { type: 1, atoms: [1, 6], stereo: 1 },
  ],
  class: 'AminoAcid',
  classHELM: 'PEPTIDE',
  id: ALANINE_TEMPLATE_ID,
  fullName: 'Alanine',
  alias: 'A',
  attachmentPoints: [
    { attachmentAtom: 0, leavingGroup: { atoms: [2] }, type: 'left' },
    { attachmentAtom: 3, leavingGroup: { atoms: [4] }, type: 'right' },
  ],
  naturalAnalogShort: 'A',
};

export const glycineTemplate = {
  type: 'monomerTemplate',
  atoms: [
    { label: 'N', location: [-0.866, -0.25, 0] },
    { label: 'C', location: [0, 0.25, 0] },
    { label: 'H', location: [-1.732, 0.25, 0] },
    { label: 'C', location: [0.866, -0.25, 0] },
    { label: 'O', location: [1.732, 0.25, 0] },
    { label: 'O', location: [0.866, -1.25, 0] },
  ],
  bonds: [
    { type: 1, atoms: [0, 1] },
    { type: 1, atoms: [0, 2] },
    { type: 1, atoms: [1, 3] },
    { type: 1, atoms: [3, 4] },
    { type: 2, atoms: [3, 5] },
  ],
  class: 'AminoAcid',
  classHELM: 'PEPTIDE',
  id: GLYCINE_TEMPLATE_ID,
  fullName: 'Glycine',
  alias: 'G',
  attachmentPoints: [
    { attachmentAtom: 0, leavingGroup: { atoms: [2] }, type: 'left' },
    { attachmentAtom: 3, leavingGroup: { atoms: [4] }, type: 'right' },
  ],
  naturalAnalogShort: 'G',
};

export const spacerTemplate = {
  type: 'monomerTemplate',
  atoms: [
    { label: 'C', location: [0, 0, 0] },
    { label: 'C', location: [1, 0, 0] },
    { label: 'H', location: [-1, 0, 0] },
    { label: 'H', location: [2, 0, 0] },
  ],
  bonds: [
    { type: 1, atoms: [0, 1] },
    { type: 1, atoms: [0, 2] },
    { type: 1, atoms: [1, 3] },
  ],
  class: 'CHEM',
  classHELM: 'CHEM',
  id: SPACER_TEMPLATE_ID,
  fullName: 'Spacer',
  alias: 'Sp',
  attachmentPoints: [
    { attachmentAtom: 0, leavingGroup: { atoms: [2] } },
    { attachmentAtom: 1, leavingGroup: { atoms: [3] } },
  ],
};

export const ambiguousTemplate = {
  type: 'ambiguousMonomerTemplate',
  id: AMBIGUOUS_TEMPLATE_ID,
  alias: '%',
  subtype: 'alternatives',
  options: [
    { templateId: ALANINE_TEMPLATE_ID },
    { templateId: GLYCINE_TEMPLATE_ID },
  ],
};

export const benzeneMolecule = {
  type: 'molecule',
  atoms: [
    { label: 'C', location: [13.41, -10.64, 0] },
    { label: 'C', location: [15.14, -10.64, 0] },
    { label: 'C', location: [14.28, -10.14, 0] },
    { label: 'C', location: [15.14, -11.64, 0] },
    { label: 'C', location: [13.41, -11.64, 0] },
    { label: 'C', location: [14.28, -12.14, 0] },
  ],
  bonds: [
    { type: 2, atoms: [2, 0] },
    { type: 1, atoms: [0, 4] },
    { type: 2, atoms: [4, 5] },
    { type: 1, atoms: [5, 3] },
    { type: 2, atoms: [3, 1] },
    { type: 1, atoms: [1, 2] },
  ],
};

const monomerNode = (
  id: number,
  alias: string,
  templateId: string,
  x: number,
  type = 'monomer',
) => ({
  type,
  id: String(id),
  position: { x, y: -15 },
  alias,
  templateId,
});

export const createMacromoleculesKet = (): Record<string, any> => ({
  root: {
    nodes: [
      { $ref: 'monomer0' },
      { $ref: 'monomer1' },
      { $ref: 'monomer2' },
      { $ref: 'monomer3' },
      { $ref: 'mol0' },
    ],
    connections: [
      {
        connectionType: 'single',
        endpoint1: { monomerId: 'monomer0', attachmentPointId: 'R2' },
        endpoint2: { monomerId: 'monomer1', attachmentPointId: 'R1' },
      },
      {
        connectionType: 'single',
        endpoint1: { monomerId: 'monomer1', attachmentPointId: 'R2' },
        endpoint2: { monomerId: 'monomer2', attachmentPointId: 'R1' },
      },
      {
        connectionType: 'single',
        endpoint1: { monomerId: 'monomer2', attachmentPointId: 'R2' },
        endpoint2: { monomerId: 'monomer3', attachmentPointId: 'R1' },
      },
      {
        connectionType: 'hydrogen',
        endpoint1: { monomerId: 'monomer0' },
        endpoint2: { monomerId: 'monomer2' },
      },
      {
        connectionType: 'single',
        endpoint1: { monomerId: 'monomer0', attachmentPointId: 'R1' },
        endpoint2: { moleculeId: 'mol0', atomId: '5' },
      },
    ],
    templates: [
      { $ref: `monomerTemplate-${ALANINE_TEMPLATE_ID}` },
      { $ref: `monomerTemplate-${GLYCINE_TEMPLATE_ID}` },
      { $ref: `monomerTemplate-${SPACER_TEMPLATE_ID}` },
      { $ref: `ambiguousMonomerTemplate-${AMBIGUOUS_TEMPLATE_ID}` },
    ],
  },
  mol0: structuredClone(benzeneMolecule),
  monomer0: monomerNode(0, 'A', ALANINE_TEMPLATE_ID, 10),
  monomer1: monomerNode(1, 'G', GLYCINE_TEMPLATE_ID, 14),
  monomer2: monomerNode(2, 'Sp', SPACER_TEMPLATE_ID, 18),
  monomer3: monomerNode(3, '%', AMBIGUOUS_TEMPLATE_ID, 22, 'ambiguousMonomer'),
  [`monomerTemplate-${ALANINE_TEMPLATE_ID}`]: structuredClone(alanineTemplate),
  [`monomerTemplate-${GLYCINE_TEMPLATE_ID}`]: structuredClone(glycineTemplate),
  [`monomerTemplate-${SPACER_TEMPLATE_ID}`]: structuredClone(spacerTemplate),
  [`ambiguousMonomerTemplate-${AMBIGUOUS_TEMPLATE_ID}`]:
    structuredClone(ambiguousTemplate),
});

export const macromoleculesKet = (): string =>
  JSON.stringify(createMacromoleculesKet());

// The same content without the molecule and its connection: only monomers.
export const createMonomersOnlyKet = (): Record<string, any> => {
  const ket = createMacromoleculesKet();

  ket.root.nodes = ket.root.nodes.filter(
    (node: { $ref: string }) => node.$ref !== 'mol0',
  );
  ket.root.connections = ket.root.connections.slice(0, 4);
  delete ket.mol0;

  return ket;
};

// Peptide A whose R2 is bonded to atom 2 of a benzene ring that is a superatom
// (SUP S-group) with two attachment points: the ring is read as a monomer-like
// molecule, so the connection is a polymer bond, not a monomer-to-atom bond.
export const createSuperatomMoleculeKet = (): Record<string, any> => ({
  root: {
    nodes: [{ $ref: 'monomer0' }, { $ref: 'mol0' }],
    connections: [
      {
        connectionType: 'single',
        endpoint1: { monomerId: 'monomer0', attachmentPointId: 'R2' },
        endpoint2: { moleculeId: 'mol0', atomId: '2' },
      },
    ],
    templates: [{ $ref: `monomerTemplate-${ALANINE_TEMPLATE_ID}` }],
  },
  mol0: {
    ...structuredClone(benzeneMolecule),
    atoms: [
      ...benzeneMolecule.atoms,
      { label: 'H', location: [14.28, -9.14, 0] },
      { label: 'H', location: [14.28, -13.14, 0] },
    ],
    bonds: [
      ...benzeneMolecule.bonds,
      { type: 1, atoms: [2, 6] },
      { type: 1, atoms: [5, 7] },
    ],
    sgroups: [
      {
        type: 'SUP',
        atoms: [0, 1, 2, 3, 4, 5, 6, 7],
        name: '',
        expanded: true,
        id: 0,
        attachmentPoints: [
          { attachmentAtom: 2, leavingAtom: 6, attachmentId: '1' },
          { attachmentAtom: 5, leavingAtom: 7, attachmentId: '2' },
        ],
      },
    ],
  },
  monomer0: monomerNode(0, 'A', ALANINE_TEMPLATE_ID, 10),
  [`monomerTemplate-${ALANINE_TEMPLATE_ID}`]: structuredClone(alanineTemplate),
});
