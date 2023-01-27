import * as React from 'react';
import { connect } from 'react-redux';

import { goToPrevModal, showModal } from '../../actions/modalActions';
import { IGlobalState, fitterLocationEnabledType } from '../../models/globalState';

import { ModalType } from '../../constants/modalTypes';


import { FloatingActionButton } from '../layout/FloatingActionButton';
import { showPlanCustomerVisitModal, showPlanCustomerVisitOfflineModal, eventFormForEvent, initializePlanCustomerVisit } from '../../actions/planCustomerVisitActions';
import { SvgIcon } from '../../constants/SvgIcon';
import Contact from '../../models/accounts/Contact';
import { IconsBar } from '../layout/IconsBar';
import { closeCallout } from '../../actions/integration/calloutActions';
import { CalloutTaskStatus } from '../../models/feed/CalloutTaskStatus';
import Event from '../../models/events/Event';
import Callout from '../../models/feed/Callout';
import IEventSource from '../../models/events/IEventSource';
import { Locatable, LocatableIdentifiable, LocatableMapMarker } from '../../models/map/Locatable';
import { showOnMap, bingRoute, googleMapsRoute } from '../../actions/mapActions';
import openLinkExternally from '../../utils/openLinkExternally';
import { ILatLng, validCoordinates } from '../../models/map/LonLat';
import { centerOnSearchMapAndShow } from '../../actions/searchMapActions';
import { faMapMarkedAlt, faRoute } from '@fortawesome/free-solid-svg-icons';
import { EntityType } from 'src/constants/EntityType';
import { IAuthenticationState } from 'src/reducers/AuthenticationReducer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faClipboard, faPen } from '@fortawesome/free-solid-svg-icons';
import { SMTNotesIcon } from '../overview/WorkorderNoteIcon';
import { config } from 'src/config/config';
import translate from 'src/utils/translate';
import { FitterLocation } from 'src/models/api/mapApi';

/*
function positionButton(url: string, icon: SvgIcon) {
    return <IconButton icon={icon} onClick={() => this.props.openLinkExternally(url)} />;
    //return <button type='button' className='button--flat' onClick={() => this.props.openLinkExternally(url)} >{label}</button>
}
*/

class LocationBarClass extends React.Component<typeof locationBarDispatchProps & 
    ReturnType<typeof locationBarStateProps> & { locatable: LocatableMapMarker, showOnSearchMap: boolean }, object> {

    public render() {
        const props = this.props;
        const locatable = props.locatable;
        const coordinates = props.locatable.entityType == EntityType.Technician ? props.fitterLocation == FitterLocation.SO ? 
            locatable != undefined &&
            locatable.assetCoordinates : locatable && locatable.coordinates : locatable && locatable.coordinates ;
        const disabled = !validCoordinates(coordinates);
        const fitterLocationEnabled = fitterLocationEnabledType(props.fitterLocation, props.gpsPermissionSet);
        return props.locatable.entityType == EntityType.Technician && !fitterLocationEnabled ? 
            null : 
            <IconsBar buttons={[
                { 
                    faIcon: faMapMarkedAlt, 
                    onClick: () => { 
                        props.showOnSearchMap ? props.centerOnSearchMapAndShow() : props.showOnMap(locatable); 
                    }, 
                    disabled 
                },
                //{ icon: SvgIcon.Route, onClick: () => { openLinkExternally(bingRoute(locatable.coordinates)); }, disabled },
                { faIcon: faRoute, onClick: () => { openLinkExternally(googleMapsRoute(coordinates)); }, disabled }
            ]}/>;
    }
}

const locationBarStateProps = 
    (state: IGlobalState) => (
        { 
            fitterLocation: state.configuration.fitterLocation, 
            gpsPermissionSet: state.authentication.currentUser.gpsPermissionSet
        }
    )
const locationBarDispatchProps = { centerOnSearchMapAndShow, showOnMap }

export const LocationBar = connect(locationBarStateProps, locationBarDispatchProps)(LocationBarClass)

class ShowCustomerVisitFloatingButtonClass extends React.Component<{ online?: boolean, eventSource: IEventSource, 
    showPlanCustomerVisitModal: typeof showPlanCustomerVisitModal, showPlanCustomerVisitOfflineModal: typeof showPlanCustomerVisitOfflineModal }> {
    public render() {
        const { online = true } = this.props;
        return <FloatingActionButton className='dialog-header__primary-action fab-button--crossing-line'
            onClick={() => online ? 
                this.props.showPlanCustomerVisitModal(this.props.eventSource, null) : 
                this.props.showPlanCustomerVisitOfflineModal(this.props.eventSource, null)}
            svg={SvgIcon.AddEventBar}
        />;
    }
}

export const ShowCustomerVisitFloatingButton = connect(null, { showPlanCustomerVisitModal, showPlanCustomerVisitOfflineModal })(ShowCustomerVisitFloatingButtonClass);

class ContactActionsBarClass extends React.Component<{ modalType: ModalType, showModal: typeof showModal, contact: Contact }, object> {
    public render() {
        const props = this.props;
        return <IconsBar buttons={[{ icon: SvgIcon.EditWhite, onClick: () => props.showModal(props.modalType, props.contact) }]} />;
    }
}

