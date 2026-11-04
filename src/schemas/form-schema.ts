export type FormFieldType = 'number' | 'select' | 'checkbox' | 'photos';

export interface SelectOption {
  label: string;
  value: string;
}

interface BaseField {
  name: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  description?: string;
}

export interface NumberField extends BaseField {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  defaultValue?: number;
}

export interface SelectField extends BaseField {
  type: 'select';
  options: SelectOption[];
  defaultValue?: string;
}

export interface CheckboxField extends BaseField {
  type: 'checkbox';
  defaultValue?: boolean;
}

export interface PhotosField extends BaseField {
  type: 'photos';
  maxFiles?: number;
  acceptedTypes?: string[];
}

export type FormField = NumberField | SelectField | CheckboxField | PhotosField;

export interface ServiceFormSchema {
  serviceSlug: string;
  title: string;
  description: string;
  version: number;
  fields: FormField[];
}

export type FormValue = number | string | boolean | File[];
export type FormValues = Record<string, FormValue>;

export function getInitialValues(schema: ServiceFormSchema): FormValues {
  const values: FormValues = {};
  for (const field of schema.fields) {
    if (field.type === 'number') values[field.name] = field.defaultValue ?? 0;
    if (field.type === 'select') values[field.name] = field.defaultValue ?? field.options[0]?.value ?? '';
    if (field.type === 'checkbox') values[field.name] = field.defaultValue ?? false;
    if (field.type === 'photos') values[field.name] = [];
  }
  return values;
}