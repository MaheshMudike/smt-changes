import * as React from 'react';
import { connect } from 'react-redux';
import { IGlobalState, userIdFromState, localeFromState, activeInFSMFromState } from '../../models/globalState';
import translate from '../../utils/translate';
import { SelectField } from '../forms/SelectField';
import { Option } from 'react-select';
import * as _ from 'lodash';
import Callout, { WorkOrderServiceOrderReport } from '../../models/feed/Callout';
import { IServiceOrdersReport, ServiceOrderReportTab } from '../../reducers/serviceOrdersReportReducer';
import * as moment from 'moment';
import { queryServiceOrdersReport, selectServiceOrdersReportTab, selectServiceOrderTypes, selectServiceOrderWorkcenters } from '../../actions/integration/serviceOrdersReportActions';
import { MaintenanceActivityTypeFilter, maintenanceActivityTypeFilterLabel, maintenanceActivityTypeFilterDescription, maintenanceActivityTypeDescription, filterWithMaintenanceActivityTypeFilter, filterWithMaintenanceActivityTypeFilters } from '../../constants/ServiceOrderType';
import { ActionStatus } from '../../actions/actions';
import * as cx from 'classnames';
import { formatDateMonthYear } from '../../utils/formatUtils';
import { openListOfEntitiesOrOpenItem, queryAndShowDetailsDialogGeneric } from '../../actions/integration/detailsActions';
import { queryWorkOrders } from '../../actions/http/jsforceBase';
import { conditions } from '../../actions/http/jsforceMappings';
import { ModalType } from '../../constants/modalTypes';
import { showModal } from '../../actions/modalActions';
import PanelPage from '../../containers/pages/PanelPage';
import { CoveringSpinner } from '../CoveringSpinner';
import { queryWorkOrderContractLines } from '../../actions/http/jsforce';
import { createSelector } from 'reselect';
import { Table } from '../table/Table';
import { getServiceOrderTime, getServiceOrderEndDate } from 'src/selectors/getCalloutGrouping';
import { entityFieldsDataFromState } from '../fields/EntityFieldsData';
import { closeMenu } from 'src/containers/AppBase';
import { joinQueries, multiQuery1 } from 'src/actions/http/jsforceCore';
import { isAndroid } from 'src/utils/cordova-utils';

interface IServiceOrdersReportDispatchProps {
    queryServiceOrdersReport: typeof queryServiceOrdersReport;
    selectServiceOrdersReportTab: typeof selectServiceOrdersReportTab;
    selectServiceOrderWorkcenters: typeof selectServiceOrderWorkcenters;
    selectServiceOrderTypes: typeof selectServiceOrderTypes;
    queryAndShowDetailsDialogGeneric: typeof queryAndShowDetailsDialogGeneric;
    closeMenu: typeof closeMenu;
}

interface IServiceOrdersReportProps {
    months: string[];
    histogram: string[][][];
    allWorkcenters: string[];
    maxValue: number;
    keys: string[];
    locale: string;
}

const ALL_BUT_Y03 = 'all-but-Y03';
const allButY03Filters = (Object.keys(MaintenanceActivityTypeFilter) as MaintenanceActivityTypeFilter[]).filter(t => t !== MaintenanceActivityTypeFilter.Y03);

class ServiceOrdersClass extends React.Component<IServiceOrdersReport & IServiceOrdersReportProps & { groupedOrdersByType: _.Dictionary<WorkOrderServiceOrderReport[]> } & IServiceOrdersReportDispatchProps, object> {
    
