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

import {
  Atom,
  Bond,
  Box2Abs,
  FunctionalGroup,
  StereoFlag,
  StereoLabel,
  Struct,
  Vec2
} from 'domain/entities'
import { ElementColor, Elements } from 'domain/constants'
import {
  LayerMap,
  StereLabelStyleType,
  StereoColoringType
} from './generalEnumTypes'

import ReObject from './reobject'
import ReStruct from './restruct'
import { Render } from '../raphaelRender'
import { Scale } from 'domain/helpers'
import draw from '../draw'
import util from '../util'
import { tfx } from 'utilities'
import svgPath from 'svgpath'
import { RenderOptions } from 'application/render/render.types'

interface ElemAttr {
  text: string
  path: any
  rbb: { x: number; y: number; width: number; height: number }
}

const StereoLabelMinOpacity = 0.3

export enum ShowHydrogenLabels {
  Off = 'off',
  Hetero = 'Hetero',
  Terminal = 'Terminal',
  TerminalAndHetero = 'Terminal and Hetero',
  On = 'all'
}

export enum ShowHydrogenLabelNames {
  Off = 'Off',
  Hetero = 'Hetero',
  Terminal = 'Terminal',
  TerminalAndHetero = 'Terminal and Hetero',
  On = 'On'
}

class ReAtom extends ReObject {
  a: Atom
  showLabel: boolean
  hydrogenOnTheLeft: boolean
  color: string
  component: number
  label?: ElemAttr
  cip?: {
    // Raphael paths
    path: any
    text: any
    rectangle: any
  }

  constructor(atom: Atom) {
    super('atom')
    this.a = atom // TODO rename a to item
    this.showLabel = false

    this.hydrogenOnTheLeft = false

    this.color = '#000000'
    this.component = -1
  }

  static isSelectable(): true {
    return true
  }

  getVBoxObj(render: Render): Box2Abs | null {
    if (this.visel.boundingBox) {
      return ReObject.prototype.getVBoxObj.call(this, render)
    }
    return new Box2Abs(this.a.pp, this.a.pp)
  }

  /**
   * Why?
   * We need to return Bounding box for the attachment points for this atom,
   * to be able to correctly calculate boundaries for autoscaling and positioning
   */
  getVBoxObjOfAttachmentPoint(render: Render): Box2Abs | null {
    let accumulatedBBox: Box2Abs | null = null
    const directionVectors = this.getAttachmentPointDirectionVectors(
      render.ctab.molecule
    )
    directionVectors.forEach((directionVector) => {
      const attachmentPointEndPosition = this.a.pp.add(directionVector)
      const attachmentPointEndBoundingBox = new Box2Abs(
        attachmentPointEndPosition,
        attachmentPointEndPosition
      )
      accumulatedBBox = accumulatedBBox
        ? Box2Abs.union(accumulatedBBox, attachmentPointEndBoundingBox)
        : attachmentPointEndBoundingBox
    })
    return accumulatedBBox
  }

  drawHover(render: Render) {
    const ret = this.makeHoverPlate(render)
    render.ctab.addReObjectPath(LayerMap.hovering, this.visel, ret)
    return ret
  }

  getLabeledSelectionContour(render: Render) {
    const { paper, ctab: restruct, options } = render
    const { fontsz, radiusScaleFactor } = options
    const padding = fontsz * radiusScaleFactor
    const radius = fontsz * radiusScaleFactor * 2
    const box = this.getVBoxObj(restruct.render)!
    const ps1 = Scale.obj2scaled(box.p0, restruct.render.options)
    const ps2 = Scale.obj2scaled(box.p1, restruct.render.options)
    const width = ps2.x - ps1.x
    const height = fontsz * 1.23
    return paper.rect(
      ps1.x - padding,
      ps1.y - padding,
      width + padding * 2,
      height + padding * 2,
      radius
    )
  }

  getUnlabeledSelectionContour(render: Render) {
    const { paper, options } = render
    const { atomSelectionPlateRadius } = options
    const ps = Scale.obj2scaled(this.a.pp, options)
    return paper.circle(ps.x, ps.y, atomSelectionPlateRadius)
  }

  getSelectionContour(render: Render) {
    const hasLabel =
      (this.a.pseudo && this.a.pseudo.length > 1) ||
      (this.showLabel && this.a.implicitH !== 0)
    return hasLabel
      ? this.getLabeledSelectionContour(render)
      : this.getUnlabeledSelectionContour(render)
  }

  makeHoverPlate(render: Render) {
    const atom = this.a
    const { options } = render
    const sgroups = render.ctab.sgroups
    const functionalGroups = render.ctab.molecule.functionalGroups
    if (
      FunctionalGroup.isAtomInContractedFunctionalGroup(
        atom,
        sgroups,
        functionalGroups,
        true
      )
    ) {
      return null
    }

    return this.getSelectionContour(render).attr(options.hoverStyle)
  }

  makeSelectionPlate(restruct: ReStruct) {
    const atom = this.a
    const { render } = restruct
    const { options } = render
    const sgroups = render.ctab.sgroups
    const functionalGroups = render.ctab.molecule.functionalGroups
    if (
      FunctionalGroup.isAtomInContractedFunctionalGroup(
        atom,
        sgroups,
        functionalGroups,
        true
      )
    ) {
      return null
    }

    return this.getSelectionContour(render).attr(options.selectionStyle)
  }

