import { EnumValues } from 'enum-values';
import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import * as cx from 'classnames';
import { loadTechnicianServiceOrders, resetTechnicianDetails } from '../../actions/technicianActions';
import { IDetailsSet, TechnicianDetailsSetType } from '../../models/technicianDetails/ITechnicianDetails';
import Technician from '../../models/technicians/Technician';
import { formatLabel } from '../../utils/formatUtils';
import { technicianDetailsField } from '../fields/technicianDetailsField';
import { renderFields } from '../forms/renderFields';
import { ClickableServiceOrderListItem } from '../list/ClickableServiceOrderListItem';
import { IGlobalState, fitterLocationEnabledType } from '../../models/globalState';
import { ITechnicianServiceOrderMetrics, AuditStatus } from '../../models/api/coreApi';
import { queryWorkOrdersMetricsForTechnician } from '../../actions/http/jsforce';
import { CoveringSpinner } from '../CoveringSpinner';
import Audit from '../../models/audits/Audit';
import { TabbedDetail } from '../tabs/TabbedDetail';
import { StatusContainerItems } from '../StatusContainer';
import { entityFieldsDataFromState } from '../fields/EntityFieldsData';

function getMetricValueForDetailsSetType(type: TechnicianDetailsSetType, metrics: ITechnicianServiceOrderMetrics) {
    if(metrics == null) return -1;
    switch (type) {
        case TechnicianDetailsSetType.CompletedToday:
            return metrics.completedToday;
        case TechnicianDetailsSetType.Mbm:
            return metrics.mbm;
        case TechnicianDetailsSetType.OpenCallouts:
            return metrics.openCallouts;
        case TechnicianDetailsSetType.OtherCallouts:
            return metrics.openOthers;
        default:
            return null;
    }
}

enum TechnicalDialogTab {
    BasicInfo,
    ServiceOrders,
}

interface IServiceOrderTab {
    isGood: boolean;
    hasList: boolean;
    detailsSetType: TechnicianDetailsSetType;
}

interface ITechnicianDialogState {
    currentDialogTab: TechnicalDialogTab;
    currentServiceOrdersTab: TechnicianDetailsSetType;
    serviceOrdersTabs: IServiceOrderTab[];
    serviceOrderMetrics: ITechnicianServiceOrderMetrics;
}

function technicianDetailsSetTypeToString(type: TechnicianDetailsSetType) {
    switch (type) {
        case TechnicianDetailsSetType.CompletedToday:
            return 'completed-today';
        case TechnicianDetailsSetType.Mbm:
            return 'mbm';
        case TechnicianDetailsSetType.OtherCallouts:
            return 'open-others';
        case TechnicianDetailsSetType.OpenCallouts:
            return 'unplanned';
        default:
            return null;
    }
}

type TechnicianDetailProps = typeof TechnicianDispatchProps & ReturnType<typeof TechnicianDetailStateProps> & { item: Technician; };

class TechnicianDialogClass extends React.Component<TechnicianDetailProps, ITechnicianDialogState> {

    constructor(props: TechnicianDetailProps) {
        super(props);
        this.state = {
            currentDialogTab: TechnicalDialogTab.BasicInfo,
            currentServiceOrdersTab: TechnicianDetailsSetType.CompletedToday,
            serviceOrdersTabs: [
                { isGood: true, detailsSetType: TechnicianDetailsSetType.CompletedToday, hasList: true },
                { isGood: false, detailsSetType: TechnicianDetailsSetType.OpenCallouts, hasList: true },
                { isGood: false, detailsSetType: TechnicianDetailsSetType.Mbm, hasList: true },
                { isGood: false, detailsSetType: TechnicianDetailsSetType.OtherCallouts, hasList: true }
            ],
            serviceOrderMetrics: null
        };
    }

    public render() {
        const tabNames = 
            EnumValues.getNames(TechnicalDialogTab).map(name => <span>{formatLabel(`modal.technician.tab.${ name.toLowerCase() }`)}</span>)
        return <TabbedDetail items={tabNames} onChangeTab={this.selectTab} selectedTab={this.state.currentDialogTab}>
            {this.renderTab()}
        </TabbedDetail>;
    }

