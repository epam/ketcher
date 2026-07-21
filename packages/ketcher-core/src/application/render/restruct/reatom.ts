/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { Atom, StereoLabel } from 'domain/entities/atom';
import { Bond } from 'domain/entities/bond';
import { FunctionalGroup } from 'domain/entities/functionalGroup';
import type { SGroup } from 'domain/entities/sgroup';
import type { Struct } from 'domain/entities/struct';
import { Box2Abs } from 'domain/entities/box2Abs';
import { StereoFlag } from 'domain/entities/fragment';
import { Vec2 } from 'domain/entities/vec2';
import { ElementColor, Elements } from 'domain/constants';
import {
  LayerMap,
  StereoLabelStyleType,
  StereoColoringType,
} from './generalEnumTypes';

import ReObject from './reobject';
import type ReStruct from './restruct';
import type { Render } from '../raphaelRender';
import type { Element, RaphaelSet } from 'raphael';
import { Scale } from 'domain/helpers';
import draw from '../draw';
import util from '../util';
import { toFixed } from 'utilities';
import type {
  RelativeBox,
  RenderOptions,
  RenderOptionStyles,
} from 'application/render/render.types';
import { UsageInMacromolecule } from 'application/render/render.constants';
import { MonomerMicromolecule } from 'domain/entities/monomerMicromolecule';
import { type AttachmentPointName, attachmentPointNames } from 'domain/types';
import { getAttachmentPointLabel } from 'domain/helpers/attachmentPointCalculations';
import { VALENCE_MAP } from 'application/render/restruct/constants';
import { SUPERATOM_CLASS_TEXT } from 'application/render/restruct/resgroup';
import assert from 'assert';
import { getAttachmentPointTooltip } from 'domain/helpers/attachmentPointTooltips';
import { ShowHydrogenLabels } from './showHydrogenLabels';

interface ElemAttr {
  text: string;
  path: Element | RaphaelSet;
  rbb: RelativeBox;
  background?: Element;
}

const StereoLabelMinOpacity = 0.3;
const DEFAULT_STEREO_COLOR = '#000';
const MAX_LABEL_LENGTH = 8;

export enum ShowHydrogenLabelNames {
  Off = 'Off',
  Hetero = 'Hetero',
  Terminal = 'Terminal',
  TerminalAndHetero = 'Terminal and Hetero',
  On = 'On',
}

class ReAtom extends ReObject {
  a: Atom;
  showLabel: boolean;
  showInfoLabel: boolean;
  hydrogenOnTheLeft: boolean;
  color: string;
  component: number;
  label?: ElemAttr;
  infoLabel?: string;
  cip?: {
    // Raphael paths
    path: RaphaelSet;
    text: Element;
    rectangle: Element;
  };

  private expandedMonomerAttachmentPoints?: Element | null;

  constructor(atom: Atom) {
    super('atom');
    this.a = atom; // TODO rename a to item
    this.showLabel = false;
    this.showInfoLabel = false;

    this.hydrogenOnTheLeft = false;

    this.color = '#000000';
    this.component = -1;
  }

  static isSelectable(): true {
    return true;
  }

  getVBoxObj(render: Render): Box2Abs | null {
    if (this.visel.boundingBox) {
      return ReObject.prototype.getVBoxObj.call(this, render);
    }
    return new Box2Abs(this.a.pp, this.a.pp);
  }

  drawHover(render: Render, drawOutline = true) {
    const ret = this.makeHoverPlate(render, drawOutline);

    render.ctab.addReObjectPath(LayerMap.atom, this.visel, ret);
    this.attachHighlightTriggerForAttachmentPointAtom(ret, render);
    this.drawHoverForPotentialAttachmentPointAtomsInMonomerCreationWizard(
      render,
      drawOutline,
    );

    return ret;
  }

  private attachHighlightTriggerForAttachmentPointAtom(
    hoverElement: Element | null,
    render: Render,
  ) {
    if (!render.monomerCreationState) {
      return;
    }

    const atomId = render.ctab.molecule.atoms.keyOf(this.a);
    if (atomId === null) {
      return;
    }

    const { assignedAttachmentPoints } = render.monomerCreationState;

    const attachmentPointEntry = Array.from(
      assignedAttachmentPoints.entries(),
    ).find(([, atomsPair]) => {
      const [attachmentAtomId, leavingAtomId] = atomsPair;
      return attachmentAtomId === atomId || leavingAtomId === atomId;
    });

    if (attachmentPointEntry && hoverElement) {
      const [attachmentPointName] = attachmentPointEntry;
      hoverElement.hover(
        () => {
          window.dispatchEvent(
            new CustomEvent<AttachmentPointName>(
              'highlightAttachmentPointControls',
              {
                detail: attachmentPointName,
              },
            ),
          );
        },
        () => {
          window.dispatchEvent(
            new CustomEvent<AttachmentPointName>(
              'resetHighlightAttachmentPointControls',
              {
                detail: attachmentPointName,
              },
            ),
          );
        },
      );
    }
  }

  private drawHoverForPotentialAttachmentPointAtomsInMonomerCreationWizard(
    render: Render,
    drawOutline = true,
  ) {
    if (!render.monomerCreationState || !drawOutline) {
      return;
    }

    const { potentialAttachmentPoints, assignedAttachmentPoints } =
      render.monomerCreationState;
    const atomId = render.ctab.molecule.atoms.keyOf(this.a);

    if (atomId === null) {
      return;
    }

    const potentialLeavingGroups = Array.from(
      potentialAttachmentPoints.values(),
    );

    const isAtomInAssignedAttachmentPoint = Array.from(
      assignedAttachmentPoints.values(),
    ).some((atomsPair) => {
      const [attachmentAtomId, leavingAtomId] = atomsPair;
      return attachmentAtomId === atomId || leavingAtomId === atomId;
    });

    if (isAtomInAssignedAttachmentPoint) {
      return;
    }

    const isPotentialAttachmentPointAtom =
      potentialAttachmentPoints.has(atomId) ||
      this.a.implicitH > 0 ||
      potentialLeavingGroups.some((leavingAtomIds) =>
        leavingAtomIds.has(atomId),
      );
    if (isPotentialAttachmentPointAtom) {
      const path = this.makeHighlightePlate(render.ctab, {
        stroke: '#43B5C0',
        'stroke-dasharray': '- ',
      });
      render.ctab.addReObjectPath(LayerMap.atom, this.visel, path);
    }
  }

  setHover(hover: boolean, render: Render, drawOutline = true) {
    super.setHover(hover, render, drawOutline);

    if (!hover || this.selected) {
      this.expandedMonomerAttachmentPoints?.hide();

      return;
    }

    if (this.expandedMonomerAttachmentPoints?.removed) {
      this.expandedMonomerAttachmentPoints = undefined;
    }

    if (this.expandedMonomerAttachmentPoints) {
      this.expandedMonomerAttachmentPoints.show();
    } else {
      this.expandedMonomerAttachmentPoints =
        this.makeMonomerAttachmentPointHighlightPlate(render);
    }

    return this.hover;
  }

  public makeMonomerAttachmentPointHighlightPlate(render: Render) {
    const restruct = render.ctab;
    const struct = restruct.molecule;
    const aid = struct.atoms.keyOf(this.a) ?? undefined;
    const sgroup = struct.getGroupFromAtomId(aid);

    if (!(sgroup instanceof MonomerMicromolecule)) {
      return;
    }

    let style: RenderOptionStyles | undefined;

    if (Atom.isSuperatomAttachmentAtom(struct, aid)) {
      style = { fill: 'none', stroke: '#4da3f8', 'stroke-width': '2px' };
    }

    if (Atom.isSuperatomLeavingGroupAtom(struct, aid)) {
      style = {
        fill: '#fff8c5',
        stroke: '#f8dc8f',
        'stroke-width': '2px',
      };
    }

    if (style) {
      const path = this.makeHighlightePlate(restruct, style, -4);

      restruct.addReObjectPath(LayerMap.atom, this.visel, path);

      return path;
    }
  }

  getLabeledSelectionContour(render: Render, highlightPadding = 0) {
    const { paper, ctab: restruct, options } = render;
    const { fontszInPx, radiusScaleFactor } = options;
    const padding = fontszInPx * radiusScaleFactor + highlightPadding;
    const radius = fontszInPx * radiusScaleFactor * 2 + highlightPadding;
    const box = this.getVBoxObj(restruct.render)!;
    const ps1 = Scale.modelToCanvas(box.p0, restruct.render.options);
    const ps2 = Scale.modelToCanvas(box.p1, restruct.render.options);
    const width = ps2.x - ps1.x;
    const height = fontszInPx * 1.23;
    return paper.rect(
      ps1.x - padding,
      ps1.y - padding,
      width + padding * 2,
      height + padding * 2,
      radius,
    );
  }

