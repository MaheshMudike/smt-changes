import * as React from 'react';

import translate from '../../utils/translate';
import { DialogContainer } from './layout/DialogContainer';
import { DialogContent, DialogContentPadding } from './layout/DialogContent';

export abstract class AbstractWhiteDialog<T, S> extends React.Component<T, S> {

    public render() {
        const buttons = this.getButtons();
        return (
            <DialogContainer>
                <DialogContent padding={DialogContentPadding.None}>
                    <div className='blue-header padding-horizontal--std padding-vertical--large'>
                        {this.renderHeaderContent()}
                    </div>
                    {this.renderContent()}
                </DialogContent>
                {buttons &&
                    <div className='container--horizontal container--inversed padding--std'>
                        {buttons}
                    </div>
                }
            </DialogContainer>
        );
    };

    protected abstract renderHeaderContent(): JSX.Element;

    protected abstract getButtons(): JSX.Element;

    protected abstract renderContent(): JSX.Element;

    protected renderButton(action: (ev: React.MouseEvent<any>) => void, labelKey: string) {
        return (
            <button className='button button--flat'
                onClick={action}>{translate(labelKey)}
            </button>
        );
    }
}
