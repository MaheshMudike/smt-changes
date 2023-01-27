import * as cx from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';

import { authenticate } from '../../actions/authenticator/authenticator';
import { Icon } from '../../components/layout/Icon';
import { Spinner } from '../../components/Spinner';
import { SvgIcon } from '../../constants/SvgIcon';
import { IGlobalState } from '../../models/globalState';
import translate from '../../utils/translate';

class LoginClass extends React.Component<ILoginProps, object> {

    public render() {
        const buttonClass = cx(
            'button button--salesforce button--wide', {
                hidden: this.props.isProcessing,
            },
        );

        return (
            <div className='login__background'>
                <div className='login__container'>                    
                    <Icon svg={SvgIcon.Logo} className='icon--logo' />
                    <p className='login__title'>
                        {this.loginTranslate('app-title')}
                    </p>
                    <div className='login__details'>
                        {this.loginTranslate('description.line-1')}<br />
                        {this.loginTranslate('description.line-2')}<br />
                        {this.loginTranslate('description.line-3')}
                    </div>
                    <div className='login__details'>
                        <button type='button' className={buttonClass}
                            onClick={this.handleSalesforceLogin}>
                            {this.loginTranslate('main-action-button')}
                        </button>
                        { this.props.isProcessing ? <Spinner isLight /> : null }
                    </div>
                </div>
            </div>
        );
    }

    private loginTranslate = (suffix: string) => {
        return translate(`login-page.${ suffix }`);
    };

    private handleSalesforceLogin = (e: React.MouseEvent<any>) => {
        e.preventDefault();
        this.props.authenticate();
    }
}

interface ILoginProps {
    authenticate: typeof authenticate;
    isProcessing: boolean;
}

function mapStateToProps(state: IGlobalState) {
    return {
        isProcessing: state.authentication.isProcessing,
    };
}

export const LoginPage = connect(
    mapStateToProps,
    { authenticate },
)(LoginClass);
