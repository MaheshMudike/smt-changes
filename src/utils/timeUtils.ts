import { ITimeSpan } from '../models/events/calendarState';
import { Moment } from 'moment';

export function isInRange(time: Moment, range: ITimeSpan) {
    return range && time.isSameOrAfter(range.start) && time.isSameOrBefore(range.end);
}
