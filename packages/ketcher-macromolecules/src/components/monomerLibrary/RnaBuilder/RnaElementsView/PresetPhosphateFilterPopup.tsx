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
  FilterPopupButton,
  FilterPopupOption,
} from './styles';

type Props = {
  onClose: () => void;
};

const ALL_ENABLED: PresetPhosphateFilter = {
  fivePrime: true,
  threePrime: true,
  noPhosphate: true,
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
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
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
    setDraftFilter(ALL_ENABLED);
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
      <FilterPopupOption>
        <input
          type="checkbox"
          checked={draftFilter.fivePrime}
          onChange={toggle('fivePrime')}
          data-testid="preset-filter-5-phosphate"
        />
        5&apos;-phosphate
      </FilterPopupOption>
      <FilterPopupOption>
        <input
          type="checkbox"
          checked={draftFilter.threePrime}
          onChange={toggle('threePrime')}
          data-testid="preset-filter-3-phosphate"
        />
        3&apos;-phosphate
      </FilterPopupOption>
      <FilterPopupOption>
        <input
          type="checkbox"
          checked={draftFilter.noPhosphate}
          onChange={toggle('noPhosphate')}
          data-testid="preset-filter-no-phosphate"
        />
        No phosphate group
      </FilterPopupOption>
      <FilterPopupActions>
        <FilterPopupButton
          type="button"
          onClick={handleResetAll}
          data-testid="preset-filter-reset"
        >
          Reset all
        </FilterPopupButton>
        <FilterPopupButton
          type="button"
          primary
          onClick={handleSet}
          data-testid="preset-filter-set"
        >
          Set
        </FilterPopupButton>
      </FilterPopupActions>
    </FilterPopup>
  );
};
