import { ReSimpleObject, ReStruct, Render } from 'application/render';
import { RenderOptions } from 'application/render/render.types';
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
      } as unknown as DOMMatrix);
    svgSvgElement.createSVGPoint = () =>
      ({
        x: 0,
        y: 0,
        matrixTransform() {
          return this;
        },
      } as unknown as DOMPoint);
    window.SVGElement.prototype.getBBox = () =>
      ({ x: 0, y: 0, width: 10, height: 10 } as DOMRect);

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
});
