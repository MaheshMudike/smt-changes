import * as React from 'react';
import { connect } from 'react-redux';

import { SvgIcon } from '../../../constants/SvgIcon';
import { formatLabel } from '../../../utils/formatUtils';
import IconButton from '../../layout/IconButton';
import { startExternalApp } from 'src/services/externalApps';
import { toastMessages } from 'src/constants/toastMessages';

class ViewInKKMClass extends React.Component<IViewInKonectAppProps, object> {

    public render() {
        return (
            <IconButton
                label={formatLabel('generic.button.konect')}
                icon={SvgIcon.ButtonArrow}
                onClick={this.startKKM}
            />
        );
    }

    private startKKM = () => {
        this.props.startExternalApp('it.overit.kone', null, toastMessages().OPEN_EXTERNAL_APP_FAILED);
    };
}

interface IViewInKonectAppProps {
    startExternalApp: typeof startExternalApp;
}

export const ViewInKKM = connect(
    null,
    { startExternalApp },
)(ViewInKKMClass);
