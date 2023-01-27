import { ModalType } from '../../constants/modalTypes';
import { EntityType } from '../../constants/EntityType';
import { IdentifiableWithTitleEntity } from '../feed/ISObject';
import { EntityFieldsData } from 'src/components/fields/EntityFieldsData';

export interface ITitle {
    title: string;
}

export interface ITitleBody extends ITitle {
    body: (entityFieldsData: EntityFieldsData) => string;
    bodySecondLine?: string;
}

export interface IdentifiableTitleBodyHighPriority extends ITitleBody {
    isHighPriority: boolean;
    id: string;

    buttons?: React.ReactNode;
}

export interface ITitleBodyHighPriority extends ITitleBody {
    isHighPriority: boolean;
}

export interface IDetailModal<TDetail> {
    entityType: EntityType;
    title: string;
    modalType: ModalType;
    queryDetails: () => Promise<TDetail>
}

export interface IListItemDetail<TDetail> extends IdentifiableTitleBodyHighPriority , IDetailModal<TDetail> {
}

export interface IListItem extends IListItemDetail<IdentifiableWithTitleEntity> {
}

export interface IDialogListItem extends IListItem {
    modalType: ModalType;
}
