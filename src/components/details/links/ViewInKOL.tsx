import * as React from 'react';

import { SvgIcon } from '../../../constants/SvgIcon';
import { formatLabel } from '../../../utils/formatUtils';
import IconButton from '../../layout/IconButton';
import openLinkExternally from '../../../utils/openLinkExternally';
import { KOL_WEB } from '../../../constants/externalApps';
import { IGlobalState } from '../../../models/globalState';
import { IKolLaunchStatus } from '../../../reducers';
import { connect } from 'react-redux';
import { ActionStatus } from '../../../actions/actions';
import { reparentSupervisorContactToAccount } from '../../../actions/integration/accountActions';
import { SpinnerPanel } from '../../SpinnerPanel';

type ViewInKOLProps = IKolLaunchStatus & typeof ViewInKOLDispatchProps & {accountId: string };

class ViewInKOL extends React.Component<ViewInKOLProps, object> {

    public render() {
        return (
            <SpinnerPanel status={this.props.status}>
                <IconButton
                    label={formatLabel('generic.button.kone-online')}
                    icon={SvgIcon.ButtonArrow}
                    onClick={() => this.props.reparentSupervisorContactToAccount(this.props.accountId) }/>
            </SpinnerPanel>
        );
    }

    public componentWillReceiveProps(nextProps: ViewInKOLProps) {
        if(this.props.status === ActionStatus.START && nextProps.status === ActionStatus.SUCCESS) {
            openLinkExternally(KOL_WEB);
        }
    }
}

const ViewInKOLDispatchProps = { reparentSupervisorContactToAccount }

export default connect((state: IGlobalState) => state.kolLaunchStatus, ViewInKOLDispatchProps)(ViewInKOL)