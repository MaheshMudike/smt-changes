import * as cx from 'classnames';
import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';

import { setContactOnSelectContactsDialog } from '../../actions/selectContactsDialogActions';
import { SALESFORCE_WEB } from '../../constants/externalApps';
import { SvgIcon } from '../../constants/SvgIcon';
import { formatAccountTypes } from '../../models/accounts/AccountType';
import { IGlobalState } from '../../models/globalState';
import { ISelectContactsDialogState } from '../../models/plan/ISelectContactsDialogState';
import openLinkExternally from '../../utils/openLinkExternally';
import translate from '../../utils/translate';
import { CoveringSpinner } from '../CoveringSpinner';
import { SelectField } from '../forms/SelectField';
import WithIcon from '../forms/WithIcon';
import { IconsBar } from '../layout/IconsBar';
import { ListItem } from '../list/ListItem';
import { DialogContainer } from './layout/DialogContainer';
import { DialogContent, DialogContentPadding } from './layout/DialogContent';
import { DialogHeader } from './layout/DialogHeader';
import { Option as ReactSelectOption } from 'react-select';
import { equalsById } from '../../models/feed/ISObject';
import { isAccount } from './events/EventCreationDialog';
import { IDetailedContact, IApiAccountListItem } from 'src/models/api/coreApi';
import { EmptyView } from '../EmptyView';
import { queryContactsForAccountsByAccountContactRelationship } from 'src/actions/http/jsforce';
import Contact from 'src/models/accounts/Contact';
import ListSplitPanel from '../ListSplitPanel';
import { ActionStatus } from 'src/actions/actions';
import { ISearchResultsGroups } from 'src/models/search/ISearchResults';
import { createInitialSearchResults, initialSearchGroupTitle, replaceSearchGroup2 } from 'src/reducers/searchReducer';
import { EntityType } from 'src/constants/EntityType';
import { IdentifiableTitleBodyHighPriority } from 'src/models/list/IListItem';
import { AccountListItem } from 'src/models/accounts/Account';
import { soslQuery } from 'src/actions/http/jsforceSearch';
import { SOSL_LIMIT } from 'src/actions/searchActions';
import { getMatchingAccounts } from 'src/containers/pages/OverviewLists';
import { IModalDefinition } from 'src/models/modals/state';
import { goToPrevModal, showModal } from 'src/actions/modalActions';
import { entityFieldsDataFromState } from '../fields/EntityFieldsData';
import { ModalType } from 'src/constants/modalTypes';

type ISelectContactsDialogProps = IModalDefinition<ISelectContactsDialogState> & { offline: boolean } & 
    ReturnType<typeof SelectContactsStateProps> & typeof SelectContactsDispatchProps;

class SelectContactsDialogClass extends React.Component<ISelectContactsDialogProps, 
    { searchPhrase: string, selectedAccount: { title: string, id: string },
        //accounts: { title: string, id: string }[], accountsStatus: ActionStatus,
        contacts: IDetailedContact[], contactsStatus: ActionStatus,
        searchResults: ISearchResultsGroups<IdentifiableTitleBodyHighPriority>,
        contactSearchPhrase: string
    }
