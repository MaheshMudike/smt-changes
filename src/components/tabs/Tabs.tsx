import * as cx from 'classnames';
import * as React from 'react';

export interface ITabsProps {
    items: JSX.Element[];
    selectedTab: number;
    onChangeTab: (index: number) => any;
    className?: string;
}

export default class Tabs extends React.Component<ITabsProps, object> {

    public render() {
        //const transform = `translateX(${ this.props.selectedTab }00%)`;
        const width = `${ 100 / this.props.items.length }%`;
        return (
            <div className={cx('tabs__group', this.props.className)}>
                {this.props.items.map((item, index) => (
                    <div className={cx('container--centered', 'tabs__tab', { 'tabs__tab--unselected': index !== this.props.selectedTab })}
                        style={{ width }} onClick={this.handleClick(index)} key={index}>
                        {item}
                    </div>
                ))}
                <div className={`tabs__indicator tabs__indicator-${this.props.selectedTab}`}
                    style={{ //WebkitTransform: transform, transform,
                        width }} />
            </div>
        );
    }

    private handleClick = (index: number) => () => {
        if (index === this.props.selectedTab) return;
        this.props.onChangeTab(index);
    };
}