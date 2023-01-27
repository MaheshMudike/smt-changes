import * as React from 'react';
import { connect } from 'react-redux';
import { SortOrder, UnitOfMeasure } from '../../reducers/TechnicianReportReducer';
import { IGlobalState, userIdFromState, activeInFSMFromState, serviceResourceEnabledFromState } from '../../models/globalState';
import { queryTechnicianReport, filterTechnicianReport, sortTechnicianReport } from '../../actions/integration/technicianReportActions';
import { wrapTds, EMPTY_COLUMN_LABEL, td } from '../table/TableCompact';
import translate from '../../utils/translate';
import * as _ from 'lodash';
import { formatLonLat, ILatLng } from '../../models/map/LonLat';
import { kmToMiles, round2Decimals } from '../map/OpenlayersMap';
import { TechnicianTechnicianReport } from '../../models/technicians/Technician';
import { coordinatesFromAsset, queryWorkOrderDetail } from '../../models/feed/Callout';
import PanelPage from '../../containers/pages/PanelPage';
import openLinkExternally from '../../utils/openLinkExternally';

import * as cx from 'classnames';
import { TableFixedHeader } from '../table/TableFixedHeader';
import { CoveringSpinner } from '../CoveringSpinner';
import { SkypeLink, SmsLink, TeamsLink } from 'src/containers/pages/EntityDetails';
import { distance } from 'src/services/map/joinSamePlaceMarkers';
import { EntityType } from 'src/constants/EntityType';
import { DetailsModalButtonListItem } from '../forms/DetailsModalButton';
import { ModalType } from 'src/constants/modalTypes';
import { FitterLocation } from 'src/models/api/mapApi';
import { IColumnHeaderAppearance, Table } from '../table/Table';
import { downloadAndShowTechnicianDetails } from 'src/actions/technicianActions';
import { entityFieldsDataFromState } from '../fields/EntityFieldsData';
import { closeMenu } from 'src/containers/AppBase';
import { isAndroid } from 'src/utils/cordova-utils';

const BING_MAPS = 'https://www.bing.com/maps';

class TechnicianReportClass extends React.Component<ReturnType<typeof TechnicianReportStateProps> & typeof TechnicianReportDispatchProps & { userId: string }, object> {
    
