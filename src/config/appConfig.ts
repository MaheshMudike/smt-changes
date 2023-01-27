
export interface IAppConfig {
    appId: string;
    appName: string;
    salesforce: {
        // clientIdSecret: string;
        loginUrl: string;
        oauthRedirectURI: string;
        remoteAccessConsumerKey: string;
    };    
    kffUrl: string;
    kolUrl: string;
    traceUrl: string;  
    logLevel: 'info' | 'error';
    mapKey: string;
    translationsUrl: (s: string) => string;
}