  getUnlabeledSelectionContour(render: Render, highlightPadding = 0) {
    const { paper, options } = render;
    const { atomSelectionPlateRadius } = options;
    const ps = Scale.modelToCanvas(this.a.pp, options);
    return paper.circle(
      ps.x,
      ps.y,
      atomSelectionPlateRadius + highlightPadding,
    );
  }

  getSelectionContour(render: Render, highlightPadding = 0) {
    const hasLabel =
      (this.a.pseudo?.length > 1 && !getQueryAttrsText(this)) ||
      (this.showLabel && this.a.implicitH !== 0) ||
      this.a.atomList !== null;

    return hasLabel
      ? this.getLabeledSelectionContour(render, highlightPadding)
      : this.getUnlabeledSelectionContour(render, highlightPadding);
  }

  private readonly isPlateShouldBeHidden = (atom: Atom, render: Render) => {
    const sgroups = render.ctab.sgroups;
    const functionalGroups = render.ctab.molecule.functionalGroups;
    const struct = render.ctab.molecule;
    const atomId = struct.atoms.keyOf(atom) as number;

    return (
      FunctionalGroup.isAtomInContractedFunctionalGroup(
        atom,
        sgroups,
        functionalGroups,
      ) || Atom.isHiddenLeavingGroupAtom(struct, atomId)
    );
  };

  private readonly makeHighlightePlate = (
    restruct: ReStruct,
    style: RenderOptionStyles,
    highlightPadding = -2,
  ) => {
    const atom = this.a;
    const { render } = restruct;
    if (this.isPlateShouldBeHidden(atom, render)) {
      return null;
    }

    return this.getSelectionContour(render, highlightPadding).attr(style);
  };

  makeHoverPlate(render: Render, drawOutline = true) {
    const atom = this.a;
    const { options } = render;
    if (this.isPlateShouldBeHidden(atom, render)) {
      return null;
    }

    return this.getSelectionContour(render).attr(
      drawOutline
        ? options.hoverStyle
        : { fill: options.hoverStyle.fill, stroke: 'none' },
    );
  }

  makeSelectionPlate(restruct: ReStruct) {
    const atom = this.a;
    const { render } = restruct;
    const { options } = render;

    if (this.isPlateShouldBeHidden(atom, render)) {
      return null;
    }
    return this.getSelectionContour(render).attr(options.selectionStyle);
  }

  // Keep atom available in DOM for tests even when the label is hidden
  private createInvisibleAtomTarget(
    restruct: ReStruct,
    render: Render,
    position: Vec2,
  ) {
    const invisibleAtomTarget = this.getSelectionContour(render).attr({
      opacity: 0,
      fill: '#000',
      stroke: 'none',
      'stroke-width': 0,
    });

    restruct.addReObjectPath(
      LayerMap.data,
      this.visel,
      invisibleAtomTarget,
      position,
    );

    return invisibleAtomTarget;
  }

  private isNeedShiftForCharge(showCharge: boolean, bondLength: number) {
    const MIN_BOND_LENGTH = 24;
    const isBondLengthTooShort = bondLength <= MIN_BOND_LENGTH;
    const hasCharge = this.a.charge !== null && this.a.charge !== 0;
    return showCharge && isBondLengthTooShort && hasCharge;
  }

  private getRatio(
    renderOptions: RenderOptions,
    bondLen: number | null,
  ): number {
    const DEFAULT_BOND_LENGTH = 40;
    const DEFAULT_SUB_FONT_SIZE = 13;
    const subFontSize = renderOptions.fontszsubInPx ?? DEFAULT_SUB_FONT_SIZE;
    if (!bondLen) return 1;
    const showCharge = renderOptions.showCharge;

    const isNeedShift = this.isNeedShiftForCharge(showCharge, bondLen);

    if (!isNeedShift) {
      return 1;
    }

    const DEFAULT_PROPORTION = DEFAULT_BOND_LENGTH / DEFAULT_SUB_FONT_SIZE;
    const currentProportion = bondLen / subFontSize;
    const ratio = currentProportion / DEFAULT_PROPORTION;
    return ratio;
  }

  /**
   * if atom is rendered as Abbreviation: O, NH, ...
   * In this case we need to shift the bond render start position to free space for Atom,
   * same for the Attachment point
   */
  getShiftedSegmentPosition(
    renderOptions: RenderOptions,
    direction: Vec2,
    _atomPosition?: Vec2,
    bondLen: number | null = null,
  ): Vec2 {
    const atomPosition = Scale.modelToCanvas(
      _atomPosition ?? this.a.pp,
      renderOptions,
    );
    let atomSymbolShift = 0;
    const exts = this.visel.exts;
    const ratio = this.getRatio(renderOptions, bondLen);
    for (const ext of exts) {
      const box = ext.translate(atomPosition);
      const shiftRayBox = util.shiftRayBox(atomPosition, direction, box);
      const shift = shiftRayBox * ratio;
      atomSymbolShift = Math.max(atomSymbolShift, shift);
    }

    if (atomSymbolShift > 0) {
      return atomPosition.addScaled(
        direction,
        atomSymbolShift + 3 * renderOptions.lineWidth,
      );
    } else {
      return atomPosition;
    }
  }

  hasAttachmentPoint(): boolean {
    return Boolean(this.a.attachmentPoints);
  }

