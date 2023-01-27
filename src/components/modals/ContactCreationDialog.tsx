import { DialogContainer } from "./layout/DialogContainer";
import { DialogHeader } from "./layout/DialogHeader";
import * as React from 'react';
import translate from "src/utils/translate";
import { FlexDialogContent } from "./layout/DialogContent";
import { CoveringSpinner } from "../CoveringSpinner";
import { SvgIcon } from "src/constants/SvgIcon";
import { DialogHeaderTextButton } from "../layout/DialogHeaderTextButton";
import WithIcon, { WithIconFA } from "../forms/WithIcon";
import { SelectField } from "../forms/SelectField";
import { IconDefinition, faCogs, faFax } from '@fortawesome/free-solid-svg-icons';
import { connect } from "react-redux";
import { IGlobalState } from "src/models/globalState";
import { SObject } from "src/actions/http/jsforceMappings";
import { DescribeSObjectResult, PicklistEntry } from "jsforce";
import ReactComponent from "../details/account/MyReactComponent";
import { asyncHttpActionGenericLocalState3 } from "src/actions/http/httpActions";
import { upsert } from "src/actions/http/jsforceCore";
import { NonNullableField, NonEmptyStringField, EmailField, nonEmptyField, nonNullableField, emailField, StringField, validateField, Field, allFieldsValid, NonValidableField, nonValidableStringField, NonValidableStringField, FieldType } from "../forms/validation";
import * as cx from 'classnames';
import { IModalDefinition } from "src/models/modals/state";
import { goToPrevModal } from "src/actions/modalActions";
import { queryDescribe } from "src/actions/integration/metadataActions";
import { synchronizeCurrentPage } from "src/actions/integration/synchronization";
import { IDetailedContact } from "src/models/api/coreApi";
import { showToast, showToastMessage } from "src/actions/toasts/toastActions";
import { ThunkAction } from "src/actions/thunks";
import { Toast } from "src/models/toasts";
import { IPayloadAction } from "src/actions/actionUtils";

function InputFA(props: { icon: IconDefinition, fieldName: string, field: StringField, placeholder: string, changeFormValue: (fieldName: string, field: Field) => void }) {
    return <WithIconFA icon={props.icon} className={ cx('separated flex-shrink--0') }>
        <input
            type="text"
            className={!props.field.valid && props.field.value != null && props.field.value != "" ? "invalid" : ""}
            placeholder={placeholderForField(props.placeholder, props.field.type)}
            value={props.field.value}
            onChange={(event: any) => props.changeFormValue(props.fieldName, { ...props.field, value: event.target.value })}
        />
    </WithIconFA>
}

function Input(props: { icon: SvgIcon, fieldName: string, field: StringField, placeholder: string, changeFormValue: (fieldName: string, obj: object) => void }) {
    return <WithIcon icon={props.icon} className={ cx('separated flex-shrink--0') }>
        <input
            type="text"
            className={!props.field.valid && props.field.value != null && props.field.value != "" ? "invalid" : ""}
            placeholder={placeholderForField(props.placeholder, props.field.type)}
            value={props.field.value}
            onChange={(event: any) => props.changeFormValue(props.fieldName, { ...props.field, value: event.target.value })}
        />
    </WithIcon>
}

function placeholderForField(key: string, fieldType: FieldType) {
    const mandatory = fieldType === FieldType.NonEmptyString;
    return placeholder(key, mandatory);
}

function placeholder(key: string, mandatory: boolean) {
    const placeholder = translate(key);
    return mandatory ? placeholder + " *" : placeholder;
}

type ContactCreationDialogProps = 
    IModalDefinition<{ accountId: string }> &
    { updateSelectContact: (contact:IDetailedContact) => void } &
    { contactDescribe: DescribeSObjectResult } &
    { queryDescribe: (sobject: SObject) => void,
        showToastMessage(translationKey: string): ThunkAction<void>,
        showToast(toast: Toast): ThunkAction<void>,
        synchronizeCurrentPage: () => ThunkAction<void>,
        goToPrevModal:() => IPayloadAction<any>,
         upsertContactWithToast: (contact: ContactFromContactCreationDialog) => Promise<string> }

