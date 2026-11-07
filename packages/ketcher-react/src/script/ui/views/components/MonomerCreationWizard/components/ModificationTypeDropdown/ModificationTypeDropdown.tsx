import { Autocomplete, createFilterOptions, TextField } from '@mui/material';
import clsx from 'clsx';
import { type HTMLAttributes, forwardRef } from 'react';
import styles from './ModificationTypeDropdown.module.less';
import monomerWizardStyles from '../../MonomerCreationWizard.module.less';
import {
  compareByTitleWithNaturalFirst,
  provideEditorInstance,
} from 'ketcher-core';

const OptionsListbox = forwardRef<HTMLDivElement, HTMLAttributes<HTMLElement>>(
  (properties, reference) => {
    return (
      <div
        {...properties}
        ref={reference}
        className={clsx(properties.className, styles.optionsList)}
      />
    );
  },
);

OptionsListbox.displayName = 'OptionsListbox';

interface IOptionType {
  title: string;
}

const filter = createFilterOptions<IOptionType>();

interface IModificationTypeDropdownProperties {
  naturalAnalogue: string;
  value: string | null;
  error?: string | null;
  onChange: (value: string) => void;
  testId?: string;
}

export default function ModificationTypeDropdown(
  properties: Readonly<IModificationTypeDropdownProperties>,
) {
  const editor = provideEditorInstance();
  const modificationTypesGroupedByNaturalAnalogue =
    editor.getAllAminoAcidsModificationTypesGroupedByNaturalAnalogue();
  const modificationTypesOthersFromCurrentNaturalAnalogue = [
    ...new Set(
      Object.entries(modificationTypesGroupedByNaturalAnalogue)
        .filter(([key]) => key !== properties.naturalAnalogue)
        .flatMap(([, types]) => types)
        .filter(
          (type) =>
            !modificationTypesGroupedByNaturalAnalogue[
              properties.naturalAnalogue
            ]?.includes(type),
        ),
    ),
  ];

  const options = modificationTypesOthersFromCurrentNaturalAnalogue
    .map((modificationType) => {
      return { title: modificationType };
    })
    .sort(compareByTitleWithNaturalFirst);
  const value = properties.value ?? '';

  const onValueChange = (newValue) => {
    if (properties.onChange) {
      properties.onChange(newValue ? newValue.title : '');
    }
  };

  return (
    <Autocomplete
      className={clsx(styles.autocomplete)}
      value={value}
      onInputChange={(_event, newValue) => onValueChange({ title: newValue })}
      onChange={(_event, newValue) => {
        if (typeof newValue === 'string') {
          onValueChange({
            title: newValue,
          });
        } else {
          onValueChange(newValue);
        }
      }}
      filterOptions={(options, parameters) => {
        let filteredOptions = filter(options, parameters);

        if (filteredOptions.length === 0) {
          filteredOptions = options;
        }

        filteredOptions = filteredOptions.filter(
          (option) => option.title !== value,
        );

        if (value) {
          filteredOptions.unshift({ title: value });
        }

        return filteredOptions;
      }}
      selectOnFocus
      handleHomeEndKeys
      options={options}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === 'string') {
          return option;
        }
        // Regular option
        return option.title;
      }}
      renderOption={(properties, option) => {
        const { key, ...optionProperties } = properties;
        return (
          <li
            key={key}
            {...optionProperties}
            data-testid={`modification-type-option-${option.title}`}
            className={clsx(
              properties.className,
              styles.option,
              option.title === value && styles.selectedOption,
            )}
          >
            {option.title}
          </li>
        );
      }}
      ListboxComponent={OptionsListbox}
      sx={{ width: '100%' }}
      freeSolo
      forcePopupIcon
      renderInput={(parameters) => (
        <TextField
          {...parameters}
          variant="standard"
          error={Boolean(properties.error)}
          className={clsx(
            monomerWizardStyles.inputField,
            properties.error && monomerWizardStyles.error,
          )}
          placeholder="..."
          data-testid={properties.testId}
        />
      )}
    />
  );
}