  /**
   * if atom is rendered as Abbreviation: O, NH, ...
   * In this case we need to shift the bond render start position to free space for Atom,
   * same for the Attachment point
   */
  getShiftedSegmentPosition(
    renderOptions: RenderOptions,
    direction: Vec2
  ): Vec2 {
    const atomPosition = Scale.obj2scaled(this.a.pp, renderOptions)
    let atomSymbolShift = 0
    const exts = this.visel.exts
    for (let k = 0; k < exts.length; ++k) {
      const box = exts[k].translate(atomPosition)
      atomSymbolShift = Math.max(
        atomSymbolShift,
        util.shiftRayBox(atomPosition, direction, box)
      )
    }
    if (atomSymbolShift > 0) {
      return atomPosition.addScaled(
        direction,
        atomSymbolShift + 2 * renderOptions.lineWidth
      )
    } else {
      return atomPosition
    }
  }

  hasAttachmentPoint(): boolean {
    return Boolean(this.a.attpnt)
  }

  private isTrisectionAttachmentPoint(): boolean {
    // in this case we should split the attachment point vector to two vectors
    return this.a.attpnt === 3
  }

  private getAttachmentPointDirectionVectors(struct: Struct): Vec2[] {
    if (!this.hasAttachmentPoint()) {
      return []
    }
    if (this.isTrisectionAttachmentPoint()) {
      return trisectionLargestSector(this, struct)
    } else {
      const hasOnlyOneBond = this.a.neighbors.length === 1
      const directionVector = hasOnlyOneBond
        ? getAttachmentDirectionForOnlyOneBond(this, struct)
        : bisectLargestSector(this, struct)
      return [directionVector]
    }
  }

  showAttachmentPoints(restruct: ReStruct): void {
    const directionVectors = this.getAttachmentPointDirectionVectors(
      restruct.molecule
    )
    directionVectors.forEach((directionVector, index) => {
      showAttachmentPointShape(
        this,
        restruct.render,
        directionVector,
        restruct.addReObjectPath.bind(restruct)
      )

      const showLabel = isAttachmentPointLabelRequired(restruct)
      if (showLabel) {
        // in case of isTrisectionRequired (trisection case) we should show labels '1' and '2' for those separated vectors
        const labelText = String(
          this.isTrisectionAttachmentPoint() ? index + 1 : this.a.attpnt
        )
        showAttachmentPointLabel(
          this,
          restruct.render,
          directionVector,
          restruct.addReObjectPath.bind(restruct),
          labelText
        )
      }
    })
  }

