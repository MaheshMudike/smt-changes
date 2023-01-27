import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import * as cx from 'classnames';

import { chooseSelectedOpportunityBusinessTypes as chooseSelectedOpportunityBusinessTypes } from '../../actions/mapActions';
import translate from '../../utils/translate';
import { AbstractWhiteDialog } from './AbstractWhiteDialog';
import { OpportunityBusinessType, opportunityBusinessTypeName } from '../../constants/opportunityBusinessType';
import {enumToCheckboxes} from '../../components/modals/MapEquipmentFilteringModal';
import { IModalDefinition } from 'src/models/modals/state';
import { hideAllModals } from 'src/actions/modalActions';

type IMapOpportunityFiltersModalProps = typeof MapOpportunityFilteringModalDispatchProps & IModalDefinition<IMapOpportunityFilters>;

interface IMapOpportunityFilters {
    selectedOpportunityBusinessTypes: OpportunityBusinessType[]
}

class MapOpportunityFilteringModalClass extends AbstractWhiteDialog<IMapOpportunityFiltersModalProps, IMapOpportunityFilters> {
    constructor(props: IMapOpportunityFiltersModalProps) {
        super(props);
        this.state = {
            selectedOpportunityBusinessTypes: props.modalProps.selectedOpportunityBusinessTypes || []
        };
    }

    protected renderHeaderContent(): JSX.Element {
        return <span>{translate('map-service-order-layers-modal.title')}</span>;
    }

    protected renderContent(): JSX.Element {
        
        return (
            <div className='font-size--s'>
            {/*
                <div className='padding-horizontal--std padding-vertical--large'>
                    {translate('map-service-order-layers-modal.description')}
                </div>
            */}
                <div>
                    <div className={cx("list-detail__header container--horizontal relative separated--bottom-dark"//, { 'is-open': this.state.workcentersOpen}
                        )}>
                        <span className='padding-vertical--large'
                            //onClick={() => this.setState({ workcentersOpen: !this.state.workcentersOpen })}
                        >
                            {/*<div className="Select-arrow" />*/}
                            {translate('map-opportunity-filtering-modal.opportunity-business-types')}
                        </span>
                    </div>
                         <div className='padding-vertical--large'>
                         {
                             enumToCheckboxes(
                                 OpportunityBusinessType, 
                                 this.isOpportunityStatusChecked, this.toggleOpportunityStatusCheckbox,
                                 v => opportunityBusinessTypeName(v), 
                                 'padding-small--left'
                             )
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
                    this.props.chooseSelectedOpportunityBusinessTypes(this.state.selectedOpportunityBusinessTypes);
                }, 'map-service-order-layers-modal.choose')}
            </div>
        );
    };

    private isOpportunityStatusChecked = (v: OpportunityBusinessType): boolean => {
        return this.state.selectedOpportunityBusinessTypes && this.state.selectedOpportunityBusinessTypes.indexOf(v) > -1;
    };

    private toggleOpportunityStatusCheckbox = (v: OpportunityBusinessType) => {
        this.setState({
            selectedOpportunityBusinessTypes: _.xor(this.state.selectedOpportunityBusinessTypes, [v]),
        });
    };
}

const MapOpportunityFilteringModalDispatchProps = {
    chooseSelectedOpportunityBusinessTypes,
    hideAllModals
}

export const MapOpportunityFilteringModal = connect(null, MapOpportunityFilteringModalDispatchProps)(MapOpportunityFilteringModalClass);
