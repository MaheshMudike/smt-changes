import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { changeCalendarRange } from '../../actions/integration/events/eventActions';
import { addEventFromDropedItem } from '../../actions/integration/feedActions';
import { showModal } from '../../actions/modalActions';
import { Calendar, ICalendarDispatchProps, ICalendarProps } from '../../components/calendar/Calendar';
import { CalendarFabMenu } from '../../components/calendar/CalendarFabMenu';
import { ModalType } from '../../constants/modalTypes';
import { IGlobalState } from '../../models/globalState';
import { entityFieldsDataFromState } from 'src/components/fields/EntityFieldsData';
import { closeMenu } from 'src/containers/AppBase';

const getPlanData = createSelector(
    (state: IGlobalState) => state.calendar,
    state => state.cache.events,
    state => state.dragAndDrop,
    state => state.sharedState.isOfflineMode,
    state => state.authentication,
    state => entityFieldsDataFromState(state),
    (calendar, cachedEvents, dragAndDrop, isOfflineMode, authentication, entityFieldsData) => {
        return {
            currentRange: calendar.currentRange,
            events: isOfflineMode ? cachedEvents.items : calendar.events.items,
            dragAndDrop,
            isOfflineMode,
            authentication,
            entityFieldsData
        };
    },
);

export function getPlan(props: Partial<ICalendarProps>, actions: ICalendarDispatchProps) {
    return connect<ICalendarProps, ICalendarDispatchProps, {}>(
        createSelector(getPlanData, closeMenu, planData => ({ ...planData, ...props } as ICalendarProps))
        , actions as any
    )(Calendar);
}

export const OnlinePlan = getPlan(
    {
        getContent: () => <CalendarFabMenu eventSource={null} isDropdown={false}/>,
        readEventModalType: ModalType.ReadEventModal,
    }, {
        addEventFromDropedItem,
        showModal,
        changeCalendarRange,
        closeMenu,
    });

export default OnlinePlan;