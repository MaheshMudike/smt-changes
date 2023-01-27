import * as React from 'react';
import Tabs, { ITabsProps } from './Tabs';

export class TabbedDetail extends React.Component<ITabsProps, object> {
    
    public render() {

        return (
            <div className='flex-grow--1 container--vertical cover-all'>
                <div className='panel--gray separated--bottom-dark'>
                    <Tabs {...this.props} />
                </div>
                <div className='flex-grow--1 scrollable container--vertical container--justify-start relative'>
                    {this.props.children}
                </div>
            </div>
        );
    };
}