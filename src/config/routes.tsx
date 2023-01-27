import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router';

import { AdminSettings } from '../components/admin/AdminSettings';
import { AdminUserManagement } from '../components/admin/AdminUserManagement';
import OauthLogin from '../components/OauthLogin';
import { OnlineSearchInput, OfflineSearchAccountsInput } from '../components/search/SearchInput';
import { App } from '../containers/App';
import { FeedContainer } from '../containers/FeedContainer';
import { MyOfflineApp } from '../containers/OfflineApp';
import { LoginPage } from '../containers/pages/LoginPage';
import Overview from '../containers/pages/Overview';
import { paths } from './paths';
//import { TractionControlReportVA, TractionControlReportVC } from '../components/reports/TractionControlReport';

import * as Loadable from 'react-loadable';
import Search from '../containers/pages/Search';
import { ServiceOrdersReport } from '../components/reports/ServiceOrdersReport';
import { InspectionPoints, Complaints, Inspections, OverviewServiceNeedsList, Queries, Repairs, Tasks, UnplannedCallouts, Audits,
    Opportunities, OpportunitiesWithTenders, CustomerVisits, MbmCallouts, Equipments, MonthlyDiscussions, OfflineAccounts, HelpdeskCases, RejectedServiceAppointmentsList, OpportunitiesOwned, OpportunitiesWithTendersOwned, OpportunitiesWithTendersCustomers, OpportunitiesCustomers, RejectedWorkOrdersNonFSMList, DetractorCases, Leads, LeadsCustomers, LeadsOwned } from '../containers/pages/OverviewLists';
import { TractionControlReports, TractionControlReportsVA, TractionControlReportsVC } from '../components/reports/TractionControlReports';
import Links from '../containers/pages/Links';
import { TechnicianReport } from 'src/components/reports/TechnicianReport';


interface IModuleWithDefault<T> {
    default: T;
}
/*  
function AsyncRoute<T extends React.ComponentType<any>>(
    loader: () => Promise<IModuleWithDefault<T>>
): React.ComponentType<any> {
return Loadable({
    loader: () => loader().then(m => m.default),
    delay: 2000,
    timeout: 30000,
    loading: () => <div>loading...</div>,
});
}
*/

class MyLoadingComponent extends React.Component<Loadable.LoadingComponentProps> {
	render() {
		return <div>Loading...</div>;
	}
}

function Loadable2(loader: () => Promise<IModuleWithDefault<any>>) {
    return Loadable({
        loader: () => loader().then(m => m.default),
        delay: 2000,
        timeout: 30000,
        loading: () => <div></div>,
    });
}

const LocateLoadableComponent = Loadable2(
    () => import(/* webpackChunkName: "Locate" */ '../containers/pages/Locate')
)

class LocateLoadable extends React.Component {
    render() { return <LocateLoadableComponent />; }
}


const OfflinePlanLoadableComponent = Loadable2(
    () => import(/* webpackChunkName: "OfflinePlan" */ '../containers/pages/PlanOffline')
)

class OfflinePlanLoadable extends React.Component {
    render() { return <OfflinePlanLoadableComponent />; }
}


const OnlinePlanLoadableComponent = Loadable2(
    () => import(/* webpackChunkName: "OnlinePlan" */ '../containers/pages/Plan')
)

class OnlinePlanLoadable extends React.Component {
    render() { return <OnlinePlanLoadableComponent />; }
}


const AccountReportLoadableComponent = Loadable2(
    () => import(/* webpackChunkName: "AccountReport" */ '../components/reports/AccountReport')
)

class AccountReportLoadable extends React.Component {
    render() { return <AccountReportLoadableComponent />; }
}


const SearchLoadableComponent = Loadable2(
    () => import(/* webpackChunkName: "Search" */ '../containers/pages/Search')
)

class SearchLoadable extends React.Component {
    render() { return <SearchLoadableComponent />; }
}


