import { getFinishedPolymerBond } from '../../mock-data';
import { createPolymerEditorCanvas } from '../../helpers/dom';

describe('Polymer Bond', () => {
  it('should be finished if has links to two monomers', () => {
    createPolymerEditorCanvas();
    const polymerBond = getFinishedPolymerBond(10, 10, 90, 100);

    polymerBond.moveToLinkedMonomers();

    expect(polymerBond.finished).toBe(true);
    expect(polymerBond.startPosition.x).toBe(10);
    expect(polymerBond.startPosition.y).toBe(10);
    expect(polymerBond.endPosition.x).toBe(90);
    expect(polymerBond.endPosition.y).toBe(100);
  });

  it('should change selection', () => {
    const polymerBond = getFinishedPolymerBond(10, 10, 90, 100);

    expect(polymerBond.selected).toBe(false);
    polymerBond.turnOnSelection();
    expect(polymerBond.selected).toBe(true);
    polymerBond.turnOffSelection();
    expect(polymerBond.selected).toBe(false);
  });
});
