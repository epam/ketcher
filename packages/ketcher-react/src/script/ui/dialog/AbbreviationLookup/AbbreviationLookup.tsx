import { Portal } from '../../Portal'
import {
  CSSProperties,
  SyntheticEvent,
  useEffect,
  useMemo,
  useState,
  KeyboardEvent,
  ChangeEvent,
  useRef
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { functionalGroupsSelector } from '../../state/functionalGroups/selectors'
import { onAction } from '../../state'
import { templatesLibSelector } from '../../state/templates/selectors'
import { saltsAndSolventsSelector } from '../../state/saltsAndSolvents/selectors'
import { Template } from '../template/TemplateTable'
import { uniqBy, sortBy } from 'lodash'
import MuiAutocomplete, {
  AutocompleteChangeReason
} from '@mui/material/Autocomplete'
import { TextField } from '@mui/material'
import {
  selectIsAbbreviationLookupOpen,
  selectAbbreviationLookupValue
} from '../../state/abbreviationLookup/selectors/selectors'
import { closeAbbreviationLookup } from '../../state/abbreviationLookup'
import { selectCursorPosition } from '../../state/common/selectors/selectors'

const ABBREVIATION_PANEL_WIDTH = 250

export const AbbreviationLookup = () => {
  const inputRef = useRef<HTMLInputElement | null>()
  const dispatch = useDispatch()
  const functionGroups = useSelector(functionalGroupsSelector)
  const templates = useSelector(templatesLibSelector)
  const saltsAndSolvents = useSelector(saltsAndSolventsSelector)

  const initialLookupValue = useSelector(selectAbbreviationLookupValue)
  const cursorPosition = useSelector(selectCursorPosition)
  const usedCursorPositionRef = useRef(cursorPosition)

  const [lookupValue, setLookupValue] = useState(initialLookupValue)

  const allTemplates = useMemo<Template[]>(() => {
    // TODO check if this filtration is correct or not
    const uniqTemplates = uniqBy<Template>(
      [...functionGroups, ...templates, ...saltsAndSolvents],
      (template) => template.struct.name
    )

    return sortBy(uniqTemplates, (template) => template.struct.name)
  }, [functionGroups, saltsAndSolvents, templates])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const portalStyle: CSSProperties = {
    position: 'absolute',
    left: `${usedCursorPositionRef.current.x - ABBREVIATION_PANEL_WIDTH / 2}px`,
    top: `${usedCursorPositionRef.current.y}px`,
    width: `${ABBREVIATION_PANEL_WIDTH}px`
  }

  const handleOnChange = (
    _event: SyntheticEvent,
    template: Template,
    reason: AutocompleteChangeReason
  ) => {
    if (reason === 'selectOption') {
      dispatch(closeAbbreviationLookup())
      dispatch(onAction({ tool: 'template', opts: template }))
    }
  }

  const closePanel = () => {
    setLookupValue('')
    dispatch(closeAbbreviationLookup())
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      closePanel()
    }

    event.stopPropagation()
  }

  const handleBlur = () => {
    closePanel()
  }

  return (
    <Portal isOpen={true} className="none" style={portalStyle}>
      <div onKeyDown={handleKeyDown}>
        <MuiAutocomplete<Template, false, true>
          disableClearable
          fullWidth
          options={allTemplates}
          getOptionLabel={getOptionLabel}
          onChange={handleOnChange}
          onBlur={handleBlur}
          inputValue={lookupValue}
          renderInput={(params) => {
            return (
              <TextField
                {...params}
                inputRef={inputRef}
                InputProps={{
                  ...params.InputProps,
                  // type: 'search',
                  autoComplete: 'new-password',
                  endAdornment: null,
                  onChange: (event: ChangeEvent<HTMLInputElement>) => {
                    setLookupValue(event.target.value)
                  }
                }}
              />
            )
          }}
        />
      </div>
    </Portal>
  )
}

export const AbbreviationLookupContainer = () => {
  const isOpen = useSelector(selectIsAbbreviationLookupOpen)
  if (!isOpen) {
    return null
  }

  return <AbbreviationLookup />
}

const getOptionLabel = (option: Template) => {
  return option.struct.name
}