  show(restruct: ReStruct, aid: number, options: any): void {
    // eslint-disable-line max-statements
    const atom = restruct.molecule.atoms.get(aid)!
    const sgroups = restruct.molecule.sgroups
    const functionalGroups = restruct.molecule.functionalGroups
    const render = restruct.render
    const ps = Scale.obj2scaled(this.a.pp, render.options)

    if (
      FunctionalGroup.isAtomInContractedFunctionalGroup(
        atom,
        sgroups,
        functionalGroups,
        false
      )
    ) {
      const sgroup = restruct.molecule.getGroupFromAtomId(aid)
      const isPositionAtom =
        sgroup?.getContractedPosition(restruct.molecule).atomId === aid
      if (isPositionAtom) {
        const path = render.paper.text(ps.x, ps.y, sgroup.data.name).attr({
          'font-weight': 700,
          'font-size': 14
        })
        restruct.addReObjectPath(LayerMap.data, this.visel, path, ps, true)
      }
      return
    }

    this.hydrogenOnTheLeft = setHydrogenPos(restruct.molecule, this)
    this.showLabel = isLabelVisible(restruct, render.options, this)
    this.color = 'black' // reset colour

    let delta
    let rightMargin
    let leftMargin
    let implh
    let isHydrogen
    let isHydrogenIsotope
    let label
    let index: any = null

    if (this.showLabel) {
      label = buildLabel(this, render.paper, ps, options)
      delta = 0.5 * options.lineWidth
      rightMargin =
        (label.rbb.width / 2) * (options.zoom > 1 ? 1 : options.zoom)
      leftMargin =
        (-label.rbb.width / 2) * (options.zoom > 1 ? 1 : options.zoom)
      implh = Math.floor(this.a.implicitH)
      isHydrogen = label.text === 'H'
      isHydrogenIsotope = label.text === 'D' || label.text === 'T'
      restruct.addReObjectPath(LayerMap.data, this.visel, label.path, ps, true)
    }
    if (options.showAtomIds) {
      index = {}
      index.text = aid.toString()
      let idPos = this.hydrogenOnTheLeft
        ? Vec2.lc(ps, 1, new Vec2({ x: -2, y: 0, z: 0 }), 6)
        : Vec2.lc(ps, 1, new Vec2({ x: 2, y: 0, z: 0 }), 6)
      if (this.showLabel) {
        idPos = Vec2.lc(idPos, 1, new Vec2({ x: 1, y: -3, z: 0 }), 6)
      }
      index.path = render.paper.text(idPos.x, idPos.y, index.text).attr({
        font: options.font,
        'font-size': options.fontszsub,
        fill: '#070'
      })
      index.rbb = util.relBox(index.path.getBBox())
      draw.recenterText(index.path, index.rbb)
      restruct.addReObjectPath(LayerMap.indices, this.visel, index.path, ps)
    }

    if (this.showLabel && (!this.a.pseudo || isHydrogenIsotope)) {
      let hydroIndex: any = null
      if (isHydrogen && implh > 0) {
        hydroIndex = showHydroIndex(this, render, implh, rightMargin)
        rightMargin += hydroIndex.rbb.width + delta
        restruct.addReObjectPath(
          LayerMap.data,
          this.visel,
          hydroIndex.path,
          ps,
          true
        )
      }

      if (this.a.radical !== 0) {
        const radical = showRadical(this, render)
        restruct.addReObjectPath(
          LayerMap.data,
          this.visel,
          radical.path,
          ps,
          true
        )
      }
      if (this.a.isotope !== 0) {
        const isotope = showIsotope(this, render, leftMargin)
        leftMargin -= isotope.rbb.width + delta
        restruct.addReObjectPath(
          LayerMap.data,
          this.visel,
          isotope.path,
          ps,
          true
        )
      }
      if (
        !isHydrogen &&
        !this.a.alias &&
        implh > 0 &&
        displayHydrogen(options.showHydrogenLabels, this)
      ) {
        const data = showHydrogen(this, render, implh, {
          hydrogen: {},
          hydroIndex,
          rightMargin,
          leftMargin
        })
        const hydrogen = data.hydrogen
        hydroIndex = data.hydroIndex
        rightMargin = data.rightMargin
        leftMargin = data.leftMargin
        restruct.addReObjectPath(
          LayerMap.data,
          this.visel,
          hydrogen.path,
          ps,
          true
        )
        if (hydroIndex != null) {
          restruct.addReObjectPath(
            LayerMap.data,
            this.visel,
            hydroIndex.path,
            ps,
            true
          )
        }
      }

      if (this.a.charge !== 0 && options.showCharge) {
        const charge = showCharge(this, render, rightMargin)
        rightMargin += charge.rbb.width + delta
        restruct.addReObjectPath(
          LayerMap.data,
          this.visel,
          charge.path,
          ps,
          true
        )
      }
      if (this.a.explicitValence >= 0 && options.showValence) {
        const valence = showExplicitValence(this, render, rightMargin)
        rightMargin += valence.rbb.width + delta
        restruct.addReObjectPath(
          LayerMap.data,
          this.visel,
          valence.path,
          ps,
          true
        )
      }

      if (this.a.badConn && options.showValenceWarnings) {
        const warning = showWarning(this, render, leftMargin, rightMargin)
        restruct.addReObjectPath(
          LayerMap.warnings,
          this.visel,
          warning.path,
          ps,
          true
        )
      }
      if (index) {
        /* eslint-disable no-mixed-operators */
        pathAndRBoxTranslate(
          index.path,
          index.rbb,
          -0.5 * label.rbb.width - 0.5 * index.rbb.width - delta,
          0.3 * label.rbb.height
        )
        /* eslint-enable no-mixed-operators */
      }
    }

    // draw hover after label is calculated
    this.setHover(this.hover, render)

    const stereoLabel = this.a.stereoLabel // Enhanced Stereo
    const aamText = getAamText(this)
    const queryAttrsText = !this.a.pseudo ? getQueryAttrsText(this) : ''

    // we render them together to avoid possible collisions

    const fragmentId = Number(restruct.atoms.get(aid)?.a.fragment)
    // TODO: fragment should not be null
    const fragment = restruct.molecule.frags.get(fragmentId)

    const text =
      (shouldDisplayStereoLabel(
        stereoLabel,
        options.stereoLabelStyle,
        options.ignoreChiralFlag,
        fragment?.enhancedStereoFlag
      )
        ? `${stereoLabel}\n`
        : '') +
      (queryAttrsText.length > 0 ? `${queryAttrsText}\n` : '') +
      (aamText.length > 0 ? `.${aamText}.` : '')

    if (text.length > 0) {
      const elem = Elements.get(this.a.label)
      const aamPath = render.paper.text(ps.x, ps.y, text).attr({
        font: options.font,
        'font-size': options.fontszsub,
        fill: options.atomColoring && elem ? ElementColor[this.a.label] : '#000'
      })
      if (stereoLabel) {
        // use dom element to change color of stereo label which is the first element
        // of just created text
        // text -> tspan
        const color = getStereoAtomColor(render.options, stereoLabel)
        aamPath.node.childNodes[0].setAttribute('fill', color)
        const opacity = getStereoAtomOpacity(render.options, stereoLabel)
        aamPath.node.childNodes[0].setAttribute('fill-opacity', opacity)
      }
      const aamBox = util.relBox(aamPath.getBBox())
      draw.recenterText(aamPath, aamBox)
      const visel = this.visel
      let t = 3
      let dir = bisectLargestSector(this, restruct.molecule)
      // estimate the shift to clear the atom label
      for (let i = 0; i < visel.exts.length; ++i) {
        t = Math.max(t, util.shiftRayBox(ps, dir, visel.exts[i].translate(ps)))
      }
      // estimate the shift backwards to account for the size of the aam/query text box itself
      t += util.shiftRayBox(ps, dir.negated(), Box2Abs.fromRelBox(aamBox))
      dir = dir.scaled(8 + t)
      pathAndRBoxTranslate(aamPath, aamBox, dir.x, dir.y)
      restruct.addReObjectPath(LayerMap.data, this.visel, aamPath, ps, true)
    }

    // Checking whether atom is highlighted and what's the last color
    const highlights = restruct.molecule.highlights
    let isHighlighted = false
    let highlightColor = ''
    highlights.forEach((highlight) => {
      const hasCurrentHighlight = highlight.atoms?.includes(aid)
      isHighlighted = isHighlighted || hasCurrentHighlight
      if (hasCurrentHighlight) {
        highlightColor = highlight.color
      }
    })

    // Drawing highlight
    if (isHighlighted) {
      const style = { fill: highlightColor, stroke: 'none' }

      const ps = Scale.obj2scaled(this.a.pp, restruct.render.options)
      const path = render.paper
        .circle(ps.x, ps.y, options.atomSelectionPlateRadius * 0.8)
        .attr(style)

      restruct.addReObjectPath(LayerMap.hovering, this.visel, path)
    }

    if (atom.cip) {
      this.cip = util.drawCIPLabel({
        atomOrBond: atom,
        position: atom.pp,
        restruct: render.ctab,
        visel: this.visel
      })
    }
  }
}

