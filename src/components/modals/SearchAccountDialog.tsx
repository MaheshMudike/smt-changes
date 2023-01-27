import * as React from 'react';
import { connect } from 'react-redux';
import * as _ from 'lodash';

import translate from '../../utils/translate';
import { CoveringSpinner } from '../CoveringSpinner';
import { SearchDialogClass } from './SearchDialog';
import { setRelatedToOnPlanCustomerVisit, setSourceEntityToOnPlanCustomerVisit } from '../../actions/planCustomerVisitActions';
import { IApiNameAndId } from '../../models/api/coreApi';
import { soslQuery, searchAccounts } from 'src/actions/http/jsforceSearch';
import { SOSL_LIMIT, createSearchResultGroupWithSobjects, emptySearchGroup } from 'src/actions/searchActions';
import { EntityType } from 'src/constants/EntityType';
import { ISearchResultGroup } from 'src/models/search/ISearchResults';
import { ActionStatus } from 'src/actions/actions';
import { SearchGroupResultClass } from '../ListSplitPanel';
import { IListItem } from 'src/models/list/IListItem';
import { IModalDefinition } from 'src/models/modals/state';
import { goToPrevModal, hideAllModals } from 'src/actions/modalActions';
import { EntityFieldsData, entityFieldsDataFromState } from '../fields/EntityFieldsData';
import { IGlobalState } from 'src/models/globalState';


type SearchAccountDialogDispatchProps = { 
    setRelatedToOnPlanCustomerVisit: typeof setRelatedToOnPlanCustomerVisit,
    goToPrevModal: typeof goToPrevModal,
    hideAllModals: typeof hideAllModals,
    setSourceEntityToOnPlanCustomerVisit: typeof setSourceEntityToOnPlanCustomerVisit
};
type SearchAccountDialogProps = IModalDefinition<any> & SearchAccountDialogDispatchProps & { entityFieldsData: EntityFieldsData };

export class SearchAccountDialogClass extends React.Component<SearchAccountDialogProps, 
    { searchPhrase: string, isProcessing: boolean, groups: _.Dictionary<ISearchResultGroup<IListItem>> }> {
    
    private searchAccountsOnline = _.debounce(() => {
        const searchPhrase = this.state.searchPhrase;
        const entityFieldsData = this.props.entityFieldsData;
        const activeInFSM = entityFieldsData.activeInFSM;
        if(searchPhrase && searchPhrase.trim().length > 0) {
            this.setEmptyStateAndRunQuery(EntityType.Account, searchAccounts(searchPhrase, SOSL_LIMIT), searchPhrase, entityFieldsData);
            this.setEmptyStateAndRunQuery(
                EntityType.Equipment, soslQuery<IApiNameAndId>(searchPhrase, SOSL_LIMIT, EntityType.Equipment), searchPhrase, entityFieldsData
            );
        } else {
            this.searchAccountsOnline.cancel();
        }
    }, 500);

    private setEmptyStateAndRunQuery = (entityType: EntityType, query: Promise<IApiNameAndId[]>, searchPhrase: string, entityFieldsData: EntityFieldsData) => {
        this.setState(
            prevState => ({
                ...prevState,
                groups: {
                    ...prevState.groups, 
                    [entityType]: emptySearchGroup(entityType, searchPhrase)
                }
            }),
            () => this.runSoslQuery(entityType, query, searchPhrase, entityFieldsData)
        );
    }

    private runSoslQuery = (entityType: EntityType, query: Promise<IApiNameAndId[]>, searchPhrase: string, entityFieldsData: EntityFieldsData) => {
        query.then(result => {
            const items = result as IApiNameAndId[];
            if(searchPhrase == this.state.searchPhrase) {
                this.setState(prevState => {
                    return ({ 
                        ...prevState,
                        groups: {
                            ...prevState.groups, 
                            [entityType]: createSearchResultGroupWithSobjects(searchPhrase, entityType, items, entityFieldsData)
                        }
                    })
                })
            };
        })
    }

    constructor(props: SearchAccountDialogProps) {
        super(props);
        this.state = { searchPhrase: '', isProcessing: false, groups: {} };
    }

    public render() {
        const title = translate('search-account-modal.title');
        const entityFieldsData = this.props.entityFieldsData;
        return <SearchDialogClass 
            hideModal={ this.props.hideAllModals } goToPrevModal={ this.props.goToPrevModal } 
            title={title} inputPlaceholder={translate('search-account-or-equipment-modal.input-placeholder')}
            setSearchPhrase={(text: string) => {
                this.setState({...this.state, searchPhrase: text });
                this.searchAccountsOnline.bind(this)();
            }} searchPhrase={this.state.searchPhrase}>
            { Object.keys(this.state.groups).map(entityType => this.renderGroup(this.state.groups[entityType], entityFieldsData) ) }
        </SearchDialogClass>;
    }    

    private renderGroup(group: ISearchResultGroup<IListItem>, entityFieldsData: EntityFieldsData) {
        if(group.actionStatus == ActionStatus.START ||this.state.isProcessing) return <CoveringSpinner />;

        return <SearchGroupResultClass 
            group={ group }
            selectedItem={ null } 
            onItemClick={item => {
                this.setState({...this.state, isProcessing: true });
                item.queryDetails().then(detail => {
                    this.props.setRelatedToOnPlanCustomerVisit((detail as any).whatForEvent);
                    this.props.setSourceEntityToOnPlanCustomerVisit(detail);
                    this.props.goToPrevModal();
                })
            }}
            groupButtons={ group => []}
            entityFieldsData={ entityFieldsData }
        />;
    }
    
}

export const SearchAccountDialog = connect(
    (state: IGlobalState) => ({ entityFieldsData: entityFieldsDataFromState(state) }),
    {
        setRelatedToOnPlanCustomerVisit,
        goToPrevModal,
        hideAllModals,
        setSourceEntityToOnPlanCustomerVisit
    },
)(SearchAccountDialogClass);
