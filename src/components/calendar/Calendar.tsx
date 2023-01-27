import * as React from 'react';

import { changeCalendarRange } from '../../actions/integration/events/eventActions';
import { addEventFromDropedItem } from '../../actions/integration/feedActions';
import { showModal } from '../../actions/modalActions';
import { ModalType } from '../../constants/modalTypes';
import { IDragging } from '../../models/dragging';
import { ITimeSpan } from '../../models/events/calendarState';
import Event from '../../models/events/Event';
import { Moment } from 'moment';

import IPoint from '../../models/IPoint';
import { updateDroppablePlaceholder, IS_DROPPABLE_PLACEHOLDER_KEY, extractTimeForDroppedItemFromDroppablePlaceholder, destroyDroppablePlaceholder } from './droppablePlaceholder';
//this bundles fullcalendar in the webpack chunk
import 'fullcalendar';
import * as FullCalendar from 'fullcalendar';
import { OptionsInput, EventObjectInput } from "fullcalendar/src/types/input-types";
import View from 'fullcalendar/View';
import 'fullcalendar/dist/locale-all';

import { render as reactDomRender } from 'react-dom';

import * as moment from 'moment';
import { SvgIcon } from '../../constants/SvgIcon';
import { SmallIcon } from '../layout/Icon';
import { getLangWithoutLocale } from '../../utils/translate';
import { IDragAndDropState } from '../../reducers/dragAndDropReducer';
import { isRtlLanguage } from '../../actions/authenticationActions';
import { IAuthenticationState } from 'src/reducers/AuthenticationReducer';
import { EntityFieldsData } from '../fields/EntityFieldsData';
import { closeMenu } from 'src/containers/AppBase';
import { isAndroid } from 'src/utils/cordova-utils';

const viewNames = {
    DAY: 'agendaDay',
    MONTH: 'month',
    WEEK: 'agendaWeek',
};

export class Calendar extends React.Component<ICalendarProps & ICalendarDispatchProps, object> {
    public refs: {
        calendar: HTMLDivElement;
        [key: string]: HTMLDivElement;
    };
    private calendarElement: JQuery<HTMLElement> = null;//ICalendar = null;
 
    public render() {
        return (
            <div id='calendar' className='full-height calendar-wrapper'>
                <div ref='calendar'></div>
                { this.props.getContent == null ? null : this.props.getContent() }
            </div>
        );
    }

    public componentDidMount() {
        if(isAndroid()) FirebasePlugin.setScreenName('Plan Screen');
        this.props.closeMenu();
        this.calendarElement = buildCalendar(
            this.refs.calendar, 
            (start: Moment) => this.props.addEventFromDropedItem(start, this.props.dragAndDrop.dropData),
            (event: Event) => this.props.showModal(this.props.readEventModalType, event),
            (visibleRange: ITimeSpan) => this.props.changeCalendarRange(this.props.currentRange, visibleRange),
            this.props.authentication.currentUser.languageLocale, this.props.authentication.direction,
            this.props.entityFieldsData
        );
        refreshCalendar(this.calendarElement, this.props.events);
    }

    public componentWillReceiveProps(nextProps: ICalendarProps) {
        if (nextProps.events !== this.props.events) {
            refreshCalendar(this.calendarElement, nextProps.events);
        }
        if (this.props.dragAndDrop.dragging !== nextProps.dragAndDrop.dragging) {
            setTimeout(() => dragSth(nextProps.dragAndDrop.dragging));
        }

        if(this.props.authentication.direction != nextProps.authentication.direction) {
            this.calendarElement.fullCalendar('option', {
                isRTL: nextProps.authentication.direction === 'rtl'
            });
        }
    }

    public componentWillUnmount() {
        this.calendarElement.fullCalendar('destroy')
    }
    
}

export interface ICalendarProps {
    getContent:() => JSX.Element | undefined;
    events: Event[];
    dragAndDrop: IDragAndDropState;
    readEventModalType: ModalType;
    isOfflineMode: boolean;
    currentRange: ITimeSpan;
    authentication: IAuthenticationState,
    entityFieldsData: EntityFieldsData
}

export interface ICalendarDispatchProps {
    addEventFromDropedItem: typeof addEventFromDropedItem;
    changeCalendarRange: typeof changeCalendarRange;
    showModal: typeof showModal;
    closeMenu: typeof closeMenu;
}



let draggedState: {
    draggedElement: JQuery<Element>;
    offset: IPoint;
};

let dropAction: (param: number | Moment) => void;
let isWeekView = false;

function updateDroppablePlaceholderFromEvent(ev: JQuery.Event, isWeekView: boolean) {
    updateDroppablePlaceholder({ x: ev.pageX, y: ev.pageY }, isWeekView, ev.toElement);
}

function dragSth(dragging: IDragging) {
    
    if (dragging == null) {
        if (draggedState == null) return;
        
        const dateTimeOrTime = extractTimeForDroppedItemFromDroppablePlaceholder();
        if(dateTimeOrTime != null) dropAction(dateTimeOrTime);
        destroyDroppablePlaceholder();
        draggedState.draggedElement.remove();
        draggedState = null;
    } else if (draggedState == null) {
        const rect = dragging.element.getBoundingClientRect();
        const draggedElement = $(dragging.element).clone();
        const offset = {
            x: rect.left - dragging.dragStart.x,
            y: rect.top - dragging.dragStart.y,
        };
   
        const clientXY = dragging.clientXY;
        draggedElement.addClass('list-item--dragged').css('width', rect.width + 'px').css('opacity', 0.8)//.css('background-color', 'blue')
            .css('transform', `translate(${ rect.left }px, ${ rect.top }px)`);
        draggedElement.appendTo(document.body);
        draggedState = { draggedElement, offset };        
    } else {        
        const clientXY = dragging.clientXY;
        const { offset } = draggedState;        
        const transform = `translate(${ clientXY.x + offset.x }px, ${ clientXY.y + offset.y }px)`;
        draggedState.draggedElement.css('transform', transform);

        updateDroppablePlaceholder(clientXY, isWeekView);
    }
    
}

