import * as React from 'react';
import { connect } from 'react-redux';
import { IGlobalState } from '../models/globalState';
import { Helmet } from 'react-helmet';
import { SWITCH_DIRECTION, IAuthenticationState } from '../reducers/AuthenticationReducer';
import { emptyAction } from '../actions/actionUtils';
import { ThunkAction } from '../actions/thunks';

class HelmetClass extends React.Component<IAuthenticationState & typeof HelmetDispatchProps, object> {
    //<span onClick={ev => this.props.toggleDirection()}>toggle</span>
    public render() {
        return (
            <div>
                <Helmet htmlAttributes={{ dir : this.props.direction }} />
            </div>
        );
    }
}

const HelmetDispatchProps = {
    toggleDirection: () => ((dispatch) => dispatch(emptyAction(SWITCH_DIRECTION))) as ThunkAction<void>
}

export default connect((state: IGlobalState) => state.authentication, HelmetDispatchProps)(HelmetClass);