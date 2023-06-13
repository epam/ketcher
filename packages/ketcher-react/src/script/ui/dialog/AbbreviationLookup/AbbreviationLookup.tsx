import {
  ChangeEvent,
  KeyboardEvent,
  MutableRefObject,
  SyntheticEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import assert from 'assert'
import MuiAutocomplete, {
  AutocompleteChangeReason
} from '@mui/material/Autocomplete'
import { KETCHER_ROOT_NODE_CSS_SELECTOR } from 'src/constants'
import classes from './AbbreviationLookup.module.less'
import { Portal } from '../../Portal'
import { onAction } from '../../state'
import { selectAbbreviationLookupValue } from '../../state/abbreviationLookup/selectors/selectors'
import { closeAbbreviationLookup } from '../../state/abbreviationLookup'
import { selectCursorPosition } from '../../state/common/selectors/selectors'
import Icon from '../../component/view/icon'
import {
  getOptionLabel,
  highlightMatchedText
} from './AbbreviationLookup.utils'
import {
  AbbreviationOption,
  AbbreviationType
} from './AbbreviationLookup.types'
import { useOptions } from './hooks/useOptions'

export const AbbreviationLookup = () => {
  const inputRef = useRef<HTMLInputElement | null>()
  const autocompleteRef = useRef<HTMLInputElement | null>()

  const dispatch = useDispatch()

  const cursorPosition = useSelector(selectCursorPosition)
  const usedCursorPositionRef = useRef(cursorPosition)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  const initialLookupValue = useSelector(selectAbbreviationLookupValue)
  const [lookupValue, setLookupValue] = useState(initialLookupValue)
  const [loweredLookupValue, setLoweredLookupValue] = useState(() =>
    initialLookupValue.toLowerCase()
  )

  const abbreviationOptions = useOptions()

  useEffect(() => {
    inputRef.current?.focus()

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

    const calculatedLeft = usedCursorPositionRef.current.x - parentRect.left
    const calculatedTop = usedCursorPositionRef.current.y - parentRect.top

    const left = Math.min(Math.max(0, calculatedLeft), maxLeft)
    const top = Math.min(Math.max(0, calculatedTop), maxTop)

    return {
      left: `${left}px`,
      top: `${top}px`
    }
  }, [containerSize])

  const handleOnChange = (
    _event: SyntheticEvent,
    option: AbbreviationOption,
    reason: AutocompleteChangeReason
  ) => {
    if (reason !== 'selectOption') {
      return
    }

    closePanel()

    if (option.type === AbbreviationType.Template) {
      dispatch(onAction({ tool: 'template', opts: option.template }))
    } else {
      // TODO do something with atom tool here
    }
  }

  const closePanel = () => {
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
    <Portal
      isOpen={true}
      className={classes.lookupContainer}
      style={portalStyle}
    >
      <MuiAutocomplete<AbbreviationOption, false, true>
        ref={autocompleteRef}
        options={abbreviationOptions}
        inputValue={lookupValue}
        getOptionLabel={getOptionLabel}
        onChange={handleOnChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        openOnFocus
        autoHighlight
        noOptionsText="No matching abbreviations"
        classes={{
          option: classes.optionItem,
          listbox: classes.listBox,
          input: classes.input,
          noOptions: classes.noOptions
        }}
        // onClose={() => {
        //   debugger
        // }}
        renderInput={(params) => {
          return (
            <div className={classes.inputContainer} ref={params.InputProps.ref}>
              <Icon name="search" className={classes.searchIcon} />
              <input
                type="text"
                {...params.inputProps}
                ref={(ref) => {
                  inputRef.current = ref

                  // this workaround is required to have access to `ref` field of inputProps that isn't provided
                  // by types, but present in the field
                  ;(
                    params.inputProps as {
                      ref: MutableRefObject<HTMLInputElement | null>
                    }
                  ).ref.current = ref
                }}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setLookupValue(event.target.value)
                  setLoweredLookupValue(event.target.value.toLowerCase())
                }}
              />
            </div>
          )
        }}
        renderOption={(props, option) => {
          return (
            <li {...props}>
              {highlightMatchedText(option.loweredName, loweredLookupValue)}
            </li>
          )
        }}
      />
    </Portal>
  )
}