  show(restruct: ReStruct, aid: number, options: RenderOptions): void {
    // eslint-disable-line max-statements
    const struct = restruct.molecule;
    const atom = struct.atoms.get(aid)!;
    const sgroups = struct.sgroups;
    const functionalGroups = struct.functionalGroups;
    const render = restruct.render;
    const ps = Scale.modelToCanvas(this.a.pp, render.options);
    const sgroup = restruct.molecule.getGroupFromAtomId(aid);

    if (
      FunctionalGroup.isAtomInContractedFunctionalGroup(
        atom,
        sgroups,
        functionalGroups,
      )
    ) {
      const { atomId: contractedAtomId, position: contractedPosition } =
        sgroup!.getContractedPosition(restruct.molecule);
      const isPositionAtom = contractedAtomId === aid;
      if (isPositionAtom) {
        // contractedPosition is geometric center for regular SGroups;
        // MonomerMicromolecule.getContractedPosition overrides it to sgroup.pp.
        const position = Scale.modelToCanvas(
          contractedPosition,
          render.options,
        );
        const fontFamily = options.font.substr(
          options.font.indexOf(' ') + 1,
          options.font.length,
        );
        const sGroupName =
          sgroup?.data?.name ?? SUPERATOM_CLASS_TEXT[sgroup?.data?.class] ?? '';
        const path = render.paper
          .text(position.x, position.y, sGroupName)
          .attr({
            'font-weight': 700,
            'font-size': options.fontszInPx,
            'font-family': fontFamily,
          });

        path.node?.setAttribute('data-testid', 's-group-label');
        path.node?.setAttribute('data-label-text', sGroupName);
        path.node?.setAttribute('data-sgroup-id', sgroup?.id);
        path.node?.setAttribute('data-sgroup-name', sGroupName);
        path.node?.setAttribute('data-sgroup-type', sgroup?.type);

        restruct.addReObjectPath(
          LayerMap.data,
          this.visel,
          path,
          position,
          true,
        );
      }
      return;
    }

    if (Atom.isHiddenLeavingGroupAtom(struct, aid)) {
      return;
    }

    this.hydrogenOnTheLeft = shouldHydrogenBeOnLeft(restruct.molecule, this);
    this.showLabel = isLabelVisible(restruct, render.options, this);
    this.color = 'black'; // reset color

    let delta = 0;
    let rightMargin = 0;
    let leftMargin = 0;
    let implh = 0;
    let isHydrogen = false;
    let label!: ElemAttr;
    let index: ElemAttr | null = null;

    if (this.showLabel) {
      const data = buildLabel(this, render.paper, ps, options, aid, sgroup);
      delta = 0.5 * options.lineWidth;
      label = data.label;
      rightMargin = data.rightMargin;
      leftMargin = data.leftMargin;
      implh = Math.floor(this.a.implicitH);
      isHydrogen = label.text === 'H';

      if (label.background) {
        restruct.addReObjectPath(
          LayerMap.data,
          this.visel,
          label.background,
          ps,
          true,
        );
      }
      restruct.addReObjectPath(LayerMap.data, this.visel, label.path, ps, true);
    }

    if (options.showAtomIds) {
      const text = aid.toString();
      let idPos = this.hydrogenOnTheLeft
        ? Vec2.lc(ps, 1, new Vec2({ x: -2, y: 0, z: 0 }), 6)
        : Vec2.lc(ps, 1, new Vec2({ x: 2, y: 0, z: 0 }), 6);
      if (this.showLabel) {
        idPos = Vec2.lc(idPos, 1, new Vec2({ x: 1, y: -3, z: 0 }), 6);
      }
      const path = render.paper.text(idPos.x, idPos.y, text).attr({
        font: options.font,
        'font-size': options.fontszsubInPx,
        fill: '#070',
      });
      const rbb = util.relBox(path.getBBox());
      draw.recenterText(path, rbb);
      index = { text, path, rbb };
      restruct.addReObjectPath(LayerMap.indices, this.visel, index.path, ps);
    }

    if (this.showLabel) {
      let hydroIndex: ElemAttr | null = null;
      if (isHydrogen && implh > 0) {
        hydroIndex = showHydroIndex(this, render, implh, rightMargin);
        rightMargin += hydroIndex.rbb.width + delta;
        restruct.addReObjectPath(
          LayerMap.data,
          this.visel,
          hydroIndex.path,
          ps,
          true,
        );
      }

      if (this.a.radical !== 0) {
        const radical = showRadical(this, render);
        restruct.addReObjectPath(
          LayerMap.data,
          this.visel,
          radical.path,
          ps,
          true,
        );
      }
      if (this.a.isotope !== null) {
        const isotope = showIsotope(this, render, leftMargin);
        leftMargin -= isotope.rbb.width + delta;
        restruct.addReObjectPath(
          LayerMap.data,
          this.visel,
          isotope.path,
          ps,
          true,
        );
      }
      const isPreviewMode =
        options.usageInMacromolecule === UsageInMacromolecule.MonomerPreview ||
        options.usageInMacromolecule === UsageInMacromolecule.BondPreview ||
        options.usageInMacromolecule ===
          UsageInMacromolecule.MonomerConnectionsModal ||
        (options.usageInMacromolecule === undefined && !sgroup);
      // can not use Atom.isSuperatomLeavingGroupAtom here, because in preview model there is no sgroups
      const isLeavingGroupAtom =
        this.a.rglabel !== null && this.a.rglabel !== '0';

      const shouldHideHydrogenInPreview = isPreviewMode && isLeavingGroupAtom;

      if (
        !isHydrogen &&
        !this.a.alias &&
        implh > 0 &&
        displayHydrogen(struct, this, options.showHydrogenLabels) &&
        !shouldHideHydrogenInPreview
      ) {
        const data = showHydrogen(this, render, implh, {
          hydroIndex,
          rightMargin,
          leftMargin,
        });
        const hydrogen = data.hydrogen;
        hydroIndex = data.hydroIndex;
        rightMargin = data.rightMargin;
        leftMargin = data.leftMargin;
        restruct.addReObjectPath(
          LayerMap.data,
          this.visel,
          hydrogen.path,
          ps,
          true,
        );
        if (hydroIndex != null) {
          restruct.addReObjectPath(
            LayerMap.data,
            this.visel,
            hydroIndex.path,
            ps,
            true,
          );
        }
      }
      if (this.a.charge === 0) {
        this.a.charge = null;
      }
      if (this.a.charge && options.showCharge) {
        const charge = showCharge(this, render, rightMargin);
        rightMargin += charge.rbb.width + delta;
        restruct.addReObjectPath(
          LayerMap.data,
          this.visel,
          charge.path,
          ps,
          true,
        );
      }
      if (this.a.explicitValence >= 0 && options.showValence) {
        const valence = showExplicitValence(this, render, rightMargin);
        rightMargin += valence.rbb.width + delta;
        restruct.addReObjectPath(
          LayerMap.data,
          this.visel,
          valence.path,
          ps,
          true,
        );
      }

      if (this.a.badConn && options.showValenceWarnings) {
        const warning = showWarning(this, render, leftMargin, rightMargin);
        restruct.addReObjectPath(
          LayerMap.warnings,
          this.visel,
          warning.path,
          ps,
          true,
        );
      }
      if (index) {
        /* eslint-disable no-mixed-operators */
        pathAndRBoxTranslate(
          index.path,
          index.rbb,
          -0.5 * label.rbb.width - 0.5 * index.rbb.width - delta,
          0.3 * label.rbb.height,
        );
        /* eslint-enable no-mixed-operators */
      }
    }

    if (render.monomerCreationState) {
      const {
        assignedAttachmentPoints: allAssignedAttachmentPoints,
        visibleAssignedAttachmentPoints,
        problematicAttachmentPoints,
        problematicAtoms,
        connectionAttachmentPoints,
      } = render.monomerCreationState;
      // When visibleAssignedAttachmentPoints is set, only that subset is drawn;
      // otherwise all assigned attachment points are shown.
      const assignedAttachmentPoints =
        visibleAssignedAttachmentPoints ?? allAssignedAttachmentPoints;
      const restruct = render.ctab;
      const struct = restruct.molecule;
      const aid = struct.atoms.keyOf(this.a);

      if (aid !== null) {
        const [attachmentAtoms, leavingGroups] = Array.from(
          assignedAttachmentPoints.values(),
        ).reduce(
          (acc, currentPair) => {
            let attachmentAtomsIds = acc[0];
            const attachmentAtomId = currentPair[0];
            if (!attachmentAtomsIds.includes(attachmentAtomId)) {
              attachmentAtomsIds = attachmentAtomsIds.concat(attachmentAtomId);
            }

            let leavingAtomsIds = acc[1];
            const leavingAtomId = currentPair[1];
            if (!leavingAtomsIds.includes(leavingAtomId)) {
              leavingAtomsIds = leavingAtomsIds.concat(leavingAtomId);
            }

            return [attachmentAtomsIds, leavingAtomsIds];
          },
          [[], []] as [number[], number[]],
        );

        let style: RenderOptionStyles | undefined;
        if (attachmentAtoms.includes(aid)) {
          style = { fill: 'none', stroke: '#4da3f8', 'stroke-width': '2px' };
        } else if (leavingGroups.includes(aid)) {
          style = {
            fill: '#fff8c5',
            stroke: '#f8dc8f',
            'stroke-width': '2px',
          };
        }

        if (style) {
          const path = this.makeHighlightePlate(restruct, style, -4);
          restruct.addReObjectPath(LayerMap.atom, this.visel, path);
        }

        if (problematicAtoms?.has(aid)) {
          const path = this.makeHighlightePlate(
            restruct,
            {
              fill: 'none',
              stroke: '#F40724',
              'stroke-width': '2px',
            },
            -4,
          );
          restruct.addReObjectPath(LayerMap.atom, this.visel, path);
        }

        const attachmentPointName = Array.from(
          assignedAttachmentPoints.keys(),
        ).find((key) => {
          const atomsPair = assignedAttachmentPoints.get(key);
          assert(atomsPair);
          return atomsPair[1] === aid;
        });

        if (attachmentPointName) {
          const atomsPair = assignedAttachmentPoints.get(attachmentPointName);
          assert(atomsPair);
          const [attachmentAtomId, leavingGroupAtomId] = atomsPair;

          const attachmentAtom = struct.atoms.get(attachmentAtomId);
          const leavingGroupAtom = struct.atoms.get(leavingGroupAtomId);

          assert(attachmentAtom);
          assert(leavingGroupAtom);

          const attachmentPos = attachmentAtom.pp;
          const leavingGroupPos = leavingGroupAtom.pp;
          const direction = leavingGroupPos.sub(attachmentPos).normalized();

          // Use getShiftedSegmentPosition to account for atom label extent
          const shiftedPos = this.getShiftedSegmentPosition(
            render.options,
            direction,
            leavingGroupPos,
          );
          const labelPos = shiftedPos.addScaled(direction, 8);

          const isProblematic =
            problematicAttachmentPoints.has(attachmentPointName);

          const rLabelElement = render.paper
            .text(labelPos.x, labelPos.y, attachmentPointName)
            .attr({
              font: options.font,
              'font-size': options.fontszsubInPx,
              fill: isProblematic ? '#F40724' : '#333333',
              'font-weight': '700',
              cursor: 'pointer',
            });

          const selectedClass =
            render.monomerCreationState?.selectedMonomerClass;
          const apTooltip = getAttachmentPointTooltip(
            selectedClass,
            attachmentPointName,
          );
          if (apTooltip) {
            addTooltip(rLabelElement.node, apTooltip);
          }

          const labelBBox = rLabelElement.getBBox();
          const bgRadius = Math.max(labelBBox.width, labelBBox.height) / 2 + 5;
          const background = render.paper
            .circle(labelPos.x, labelPos.y, bgRadius)
            .attr({
              fill: '#167782',
              stroke: 'none',
              cursor: 'pointer',
              opacity: 0,
            });

          if (apTooltip) {
            background.node?.setAttribute('data-tooltip', apTooltip);
          }

          if (isProblematic) {
            background.attr({
              fill: 'none',
              stroke: '#F40724',
              'stroke-width': '2px',
              opacity: 1,
            });
          }

          // Create a group for the label and background
          const labelGroup = render.paper.set();
          labelGroup.push(background, rLabelElement);

          labelGroup.forEach((element: Element) => {
            element.node?.setAttribute(
              'data-attachment-point-alias',
              attachmentPointName,
            );
            element.node?.setAttribute(
              'data-testid',
              'monomer-attachment-point',
            );
          });

          // Add hover handlers
          labelGroup.hover(
            // Mouse enter
            () => {
              assert(render.monomerCreationState);

              if (
                render.monomerCreationState.clickedAttachmentPoint ===
                  attachmentPointName ||
                isProblematic
              ) {
                return;
              }

              background.attr({ opacity: 1 });
              rLabelElement.attr({ fill: '#ffffff' });

              window.dispatchEvent(
                new CustomEvent<AttachmentPointName>(
                  'highlightAttachmentPointControls',
                  {
                    detail: attachmentPointName,
                  },
                ),
              );
            },
            // Mouse leave
            () => {
              assert(render.monomerCreationState);

              if (
                render.monomerCreationState.clickedAttachmentPoint ===
                  attachmentPointName ||
                isProblematic
              ) {
                return;
              }

              background.attr({ opacity: 0 });
              rLabelElement.attr({ fill: '#333333' });

              window.dispatchEvent(
                new CustomEvent<AttachmentPointName>(
                  'resetHighlightAttachmentPointControls',
                  {
                    detail: attachmentPointName,
                  },
                ),
              );
            },
          );

          labelGroup.mousedown((event: PointerEvent) => {
            event.stopPropagation();

            // Right-click
            if (event.button !== 2) {
              return;
            }

            assert(render.monomerCreationState);

            render.monomerCreationState.clickedAttachmentPoint =
              attachmentPointName;

            background.attr({ opacity: 1 });
            rLabelElement.attr({ fill: '#ffffff' });
          });

          restruct.addReObjectPath(
            LayerMap.data,
            this.visel,
            labelGroup,
            ps,
            false,
          );
        }

        // Render connection (readonly) attachment points — blue circle around
        // the connection atom, same visual style as regular attachment atoms
        // but without an R-label. Hover syncs with the panel row.
        if (connectionAttachmentPoints) {
          const isConnectionAtom = Array.from(
            connectionAttachmentPoints.values(),
          ).some(([connectionAtomId]) => connectionAtomId === aid);

          if (isConnectionAtom) {
            // Draw the same blue outline ring used for regular attachment atoms
            const ringPath = this.makeHighlightePlate(
              restruct,
              {
                fill: 'none',
                stroke: '#4da3f8',
                'stroke-width': '2px',
              },
              -4,
            );
            restruct.addReObjectPath(LayerMap.atom, this.visel, ringPath);

            // Invisible hit-area circle for hover detection, centred on the
            // atom's screen-space position (ps is already computed above)
            const hitArea = render.paper.circle(ps.x, ps.y, 10).attr({
              fill: '#4da3f8',
              stroke: 'none',
              opacity: 0,
              cursor: 'pointer',
            });

            // Find the AP name(s) for this connection atom to drive panel sync
            const connectionApNames = Array.from(
              connectionAttachmentPoints.entries(),
            )
              .filter(([, [caid]]) => caid === aid)
              .map(([apName]) => apName);

            hitArea.hover(
              () => {
                hitArea.attr({ opacity: 0.15 });
                connectionApNames.forEach((apName) => {
                  window.dispatchEvent(
                    new CustomEvent<AttachmentPointName>(
                      'highlightAttachmentPointControls',
                      { detail: apName },
                    ),
                  );
                });
              },
              () => {
                hitArea.attr({ opacity: 0 });
                connectionApNames.forEach((apName) => {
                  window.dispatchEvent(
                    new CustomEvent<AttachmentPointName>(
                      'resetHighlightAttachmentPointControls',
                      { detail: apName },
                    ),
                  );
                });
              },
            );

            restruct.addReObjectPath(
              LayerMap.data,
              this.visel,
              hitArea,
              ps,
              false,
            );
          }
        }
      }
    }

    // draw hover after label is calculated
    this.setHover(this.hover, render);

    const stereoLabel = this.a.stereoLabel; // Enhanced Stereo
    const aamText = getAamText(this);
    const customQueryText = checkIsSmartPropertiesExist(this.a)
      ? getOnlyQueryAttributesCustomQuery(this.a)
      : getQueryAttrsText(this);
    let shortenCustomQueryText = customQueryText;
    let customQueryTooltipText: string | undefined;

    if (shortenCustomQueryText.length > MAX_LABEL_LENGTH) {
      customQueryTooltipText = shortenCustomQueryText;
      shortenCustomQueryText = `${shortenCustomQueryText.substring(
        0,
        MAX_LABEL_LENGTH,
      )}...`;
    }

    // we render them together to avoid possible collisions

    const fragmentId = Number(restruct.atoms.get(aid)?.a.fragment);
    // TODO: fragment should not be null
    const fragment = restruct.molecule.frags.get(fragmentId);

    const displayStereoLabel = shouldDisplayStereoLabel(
      stereoLabel,
      options.stereoLabelStyle,
      options.ignoreChiralFlag,
      fragment?.enhancedStereoFlag,
    );

    let text = '';

    if (displayStereoLabel) {
      text = `${stereoLabel}\n`;
    }

    if (shortenCustomQueryText.length > 0) {
      text += `${shortenCustomQueryText}\n`;
    }

    if (aamText.length > 0) {
      text += `.${aamText}.`;
    }

    if (text.length > 0) {
      const elem = Elements.get(this.a.label);
      const aamPath = render.paper.text(ps.x, ps.y, text).attr({
        font: options.font,
        'font-size': options.fontszsubInPx,
        fill:
          options.atomColoring && elem ? ElementColor[this.a.label] : '#000',
      });
      if (stereoLabel) {
        // use dom element to change color of stereo label which is the first element
        // of just created text
        // text -> tspan
        const color = getStereoAtomColor(render.options, stereoLabel);
        if (color !== undefined) {
          aamPath.node.childNodes[0].setAttribute('fill', color);
        }
        const opacity = getStereoAtomOpacity(render.options, stereoLabel);
        aamPath.node.childNodes[0].setAttribute('fill-opacity', opacity);
      }
      const aamBox = util.relBox(aamPath.getBBox());
      draw.recenterText(aamPath, aamBox);
      const visel = this.visel;
      let t = 3;
      let dir = this.bisectLargestSector(restruct.molecule);
      // estimate the shift to clear the atom label
      for (const ext of visel.exts) {
        t = Math.max(t, util.shiftRayBox(ps, dir, ext.translate(ps)));
      }
      // estimate the shift backwards to account for the size of the aam/query text box itself
      t += util.shiftRayBox(ps, dir.negated(), Box2Abs.fromRelBox(aamBox));
      dir = dir.scaled(8 + t);
      pathAndRBoxTranslate(aamPath, aamBox, dir.x, dir.y);
      restruct.addReObjectPath(LayerMap.data, this.visel, aamPath, ps, true);

      if (customQueryTooltipText) {
        addTooltip(aamPath.node, customQueryTooltipText);
      }
    }

    // Checking whether atom is highlighted and what's the last color
    const highlights = restruct.molecule.highlights;
    let isHighlighted = false;
    let highlightColor = '';
    highlights.forEach((highlight) => {
      const hasCurrentHighlight = highlight.atoms?.includes(aid);
      isHighlighted = isHighlighted || hasCurrentHighlight;
      if (hasCurrentHighlight) {
        highlightColor = highlight.color;
      }
    });

    // Drawing highlight
    if (isHighlighted) {
      const style = { fill: highlightColor, stroke: 'none' };

      const path = this.makeHighlightePlate(restruct, style);
      restruct.addReObjectPath(LayerMap.hovering, this.visel, path);
    }

    if (atom.cip) {
      const paper = render.paper;
      const options = render.options;
      const ps = Scale.modelToCanvas(this.a.pp, options);

      const cipText = paper.text(ps.x, ps.y, `(${this.a.cip})`).attr({
        font: options.font,
        'font-size': Math.floor(options.fontszInPx * 0.8),
        'pointer-events': 'none',
      });
      const cipTextBBox = cipText.getBBox();

      const rect = paper
        .rect(
          cipTextBBox.x - 1,
          cipTextBBox.y - 1,
          cipTextBBox.width + 2,
          cipTextBBox.height + 2,
          3,
          3,
        )
        .attr({ stroke: 'none' });

      const cipGroup = paper.set();
      cipGroup.push(rect, cipText);
      const cipGroupRelBox = util.relBox(cipGroup.getBBox());

      let baseDistance = 3;
      const direction = this.bisectLargestSector(render.ctab.molecule);
      for (const ext of this.visel.exts) {
        baseDistance = Math.max(
          baseDistance,
          util.shiftRayBox(ps, direction, ext.translate(ps)),
        );
      }
      const shiftDistance =
        baseDistance +
        util.shiftRayBox(
          ps,
          direction.negated(),
          Box2Abs.fromRelBox(cipTextBBox),
        );
      const shiftVector = direction.scaled(3 + shiftDistance);
      pathAndRBoxTranslate(
        cipGroup,
        cipGroupRelBox,
        shiftVector.x,
        shiftVector.y,
      );

      render.ctab.addReObjectPath(
        LayerMap.additionalInfo,
        this.visel,
        cipGroup,
        ps,
        false,
      );

      this.cip = { path: cipGroup, text: cipText, rectangle: rect };
    }

    if (this.showLabel && this.showInfoLabel) {
      const path = render.paper.text(ps.x, ps.y, this.infoLabel).attr({
        font: options.font,
        'font-size': options.fontszsubInPx * 0.75,
        fill: '#309BBF',
      });

      const bbTooltip = path.getBBox();
      const paddingX = 5;
      const paddingY = 2;

      const halfWidthInfoLabel = bbTooltip.width / 2 + paddingX;
      const halfHeightInfoLabel = bbTooltip.height / 2 + paddingY;

      path.translateAbs(
        rightMargin + halfWidthInfoLabel,
        -path.getBBox().height / 2 - halfHeightInfoLabel,
      );

      const rect = render.paper
        .rect(
          bbTooltip.x - paddingX,
          bbTooltip.y - paddingY,
          bbTooltip.width + paddingX * 2,
          bbTooltip.height + paddingY * 2,
          6,
        )
        .attr({ fill: '#CDF1FC', stroke: 'none' });

      restruct.addReObjectPath(
        LayerMap.data,
        this.visel,
        [rect, path],
        ps,
        true,
      );
    }

    const atomElement =
      label?.path ?? this.createInvisibleAtomTarget(restruct, render, ps);

    atomElement?.node?.setAttribute('data-testid', 'atom');
    atomElement?.node?.setAttribute(
      'data-atom-id',
      restruct.molecule.atoms.keyOf(this.a ?? ''),
    );
    atomElement?.node?.setAttribute('data-atom-type', getAtomType(this.a));
    atomElement?.node?.setAttribute('data-atomLabel', this.a.label ?? '');
    atomElement?.node?.setAttribute('data-atomCharge', this.a.charge ?? '');
    atomElement?.node?.setAttribute(
      'data-atomIsotopeAtomicMass',
      this.a.isotope ?? '',
    );
    atomElement?.node?.setAttribute('data-atomValence', this.a.valence ?? '');
    atomElement?.node?.setAttribute('data-atomRadical', this.a.radical ?? '');
    atomElement?.node?.setAttribute(
      'data-atomRingBondCount',
      this.a.ringBondCount ?? '',
    );
    atomElement?.node?.setAttribute('data-atomHCount', this.a.hCount ?? '');
    atomElement?.node?.setAttribute(
      'data-atomSubstitutionCount',
      this.a.substitutionCount ?? '',
    );
    atomElement?.node?.setAttribute(
      'data-atomUnsaturated',
      this.a.unsaturatedAtom ?? '',
    );
    atomElement?.node?.setAttribute(
      'data-atomAromaticity',
      this.a.queryProperties.aromaticity ?? '',
    );
    atomElement?.node?.setAttribute(
      'data-atomImplicitHCount',
      this.a.implicitHCount ?? '',
    );
    atomElement?.node?.setAttribute(
      'data-atomRingMembership',
      this.a.queryProperties.ringMembership ?? '',
    );
    atomElement?.node?.setAttribute(
      'data-atomRingSize',
      this.a.queryProperties.ringSize ?? '',
    );
    atomElement?.node?.setAttribute(
      'data-atomConnectivity',
      this.a.queryProperties.connectivity ?? '',
    );
    atomElement?.node?.setAttribute(
      'data-atomChirality',
      this.a.queryProperties.chirality ?? '',
    );
    atomElement?.node?.setAttribute('data-atomInversion', this.a.invRet ?? '');
    atomElement?.node?.setAttribute(
      'data-atomExactChange',
      this.a.exactChangeFlag ?? '',
    );
    atomElement?.node?.setAttribute(
      'data-atomCustomQuery',
      this.a.queryProperties.customQuery ?? '',
    );
  }

