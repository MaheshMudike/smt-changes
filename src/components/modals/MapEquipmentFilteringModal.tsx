import { EnumValues } from 'enum-values';
import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import * as cx from 'classnames';

import { chooseSelectedContractStatusesAndWorkcenters, chooseSelectedEquipmentStatuses } from '../../actions/mapActions';
import { IGlobalState } from '../../models/globalState';
import translate from '../../utils/translate';
import { AbstractWhiteDialog } from './AbstractWhiteDialog';
import { contractStatusName, ContractLineStatusFilter } from '../../constants/ContractLineStatus';
import { EnumValueType } from 'enum-values/src/enumValues';
import { ISelectableItemsState, IItemsState } from '../../models/IItemsState';
import { EquipmentMapItem } from '../../models/map/wrappers';
import { joinOptionals } from '../../utils/formatUtils';
import { EquipmentStatusFilter, equipmentStatusName } from '../../constants/equipmentStatus';
import { IModalDefinition } from 'src/models/modals/state';
import { hideAllModals } from 'src/actions/modalActions';

interface IMapEquipmentFiltersModalProps extends IModalDefinition<IMapEquipmentFilters> {
    chooseSelectedContractStatusesAndWorkcenters: typeof chooseSelectedContractStatusesAndWorkcenters;
    chooseSelectedEquipmentStatuses: typeof chooseSelectedEquipmentStatuses;
    equipment: IItemsState<EquipmentMapItem>;
    hideAllModals: typeof hideAllModals;
}

interface IMapEquipmentFilters {
    selectedWorkcenters: string[],
    selectedContractStatuses: ContractLineStatusFilter[],
    selectedEquipmentStatuses: EquipmentStatusFilter[],
    //workcentersOpen: boolean;
    //contractStatusesOpen: boolean;
}

class MapEquipmentFilteringModalClass extends AbstractWhiteDialog<IMapEquipmentFiltersModalProps, IMapEquipmentFilters> {
    constructor(props: IMapEquipmentFiltersModalProps) {
        super(props);
        this.state = {
            selectedWorkcenters: props.modalProps.selectedWorkcenters || [],
            selectedContractStatuses: props.modalProps.selectedContractStatuses || [],
            selectedEquipmentStatuses: props.modalProps.selectedEquipmentStatuses || [],
            //contractStatusesOpen: true,
            //workcentersOpen: true
        };
    }

    protected renderHeaderContent(): JSX.Element {
        return <span>{translate('map-service-order-layers-modal.title')}</span>;
    }

    protected renderContent(): JSX.Element {
        const equipmentCheckboxes = 
            _.orderBy(
                _.uniqBy(this.props.equipment.items.map(e => ({ value: e.mainWorkCenter.Id, label: joinOptionals([e.mainWorkCenter.Name, e.mainWorkCenter.Description__c],' - ') })), e => e.value),
                e => e.label
            )
            /*_.orderBy(
                _.uniq(this.props.equipment.items.map(e => ({ value: e.mainWorkCenter.Id, label: e.mainWorkCenter.Name })))
            );*/
        return (
            <div className='font-size--s'>
            {/*
                <div className='padding-horizontal--std padding-vertical--large'>
                    {translate('map-service-order-layers-modal.description')}
                </div>
            */}
                <div>
                    <div className={cx("list-detail__header container--horizontal relative separated--bottom-dark"//,  { 'is-open': this.state.contractStatusesOpen }
                        )}>
                        <div className='padding-vertical--large'
                            //onClick={() => this.setState({ contractStatusesOpen: !this.state.contractStatusesOpen })}
                        >
                        {/*<div className="Select-arrow" />*/}
                        {translate('map-equipment-filtering-modal.contract-status')}</div>
                    </div>
                    <div className='padding-vertical--large'>
                        { //this.state.contractStatusesOpen && 
                            enumToCheckboxes(
                                ContractLineStatusFilter, 
                                this.isContractStatusChecked, this.toggleContractLineStatusCheckbox,
                                v => contractStatusName(ContractLineStatusFilter[v]),
                                'checkbox--left--inline-block'
                            )
                        }
                    </div>
                    <div className={cx("list-detail__header container--horizontal relative separated--bottom-dark"//,  { 'is-open': this.state.contractStatusesOpen }
                        )}>
                        <div className='padding-vertical--large'>
                          {translate('map-equipment-filtering-modal.equipment-status')}</div>
                        </div>
                    <div className='padding-vertical--large'>
                        {
                            enumToCheckboxes(
                                EquipmentStatusFilter, 
                                this.isEquipmentStatusChecked, this.toggleEquipmentStatusCheckbox,
                                v => equipmentStatusName(v), 
                                'checkbox--left--inline-block'
                            )
                        }
                    </div>
                    <div className={cx("list-detail__header container--horizontal relative separated--bottom-dark"//, { 'is-open': this.state.workcentersOpen}
                        )}>
                        <span className='padding-vertical--large'
                            //onClick={() => this.setState({ workcentersOpen: !this.state.workcentersOpen })}
                        >
                            {/*<div className="Select-arrow" />*/}
                            {translate('map-equipment-filtering-modal.work-center')}
                        </span>
                    </div>
                    <div className='padding-vertical--large'>
                    {
                        //this.state.workcentersOpen && 
                        checkboxes(equipmentCheckboxes, this.isWorkcenterChecked, this.toggleWorkcenterCheckbox)
                    }                    
                    </div>
                </div>
            </div>
        );
    }

