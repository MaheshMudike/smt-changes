import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { IGlobalState, userIdFromState } from '../../../models/globalState';
import { ItemsListDataStatus } from 'src/components/partials/ItemsList';
import { querySMTAutomationRuleBase } from 'src/actions/http/jsforceBase';
import { conditions, SObject } from 'src/actions/http/jsforceMappings';
import { queryEquipmentLastServiceOrder } from 'src/actions/http/jsforce';
import { showModal } from 'src/actions/modalActions';
import { entityFieldsDataFromState, EntityFieldsData } from 'src/components/fields/EntityFieldsData';
import Subheader from 'src/components/layout/Subheader';
import translate from 'src/utils/translate';
import { ListItem } from 'src/components/list/ListItem';
import { asyncHttpActionGenericLocalState3 } from 'src/actions/http/httpActions';
import Equipment from 'src/models/equipment/Equipment';
import { ModalType } from 'src/constants/modalTypes';
import { DataStatus, initialItemsStatus, ComponentStatus } from 'src/models/IItemsState';
import ReactComponent from './MyReactComponent';
import { SMT_Automation_Rule__c } from 'src/models/api/coreApi';
import { upsertBulk } from 'src/actions/http/jsforceCore';
import { toastMessages } from 'src/constants/toastMessages';
import { queryActiveAssetsForAccount } from 'src/actions/integration/accountActions';

type AccountDetailEquipmentTabDispatchProps = {
    showModal: (modalType: ModalType, modalProps?: any) => void,
    downloadEquipment: (accountId: string) => Promise<{ equipment: Equipment[], automationRules: SMT_Automation_Rule__c[] }>,
    synchronizeAutomationRules: (rules: SMT_Automation_Rule__c[]) => Promise<void>
}
type AccountDetailEquipmentTabProps = AccountDetailEquipmentTabDispatchProps & { accountId: string, entityFieldsData: EntityFieldsData };

class AccountDetailClass extends ReactComponent<
    AccountDetailEquipmentTabProps, 
    { 
        equipment: DataStatus<{ items: Equipment[]; title: string; }[]>, 
        automationRuleByEquipment: _.Dictionary<SMT_Automation_Rule__c>,
        groupCheckboxes: _.Dictionary<boolean>
    }
