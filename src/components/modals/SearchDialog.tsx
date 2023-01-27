import * as React from 'react';

import { SvgIcon } from '../../constants/SvgIcon';
import WithIcon from '../forms/WithIcon';
import { DialogContainer } from './layout/DialogContainer';
import { DialogContent } from './layout/DialogContent';
import { DialogHeader } from './layout/DialogHeader';
import { hideAllModals, goToPrevModal } from '../../actions/modalActions';


export class SearchDialogClass extends React.Component<WriteTaskModalProps, object> {
    public render() {
        return (
            <DialogContainer>
                <DialogHeader title={this.props.title} />
                <WithIcon icon={SvgIcon.Contacts} className='separated'>
                    <input autoFocus value={this.props.searchPhrase} 
                        onChange={(ev: React.FormEvent<any>) => this.props.setSearchPhrase(ev.currentTarget.value) }
                        type='text' placeholder={this.props.inputPlaceholder}
                    />
                </WithIcon>
                <DialogContent>
                    {this.props.children}
                </DialogContent>
            </DialogContainer>
        );        
    }

}

export interface ISearchDialogStateProps {
    searchPhrase: string;
    title: string;
    inputPlaceholder: string;
}

export interface ISearchDialogDispatchProps {    
    setSearchPhrase: (s: string) => void;    
}

export interface IModalHideGoToPrev {
    hideModal: typeof hideAllModals;
    goToPrevModal: typeof goToPrevModal;
}

type WriteTaskModalProps = ISearchDialogStateProps & ISearchDialogDispatchProps & IModalHideGoToPrev ;
