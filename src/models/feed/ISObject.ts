import { EntityType } from "../../constants/EntityType";
import { IDialogListItem } from "../list/IListItem";
import IEventSource from "../events/IEventSource";

export interface Identifiable {
    id: string;
}

export interface IdentifiableWithTitle extends Identifiable {
    title: string;
}

export interface IdentifiableWithTitleEntity extends IdentifiableWithTitle {
    entityType: EntityType;
}

export interface ISalesForceEventSource extends IDialogListItem , IEventSource {}

export const equalsById = (a: Identifiable) => (b: Identifiable) => b.id === a.id;