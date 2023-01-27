import * as React from 'react';

import { SvgIcon } from '../../../constants/SvgIcon';
import { User } from '../../../models/user/User';
import { Icon } from '../Icon';

export default class MenuUserDetails extends React.Component<IMenuUserDetailsProps, object> {
    constructor(props: any) {
        super(props);
    }

    public render() {
        const { fullName, email } = this.props.user || { fullName: '', email: '' };
        return (
            <div className='menu-user-details padding-horizontal--decreased'>
                <div className='padding-vertical--large padding-horizontal--decreased container--horizontal'>
                    <div className='flex--1'>
                        <Icon svg={SvgIcon.LogoBlue} className='menu-user-details__logo icon--logo-blue' />
                    </div>
                    <Icon className='menu-user-details__btn clickable' svg={SvgIcon.Logout} onClick={() => this.props.logout()} />
                </div>
                <div className='padding-horizontal--decreased padding-vertical--large'>
                    <div className='menu-user-details__name bold'>
                        {fullName}
                    </div>
                    <div className='menu-user-details__mail'>
                        {email}
                    </div>
                </div>
            </div>
        );
    }
}

interface IMenuUserDetailsProps {
    user: User;
    logout: () => void;
}
