import { ReSimpleObject, ReStruct, Render } from 'application/render';
import type { RenderOptions } from 'application/render/render.types';
import {
  Atom,
  Bond,
  SGroup,
  SGroupAttachmentPoint,
  SimpleObjectMode,
  Struct,
  Vec2,
} from 'domain/entities';
import { MonomerMicromolecule } from 'domain/entities/monomerMicromolecule';
import { Peptide } from 'domain/entities/Peptide';
import { peptideMonomerItem } from '../../../mock-data';
import { AtomCIP } from 'domain/entities/types';

describe('CIP viewport lifecycle', () => {
  it('initializes viewport bounds before redrawing a reused structure', () => {
    const options = { width: 100, height: 100 };
    const render = new Render(document as unknown as HTMLElement, options);
    const update = jest.spyOn(render.ctab, 'update').mockImplementation(() => {
      expect(render.ctab.render.viewBox).toEqual({
        minX: 0,
        minY: 0,
        width: 100,
        height: 100,
      });
      return false;
    });

    try {
      new Render(document as unknown as HTMLElement, options, render, true);
      expect(update).toHaveBeenCalledWith(true);
    } finally {
      update.mockRestore();
    }
  });

  it.each(['pan', 'zoom', 'resize'])(
    'refreshes only CIP paths after %s without leaving stale labels',
    (change) => {
      const options = { width: 100, height: 100 };
      const render = new Render(document as unknown as HTMLElement, options);
      const struct = new Struct();
      const atomId = struct.atoms.add(
        new Atom({ label: 'C', pp: new Vec2(), cip: AtomCIP.S }),
      );
      render.ctab = new ReStruct(struct, render);
      const atom = render.ctab.atoms.get(atomId)!;
      const path = { remove: jest.fn() };
      atom.cip = { path } as unknown as NonNullable<typeof atom.cip>;
      atom.visel.paths.push(atom.cip.path);
      const showCIP = jest
        .spyOn(atom, 'showCIPLabel')
        .mockImplementation(() => {
          expect(atom.cip).toBeUndefined();
          expect(atom.visel.paths).not.toContain(path);
        });
      const update = jest.spyOn(render.ctab, 'update');

      if (change === 'pan') {
        render.setViewBox({ minX: 10, minY: 20, width: 100, height: 100 });
      } else if (change === 'zoom') {
        render.setZoom(2);
      } else {
        options.width = 80;
        render.resizeViewBox();
      }

      expect(path.remove).toHaveBeenCalledTimes(1);
      expect(showCIP).toHaveBeenCalledTimes(1);
      expect(update).not.toHaveBeenCalled();
    },
  );
});

describe('show selection', () => {
  const ellipse = {
    mode: SimpleObjectMode.ellipse,
    pos: [
      new Vec2({
        x: 5.025,
        y: 9.600000000000001,
        z: 0,
      }),
      new Vec2({
        x: 10.05,
        y: 12.200000000000001,
        z: 0,
      }),
    ],
  };
  const reSimpleObject = new ReSimpleObject(ellipse);
  reSimpleObject.showPoints = jest.fn();
  reSimpleObject.hidePoints = jest.fn();
  const option = {
    microModeScale: 20,
    width: 100,
    height: 100,
  } as RenderOptions;
  const render = new Render(document as unknown as HTMLElement, option);
  const restruct = new ReStruct(new Struct(), render);
  it('should show selection simple objects correctly when selected', () => {
    restruct.showItemSelection(reSimpleObject, true);
    expect(reSimpleObject.showPoints).toHaveBeenCalled();
  });
  it('should show selection simple objects correctly when unselected', () => {
    restruct.showItemSelection(reSimpleObject, false);
    expect(reSimpleObject.hidePoints).toHaveBeenCalled();
  });
});