function getStereoAtomColor(options, stereoLabel) {
  if (
    !stereoLabel ||
    options.colorStereogenicCenters === StereoColoringType.Off ||
    options.colorStereogenicCenters === StereoColoringType.BondsOnly
  ) {
    return '#000'
  }

  return getColorFromStereoLabel(options, stereoLabel)
}

export function getColorFromStereoLabel(options, stereoLabel) {
  const stereoLabelType = stereoLabel.match(/\D+/g)[0]

  switch (stereoLabelType) {
    case StereoLabel.And:
      return options.colorOfAndCenters
    case StereoLabel.Or:
      return options.colorOfOrCenters
    case StereoLabel.Abs:
      return options.colorOfAbsoluteCenters
    default:
      return '#000'
  }
}

function getStereoAtomOpacity(options, stereoLabel) {
  const stereoLabelType = stereoLabel.match(/\D+/g)[0]
  const stereoLabelNumber = +stereoLabel.replace(stereoLabelType, '')
  if (
    !options.autoFadeOfStereoLabels ||
    stereoLabelType === StereoLabel.Abs ||
    options.colorStereogenicCenters === StereoColoringType.Off ||
    options.colorStereogenicCenters === StereoColoringType.BondsOnly
  ) {
    return 1
  }
  return Math.max(1 - (stereoLabelNumber - 1) / 10, StereoLabelMinOpacity)
}

function shouldDisplayStereoLabel(
  stereoLabel,
  labelStyle,
  ignoreChiralFlag,
  flag: StereoFlag | undefined
): boolean {
  if (!stereoLabel) {
    return false
  }
  const stereoLabelType = stereoLabel.match(/\D+/g)[0]

  if (ignoreChiralFlag && stereoLabelType === StereoLabel.Abs) {
    return false
  }
  if (ignoreChiralFlag && stereoLabelType !== StereoLabel.Abs) {
    return true
  }

  switch (labelStyle) {
    // Off
    case StereLabelStyleType.Off:
      return false
    // On
    case StereLabelStyleType.On:
      return true
    // Classic
    case StereLabelStyleType.Classic:
      return !!(flag === StereoFlag.Mixed || stereoLabelType === StereoLabel.Or)
    // IUPAC
    case StereLabelStyleType.IUPAC:
      return !!(
        flag === StereoFlag.Mixed && stereoLabelType !== StereoLabel.Abs
      )
    default:
      return true
  }
}

function isLabelVisible(restruct, options, atom) {
  const isAttachmentPointAtom = atom.a.attpnt != null
  const isCarbon = atom.a.label.toLowerCase() === 'c'
  const visibleTerminal =
    options.showHydrogenLabels !== ShowHydrogenLabels.Off &&
    options.showHydrogenLabels !== ShowHydrogenLabels.Hetero

  const neighborsLength =
    atom.a.neighbors.length === 0 ||
    (atom.a.neighbors.length < 2 && visibleTerminal)

  if (isAttachmentPointAtom && atom.a.neighbors.length > 0 && isCarbon) {
    return false
  }

  const shouldBeVisible =
    neighborsLength ||
    options.carbonExplicitly ||
    options.showHydrogenLabels === ShowHydrogenLabels.On ||
    atom.a.alias ||
    atom.a.isotope !== 0 ||
    atom.a.radical !== 0 ||
    atom.a.charge !== 0 ||
    atom.a.explicitValence >= 0 ||
    atom.a.atomList !== null ||
    atom.a.rglabel !== null ||
    (atom.a.badConn && options.showValenceWarnings) ||
    atom.a.label.toLowerCase() !== 'c'

  if (shouldBeVisible) return true

  if (atom.a.neighbors.length === 2) {
    const nei1 = atom.a.neighbors[0]
    const nei2 = atom.a.neighbors[1]
    const hb1 = restruct.molecule.halfBonds.get(nei1)
    const hb2 = restruct.molecule.halfBonds.get(nei2)
    const bond1 = restruct.bonds.get(hb1.bid)
    const bond2 = restruct.bonds.get(hb2.bid)

    const sameNotStereo =
      bond1.b.type === bond2.b.type &&
      bond1.b.stereo === Bond.PATTERN.STEREO.NONE &&
      bond2.b.stereo === Bond.PATTERN.STEREO.NONE

    if (sameNotStereo && Math.abs(Vec2.cross(hb1.dir, hb2.dir)) < 0.2) {
      return true
    }
  }

  return false
}

