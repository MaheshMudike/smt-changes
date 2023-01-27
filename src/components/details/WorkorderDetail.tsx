import * as React from 'react';
import * as _ from 'lodash';
import { connect } from 'react-redux';

import { renderFields } from '../../components/forms/renderFields';
import { IGlobalState } from '../../models/globalState';
import { TabbedDetail } from '../tabs/TabbedDetail';
import Callout, { CalloutListItem } from '../../models/feed/Callout';
import calloutFields from '../../components/fields/calloutFields';
import { queryOperations, querySpareParts } from '../../actions/integration/calloutActions';
import translate from '../../utils/translate';
import Subheader from '../layout/Subheader';
import { ListItem } from '../list/ListItem';
import { ItemsStatus, initialItemsStatus } from 'src/models/IItemsState';
import WorkOrderLineItem from 'src/models/feed/WorkOrderLineItem';
import ProductConsumed from 'src/models/feed/ProductConsumed';
import { DataStatusContainer } from '../StatusContainer';
import LabeledValue from '../forms/LabeledValue';
import { entityFieldsDataFromState } from '../fields/EntityFieldsData';
import { Icon } from '../layout/Icon';
import { SvgIcon } from 'src/constants/SvgIcon';
import { queryAndShowDetailsDialogFromListItem } from 'src/actions/integration/detailsActions';

type IWorkorderDetailsProps = { 
    queryOperations: (setState: (dataStatus: ItemsStatus<ProductConsumed>) => void, workorderId: string) => Promise<void>,
    querySpareParts: (setState: (dataStatus: ItemsStatus<WorkOrderLineItem>) => void, workorderId: string) => Promise<void>,
    queryAndShowDetailsDialogFromListItem: typeof queryAndShowDetailsDialogFromListItem
} 
    & { workorder: Callout } & ReturnType<typeof WorkorderDetailStateProps>;
type IWorkorderDetailsLocalState = { 
    currentTab: WorkorderDialogTab, 
    workorderProductsConsumed: ItemsStatus<ProductConsumed>, 
    workorderOperations: ItemsStatus<WorkOrderLineItem> 
}

//use 9B0000015783 order to test
class WorkorderDetail extends React.Component<IWorkorderDetailsProps, IWorkorderDetailsLocalState> {

    constructor(props: IWorkorderDetailsProps) {
        super(props);
        this.state = { 
            currentTab: WorkorderDialogTab.BasicInfo, 
            workorderProductsConsumed: initialItemsStatus<ProductConsumed>(), 
            workorderOperations: initialItemsStatus<WorkOrderLineItem>()
        };
    }

    public componentDidMount() {
        this.queryOperationsAndSparePartsIfTabVisible(this.props, this.state.currentTab);
    }

    public componentWillReceiveProps(nextProps: IWorkorderDetailsProps) {
        if (this.props.workorder.id !== nextProps.workorder.id) {
            this.queryOperationsAndSparePartsIfTabVisible(nextProps, this.state.currentTab);
        }
    }

    private queryOperationsAndSparePartsIfTabVisible(props: IWorkorderDetailsProps, tab: WorkorderDialogTab) {
        if(tab === WorkorderDialogTab.ModuleDetails) {
            props.queryOperations(workorderProductsConsumed => this.setState({ workorderProductsConsumed }), props.workorder.id);
            props.querySpareParts(workorderOperations => this.setState({ workorderOperations }), props.workorder.id);
        }
    }

    public render() {
        //const tabs = EnumValues.getNames(WorkorderDialogTab);
        const tabs = [WorkorderDialogTab.BasicInfo, WorkorderDialogTab.ModuleDetails];
        const mbms = this.props.workorder.completedMbmsbAfterServiceNeedCreated;
        if(mbms != null && mbms.length > 0) tabs.push(WorkorderDialogTab.CompletedMbms);
        return (
            <TabbedDetail 
                items={tabs.map(name => (
                    <span>{translate(`workorder.tab.${ name.toLowerCase() }`)}</span> 
                ))}
                onChangeTab={tabIndex => {
                    const tab = tabs[tabIndex];
                    this.setState({ ...this.state, currentTab: tab });
                    this.queryOperationsAndSparePartsIfTabVisible(this.props, tab);
                }}
                selectedTab={tabs.indexOf(this.state.currentTab)} >
                {this.renderDialogContent()}
            </TabbedDetail>
        );
    };

