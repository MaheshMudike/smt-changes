import { EnumValues } from 'enum-values';
import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';

import { chooseSelectedServiceOrderTypes } from '../../actions/mapActions';
import MaintenanceActivityType, { MaintenanceActivityTypeFilter, maintenanceActivityTypeFilterLabel } from '../../constants/ServiceOrderType';
import { IGlobalState } from '../../models/globalState';
import translate from '../../utils/translate';
import { AbstractWhiteDialog } from './AbstractWhiteDialog';
import { IModalDefinition } from 'src/models/modals/state';
import { hideAllModals } from 'src/actions/modalActions';

interface IMapServiceOrderLayersModalProps extends IModalDefinition<ISelectedServiceOrderTypes> {
    calloutTypes: Set<string>;
    chooseSelectedServiceOrderTypes: typeof chooseSelectedServiceOrderTypes;
    hideAllModals: typeof hideAllModals;
}

interface ISelectedServiceOrderTypes {
    selectedServiceOrderTypes: MaintenanceActivityTypeFilter[];
}

class MapServiceOrderLayersModalClass extends AbstractWhiteDialog<IMapServiceOrderLayersModalProps, ISelectedServiceOrderTypes> {
    constructor(props: IMapServiceOrderLayersModalProps) {
        super(props);
        this.state = {
            selectedServiceOrderTypes: props.modalProps.selectedServiceOrderTypes,
        };
    }

    protected renderHeaderContent(): JSX.Element {
        return (
            <span>
                {translate('map-service-order-layers-modal.title')}
            </span>
        );
    }

    protected renderContent(): JSX.Element {
        const sortedMaintenanceActivityTypeFilters = _.sortBy(
            EnumValues.getNamesAndValues<MaintenanceActivityTypeFilter>(MaintenanceActivityTypeFilter),
            item => item.name,
        );
        return (
            <div className='font-size--s'>
                <div className='padding-horizontal--std padding-vertical--large'>
                    {translate('map-service-order-layers-modal.description')}
                </div>
                <div className='padding-horizontal--std padding-vertical--large'>
                    {sortedMaintenanceActivityTypeFilters
                    .map((item, index) => {
                        const v = item.value;
                        const checkboxId = _.uniqueId();
                        return (
                            <div className='checkbox checkbox--left font-size--s padding-horizontal--std' key={index}>
                                <input type='checkbox' id={checkboxId} checked={this.isCheckboxChecked(v)} onChange={() => this.toggleCheckbox(v)} />
                                <label htmlFor={checkboxId} className='padding-small--left'>
                                    {maintenanceActivityTypeFilterLabel(v)}
                                </label>
                            </div>
                        );
                    })
                    }
                </div>
            </div>
        );
    }

    private filterMaintenanceActivityTypesFromGlobalConfig(filters: { name: string, value: MaintenanceActivityTypeFilter }[], calloutTypes: Set<String>) {
        return filters.filter(item => {
            switch(item.value) {
                case MaintenanceActivityTypeFilter.Y04_YSM1_YSM2:
                case MaintenanceActivityTypeFilter.Y04_YSM3_YSM4:
                case MaintenanceActivityTypeFilter.Y04_YSM6:
                    return calloutTypes.has(MaintenanceActivityType.Y04);
                default:
                    return calloutTypes.has(item.name);
            }
        })
    }

    protected getButtons(): JSX.Element {
        return (
            <div>
                {this.renderButton(() => this.props.hideAllModals(), 'map-service-order-layers-modal.cancel')}
                {this.renderButton(() => {
                    this.props.hideAllModals();
                    this.props.chooseSelectedServiceOrderTypes(this.state.selectedServiceOrderTypes);
                }, 'map-service-order-layers-modal.choose')}
            </div>
        );
    };

    private isCheckboxChecked = (v: MaintenanceActivityTypeFilter): boolean => {
        return this.state.selectedServiceOrderTypes.indexOf(v) > -1;
    };

    private toggleCheckbox = (v: MaintenanceActivityTypeFilter) => {
        this.setState({
            selectedServiceOrderTypes: _.xor(this.state.selectedServiceOrderTypes, [v]),
        });
    };

}

export const MapServiceOrderLayersModal = connect(
    (state: IGlobalState) => ({
        calloutTypes: new Set<string>(state.map.config.callouts.filters)
    }),
    {
        chooseSelectedServiceOrderTypes,
        hideAllModals
    },
)(MapServiceOrderLayersModalClass);