function buildCalendar(
    container: HTMLDivElement, 
    onDropItem: (m: moment.Moment) => void, 
    onEventClick: (ev: Event) => void, 
    onViewRangeChange: (ts: ITimeSpan) => void,
    language: string,
    direction: string,
    entityFieldsData: EntityFieldsData
) {
    const calendarOptions: OptionsInput = {
        allDaySlot: true,
        allDayText: 'All day',
        aspectRatio: 1,
        
        dayRender(date, cell) {
            if (calendar == null || calendar.fullCalendar('getView').name !== viewNames.MONTH) return;    
            $(cell).on('click', evt => {
                calendar.fullCalendar('gotoDate', $(evt.target).data('date'));
                calendar.fullCalendar('changeView', viewNames.DAY);
            });
        },        

        defaultView: viewNames.DAY,
        editable: false,
        eventClick: (e: EventObjectInput, ev, view) => {
            if (view.name !== viewNames.MONTH) {
                onEventClick(e.eventEntity);
            }
        },
        eventLimit: true,

        eventOrder: [(ev1: EventObjectInput, ev2: EventObjectInput) => {    
            const e1 = ev1.miscProps.eventEntity;
            const e2 = ev2.miscProps.eventEntity;
            const titleCmp = e1.title.localeCompare(e2.title);
            if (titleCmp !== 0) return titleCmp;
            else return (e1.startDateTime || '').localeCompare(e2.startDateTime || '');
        }],
        eventRender: (event: EventObjectInput, element: JQuery, view: View) => {
            const isCompleted = event.eventEntity.isCompleted;
            if (isCompleted) element.addClass('fc-event--completed');
        
            if (view.name === viewNames.DAY) {
                if (event.eventEntity.isCompleted) addIcon(element, SvgIcon.Completed);
                addIcon(element, SvgIcon.Salesforce);
                //TODO type of eventEntity is any
                const subTitle = event.eventEntity.body(entityFieldsData);
                if (subTitle) $(`<div class="fc-description"></div>`).text(subTitle).appendTo(element);
                element.find('.fc-title').insertBefore(element.find('.fc-time'));
            } else {        
                element.addClass('fc-event--week');
            }
        },
        firstDay: 1,
        header: {
            center: 'title',
            left: 'prev today next',
            right: `${ viewNames.DAY } ${ viewNames.WEEK } ${ viewNames.MONTH }`,
        },
        height: $('.calendar-wrapper').height(),
        isRTL: direction === 'rtl',
        locale: getLangWithoutLocale(language),
        nowIndicator: true,        
        scrollTime: moment.duration('08:00:00'),
        slotEventOverlap: false,
        timezone: 'local',
        viewRender: (view: View) => {            
            dropAction = notifyDropWithDateAndTime;
            isWeekView = view.name === viewNames.WEEK;    
            //$('.fc-time-grid-container', view)
            $('.fc-slats .fc-widget-content')
            .data(IS_DROPPABLE_PLACEHOLDER_KEY, true)
            .on('dragover', ev => {
                ev.preventDefault();
                updateDroppablePlaceholderFromEvent(ev, isWeekView);
            })
            .on('dragenter', ev => {
                updateDroppablePlaceholderFromEvent(ev, isWeekView)
            })
            .on('drop', ev => {
                const dateTimeOrTime = extractTimeForDroppedItemFromDroppablePlaceholder();
                if(dateTimeOrTime != null) dropAction(dateTimeOrTime);    
            })
            .on('dragleave drop', ev => destroyDroppablePlaceholder(ev.currentTarget));

            onViewRangeChange({
                end: toLocalTime(view.intervalEnd),
                start: toLocalTime(view.intervalStart),
            });
        },
        views: {
            [viewNames.DAY]: {
                displayEventEnd: true,
                slotDuration: '01:00:00',
                titleFormat: 'dddd - DD MMM Y',
            },
            [viewNames.WEEK]: {
                displayEventEnd: false,
                displayEventTime: false,
                slotDuration: '01:00:00',
            },
        },
    };
    
    function notifyDropWithDateAndTime(hourOrDateTime: number | moment.Moment) {
        const dateTime = typeof hourOrDateTime === 'number'
            ? moment($(container).fullCalendar('getDate')).startOf('day').hour(hourOrDateTime)
            : hourOrDateTime;
        onDropItem(dateTime);
    }

    const calendar = $(container).fullCalendar(calendarOptions);
    return calendar;    
}

function toLocalTime(date: moment.Moment) {
    return moment(date.format('YYYY-MM-DD'));
}

let eventSource: EventObjectInput[];
function refreshCalendar(calendar: JQuery<HTMLElement>, newEvents: Event[]) {
    if(eventSource != null) calendar.fullCalendar('removeEventSource', eventSource);
    eventSource = newEvents.map(e => ({
        end: e.endDateTime,
        eventEntity: e,
        start: e.startDateTime,
        title: e.title,
    }))
    calendar.fullCalendar('addEventSource', eventSource);
}

function addIcon(nodeElement: JQuery, icon: SvgIcon) {
    const iconContainer = document.createElement('span');
    reactDomRender(<SmallIcon svg={icon} className='fc-event-icon' />, iconContainer);
    nodeElement.find('.fc-content').prepend(iconContainer);
}
