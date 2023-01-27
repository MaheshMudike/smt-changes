import { IPayloadAction } from "../../actions/actionUtils";

export interface IFilterButton<TFilterEnum> {
    selectedOption: TFilterEnum;
    select: (payload: TFilterEnum) => IPayloadAction<TFilterEnum>;
}