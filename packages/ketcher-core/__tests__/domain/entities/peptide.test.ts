import { Peptide } from 'domain/entities/Peptide';
import { peptideMonomerItem } from '../../mock-data';
import { Vec2 } from 'domain/entities';

describe('Peptide', () => {
  it('should store its position and change it properly', () => {
    const peptide = new Peptide(peptideMonomerItem);
    expect(peptide.position.x).toBe(0);
    expect(peptide.position.y).toBe(0);

    peptide.moveAbsolute(new Vec2(10, 10));

    expect(peptide.position.x).toBe(10);
    expect(peptide.position.y).toBe(10);

    peptide.moveRelative(new Vec2(2, 2));
    peptide.moveRelative(new Vec2(3, 3));

    expect(peptide.position.x).toBe(15);
    expect(peptide.position.y).toBe(15);
  });

  it('should give monomer label', () => {
    const peptide = new Peptide(peptideMonomerItem);
    expect(peptide.monomerItem.label).toBe(peptideMonomerItem.label);
  });
});
