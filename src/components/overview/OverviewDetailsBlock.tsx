import * as cx from 'classnames';
import * as React from 'react';

import { SvgIcon } from '../../constants/SvgIcon';
import { IMetric } from '../../models/metrics/IMetric';
import translate from '../../utils/translate';
import { SmallIcon } from '../layout/Icon';
import Progress from '../Progress';
import { CoveringSpinner } from '../CoveringSpinner';
import { Spinner } from '../Spinner';
import { formatCurrencyNoDecimals } from 'src/utils/formatUtils';

const progressOptions = {
    color: '#0ab5cc',
    strokeWidth: 7.5,
    text: {
        className: 'progressbar__label',
        color: '#0164a5',
    },
    trailWidth: 7.5
};

const progressOptionsHidden = {
    color: '#0ab5cc',
    strokeWidth: 0,
    text: {
        className: 'progressbar__label',
        color: '#0164a5',
    },
    trailWidth: 0,//7.5,
    trailColor: '#f9f9f9'
};

export default class OverviewDetailsBlock extends React.Component<IOverviewDetailsBlockProps, object> {
    
    public render() {
        const { name, isImplemented, value, locale, currencyIsoCode } = this.props;
        const { closedThisMonth, fraction, open, openAmount, subtitleKey, amount } = typeof value === 'number'
            ? { closedThisMonth: null, fraction: 0, open: value, openAmount: null, subtitleKey: null, amount: null }
            : value == undefined ? { closedThisMonth:0,fraction:0,open:0, openAmount: null, subtitleKey: null, amount: null } : value ;

        const containerClass = 
        cx('overview-details', 'container--horizontal', 'no-padding',
            'col-lg-4', 'col-sm-6', 'col-xs-12',
            {
                'overview-details--blocked': !isImplemented,
                'overview-details--navigatable': typeof this.props.clickHandler === 'function',
            },
        );
        
        const isLoading = open == -1;
        const isError = open == -2;
        const hideProgressbar = typeof value === 'number' || fraction == null;
        return (
            <div className={containerClass} onClick={this.showDetailsHandler}>
                { isLoading ? (<CoveringSpinner isSmall  />) : null}
                <SmallIcon svg={this.props.icon} className='overview-details__icon' />
                <div className='overview-details__progress padding-vertical--large'>
                    <Progress progress={fraction}
                        text={ isLoading || isError ? '?' : open!=undefined? open.toString():'0'}
                        //options={hideProgressbar ? progressOptionsHidden : progressOptions}
                        options={progressOptions}
                        initialAnimate
                        containerClassName={'progressbar'}
                        />
                </div>
                <div className='overview-details__data padding-right--small flex--1'>
                    <div className='overview-details__title'>
                        {name}
                    </div>
                    {
                        !isLoading && !isError && openAmount != null && (
                            <div className='overview-details__title'>
                                {translate('overview-page.tile-info.for')} {formatCurrencyNoDecimals(openAmount,currencyIsoCode,locale)}
                            </div>
                        )
                    }
                    {((isLoading || isError || closedThisMonth == null))? '' : 
                    <div className='overview-details__status'>
                        {closedThisMonth} {translate(subtitleKey == null ? 'overview-page.tile-info.completed' : subtitleKey)}
                    </div>
                    }
                    {
                        !isLoading && !isError && amount != null && (
                            <div className='overview-details__status'>
                                {translate('overview-page.tile-info.for')} {formatCurrencyNoDecimals(amount,currencyIsoCode,locale)}
                            </div>
                        )
                    }
                    {isError && translate('layout.report-item.status.error')}
                </div>
            </div>
        );
    }

    private showDetailsHandler = () => {
        if (this.props.clickHandler) {
            this.props.clickHandler();
        }
    }
}

interface IOverviewDetailsBlockProps {
    clickHandler: () => void;
    icon: SvgIcon;
    isImplemented: boolean;
    name: string;
    value: IMetric | number;
    locale: string;
    currencyIsoCode?: string;
}