    private renderDialogContent() {
        const entityFieldsData = this.props.entityFieldsData;
        switch (this.state.currentTab) {
            case WorkorderDialogTab.BasicInfo:
                return <div>{renderFields(calloutFields(this.props.workorder, this.props.entityFieldsData))}</div>;
            case WorkorderDialogTab.ModuleDetails:
                return <div>
                    <Subheader>{translate("generic.entity-name.spare-parts")}</Subheader>
                    <DataStatusContainer {...this.state.workorderProductsConsumed}>
                        {this.state.workorderProductsConsumed.data && this.state.workorderProductsConsumed.data.map(c =>
                            <div style={ { display: "table", width: "100%" } } >{/*className="container--horizontal container--justify-start"*/}
                                <LabeledValue className="col-md-3 col-sm-4 col-xs-4" label={translate("product-consumed.field.spare-part-number")}>{c.sparePartNumber}</LabeledValue>
                                <LabeledValue className="col-md-5 col-sm-8 col-xs-8" label={translate("generic.field.description")}>{c.description}</LabeledValue>
                                <LabeledValue className="col-md-2 col-sm-4 col-xs-4" label={translate("generic.field.quantity")}>{c.quantity}</LabeledValue>
                                <LabeledValue className="col-md-2 col-sm-8 col-xs-8" label={translate("generic.field.status")}>{c.status}</LabeledValue>
                            </div>
                        )}
                    </DataStatusContainer>
                    <Subheader>{translate("generic.entity-name.operations")}</Subheader>
                    <DataStatusContainer {...this.state.workorderOperations}>
                        {
                            this.state.workorderOperations.data && this.state.workorderOperations.data.map(c => 
                            <ListItem key={c.id} item={c} entityFieldsData={this.props.entityFieldsData}/>)
                        }
                    </DataStatusContainer>
                </div>
            case WorkorderDialogTab.CompletedMbms:
                const completedMbmsbAfterServiceNeedCreated = this.props.workorder.completedMbmsbAfterServiceNeedCreated;
                return <div>
                    {
                        completedMbmsbAfterServiceNeedCreated && completedMbmsbAfterServiceNeedCreated.map(
                            mbm => {
                                const listItem = new CalloutListItem(mbm, entityFieldsData);
                                return <ListItem item={listItem} 
                                    onClick={() => this.props.queryAndShowDetailsDialogFromListItem(listItem)} 
                                    className='padding-right--std' entityFieldsData={this.props.entityFieldsData}>
                                    <Icon svg={SvgIcon.ChevronRight} className="icon-oriented"/>
                                </ListItem>
                            }
                        )
                    }
                    </div>;
            default:
                return null;
        }
    };

}

enum WorkorderDialogTab {
    BasicInfo = 'BasicInfo',
    ModuleDetails = 'ModuleDetails',
    CompletedMbms = 'CompletedMbms'
}

/*
const WorkorderDetailStateProps = (state: IGlobalState) => {
    return { 
        workorderProductsConsumed: state.workorderProductsConsumed, 
        workorderOperations: state.workorderOperations
    };
}
*/

const WorkorderDetailDispatchProps = { queryOperations, querySpareParts, queryAndShowDetailsDialogFromListItem }
const WorkorderDetailStateProps = (state: IGlobalState) => ({ entityFieldsData: entityFieldsDataFromState(state) })
export default connect(WorkorderDetailStateProps, WorkorderDetailDispatchProps)(WorkorderDetail);