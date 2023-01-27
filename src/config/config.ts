import { IAppConfig } from 'src/config/appConfig';

const CONFIG = {
    "dev": {
      "appId": "com.kone.smt3.dev",
      "appName": "KONE SMT DEV",
      "logLevel": "info",
      
      "salesforce": {
        //removed the clientIdSecret for security purposes.
        "loginUrl": "https://kone--smt.my.salesforce.com/",    
        //this is a "hack" to use the SF oauth redirect from the config
        "oauthRedirectURI": 'http://localhost:8000/#/oauth/callback',
        "remoteAccessConsumerKey": "3MVG9X0_oZyBSzHrnzENhROatHNRsEZXjsDUPKjEoYcXGL732tVfDpo0MMPOqFekPEX9HafZLStZf2Gqi.bsr"
      },      
      "kffUrl": "https://qa-kff.kone.com",
      "kolUrl": "https://full-koneonline.cs84.force.com/koneonline/",
      "traceUrl": "https://trace.kone.com",
      "mapKey": "AguptuT-lKvAfroVz-0leY0zrA-RkhB2d6OzMt3EqT8nDu3VG7edaoE7oMx2Zfhu",
      "translationsUrl": (language: string) => { return `https://translate.kone.com/API_KTS_LOADER/application/SMT3/${language}/dictionary?released=false` }
    } as IAppConfig,
    "fsmqa": {      
      "appId": "com.kone.smt3.qa",
      "appName": "KONE SMT FSMQA",
      "logLevel": "info",
      "salesforce": {
        "loginUrl": "https://kone--fsmqa.my.salesforce.com/",  
        "oauthRedirectURI": 'http://localhost:8000/#/oauth/callback',
        "remoteAccessConsumerKey": "3MVG92H4TjwUcLlLvIMWkOuic3WClWPhIY1rcGR3_1NYEVDFf2y9cwGYJjfdQ_6Mqcvm8UobtWrgrwE3aCzxM"
      },          
      "kffUrl": "https://qa-kff.kone.com",
      "kolUrl": "https://full-koneonline.cs84.force.com/koneonline/",
      "traceUrl": "https://trace.kone.com",
      "mapKey": "AguptuT-lKvAfroVz-0leY0zrA-RkhB2d6OzMt3EqT8nDu3VG7edaoE7oMx2Zfhu",
      "translationsUrl": (language: string) => { return `https://translate.kone.com/API_KTS_LOADER/application/SMT3/${language}/dictionary?released=false` }
    } as IAppConfig,
    "int": {
      "appId": "com.kone.smt3.int",
      "appName": "KONE SMT INT",
      "logLevel": "info",
      "salesforce": {
        "loginUrl": "https://kone--int.my.salesforce.com/",
        "oauthRedirectURI": 'http://localhost:8000/#/oauth/callback',
        "remoteAccessConsumerKey": "3MVG9Lu3LaaTCEgJ1gvddPIi1T6OrPK_P.g2z_A4oIp94seKn2ATpi1k92HF3bh.sPjTQ3GiSvO6hmQHqHnnJ"
      },    
      "kffUrl": "https://qa-kff.kone.com",
      "kolUrl": "https://full-koneonline.cs84.force.com/koneonline/",
      "traceUrl": "https://trace.kone.com",
      "mapKey": "AguptuT-lKvAfroVz-0leY0zrA-RkhB2d6OzMt3EqT8nDu3VG7edaoE7oMx2Zfhu",
      "translationsUrl": (language: string) => { return `https://translate.kone.com/API_KTS_LOADER/application/SMT3/${language}/dictionary?released=false` }
    } as IAppConfig,
    "full": {      
      "appId": "com.kone.smt3.full",
      "appName": "KONE SMT FULL",
      "logLevel": "info",
      "salesforce": {     
        "loginUrl": "https://kone--full.my.salesforce.com/",
        "oauthRedirectURI": 'http://localhost:8000/#/oauth/callback',
        "remoteAccessConsumerKey": "3MVG9lcxCTdG2VbtWAnBLcHTY.wIG1QXXOhqkQ5WQHZVmCBw0fZkiNwX19lWRwqhDsg5vGTogK5Iuja.bvFTZ"
        // "remoteAccessConsumerKey":"3MVG96mGXeuuwTZi1FvcrlwfqofR4UkwmHbty_waT6uo0gimwA7py4aO_HzYBx0mE4shdHyIBZYnGShjrph1n"
      },    
      "kffUrl": "https://qa-kff.kone.com",
      "kolUrl": "https://full-koneonline.cs84.force.com/koneonline/",
      "traceUrl": "https://trace.kone.com",
      "mapKey": "AguptuT-lKvAfroVz-0leY0zrA-RkhB2d6OzMt3EqT8nDu3VG7edaoE7oMx2Zfhu",      
      "translationsUrl": (language: string) => { return `https://translate.kone.com/API_KTS_LOADER/application/SMT3/${language}/dictionary?released=false` }
    } as IAppConfig,
    "prod": {
      "appId": "com.kone.smt3",
      "appName": "KONE SMT",
      "logLevel": "info",//this should be error
      "salesforce": {
        "loginUrl": "https://kone.my.salesforce.com/",
        "oauthRedirectURI": 'http://localhost:8000/#/oauth/callback',
        "remoteAccessConsumerKey": "3MVG9WtWSKUDG.x4MF75d_Cbddbsbx4zoghq5s1hC3PmbDAPipAI35FMQqySUQWZMNl3UppMgUU8NQcheQjNo"
      },          
      "kffUrl": "https://kff.kone.com",
      "kolUrl": "https://koneonline.force.com/koneonline/",
      "traceUrl": "https://trace.kone.com",
      "mapKey": "AguptuT-lKvAfroVz-0leY0zrA-RkhB2d6OzMt3EqT8nDu3VG7edaoE7oMx2Zfhu",      
      "translationsUrl": (language: string) => { return `https://translate.kone.com/API_KTS_LOADER/application/SMT3/${language}/dictionary?released=true` }
    } as IAppConfig   
  }
  
  export const config: IAppConfig = CONFIG[__SMT_ENV__];