import * as React from 'react';
import { ConnectedRouter } from 'react-router-redux';
import { routes } from '../config/routes';
import { Provider } from 'react-redux';
import Toast from '../components/toast/Toast';
import GlobalModal from '../components/modals/GlobalModal';
import Helmet from './Helmet';

export default function Root(props: { store: any; history: any; }) {
    const { store, history } = props;
    return (
        <Provider store={store}>
            <div className='full-size'>
                <Helmet />
                <div id='app' className='app'>
                    <ConnectedRouter  history={history}>
                        { routes(true) }
                    </ConnectedRouter >
                </div>
                <Toast />
                <div className='modal-container'>
                    <GlobalModal />
                </div>
            </div>
        </Provider>
    );
}