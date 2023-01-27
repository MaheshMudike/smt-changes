import * as React from 'react';
import { ActionStatus } from "../../actions/actions";
import translate from "../../utils/translate";
import { CoveringSpinner } from '../CoveringSpinner';
import { TableCompact } from './TableCompact';
import { ITableProps } from './Table';

export function TableCompactWithSpinner<T>(props: ITableProps<T> & { status: ActionStatus }) {    

    const { colgroup, thPrefix, ths, status, rows, row, className, noEntriesLabel = 'account-report.no-entries', emptyColumnLabel = 'account-report.not-available' } = props;
    const notAvailable = translate(emptyColumnLabel);
    return (
        <div style={ {position: "relative"} }>
        { status == ActionStatus.START ? <CoveringSpinner isSmall  /> : null}
        <TableCompact className={className} noEntriesLabel={noEntriesLabel} emptyColumnLabel={emptyColumnLabel} 
            thPrefix={thPrefix} ths={ths} rows={rows} row={row} colgroup={colgroup}/>
        </div>        
    );
}
