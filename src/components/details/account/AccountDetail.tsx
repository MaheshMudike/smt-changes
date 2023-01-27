import * as _ from 'lodash';
import * as React from 'react';
import { EnumValues } from 'enum-values';
import { connect } from 'react-redux';

import Account from '../../../models/accounts/Account';
import Contact from '../../../models/accounts/Contact';
import { formatLabel } from '../../../utils/formatUtils';
import accountFields from '../../fields/accountFields';
import { renderFields } from '../../forms/renderFields';
import { ContactsDetails } from '../../partials/ContactsDetails';
import SectionDetail from '../SectionDetail';
import ReportItem from './ReportItem';
import IReport from '../../../models/api/reportApi';
import { downloadReport, showReport } from '../../../actions/integration/reportActions';
import { deSelectSearchItem } from '../../../actions/searchActions';
import { IconsBar } from '../../layout/IconsBar';
import { SvgIcon } from '../../../constants/SvgIcon';
import openLinkExternally from '../../../utils/openLinkExternally';
import { SALESFORCE_WEB } from '../../../constants/externalApps';
import { IGlobalState, localeFromState, activeInFSMFromState } from '../../../models/globalState';
import INameAndId from '../../../models/INameAndId';
import { IAccountReportPayload } from '../../../models/api/reports/accountReportApi';
import { IActionStatus } from '../../../actions/actions';
import { TabbedDetail } from '../../tabs/TabbedDetail';
import ItemsList from 'src/components/partials/ItemsList';
import ItemsListGroups from 'src/components/partials/ItemsListGroups';
import { queryOpportunitiesBase, queryAssetsOpportunitiesBase, queryLeadsBase, queryTendersBase, queryEventsBase, queryAssetsBase } from 'src/actions/http/jsforceBase';
import { conditions } from 'src/actions/http/jsforceMappings';
import { queryWorkOrdersForAssets, queryEquipmentLastServiceOrder } from 'src/actions/http/jsforce';
import Callout from 'src/models/feed/Callout';
import Lead from 'src/models/feed/Lead';
import { TenderListItem } from 'src/models/tenders/Tender';
import { OpportunityListItem } from 'src/models/feed/Opportunity';
import * as coreApi from '../../../models/api/coreApi';
import * as fields from "../../../actions/http/queryFields";
import { showModal } from 'src/actions/modalActions';
import { WorkOrderTypeSelectField, serviceOrderTypesFromFilter, MaintenanceActivityTypeReportFilter } from 'src/components/reports/ServiceOrdersReport';
import { entityFieldsDataFromState, EntityFieldsData } from 'src/components/fields/EntityFieldsData';
import { asyncHttpActionGenericLocalState3 } from 'src/actions/http/httpActions';
import { AccountDetailEquipmentTab } from './AccountDetailEquipmentTab';
import Event from 'src/models/events/Event';
import { ModalType } from 'src/constants/modalTypes';
import { filterWithMaintenanceActivityTypeFilters } from 'src/constants/ServiceOrderType';
import { multiQuery1Extract } from 'src/actions/http/jsforceCore';

interface IAccountDetailsProps {
    account: Account;
    report: IReport;
    contacts: Contact[];
    primaryContact: Contact;
    online: boolean;
    locale: string;
    showReport: (accountId: string) => void;
}

class AccountDetailBaseClass extends React.Component<IAccountDetailsProps, object> {

    public render() {
        const { report, showReport, locale } = this.props;
        return (
            <div className='padding-bottom--std'>
                <SectionDetail first label={formatLabel('list-detail.section-title.base-info')}>
                    {renderFields(accountFields(this.props.account, this.props.primaryContact))}
                </SectionDetail>
                <SectionDetail label={formatLabel('list-detail.section-title.customer-report')}>
                    {report ? <ReportItem report={report} showReport={showReport} locale={locale}/> : null}
                </SectionDetail>
                <SectionDetail label={formatLabel('modal.contact.group-title')}>
                    <ContactsDetails contacts={_.clone(this.props.contacts)} online={this.props.online} />
                </SectionDetail>
            </div>
        );
    };
}

export const AccountDetailBase = connect((state: IGlobalState) => ({ locale: localeFromState(state) }))(AccountDetailBaseClass)

