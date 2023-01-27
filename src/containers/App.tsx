import * as React from 'react';
import { connect } from 'react-redux';

import { synchronize } from '../actions/integration/synchronization';
import { showModal } from '../actions/modalActions';
import { setOfflineMode } from '../actions/sharedStateActions';
import { Menu } from '../components/layout/menu/Menu';
import { MenuButton } from '../components/layout/menu/MenuButton';
import { MenuItemsList } from '../components/layout/menu/MenuItemsList';
import { RouteMenuLink } from '../components/layout/menu/RouteMenuLink';
import { paths } from '../config/paths';
import { ModalType } from '../constants/modalTypes';
import { SvgIcon } from '../constants/SvgIcon';
import translate from '../utils/translate';
import { AppBase } from './AppBase';
import { IGlobalState, serviceResourceEnabledFromState } from '../models/globalState';
import { AdminType } from '../models/user/UserRole';
import { replace } from 'react-router-redux';
import { DropdownMenuLink } from 'src/components/layout/menu/DropdownMenuLink';
import { faGlobe} from '@fortawesome/free-solid-svg-icons';

/*
<DropdownMenuLink icon={SvgIcon.Traction} label={translate('tracking-control.title')}>
    <TextMenuButton
        frontText={translate('tracking-control.va.name')}
        label={translate('tracking-control.va.label')}
        onClick={() => this.props.replace(paths.TRACTION_CONTROL_REPORT_VA)}
    />
    <TextMenuButton
        frontText={translate('tracking-control.vc.name')}
        label={translate('tracking-control.vc.label')}
        onClick={() => this.props.replace(paths.TRACTION_CONTROL_REPORT_VC)}
    />
</DropdownMenuLink>,
*/
class AppClass extends React.Component<ReturnType<typeof AppStateProps> & typeof AppDispatchProps & { topBarContent:  JSX.Element }, object> {
    public render() {
        const authenticationState = this.props.authenticationState;
        const plannerGroup = authenticationState.currentPlannerGroup;
        const adminType = authenticationState.currentUser && authenticationState.currentUser.adminType;
        const isAdmin = adminType === AdminType.Global || adminType === AdminType.Local;
        const isGlobalAdmin = isAdmin && adminType === AdminType.Global;
        const showTechnicianReport = authenticationState.currentPlannerGroup != null && authenticationState.currentPlannerGroup.activeInFSM || this.props.serviceResourceEnabled;

        return (
            <AppBase topBarContent={this.props.topBarContent} menu={
                <Menu menuLinks={[
                    <RouteMenuLink icon={SvgIcon.Overview} label={translate('overview-page.title')} route={paths.OVERVIEW} />,
                    <RouteMenuLink icon={SvgIcon.Plan} label={translate('plan-page.title')} route={paths.PLAN} />,
                    <RouteMenuLink icon={SvgIcon.Locate} label={translate('locate-page.title')} route={paths.LOCATE} />,
                    showTechnicianReport ? <RouteMenuLink icon={SvgIcon.TechnicianReport} label={translate('technician-report.title')} route={paths.TECHNICIAN_REPORT} /> : null,
                    // <DropdownMenuLink icon={SvgIcon.Traction} label={translate('tracking-control.title')}>
                    //     <RouteMenuLink
                    //         frontText={translate('tracking-control.va.name')}
                    //         label={translate('tracking-control.va.label')}
                    //         route={paths.TRACTION_CONTROL_REPORT_VA} 
                    //     />
                    //     <RouteMenuLink
                    //         frontText={translate('tracking-control.vc.name')}
                    //         label={translate('tracking-control.vc.label')}
                    //         route={paths.TRACTION_CONTROL_REPORT_VC} 
                    //     />
                    // </DropdownMenuLink>,
                    <RouteMenuLink icon={SvgIcon.ServiceOrdersReport} label={translate('service-orders-report-page.title')} route={paths.SERVICE_ORDERS_REPORT} />,
                    <RouteMenuLink faIcon={faGlobe} label={translate('links-page.title')} route={paths.LINKS} />,
                    <RouteMenuLink icon={SvgIcon.Search} label={translate('search-page.title')} route={paths.SEARCH} />,
                    this.props.showAccountReports ? <RouteMenuLink icon={SvgIcon.AccountReports} label={translate('account-reports.title')} route={paths.ACCOUNT_REPORT} /> :  null,
                    isAdmin ?
                        <div className="separated--top-dark">
                            <RouteMenuLink icon={SvgIcon.Appsettings} label={translate('admin.company-settings.menu-title')} route={paths.ADMIN_SETTINGS}/>
                            { isGlobalAdmin ? <RouteMenuLink icon={SvgIcon.Users} label={translate('admin.user-management.title')} route={paths.ADMIN_USER_MANAGEMENT} /> : null }
                        </div>
                        : null
                ]}>
                    <MenuItemsList isBottom items={[
                        plannerGroup == null ? null :
                        <MenuButton frontText={plannerGroup.shortBranchCode} label={plannerGroup.branchLabel}
                            onClick={() => this.props.showModal(ModalType.ReSelectPlannerGroupDialog, this.props.authenticationState)} />,
                        <MenuButton icon={SvgIcon.Sync} label={translate('generic.button.sync')} onClick={this.props.synchronize}
                            iconClassName={this.props.isProcessing ? 'spin' : null} />
                    ]} />
                </Menu>
            }>
                {this.props.children}
            </AppBase>
        );
    }

    public componentDidMount() {
        this.props.setOfflineMode(false);
    }

}


const AppDispatchProps = {
    synchronize,
    showModal,
    setOfflineMode,
    replace
}

const AppStateProps = (state: IGlobalState) => {
    const feed = state.feed;
    const metrics = state.metrics;
    const isFeedProcessing = feed != null && (feed.paging.isReloading || feed.paging.isLoadingNextPage)
    const isMetricsProcessing = metrics != null && (metrics.isProcessingKff || metrics.isProcessingOther || metrics.isProcessingWorkorders);
    const showAccountReports = Object.keys(state.reports.reports).length > 0;
    return {
        authenticationState: state.authentication,
        isProcessing: isFeedProcessing || isMetricsProcessing,
        showAccountReports,
        serviceResourceEnabled: serviceResourceEnabledFromState(state)
    }
}

export const App = connect(AppStateProps, AppDispatchProps)(AppClass);