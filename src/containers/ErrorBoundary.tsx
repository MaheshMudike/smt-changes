import * as React from 'react';
import { connect } from 'react-redux';
import { replace } from 'react-router-redux';
import { paths } from 'src/config/paths';
import { Icon } from 'src/components/layout/Icon';
import { SvgIcon } from 'src/constants/SvgIcon';
import translate from 'src/utils/translate';
import IconButtonFA from 'src/components/layout/IconButonFA';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { showToast } from 'src/actions/toasts/toastActions';
import { IGlobalState } from 'src/models/globalState';
import { isBrowser } from 'src/utils/cordova-utils';


interface ErrorBoundaryProps {
    userName?: string,
    replace?: typeof replace,
    showToast?: typeof showToast,
    stack?: string
}

export class ErrorBoundaryClass extends React.Component<ErrorBoundaryProps, { readonly error: Error; readonly info: any; readonly stack: string; readonly userName: string  }> {

    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { 
            error: undefined, 
            info: undefined, 
            stack: this.props.stack, 
            userName: this.props.userName,
         };
    }

    componentDidCatch(error: Error, info: object) {
        // You can also log the error to an error reporting service
        //logErrorToMyService(error, info);
        if(!isBrowser()){
            FirebasePlugin.setCrashlyticsUserId(this.state.userName);     
            FirebasePlugin.logMessage(error.stack);
            FirebasePlugin.sendCrash();
        }
        this.setState({ error: { name: error.name, message: error.message }, info, stack: error.stack });
    }

    handleReset = () => {
        this.setState({ error: undefined, info: undefined, stack: undefined });
    };

    render() {
        if (this.state.stack || this.state.error) {
            // You can render any custom fallback UI
            return <React.Fragment>
                <div className='login__background'>
                    <div className='login__container'>
                        <Icon svg={SvgIcon.Logo} className='icon--logo' />
                        <div className='login__details container--centered'>
                            <h1>An error occurred</h1>
                            { document.queryCommandSupported('copy') && this.state.stack &&
                            <IconButtonFA className="icon-button margin-left--small" icon={faClipboard} 
                                onClick={() => this.copyToClipboard(this.state.stack)}/>
                            }
                        </div>
                        <div className='login__error'>
                            <p className="text-align--left">{ this.state.error.message + ',' + this.state.stack }</p>
                        </div>
                        <div className='login__details'>
                            { this.props.replace && 
                            <button type='button' className={'button button--salesforce button--wide'}
                                onClick={
                                    () => { this.handleReset(); this.props.replace(paths.OVERVIEW) } 
                                }>
                                {translate('overview-page.title')}
                            </button>
                            }
                        </div>
                    </div>
                </div>

            </React.Fragment>;
        }

        return this.props.children;
    }

    copyToClipboard = (text: string) => {
        const textField = document.createElement('textarea')
        textField.innerText = text
        document.body.appendChild(textField)
        textField.select()
        document.execCommand('copy')
        textField.remove();

        if(this.props.showToast) this.props.showToast({ message: 'Copied to clipboard ' });
    }
}

const mapStateToProps = (state: IGlobalState) => ({
    userName : state.authentication && state.authentication.currentUser && state.authentication.currentUser.userName,
})

export const ErrorBoundary = connect(mapStateToProps, { replace, showToast })(ErrorBoundaryClass)