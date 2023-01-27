import * as moment from 'moment';
import * as React from 'react';
import { DATE_FORMAT, TIME_FORMAT_24 } from '../../constants/timeFormat';
import { DEFAULT_LOCALE } from 'src/utils/translate';

export class DateTimeInput extends React.Component<IDateTimeInputProps, object> {
    public render() {
        //const dateOptional = Optional.ofNullable(this.props.value).map(t => moment(t));
        const dateValue = this.props.value == null ? null : moment(this.props.value).locale(DEFAULT_LOCALE).format(DATE_FORMAT);
        const timeValue = this.props.value == null ? null : moment(this.props.value).locale(DEFAULT_LOCALE).format(TIME_FORMAT_24);
        return (
            <div className='container--horizontal'>
                <input value={dateValue} type='date' onChange={this.setDateOrTime(DATE_FORMAT, (currentDate, t) => currentDate.year(t.year()).month(t.month()).date(t.date())) } 
                    className='datetime__separator' />
                <input value={timeValue} type='time' onChange={this.setDateOrTime(TIME_FORMAT_24, (currentDate, t) => currentDate.hour(t.hour()).minute(t.minute()).second(t.second()))} />
            </div>
        );
    }

    private setDateOrTime = (format: string, dateSetter: (m1: moment.Moment, m2: moment.Moment) => moment.Moment) => (event: any) => {
        const currentDate = this.props.value.isValid() ? moment(this.props.value) : moment(new Date());
        /*
        const newTime = Optional
            .ofNullable(event.target.value || null)
            .map(t => moment(t, format))
            .map(t => dateSetter(currentDate, t))
            .orElse(null);
        */
        const newTime = event.target.value == null ? null : dateSetter(currentDate, moment(event.target.value, format))
        this.props.onChange(newTime);
    };

}

interface IDateTimeInputProps {
    value: moment.Moment;
    onChange: (m : moment.Moment) => void;
}
