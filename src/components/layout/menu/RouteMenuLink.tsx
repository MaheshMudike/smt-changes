import * as cx from 'classnames';
import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { replace } from 'react-router-redux';

import { SvgIcon } from '../../../constants/SvgIcon';
import { IGlobalState } from '../../../models/globalState';
import { MenuButton } from './MenuButton';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

class RouteMenuLinkClass extends React.Component<IRouteMenuLinkProps, object> {

    public render() {
        const { label, icon, faIcon, route, frontText } = this.props;
        return (
            <MenuButton
                className={cx({ 'menu-item--active': _.startsWith(this.props.currentRoute, route) })}
                icon={icon}
                faIcon={faIcon}
                label={label}
                frontText={frontText}
                onClick={this.onClick}
            />
        );
    }

    private onClick = () => {
        this.props.replace(this.props.route);
    }
}

interface IRouteMenuLinkProps {
    replace: typeof replace;
    currentRoute: string;

    frontText?: string;
    label: string;
    icon?: SvgIcon;
    faIcon?: IconDefinition;
    route: string;
}

export const RouteMenuLink = connect(
    (state: IGlobalState) => ({ 
		//currentRoute: state.routing.locationBeforeTransitions.pathname 
		currentRoute: state.routing.location.pathname 
	}),
    { replace },
)(RouteMenuLinkClass);