const AccountIconsBarDispatchProps = {
    downloadReport,
    deSelectSearchItem,
    showModal
}

class AccountIconsBarClass extends React.Component<typeof AccountIconsBarDispatchProps & { account: INameAndId }, object> {

    public render() {
        return <IconsBar buttons={[
            {
                onClick: () => this.props.downloadReport(this.props.account),
                icon: SvgIcon.ReportBar
            },
            {
                onClick: () => {
                    this.props.showModal(ModalType.ContactCreationModal, { accountId: this.props.account.id })
                },
                icon: SvgIcon.Adduser,
            },
            /*
            {
                onClick: () => {
                    this.props.deSelectSearchItem();
                    openLinkExternally(SALESFORCE_WEB.createContactUrl(this.props.account.id));
                },
                icon: SvgIcon.Adduser,
            }
            */
        ]} />
    }
}

export const AccountIconsBar = connect(null, AccountIconsBarDispatchProps)(AccountIconsBarClass)

interface IAccountDetailStateProps {
    account: Account,
    contacts: Contact[];
    reports: _.Dictionary<IAccountReportPayload & IActionStatus>;
    entityFieldsData: EntityFieldsData;
}

type SearchAccountDetailProps = IAccountDetailStateProps & {
    showReport: typeof showReport, 
    showModal: typeof showModal, 
    downloadEvents: (accountId: string, limit: number) => Promise<Event[]>
};

class AccountDetailClass extends React.Component<
    SearchAccountDetailProps, 
    { currentTab: AccountDialogTab, serviceOrderTypes: MaintenanceActivityTypeReportFilter[] }
> {
  
    constructor(props: SearchAccountDetailProps) {
        super(props);
        this.state = { currentTab: AccountDialogTab.BasicInfo, serviceOrderTypes: [] };
    }
  
    public render() {
        return (
            <TabbedDetail 
                items={EnumValues.getNames(AccountDialogTab).map(name => (
                    <span>{formatLabel(`account-details.tab.${ name.toLowerCase() }`)}</span>
                ))}
                onChangeTab={(index: AccountDialogTab) => this.setState({ ...this.state, currentTab: index })} 
                selectedTab={this.state.currentTab}>
                {this.renderDialogContent()}
            </TabbedDetail>
        );
    };

    public renderDialogContent() {
        const serviceOrderTypes = serviceOrderTypesFromFilter(this.state.serviceOrderTypes);
        const filterOrder = (c: Callout) => filterWithMaintenanceActivityTypeFilters(c, serviceOrderTypes);
        const entityFieldsData = this.props.entityFieldsData;
        const { account, showModal, showReport } = this.props;
        switch (this.state.currentTab) {
            case AccountDialogTab.BasicInfo:
                const primaryContact = _.find(this.props.contacts, c => c.isPrimaryContact);
                return (
                    <AccountDetailBase account={account} report={this.props.reports[account.id]}
                        contacts={this.props.contacts} primaryContact={primaryContact}
                        online={true} showReport={this.props.showReport} />
                );
            case AccountDialogTab.VisitHistory:
                //account ST TRUIDENSE WOONCENTRALE BVBA has long list
                return <ItemsList key={AccountDialogTab.VisitHistory+this.props.account.id}
                    queryItems={ (limit) => this.props.downloadEvents(this.props.account.id, limit) } 
                    showModal={ showModal } entityFieldsData={ entityFieldsData }/>;
            case AccountDialogTab.Equipment:
                return <AccountDetailEquipmentTab accountId={account.id} />;
            case AccountDialogTab.CRM:
                return <ItemsListGroups key={AccountDialogTab.CRM + account.id} queryParams={ { accountId: account.id, entityFieldsData } } groupProperties={crmGroups} />;
            case AccountDialogTab.WorkOrders:
                return <ItemsListGroups 
                    filter={filterOrder}
                    topbar={<WorkOrderTypeSelectField serviceOrderTypes={this.state.serviceOrderTypes} setServiceOrderTypes={this.setServiceOrderTypes} />}
                    key={AccountDialogTab.WorkOrders + account.id} 
                    queryParams={ 
                        { accountId: account.id, serviceOrderTypes: this.state.serviceOrderTypes, activeInFSM: entityFieldsData.activeInFSM } 
                    }
                    groupProperties={[
                        { 
                            title: 'generic.open', 
                            groupKey: WorkOrderGroup.Open, 
                            action: (params: WorkordersQueryParams) =>
                                queryAssetsBase([conditions.Asset.account(params.accountId)])
                                .then(
                                    assets => queryWorkOrdersForAssets(assets.map(a => a.Id), [conditions.WorkOrder.open(params.activeInFSM)], 'LastModifiedDate', 'DESC')
                                    .then(wos => wos.map(ev => new Callout(ev, entityFieldsData)))
                                )
                        }, 
                        { 
                            title: 'generic.closed', 
                            groupKey: WorkOrderGroup.Closed,
                            action: (params: WorkordersQueryParams) =>
                                queryAssetsBase([conditions.Asset.account(params.accountId)])
                                .then(
                                    assets => queryWorkOrdersForAssets(assets.map(a => a.Id), [conditions.WorkOrder.closed(params.activeInFSM)], 'LastModifiedDate', 'DESC')
                                    .then(wos => wos.map(ev => new Callout(ev, entityFieldsData)))
                                )
                        }
                    ]}
                />;
            default:
                return null;
         }
    };

    private setServiceOrderTypes = (types: MaintenanceActivityTypeReportFilter[]) => {
        this.setState({ ...this.state, serviceOrderTypes: types});
    }
}

