import * as moment from 'moment';

declare namespace FullCalendar {
    export interface Calendar {
        /**
         * Gets the version of Fullcalendar
         */
        version: string;
    }

    export interface BusinessHours {
        start: moment.Duration;
        end: moment.Duration;
        dow: Array<number>;
    }

    export interface Timespan {
        start: moment.Moment | string;
        end: moment.Moment | string;
    }

    export interface Header {
        left: string;
        center: string;
        right: string;
    }

    export interface Options<T> extends AgendaOptions, EventDraggingResizingOptions, DroppingExternalElementsOptions, SelectionOptions {
        // General display - http://fullcalendar.io/docs/display/

        header?: boolean | Header;
        theme?: boolean;
        locale?: string;
        buttonIcons?: {
            prev: string;
            next: string;
        }
        firstDay?: number;
        isRTL?: boolean;
        weekends?: boolean;
        hiddenDays?: number[];
        weekMode?: string;
        weekNumbers?: boolean;
        weekNumberCalculation?: any; // String/Function
        businessHours?: boolean | BusinessHours;
        height?: number;
        contentHeight?: number;
        aspectRatio?: number;
        handleWindowResize?: boolean;
        views?: ViewSpecificOptions<T>;
        viewRender?: (view: ViewObject, element: JQuery) => void;
        viewDestroy?: (view: ViewObject, element: JQuery) => void;
        dayRender?: (date: moment.Moment, cell: JQuery) => void;
        windowResize?: (view: ViewObject) => void;

        eventLimit?: boolean;
        defaultTimedEventDuration?: string;
        eventOrder?: (e1: EntityEventObject<T>, e2: EntityEventObject<T>) => number;
        nowIndicator?: boolean;
        displayEventEnd?: boolean;

        // Timezone
        timezone?: string | boolean;
        now?: moment.Moment | Date | string | (() => moment.Moment)

        // Views - http://fullcalendar.io/docs/views/

        defaultView?: string;

        // Current Date - http://fullcalendar.io/docs/current_date/

        defaultDate?: moment.Moment | Date | string;
        year?: number;
        month?: number;
        date?: number;

        // Text/Time Customization - http://fullcalendar.io/docs/text/

        timeFormat?: any; // String
        columnFormat?: any; // String
        titleFormat?: any; // String

        buttonText?: ButtonTextObject;
        monthNames?: Array<string>;
        monthNamesShort?: Array<string>;
        dayNames?: Array<string>;
        dayNamesShort?: Array<string>;
        weekNumberTitle?: string;

        // Clicking & Hovering - http://fullcalendar.io/docs/mouse/

        dayClick?: (date: moment.Moment, allDay: boolean, jsEvent: MouseEvent, view: ViewObject) => void;
        eventClick?: (event: EntityEventObject<T>, jsEvent?: MouseEvent, view?: ViewObject) => boolean | void;
        eventMouseover?: (event: EventObject, jsEvent: MouseEvent, view: ViewObject) => void;
        eventMouseout?: (event: EventObject, jsEvent: MouseEvent, view: ViewObject) => void;

        // Event Data - http://fullcalendar.io/docs/event_data/

        /**
         * This has one of the following types:
         *
         * - EventObject[]
         * - string (JSON feed)
         * - (start: moment.Moment, end: moment.Moment, timezone: string | boolean, callback: {(events: EventObject[]) => void;}) => void;
         */
        events?: any;

        /**
         * An array, each element being one of the following types:
         *
         * - EventSource
         * - EventObject[]
         * - string (JSON feed)
         * - (start: moment.Moment, end: moment.Moment, timezone: string | boolean, callback: {(events: EventObject[]) => void;}) => void;
         */
        eventSources?: any[];

        allDayDefault?: boolean;
        startParam?: string;
        endParam?: string
        lazyFetching?: boolean;
        eventDataTransform?: (eventData: any) => EventObject;
        loading?: (isLoading: boolean, view: ViewObject) => void;

        // Event Rendering - http://fullcalendar.io/docs/event_rendering/

        eventColor?: string;
        eventBackgroundColor?: string;
        eventBorderColor?: string;
        eventTextColor?: string;
        eventRender?: (event: EntityEventObject<T>, element: JQuery, view: ViewObject) => void;
        eventAfterRender?: (event: EventObject, element: HTMLDivElement, view: ViewObject) => void;
        eventAfterAllRender?: (view: ViewObject) => void;
        eventDestroy?: (event: EventObject, element: JQuery, view: ViewObject) => void;

