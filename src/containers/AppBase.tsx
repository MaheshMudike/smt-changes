import * as cx from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import { paths } from '../config/paths';
import { IGlobalState } from '../models/globalState';
import { allTiles } from '../models/overview/tiles';
import translate from '../utils/translate';
import * as _ from 'lodash';
import { SvgIcon } from '../constants/SvgIcon';
import { Icon } from '../components/layout/Icon';
import { listItemsClasses } from '../constants/layout';
import { ErrorBoundary } from './ErrorBoundary';

const pathTitles = {
    [paths.LOCATE]: 'locate-page.title',
    [paths.OVERVIEW]: 'overview-page.title',
    [paths.PLAN]: 'plan-page.title',
    [paths.PLAN_OFFLINE]: 'plan-page.title',
    [paths.ADMIN_SETTINGS]: 'admin.company-settings.title',
    [paths.ADMIN_USER_MANAGEMENT]: 'admin.user-management.title',    
    [paths.TRACTION_CONTROL_REPORTS]: 'tracking-control.reports.label',
    [paths.TRACTION_CONTROL_REPORT_VA]: 'tracking-control.va.label',
    [paths.TRACTION_CONTROL_REPORT_VC]: 'tracking-control.vc.label',
    [paths.SERVICE_ORDERS_REPORT]: 'service-orders-report.title',
    [paths.TECHNICIAN_REPORT]: 'technician-report.title',
    [paths.LINKS]: 'links-page.title',

};

const overviewTitles = _.fromPairs(allTiles.map(t => [t.getPath(), t.getName()]));
//_.assign(pathTitles, _.fromPairs(tileTitles));

export const TOGGLE_MENU = 'TOGGLE_MENU';
export const CLOSE_MENU ='CLOSE_MENU';

function toggleMenu() {
    return {
        type: TOGGLE_MENU,
    };
}

export function closeMenu() {
    return {
        type: CLOSE_MENU,
    };
}

function TopBarTitle(props: { title: string }) {
    return <div className='full-width full-height'>                
        <div className={cx('topbar__separator', 'container--horizontal', 'full-height', listItemsClasses)}>
            <div className="row">
            <span className='topbar__title'>{ props.title }</span>
            </div>
    </div></div>
}

class AppBaseClass extends React.Component<IAppBaseStateProps & IAppBaseDispatchProps, object> {

    public render() {
        const title = translate(pathTitles[this.props.currentLocation]) || null;
        const overviewTitle = translate(overviewTitles[this.props.currentLocation]) || null;
        //this is a hack to add a separator to the listview titles like in the search page
        const topBarContent = this.props.topBarContent || overviewTitle && <TopBarTitle title={ overviewTitle } />;
        return (
            <ErrorBoundary>
            <div className={cx('main-container', 'relative', { 'main-container--menu-open': this.props.isOpen })}>
                <div className='topbar'>
                    <div className='topbar__panel container--horizontal'>
                        <button className='topbar__menu-btn' onClick={this.handleToggleMenu} >
                            <Icon svg={SvgIcon.MainMenuBar} />
                        </button>
                        {title ? <span className='topbar__title'>{title}</span> : null}
                        {topBarContent}
                    </div>
                </div>
                {this.props.menu}
                <div className='main-container__content'>
                    <div className='content'>
                        {this.props.children}
                    </div>
                </div>
            </div>
            </ErrorBoundary>
        );
    }

    
    private handleToggleMenu = (e: React.MouseEvent<any>) => {
        e.preventDefault();
        this.props.toggleMenu();
    }
};

interface IAppBaseStateProps {
    isOpen: boolean;
    currentLocation: string;
    topBarContent?: JSX.Element;
    menu: JSX.Element;
}

interface IAppBaseDispatchProps {
    toggleMenu: typeof toggleMenu;
}

//type AppBaseProps = IAppBaseStateProps & IAppBaseExplicitProps;

export const AppBase = connect(
    (state: IGlobalState) => ({
        isOpen: state.layout.menuOpen,
        currentLocation: state.routing.location.pathname
    }),
    {
        toggleMenu
    },
)(AppBaseClass);