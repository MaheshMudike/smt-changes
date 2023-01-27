import * as React from 'react';
import { connect } from 'react-redux';

import { tryLeavingOfflineMode } from '../actions/offlineChangesActions';
import { setOfflineMode } from '../actions/sharedStateActions';
import { Menu } from '../components/layout/menu/Menu';
import { MenuButton } from '../components/layout/menu/MenuButton';
import { MenuItemsList } from '../components/layout/menu/MenuItemsList';
import { RouteMenuLink } from '../components/layout/menu/RouteMenuLink';
import { ToastItem, ToastLink } from '../components/toast/ToastItem';
import { paths } from '../config/paths';
import { SvgIcon } from '../constants/SvgIcon';
import { IGlobalState } from '../models/globalState';
import translate from '../utils/translate';
import { AppBase } from './AppBase';

interface IOfflineAppStateProps {
    isWebSocketConnected: boolean;
}

interface IOfflineAppDispatchProps {
    setOfflineMode: typeof setOfflineMode;
    tryLeavingOfflineMode: typeof tryLeavingOfflineMode;
}

export class MyOfflineAppClass extends React.Component<IOfflineAppStateProps & IOfflineAppDispatchProps & { topBarContent: JSX.Element }, object> {
    
    public render() {
        return (
            <AppBase menu={
                <Menu menuLinks={[
                    <RouteMenuLink icon={SvgIcon.Plan} label={translate('plan-page.title')} route={paths.PLAN_OFFLINE} />,
                    <RouteMenuLink icon={SvgIcon.Account} label={translate('offline-accounts-page.title')} route={paths.OFFLINE_ACCOUNTS} />,
                    ]}>
                    <MenuItemsList isBottom items={
                        [<MenuButton
                            icon={SvgIcon.Offline}
                            label={translate('offline-status')}
                            onClick={() => this.props.tryLeavingOfflineMode()} />
                        ]}
                    />
                </Menu>
            } topBarContent={
                <div className='full-width full-height'>
                    {this.props.topBarContent}
                    {!this.props.isWebSocketConnected ? null :                        
                    <ul className='toasts toasts--below-modal'>
                        <ToastItem toast={{ message: translate('synchronisation.back-to-online-toast.caption') }}>
                            <ToastLink onClick={() => this.props.tryLeavingOfflineMode()}>
                                {translate('synchronisation.back-to-online-toast.button')}
                            </ToastLink>
                        </ToastItem>
                    </ul>
                    }
                </div>
            }>
                {this.props.children}
            </AppBase>
        );
    }

    public componentDidMount() {
        this.props.setOfflineMode(true);
    }
    
}

export const MyOfflineApp = connect<IOfflineAppStateProps, IOfflineAppDispatchProps, {}>(
    (state: IGlobalState) => ({ isWebSocketConnected: state.sharedState.isWebSocketConnected }),
    {
        setOfflineMode,
        tryLeavingOfflineMode,
    },
)(MyOfflineAppClass);
