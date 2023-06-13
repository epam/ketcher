import { Template } from '../template/TemplateTable'

export enum AbbreviationType {
  Template = 'Template',
  Atom = 'Atom'
}

interface AbbreviationGenericOption {
  type: AbbreviationType
  name: string
  loweredName: string
}

export interface AbbreviationTemplateOption extends AbbreviationGenericOption {
  type: AbbreviationType.Template
  template: Template
}

export interface AbbreviationAtomOption extends AbbreviationGenericOption {
  type: AbbreviationType.Atom
  atom: number // ???
}

export type AbbreviationOption =
  | AbbreviationTemplateOption
  | AbbreviationAtomOption
