import { Portal } from '../../Portal'
import {
  SyntheticEvent,
  useEffect,
  useMemo,
  useState,
  KeyboardEvent,
  ChangeEvent,
  useRef,
  useLayoutEffect
} from 'react'
import classes from './AbbreviationLookup.module.less'
import { useDispatch, useSelector } from 'react-redux'
import assert from 'assert'
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
import { KETCHER_ROOT_NODE_CSS_SELECTOR } from 'src/constants'

export const AbbreviationLookup = () => {
  const inputRef = useRef<HTMLInputElement | null>()
  const autocompleteRef = useRef<HTMLInputElement | null>()
  const dispatch = useDispatch()
  const functionGroups = useSelector(functionalGroupsSelector)
  const templates = useSelector(templatesLibSelector)
  const saltsAndSolvents = useSelector(saltsAndSolventsSelector)

  const initialLookupValue = useSelector(selectAbbreviationLookupValue)
  const cursorPosition = useSelector(selectCursorPosition)
  const usedCursorPositionRef = useRef(cursorPosition)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  const [lookupValue, setLookupValue] = useState(initialLookupValue)

  const allTemplates = useMemo<Template[]>(() => {
    const uniqTemplates = uniqBy<Template>(
      [...functionGroups, ...templates, ...saltsAndSolvents],
      (template) => template.struct.name
    )

    return sortBy(uniqTemplates, (template) => template.struct.name)
  }, [functionGroups, saltsAndSolvents, templates])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useLayoutEffect(() => {
    setContainerSize({
      height: autocompleteRef.current?.offsetHeight ?? 0,
      width: autocompleteRef.current?.offsetWidth ?? 0
    })
  }, [])

  const portalStyle = useMemo(() => {
    const parentNode = document.querySelector(KETCHER_ROOT_NODE_CSS_SELECTOR)
    assert(parentNode !== null, 'Ketcher root node is required')
    const parentRect = parentNode.getBoundingClientRect()

    const maxLeft = parentRect.width - containerSize.width
    const maxTop = parentRect.height - containerSize.height

    const calculatedLeft =
      usedCursorPositionRef.current.x -
      parentRect.left -
      containerSize.width / 2
    const calculatedTop =
      usedCursorPositionRef.current.y -
      parentRect.top -
      containerSize.height / 2

    const left = Math.min(Math.max(0, calculatedLeft), maxLeft)
    const top = Math.min(Math.max(0, calculatedTop), maxTop)

    return {
      left: `${left}px`,
      top: `${top}px`
    }
  }, [containerSize])

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
    // closePanel()
  }

  return (
    <Portal
      isOpen={true}
      className={classes.lookupContainer}
      style={portalStyle}
    >
      <MuiAutocomplete<Template, false, true>
        ref={autocompleteRef}
        options={allTemplates}
        inputValue={lookupValue}
        getOptionLabel={getOptionLabel}
        onChange={handleOnChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        fullWidth
        disableClearable
        openOnFocus
        renderInput={(params) => {
          return (
            <TextField
              {...params}
              inputRef={inputRef}
              InputProps={{
                ...params.InputProps,
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
