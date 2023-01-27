import * as cx from 'classnames';
import * as React from 'react';

import { SvgIcon } from '../../constants/SvgIcon';
import WithIcon from '../forms/WithIcon';

interface IListRowProps extends React.WithChildren {
    title: string;
    secondaryContent?: JSX.Element;
    subTitle: string;
    hasBottomLine?: boolean;
    svg: SvgIcon;
}

//this has the same styling as a detail field, only used for the account report
export default function ListRow(props: IListRowProps) {
    return (
        <div className={cx({ 'separated--bottom-light': props.hasBottomLine !== false })}>
            <WithIcon icon={props.svg}>
                <div className='list-tile'>
                    <div className='container--vertical'>
                        <div className='list-tile__title'>{props.title}</div>
                        <div className='list-tile__sub-title'>{props.subTitle}</div>
                    </div>
                    {props.secondaryContent ? 
                    <div className='list-tile__secondary-content container__item--centered'>
                        {props.secondaryContent}
                    </div> : null}
                </div>
            </WithIcon>
        </div>
    );
}
