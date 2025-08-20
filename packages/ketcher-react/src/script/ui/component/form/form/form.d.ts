import { FC } from 'react';

export interface FormProps {
  children: React.ReactNode;
  init?: object | null;
  schema?: object;
  customValid?: object;
}

export interface FieldProps {
  name?: string;
  component?: React.ComponentType<never> | string;
  options?: Array<{ value: string; label: string }>;
  disabled?: boolean;
  formName?: string;
  'data-testid'?: string;
  maxLength?: number;
  labelPos?: string | boolean;
  className?: string;
  extraName?: string;
  tooltip?: string;
  extraLabel?: string;
  schema?: object;
  type?: string;
  value?: string | number | boolean;
  checked?: boolean;
}

export interface FieldWithModalProps extends FieldProps {
  onEdit?: (onChange: (value: string) => void) => void;
  autoFocus?: boolean;
}

export interface SelectOneOfProps extends FieldProps {}

export interface CustomQueryFieldProps extends FieldProps {
  name: string;
  component?: React.ComponentType<never>;
  options?: Array<{ value: string; label: string }>;
  disabled?: boolean;
  formName?: string;
  'data-testid'?: string;
  labelPos: string;
  className?: string;
  checkboxValue?: boolean;
  onCheckboxChange?: (
    value: boolean,
    formState: BondSettings,
    _,
    updateFormState: (settings: BondSettings) => void,
  ) => void;
}

declare const Form: FC<FormProps>;
export default Form;

declare const Field: FC<FieldProps>;
declare const FieldWithModal: FC<FieldWithModalProps>;
declare const SelectOneOf: FC<SelectOneOfProps>;
declare const CustomQueryField: FC<CustomQueryFieldProps>;

export { Form, Field, FieldWithModal, SelectOneOf, CustomQueryField };