> {

    private searchAccountsOnline = _.debounce(() => {
        this.setState({ searchResults: { groups: createInitialSearchResults([EntityType.Account], ActionStatus.START) } });
        const searchPhrase = this.state.searchPhrase;
        //there are more than 2M accounts in KONE
        if(searchPhrase && searchPhrase.trim().length > 0) {
            const sosl = soslQuery<IApiAccountListItem>(searchPhrase, SOSL_LIMIT, EntityType.Account);
            this.setState( 
                { searchResults: replaceSearchGroup2(this.state.searchResults, EntityType.Account, [], ActionStatus.START) }
            );
            sosl.then(accounts => {
                const accountListItems = accounts.map(acc => new AccountListItem(acc));
                if(searchPhrase == this.state.searchPhrase) {
                    this.setState(
                        { searchResults: replaceSearchGroup2(this.state.searchResults, EntityType.Account, accountListItems, ActionStatus.SUCCESS) }
                    );
                }
                
            });
        } else {
            this.searchAccountsOnline.cancel();
            this.initState();
        }
    }, 500);

    private searchAccountsOffline() {
        const accounts = getMatchingAccounts(this.props.offlineAccounts.items, this.state.searchPhrase);
        this.setState( 
            { searchResults: replaceSearchGroup2(this.state.searchResults, EntityType.Account, accounts, ActionStatus.SUCCESS) }
        );
    }

    constructor(props: ISelectContactsDialogProps) {
        super(props);
        this.initState();
    }

    private initState = () => {
        this.state = { selectedAccount: null, searchPhrase: '', 
            contacts: [], contactsStatus: ActionStatus.SUCCESS, 
            searchResults: { groups: { ...createInitialSearchResults([EntityType.Account]) } },
            contactSearchPhrase: ''
        };
    }

    public componentDidMount() {
        const relatedAccountItems = this.relatedAccountItems();
        if(relatedAccountItems.length > 0) this.onItemClick(relatedAccountItems[0]);
    }

    public updateContact = (contact: IDetailedContact) => {
        this.setState({
            contacts: [...this.state.contacts, contact]
        })
    }
    private relatedAccountItems() {
        const relatedTo = this.props.relatedTo;
        const relactedAccountItems = this.props.relatedAccounts.map(acc => 
            ({ title: acc.account.title, id: acc.account.id, body: () => formatAccountTypes(acc.accountType), isHighPriority: false } as IdentifiableTitleBodyHighPriority)
        );
        if(isAccount(relatedTo)) relactedAccountItems.push({ id: relatedTo.id, title: relatedTo.title, body: () => '', isHighPriority: false });
        return _.uniqBy(relactedAccountItems, item => item.id);
    }

    public render() {
        const contacts = _.filter(this.state.contacts, (c: IDetailedContact) => c.Name.toLowerCase().includes(this.state.contactSearchPhrase.toLowerCase()));
        const emptyResults = this.state.searchResults.groups && Object.keys(this.state.searchResults.groups).length === 0;
        const selectedAccount = this.state.selectedAccount;
        const selectedContacts = this.props.selectContactsDialog.contacts == null ? [] : this.props.selectContactsDialog.contacts;
        return (
            <DialogContainer>
                <DialogHeader title={translate('modal.select-contacts.title')} buttons={
                    <IconsBar buttons={[
                        /*{
                            icon: SvgIcon.Adduser,
                            onClick: () => {
                                this.props.goToPrevModal();
                                openLinkExternally(SALESFORCE_WEB.createContactUrl(selectedAccount == null ? null : selectedAccount.id));
                            }
                        },*/
                        {
                            icon: SvgIcon.Adduser,
                            onClick: () => this.props.showModal(ModalType.ContactCreationModal, { accountId: selectedAccount.id , updateSelectContact: this.updateContact })
                        },
                        {
                            icon: SvgIcon.Done, onClick: () => {
                                this.props.selectContactsDialog.confirmSelection(this.props.selectContactsDialog.contacts);
                                this.props.goToPrevModal();
                            }
                        }]}
                    />
                    }
                />
                <DialogContent padding={DialogContentPadding.None} className='panel--light-gray'>
                    <div className="container--vertical container--justify-start full-height">
                        <div className="container--horizontal flex-shrink--0">
                            <WithIcon icon={SvgIcon.Search} className='separated list-container container__item--stretch col-xs-5'>
                                <input value={this.state.searchPhrase} onChange={(ev: React.FormEvent<any>) => {
                                    this.setState({ searchPhrase: ev.currentTarget.value });
                                    
                                    if(this.props.offline) this.searchAccountsOffline();
                                    else this.searchAccountsOnline();
                                }}
                                    type='text' placeholder={translate('search-account-modal.input-placeholder')}/>
                            </WithIcon>
                            <WithIcon icon={SvgIcon.Contacts} className='separated--bottom-dark flex--1 container__item--stretch'>
                                <input autoFocus value={this.state.contactSearchPhrase} 
                                    onChange={(ev: React.FormEvent<any>) => this.setContactSearchPhrase(ev.currentTarget.value) }
                                    type='text' placeholder={translate('generic.placeholder.participants-filter')}
                                />
                            </WithIcon>
                        </div>
                        {this.state.contactsStatus === ActionStatus.START ? <CoveringSpinner className='above-split-panel' /> : null}
                        <div className="flex--1">
                        <ListSplitPanel
                            entityFieldsData={ this.props.entityFieldsData }
                            listItemsClasses="full-height col-xs-5"
                            listItems={[ 
                                { 
                                    ...initialSearchGroupTitle(translate('modal.select-contacts.related-accounts'),this.relatedAccountItems()), alwaysOpen: true 
                                }, 
                                ..._.toArray(this.state.searchResults.groups)
                            ]}
                            onItemClick={this.onItemClick}

                            selectedItem={this.state.selectedAccount}

                            renderCollapsibleGroups={true}
                            >
                            
                            {emptyResults && this.state.selectedAccount == null ? 
                                <EmptyView isGrey svg={SvgIcon.Search}
                                    title={translate(emptyResults ? 'search-page.block-title.empty-results' : 'search-page.block-title-default')}
                                    description={translate(emptyResults ? 'search-page.block-label.hint' : 'search-page.block-label.default')}
                                />
                            :
                                <div className='scrollable flex--1'>
                                    <SelectField
                                        value={this.selectedContacts}
                                        hideDropdown={true}
                                        options={[...selectedContacts, ...contacts.map(c => new Contact(c))]}
                                        optionsMapper={(item: Contact): ReactSelectOption => {
                                            return item == null ? null : {
                                                label: item.fullName,
                                                value: item.id,
                                            };
                                        }}
                                        onChange={(contact: Contact | Contact[]) => {
                                            const contactArray = contact ? contact instanceof Array ? contact : [contact] : [];
                                            this.props.setContactOnSelectContactsDialog(contactArray);
                                        }}
                                        isLoading={false}
                                        multi={true}
                                        searchable={false}
                                        placeholder={translate('generic.placeholder.participants-choose')}
                                    />
                                    { contacts.length <= 0 && <EmptyView isGrey title={translate('modal.select-contacts.no-contacts')} /> }
                                    {
                                        contacts.map((contact: IDetailedContact, index: number) => {
                                            const item = new Contact(contact);
                                            return <ListItem 
                                                className={cx({ 'disabled': this.isContactSelected(item) })} 
                                                entityFieldsData={this.props.entityFieldsData}
                                                item={item} onClick={() => this.toggleContact(item)} key={index}
                                            />
                                        })
                                    }
                                </div>
                            }
                        </ListSplitPanel>
                        </div>
                    </div>
                </DialogContent>
            </DialogContainer>
        );
    }

    private setContactSearchPhrase = (contactSearchPhrase: string) => {
        this.setState(state => ({ ...state, contactSearchPhrase }));
    }

    private onItemClick = (account: { title: string, id: string }) => {
        //this.setState({...this.state, isProcessing: true });
        this.setState({ selectedAccount: account, contactsStatus: ActionStatus.START });
        queryContactsForAccountsByAccountContactRelationship([account.id]).then(contacts => {
            this.setState({ contacts, contactsStatus: ActionStatus.SUCCESS });
        }).catch(exc => {
            this.setState({ contactsStatus: ActionStatus.FAILURE });
        })
    }

    private isContactSelected(contact: Contact) {
        return _.some(this.props.selectContactsDialog.contacts, equalsById(contact));
    }

    private toggleContact = (contact: Contact) => {
        if (!_.some(this.props.selectContactsDialog.contacts, t => t.id === contact.id)) {
            this.props.setContactOnSelectContactsDialog([...this.props.selectContactsDialog.contacts, contact]);
        } else {
            this.props.setContactOnSelectContactsDialog(_.filter(this.props.selectContactsDialog.contacts, c => c.id != contact.id));
        }
    };

    get selectedContacts() {
        const contacts = this.props.selectContactsDialog.contacts;
        return contacts && contacts.length > 0 ? contacts : null;
    }
}

const SelectContactsDispatchProps = {
    goToPrevModal,
    setContactOnSelectContactsDialog,
    showModal
}

const SelectContactsStateProps = (state: IGlobalState) => {
    return {
        relatedTo: state.planCustomerVisit.form.relatedTo,
        relatedAccounts: state.planCustomerVisit.relatedAccounts,
        selectContactsDialog: state.selectContactsDialog,
        offlineAccounts: state.cache.offlineAccounts,
        entityFieldsData: entityFieldsDataFromState(state),
        offline: state.sharedState.isOfflineMode
    };
}

export const SelectContactsDialog = connect(SelectContactsStateProps, SelectContactsDispatchProps)(SelectContactsDialogClass);