        //scheduler options
        resourceAreaWidth?: number,
        schedulerLicenseKey?: string,
        customButtons?: any,
        resourceLabelText?: any,
        resourceColumns?: any,
        displayEventTime?: any,
    }

    /**
     * Agenda Options - http://fullcalendar.io/docs/agenda/
     */
    export interface AgendaOptions {
        allDaySlot?: boolean;
        allDayText?: string;
        slotDuration?: moment.Duration | string;
        slotLabelFormat?: string;
        slotLabelInterval?: moment.Duration;
        snapDuration?: moment.Duration;
        scrollTime?: moment.Duration | string;
        minTime?: moment.Duration; // Integer/String
        maxTime?: moment.Duration; // Integer/String
        slotEventOverlap?: boolean;
    }

    /*
    * Event Dragging & Resizing
    */
    export interface EventDraggingResizingOptions {
        editable?: boolean;
        eventStartEditable?: boolean;
        eventDurationEditable?: boolean;
        dragRevertDuration?: number; // integer, milliseconds
        dragOpacity?: number; // float
        dragScroll?: boolean;
        eventOverlap?: boolean | ((stillEvent: EventObject, movingEvent: EventObject) => boolean);
        eventConstraint?: BusinessHours | Timespan;
        eventDragStart?: (event: EventObject, jsEvent: MouseEvent, ui: any, view: ViewObject) => void;
        eventDragStop?: (event: EventObject, jsEvent: MouseEvent, ui: any, view: ViewObject) => void;
        eventDrop?: (event: EventObject, delta: moment.Duration, revertFunc: Function, jsEvent: Event, ui: any, view: ViewObject) => void;
        eventResizeStart?: (event: EventObject, jsEvent: MouseEvent, ui: any, view: ViewObject) => void;
        eventResizeStop?: (event: EventObject, jsEvent: MouseEvent, ui: any, view: ViewObject) => void;
        eventResize?: (event: EventObject, delta: moment.Duration, revertFunc: Function, jsEvent: Event, ui: any, view: ViewObject) => void;
    }
    /*
    * Selection - http://fullcalendar.io/docs/selection/
    */
    export interface SelectionOptions {
        selectable?: boolean;
        selectHelper?: boolean | ((start: moment.Moment, end: moment.Moment) => HTMLElement);
        unselectAuto?: boolean;
        unselectCancel?: string;
        selectOverlap?: boolean | ((event: EventObject) => boolean);
        selectConstraint?: Timespan | BusinessHours;
        select?: (start: moment.Moment, end: moment.Moment, jsEvent: MouseEvent, view: ViewObject, resource?: any) => void;
        unselect?: (view: ViewObject, jsEvent: Event) => void;
    }

    export interface DroppingExternalElementsOptions {
        droppable?: boolean;
        dropAccept?: string | ((draggable: any) => boolean);
        drop?: (date: moment.Moment, jsEvent: MouseEvent, ui: any) => void;
        eventReceive?: (event: EventObject) => void
    }

    export interface ButtonTextObject {
        prev?: string;
        next?: string;
        prevYear?: string;
        nextYear?: string;
        today?: string;
        month?: string;
        week?: string;
        day?: string;
    }

    export interface EntityEventObject<T> extends EventObject {
        eventEntity: T;
    }

    export interface EventObject extends Timespan {
        id?: string | number;
        title: string;
        allDay?: boolean;
        url?: string;
        className?: string | string[];
        editable?: boolean;
        source?: EventSource;
        color?: string;
        backgroundColor?: string;
        borderColor?: string;
        textColor?: string;
        rendering?: string;
    }

    export interface ViewObject {
        name: string;
        title: string;
        intervalStart: moment.Moment;
        intervalEnd: moment.Moment;
        start: moment.Moment;
        el: HTMLElement[];
        end: moment.Moment;
    }

    export interface EventSource extends JQueryAjaxSettings {
        /**
         * This has one of the following types:
         *
         * - EventObject[]
         * - string (JSON feed)
         * - (start: moment.Moment, end: moment.Moment, timezone: string | boolean, callback: {(events: EventObject[]) => void;}) => void;
         */
        events?: any;

        color?: string;
        backgroundColor?: string;
        borderColor?: string;
        textColor?: string;
        className?: any; // string/Array<string>
        editable?: boolean;
        allDayDefault?: boolean;
        ignoreTimezone?: boolean;
        eventTransform?: any;
        startParam?: string;
        endParam?: string
    }

