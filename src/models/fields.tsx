import * as _ from 'lodash';

import { SvgIcon } from '../constants/SvgIcon';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

export enum FieldValueType {
    Plain,
    Anchored,
    Rich,
    Linked,
}

interface IFieldValueBase {
    label: string;
    icon?: SvgIcon;
    faIcon?: IconProp; 
    placeholder?: string;
    multiLine?: boolean;
    kind: FieldValueType;    
    value: string;
}

export interface IPlainFieldValue extends IFieldValueBase {
    kind: FieldValueType.Plain;
}

export interface IAnchoredFieldValue extends IFieldValueBase {
    kind: FieldValueType.Anchored;
    hrefPrefix?: string;
}

export interface ILinkedFieldValue extends IFieldValueBase {
    kind: FieldValueType.Linked;
    linkWrapper: (props: React.WithChildren) => JSX.Element;
}

export type IFieldValue = IPlainFieldValue | IAnchoredFieldValue | ILinkedFieldValue;