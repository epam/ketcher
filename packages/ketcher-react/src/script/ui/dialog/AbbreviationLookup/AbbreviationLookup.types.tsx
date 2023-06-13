import { Template } from '../template/TemplateTable'
import { Element } from 'ketcher-core'

export enum AbbreviationType {
  Template = 'Template',
  Element = 'Element'
}

export interface AbbreviationGenericOption {
  type: AbbreviationType
  loweredName: string
  loweredAbbreviation?: string
  label: string
  loweredLabel: string
}

export interface AbbreviationTemplateOption extends AbbreviationGenericOption {
  type: AbbreviationType.Template
  template: Template
}

export interface AbbreviationAtomOption extends AbbreviationGenericOption {
  type: AbbreviationType.Element
  element: Element
}

export type AbbreviationOption =
  | AbbreviationTemplateOption
  | AbbreviationAtomOption
