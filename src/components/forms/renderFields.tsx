import * as React from 'react';

import { SvgIcon } from '../../constants/SvgIcon';
import { FieldValueType, IFieldValue } from '../../models/fields';
import LabeledValue from '../forms/LabeledValue';
import WithIcon, { WithIconFA } from '../forms/WithIcon';
import { Icon } from '../layout/Icon';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

const wrapWithIcon = (icon: SvgIcon, faIcon: IconProp, multiLine: boolean, content: JSX.Element) => {
    if(icon != null) {
        return <WithIcon icon={icon} multiline={multiLine}>
            {content}
        </WithIcon>;
    } else if(faIcon != null) {
        return <WithIconFA icon={faIcon} multiline={multiLine}>
            {content}
        </WithIconFA>;
    } else {
        return content;
    }
};

export function renderFields(fields: IFieldValue[]): JSX.Element[] {
    return fields.map((field, index) => renderField(field, index));
}

export function renderField(field: IFieldValue, index: number): JSX.Element {
    if(field == null) return null;

    const fieldValue = field.value == null ? '-' : field.value;

    const labeledValue = <LabeledValue label={field.label}>{fieldValue}</LabeledValue>;
    const wrappedIcon = wrapWithIcon(field.icon, field.faIcon, field.multiLine, labeledValue);

    if(field.value != null) {
        if(field.kind === FieldValueType.Linked) {
            const LinkWrapper = field.linkWrapper;
            return field.value == null ? wrappedIcon : <LinkWrapper>
                <div className='relative link-wrapper' key={index}>
                    {wrappedIcon}
                    <Icon className='absolute link-wrapper__icon' svg={SvgIcon.ChevronRight} />
                </div>
            </LinkWrapper>;
        } else if(field.kind === FieldValueType.Anchored) {
            return <a href={field.hrefPrefix + field.value}>{wrappedIcon}</a>;
        }
    }

    return wrappedIcon;
}
