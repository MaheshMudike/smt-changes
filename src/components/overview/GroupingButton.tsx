import * as React from 'react';
import { ChangeOptionButton } from './ChangeOptionButton';
import translate from '../../utils/translate';
import { SvgIcon } from '../../constants/SvgIcon';
import { IPayloadAction } from 'src/actions/actionUtils';

export interface IGroupingButton<TGroupingEnum> {
    selectedOption: TGroupingEnum;
    select: (payload: TGroupingEnum) => IPayloadAction<TGroupingEnum>;
}

export default class GroupingButton<TGroupingEnum> extends React.Component<
    {
        selectedOption: TGroupingEnum;
        select: (payload: TGroupingEnum) => IPayloadAction<TGroupingEnum>; 
        options: [TGroupingEnum, string][]; 
        className?: string 
    }, 
    object
> {
    public render() {
        return <ChangeOptionButton {...this.props} header={translate('generic.group-by')} 
            className={this.props.className}
            icon={SvgIcon.Sort}
            options={this.props.options.filter(t => t != null)}
        />;
    }
}