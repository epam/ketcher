import { vi } from 'vitest';
import { SGroupRenderer } from 'application/render/renderers/SGroupRenderer';
import { notifyRenderComplete } from 'application/render/notifyRenderComplete';
import { Atom, SGroup, Struct, Vec2 } from 'domain/entities';
import { Peptide } from 'domain/entities/Peptide';
import { SGroupDrawingEntity } from 'domain/entities/SGroupDrawingEntity';
import { createPolymerEditorCanvas } from '../../../helpers/dom';
import { peptideMonomerItem } from '../../../mock-data';

vi.mock('paper', () => ({ default: { setup: vi.fn() } }));

describe('SGroupRenderer hover', () => {
  let canvas: SVGSVGElement;
  const onRenderComplete = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    notifyRenderComplete.cancel();
    window.addEventListener('renderComplete', onRenderComplete);
    canvas = createPolymerEditorCanvas();
  });

  afterEach(() => {
    canvas.remove();
    window.removeEventListener('renderComplete', onRenderComplete);
    notifyRenderComplete.cancel();
    vi.useRealTimers();
  });

  it('notifies after drawing the highlight, but not when it is already visible', () => {
    const struct = new Struct();
    const atomId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 0) }),
    );
    const group = new SGroup(SGroup.TYPES.SRU);
    group.atoms = [atomId];
    const monomer = new Peptide({ ...peptideMonomerItem, struct });
    const renderer = new SGroupRenderer(
      new SGroupDrawingEntity(group, monomer, 0),
    );
    renderer.show();

    const area = canvas.querySelector('[data-testid="s-group"] > rect');
    expect(area).not.toBeNull();
    area?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    expect(canvas.querySelector('[stroke="#0097A8"]')).not.toBeNull();
    expect(onRenderComplete).not.toHaveBeenCalled();

    vi.advanceTimersByTime(250);
    expect(onRenderComplete).toHaveBeenCalledTimes(1);

    area?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    vi.advanceTimersByTime(250);
    expect(onRenderComplete).toHaveBeenCalledTimes(1);

    area?.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(250);
    expect(onRenderComplete).toHaveBeenCalledTimes(1);
  });
});
