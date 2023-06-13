import { useMemo } from 'react'
import { sortBy, uniqBy } from 'lodash'
import { useSelector } from 'react-redux'

import { Template } from '../../template/TemplateTable'
import { functionalGroupsSelector } from '../../../state/functionalGroups/selectors'
import { templatesLibSelector } from '../../../state/templates/selectors'
import { saltsAndSolventsSelector } from '../../../state/saltsAndSolvents/selectors'
import {
  AbbreviationOption,
  AbbreviationType
} from '../AbbreviationLookup.types'

export const useOptions = (): AbbreviationOption[] => {
  const functionGroups = useSelector(functionalGroupsSelector)
  const templates = useSelector(templatesLibSelector)
  const saltsAndSolvents = useSelector(saltsAndSolventsSelector)

  return useMemo<AbbreviationOption[]>(() => {
    // TODO uniqBy is required due to duplicates. https://github.com/epam/ketcher/issues/2749
    const uniqTemplates = uniqBy<Template>(
      [...functionGroups, ...templates, ...saltsAndSolvents],
      (template) => template.struct.name
    )

    // TODO add atoms into the options list somehow

    const mappedOptions: AbbreviationOption[] = uniqTemplates.map(
      (template) => {
        return {
          type: AbbreviationType.Template,
          template,
          name: template.struct.name,
          loweredName: template.struct.name.toLowerCase()
        }
      }
    )

    return sortBy(mappedOptions, (option) => option.loweredName)
  }, [functionGroups, saltsAndSolvents, templates])
}
