import * as _ from 'lodash';
import * as moment from 'moment';

import IPoint from '../../models/IPoint';
import { cachedFunction } from '../../utils/cachedFunction';
//import * as $ from 'jquery';

const droppablePlaceholderState = {
    currentDayColumn: null as { date: string; offset: number; x: number },
    element: null as Element,
    indicator: $(document.createElement('div')).addClass('droppable-indicator').appendTo(document.body),
};

export const IS_DROPPABLE_PLACEHOLDER_KEY = 'isDroppable';
const FC_DATE_KEY = 'date';

const INDICATOR_ACTIVE_CLASS = 'droppable-indicator--active';
const DAYS_IN_WEEK = 7;

const getDayColumns = cachedFunction(() => {
    const dayHeader = $('.fc-day-header')[0];    
    const firstOffset = dayHeader == null ? 0 : dayHeader.getBoundingClientRect().left;        
    return $('.fc-day-header').toArray()
        .map(elem => {
            const x = elem.getBoundingClientRect().left;
            const offset = x - firstOffset;
            return { date: elem.dataset[FC_DATE_KEY], offset, x};
        });
});

document.addEventListener('resize', () => getDayColumns.invalidate());

function updateDroppablePlaceholderColumn(point: IPoint, isWeekView: boolean, element?: Element) {    
    droppablePlaceholderState.currentDayColumn = null;
    if(isWeekView) {
        const offsets = getDayColumns();
        droppablePlaceholderState.currentDayColumn = _.findLast(offsets, o => o.x < point.x);        
    }
    const rect = element.getBoundingClientRect();
    const dayOffeset = droppablePlaceholderState.currentDayColumn == null ? 0 : droppablePlaceholderState.currentDayColumn.offset;
    droppablePlaceholderState.indicator.css('transform', `translate(${ dayOffeset + rect.left }px, ${ rect.top }px)`);
}

export function updateDroppablePlaceholder(point: IPoint, isWeekView: boolean, element?: Element) {
    element = element || document.elementFromPoint(point.x, point.y);
    
    if (element === droppablePlaceholderState.element && isWeekView) {
        updateDroppablePlaceholderColumn(point, isWeekView, element);
    } else if ($(element).data(IS_DROPPABLE_PLACEHOLDER_KEY)) {
        //markNewDroppablePlaceholder
        const rect = element.getBoundingClientRect();
        const width = rect.width / (isWeekView ? DAYS_IN_WEEK : 1);
        droppablePlaceholderState.indicator.addClass(INDICATOR_ACTIVE_CLASS).width(width).height(rect.height);
        droppablePlaceholderState.element = element;
        updateDroppablePlaceholderColumn(point, isWeekView, element);
    } else {
        destroyDroppablePlaceholder();
    }
}

export function destroyDroppablePlaceholder(elementLeft?: Element) {
    // This logic is needed because when user grags mouse pointer from A to B
    // then the sequence of events is: 1. dragenter(A), 2. dragleave(B)
    const shouldResign = elementLeft != null && elementLeft !== droppablePlaceholderState.element;
    if (shouldResign) return;

    droppablePlaceholderState.indicator.removeClass(INDICATOR_ACTIVE_CLASS);
    droppablePlaceholderState.element = null;
    droppablePlaceholderState.currentDayColumn = null;
};

function getTime(element: Element) {
    if(element == null) return null;
    else {
        const time = $(element.parentElement).data('time');
        const match = /^(\d\d):\d\d:\d\d$/.exec(time);
        return match ? parseInt(match[1], 10) : null;        
    }
}

export function extractTimeForDroppedItemFromDroppablePlaceholder() {
    const element = droppablePlaceholderState.element;
    const time = getTime(element);
    const dateTime = droppablePlaceholderState.currentDayColumn == null ? null : moment(droppablePlaceholderState.currentDayColumn.date).hour(time || 0);
    return dateTime || time;    
}