export const downloadEvents = (id: string, limit: number) => 
    asyncHttpActionGenericLocalState3(
        () => queryEventsBase([conditions.Event.whatId(id)]).sort('StartDateTime', 'DESC').limit(limit)
            .then(events => events.map(ev => new Event(ev))
    )
)

enum WorkOrderGroup { 
    Open = "Open", 
    Closed = "Closed"
}

type WorkordersQueryParams = { accountId: string, serviceOrderTypes: string[], activeInFSM: boolean }

enum CRMGroup { 
    Opportunities = "Opportunities", 
    Leads = "Leads",
    Tenders = "Tenders"
}

type CRMGroupQueryParams = { accountId: string, entityFieldsData: EntityFieldsData }

const crmGroups = [
    { 
        title: 'generic.entity-name.opportunities', 
        groupKey: CRMGroup.Opportunities, 
        action: async (params: CRMGroupQueryParams) => {
            const opps = await queryOpportunitiesBase([conditions.Opportunity.account(params.accountId)]);
            const assetOpps = await multiQuery1Extract(
                queryAssetsOpportunitiesBase<coreApi.IAsset_Opportunity_Address__c>([conditions.Asset_Opportunity__c.assets(opps.map(opp => opp.Id))], fields.IAsset_Opportunity_Address__c).sort('LastModifiedDate', 'DESC')
            );
            const assetOppsByOppId = _.groupBy(assetOpps, 'Opportunity__c');
            return opps.map(o => new OpportunityListItem(o, assetOppsByOppId[o.Id]));
        }
    }, 
    { 
        title: 'generic.entity-name.leads', 
        groupKey: CRMGroup.Leads,
        action: (params: CRMGroupQueryParams) => queryLeadsBase([conditions.Lead.account(params.accountId), conditions.Lead.notConverted]).sort('LastModifiedDate', 'DESC').then(leads => leads.map(l => new Lead(l, params.entityFieldsData)))
    },
    { 
        title: 'generic.entity-name.tenders', 
        groupKey: CRMGroup.Tenders,
        action: (params: CRMGroupQueryParams) => 
            queryTendersBase([conditions.Tender__c.account(params.accountId), conditions.Tender__c.active]).sort('LastModifiedDate', 'DESC')
            .then(tenders => tenders.map(l => new TenderListItem(l)))
    }
];

enum AccountDialogTab {
    BasicInfo,
    VisitHistory,
    Equipment,
    CRM,
    WorkOrders
}

const accountDetailDispatchProps = {
    showReport, showModal, downloadEvents
}

const accountDetailStateProps = (state: IGlobalState) => ({
    reports: state.reports.reports,
    entityFieldsData: entityFieldsDataFromState(state)
});

export const AccountDetail = connect(accountDetailStateProps, accountDetailDispatchProps)(AccountDetailClass)
