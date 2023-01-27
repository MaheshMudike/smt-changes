import * as _ from 'lodash';
import * as moment from 'moment';
import * as React from 'react';
import { connect } from 'react-redux';

import { initWriteTaskForm, saveTaskFromForm, setWriteTaskFormField } from '../../actions/integration/tasks/writeTaskFormActions';
import { ModalType } from '../../constants/modalTypes';
import { SvgIcon } from '../../constants/SvgIcon';
import { DATE_FORMAT } from '../../constants/timeFormat';
import { IGlobalState } from '../../models/globalState';
import { taskPriority } from '../../models/tasks/taskPriority';
import { taskStatus } from '../../models/tasks/taskStatus';
import { isValidTaskForm, WriteTaskState, WriteTaskForm, initialWriteTaskState } from '../../models/tasks/writeTaskState';
import translate from '../../utils/translate';
import { CoveringSpinner } from '../CoveringSpinner';
import { DateInput } from '../DateInput';
import { SelectFieldStub, SimpleSelectField } from '../forms/SelectField';
import WithIcon from '../forms/WithIcon';
import { DialogHeaderTextButton } from '../layout/DialogHeaderTextButton';
import { DialogContainer } from './layout/DialogContainer';
import { FlexDialogContent } from './layout/DialogContent';
import { DialogHeader } from './layout/DialogHeader';
import { Option as ReactSelectOption } from 'react-select';
import { IModalDefinition } from 'src/models/modals/state';
import { showModal } from 'src/actions/modalActions';
import LabeledValue from '../forms/LabeledValue';
import whatField from '../fields/relatedToField';
import { renderField } from '../forms/renderFields';

class TaskCreationModalClass extends React.Component<TaskCreationModalProps, object> {
    public render() {
        const form = this.props.form;
        const dueDate = form.dueDate 
        const formatedDate = dueDate == null ? null : moment(dueDate).format(DATE_FORMAT);
        const whatFieldValue = whatField(this.props.form.what, false);
        return (
            <DialogContainer>
                <DialogHeader
                    title={translate('write-task-modal.title')}
                    confirmAction={
                        <DialogHeaderTextButton
                            onClick={() => this.props.saveTaskFromForm()}
                            disabled={!this.props.isFormValid || form.isWaitingForResponse}
                            label={translate('generic.button.save')} 
                        />
                    }
                />
                <FlexDialogContent>
                    {form.isWaitingForResponse ? <CoveringSpinner /> : null}

                    { /*this.props.form.what &&
                        <div className='separated'>
                            {renderField(whatField(this.props.form.what, false), 0)}
                        </div>
                        */
                    }
                    { this.props.form.what &&
                        <whatFieldValue.linkWrapper>
                            <WithIcon icon={whatFieldValue.icon} className='separated flex-shrink--0'>
                                <div className="field container--horizontal">{this.props.form.what.title}</div>
                            </WithIcon>
                        </whatFieldValue.linkWrapper>
                    }
                    <WithIcon icon={SvgIcon.Related} className='separated flex-shrink--0'>
                        <SelectFieldStub
                            caption={form.selectedUser == null ? '' : form.selectedUser.label}
                            onClick={() => this.props.showModal(ModalType.SearchUserDialog)}
                        />
                    </WithIcon>
                    <WithIcon icon={SvgIcon.Status} className='separated flex-shrink--0'>
                        <SimpleSelectField options={this.getItemsFromConsts('task-status', taskStatus) } value={form.status} 
                            onChange={this.setFormOptionFactory('status')}/>
                    </WithIcon>
                    <WithIcon icon={SvgIcon.Priority} className='separated flex-shrink--0'>
                        <SimpleSelectField options={this.getItemsFromConsts('task-priority', taskPriority)} value={form.priority} 
                            onChange={this.setFormOptionFactory('priority')} />
                    </WithIcon>
                    <WithIcon icon={SvgIcon.Date} className='separated flex-shrink--0'>
                        <DateInput value={formatedDate} placeholder={translate('generic.field.due-date')}
                            onChange={ev => this.props.setWriteTaskFormField('dueDate', moment.utc(ev.currentTarget.value).startOf('date'))}/>
                    </WithIcon>
                    <WithIcon icon={SvgIcon.Title} className='separated flex-shrink--0'>
                        <input value={form.subject} maxLength={255} type='text' placeholder={translate('generic.field.subject')}
                            onChange={this.setFormFieldFactory('subject')} />
                    </WithIcon>
                    <WithIcon icon={SvgIcon.Description} multiline className='flex-shrink--0 flex-grow--1'>
                        <textarea value={form.description} className='full-height' maxLength={255} placeholder={translate('generic.placeholder.description')}
                            onChange={this.setFormFieldFactory('description')} />
                    </WithIcon>
                </FlexDialogContent>
            </DialogContainer>
        );
    }

    public componentWillMount() {
        //this.props.initWriteTaskForm();
    }

    private setFormOptionFactory = (field: keyof WriteTaskForm) => (option: ReactSelectOption) => this.props.setWriteTaskFormField(field, option.value.toString());
    private setFormFieldFactory = (field: keyof WriteTaskForm) => (ev: React.FormEvent<any>) => this.props.setWriteTaskFormField(field, ev.currentTarget.value);
    
    private getItemsFromConsts<T extends {}>(labelPrefix: string, consts: T) {
        return Object.keys(consts).map(value => ({
                label: translate([labelPrefix, _.kebabCase(value)].join('.')),
                value: consts[value],
            }));
    }
}

interface ITaskCreationModalDispatchProps {
    setWriteTaskFormField: typeof setWriteTaskFormField;
    saveTaskFromForm: typeof saveTaskFromForm;
    initWriteTaskForm: typeof initWriteTaskForm;
    showModal: typeof showModal;
}

type TaskCreationStateProps = WriteTaskState & {
    isFormValid: boolean;
};

type TaskCreationModalProps = IModalDefinition<{}> & ITaskCreationModalDispatchProps & TaskCreationStateProps;

export const TaskCreationModal = connect<TaskCreationStateProps, ITaskCreationModalDispatchProps, {}>(
    (state: IGlobalState) => ({
        ...state.writeTask,
        isFormValid: isValidTaskForm(state.writeTask.form),
    })
    ,
    {
        initWriteTaskForm,
        setWriteTaskFormField,
        saveTaskFromForm,
        showModal
    },
)(TaskCreationModalClass);