  getLargestSectorFromNeighbors(struct: Struct): {
    neighborAngle: number;
    largestAngle: number;
  } {
    let angles: Array<number> = [];
    this.a.neighbors.forEach((halfBondId) => {
      const halfBond = struct.halfBonds.get(halfBondId);
      halfBond && angles.push(halfBond.ang);
    });
    angles = angles.sort((a, b) => a - b);
    const largeAngles: Array<number> = [];
    for (const [index, angle] of angles.entries()) {
      if (index < angles.length - 1) {
        largeAngles.push(angles[(index + 1) % angles.length] - angle);
      }
    }
    largeAngles.push(angles[0] - angles[angles.length - 1] + 2 * Math.PI);
    let largestAngle = 0;
    let neighborAngle = -Math.PI / 2;
    for (const [index, angle] of angles.entries()) {
      if (largeAngles[index] > largestAngle) {
        largestAngle = largeAngles[index];
        neighborAngle = angle;
      }
    }

    return { neighborAngle, largestAngle };
  }

  bisectLargestSector(struct: Struct): Vec2 {
    const { largestAngle, neighborAngle } =
      this.getLargestSectorFromNeighbors(struct);
    const bisectAngle = neighborAngle + largestAngle / 2;
    return newVectorFromAngle(bisectAngle);
  }
}