function displayHydrogen(hydrogenLabels: ShowHydrogenLabels, atom: ReAtom) {
  return (
    hydrogenLabels === ShowHydrogenLabels.On ||
    (hydrogenLabels === ShowHydrogenLabels.Terminal &&
      atom.a.neighbors.length < 2) ||
    (hydrogenLabels === ShowHydrogenLabels.Hetero &&
      atom.label?.text.toLowerCase() !== 'c') ||
    (hydrogenLabels === ShowHydrogenLabels.TerminalAndHetero &&
      (atom.a.neighbors.length < 2 || atom.label?.text.toLowerCase() !== 'c'))
  )
}

function setHydrogenPos(struct, atom) {
  // check where should the hydrogen be put on the left of the label
  if (atom.a.neighbors.length === 0) {
    if (atom.a.label === 'D' || atom.a.label === 'T') {
      return false
    } else {
      const element = Elements.get(atom.a.label)
      return !element || Boolean(element.leftH)
    }
  }

  let yl = 1
  let yr = 1
  let nl = 0
  let nr = 0

  atom.a.neighbors.forEach((nei) => {
    const d = struct.halfBonds.get(nei).dir

    if (d.x <= 0) {
      yl = Math.min(yl, Math.abs(d.y))
      nl++
    } else {
      yr = Math.min(yr, Math.abs(d.y))
      nr++
    }
  })

  return yl < 0.51 || yr < 0.51 ? yr < yl : nr > nl
}

function buildLabel(
  atom: ReAtom,
  paper: any,
  ps: Vec2,
  options: any
): ElemAttr {
  // eslint-disable-line max-statements
  let label: any = {}
  label.text = getLabelText(atom.a)

  if (label.text === '') label = 'R#' // for structures that missed 'M  RGP' tag in molfile

  if (label.text === atom.a.label) {
    const element = Elements.get(label.text)
    if (options.atomColoring && element) {
      atom.color = ElementColor[label.text] || '#000'
    }
  }

  label.path = paper.text(ps.x, ps.y, label.text).attr({
    font: options.font,
    'font-size': options.fontsz,
    fill: atom.color,
    'font-style': atom.a.pseudo ? 'italic' : ''
  })

  label.rbb = util.relBox(label.path.getBBox())
  draw.recenterText(label.path, label.rbb)

  if (atom.a.atomList !== null) {
    pathAndRBoxTranslate(
      label.path,
      label.rbb,
      ((atom.hydrogenOnTheLeft ? -1 : 1) *
        (label.rbb.width - label.rbb.height)) /
        2,
      0
    )
  }

  atom.label = label
  return label
}

function getLabelText(atom) {
  if (atom.atomList !== null) return atom.atomList.label()

  if (atom.pseudo) return atom.pseudo

  if (atom.alias) return atom.alias

  if (atom.label === 'R#' && atom.rglabel !== null) {
    let text = ''

    for (let rgi = 0; rgi < 32; rgi++) {
      if (atom.rglabel & (1 << rgi)) {
        // eslint-disable-line max-depth
        text += 'R' + (rgi + 1).toString()
      }
    }

    return text
  }

  return atom.label
}

function showHydroIndex(atom, render, implh, rightMargin): ElemAttr {
  const ps = Scale.obj2scaled(atom.a.pp, render.options)
  const options = render.options
  const delta = 0.5 * options.lineWidth
  const hydroIndex: any = {}
  hydroIndex.text = (implh + 1).toString()
  hydroIndex.path = render.paper.text(ps.x, ps.y, hydroIndex.text).attr({
    font: options.font,
    'font-size': options.fontszsub,
    fill: atom.color
  })
  hydroIndex.rbb = util.relBox(hydroIndex.path.getBBox())
  draw.recenterText(hydroIndex.path, hydroIndex.rbb)
  /* eslint-disable no-mixed-operators */
  pathAndRBoxTranslate(
    hydroIndex.path,
    hydroIndex.rbb,
    rightMargin + 0.5 * hydroIndex.rbb.width + delta,
    0.2 * atom.label.rbb.height
  )
  /* eslint-enable no-mixed-operators */
  return hydroIndex
}

function showRadical(atom: ReAtom, render: Render): Omit<ElemAttr, 'text'> {
  const ps: Vec2 = Scale.obj2scaled(atom.a.pp, render.options)
  const options = render.options
  const paper: any = render.paper
  const radical: any = {}
  let hshift
  switch (atom.a.radical) {
    case 1:
      radical.path = paper.set()
      hshift = 1.6 * options.lineWidth
      radical.path.push(
        draw.radicalBullet(paper, ps.add(new Vec2(-hshift, 0)), options),
        draw.radicalBullet(paper, ps.add(new Vec2(hshift, 0)), options)
      )
      radical.path.attr('fill', atom.color)
      break
    case 2:
      radical.path = paper.set()
      radical.path.push(draw.radicalBullet(paper, ps, options))
      radical.path.attr('fill', atom.color)
      break
    case 3:
      radical.path = paper.set()
      hshift = 1.6 * options.lineWidth
      radical.path.push(
        draw.radicalCap(paper, ps.add(new Vec2(-hshift, 0)), options),
        draw.radicalCap(paper, ps.add(new Vec2(hshift, 0)), options)
      )
      radical.path.attr('stroke', atom.color)
      break
    default:
      break
  }
  radical.rbb = util.relBox(radical.path.getBBox())
  let vshift = -0.5 * (atom.label!.rbb.height + radical.rbb.height)
  if (atom.a.radical === 3) vshift -= options.lineWidth / 2
  pathAndRBoxTranslate(radical.path, radical.rbb, 0, vshift)
  return radical
}