type ContactCreationStateProps = {
    form: {
        title: NonValidableStringField,
        firstName: NonValidableStringField,
        lastName: NonEmptyStringField,
        function: NonNullableField,
        phone: NonEmptyStringField,
        mobilePhone: NonValidableStringField,
        fax: NonValidableStringField,
        email: EmailField,
        type: NonValidableField
    },
    isWaitingForResponse: boolean, formValid: boolean
}

class ContactCreationDialogClass extends ReactComponent<ContactCreationDialogProps, ContactCreationStateProps> {

    constructor(props: ContactCreationDialogProps) {
        super(props)
        this.state = {
            form: {
                title: nonValidableStringField(''),
                firstName: nonValidableStringField(''),
                lastName: nonEmptyField(''),
                phone: nonEmptyField(''),
                mobilePhone: nonValidableStringField(''),
                email: emailField(''),
                fax: nonValidableStringField(''),
                type: nonValidableStringField(null),
                function: nonNullableField(null),
            },
            isWaitingForResponse: false, formValid: false
        };
    }

    public componentDidMount() {
        this.props.queryDescribe(SObject.Contact);
    }

    public render() {
        const { form, isWaitingForResponse } = this.state;
        return <DialogContainer>
        <DialogHeader
            title={translate('modal.create-contact.title')}
            confirmAction={
                <React.Fragment>
                    <DialogHeaderTextButton onClick={() => this.saveContact()} 
                        disabled={!this.state.formValid || isWaitingForResponse}
                        label={ translate('generic.button.save')} 
                    />
                </React.Fragment>
            }
        />
        <FlexDialogContent>
            {isWaitingForResponse ? <CoveringSpinner /> : null}
            <Input fieldName="firstName" field={form.firstName} icon={SvgIcon.Contacts} placeholder="generic.placeholder.firstname" changeFormValue={this.changeFormValue} />
            <Input fieldName="lastName" field={form.lastName} icon={SvgIcon.Contacts} placeholder="generic.placeholder.lastname" changeFormValue={this.changeFormValue} />
            <Input fieldName="phone" field={form.phone} icon={SvgIcon.Phone} placeholder="generic.placeholder.phone-number" changeFormValue={this.changeFormValue} />
            <Input fieldName="mobilePhone" field={form.mobilePhone} icon={SvgIcon.Smartphone} placeholder="generic.placeholder.mobile-number" changeFormValue={this.changeFormValue} />
            <Input fieldName="email" field={form.email} icon={SvgIcon.Email} placeholder="generic.placeholder.email-address" changeFormValue={this.changeFormValue} />
            <InputFA fieldName="fax" field={form.fax} icon={faFax} placeholder="generic.placeholder.fax" changeFormValue={this.changeFormValue} />
            
            <Input fieldName="title" field={form.title} icon={SvgIcon.Helmet} placeholder="generic.placeholder.title" changeFormValue={this.changeFormValue} />
            <WithIcon icon={SvgIcon.Info} className='separated flex-shrink--0'>
                <SelectField
                    value={form.type.value}
                    options={this.getPicklistValues(this.props.contactDescribe, 'Type__c')}
                    optionsMapper={(item: PicklistEntry) => item}
                    isLoading={this.props.contactDescribe == null}
                    onChange={(pe: PicklistEntry) => { this.changeFormValue('type', { ...form.type, value: pe.value })}}
                    placeholder={placeholder('generic.placeholder.type-choose', false)}
                />
            </WithIcon>
            <WithIconFA icon={faCogs} className='separated flex-shrink--0'>
                <SelectField
                    value={form.function.value}
                    options={this.getPicklistValues(this.props.contactDescribe, 'Function__c')}
                    optionsMapper={item => item}
                    isLoading={this.props.contactDescribe == null}
                    onChange={(pe: PicklistEntry) => { this.changeFormValue('function', { ...form.function, value: pe.value })}}
                    placeholder={placeholder('generic.placeholder.function-choose', true)}
                />
            </WithIconFA>
        </FlexDialogContent>
        </DialogContainer>;
    }

