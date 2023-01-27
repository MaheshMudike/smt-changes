import * as React from 'react';
import { connect } from 'react-redux';
import { replace } from 'react-router-redux';

import { SvgIcon } from '../constants/SvgIcon';
import { getDataFromQueryParams } from '../utils/request-utils';
import { Icon } from './layout/Icon';
import { Spinner } from './Spinner';
import { initConnectionAndQueryUser } from '../actions/authenticationActions';
import { ICredentials } from '../models/api/salesforce/ICredentials';
import { ThunkAction } from '../actions/thunks';

class OauthLogin extends React.Component<IOauthLoginProps, object> {
    constructor(props: IOauthLoginProps) {
        super(props);
        this.getAccessTokenFromUrl = this.getAccessTokenFromUrl.bind(this);
    }

    public render() {
        return (
            <div className='login__background'>
                <div className='login__container'>
                    <Icon svg={SvgIcon.Logo} className='icon--logo' />
                    <div className='login__details'>
                        <Spinner isLight />
                    </div>
                </div>
            </div>
        );
    }

    public componentDidMount() {
        this.getAccessTokenFromUrl();
    }

    private getAccessTokenFromUrl() {
        const paramsString = document.location.hash.split('#')[2];
        this.props.getAccessTokenFromUrlAndInitConnection(paramsString);
    }

}

interface IOauthLoginProps {
    getAccessTokenFromUrlAndInitConnection: typeof getAccessTokenFromUrlAndInitConnection;
    replace: typeof replace;
}

export function getAccessTokenFromLocation(location: Location) {
   return getAccessTokenFromURL(location.hash);
}

export function getAccessTokenFromURL(url: string) {
    const paramsString = url.split('#')[2];    
    const queryParams = getDataFromQueryParams(paramsString);
    //id is a SF url https://test.salesforce.com/id/<orgId>/<userId>
    const parts = queryParams.id.split('/');
    const userId = parts[parts.length - 1];
    const orgId = parts[parts.length - 2];
    //issued_at signature scope token_type
    const credentials: ICredentials = {
        access_token: queryParams.access_token,
        id: queryParams.id,
        instance_url: queryParams.instance_url,
        refresh_token: queryParams.refresh_token,
        orgId: orgId,
        userId: userId,
    }
    return credentials;
}

const getAccessTokenFromUrlAndInitConnection = (paramsString: string): ThunkAction<void> => (dispatch, getState) => {
    const credentials = getAccessTokenFromLocation(document.location);
    dispatch(initConnectionAndQueryUser(credentials));
}

export default connect(
    null, {
        replace,
        getAccessTokenFromUrlAndInitConnection
    },
)(OauthLogin);