describe('atom, bond, and CIP label rendering order', () => {
  const options = {
    microModeScale: 20,
    width: 100,
    height: 100,
  } as RenderOptions;

  it('renders atom labels and bonds before positioning CIP labels', () => {
    const struct = new Struct();
    const firstAtomId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 0) }),
    );
    const secondAtomId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(1, 0) }),
    );
    const render = new Render(document as unknown as HTMLElement, options);
    const restruct = new ReStruct(struct, render);
    const firstAtom = restruct.atoms.get(firstAtomId)!;
    const secondAtom = restruct.atoms.get(secondAtomId)!;
    const calls: string[] = [];

    jest.spyOn(firstAtom, 'show').mockImplementation(() => {
      calls.push('first atom');
    });
    jest.spyOn(secondAtom, 'show').mockImplementation(() => {
      calls.push('second atom');
    });
    jest.spyOn(restruct, 'showBonds').mockImplementation(() => {
      calls.push('bonds');
    });
    jest.spyOn(firstAtom, 'showCIPLabel').mockImplementation(() => {
      calls.push('first CIP');
    });
    jest.spyOn(secondAtom, 'showCIPLabel').mockImplementation(() => {
      calls.push('second CIP');
    });

    const internalRestruct = restruct as unknown as {
      atomsChanged: Map<number, 1>;
      showAtoms: () => void;
      showCIPLabels: () => void;
    };
    internalRestruct.atomsChanged.set(firstAtomId, 1);
    internalRestruct.atomsChanged.set(secondAtomId, 1);
    internalRestruct.showAtoms();
    restruct.showBonds();
    internalRestruct.showCIPLabels();

    expect(calls).toEqual([
      'first atom',
      'second atom',
      'bonds',
      'first CIP',
      'second CIP',
    ]);
  });
});

describe('CIP label background on selection toggle', () => {
  const option = {
    microModeScale: 20,
    width: 100,
    height: 100,
  } as RenderOptions;
  const render = new Render(document as unknown as HTMLElement, option);
  const restruct = new ReStruct(new Struct(), render);
  const cipAttrMock = jest.fn();
  const selectionPlate = {
    show: jest.fn(),
    hide: jest.fn(),
    removed: false,
  };
  const cipItem = {
    selectionPlate,
    cip: { rectangle: { attr: cipAttrMock } },
  };

  it('restores CIP label background after deselection', () => {
    restruct.showItemSelection(cipItem, true);
    restruct.showItemSelection(cipItem, false);

    expect(cipAttrMock).toHaveBeenCalledWith({
      fill: '#7f7',
      stroke: '#7f7',
    });
    expect(cipAttrMock).toHaveBeenLastCalledWith({
      fill: '#fff',
      stroke: '#fff',
    });
  });
});