    private changeFormValue = (fieldName: string, field: Field) => {
        const fieldValidated = validateField(field);
        const form = { ...this.state.form, [fieldName]: fieldValidated }
        this.setState(state => ({ ...state, formValid: allFieldsValid(form), form }));
    }

    private saveContact = () => {
        const { title, firstName, lastName, phone, mobilePhone, email, type, function: func, fax } = this.state.form;
        const { updateSelectContact } = this.props
        this.setState(s => ({ ...s, isWaitingForResponse: true }));
        const contact = {
            AccountId: this.props.modalProps.accountId,
                FirstName: firstName.value,
                LastName: lastName.value,
                Phone: phone.value,
                MobilePhone: mobilePhone.value,
                Fax: fax.value,
                Email: email.value,
                Title: title.value,
                Type__c: type.value,
                Function__c: func.value
        }
        
        upsert(SObject.Contact, contact)
        .then(
            res => {
                this.props.showToastMessage(translate('toast.contact-update-successful.message'));
                updateSelectContact && updateSelectContact({ Name : contact.FirstName + contact.LastName, 
                    Id : res, Phone : contact.Phone,
                    MobilePhone : contact.MobilePhone, Fax : contact.Fax, 
                    Email : contact.Email });
                this.props.synchronizeCurrentPage();
                this.props.goToPrevModal();
            })
        .catch(error=>{
            console.log('Error in creating Contact....', error);
            this.setState(s => ({ ...s, isWaitingForResponse: false }));
            if(error.errorCode == 'DUPLICATES_DETECTED') {
                this.props.showToastMessage(translate('toast.contact-update-failed.message-duplicates-detected'));
            }
            if(error && error.message){
                this.props.showToast({message: error && error.message})
            }
        })
        // super.runPromise(
        //     () => this.props.upsertContactWithToast(contact),
        //     (ds, prevState) => {
        //         const { status, data } = ds;
        //         return { ...prevState,};
        //     }
        // )
    }

    private getPicklistValues(describe: DescribeSObjectResult, fieldName: string) {
        const fieldDescribe = describe && describe.fields && describe.fields.find(f => f.name === fieldName);
        return fieldDescribe && fieldDescribe.picklistValues || [];
    }

}

export interface ContactFromContactCreationDialog {
    Id?: string;
    AccountId: string;
    FirstName: string;
    LastName: string;
    Phone: string,
    MobilePhone: string,
    Email: string,
    Fax: string,
    Title: string;
    Type__c: string,
    Function__c: string,
}

const upsertContactWithToast = (contact: ContactFromContactCreationDialog) => 
    asyncHttpActionGenericLocalState3(
        async state => upsert(SObject.Contact, contact),
        {
            onFail: error => {
                /* error fields
                    name: error name code
                    errorCode: same as name
                    fields: contains the names of the fields with errors
                */
                //override Use one of these records? error message
                if(error.errorCode == 'DUPLICATES_DETECTED') return translate('toast.contact-update-failed.message-duplicates-detected');
                return error && error.message || translate('toast.contact-update-failed.message');
            },
            onSucceed: translate('toast.contact-update-successful.message')
        },
        [
            dispatch => {
                dispatch(synchronizeCurrentPage());
                dispatch(goToPrevModal());
            }
        ]
    )

export const ContactCreationDialog = connect(
    (state: IGlobalState) => ({ contactDescribe: state.describes[SObject.Contact] }),
    { upsertContactWithToast, queryDescribe, showToastMessage, showToast, synchronizeCurrentPage, goToPrevModal}
)(ContactCreationDialogClass);