function getStereoAtomColor(
  options: RenderOptions,
  stereoLabel: string | null | undefined,
): string | undefined {
  if (
    !stereoLabel ||
    options.colorStereogenicCenters === StereoColoringType.Off ||
    options.colorStereogenicCenters === StereoColoringType.BondsOnly
  ) {
    return DEFAULT_STEREO_COLOR;
  }

  return getColorFromStereoLabel(options, stereoLabel);
}

export function getColorFromStereoLabel(
  options: RenderOptions,
  stereoLabel: string,
): string | undefined {
  const stereoLabelType = stereoLabel.match(/\D+/g)?.[0] ?? '';

  switch (stereoLabelType) {
    case StereoLabel.And:
      return options.colorOfAndCenters ?? DEFAULT_STEREO_COLOR;
    case StereoLabel.Or:
      return options.colorOfOrCenters ?? DEFAULT_STEREO_COLOR;
    case StereoLabel.Abs:
      return options.colorOfAbsoluteCenters;
    default:
      return DEFAULT_STEREO_COLOR;
  }
}

function getStereoAtomOpacity(options: RenderOptions, stereoLabel: string) {
  const stereoLabelType = stereoLabel.match(/\D+/g)?.[0] ?? '';
  const stereoLabelNumber = +stereoLabel.replace(stereoLabelType, '');
  if (
    !options.autoFadeOfStereoLabels ||
    stereoLabelType === StereoLabel.Abs ||
    options.colorStereogenicCenters === StereoColoringType.Off ||
    options.colorStereogenicCenters === StereoColoringType.BondsOnly
  ) {
    return 1;
  }
  return Math.max(1 - (stereoLabelNumber - 1) / 10, StereoLabelMinOpacity);
}

