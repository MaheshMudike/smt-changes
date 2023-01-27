import { ICredentials } from '../../models/api/salesforce/ICredentials';
import { hasStatusOneOf, IHttpResponse } from '../../utils/request-utils';
import credentials from '../credentials';
import { refreshOauthTokenPromise } from '../../actions/http/jsforceCore';

let recoveryPromise: Promise<void> = null;
const RETRY_INTERVAL = 1000; // Value in ms
const DEFAULT_RETRIES = 0;
const PROXY_RETRIES = 3;


function isImmediateFailure(error: IHttpResponse) {
    return error && error.status >= 400 && error.status < 500;
}

function tryRequestWithoutRefreshingToken<T>(methodBody: () => Promise<T>, retries: number = DEFAULT_RETRIES): Promise<T> {    
    return methodBody()
        .catch((reason) => {
            if (retries === 0 || isImmediateFailure(reason)) throw reason;          
            return new Promise<T>(resolve => setTimeout(resolve, RETRY_INTERVAL))
                .then(() => tryRequestWithoutRefreshingToken<T>(methodBody, retries - 1));            
        });    
}

function tryProxyRequestWithoutRefreshingToken<T>(methodBody: () => Promise<T>): Promise<T> {
    return tryRequestWithoutRefreshingToken(methodBody, PROXY_RETRIES);
}

function buildAccessTokenRecovery() {
    let oldCredentials: ICredentials;    
    return credentials.getValue()        
        .then(credentials => {
            oldCredentials = credentials
            return refreshOauthTokenPromise(credentials.refresh_token)            
        })
        .then(newToken => credentials.setValue({ ...oldCredentials, access_token: newToken }))
        .then(() => recoveryPromise = null)
        .catch(err => {
            recoveryPromise = null;
            return Promise.reject(err);
        });
}

type tryRequestType = <T>(requestBuilder: () => Promise<T>) => Promise<T>;

function recoverWhenAccessTokenIsNoLongerValid<T>(basicTryRequest: tryRequestType, requestBuilder: () => Promise<T>): Promise<T> {
    if (recoveryPromise == null) {
        recoveryPromise = buildAccessTokenRecovery();
    }
    
    return recoveryPromise.then(x => basicTryRequest(requestBuilder));
}

function addAccessTokenRecovery<T>(basicTryRequest: tryRequestType) {
    return (requestBuilder: () => Promise<T>): Promise<T> => {
        if (recoveryPromise != null) {
            return recoverWhenAccessTokenIsNoLongerValid(basicTryRequest, requestBuilder);
        }
        return basicTryRequest(requestBuilder)
            .catch(err => {
                if (hasStatusOneOf(err, 401)) {
                    return recoverWhenAccessTokenIsNoLongerValid(basicTryRequest, requestBuilder);
                }
                return Promise.reject(err);
            });
    };
}

/*
export const tryProxyRequest = 
    <T>(requestBuilder: () => Promise<T>) => addAccessTokenRecovery<T>(tryProxyRequestWithoutRefreshingToken)(requestBuilder);
*/  
export const tryRequest = 
    <T>(requestBuilder: () => Promise<T>) => addAccessTokenRecovery<T>(tryRequestWithoutRefreshingToken)(requestBuilder);
