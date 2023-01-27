import { Connection, Query, SfDate } from 'jsforce';
import * as jsforce from 'jsforce';
import { ICredentials } from 'src/models/api/salesforce/ICredentials';
import * as moment from 'moment';
import { SalesforceId } from 'jsforce/salesforce-id';
import { SuccessResult, ErrorResult, RecordResult } from 'jsforce/record-result';
import { ICondition, SObject } from './jsforceMappings';
import { config } from '../../config/config';
import credentials from '../../services/credentials';
import { ISObject } from '../../models/api/coreApi';
import * as _ from 'lodash';

export var connection: Connection = null;
const salesforce = config.salesforce;

export function initConnection(c: ICredentials) {
    connection = new Connection({
        oauth2: {
            loginUrl : c.instance_url,
            clientId: salesforce.remoteAccessConsumerKey,
            // clientSecret: salesforce.clientIdSecret,
            redirectUri: salesforce.oauthRedirectURI
        },

        loginUrl : c.instance_url,
        instanceUrl : c.instance_url,
        accessToken : c.access_token,
        refreshToken: c.refresh_token,

        //logLevel: 'DEBUG',
        version: '41.0'
    });

    connection.on("refresh", (accessToken: any, res: any) => {
        credentials.setValue({ ...c, access_token: accessToken });
    });

    return connection;
}


export function refreshOauthTokenPromise(refreshToken: string) {
    return new Promise<string>((resolve, reject) =>
        (connection as any).oauth2.refreshToken(refreshToken, (err: any, newToken: string) => {
            if (err) return reject(err);
            resolve(newToken);
        })
    );
}

export function restGet<T>(url: string) {
    return (connection as any).apex.get(url) as Promise<T>;
}

//this doesnt use any base url
export function requestGet<T>(url: string) {
    return (connection as any).requestGet(url) as Promise<T>;
}

export function request<T>(url: string, responseType: string) {
    return (connection as any).request({
        method: "GET",
        url: url,
        responseType,
        //headers can be added like this
        //headers: { test: "test" }
    }) as Promise<T>;
}

export function restPost<T>(url: string, body: any) {
    return (connection as any).apex.post(url, body) as Promise<T>;
}

function idOptions(id: string) {
    return { Id: { $eq: id } };
}

export function momentToSfDate(moment: moment.Moment) {
    return SfDate.toDateLiteral(moment.toDate());
}

export function momentToSfDateTime(moment: moment.Moment) {
    return SfDate.toDateTimeLiteral(moment.toISOString());
}

export function momentToSfDateTimeString(moment: moment.Moment) {
    return (SfDate.toDateTimeLiteral(moment.toISOString()) as any)._literal;
}

export interface StatusWrapper<T> {
    result: T;
    status: boolean;
    message: string;
}

interface ResultWrapper<TDml> {
    message: string;
    queries: StatusWrapper<TDml[][]>;
    countQueries: StatusWrapper<number[]>;
    soslQueries: StatusWrapper<TDml[][][]>;
    inserts: StatusWrapper<TDml[]>;
    updated: StatusWrapper<TDml[]>;
    deletes: StatusWrapper<TDml[]>;
    status: boolean;
}

interface ResultWrapperBase {
    message: string;
    status: boolean;
}

interface ResultWrapper2<T, U> extends ResultWrapperBase{ queries: StatusWrapper<[T, U]>; }
interface ResultWrapper3<T, U, V> extends ResultWrapperBase{ queries: StatusWrapper<[T, U, V]>; }
interface ResultWrapper4<T, U, V, W> extends ResultWrapperBase{ queries: StatusWrapper<[T, U, V, W]>; }

export function multiQuery<T = any>(...queries: Query<any>[]) {
    const callback = (error:Error, soql: string) => {};
    return Promise.all(queries.map(q => q.toSOQL(callback))).then(
        queries => {
            return restPost<ResultWrapper<T>>("/services/apexrest/smtapp/multiservice", { queries })
        }
    );
}

export function multiSOSL<T= ISObject>(...soslQueries: string[]) {
    return restPost<ResultWrapper<T>>("/services/apexrest/smtapp/multiservice", { soslQueries })
}

export function retrieveSOSLResult<T>(results: ResultWrapper<T>): T[] {
    if(results.soslQueries == null || results.soslQueries.result == null || results.soslQueries.result[0] == null || results.soslQueries.result[0].length <= 0) {
        return [];
    } else {
        return results.soslQueries.result[0][0]
    }
}

