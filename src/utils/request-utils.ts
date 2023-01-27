import * as _ from 'lodash';

export interface IHttpResponse {
    status: number;
    data?: any;
}

/**
 * Create url with query params
 * @example
 *
 *   const url = 'http://budmore.pl';
 *   const params = {
 *       data: 'foo',
 *       id: 'boo'
 *   };
 *
 *   urlWithParams(url, params); // http://budmore.pl?data=foo&id=boo
 *
 * @param  {string} url
 * @param  {Object} params
 * @return {string}
 */
/*
function urlWithParams(url: string, params: _.Dictionary<string>) {
    const query = encodeForm(params);
    return `${ url }${ query ? '?' + query : '' }`;
}


function encodeForm(form: _.Dictionary<string>) {
    return _.map(form, (value, key) => value == null ? null : `${ encodeURIComponent(key) }=${ encodeURIComponent(value) }`)
        .filter(str => str != null)
        .join('&');
}
*/

/**
 * Create object using the query params
 *
 * @param  {string} params contain only query params "document.location.search.substring(1)"
 * @return {object}
 */
export function getDataFromQueryParams(params: string) {
    const result: { [index: string]: string } = {};

    params.split('&').map((param) => {
        const data = param.split('=');
        return result[data[0]] = decodeURIComponent(data[1]);
    });

    return result;
}

export function isAuthenticationError(error: IHttpResponse) {
    return hasStatusOneOf(error, 401, 403)
        || hasStatusOneOf(error, 400) && error.data && error.data.error === 'invalid_grant'
        || false;
}

export function hasStatusOneOf(error: IHttpResponse, ...statuses: number[]) {
    return error ? _.includes(statuses, error.status) : false;
}
