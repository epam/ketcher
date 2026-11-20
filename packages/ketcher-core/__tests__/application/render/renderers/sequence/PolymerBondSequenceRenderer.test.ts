import { PolymerBondSequenceRenderer } from 'application/render/renderers/sequence/PolymerBondSequenceRenderer';
import { createPolymerEditorCanvas } from '../../../../helpers/dom';
import { getFinishedPolymerBond } from '../../../../mock-data';

describe('PolymerBondSequenceRenderer', () => {
  // A layout switch clears the sequence renderers before the new mode draws
  // its own, and resetting the selection reaches them in between (#12789)
  it('does not throw when selecting a bond that is not drawn', () => {
    createPolymerEditorCanvas();
    const polymerBond = getFinishedPolymerBond(10, 10, 90, 100);
    const renderer = new PolymerBondSequenceRenderer(polymerBond);
    polymerBond.turnOnSelection();

    expect(() => renderer.drawSelection()).not.toThrow();
  });

  it('does not throw when unselecting a bond that was removed', () => {
    createPolymerEditorCanvas();
    const polymerBond = getFinishedPolymerBond(10, 10, 90, 100);
    const renderer = new PolymerBondSequenceRenderer(polymerBond);
    renderer.remove();
    polymerBond.turnOffSelection();

    expect(() => renderer.drawSelection()).not.toThrow();
  });
});