function shouldDisplayStereoLabel(
  stereoLabel: string | null | undefined,
  labelStyle: StereoLabelStyleType | undefined,
  ignoreChiralFlag: boolean | undefined,
  flag: StereoFlag | undefined,
): boolean {
  if (!stereoLabel) {
    return false;
  }

  const stereoLabelType = stereoLabel.match(/\D+/g)?.[0] ?? '';

  if (ignoreChiralFlag && stereoLabelType === StereoLabel.Abs) {
    return false;
  }
  if (ignoreChiralFlag && stereoLabelType !== StereoLabel.Abs) {
    return true;
  }

  switch (labelStyle) {
    case StereoLabelStyleType.Off:
      return false;
    case StereoLabelStyleType.On:
      return true;
    case StereoLabelStyleType.Classic:
      return !!(
        flag === StereoFlag.Mixed || stereoLabelType === StereoLabel.Or
      );
    case StereoLabelStyleType.IUPAC:
      return !!(
        flag === StereoFlag.Mixed && stereoLabelType !== StereoLabel.Abs
      );
    default:
      return true;
  }
}

function isLabelVisible(
  restruct: ReStruct,
  options: RenderOptions,
  atom: ReAtom,
) {
  const isAttachmentPointAtom = Boolean(atom.a.attachmentPoints);
  const isCarbon = atom.a.label.toLowerCase() === 'c';
  const visibleNeighbors = getVisibleNeighborHalfBondIds(
    restruct.molecule,
    atom,
  );
  const visibleTerminal =
    options.showHydrogenLabels !== ShowHydrogenLabels.Off &&
    options.showHydrogenLabels !== ShowHydrogenLabels.Hetero;

  const neighborsLength =
    visibleNeighbors.length === 0 ||
    (visibleNeighbors.length < 2 && visibleTerminal);

  if (isAttachmentPointAtom && isCarbon) {
    return false;
  }

  const shouldBeVisible =
    neighborsLength ||
    options.carbonExplicitly ||
    options.showHydrogenLabels === ShowHydrogenLabels.On ||
    atom.a.alias ||
    atom.a.isotope !== null ||
    atom.a.radical !== 0 ||
    atom.a.charge !== null ||
    atom.a.explicitValence >= 0 ||
    atom.a.atomList !== null ||
    atom.a.rglabel !== null ||
    (atom.a.badConn && options.showValenceWarnings) ||
    atom.a.label.toLowerCase() !== 'c';

  if (shouldBeVisible) return true;

  if (visibleNeighbors.length === 2) {
    const nei1 = visibleNeighbors[0];
    const nei2 = visibleNeighbors[1];
    const hb1 = restruct.molecule.halfBonds.get(nei1);
    const hb2 = restruct.molecule.halfBonds.get(nei2);
    if (!hb1 || !hb2) return false;
    const bond1 = restruct.bonds.get(hb1.bid);
    const bond2 = restruct.bonds.get(hb2.bid);
    if (!bond1 || !bond2) return false;

    const sameNotStereo =
      bond1.b.type === bond2.b.type &&
      bond1.b.stereo === Bond.PATTERN.STEREO.NONE &&
      bond2.b.stereo === Bond.PATTERN.STEREO.NONE;

    if (sameNotStereo && Math.abs(Vec2.cross(hb1.dir, hb2.dir)) < 0.2) {
      return true;
    }
  }

  return false;
}

function displayHydrogen(
  struct: Struct,
  atom: ReAtom,
  hydrogenLabels: ShowHydrogenLabels,
) {
  const visibleNeighbors = getVisibleNeighborHalfBondIds(struct, atom);

  return (
    hydrogenLabels === ShowHydrogenLabels.On ||
    (hydrogenLabels === ShowHydrogenLabels.Terminal &&
      visibleNeighbors.length < 2) ||
    (hydrogenLabels === ShowHydrogenLabels.Hetero &&
      atom.label?.text.toLowerCase() !== 'c') ||
    (hydrogenLabels === ShowHydrogenLabels.TerminalAndHetero &&
      (visibleNeighbors.length < 2 || atom.label?.text.toLowerCase() !== 'c'))
  );
}

function shouldHydrogenBeOnLeft(struct: Struct, atom: ReAtom) {
  const visibleNeighbors = getVisibleNeighborHalfBondIds(struct, atom);

  if (visibleNeighbors.length === 0) {
    if (atom.a.label === 'D' || atom.a.label === 'T') {
      return false;
    } else {
      const element = Elements.get(atom.a.label);
      return !element || Boolean(element.leftH);
    }
  }

  if (visibleNeighbors.length === 1) {
    const neighbor = visibleNeighbors[0];
    const neighborHalfBond = struct.halfBonds.get(neighbor);
    const neighborDirX = neighborHalfBond?.dir.x ?? 0;

    return neighborDirX > 0;
  }

  return false;
}

function getVisibleNeighborHalfBondIds(struct: Struct, atom: ReAtom): number[] {
  return atom.a.neighbors.filter((neighborHalfBondId) => {
    const halfBond = struct.halfBonds.get(neighborHalfBondId);

    if (!halfBond) {
      return false;
    }

    const bond = struct.bonds.get(halfBond.bid);

    return !bond || !Bond.isBondToHiddenLeavingGroup(struct, bond);
  });
}

function getOnlyQueryAttributesCustomQuery(atom: Atom) {
  const queryText =
    atom.queryProperties.customQuery ??
    getAtomCustomQuery(
      {
        ...atom,
        ...atom.queryProperties,
      },
      true,
    );
  return queryText;
}

function addTooltip(node: SVGElement, text: string) {
  const tooltip = text.split(/(?<=[;,])/).join(' ');
  (node.childNodes[0] as SVGElement).setAttribute(
    'data-tooltip',
    util.escapeHtml(tooltip),
  );
}

function buildLabel(
  atom: ReAtom,
  paper: Render['paper'],
  ps: Vec2,
  options: RenderOptions,
  atomId: number,
  sgroup?: SGroup,
): {
  rightMargin: number;
  leftMargin: number;
  label: ElemAttr;
} {
  const {
    atomColoring,
    font,
    fontszInPx,
    currentlySelectedMonomerAttachmentPoint,
    connectedMonomerAttachmentPoints,
    usageInMacromolecule,
  } = options;
  // eslint-disable-line max-statements
  let text = getLabelText(atom.a, atomId, sgroup, options) || 'R#';

  let tooltip: string | null = null;

  if (text === atom.a.label) {
    const element = Elements.get(text);
    if (atomColoring && element) {
      atom.color = ElementColor[text] ?? '#000';
    }
  }

  const shouldStyleLabel = usageInMacromolecule !== undefined;
  const isMonomerAttachmentPoint = attachmentPointNames.includes(text);
  const isMonomerAttachmentPointSelected =
    currentlySelectedMonomerAttachmentPoint === text;
  const isMonomerAttachmentPointUsed =
    connectedMonomerAttachmentPoints?.includes(text) ?? false;

  const { color, fill, stroke } = util.useLabelStyles(
    isMonomerAttachmentPointSelected,
    isMonomerAttachmentPointUsed,
    usageInMacromolecule ?? UsageInMacromolecule.MonomerConnectionsModal,
  );

  if (isMonomerAttachmentPoint && shouldStyleLabel) {
    atom.color = color;
  }

  if (text.length > MAX_LABEL_LENGTH) {
    tooltip = text;
    text = `${text.substring(0, 8)}...`;
  }

  const { previewOpacity } = options;

  // not properly centered otherwise
  if (text === '*') {
    ps.x = ps.x - 1;
    ps.y = ps.y + 3;
  }

  const path = paper.text(ps.x, ps.y, text).attr({
    font,
    'font-size': fontszInPx,
    fill: atom.color,
    'font-style': atom.a.pseudo ? 'italic' : '',
    'fill-opacity': atom.a.isPreview ? previewOpacity : 1,
  });

  const background =
    isMonomerAttachmentPoint && shouldStyleLabel
      ? paper
          .rect(
            ps.x - (fontszInPx * 2) / 2,
            ps.y - (fontszInPx * 2) / 2,
            fontszInPx * 2,
            fontszInPx * 2,
            10,
          )
          .attr({ fill })
          .attr({ stroke })
      : undefined;

  if (tooltip) {
    addTooltip(path.node, tooltip);
  }

  const rbb = util.relBox(path.getBBox());
  draw.recenterText(path, rbb);
  let rightMargin = (rbb.width / 2) * (options.zoom > 1 ? 1 : options.zoom);
  let leftMargin = (-rbb.width / 2) * (options.zoom > 1 ? 1 : options.zoom);

  if (atom.a.atomList !== null) {
    const xShift =
      ((atom.hydrogenOnTheLeft ? -1 : 1) * (rbb.width - rbb.height)) / 2;
    pathAndRBoxTranslate(path, rbb, xShift, 0);
    rightMargin += xShift;
    leftMargin += xShift;
  }

  const label: ElemAttr = { text, path, rbb, background };
  atom.label = label;
  return { label, rightMargin, leftMargin };
}

