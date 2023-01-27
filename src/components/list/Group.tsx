import * as React from 'react';
import * as cx from 'classnames';

export interface IGroup {
    title: string;
    isExtraordinary: boolean;
}

export class Group extends React.Component<IGroup & { style?: React.CSSProperties }> {
    public render() {
        const title = this.props.title;       
        
        return <div key={title} style={this.props.style}>
            { title && <div className={cx('list-item subheader', { 'subheader--alert': this.props.isExtraordinary })}>{title}</div> }
            {this.props.children}
        </div>;
    }
}