	/*
    * View Specific Options - http://fullcalendar.io/docs/views/View-Specific-Options/
    */
    export interface ViewSpecificOptions<T> {
        basic?: Options<T>;
        agenda?: Options<T>;
        week?: Options<T>;
        day?: Options<T>;
        month?: Options<T>;
        basicWeek?: Options<T>;
        basicDay?: Options<T>;
        agendaWeek?: Options<T>;
        agendaDay?: Options<T>;
    }
}

interface JQuery {
    /**
     * Get/Set option value
     */
    fullCalendar(method: 'option', option: string, value?: any): void;

    /**
     * Immediately forces the calendar to render and/or readjusts its size.
     */
    fullCalendar(method: 'render'): void;

    /**
     * Restores the element to the state before FullCalendar was initialized.
     */
    fullCalendar(method: 'destroy'): void;

    /**
     * Returns the View Object for the current view.
     */
    fullCalendar(method: 'getView'): FullCalendar.ViewObject;

    /**
     * Immediately switches to a different view.
     */
    fullCalendar(method: 'changeView', viewName: string): void;

    /**
     * Moves the calendar one step back (either by a month, week, or day).
     */
    fullCalendar(method: 'prev'): void;

    /**
     * Moves the calendar one step forward (either by a month, week, or day).
     */
    fullCalendar(method: 'next'): void;

    /**
     * Moves the calendar back one year.
     */
    fullCalendar(method: 'prevYear'): void;

    /**
     * Moves the calendar forward one year.
     */
    fullCalendar(method: 'nextYear'): void;

    /**
     * Moves the calendar to the current date.
     */
    fullCalendar(method: 'today'): void;

    /**
     * Moves the calendar to an arbitrary year/month/date.
     */
    fullCalendar(method: 'gotoDate', year: number, month?: number, date?: number): void;

    /**
     * Moves the calendar to an arbitrary date.
     */
    fullCalendar(method: 'gotoDate', date: moment.Moment | Date | string): void;

    /**
     * Moves the calendar forward/backward an arbitrary amount of time.
     */
    fullCalendar(method: 'incrementDate', year: number, month?: number, date?: number): void;

    /**
     * Returns a Date object for the current date of the calendar.
     */
    fullCalendar(method: 'getDate'): moment.Moment;

    /**
     * A method for programmatically selecting a period of time.
     */
    fullCalendar(method: 'select', startDate: Date, endDate: Date, allDay: boolean): void;

    /**
     * A method for programmatically clearing the current selection.
     */
    fullCalendar(method: 'unselect'): void;

    /**
     * Reports changes to an event and renders them on the calendar.
     */
    fullCalendar(method: 'updateEvent', event: FullCalendar.EventObject): void;

    /**
     * Retrieves events that FullCalendar has in memory.
     */
    fullCalendar(method: 'clientEvents', idOrfilter?: any): Array<FullCalendar.EventObject>;

    /**
     * Retrieves events that FullCalendar has in memory.
     */
    fullCalendar(method: 'clientEvents', idOrfilter?: (e: FullCalendar.EventObject) => boolean): Array<FullCalendar.EventObject>;

    /**
     * Removes events from the calendar.
     */
    fullCalendar(method: 'removeEvents', idOrfilter?: any): void;

    /**
     * Removes events from the calendar.
     */
    fullCalendar(method: 'removeEvents', idOrfilter?: (e: FullCalendar.EventObject) => boolean): void;

    /**
     * Refetches events from all sources and rerenders them on the screen.
     */
    fullCalendar(method: 'refetchEvents'): void;

    /**
     * Dynamically adds an event source.
     */
    fullCalendar(method: 'addEventSource', source: any): void;

    /**
     * Dynamically removes an event source.
     */
    fullCalendar(method: 'removeEventSource', source: any): void;

    /**
     * Renders a new event on the calendar.
     */
    fullCalendar(method: 'renderEvent', event: FullCalendar.EventObject, stick?: boolean): void;

    /**
     * Rerenders all events on the calendar.
     */
    fullCalendar(method: 'rerenderEvents'): void;

    /**
     * Create calendar object
     */
    fullCalendar<T>(options: FullCalendar.Options<T>): JQuery;

    /**
     * Generic method function
     */
    fullCalendar(method: string, arg1: any, arg2: any, arg3: any): void;
}

interface JQueryStatic {
    fullCalendar: FullCalendar.Calendar;
}
