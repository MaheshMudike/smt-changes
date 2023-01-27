import * as React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import * as _ from 'lodash';

import { faMap, faListAlt } from '@fortawesome/free-regular-svg-icons';
import { faMapMarkedAlt } from '@fortawesome/free-solid-svg-icons';

import { queryAndShowSearchDetail, setExactSearch } from '../../actions/searchActions';
import { filterSearchMap, showOrHideMap } from '../../actions/searchMapActions';
import { EmptyView } from '../../components/EmptyView';
import ListSplitPanel, { IListGroupCollapsible } from '../../components/ListSplitPanel';
import { SvgIcon } from '../../constants/SvgIcon';
import { IGlobalState } from '../../models/globalState';
import translate from '../../utils/translate';
import { ActionStatus } from '../../actions/actions';
import { CoveringSpinner } from '../../components/CoveringSpinner';
import { IListItem } from '../../models/list/IListItem';

import { showModal } from '../../actions/modalActions';
import { EntityType } from '../../constants/EntityType';
import { IdentifiableWithTitle } from '../../models/feed/ISObject';

import { EquipmentListDetail, TechnicianListDetail, CalloutListDetail, ComplaintListDetail, EventListDetail, OpportunityListDetail, QueryListDetail, 
    TaskListDetail, TenderListDetail, LeadListDetail, AuditListDetail, DetailMode, AccountListDetail, TopBarContainer } from './ListDetails';
import SearchMap from './SearchMap';
import IconButtonFA from '../../components/layout/IconButonFA';
import { IconsBar } from '../../components/layout/IconsBar';
import { entityFieldsDataFromState, EntityFieldsData } from 'src/components/fields/EntityFieldsData';
import * as cx from 'classnames';
import { closeMenu } from 'src/containers/AppBase';
import { isAndroid } from 'src/utils/cordova-utils';

const rendererByType: _.Dictionary<React.ComponentType<{ item: IdentifiableWithTitle, detailMode: DetailMode, entityFieldsData?: EntityFieldsData }>> = {
    [EntityType.Account]: AccountListDetail,
    [EntityType.Audit]: AuditListDetail,
    [EntityType.Callout]: CalloutListDetail,
    [EntityType.Complaint]: ComplaintListDetail,
    [EntityType.Equipment]: EquipmentListDetail,
    [EntityType.Event]: EventListDetail,
    [EntityType.Lead]: LeadListDetail,
    [EntityType.Opportunity]: OpportunityListDetail,
    [EntityType.Query]: QueryListDetail,
    [EntityType.Task]: TaskListDetail,
    [EntityType.Tender]: TenderListDetail,
    [EntityType.Technician]: TechnicianListDetail
};

const locatableEntities = new Set<EntityType>([
    EntityType.Equipment, EntityType.Callout, EntityType.Opportunity, EntityType.Technician 
]);

class Search extends React.Component<typeof searchDispatchProps & ReturnType<typeof searchStateProps>, object> {

    public componentDidMount(){
        if(isAndroid()) FirebasePlugin.setScreenName('Search Screen');
        this.props.closeMenu();
    }
    