describe('expanded monomer rendering', () => {
  type SvgSvgElementWithRaphaelMethods = SVGSVGElement & {
    createSVGMatrix: () => DOMMatrix;
    createSVGPoint: () => DOMPoint;
  };

  const option = {
    microModeScale: 20,
    width: 100,
    height: 100,
  } as RenderOptions;

  const addBond = (
    struct: Struct,
    begin: number,
    end: number,
    attrs: Partial<Bond> = {},
  ) => {
    const bond = new Bond({
      begin,
      end,
      type: Bond.PATTERN.TYPE.SINGLE,
      ...attrs,
    });
    const bondId = struct.bonds.add(bond);
    struct.bondInitHalfBonds(bondId, bond);
  };

  const mockSvgGeometry = () => {
    const svgSvgElement = window.SVGSVGElement
      .prototype as unknown as SvgSvgElementWithRaphaelMethods;
    svgSvgElement.createSVGMatrix = () =>
      ({
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        e: 0,
        f: 0,
        inverse() {
          return this;
        },
        multiply() {
          return this;
        },
        translate() {
          return this;
        },
        scale() {
          return this;
        },
        rotate() {
          return this;
        },
      }) as unknown as DOMMatrix;
    svgSvgElement.createSVGPoint = () =>
      ({
        x: 0,
        y: 0,
        matrixTransform() {
          return this;
        },
      }) as unknown as DOMPoint;
    window.SVGElement.prototype.getBBox = () =>
      ({ x: 0, y: 0, width: 10, height: 10 }) as DOMRect;
  };

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('shows CH3 for an expanded monomer with one visible atom and one leaving group', () => {
    const svgSvgElement = window.SVGSVGElement
      .prototype as unknown as SvgSvgElementWithRaphaelMethods;
    svgSvgElement.createSVGMatrix = () =>
      ({
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        e: 0,
        f: 0,
        inverse() {
          return this;
        },
        multiply() {
          return this;
        },
        translate() {
          return this;
        },
        scale() {
          return this;
        },
        rotate() {
          return this;
        },
      }) as unknown as DOMMatrix;
    svgSvgElement.createSVGPoint = () =>
      ({
        x: 0,
        y: 0,
        matrixTransform() {
          return this;
        },
      }) as unknown as DOMPoint;
    window.SVGElement.prototype.getBBox = () =>
      ({ x: 0, y: 0, width: 10, height: 10 }) as DOMRect;

    const struct = new Struct();
    const atomOutsideMonomerId = struct.atoms.add(
      new Atom({ label: 'N', pp: new Vec2(0, 0) }),
    );
    const attachmentAtomId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(1, 0) }),
    );
    const leavingGroupAtomId = struct.atoms.add(
      new Atom({ label: 'H', pp: new Vec2(1, 1) }),
    );

    addBond(struct, atomOutsideMonomerId, attachmentAtomId, {
      endSuperatomAttachmentPointNumber: 1,
    });
    addBond(struct, attachmentAtomId, leavingGroupAtomId);

    const monomer = new Peptide(peptideMonomerItem);
    const monomerSGroup = new MonomerMicromolecule(SGroup.TYPES.SUP, monomer);
    const monomerSGroupId = struct.sgroups.add(monomerSGroup);
    monomerSGroup.id = monomerSGroupId;
    monomerSGroup.data.expanded = true;
    monomerSGroup.pp = new Vec2(1, 0);
    struct.atomAddToSGroup(monomerSGroupId, attachmentAtomId);
    struct.atomAddToSGroup(monomerSGroupId, leavingGroupAtomId);
    monomerSGroup.addAttachmentPoint(
      new SGroupAttachmentPoint(
        attachmentAtomId,
        leavingGroupAtomId,
        undefined,
        1,
      ),
    );

    const neighboringMonomer = new Peptide(peptideMonomerItem);
    const neighboringMonomerSGroup = new MonomerMicromolecule(
      SGroup.TYPES.SUP,
      neighboringMonomer,
    );
    const neighboringMonomerSGroupId = struct.sgroups.add(
      neighboringMonomerSGroup,
    );
    neighboringMonomerSGroup.id = neighboringMonomerSGroupId;
    neighboringMonomerSGroup.data.expanded = true;
    neighboringMonomerSGroup.pp = new Vec2(0, 0);
    struct.atomAddToSGroup(neighboringMonomerSGroupId, atomOutsideMonomerId);

    struct.initNeighbors();
    struct.setImplicitHydrogen();

    const container = document.createElement('div');
    document.body.appendChild(container);
    const render = new Render(container, option);
    const restruct = new ReStruct(struct, render);
    restruct.update(true);

    const visibleText = Array.from(container.querySelectorAll('text')).map(
      (element) => element.textContent,
    );

    expect(Atom.isHiddenLeavingGroupAtom(struct, leavingGroupAtomId)).toBe(
      true,
    );
    expect(visibleText).toContain('C');
    expect(visibleText).toContain('H');
    expect(visibleText).toContain('3');
  });

  it('renders bold foreground stereo bond when wide endpoint is visible oxygen label', () => {
    mockSvgGeometry();

    const struct = new Struct();
    const incomingCarbonAtomId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 1) }),
    );
    const centralCarbonAtomId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(1, 0) }),
    );
    const oxygenAtomId = struct.atoms.add(
      new Atom({ label: 'O', pp: new Vec2(2, 0) }),
    );
    const incomingOxygenAtomId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(3, 1) }),
    );

    addBond(struct, incomingCarbonAtomId, centralCarbonAtomId, {
      stereo: Bond.PATTERN.STEREO.UP,
    });
    addBond(struct, centralCarbonAtomId, oxygenAtomId, {
      stereo: Bond.PATTERN.STEREO.UP,
    });
    addBond(struct, incomingOxygenAtomId, oxygenAtomId, {
      stereo: Bond.PATTERN.STEREO.UP,
    });

    struct.initNeighbors();
    struct.setImplicitHydrogen();

    const container = document.createElement('div');
    document.body.appendChild(container);
    const render = new Render(container, option);
    const restruct = new ReStruct(struct, render);
    restruct.update(true);

    const centralStereoBond = container.querySelector(
      [
        'path[data-testid="bond"]',
        `[data-fromatomid="${centralCarbonAtomId}"]`,
        `[data-toatomid="${oxygenAtomId}"]`,
        `[data-bondstereo="${Bond.PATTERN.STEREO.UP}"]`,
      ].join(''),
    );
    const pathData = centralStereoBond?.getAttribute('d') ?? '';
    const lineCommandsAmount = pathData.match(/L/g)?.length ?? 0;

    expect(centralStereoBond).not.toBeNull();
    expect(lineCommandsAmount).toBe(3);
  });
});