    public render() {
        const { sortBy, sortOrder, userId, unitOfMeasure, fitterLocation, gpsPermissionSet, activeInFSM, serviceResourceEnabled } = this.props;
        const sortState = { sortBy, sortOrder };
        const uom = unitOfMeasure == UnitOfMeasure.Metric;
        const notAvailable = translate(EMPTY_COLUMN_LABEL);
        const fitterLocationType = gpsPermissionSet && fitterLocation || FitterLocation.OFF;
        const fitterLocationTypeGPS = fitterLocationType === FitterLocation.GPS;

        let headers = [] as IColumnHeaderAppearance[];
        if(fitterLocationTypeGPS) {
            headers = [
                { width: 2, label: 'technicianPosition' },
                { width: 2, label: 'equipmentPosition' },
                {
                    width: 2, label: 'difference', className: 'data-table-cell--number', 
                    sortBy: 'distanceToEquipmentKM', 
                    onClick: () => this.props.sortTechnicianReport('distanceToEquipmentKM') 
                }
            ];
        } else if(fitterLocationType === FitterLocation.SO) {
            headers = [
                { width: 2, label: 'serviceAppointmentPosition' }
            ];
        }
        return <PanelPage>
                {/*
                <div className='blue-header blue-header--small padding-horizontal--std'>
                    {translate('technician-report.technicians')}
                </div>
                */}
                <div className="row padding-horizontal--std">
                    {/*<div className='col-xs-2'>
                        <div className="btn-group">
                            {[UnitOfLength.km, UnitOfLength.mile].map(tab => 
                                <button type="button" onClick={ev => this.props.setUnitOfMeasure(tab)} 
                                    className={cx("btn btn-default", { "btn-primary" : this.props.unitOfMeasure == tab })}>
                                    {translate(`units.${ tab }`)}
                                </button>
                            )}
                        </div>
                    </div>*/}
                    { fitterLocationTypeGPS &&
                        <div className='col-xs-3'>
                            <h2>
                                <div className='checkbox checkbox--left font-size--s padding-horizontal--small'>
                                    <input type="checkbox" id="filter" checked={this.props.filterTechnicianWithDifferences} onChange={event => this.props.filterTechnicianReport(event.target.checked)} />
                                    <label htmlFor="filter" className='padding-small--left'>{translate('technician-report.filter.distant-technicians')}</label>
                                </div>
                            </h2>
                        </div>
                    }
                   
                    {/*
                    <div className='col-xs-2'>
                        <SelectField
                            options={[UnitOfMeasure.km, UnitOfMeasure.mile]}
                            value={this.props.unitOfMeasure}
                            className='separated--bottom-dark'
                            isLoading={false}
                            optionsMapper={unitOfMeasure => ({ label: translate(`units.${ unitOfMeasure }`), value: unitOfMeasure } as Option)}
                            onChange={value => this.props.setUnitOfMeasure(value)}
                        />
                    </div>
                    */}
                </div>
                
                <div className='margin-top--large flex--1 relative scrollable'>
                    <CoveringSpinner isSmall actionStatus={this.props.actionStatus} />
                    <Table thPrefix="technician-report.table" sortState={sortState} ths={[
                        { width: 2, label: 'firstName', sortBy: 'firstName', onClick: () => this.props.sortTechnicianReport('firstName') },
                        { width: 2, label: 'lastName', sortBy: 'lastName', onClick: () => this.props.sortTechnicianReport('lastName') },
                        
                        { width: 1, label: 'employeeNumber' },
                        { width: 2, label: 'workcenterNumber', hide: !activeInFSM },
                        { width: 2, label: 'email' },
                        
                        { width: 2, label: 'phone' },
                        { width: 1, label: '' },
                        { width: 1, label: '' },

                        { width: 2, label: 'serviceOrder' },
                        { width: 2, label: 'status', sortBy: 'status', hide: !activeInFSM,
                            onClick: () => this.props.sortTechnicianReport('status') 
                        },
                        ...headers
                    ]} rows={this.props.technicians} row={(t, index, props) => {
                        //const callout = t.currentTimeSheetServiceOrder && new Callout(t.currentTimeSheetServiceOrder);
                        const workOrder = t.serviceAppointWorkOrder;
                        const technicianPosition = t.position;
                        const equipmentPosition = technicianServiceAppointmentWorkOrderPosition(t);

                        let positionFields = [] as JSX.Element[];
                        if(fitterLocationType === FitterLocation.GPS) {
                            positionFields = [
                                this.positionLink(technicianPosition, technicianPosition, equipmentPosition), 
                                this.positionLink(equipmentPosition, technicianPosition, equipmentPosition),
                                this.positionRoute(this.distanceToEquipment(technicianPosition, equipmentPosition, uom), technicianPosition, equipmentPosition)
                            ];
                        } else if(fitterLocationType === FitterLocation.SO) {
                            positionFields = [
                                this.positionMarker(equipmentPosition)
                            ]
                        }

                        return [
                            td(t.firstName, props.ths, 0, '', fitterLocationTypeGPS && technicianDistanceTooLong(t) ? 'data-table-cell--high-priority clickable' : 'clickable',
                                () => this.props.downloadAndShowTechnicianDetails([t.id])), 

                            ...wrapTds([
                                t.lastName,
                                t.fitterNumber,
                                t.workCenterNumbers,
                                t.email == null ? null : this.emailLink(t.email),
                                t.email == null ? null : this.telephoneLink(t.phone), 
                                // <SkypeLink phone={t.phone} size="2x" color={"#0280d0"} />, 
                                <TeamsLink email={t.email} />,
                                <SmsLink phone={t.phone} size="2x" color={"#0280d0"} />,
                                //callout && <CalloutButton className="clickable" callout={callout}>{callout.title}</CalloutButton>,
                                workOrder && <DetailsModalButtonListItem item={ {
                                    entityType: EntityType.Callout,
                                    title: workOrder.WorkOrderNumber,
                                    modalType: ModalType.CalloutDetailsModal,
                                    queryDetails: () => queryWorkOrderDetail(workOrder.Id, this.props.entityFieldsData)
                                } }>{workOrder.Service_Order_Number__c}</DetailsModalButtonListItem>,
                                translate('technician-activity-status.' + t.status.toLowerCase()),
                                ...positionFields
                            ], props.ths.slice(1), notAvailable)
                        ]
                    }} />
                </div>
        </PanelPage>;
    }

    private telephoneLink(phone: string) {
        return <a href={"tel:" + phone}>{phone}</a>;
    }

    private emailLink(email: string) {
        if(email == null) return <React.Fragment />;
        const emailParts = email.split("@");
        const names = emailParts[0].split(".");
        return <a href={"mailto:" + email}>
                { names.map((name, index) => <span style={ { display: 'inline-block' } }>{ index == 0 ? '' : '.' }{ name }</span>) }
                { emailParts[1] && <span>{ '@' + emailParts[1] }</span> }
            </a>;
    }

    private positionLink = (lonLat: ILatLng, technicianPosition: ILatLng, equipmentPosition: ILatLng) => {
        if(lonLat == null) return null;

        return this.positionMarkers(formatLonLat(lonLat), technicianPosition, equipmentPosition);
    }

    private positionMarker = (lonLat: ILatLng) => {
        if(!lonLat)  return null;
        const spPosition = lonLat ? `point.${this.bingPosition(lonLat, '_')}_${translate('generic.entity-name.technician')}` : '';
        //const equipmentPositionUrl = equipmentPosition ? `point.${this.bingPosition(equipmentPosition, '_')}_${translate('generic.entity-name.equipment')}` : '';
        const url = `${BING_MAPS}?lvl=${16}&sp=${spPosition}`;
        return this.positionButton(formatLonLat(lonLat), url);
    }

