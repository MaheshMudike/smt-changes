import * as React from 'react';
import { connect } from 'react-redux';
import * as cx from 'classnames';
import { toggleAddButtonsExpansion } from '../../actions/integration/events/eventActions';
import { showPlanCustomerVisitModal } from '../../actions/planCustomerVisitActions';
import { SvgIcon } from '../../constants/SvgIcon';
import { IGlobalState } from '../../models/globalState';
import { FloatingActionButton } from '../layout/FloatingActionButton';
import { showTaskCreationDialog } from '../../actions/integration/tasks/writeTaskFormActions';
import IEventSource from 'src/models/events/IEventSource';
import { IdentifiableWithTitle } from 'src/models/feed/ISObject';

interface ICalendarFabMenuDispatchProps {
    showTaskCreationDialog: typeof showTaskCreationDialog;
    //toggleAddButtonsExpansion: typeof toggleAddButtonsExpansion;
    showPlanCustomerVisitModal: typeof showPlanCustomerVisitModal;
}

interface ICalendarFabMenuStateProps {
    isExpanded: boolean;
}

type CalendarFabMenuProps = ICalendarFabMenuDispatchProps & ICalendarFabMenuStateProps & { isDropdown: boolean, eventSource: IEventSource & IdentifiableWithTitle }

class CalendarFabMenuClass extends React.Component<CalendarFabMenuProps, { isExpanded: boolean }> {

    constructor(props: CalendarFabMenuProps) {
        super(props);
        this.state = { isExpanded: false };
    }

    public render() {
        const fabMenuClassname= this.props.isDropdown ? "fab-menu-dropdown" : "fab-menu"
        const fabMenuItem = this.props.isDropdown ? "fab-menu-dropdown__item" : "fab-menu__item"
        const fabMenuItemShownClassname = this.props.isDropdown ? "fab-menu-dropdown__item--shown" : "fab-menu__item--shown"
 
        return (            
            <div className={cx("bottom-right margin--std", [`${fabMenuClassname}`])}>
                <FloatingActionButton className='relative' isRotated={this.state.isExpanded} onClick={this.toggleExpansion} svg={SvgIcon.Add}/>
                <FloatingActionButton svg={SvgIcon.AddEventBar} isSmall 
                    onClick={(ev) => { this.props.showPlanCustomerVisitModal(this.props.eventSource, null); this.toggleExpansion() }} 
                    className={cx(fabMenuItem, { [`${fabMenuItemShownClassname}-1`]: this.state.isExpanded })}/>
                <FloatingActionButton svg={SvgIcon.AddTaskBar} isSmall
                    onClick={ev => { this.props.showTaskCreationDialog(this.props.eventSource); this.toggleExpansion() }}
                    className={cx(fabMenuItem, { [`${fabMenuItemShownClassname}-2`]: this.state.isExpanded })}/>
            </div>
        );
    }

    private toggleExpansion = () => {
        this.setState(state => ({ ...state, isExpanded: !this.state.isExpanded }))
        //this.props.toggleAddButtonsExpansion();
    }
}

export const CalendarFabMenu = connect<ICalendarFabMenuStateProps, ICalendarFabMenuDispatchProps, {}>(
    (state: IGlobalState) => ({
        isExpanded: state.calendar.addButtonsExpanded,
    }),
    {
        //toggleAddButtonsExpansion,
        showTaskCreationDialog,
        showPlanCustomerVisitModal,
    },
)(CalendarFabMenuClass);
