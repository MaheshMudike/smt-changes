import * as coreApi from '../../models/api/coreApi';
import { ModalType } from '../../constants/modalTypes';
import { replaceModalIfIncomplete } from '../modalActions';
import { queryAccountDetail } from '../../models/accounts/Account';
import { queryAndShowDetailsDialogGeneric } from './detailsActions';
import { EntityType } from '../../constants/EntityType';
import { asyncHttpActionGenericInitialData } from '../http/httpActions';
import { updateContact } from '../http/jsforce';
import { queryContactsBase, queryAssetsBase } from '../http/jsforceBase';
import { conditions } from '../http/jsforceMappings';
import { itemsStateAsyncActionNames } from '../actionUtils';
import * as fields from "../../actions/http/queryFields";
import { ThunkAction } from '../thunks';
import { showToast } from '../toasts/toastActions';
import * as _ from 'lodash';
import { title } from 'src/models/feed/SalesForceListItem';

export const OPEN_KOL_APP = itemsStateAsyncActionNames('OPEN_KOL_APP');

export const downloadAndShowAccount = (account: { id: string, name: string } ) => queryAndShowDetailsDialogGeneric(
    //EntityType.Account,
    title(EntityType.Account, account.name),
    () => queryAccountDetail(account.id),
    item => dispatch => dispatch(replaceModalIfIncomplete(ModalType.AccountModal, item))
)

export const reparentSupervisorContactToAccount = (accountId: string): ThunkAction<void> => (dispatch, state) => 
    queryContactsBase<coreApi.IContactAccount>([conditions.Contact.email(state().authentication.currentUser.email), conditions.Contact.isPortalUser], fields.IContactAccount).then(
        contacts => {
            if(contacts.length > 0) {
                const contact = contacts[0];
                const c = { Id: contact.Id, AccountId: accountId };
                dispatch(asyncHttpActionGenericInitialData(
                    state => contact.AccountId != accountId ? updateContact(c).then(id => c) : Promise.resolve(contact),
                    OPEN_KOL_APP, contact
                ))
            } else {
                dispatch(showToast({ message: 'contact not found' }))
            }
        }
    )

export function queryActiveAssetsForAccount(accountId: string) {
    return queryAssetsBase([conditions.Asset.account(accountId), conditions.Asset.active]);
}