> {

    constructor(props: AccountDetailEquipmentTabProps) {
        super(props);
        this.state = { equipment: initialItemsStatus() , automationRuleByEquipment: {}, groupCheckboxes: {} };
    }

    public componentDidMount() {
        this.queryEquipmentAndRules(); 
    }

    queryEquipmentAndRules = () => {
        super.runPromise(
            () => this.props.downloadEquipment(this.props.accountId), 
            (ds, prevState) => {
                const assets = ds.data && ds.data.equipment || [];
                const assetsBySite = _.groupBy(assets, a => a.siteName)
                const assetsSiteGroups = Object.keys(assetsBySite).map(key => ({ items: assetsBySite[key], title: key }));

                const existingRulesByEquipment = ds.data && _.keyBy(ds.data.automationRules, r => r.Asset__c) || {};
                const emptyRules = assets.map(a => 
                    ({ Id: undefined, Asset__c: a.id, Notification_Enabled__c: false, Task_Enabled__c: false, User__c: this.props.entityFieldsData.userId })
                );
                const emptyRulesByEquipment = _.keyBy(emptyRules, r => r.Asset__c);
                const automationRuleByEquipment = { ...emptyRulesByEquipment, ...existingRulesByEquipment }//_.keyBy(emptyRules, r => r.Asset__c);

                const groupCheckboxes = {};
                assetsSiteGroups.forEach(g => groupCheckboxes[g.title + SettingType.Notifications] = false);
                assetsSiteGroups.forEach(g => groupCheckboxes[g.title + SettingType.Tasks] = false);
                assetsSiteGroups[SettingType.Notifications] = false;
                assetsSiteGroups[SettingType.Tasks] = false;

                return { ...prevState, equipment: { ...ds, data: assetsSiteGroups }, automationRuleByEquipment, groupCheckboxes };
            },
            {
                equipment: _.flatMap(this.state.equipment.data, d => d.items), 
                automationRules: _.values(this.state.automationRuleByEquipment) 
            }
        );
    }

    public render() {
        return (
            <ItemsListDataStatus
                topbar={
                    <React.Fragment>
                        <div className="container--horizontal padding-left--std padding-right--std">
                            <div className="flex-grow--1">
                                <button type="button" onClick={() => this.saveNotificationSettings()} className={"btn btn-default btn-primary" }>
                                    {translate('account-detail.save-notification-settings')}
                                </button>
                            </div>
                            {this.allCheckbox(this.checkboxLabel(SettingType.Tasks), SettingType.Tasks)}
                            {this.allCheckbox(this.checkboxLabel(SettingType.Notifications), SettingType.Notifications)}
                        </div>
                    </React.Fragment>
                }
                dataStatus={this.state.equipment}
                key={this.props.accountId + 'equipmentTab'}
                renderItem={(group: { title: string, items: Equipment[] }, style) =>
                    <div key={group.title}>
                        <Subheader>
                            <div className='flex-grow--1'>{translate(group.title)}</div>
                            {this.groupCheckbox(group.title, this.checkboxLabel(SettingType.Tasks), SettingType.Tasks)}
                            {this.groupCheckbox(group.title, this.checkboxLabel(SettingType.Notifications), SettingType.Notifications)}
                        </Subheader>
                        {group.items.map(item => (
                            <ListItem item={item} onBodyClick={() => this.props.showModal(item.modalType, item)} entityFieldsData={this.props.entityFieldsData}>
                                {this.equipmentCheckbox(item.id, this.checkboxLabel(SettingType.Tasks), SettingType.Tasks)}
                                {this.equipmentCheckbox(item.id, this.checkboxLabel(SettingType.Notifications), SettingType.Notifications)}
                            </ListItem>
                        ))}
                    </div>
                }
            />
        );
    };

    private checkboxLabel(settingType: SettingType) {
        switch(settingType) {
            case SettingType.Notifications:
                return translate('automation-rule.activate-notifications');
            case SettingType.Tasks:
                return translate('automation-rule.activate-tasks');
            default:
                return null;
        }
    }

    private checkbox = (id: string, label: string, settingType: SettingType, checked: boolean, onChange: () => void) => {
        const inputId = id + settingType;
        return <div className={'checkbox checkbox--right font-size--s padding-horizontal--std margin-left--auto padding-left--std col-xs-3'} >
            <input type='checkbox' id={inputId} checked={checked} onChange={onChange}
                />
            <label htmlFor={inputId} className='padding-small--left'>
                {label}
            </label>
        </div>
    }

    private allCheckbox = (label: string, settingType: SettingType) => {
        return this.checkbox(settingType, label, settingType, this.state.groupCheckboxes[settingType], () => this.toggleAll(settingType));
    }

    private groupCheckbox = (location: string, label: string, settingType: SettingType) => {
        return this.checkbox(location + settingType, label, settingType, this.state.groupCheckboxes[location + settingType], () => this.toggleGroup(location, settingType));
    }

    private equipmentCheckbox = (id: string, label: string, settingType: SettingType) => {
        return this.checkbox(id, label, settingType, this.isEquipmentCheckboxChecked(id, settingType), () => this.toggleCheckbox(id, settingType));
    }

    private isEquipmentCheckboxChecked = (id: string, type: SettingType): boolean => {
        const rule = this.state.automationRuleByEquipment[id];
        if(rule == null) return false;
        switch(type) {
            case SettingType.Notifications:
                return rule.Notification_Enabled__c;
            case SettingType.Tasks:
                return rule.Task_Enabled__c;
            default:
                return null;
        }
    }

    private toggleCheckbox = (id: string, type: SettingType) => {
        const rule = this.state.automationRuleByEquipment[id];
        switch(type) {
            case SettingType.Notifications:
                rule.Notification_Enabled__c = !rule.Notification_Enabled__c;
                break;
            case SettingType.Tasks:
                rule.Task_Enabled__c = !rule.Task_Enabled__c;
                break;
            default:
        }
        this.setState(prev => ({ ...prev, automationRuleByEquipment: { ...prev.automationRuleByEquipment, [id]: rule } }));
    };

    private toggleAll = (type: SettingType) => {
        this.state.groupCheckboxes[type] = !this.state.groupCheckboxes[type];
        this.state.equipment.data.forEach(g => this.state.groupCheckboxes[g.title + type] = this.state.groupCheckboxes[type]);
        const locationAssets = _.flatMap(this.state.equipment.data, e => e.items);
        this.toggleIds(locationAssets.map(a => a.id), this.state.groupCheckboxes[type], type);
    }

    private toggleGroup = (location: string, type: SettingType) => {
        const checkboxId = location + type;
        this.state.groupCheckboxes[checkboxId] = !this.state.groupCheckboxes[checkboxId];
        const locationAssets = this.state.equipment.data.filter(e => e.title === location)[0].items;
        this.toggleIds(locationAssets.map(a => a.id), this.state.groupCheckboxes[checkboxId], type);
    };

    private toggleIds = (equipmentIds: string[], value: boolean, type: SettingType) => {
        const rules = equipmentIds.map(id => {
            const rule = this.state.automationRuleByEquipment[id];
            switch(type) {
                case SettingType.Notifications:
                    rule.Notification_Enabled__c = value
                    return rule;
                case SettingType.Tasks:
                    rule.Task_Enabled__c = value;
                    return rule;
                default:
                    return rule;
            }
        });
        const rulesByEquipment = _.keyBy(rules, r => r.Asset__c);
        this.setState(prev => ({ ...prev, automationRuleByEquipment: { ...prev.automationRuleByEquipment, ...rulesByEquipment } }));
    };

    private saveNotificationSettings = () => {
        super.runPromise(
            () => this.props.synchronizeAutomationRules(_.values(this.state.automationRuleByEquipment)),
            (ds, prevState) => {
                return { ...prevState, equipment: { ...prevState.equipment, status: ds.status } };
            }
        ).then(
            () => this.queryEquipmentAndRules()
        )
    }

}