function showIsotope(
  atom: ReAtom,
  render: Render,
  leftMargin: number
): ElemAttr {
  const ps = Scale.obj2scaled(atom.a.pp, render.options)
  const options = render.options
  const delta = 0.5 * options.lineWidth
  const isotope: any = {}
  isotope.text = atom.a.isotope.toString()
  isotope.path = render.paper.text(ps.x, ps.y, isotope.text).attr({
    font: options.font,
    'font-size': options.fontszsub,
    fill: atom.color
  })
  isotope.rbb = util.relBox(isotope.path.getBBox())
  draw.recenterText(isotope.path, isotope.rbb)
  /* eslint-disable no-mixed-operators */
  pathAndRBoxTranslate(
    isotope.path,
    isotope.rbb,
    leftMargin - 0.5 * isotope.rbb.width - delta,
    -0.3 * atom.label!.rbb.height
  )
  /* eslint-enable no-mixed-operators */
  return isotope
}

function showCharge(
  atom: ReAtom,
  render: Render,
  rightMargin: number
): ElemAttr {
  const ps = Scale.obj2scaled(atom.a.pp, render.options)
  const options = render.options
  const delta = 0.5 * options.lineWidth
  const charge: any = {}
  charge.text = ''
  const absCharge = Math.abs(atom.a.charge)
  if (absCharge !== 1) charge.text = absCharge.toString()
  if (atom.a.charge < 0) charge.text += '\u2013'
  else charge.text += '+'

  charge.path = render.paper.text(ps.x, ps.y, charge.text).attr({
    font: options.font,
    'font-size': options.fontszsub,
    fill: atom.color
  })
  charge.rbb = util.relBox(charge.path.getBBox())
  draw.recenterText(charge.path, charge.rbb)
  /* eslint-disable no-mixed-operators */
  pathAndRBoxTranslate(
    charge.path,
    charge.rbb,
    rightMargin + 0.5 * charge.rbb.width + delta,
    -0.3 * atom.label!.rbb.height
  )
  /* eslint-enable no-mixed-operators */
  return charge
}

function showExplicitValence(
  atom: ReAtom,
  render: Render,
  rightMargin: number
): ElemAttr {
  const mapValence = {
    0: '0',
    1: 'I',
    2: 'II',
    3: 'III',
    4: 'IV',
    5: 'V',
    6: 'VI',
    7: 'VII',
    8: 'VIII',
    9: 'IX',
    10: 'X',
    11: 'XI',
    12: 'XII',
    13: 'XIII',
    14: 'XIV'
  }
  const ps = Scale.obj2scaled(atom.a.pp, render.options)
  const options = render.options
  const delta = 0.5 * options.lineWidth
  const valence: any = {}
  valence.text = mapValence[atom.a.explicitValence]
  if (!valence.text) {
    throw new Error('invalid valence ' + atom.a.explicitValence.toString())
  }
  valence.text = '(' + valence.text + ')'
  valence.path = render.paper.text(ps.x, ps.y, valence.text).attr({
    font: options.font,
    'font-size': options.fontszsub,
    fill: atom.color
  })
  valence.rbb = util.relBox(valence.path.getBBox())
  draw.recenterText(valence.path, valence.rbb)
  /* eslint-disable no-mixed-operators */
  pathAndRBoxTranslate(
    valence.path,
    valence.rbb,
    rightMargin + 0.5 * valence.rbb.width + delta,
    -0.3 * atom.label!.rbb.height
  )
  /* eslint-enable no-mixed-operators */
  return valence
}

function showHydrogen(
  atom: ReAtom,
  render: Render,
  implh: number,
  data: {
    hydrogen: any
    hydroIndex: number
    rightMargin: number
    leftMargin: number
  }
): {
  hydrogen: ElemAttr
  hydroIndex: ElemAttr
  rightMargin: number
  leftMargin: number
} {
  // eslint-disable-line max-statements
  let hydroIndex: any = data.hydroIndex
  const hydrogenLeft = atom.hydrogenOnTheLeft
  const ps = Scale.obj2scaled(atom.a.pp, render.options)
  const options = render.options
  const delta = 0.5 * options.lineWidth
  const hydrogen = data.hydrogen
  hydrogen.text = 'H'
  hydrogen.path = render.paper.text(ps.x, ps.y, hydrogen.text).attr({
    font: options.font,
    'font-size': options.fontsz,
    fill: atom.color
  })
  hydrogen.rbb = util.relBox(hydrogen.path.getBBox())
  draw.recenterText(hydrogen.path, hydrogen.rbb)
  if (!hydrogenLeft) {
    pathAndRBoxTranslate(
      hydrogen.path,
      hydrogen.rbb,
      data.rightMargin + 0.5 * hydrogen.rbb.width + delta,
      0
    )
    data.rightMargin += hydrogen.rbb.width + delta
  }
  if (implh > 1) {
    hydroIndex = {}
    hydroIndex.text = implh.toString()
    hydroIndex.path = render.paper.text(ps.x, ps.y, hydroIndex.text).attr({
      font: options.font,
      'font-size': options.fontszsub,
      fill: atom.color
    })
    hydroIndex.rbb = util.relBox(hydroIndex.path.getBBox())
    draw.recenterText(hydroIndex.path, hydroIndex.rbb)
    if (!hydrogenLeft) {
      pathAndRBoxTranslate(
        hydroIndex.path,
        hydroIndex.rbb,
        data.rightMargin +
          0.5 * hydroIndex.rbb.width * (options.zoom > 1 ? 1 : options.zoom) +
          delta,
        0.2 * atom.label!.rbb.height
      )
      data.rightMargin += hydroIndex.rbb.width + delta
    }
  }
  if (hydrogenLeft) {
    if (hydroIndex != null) {
      pathAndRBoxTranslate(
        hydroIndex.path,
        hydroIndex.rbb,
        data.leftMargin - 0.5 * hydroIndex.rbb.width - delta,
        0.2 * atom.label!.rbb.height
      )
      data.leftMargin -= hydroIndex.rbb.width + delta
    }
    pathAndRBoxTranslate(
      hydrogen.path,
      hydrogen.rbb,
      data.leftMargin -
        0.5 *
          hydrogen.rbb.width *
          (implh > 1 && options.zoom < 1 ? options.zoom : 1) -
        delta,
      0
    )
    data.leftMargin -= hydrogen.rbb.width + delta
  }
  return Object.assign(data, { hydrogen, hydroIndex })
}

