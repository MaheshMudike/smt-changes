export enum FieldType {
    Email, Number, NonEmptyString, NonNullable, NonValidable
}

export type NonValidableField = { type: FieldType.NonValidable, value: any, valid: true }
export type NonValidableStringField = { type: FieldType.NonValidable, value: string, valid: true }
export type EmailField = { type: FieldType.Email, value: string, valid: boolean }
export type NumberField = { type: FieldType.Number, value: number, valid: boolean }
export type NonEmptyStringField = { type: FieldType.NonEmptyString, value: string, valid: boolean }
export type NonNullableField = { type: FieldType.NonNullable, value: any, valid: boolean }

export type StringField = EmailField | NonEmptyStringField | NonValidableStringField;
export type Field = EmailField | NumberField | NonEmptyStringField | NonNullableField | NonValidableField;

export function nonValidableStringField(value: string): NonValidableStringField {
    return {
        type: FieldType.NonValidable,
        value,
        valid: true
    }
}

export function nonValidableField(value: any): NonValidableField {
    return {
        type: FieldType.NonValidable,
        value,
        valid: true
    }
}

export function nonEmptyField(value: string): NonEmptyStringField {
    return {
        type: FieldType.NonEmptyString,
        value,
        valid: false
    }
}

export function nonNullableField<T>(value: T): NonNullableField {
    return {
        type: FieldType.NonNullable,
        value,
        valid: false
    }
}

export function emailField(value: string): EmailField {
    return {
        type: FieldType.Email,
        value,
        valid: true
    }
}

interface Dictionary<T> {
    [index: string]: T;
}

export function allFieldsValid(obj: Dictionary<Field>) {
    return Object.values(obj).every(f => f.valid);
}

export function validateField(field: Field) {
    return { ...field, valid: validateFieldValue(field) };
}

export function validateFieldValue(field: Field) {
    switch(field.type) {
        case FieldType.Email:
            return field.value == null || field.value == '' || validateEmail(field.value);
        case FieldType.NonNullable:
            return field.value != null;
        case FieldType.NonEmptyString:
            return field.value != null && field.value != '';
        case FieldType.NonValidable:
            return true;
        default:
            return false;
    }
}

export function validateEmail(email: string) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}