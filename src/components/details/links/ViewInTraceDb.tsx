import * as React from 'react';

import { SvgIcon } from '../../../constants/SvgIcon';
import { openTraceDb } from '../../../services/externalApps';
import { formatLabel } from '../../../utils/formatUtils';
import IconButton from '../../layout/IconButton';

export class ViewInTraceDb extends React.Component<{ id: string; }, object> {

    public render() {
        return (
            <IconButton
                label={formatLabel('generic.button.trace-db')}
                icon={SvgIcon.ButtonArrow}
                onClick={() => openTraceDb(this.props.id) }/>
        );
    }
}