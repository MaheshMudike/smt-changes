import 'core-js/es6/map';
import 'core-js/es6/set';
import 'core-js/es6/promise';
import 'core-js/es6/symbol';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { routerMiddleware } from 'react-router-redux';
import { createHashHistory } from 'history';

import { Middleware, Action } from 'redux';

import './index.html';
import './indexCordova.html';

// Internal
import { setupCordovaAndRun } from './config/cordovaConfig';
import { FailedToStartApp } from './containers/pages/FailedToStartApp';
import Root from './containers/Root';

//import * as Raven from 'raven-js';

import { applyMiddleware, createStore } from 'redux';
import { createLogger } from 'redux-logger';
import thunk, { ThunkMiddleware } from 'redux-thunk';

import { rootReducer } from './reducers';

import { History } from 'history';
import { config } from './config/config';
//import { logLocationChanged } from './actions/authenticationActions';
import { IGlobalState } from './models/globalState';
import { ErrorBoundaryClass } from './containers/ErrorBoundary';
import { isAndroid } from './utils/cordova-utils';
import * as firebase from 'firebase';
import 'firebase/analytics';
import { fullConfig } from '../firebase_configs/full/firebaseConfig-full';
import { prodConfig } from '../firebase_configs/prod/firebaseConfig-prod';

interface ILoggerConfig {
  url: string;
  env: string;
  version: string;
}

const history = createHashHistory();
//history.listen(location => logLocationChanged(location.pathname))

function configureStore(history: History, initialState: any) {
  const middlewares = [thunk as ThunkMiddleware<IGlobalState, Action>, routerMiddleware(history)];

  const firebaseLogger = (store: { getState: () => any; }) => (next: (arg: any) => any) => (action: any) => {
    if(isAndroid()) {
      FirebasePlugin.logEvent(action.type.toLowerCase(),{payload: action.payload})  
      action.type.toLowerCase().includes('failure') ? FirebasePlugin.logError(action.type,{payload: action.payload} ) : null
    }
    else {     
      analytics.logEvent(action.type.toLowerCase(),{payload: action.payload})
    }
    return next(action)
  }

  if (config.logLevel === 'info') {
      middlewares.push(createLogger({ collapsed: (getState, action) => true }));
      middlewares.push(firebaseLogger);
  }
  //middlewares.push(customMiddleWare);
  const store = createStore(rootReducer, initialState, applyMiddleware(...middlewares));  
  return store;
}


config.appId === 'com.kone.smt3.full' ? firebase.initializeApp(fullConfig) : firebase.initializeApp(prodConfig);   
const analytics = firebase.analytics();

const store = configureStore(history, {});

var rootElement = document.getElementById('smt-app');
setupCordovaAndRun(store, history, {
  failedTranslations: (error:string) => ReactDOM.render(<FailedToStartApp error={error} />, rootElement),
  error: (stack: string) => ReactDOM.render(<ErrorBoundaryClass stack={stack} />, rootElement),
  normal: () => ReactDOM.render(<Root store={store} history={history} />, rootElement)
});