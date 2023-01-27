import * as moment from 'moment';

import { ITimeSpan } from '../../models/events/calendarState';

const DAYS_IN_WEEK = 7;
const MONDAY = 1;

export function getWeekRange(pastWeeks: number = 0, futureWeeks: number = 0, date: moment.Moment = moment()) {    
    const start = withoutTime(date).day(MONDAY - pastWeeks * DAYS_IN_WEEK);
    const end = withoutTime(date).day(MONDAY + (futureWeeks + 1) * DAYS_IN_WEEK);
    return { end, start };
}

function withoutTime(date: moment.Moment) {
    return date.clone().startOf('day');
}

function getSixWeeksRange(date: moment.Moment) {
    // const start = date.clone().date(1).day(1); 
    // Bug in the moment.js lib for particular date.
    const start = date.clone().subtract(1,'weeks')
    const end = start.clone().add(7, 'weeks');
    return { end, start };
}

export function getMonthClosure(range: ITimeSpan) {
    const diff = range.end.diff(range.start, 'weeks');
    return diff < 6
        ? getSixWeeksRange(range.start)
        : range;
}