    private renderTab() {
        const { item, audits, discussions, entityFieldsData, fitterLocation, gpsPermissionSet } = this.props;
        const technician = item;
        const auditIsOpen = (audit: { employeeNumber: string, status: AuditStatus }) => audit.employeeNumber === technician.fitterNumber 
            && (audit.status === AuditStatus.Open || audit.status === AuditStatus.InProgress);
        const openAudits = audits.list.items.filter(auditIsOpen).length;
        const openDiscussions = discussions.list.items.filter(auditIsOpen).length;
        const selectedTab = this.getCurrentServiceOrdersTabIndex();
        switch (this.state.currentDialogTab) {
            case TechnicalDialogTab.BasicInfo:
                return (
                    <div className='flex--1 scrollable--vertical'>
                        {renderFields(technicianDetailsField(technician, openAudits, openDiscussions, fitterLocation, gpsPermissionSet,
                              this.props.entityFieldsData))}
                    </div>
                );
            case TechnicalDialogTab.ServiceOrders:
                const currentDetailsSet = this.getDetailsSetForTab(this.state.currentServiceOrdersTab);
                return (
                <div className='container--vertical flex--1'>
                    <div className={'container--horizontal flex-shrink--0'}>
                        {this.state.serviceOrdersTabs.map((itemTab, index) => {
                            const isGood = itemTab.isGood;
                            const label = formatLabel(`modal.technician.serviceorders.${ technicianDetailsSetTypeToString(itemTab.detailsSetType) }`);
                            const value = getMetricValueForDetailsSetType(itemTab.detailsSetType, this.state.serviceOrderMetrics);
                    
                            const isLoading = value <= -1;
                            const valueClass = cx('score__value', { 'score__value--bad': !isGood && value > 0, 'score__value--neutral': !isGood && value === 0 });
                            const className = selectedTab === index ? '' : 'score--inactive';
                            return <div className={cx('score', 'container--vertical', 'container--centered', 'flex-grow--1', 'padding-horizontal--std', className )} 
                                onClick={() => { if(selectedTab !== index && itemTab.hasList) this.selectServiceOrderTab(index); }}
                                style={ { position: 'relative' } }>
                                { isLoading ? (<CoveringSpinner isSmall  />) : null}
                                <div className={valueClass}>{isLoading ? '-' : value}</div>
                                <div className='score__caption'>{label}</div>
                            </div>
                        })}
                    </div>
                    <div className='flex--1 scrollable relative container--vertical container--justify-start'>
                        <StatusContainerItems isProcessing={!currentDetailsSet || currentDetailsSet.isDownloading}
                         items={currentDetailsSet.items}>
                         {currentDetailsSet.items.map((callout, index) => 
                            <ClickableServiceOrderListItem item={callout} entityFieldsData={entityFieldsData}
                                showDate={this.state.currentServiceOrdersTab === TechnicianDetailsSetType.OpenCallouts ? 'createDate' : null}
                            />
                        )}
                         </StatusContainerItems>
                    </div>
                </div>);
            default:
                return <div />;
        }
    }

    public componentWillUnmount() {
        this.props.resetTechnicianDetails();
    }

    private selectTab = (index: TechnicalDialogTab) => {
        const lastTab = this.state.currentDialogTab;

        if(this.state.serviceOrderMetrics == null) {
            queryWorkOrdersMetricsForTechnician(this.props.item.id, this.props.entityFieldsData.activeInFSM, this.props.entityFieldsData.serviceResourceEnabled)
            .then(serviceOrderMetrics => {
                this.setState({ ...this.state, serviceOrderMetrics });
            })
        };

        this.setState({ ...this.state, currentDialogTab: index});
        if (index === TechnicalDialogTab.ServiceOrders && lastTab !== index) {
            this.loadCurrentServiceOrderTabIfNeeded();
        }
    };  

    private selectServiceOrderTab = (index: number) => {
        const newDetailsSetType = this.state.serviceOrdersTabs[index].detailsSetType;
        this.setState(_.assign( {}, this.state, { currentServiceOrdersTab: newDetailsSetType }) as ITechnicianDialogState);
        this.loadCurrentServiceOrderTabIfNeeded(newDetailsSetType);
    };

    private getCurrentServiceOrdersTabIndex = (): number => {
        return _.findIndex(this.state.serviceOrdersTabs, { detailsSetType: this.state.currentServiceOrdersTab });
    };

    private getDetailsSetForTab = (detailsSetType: TechnicianDetailsSetType): IDetailsSet => {
        const details = _.find(this.props.technicianDetails.detailsSet, { detailsSetType });
        return details == null ? {
            detailsSetType,
            isDownloaded: false,
            isDownloading: true,
            items: [] as any[],
        } : details;
    };

    private loadCurrentServiceOrderTabIfNeeded = (setType: TechnicianDetailsSetType = this.state.currentServiceOrdersTab) => {
        const currentDetailsSet = this.getDetailsSetForTab(setType);
        if (currentDetailsSet.isDownloaded === false) {
            this.props.loadTechnicianServiceOrders(this.props.item.id, setType);
        }
    };

}

const TechnicianDetailStateProps = (state: IGlobalState) => ({
    technicianDetails: state.technicianDetails,
    audits: state.audits,
    discussions: state.discussions,
    fitterLocation: state.configuration.fitterLocation,
    gpsPermissionSet: state.authentication.currentUser.gpsPermissionSet,
    entityFieldsData: entityFieldsDataFromState(state),
})

const TechnicianDispatchProps = {
    loadTechnicianServiceOrders,
    resetTechnicianDetails,
    //loadTechnicianMetrics
}

export const TechnicianDetail = connect(TechnicianDetailStateProps, TechnicianDispatchProps)(TechnicianDialogClass);