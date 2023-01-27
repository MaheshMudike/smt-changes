import { EnumValues } from 'enum-values';
import * as React from 'react';
import * as _ from 'lodash';
import { connect } from 'react-redux';

import Opportunity from '../../models/feed/Opportunity';
import { renderFields } from '../../components/forms/renderFields';
import opportunityFields from '../../components/fields/opportunityFields';
import {ContactsDetails} from '../../components/partials/ContactsDetails';
import { queryOpportunityContactRoles } from '../../actions/integration/opportunitiesActions';
import { IGlobalState } from '../../models/globalState';
import { TabbedDetail } from '../tabs/TabbedDetail';
import translate from '../../utils/translate';
import { entityFieldsDataFromState } from '../fields/EntityFieldsData';

type IOpportunityDetailsProps = ReturnType<typeof OpportunityDetailStateProps> & typeof OpportunityDetailDispatchProps & { opportunity: Opportunity };

class OpportunityDetail extends React.Component<IOpportunityDetailsProps, { currentTab: OpportunityDialogTab; }> {

    constructor(props: IOpportunityDetailsProps) {
        super(props);
        this.state = { currentTab: OpportunityDialogTab.BasicInfo };
    }

    public componentDidMount() {
        this.queryContactsIfContactsTabVisible(this.props, this.state.currentTab);
    }

    public componentWillReceiveProps(nextProps: IOpportunityDetailsProps) {
        if (this.props.opportunity.id !== nextProps.opportunity.id) {
            this.queryContactsIfContactsTabVisible(nextProps, this.state.currentTab);       
        }
    }

    private queryContactsIfContactsTabVisible(props: IOpportunityDetailsProps, tab: OpportunityDialogTab) {        
        if(tab === OpportunityDialogTab.RelatedContacts) {
            props.queryOpportunityContactRoles(props.opportunity.id);
        }
    }

    public render() {
        return ( 
        <TabbedDetail items={EnumValues.getNames(OpportunityDialogTab).map(name => (
                <span>{translate(`opportunity-details.tab.${ name.toLowerCase() }`)}</span> 
            ))}
            onChangeTab={tab => {
                this.setState({ ...this.state, currentTab: tab });
                this.queryContactsIfContactsTabVisible(this.props, tab);
            }}
            selectedTab={this.state.currentTab} >
            {this.renderDialogContent()}
        </TabbedDetail>
        );
    };

    private renderDialogContent() {
        switch (this.state.currentTab) {
            case OpportunityDialogTab.BasicInfo:
                return <div>{renderFields(opportunityFields(this.props.opportunity, this.props.entityFieldsData))}</div>;
            case OpportunityDialogTab.RelatedContacts:
                return <div className='padding-top--std'><ContactsDetails contacts={_.clone(this.props.opportunityContacts.items)} online={true} /></div>
            default:
                return null;
        }
    };

}

enum OpportunityDialogTab {
    BasicInfo,
    RelatedContacts,
}

const OpportunityDetailStateProps = (state: IGlobalState) => {
    return { opportunityContacts: state.opportunityContacts, entityFieldsData: entityFieldsDataFromState(state) };
}

const OpportunityDetailDispatchProps = { queryOpportunityContactRoles }

export default connect(OpportunityDetailStateProps, OpportunityDetailDispatchProps)(OpportunityDetail);