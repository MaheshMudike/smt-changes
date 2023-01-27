import * as cx from 'classnames';
import * as React from 'react';

import { listItemsClasses } from '../../constants/layout';
import { SvgIcon } from '../../constants/SvgIcon';
import isIE from '../../utils/isIE';
import { Icon } from '../layout/Icon';

import { connect } from 'react-redux';

import { searchInputChange } from '../../actions/searchActions';
import { IGlobalState } from '../../models/globalState';
import translate from '../../utils/translate';
import { searchAccountsOffline } from '../../actions/cache/accountActions';

export class SearchInput extends React.Component<ISearchInputStateProps & ISearchInputDispatchProps, object> {

    public refs: {
        searchInput: HTMLInputElement;
        [key: string]: HTMLInputElement;
    };

    public componentDidMount() {
        if (!this.props.value) {
            this.refs.searchInput.focus();
        }
    }

    public render() {
        return (
            <div className='full-width full-height'>
                <div className={cx('search-input-container', 'topbar__separator', 'container--horizontal', listItemsClasses,)}>
                    <input
                        className='search-input flex-grow--1'
                        placeholder={this.props.placeholder}
                        ref='searchInput'
                        type='search'
                        onChange={(e: React.FormEvent<HTMLInputElement>) => {
                            this.props.searchInputChange(e.currentTarget.value);
                        }}
                        value={this.props.value}
                    />
                    {(isIE() || !this.props.value) ? null : 
                    <Icon svg={SvgIcon.ClearBar} onClick={() => this.props.searchInputChange('')} className='clickable' />
                    }
                </div>
            </div>
        );
    }
}

interface ISearchInputStateProps {
    value: string;
    placeholder: string;
}

interface ISearchInputDispatchProps {
    searchInputChange: (value: string) => void;
}

export const OnlineSearchInput = connect<ISearchInputStateProps, ISearchInputDispatchProps>(
    (state: IGlobalState) => ({
        placeholder: translate('search-page-search-input-placeholder'),
        value: state.search.inputValue,
    })
    ,
    {
        searchInputChange
    }
)(SearchInput);

export const OfflineSearchAccountsInput = connect<ISearchInputStateProps, ISearchInputDispatchProps, {}>(
    (state: IGlobalState) => ({
        placeholder: translate('offline-accounts-page.search-placeholder'),
        value: state.cache.offlineAccountsSearchPhrase,
    }),
    {
        searchInputChange: searchAccountsOffline
    },
)(SearchInput);