    protected getButtons(): JSX.Element {
        return (
            <div>
                {this.renderButton(() => this.props.hideAllModals(), 'map-service-order-layers-modal.cancel')}
                {this.renderButton(() => {
                    this.props.hideAllModals();
                    this.props.chooseSelectedContractStatusesAndWorkcenters(this.state.selectedContractStatuses, this.state.selectedWorkcenters);
                    this.props.chooseSelectedEquipmentStatuses(this.state.selectedEquipmentStatuses);
                }, 'map-service-order-layers-modal.choose')}
            </div>
        );
    };

    private isEquipmentStatusChecked = (v: EquipmentStatusFilter): boolean => {
        return this.state.selectedEquipmentStatuses && this.state.selectedEquipmentStatuses.indexOf(v) > -1;
    };

    private toggleEquipmentStatusCheckbox = (v: EquipmentStatusFilter) => {
        this.setState({
            selectedEquipmentStatuses: _.xor(this.state.selectedEquipmentStatuses, [v]),
        });
    };
 
    private isContractStatusChecked = (v: ContractLineStatusFilter): boolean => {
        return this.state.selectedContractStatuses && this.state.selectedContractStatuses.indexOf(v) > -1;
    };

    private toggleContractLineStatusCheckbox = (v: ContractLineStatusFilter) => {
        this.setState({
            selectedContractStatuses: _.xor(this.state.selectedContractStatuses, [v]),
        });
    };

    private isWorkcenterChecked = (v: string): boolean => {
        return this.state.selectedWorkcenters && this.state.selectedWorkcenters.indexOf(v) > -1;
    };

    private toggleWorkcenterCheckbox = (v: string) => {
        this.setState({
            selectedWorkcenters: _.xor(this.state.selectedWorkcenters, [v]),
        });
    };
}

export function enumToCheckboxes<T extends EnumValueType>(
    enumvalue: any, isCheckboxChecked: (v: T) => boolean, toggleCheckbox: (v: T) => void, checkboxLabel: (t: T) => string, className: string) {
       
    const values = _.sortBy(
        EnumValues.getNamesAndValues<T>(enumvalue),
        item => item.name,
    )    
    .map((item, index) => ({ value: item.value, label: checkboxLabel(item.value) }));

    return checkboxes(values, isCheckboxChecked, toggleCheckbox, className);
}

export function checkboxes<T>(items: { value: T, label: string }[], isCheckboxChecked: (v: T) => boolean, toggleCheckbox: (v: T) => void, className: string = '') {
    return items.map((item, index) => {
        const v = item.value;
        const checkboxId = _.uniqueId();
        return (
            <div className={'checkbox checkbox--left font-size--s padding-horizontal--std '+className} key={index}>
                <input type='checkbox' id={checkboxId} checked={isCheckboxChecked(v)} 
                    onChange={() => toggleCheckbox(v)} />
                <label htmlFor={checkboxId} className='padding-small--left'>
                    {item.label}                    
                </label>
            </div>
        );
    })
}

export const MapEquipmentFilteringModal = connect(
    (state: IGlobalState) => ({
        //equipment: state.map.equipments,
        //selectedWorkcenters: state.map.selectedWorkcenters,
        //selectedContractStatuses: state.map.selectedContractStatuses
    }),
    {
        chooseSelectedContractStatusesAndWorkcenters,
        chooseSelectedEquipmentStatuses,
        hideAllModals
    },
)(MapEquipmentFilteringModalClass);
