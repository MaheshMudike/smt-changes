import * as React from 'react';

import { SvgIcon } from '../../../constants/SvgIcon';
import { openObjectInSalesforce } from '../../../services/externalApps';
import { formatLabel } from '../../../utils/formatUtils';
import IconButton from '../../layout/IconButton';

export class ViewInSalesForce extends React.Component<IViewInSalesForceProps, object> {

    public render() {
        return (
            <IconButton
                label={formatLabel('generic.button.salesforce')}
                icon={SvgIcon.ButtonArrow}
                onClick={() => openObjectInSalesforce(this.props.id) }/>
        );
    }
}

interface IViewInSalesForceProps {
    id: string;
}