export enum QueryType {
    COUNT, SOQL
}

export interface ToSOQL<T> {
    toSOQL(callback: (err: Error, soql: string) => void): Promise<string>;

    //then<U>(onFulfilled?: (value: T) => U | PromiseLike<U>, onRejected?: (error: any) => U | PromiseLike<U>): Promise<U>;
    //then<U>(onFulfilled?: (value: T) => U | PromiseLike<U>, onRejected?: (error: any) => void): Promise<U>;

    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;


}


export interface QuerySubset<T> extends ToSOQL<T>, Promise<T>{
    sort(keyOrList: string | Object[] | Object, direction?: "ASC" | "DESC" | number): QuerySubset<T>;
    limit(value: number): QuerySubset<T>;
    offset(value: number): QuerySubset<T>;

    //catch<U>(onRejected?: (error: any) => U | PromiseLike<U>): Promise<U>;
    catch<TResult>(onrejected?: ((reason: any) => (PromiseLike<TResult> | TResult))): Promise<T | TResult>;

    finally(onfinally?: (() => void) | undefined | null): Promise<T>

    [Symbol.toStringTag]: "Promise";
}

export class EmptyQuery<T> implements QuerySubset<T> {

    constructor(private value: T) {}

    toSOQL(callback: (err: Error, soql: string) => void) {
        return Promise.resolve('');
    }

    then<U>(onFulfilled?: (value: T) => U | PromiseLike<U>, onRejected?: (error: any) => void) {
        return Promise.resolve(onFulfilled(this.value));
    }

    catch<U>(onRejected?: (error: any) => U | PromiseLike<U>) {
        return Promise.resolve(onRejected(null));
    }

    sort(keyOrList: string | Object[] | Object, direction?: "ASC" | "DESC" | number) {
        return this;
    }

    limit(value: number) {
        return this;
    }

    finally(onfinally?: (() => void) | undefined | null): Promise<T> {
        return this;
    }

    offset(value: number) {
        return this;
    }

    [Symbol.toStringTag]: "Promise";
}

interface ResultWrapperQueryInsert<T> extends ResultWrapperBase{ queries: StatusWrapper<[T]>; inserts: StatusWrapper<[SalesforceId]>; }

export function multiQueryQueryInsert<T, U>(queries: ToSOQL<any>[], inserts: U[]) {
    const callback = (error:Error, soql: string) => {};
    return Promise.all(queriesToSOQL(queries)).then(
        queries => {
            const res = restPost<ResultWrapperQueryInsert<T>>("/services/apexrest/smtapp/multiservice", { queries, inserts });
            return res;
        }
    );
}

interface ResultWrapperUpdateQuery<T> extends ResultWrapperBase{ queries: StatusWrapper<[T]>; updates: StatusWrapper<[SalesforceId]>; }
//putting type parameter for updates doesnt allow spread operator
export function multiQueryUpdateQuery<T>(sobject: SObject, updates: any[], queries: ToSOQL<T>[]) {
    return Promise.all(queriesToSOQL(queries)).then(
        queries => {

            updates = updates.map(u => {
                return ({ ...u, attributes: { type: sobject } })
            });
            const res = restPost<ResultWrapperUpdateQuery<T>>("/services/apexrest/smtapp/multiservice", { queries, updates });
            return res;
        }
    );
}

function queriesToSOQL(queries: ToSOQL<any>[]) {
    const callback = (error:Error, soql: string) => {};
    return queries.map(q => q == null ? '' : q.toSOQL(callback));
}

export const multiQuery1 = <T>(query1: ToSOQL<T>) => multiQueryCore<{ queries: StatusWrapper<[T]>}>([query1]);
export const multiQuery1Extract = <T>(query1: ToSOQL<T>) => multiQueryCore<{ queries: StatusWrapper<[T]>}>([query1]).then(wrapper => wrapper.queries.result[0]);
export const multiQuery111 = <T>(query1: ToSOQL<T>) => multiQueryCore<{ queries: StatusWrapper<[T]>}>([query1]);
export const multiQuery2 = <T, U>(query1: ToSOQL<T>, query2: ToSOQL<U>) => multiQueryCore<ResultWrapper2<T,U>>([query1, query2]);
export const multiQuery3 = <T, U, V>(query1: ToSOQL<T>, query2: ToSOQL<U>, query3: ToSOQL<V>) =>
    multiQueryCore<ResultWrapper3<T,U,V>>([query1, query2, query3]);