function showWarning(
  atom,
  render,
  leftMargin,
  rightMargin
): { rbb: DOMRect; path: any } {
  const ps = Scale.obj2scaled(atom.a.pp, render.options)
  const delta = 0.5 * render.options.lineWidth
  const warning: any = {}
  const y = ps.y + atom.label.rbb.height / 2 + delta
  warning.path = render.paper
    .path(
      'M{0},{1}L{2},{3}',
      tfx(ps.x + leftMargin),
      tfx(y),
      tfx(ps.x + rightMargin),
      tfx(y)
    )
    .attr(render.options.lineattr)
    .attr({ stroke: '#F00' })
  warning.rbb = util.relBox(warning.path.getBBox())
  return warning
}

function getAamText(atom) {
  let aamText = ''
  if (atom.a.aam > 0) aamText += atom.a.aam
  if (atom.a.invRet > 0) {
    if (aamText.length > 0) aamText += ','
    if (atom.a.invRet === 1) aamText += 'Inv'
    else if (atom.a.invRet === 2) aamText += 'Ret'
    else throw new Error('Invalid value for the invert/retain flag')
  }
  if (atom.a.exactChangeFlag > 0) {
    if (aamText.length > 0) aamText += ','
    if (atom.a.exactChangeFlag === 1) aamText += 'ext'
    else throw new Error('Invalid value for the exact change flag')
  }
  return aamText
}

function getQueryAttrsText(atom) {
  let queryAttrsText = ''
  if (atom.a.ringBondCount !== 0) {
    if (atom.a.ringBondCount > 0) {
      queryAttrsText += 'rb' + atom.a.ringBondCount.toString()
    } else if (atom.a.ringBondCount === -1) queryAttrsText += 'rb0'
    else if (atom.a.ringBondCount === -2) queryAttrsText += 'rb*'
    else throw new Error('Ring bond count invalid')
  }
  if (atom.a.substitutionCount !== 0) {
    if (queryAttrsText.length > 0) queryAttrsText += ','
    if (atom.a.substitutionCount > 0) {
      queryAttrsText += 's' + atom.a.substitutionCount.toString()
    } else if (atom.a.substitutionCount === -1) queryAttrsText += 's0'
    else if (atom.a.substitutionCount === -2) queryAttrsText += 's*'
    else throw new Error('Substitution count invalid')
  }
  if (atom.a.unsaturatedAtom > 0) {
    if (queryAttrsText.length > 0) queryAttrsText += ','
    if (atom.a.unsaturatedAtom === 1) queryAttrsText += 'u'
    else throw new Error('Unsaturated atom invalid value')
  }
  if (atom.a.hCount > 0) {
    if (queryAttrsText.length > 0) queryAttrsText += ','
    queryAttrsText += 'H' + (atom.a.hCount - 1).toString()
  }
  return queryAttrsText
}

function pathAndRBoxTranslate(path, rbb, x, y) {
  path.translateAbs(x, y)
  rbb.x += x
  rbb.y += y
}

function bisectLargestSector(atom: ReAtom, struct: Struct): Vec2 {
  const { largestAngle, neighborAngle } = getLargestSectorFromNeighbors(
    atom,
    struct
  )
  const bisectAngle = neighborAngle + largestAngle / 2
  return newVectorFromAngle(bisectAngle)
}

function getAttachmentDirectionForOnlyOneBond(
  atom: ReAtom,
  struct: Struct
): Vec2 {
  const DEGREE_120_FOR_ONE_BOND = (2 * Math.PI) / 3
  const DEGREE_180_FOR_TRIPLE_BOND = Math.PI
  const onlyNeighbor = atom.a.neighbors[0]
  // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
  const neighbour = struct.halfBonds.get(onlyNeighbor)!
  const angle = neighbour.ang
  const isTripleBond =
    struct.bonds.get(neighbour.bid)?.type === Bond.PATTERN.TYPE.TRIPLE
  const finalAngle =
    angle +
    (isTripleBond ? DEGREE_180_FOR_TRIPLE_BOND : DEGREE_120_FOR_ONE_BOND)
  return newVectorFromAngle(finalAngle)
}

