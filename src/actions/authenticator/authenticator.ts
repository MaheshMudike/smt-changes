import * as _ from 'lodash';
import { authenticateFailed, initConnectionAndQueryUser } from '../authenticationActions';
import { getAccessTokenFromURL } from 'src/components/OauthLogin';
import { config } from '../../config/config';
import { browserOauthRedirectURI } from '../../constants/salesforceConfig';
import { isBrowser } from 'src/utils/cordova-utils';

const buildAuthorizeUrl = (loginUrl: any, clientId: any, redirectUri: any, responseType: any) =>
    `${ loginUrl }services/oauth2/authorize?` + 
        ['display=touch', 'prompt=login', `response_type=${ responseType }`, 
         `client_id=${ encodeURIComponent(clientId) }`, `redirect_uri=${ encodeURIComponent(redirectUri) }`].join('&');

export function authenticate() {
    return (dispatch: any) => {
        openLoginPage(dispatch);
    };
}

const logInFromURL = (dispatch: any, evt: any, redirectUri: string, logWindowRef: Window) => {
    if (_.startsWith(evt.url, redirectUri)) {
        logWindowRef.close();
        const oAuthResponse = getAccessTokenFromURL(evt.url);//parseResponseFromUrl(evt.url);        
        if (_.isUndefined(oAuthResponse) || _.isUndefined(oAuthResponse.access_token)) {
            dispatch(authenticateFailed(evt.url));
        } else if(_.isUndefined(evt.message)) {  
            dispatch(initConnectionAndQueryUser(oAuthResponse));
        }
    }
};

export default function openLoginPage(dispatch: any) {
    const { loginUrl, remoteAccessConsumerKey, oauthRedirectURI } = config.salesforce;
    
    if (!isBrowser()) {
        const responseType = 'token';
        const authorizeUrl = buildAuthorizeUrl(loginUrl, remoteAccessConsumerKey, oauthRedirectURI, responseType);        
        const logWindowRef = window.open(authorizeUrl, '_blank', 'location=no,clearcache=yes,clearsessioncache=yes,toolbar=no');        
        logWindowRef.addEventListener('loadstop', evt => {         
            logInFromURL(dispatch, evt, oauthRedirectURI, logWindowRef);
        });
        logWindowRef.addEventListener('loaderror', evt => {          
            logInFromURL(dispatch, evt, oauthRedirectURI, logWindowRef);
        });
    } else {
        //const responseType = 'code';
        const responseType = 'token';        
        window.open(buildAuthorizeUrl(loginUrl, remoteAccessConsumerKey, browserOauthRedirectURI, responseType));
    }
}