export const routes = (isAdmin: boolean) =>
<Switch>
    <Route path={paths.OAUTH_CALLBACK} component={OauthLogin} />
    <Route exact path={paths.LOGIN} component={LoginPage} />        
        
    <Route path={paths.PLAN_OFFLINE} render={() => 
        <MyOfflineApp topBarContent={null}>
            <OfflinePlanLoadable />
        </MyOfflineApp>
	}/>

	<Route path={paths.OFFLINE_ACCOUNTS} render={() => 
        <MyOfflineApp topBarContent={<OfflineSearchAccountsInput />}>
            <OfflineAccounts />
        </MyOfflineApp>
	}/>

    <Route path={paths.SEARCH} render={() => 
        <App topBarContent={<OnlineSearchInput/>}>
            <Search />
        </App>
    }/>
    
    <Route path={'/app'} render={() => 
        <App topBarContent={null}>
            <Switch>
                <Route exact path={paths.OVERVIEW} render={() =>
                    <FeedContainer><Overview /></FeedContainer>
                }/>
                <Route path={paths.PLAN} render={() =>
                    <FeedContainer><OnlinePlanLoadableComponent /></FeedContainer>
                }/>
                
                <Route path={paths.LOCATE} render={() =>
                   <FeedContainer><LocateLoadable /></FeedContainer>
                }/>

                <Route path={paths.TECHNICIAN_REPORT} component={TechnicianReport} />
                <Route path={paths.SERVICE_ORDERS_REPORT} component={ServiceOrdersReport} />

                <Route path={paths.OPEN_UNPLANNED_JOBS} component={UnplannedCallouts} />
                <Route path={paths.QUERIES} component={Queries} />
                <Route path={paths.TECHNICAL_HELPDESK_CASES} component={HelpdeskCases} />
                <Route path={paths.DETRACTOR_CASES} component={DetractorCases} />

                <Route path={paths.LEADS} component={Leads} />
                <Route path={paths.LEADS_OWNED} component={LeadsOwned} />
                <Route path={paths.LEADS_CUSTOMERS} component={LeadsCustomers} />

                <Route path={paths.OPPORTUNITIES} component={Opportunities} />
                <Route path={paths.OPPORTUNITIES_WITH_TENDERS} component={OpportunitiesWithTenders} />
                <Route path={paths.OPPORTUNITIES_OWNED} component={OpportunitiesOwned} />
                <Route path={paths.OPPORTUNITIES_WITH_TENDERS_OWNED} component={OpportunitiesWithTendersOwned} />
                <Route path={paths.OPPORTUNITIES_CUSTOMERS} component={OpportunitiesCustomers} />
                <Route path={paths.OPPORTUNITIES_WITH_TENDERS_CUSTOMERS} component={OpportunitiesWithTendersCustomers} />

                <Route path={paths.TASKS} component={Tasks} />
                <Route path={paths.COMPLAINTS} component={Complaints} />
                <Route path={paths.MBM_LEFT_THIS_MONTH} component={MbmCallouts} />
                <Route path={paths.EQUIPMENT} component={Equipments} />
                <Route path={paths.CUSTOMER_VISITS} component={CustomerVisits} />
                <Route path={paths.AUDIT} component={Audits} />
                <Route path={paths.MONTHLY_DISCUSSIONS} component={MonthlyDiscussions} />
                <Route path={paths.REPAIRS} component={Repairs} />
                <Route path={paths.INSPECTIONS} component={Inspections} />
                <Route path={paths.INSPECTION_POINTS} component={InspectionPoints} />
                <Route path={paths.REJECTED_SERVICE_APPOINTMENTS} component={RejectedServiceAppointmentsList} />
                <Route path={paths.REJECTED_WORK_ORDERS_NON_FSM} component={RejectedWorkOrdersNonFSMList} />
                <Route path={paths.SERVICE_NEEDS} component={OverviewServiceNeedsList} />
                <Route path={paths.ACCOUNT_REPORT} component={AccountReportLoadable} />

                {/* <Route path={paths.TRACTION_CONTROL_REPORTS} component={TractionControlReports} />
                
                <Route path={paths.TRACTION_CONTROL_REPORT_VA} component={TractionControlReportsVA} />
                <Route path={paths.TRACTION_CONTROL_REPORT_VC} component={TractionControlReportsVC} /> */}

                <Route path={paths.ADMIN_SETTINGS} render={() =>
                    isAdmin ? <AdminSettings /> : null
                }/>
                <Route path={paths.ADMIN_USER_MANAGEMENT} render={() =>
                    isAdmin ? <AdminUserManagement /> : null
                }/>

                <Route path={paths.NOTIFICATIONS} component={Tasks} />

                
                <Route exact path={paths.LINKS} render={() =>
                    <FeedContainer><Links /></FeedContainer>
                }/>
                }
            </Switch>
        </App>                                    
    }/>
    <Redirect from='*' to={paths.OVERVIEW} />
</Switch>;