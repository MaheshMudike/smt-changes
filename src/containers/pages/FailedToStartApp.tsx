import * as React from 'react';

import { Icon } from '../../components/layout/Icon';
import { SvgIcon } from '../../constants/SvgIcon';

interface FailedToStartAppProps {
    error: string
}

// export class FailedToStartApp extends React.Component<{}, object> {
    export class FailedToStartApp extends React.Component<FailedToStartAppProps, {error:string}> {
        constructor(props:FailedToStartAppProps){
            super(props);
        }
    public render() {
        return (
            <div className='login__background'>
                <div className='login__container'>
                    <Icon svg={SvgIcon.Logo} className='icon--logo' />
                    {this.props.error == 'Device is not secure' ? 
                    <p className='login__details' > 
                        Device is not secure. Kindly set screen lock for the device and try again.
                    </p> :
                    <p className='login__details'>
                        Kone SMT service is temporarily unavailable. Please try again later or contact your local SMT Administrator.
                    </p>
                    }
                    <div className='login__details'>
                        <button type='button' className='button button--salesforce button--wide'
                            onClick={() => location.reload()}>
                            Try again
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
