/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 ***************************************************************************/

import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'hooks';
import {
  PresetPhosphateFilter,
  selectPresetPhosphateFilter,
  setPresetPhosphateFilter,
} from 'state/rna-builder';
import {
  FilterPopup,
  FilterPopupActions,
  FilterPopupActionButton,
  FilterPopupOption,
  FilterPopupResetButton,
  FilterPopupSeparator,
  FilterPopupTitle,
  StyledCheckboxInput,
} from './styles';

type Props = {
  onClose: () => void;
};

// "Reset all" returns the filter to its default state. Per spec 7.3 the
// default is "all options off"; per spec 7.4 this is equivalent to "all on"
// (both mean no filtering is applied).
const DEFAULT_FILTER: PresetPhosphateFilter = {
  fivePrime: false,
  threePrime: false,
  noPhosphate: false,
};

export const PresetPhosphateFilterPopup: React.FC<Props> = ({ onClose }) => {
  const dispatch = useDispatch();
  const currentFilter = useAppSelector(selectPresetPhosphateFilter);
  const [draftFilter, setDraftFilter] =
    useState<PresetPhosphateFilter>(currentFilter);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape, mirroring common popover patterns in the
  // codebase without introducing new dependencies.
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (popupRef.current && target && popupRef.current.contains(target)) {
        return;
      }
      // Ignore clicks on the trigger button so its own onClick can toggle the
      // popup closed; otherwise this handler would close it first and the
      // subsequent click would immediately reopen it.
      if (
        target instanceof Element &&
        target.closest('[data-testid="preset-filter-button"]')
      ) {
        return;
      }
      onClose();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const toggle = (key: keyof PresetPhosphateFilter) => () => {
    setDraftFilter((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleResetAll = () => {
    // Reset returns the filter to its default state and applies it immediately
    // (per spec) so the user sees the unfiltered presets without having to
    // click "Set" afterwards. The popup is closed as well.
    setDraftFilter(DEFAULT_FILTER);
    dispatch(setPresetPhosphateFilter(DEFAULT_FILTER));
    onClose();
  };

  const handleSet = () => {
    dispatch(setPresetPhosphateFilter(draftFilter));
    onClose();
  };

  return (
    <FilterPopup
      ref={popupRef}
      data-testid="preset-phosphate-filter-popup"
      onClick={(event) => event.stopPropagation()}
    >
      <FilterPopupTitle>Filter</FilterPopupTitle>
      <FilterPopupOption>
        <StyledCheckboxInput
          type="checkbox"
          checked={draftFilter.fivePrime}
          onChange={toggle('fivePrime')}
          data-testid="preset-filter-5-phosphate"
        />
        <span />
        5&apos;-phosphate
      </FilterPopupOption>
      <FilterPopupOption>
        <StyledCheckboxInput
          type="checkbox"
          checked={draftFilter.threePrime}
          onChange={toggle('threePrime')}
          data-testid="preset-filter-3-phosphate"
        />
        <span />
        3&apos;-phosphate
      </FilterPopupOption>
      <FilterPopupOption>
        <StyledCheckboxInput
          type="checkbox"
          checked={draftFilter.noPhosphate}
          onChange={toggle('noPhosphate')}
          data-testid="preset-filter-no-phosphate"
        />
        <span />
        No phosphate group
      </FilterPopupOption>
      <FilterPopupSeparator />
      <FilterPopupActions>
        <FilterPopupResetButton
          styleType="secondary"
          label="Reset all"
          clickHandler={handleResetAll}
          data-testid="preset-filter-reset"
        />
        <FilterPopupActionButton
          label="Set"
          clickHandler={handleSet}
          data-testid="preset-filter-set"
        />
      </FilterPopupActions>
    </FilterPopup>
  );
};
