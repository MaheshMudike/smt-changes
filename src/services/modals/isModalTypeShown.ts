import * as _ from 'lodash';

import { ModalType } from '../../constants/modalTypes';
import { GetGlobalState } from '../../models/globalState';

const isModalTypeShown = (modalType: ModalType) => (getState: GetGlobalState) => {
    const modal = _.last(getState().modal);
    return modal !== null && modal.modalType === modalType;    
}

export const isIncompleteEntityModalShown = isModalTypeShown(ModalType.IncompleteEntityDialog);
export const isIncompleteModalShown = isModalTypeShown(ModalType.IncompleteDialog);