    private positionMarkers = (label: string, technicianPosition: ILatLng, equipmentPosition: ILatLng) => {
        if(!equipmentPosition && !technicianPosition)  return null;
        const spPosition = technicianPosition ? `point.${this.bingPosition(technicianPosition, '_')}_${translate('generic.entity-name.technician')}` : '';
        const equipmentPositionUrl = equipmentPosition ? `point.${this.bingPosition(equipmentPosition, '_')}_${translate('generic.entity-name.equipment')}` : '';
        const url = `${BING_MAPS}?lvl=${16}&sp=${spPosition}~${equipmentPositionUrl}`;//&cp=${this.bingPosition(position, '~')};
        return this.positionButton(label, url);
    }

    private positionRoute = (label: string, technicianPosition: ILatLng, equipmentPosition: ILatLng) => {
        if(!equipmentPosition && !technicianPosition)  return null;
        const position = technicianPosition || equipmentPosition;
        const bingLabel = translate(technicianPosition ? 'generic.entity-name.technician' : 'generic.entity-name.equipment');        
        const url = technicianPosition && equipmentPosition ? 
            `${BING_MAPS}?rtp=pos.${this.bingPosition(technicianPosition, '_')}~pos.${this.bingPosition(equipmentPosition,'_')}` :
            `${BING_MAPS}?lvl=${16}&sp=point.${this.bingPosition(position, '_')}_${bingLabel}`;
        return this.positionButton(label, url);
    }

    private positionButton = (label: string, url: string) => {        
        return <button type='button' className='button--flat' onClick={() => this.props.openLinkExternally(url)} >{label}</button>
    }

    private bingPosition = (lonLat: ILatLng, separator: string) => {
        return `${lonLat.lat}${separator}${lonLat.lng}`;
    }

    private distanceToEquipment(technicianPosition: ILatLng, equipmentPosition: ILatLng, km: boolean) {
        if(technicianPosition == null || equipmentPosition == null) return null;
        const distanceKm = distanceToEquipmentKM(technicianPosition, equipmentPosition);
        //const units = metric ? translate('generic.units.km') : translate('generic.units.mi');
        return km ? round2Decimals(distanceKm) + ' km' : round2Decimals(kmToMiles(distanceKm)) + ' mi';
    }
    

    public componentDidMount() {
        if(isAndroid()) FirebasePlugin.setScreenName('Technician Report Screen');
        this.props.closeMenu();
        this.props.queryTechnicianReport();
    }
    
}

function technicianServiceAppointmentWorkOrderPosition(t: TechnicianTechnicianReport) {
    //return t.currentTimeSheetServiceOrder && coordinatesFromAsset(t.currentTimeSheetServiceOrder.Asset, EntityType.Technician);
    return t.serviceAppointWorkOrder && coordinatesFromAsset(t.serviceAppointWorkOrder.Asset, EntityType.Technician);
}

function technicianDistanceTooLong(t: TechnicianTechnicianReport) {
    return distanceToEquipmentKM(t.position, technicianServiceAppointmentWorkOrderPosition(t)) > 3.21869;
}

function distanceToEquipmentKM(technicianPosition: ILatLng, equipmentPosition: ILatLng) {
    if(technicianPosition == null || equipmentPosition == null) return null;
    return distance(technicianPosition, equipmentPosition);
}

const TechnicianReportStateProps = (state: IGlobalState) => {
    const technicianReport = state.technicianReport;
    let technicians = _.orderBy(
        technicianReport.technicians,
        t => { return (t && t[technicianReport.sortBy] as string || '').toLowerCase() },
        [technicianReport.sortOrder == SortOrder.Ascending ? 'asc' : 'desc','asc']
    );
   technicians = technicianReport.filterTechnicianWithDifferences ? technicians.filter(t => technicianDistanceTooLong(t)) : technicians;
   return { 
        ...technicianReport, 
        technicians, 
        userId: userIdFromState(state),
        fitterLocation: state.configuration.fitterLocation,
        gpsPermissionSet: state.authentication.currentUser.gpsPermissionSet,
        entityFieldsData: entityFieldsDataFromState(state),
        unitOfMeasure: state.configuration.unitOfMeasure,
        activeInFSM: activeInFSMFromState(state),
        serviceResourceEnabled: serviceResourceEnabledFromState(state)
    }
}

const TechnicianReportDispatchProps = {
    queryTechnicianReport,
    filterTechnicianReport,
    sortTechnicianReport,
    openLinkExternally,
    downloadAndShowTechnicianDetails,
    closeMenu,
}

export const TechnicianReport =  connect(TechnicianReportStateProps, TechnicianReportDispatchProps)(TechnicianReportClass);