function getLabelText(
  atom: Atom,
  atomId: number,
  sgroup?: SGroup,
  options?: RenderOptions,
) {
  if (sgroup?.isSuperatomWithoutLabel) {
    const attachmentPoint = sgroup
      .getAttachmentPoints()
      .find((attachmentPoint) => {
        return attachmentPoint.leaveAtomId === atomId;
      });

    if (attachmentPoint?.attachmentPointNumber) {
      const result = getAttachmentPointLabel(
        attachmentPoint.attachmentPointNumber,
      );
      return result;
    }
  }

  if (atom.atomList !== null) return atom.atomList.label();

  if (atom.pseudo) return atom.pseudo;

  if (atom.alias) return atom.alias;

  if (
    atom.label &&
    atom.rglabel !== null &&
    sgroup instanceof MonomerMicromolecule
  ) {
    const isExpandMode = options?.usageInMacromolecule === undefined && sgroup;

    if (isExpandMode) {
      return atom.label;
    }
  }

  if (atom.label && atom.rglabel !== null) {
    let text = '';
    const rglabelNum = atom.rglabel as unknown as number;
    for (let rgi = 0; rgi < 32; rgi++) {
      if (rglabelNum & (1 << rgi)) {
        text += 'R' + (rgi + 1).toString();
      }
    }
    if (
      sgroup instanceof MonomerMicromolecule &&
      Atom.isSuperatomLeavingGroupAtom(sgroup, atomId)
    ) {
      text = sgroup?.monomer?.monomerItem?.props?.MonomerCaps?.[text] ?? text;
    }
    return text;
  }
  return atom.label;
}

function showHydroIndex(
  atom: ReAtom,
  render: Render,
  implh: number,
  rightMargin: number,
): ElemAttr {
  const ps = Scale.modelToCanvas(atom.a.pp, render.options);
  const options = render.options;
  const delta = 0.5 * options.lineWidth;
  const text = (implh + 1).toString();
  const path = render.paper.text(ps.x, ps.y, text).attr({
    font: options.font,
    'font-size': options.fontszsubInPx,
    fill: atom.color,
  });
  const rbb = util.relBox(path.getBBox());
  draw.recenterText(path, rbb);
  const labelHeight = atom.label?.rbb.height ?? 0;
  /* eslint-disable no-mixed-operators */
  pathAndRBoxTranslate(
    path,
    rbb,
    rightMargin + 0.5 * rbb.width + delta,
    0.2 * labelHeight,
  );
  /* eslint-enable no-mixed-operators */
  return { text, path, rbb };
}

function showRadical(atom: ReAtom, render: Render): Omit<ElemAttr, 'text'> {
  const ps: Vec2 = Scale.modelToCanvas(atom.a.pp, render.options);
  const options = render.options;
  const paper = render.paper;
  let path = paper.set();
  let hshift: number;
  switch (atom.a.radical) {
    case 1:
      path = paper.set();
      hshift = 1.6 * options.lineWidth;
      path.push(
        draw.radicalBullet(paper, ps.add(new Vec2(-hshift, 0)), options),
        draw.radicalBullet(paper, ps.add(new Vec2(hshift, 0)), options),
      );
      path.attr('fill', atom.color);
      break;
    case 2:
      path = paper.set();
      path.push(draw.radicalBullet(paper, ps, options));
      path.attr('fill', atom.color);
      break;
    case 3:
      path = paper.set();
      hshift = 1.6 * options.lineWidth;
      path.push(
        draw.radicalCap(paper, ps.add(new Vec2(-hshift, 0)), options),
        draw.radicalCap(paper, ps.add(new Vec2(hshift, 0)), options),
      );
      path.attr('stroke', atom.color);
      break;
    default:
      break;
  }
  const rbb = util.relBox(path.getBBox());
  const labelHeight = atom.label?.rbb.height ?? 0;
  let vshift = -0.5 * (labelHeight + rbb.height);
  if (atom.a.radical === 3) vshift -= options.lineWidth / 2;
  pathAndRBoxTranslate(path, rbb, 0, vshift);
  return { path, rbb };
}

function showIsotope(
  atom: ReAtom,
  render: Render,
  leftMargin: number,
): ElemAttr {
  const ps = Scale.modelToCanvas(atom.a.pp, render.options);
  const options = render.options;
  const delta = 0.5 * options.lineWidth;
  const text = atom.a.isotope?.toString() ?? '';
  const path = render.paper.text(ps.x, ps.y, text).attr({
    font: options.font,
    'font-size': options.fontszsubInPx,
    fill: atom.color,
  });
  const rbb = util.relBox(path.getBBox());
  draw.recenterText(path, rbb);
  /* eslint-disable no-mixed-operators */
  pathAndRBoxTranslate(
    path,
    rbb,
    leftMargin - 0.5 * rbb.width - delta,
    -0.3 * (atom.label?.rbb.height ?? 0),
  );
  /* eslint-enable no-mixed-operators */
  return { text, path, rbb };
}

function showCharge(
  atom: ReAtom,
  render: Render,
  rightMargin: number,
): ElemAttr {
  const ps = Scale.modelToCanvas(atom.a.pp, render.options);
  const options = render.options;
  const delta = 0.5 * options.lineWidth;
  let text = '';
  if (atom.a.charge !== null) {
    const absCharge = Math.abs(atom.a.charge);
    if (absCharge !== 1) text = absCharge.toString();
    if (atom.a.charge < 0) text += '\u2013';
    else text += '+';
  }
  const path = render.paper.text(ps.x, ps.y, text).attr({
    font: options.font,
    'font-size': options.fontszsubInPx,
    fill: atom.color,
  });
  const rbb = util.relBox(path.getBBox());
  draw.recenterText(path, rbb);
  /* eslint-disable no-mixed-operators */
  pathAndRBoxTranslate(
    path,
    rbb,
    rightMargin + 0.5 * rbb.width + delta,
    -0.3 * (atom.label?.rbb.height ?? 0),
  );
  /* eslint-enable no-mixed-operators */
  return { text, path, rbb };
}

function showExplicitValence(
  atom: ReAtom,
  render: Render,
  rightMargin: number,
): ElemAttr {
  const ps = Scale.modelToCanvas(atom.a.pp, render.options);
  const options = render.options;
  const delta = 0.5 * options.lineWidth;
  const baseText = VALENCE_MAP[atom.a.explicitValence];
  if (!baseText) {
    throw new Error('invalid valence ' + atom.a.explicitValence.toString());
  }
  const text = '(' + baseText + ')';
  const path = render.paper.text(ps.x, ps.y, text).attr({
    font: options.font,
    'font-size': options.fontszsubInPx,
    fill: atom.color,
  });
  const rbb = util.relBox(path.getBBox());
  draw.recenterText(path, rbb);
  /* eslint-disable no-mixed-operators */
  pathAndRBoxTranslate(
    path,
    rbb,
    rightMargin + 0.5 * rbb.width + delta,
    -0.3 * (atom.label?.rbb.height ?? 0),
  );
  /* eslint-enable no-mixed-operators */
  return { text, path, rbb };
}

