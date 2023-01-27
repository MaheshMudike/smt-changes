import { ModalType } from '../../constants/modalTypes';

export const enum ExternalClosingStrategy {
    PrevModal,
    NoClosing,
}

export interface IModalDefinition<T> {
    modalProps: T;
    modalType: ModalType;
    key: string;
}
