import * as cx from 'classnames';
import * as React from 'react';

interface IDateInputState {
    hasFocus: boolean;
}

type Props = React.HTMLProps<HTMLInputElement>;

export class DateInput extends React.Component<Props, IDateInputState> {
    constructor(props: Props) {
        super(props);
        this.state = { hasFocus: false };
    }

    public render() {
        return (
            <div className='relative'>
                <input
                    {...this.props}
                    type='date'
                    className={cx(this.props.className, { transparent: this.isPlaceHolderVisible })}
                    onFocus={() => this.setState({ hasFocus: true })}
                    onBlur={() => this.setState({ hasFocus: false })}
                />
                <input
                    type='text'
                    placeholder={this.props.placeholder}
                    className={cx('below-content cover-all', { transparent: !this.isPlaceHolderVisible })}
                />
            </div>
        );
    }

    private get isPlaceHolderVisible() {
        return !this.state.hasFocus && !this.props.value;
    }
}