export const ContactActionsBar = connect(
    null,
    {
        showModal
    }
)(ContactActionsBarClass)


class CalloutActionsBarClass extends React.Component<{ goToPrevModal: typeof goToPrevModal, closeCallout: typeof closeCallout, callout: Callout }, object> {
    public render() {
        const props = this.props;
        const callout = props.callout;
        const emailAddresses = callout.assignedResources == null ? [] : callout.assignedResources.map(r => r.Email).filter(email => email != null);
        return <IconsBar buttons={[
                    callout.calloutTaskStatus === CalloutTaskStatus.Closable && { icon: SvgIcon.CheckmarkBar, onClick: () => { props.goToPrevModal(); props.closeCallout(callout.id); } },
                ]}
                elements={[
                    <a className="icon-button" href={ this.href(callout, emailAddresses) }><FontAwesomeIcon icon={faEnvelope}/></a>,
                    /*
                    emailAddresses.length > 0 ? 
                        <a className="icon-button" href={ this.href(callout, emailAddresses) }><FontAwesomeIcon icon={faEnvelope}/></a> : 
                        <div className="icon-button"><FontAwesomeIcon icon={faEnvelope} className="icon-button--disabled"/></div>,
                    */
                    <SMTNotesIcon className='icon-button' item={callout} workOrderId={callout.id} icon={faClipboard}/>
                ].filter(e => e != null)}
            />;
            //: null;
    }

    //https://kone--full.cs129.my.salesforce.com/0WO3O000000JegGWAS
    //https://kone.my.salesforce.com/0WO1r00000AI3v3GAD
    
    private href = (callout: Callout, emailAddresses: string[]) => {
        // return `mailto:${emailAddresses.join(',')}?subject=${ callout.title }&body=${ '<a href="' + callout.id + '">' + callout.title + '</a>' }`
        return `mailto:${emailAddresses.join(',')}?subject=${ callout.title }&body=${  translate('generic.button.salesforce') + ' - ' + encodeURIComponent(config.salesforce.loginUrl+callout.id) }`
    }
}

export const CalloutActionsBar = connect(
    null,
    {
        goToPrevModal,
        closeCallout
    }
)(CalloutActionsBarClass)

class EventActionsBarClass extends React.Component<{ 
    showModal: typeof showModal, initializePlanCustomerVisit: typeof initializePlanCustomerVisit, event: Event, authentication: IAuthenticationState,
    completeEventModal: ModalType, contactNoteModal: ModalType, contactPhotoModal: ModalType }, object> {
    
    public render() {
        const props = this.props;
        const event = props.event;
        const userId = props.authentication.currentUser.id

        const canMarkCompleted = !event.isCompleted && event.isOwnedBy(userId);
        const markAsCompletedActions = canMarkCompleted
            ? [{ icon: SvgIcon.CheckmarkBar, onClick: () => props.showModal(props.completeEventModal, event) }]
            : [];
    
        const contactButtons = event.primaryContact == null ? [] :[
            { icon: SvgIcon.AddNoteBar, onClick: () => props.showModal(props.contactNoteModal, { customer: event.primaryContact }) },
            { icon: SvgIcon.AddPhotoBar, onClick: () => props.showModal(props.contactPhotoModal, { customer: event.primaryContact }) }
        ];
    //getEventIconButtons(props.showModal, props.event, props.authentication.currentUser.id, props.completeEventModal, props.contactNoteModal, props.contactPhotoModal)
            
        const editButtons = [
            {
                faIcon: faPen,
                className: 'dialog-header__btn-fa',
                onClick: async () => {
                    props.initializePlanCustomerVisit(event, await eventFormForEvent(event));
                    props.showModal(ModalType.WriteEventModal) 
                }
            }
        ]
        return <IconsBar buttons={ [ ...editButtons, ...markAsCompletedActions, ...contactButtons] } />
    }
}

export const EventActionsBar = connect(
    (state: IGlobalState) => ({ authentication: state.authentication }),
    {
        showModal, initializePlanCustomerVisit
    }
)(EventActionsBarClass)

/*
export function getEventIconButtons(showModalFun: typeof showModal, event: IEvent, userId: string, completeEvent: ModalType, addNote: ModalType, addPhoto: ModalType) {    
    const canMarkCompleted = !event.isCompleted && event.isOwnedBy(userId);
    console.log("canMarkCompleted", canMarkCompleted, event.isCompleted, event.isOwnedBy(userId), userId);
    const markAsCompletedActions = canMarkCompleted
        ? [{ icon: SvgIcon.CheckmarkBar, onClick: () => showModalFun(completeEvent, event) }]
        : [];

    const contactButtons = event.primaryContact == null ? [] :
        [{ icon: SvgIcon.AddNoteBar, onClick: () => showModalFun(addNote, { customer: event.primaryContact }) },//showModalHandler(props, event, addNote)}, 
         { icon: SvgIcon.AddPhotoBar, onClick: () => showModalFun(addPhoto, { customer: event.primaryContact }) }]; //showModalHandler(props, event, addPhoto)}];

    return markAsCompletedActions.concat(contactButtons);    
}
*/
