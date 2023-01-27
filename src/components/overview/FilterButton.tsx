import * as React from 'react';
import { ChangeOptionButton } from './ChangeOptionButton';
import translate from '../../utils/translate';
import { SvgIcon } from '../../constants/SvgIcon';
import { IPayloadAction } from 'src/actions/actionUtils';

export default class FilterButton<TFilterEnum> extends React.Component<
    {
        selectedOption: TFilterEnum;
        select: (payload: TFilterEnum) => IPayloadAction<TFilterEnum>; 
        options: [TFilterEnum, string][]; className: string 
    }, 
    object
> {
    public render() {
        return <ChangeOptionButton {...this.props} header={translate('generic.filter-by')} 
            className={this.props.className}
            icon={SvgIcon.Filter}
            options={this.props.options}
        />;
    }
}