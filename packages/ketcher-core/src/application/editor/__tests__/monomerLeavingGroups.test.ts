import fs from 'node:fs';
import path from 'node:path';
import type {
  IKetMacromoleculesContent,
  IKetMonomerTemplate,
} from 'application/formatters';
import { Elements } from 'domain/constants';

const library: IKetMacromoleculesContent = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/monomers.ket'), 'utf8'),
);

describe('Leaving groups in the default library', () => {
  // An attachment point is labelled only when its leaving group atom is an
  // element: a pseudo atom (e.g. "OH") is drawn with its own label instead,
  // which hid R2 of PEG-4 in every preview (#5551)
  it('are element atoms', () => {
    const pseudoLeavingAtoms = library.root.templates
      .map(({ $ref }) => library[$ref] as IKetMonomerTemplate)
      .flatMap(({ alias, atoms, attachmentPoints = [] }) =>
        attachmentPoints.flatMap(({ leavingGroup }) =>
          leavingGroup.atoms
            .map((atomId) => atoms[atomId]?.label)
            .filter((label) => !label || !Elements.get(label))
            .map((label) => `${alias}: ${label}`),
        ),
      );

    expect(pseudoLeavingAtoms).toEqual([]);
  });
});