export const multiQuery4 = <T, U, V, W>(query1: ToSOQL<T>, query2: ToSOQL<U>, query3: ToSOQL<V>, query4: ToSOQL<W>) =>
    multiQueryCore<ResultWrapper4<T,U,V,W>>([query1, query2, query3, query4]);
export const multiQuery5 = <T,U,V,W,X>(query1: ToSOQL<T>, query2: ToSOQL<U>, query3: ToSOQL<V>, query4: ToSOQL<W>, query5: ToSOQL<X>) =>
    multiQueryCore<{ queries: StatusWrapper<[T,U,V,W,X]> }>([query1, query2, query3, query4, query5]);
export const multiQuery6 = <T,U,V,W,X,Y>(query1: ToSOQL<T>, query2: ToSOQL<U>, query3: ToSOQL<V>, query4: ToSOQL<W>, query5: ToSOQL<X>, query6: ToSOQL<Y>, queryType: QueryType = QueryType.SOQL) =>
    multiQueryCore<{ queries: StatusWrapper<[T,U,V,W,X,Y]>, countQueries:  StatusWrapper<[number,number,number,number,number,number]> }>([query1, query2, query3, query4, query5, query6], queryType);
export const multiQuery7 = <T,U,V,W,X,Y,Z>(query1: ToSOQL<T>, query2: ToSOQL<U>, query3: ToSOQL<V>, query4: ToSOQL<W>, query5: ToSOQL<X>, query6: ToSOQL<Y>, query7: ToSOQL<Z>) =>
    multiQueryCore<{ queries: StatusWrapper<[T,U,V,W,X,Y,Z]> }>([query1, query2, query3, query4, query5, query6, query7]);
export const multiQuery8 = <T,U,V,W,X,Y,Z,A>(query1: ToSOQL<T>, query2: ToSOQL<U>, query3: ToSOQL<V>, query4: ToSOQL<W>, query5: ToSOQL<X>, query6: ToSOQL<Y>, query7: ToSOQL<Z>, query8: ToSOQL<A>) =>
    multiQueryCore<{ queries: StatusWrapper<[T,U,V,W,X,Y,Z,A]> }>([query1, query2, query3, query4, query5, query6, query7, query8]);
export const multiQuery9 = <T,U,V,W,X,Y,Z,A,B>(query1: ToSOQL<T>, query2: ToSOQL<U>, query3: ToSOQL<V>, query4: ToSOQL<W>, query5: ToSOQL<X>, query6: ToSOQL<Y>, query7: ToSOQL<Z>, query8: ToSOQL<A>, query9: ToSOQL<B>, queryType: QueryType = QueryType.SOQL) =>
    multiQueryCore<{ queries: StatusWrapper<[T,U,V,W,X,Y,Z,A,B]>, countQueries:  StatusWrapper<[number,number,number,number,number,number,number,number,number]>  }>([query1, query2, query3, query4, query5, query6, query7, query8, query9], queryType);
export const multiQuery10 = <T,U,V,W,X,Y,Z,A,B,C>(
    query1: ToSOQL<T>, query2: ToSOQL<U>, query3: ToSOQL<V>, query4: ToSOQL<W>, query5: ToSOQL<X>, query6: ToSOQL<Y>, query7: ToSOQL<Z>, query8: ToSOQL<A>, query9: ToSOQL<B>, query10: ToSOQL<C>, queryType: QueryType = QueryType.SOQL) =>
    multiQueryCore<{ queries: StatusWrapper<[T,U,V,W,X,Y,Z,A,B,C]>, countQueries:  StatusWrapper<[number,number,number,number,number,number,number,number,number,number]> }>([query1, query2, query3, query4, query5, query6, query7, query8, query9, query10], queryType);
export const multiQuery11 = <T,U,V,W,X,Y,Z,A,B,C,D>(
    query1: ToSOQL<T>, query2: ToSOQL<U>, query3: ToSOQL<V>, query4: ToSOQL<W>, query5: ToSOQL<X>, query6: ToSOQL<Y>, query7: ToSOQL<Z>, query8: ToSOQL<A>, query9: ToSOQL<B>, query10: ToSOQL<C>, query11: ToSOQL<D>, queryType: QueryType = QueryType.SOQL) =>
    multiQueryCore<{ queries: StatusWrapper<[T,U,V,W,X,Y,Z,A,B,C,D]>, countQueries:  StatusWrapper<[number,number,number,number,number,number,number,number,number,number,number]> }>([query1, query2, query3, query4, query5, query6, query7, query8, query9, query10, query11], queryType);
