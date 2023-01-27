import * as moment from 'moment';

export function parseDateToTimestamp(dateString: string): number {
    if(dateString == null) return null;

    const parsed = moment(dateString).valueOf();
    return isNaN(parsed) ? null : parsed;
}

export function parseDate(dateSting: string): Date {
    const timestamp = parseDateToTimestamp(dateSting);
    return timestamp ? new Date(timestamp) : null;
}
