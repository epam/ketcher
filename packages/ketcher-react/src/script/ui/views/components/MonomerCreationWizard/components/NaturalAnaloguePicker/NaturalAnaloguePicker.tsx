import { useCallback, useMemo, FC } from 'react';
import MuiSelect, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { MenuProps } from '@mui/material/Menu';
import clsx from 'clsx';
import styles from './NaturalAnaloguePicker.module.less';
import NaturalAnalogueChip from '../NaturalAnalogueChip/NaturalAnalogueChip';
import { Icon } from 'components';
import { KetMonomerClass } from 'ketcher-core';

interface ChipGridSelectProps {
  monomerType:
    | KetMonomerClass.AminoAcid
    | KetMonomerClass.Base
    | KetMonomerClass.RNA;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const ChevronIcon = ({ className }) => (
  <Icon name="chevron" className={className} />
);

const aminoAcidOptions = [
  { value: 'A', label: 'A', color: '#008080' },
  { value: 'C', label: 'C', color: '#BF00FF' },
  { value: 'D', label: 'D', color: '#FF8C69' },
  { value: 'E', label: 'E', color: '#DC143C' },
  { value: 'F', label: 'F', color: '#008A00' },
  { value: 'G', label: 'G', color: '#BDB76B' },
  { value: 'H', label: 'H', color: '#007FFF' },
  { value: 'I', label: 'I', color: '#4CBB17' },
  { value: 'K', label: 'K', color: '#B0E0E6' },
  { value: 'L', label: 'L', color: '#7FFF00' },
  { value: 'M', label: 'M', color: '#FFF600' },
  { value: 'N', label: 'N', color: '#800080' },
  { value: 'O', label: 'O', color: '#2A52BE' },
  { value: 'P', label: 'P', color: '#D2D900' },
  { value: 'Q', label: 'Q', color: '#EDB4ED' },
  { value: 'R', label: 'R', color: '#0A12FF' },
  { value: 'S', label: 'S', color: '#9966CC' },
  { value: 'T', label: 'T', color: '#FF00FF' },
  { value: 'U', label: 'U', color: '#CA7DE3' },
  { value: 'V', label: 'V', color: '#FFD700' },
  { value: 'W', label: 'W', color: '#CCCBD6' },
  { value: 'X', label: 'X', color: '#CCCBD6' },
  { value: 'Y', label: 'Y', color: '#D65CBC' },
];

const rnaOptions = [
  { value: 'A', label: 'A', color: '#008080' },
  { value: 'C', label: 'C', color: '#BF00FF' },
  { value: 'G', label: 'G', color: '#BDB76B' },
  { value: 'T', label: 'T', color: '#FF00FF' },
  { value: 'U', label: 'U', color: '#CA7DE3' },
  { value: 'X', label: 'X', color: '#CCCBD6' },
];

const NaturalAnaloguePicker: FC<ChipGridSelectProps> = ({
  monomerType,
  value,
  onChange,
  className,
}) => {
  // const [currentOption, setCurrentOption] = useState<ChipOption | undefined>();

  const options =
    monomerType === KetMonomerClass.AminoAcid ? aminoAcidOptions : rnaOptions;

  // useEffect(() => {
  //   const option = options.find((opt) => opt.value === value);
  //   setCurrentOption(option);
  // }, [options, value]);

  const renderValue = useCallback(
    (selected: unknown) => {
      const selectedOption = options.find((o) => o.value === selected);
      if (!selectedOption) {
        return <span className={styles.placeholder}>Select an analogue</span>;
      }

      return (
        <NaturalAnalogueChip
          label={selectedOption.label}
          color={selectedOption.color}
          className={styles.selectedChip}
          data-testid={`natural-analogue-picker-selected-${selectedOption.value}`}
        />
      );
    },
    [options],
  );

  // Custom menu props to style the dropdown with grid layout
  const menuProps: Partial<MenuProps> = useMemo(
    () => ({
      className: styles.dropdownMenu,
      PaperProps: {
        className: styles.dropdownPaper,
      },
      MenuListProps: {
        className: styles.dropdownList,
      },
    }),
    [],
  );

  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value as string);
  };

  return (
    <MuiSelect
      className={clsx(styles.selectContainer, className)}
      value={value}
      onChange={handleChange}
      displayEmpty
      renderValue={renderValue}
      MenuProps={menuProps}
      IconComponent={ChevronIcon}
      data-testid="natural-analogue-picker"
    >
      {options.map((option) => (
        <MenuItem
          key={option.value}
          value={option.value}
          className={styles.gridItem}
          disableRipple
          data-testid={`natural-analogue-picker-option-${option.value}`}
        >
          <NaturalAnalogueChip
            label={option.label}
            color={option.color}
            className={styles.optionChip}
          />
        </MenuItem>
      ))}
    </MuiSelect>
  );
};

export default NaturalAnaloguePicker;