function showHydrogen(
  atom: ReAtom,
  render: Render,
  implh: number,
  data: {
    hydroIndex: ElemAttr | null;
    rightMargin: number;
    leftMargin: number;
  },
): {
  hydrogen: ElemAttr;
  hydroIndex: ElemAttr | null;
  rightMargin: number;
  leftMargin: number;
} {
  // eslint-disable-line max-statements
  let hydroIndex: ElemAttr | null = data.hydroIndex;
  const hydrogenLeft = atom.hydrogenOnTheLeft;
  const ps = Scale.modelToCanvas(atom.a.pp, render.options);
  const options = render.options;
  const delta = 0.5 * options.lineWidth;
  const hydrogenText = 'H';
  const hydrogenPath = render.paper.text(ps.x, ps.y, hydrogenText).attr({
    font: options.font,
    'font-size': options.fontszInPx,
    fill: atom.color,
  });
  const hydrogenRbb = util.relBox(hydrogenPath.getBBox());
  draw.recenterText(hydrogenPath, hydrogenRbb);
  if (!hydrogenLeft) {
    pathAndRBoxTranslate(
      hydrogenPath,
      hydrogenRbb,
      data.rightMargin + 0.35 * hydrogenRbb.width + delta,
      0,
    );
    data.rightMargin += hydrogenRbb.width + delta;
  }
  if (implh > 1) {
    const hydroIndexText = implh.toString();
    const hydroIndexPath = render.paper.text(ps.x, ps.y, hydroIndexText).attr({
      font: options.font,
      'font-size': options.fontszsubInPx,
      fill: atom.color,
    });
    const hydroIndexRbb = util.relBox(hydroIndexPath.getBBox());
    draw.recenterText(hydroIndexPath, hydroIndexRbb);
    hydroIndex = {
      text: hydroIndexText,
      path: hydroIndexPath,
      rbb: hydroIndexRbb,
    };
    if (!hydrogenLeft) {
      pathAndRBoxTranslate(
        hydroIndexPath,
        hydroIndexRbb,
        data.rightMargin +
          0.15 * hydroIndexRbb.width * (options.zoom > 1 ? 1 : options.zoom) +
          delta,
        0.2 * (atom.label?.rbb.height ?? 0),
      );
      data.rightMargin += hydroIndexRbb.width + delta;
    }
  }
  if (hydrogenLeft) {
    if (hydroIndex != null) {
      pathAndRBoxTranslate(
        hydroIndex.path,
        hydroIndex.rbb,
        data.leftMargin - 0.4 * hydroIndex.rbb.width - delta,
        0.2 * (atom.label?.rbb.height ?? 0),
      );
      data.leftMargin -= hydroIndex.rbb.width + delta;
    }
    pathAndRBoxTranslate(
      hydrogenPath,
      hydrogenRbb,
      data.leftMargin -
        0.4 *
          hydrogenRbb.width *
          (implh > 1 && options.zoom < 1 ? options.zoom : 1) -
        delta,
      0,
    );
    data.leftMargin -= hydrogenRbb.width + delta;
  }
  const hydrogen: ElemAttr = {
    text: hydrogenText,
    path: hydrogenPath,
    rbb: hydrogenRbb,
  };
  return Object.assign(data, { hydrogen, hydroIndex });
}

function showWarning(
  atom: ReAtom,
  render: Render,
  leftMargin: number,
  rightMargin: number,
): Omit<ElemAttr, 'text'> {
  const ps = Scale.modelToCanvas(atom.a.pp, render.options);
  const delta = 0.5 * render.options.lineWidth;
  const labelHeight = atom.label?.rbb.height ?? 0;
  const y = ps.y + labelHeight / 2 + delta;
  const path = render.paper
    .path(
      'M{0},{1}L{2},{3}',
      toFixed(ps.x + leftMargin),
      toFixed(y),
      toFixed(ps.x + rightMargin),
      toFixed(y),
    )
    .attr(render.options.lineattr)
    .attr({ stroke: '#F00' });
  const rbb = util.relBox(path.getBBox());
  return { path, rbb };
}

function getAamText(atom: ReAtom) {
  let aamText = '';
  if (atom.a.aam > 0) aamText += atom.a.aam;
  if (atom.a.invRet > 0) {
    if (aamText.length > 0) aamText += ',';
    if (atom.a.invRet === 1) aamText += 'Inv';
    else if (atom.a.invRet === 2) aamText += 'Ret';
    else throw new Error('Invalid value for the invert/retain flag');
  }
  if (atom.a.exactChangeFlag > 0) {
    if (aamText.length > 0) aamText += ',';
    if (atom.a.exactChangeFlag === 1) aamText += 'ext';
    else throw new Error('Invalid value for the exact change flag');
  }
  return aamText;
}

function getRingBondCountAttrText(value: number) {
  let attrText: string;
  if (value > 0) {
    attrText = 'rb' + value.toString();
  } else if (value === -1) {
    attrText = 'rb0';
  } else if (value === -2) {
    attrText = 'rb*';
  } else {
    throw new Error('Ring bond count invalid');
  }
  return attrText;
}

function getRingConnectivity(value: number) {
  if (value > 0) {
    return 'x' + value.toString();
  } else if (value === -1 || value === -2) {
    return 'x0';
  } else {
    return '';
  }
}

function getDegree(value: number) {
  if (value > 0) {
    return 'D' + value.toString();
  } else if (value === -1 || value === -2) {
    return 'D0';
  } else {
    return '';
  }
}

function getSubstitutionCountAttrText(value: number) {
  let attrText: string;
  if (value > 0) {
    attrText = 's' + value.toString();
  } else if (value === -1) {
    attrText = 's0';
  } else if (value === -2) {
    attrText = 's*';
  } else {
    throw new Error('Substitution count invalid');
  }
  return attrText;
}

export function getAtomType(atom: Atom) {
  if (atom.atomList) {
    return 'list';
  }

  if (atom.pseudo === atom.label) {
    return 'pseudo';
  }

  return 'single';
}

export function checkIsSmartPropertiesExist(atom: Atom) {
  const smartsSpecificProperties = [
    'ringMembership',
    'ringSize',
    'connectivity',
    'chirality',
    'aromaticity',
    'customQuery',
  ];
  return smartsSpecificProperties.some((name) => atom.queryProperties?.[name]);
}

export function getAtomCustomQuery(
  atom: Record<string, unknown>,
  includeOnlyQueryAttributes?: boolean,
) {
  let queryAttrsText = '';
  const nonQueryAttributes = ['charge', 'explicitValence', 'isotope'];

  const addSemicolon = () => {
    if (queryAttrsText.length > 0) queryAttrsText += ';';
  };
  const patterns: {
    [key: string]: (value: string, atom: Record<string, unknown>) => string;
  } = {
    isotope: (value) => value,
    aromaticity: (value) => (value === 'aromatic' ? 'a' : 'A'),
    charge: (value) => {
      if (value === '') return value;
      const regExpResult = /^([+-]?)(\d{1,3}|1000)([+-]?)$/.exec(value);
      const charge = regExpResult
        ? parseInt(
            regExpResult[1] + regExpResult[3] + regExpResult[2],
          ).toString()
        : value;
      return !charge.startsWith('-') ? `+${charge}` : charge;
    },
    unsaturatedAtom: (value) => (Number(value) === 1 ? 'u' : ''),
    explicitValence: (value) => (Number(value) !== -1 ? `v${value}` : ''),
    ringBondCount: (value) => getRingConnectivity(Number(value)),
    substitutionCount: (value) => getDegree(Number(value)),
    hCount: (value) =>
      Number(value) > 0 ? 'H' + (Number(value) - 1).toString() : '',
    implicitHCount: (value) => `h${value}`,
    ringMembership: (value) => `R${value}`,
    ringSize: (value) => `r${value}`,
    connectivity: (value) => `X${value}`,
    chirality: (value) => (value === 'clockwise' ? '@@' : '@'),
  };

  for (const propertyName in patterns) {
    if (
      includeOnlyQueryAttributes &&
      nonQueryAttributes.includes(propertyName)
    ) {
      continue;
    }

    const value = atom[propertyName];
    if (propertyName in atom && value !== null) {
      const normalizedValue =
        typeof value === 'boolean' ? Number(value) : value;
      const attrText = patterns[propertyName](String(normalizedValue), atom);
      if (attrText) {
        addSemicolon();
      }
      queryAttrsText += attrText;
    }
  }

  return queryAttrsText;
}

function getQueryAttrsText(atom: ReAtom): string {
  let queryAttrsText = '';

  const addSemicolon = () => {
    if (queryAttrsText.length > 0) queryAttrsText += ';';
  };

  const { ringBondCount, substitutionCount, unsaturatedAtom, hCount } = atom.a;

  if (ringBondCount !== 0) {
    queryAttrsText += getRingBondCountAttrText(ringBondCount);
  }
  if (substitutionCount !== 0) {
    addSemicolon();
    queryAttrsText += getSubstitutionCountAttrText(substitutionCount);
  }
  if (unsaturatedAtom > 0) {
    addSemicolon();
    if (unsaturatedAtom === 1) queryAttrsText += 'u';
    else throw new Error('Unsaturated atom invalid value');
  }
  if (hCount > 0) {
    addSemicolon();
    queryAttrsText += 'H' + (hCount - 1).toString();
  }
  return queryAttrsText;
}

function pathAndRBoxTranslate(
  path: Element | RaphaelSet,
  rbb: RelativeBox,
  x: number,
  y: number,
) {
  path.translateAbs(x, y);
  rbb.x += x;
  rbb.y += y;
}

function newVectorFromAngle(angle: number): Vec2 {
  return new Vec2(Math.cos(angle), Math.sin(angle));
}

export default ReAtom;