    public render() {
        //const width = this.props.months / 
        const currentMonth = formatMonth(moment(), this.props.locale);
        /*
        return <div className="card card--std full-height">
            <div className='card__content padding-vertical--large padding-bottom--std full-height container--vertical'>
          */      
        return <PanelPage>
                <div className="row">
                    <div className='col-xs-12'>
                        <div className="btn-group padding-horizontal--std" >
                            {[ServiceOrderReportTab.Type, ServiceOrderReportTab.Workcenter].map(tab => 
                                <button type="button" onClick={ev => this.setTab(tab)} className={cx("btn btn-default", { "btn-primary" : this.props.currentTab == tab })}>
                                    {translate(`service-orders-report.group-by.${ tab }`)}
                                </button>
                            )}
                        </div>

                    </div>
                </div>
                <div className="row">
                    <div className='col-xs-6 col-sm-3'>
                        <SelectField
                            options={this.props.allWorkcenters}
                            multi={true} clearable={true}
                            value={this.props.workcenters}
                            className='separated--bottom-dark'
                            isLoading={this.props.actionStatus == ActionStatus.START}
                            
                            optionsMapper={wc => ({ label: wc, value: wc } as Option)}
                            onChange={value => this.setWorkcenters(value)}
                            placeholder={translate('service-orders-report.workcenters.placeholder')} />
                    </div>
                    <div className='col-xs-6 col-sm-3'>
                        <WorkOrderTypeSelectField serviceOrderTypes={this.props.serviceOrderTypes} setServiceOrderTypes={this.setServiceOrderTypes} />
                    </div>
                </div>
                
                <div className='margin-top--large flex--1 relative'>
                    <div className='cover-all scrollable'>
                        <CoveringSpinner isSmall  actionStatus={this.props.actionStatus} />
                        <Table
                            colgroup={
                                <colgroup>
                                    <col/>{ this.props.months.map((m, index) => 
                                        <col className={ cx({ 
                                            'data-table-highlighted' : currentMonth === m,
                                            'data-table-border-right': index == 0 || index == 10
                                        })} />) 
                                    }<col/>
                                </colgroup>
                            } 

                            thPrefix="service-orders-report" 
                            ths={[
                                { label: this.props.currentTab == ServiceOrderReportTab.Type ? 'type' : 'workcenters' },
                                ...this.props.months.map(m => ({ label: m, dontTranslate: true })),
                                { label: 'total' },
                            ]}

                            rows={this.props.histogram}
                            row={(idss: string[][], index) => [
                                <td>{this.props.keys[index] && this.props.keys[index] != 'null' ? this.props.keys[index] : ''}</td>, 
                                ...idss.map(ids => {
                                    const clickable = ids.length > 0;
                                    return <td onClick={clickable ? () => this.queryAndShowWorkorders(ids) : () => {}}
                                        style={this.computeCellStyling(ids.length, this.props.maxValue)}>{ids.length > 0 && ids.length}</td>
                                }),
                                <td>{this.props.groupedOrdersByType[this.props.keys[index]].length}</td>
                            ]} 
                        />
                    </div>
                </div>
            </PanelPage>;
    }
    
    private computeCellStyling = (value: number, maxValue: number): React.CSSProperties => {
        if(!_.isNumber(value) || value == 0) return null;
        //header color hsl(203, 98%, 41%);
        //min l 41, max l 100
        const valuePercentage = 1 - (value == 0 ? 0 : value / maxValue);
        const luminosity = (valuePercentage * (maxL - minL)) + minL;
        return ({ color: "white", backgroundColor: "hsl(203, 98%, " + luminosity + "%)", textAlign: "center", cursor: "pointer" });
    }
    
    private setTab = (tab: ServiceOrderReportTab | ServiceOrderReportTab[]) => {
        if(!(tab instanceof Array)) this.props.selectServiceOrdersReportTab(tab);
    }

    private setServiceOrderTypes = (type: string | string[]) => {
        if(!(type instanceof Array)) this.props.selectServiceOrderTypes([type]);
        else this.props.selectServiceOrderTypes(type);
    }

    
    private setWorkcenters = (type: string | string[]) => {
        if(!(type instanceof Array)) this.props.selectServiceOrderWorkcenters([type]);
        else this.props.selectServiceOrderWorkcenters(type);
    }

    public componentDidMount() {
        if(isAndroid()) FirebasePlugin.setScreenName('Service Orders Report Screen');
        this.props.closeMenu();
        this.props.queryServiceOrdersReport();
    }

    private queryAndShowWorkorders = (ids: string[]) => {
        this.props.queryAndShowDetailsDialogGeneric(
            '', 
            state => {
                const IdsChunk = _.chunk(ids,200);
                return joinQueries(
                    ...IdsChunk.map(ids =>
                        multiQuery1(queryWorkOrders([conditions.WorkOrder.ids(ids)])
                        )))
                    .then(wos => queryWorkOrderContractLines(wos.queries.result[0]))
                    .then(wos =>  { 
                        return wos.map(wo => new Callout(wo, entityFieldsDataFromState(state))).sort(function(a,b){
                            var dateA=new Date(a.earliestStartDate);
                            var dateB=new Date(b.earliestStartDate);
                            return dateB.getTime()-dateA.getTime()
                            })
                    // const sorted = sortReport(wos.map(wo => new Callout(wo, entityFieldsDataFromState(state))))
                    }) 
                // return queryWorkOrders([conditions.WorkOrder.ids(ids)])
                // .then(wos => queryWorkOrderContractLines(wos))
                // .then(wos => wos.map(wo => new Callout(wo, entityFieldsDataFromState(state))))
            },
            items => openListOfEntitiesOrOpenItem(item => dispatch => dispatch(showModal(ModalType.CalloutDetailsModal, item)), items)
        )
    }
}

// function sortReport<T extends Callout>(items: T[]){
//     items.sort(function(a,b){
//         var dateA=new Date(a.earliestStartDate);
//         var dateB=new Date(b.earliestStartDate);
//         return dateB.getTime()-dateA.getTime()
//     })
// }

