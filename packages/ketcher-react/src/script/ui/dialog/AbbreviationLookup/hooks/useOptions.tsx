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

import { useMemo } from 'react'
import { uniqBy } from 'lodash'
import { useSelector } from 'react-redux'
import { Elements } from 'ketcher-core'

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
    // TODO uniqBy is required to remove duplicates. https://github.com/epam/ketcher/issues/2749
    const uniqTemplates = uniqBy<Template>(
      [...functionGroups, ...templates, ...saltsAndSolvents],
      (template) => template.struct.name
    )

    const mappedElementOptions: AbbreviationOption[] = Elements.filter(
      Boolean
    ).map((element) => {
      const label = `${element.label} (${element.title})`
      return {
        type: AbbreviationType.Element,
        element,
        label,
        loweredLabel: label.toLowerCase(),
        loweredName: element.title.toLowerCase(),
        loweredAbbreviation: element.label.toLowerCase()
      }
    })

    const mappedTemplateOptions: AbbreviationOption[] = uniqTemplates.map(
      (template) => {
        const label =
          template.struct.abbreviation &&
          template.struct.abbreviation !== template.struct.name
            ? `${template.struct.abbreviation} (${template.struct.name})`
            : template.struct.name
        return {
          type: AbbreviationType.Template,
          template,
          label,
          loweredLabel: label.toLowerCase(),
          loweredName: template.struct.name.toLowerCase(),
          loweredAbbreviation: template.struct.abbreviation?.toLowerCase()
        }
      }
    )

    return [...mappedElementOptions, ...mappedTemplateOptions]
  }, [functionGroups, saltsAndSolvents, templates])
}
