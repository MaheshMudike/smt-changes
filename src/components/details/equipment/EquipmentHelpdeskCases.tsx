import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';

import { downloadEquipmentHelpdeskCases } from '../../../actions/integration/equipmentActions';
import { IGlobalState } from '../../../models/globalState';
import translate from '../../../utils/translate';
import Subheader from '../../layout/Subheader';
import HelpdeskCase from '../../../models/feed/HelpdeskCase';
import { conditions } from '../../../actions/http/jsforceMappings';
import ModalButton from '../../forms/ModalButton';
import { ModalType } from '../../../constants/modalTypes';
import { StatusContainerItems } from '../../StatusContainer';
import { ListItem } from '../../list/ListItem';
import { entityFieldsDataFromState, EntityFieldsData } from 'src/components/fields/EntityFieldsData';
//import { conditions } from './http/jsforceMappings';

type EquipmentHelpdeskCasesProps = ReturnType<typeof equipmentHelpdeskCasesState> & { id: string } & typeof equipmentHelpdeskCasesDispatch;

//Equipment 11544817 has many cases
class EquipmentHelpdeskCasesClass extends React.Component<EquipmentHelpdeskCasesProps, {}> {
    public render() {
        const helpdeskCases = this.props.helpdeskCases.items;
        const entityFieldsData = this.props.entityFieldsData;
        return (
            <StatusContainerItems isProcessing={this.props.helpdeskCases.isProcessing} items={helpdeskCases}>
            <div className='equipment-service-orders'>
                {this.renderSection(helpdeskCases.filter(hc => !conditions.Case.closed.isFullfilledByValue(hc.status)), 'generic.open', entityFieldsData)}
                {this.renderSection(helpdeskCases.filter(hc => conditions.Case.closed.isFullfilledByValue(hc.status)), 'generic.closed', entityFieldsData)}
            </div>
            </StatusContainerItems>
        );
    }

    public componentWillReceiveProps(nextProps: EquipmentHelpdeskCasesProps) {
        if (this.props.id !== nextProps.id) {
            this.props.downloadEquipmentHelpdeskCases(nextProps.id);
        }
    }

    public componentDidMount() {
        this.props.downloadEquipmentHelpdeskCases(this.props.id);
    }

    private renderSection(cases: HelpdeskCase[], title: string, entityFieldsData: EntityFieldsData) {
        return (
            <div key={title}>
                <Subheader>
                    {translate(title)}
                </Subheader>
                {cases.map(c => (
                    <ModalButton key={c.id} modalType={ ModalType.HelpdeskModal } modalProps={ c } >
                        <ListItem item={c} onClick={_.noop} entityFieldsData={ entityFieldsData }/>
                    </ModalButton> 
                ))}
            </div>
        );
    }
}

const equipmentHelpdeskCasesState = (state: IGlobalState) => ({ 
    helpdeskCases: state.equipmentDetails.helpdeskCases,
    entityFieldsData: entityFieldsDataFromState(state)
})
const equipmentHelpdeskCasesDispatch = {
    downloadEquipmentHelpdeskCases
}

export const EquipmentHelpdeskCases = connect(equipmentHelpdeskCasesState, equipmentHelpdeskCasesDispatch)(EquipmentHelpdeskCasesClass);
