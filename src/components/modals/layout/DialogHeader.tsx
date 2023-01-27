import * as cx from 'classnames';
import * as React from 'react';

import { goToPrevModal, hideAllModals } from '../../../actions/modalActions';
import { SvgIcon } from '../../../constants/SvgIcon';
import { Icon } from '../../layout/Icon';
import { connect } from 'react-redux';


interface IDialogProps {
    hideAllModals: typeof hideAllModals;
    goToPrevModal: typeof goToPrevModal;

    headerActionButtons?: JSX.Element[];
    //refactor this thing
    confirmAction?: React.ReactNode;
    primaryAction?: JSX.Element;
    buttons?: JSX.Element;
    title: string;
}

function DialogHeaderComponent(props: IDialogProps) {
    const {
        headerActionButtons = null,
        confirmAction = null,
        hideAllModals,
        goToPrevModal,
        primaryAction = null,
        buttons,
        title
    } = props;
    return (
        <div className='dialog-header'>
            <div className='dialog-header__line'>
                {goToPrevModal === null ? 
                    <button className='dialog-header__btn-close' id='js-modal-close' onClick={() => hideAllModals()} type='button'>
                        <Icon svg={SvgIcon.Close} />
                    </button>
                    : 
                    <button className='modal-dialog__topbar-btn' id='js-modal-back' onClick={() => goToPrevModal()} type='button'>
                        <Icon svg={SvgIcon.Back} className="icon-oriented"/>
                    </button>
                }
                <div style={ { marginLeft: "auto" } }/>
                {buttons}
                {headerActionButtons == null ? null : 
                    <ul className='dialog-header__actions container--horizontal'>
                        {headerActionButtons.map((action, index) => <li key={index}>{action}</li>)}
                    </ul>
                }
                {confirmAction}
            </div>

            <div className={cx('dialog-header__line', 'relative', { 'dialog-header__line--primary-action': primaryAction !== null })}>                    
                <h4 className={cx('dialog-header__title', 'dialog-header__title--line-2')}>
                    {title}
                </h4>
                <div className="container--horizontal container--inversed" style={{marginLeft: "auto"}}>{primaryAction}</div>
            </div>
        </div>
    );
}

export const DialogHeader = connect(null, { hideAllModals, goToPrevModal })(DialogHeaderComponent)