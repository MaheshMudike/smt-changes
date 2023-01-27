import * as React from 'react';
import { connect } from 'react-redux';

import { navigateToDefaultPageIfNeeded, setPlannerGroup, logout } from '../../actions/authenticationActions';
import { SvgIcon } from '../../constants/SvgIcon';
import { IUserBranch } from '../../models/user/IUserBranch';
import translate from '../../utils/translate';
import { Icon } from '../layout/Icon';
import { AbstractWhiteDialog } from './AbstractWhiteDialog';
import { User } from 'src/models/user/User';
import { IModalDefinition } from 'src/models/modals/state';
import { hideAllModals } from 'src/actions/modalActions';
import { AdminType } from 'src/models/user/UserRole';
import WithIcon from '../forms/WithIcon';

type SelectPlannerGroupDialogProps = typeof SelectPlannerGroupDialogDispatchProps & IModalDefinition<{ currentUser: User; currentPlannerGroup: IUserBranch }>;

class SelectPlannerGroupDialogClass extends AbstractWhiteDialog<SelectPlannerGroupDialogProps, { searchPhrase: string }> {

    constructor(props: SelectPlannerGroupDialogProps) {
        super(props);
        this.state = { searchPhrase: '' };
    }

    protected renderHeaderContent(): JSX.Element {
        return (<span>{translate(`modals.select-planner-group.title`)}</span>);
    }

    protected getButtons(): JSX.Element {
        var plannerGroups = this.props.modalProps.currentUser.userBranches;
        return (plannerGroups.length <= 0 && <Icon className='menu-user-details__btn clickable' svg={SvgIcon.Logout} onClick={() => this.props.logout()} />);
    }

    protected renderContent(): JSX.Element {
        var filteredPlannerGroups : IUserBranch[];
        var adminType = this.props.modalProps.currentUser.adminType;
        var plannerGroups = this.props.modalProps.currentUser.userBranches;
        var salesOrganisationId = this.props.modalProps.currentUser.userValue.Sales_Organization__c;
        if(plannerGroups == null) plannerGroups = [];
        filteredPlannerGroups = (adminType == AdminType.Global || salesOrganisationId == undefined) ? plannerGroups : plannerFilter( plannerGroups , salesOrganisationId);
        const regex = new RegExp(`${this.state.searchPhrase.toLowerCase()}`,"g");
        const ownedGroups = filteredPlannerGroups.filter((el) => el.owned);
        // const ownedGroupsFiltered = this.findRegexInGroups(regex, ownedGroups);
        const ownedGroupsFiltered = this.searchInGroups(ownedGroups)
        const notownedGroups = filteredPlannerGroups.filter((el) => !el.owned);
        // const notownedGroupsFiltered = this.findRegexInGroups(regex, notownedGroups);
        const notownedGroupsFiltered = this.searchInGroups(notownedGroups);
        return (
            <div className='container--vertical font-size--s'>
                <div className='padding--large'>{translate(`modals.select-planner-group.content`)}</div>
                <WithIcon icon={SvgIcon.Search} className='separated list-container container__item--stretch'>
                    <input 
                        type='text' value={this.state.searchPhrase}
                        onChange={(ev: React.FormEvent<any>) => {
                            this.setState({ searchPhrase: ev.currentTarget.value });
                        }}
                        placeholder={translate('modals.select-planner-group.search-input-placeholder')}
                    />
                </WithIcon>
                <div className='scrollable flex--1'>
                    {ownedGroupsFiltered.length <= 0 ? null :
                        <div className="separated--bottom-dark">
                            {ownedGroupsFiltered.map(c => this.renderPlannerGroup(c))}
                        </div>
                    }
                    {notownedGroupsFiltered.map(c => this.renderPlannerGroup(c))}
                </div>
            </div>
        );
    }

    searchInGroups(groups: IUserBranch[]) {
        return groups.filter(g => g.branchLabel.toLowerCase().includes(this.state.searchPhrase.toLowerCase()) )
    }

    findRegexInGroups(regex: RegExp, groups: IUserBranch[]) {
        return groups.filter(g => regex.test(g.branchLabel.toLowerCase()));
    };

    renderPlannerGroup(group: IUserBranch) {
        return <div className='container--horizontal font-size--s padding-vertical--large clickable' key={group.id}
            onClick={() => this.setPlannerGroup(group)}>
            <div className='flex--1 padding-horizontal--std'>
                {group.branchToString}
            </div>
            {group.owned && <Icon className='icon--small' svg={SvgIcon.ContactsCopy} />}
        </div>;
    }

    private setPlannerGroup = (c: IUserBranch) => {
        const currentGroupCode = this.props.modalProps.currentPlannerGroup && this.props.modalProps.currentPlannerGroup.branchCode;

        if (currentGroupCode !== c.branchCode) {
            this.props.navigateToDefaultPageIfNeeded();
            this.props.hideAllModals();
            this.props.setPlannerGroup(c);
        } else {
            this.props.hideAllModals();
        }
    };
}

function plannerFilter(plannerGroups: IUserBranch[] , salesOrgId :string ) {
    const groups = [ ['201','202'], ['BEL','KDL'], ['CKE','CKQ'], ['220','320'], ['261','262','263','323'], ['207','225'], ['237','260'] ]
    var salesOrg = groups.filter( g => g.some( s => salesOrgId == s));
    if (salesOrg.length == 0) salesOrg.push([salesOrgId]);
    return plannerGroups.filter( (pg) => salesOrg[0].some( (v) => pg.salesOrganization == v ) )
}

const SelectPlannerGroupDialogDispatchProps = {
    setPlannerGroup,
    navigateToDefaultPageIfNeeded,
    logout,
    hideAllModals
}

export const SelectPlannerGroupDialog = connect(null, SelectPlannerGroupDialogDispatchProps)(SelectPlannerGroupDialogClass);