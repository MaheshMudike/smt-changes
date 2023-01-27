import { parseDate } from '../../../utils/parse';
import { IServiceContractReport } from '../../api/coreApi';
import WrapperObject from '../../WrapperObject';
import { uniq } from 'lodash';

export default class Contract extends WrapperObject<IServiceContractReport> {
    get id(): string {
        return this.value.Id;
    }

    get endDate(): Date {
        return this.parseContractEndDate(this.value.EndDate);
    }

    get name() {
        return this.value.Name;
    }

    get type() {
        //return this.value.Contract_Type__c;
        //return this.value.Rush_Contract_Type_Code__c;
        return this.value.Contract_Type_Code__c;
    }

    get numberOfEquipment(): string {
        // const assetIds = (this.value.ContractLineItems && this.value.ContractLineItems.records || []).filter(cli => cli.AssetId != null).map(cli => cli.AssetId);
        // return uniq(assetIds).length + '';
        return this.value.Number_of_Equipments__c;
    }

    get buildingManagerContactName(): string {
        return 'TODO';
        /*
        return Optional.ofNullable(this.value.Building_Manager_Contact__r)
            .map(c => c.Name)
            .orElse(null);
            */
    }

    get riskScore() {
        return this.value.Risk_Score__c;
    }

    get riskProfitVerbatim() {
        return this.value.Profit_Verbatim__c;
    }

    get riskScoreDate() {
        return this.value.Risk_Score_Date__c;
    }

    get riskScoreReason() {
        return this.value.Risk_Score_Reason__c;
    }

    private parseContractEndDate(input: string): Date {
        return parseDate(input);
    }
}
