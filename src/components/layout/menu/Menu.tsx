import * as React from 'react';
import { connect } from 'react-redux';

import { logout } from '../../../actions/authenticationActions';
import { hideAllModals, showModal } from '../../../actions/modalActions';
import { ModalType } from '../../../constants/modalTypes';
import { IGlobalState } from '../../../models/globalState';
import { User } from '../../../models/user/User';
import { MenuItemsList } from './MenuItemsList';
import MenuUserDetails from './MenuUserDetails';

class MenuClass extends React.Component<MenuProps, object> {
    public render() {
        return (
            <div className='sidebar container--vertical separated--right-dark'>
                <div className='menu-items--animation flex--1 container--vertical scrollable--vertical'>
                    <MenuUserDetails user={this.props.currentUser} logout={this.confirmLogout} />
                    <MenuItemsList items={this.props.menuLinks} />
                </div>

                <span className='menu-version-number'>
                    {__SMT_VERSION__} - {__SMT_ENV__}
                </span>
                {this.props.children}
            </div>
        );
    }

    private confirmLogout = () => {
        this.props.showModal(ModalType.ConfirmModal, {
            action: () => {
                this.props.logout();
                this.props.hideAllModals();
            },
            labelKeyPrefix: 'modals.confirm-logout',
        });
    };
}

interface IMenuStateProps {
    currentLocation: string;
    currentUser: User;
}

interface IMenuExplicitProps {
    menuLinks: JSX.Element[];
}

interface IMenuDispatchProps {
    logout: typeof logout;
    showModal: typeof showModal;
    hideAllModals: typeof hideAllModals;
}

type MenuProps = IMenuStateProps & IMenuDispatchProps & IMenuExplicitProps;

export const Menu = connect<IMenuStateProps, IMenuDispatchProps, IMenuExplicitProps>(
    (state: IGlobalState) => ({        
        currentLocation: state.routing.location.pathname,
        currentUser: state.authentication.currentUser,
    }),
    { logout, showModal, hideAllModals },
)(MenuClass) as React.ComponentClass<IMenuExplicitProps>;
