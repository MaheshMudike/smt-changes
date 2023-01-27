import * as moment from 'moment';

import { default as translate } from './translate';

const defaultNumberFormatOptions = {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
};

export function joinOptionals(array: string[], connector = ' | ', ignoreEmptyValues = false) {
    array = ignoreEmptyValues ? array.filter(v => !!v) : array.map(v => v || '-');
    return array.length > 0 ? array.join(connector) : null;
}

export function formatLabel(...keys: string[]) {
    return keys.map(k => translate(k)).join(' | ');
}

export function formatNumber(n: number, locale: string, options: Intl.NumberFormatOptions = defaultNumberFormatOptions): string {
    return n == null ? null : n.toLocaleString(locale, options);
}

function isSensibleNumber(n: number) {
    return typeof n === 'number' && !isNaN(n) && isFinite(n);
}

export function formatLabelValue(translationKey: string, value: string) {
    return translate(translationKey) + ': ' + value;
}

export function formatCurrencyNoDecimals(amount: number, currency: string, locale: string) {
    return formatCurrency(amount, currency, locale, { maximumFractionDigits: 0, minimumFractionDigits: 0 });
}

export function formatCurrency(amount: number, currency: string, locale: string, numberFormatOptions = defaultNumberFormatOptions) {

    if (!isSensibleNumber(amount)) return null;

    if (!/[A-Z]{3}/.test(currency)) {
        return formatNumber(amount, locale, numberFormatOptions);
    }

    const formatOptions = {
        style: 'currency',
        currency,
        ...numberFormatOptions
    };
    const formatter = new Intl.NumberFormat(locale, formatOptions);
    return formatter.format(amount);
}

type MomentArg = Date | string | number | moment.Moment;
const formatUsingMoment = (format: string) => (dateOrNull: MomentArg, locale: string) => {
    if(dateOrNull == null) return '-';//null;
    return moment(dateOrNull).locale(locale).format(format);
}
    

export const formatDate = formatUsingMoment('L');
export const formatDateTime = formatUsingMoment('L LT');
export const formatDateMonthYear = formatUsingMoment('MMM YY');
export const formatDateMonth = formatUsingMoment('MMM');

const formatDateTimeUTC = (dateOrNull: MomentArg, locale: string) =>
    dateOrNull && moment(dateOrNull).locale(locale).utc().format('L LT [UTC]')

export const formatRichDateTime = formatUsingMoment('LT, dddd, L');
const formatTime = formatUsingMoment('LT');
const formatDayOfWeek = formatUsingMoment('dddd');

export function formatSameDayTimeRange(start: MomentArg, end: MomentArg, locale: string) {
    return `${ formatTime(start, locale) } - ${ formatTime(end, locale) }, ${ formatDayOfWeek(start, locale) }, ${ formatDate(start, locale) } `;
}

const CALENDAR_CONFIG = () => ({
    lastDay: `[${ translate('generic.calendar.yesterday') }]`,
    lastWeek: `[${ translate('generic.calendar.last') }] dddd`,
    nextDay: `[${ translate('generic.calendar.tomorrow') }]`,
    nextWeek: 'L',
    sameDay: `[${ translate('generic.calendar.today') }]`,
    sameElse: 'L',
});

export function userFriendlyDate(dateString: MomentArg, locale: string) {
    if(dateString == null) return null;
    return moment(dateString).locale(locale).calendar(null, CALENDAR_CONFIG());
}

const CALENDAR_CONFIG_DATETIME = () => ({
    lastDay: `[${ translate('generic.calendar.yesterday') }] HH:mm`,
    lastWeek: `[${ translate('generic.calendar.last') }] dddd HH:mm`,
    nextDay: `[${ translate('generic.calendar.tomorrow') }] HH:mm`,
    nextWeek: 'L HH:mm',
    sameDay: `[${ translate('generic.calendar.today') }] HH:mm`,
    sameElse: 'L HH:mm'
});

export function userFriendlyDateTime(dateString: MomentArg, locale: string) {
    if(dateString == null) return null;
    return moment(dateString).locale(locale).calendar(null, CALENDAR_CONFIG_DATETIME());
}

export function getDateGroup(dateString: string, locale: string) {
    if (dateString) {
        return userFriendlyDate(dateString, locale);
    }
    return translate('feed.group.without-date');
}
