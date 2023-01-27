
import { ModalType } from '../../constants/modalTypes';
import { IGlobalState } from '../../models/globalState';
import { isIncompleteModalShown } from '../../services/modals/isModalTypeShown';
import translate from '../../utils/translate';
import { goToPrevModal, hideAllModals, replaceModal, showModal } from '../modalActions';
import { showToast } from '../toasts/toastActions';
import { ThunkAction, ThunkDispatch } from '../thunks';
import { IListItem } from 'src/models/list/IListItem';

export const hideModalAndShowDetailsFailedToast = (hideModalPredicate: () => boolean, dispatch: ThunkDispatch) => (err: any) => {
    if (hideModalPredicate()) {
        dispatch(hideAllModals());
    }
    dispatch(showToast({ message: translate('toast.failed-to-load-details.message') }));
    return Promise.reject(err);
};

export const openListOfEntitiesOrOpenItem = <T>(openItem: (t: T) => ThunkAction<void>, listItems: T[]): ThunkAction<void> => 
    (dispatch, getState) => {
    if (isIncompleteModalShown(getState)) {
        if (listItems.length <= 0) {
            dispatch(goToPrevModal());
        } else if (listItems.length > 1) {
            replaceModal(ModalType.ListOfEntitiesModal, { listItems, openItem })(dispatch);
        } else {
            dispatch(goToPrevModal());
            dispatch(openItem(listItems[0]));
        }
    }
}

export const queryAndShowDetailsDialogFromListItem = (listItem: IListItem): ThunkAction<void> => 
    (dispatch, getState) => {
        const entityType = listItem.entityType;
        //const title = entityType === EntityType.Technician ? '' : entityTypeToString(entityType);
        const title = listItem.title;
        dispatch(showModal(ModalType.IncompleteDialog, { title }));
        listItem.queryDetails().then(result => {
            dispatch(goToPrevModal());
            dispatch(showModal(listItem.modalType, result));
        });
    };

export const queryAndShowDetailsDialogGeneric = <T>(title: string, query: (state: IGlobalState) => Promise<T>, open: (t: T) => ThunkAction<void>): ThunkAction<void> => 
    (dispatch, getState) => {
        dispatch(showModal(ModalType.IncompleteDialog, { title }));
        query(getState()).then(result => dispatch(open(result)));
    };