export class WorkOrderTypeSelectField extends React.Component<{ serviceOrderTypes: string[], setServiceOrderTypes: (types: string | string[]) => void }, object> {
    public render() {
        return <SelectField
            multi={true} clearable={true}
            options={[...Object.keys(MaintenanceActivityTypeFilter), ALL_BUT_Y03]} 
            value={this.props.serviceOrderTypes}
            className='separated--bottom-dark'
            optionsMapper={type => {
                var label = '';
                switch(type as MaintenanceActivityTypeReportFilter) {
                    case 'all-but-Y03':
                        label = maintenanceActivityTypeDescription(type);
                        break;
                    default:
                        label = maintenanceActivityTypeFilterLabel(type as MaintenanceActivityTypeFilter);
                        break;
                }
                return ({ label, value: type } as Option);
            }}
            onChange={value => this.props.setServiceOrderTypes(value)}
            placeholder={translate('service-orders-report.service-order-types.placeholder')} />
    }
}

const maxL = 90;
const minL = 41;

function formatMonth(m: moment.Moment, locale: string) {
    return formatDateMonthYear(m, locale);
}

function monthsBetweenDates(dateStart: moment.Moment, dateEnd: moment.Moment, locale: string) {
    var timeValues = [];
    const dateStartClone = moment(dateStart);
    while (dateEnd > dateStartClone || dateStartClone.format('M') === dateEnd.format('M')) {
        timeValues.push(formatMonth(dateStartClone, locale));
        dateStartClone.add(1, 'month');
    }
    return timeValues;
}

export function filterWithArray<T>(ts: T[], t: T) {
    return  (ts == null || ts.length <= 0 || ts.indexOf(t) > -1) && !(_.isUndefined(t)) ;
}

export type MaintenanceActivityTypeReportFilter = MaintenanceActivityTypeFilter | 'all-but-Y03';

export function serviceOrderTypesFromFilter(serviceOrderTypes: MaintenanceActivityTypeReportFilter[]): MaintenanceActivityTypeFilter[] {
    return _.flatMap(serviceOrderTypes, filter => filter === ALL_BUT_Y03 ? allButY03Filters : [filter]);
}

export const ServiceOrdersReport =  connect<IServiceOrdersReport, IServiceOrdersReportDispatchProps>(


    createSelector(
        (state: IGlobalState) => state.serviceOrdersReport,
        state => localeFromState(state),
        state => activeInFSMFromState(state),
        (serviceOrdersReport, locale, activeInFSM) => {
            const selectedServiceOrderTypes = serviceOrderTypesFromFilter(serviceOrdersReport.serviceOrderTypes);
            const filteredOrders = serviceOrdersReport.serviceOrders.filter(so => 
                filterWithArray(serviceOrdersReport.workcenters, so.workcenter) && 
                filterWithMaintenanceActivityTypeFilters(so, selectedServiceOrderTypes)
            );

            const groupedOrdersByType = _.groupBy(filteredOrders, so => serviceOrdersReport.currentTab == ServiceOrderReportTab.Type ? so.maintenanceActivityType : so.workcenter);
            
            const startDate24Months = serviceOrdersReport.startDate24Months;
            const startDate6Months = serviceOrdersReport.startDate6Months
            const between24and6MonthsAgo = [formatMonth(startDate24Months, locale), formatMonth(startDate6Months, locale)].join(' - ');
            const groupedOrders = _.mapValues(
                groupedOrdersByType,
                orders => _.groupBy(
                    orders, 
                    o => {
                        const woDate = moment(getServiceOrderEndDate(o));
                        return startDate24Months.diff(woDate) <= 0 && startDate6Months.diff(woDate) >= 0 ? between24and6MonthsAgo :  formatMonth(woDate, locale)
                    }
                )
            );
    
            const months = [between24and6MonthsAgo, ...monthsBetweenDates(serviceOrdersReport.startDate, serviceOrdersReport.endDate, locale)];

            const keys = Object.keys(groupedOrders);
            keys.sort();
            const histogram = keys.map(key => [...months.map(m => groupedOrders[key][m] && groupedOrders[key][m].map(o => o.id) || [])]);
    
            const allWorkcenters = _.uniq(serviceOrdersReport.serviceOrders.map(so => so.workcenter).filter(wc => wc != null));
            allWorkcenters.sort();            
            const maxValue = _.max(histogram.map(ns => _.max(ns.map(n => n.length))))
    
            return { ...serviceOrdersReport, groupedOrders, groupedOrdersByType, histogram, months, allWorkcenters, maxValue, keys, locale } 
        }
    ),

    {
        queryServiceOrdersReport,
        selectServiceOrderTypes,
        selectServiceOrderWorkcenters,
        selectServiceOrdersReportTab,
        queryAndShowDetailsDialogGeneric,
        closeMenu
    },
)(ServiceOrdersClass);
