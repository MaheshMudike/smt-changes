import * as React from 'react';
import { ViewInSalesForce } from '../../components/details/links/ViewInSalesForce';
import { renderFields } from '../../components/forms/renderFields';
import { OpenInKff } from '../../components/details/links/OpenInKff';
import auditFields from '../../components/fields/auditFields';
import { ShowCustomerVisitFloatingButton, LocationBar } from '../../components/icons/iconBars';
import { IdentifiableWithTitleEntity } from '../../models/feed/ISObject';
import IEventSource from 'src/models/events/IEventSource';
import { Locatable, LocatableMapMarker } from 'src/models/map/Locatable';
import { EquipmentDetailProps, DetailPropsContent, TechnicianDetailProps, CalloutDetailProps, ComplaintDetailProps, QueryDetailProps, TaskDetailProps, OpportunityDetailProps, EventDetailProps, AccountDetailProps, AccountDetailOfflineProps, TenderDetailProps, LeadDetailProps, DetailPropsFields, HelpdeskCaseDetailProps, RejectedWorkorderDetailProps, RejectedWorkorderNonFSMDetailProps, TransactionSurveyCaseDetailProps } from './EntityDetails';
import Audit, { AuditListItemBase } from 'src/models/audits/Audit';
import { EntityFieldsData } from 'src/components/fields/EntityFieldsData';
import { CalendarFabMenu } from '../../components/calendar/CalendarFabMenu';
import { EntityType } from 'src/constants/EntityType';


export enum DetailMode {
    OVERVIEW = 'OVERVIEW',
    DIALOG = 'DIALOG',
    SEARCH = 'SEARCH'
}

function isIEventSource(object: any): object is IEventSource {
    return object != null && 'whatForEvent' in object && object.whatForEvent !== undefined;
}

export function isLocatable(object: any): object is Locatable {
    return object != null && 'coordinates' in object;
}

export function isMapMarker(object: any): object is LocatableMapMarker {
    return object != null && 'coordinates' in object && 'marker' in object;
}

//TODO item should be IEventSource
export function eventSourceFloatingButton(item: any, online: boolean) {
    const entityType = item== null ? null : item.entityType as EntityType;
    if (entityType === EntityType.Callout || entityType === EntityType.Account || entityType === EntityType.Equipment) {
        return <CalendarFabMenu eventSource={item} isDropdown={true}/>
    } else if(isIEventSource(item)) {
        return <ShowCustomerVisitFloatingButton eventSource={item} online={online}/> 
    };
    return null;
}

export const EquipmentListDetail = salesForceListItemBuilderContent(EquipmentDetailProps);

export const TechnicianListDetail = salesForceListItemBuilderContent(TechnicianDetailProps);

export const CalloutListDetail = salesForceListItemBuilderContent(CalloutDetailProps);

export const RejectedWorkorderListDetail = salesForceListItemFields(RejectedWorkorderDetailProps);

export const RejectedWorkorderNonFSMListDetail = salesForceListItemFields(RejectedWorkorderNonFSMDetailProps);

export const ComplaintListDetail = salesForceListItemFields(ComplaintDetailProps);

export const QueryListDetail = salesForceListItemFields(QueryDetailProps);

export const HelpdeskCaseListDetail = salesForceListItemFields(HelpdeskCaseDetailProps);

export const TransactionSurveyCaseListDetail = salesForceListItemFields(TransactionSurveyCaseDetailProps);

export const TaskListDetail = salesForceListItemFields(TaskDetailProps);

export const OpportunityListDetail = salesForceListItemBuilderContent(OpportunityDetailProps);

export const EventListDetail = salesForceListItemFields(EventDetailProps);

export const AccountListDetail = salesForceListItemBuilderContent(AccountDetailProps);

export const AccountListDetailOffline = salesForceListItemBuilderContent(AccountDetailOfflineProps);

export const TenderListDetail = salesForceListItemBuilderContent(TenderDetailProps);

export const LeadListDetail = salesForceListItemFields(LeadDetailProps);

export class AuditListDetail extends React.Component<{ item: AuditListItemBase, detailMode: DetailMode }, object> {
    public render() {
        const item = this.props.item;
        return (
            <ListDetail detailMode={this.props.detailMode} externalActionButtons={ item => [<OpenInKff id={item.id} />] } item={item}>
                <div className= 'padding-top--std padding-bottom--std'>{ renderFields(auditFields(this.props.item)) }</div>
            </ListDetail>
        );
    }
}

//export const AuditListDetail = salesForceListItemBuilder(AuditDetailProps);

//TODO combine this interface with the one in GlobalModal
export interface IListDetailProps<T extends IdentifiableWithTitleEntity> extends React.WithChildren {
    primaryAction?: JSX.Element;
    //itemFooter?: JSX.Element;
    externalActionButtons?: (item: T) => JSX.Element[];
    detailMode: DetailMode;
    item: T;
    //topBarActions?: JSX.Element | JSX.Element[];
    topBar?: (item: T) => JSX.Element;
    online?: boolean;
}

function salesForceListItemBuilderContent<TEntity extends IdentifiableWithTitleEntity>(props: DetailPropsContent<TEntity>) {
    return (tprops: IListDetailProps<TEntity>) =>
        <ListDetail { ...tprops } online={props.online} topBar={ props.topBar } 
            externalActionButtons={ item => [
                ...(props.externalActionButtons ? props.externalActionButtons(tprops.item) : []),
                <ViewInSalesForce id={item.id} />] 
            }
            item={tprops.item}
        >
            { props.content(tprops.item) }
        </ListDetail>
}

function salesForceListItemFields<TEntity extends IdentifiableWithTitleEntity>(props: DetailPropsFields<TEntity>) {
    return (tprops: IListDetailProps<TEntity> & { entityFieldsData: EntityFieldsData }) =>
    <ListDetail { ...tprops } online={props.online} topBar={ props.topBar } 
        externalActionButtons={ item => [
            ...(props.externalActionButtons ? props.externalActionButtons(tprops.item) : []),
            <ViewInSalesForce id={item.id} />
        ]}
        item={tprops.item}
    >
        <div className= 'padding-top--std padding-bottom--std'>
        { 
            renderFields(props.fields(tprops.item, tprops.entityFieldsData))
        }
        </div>
    </ListDetail>
}

function ListDetail<T extends IdentifiableWithTitleEntity>(props: IListDetailProps<T>) {
    const item = props.item;
    return (
        <TopBarContainer {...props}>
                <div className='list-detail flex-grow--1 relative'>
                    {props.children}
                </div>
                {props.externalActionButtons ?
                    <div className='list-detail-footer container--horizontal container--inversed separated--top-light'>
                        {props.externalActionButtons(item)}
                    </div>
                    : null
                }
        </TopBarContainer>
    );
};

export function TopBarContainer<T extends IdentifiableWithTitleEntity>(props: IListDetailProps<T>) {
    const item = props.item;
    return (
        <div className='split-panel__container-full full-height col-xs-6 col-sm-7 col-lg-8 no-padding'>
            <div className='full-height container--horizontal container--inversed relative list-detail-topbar'>
                {item && item.title && <h4 className='topbar__title' style={ {color: "#fff", fontFamily: 'OpenSans-Bold', flex: 1 } }>{ item.title }</h4>}
                {props.topBar && props.topBar(item)}
                {isMapMarker(item) ? <LocationBar showOnSearchMap={props.detailMode === DetailMode.SEARCH} locatable={item} /> : null}
                {item && props.primaryAction ? props.primaryAction : eventSourceFloatingButton(item, props.online)}
            </div>
            {props.children}
        </div>
    );
}