    public render() {
        const Renderer = this.props.detailItem && rendererByType[this.props.detailItem.entityType];
        //if (Renderer == null) throw new Error(`EntityType ${ EntityType[this.props.detailItem.entityType] } not handled correctly.`);
        const { mapFilters, status, results, entityFieldsData, searchGroups, selectedResult, detailItem } = this.props;
        const emptyResults = results.groups && Object.keys(results.groups).length === 0;
        const processing = status === ActionStatus.START;
        const groupButtonClasses = 'button--flat button--fa container--horizontal margin-left--small';
        return (
            <div className='full-height'>
                {processing ? <CoveringSpinner className='above-split-panel' /> : null}
                <ListSplitPanel
                    entityFieldsData={entityFieldsData}
                    listItems={_.orderBy(searchGroups, [li => li && li.title ? li.title.toLowerCase() : ''])}
                    onItemClick={this.onItemClick}

                    selectedItem={selectedResult}

                    listTopPart={
                        <div id="search-filters" className="subheader container--vertical">
                            <div className='checkbox checkbox--left checkbox--left--decreased font-size--s padding-horizontal--decreased'>
                                <input type="checkbox" id="exact-search-checkbox" onChange={ev => this.props.setExactSearch(ev.target.checked)}/>
                                <label htmlFor="exact-search-checkbox" className='padding-small--left'>{translate('search-page.block-title.exact-search')}</label>
                            </div>
                        </div>
                    }

                    renderCollapsibleGroups={true}
                    groupButtons={group => {
                        const entityTypes = group.entityTypes || [group.entityType];
                        return entityTypes.find(entityType => locatableEntities.has(entityType)) ? 
                            [<IconButtonFA icon={faMapMarkedAlt} 
                                className={cx(groupButtonClasses, entityTypes[0] == mapFilters[0] ? 'button--flat--highlighted' : 'button--flat--inactive')} 
                                onClick={ev => {
                                    ev.preventDefault();
                                    this.props.filterSearchMap(entityTypes);
                                    this.props.showOrHideMap(true);
                                }}
                            />]
                            :
                            [<IconButtonFA icon={faMapMarkedAlt} className={cx(groupButtonClasses, 'button--flat--disabled')} onClick={ev => ev.preventDefault()}/>]
                    } }
                    >
                    { this.props.detailStatus == ActionStatus.START ? <CoveringSpinner /> : null }

                    {
                        this.props.detailItem && !this.props.showMap && Renderer ?
                        //<this.props.detail.renderer item={this.props.detail.item} />
                        <Renderer detailMode={DetailMode.SEARCH} item={detailItem} entityFieldsData={entityFieldsData}/>
                        : this.props.showMap ?
                                <TopBarContainer 
                                    topBar={item =>
                                        <IconsBar buttons={[{
                                            onClick: ev => this.props.showOrHideMap(false),
                                            faIcon: faListAlt
                                        }]} /> 
                                    }
                                    detailMode={DetailMode.SEARCH} 
                                    item={this.props.detailItem}
                                >
                                    <SearchMap selectItem={this.selectItem}/>
                                </TopBarContainer>
                            : this.props.detailStatus != ActionStatus.START ? 
                                <EmptyView isGrey svg={SvgIcon.Search}
                                    title={translate(emptyResults ? 'search-page.block-title.empty-results' : 'search-page.block-title-default')}
                                    description={translate(emptyResults ? 'search-page.block-label.hint' : 'search-page.block-label.default')}
                                />
                                : null
                    }
                    
                </ListSplitPanel>
            </div>
        );

    }

    private onItemClick = (item: IListItem) => {
        if(!this.isSelected(item.id)) {
            this.props.queryAndShowSearchDetail(item);
        }
    }

    private selectItem = (id: string, entityType: EntityType) => {
        const item = this.props.results.groups[entityType].items.find(item => item.id === id);
        if(item != null) this.props.queryAndShowSearchDetail(item as any);
    }

//selectedMarker.length > 0 && selectedMarker[0].position2 ? selectedMarker[0].position2 : null

    private isSelected = (itemId: string) => this.props.selectedResult && itemId === this.props.selectedResult.id;

}

const searchStateProps = 
    createSelector(
        (state: IGlobalState) => state.search,
        state => entityFieldsDataFromState(state),
        createSelector(
            (state: IGlobalState) => state.search.results.groups.Account,
            state => state.search.results.groups.Audit,
            state => state.search.results.groups.Callout,
            state => state.search.results.groups.Complaint,
            state => state.search.results.groups.Equipment,
            state => state.search.results.groups.Event,
            state => state.search.results.groups.Task,
            state => state.search.results.groups.Tender,
            state => state.search.results.groups.Technician,
            createSelector(
                (state: IGlobalState) => state.search.results.groups.Lead,
                state => state.search.results.groups.Opportunity,
                (leads, opps) => {
                    
                    const salesLeadsLoading = opps.actionStatus === ActionStatus.START || leads.actionStatus === ActionStatus.START;
                    const salesLeads = _.sortBy([...opps.items, ...leads.items], 'title');
                    
                    const title = translate('search-page.group-title.sales-leads');
                    const salesLeadsEntityTypes = [EntityType.Opportunity, EntityType.Lead];
                    return salesLeadsLoading ? 
                        { actionStatus: ActionStatus.START, items: [], title, entityTypes: salesLeadsEntityTypes } : 
                        { actionStatus: ActionStatus.SUCCESS, items: salesLeads, title, entityTypes: salesLeadsEntityTypes };
                }
            ),
            (accounts, audits, callouts, complaints, equipment, events, tasks, tenders, technicians, salesLeads) => {
                return [accounts, audits, callouts, complaints, equipment, events, tasks, tenders, technicians, salesLeads] as 
                    (IListGroupCollapsible<IListItem> & { entityType: EntityType, entityTypes?: EntityType[] })[];
            }
        ),
        (search, entityFieldsData, searchGroups) => { 
            return {
                ...search,
                searchGroups,
                entityFieldsData
            }
        }
    )

const searchDispatchProps = {
    queryAndShowSearchDetail, showModal, filterSearchMap, showOrHideMap, closeMenu, setExactSearch
}

export default connect(searchStateProps, searchDispatchProps)(Search);
