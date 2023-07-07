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
  ChangeEvent,
  CSSProperties,
  KeyboardEvent,
  MutableRefObject,
  SyntheticEvent,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import assert from 'assert';
import { Icon } from 'components';
import MuiAutocomplete, {
  AutocompleteChangeReason,
} from '@mui/material/Autocomplete';
import { KETCHER_ROOT_NODE_CSS_SELECTOR } from 'src/constants';
import classes from './AbbreviationLookup.module.less';
import { Portal } from '../../Portal';
import { onAction } from '../../state';
import { selectAbbreviationLookupValue } from '../../state/abbreviationLookup/selectors';
import { closeAbbreviationLookup } from '../../state/abbreviationLookup';
import { selectCursorPosition } from '../../state/common/selectors';
import {
  filterOptions,
  getOptionLabel,
  highlightOptionLabel,
} from './AbbreviationLookup.utils';
import {
  AbbreviationOption,
  AbbreviationType,
} from './AbbreviationLookup.types';
import {
  ABBREVIATION_LOOKUP_TEST_ID,
  NO_MATCHING_RESULTS_LABEL,
  START_TYPING_NOTIFICATION_LABEL,
} from './AbbreviationLookup.constants';
import { CLIP_AREA_BASE_CLASS } from '../../component/cliparea/cliparea';

interface Props {
  options: AbbreviationOption[];
}

export const AbbreviationLookup = ({ options }: Props) => {
  const inputRef = useRef<HTMLInputElement | null>();
  const autocompleteRef = useRef<HTMLInputElement | null>();

  const dispatch = useDispatch();

  const cursorPosition = useSelector(selectCursorPosition);
  const usedCursorPositionRef = useRef(cursorPosition);
  const [portalStyle, setPortalSize] = useState({} as CSSProperties);

  const initialLookupValue = useSelector(selectAbbreviationLookupValue);
  const [lookupValue, setLookupValue] = useState(initialLookupValue);
  const [loweredLookupValue, setLoweredLookupValue] = useState(() =>
    initialLookupValue.toLowerCase(),
  );

  useLayoutEffect(() => {
    inputRef.current?.focus();

    const containerHeight = autocompleteRef.current?.offsetHeight ?? 0;
    const containerWidth = autocompleteRef.current?.offsetWidth ?? 0;

    const parentNode = document.querySelector(KETCHER_ROOT_NODE_CSS_SELECTOR);
    assert(parentNode !== null, 'Ketcher root node is required');
    const parentRect = parentNode.getBoundingClientRect();

    const maxLeft = parentRect.width - containerWidth;
    const maxTop = parentRect.height - containerHeight;

    const calculatedLeft = usedCursorPositionRef.current.x - parentRect.left;
    const calculatedTop = usedCursorPositionRef.current.y - parentRect.top;

    const left = Math.min(Math.max(0, calculatedLeft), maxLeft);
    const top = Math.min(Math.max(0, calculatedTop), maxTop);

    setPortalSize({
      left: `${left}px`,
      top: `${top}px`,
    });

    // TODO extract to a separate hook or utils
    return () => {
      (
        inputRef.current
          ?.closest(KETCHER_ROOT_NODE_CSS_SELECTOR)
          ?.getElementsByClassName(CLIP_AREA_BASE_CLASS)[0] as HTMLElement
      ).focus();
    };
  }, []);

  const closePanel = () => {
    dispatch(closeAbbreviationLookup());
  };

  const handleOnChange = (
    _event: SyntheticEvent,
    option: AbbreviationOption,
    reason: AutocompleteChangeReason,
  ) => {
    if (reason !== 'selectOption') {
      return;
    }

    if (option.type === AbbreviationType.Template) {
      dispatch(onAction({ tool: 'template', opts: option.template }));
    } else {
      dispatch(onAction({ tool: 'atom', opts: option.element }));
    }

    closePanel();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      closePanel();
    }

    event.stopPropagation();
  };

  const handleBlur = () => {
    closePanel();
  };

  return (
    <Portal
      isOpen={true}
      className={classes.lookupContainer}
      style={portalStyle}
    >
      <MuiAutocomplete<AbbreviationOption, false, true>
        ref={autocompleteRef}
        options={options}
        inputValue={lookupValue}
        getOptionLabel={getOptionLabel}
        filterOptions={filterOptions}
        onChange={handleOnChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        openOnFocus
        autoHighlight
        noOptionsText={
          loweredLookupValue
            ? NO_MATCHING_RESULTS_LABEL
            : START_TYPING_NOTIFICATION_LABEL
        }
        classes={{
          option: classes.optionItem,
          listbox: classes.listBox,
          input: classes.input,
          noOptions: classes.noOptions,
        }}
        renderInput={(params) => {
          return (
            <div className={classes.inputContainer} ref={params.InputProps.ref}>
              <Icon name="search" className={classes.searchIcon} />
              <input
                type="text"
                {...params.inputProps}
                ref={(ref) => {
                  inputRef.current = ref;

                  // this workaround is required to have access to `ref` field of inputProps that isn't provided
                  // by types, but present in the field
                  (
                    params.inputProps as {
                      ref: MutableRefObject<HTMLInputElement | null>;
                    }
                  ).ref.current = ref;
                }}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setLookupValue(event.target.value);
                  setLoweredLookupValue(event.target.value.toLowerCase());
                }}
              />
            </div>
          );
        }}
        renderOption={(props, option) => {
          return (
            <li {...props} title={option.label}>
              <div className={classes.optionItemContent}>
                {highlightOptionLabel(option, loweredLookupValue)}
              </div>
            </li>
          );
        }}
        data-testid={ABBREVIATION_LOOKUP_TEST_ID}
      />
    </Portal>
  );
};
