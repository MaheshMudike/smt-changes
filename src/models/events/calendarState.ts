import { ISelectableItemsState } from '../IItemsState';
import Event from './../events/Event';
import { Moment } from 'moment';

export interface ICalendarState {
    addButtonsExpanded: boolean;
    currentRange: ITimeSpan;
    events: ISelectableItemsState<Event>;
}

export interface ITimeSpan {
    end: Moment;
    start: Moment;
}
