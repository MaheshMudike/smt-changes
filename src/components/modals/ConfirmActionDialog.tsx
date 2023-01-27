import * as React from 'react';

import translate from '../../utils/translate';
import { AbstractWhiteDialog } from './AbstractWhiteDialog';
import { IModalDefinition } from 'src/models/modals/state';
import { hideAllModals } from 'src/actions/modalActions';
import { connect } from 'react-redux';

class ConfirmActionDialogClass extends AbstractWhiteDialog<
    IModalDefinition<{ labelKeyPrefix: string; action: () => void; }> & { hideAllModals: typeof hideAllModals }, 
    object
> {

    constructor(props: any) {
        super(props);
    }

    protected renderHeaderContent(): JSX.Element {
        return (
            <span>{translate(`${ this.props.modalProps.labelKeyPrefix }.title`)}</span>
        );
    }

    protected getButtons(): JSX.Element {
        return (
            <div>
                {this.renderButton(() => this.props.hideAllModals(), `${ this.props.modalProps.labelKeyPrefix }.cancel`)}
                {this.renderButton(() => this.props.modalProps.action(), `${ this.props.modalProps.labelKeyPrefix }.confirm`)}
            </div>
        );
    }

    protected renderContent(): JSX.Element {
        return (
            <div className='padding-vertical--large padding-horizontal--std font-size--s'>
                {translate(`${ this.props.modalProps.labelKeyPrefix }.content`)}
            </div>
        );
    }

    protected renderButton(action: (ev: React.MouseEvent<any>) => void, labelKey: string) {
        return (
            <button className='button button--flat'
                onClick={action}>{translate(labelKey)}
            </button>
        );
    }
}

export const ConfirmActionDialog = connect(null, { hideAllModals })(ConfirmActionDialogClass)