function trisectionLargestSector(atom: ReAtom, struct: Struct): [Vec2, Vec2] {
  const { largestAngle, neighborAngle } = getLargestSectorFromNeighbors(
    atom,
    struct
  )
  const firstTrisectorAngle = neighborAngle + largestAngle / 3
  const secondTrisectorAngle = neighborAngle + (largestAngle * 2) / 3

  return [
    newVectorFromAngle(firstTrisectorAngle),
    newVectorFromAngle(secondTrisectorAngle)
  ]
}

function newVectorFromAngle(angle: number): Vec2 {
  return new Vec2(Math.cos(angle), Math.sin(angle))
}

function getLargestSectorFromNeighbors(
  atom: ReAtom,
  struct: Struct
): { neighborAngle: number; largestAngle: number } {
  let angles: Array<number> = []
  atom.a.neighbors.forEach((hbid) => {
    const hb = struct.halfBonds.get(hbid)
    hb && angles.push(hb.ang)
  })
  angles = angles.sort((a, b) => a - b)
  const da: Array<number> = []
  for (let i = 0; i < angles.length - 1; ++i) {
    da.push(angles[(i + 1) % angles.length] - angles[i])
  }
  da.push(angles[0] - angles[angles.length - 1] + 2 * Math.PI)
  let daMax = 0
  let ang = -Math.PI / 2
  for (let i = 0; i < angles.length; ++i) {
    if (da[i] > daMax) {
      daMax = da[i]
      ang = angles[i]
    }
  }

  return { neighborAngle: ang, largestAngle: daMax }
}

function getSvgCurveShapeAttachmentPoint(
  centerPosition: Vec2,
  directionVector: Vec2,
  basicSize: number
): string {
  // declared here https://github.com/epam/ketcher/issues/2165
  // this path has (0,0) in the position of attachment point atom
  const attachmentPointSvgPathString = `M13 1.5l-1.5 3.7c-0.3 0.8-1.5 0.8-1.9 0l-1.7-4.4c-0.3-0.8-1.5-0.8-1.9 0l-1.7 4.4c-0.3 0.8-1.5 0.8-1.8 0l-1.8-4.4c-0.3-0.8-1.5-0.8-1.8 0l-1.7 4.4c-0.3 0.8-1.5 0.8-1.9 0l-1.7-4.4c-0.3-0.8-1.5-0.8-1.9 0l-1.6 4.2c-0.3 0.9-1.6 0.8-1.9 0l-1.2-3.5`
  const attachmentPointSvgPathSize = 39.8

  const shapeScale = basicSize / attachmentPointSvgPathSize
  const angleDegrees =
    (Math.atan2(directionVector.y, directionVector.x) * 180) / Math.PI - 90

  return svgPath(attachmentPointSvgPathString)
    .rotate(angleDegrees)
    .scale(shapeScale)
    .translate(centerPosition.x, centerPosition.y)
    .toString()
}

function showAttachmentPointShape(
  atom: ReAtom,
  { options, paper }: Render,
  directionVector: Vec2,
  addReObjectPath: InstanceType<typeof ReStruct>['addReObjectPath']
): void {
  const atomPositionVector = Scale.obj2scaled(atom.a.pp, options)
  const shiftedAtomPositionVector = atom.getShiftedSegmentPosition(
    options,
    directionVector
  )
  const attachmentPointEnd = atomPositionVector.addScaled(
    directionVector,
    options.scale * 0.85
  )

  const linePath = paper.path(
    'M{0},{1}L{2},{3}',
    tfx(shiftedAtomPositionVector.x),
    tfx(shiftedAtomPositionVector.y),
    tfx(attachmentPointEnd.x),
    tfx(attachmentPointEnd.y)
  )

  const curvePath = paper.path(
    getSvgCurveShapeAttachmentPoint(
      attachmentPointEnd,
      directionVector,
      options.scale
    )
  )

  const resultShape = paper
    .set([curvePath, linePath])
    .attr(options.lineattr)
    .attr({ 'stroke-width': options.lineWidth })

  addReObjectPath(LayerMap.indices, atom.visel, resultShape, atomPositionVector)
}

function getLabelPositionForAttachmentPoint(
  atomPositionVector: Vec2,
  directionVector: Vec2,
  shapeHeight: number
): Vec2 {
  const normal = directionVector.rotateSC(1, 0)
  return atomPositionVector
    .addScaled(normal, 0.17 * shapeHeight)
    .addScaled(directionVector, shapeHeight * 0.7)
}

function showAttachmentPointLabel(
  atom: ReAtom,
  { options, paper }: Render,
  directionVector: Vec2,
  addReObjectPath: InstanceType<typeof ReStruct>['addReObjectPath'],
  labelText: string
): void {
  const atomPositionVector = Scale.obj2scaled(atom.a.pp, options)
  const labelPosition = getLabelPositionForAttachmentPoint(
    atomPositionVector,
    directionVector,
    options.scale
  )
  const labelPath = paper
    .text(labelPosition.x, labelPosition.y, labelText)
    .attr({
      font: options.font,
      'font-size': options.fontsz * 0.9,
      fill: atom.color
    })

  addReObjectPath(LayerMap.indices, atom.visel, labelPath, atomPositionVector)
}

export function isAttachmentPointLabelRequired(restruct: ReStruct) {
  // in case of having 2 or 3 attachment point type we have to render
  // 2 - Secondary type
  // 3 - Both Primary and Secondary - should be considered as two Attachment points
  return restruct.molecule.atoms.some(({ attpnt }) => [2, 3].includes(attpnt))
}

export default ReAtom
