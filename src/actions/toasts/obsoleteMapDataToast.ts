import { Dispatch } from 'redux';

import { IActionToast } from '../../models/toasts';
import translate from '../../utils/translate';

import { synchronizeMap } from '../integration/synchronization';
import { hideToast } from './toastActions';
import { ThunkDispatch } from '../thunks';

let dispatch: ThunkDispatch;//Dispatch<any>;

class ObsoleteMapDataToast implements IActionToast {
    public readonly requiresManualHiding = true;

    public action = () => {
        dispatch(hideToast(this));
        dispatch(synchronizeMap());
    }

    public initialize(value: Dispatch<any>) {
        dispatch = value;
    }

    get actionTitle() {
        return translate('toast.obsolete-map-data.action');
    }

    get message() {
        return translate('toast.obsolete-map-data.message');
    }
};

export const obsoleteMapDataToast = new ObsoleteMapDataToast();
