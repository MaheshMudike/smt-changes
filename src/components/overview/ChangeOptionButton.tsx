import * as cx from 'classnames';
import { connect } from 'react-redux';
import * as _ from 'lodash';
import * as React from 'react';

import { showModal } from '../../actions/modalActions';
import { ModalType } from '../../constants/modalTypes';
import { SvgIcon } from '../../constants/SvgIcon';
import translate from '../../utils/translate';
import { Icon } from '../layout/Icon';
import { ISelectOptionDialogProps } from '../modals/SelectOptionDialog';

interface IChangeOptionButtonProps<T> extends ISelectOptionDialogProps<T> {
    icon: SvgIcon;
    showModal: typeof showModal;
    className?: string;
}

class ChangeOptionButtonClass<T> extends React.Component<IChangeOptionButtonProps<T>, {}> {
    public render() {
        return (
            <button className={cx('filter-button padding-vertical--std', this.props.className)}
                onClick={() => this.props.showModal(ModalType.SelectOptionModal, this.props)}>
                {this.selectedIndex >= 0 ? translate(this.props.options[this.selectedIndex][1]) : ''}
                <Icon svg={this.props.icon} className='flex-shrink--0' />
            </button>
        );
    }

    private get selectedIndex() {
        return _.findIndex(this.props.options, o => o[0] === this.props.selectedOption);
    }
}

export const ChangeOptionButton = connect(null, { showModal })(ChangeOptionButtonClass);
