import { Autocomplete, createFilterOptions, TextField } from '@mui/material';
import clsx from 'clsx';
import styles from './ModificationTypeDropdown.module.less';
import { CoreEditor, compareByTitleWithNaturalFirst } from 'ketcher-core';

interface IOptionType {
  title: string;
}

const filter = createFilterOptions<IOptionType>();

interface IModificationTypeDropdownProps {
  naturalAnalogue: string;
  value: string | null;
  error?: string | null;
  onChange: (value: string) => void;
}

export default function ModificationTypeDropdown(
  props: IModificationTypeDropdownProps,
) {
  const editor = CoreEditor.provideEditorInstance();
  const modificationTypesGroupedByNaturalAnalogue =
    editor.getAllAminoAcidsModificationTypesGroupedByNaturalAnalogue();
  const modificationTypesOthersFromCurrentNaturalAnalogue = [
    ...new Set(
      Object.entries(modificationTypesGroupedByNaturalAnalogue)
        .filter(([key]) => key !== props.naturalAnalogue)
        .flatMap(([, types]) => types)
        .filter(
          (type) =>
            !modificationTypesGroupedByNaturalAnalogue[
              props.naturalAnalogue
            ]?.includes(type),
        ),
    ),
  ];

  const options = modificationTypesOthersFromCurrentNaturalAnalogue
    .map((modificationType) => {
      return { title: modificationType };
    })
    .sort(compareByTitleWithNaturalFirst);
  const value = props.value || '';

  const onValueChange = (newValue) => {
    if (props.onChange) {
      props.onChange(newValue ? newValue.title : '');
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
      filterOptions={(options, params) => {
        let filteredOptions = filter(options, params);

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
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        return (
          <li
            key={key}
            {...optionProps}
            className={clsx(
              props.className,
              styles.option,
              option.title === value && styles.selectedOption,
            )}
          >
            {option.title}
          </li>
        );
      }}
      ListboxComponent={(props) => {
        return (
          <div
            {...props}
            className={clsx(props.className, styles.optionsList)}
          ></div>
        );
      }}
      sx={{ width: '100%' }}
      freeSolo
      forcePopupIcon
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          error={Boolean(props.error)}
          className={clsx(styles.inputField, props.error && styles.error)}
          placeholder="..."
        />
      )}
    />
  );
}
