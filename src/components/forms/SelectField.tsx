import * as _ from 'lodash';
import * as React from 'react';

import { Option as ReactSelectOption, ReactSelectProps } from 'react-select';
import ReactSelectClass from 'react-select';

interface ISelectFieldProps<T> {
    clearable?: boolean;
    disabled?: boolean;
    className?: string;
    multi?: boolean;
    isLoading?: boolean;
    options: T | T[];
    optionsMapper: (t: T) => ReactSelectOption;
    value?: T | T[];
    onChange: (option: T | T[]) => void;
    placeholder?: string;
    hideDropdown?: boolean;
    searchable?: boolean;
}

//type SelectFieldProps<T> = ReactSelectProps<T> & { optionsMapper: (t: T) => ReactSelectOption, options: T | T[] }

export class SelectField<T> extends React.Component<ISelectFieldProps<T>, object> {

    public render() {

        const { options = [], disabled = false, clearable = false, optionsMapper, hideDropdown = false } = this.props;

        if (options instanceof Array) {
            return (
                <ReactSelectClass
                    menuRenderer={ hideDropdown ? (props) => null : undefined }
                    arrowRenderer={ hideDropdown ? null : undefined }
                    className={(this.props.className || '')}
                    clearable={clearable}
                    multi={this.props.multi === true}
                    disabled={disabled}
                    value={this.mapValues(this.props.value)}
                    onChange={(t: ReactSelectOption) => this.props.onChange(this.selectOptionToComponentOptions(options, t))}
                    options={options.map(optionsMapper)}
                    isLoading={this.props.isLoading}
                    placeholder={this.props.placeholder}
                    backspaceToRemoveMessage={''}
                    searchable={this.props.searchable}
                    />
            );
        } else {
            const itemValue = this.props.optionsMapper(this.props.value as T);
            return (
                <div className='field container--vertical'>
                    {itemValue.label}
                </div>
            );
        }
    }

    protected mapValues = (values: T | T[]) => {
        if (values && values instanceof Array) {
            return values.map(this.props.optionsMapper);
        } else {
            return this.props.optionsMapper(this.props.value as T);
        }
    }

    private selectOptionToComponentOptions(optionsArray: T[], option: ReactSelectOption | ReactSelectOption[]) {
        const mapOption = (opt: ReactSelectOption) =>
            _.find(optionsArray, t => this.props.optionsMapper(t).value === opt.value);

        if (option) {
            if (option instanceof Array) {
                return option.map(mapOption);
            } else {
                return mapOption(option);
            }
        } else {
            return null;
        }
    }
}

export function SimpleSelectField(props: { isLoading?: boolean; options: ReactSelectOption[]; value: string | null; onChange: (option: ReactSelectOption) => void; }) {
    const selectedOption = props.value == null ? null : _.find(props.options, option => option.value === props.value);
    return <SelectField isLoading={props.isLoading} options={props.options} value={selectedOption} onChange={props.onChange} optionsMapper={_.identity} />;
}

export function SelectFieldStub(props: { caption: string; onClick?: () => void, placeholder?: string }) {
    const option = { label: props.caption, value: '1' };
    return <ReactSelectClass clearable={false} value={props.caption == null ? null : option} options={[option]} onOpen={props.onClick} placeholder={props.placeholder} />;
}