export const multiQuery12 = <T,U,V,W,X,Y,Z,A,B,C,D,E>(
    query1: ToSOQL<T>, query2: ToSOQL<U>, query3: ToSOQL<V>, query4: ToSOQL<W>, query5: ToSOQL<X>, query6: ToSOQL<Y>, query7: ToSOQL<Z>, query8: ToSOQL<A>, query9: ToSOQL<B>, query10: ToSOQL<C>, query11: ToSOQL<D>, query12: ToSOQL<E>, queryType: QueryType = QueryType.SOQL) =>
    multiQueryCore<{ queries: StatusWrapper<[T,U,V,W,X,Y,Z,A,B,C,D,E]>, countQueries:  StatusWrapper<[number,number,number,number,number,number,number,number,number,number,number,number]>  }>(
        [query1, query2, query3, query4, query5, query6, query7, query8, query9, query10, query11, query12], queryType);
export const multiQuery13 = <T,U,V,W,X,Y,Z,A,B,C,D,E,F>(
    query1: ToSOQL<T>, query2: ToSOQL<U>, query3: ToSOQL<V>, query4: ToSOQL<W>, query5: ToSOQL<X>, query6: ToSOQL<Y>, query7: ToSOQL<Z>, query8: ToSOQL<A>, query9: ToSOQL<B>, query10: ToSOQL<C>, query11: ToSOQL<D>, query12: ToSOQL<E>, query13: ToSOQL<F>, queryType: QueryType = QueryType.SOQL) =>
    multiQueryCore<{ queries: StatusWrapper<[T,U,V,W,X,Y,Z,A,B,C,D,E,F]>, countQueries: StatusWrapper<[number,number,number,number,number,number,number,number,number,number,number,number,number]> }>([query1, query2, query3, query4, query5, query6, query7, query8, query9, query10, query11, query12, query13], queryType);

export const multiQuery14 = <T,U,V,W,X,Y,Z,A,B,C,D,E,F,G>(
        query1: ToSOQL<T>, query2: ToSOQL<U>, query3: ToSOQL<V>, query4: ToSOQL<W>, query5: ToSOQL<X>, query6: ToSOQL<Y>, query7: ToSOQL<Z>, query8: ToSOQL<A>, query9: ToSOQL<B>, query10: ToSOQL<C>, query11: ToSOQL<D>, query12: ToSOQL<E>, query13: ToSOQL<F>, query14: ToSOQL<G>, queryType: QueryType = QueryType.SOQL) =>
        multiQueryCore<{ queries: StatusWrapper<[T,U,V,W,X,Y,Z,A,B,C,D,E,F,G]>, countQueries: StatusWrapper<[number,number,number,number,number,number,number,number,number,number,number,number,number,number]> }>([query1, query2, query3, query4, query5, query6, query7, query8, query9, query10, query11, query12, query13, query14], queryType);

export function multiQueryCoreWithTypes<RWT>(queries: [ToSOQL<any>, QueryType][]) {
    const callback = (error:Error, soql: string) => {};
    //const sth = queries.map(q => ([q == null ? '' : q[0].toSOQL(callback), q[1]] as [string, QueryType]));
    return Promise.all(
        queries.map(q => q == null ? '' : q[0].toSOQL(callback))
    )
    .then(
        queriesMix => {
            const soqlQueries = queriesMix.filter((q, index) => queries[index][1] == QueryType.SOQL);
            const countQueries = queriesMix.filter((q, index) => queries[index][1] == QueryType.COUNT);
            const res = restPost<RWT>("/services/apexrest/smtapp/multiservice", { countQueries, queries: soqlQueries });
            return res;
        }
    );
}

//TODO improve the joining to accept arbitrary queries
export async function joinQueries<T>(...queries: Promise<{ queries: StatusWrapper<[T[]]>}>[]) {
    const results = await Promise.all(queries);
    let swResult = {
        queries: {
            result: [[]] as [T[]],
            status: true,
            message: ''
        }
    };
    results.forEach(sw => {
        swResult = {
            queries: {
                result: [[...swResult.queries.result[0], ...sw.queries.result[0]]],
                status: swResult.queries.status && sw.queries.status,
                message: swResult.queries.message + (sw.queries.message == null ? '' : sw.queries.message) + '; '
            }
        }
    });
    return swResult;
}

