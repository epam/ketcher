import {
  AbbreviationElementOption,
  AbbreviationGenericOption,
  AbbreviationOption,
  AbbreviationTemplateOption,
  AbbreviationType
} from './AbbreviationLookup.types'
import { Template } from '../template/TemplateTable'
import { Element } from 'ketcher-core'
import { KETCHER_ROOT_NODE_CLASS_NAME } from 'src/constants'

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

export const CLIP_AREA_TEST_ID = 'cliparea'

export const KetcherWrapper = ({ children }) => (
  <div className={KETCHER_ROOT_NODE_CLASS_NAME}>
    {children}
    <textarea className="cliparea" data-testid={CLIP_AREA_TEST_ID} />
  </div>
)
