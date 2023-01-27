import * as cx from 'classnames';
import * as React from 'react';

import { listItemsClasses } from '../constants/layout';
import { Feed } from './pages/Feed';

export function FeedContainer(props: React.WithChildren) {
    return (
        <div className='full-height'>
            <div className='content__container col-xs-6 col-sm-7 col-lg-8 no-padding'>
                {props.children}
            </div>
            <div className={cx('full-height', 'no-padding', listItemsClasses,)}>
                <Feed />
            </div>
        </div>
    );
}