export function multiQueryCore<RWT>(queries: ToSOQL<any>[], queryType: QueryType = QueryType.SOQL) {
    const callback = (error:Error, soql: string) => {};
    return Promise.all(
        queries.map(q => q == null ? '' : q.toSOQL(callback))
    ).then(
        queries => {
            const res = restPost<RWT>("/services/apexrest/smtapp/multiservice", queryType === QueryType.COUNT ? { countQueries: queries } : { queries });
            return res;
        }
    );
}

export function multiQueryService<RWT>(actions: { queries?: string[], countQueries?: string[], inserts?: any[], updates?: any[], deletes?: any[] }) {
    return restPost<RWT>("/services/apexrest/smtapp/multiservice", actions);
}

export function queryWithConditions<TResult, TSObject>(conditions: ICondition<any, TSObject>[] = [], object: string, fields: string[]): QuerySubset<TResult[]> {
    conditions = conditions.filter(qo => qo != null)

    const emptyQueryConditions = conditions.filter(c => c.emptyQuery);
    if(emptyQueryConditions.length > 0) return new EmptyQuery([] as TResult[]);//return null;

    return query<TResult>(conditions.map(c => c.queryOptions), object, fields);
}

export function queryWithConditionsSimple<TResult>(conditions: ICondition<any, TResult>[] = [], object: string, fields: string[]): QuerySubset<TResult[]> {
    return queryWithConditions<TResult, TResult>(conditions, object, fields);
}

//TODO error handling
export function query<T = any>(options: any = {}, object: string, fields: string[]) {
    const res = connection.sobject(object).find<T>(options, fields.join(','));

    //res.catch = <TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null) => res.then(undefined, onrejected);

    return res;
}



export function queryRecord<T = any>(options: any = {}, object: string, fields: string[]) {
    return connection.sobject(object).findOne<T>(options, fields.join(','));
}

function queryAndMap<T, U>(options: any = {}, object: string, fields: string[], f: (t: T) => U) {
    return query<T>(options, object, fields).then(res => res.map(f));
}

export function queryRecordById<T>(id: string, object: string, fields: string[]) {
    return queryRecord<T>({ Id: { $eq: id }}, object, fields);
}

//TODO error handling, the errors are handling with the catch of the promise, maybe I need to do some wrapping here?
//RecordResult = SuccessResult | ErrorResult;
export function update(sobject: string, record: any) {
    const query = connection.sobject(sobject).update(record);
    return handleJsforceResult(query);
}

export function insert(sobject: SObject, record: any): Promise<SalesforceId> {
    const query = connection.sobject(sobject).insert(record);
    return handleJsforceResult(query);
}

export function insertOrUpdate(sobject: SObject, record: any) {
    return record.Id == null ? connection.sobject(sobject).insert(record) : connection.sobject(sobject).update(record);
}

export function upsert(sobject: SObject, record: any): Promise<SalesforceId> {
    const query = insertOrUpdate(sobject, record);
    return handleJsforceResult(query);
}

export function upsertBulk<T extends { Id: string }>(sobject: SObject, records: T[]) {
    //upsertBulk seems to modify the records passed as argument
    const res = connection.sobject(sobject).upsertBulk(_.cloneDeep(records), 'Id' as any);
    return res.then;
}

export function del(sobject: SObject, ids: string[]): Promise<RecordResult[]> {
    return connection.sobject(sobject).delete(ids);
}


export function describe(sobject: SObject) {
    return connection.describe(sobject);
}

function handleJsforceResult(query: Promise<jsforce.RecordResult>) {
    return query.then(
        results => {
            if(results instanceof Array) {
                return Promise.reject('inserting one record returned array of results');
            } else {
                return results.success === true ? Promise.resolve(results.id) : Promise.resolve(results.errors.join(";"));
            }
        }
    );
}

export function insertMany<T>(sobject: string, records: Array<jsforce.Record<T>>): Promise<SalesforceId[]> {
    const insertQuery = connection.sobject(sobject).insert(records);
    insertQuery.catch = <TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null) => insertQuery.then(undefined, onrejected);
    return insertQuery.then(
        results => {
            const resultsArray = results instanceof Array ? results : [results];
            const successes = resultsArray.filter(result => result.success) as SuccessResult[];
            const errors = resultsArray.filter(result => !result.success) as ErrorResult[];
            return successes.length > 0 ? Promise.resolve(successes.map(s => s.id)) : Promise.reject(errors);
        }
    ).catch(
        error => {
            console.log(error);
            return Promise.reject(error);
        }
    );
}