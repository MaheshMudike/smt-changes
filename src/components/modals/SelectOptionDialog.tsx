import * as React from 'react';

import translate from '../../utils/translate';
import { DialogContainer } from './layout/DialogContainer';
import { DialogContent, DialogContentPadding } from './layout/DialogContent';
import { IModalDefinition } from 'src/models/modals/state';
import { hideAllModals } from 'src/actions/modalActions';
import { connect } from 'react-redux';

export interface ISelectOptionDialogProps<T> {
    header: string;
    options: [T, string][];
    selectedOption: T;
    select: (t: T) => any;
}

class SelectOptionDialogClass<T> extends React.Component<
    IModalDefinition<ISelectOptionDialogProps<T>> & { hideAllModals: typeof hideAllModals; }, 
    object
> {

    public render() {
        const { modalProps } = this.props;
        return (
            <DialogContainer>
                <DialogContent padding={DialogContentPadding.None}>
                    <div className='blue-header padding-horizontal--std padding-vertical--large'>
                        {modalProps.header}
                    </div>
                    <div className='padding-bottom--std container--vertical font-size--s'>
                        <div className='scrollable flex--1'>
                            {modalProps.options.map(this.renderOption, this)}
                        </div>
                    </div>
                </DialogContent>
            </DialogContainer>
        );
    };

    private renderOption(option: [T, string], index: number) {
        return (
            <div className='container--horizontal font-size--s padding-vertical--large clickable' key={index}
                onClick={this.select(option[0])}>
                <div className='flex--1 padding-horizontal--std'>
                    {translate(option[1])}
                </div>
            </div>
        );
    }

    private select = (x: T) => () => {
        this.props.modalProps.select(x);
        this.props.hideAllModals();
    }
}

export const SelectOptionDialog = connect(null, { hideAllModals })(SelectOptionDialogClass)