const downloadEquipment = (accountId: string) => 
    asyncHttpActionGenericLocalState3(
        async (state) => {
            const assets = await queryActiveAssetsForAccount(accountId).sort('LastModifiedDate', 'DESC');
            const assets2 = await queryEquipmentLastServiceOrder(assets);
            const equipment = assets2.map(a => new Equipment(a, entityFieldsDataFromState(state)));

            const { SMT_Automation_Rule__c } = conditions;
            const automationRules = await querySMTAutomationRuleBase(
                [SMT_Automation_Rule__c.user(userIdFromState(state)), SMT_Automation_Rule__c.assets(assets.map(a => a.Id))]
            );
            return { equipment, automationRules };
        }
    )

const synchronizeAutomationRules = (rules: SMT_Automation_Rule__c[]) => 
    asyncHttpActionGenericLocalState3(
        async (state) => {
            const { SMT_Automation_Rule__c } = conditions;
            const existingRules = await querySMTAutomationRuleBase(
                [SMT_Automation_Rule__c.user(userIdFromState(state)), SMT_Automation_Rule__c.assets(rules.map(a => a.Asset__c))]
            );
            const existingRulesByAsset = _.groupBy(existingRules, r => r.Asset__c);
            rules.forEach(r => {
                if(existingRulesByAsset[r.Asset__c] != null) r.Id = existingRulesByAsset[r.Asset__c][0].Id;
            })
            await upsertBulk(SObject.SMT_Automation_Rule__c, rules);
        },
        { onSucceed: toastMessages().NOTIFICATION_RULES_SAVED, onFail: () => toastMessages().NOTIFICATION_RULES_SAVED_FAILED }
    )

enum SettingType {
    Tasks = 'Tasks',
    Notifications = 'Notifications'
}

const accountDetailDispatchProps = {
    showModal, downloadEquipment, synchronizeAutomationRules
}

const accountDetailStateProps = (state: IGlobalState) => ({
    reports: state.reports.reports,
    entityFieldsData: entityFieldsDataFromState(state)
});

export const AccountDetailEquipmentTab = connect(accountDetailStateProps, accountDetailDispatchProps)(AccountDetailClass)