import { Peptide } from 'domain/entities/Peptide';
import { PolymerBond } from 'domain/entities/PolymerBond';
import { AttachmentPointName } from 'domain/types';
import { peptideMonomerItem } from '../../mock-data';

describe('BaseMonomer attachment points', () => {
  it('includes own free attachment points but excludes inherited ones', () => {
    const monomer = new Peptide(peptideMonomerItem);
    monomer.attachmentPointsToBonds = Object.assign(
      Object.create({ R2: null }),
      { R1: null, R3: undefined },
    );

    expect(monomer.listOfAttachmentPoints).toEqual([
      AttachmentPointName.R1,
      AttachmentPointName.R3,
    ]);
  });

  it('does not treat free attachment points as bonds', () => {
    const monomer = new Peptide(peptideMonomerItem);
    monomer.attachmentPointsToBonds = { R1: null, R2: undefined };
    const callback = jest.fn();

    monomer.forEachBond(callback);

    expect(callback).not.toHaveBeenCalled();
    expect(monomer.hasBonds).toBe(false);
  });

  it('iterates occupied attachment points', () => {
    const monomer = new Peptide(peptideMonomerItem);
    const otherMonomer = new Peptide(peptideMonomerItem);
    const bond = new PolymerBond(monomer, otherMonomer);
    monomer.attachmentPointsToBonds = { R1: null, R2: bond };
    const callback = jest.fn();

    monomer.forEachBond(callback);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(bond, AttachmentPointName.R2);
    expect(monomer.hasBonds).toBe(true);
  });
});
