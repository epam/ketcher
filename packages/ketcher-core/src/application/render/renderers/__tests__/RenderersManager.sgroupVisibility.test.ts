import { RenderersManager } from '../RenderersManager';
import { AtomRenderer } from '../AtomRenderer';
import { BondRenderer } from '../BondRenderer';
import type { SGroupRenderer } from '../SGroupRenderer';
import { KetcherLogger } from 'utilities';
import { AtomCIP } from 'domain/entities/types';
import type { Atom } from 'domain/entities/CoreAtom';
import type { Bond } from 'domain/entities/CoreBond';
import {
  at,
  connect,
  createAtom,
  createCanvas,
  disconnect,
  installEditorStub,
  mockTextBoxes,
} from './atomRendererHarness';

// The singleton needs a live canvas; the renderers only read its view model.
jest.mock('application/editor/editorSingleton', () => ({
  provideEditorInstance: jest.fn(),
}));
jest.mock('application/ketcherProvider', () => ({
  ketcherProvider: {
    getKetcher: () => ({ settingsService: undefined }),
  },
}));

// A collapsed S-group hides the atoms and bonds inside it every time the
// structure is rerendered (RenderersManager.rerenderSGroups), and the check of
// hydrogen sides runs after that, redrawing atoms and their bonds.
describe('RenderersManager keeps what a collapsed S-group hides hidden', () => {
  let restoreBoxes: () => void;
  let manager: RenderersManager;

  beforeEach(() => {
    createCanvas();
    installEditorStub();
    restoreBoxes = mockTextBoxes();
    manager = new RenderersManager({ theme: {} });
    // The bonds have no half-edges here, which a bond renderer warns about.
    jest.spyOn(KetcherLogger, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    restoreBoxes();
    jest.restoreAllMocks();
  });

  const isHidden = (element: Element | null | undefined) =>
    (element as HTMLElement | null)?.style.display === 'none';

  const bondRoot = (bond: Bond) =>
    document.querySelector(`[data-bondid="${bond.id}"]`);

  const atomRoot = (atom: Atom) =>
    document.querySelector(`[data-atomid="${atom.id}"]`);

  // The superatom stands for the hidden atom and the bond to it, the way the
  // collapsed S-group of a monomer does in SGroupRenderer.
  function collapseSGroupOf(hiddenAtom: Atom, hiddenBond: Bond) {
    manager.sgroups.set(1, {
      remove: jest.fn(),
      show: jest.fn(),
      moveLabelsToFront: jest.fn(),
      applyExpandedStateToStructure: (
        atomRenderers: Map<number, AtomRenderer>,
        bondRenderers: Map<number, BondRenderer>,
      ) => {
        atomRenderers.get(hiddenAtom.id)?.setVisibility(false);
        bondRenderers.get(hiddenBond.id)?.setVisibility(false);
      },
    } as unknown as SGroupRenderer);
  }

  // A ring-like N with a visible bond down-left, a bond down-right to an atom
  // hidden by the S-group, and CIP and stereo labels. Its H are on top.
  // Deleting the visible bond frees the side, so the N is redrawn and the
  // bond to the hidden atom is trimmed again.
  function drawStructure() {
    const centre = createAtom(at(0, 0), {
      cip: AtomCIP.R,
      stereoLabel: '&1',
    });
    const visible = createAtom(at(210));
    const hidden = createAtom(at(330));
    const visibleBond = connect(centre, visible);
    const hiddenBond = connect(centre, hidden);
    [centre, visible, hidden].forEach((atom) => {
      manager.addAtom(atom);
    });
    [visibleBond, hiddenBond].forEach((bond) => manager.addBond(bond));
    collapseSGroupOf(hidden, hiddenBond);
    manager.rerenderSGroups();
    return { centre, visible, hidden, visibleBond, hiddenBond };
  }

  function deleteVisibleBond({
    visibleBond,
  }: ReturnType<typeof drawStructure>) {
    disconnect(visibleBond);
    manager.deleteBond(visibleBond);
    manager.runPostRenderMethods();
  }

  it('hides the bond and atom of the S-group before anything is redrawn', () => {
    const { hidden, hiddenBond } = drawStructure();

    expect(isHidden(bondRoot(hiddenBond))).toBe(true);
    expect(isHidden(atomRoot(hidden))).toBe(true);
  });

  it('keeps a hidden bond hidden when the check redraws its atom', () => {
    const structure = drawStructure();
    const labelBefore = document.querySelector(
      `[data-atomid="${structure.centre.id}"] text`,
    );

    deleteVisibleBond(structure);

    expect(
      document.querySelector(`[data-atomid="${structure.centre.id}"] text`),
    ).not.toBe(labelBefore);
    expect(isHidden(bondRoot(structure.hiddenBond))).toBe(true);
  });

  it('keeps a hidden atom hidden when the check redraws its neighbour', () => {
    const structure = drawStructure();

    deleteVisibleBond(structure);

    expect(isHidden(atomRoot(structure.hidden))).toBe(true);
  });

  it('keeps the CIP and stereo labels of a hidden atom hidden when the check redraws it', () => {
    // The hidden atom has a bond to the right, so its H are on the left.
    // Deleting that bond moves them to the right and redraws the label,
    // which builds the CIP and stereo labels again.
    const visible = createAtom(at(0, 0));
    const hidden = createAtom(at(150), {
      cip: AtomCIP.S,
      stereoLabel: 'abs',
    });
    const bond = connect(visible, hidden);
    [visible, hidden].forEach((atom) => manager.addAtom(atom));
    manager.addBond(bond);
    collapseSGroupOf(hidden, bond);
    manager.rerenderSGroups();
    const labelBefore = document.querySelector(
      `[data-atomid="${hidden.id}"] text`,
    );

    disconnect(bond);
    manager.deleteBond(bond);
    manager.runPostRenderMethods();

    expect(
      document.querySelector(`[data-atomid="${hidden.id}"] text`),
    ).not.toBe(labelBefore);
    expect(isHidden(document.querySelector(`#cip-atom-${hidden.id}`))).toBe(
      true,
    );
    expect(isHidden(document.querySelector(`#stereo-atom-${hidden.id}`))).toBe(
      true,
    );
  });

  it('keeps the atom that is not in the S-group visible', () => {
    const structure = drawStructure();

    deleteVisibleBond(structure);

    expect(isHidden(atomRoot(structure.centre))).toBe(false);
    expect(isHidden(atomRoot(structure.visible))).toBe(false);
  });

  it('keeps a bond that is not in the S-group visible after it is trimmed again', () => {
    const structure = drawStructure();
    const third = createAtom(at(90));
    const thirdBond = connect(structure.centre, third);
    manager.addAtom(third);
    manager.addBond(thirdBond);
    manager.runPostRenderMethods();
    expect(isHidden(bondRoot(thirdBond))).toBe(false);

    deleteVisibleBond(structure);

    expect(bondRoot(thirdBond)).not.toBeNull();
    expect(isHidden(bondRoot(thirdBond))).toBe(false);
  });

  it('does not touch the S-groups when no label was redrawn', () => {
    drawStructure();
    const apply = jest.spyOn(
      manager.sgroups.get(1) as SGroupRenderer,
      'applyExpandedStateToStructure',
    );

    manager.runPostRenderMethods();

    expect(apply).not.toHaveBeenCalled();
  });
});
