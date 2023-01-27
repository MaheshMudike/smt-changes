import { IPayloadAction } from "../../actions/actionUtils";

export interface IGroupingButton<TGroupingEnum> {
    selectedOption: TGroupingEnum;
    select: (payload: TGroupingEnum) => IPayloadAction<TGroupingEnum>;
}
