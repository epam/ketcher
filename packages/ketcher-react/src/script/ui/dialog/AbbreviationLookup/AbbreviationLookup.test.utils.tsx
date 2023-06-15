import {
  AbbreviationElementOption,
  AbbreviationGenericOption,
  AbbreviationOption,
  AbbreviationTemplateOption,
  AbbreviationType
} from './AbbreviationLookup.types'
import { Template } from '../template/TemplateTable'
import { Element } from 'ketcher-core'

export const createGenericOption = (
  name: string,
  abbreviation?: string,
  type: AbbreviationType = AbbreviationType.Element
): AbbreviationGenericOption => {
  const label = abbreviation ? `${abbreviation} (${name})` : name

  return {
    type,
    label,
    loweredLabel: label.toLowerCase(),
    loweredName: name.toLowerCase(),
    loweredAbbreviation: abbreviation?.toLowerCase()
  }
}

export const createOption = (
  name: string,
  abbreviation?: string,
  type: AbbreviationType = AbbreviationType.Element
): AbbreviationOption => {
  const genericOptions = createGenericOption(name, abbreviation, type)

  if (type === AbbreviationType.Template) {
    return {
      ...genericOptions,
      template: {} as Template
    } as AbbreviationTemplateOption
  } else {
    return {
      ...genericOptions,
      element: {} as Element
    } as AbbreviationElementOption
  }
}
